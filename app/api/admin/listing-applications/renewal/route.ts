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
  STANDARD_LISTING_FEE_NAIRA,
  verifyPaystackTransaction,
} from '@/lib/paystack';


export const runtime =
  'nodejs';


type PaystackWebhookEvent = {
  event?:
    string;

  data?: {
    id?:
      number;

    status?:
      string;

    reference?:
      string;

    amount?:
      number;

    currency?:
      string;

    paid_at?:
      string | null;

    channel?:
      string;

    metadata?:
      unknown;
  };
};


type AppsScriptResponse = {
  ok?:
    boolean;

  error?:
    string;

  paid?:
    boolean;

  duplicate?:
    boolean;

  application?:
    unknown;

  renewal?:
    unknown;
};


/*
 * =========================================================
 * CONFIG
 * =========================================================
 */

function getPaystackSecret() {
  const secret =
    process.env
      .PAYSTACK_SECRET_KEY
      ?.trim();

  if (
    !secret
  ) {
    throw new Error(
      'PAYSTACK_NOT_CONFIGURED'
    );
  }

  return secret;
}


/*
 * =========================================================
 * WEBHOOK SIGNATURE
 * =========================================================
 */

function validPaystackSignature(
  rawBody:
    Buffer,

  signature:
    string | null
) {
  if (
    !signature
  ) {
    return false;
  }

  const cleanSignature =
    signature
      .trim()
      .toLowerCase();

  /*
   * SHA512 HMAC in hexadecimal
   * should be 128 hex characters.
   */

  if (
    !/^[a-f0-9]{128}$/.test(
      cleanSignature
    )
  ) {
    return false;
  }

  const expectedHex =
    createHmac(
      'sha512',
      getPaystackSecret()
    )
      .update(
        rawBody
      )
      .digest(
        'hex'
      );

  const expected =
    Buffer.from(
      expectedHex,
      'hex'
    );

  const supplied =
    Buffer.from(
      cleanSignature,
      'hex'
    );

  if (
    expected.length !==
    supplied.length
  ) {
    return false;
  }

  return timingSafeEqual(
    expected,
    supplied
  );
}


/*
 * =========================================================
 * METADATA
 * =========================================================
 */

function readMetadata(
  value:
    unknown
):
Record<string, unknown> {
  if (
    value &&
    typeof value ===
      'object' &&
    !Array.isArray(
      value
    )
  ) {
    return value as
      Record<
        string,
        unknown
      >;
  }

  if (
    typeof value ===
    'string'
  ) {
    try {
      const parsed =
        JSON.parse(
          value
        ) as
          unknown;

      if (
        parsed &&
        typeof parsed ===
          'object' &&
        !Array.isArray(
          parsed
        )
      ) {
        return parsed as
          Record<
            string,
            unknown
          >;
      }
    } catch {
      return {};
    }
  }

  return {};
}


function metadataString(
  metadata:
    Record<string, unknown>,

  key:
    string
) {
  return String(
    metadata[
      key
    ] ||
    ''
  ).trim();
}


function metadataNumber(
  metadata:
    Record<string, unknown>,

  key:
    string
) {
  const value =
    Number(
      metadata[
        key
      ]
    );

  return Number.isFinite(
    value
  )
    ? value
    : 0;
}


/*
 * =========================================================
 * APPLICATION REFERENCE
 * =========================================================
 */

function normalizeApplicationReference(
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
 * APPS SCRIPT
 * =========================================================
 */

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
      'Apps Script invalid response:',
      responseText
    );

    throw new Error(
      'APPLICATION_WEBHOOK_INVALID_RESPONSE'
    );
  }

  /*
   * Apps Script ContentService can
   * respond HTTP 200 even when our
   * JSON body contains ok:false.
   */

  if (
    !response.ok ||
    data.ok !==
      true
  ) {
    console.error(
      'Apps Script payment update failed:',
      data
    );

    throw new Error(
      data.error ||
      'APPLICATION_WEBHOOK_FAILED'
    );
  }

  return data;
}


/*
 * =========================================================
 * TRANSACTION SECURITY CHECKS
 * =========================================================
 */

