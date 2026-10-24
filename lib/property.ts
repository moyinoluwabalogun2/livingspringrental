export type PropertyService =
  | 'property'
  | 'hostel'
  | 'shortlet';

export type ListingLifecycleStatus =
  | 'draft'
  | 'published'
  | 'archived';

export type UnitStatus =
  | 'available'
  | 'reserved'
  | 'rented'
  | 'sold'
  | 'maintenance'
  | 'blocked';

export type PricePeriod =
  | 'night'
  | 'week'
  | 'month'
  | 'year'
  | 'one-time';

export type ListingSource =
  | 'living-spring'
  | 'partner';

export type LandSizeUnit =
  | 'sqm'
  | 'plot'
  | 'acre'
  | 'hectare'
  | 'other';

export type PropertyUnit = {
  id: string;

  unitType: string;

  status: UnitStatus;

  price: number;

  pricePeriod:
    PricePeriod;

  nightlyRate:
    number;

  weeklyRate:
    number;

  monthlyRate:
    number;

  annualRate:
    number;

  cautionDeposit:
    number;

  cleaningFee:
    number;

  bedrooms:
    number;

  bathrooms:
    number;

  toilets:
    number;

  maxGuests:
    number;

  furnished:
    boolean;

  description:
    string;

  amenities:
    string[];

  media:
    string[];

  inspectionNotes:
    string;

  /*
   * V2 additions.
   *
   * Optional so existing Admin
   * code and old Firestore
   * records remain compatible.
   */
  quantity?:
    number;

  availableQuantity?:
    number;
};

export type PropertyRecord = {
  id: string;

  serviceType:
    PropertyService;

  lifecycleStatus:
    ListingLifecycleStatus;

  listingSource:
    ListingSource;

  title: string;

  category: string;

  listingPurpose:
    string;

  structureType:
    | 'single-unit'
    | 'multi-unit';

  propertyType:
    string;

  /*
   * Legacy location fields.
   * Keep these for existing
   * records and backwards
   * compatibility.
   */
  locationSlug:
    string;

  location:
    string;

  address:
    string;

  /*
   * V2 structured location.
   */
  country:
    string;

  state:
    string;

  city:
    string;

  area:
    string;

  showFullAddress:
    boolean;

  description:
    string;

  media:
    string[];

  coverImage:
    string;

  amenities:
    string[];

  featured:
    boolean;

  furnished:
    boolean;

  /*
   * Land-specific V2 fields.
   */
  landSize:
    number;

  landSizeUnit:
    LandSizeUnit;

  titleDocument:
    string;

  mapEmbedUrl:
    string;

  latitude:
    | number
    | null;

  longitude:
    | number
    | null;

  nearbyLandmarks:
    string[];

  checkInTime:
    string;

  checkOutTime:
    string;

  minStayNights:
    number;

  maxGuests:
    number;

  units:
    PropertyUnit[];

  createdAt?:
    unknown;

  updatedAt?:
    unknown;

  /*
   * Advertising lifecycle metadata.
   * Optional so old Living Spring
   * records remain compatible.
   */
  publishedAt?:
    unknown;

  expiresAt?:
    unknown;

  renewedAt?:
    unknown;

  renewalCount?:
    number;

  advertisingDurationDays?:
    number;

  sourceApplicationReference?:
    string;

  /* Set by the scheduled expiry job (not by a manual archive). */
  archivedReason?:
    string;
};

/* =========================================
   NORMALISATION HELPERS
========================================= */

function asString(
  value: unknown
) {
  return typeof value ===
    'string'
    ? value
    : '';
}

function asNumber(
  value: unknown
) {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
}

function asBoolean(
  value: unknown
) {
  return value ===
    true;
}

function asStringArray(
  value: unknown
) {
  if (
    !Array.isArray(
      value
    )
  ) {
    return [];
  }

  return value
    .filter(
      (
        item
      ):
        item is string =>
          typeof item ===
          'string'
    )
    .map(
      (
        item
      ) =>
        item.trim()
    )
    .filter(
      Boolean
    );
}

function normalizeService(
  value: unknown
):
  PropertyService {
  if (
    value ===
      'property' ||
    value ===
      'hostel' ||
    value ===
      'shortlet'
  ) {
    return value;
  }

  return 'property';
}

