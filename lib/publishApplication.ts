'use client';

import {
  doc,
  getDoc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '@/lib/firebase';

import type {
  ApplicationUnitVariant,
  ListingApplicationDraft,
} from '@/lib/listingApplication';


const ADVERTISING_DAYS =
  30;


type PublishPaidApplicationInput = {
  reference:
    string;

  application:
    ListingApplicationDraft;
};


export type PublishPaidApplicationResult = {
  propertyId:
    string;

  publicUrl:
    string;

  publishedAt:
    string;

  expiresAt:
    string;

  reusedExistingListing:
    boolean;
};


function cleanStrings(
  values:
    unknown
) {
  if (
    !Array.isArray(
      values
    )
  ) {
    return [];
  }

  return Array.from(
    new Set(
      values
        .map(
          (
            value
          ) =>
            typeof value ===
            'string'
              ? value.trim()
              : ''
        )
        .filter(
          Boolean
        )
    )
  );
}


function slugify(
  value:
    string
) {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      '-'
    )
    .replace(
      /^-+|-+$/g,
      ''
    );
}


function uniqueUrls(
  values:
    string[]
) {
  return Array.from(
    new Set(
      values
        .map(
          (
            value
          ) =>
            value.trim()
        )
        .filter(
          Boolean
        )
    )
  );
}


function capitalizePurpose(
  value:
    string
) {
  if (
    value ===
    'sale'
  ) {
    return 'Sale';
  }

  if (
    value ===
    'lease'
  ) {
    return 'Lease';
  }

  return 'Rent';
}


function categoryFromApplication(
  application:
    ListingApplicationDraft
) {
  if (
    application
      .listingType !==
    'property'
  ) {
    return 'Residential';
  }

  if (
    application
      .propertySubtype ===
    'land'
  ) {
    return 'Land';
  }

  if (
    application
      .propertySubtype ===
    'commercial'
  ) {
    return 'Commercial';
  }

  return 'Residential';
}


function generalImageUrls(
  application:
    ListingApplicationDraft
) {
  const cloudinary =
    application
      .generalMedia
      ?.images
      ?.map(
        (
          asset
        ) =>
          asset.secureUrl
      ) ??
    [];

  const legacy =
    application
      .media
      ?.photoLinks ??
    [];

  return uniqueUrls([
    ...cloudinary,
    ...legacy,
  ]);
}


function generalVideoUrls(
  application:
    ListingApplicationDraft
) {
  const cloudinary =
    application
      .generalMedia
      ?.videos
      ?.map(
        (
          asset
        ) =>
          asset.secureUrl
      ) ??
    [];

  const legacy =
    application
      .media
      ?.videoUrl
      ?.trim()
      ? [
          application
            .media
            .videoUrl
            .trim(),
        ]
      : [];

  return uniqueUrls([
    ...cloudinary,
    ...legacy,
  ]);
}


function getApplicationUnits(
  application:
    ListingApplicationDraft
):
ApplicationUnitVariant[] {
  if (
    Array.isArray(
      application
        .unitVariants
    ) &&
    application
      .unitVariants
      .length >
      0
  ) {
    return application
      .unitVariants;
  }

  if (
    Array.isArray(
      application
        .hostelRoomTypes
    ) &&
    application
      .hostelRoomTypes
      .length >
      0
  ) {
    return application
      .hostelRoomTypes;
  }

  return [];
}