function validateVerifiedTransaction({
  webhookReference,
  webhookAmount,
  webhookCurrency,
  verifiedReference,
  verifiedStatus,
  verifiedAmount,
  verifiedCurrency,
}: {
  webhookReference:
    string;

  webhookAmount?:
    number;

  webhookCurrency?:
    string;

  verifiedReference:
    string;

  verifiedStatus:
    string;

  verifiedAmount:
    number;

  verifiedCurrency:
    string;
}) {
  if (
    verifiedReference !==
    webhookReference
  ) {
    throw new Error(
      'PAYSTACK_REFERENCE_MISMATCH'
    );
  }

  if (
    verifiedStatus
      .trim()
      .toLowerCase() !==
    'success'
  ) {
    throw new Error(
      'PAYSTACK_TRANSACTION_NOT_SUCCESSFUL'
    );
  }

  if (
    verifiedAmount !==
    STANDARD_LISTING_FEE_KOBO
  ) {
    throw new Error(
      'PAYSTACK_AMOUNT_MISMATCH'
    );
  }

  if (
    verifiedCurrency
      .trim()
      .toUpperCase() !==
    'NGN'
  ) {
    throw new Error(
      'PAYSTACK_CURRENCY_MISMATCH'
    );
  }

  if (
    webhookAmount !==
      undefined &&
    Number(
      webhookAmount
    ) !==
      verifiedAmount
  ) {
    throw new Error(
      'PAYSTACK_WEBHOOK_AMOUNT_MISMATCH'
    );
  }

  if (
    webhookCurrency &&
    webhookCurrency
      .trim()
      .toUpperCase() !==
      verifiedCurrency
        .trim()
        .toUpperCase()
  ) {
    throw new Error(
      'PAYSTACK_WEBHOOK_CURRENCY_MISMATCH'
    );
  }
}


/*
 * =========================================================
 * INITIAL PAYMENT
 * =========================================================
 */

async function processInitialPayment({
  reference,
  metadata,
  paidAt,
  channel,
}: {
  reference:
    string;

  metadata:
    Record<string, unknown>;

  paidAt:
    string | null;

  channel:
    string;
}) {
  const applicationReference =
    normalizeApplicationReference(
      metadata
        .applicationReference
    );

  const packageId =
    metadataString(
      metadata,
      'packageId'
    );

  const source =
    metadataString(
      metadata,
      'source'
    );

  const paymentPurpose =
    metadataString(
      metadata,
      'paymentPurpose'
    );


  /*
   * Older transactions such as the
   * already successful LS-2026-0003
   * payment were created before
   * paymentPurpose was added.
   *
   * Therefore blank purpose remains
   * valid for ORIGINAL listing
   * payments only.
   */

  if (
    paymentPurpose &&
    paymentPurpose !==
      'initial-listing'
  ) {
    throw new Error(
      'INVALID_INITIAL_PAYMENT_PURPOSE'
    );
  }


  if (
    packageId &&
    packageId !==
      'standard'
  ) {
    throw new Error(
      'INVALID_INITIAL_PACKAGE'
    );
  }


  if (
    source &&
    source !==
      'living-spring-list-with-us'
  ) {
    throw new Error(
      'INVALID_PAYMENT_SOURCE'
    );
  }


  return callApplicationsSystem({
    action:
      'payment-confirmed',

    reference:
      applicationReference,

    paymentReference:
      reference,

    amount:
      STANDARD_LISTING_FEE_NAIRA,

    currency:
      'NGN',

    paidAt:
      paidAt ||
      new Date()
        .toISOString(),

    paymentChannel:
      channel ||
      'paystack',
  });
}


/*
 * =========================================================
 * RENEWAL PAYMENT
 * =========================================================
 */

async function processRenewalPayment({
  reference,
  metadata,
  paidAt,
  channel,
}: {
  reference:
    string;

  metadata:
    Record<string, unknown>;

  paidAt:
    string | null;

  channel:
    string;
}) {
  const applicationReference =
    normalizeApplicationReference(
      metadata
        .applicationReference
    );


  const paymentPurpose =
    metadataString(
      metadata,
      'paymentPurpose'
    );


  if (
    paymentPurpose !==
    'renewal'
  ) {
    throw new Error(
      'INVALID_RENEWAL_PAYMENT_PURPOSE'
    );
  }


  const packageId =
    metadataString(
      metadata,
      'packageId'
    );


  if (
    packageId !==
    'standard-renewal'
  ) {
    throw new Error(
      'INVALID_RENEWAL_PACKAGE'
    );
  }


  const source =
    metadataString(
      metadata,
      'source'
    );


  if (
    source !==
    'living-spring-list-with-us'
  ) {
    throw new Error(
      'INVALID_PAYMENT_SOURCE'
    );
  }


  const propertyId =
    metadataString(
      metadata,
      'propertyId'
    )
      .toLowerCase();


  const expectedPropertyId =
    `partner-${applicationReference.toLowerCase()}`;


  if (
    propertyId !==
    expectedPropertyId
  ) {
    throw new Error(
      'INVALID_RENEWAL_PROPERTY_ID'
    );
  }


  const renewalNumber =
    Math.floor(
      metadataNumber(
        metadata,
        'renewalNumber'
      )
    );


  if (
    renewalNumber <
    1
  ) {
    throw new Error(
      'INVALID_RENEWAL_NUMBER'
    );
  }


  /*
   * Renewal references created by
   * lib/paystack.ts use:
   *
   * LS-2026-0003-R1-...
   */

  const expectedPrefix =
    `${applicationReference}-R${renewalNumber}-`;


  if (
    !reference.startsWith(
      expectedPrefix
    )
  ) {
    throw new Error(
      'INVALID_RENEWAL_REFERENCE'
    );
  }


  return callApplicationsSystem({
    action:
      'renewal-payment-confirmed',

    reference:
      applicationReference,

    propertyId,

    renewalNumber,

    paymentReference:
      reference,

    amount:
      STANDARD_LISTING_FEE_NAIRA,

    currency:
      'NGN',

    paidAt:
      paidAt ||
      new Date()
        .toISOString(),

    paymentChannel:
      channel ||
      'paystack',
  });
}