function normalizeLifecycle(
  value: unknown
):
  ListingLifecycleStatus {
  if (
    value ===
      'draft' ||
    value ===
      'published' ||
    value ===
      'archived'
  ) {
    return value;
  }

  /*
   * Old Living Spring
   * records existed before
   * lifecycleStatus.
   */
  return 'published';
}

function normalizeUnitStatus(
  value: unknown
):
  UnitStatus {
  if (
    value ===
      'available' ||
    value ===
      'reserved' ||
    value ===
      'rented' ||
    value ===
      'sold' ||
    value ===
      'maintenance' ||
    value ===
      'blocked'
  ) {
    return value;
  }

  return 'available';
}

function normalizePricePeriod(
  value: unknown
):
  PricePeriod {
  const period =
    asString(
      value
    ).toLowerCase();

  if (
    period ===
      'night' ||
    period ===
      'nightly'
  ) {
    return 'night';
  }

  if (
    period ===
      'week' ||
    period ===
      'weekly'
  ) {
    return 'week';
  }

  if (
    period ===
      'month' ||
    period ===
      'monthly'
  ) {
    return 'month';
  }

  if (
    period ===
      'year' ||
    period ===
      'yearly' ||
    period ===
      'annual' ||
    period ===
      'annually'
  ) {
    return 'year';
  }

  if (
    period ===
      'one-time' ||
    period ===
      'one time'
  ) {
    return 'one-time';
  }

  return 'year';
}

function normalizeListingSource(
  value: unknown
):
  ListingSource {
  if (
    value ===
    'partner'
  ) {
    return 'partner';
  }

  return 'living-spring';
}

function normalizeLandSizeUnit(
  value: unknown
):
  LandSizeUnit {
  if (
    value === 'plot' ||
    value === 'acre' ||
    value ===
      'hectare' ||
    value === 'other'
  ) {
    return value;
  }

  return 'sqm';
}

/* =========================================
   UNIT NORMALISATION
========================================= */

export function normalizeUnit(
  raw:
    Record<
      string,
      unknown
    >,

  index = 0
):
  PropertyUnit {
  const status =
    normalizeUnitStatus(
      raw.status
    );

  const rawQuantity =
    asNumber(
      raw.quantity
    );

  const quantity =
    rawQuantity > 0
      ? Math.floor(
          rawQuantity
        )
      : 1;

  const hasAvailableQuantity =
    raw.availableQuantity !==
      undefined &&
    raw.availableQuantity !==
      null &&
    raw.availableQuantity !==
      '';

  const availableQuantity =
    hasAvailableQuantity
      ? Math.max(
          0,
          Math.floor(
            asNumber(
              raw.availableQuantity
            )
          )
        )
      : status ===
          'available'
        ? quantity
        : 0;

  return {
    id:
      asString(
        raw.id
      ) ||
      `unit-${index + 1}`,

    unitType:
      asString(
        raw.unitType
      ),

    status,

    price:
      asNumber(
        raw.price
      ),

    pricePeriod:
      normalizePricePeriod(
        raw.pricePeriod
      ),

    nightlyRate:
      asNumber(
        raw.nightlyRate
      ),

    weeklyRate:
      asNumber(
        raw.weeklyRate
      ),

    monthlyRate:
      asNumber(
        raw.monthlyRate
      ),

    annualRate:
      asNumber(
        raw.annualRate
      ),

    cautionDeposit:
      asNumber(
        raw.cautionDeposit
      ),

    cleaningFee:
      asNumber(
        raw.cleaningFee
      ),

    bedrooms:
      asNumber(
        raw.bedrooms
      ),

    bathrooms:
      asNumber(
        raw.bathrooms
      ),

    toilets:
      asNumber(
        raw.toilets
      ),

    maxGuests:
      asNumber(
        raw.maxGuests
      ),

    furnished:
      asBoolean(
        raw.furnished
      ),

    description:
      asString(
        raw.description
      ),

    amenities:
      asStringArray(
        raw.amenities
      ),

    media:
      asStringArray(
        raw.media
      ),

    inspectionNotes:
      asString(
        raw.inspectionNotes
      ) ||
      asString(
        raw.inspectionInfo
      ),

    quantity,

    availableQuantity:
      Math.min(
        availableQuantity,
        quantity
      ),
  };
}

/* =========================================
   PROPERTY NORMALISATION
========================================= */

