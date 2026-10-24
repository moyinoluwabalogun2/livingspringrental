import {
  createEmptyMediaCollection,
  type MediaAsset,
  type MediaCollection,
} from '@/lib/media';

export type ApplicationListingType =
  | ''
  | 'property'
  | 'hostel'
  | 'shortlet';

export type PropertyApplicationSubtype =
  | ''
  | 'land'
  | 'residential'
  | 'commercial';

export type ApplicantRole =
  | ''
  | 'owner'
  | 'agent'
  | 'representative';

export type ApplicationListingPurpose =
  | 'rent'
  | 'sale'
  | 'lease';

export type ApplicationLandSizeUnit =
  | 'sqm'
  | 'plot'
  | 'acre'
  | 'hectare'
  | 'other';

export type ApplicationPricePeriod =
  | 'year'
  | 'month'
  | 'week'
  | 'night'
  | 'one-time';

export type ApplicationPackageId =
  | 'standard';

export interface ListingApplicationLocation {
  country: 'Nigeria';

  state: string;

  city: string;

  area: string;

  address: string;

  landmark: string;
}

export interface ListingApplicationApplicant {
  name: string;

  phone: string;

  whatsapp: string;

  email: string;

  role: ApplicantRole;

  company: string;

  /**
   * Honeypot field.
   * Real users should never fill this.
   */
  website: string;
}

/**
 * Temporary legacy media fields.
 *
 * These remain during the Cloudinary
 * migration so the existing form stays
 * compatible while B2 is being wired.
 *
 * They will be removed after the new
 * uploader is fully connected.
 */
export interface LegacyApplicationMedia {
  photoLinks: string[];

  videoUrl: string;
}

/**
 * A separately priced / rentable /
 * bookable option inside a listing.
 *
 * This is intentionally NOT limited
 * to "hostel rooms".
 *
 * Examples:
 * - Single Room
 * - Self Contain
 * - Self Contain with Balcony
 * - Room & Parlour
 * - Mini Flat
 * - 2 Bedroom
 * - 3 Bedroom
 * - Shop
 * - Office Suite
 * - Furnished Apartment
 * - Any custom unit
 */
export interface ApplicationUnitVariant {
  id: string;

  name: string;

  description: string;

  quantity: number;

  availableQuantity: number;

  /**
   * Main rental / sale price.
   *
   * For ordinary hostel and rental
   * units this is normally enough.
   */
  price: number;

  pricePeriod: ApplicationPricePeriod;

  bedrooms: number;

  bathrooms: number;

  toilets: number;

  furnished: boolean;

  /**
   * Flexible feature list.
   *
   * Nothing here is hard-coded around
   * POP or any particular feature.
   *
   * Examples:
   * - POP ceiling
   * - Balcony
   * - Wardrobe
   * - Ensuite
   * - Private kitchen
   * - Prepaid meter
   * - Air conditioning
   * - Water heater
   * - Ground floor
   * - Private entrance
   * - Parking
   */
  features: string[];

  /**
   * Used where this unit is a short-let.
   */
  nightlyPrice: number;

  weeklyPrice: number;

  monthlyPrice: number;

  maxGuests: number;

  minimumStay: number;

  /**
   * Cloudinary media belonging only
   * to this unit variant.
   */
  media: MediaCollection;
}

/**
 * Kept as an alias while the current
 * List With Us page is migrated from
 * "hostelRoomTypes" to the generic
 * unit variant system.
 */
export type ApplicationRoomType =
  ApplicationUnitVariant;

export interface ListingApplicationDraft {
  /**
   * Keep version 1 during B2 migration
   * so existing locally saved drafts
   * can still be restored by the
   * current page.
   */
  version: 1;

  /**
   * Stable ID created when the person
   * begins the application.
   *
   * Cloudinary folders use this ID
   * before an LS reference exists.
   */
  startedAt: string;

  uploadDraftId: string;

  listingType:
    ApplicationListingType;

  propertySubtype:
    PropertyApplicationSubtype;

  title: string;

  propertyType: string;

  description: string;

  listingPurpose:
    ApplicationListingPurpose;

  askingPrice: number;

  propertyBedrooms: number;

  propertyBathrooms: number;

  landSize: number;

  landSizeUnit:
    ApplicationLandSizeUnit;

  titleDocument: string;

  location:
    ListingApplicationLocation;

  /**
   * New generic multi-unit switch.
   *
   * Hostel listings will normally
   * use this automatically.
   *
   * Property and short-let listings
   * can also use it when the building
   * contains separately priced units.
   */
  hasMultipleUnits: boolean;

