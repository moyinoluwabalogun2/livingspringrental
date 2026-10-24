import {
  NextRequest,
  NextResponse,
} from 'next/server';


export const runtime =
  'nodejs';


type FirebaseLookupResponse = {
  users?: Array<{
    localId?: string;
    email?: string;
  }>;
};


type AppsScriptResponse = {
  ok?: boolean;
  error?: string;

  application?: {
    reference?: string;
    listingTitle?: string;
    expiryDate?: string;
  };

  renewal?: {
    status?: string;
    renewalNumber?: number;
    renewalCount?: number;
    paymentReference?: string;
    paymentUrl?: string;
    paidAt?: string;
    paymentChannel?: string;
    requestedAt?: string;
    activatedAt?: string;
  };

  activationAt?: string;
  expiryDate?: string;
  renewalNumber?: number;
  paymentReference?: string;
  duplicate?: boolean;
  activated?: boolean;
};


type ManageRequestBody = {
  reference?: string;

  phase?:
    | 'prepare'
    | 'complete';
};


function allowedAdminEmails() {
  return new Set(
    String(
      process.env
        .ADMIN_EMAILS ||
      ''
    )
      .split(',')
      .map(
        (
          email
        ) =>
          email
            .trim()
            .toLowerCase()
      )
      .filter(
        Boolean
      )
  );
}


async function verifyAdmin(
  request:
    NextRequest
) {
  const authorization =
    request.headers.get(
      'authorization'
    ) ||
    '';

  if (
    !authorization.startsWith(
      'Bearer '
    )
  ) {
    return null;
  }

  const idToken =
    authorization
      .slice(
        'Bearer '.length
      )
      .trim();

  if (
    !idToken
  ) {
    return null;
  }

  const apiKey =
    process.env
      .NEXT_PUBLIC_FIREBASE_API_KEY
      ?.trim();

  if (
    !apiKey
  ) {
    throw new Error(
      'SERVER_CONFIG'
    );
  }

  const response =
    await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(
        apiKey
      )}`,
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            idToken,
          }),

        cache:
          'no-store',
      }
    );

  if (
    !response.ok
  ) {
    return null;
  }

  const data =
    (
      await response.json()
    ) as
      FirebaseLookupResponse;

  const user =
    data.users?.[0];

  if (
    !user
  ) {
    return null;
  }

  const email =
    user.email
      ?.trim()
      .toLowerCase();

  if (
    !email
  ) {
    return null;
  }

  if (
    !allowedAdminEmails().has(
      email
    )
  ) {
    return null;
  }

  return {
    uid:
      user.localId ||
      '',

    email,
  };
}


async function callApplicationsSystem(
  payload:
    Record<
      string,
      unknown
    >
) {
  const webhookUrl =
    process.env
      .LISTING_APPLICATIONS_WEBHOOK_URL
      ?.trim();

  const webhookSecret =
    process.env
      .LISTING_APPLICATIONS_WEBHOOK_SECRET
      ?.trim();

  if (
    !webhookUrl ||
    !webhookSecret
  ) {
    throw new Error(
      'SERVER_CONFIG'
    );
  }

  const response =
    await fetch(
      webhookUrl,
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            secret:
              webhookSecret,

            ...payload,
          }),

        cache:
          'no-store',

        redirect:
          'follow',
      }
    );

  const text =
    await response.text();

  let data:
    AppsScriptResponse;

  try {
    data =
      JSON.parse(
        text
      ) as
        AppsScriptResponse;
  } catch {
    console.error(
      'Apps Script invalid JSON:',
      text
    );

    throw new Error(
      'APPLICATION_WEBHOOK_INVALID_RESPONSE'
    );
  }

  if (
    !response.ok ||
    data.ok !==
      true
  ) {
    console.error(
      'Renewal management failed:',
      data
    );

    throw new Error(
      data.error ||
      'APPLICATION_WEBHOOK_FAILED'
    );
  }

  return data;
}


function normalizeReference(
  value:
    unknown
) {
  const reference =
    String(
      value ||
      ''
    )
      .trim()
      .toUpperCase();

  if (
    !/^LS-\d{4}-\d+$/.test(
      reference
    )
  ) {
    throw new Error(
      'INVALID_APPLICATION_REFERENCE'
    );
  }

  return reference;
}


/*
 * =========================================================
 * GET CURRENT RENEWAL STATE
 * =========================================================
 */

export async function GET(
  request:
    NextRequest
) {
  try {
    const admin =
      await verifyAdmin(
        request
      );

    if (
      !admin
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'ADMIN_LOGIN_REQUIRED',
        },
        {
          status:
            401,
        }
      );
    }

    const reference =
      normalizeReference(
        request
          .nextUrl
          .searchParams
          .get(
            'reference'
          )
      );

    const result =
      await callApplicationsSystem({
        action:
          'admin-renewal-state',

        reference,
      });

    return NextResponse.json({
      ok:
        true,

      application:
        result.application,

      renewal:
        result.renewal,
    });
  } catch (
    error
  ) {
    const message =
      error instanceof
      Error
        ? error.message
        : 'Could not load renewal.';

    return NextResponse.json(
      {
        ok:
          false,

        error:
          message,
      },
      {
        status:
          message ===
          'INVALID_APPLICATION_REFERENCE'
            ? 400
            : 500,
      }
    );
  }
}


/*
 * =========================================================
 * PREPARE / COMPLETE ACTIVATION
 * =========================================================
 */

export async function POST(
  request:
    NextRequest
) {
  try {
    const admin =
      await verifyAdmin(
        request
      );

    if (
      !admin
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'ADMIN_LOGIN_REQUIRED',
        },
        {
          status:
            401,
        }
      );
    }

    const body =
      (
        await request.json()
      ) as
        ManageRequestBody;

    const reference =
      normalizeReference(
        body.reference
      );

    const phase =
      body.phase;

    const propertyId =
      `partner-${reference.toLowerCase()}`;


    if (
      phase ===
      'prepare'
    ) {
      const result =
        await callApplicationsSystem({
          action:
            'admin-renewal-activate-prepare',

          reference,

          propertyId,

          activatedBy:
            admin.email,
        });

      return NextResponse.json({
        ok:
          true,

        propertyId,

        activationAt:
          result.activationAt,

        expiryDate:
          result.expiryDate,

        renewalNumber:
          result.renewalNumber,

        paymentReference:
          result.paymentReference,

        activated:
          result.activated ===
          true,

        renewal:
          result.renewal,
      });
    }


    if (
      phase ===
      'complete'
    ) {
      const result =
        await callApplicationsSystem({
          action:
            'admin-renewal-activate-complete',

          reference,

          propertyId,

          activatedBy:
            admin.email,
        });

      return NextResponse.json({
        ok:
          true,

        activated:
          true,

        duplicate:
          result.duplicate ===
          true,

        application:
          result.application,

        renewal:
          result.renewal,

        expiryDate:
          result.expiryDate,
      });
    }


    return NextResponse.json(
      {
        ok:
          false,

        error:
          'Invalid renewal activation phase.',
      },
      {
        status:
          400,
      }
    );
  } catch (
    error
  ) {
    console.error(
      'Renewal activation API failed:',
      error
    );

    const message =
      error instanceof
      Error
        ? error.message
        : 'Could not activate renewal.';

    return NextResponse.json(
      {
        ok:
          false,

        error:
          message,
      },
      {
        status:
          500,
      }
    );
  }
}