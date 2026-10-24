import {
  createHmac,
  timingSafeEqual,
} from 'node:crypto';

import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  STANDARD_LISTING_FEE_KOBO,
  verifyPaystackTransaction,
} from '@/lib/paystack';

export const runtime =
  'nodejs';

type PaystackWebhookEvent = {
  event?: string;

  data?: {
    reference?: string;
    status?: string;
    amount?: number;
    currency?: string;
  };
};

type PaymentMetadata = {
  applicationReference?: string;
  listingTitle?: string;
  packageId?: string;
  packageName?: string;
  packageFee?: number;
  durationDays?: number;
  source?: string;
};

type AppsScriptResponse = {
  ok?: boolean;
  error?: string;
  paid?: boolean;
  duplicate?: boolean;
};

function getPaystackSecretKey() {
  const secretKey =
    process.env
      .PAYSTACK_SECRET_KEY
      ?.trim();

  if (
    !secretKey
  ) {
    throw new Error(
      'PAYSTACK_NOT_CONFIGURED'
    );
  }

  return secretKey;
}

function verifyWebhookSignature(
  rawBody: string,
  suppliedSignature: string,
  secretKey: string
) {
  if (
    !suppliedSignature ||
    !/^[a-fA-F0-9]+$/.test(
      suppliedSignature
    )
  ) {
    return false;
  }

  const expectedSignature =
    createHmac(
      'sha512',
      secretKey
    )
      .update(
        rawBody,
        'utf8'
      )
      .digest(
        'hex'
      );

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      'hex'
    );

  const suppliedBuffer =
    Buffer.from(
      suppliedSignature,
      'hex'
    );

  if (
    expectedBuffer.length !==
    suppliedBuffer.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expectedBuffer,
    suppliedBuffer
  );
}

function parseMetadata(
  metadata: unknown
): PaymentMetadata {
  if (
    !metadata
  ) {
    return {};
  }

  if (
    typeof metadata ===
    'object'
  ) {
    return metadata as
      PaymentMetadata;
  }

  if (
    typeof metadata ===
    'string'
  ) {
    try {
      return JSON.parse(
        metadata
      ) as
        PaymentMetadata;
    } catch {
      return {};
    }
  }

  return {};
}

async function callApplicationsWebhook(
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
      'APPLICATION_WEBHOOK_NOT_CONFIGURED'
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

  const responseText =
    await response.text();

  let data:
    AppsScriptResponse;

  try {
    data =
      JSON.parse(
        responseText
      ) as
        AppsScriptResponse;
  } catch {
    console.error(
      'Apps Script returned invalid JSON:',
      responseText
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
      'Apps Script payment confirmation failed:',
      data
    );

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
    const secretKey =
      getPaystackSecretKey();

    /*
     * IMPORTANT:
     *
     * Paystack signs the original
     * raw request body.
     *
     * So we read request.text()
     * BEFORE parsing JSON.
     */

    const rawBody =
      await request.text();

    const suppliedSignature =
      request.headers.get(
        'x-paystack-signature'
      ) ||
      '';

    const signatureIsValid =
      verifyWebhookSignature(
        rawBody,
        suppliedSignature,
        secretKey
      );

    if (
      !signatureIsValid
    ) {
      console.warn(
        'Rejected Paystack webhook with invalid signature.'
      );

      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Invalid webhook signature.',
        },
        {
          status:
            401,
        }
      );
    }

    let event:
      PaystackWebhookEvent;

    try {
      event =
        JSON.parse(
          rawBody
        ) as
          PaystackWebhookEvent;
    } catch {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Invalid webhook payload.',
        },
        {
          status:
            400,
        }
      );
    }

    /*
     * Living Spring only needs
     * successful transaction events.
     */

    if (
      event.event !==
      'charge.success'
    ) {
      return NextResponse.json({
        ok:
          true,

        ignored:
          true,

        event:
          event.event ||
          'unknown',
      });
    }

    const paymentReference =
      String(
        event.data
          ?.reference ||
        ''
      ).trim();

    if (
      !paymentReference
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Payment reference is missing.',
        },
        {
          status:
            400,
        }
      );
    }

    /*
     * Do not trust the webhook
     * payload alone.
     *
     * Ask Paystack to independently
     * verify the exact transaction.
     */

    const transaction =
      await verifyPaystackTransaction(
        paymentReference
      );

    if (
      transaction.reference !==
      paymentReference
    ) {
      console.error(
        'Paystack reference mismatch.',
        {
          webhookReference:
            paymentReference,

          verifiedReference:
            transaction.reference,
        }
      );

      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Transaction reference mismatch.',
        },
        {
          status:
            400,
        }
      );
    }

    if (
      transaction.status !==
      'success'
    ) {
      console.error(
        'Paystack transaction has not succeeded:',
        transaction.status
      );

      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Transaction has not succeeded.',
        },
        {
          status:
            400,
        }
      );
    }

    if (
      transaction.currency !==
      'NGN'
    ) {
      console.error(
        'Unexpected Paystack currency:',
        transaction.currency
      );

      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Incorrect transaction currency.',
        },
        {
          status:
            400,
        }
      );
    }

    if (
      transaction.amount !==
      STANDARD_LISTING_FEE_KOBO
    ) {
      console.error(
        'Unexpected Paystack transaction amount.',
        {
          expected:
            STANDARD_LISTING_FEE_KOBO,

          received:
            transaction.amount,
        }
      );

      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Incorrect transaction amount.',
        },
        {
          status:
            400,
        }
      );
    }

    const metadata =
      parseMetadata(
        transaction.metadata
      );

    const applicationReference =
      String(
        metadata
          .applicationReference ||
        ''
      )
        .trim()
        .toUpperCase();

    if (
      !applicationReference ||
      !applicationReference.startsWith(
        'LS-'
      )
    ) {
      console.error(
        'Paystack transaction does not contain a valid Living Spring application reference.',
        metadata
      );

      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Living Spring application reference is missing.',
        },
        {
          status:
            400,
        }
      );
    }

    if (
      metadata.packageId &&
      metadata.packageId !==
        'standard'
    ) {
      console.error(
        'Unexpected Living Spring package:',
        metadata.packageId
      );

      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Incorrect advertising package.',
        },
        {
          status:
            400,
        }
      );
    }

    if (
      metadata.source &&
      metadata.source !==
        'living-spring-list-with-us'
    ) {
      console.error(
        'Unexpected Paystack transaction source:',
        metadata.source
      );

      return NextResponse.json(
        {
          ok:
            false,

          error:
            'Incorrect transaction source.',
        },
        {
          status:
            400,
        }
      );
    }

    /*
     * Transaction is confirmed.
     *
     * Update the matching
     * Google Sheet application.
     */

    const result =
      await callApplicationsWebhook({
        action:
          'payment-confirmed',

        reference:
          applicationReference,

        paymentReference:
          transaction.reference,

        amountKobo:
          transaction.amount,

        currency:
          transaction.currency,

        paidAt:
          transaction.paidAt ||
          new Date()
            .toISOString(),

        channel:
          transaction.channel,

        customerEmail:
          transaction
            .customerEmail,
      });

    return NextResponse.json({
      ok:
        true,

      processed:
        true,

      applicationReference,

      paymentReference:
        transaction.reference,

      result,
    });
  } catch (
    error
  ) {
    console.error(
      'Paystack webhook processing failed:',
      error
    );

    /*
     * Return 500 when our processing
     * fails so Paystack can retry.
     */

    return NextResponse.json(
      {
        ok:
          false,

        error:
          'Webhook processing failed.',
      },
      {
        status:
          500,
      }
    );
  }
}