  /**
   * New generic unit model.
   *
   * This will replace the hostel-only
   * room array in the next B2 step.
   */
  unitVariants:
    ApplicationUnitVariant[];

  /**
   * Legacy hostel field retained only
   * while we migrate the current page.
   */
  hostelRoomTypes:
    ApplicationRoomType[];

  shortletBedrooms: number;

  shortletBathrooms: number;

  shortletMaxGuests: number;

  shortletMinimumStay: number;

  shortletFurnished: boolean;

  shortletNightlyPrice: number;

  shortletWeeklyPrice: number;

  shortletMonthlyPrice: number;

  shortletAmenities: string[];

  /**
   * General features applying to the
   * whole listing/building/property.
   */
  features: string[];

  /**
   * NEW Cloudinary media belonging
   * to the overall listing/building.
   */
  generalMedia:
    MediaCollection;

  /**
   * Legacy link-based media.
   * Removed after Cloudinary UI is
   * connected.
   */
  media:
    LegacyApplicationMedia;

  applicant:
    ListingApplicationApplicant;

  packageId:
    ApplicationPackageId;

  termsAccepted: boolean;

  /**
   * Second honeypot field.
   */
  website: string;
}

export interface ListingApplicationLocalState {
  step: number;

  draft:
    ListingApplicationDraft;
}

export const
  LISTING_APPLICATION_MAX_STEP =
    7;

export const
  LISTING_APPLICATION_STORAGE_KEY =
    'living-spring:list-with-us:v1';

export const STANDARD_LISTING_PACKAGE = {
  id: 'standard' as const,

  name: 'Standard Listing',

  priceNaira: 20_000,

  durationDays: 30,

  description:
    'A reviewed Living Spring listing published for 30 days after verified payment.',
};

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Federal Capital Territory',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

function createLocalId(
  prefix: string
) {
  if (
    typeof crypto !==
      'undefined' &&
    typeof crypto.randomUUID ===
      'function'
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

export function
createApplicationUnitVariant():
  ApplicationUnitVariant {
  return {
    id:
      createLocalId(
        'unit'
      ),

    name: '',

    description: '',

    quantity: 1,

    availableQuantity: 1,

    price: 0,

    pricePeriod: 'year',

    bedrooms: 0,

    bathrooms: 0,

    toilets: 0,

    furnished: false,

    features: [''],

    nightlyPrice: 0,

    weeklyPrice: 0,

    monthlyPrice: 0,

    maxGuests: 1,

    minimumStay: 1,

    media:
      createEmptyMediaCollection(),
  };
}

/**
 * Backward-compatible helper used by
 * the existing hostel form.
 */
export function
createApplicationRoom():
  ApplicationRoomType {
  return createApplicationUnitVariant();
}

export function
createListingApplicationDraft():
  ListingApplicationDraft {
  const startedAt =
    new Date().toISOString();

  return {
    version: 1,

    startedAt,

    uploadDraftId:
  createLocalId('draft'),


    listingType: '',

    propertySubtype: '',

    title: '',

    propertyType: '',

    description: '',

    listingPurpose: 'rent',

    askingPrice: 0,

    propertyBedrooms: 0,

    propertyBathrooms: 0,

    landSize: 0,

    landSizeUnit: 'sqm',

    titleDocument: '',

    location: {
      country: 'Nigeria',

      state: '',

      city: '',

      area: '',

      address: '',

      landmark: '',
    },

    hasMultipleUnits: false,

    unitVariants: [],

    hostelRoomTypes: [
      createApplicationRoom(),
    ],

    shortletBedrooms: 1,

    shortletBathrooms: 1,

    shortletMaxGuests: 2,

    shortletMinimumStay: 1,

    shortletFurnished: true,

    shortletNightlyPrice: 0,

    shortletWeeklyPrice: 0,

    shortletMonthlyPrice: 0,

    shortletAmenities: [''],

    features: [''],

    generalMedia:
      createEmptyMediaCollection(),

    media: {
      photoLinks: [''],

      videoUrl: '',
    },

    applicant: {
      name: '',

      phone: '',

      whatsapp: '',

      email: '',

      role: '',

      company: '',

      website: '',
    },

    packageId: 'standard',

    termsAccepted: false,

    website: '',
  };
}

function cleanText(
  value: unknown
) {
  return typeof value ===
    'string'
    ? value.trim()
    : '';
}

function cleanStringArray(
  values: unknown
) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map(cleanText)
    .filter(Boolean);
}

function cleanNumber(
  value: unknown,
  minimum = 0
) {
  const numeric =
    Number(value);

  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return minimum;
  }

  return Math.max(
    minimum,
    numeric
  );
}

