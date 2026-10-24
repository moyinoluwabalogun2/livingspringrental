import {
  NextRequest,
  NextResponse,
} from 'next/server';

import {
  getCloudinary,
  getCloudinaryPublicConfig,
} from '@/lib/cloudinary';

import {
  isMediaResourceType,
  isMediaScope,
  MEDIA_LIMITS,
} from '@/lib/media';

export const runtime =
  'nodejs';

type ListingType =
  | 'property'
  | 'hostel'
  | 'shortlet';

type UploadOrigin =
  | 'application'
  | 'admin';

interface SignatureRequest {
  draftId?: unknown;
  listingType?: unknown;
  scope?: unknown;
  unitId?: unknown;
  resourceType?: unknown;
  multiUnit?: unknown;
  origin?: unknown;
}

const SAFE_IDENTIFIER =
  /^[a-zA-Z0-9_-]{6,100}$/;

function isListingType(
  value: unknown
): value is ListingType {
  return (
    value === 'property' ||
    value === 'hostel' ||
    value === 'shortlet'
  );
}

function isUploadOrigin(
  value: unknown
): value is UploadOrigin {
  return (
    value === 'application' ||
    value === 'admin'
  );
}

function validIdentifier(
  value: unknown
): value is string {
  return (
    typeof value === 'string' &&
    SAFE_IDENTIFIER.test(value)
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as
        SignatureRequest;

    const {
      draftId,
      listingType,
      scope,
      unitId,
      resourceType,
      multiUnit,
    } = body;

    const origin:
      UploadOrigin =
        body.origin ===
        undefined
          ? 'application'
          : isUploadOrigin(
                body.origin
              )
            ? body.origin
            : 'application';

    if (
      !validIdentifier(
        draftId
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid upload draft ID.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isListingType(
        listingType
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid listing type.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isMediaScope(
        scope
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid media scope.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      !isMediaResourceType(
        resourceType
      )
    ) {
      return NextResponse.json(
        {
          error:
            'Invalid media resource type.',
        },
        {
          status: 400,
        }
      );
    }

    if (
      scope === 'unit' &&
      !validIdentifier(
        unitId
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid unit ID is required for unit media.',
        },
        {
          status: 400,
        }
      );
    }

    const rootFolder =
      origin === 'admin'
        ? 'admin'
        : 'applications';

    const folder =
      scope === 'unit'
        ? [
            'living-spring',
            rootFolder,
            listingType,
            draftId,
            'units',
            unitId,
          ].join('/')
        : [
            'living-spring',
            rootFolder,
            listingType,
            draftId,
            'general',
          ].join('/');

    const timestamp =
      Math.floor(
        Date.now() / 1000
      );

    const returnDeleteToken =
      true;

    const paramsToSign = {
      folder,
      return_delete_token:
        returnDeleteToken,
      timestamp,
    };

    const cloudinary =
      getCloudinary();

    const apiSecret =
      process.env
        .CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      throw new Error(
        'Missing CLOUDINARY_API_SECRET.'
      );
    }

    const signature =
      cloudinary.utils
        .api_sign_request(
          paramsToSign,
          apiSecret
        );

    const {
      cloudName,
      apiKey,
    } =
      getCloudinaryPublicConfig();

    const limits =
      scope === 'unit'
        ? MEDIA_LIMITS.unit
        : multiUnit === true
          ? MEDIA_LIMITS
              .multiUnitGeneral
          : MEDIA_LIMITS
              .singleListing;

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
      returnDeleteToken,
      resourceType,
      limits,
      origin,
    });
  } catch (error) {
    console.error(
      'Cloudinary signature error:',
      error
    );

    return NextResponse.json(
      {
        error:
          'Unable to prepare media upload.',
      },
      {
        status: 500,
      }
    );
  }
}