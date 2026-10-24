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
  paymentPurpose?: 'initial-listing' | 'renewal' | string;
  propertyId?: string;
  renewalNumber?: number | string;
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
        metadata.applicationReference ||
        ''
      )
        .trim()
        .toUpperCase();

    if (
      !/^LS-\d{4}-\d+$/.test(
        applicationReference
      )
    ) {
      console.error(
        'Paystack transaction has an invalid application reference.'
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            'Invalid Living Spring application reference.',
        },
        { status: 400 }
      );
    }

    // Keep the existing application source check for both payments.
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
          ok: false,
          error: 'Incorrect transaction source.',
        },
        { status: 400 }
      );
    }

    const paymentPurpose =
      String(
        metadata.paymentPurpose ||
        'initial-listing'
      )
        .trim()
        .toLowerCase();

    if (
      paymentPurpose !== 'initial-listing' &&
      paymentPurpose !== 'renewal'
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Unsupported payment purpose.',
        },
        { status: 400 }
      );
    }

    /*
     * Verify package metadata where present.
     * Amount was independently verified with Paystack above.
     */
    if (
      metadata.packageFee !== undefined &&
      metadata.packageFee !== null &&
      Number(metadata.packageFee) !==
        STANDARD_LISTING_FEE_KOBO / 100
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Incorrect package fee.',
        },
        { status: 400 }
      );
    }

    if (
      metadata.durationDays !== undefined &&
      metadata.durationDays !== null &&
      Number(metadata.durationDays) !== 30
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Incorrect advertising duration.',
        },
        { status: 400 }
      );
    }

    if (paymentPurpose === 'renewal') {
      /*
       * A renewal must be tied to the original property,
       * to one renewal number, and to that renewal checkout.
       * Never overwrite the original payment's columns.
       */
      const propertyId =
        String(metadata.propertyId || '')
          .trim()
          .toLowerCase();

      const renewalNumber =
        Number(metadata.renewalNumber);

      const expectedPropertyId =
        `partner-${applicationReference.toLowerCase()}`;

      const expectedPrefix =
        `${applicationReference}-R${renewalNumber}-`;

      if (
        metadata.source !==
          'living-spring-list-with-us' ||
        metadata.packageId !==
          'standard-renewal' ||
        propertyId !== expectedPropertyId ||
        !Number.isSafeInteger(renewalNumber) ||
        renewalNumber < 1 ||
        !paymentReference.startsWith(
          expectedPrefix
        )
      ) {
        console.error(
          'Paystack renewal metadata validation failed:',
          {
            applicationReference,
            propertyId,
            renewalNumber,
            paymentReference,
          }
        );

        return NextResponse.json(
          {
            ok: false,
            error:
              'Invalid renewal transaction metadata.',
          },
          { status: 400 }
        );
      }

      const result =
        await callApplicationsWebhook({
          action:
            'renewal-payment-confirmed',

          reference:
            applicationReference,

          propertyId,

          renewalNumber,

          paymentReference:
            transaction.reference,

          // Renewal.gs expects amount in naira, not kobo.
          amount:
            transaction.amount / 100,

          currency:
            transaction.currency,

          paidAt:
            transaction.paidAt ||
            new Date().toISOString(),

          paymentChannel:
            transaction.channel || 'paystack',

          customerEmail:
            transaction.customerEmail,
        });

      return NextResponse.json({
        ok: true,
        processed: true,
        paymentPurpose: 'renewal',
        applicationReference,
        renewalNumber,
        propertyId,
        paymentReference:
          transaction.reference,
        result,
      });
    }

    /*
     * Existing initial-listing payment behavior remains intact.
     * Old transactions without paymentPurpose are initial listings.
     */
    if (
      metadata.packageId &&
      metadata.packageId !== 'standard'
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Incorrect advertising package.',
        },
        { status: 400 }
      );
    }

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
          new Date().toISOString(),

        channel:
          transaction.channel,

        customerEmail:
          transaction.customerEmail,
      });

    return NextResponse.json({
      ok:
        true,

      processed:
        true,

      paymentPurpose: 'initial-listing',

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
