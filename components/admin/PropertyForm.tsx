'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRouter,
} from 'next/navigation';

import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import {
  Archive,
  ArrowLeft,
  Banknote,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FileEdit,
  FileText,
  Globe2,
  MapPin,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
} from 'lucide-react';

import {
  db,
} from '@/lib/firebase';

import {
  normalizeProperty,
  type LandSizeUnit,
  type ListingLifecycleStatus,
  type ListingSource,
  type PricePeriod,
  type PropertyService,
  type PropertyUnit,
  type UnitStatus,
} from '@/lib/property';

import {
  createEmptyMediaCollection,
  type MediaAsset,
  type MediaCollection,
} from '@/lib/media';

import AdminPropertyMediaSection
  from '@/components/media/AdminPropertyMediaSection';

import styles
  from './PropertyForm.module.css';

type PropertyFormProps = {
  propertyId?: string;
};

type FormUnit =
  PropertyUnit & {
    mediaAssets:
      MediaCollection;
  };

type FormState = {
  serviceType:
    PropertyService;

  lifecycleStatus:
    ListingLifecycleStatus;

  listingSource:
    ListingSource;

  title:
    string;

  category:
    string;

  listingPurpose:
    string;

  propertyType:
    string;

  locationSlug:
    string;

  location:
    string;

  address:
    string;

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

  generalMedia:
    MediaCollection;

  /*
   * Temporary compatibility field.
   * Existing public pages still read
   * URL arrays while the Cloudinary
   * metadata migration is completed.
   */
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

  landSize:
    number;

  landSizeUnit:
    LandSizeUnit;

  titleDocument:
    string;

  mapEmbedUrl:
    string;

  latitude:
    string;

  longitude:
    string;

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
    FormUnit[];
};