/*
 * =========================================================
 * POST
 * =========================================================
 */

export async function POST(
  request:
    NextRequest
) {
  try {
    /*
     * IMPORTANT:
     * Read raw bytes BEFORE parsing JSON.
     * Paystack signs the webhook payload.
     */

    const rawBody =
      Buffer.from(
        await request.arrayBuffer()
      );


    const signature =
      request.headers.get(
        'x-paystack-signature'
      );


    if (
      !validPaystackSignature(
        rawBody,
        signature
      )
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'INVALID_PAYSTACK_SIGNATURE',
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
          rawBody.toString(
            'utf8'
          )
        ) as
          PaystackWebhookEvent;
    } catch {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'INVALID_PAYSTACK_PAYLOAD',
        },
        {
          status:
            400,
        }
      );
    }


    /*
     * We only need charge.success.
     * Other Paystack events are
     * acknowledged safely.
     */

    if (
      event.event !==
      'charge.success'
    ) {
      return NextResponse.json({
        ok:
          true,

        processed:
          false,

        event:
          event.event ||
          'unknown',
      });
    }


    const webhookReference =
      String(
        event.data
          ?.reference ||
        ''
      ).trim();


    if (
      !webhookReference
    ) {
      return NextResponse.json(
        {
          ok:
            false,

          error:
            'PAYSTACK_REFERENCE_MISSING',
        },
        {
          status:
            400,
        }
      );
    }


    /*
     * Do not trust the webhook body
     * alone. Independently ask Paystack
     * to verify the transaction.
     */

    const verified =
      await verifyPaystackTransaction(
        webhookReference
      );


    validateVerifiedTransaction({
      webhookReference,

      webhookAmount:
        event.data
          ?.amount,

      webhookCurrency:
        event.data
          ?.currency,

      verifiedReference:
        verified.reference,

      verifiedStatus:
        verified.status,

      verifiedAmount:
        verified.amount,

      verifiedCurrency:
        verified.currency,
    });


    const metadata =
      readMetadata(
        verified.metadata
      );


    const paymentPurpose =
      metadataString(
        metadata,
        'paymentPurpose'
      );


    /*
     * NEW:
     * Renewal transactions go to
     * renewal-payment-confirmed.
     */

    if (
      paymentPurpose ===
      'renewal'
    ) {
      const result =
        await processRenewalPayment({
          reference:
            verified.reference,

          metadata,

          paidAt:
            verified.paidAt,

          channel:
            verified.channel,
        });


      return NextResponse.json({
        ok:
          true,

        processed:
          true,

        paymentPurpose:
          'renewal',

        applicationReference:
          normalizeApplicationReference(
            metadata
              .applicationReference
          ),

        paymentReference:
          verified.reference,

        result,
      });
    }


    /*
     * Existing initial-listing path.
     *
     * Blank paymentPurpose is accepted
     * for transactions generated before
     * the renewal upgrade.
     */

    const result =
      await processInitialPayment({
        reference:
          verified.reference,

        metadata,

        paidAt:
          verified.paidAt,

        channel:
          verified.channel,
      });


    return NextResponse.json({
      ok:
        true,

      processed:
        true,

      paymentPurpose:
        'initial-listing',

      applicationReference:
        normalizeApplicationReference(
          metadata
            .applicationReference
        ),

      paymentReference:
        verified.reference,

      result,
    });
  } catch (
    error
  ) {
    console.error(
      'Paystack webhook failed:',
      error
    );


    const message =
      error instanceof
      Error
        ? error.message
        : 'PAYSTACK_WEBHOOK_FAILED';


    return NextResponse.json(
      {
        ok:
          false,

        processed:
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