function cleanMediaAsset(
  asset: MediaAsset
): MediaAsset | null {
  if (
    !asset ||
    typeof asset !==
      'object'
  ) {
    return null;
  }

  const assetId =
    cleanText(
      asset.assetId
    );

  const publicId =
    cleanText(
      asset.publicId
    );

  const secureUrl =
    cleanText(
      asset.secureUrl
    );

  if (
    !assetId ||
    !publicId ||
    !secureUrl
  ) {
    return null;
  }

  if (
    asset.resourceType !==
      'image' &&
    asset.resourceType !==
      'video'
  ) {
    return null;
  }

  return {
    assetId,

    publicId,

    secureUrl,

    resourceType:
      asset.resourceType,

    format:
      cleanText(
        asset.format
      ) || undefined,

    bytes:
      typeof asset.bytes ===
        'number'
        ? asset.bytes
        : undefined,

    width:
      typeof asset.width ===
        'number'
        ? asset.width
        : undefined,

    height:
      typeof asset.height ===
        'number'
        ? asset.height
        : undefined,

    duration:
      typeof asset.duration ===
        'number'
        ? asset.duration
        : undefined,

    originalFilename:
      cleanText(
        asset.originalFilename
      ) || undefined,

    createdAt:
      cleanText(
        asset.createdAt
      ) || undefined,
  };
}

function cleanMediaCollection(
  collection:
    MediaCollection | undefined
): MediaCollection {
  const images =
    Array.isArray(
      collection?.images
    )
      ? collection.images
          .map(
            cleanMediaAsset
          )
          .filter(
            (
              asset
            ): asset is MediaAsset =>
              Boolean(
                asset &&
                  asset.resourceType ===
                    'image'
              )
          )
      : [];

  const videos =
    Array.isArray(
      collection?.videos
    )
      ? collection.videos
          .map(
            cleanMediaAsset
          )
          .filter(
            (
              asset
            ): asset is MediaAsset =>
              Boolean(
                asset &&
                  asset.resourceType ===
                    'video'
              )
          )
      : [];

  return {
    images,

    videos,
  };
}

function cleanUnitVariant(
  unit:
    ApplicationUnitVariant
): ApplicationUnitVariant {
  const quantity =
    Math.max(
      1,
      cleanNumber(
        unit.quantity,
        1
      )
    );

  const availableQuantity =
    Math.min(
      quantity,
      cleanNumber(
        unit.availableQuantity
      )
    );

  return {
    id:
      cleanText(
        unit.id
      ) ||
      createLocalId(
        'unit'
      ),

    name:
      cleanText(
        unit.name
      ),

    description:
      cleanText(
        unit.description
      ),

    quantity,

    availableQuantity,

    price:
      cleanNumber(
        unit.price
      ),

    pricePeriod:
      unit.pricePeriod ||
      'year',

    bedrooms:
      cleanNumber(
        unit.bedrooms
      ),

    bathrooms:
      cleanNumber(
        unit.bathrooms
      ),

    toilets:
      cleanNumber(
        unit.toilets
      ),

    furnished:
      Boolean(
        unit.furnished
      ),

    features:
      cleanStringArray(
        unit.features
      ),

    nightlyPrice:
      cleanNumber(
        unit.nightlyPrice
      ),

    weeklyPrice:
      cleanNumber(
        unit.weeklyPrice
      ),

    monthlyPrice:
      cleanNumber(
        unit.monthlyPrice
      ),

    maxGuests:
      Math.max(
        1,
        cleanNumber(
          unit.maxGuests,
          1
        )
      ),

    minimumStay:
      Math.max(
        1,
        cleanNumber(
          unit.minimumStay,
          1
        )
      ),

    media:
      cleanMediaCollection(
        unit.media
      ),
  };
}