function mapUnit(
  unit:
    ApplicationUnitVariant,

  listingType:
    ListingApplicationDraft[
      'listingType'
    ]
) {
  const quantity =
    Math.max(
      1,
      Math.floor(
        Number(
          unit.quantity
        ) ||
        1
      )
    );

  const availableQuantity =
    Math.min(
      quantity,
      Math.max(
        0,
        Math.floor(
          Number(
            unit
              .availableQuantity
          ) ||
          0
        )
      )
    );

  let price =
    Number(
      unit.price
    ) ||
    0;

  let pricePeriod =
    unit.pricePeriod ||
    'year';

  const nightlyRate =
    Number(
      unit.nightlyPrice
    ) ||
    0;

  const weeklyRate =
    Number(
      unit.weeklyPrice
    ) ||
    0;

  const monthlyRate =
    Number(
      unit.monthlyPrice
    ) ||
    0;

  if (
    listingType ===
    'shortlet'
  ) {
    if (
      nightlyRate >
      0
    ) {
      price =
        nightlyRate;

      pricePeriod =
        'night';
    } else if (
      weeklyRate >
      0
    ) {
      price =
        weeklyRate;

      pricePeriod =
        'week';
    } else if (
      monthlyRate >
      0
    ) {
      price =
        monthlyRate;

      pricePeriod =
        'month';
    }
  }

  const imageUrls =
    unit.media
      ?.images
      ?.map(
        (
          asset
        ) =>
          asset.secureUrl
      ) ??
    [];

  const videoUrls =
    unit.media
      ?.videos
      ?.map(
        (
          asset
        ) =>
          asset.secureUrl
      ) ??
    [];

  return {
    id:
      unit.id,

    unitType:
      unit.name ||
      'Unit',

    status:
      availableQuantity >
      0
        ? 'available'
        : 'reserved',

    price,

    pricePeriod,

    nightlyRate,

    weeklyRate,

    monthlyRate,

    annualRate:
      pricePeriod ===
      'year'
        ? price
        : 0,

    cautionDeposit:
      0,

    cleaningFee:
      0,

    bedrooms:
      Number(
        unit.bedrooms
      ) ||
      0,

    bathrooms:
      Number(
        unit.bathrooms
      ) ||
      0,

    toilets:
      Number(
        unit.toilets
      ) ||
      0,

    maxGuests:
      Number(
        unit.maxGuests
      ) ||
      0,

    furnished:
      Boolean(
        unit.furnished
      ),

    description:
      unit.description
        ?.trim() ||
      '',

    amenities:
      cleanStrings(
        unit.features
      ),

    media:
      uniqueUrls(
        imageUrls
      ),

    videos:
      uniqueUrls(
        videoUrls
      ),

    inspectionNotes:
      '',

    quantity,

    availableQuantity,
  };
}


function createFallbackUnit(
  application:
    ListingApplicationDraft
) {
  if (
    application
      .listingType ===
    'shortlet'
  ) {
    const nightly =
      Number(
        application
          .shortletNightlyPrice
      ) ||
      0;

    const weekly =
      Number(
        application
          .shortletWeeklyPrice
      ) ||
      0;

    const monthly =
      Number(
        application
          .shortletMonthlyPrice
      ) ||
      0;

    const price =
      nightly ||
      weekly ||
      monthly;

    const pricePeriod =
      nightly >
      0
        ? 'night'
        : weekly >
            0
          ? 'week'
          : 'month';

    return {
      id:
        'unit-1',

      unitType:
        application
          .propertyType ||
        'Short-Let',

      status:
        'available',

      price,

      pricePeriod,

      nightlyRate:
        nightly,

      weeklyRate:
        weekly,

      monthlyRate:
        monthly,

      annualRate:
        0,

      cautionDeposit:
        0,

      cleaningFee:
        0,

      bedrooms:
        Number(
          application
            .shortletBedrooms
        ) ||
        0,

      bathrooms:
        Number(
          application
            .shortletBathrooms
        ) ||
        0,

      toilets:
        Number(
          application
            .shortletBathrooms
        ) ||
        0,

      maxGuests:
        Number(
          application
            .shortletMaxGuests
        ) ||
        0,

      furnished:
        Boolean(
          application
            .shortletFurnished
        ),

      description:
        application
          .description
          ?.trim() ||
        '',

      amenities:
        cleanStrings([
          ...(
            application
              .features ||
            []
          ),
          ...(
            application
              .shortletAmenities ||
            []
          ),
        ]),

      media:
        [],

      videos:
        [],

      inspectionNotes:
        '',

      quantity:
        1,

      availableQuantity:
        1,
    };
  }

  const isSale =
    application
      .listingPurpose ===
    'sale';

  return {
    id:
      'unit-1',

    unitType:
      application
        .propertyType ||
      (
        application
          .listingType ===
        'hostel'
          ? 'Hostel Unit'
          : 'Property'
      ),

    status:
      'available',

    price:
      Number(
        application
          .askingPrice
      ) ||
      0,

    pricePeriod:
      isSale
        ? 'one-time'
        : 'year',

    nightlyRate:
      0,

    weeklyRate:
      0,

    monthlyRate:
      0,

    annualRate:
      isSale
        ? 0
        : Number(
            application
              .askingPrice
          ) ||
          0,

    cautionDeposit:
      0,

    cleaningFee:
      0,

    bedrooms:
      Number(
        application
          .propertyBedrooms
      ) ||
      0,

    bathrooms:
      Number(
        application
          .propertyBathrooms
      ) ||
      0,

    toilets:
      Number(
        application
          .propertyBathrooms
      ) ||
      0,

    maxGuests:
      0,

    furnished:
      false,

    description:
      application
        .description
        ?.trim() ||
      '',

    amenities:
      cleanStrings(
        application
          .features
      ),

    media:
      [],

    videos:
      [],

    inspectionNotes:
      '',

    quantity:
      1,

    availableQuantity:
      1,
  };
}