export function normalizeProperty(
  id: string,

  raw:
    Record<
      string,
      unknown
    >
):
  PropertyRecord {
  const rawUnits =
    Array.isArray(
      raw.units
    )
      ? raw.units
      : [];

  const media =
    asStringArray(
      raw.media
    );

  const legacyLandmarks =
    asStringArray(
      raw.landmarks
    );

  const currentLandmarks =
    asStringArray(
      raw.nearbyLandmarks
    );

  return {
    id,

    serviceType:
      normalizeService(
        raw.serviceType
      ),

    lifecycleStatus:
      normalizeLifecycle(
        raw.lifecycleStatus
      ),

    listingSource:
      normalizeListingSource(
        raw.listingSource
      ),

    title:
      asString(
        raw.title
      ),

    category:
      asString(
        raw.category
      ) ||
      'Residential',

    listingPurpose:
      asString(
        raw.listingPurpose
      ) ||
      'Rent',

    structureType:
      raw.structureType ===
        'multi-unit'
        ? 'multi-unit'
        : 'single-unit',

    propertyType:
      asString(
        raw.propertyType
      ),

    locationSlug:
      asString(
        raw.locationSlug
      ),

    location:
      asString(
        raw.location
      ),

    address:
      asString(
        raw.address
      ),

    country:
      asString(
        raw.country
      ) ||
      'Nigeria',

    state:
      asString(
        raw.state
      ),

    city:
      asString(
        raw.city
      ),

    area:
      asString(
        raw.area
      ),

    showFullAddress:
      asBoolean(
        raw.showFullAddress
      ),

    description:
      asString(
        raw.description
      ),

    media,

    coverImage:
      asString(
        raw.coverImage
      ) ||
      media[0] ||
      '',

    amenities:
      asStringArray(
        raw.amenities
      ),

    featured:
      asBoolean(
        raw.featured
      ),

    furnished:
      asBoolean(
        raw.furnished
      ),

    landSize:
      asNumber(
        raw.landSize
      ),

    landSizeUnit:
      normalizeLandSizeUnit(
        raw.landSizeUnit
      ),

    titleDocument:
      asString(
        raw.titleDocument
      ) ||
      asString(
        raw.landTitle
      ),

    mapEmbedUrl:
      asString(
        raw.mapEmbedUrl
      ) ||
      asString(
        raw.googleMapsEmbedUrl
      ) ||
      asString(
        raw.googleMapEmbedUrl
      ) ||
      asString(
        raw.googleMapUrl
      ) ||
      asString(
        raw.mapUrl
      ) ||
      asString(
        raw.mapLink
      ),

    latitude:
      raw.latitude ===
        null ||
      raw.latitude ===
        undefined ||
      raw.latitude ===
        ''
        ? null
        : asNumber(
            raw.latitude
          ),

    longitude:
      raw.longitude ===
        null ||
      raw.longitude ===
        undefined ||
      raw.longitude ===
        ''
        ? null
        : asNumber(
            raw.longitude
          ),

    nearbyLandmarks:
      currentLandmarks
        .length
        ? currentLandmarks
        : legacyLandmarks,

    checkInTime:
      asString(
        raw.checkInTime
      ),

    checkOutTime:
      asString(
        raw.checkOutTime
      ),

    minStayNights:
      asNumber(
        raw.minStayNights
      ),

    maxGuests:
      asNumber(
        raw.maxGuests
      ),

    units:
      rawUnits.map(
        (
          unit,
          index
        ) =>
          normalizeUnit(
            (
              unit &&
              typeof unit ===
                'object'
                ? unit
                : {}
            ) as Record<
              string,
              unknown
            >,

            index
          )
      ),

    createdAt:
      raw.createdAt,

    updatedAt:
      raw.updatedAt,

    publishedAt:
      raw.publishedAt,

    expiresAt:
      raw.expiresAt,

    renewedAt:
      raw.renewedAt,

    renewalCount:
      asNumber(
        raw.renewalCount
      ),

    advertisingDurationDays:
      asNumber(
        raw.advertisingDurationDays
      ),

    sourceApplicationReference:
      asString(
        raw.sourceApplicationReference
      ),

    archivedReason:
      asString(
        raw.archivedReason
      ),
  };
}

/* =========================================
   ADVERTISING / EXPIRY
========================================= */

export type EffectiveListingStatus =
  | 'draft'
  | 'live'
  | 'expiring'
  | 'expired'
  | 'archived';

