const PAYSTACK_BASE_URL =
  'https://api.paystack.co';


/*
 * =========================================================
 * LIVING SPRING PRICING
 * =========================================================
 */

export const STANDARD_LISTING_FEE_NAIRA =
  20_000;

export const STANDARD_LISTING_FEE_KOBO =
  STANDARD_LISTING_FEE_NAIRA *
  100;

export const STANDARD_LISTING_DURATION_DAYS =
  30;


/*
 * =========================================================
 * PAYMENT PURPOSE
 * =========================================================
 */

export type LivingSpringPaymentPurpose =
  | 'initial-listing'
  | 'renewal';


/*
 * =========================================================
 * INITIAL LISTING INPUT
 * =========================================================
 */

type InitializePaystackPaymentInput = {
  email:
    string;

  applicationReference:
    string;

  listingTitle:
    string;
};


/*
 * =========================================================
 * RENEWAL INPUT
 * =========================================================
 */

export type InitializePartnerRenewalPaymentInput = {
  email:
    string;

  applicationReference:
    string;

  listingTitle:
    string;

  propertyId:
    string;

  renewalNumber:
    number;
};


/*
 * =========================================================
 * PAYSTACK RESPONSE TYPES
 * =========================================================
 */

type PaystackInitializeResponse = {
  status:
    boolean;

  message:
    string;

  data?: {
    authorization_url:
      string;

    access_code:
      string;

    reference:
      string;
  };
};


type PaystackVerifyResponse = {
  status:
    boolean;

  message:
    string;

  data?: {
    id?:
      number;

    domain?:
      string;

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

    created_at?:
      string;

    channel?:
      string;

    gateway_response?:
      string;

    metadata?:
      unknown;

    customer?: {
      email?:
        string;
    };
  };
};


/*
 * =========================================================
 * EXPORTED RESULT TYPES
 * =========================================================
 */

export type InitializedPaystackPayment = {
  authorizationUrl:
    string;

  accessCode:
    string;

  reference:
    string;
};


export type VerifiedPaystackTransaction = {
  id:
    number | null;

  domain:
    string;

  status:
    string;

  reference:
    string;

  amount:
    number;

  currency:
    string;

  paidAt:
    string | null;

  channel:
    string;

  gatewayResponse:
    string;

  metadata:
    unknown;

  customerEmail:
    string;
};


/*
 * =========================================================
 * CONFIG
 * =========================================================
 */

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


function getSiteUrl() {
  return (
    process.env
      .SITE_URL ||
    'https://livingspringproperties.netlify.app'
  )
    .trim()
    .replace(
      /\/+$/,
      ''
    );
}


/*
 * =========================================================
 * VALIDATION
 * =========================================================
 */

function normalizeEmail(
  email:
    string
) {
  const cleanEmail =
    email
      .trim()
      .toLowerCase();

  if (
    !cleanEmail ||
    !cleanEmail.includes(
      '@'
    )
  ) {
    throw new Error(
      'PAYSTACK_INVALID_EMAIL'
    );
  }

  return cleanEmail;
}


function normalizeApplicationReference(
  reference:
    string
) {
  const cleanReference =
    reference
      .trim()
      .toUpperCase();

  if (
    !/^LS-\d{4}-\d+$/.test(
      cleanReference
    )
  ) {
    throw new Error(
      'INVALID_APPLICATION_REFERENCE'
    );
  }

  return cleanReference;
}


function normalizePropertyId(
  propertyId:
    string,

  applicationReference:
    string
) {
  const cleanPropertyId =
    propertyId
      .trim()
      .toLowerCase();

  const expectedPropertyId =
    `partner-${applicationReference.toLowerCase()}`;

  if (
    cleanPropertyId !==
    expectedPropertyId
  ) {
    throw new Error(
      'INVALID_PARTNER_PROPERTY_ID'
    );
  }

  return cleanPropertyId;
}


/*
 * =========================================================
 * REFERENCES
 * =========================================================
 */

function createInitialPaymentReference(
  applicationReference:
    string
) {
  return `${applicationReference}-${Date.now()}`;
}


function createRenewalPaymentReference(
  applicationReference:
    string,

  renewalNumber:
    number
) {
  const cleanRenewalNumber =
    Math.max(
      1,
      Math.floor(
        Number(
          renewalNumber
        ) ||
        1
      )
    );

  return `${applicationReference}-R${cleanRenewalNumber}-${Date.now()}`;
}


/*
 * =========================================================
 * INITIALIZE HELPER
 * =========================================================
 */

async function initializeTransaction({
  email,
  reference,
  metadata,
}: {
  email:
    string;

  reference:
    string;

  metadata:
    Record<
      string,
      unknown
    >;
}):
Promise<InitializedPaystackPayment> {
  const secretKey =
    getPaystackSecretKey();

  const siteUrl =
    getSiteUrl();

  const callbackUrl =
    `${siteUrl}/payment/callback`;

  const cancelUrl =
    `${siteUrl}/properties`;

  const response =
    await fetch(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        method:
          'POST',

        headers: {
          Authorization:
            `Bearer ${secretKey}`,

          'Content-Type':
            'application/json',
        },

        body:
          JSON.stringify({
            email,

            amount:
              String(
                STANDARD_LISTING_FEE_KOBO
              ),

            currency:
              'NGN',

            reference,

            callback_url:
              callbackUrl,

            metadata:
              JSON.stringify({
                ...metadata,

                cancel_action:
                  cancelUrl,
              }),
          }),

        cache:
          'no-store',
      }
    );

  const data =
    (
      await response.json()
    ) as
      PaystackInitializeResponse;

  if (
    !response.ok ||
    !data.status ||
    !data.data
  ) {
    console.error(
      'Paystack initialize failed:',
      data
    );

    throw new Error(
      data.message ||
      'PAYSTACK_INITIALIZE_FAILED'
    );
  }

  if (
    !data.data
      .authorization_url ||
    !data.data
      .reference ||
    !data.data
      .access_code
  ) {
    throw new Error(
      'PAYSTACK_INVALID_RESPONSE'
    );
  }

  return {
    authorizationUrl:
      data.data
        .authorization_url,

    accessCode:
      data.data
        .access_code,

    reference:
      data.data
        .reference,
  };
}


