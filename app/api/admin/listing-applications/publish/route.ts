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


type PublishRequestBody = {
  reference?: string;
  propertyId?: string;
  publishedAt?: string;
  expiresAt?: string;
};


function allowedAdminEmails() {
  return new Set(
    String(
      process.env
        .ADMIN_EMAILS ||
      ''
    )
      .split(
        ','
      )
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
    await response.json() as
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

  const allowed =
    allowedAdminEmails();

  if (
    !allowed.has(
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


async function notifyApplicationsSystem(
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
    {
      ok?: boolean;
      error?: string;
      application?: unknown;
      duplicate?: boolean;
    };

  try {
    data =
      JSON.parse(
        text
      );
  } catch {
    console.error(
      'Apps Script returned invalid JSON:',
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
    throw new Error(
      data.error ||
      'APPLICATION_WEBHOOK_FAILED'
    );
  }

  return data;
}


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
      await request.json() as
        PublishRequestBody;

    const reference =
      String(
        body.reference ||
        ''
      )
        .trim()
        .toUpperCase();

    const propertyId =
      String(
        body.propertyId ||
        ''
      ).trim();

    const publishedAt =
      new Date(
        String(
          body.publishedAt ||
          ''
        )
      );

    const expiresAt =
      new Date(
        String(
          body.expiresAt ||
          ''
        )
      );

    if (
      !reference ||
      !reference.startsWith(
        'LS-'
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Invalid application reference.',
        },
        {
          status:
            400,
        }
      );
    }

    const expectedPropertyId =
      `partner-${reference.toLowerCase()}`;

    if (
      propertyId !==
      expectedPropertyId
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Invalid published property ID.',
        },
        {
          status:
            400,
        }
      );
    }

    if (
      Number.isNaN(
        publishedAt.getTime()
      ) ||
      Number.isNaN(
        expiresAt.getTime()
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Invalid publication dates.',
        },
        {
          status:
            400,
        }
      );
    }

    const thirtyDays =
      30 *
      24 *
      60 *
      60 *
      1000;

    const duration =
      expiresAt.getTime() -
      publishedAt.getTime();

    if (
      Math.abs(
        duration -
        thirtyDays
      ) >
      60_000
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Listing expiry must be 30 days after publication.',
        },
        {
          status:
            400,
        }
      );
    }

    const result =
      await notifyApplicationsSystem({
        action:
          'admin-publish-confirmed',

        reference,

        propertyId,

        publishedAt:
          publishedAt
            .toISOString(),

        expiresAt:
          expiresAt
            .toISOString(),

        publishedBy:
          admin.email,
      });

    return NextResponse.json({
      ok:
        true,

      ...result,
    });
  } catch (
    error
  ) {
    console.error(
      'Publish application route failed:',
      error
    );

    const message =
      error instanceof
      Error
        ? error.message
        : 'Could not publish application.';

    if (
      message ===
      'SERVER_CONFIG'
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Admin publishing is not configured correctly.',
        },
        {
          status:
            500,
        }
      );
    }

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