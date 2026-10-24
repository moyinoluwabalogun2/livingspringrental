const PAYSTACK_BASE_URL =
  'https://api.paystack.co';

export const STANDARD_LISTING_FEE_NAIRA =
  20_000;

export const STANDARD_LISTING_FEE_KOBO =
  STANDARD_LISTING_FEE_NAIRA *
  100;


type InitializePaystackPaymentInput = {
  email:
    string;

  applicationReference:
    string;

  listingTitle:
    string;
};


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


export type InitializedPaystackPayment = {
  authorizationUrl:
    string;

  accessCode:
    string;

  reference:
    string;
};


export type VerifiedPaystackTransaction = {
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

  metadata:
    unknown;

  customerEmail:
    string;
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


function createPaymentReference(
  applicationReference:
    string
) {
  return `${applicationReference}-${Date.now()}`;
}


export async function
initializeStandardListingPayment({
  email,
  applicationReference,
  listingTitle,
}: InitializePaystackPaymentInput):
Promise<InitializedPaystackPayment> {
  const secretKey =
    getPaystackSecretKey();

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

  const reference =
    createPaymentReference(
      applicationReference
    );

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
            email:
              cleanEmail,

            amount:
              String(
                STANDARD_LISTING_FEE_KOBO
              ),

            currency:
              'NGN',

            reference,

            metadata:
              JSON.stringify({
                applicationReference,

                listingTitle,

                packageId:
                  'standard',

                packageName:
                  'Standard Listing',

                packageFee:
                  STANDARD_LISTING_FEE_NAIRA,

                durationDays:
                  30,

                source:
                  'living-spring-list-with-us',
              }),
          }),

        cache:
          'no-store',
      }
    );

  const data =
    (await response.json()) as
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
      .reference
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
    (await response.json()) as
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