export function
cleanApplicationDraft(

  draft:
    ListingApplicationDraft
): ListingApplicationDraft {
  return {
    ...draft,

    version: 1,

    startedAt:
    
      cleanText(
        draft.startedAt
      ) ||
      new Date()
        .toISOString(),
        
        uploadDraftId:
  cleanText(
    draft.uploadDraftId
  ) ||
  createLocalId(
    'draft'
  ),

    title:
      cleanText(
        draft.title
      ),

    propertyType:
      cleanText(
        draft.propertyType
      ),

    description:
      cleanText(
        draft.description
      ),

    askingPrice:
      cleanNumber(
        draft.askingPrice
      ),

    propertyBedrooms:
      cleanNumber(
        draft.propertyBedrooms
      ),

    propertyBathrooms:
      cleanNumber(
        draft.propertyBathrooms
      ),

    landSize:
      cleanNumber(
        draft.landSize
      ),

    titleDocument:
      cleanText(
        draft.titleDocument
      ),

    location: {
      country:
        'Nigeria',

      state:
        cleanText(
          draft.location
            .state
        ),

      city:
        cleanText(
          draft.location
            .city
        ),

      area:
        cleanText(
          draft.location
            .area
        ),

      address:
        cleanText(
          draft.location
            .address
        ),

      landmark:
        cleanText(
          draft.location
            .landmark
        ),
    },

    hasMultipleUnits:
      Boolean(
        draft.hasMultipleUnits
      ),

    unitVariants:
      Array.isArray(
        draft.unitVariants
      )
        ? draft.unitVariants
            .map(
              cleanUnitVariant
            )
            .filter(
              (unit) =>
                Boolean(
                  unit.name
                )
            )
        : [],

    hostelRoomTypes:
      Array.isArray(
        draft.hostelRoomTypes
      )
        ? draft.hostelRoomTypes
            .map(
              cleanUnitVariant
            )
            .filter(
              (unit) =>
                Boolean(
                  unit.name
                )
            )
        : [],

    shortletBedrooms:
      cleanNumber(
        draft.shortletBedrooms
      ),

    shortletBathrooms:
      cleanNumber(
        draft.shortletBathrooms
      ),

    shortletMaxGuests:
      Math.max(
        1,
        cleanNumber(
          draft.shortletMaxGuests,
          1
        )
      ),

    shortletMinimumStay:
      Math.max(
        1,
        cleanNumber(
          draft.shortletMinimumStay,
          1
        )
      ),

    shortletFurnished:
      Boolean(
        draft.shortletFurnished
      ),

    shortletNightlyPrice:
      cleanNumber(
        draft.shortletNightlyPrice
      ),

    shortletWeeklyPrice:
      cleanNumber(
        draft.shortletWeeklyPrice
      ),

    shortletMonthlyPrice:
      cleanNumber(
        draft.shortletMonthlyPrice
      ),

    shortletAmenities:
      cleanStringArray(
        draft.shortletAmenities
      ),

    features:
      cleanStringArray(
        draft.features
      ),

    generalMedia:
      cleanMediaCollection(
        draft.generalMedia
      ),

    media: {
      photoLinks:
        cleanStringArray(
          draft.media
            ?.photoLinks
        ),

      videoUrl:
        cleanText(
          draft.media
            ?.videoUrl
        ),
    },

    applicant: {
      name:
        cleanText(
          draft.applicant
            .name
        ),

      phone:
        cleanText(
          draft.applicant
            .phone
        ),

      whatsapp:
        cleanText(
          draft.applicant
            .whatsapp
        ),

      email:
        cleanText(
          draft.applicant
            .email
        ).toLowerCase(),

      role:
        draft.applicant
          .role,

      company:
        cleanText(
          draft.applicant
            .company
        ),

      website:
        cleanText(
          draft.applicant
            .website
        ),
    },

    packageId:
      'standard',

    termsAccepted:
      Boolean(
        draft.termsAccepted
      ),

    website:
      cleanText(
        draft.website
      ),
  };
}

export function
formatNaira(
  value: number
) {
  return new Intl
    .NumberFormat(
      'en-NG',
      {
        style:
          'currency',

        currency:
          'NGN',

        maximumFractionDigits:
          0,
      }
    )
    .format(value);
}

export function
formatApplicationListingType(
  value:
    ApplicationListingType
) {
  switch (value) {
    case 'property':
      return 'Property';

    case 'hostel':
      return 'Hostel';

    case 'shortlet':
      return 'Short-Let';

    default:
      return 'Not selected';
  }
}

export function
formatApplicationSubtype(
  value:
    PropertyApplicationSubtype
) {
  switch (value) {
    case 'land':
      return 'Land';

    case 'residential':
      return 'Residential';

    case 'commercial':
      return 'Commercial';

    default:
      return 'Not selected';
  }
}

export function
formatApplicantRole(
  value:
    ApplicantRole
) {
  switch (value) {
    case 'owner':
      return 'Property Owner';

    case 'agent':
      return 'Agent';

    case 'representative':
      return 'Representative';

    default:
      return 'Not selected';
  }
}