function timestampToDate(
  value:
    unknown
):
Date | null {
  if (
    value instanceof
    Timestamp
  ) {
    return value.toDate();
  }

  if (
    value &&
    typeof value ===
      'object' &&
    'toDate' in
      value &&
    typeof (
      value as {
        toDate?: unknown;
      }
    ).toDate ===
      'function'
  ) {
    return (
      value as {
        toDate:
          () => Date;
      }
    ).toDate();
  }

  if (
    value instanceof
    Date
  ) {
    return value;
  }

  return null;
}


async function markApplicationPublished(
  reference:
    string,

  propertyId:
    string,

  publishedAt:
    Date,

  expiresAt:
    Date
) {
  const user =
    auth.currentUser;

  if (
    !user
  ) {
    throw new Error(
      'ADMIN_LOGIN_REQUIRED'
    );
  }

  const token =
    await user.getIdToken();

  const response =
    await fetch(
      '/api/admin/listing-applications/publish',
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify({
            reference,

            propertyId,

            publishedAt:
              publishedAt
                .toISOString(),

            expiresAt:
              expiresAt
                .toISOString(),
          }),
      }
    );

  const data =
    await response.json() as {
      ok?: boolean;

      error?: string;
    };

  if (
    response.status ===
    401
  ) {
    throw new Error(
      'ADMIN_LOGIN_REQUIRED'
    );
  }

  if (
    !response.ok ||
    data.ok !==
      true
  ) {
    throw new Error(
      data.error ||
      'Could not update publication status.'
    );
  }
}