const NIGERIAN_STATES = [
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

const PROPERTY_CATEGORIES = [
  'Residential',
  'Commercial',
  'Land',
] as const;

const LISTING_PURPOSES = [
  'Rent',
  'Sale',
  'Lease',
] as const;

const PROPERTY_TYPE_SUGGESTIONS:
  Record<
    PropertyService,
    string[]
  > = {
  property: [
    'Self Contain',
    'Room & Parlour',
    'Mini Flat',
    '1 Bedroom Flat',
    '2 Bedroom Flat',
    '3 Bedroom Flat',
    '4 Bedroom Flat',
    'Apartment',
    'Apartment Building',
    'Bungalow',
    'Duplex',
    'Detached House',
    'Semi Detached House',
    'Terrace',
    'Maisonette',
    'Shop',
    'Office Space',
    'Warehouse',
    'Commercial Building',
    'Residential Land',
    'Commercial Land',
    'Agricultural Land',
    'Investment Land',
  ],

  hostel: [
    'Hostel',
    'Student Hostel',
    'Private Hostel',
    'Hostel Apartment',
    'Student Residence',
  ],

  shortlet: [
    'Short-Let Apartment',
    'Serviced Apartment',
    'Short-Let House',
    'Studio Short-Let',
    'Short-Let Flat',
    'Serviced Duplex',
  ],
};

const PRICE_PERIODS:
  PricePeriod[] = [
  'night',
  'week',
  'month',
  'year',
  'one-time',
];

const UNIT_STATUSES:
  UnitStatus[] = [
  'available',
  'reserved',
  'rented',
  'sold',
  'maintenance',
  'blocked',
];

const LAND_SIZE_UNITS:
  Array<{
    value:
      LandSizeUnit;

    label:
      string;
  }> = [
  {
    value:
      'sqm',

    label:
      'Square metres (sqm)',
  },

  {
    value:
      'plot',

    label:
      'Plot(s)',
  },

  {
    value:
      'acre',

    label:
      'Acre(s)',
  },

  {
    value:
      'hectare',

    label:
      'Hectare(s)',
  },

  {
    value:
      'other',

    label:
      'Other / custom',
  },
];

function createId() {
  if (
    typeof crypto !==
      'undefined' &&
    'randomUUID' in
      crypto
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()
    .toString(16)
    .slice(2)}`;
}

function defaultPeriod(
  service:
    PropertyService
):
  PricePeriod {
  if (
    service ===
    'shortlet'
  ) {
    return 'night';
  }

  return 'year';
}

function createUnit(
  service:
    PropertyService,

  id?: string
):
  FormUnit {
  return {
    id:
      id ||
      createId(),

    unitType:
      service ===
      'hostel'
        ? 'Single Room'
        : '',

    status:
      'available',

    price:
      0,

    pricePeriod:
      defaultPeriod(
        service
      ),

    nightlyRate:
      0,

    weeklyRate:
      0,

    monthlyRate:
      0,

    annualRate:
      0,

    cautionDeposit:
      0,

    cleaningFee:
      0,

    bedrooms:
      0,

    bathrooms:
      0,

    toilets:
      0,

    maxGuests:
      0,

    furnished:
      false,

    description:
      '',

    amenities:
      [''],

    media:
      [''],

    mediaAssets:
      createEmptyMediaCollection(),

    inspectionNotes:
      '',

    quantity:
      1,

    availableQuantity:
      1,
  };
}

function initialState():
  FormState {
  return {
    serviceType:
      'property',

    lifecycleStatus:
      'draft',

    listingSource:
      'living-spring',

    title:
      '',

    category:
      'Residential',

    listingPurpose:
      'Rent',

    propertyType:
      '',

    locationSlug:
      '',

    location:
      '',

    address:
      '',

    country:
      'Nigeria',

    state:
      '',

    city:
      '',

    area:
      '',

    showFullAddress:
      false,

    description:
      '',

    generalMedia:
      createEmptyMediaCollection(),

    media:
      [''],

    coverImage:
      '',

    amenities:
      [''],

    featured:
      false,

    furnished:
      false,

    landSize:
      0,

    landSizeUnit:
      'sqm',

    titleDocument:
      '',

    mapEmbedUrl:
      '',

    latitude:
      '',

    longitude:
      '',

    nearbyLandmarks:
      [''],

    checkInTime:
      '15:00',

    checkOutTime:
      '12:00',

    minStayNights:
      1,

    maxGuests:
      0,

    units: [
      createUnit(
        'property',
        'unit-1'
      ),
    ],
  };
}

function cleanStrings(
  values:
    string[]
) {
  return values
    .map(
      (
        value
      ) =>
        value.trim()
    )
    .filter(
      Boolean
    );
}

function clampWholeNumber(
  value:
    number,

  minimum =
    0
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.floor(
      value
    )
  );
}


function isRecord(
  value: unknown
): value is
  Record<string, unknown> {
  return (
    typeof value ===
      'object' &&
    value !== null &&
    !Array.isArray(
      value
    )
  );
}

function readOptionalNumber(
  value: unknown
) {
  return typeof value ===
    'number' &&
    Number.isFinite(
      value
    )
    ? value
    : undefined;
}

function readOptionalString(
  value: unknown
) {
  return typeof value ===
    'string'
    ? value
    : undefined;
}

function readMediaAsset(
  value: unknown
):
  MediaAsset | null {
  if (
    !isRecord(
      value
    )
  ) {
    return null;
  }

  const assetId =
    readOptionalString(
      value.assetId
    );

  const publicId =
    readOptionalString(
      value.publicId
    );

  const secureUrl =
    readOptionalString(
      value.secureUrl
    );

  const resourceType =
    value.resourceType;

  if (
    !assetId ||
    !publicId ||
    !secureUrl ||
    (
      resourceType !==
        'image' &&
      resourceType !==
        'video'
    )
  ) {
    return null;
  }

  return {
    assetId,
    publicId,
    secureUrl,
    resourceType,

    format:
      readOptionalString(
        value.format
      ),

    bytes:
      readOptionalNumber(
        value.bytes
      ),

    width:
      readOptionalNumber(
        value.width
      ),

    height:
      readOptionalNumber(
        value.height
      ),

    duration:
      readOptionalNumber(
        value.duration
      ),

    originalFilename:
      readOptionalString(
        value.originalFilename
      ),

    createdAt:
      readOptionalString(
        value.createdAt
      ),
  };
}

function readMediaCollection(
  value: unknown
):
  MediaCollection {
  if (
    !isRecord(
      value
    )
  ) {
    return createEmptyMediaCollection();
  }

  const images =
    Array.isArray(
      value.images
    )
      ? value.images
          .map(
            readMediaAsset
          )
          .filter(
            (
              asset
            ): asset is
              MediaAsset =>
              asset !==
                null &&
              asset.resourceType ===
                'image'
          )
      : [];

  const videos =
    Array.isArray(
      value.videos
    )
      ? value.videos
          .map(
            readMediaAsset
          )
          .filter(
            (
              asset
            ): asset is
              MediaAsset =>
              asset !==
                null &&
              asset.resourceType ===
                'video'
          )
      : [];

  return {
    images,
    videos,
  };
}

function hasCloudinaryMedia(
  media:
    MediaCollection
) {
  return (
    media.images.length >
      0 ||
    media.videos.length >
      0
  );
}

function cloudinaryUrls(
  media:
    MediaCollection
) {
  return [
    ...media.images.map(
      (
        asset
      ) =>
        asset.secureUrl
    ),

    ...media.videos.map(
      (
        asset
      ) =>
        asset.secureUrl
    ),
  ];
}

function safeUploadId(
  value: string
) {
  const safe =
    value
      .replace(
        /[^a-zA-Z0-9_-]/g,
        '_'
      )
      .slice(
        0,
        100
      );

  return safe.length >=
    6
    ? safe
    : `admin-${Date.now()}`;
}

type StringListEditorProps = {
  title:
    string;

  values:
    string[];

  placeholder:
    string;

  addLabel:
    string;

  onChange:
    (
      index:
        number,

      value:
        string
    ) => void;

  onAdd:
    () => void;

  onRemove:
    (
      index:
        number
    ) => void;
};

function StringListEditor({
  title,
  values,
  placeholder,
  addLabel,
  onChange,
  onAdd,
  onRemove,
}: StringListEditorProps) {
  return (
    <div
      className={
        styles.arraySection
      }
    >
      <h3>
        {title}
      </h3>

      {values.map(
        (
          value,
          index
        ) => (
          <div
            className={
              styles.arrayRow
            }
            key={`${title}-${index}`}
          >
            <input
              value={
                value
              }
              onChange={(
                event
              ) =>
                onChange(
                  index,
                  event.target
                    .value
                )
              }
              placeholder={
                placeholder
              }
            />

            <button
              type="button"
              onClick={() =>
                onRemove(
                  index
                )
              }
              aria-label={`Remove ${title.toLowerCase()} item`}
            >
              <Trash2
                size={16}
                aria-hidden="true"
              />
            </button>
          </div>
        )
      )}

      <button
        type="button"
        className={
          styles.addButton
        }
        onClick={
          onAdd
        }
      >
        <Plus
          size={16}
          aria-hidden="true"
        />

        {addLabel}
      </button>
    </div>
  );
}

export default function PropertyForm({
  propertyId,
}: PropertyFormProps) {
  const router =
    useRouter();

  const isEdit =
    Boolean(
      propertyId
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      initialState
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      isEdit
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState('');

  const [
    uploadDraftId,
  ] =
    useState(
      () =>
        safeUploadId(
          propertyId
            ? `property-${propertyId}`
            : `admin-${createId()}`
        )
    );

  /*
   * ============================================
   * LOAD EXISTING LISTING
   * ============================================
   */

  useEffect(() => {
    const id =
      propertyId ??
      '';

    if (!id) {
      return;
    }

    let active =
      true;

    async function loadProperty() {
      try {
        const snapshot =
          await getDoc(
            doc(
              db,
              'properties',
              id
            )
          );

        if (
          !snapshot.exists()
        ) {
          if (
            active
          ) {
            setMessage(
              'This listing could not be found.'
            );
          }

          return;
        }

        const rawProperty =
          snapshot.data();

        const property =
          normalizeProperty(
            snapshot.id,
            rawProperty
          );

        const rawRecord =
          isRecord(
            rawProperty
          )
            ? rawProperty
            : {};

        const generalMedia =
          readMediaCollection(
            rawRecord
              .generalMedia
          );

        const rawUnits =
          Array.isArray(
            rawRecord.units
          )
            ? rawRecord.units
            : [];

        if (
          !active
        ) {
          return;
        }

        setForm({
          serviceType:
            property
              .serviceType,

          lifecycleStatus:
            property
              .lifecycleStatus,

          listingSource:
            property
              .listingSource,

          title:
            property.title,

          category:
            property.category,

          listingPurpose:
            property
              .listingPurpose,

          propertyType:
            property
              .propertyType,

          locationSlug:
            property
              .locationSlug,

          location:
            property.location,

          address:
            property.address,

          country:
            property.country ||
            'Nigeria',

          state:
            property.state,

          city:
            property.city,

          area:
            property.area,

          showFullAddress:
            property
              .showFullAddress,

          description:
            property
              .description,

          generalMedia,

          media:
            hasCloudinaryMedia(
              generalMedia
            )
              ? ['']
              : property.media
                  .length
                ? property.media
                : [''],

          coverImage:
            hasCloudinaryMedia(
              generalMedia
            )
              ? ''
              : property
                  .coverImage,

          amenities:
            property
              .amenities
              .length
              ? property
                  .amenities
              : [''],

          featured:
            property.featured,

          furnished:
            property.furnished,

          landSize:
            property.landSize,

          landSizeUnit:
            property
              .landSizeUnit,

          titleDocument:
            property
              .titleDocument,

          mapEmbedUrl:
            property
              .mapEmbedUrl,

          latitude:
            property.latitude ===
            null
              ? ''
              : String(
                  property
                    .latitude
                ),

          longitude:
            property.longitude ===
            null
              ? ''
              : String(
                  property
                    .longitude
                ),

          nearbyLandmarks:
            property
              .nearbyLandmarks
              .length
              ? property
                  .nearbyLandmarks
              : [''],

          checkInTime:
            property
              .checkInTime ||
            '15:00',

          checkOutTime:
            property
              .checkOutTime ||
            '12:00',

          minStayNights:
            property
              .minStayNights ||
            1,

          maxGuests:
            property
              .maxGuests,

          units:
            property.units
              .length
              ? property.units
                  .map(
                    (
                      unit,
                      unitIndex
                    ) => {
                      const rawUnit =
                        rawUnits.find(
                          (
                            candidate
                          ) =>
                            isRecord(
                              candidate
                            ) &&
                            candidate.id ===
                              unit.id
                        ) ??
                        rawUnits[
                          unitIndex
                        ];

                      const mediaAssets =
                        readMediaCollection(
                          isRecord(
                            rawUnit
                          )
                            ? rawUnit
                                .mediaAssets
                            : undefined
                        );

                      return {
                        ...unit,

                        quantity:
                          typeof unit
                            .quantity ===
                            'number' &&
                          unit.quantity >
                            0
                            ? unit
                                .quantity
                            : 1,

                        availableQuantity:
                          typeof unit
                            .availableQuantity ===
                            'number'
                            ? unit
                                .availableQuantity
                            : unit.status ===
                                'available'
                              ? 1
                              : 0,

                        amenities:
                          unit
                            .amenities
                            .length
                            ? unit
                                .amenities
                            : [''],

                        media:
                          hasCloudinaryMedia(
                            mediaAssets
                          )
                            ? ['']
                            : unit
                                .media
                                .length
                              ? unit
                                  .media
                              : [''],

                        mediaAssets,
                      };
                    }
                  )
              : [
                  createUnit(
                    property
                      .serviceType,
                    'unit-1'
                  ),
                ],
        });
      } catch (
        error
      ) {
        console.error(
          'Failed to load listing:',
          error
        );

        if (
          active
        ) {
          setMessage(
            'Could not load this listing.'
          );
        }
      } finally {
        if (
          active
        ) {
          setLoading(
            false
          );
        }
      }
    }

    void loadProperty();

    return () => {
      active =
        false;
    };
  }, [
    propertyId,
  ]);

  const propertyTypeSuggestions =
    useMemo(
      () =>
        PROPERTY_TYPE_SUGGESTIONS[
          form.serviceType
        ],

      [
        form.serviceType,
      ]
    );

  const isLand =
    form.serviceType ===
      'property' &&
    form.category ===
      'Land';

  const locationPreview =
    useMemo(() => {
      const structured =
        [
          form.area,
          form.city,
          form.state,
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

      return (
        form.location
          .trim() ||
        'Nigeria'
      );
    }, [
      form.area,
      form.city,
      form.location,
      form.state,
    ]);

  const updateField = <
    K extends keyof FormState,
  >(
    key:
      K,

    value:
      FormState[K]
  ) => {
    setForm(
      (
        current
      ) => ({
        ...current,

        [key]:
          value,
      })
    );
  };

  /*
   * ============================================
   * SERVICE / CATEGORY
   * ============================================
   */

  function changeService(
    serviceType:
      PropertyService
  ) {
    setForm(
      (
        current
      ) => {
        const nextUnits =
          current.units
            .length
            ? current.units.map(
                (
                  unit
                ) => ({
                  ...unit,

                  pricePeriod:
                    defaultPeriod(
                      serviceType
                    ),

                  quantity:
                    unit.quantity ??
                    1,

                  availableQuantity:
                    unit.availableQuantity ??
                    (
                      unit.status ===
                      'available'
                        ? 1
                        : 0
                    ),
                })
              )
            : [
                createUnit(
                  serviceType
                ),
              ];

        return {
          ...current,

          serviceType,

          category:
            serviceType ===
            'property'
              ? current
                  .category
              : 'Residential',

          listingPurpose:
            serviceType ===
            'property'
              ? current
                  .listingPurpose
              : 'Rent',

          propertyType:
            '',

          landSize:
            serviceType ===
            'property'
              ? current
                  .landSize
              : 0,

          titleDocument:
            serviceType ===
            'property'
              ? current
                  .titleDocument
              : '',

          minStayNights:
            serviceType ===
            'shortlet'
              ? Math.max(
                  1,
                  current
                    .minStayNights
                )
              : 0,

          units:
            nextUnits,
        };
      }
    );
  }

  function changeCategory(
    category:
      string
  ) {
    setForm(
      (
        current
      ) => {
        if (
          category !==
          'Land'
        ) {
          return {
            ...current,

            category,
          };
        }

        const firstUnit =
          current.units[0] ||
          createUnit(
            'property',
            'unit-1'
          );

        return {
          ...current,

          category:
            'Land',

          propertyType:
            current
              .propertyType
              .toLowerCase()
              .includes(
                'land'
              )
              ? current
                  .propertyType
              : 'Residential Land',

          units: [
            {
              ...firstUnit,

              unitType:
                'Land',

              pricePeriod:
                current
                  .listingPurpose ===
                'Sale'
                  ? 'one-time'
                  : 'year',

              quantity:
                1,

              availableQuantity:
                firstUnit
                  .status ===
                'available'
                  ? 1
                  : 0,

              bedrooms:
                0,

              bathrooms:
                0,

              toilets:
                0,

              maxGuests:
                0,
            },
          ],
        };
      }
    );
  }

  function changeListingPurpose(
    purpose:
      string
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        listingPurpose:
          purpose,

        units:
          current.category ===
          'Land'
            ? current.units.map(
                (
                  unit
                ) => ({
                  ...unit,

                  pricePeriod:
                    purpose ===
                    'Sale'
                      ? 'one-time'
                      : 'year',
                })
              )
            : current.units,
      })
    );
  }

  /*
   * ============================================
   * PROPERTY ARRAYS
   * ============================================
   */

  function updateArray(
    field:
      | 'media'
      | 'amenities'
      | 'nearbyLandmarks',

    index:
      number,

    value:
      string
  ) {
    setForm(
      (
        current
      ) => {
        const next =
          [
            ...current[
              field
            ],
          ];

        next[
          index
        ] =
          value;

        return {
          ...current,

          [field]:
            next,
        };
      }
    );
  }

  function addArrayItem(
    field:
      | 'media'
      | 'amenities'
      | 'nearbyLandmarks'
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        [field]: [
          ...current[
            field
          ],

          '',
        ],
      })
    );
  }

  function removeArrayItem(
    field:
      | 'media'
      | 'amenities'
      | 'nearbyLandmarks',

    index:
      number
  ) {
    setForm(
      (
        current
      ) => {
        const next =
          current[
            field
          ].filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          );

        return {
          ...current,

          [field]:
            next.length
              ? next
              : [''],
        };
      }
    );
  }

  /*
   * ============================================
   * UNITS
   * ============================================
   */

  const updateUnit = <
    K extends keyof PropertyUnit,
  >(
    unitIndex:
      number,

    field:
      K,

    value:
      PropertyUnit[K]
  ) => {
    setForm(
      (
        current
      ) => ({
        ...current,

        units:
          current.units.map(
            (
              unit,
              index
            ) =>
              index ===
              unitIndex
                ? {
                    ...unit,

                    [field]:
                      value,
                  }
                : unit
          ),
      })
    );
  };

  function updateUnitArray(
    unitIndex:
      number,

    field:
      | 'media'
      | 'amenities',

    itemIndex:
      number,

    value:
      string
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        units:
          current.units.map(
            (
              unit,
              index
            ) => {
              if (
                index !==
                unitIndex
              ) {
                return unit;
              }

              const next =
                [
                  ...unit[
                    field
                  ],
                ];

              next[
                itemIndex
              ] =
                value;

              return {
                ...unit,

                [field]:
                  next,
              };
            }
          ),
      })
    );
  }

  function addUnitArrayItem(
    unitIndex:
      number,

    field:
      | 'media'
      | 'amenities'
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        units:
          current.units.map(
            (
              unit,
              index
            ) =>
              index ===
              unitIndex
                ? {
                    ...unit,

                    [field]: [
                      ...unit[
                        field
                      ],

                      '',
                    ],
                  }
                : unit
          ),
      })
    );
  }

  function removeUnitArrayItem(
    unitIndex:
      number,

    field:
      | 'media'
      | 'amenities',

    itemIndex:
      number
  ) {
    setForm(
      (
        current
      ) => ({
        ...current,

        units:
          current.units.map(
            (
              unit,
              index
            ) => {
              if (
                index !==
                unitIndex
              ) {
                return unit;
              }

              const next =
                unit[
                  field
                ].filter(
                  (
                    _,
                    indexToCheck
                  ) =>
                    indexToCheck !==
                    itemIndex
                );

              return {
                ...unit,

                [field]:
                  next.length
                    ? next
                    : [''],
              };
            }
          ),
      })
    );
  }

  function addUnit() {
    setForm(
      (
        current
      ) => ({
        ...current,

        units: [
          ...current
            .units,

          createUnit(
            current
              .serviceType
          ),
        ],
      })
    );
  }

  function removeUnit(
    unitIndex:
      number
  ) {
    setForm(
      (
        current
      ) => {
        const next =
          current.units
            .filter(
              (
                _,
                index
              ) =>
                index !==
                unitIndex
            );

        return {
          ...current,

          units:
            next.length
              ? next
              : [
                  createUnit(
                    current
                      .serviceType,
                    'unit-1'
                  ),
                ],
        };
      }
    );
  }

  /*
   * ============================================
   * VALIDATION
   * ============================================
   */

  function validatePublished() {
    if (
      !form.title.trim()
    ) {
      return 'Add a listing title before publishing.';
    }

    if (
      !form.propertyType
        .trim()
    ) {
      return 'Add a property type before publishing.';
    }

    if (
      !form.state.trim() &&
      !form.city.trim() &&
      !form.location.trim()
    ) {
      return 'Add a state/city or location summary before publishing.';
    }

    if (
      !form.units.length ||
      !form.units.some(
        (
          unit
        ) =>
          unit.unitType
            .trim()
      )
    ) {
      return 'Add at least one valid unit or price option before publishing.';
    }

    if (
      isLand &&
      form.landSize <
        0
    ) {
      return 'Land size cannot be negative.';
    }

    if (
      form.serviceType ===
      'shortlet'
    ) {
      if (
        form.minStayNights <
        1
      ) {
        return 'Short-let minimum stay must be at least one night.';
      }

      if (
        !form.checkInTime ||
        !form.checkOutTime
      ) {
        return 'Add short-let check-in and check-out times.';
      }
    }

    return '';
  }

  /*
   * ============================================
   * SAVE
   * ============================================
   */

  async function saveProperty(
    statusOverride?:
      ListingLifecycleStatus
  ) {
    const finalStatus =
      statusOverride ||
      form.lifecycleStatus;

    if (
      finalStatus ===
      'published'
    ) {
      const validation =
        validatePublished();

      if (
        validation
      ) {
        setMessage(
          validation
        );

        window.scrollTo({
          top:
            0,

          behavior:
            'smooth',
        });

        return;
      }
    }

    setSaving(
      true
    );

    setMessage(
      ''
    );

    const cloudMedia =
      cloudinaryUrls(
        form.generalMedia
      );

    const legacyMedia =
      cleanStrings(
        form.media
      );

    const cleanedMedia =
      cloudMedia.length
        ? cloudMedia
        : legacyMedia;

    const cleanedUnits =
      form.units.map(
        (
          unit,
          index
        ) => {
          const quantity =
            form.serviceType ===
              'shortlet' ||
            isLand
              ? 1
              : clampWholeNumber(
                  unit.quantity ??
                    1,
                  1
                );

          const availableQuantity =
            unit.status ===
            'available'
              ? Math.min(
                  quantity,
                  clampWholeNumber(
                    unit.availableQuantity ??
                      quantity,
                    0
                  )
                )
              : 0;

          const nightlyRate =
            Number(
              unit.nightlyRate
            ) ||
            0;

          const annualRate =
            Number(
              unit.annualRate
            ) ||
            0;

          const monthlyRate =
            Number(
              unit.monthlyRate
            ) ||
            0;

          const weeklyRate =
            Number(
              unit.weeklyRate
            ) ||
            0;

          let price =
            Number(
              unit.price
            ) ||
            0;

          let pricePeriod =
            unit.pricePeriod;

          if (
            form.serviceType ===
            'shortlet'
          ) {
            price =
              price ||
              nightlyRate ||
              weeklyRate ||
              monthlyRate;

            if (
              nightlyRate >
              0
            ) {
              pricePeriod =
                'night';
            } else if (
              weeklyRate >
              0
            ) {
              pricePeriod =
                'week';
            } else if (
              monthlyRate >
              0
            ) {
              pricePeriod =
                'month';
            }
          }

          if (
            form.serviceType ===
            'hostel'
          ) {
            price =
              price ||
              annualRate ||
              monthlyRate;

            if (
              !Number(
                unit.price
              ) &&
              annualRate >
                0
            ) {
              pricePeriod =
                'year';
            } else if (
              !Number(
                unit.price
              ) &&
              monthlyRate >
                0
            ) {
              pricePeriod =
                'month';
            }
          }

          if (
            isLand
          ) {
            pricePeriod =
              form.listingPurpose ===
              'Sale'
                ? 'one-time'
                : unit
                    .pricePeriod;
          }

          return {
            ...unit,

            id:
              unit.id ||
              `unit-${index + 1}`,

            unitType:
              isLand
                ? 'Land'
                : unit
                    .unitType
                    .trim(),

            description:
              unit.description
                .trim(),

            inspectionNotes:
              unit
                .inspectionNotes
                .trim(),

            amenities:
              cleanStrings(
                unit.amenities
              ),

            media:
              cloudinaryUrls(
                unit.mediaAssets
              ).length
                ? cloudinaryUrls(
                    unit.mediaAssets
                  )
                : cleanStrings(
                    unit.media
                  ),

            mediaAssets:
              unit.mediaAssets,

            price,

            pricePeriod,

            nightlyRate,

            weeklyRate,

            monthlyRate,

            annualRate,

            cautionDeposit:
              Number(
                unit
                  .cautionDeposit
              ) ||
              0,

            cleaningFee:
              Number(
                unit.cleaningFee
              ) ||
              0,

            bedrooms:
              isLand
                ? 0
                : Number(
                    unit
                      .bedrooms
                  ) ||
                  0,

            bathrooms:
              isLand
                ? 0
                : Number(
                    unit
                      .bathrooms
                  ) ||
                  0,

            toilets:
              isLand
                ? 0
                : Number(
                    unit
                      .toilets
                  ) ||
                  0,

            maxGuests:
              form.serviceType ===
              'shortlet'
                ? Number(
                    unit
                      .maxGuests
                  ) ||
                  0
                : 0,

            quantity,

            availableQuantity,
          };
        }
      );

    const structuredLocation =
      [
        form.area,
        form.city,
        form.state,
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
        )
        .join(
          ', '
        );

    const payload = {
      serviceType:
        form.serviceType,

      lifecycleStatus:
        finalStatus,

      listingSource:
        form.listingSource,

      title:
        form.title.trim(),

      category:
        form.serviceType ===
        'property'
          ? form.category
          : 'Residential',

      listingPurpose:
        form.serviceType ===
        'property'
          ? form
              .listingPurpose
          : 'Rent',

      structureType:
        cleanedUnits.length >
          1 ||
        cleanedUnits.some(
          (
            unit
          ) =>
            (
              unit.quantity ??
              1
            ) >
            1
        )
          ? 'multi-unit'
          : 'single-unit',

      propertyType:
        form.propertyType
          .trim(),

      locationSlug:
        form.locationSlug,

      location:
        structuredLocation ||
        form.location
          .trim() ||
        'Nigeria',

      address:
        form.address.trim(),

      country:
        'Nigeria',

      state:
        form.state.trim(),

      city:
        form.city.trim(),

      area:
        form.area.trim(),

      showFullAddress:
        form.showFullAddress,

      description:
        form.description
          .trim(),

      generalMedia:
        form.generalMedia,

      media:
        cleanedMedia,

      coverImage:
        form.generalMedia
          .images[0]
          ?.secureUrl ||
        (
          cloudMedia.length
            ? ''
            : form.coverImage
                .trim() ||
              legacyMedia[0] ||
              ''
        ),

      amenities:
        cleanStrings(
          form.amenities
        ),

      featured:
        form.featured,

      furnished:
        form.furnished,

      landSize:
        isLand
          ? Number(
              form.landSize
            ) ||
            0
          : 0,

      landSizeUnit:
        form.landSizeUnit,

      titleDocument:
        isLand
          ? form
              .titleDocument
              .trim()
          : '',

      mapEmbedUrl:
        form.mapEmbedUrl
          .trim(),

      latitude:
        form.latitude
          .trim()
          ? Number(
              form.latitude
            )
          : null,

      longitude:
        form.longitude
          .trim()
          ? Number(
              form.longitude
            )
          : null,

      nearbyLandmarks:
        cleanStrings(
          form
            .nearbyLandmarks
        ),

      checkInTime:
        form.serviceType ===
        'shortlet'
          ? form.checkInTime
          : '',

      checkOutTime:
        form.serviceType ===
        'shortlet'
          ? form
              .checkOutTime
          : '',

      minStayNights:
        form.serviceType ===
        'shortlet'
          ? Math.max(
              1,
              Number(
                form
                  .minStayNights
              ) ||
                1
            )
          : 0,

      maxGuests:
        form.serviceType ===
        'shortlet'
          ? Number(
              form.maxGuests
            ) ||
            0
          : 0,

      units:
        cleanedUnits,

      updatedAt:
        serverTimestamp(),
    };

    try {
      if (
        propertyId
      ) {
        await updateDoc(
          doc(
            db,
            'properties',
            propertyId
          ),

          payload
        );
      } else {
        await addDoc(
          collection(
            db,
            'properties'
          ),

          {
            ...payload,

            createdAt:
              serverTimestamp(),
          }
        );
      }

      setMessage(
        finalStatus ===
        'draft'
          ? 'Draft saved successfully.'
          : finalStatus ===
              'archived'
            ? 'Listing archived successfully.'
            : 'Listing published successfully.'
      );

      window.setTimeout(
        () => {
          router.push(
            '/admin/properties'
          );

          router.refresh();
        },

        500
      );
    } catch (
      error
    ) {
      console.error(
        'Listing save failed:',
        error
      );

      setMessage(
        'Could not save this listing. Check your connection and Firebase permissions, then try again.'
      );
    } finally {
      setSaving(
        false
      );
    }
  }

  /*
   * ============================================
   * LOADING
   * ============================================
   */

  if (
    loading
  ) {
    return (
      <div
        className={
          styles.loading
        }
      >
        <div
          className="loading-spinner"
        />

        <p>
          Loading listing...
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        styles.page
      }
    >
      <div
        className={
          styles.topBar
        }
      >
        <button
          type="button"
          className={
            styles.backButton
          }
          onClick={() =>
            router.push(
              '/admin/properties'
            )
          }
        >
          <ArrowLeft
            size={18}
            aria-hidden="true"
          />

          Properties
        </button>

        <div
          className={
            styles.topActions
          }
        >
          <button
            type="button"
            className={
              styles.draftButton
            }
            disabled={
              saving
            }
            onClick={() =>
              void saveProperty(
                'draft'
              )
            }
          >
            <FileEdit
              size={17}
              aria-hidden="true"
            />

            Save Draft
          </button>

          <button
            type="button"
            className={
              styles.saveButton
            }
            disabled={
              saving
            }
            onClick={() =>
              void saveProperty()
            }
          >
            <Save
              size={17}
              aria-hidden="true"
            />

            {saving
              ? 'Saving...'
              : form.lifecycleStatus ===
                  'published'
                ? isEdit
                  ? 'Save & Keep Live'
                  : 'Publish Listing'
                : isEdit
                  ? 'Save Changes'
                  : 'Save Listing'}
          </button>
        </div>
      </div>

      <div
        className={
          styles.header
        }
      >
        <span>
          {isEdit
            ? 'Edit Listing'
            : 'New Listing'}
        </span>

        <h1>
          {isEdit
            ? 'Update listing'
            : 'Create listing'}
        </h1>

        <p>
          Add land,
          buildings, hostel
          accommodation and
          short-let stays from
          anywhere in Nigeria.
        </p>
      </div>

      {message && (
        <div
          className={
            styles.message
          }
          role="status"
        >
          {message}
        </div>
      )}

      <form
        className={
          styles.form
        }
        onSubmit={(
          event
        ) => {
          event.preventDefault();

          void saveProperty();
        }}
      >
        {/* =================================
            LISTING TYPE
        ================================== */}

        <section
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeading
            }
          >
            <Building2
              size={21}
              aria-hidden="true"
            />

            <div>
              <h2>
                What are you listing?
              </h2>

              <p>
                The rest of the form
                adapts to the service
                you choose.
              </p>
            </div>
          </div>

          <div
            className={
              styles.serviceChoices
            }
          >
            <button
              type="button"
              className={
                form.serviceType ===
                'property'
                  ? styles.activeChoice
                  : ''
              }
              onClick={() =>
                changeService(
                  'property'
                )
              }
            >
              <Building2
                size={23}
                aria-hidden="true"
              />

              <strong>
                Property
              </strong>

              <span>
                Land, houses,
                flats, shops,
                offices and
                commercial
                buildings.
              </span>
            </button>

            <button
              type="button"
              className={
                form.serviceType ===
                'hostel'
                  ? styles.activeChoice
                  : ''
              }
              onClick={() =>
                changeService(
                  'hostel'
                )
              }
            >
              <BedDouble
                size={23}
                aria-hidden="true"
              />

              <strong>
                Hostel
              </strong>

              <span>
                A hostel building
                with one or more
                room or unit types.
              </span>
            </button>

            <button
              type="button"
              className={
                form.serviceType ===
                'shortlet'
                  ? styles.activeChoice
                  : ''
              }
              onClick={() =>
                changeService(
                  'shortlet'
                )
              }
            >
              <CalendarDays
                size={23}
                aria-hidden="true"
              />

              <strong>
                Short-Let
              </strong>

              <span>
                Furnished
                accommodation
                priced by night,
                week or month.
              </span>
            </button>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <label>
              Listing Status

              <select
                value={
                  form.lifecycleStatus
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'lifecycleStatus',
                    event.target
                      .value as ListingLifecycleStatus
                  )
                }
              >
                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>

                <option value="archived">
                  Archived
                </option>
              </select>
            </label>

            <label
              className={
                styles.toggleLabel
              }
            >
              <input
                type="checkbox"
                checked={
                  form.featured
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'featured',
                    event.target
                      .checked
                  )
                }
              />

              <span>
                <strong>
                  Featured listing
                </strong>

                <small>
                  Give this listing
                  priority in
                  featured sections.
                </small>
              </span>
            </label>
          </div>
        </section>

        {/* =================================
            DETAILS
        ================================== */}

        <section
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeading
            }
          >
            <FileEdit
              size={21}
              aria-hidden="true"
            />

            <div>
              <h2>
                Listing details
              </h2>

              <p>
                Core information
                visitors will use
                to understand the
                listing.
              </p>
            </div>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <label
              className={
                styles.full
              }
            >
              Listing Title *

              <input
                value={
                  form.title
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'title',
                    event.target
                      .value
                  )
                }
                placeholder={
                  form.serviceType ===
                  'hostel'
                    ? 'e.g. Living Spring Student Hostel'
                    : form.serviceType ===
                        'shortlet'
                      ? 'e.g. Furnished 2 Bedroom Short-Let in Lekki'
                      : 'e.g. 4 Bedroom Duplex for Sale'
                }
              />
            </label>

            {form.serviceType ===
              'property' && (
              <>
                <label>
                  Property Category

                  <select
                    value={
                      form.category
                    }
                    onChange={(
                      event
                    ) =>
                      changeCategory(
                        event.target
                          .value
                      )
                    }
                  >
                    {PROPERTY_CATEGORIES.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category
                          }
                          value={
                            category
                          }
                        >
                          {
                            category
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label>
                  Purpose

                  <select
                    value={
                      form.listingPurpose
                    }
                    onChange={(
                      event
                    ) =>
                      changeListingPurpose(
                        event.target
                          .value
                      )
                    }
                  >
                    {LISTING_PURPOSES.map(
                      (
                        purpose
                      ) => (
                        <option
                          key={
                            purpose
                          }
                          value={
                            purpose
                          }
                        >
                          {
                            purpose
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>
              </>
            )}

            <label
              className={
                styles.full
              }
            >
              Property Type *

              <input
                list="property-type-suggestions"
                value={
                  form.propertyType
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'propertyType',
                    event.target
                      .value
                  )
                }
                placeholder={
                  form.serviceType ===
                  'hostel'
                    ? 'e.g. Student Hostel'
                    : form.serviceType ===
                        'shortlet'
                      ? 'e.g. Serviced Apartment'
                      : isLand
                        ? 'e.g. Residential Land'
                        : 'e.g. Duplex, Shop, Warehouse, 2 Bedroom Flat...'
                }
              />

              <datalist
                id="property-type-suggestions"
              >
                {propertyTypeSuggestions.map(
                  (
                    type
                  ) => (
                    <option
                      key={
                        type
                      }
                      value={
                        type
                      }
                    />
                  )
                )}
              </datalist>

              <small
                className={
                  styles.fieldHint
                }
              >
                You can type a
                custom property
                type even if it is
                not in the
                suggestions.
              </small>
            </label>

            <label
              className={
                styles.full
              }
            >
              Description

              <textarea
                rows={6}
                value={
                  form.description
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'description',
                    event.target
                      .value
                  )
                }
                placeholder="Describe the property, condition, access, surroundings and anything a serious visitor should know..."
              />
            </label>

            {!isLand && (
              <label
                className={
                  styles.toggleLabel
                }
              >
                <input
                  type="checkbox"
                  checked={
                    form.furnished
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'furnished',
                      event.target
                        .checked
                    )
                  }
                />

                <span>
                  <strong>
                    Generally furnished
                  </strong>

                  <small>
                    Individual units
                    can still override
                    this below.
                  </small>
                </span>
              </label>
            )}
          </div>
        </section>

        {/* =================================
            LAND
        ================================== */}

        {isLand && (
          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <FileText
                size={21}
                aria-hidden="true"
              />

              <div>
                <h2>
                  Land details
                </h2>

                <p>
                  Keep land
                  information
                  separate from
                  building-specific
                  fields.
                </p>
              </div>
            </div>

            <div
              className={
                styles.grid
              }
            >
              <label>
                Land Size

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={
                    form.landSize ||
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'landSize',
                      Number(
                        event.target
                          .value
                      ) ||
                        0
                    )
                  }
                  placeholder="e.g. 600"
                />
              </label>

              <label>
                Size Unit

                <select
                  value={
                    form.landSizeUnit
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'landSizeUnit',
                      event.target
                        .value as LandSizeUnit
                    )
                  }
                >
                  {LAND_SIZE_UNITS.map(
                    (
                      unit
                    ) => (
                      <option
                        key={
                          unit.value
                        }
                        value={
                          unit.value
                        }
                      >
                        {
                          unit.label
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              <label
                className={
                  styles.full
                }
              >
                Title / Document

                <input
                  value={
                    form.titleDocument
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'titleDocument',
                      event.target
                        .value
                    )
                  }
                  placeholder="e.g. C of O, Governor's Consent, Registered Survey, Deed of Assignment..."
                />
              </label>
            </div>
          </section>
        )}

        {/* =================================
            LOCATION
        ================================== */}

        <section
          className={
            styles.card
          }
        >
          <div
            className={
              styles.cardHeading
            }
          >
            <Globe2
              size={21}
              aria-hidden="true"
            />

            <div>
              <h2>
                Location
              </h2>

              <p>
                Nationwide
                structure:
                Nigeria → State/FCT
                → City/LGA → Area.
              </p>
            </div>
          </div>

          <div
            className={
              styles.locationPreview
            }
          >
            <MapPin
              size={18}
              aria-hidden="true"
            />

            <div>
              <span>
                Public location preview
              </span>

              <strong>
                {locationPreview}
              </strong>
            </div>
          </div>

          <div
            className={
              styles.grid
            }
          >
            <label>
              Country

              <input
                value="Nigeria"
                disabled
              />
            </label>

            <label>
              State / FCT

              <select
                value={
                  form.state
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'state',
                    event.target
                      .value
                  )
                }
              >
                <option value="">
                  Select state
                </option>

                {NIGERIAN_STATES.map(
                  (
                    state
                  ) => (
                    <option
                      key={
                        state
                      }
                      value={
                        state
                      }
                    >
                      {state}
                    </option>
                  )
                )}
              </select>
            </label>

            <label>
              City / LGA

              <input
                value={
                  form.city
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'city',
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Sagamu, Lekki, Gwarinpa"
              />
            </label>

            <label>
              Area / Neighbourhood

              <input
                value={
                  form.area
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'area',
                    event.target
                      .value
                  )
                }
                placeholder="e.g. GRA, Ikate, Ijagun"
              />
            </label>

            <label
              className={
                styles.full
              }
            >
              Full Address

              <input
                value={
                  form.address
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'address',
                    event.target
                      .value
                  )
                }
                placeholder="Full property address for Living Spring records"
              />
            </label>

            <label
              className={
                styles.full
              }
            >
              Legacy / Fallback
              Location

              <input
                value={
                  form.location
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'location',
                    event.target
                      .value
                  )
                }
                placeholder="Used for older listings if structured location is incomplete"
              />

              <small
                className={
                  styles.fieldHint
                }
              >
                Existing
                Isara/Ijebu
                listings can keep
                their old location
                text. New listings
                should use State,
                City and Area above.
              </small>
            </label>

            <label
              className={`${styles.toggleLabel} ${styles.full}`}
            >
              <input
                type="checkbox"
                checked={
                  form.showFullAddress
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'showFullAddress',
                    event.target
                      .checked
                  )
                }
              />

              <span>
                <strong>
                  Show exact address publicly
                </strong>

                <small>
                  Leave this off
                  when the exact
                  residential
                  address should
                  stay private until
                  enquiry or
                  inspection.
                </small>
              </span>
            </label>

            <label
              className={
                styles.full
              }
            >
              Map / Google Maps URL

              <input
                value={
                  form.mapEmbedUrl
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'mapEmbedUrl',
                    event.target
                      .value
                  )
                }
                placeholder="https://maps.google.com/..."
              />
            </label>

            <label>
              Latitude

              <input
                inputMode="decimal"
                value={
                  form.latitude
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'latitude',
                    event.target
                      .value
                  )
                }
                placeholder="6.5244"
              />
            </label>

            <label>
              Longitude

              <input
                inputMode="decimal"
                value={
                  form.longitude
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    'longitude',
                    event.target
                      .value
                  )
                }
                placeholder="3.3792"
              />
            </label>
          </div>

          <StringListEditor
            title="Nearby Landmarks"
            values={
              form.nearbyLandmarks
            }
            placeholder="School, hotel, market, hospital, junction..."
            addLabel="Add Landmark"
            onChange={(
              index,
              value
            ) =>
              updateArray(
                'nearbyLandmarks',
                index,
                value
              )
            }
            onAdd={() =>
              addArrayItem(
                'nearbyLandmarks'
              )
            }
            onRemove={(
              index
            ) =>
              removeArrayItem(
                'nearbyLandmarks',
                index
              )
            }
          />
        </section>

        {/* =================================
            MEDIA
        ================================== */}

        <section
          className={
            styles.card
          }
        >
          <AdminPropertyMediaSection
            draftId={
              uploadDraftId
            }
            serviceType={
              form.serviceType
            }
            generalMedia={
              form.generalMedia
            }
            units={
              form.units.map(
                (
                  unit
                ) => ({
                  id:
                    unit.id,

                  name:
                    unit.unitType,

                  quantity:
                    unit.quantity ??
                    1,

                  media:
                    unit.mediaAssets,
                })
              )
            }
            onGeneralMediaChange={(
              generalMedia
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,
                  generalMedia,
                })
              )
            }
            onUnitMediaChange={(
              unitId,
              mediaAssets
            ) =>
              setForm(
                (
                  current
                ) => ({
                  ...current,

                  units:
                    current.units.map(
                      (
                        unit
                      ) =>
                        unit.id ===
                        unitId
                          ? {
                              ...unit,
                              mediaAssets,
                            }
                          : unit
                    ),
                })
              )
            }
          />

          <StringListEditor
            title="Property Amenities"
            values={
              form.amenities
            }
            placeholder="e.g. Parking, water, security, generator..."
            addLabel="Add Amenity"
            onChange={(
              index,
              value
            ) =>
              updateArray(
                'amenities',
                index,
                value
              )
            }
            onAdd={() =>
              addArrayItem(
                'amenities'
              )
            }
            onRemove={(
              index
            ) =>
              removeArrayItem(
                'amenities',
                index
              )
            }
          />
        </section>

        {/* =================================
            SHORT-LET SETTINGS
        ================================== */}

        {form.serviceType ===
          'shortlet' && (
          <section
            className={
              styles.card
            }
          >
            <div
              className={
                styles.cardHeading
              }
            >
              <Clock3
                size={21}
                aria-hidden="true"
              />

              <div>
                <h2>
                  Short-let stay rules
                </h2>

                <p>
                  Stay-level
                  settings. Unit
                  pricing and
                  bedroom details
                  are below.
                </p>
              </div>
            </div>

            <div
              className={
                styles.grid
              }
            >
              <label>
                Check-in Time

                <input
                  type="time"
                  value={
                    form.checkInTime
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'checkInTime',
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Check-out Time

                <input
                  type="time"
                  value={
                    form.checkOutTime
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'checkOutTime',
                      event.target
                        .value
                    )
                  }
                />
              </label>

              <label>
                Minimum Stay
                (Nights)

                <input
                  type="number"
                  min="1"
                  value={
                    form.minStayNights
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'minStayNights',
                      Math.max(
                        1,
                        Number(
                          event.target
                            .value
                        ) ||
                          1
                      )
                    )
                  }
                />
              </label>

              <label>
                Property Max Guests

                <input
                  type="number"
                  min="0"
                  value={
                    form.maxGuests ||
                    ''
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      'maxGuests',
                      Math.max(
                        0,
                        Number(
                          event.target
                            .value
                        ) ||
                          0
                      )
                    )
                  }
                  placeholder="e.g. 6"
                />
              </label>
            </div>
          </section>
        )}

        {/* =================================
            UNITS / PRICING
        ================================== */}

        <section
          className={
            styles.card
          }
        >
          <div
            className={`${styles.cardHeading} ${styles.unitsHeading}`}
          >
            <div
              className={
                styles.headingWithIcon
              }
            >
              <Banknote
                size={21}
                aria-hidden="true"
              />

              <div>
                <h2>
                  {isLand
                    ? 'Land price & availability'
                    : form.serviceType ===
                        'hostel'
                      ? 'Room / unit types'
                      : form.serviceType ===
                          'shortlet'
                        ? 'Short-let unit & pricing'
                        : 'Property units & pricing'}
                </h2>

                <p>
                  {isLand
                    ? 'Land uses one pricing record.'
                    : 'Add as many real unit types as this listing needs.'}
                </p>
              </div>
            </div>

            {!isLand && (
              <button
                type="button"
                className={
                  styles.addUnitButton
                }
                onClick={
                  addUnit
                }
              >
                <Plus
                  size={16}
                  aria-hidden="true"
                />

                Add Unit Type
              </button>
            )}
          </div>

          <div
            className={
              styles.units
            }
          >
            {form.units.map(
              (
                unit,
                unitIndex
              ) => {
                const quantity =
                  unit.quantity ??
                  1;

                const availableQuantity =
                  unit.availableQuantity ??
                  0;

                return (
                  <article
                    className={
                      styles.unitCard
                    }
                    key={
                      unit.id
                    }
                  >
                    <div
                      className={
                        styles.unitHeader
                      }
                    >
                      <div>
                        <span>
                          {isLand
                            ? 'Land'
                            : `Unit Type ${unitIndex + 1}`}
                        </span>

                        <h3>
                          {isLand
                            ? form.propertyType ||
                              'Land'
                            : unit.unitType ||
                              'Untitled unit'}
                        </h3>
                      </div>

                      {!isLand &&
                        form.units
                          .length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeUnit(
                                unitIndex
                              )
                            }
                            aria-label="Remove unit"
                          >
                            <Trash2
                              size={16}
                              aria-hidden="true"
                            />
                          </button>
                        )}
                    </div>

                    <div
                      className={
                        styles.grid
                      }
                    >
                      <label>
                        Unit / Room
                        Type *

                        <input
                          value={
                            isLand
                              ? 'Land'
                              : unit.unitType
                          }
                          disabled={
                            isLand
                          }
                          onChange={(
                            event
                          ) =>
                            updateUnit(
                              unitIndex,
                              'unitType',
                              event.target
                                .value
                            )
                          }
                          placeholder={
                            form.serviceType ===
                            'hostel'
                              ? 'e.g. Single Room, Self Contain, Room & Parlour'
                              : form.serviceType ===
                                  'shortlet'
                                ? 'e.g. Entire 2 Bedroom Apartment'
                                : 'e.g. 2 Bedroom Flat, Shop, Office'
                          }
                        />
                      </label>

                      <label>
                        Status

                        <select
                          value={
                            unit.status
                          }
                          onChange={(
                            event
                          ) =>
                            updateUnit(
                              unitIndex,
                              'status',
                              event.target
                                .value as UnitStatus
                            )
                          }
                        >
                          {UNIT_STATUSES.map(
                            (
                              status
                            ) => (
                              <option
                                key={
                                  status
                                }
                                value={
                                  status
                                }
                              >
                                {
                                  status
                                }
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      {!isLand &&
                        form.serviceType !==
                          'shortlet' && (
                          <>
                            <label>
                              Total Quantity

                              <input
                                type="number"
                                min="1"
                                value={
                                  quantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateUnit(
                                    unitIndex,
                                    'quantity',
                                    Math.max(
                                      1,
                                      Number(
                                        event.target
                                          .value
                                      ) ||
                                        1
                                    )
                                  )
                                }
                              />
                            </label>

                            <label>
                              Available
                              Quantity

                              <input
                                type="number"
                                min="0"
                                max={
                                  Math.max(
                                    1,
                                    quantity
                                  )
                                }
                                value={
                                  availableQuantity
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateUnit(
                                    unitIndex,
                                    'availableQuantity',
                                    Math.max(
                                      0,
                                      Number(
                                        event.target
                                          .value
                                      ) ||
                                        0
                                    )
                                  )
                                }
                              />
                            </label>
                          </>
                        )}

                      {form.serviceType ===
                        'property' && (
                        <>
                          <label>
                            Price

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.price ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'price',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Amount in naira"
                            />
                          </label>

                          <label>
                            Price Period

                            <select
                              value={
                                unit.pricePeriod
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'pricePeriod',
                                  event.target
                                    .value as PricePeriod
                                )
                              }
                            >
                              {PRICE_PERIODS.map(
                                (
                                  period
                                ) => (
                                  <option
                                    key={
                                      period
                                    }
                                    value={
                                      period
                                    }
                                  >
                                    {
                                      period
                                    }
                                  </option>
                                )
                              )}
                            </select>
                          </label>
                        </>
                      )}

                      {form.serviceType ===
                        'hostel' && (
                        <>
                          <label>
                            Annual Price

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.annualRate ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'annualRate',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Per year"
                            />
                          </label>

                          <label>
                            Monthly Price

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.monthlyRate ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'monthlyRate',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Optional"
                            />
                          </label>

                          <label>
                            Caution Deposit

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.cautionDeposit ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'cautionDeposit',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Optional"
                            />
                          </label>
                        </>
                      )}

                      {form.serviceType ===
                        'shortlet' && (
                        <>
                          <label>
                            Nightly Price

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.nightlyRate ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'nightlyRate',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Per night"
                            />
                          </label>

                          <label>
                            Weekly Price

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.weeklyRate ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'weeklyRate',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Optional"
                            />
                          </label>

                          <label>
                            Monthly Price

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.monthlyRate ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'monthlyRate',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Optional"
                            />
                          </label>

                          <label>
                            Cleaning Fee

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.cleaningFee ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'cleaningFee',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Optional"
                            />
                          </label>

                          <label>
                            Caution Deposit

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.cautionDeposit ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'cautionDeposit',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                              placeholder="Optional"
                            />
                          </label>
                        </>
                      )}

                      {!isLand && (
                        <>
                          <label>
                            Bedrooms

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.bedrooms ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'bedrooms',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                            />
                          </label>

                          <label>
                            Bathrooms

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.bathrooms ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'bathrooms',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                            />
                          </label>

                          <label>
                            Toilets

                            <input
                              type="number"
                              min="0"
                              value={
                                unit.toilets ||
                                ''
                              }
                              onChange={(
                                event
                              ) =>
                                updateUnit(
                                  unitIndex,
                                  'toilets',
                                  Number(
                                    event.target
                                      .value
                                  ) ||
                                    0
                                )
                              }
                            />
                          </label>
                        </>
                      )}

                      {form.serviceType ===
                        'shortlet' && (
                        <label>
                          Max Guests

                          <input
                            type="number"
                            min="0"
                            value={
                              unit.maxGuests ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateUnit(
                                unitIndex,
                                'maxGuests',
                                Number(
                                  event.target
                                    .value
                                ) ||
                                  0
                              )
                            }
                          />
                        </label>
                      )}

                      {!isLand && (
                        <label
                          className={
                            styles.toggleLabel
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              unit.furnished
                            }
                            onChange={(
                              event
                            ) =>
                              updateUnit(
                                unitIndex,
                                'furnished',
                                event.target
                                  .checked
                              )
                            }
                          />

                          <span>
                            <strong>
                              Furnished unit
                            </strong>

                            <small>
                              Mark this
                              specific unit
                              as furnished.
                            </small>
                          </span>
                        </label>
                      )}

                      <label
                        className={
                          styles.full
                        }
                      >
                        Unit Description

                        <textarea
                          rows={4}
                          value={
                            unit.description
                          }
                          onChange={(
                            event
                          ) =>
                            updateUnit(
                              unitIndex,
                              'description',
                              event.target
                                .value
                            )
                          }
                          placeholder="Describe this unit or pricing option..."
                        />
                      </label>

                      <label
                        className={
                          styles.full
                        }
                      >
                        Inspection /
                        Internal Notes

                        <textarea
                          rows={3}
                          value={
                            unit.inspectionNotes
                          }
                          onChange={(
                            event
                          ) =>
                            updateUnit(
                              unitIndex,
                              'inspectionNotes',
                              event.target
                                .value
                            )
                          }
                          placeholder="Optional inspection information..."
                        />
                      </label>
                    </div>

                    {!isLand && (
                      <>
                        <div
                          className={
                            styles.unitSubSection
                          }
                        >
                          <StringListEditor
                            title="Unit Amenities"
                            values={
                              unit.amenities
                            }
                            placeholder="Unit amenity"
                            addLabel="Add Unit Amenity"
                            onChange={(
                              itemIndex,
                              value
                            ) =>
                              updateUnitArray(
                                unitIndex,
                                'amenities',
                                itemIndex,
                                value
                              )
                            }
                            onAdd={() =>
                              addUnitArrayItem(
                                unitIndex,
                                'amenities'
                              )
                            }
                            onRemove={(
                              itemIndex
                            ) =>
                              removeUnitArrayItem(
                                unitIndex,
                                'amenities',
                                itemIndex
                              )
                            }
                          />
                        </div>


                      </>
                    )}
                  </article>
                );
              }
            )}
          </div>
        </section>

        {/* =================================
            SAVE
        ================================== */}

        <div
          className={
            styles.bottomActions
          }
        >
          <div
            className={
              styles.statusHint
            }
          >
            {form.lifecycleStatus ===
              'published' ? (
              <Eye
                size={18}
                aria-hidden="true"
              />
            ) : form.lifecycleStatus ===
              'archived' ? (
              <Archive
                size={18}
                aria-hidden="true"
              />
            ) : (
              <ShieldCheck
                size={18}
                aria-hidden="true"
              />
            )}

            <span>
              {form.lifecycleStatus ===
                'published'
                ? 'Published listings are visible to public visitors.'
                : form.lifecycleStatus ===
                    'archived'
                  ? 'Archived listings remain in Admin but are hidden publicly.'
                  : 'Draft listings are saved privately until you publish them.'}
            </span>
          </div>

          <button
            type="submit"
            className={
              styles.saveButton
            }
            disabled={
              saving
            }
          >
            <CheckCircle2
              size={18}
              aria-hidden="true"
            />

            {saving
              ? 'Saving...'
              : form.lifecycleStatus ===
                  'published'
                ? isEdit
                  ? 'Save Live Listing'
                  : 'Publish Listing'
                : 'Save Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}