export function propertyDateFromUnknown(
  value:
    unknown
):
Date | null {
  if (
    !value
  ) {
    return null;
  }

  if (
    value instanceof
    Date
  ) {
    return Number.isNaN(
      value.getTime()
    )
      ? null
      : value;
  }

  if (
    typeof value ===
      'string' ||
    typeof value ===
      'number'
  ) {
    const parsed =
      new Date(
        value
      );

    return Number.isNaN(
      parsed.getTime()
    )
      ? null
      : parsed;
  }

  if (
    typeof value ===
      'object' &&
    value !==
      null
  ) {
    const timestamp =
      value as {
        toDate?:
          () => Date;

        seconds?:
          number;

        _seconds?:
          number;
      };

    if (
      typeof timestamp
        .toDate ===
      'function'
    ) {
      try {
        const parsed =
          timestamp.toDate();

        return Number.isNaN(
          parsed.getTime()
        )
          ? null
          : parsed;
      } catch {
        return null;
      }
    }

    const seconds =
      typeof timestamp
        .seconds ===
      'number'
        ? timestamp.seconds
        : typeof timestamp
              ._seconds ===
            'number'
          ? timestamp
              ._seconds
          : null;

    if (
      seconds !==
      null
    ) {
      return new Date(
        seconds *
        1000
      );
    }
  }

  return null;
}

export function getPropertyPublishedAt(
  property:
    Pick<
      PropertyRecord,
      'publishedAt'
    >
) {
  return propertyDateFromUnknown(
    property.publishedAt
  );
}

export function getPropertyExpiresAt(
  property:
    Pick<
      PropertyRecord,
      'expiresAt'
    >
) {
  return propertyDateFromUnknown(
    property.expiresAt
  );
}

export function isTimedPartnerListing(
  property:
    Pick<
      PropertyRecord,
      | 'listingSource'
      | 'expiresAt'
    >
) {
  return (
    property.listingSource ===
      'partner' &&
    Boolean(
      getPropertyExpiresAt(
        property
      )
    )
  );
}

export function getDaysRemaining(
  property:
    Pick<
      PropertyRecord,
      'expiresAt'
    >,

  now =
    new Date()
): number | null {
  const expiresAt =
    getPropertyExpiresAt(
      property
    );

  if (
    !expiresAt
  ) {
    return null;
  }

  const difference =
    expiresAt.getTime() -
    now.getTime();

  if (
    difference <=
    0
  ) {
    return 0;
  }

  return Math.ceil(
    difference /
    (
      24 *
      60 *
      60 *
      1000
    )
  );
}

export function isPropertyExpired(
  property:
    Pick<
      PropertyRecord,
      | 'lifecycleStatus'
      | 'listingSource'
      | 'expiresAt'
    >,

  now =
    new Date()
) {
  if (
    property.lifecycleStatus !==
    'published'
  ) {
    return false;
  }

  if (
    property.listingSource !==
    'partner'
  ) {
    return false;
  }

  const expiresAt =
    getPropertyExpiresAt(
      property
    );

  if (
    !expiresAt
  ) {
    /*
     * Legacy partner listings
     * created before timed adverts
     * remain visible until Admin
     * explicitly changes them.
     */
    return false;
  }

  return (
    expiresAt.getTime() <=
    now.getTime()
  );
}

export function getEffectiveListingStatus(
  property:
    Pick<
      PropertyRecord,
      | 'lifecycleStatus'
      | 'listingSource'
      | 'expiresAt'
      | 'archivedReason'
    >,

  now =
    new Date()
):
EffectiveListingStatus {
  if (
    property.lifecycleStatus ===
    'archived'
  ) {
    /*
     * Automatic expiry archives the listing in Firestore so
     * public reads are denied, but Admin must still show EXPIRED
     * and keep the renewal-payment action available.
     */
    if (
      property.listingSource === 'partner' &&
      property.archivedReason === 'expired' &&
      (getPropertyExpiresAt(property)?.getTime() ?? Infinity) <=
        now.getTime()
    ) {
      return 'expired';
    }

    return 'archived';
  }

  if (
    property.lifecycleStatus ===
    'draft'
  ) {
    return 'draft';
  }

  if (
    isPropertyExpired(
      property,
      now
    )
  ) {
    return 'expired';
  }

  if (
    property.listingSource ===
    'partner'
  ) {
    const daysRemaining =
      getDaysRemaining(
        property,
        now
      );

    if (
      daysRemaining !==
        null &&
      daysRemaining <=
        7
    ) {
      return 'expiring';
    }
  }

  return 'live';
}

