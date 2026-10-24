import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  initializeStandardListingPayment,
  STANDARD_LISTING_FEE_NAIRA,
} from '@/lib/paystack';

export const runtime =
  'nodejs';


type FirebaseAccountLookupResponse = {
  users?: Array<{
    email?:
      string;

    localId?:
      string;
  }>;

  error?: {
    message?:
      string;
  };
};


type Decision =
  | 'approve'
  | 'needs_changes'
  | 'reject';


type DecisionRequest = {
  reference?:
    unknown;

  decision?:
    unknown;

  notes?:
    unknown;
};


type ApplicationSummary = {
  reference:
    string;

  applicantName:
    string;

  email:
    string;

  listingTitle:
    string;

  reviewStatus:
    string;

  paymentStatus:
    string;

  paymentReference:
    string;

  paymentUrl?:
    string;

  packageFee:
    number;
};


type ApplicationsWebhookResponse = {
  ok:
    boolean;

  application?:
    ApplicationSummary;

  applications?:
    ApplicationSummary[];

  error?:
    string;

  duplicate?:
    boolean;
};


function getAdminEmails() {
  return String(
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
    );
}


async function verifyAdmin(
  request:
    NextRequest
) {
  const authorization =
    request.headers.get(
      'authorization'
    );

  if (
    !authorization ||
    !authorization.startsWith(
      'Bearer '
    )
  ) {
    throw new Error(
      'UNAUTHORIZED'
    );
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
    throw new Error(
      'UNAUTHORIZED'
    );
  }

  const apiKey =
    process.env
      .NEXT_PUBLIC_FIREBASE_API_KEY;

  if (
    !apiKey
  ) {
    throw new Error(
      'SERVER_CONFIG'
    );
  }

  const adminEmails =
    getAdminEmails();

  if (
    adminEmails.length ===
    0
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

  const data =
    (await response.json()) as
      FirebaseAccountLookupResponse;

  if (
    !response.ok
  ) {
    console.error(
      'Firebase admin token verification failed:',
      data.error
        ?.message
    );

    throw new Error(
      'UNAUTHORIZED'
    );
  }

  const email =
    data.users?.[0]
      ?.email
      ?.trim()
      .toLowerCase();

  if (
    !email
  ) {
    throw new Error(
      'UNAUTHORIZED'
    );
  }

  if (
    !adminEmails.includes(
      email
    )
  ) {
    throw new Error(
      'FORBIDDEN'
    );
  }

  return email;
}


async function callApplicationWebhook(
  payload:
    Record<
      string,
      unknown
    >
): Promise<ApplicationsWebhookResponse> {
  const webhookUrl =
    process.env
      .LISTING_APPLICATIONS_WEBHOOK_URL
      ?.trim();

  const secret =
    process.env
      .LISTING_APPLICATIONS_WEBHOOK_SECRET
      ?.trim();

  if (
    !webhookUrl ||
    !secret
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
            secret,
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
    ApplicationsWebhookResponse;

  try {
    data =
      JSON.parse(
        text
      ) as
        ApplicationsWebhookResponse;
  } catch {
    console.error(
      'Invalid Apps Script response:',
      text
    );

    throw new Error(
      'UPSTREAM_ERROR'
    );
  }

  if (
    !response.ok ||
    data.ok !==
      true
  ) {
    console.error(
      'Applications webhook error:',
      data
    );

    throw new Error(
      data.error ||
      'UPSTREAM_ERROR'
    );
  }

  return data;
}


async function
approveAndCreatePayment(
  reference:
    string,

  notes:
    string
) {
  /*
   * First mark the application
   * APPROVED in the Sheet.
   *
   * Code.gs intentionally does NOT
   * send the approval email yet.
   *
   * The real email is sent only
   * after Paystack successfully
   * creates a checkout URL.
   */

  const decisionResult =
    await callApplicationWebhook({
      action:
        'admin-decision',

      reference,

      decision:
        'approve',

      notes,
    });

  const application =
    decisionResult.application;

  if (
    !application
  ) {
    throw new Error(
      'Application could not be loaded after approval.'
    );
  }

  /*
   * Already paid?
   * Never create another payment.
   */

  if (
    application
      .paymentStatus ===
    'PAID'
  ) {
    return decisionResult;
  }

  /*
   * Already has an active payment?
   * Reuse it.
   *
   * This also protects against
   * accidental double-clicks.
   */

  if (
    application
      .paymentStatus ===
      'PENDING' &&
    application
      .paymentReference &&
    application
      .paymentUrl
  ) {
    return decisionResult;
  }

  if (
    !application.email
  ) {
    throw new Error(
      'The applicant does not have a valid email address.'
    );
  }

  const payment =
    await initializeStandardListingPayment({
      email:
        application.email,

      applicationReference:
        application.reference,

      listingTitle:
        application.listingTitle,
    });

  /*
   * Store Paystack information
   * in Google Sheet and send the
   * real payment email.
   */

  return callApplicationWebhook({
    action:
      'admin-payment-request',

    reference:
      application.reference,

    paymentReference:
      payment.reference,

    paymentUrl:
      payment.authorizationUrl,

    amount:
      STANDARD_LISTING_FEE_NAIRA,
  });
}


function errorResponse(
  error:
    unknown
) {
  const message =
    error instanceof
    Error
      ? error.message
      : 'UNKNOWN';

  if (
    message ===
    'UNAUTHORIZED'
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        error:
          'Admin authentication required.',
      },
      {
        status:
          401,
      }
    );
  }

  if (
    message ===
    'FORBIDDEN'
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        error:
          'This account is not authorised for Admin review.',
      },
      {
        status:
          403,
      }
    );
  }

  if (
    message ===
      'SERVER_CONFIG' ||
    message ===
      'PAYSTACK_NOT_CONFIGURED'
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        error:
          message ===
          'PAYSTACK_NOT_CONFIGURED'
            ? 'Paystack is not configured yet.'
            : 'Admin review is not configured correctly.',
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
        message ===
        'UPSTREAM_ERROR'
          ? 'Could not reach the listing application system.'
          : message,
    },
    {
      status:
        500,
    }
  );
}


