import {
  createHash,
} from 'node:crypto';

import {
  NextResponse,
} from 'next/server';

import {
  cleanApplicationDraft,
  type ListingApplicationDraft,
} from '@/lib/listingApplication';

export const runtime =
  'nodejs';

const MAX_BODY_BYTES =
  500_000;

function isRecord(
  value:
    unknown
):
  value is Record<
    string,
    unknown
  > {
  return (
    typeof value ===
      'object' &&
    value !==
      null &&
    !Array.isArray(
      value
    )
  );
}

function validateSubmission(
  value:
    unknown
):
  value is ListingApplicationDraft {
  if (
    !isRecord(
      value
    )
  ) {
    return false;
  }

  if (
    value.listingType !==
      'property' &&
    value.listingType !==
      'hostel' &&
    value.listingType !==
      'shortlet'
  ) {
    return false;
  }

  if (
    value.packageId !==
    'standard'
  ) {
    return false;
  }

  if (
    typeof value.title !==
      'string' ||
    typeof value.propertyType !==
      'string'
  ) {
    return false;
  }

  if (
    !isRecord(
      value.applicant
    ) ||
    typeof value.applicant.name !==
      'string' ||
    typeof value.applicant.phone !==
      'string' ||
    typeof value.applicant.whatsapp !==
      'string' ||
    typeof value.applicant.email !==
      'string'
  ) {
    return false;
  }

  if (
    !isRecord(
      value.location
    ) ||
    typeof value.location.state !==
      'string' ||
    typeof value.location.city !==
      'string'
  ) {
    return false;
  }

  if (
    !isRecord(
      value.media
    ) ||
    !Array.isArray(
      value.media.photoLinks
    )
  ) {
    return false;
  }

  return true;
}

function createIdempotencyKey(
  application:
    ListingApplicationDraft
) {
  const source = [
    application.startedAt,
    application.applicant
      .email
      .trim()
      .toLowerCase(),
    application.applicant
      .phone
      .trim(),
    application.title
      .trim()
      .toLowerCase(),
    application.listingType,
  ].join(
    '|'
  );

  return createHash(
    'sha256'
  )
    .update(
      source
    )
    .digest(
      'hex'
    );
}

export async function POST(
  request:
    Request
) {
  const contentLength =
    Number(
      request.headers.get(
        'content-length'
      ) ||
        0
    );

  if (
    contentLength >
    MAX_BODY_BYTES
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        message:
          'This application is too large.',
      },

      {
        status:
          413,
      }
    );
  }

  let body:
    unknown;

  try {
    body =
      await request.json();
  } catch {
    return NextResponse.json(
      {
        ok:
          false,

        message:
          'Invalid application data.',
      },

      {
        status:
          400,
      }
    );
  }

  if (
    !validateSubmission(
      body
    )
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        message:
          'Some required application information is missing.',
      },

      {
        status:
          400,
      }
    );
  }

  /*
   * Honeypot for basic bot/spam submissions.
   */
  if (
    body.website
  ) {
    return NextResponse.json(
      {
        ok:
          true,

        reference:
          'LS-REVIEW',
      }
    );
  }

  const application =
    cleanApplicationDraft(
      body
    );

  const receiverUrl =
    process.env
      .LISTING_APPLICATIONS_WEBHOOK_URL
      ?.trim();

  const receiverSecret =
    process.env
      .LISTING_APPLICATIONS_WEBHOOK_SECRET
      ?.trim();

  if (
    !receiverUrl ||
    !receiverSecret
  ) {
    return NextResponse.json(
      {
        ok:
          false,

        code:
          'APPLICATION_RECEIVER_NOT_CONFIGURED',

        message:
          'The Living Spring application receiver is not configured.',
      },

      {
        status:
          503,
      }
    );
  }

  try {
    new URL(
      receiverUrl
    );
  } catch {
    return NextResponse.json(
      {
        ok:
          false,

        code:
          'APPLICATION_RECEIVER_INVALID',

        message:
          'The Living Spring application receiver URL is invalid.',
      },

      {
        status:
          500,
      }
    );
  }

  const idempotencyKey =
    createIdempotencyKey(
      application
    );

  const submittedAt =
    new Date()
      .toISOString();

  try {
    const response =
      await fetch(
        receiverUrl,
        {
          method:
            'POST',

          headers: {
            'Content-Type':
              'application/json',

            Accept:
              'application/json',
          },

          body:
            JSON.stringify({
              secret:
                receiverSecret,

              idempotencyKey,

              submittedAt,

              application,
            }),

          cache:
            'no-store',

          redirect:
            'follow',
        }
      );

    const rawText =
      await response.text();

    let result:
      unknown = {};

    try {
      result =
        rawText
          ? JSON.parse(
              rawText
            )
          : {};
    } catch {
      result = {};
    }

    if (
      !response.ok ||
      !isRecord(
        result
      ) ||
      result.ok !==
        true ||
      typeof result.reference !==
        'string'
    ) {
      console.error(
        'Living Spring application receiver rejected submission:',
        rawText
      );

      return NextResponse.json(
        {
          ok:
            false,

          message:
            'Living Spring could not record the application. Your draft remains saved.',
        },

        {
          status:
            502,
        }
      );
    }

    return NextResponse.json(
      {
        ok:
          true,

        reference:
          result.reference,
      }
    );
  } catch (
    error
  ) {
    console.error(
      'Living Spring application submission failed:',
      error
    );

    return NextResponse.json(
      {
        ok:
          false,

        message:
          'Living Spring could not record the application. Your draft remains saved.',
      },

      {
        status:
          502,
      }
    );
  }
}