export function formatEffectiveListingStatus(
  status:
    EffectiveListingStatus
) {
  if (
    status ===
    'live'
  ) {
    return 'Live';
  }

  if (
    status ===
    'expiring'
  ) {
    return 'Expiring Soon';
  }

  if (
    status ===
    'expired'
  ) {
    return 'Expired';
  }

  if (
    status ===
    'archived'
  ) {
    return 'Archived';
  }

  return 'Draft';
}

/* =========================================
   PUBLIC VISIBILITY
========================================= */

export function isPublicProperty(
  property:
    Pick<
      PropertyRecord,
      | 'lifecycleStatus'
      | 'listingSource'
      | 'expiresAt'
    >
) {
  if (
    property.lifecycleStatus !==
    'published'
  ) {
    return false;
  }

  return !isPropertyExpired(
    property
  );
}

/* =========================================
   SERVICE HELPERS
========================================= */

export function formatPropertyService(
  service:
    PropertyService
) {
  if (
    service ===
    'shortlet'
  ) {
    return 'Short-Let';
  }

  if (
    service ===
    'hostel'
  ) {
    return 'Hostel';
  }

  return 'Property';
}

export function formatLifecycleStatus(
  status:
    ListingLifecycleStatus
) {
  if (
    status ===
    'published'
  ) {
    return 'Published';
  }

  if (
    status ===
    'archived'
  ) {
    return 'Archived';
  }

  return 'Draft';
}

export function formatListingSource(
  source:
    ListingSource
) {
  return source ===
    'partner'
    ? 'Partner Listing'
    : 'Living Spring Direct';
}

/* =========================================
   LOCATION
========================================= */

export function getPublicLocation(
  property:
    Pick<
      PropertyRecord,
      | 'location'
      | 'address'
      | 'state'
      | 'city'
      | 'area'
      | 'country'
      | 'showFullAddress'
    >
) {
  if (
    property.showFullAddress &&
    property.address.trim()
  ) {
    return property.address
      .trim();
  }

  const structured =
    [
      property.area,
      property.city,
      property.state,
    ]
      .map(
        (
          item
        ) =>
          item.trim()
      )
      .filter(
        Boolean
      )
      .filter(
        (
          item,
          index,
          list
        ) =>
          list.indexOf(
            item
          ) ===
          index
      );

  if (
    structured.length
  ) {
    return structured.join(
      ', '
    );
  }

  if (
    property.location.trim()
  ) {
    return property.location
      .trim();
  }

  return property.country ||
    'Nigeria';
}

/* =========================================
   LAND
========================================= */

export function isLandProperty(
  property:
    Pick<
      PropertyRecord,
      | 'serviceType'
      | 'category'
      | 'propertyType'
    >
) {
  if (
    property.serviceType !==
    'property'
  ) {
    return false;
  }

  const text =
    `${property.category} ${property.propertyType}`
      .toLowerCase();

  return text.includes(
    'land'
  );
}

export function formatLandSize(
  value: number,
  unit:
    LandSizeUnit
) {
  if (
    !value ||
    value <= 0
  ) {
    return '';
  }

  const formatted =
    new Intl.NumberFormat(
      'en-NG',
      {
        maximumFractionDigits:
          2,
      }
    ).format(
      value
    );

  if (
    unit === 'sqm'
  ) {
    return `${formatted} sqm`;
  }

  const singular =
    value === 1;

  if (
    unit === 'plot'
  ) {
    return `${formatted} ${
      singular
        ? 'plot'
        : 'plots'
    }`;
  }

  if (
    unit === 'acre'
  ) {
    return `${formatted} ${
      singular
        ? 'acre'
        : 'acres'
    }`;
  }

  if (
    unit ===
    'hectare'
  ) {
    return `${formatted} ${
      singular
        ? 'hectare'
        : 'hectares'
    }`;
  }

  return formatted;
}

/* =========================================
   AVAILABILITY
========================================= */

export function getAvailableQuantity(
  unit:
    PropertyUnit
) {
  if (
    typeof unit
      .availableQuantity ===
      'number'
  ) {
    return Math.max(
      0,
      unit.availableQuantity
    );
  }

  if (
    unit.status !==
    'available'
  ) {
    return 0;
  }

  if (
    typeof unit.quantity ===
      'number' &&
    unit.quantity > 0
  ) {
    return unit.quantity;
  }

  return 1;
}