export async function GET(
  request:
    NextRequest
) {
  try {
    await verifyAdmin(
      request
    );

    const reference =
      request.nextUrl
        .searchParams
        .get(
          'reference'
        )
        ?.trim()
        .toUpperCase();

    if (
      reference
    ) {
      const data =
        await callApplicationWebhook({
          action:
            'admin-detail',

          reference,
        });

      return NextResponse.json(
        data
      );
    }

    const status =
      request.nextUrl
        .searchParams
        .get(
          'status'
        ) ||
      'ALL';

    const data =
      await callApplicationWebhook({
        action:
          'admin-list',

        status,
      });

    return NextResponse.json(
      data
    );
  } catch (
    error
  ) {
    console.error(
      'Admin applications GET failed:',
      error
    );

    return errorResponse(
      error
    );
  }
}


export async function PATCH(
  request:
    NextRequest
) {
  try {
    await verifyAdmin(
      request
    );

    const body =
      (await request.json()) as
        DecisionRequest;

    const reference =
      typeof body.reference ===
        'string'
        ? body.reference
            .trim()
            .toUpperCase()
        : '';

    const decision =
      typeof body.decision ===
        'string'
        ? body.decision
            .trim()
            .toLowerCase()
        : '';

    const notes =
      typeof body.notes ===
        'string'
        ? body.notes
            .trim()
        : '';

    const allowed:
      Decision[] = [
      'approve',
      'needs_changes',
      'reject',
    ];

    if (
      !reference
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Application reference is required.',
        },
        {
          status:
            400,
        }
      );
    }

    if (
      !allowed.includes(
        decision as
          Decision
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Invalid review decision.',
        },
        {
          status:
            400,
        }
      );
    }

    if (
      (
        decision ===
          'needs_changes' ||
        decision ===
          'reject'
      ) &&
      !notes
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Add a note explaining this decision.',
        },
        {
          status:
            400,
        }
      );
    }

    /*
     * APPROVE:
     *
     * 1. APPROVED
     * 2. Initialize Paystack
     * 3. Save reference + URL
     * 4. Email Pay button
     */

    if (
      decision ===
      'approve'
    ) {
      const data =
        await approveAndCreatePayment(
          reference,
          notes
        );

      return NextResponse.json(
        data
      );
    }

    /*
     * NEEDS CHANGES / REJECT
     */

    const data =
      await callApplicationWebhook({
        action:
          'admin-decision',

        reference,

        decision,

        notes,
      });

    return NextResponse.json(
      data
    );
  } catch (
    error
  ) {
    console.error(
      'Admin applications PATCH failed:',
      error
    );

    return errorResponse(
      error
    );
  }
}