/*
 * =========================================================
 * INITIAL LISTING PAYMENT
 * =========================================================
 */

export async function
initializeStandardListingPayment({
  email,
  applicationReference,
  listingTitle,
}: InitializePaystackPaymentInput):
Promise<InitializedPaystackPayment> {
  const cleanEmail =
    normalizeEmail(
      email
    );

  const cleanApplicationReference =
    normalizeApplicationReference(
      applicationReference
    );

  const paymentReference =
    createInitialPaymentReference(
      cleanApplicationReference
    );

  return initializeTransaction({
    email:
      cleanEmail,

    reference:
      paymentReference,

    metadata: {
      paymentPurpose:
        'initial-listing' satisfies
          LivingSpringPaymentPurpose,

      applicationReference:
        cleanApplicationReference,

      listingTitle:
        listingTitle.trim(),

      packageId:
        'standard',

      packageName:
        'Standard Listing',

      packageFee:
        STANDARD_LISTING_FEE_NAIRA,

      durationDays:
        STANDARD_LISTING_DURATION_DAYS,

      source:
        'living-spring-list-with-us',
    },
  });
}


/*
 * =========================================================
 * PARTNER LISTING RENEWAL PAYMENT
 * =========================================================
 */

export async function
initializePartnerRenewalPayment({
  email,
  applicationReference,
  listingTitle,
  propertyId,
  renewalNumber,
}: InitializePartnerRenewalPaymentInput):
Promise<InitializedPaystackPayment> {
  const cleanEmail =
    normalizeEmail(
      email
    );

  const cleanApplicationReference =
    normalizeApplicationReference(
      applicationReference
    );

  const cleanPropertyId =
    normalizePropertyId(
      propertyId,
      cleanApplicationReference
    );

  const cleanRenewalNumber =
    Math.max(
      1,
      Math.floor(
        Number(
          renewalNumber
        ) ||
        1
      )
    );

  const paymentReference =
    createRenewalPaymentReference(
      cleanApplicationReference,
      cleanRenewalNumber
    );

  return initializeTransaction({
    email:
      cleanEmail,

    reference:
      paymentReference,

    metadata: {
      paymentPurpose:
        'renewal' satisfies
          LivingSpringPaymentPurpose,

      applicationReference:
        cleanApplicationReference,

      propertyId:
        cleanPropertyId,

      listingTitle:
        listingTitle.trim(),

      renewalNumber:
        cleanRenewalNumber,

      packageId:
        'standard-renewal',

      packageName:
        'Standard Listing Renewal',

      packageFee:
        STANDARD_LISTING_FEE_NAIRA,

      durationDays:
        STANDARD_LISTING_DURATION_DAYS,

      source:
        'living-spring-list-with-us',
    },
  });
}


/*
 * =========================================================
 * VERIFY TRANSACTION
 * =========================================================
 */

export async function
verifyPaystackTransaction(
  reference:
    string
):
Promise<VerifiedPaystackTransaction> {
  const secretKey =
    getPaystackSecretKey();

  const cleanReference =
    reference
      .trim();

  if (
    !cleanReference
  ) {
    throw new Error(
      'PAYSTACK_REFERENCE_REQUIRED'
    );
  }

  const response =
    await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(
        cleanReference
      )}`,
      {
        method:
          'GET',

        headers: {
          Authorization:
            `Bearer ${secretKey}`,
        },

        cache:
          'no-store',
      }
    );

  const data =
    (
      await response.json()
    ) as
      PaystackVerifyResponse;

  if (
    !response.ok ||
    !data.status ||
    !data.data
  ) {
    console.error(
      'Paystack verify failed:',
      data
    );

    throw new Error(
      data.message ||
      'PAYSTACK_VERIFY_FAILED'
    );
  }

  return {
    id:
      typeof data.data.id ===
      'number'
        ? data.data.id
        : null,

    domain:
      String(
        data.data.domain ||
        ''
      ),

    status:
      String(
        data.data.status ||
        ''
      ),

    reference:
      String(
        data.data.reference ||
        ''
      ),

    amount:
      Number(
        data.data.amount ||
        0
      ),

    currency:
      String(
        data.data.currency ||
        ''
      ),

    paidAt:
      data.data
        .paid_at ||
      null,

    channel:
      String(
        data.data.channel ||
        ''
      ),

    gatewayResponse:
      String(
        data.data
          .gateway_response ||
        ''
      ),

    metadata:
      data.data.metadata,

    customerEmail:
      String(
        data.data.customer
          ?.email ||
        ''
      ),
  };
}