export function getTotalAvailableUnits(
  property:
    Pick<
      PropertyRecord,
      'units'
    >
) {
  return property.units.reduce(
    (
      total,
      unit
    ) =>
      total +
      getAvailableQuantity(
        unit
      ),

    0
  );
}

/* =========================================
   PRICING
========================================= */

export type DisplayPrice = {
  amount:
    number;

  period:
    PricePeriod;

  unitId:
    string;

  unitType:
    string;
};

export function getUnitDisplayPrice(
  unit:
    PropertyUnit,

  service:
    PropertyService
):
  DisplayPrice | null {
  if (
    service ===
    'shortlet'
  ) {
    if (
      unit.nightlyRate >
      0
    ) {
      return {
        amount:
          unit.nightlyRate,

        period:
          'night',

        unitId:
          unit.id,

        unitType:
          unit.unitType,
      };
    }

    if (
      unit.price > 0 &&
      unit.pricePeriod ===
        'night'
    ) {
      return {
        amount:
          unit.price,

        period:
          'night',

        unitId:
          unit.id,

        unitType:
          unit.unitType,
      };
    }

    if (
      unit.weeklyRate >
      0
    ) {
      return {
        amount:
          unit.weeklyRate,

        period:
          'week',

        unitId:
          unit.id,

        unitType:
          unit.unitType,
      };
    }

    if (
      unit.monthlyRate >
      0
    ) {
      return {
        amount:
          unit.monthlyRate,

        period:
          'month',

        unitId:
          unit.id,

        unitType:
          unit.unitType,
      };
    }
  }

  if (
    service ===
    'hostel'
  ) {
    if (
      unit.annualRate >
      0
    ) {
      return {
        amount:
          unit.annualRate,

        period:
          'year',

        unitId:
          unit.id,

        unitType:
          unit.unitType,
      };
    }

    if (
      unit.price > 0
    ) {
      return {
        amount:
          unit.price,

        period:
          unit.pricePeriod,

        unitId:
          unit.id,

        unitType:
          unit.unitType,
      };
    }

    if (
      unit.monthlyRate >
      0
    ) {
      return {
        amount:
          unit.monthlyRate,

        period:
          'month',

        unitId:
          unit.id,

        unitType:
          unit.unitType,
      };
    }
  }

  if (
    unit.price > 0
  ) {
    return {
      amount:
        unit.price,

      period:
        unit.pricePeriod,

      unitId:
        unit.id,

      unitType:
        unit.unitType,
    };
  }

  if (
    unit.annualRate >
    0
  ) {
    return {
      amount:
        unit.annualRate,

      period:
        'year',

      unitId:
        unit.id,

      unitType:
        unit.unitType,
    };
  }

  if (
    unit.monthlyRate >
    0
  ) {
    return {
      amount:
        unit.monthlyRate,

      period:
        'month',

      unitId:
        unit.id,

      unitType:
        unit.unitType,
    };
  }

  return null;
}

export function getStartingPrice(
  property:
    Pick<
      PropertyRecord,
      | 'serviceType'
      | 'units'
    >
):
  DisplayPrice | null {
  const availableUnits =
    property.units.filter(
      (
        unit
      ) =>
        getAvailableQuantity(
          unit
        ) > 0
    );

  const unitsToCheck =
    availableUnits.length
      ? availableUnits
      : property.units;

  const prices =
    unitsToCheck
      .map(
        (
          unit
        ) =>
          getUnitDisplayPrice(
            unit,
            property.serviceType
          )
      )
      .filter(
        (
          price
        ):
          price is DisplayPrice =>
            price !==
            null
      );

  if (
    !prices.length
  ) {
    return null;
  }

  return prices.reduce(
    (
      lowest,
      current
    ) =>
      current.amount <
      lowest.amount
        ? current
        : lowest
  );
}

export function formatMoney(
  value: number
) {
  if (
    !value ||
    value <= 0
  ) {
    return 'Price on request';
  }

  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',

      currency:
        'NGN',

      maximumFractionDigits:
        0,
    }
  ).format(
    value
  );
}

export function formatPrice(
  value: number,

  period:
    PricePeriod
) {
  if (
    !value ||
    value <= 0
  ) {
    return 'Price on request';
  }

  const amount =
    formatMoney(
      value
    );

  if (
    period ===
    'one-time'
  ) {
    return amount;
  }

  return `${amount}/${period}`;
}