export async function
publishPaidApplication({
  reference,
  application,
}: PublishPaidApplicationInput):
Promise<PublishPaidApplicationResult> {
  const cleanReference =
    reference
      .trim()
      .toUpperCase();

  if (
    !cleanReference ||
    !cleanReference.startsWith(
      'LS-'
    )
  ) {
    throw new Error(
      'Invalid application reference.'
    );
  }

  const propertyId =
    `partner-${cleanReference.toLowerCase()}`;

  const propertyRef =
    doc(
      db,
      'properties',
      propertyId
    );

  const existing =
    await getDoc(
      propertyRef
    );

  if (
    existing.exists()
  ) {
    const data =
      existing.data();

    if (
      String(
        data
          .sourceApplicationReference ||
        ''
      )
        .trim()
        .toUpperCase() !==
      cleanReference
    ) {
      throw new Error(
        'A different listing already uses this publication ID.'
      );
    }

    const existingPublishedAt =
      timestampToDate(
        data.publishedAt
      );

    const existingExpiresAt =
      timestampToDate(
        data.expiresAt
      );

    if (
      existingPublishedAt &&
      existingExpiresAt
    ) {
      await markApplicationPublished(
        cleanReference,
        propertyId,
        existingPublishedAt,
        existingExpiresAt
      );

      return {
        propertyId,

        publicUrl:
          `/properties/${propertyId}`,

        publishedAt:
          existingPublishedAt
            .toISOString(),

        expiresAt:
          existingExpiresAt
            .toISOString(),

        reusedExistingListing:
          true,
      };
    }
  }

  const publishedAt =
    new Date();

  const expiresAt =
    new Date(
      publishedAt.getTime() +
      ADVERTISING_DAYS *
        24 *
        60 *
        60 *
        1000
    );

  const location =
    application.location ||
    {
      country:
        'Nigeria',

      state:
        '',

      city:
        '',

      area:
        '',

      address:
        '',

      landmark:
        '',
    };

  const displayLocation =
    [
      location.area,
      location.city,
      location.state,
    ]
      .filter(
        Boolean
      )
      .join(
        ', '
      );

  const locationSlug =
    slugify(
      [
        location.area,
        location.city,
        location.state,
      ]
        .filter(
          Boolean
        )
        .join(
          '-'
        )
    );

  const submittedUnits =
    getApplicationUnits(
      application
    );

  const units =
    submittedUnits.length >
    0
      ? submittedUnits.map(
          (
            unit
          ) =>
            mapUnit(
              unit,
              application
                .listingType
            )
        )
      : [
          createFallbackUnit(
            application
          ),
        ];

  const generalImages =
    generalImageUrls(
      application
    );

  const unitImages =
    units.flatMap(
      (
        unit
      ) =>
        unit.media
    );

  const publicImages =
    generalImages.length >
    0
      ? generalImages
      : uniqueUrls(
          unitImages
        );

  const generalVideos =
    generalVideoUrls(
      application
    );

  const amenities =
    cleanStrings([
      ...(
        application.features ||
        []
      ),

      ...(
        application
          .listingType ===
        'shortlet'
          ? application
              .shortletAmenities ||
            []
          : []
      ),
    ]);

  const payload = {
    serviceType:
      application
        .listingType,

    lifecycleStatus:
      'published',

    listingSource:
      'partner',

    sourceApplicationReference:
      cleanReference,

    advertisingPackage:
      'standard',

    advertisingDurationDays:
      ADVERTISING_DAYS,

    title:
      application.title
        .trim(),

    category:
      categoryFromApplication(
        application
      ),

    listingPurpose:
      capitalizePurpose(
        application
          .listingPurpose
      ),

    propertyType:
      application
        .propertyType
        .trim(),

    locationSlug,

    location:
      displayLocation,

    /*
     * Full owner address remains
     * in the private application
     * workflow / Google Sheet.
     *
     * Do not expose it in the
     * public property document.
     */

    address:
      '',

    country:
      location.country ||
      'Nigeria',

    state:
      location.state
        .trim(),

    city:
      location.city
        .trim(),

    area:
      location.area
        .trim(),

    showFullAddress:
      false,

    description:
      application
        .description
        .trim(),

    media:
      publicImages,

    videos:
      generalVideos,

    coverImage:
      publicImages[0] ||
      '',

    amenities,

    featured:
      false,

    furnished:
      application
        .listingType ===
      'shortlet'
        ? Boolean(
            application
              .shortletFurnished
          )
        : units.some(
            (
              unit
            ) =>
              Boolean(
                unit.furnished
              )
          ),

    landSize:
      application
        .propertySubtype ===
      'land'
        ? Number(
            application
              .landSize
          ) ||
          0
        : 0,

    landSizeUnit:
      application
        .landSizeUnit ||
      'sqm',

    titleDocument:
      application
        .propertySubtype ===
      'land'
        ? application
            .titleDocument
            .trim()
        : '',

    mapEmbedUrl:
      '',

    latitude:
      null,

    longitude:
      null,

    /*
     * Landmark is also kept out
     * of the public document.
     */

    nearbyLandmarks:
      [],

    checkInTime:
      application
        .listingType ===
      'shortlet'
        ? '15:00'
        : '',

    checkOutTime:
      application
        .listingType ===
      'shortlet'
        ? '12:00'
        : '',

    minStayNights:
      application
        .listingType ===
      'shortlet'
        ? Math.max(
            1,
            Number(
              application
                .shortletMinimumStay
            ) ||
            1
          )
        : 0,

    maxGuests:
      application
        .listingType ===
      'shortlet'
        ? Number(
            application
              .shortletMaxGuests
          ) ||
          0
        : 0,

    units,

    publishedAt:
      Timestamp.fromDate(
        publishedAt
      ),

    expiresAt:
      Timestamp.fromDate(
        expiresAt
      ),

    updatedAt:
      Timestamp.fromDate(
        publishedAt
      ),

    ...(existing.exists()
      ? {}
      : {
          createdAt:
            Timestamp.fromDate(
              publishedAt
            ),
        }),
  };

  await setDoc(
    propertyRef,
    payload,
    {
      merge:
        true,
    }
  );

  /*
   * Firestore succeeded.
   *
   * Only now tell the private
   * application workflow that
   * the advert is published.
   */

  await markApplicationPublished(
    cleanReference,
    propertyId,
    publishedAt,
    expiresAt
  );

  return {
    propertyId,

    publicUrl:
      `/properties/${propertyId}`,

    publishedAt:
      publishedAt
        .toISOString(),

    expiresAt:
      expiresAt
        .toISOString(),

    reusedExistingListing:
      false,
  };
}