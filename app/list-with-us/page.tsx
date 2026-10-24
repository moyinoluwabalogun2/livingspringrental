'use client';

import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';

import Link from 'next/link';

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  CircleDollarSign,
  ClipboardCheck,
  Globe2,
  ImagePlus,
  MapPin,
  MoonStar,
  Plus,
  RotateCcw,
  School,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ListingApplicationMediaStep from '@/components/media/ListingApplicationMediaStep';

import {
  LISTING_APPLICATION_MAX_STEP,
  LISTING_APPLICATION_STORAGE_KEY,
  NIGERIAN_STATES,
  STANDARD_LISTING_PACKAGE,
  cleanApplicationDraft,
  createApplicationRoom,
  createApplicationUnitVariant,
  createListingApplicationDraft,
  formatApplicantRole,
  formatApplicationListingType,
  formatApplicationSubtype,
  formatNaira,
  type ApplicantRole,
  type ApplicationLandSizeUnit,
  type ApplicationListingPurpose,
  type ApplicationRoomType,
  type ApplicationUnitVariant,
  type ListingApplicationDraft,
  type ListingApplicationLocalState,
  type PropertyApplicationSubtype,
} from '@/lib/listingApplication';

import styles from './page.module.css';

const steps = [
  'Listing',
  'Details',
  'Location & Price',
  'Media',
  'Owner',
  'Package',
  'Review',
] as const;

type FeedbackType = 'error' | 'success' | '';

type SubmitResponse = {
  ok?: boolean;
  reference?: string;
  message?: string;
  code?: string;
};

function numberValue(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? Math.max(0, parsed)
    : 0;
}

function stepDescription(step: number) {
  switch (step) {
    case 1:
      return 'Choose what you want Living Spring to advertise.';

    case 2:
      return 'Add the details that apply to this type of listing.';

    case 3:
      return 'Tell us where it is and how it is priced.';

    case 4:
      return 'Upload clear photos and videos for the property and its unit variants.';

    case 5:
      return 'Tell Living Spring who is submitting the listing.';

    case 6:
      return 'Review the current advertising package.';

    case 7:
      return 'Review everything before sending it to Living Spring.';

    default:
      return '';
  }
}


type UnitVariantCardProps = {
  unit: ApplicationUnitVariant;
  index: number;
  label: string;
  allowRemove: boolean;
  shortletMode?: boolean;
  onUpdate: (
    patch: Partial<ApplicationUnitVariant>
  ) => void;
  onRemove: () => void;
  onUpdateFeature: (
    featureIndex: number,
    value: string
  ) => void;
  onAddFeature: () => void;
  onRemoveFeature: (
    featureIndex: number
  ) => void;
};

function UnitVariantCard({
  unit,
  index,
  label,
  allowRemove,
  shortletMode = false,
  onUpdate,
  onRemove,
  onUpdateFeature,
  onAddFeature,
  onRemoveFeature,
}: UnitVariantCardProps) {
  return (
    <div
      className={
        styles.roomCard
      }
    >
      <div
        className={
          styles.roomHeader
        }
      >
        <strong>
          {label}{' '}
          {index + 1}
        </strong>

        {allowRemove && (
          <button
            type="button"
            onClick={
              onRemove
            }
            aria-label={`Remove ${label.toLowerCase()}`}
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
          styles.miniGrid
        }
      >
        <label>
          Unit / Variant Name *

          <input
            value={
              unit.name
            }
            onChange={(
              event
            ) =>
              onUpdate({
                name:
                  event.target.value,
              })
            }
            placeholder="Self Contain, Room & Parlour, 2 Bedroom, Shop..."
          />
        </label>

        <label>
          Total Quantity

          <input
            type="number"
            min="1"
            value={
              unit.quantity
            }
            onChange={(
              event
            ) => {
              const quantity =
                Math.max(
                  1,
                  numberValue(
                    event.target.value
                  )
                );

              onUpdate({
                quantity,
                availableQuantity:
                  Math.min(
                    unit.availableQuantity,
                    quantity
                  ),
              });
            }}
          />
        </label>

        <label>
          Available Now

          <input
            type="number"
            min="0"
            max={
              unit.quantity
            }
            value={
              unit.availableQuantity
            }
            onChange={(
              event
            ) =>
              onUpdate({
                availableQuantity:
                  Math.min(
                    unit.quantity,
                    numberValue(
                      event.target.value
                    )
                  ),
              })
            }
          />
        </label>

        <label>
          Bedrooms

          <input
            type="number"
            min="0"
            value={
              unit.bedrooms
            }
            onChange={(
              event
            ) =>
              onUpdate({
                bedrooms:
                  numberValue(
                    event.target.value
                  ),
              })
            }
          />
        </label>

        <label>
          Bathrooms

          <input
            type="number"
            min="0"
            value={
              unit.bathrooms
            }
            onChange={(
              event
            ) =>
              onUpdate({
                bathrooms:
                  numberValue(
                    event.target.value
                  ),
              })
            }
          />
        </label>

        <label>
          Toilets

          <input
            type="number"
            min="0"
            value={
              unit.toilets
            }
            onChange={(
              event
            ) =>
              onUpdate({
                toilets:
                  numberValue(
                    event.target.value
                  ),
              })
            }
          />
        </label>

        {shortletMode && (
          <>
            <label>
              Maximum Guests

              <input
                type="number"
                min="1"
                value={
                  unit.maxGuests
                }
                onChange={(
                  event
                ) =>
                  onUpdate({
                    maxGuests:
                      Math.max(
                        1,
                        numberValue(
                          event.target.value
                        )
                      ),
                  })
                }
              />
            </label>

            <label>
              Minimum Stay (Nights)

              <input
                type="number"
                min="1"
                value={
                  unit.minimumStay
                }
                onChange={(
                  event
                ) =>
                  onUpdate({
                    minimumStay:
                      Math.max(
                        1,
                        numberValue(
                          event.target.value
                        )
                      ),
                  })
                }
              />
            </label>
          </>
        )}

        <label
          className={
            styles.checkField
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
              onUpdate({
                furnished:
                  event.target.checked,
              })
            }
          />

          <span>
            Furnished unit
          </span>
        </label>
      </div>

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
            onUpdate({
              description:
                event.target.value,
            })
          }
          placeholder="Describe what makes this unit different: finish, floor, kitchen, balcony, room size, private facilities..."
        />
      </label>

      <div
        className={
          styles.full
        }
      >
        <div
          className={
            styles.sectionTitleRow
          }
        >
          <div>
            <span
              className={
                styles.fieldLabel
              }
            >
              Features
            </span>

            <p>
              Add any feature that
              applies to this unit.
              POP is only one example.
            </p>
          </div>

          <button
            type="button"
            className={
              styles.smallAddButton
            }
            onClick={
              onAddFeature
            }
          >
            <Plus
              size={15}
              aria-hidden="true"
            />

            Add Feature
          </button>
        </div>

        {unit.features.map(
          (
            feature,
            featureIndex
          ) => (
            <div
              key={`${unit.id}-feature-${featureIndex}`}
              className={
                styles.arrayRow
              }
            >
              <input
                value={
                  feature
                }
                onChange={(
                  event
                ) =>
                  onUpdateFeature(
                    featureIndex,
                    event.target.value
                  )
                }
                placeholder="Balcony, wardrobe, ensuite, private kitchen, prepaid meter, water heater..."
              />

              <button
                type="button"
                onClick={() =>
                  onRemoveFeature(
                    featureIndex
                  )
                }
                aria-label="Remove feature"
              >
                <Trash2
                  size={16}
                  aria-hidden="true"
                />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function ListWithUsPage() {
  const [draft, setDraft] =
    useState<ListingApplicationDraft>(
      createListingApplicationDraft
    );

  const [step, setStep] =
    useState(1);

  const [hydrated, setHydrated] =
    useState(false);

  const [feedback, setFeedback] =
    useState('');

  const [
    feedbackType,
    setFeedbackType,
  ] =
    useState<FeedbackType>('');

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    submittedReference,
    setSubmittedReference,
  ] =
    useState('');

  useEffect(() => {
    const timer =
      window.setTimeout(() => {
        try {
          const stored =
            window.localStorage.getItem(
              LISTING_APPLICATION_STORAGE_KEY
            );

          if (stored) {
            const parsed =
              JSON.parse(
                stored
              ) as ListingApplicationLocalState;

            if (
              parsed?.draft?.version ===
              1
            ) {
              const restoredDraft =
                cleanApplicationDraft(
                  parsed.draft
                );

              setDraft({
                ...restoredDraft,

                hostelRoomTypes:
                  restoredDraft.hostelRoomTypes.length
                    ? restoredDraft.hostelRoomTypes
                    : [
                        createApplicationRoom(),
                      ],
              });

              setStep(
                Math.min(
                  LISTING_APPLICATION_MAX_STEP,
                  Math.max(
                    1,
                    Number(
                      parsed.step
                    ) || 1
                  )
                )
              );
            }
          }
        } catch (
          error
        ) {
          console.error(
            'Could not restore Living Spring listing draft:',
            error
          );
        }

        setHydrated(
          true
        );
      }, 0);

    return () =>
      window.clearTimeout(
        timer
      );
  }, []);

  useEffect(() => {
    if (
      !hydrated ||
      submittedReference
    ) {
      return;
    }

    try {
      const localState:
        ListingApplicationLocalState = {
        step,
        draft,
      };

      window.localStorage.setItem(
        LISTING_APPLICATION_STORAGE_KEY,
        JSON.stringify(
          localState
        )
      );
    } catch (
      error
    ) {
      console.error(
        'Could not save Living Spring listing draft:',
        error
      );
    }
  }, [
    draft,
    hydrated,
    step,
    submittedReference,
  ]);

  const locationPreview =
    useMemo(() => {
      const values = [
        draft.location.area,
        draft.location.city,
        draft.location.state,
      ]
        .map(
          (
            value
          ) =>
            value.trim()
        )
        .filter(
          Boolean
        );

      return values.length
        ? values.join(
            ', '
          )
        : 'Location not completed';
    }, [
      draft.location.area,
      draft.location.city,
      draft.location.state,
    ]);

  const mediaSummary =
    useMemo(() => {
      const units =
        draft.listingType ===
        'hostel'
          ? draft.hostelRoomTypes
          : draft.unitVariants;

      return units.reduce(
        (
          totals,
          unit
        ) => ({
          images:
            totals.images +
            unit.media.images.length,

          videos:
            totals.videos +
            unit.media.videos.length,
        }),
        {
          images:
            draft.generalMedia.images.length,

          videos:
            draft.generalMedia.videos.length,
        }
      );
    }, [
      draft.generalMedia,
      draft.hostelRoomTypes,
      draft.listingType,
      draft.unitVariants,
    ]);

  function updateDraft(
    patch:
      Partial<ListingApplicationDraft>
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,
        ...patch,
      })
    );
  }

  function updateLocation<
    K extends keyof ListingApplicationDraft['location'],
  >(
    field:
      K,

    value:
      ListingApplicationDraft['location'][K]
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        location: {
          ...current.location,
          [field]:
            value,
        },
      })
    );
  }

  function updateApplicant<
    K extends keyof ListingApplicationDraft['applicant'],
  >(
    field:
      K,

    value:
      ListingApplicationDraft['applicant'][K]
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        applicant: {
          ...current.applicant,
          [field]:
            value,
        },
      })
    );
  }

  function updateShortletAmenity(
    index:
      number,

    value:
      string
  ) {
    setDraft(
      (
        current
      ) => {
        const amenities = [
          ...current.shortletAmenities,
        ];

        amenities[
          index
        ] =
          value;

        return {
          ...current,
          shortletAmenities:
            amenities,
        };
      }
    );
  }

  function addShortletAmenity() {
    setDraft(
      (
        current
      ) => ({
        ...current,

        shortletAmenities: [
          ...current.shortletAmenities,
          '',
        ],
      })
    );
  }

  function removeShortletAmenity(
    index:
      number
  ) {
    setDraft(
      (
        current
      ) => {
        const amenities =
          current.shortletAmenities.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          );

        return {
          ...current,

          shortletAmenities:
            amenities.length
              ? amenities
              : [''],
        };
      }
    );
  }

  function updateRoom(
    index:
      number,

    patch:
      Partial<ApplicationRoomType>
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        hostelRoomTypes:
          current.hostelRoomTypes.map(
            (
              room,
              roomIndex
            ) =>
              roomIndex ===
              index
                ? {
                    ...room,
                    ...patch,
                  }
                : room
          ),
      })
    );
  }

  function addRoom() {
    setDraft(
      (
        current
      ) => ({
        ...current,

        hostelRoomTypes: [
          ...current.hostelRoomTypes,
          createApplicationRoom(),
        ],
      })
    );
  }

  function removeRoom(
    index:
      number
  ) {
    setDraft(
      (
        current
      ) => {
        const rooms =
          current.hostelRoomTypes.filter(
            (
              _,
              roomIndex
            ) =>
              roomIndex !==
              index
          );

        return {
          ...current,

          hostelRoomTypes:
            rooms.length
              ? rooms
              : [
                  createApplicationRoom(),
                ],
        };
      }
    );
  }


  function updateUnitVariant(
    index: number,
    patch:
      Partial<ApplicationUnitVariant>
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        unitVariants:
          current.unitVariants.map(
            (
              unit,
              unitIndex
            ) =>
              unitIndex ===
              index
                ? {
                    ...unit,
                    ...patch,
                  }
                : unit
          ),
      })
    );
  }

  function addUnitVariant() {
    setDraft(
      (
        current
      ) => ({
        ...current,

        unitVariants: [
          ...current.unitVariants,
          createApplicationUnitVariant(),
        ],
      })
    );
  }

  function removeUnitVariant(
    index: number
  ) {
    setDraft(
      (
        current
      ) => {
        const units =
          current.unitVariants.filter(
            (
              _,
              unitIndex
            ) =>
              unitIndex !==
              index
          );

        return {
          ...current,

          unitVariants:
            units.length
              ? units
              : [
                  createApplicationUnitVariant(),
                ],
        };
      }
    );
  }

  function setMultiUnitEnabled(
    enabled: boolean
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        hasMultipleUnits:
          enabled,

        unitVariants:
          enabled
            ? (
                current.unitVariants.length
                  ? current.unitVariants
                  : [
                      createApplicationUnitVariant(),
                    ]
              )
            : [],
      })
    );
  }

  function updateRoomFeature(
    roomIndex: number,
    featureIndex: number,
    value: string
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        hostelRoomTypes:
          current.hostelRoomTypes.map(
            (
              room,
              index
            ) => {
              if (
                index !==
                roomIndex
              ) {
                return room;
              }

              const features = [
                ...room.features,
              ];

              features[
                featureIndex
              ] =
                value;

              return {
                ...room,
                features,
              };
            }
          ),
      })
    );
  }

  function addRoomFeature(
    roomIndex: number
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        hostelRoomTypes:
          current.hostelRoomTypes.map(
            (
              room,
              index
            ) =>
              index ===
              roomIndex
                ? {
                    ...room,
                    features: [
                      ...room.features,
                      '',
                    ],
                  }
                : room
          ),
      })
    );
  }

  function removeRoomFeature(
    roomIndex: number,
    featureIndex: number
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        hostelRoomTypes:
          current.hostelRoomTypes.map(
            (
              room,
              index
            ) => {
              if (
                index !==
                roomIndex
              ) {
                return room;
              }

              const features =
                room.features.filter(
                  (
                    _,
                    indexToCheck
                  ) =>
                    indexToCheck !==
                    featureIndex
                );

              return {
                ...room,

                features:
                  features.length
                    ? features
                    : [''],
              };
            }
          ),
      })
    );
  }

  function updateUnitFeature(
    unitIndex: number,
    featureIndex: number,
    value: string
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        unitVariants:
          current.unitVariants.map(
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

              const features = [
                ...unit.features,
              ];

              features[
                featureIndex
              ] =
                value;

              return {
                ...unit,
                features,
              };
            }
          ),
      })
    );
  }

  function addUnitFeature(
    unitIndex: number
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        unitVariants:
          current.unitVariants.map(
            (
              unit,
              index
            ) =>
              index ===
              unitIndex
                ? {
                    ...unit,
                    features: [
                      ...unit.features,
                      '',
                    ],
                  }
                : unit
          ),
      })
    );
  }

  function removeUnitFeature(
    unitIndex: number,
    featureIndex: number
  ) {
    setDraft(
      (
        current
      ) => ({
        ...current,

        unitVariants:
          current.unitVariants.map(
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

              const features =
                unit.features.filter(
                  (
                    _,
                    indexToCheck
                  ) =>
                    indexToCheck !==
                    featureIndex
                );

              return {
                ...unit,

                features:
                  features.length
                    ? features
                    : [''],
              };
            }
          ),
      })
    );
  }

  function chooseListingType(
    listingType:
      'property'
      | 'hostel'
      | 'shortlet'
  ) {
    setDraft(
      (
        current
      ) => {
        const changingType =
          current.listingType &&
          current.listingType !==
          listingType;

        return {
          ...current,

          listingType,

          propertySubtype:
            listingType ===
            'property'
              ? current.propertySubtype
              : '',

          hasMultipleUnits:
            listingType ===
            'hostel'
              ? true
              : changingType
                ? false
                : current.hasMultipleUnits,

          unitVariants:
            changingType
              ? []
              : current.unitVariants,
        };
      }
    );

    setFeedback('');
    setFeedbackType('');
  }

  function validateStep(
    stepToValidate:
      number
  ) {
    if (
      stepToValidate ===
        1 &&
      !draft.listingType
    ) {
      return 'Choose Property, Hostel or Short-Let to continue.';
    }

    if (
      stepToValidate ===
      2
    ) {
      if (
        draft.listingType ===
          'property' &&
        !draft.propertySubtype
      ) {
        return 'Choose the property category.';
      }

      if (
        !draft.title.trim()
      ) {
        return 'Add a clear listing title.';
      }

      if (
        !draft.propertyType.trim()
      ) {
        return 'Add the specific property or accommodation type.';
      }

      if (
        draft.listingType ===
          'hostel' &&
        !draft.hostelRoomTypes.some(
          (
            room
          ) =>
            room.name.trim()
        )
      ) {
        return 'Add at least one hostel accommodation or unit variant.';
      }

      if (
        draft.listingType !==
          'hostel' &&
        draft.hasMultipleUnits &&
        !draft.unitVariants.some(
          (
            unit
          ) =>
            unit.name.trim()
        )
      ) {
        return 'Add at least one unit variant for this multi-unit listing.';
      }
    }

    if (
      stepToValidate ===
      3
    ) {
      if (
        !draft.location.state
      ) {
        return 'Select the State or FCT.';
      }

      if (
        !draft.location.city.trim()
      ) {
        return 'Add the city or LGA.';
      }

      if (
        draft.listingType ===
          'property'
      ) {
        if (
          draft.hasMultipleUnits &&
          draft.propertySubtype !==
            'land'
        ) {
          const missingPrice =
            draft.unitVariants.some(
              (
                unit
              ) =>
                unit.name.trim() &&
                unit.price <=
                  0
            );

          if (
            missingPrice
          ) {
            return 'Add a price for every property unit variant.';
          }
        } else if (
          draft.askingPrice <=
            0
        ) {
          return 'Add the asking price.';
        }
      }

      if (
        draft.listingType ===
          'hostel' &&
        draft.hostelRoomTypes.some(
          (
            room
          ) =>
            room.name.trim() &&
            room.price <=
              0
        )
      ) {
        return 'Add a price for every hostel unit variant.';
      }

      if (
        draft.listingType ===
          'shortlet'
      ) {
        if (
          draft.hasMultipleUnits
        ) {
          const missingNightlyPrice =
            draft.unitVariants.some(
              (
                unit
              ) =>
                unit.name.trim() &&
                unit.nightlyPrice <=
                  0
            );

          if (
            missingNightlyPrice
          ) {
            return 'Add a nightly price for every short-let unit.';
          }
        } else if (
          draft.shortletNightlyPrice <=
            0
        ) {
          return 'Add the short-let nightly price.';
        }
      }
    }

    if (
      stepToValidate ===
        4 &&
      mediaSummary.images ===
        0
    ) {
      return 'Upload at least one clear property photo to continue.';
    }

    if (
      stepToValidate ===
      5
    ) {
      if (
        !draft.applicant.name.trim()
      ) {
        return 'Add the owner, agent or representative name.';
      }

      if (
        !draft.applicant.phone.trim()
      ) {
        return 'Add a contact phone number.';
      }

      if (
        !draft.applicant.whatsapp.trim()
      ) {
        return 'Add a WhatsApp number.';
      }

      if (
        !draft.applicant.email.trim() ||
        !draft.applicant.email.includes(
          '@'
        )
      ) {
        return 'Add a valid email address.';
      }

      if (
        !draft.applicant.role
      ) {
        return 'Tell Living Spring whether you are the owner, agent or representative.';
      }
    }

    if (
      stepToValidate ===
        7 &&
      !draft.termsAccepted
    ) {
      return 'Confirm that the information is accurate and that you are authorised to advertise this property.';
    }

    return '';
  }

  function goNext() {
    const validation =
      validateStep(
        step
      );

    if (
      validation
    ) {
      setFeedback(
        validation
      );

      setFeedbackType(
        'error'
      );

      return;
    }

    setFeedback('');
    setFeedbackType('');

    setStep(
      (
        current
      ) =>
        Math.min(
          LISTING_APPLICATION_MAX_STEP,
          current +
            1
        )
    );

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    });
  }

  function goBack() {
    setFeedback('');
    setFeedbackType('');

    setStep(
      (
        current
      ) =>
        Math.max(
          1,
          current -
            1
        )
    );

    window.scrollTo({
      top:
        0,

      behavior:
        'smooth',
    });
  }

  function resetDraft() {
    if (
      !window.confirm(
        'Clear this saved application and start again?'
      )
    ) {
      return;
    }

    window.localStorage.removeItem(
      LISTING_APPLICATION_STORAGE_KEY
    );

    setDraft(
      createListingApplicationDraft()
    );

    setStep(
      1
    );

    setFeedback('');
    setFeedbackType('');
    setSubmittedReference('');
  }

  async function submitApplication(
    event:
      FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validation =
      validateStep(
        7
      );

    if (
      validation
    ) {
      setFeedback(
        validation
      );

      setFeedbackType(
        'error'
      );

      return;
    }

    setSubmitting(
      true
    );

    setFeedback('');
    setFeedbackType('');

    try {
      const response =
        await fetch(
          '/api/listing-applications',
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                cleanApplicationDraft(
                  draft
                )
              ),
          }
        );

      const result =
        (
          await response.json()
        ) as
          SubmitResponse;

      if (
        !response.ok ||
        result.ok !==
          true ||
        !result.reference
      ) {
        setFeedback(
          result.message ||
            'The application could not be submitted. Your draft is still saved on this device.'
        );

        setFeedbackType(
          'error'
        );

        return;
      }

      window.localStorage.removeItem(
        LISTING_APPLICATION_STORAGE_KEY
      );

      setSubmittedReference(
        result.reference
      );

      setFeedbackType(
        'success'
      );
    } catch (
      error
    ) {
      console.error(
        'Living Spring listing application failed:',
        error
      );

      setFeedback(
        'The application could not be submitted. Your draft is still saved on this device.'
      );

      setFeedbackType(
        'error'
      );
    } finally {
      setSubmitting(
        false
      );
    }
  }

  if (
    submittedReference
  ) {
    return (
      <>
        <Navbar />

        <main
          className={
            styles.successPage
          }
        >
          <div
            className={
              styles.successCard
            }
          >
            <div
              className={
                styles.successIcon
              }
            >
              <CheckCircle2
                size={34}
                aria-hidden="true"
              />
            </div>

            <span>
              Application Received
            </span>

            <h1>
              Thank you for listing with Living Spring.
            </h1>

            <p>
              Your application is waiting for review. Payment is not due until
              the application has been approved.
            </p>

            <div
              className={
                styles.referenceBox
              }
            >
              <small>
                Application Reference
              </small>

              <strong>
                {
                  submittedReference
                }
              </strong>
            </div>

            <div
              className={
                styles.successSteps
              }
            >
              <div>
                <strong>
                  1
                </strong>

                <span>
                  Living Spring reviews the listing
                </span>
              </div>

              <div>
                <strong>
                  2
                </strong>

                <span>
                  Approved applications receive payment instructions
                </span>
              </div>

              <div>
                <strong>
                  3
                </strong>

                <span>
                  The listing is published after verified payment
                </span>
              </div>
            </div>

            <Link
              href="/"
              className="btn btn-gold"
            >
              Return Home

              <ArrowRight
                size={18}
                aria-hidden="true"
              />
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main
        className={
          styles.page
        }
      >
        <section
          className={
            styles.hero
          }
        >
          <div className="container">
            <div
              className={
                styles.heroGrid
              }
            >
              <div>
                <span
                  className={
                    styles.eyebrow
                  }
                >
                  <BadgeCheck
                    size={16}
                    aria-hidden="true"
                  />

                  Advertise With Living Spring
                </span>

                <h1>
                  Put your property in front of people looking for a place.
                </h1>

                <p>
                  Submit land, buildings, hostel accommodation or a short-let
                  directly to Living Spring. We review every application before
                  payment and publication.
                </p>
              </div>

              <div
                className={
                  styles.heroPackage
                }
              >
                <span>
                  Standard Listing
                </span>

                <strong>
                  ₦20,000
                </strong>

                <small>
                  30 days after publication
                </small>

                <div>
                  <Check
                    size={16}
                    aria-hidden="true"
                  />

                  Review before payment
                </div>

                <div>
                  <Check
                    size={16}
                    aria-hidden="true"
                  />

                  Living Spring controlled publication
                </div>

                <div>
                  <Check
                    size={16}
                    aria-hidden="true"
                  />

                  No landlord account required
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className={
            styles.formSection
          }
        >
          <div className="container">
            <div
              className={
                styles.formLayout
              }
            >
              <aside
                className={
                  styles.progressCard
                }
              >
                <div
                  className={
                    styles.progressHeader
                  }
                >
                  <span>
                    Application
                  </span>

                  <strong>
                    Step {step} of{' '}
                    {
                      LISTING_APPLICATION_MAX_STEP
                    }
                  </strong>
                </div>

                <div
                  className={
                    styles.progressBar
                  }
                >
                  <span
                    style={{
                      width:
                        `${(step / LISTING_APPLICATION_MAX_STEP) * 100}%`,
                    }}
                  />
                </div>

                <ol
                  className={
                    styles.stepList
                  }
                >
                  {steps.map(
                    (
                      label,
                      index
                    ) => {
                      const number =
                        index +
                        1;

                      const completed =
                        number <
                        step;

                      const active =
                        number ===
                        step;

                      return (
                        <li
                          key={
                            label
                          }
                          className={
                            active
                              ? styles.activeStep
                              : completed
                                ? styles.completedStep
                                : ''
                          }
                        >
                          <span>
                            {completed ? (
                              <Check
                                size={14}
                                aria-hidden="true"
                              />
                            ) : (
                              number
                            )}
                          </span>

                          <div>
                            <strong>
                              {label}
                            </strong>

                            {active && (
                              <small>
                                {stepDescription(
                                  number
                                )}
                              </small>
                            )}
                          </div>
                        </li>
                      );
                    }
                  )}
                </ol>

                <div
                  className={
                    styles.autosave
                  }
                >
                  <ShieldCheck
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    Your progress is automatically saved on this device.
                  </span>
                </div>

                <button
                  type="button"
                  className={
                    styles.resetButton
                  }
                  onClick={
                    resetDraft
                  }
                >
                  <RotateCcw
                    size={15}
                    aria-hidden="true"
                  />

                  Start Again
                </button>
              </aside>

              <form
                className={
                  styles.formCard
                }
                onSubmit={
                  submitApplication
                }
              >
                <div
                  className={
                    styles.formHeading
                  }
                >
                  <span>
                    Step {step}
                  </span>

                  <h2>
                    {
                      steps[
                        step -
                          1
                      ]
                    }
                  </h2>

                  <p>
                    {stepDescription(
                      step
                    )}
                  </p>
                </div>

                {feedback && (
                  <div
                    className={
                      feedbackType ===
                      'error'
                        ? styles.errorMessage
                        : styles.successMessage
                    }
                    role="status"
                  >
                    {
                      feedback
                    }
                  </div>
                )}

                {step ===
                  1 && (
                  <div
                    className={
                      styles.serviceGrid
                    }
                  >
                    <button
                      type="button"
                      className={
                        draft.listingType ===
                        'property'
                          ? styles.selectedCard
                          : ''
                      }
                      onClick={() =>
                        chooseListingType(
                          'property'
                        )
                      }
                    >
                      <Building2
                        size={30}
                        aria-hidden="true"
                      />

                      <strong>
                        Property
                      </strong>

                      <span>
                        Land, houses, flats, shops, offices, warehouses and
                        commercial property.
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        draft.listingType ===
                        'hostel'
                          ? styles.selectedCard
                          : ''
                      }
                      onClick={() =>
                        chooseListingType(
                          'hostel'
                        )
                      }
                    >
                      <School
                        size={30}
                        aria-hidden="true"
                      />

                      <strong>
                        Hostel
                      </strong>

                      <span>
                        A hostel building with one or more room or unit types.
                      </span>
                    </button>

                    <button
                      type="button"
                      className={
                        draft.listingType ===
                        'shortlet'
                          ? styles.selectedCard
                          : ''
                      }
                      onClick={() =>
                        chooseListingType(
                          'shortlet'
                        )
                      }
                    >
                      <MoonStar
                        size={30}
                        aria-hidden="true"
                      />

                      <strong>
                        Short-Let
                      </strong>

                      <span>
                        Furnished accommodation for nightly, weekly or temporary
                        stays.
                      </span>
                    </button>
                  </div>
                )}

                {step ===
                  2 && (
                  <div
                    className={
                      styles.fields
                    }
                  >
                    {draft.listingType ===
                      'property' && (
                      <div
                        className={
                          styles.full
                        }
                      >
                        <span
                          className={
                            styles.fieldLabel
                          }
                        >
                          Property Category
                        </span>

                        <div
                          className={
                            styles.subtypeGrid
                          }
                        >
                          {(
                            [
                              [
                                'land',
                                'Land',
                              ],
                              [
                                'residential',
                                'House / Building / Residential',
                              ],
                              [
                                'commercial',
                                'Commercial Property',
                              ],
                            ] as const
                          ).map(
                            (
                              [
                                value,
                                label,
                              ]
                            ) => (
                              <button
                                key={
                                  value
                                }
                                type="button"
                                className={
                                  draft.propertySubtype ===
                                  value
                                    ? styles.selectedSubtype
                                    : ''
                                }
                                onClick={() => {
                                  if (
                                    value ===
                                    'land'
                                  ) {
                                    setDraft(
                                      (
                                        current
                                      ) => ({
                                        ...current,

                                        propertySubtype:
                                          value as
                                            PropertyApplicationSubtype,

                                        hasMultipleUnits:
                                          false,

                                        unitVariants:
                                          [],
                                      })
                                    );

                                    return;
                                  }

                                  updateDraft({
                                    propertySubtype:
                                      value as
                                        PropertyApplicationSubtype,
                                  });
                                }}
                              >
                                {
                                  label
                                }
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    <label
                      className={
                        styles.full
                      }
                    >
                      Listing Title *

                      <input
                        value={
                          draft.title
                        }
                        onChange={(
                          event
                        ) =>
                          updateDraft({
                            title:
                              event.target.value,
                          })
                        }
                        placeholder={
                          draft.listingType ===
                          'hostel'
                            ? 'e.g. Modern Student Hostel Near Campus'
                            : draft.listingType ===
                                'shortlet'
                              ? 'e.g. Furnished Apartment Building in Lekki'
                              : 'e.g. Block of Flats for Rent'
                        }
                      />
                    </label>

                    <label
                      className={
                        styles.full
                      }
                    >
                      Specific Type *

                      <input
                        value={
                          draft.propertyType
                        }
                        onChange={(
                          event
                        ) =>
                          updateDraft({
                            propertyType:
                              event.target.value,
                          })
                        }
                        placeholder={
                          draft.listingType ===
                          'hostel'
                            ? 'e.g. Student Hostel / Multi-unit Accommodation'
                            : draft.listingType ===
                                'shortlet'
                              ? 'e.g. Serviced Apartment / Short-Let Building'
                              : draft.propertySubtype ===
                                  'land'
                                ? 'e.g. Residential Land'
                                : 'e.g. Duplex, Block of Flats, Plaza, Warehouse...'
                        }
                      />
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
                          draft.description
                        }
                        onChange={(
                          event
                        ) =>
                          updateDraft({
                            description:
                              event.target.value,
                          })
                        }
                        placeholder="Describe the property, its condition, access, surroundings and important features..."
                      />
                    </label>

                    {draft.listingType ===
                      'property' &&
                      draft.propertySubtype !==
                        'land' && (
                      <label
                        className={`${styles.checkField} ${styles.full}`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            draft.hasMultipleUnits
                          }
                          onChange={(
                            event
                          ) =>
                            setMultiUnitEnabled(
                              event.target.checked
                            )
                          }
                        />

                        <span>
                          This property/building has multiple separately priced or rentable units.
                        </span>
                      </label>
                    )}

                    {draft.listingType ===
                      'shortlet' && (
                      <label
                        className={`${styles.checkField} ${styles.full}`}
                      >
                        <input
                          type="checkbox"
                          checked={
                            draft.hasMultipleUnits
                          }
                          onChange={(
                            event
                          ) =>
                            setMultiUnitEnabled(
                              event.target.checked
                            )
                          }
                        />

                        <span>
                          This short-let property has multiple independently bookable apartments or units.
                        </span>
                      </label>
                    )}

                    {draft.listingType ===
                      'hostel' && (
                      <div
                        className={
                          styles.full
                        }
                      >
                        <div
                          className={
                            styles.sectionTitleRow
                          }
                        >
                          <div>
                            <span
                              className={
                                styles.fieldLabel
                              }
                            >
                              Accommodation / Unit Variants
                            </span>

                            <p>
                              Add each materially different accommodation option. Variants can differ by price, finish, facilities, layout, furnishing or any other feature.
                            </p>
                          </div>

                          <button
                            type="button"
                            className={
                              styles.smallAddButton
                            }
                            onClick={
                              addRoom
                            }
                          >
                            <Plus
                              size={15}
                              aria-hidden="true"
                            />

                            Add Variant
                          </button>
                        </div>

                        <div
                          className={
                            styles.roomList
                          }
                        >
                          {draft.hostelRoomTypes.map(
                            (
                              room,
                              index
                            ) => (
                              <UnitVariantCard
                                key={
                                  room.id
                                }
                                unit={
                                  room
                                }
                                index={
                                  index
                                }
                                label="Accommodation Variant"
                                allowRemove={
                                  draft.hostelRoomTypes.length >
                                  1
                                }
                                onUpdate={(
                                  patch
                                ) =>
                                  updateRoom(
                                    index,
                                    patch
                                  )
                                }
                                onRemove={() =>
                                  removeRoom(
                                    index
                                  )
                                }
                                onUpdateFeature={(
                                  featureIndex,
                                  value
                                ) =>
                                  updateRoomFeature(
                                    index,
                                    featureIndex,
                                    value
                                  )
                                }
                                onAddFeature={() =>
                                  addRoomFeature(
                                    index
                                  )
                                }
                                onRemoveFeature={(
                                  featureIndex
                                ) =>
                                  removeRoomFeature(
                                    index,
                                    featureIndex
                                  )
                                }
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {draft.listingType !==
                      'hostel' &&
                      draft.hasMultipleUnits && (
                      <div
                        className={
                          styles.full
                        }
                      >
                        <div
                          className={
                            styles.sectionTitleRow
                          }
                        >
                          <div>
                            <span
                              className={
                                styles.fieldLabel
                              }
                            >
                              Unit Variants
                            </span>

                            <p>
                              Add every separately priced or bookable unit type. One variant can represent many identical physical units.
                            </p>
                          </div>

                          <button
                            type="button"
                            className={
                              styles.smallAddButton
                            }
                            onClick={
                              addUnitVariant
                            }
                          >
                            <Plus
                              size={15}
                              aria-hidden="true"
                            />

                            Add Unit
                          </button>
                        </div>

                        <div
                          className={
                            styles.roomList
                          }
                        >
                          {draft.unitVariants.map(
                            (
                              unit,
                              index
                            ) => (
                              <UnitVariantCard
                                key={
                                  unit.id
                                }
                                unit={
                                  unit
                                }
                                index={
                                  index
                                }
                                label="Unit Variant"
                                allowRemove={
                                  draft.unitVariants.length >
                                  1
                                }
                                shortletMode={
                                  draft.listingType ===
                                  'shortlet'
                                }
                                onUpdate={(
                                  patch
                                ) =>
                                  updateUnitVariant(
                                    index,
                                    patch
                                  )
                                }
                                onRemove={() =>
                                  removeUnitVariant(
                                    index
                                  )
                                }
                                onUpdateFeature={(
                                  featureIndex,
                                  value
                                ) =>
                                  updateUnitFeature(
                                    index,
                                    featureIndex,
                                    value
                                  )
                                }
                                onAddFeature={() =>
                                  addUnitFeature(
                                    index
                                  )
                                }
                                onRemoveFeature={(
                                  featureIndex
                                ) =>
                                  removeUnitFeature(
                                    index,
                                    featureIndex
                                  )
                                }
                              />
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {draft.listingType ===
                      'shortlet' &&
                      !draft.hasMultipleUnits && (
                      <>
                        <label>
                          Bedrooms

                          <input
                            type="number"
                            min="0"
                            value={
                              draft.shortletBedrooms
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                shortletBedrooms:
                                  numberValue(
                                    event.target.value
                                  ),
                              })
                            }
                          />
                        </label>

                        <label>
                          Bathrooms

                          <input
                            type="number"
                            min="0"
                            value={
                              draft.shortletBathrooms
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                shortletBathrooms:
                                  numberValue(
                                    event.target.value
                                  ),
                              })
                            }
                          />
                        </label>

                        <label>
                          Maximum Guests

                          <input
                            type="number"
                            min="1"
                            value={
                              draft.shortletMaxGuests
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                shortletMaxGuests:
                                  Math.max(
                                    1,
                                    numberValue(
                                      event.target.value
                                    )
                                  ),
                              })
                            }
                          />
                        </label>

                        <label>
                          Minimum Stay (Nights)

                          <input
                            type="number"
                            min="1"
                            value={
                              draft.shortletMinimumStay
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                shortletMinimumStay:
                                  Math.max(
                                    1,
                                    numberValue(
                                      event.target.value
                                    )
                                  ),
                              })
                            }
                          />
                        </label>

                        <label
                          className={
                            styles.checkField
                          }
                        >
                          <input
                            type="checkbox"
                            checked={
                              draft.shortletFurnished
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                shortletFurnished:
                                  event.target.checked,
                              })
                            }
                          />

                          <span>
                            Furnished accommodation
                          </span>
                        </label>
                      </>
                    )}
                  </div>
                )}

                {step ===
                  3 && (
                  <div
                    className={
                      styles.fields
                    }
                  >
                    <div
                      className={`${styles.locationPreview} ${styles.full}`}
                    >
                      <MapPin
                        size={18}
                        aria-hidden="true"
                      />

                      <div>
                        <span>
                          Location Preview
                        </span>

                        <strong>
                          {
                            locationPreview
                          }
                        </strong>
                      </div>
                    </div>

                    <label>
                      Country

                      <input
                        value="Nigeria"
                        disabled
                      />
                    </label>

                    <label>
                      State / FCT *

                      <select
                        value={
                          draft.location.state
                        }
                        onChange={(
                          event
                        ) =>
                          updateLocation(
                            'state',
                            event.target.value
                          )
                        }
                      >
                        <option value="">
                          Select State
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
                              {
                                state
                              }
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label>
                      City / LGA *

                      <input
                        value={
                          draft.location.city
                        }
                        onChange={(
                          event
                        ) =>
                          updateLocation(
                            'city',
                            event.target.value
                          )
                        }
                        placeholder="e.g. Lekki, Sagamu, Gwarinpa"
                      />
                    </label>

                    <label>
                      Area / Neighbourhood

                      <input
                        value={
                          draft.location.area
                        }
                        onChange={(
                          event
                        ) =>
                          updateLocation(
                            'area',
                            event.target.value
                          )
                        }
                        placeholder="e.g. Ikate, GRA, Ijagun"
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
                          draft.location.address
                        }
                        onChange={(
                          event
                        ) =>
                          updateLocation(
                            'address',
                            event.target.value
                          )
                        }
                        placeholder="Full property address"
                      />
                    </label>

                    <label
                      className={
                        styles.full
                      }
                    >
                      Nearby Landmark

                      <input
                        value={
                          draft.location.landmark
                        }
                        onChange={(
                          event
                        ) =>
                          updateLocation(
                            'landmark',
                            event.target.value
                          )
                        }
                        placeholder="Near a school, hotel, junction, market or estate gate"
                      />
                    </label>

                    {draft.listingType ===
                      'property' && (
                      <label>
                        Listing Purpose

                        <select
                          value={
                            draft.listingPurpose
                          }
                          onChange={(
                            event
                          ) =>
                            updateDraft({
                              listingPurpose:
                                event.target.value as
                                  ApplicationListingPurpose,
                            })
                          }
                        >
                          <option value="rent">
                            Rent
                          </option>

                          <option value="sale">
                            Sale
                          </option>

                          <option value="lease">
                            Lease
                          </option>
                        </select>
                      </label>
                    )}

                    {draft.listingType ===
                      'property' &&
                      (
                        !draft.hasMultipleUnits ||
                        draft.propertySubtype ===
                          'land'
                      ) && (
                      <label>
                        Asking Price *

                        <input
                          type="number"
                          min="0"
                          value={
                            draft.askingPrice ||
                            ''
                          }
                          onChange={(
                            event
                          ) =>
                            updateDraft({
                              askingPrice:
                                numberValue(
                                  event.target.value
                                ),
                            })
                          }
                          placeholder="Amount in naira"
                        />
                      </label>
                    )}

                    {draft.listingType ===
                      'property' &&
                      draft.propertySubtype ===
                        'land' && (
                      <>
                        <label>
                          Land Size

                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={
                              draft.landSize ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                landSize:
                                  numberValue(
                                    event.target.value
                                  ),
                              })
                            }
                            placeholder="e.g. 600"
                          />
                        </label>

                        <label>
                          Size Unit

                          <select
                            value={
                              draft.landSizeUnit
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                landSizeUnit:
                                  event.target.value as
                                    ApplicationLandSizeUnit,
                              })
                            }
                          >
                            <option value="sqm">
                              Square metres
                            </option>

                            <option value="plot">
                              Plot(s)
                            </option>

                            <option value="acre">
                              Acre(s)
                            </option>

                            <option value="hectare">
                              Hectare(s)
                            </option>

                            <option value="other">
                              Other
                            </option>
                          </select>
                        </label>

                        <label
                          className={
                            styles.full
                          }
                        >
                          Title / Property Document

                          <input
                            value={
                              draft.titleDocument
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                titleDocument:
                                  event.target.value,
                              })
                            }
                            placeholder="e.g. C of O, Registered Survey, Deed of Assignment..."
                          />
                        </label>
                      </>
                    )}

                    {draft.listingType ===
                      'property' &&
                      draft.propertySubtype !==
                        'land' &&
                      !draft.hasMultipleUnits && (
                      <>
                        <label>
                          Bedrooms

                          <input
                            type="number"
                            min="0"
                            value={
                              draft.propertyBedrooms
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                propertyBedrooms:
                                  numberValue(
                                    event.target.value
                                  ),
                              })
                            }
                          />
                        </label>

                        <label>
                          Bathrooms

                          <input
                            type="number"
                            min="0"
                            value={
                              draft.propertyBathrooms
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                propertyBathrooms:
                                  numberValue(
                                    event.target.value
                                  ),
                              })
                            }
                          />
                        </label>
                      </>
                    )}

                    {draft.listingType ===
                      'property' &&
                      draft.hasMultipleUnits &&
                      draft.propertySubtype !==
                        'land' &&
                      draft.unitVariants.map(
                        (
                          unit,
                          index
                        ) => (
                          <div
                            key={
                              unit.id
                            }
                            className={`${styles.priceRoom} ${styles.full}`}
                          >
                            <strong>
                              {unit.name ||
                                `Unit Variant ${index + 1}`}
                            </strong>

                            <div
                              className={
                                styles.miniGrid
                              }
                            >
                              <label>
                                Price *

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
                                    updateUnitVariant(
                                      index,
                                      {
                                        price:
                                          numberValue(
                                            event.target.value
                                          ),
                                      }
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
                                    updateUnitVariant(
                                      index,
                                      {
                                        pricePeriod:
                                          event.target.value as
                                            ApplicationUnitVariant['pricePeriod'],
                                      }
                                    )
                                  }
                                >
                                  <option value="year">
                                    Per Year
                                  </option>

                                  <option value="month">
                                    Per Month
                                  </option>

                                  <option value="week">
                                    Per Week
                                  </option>

                                  <option value="one-time">
                                    One-Time
                                  </option>
                                </select>
                              </label>
                            </div>
                          </div>
                        )
                      )}

                    {draft.listingType ===
                      'hostel' &&
                      draft.hostelRoomTypes.map(
                        (
                          room,
                          index
                        ) => (
                          <div
                            key={
                              room.id
                            }
                            className={`${styles.priceRoom} ${styles.full}`}
                          >
                            <strong>
                              {room.name ||
                                `Accommodation Variant ${index + 1}`}
                            </strong>

                            <div
                              className={
                                styles.miniGrid
                              }
                            >
                              <label>
                                Price *

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    room.price ||
                                    ''
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateRoom(
                                      index,
                                      {
                                        price:
                                          numberValue(
                                            event.target.value
                                          ),
                                      }
                                    )
                                  }
                                  placeholder="Amount in naira"
                                />
                              </label>

                              <label>
                                Price Period

                                <select
                                  value={
                                    room.pricePeriod
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateRoom(
                                      index,
                                      {
                                        pricePeriod:
                                          event.target.value as
                                            ApplicationRoomType['pricePeriod'],
                                      }
                                    )
                                  }
                                >
                                  <option value="year">
                                    Per Year
                                  </option>

                                  <option value="month">
                                    Per Month
                                  </option>

                                  <option value="week">
                                    Per Week
                                  </option>

                                  <option value="one-time">
                                    One-Time
                                  </option>
                                </select>
                              </label>
                            </div>
                          </div>
                        )
                      )}

                    {draft.listingType ===
                      'shortlet' &&
                      draft.hasMultipleUnits &&
                      draft.unitVariants.map(
                        (
                          unit,
                          index
                        ) => (
                          <div
                            key={
                              unit.id
                            }
                            className={`${styles.priceRoom} ${styles.full}`}
                          >
                            <strong>
                              {unit.name ||
                                `Short-Let Unit ${index + 1}`}
                            </strong>

                            <div
                              className={
                                styles.miniGrid
                              }
                            >
                              <label>
                                Nightly Price *

                                <input
                                  type="number"
                                  min="0"
                                  value={
                                    unit.nightlyPrice ||
                                    ''
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateUnitVariant(
                                      index,
                                      {
                                        nightlyPrice:
                                          numberValue(
                                            event.target.value
                                          ),
                                      }
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
                                    unit.weeklyPrice ||
                                    ''
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateUnitVariant(
                                      index,
                                      {
                                        weeklyPrice:
                                          numberValue(
                                            event.target.value
                                          ),
                                      }
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
                                    unit.monthlyPrice ||
                                    ''
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    updateUnitVariant(
                                      index,
                                      {
                                        monthlyPrice:
                                          numberValue(
                                            event.target.value
                                          ),
                                      }
                                    )
                                  }
                                  placeholder="Optional"
                                />
                              </label>
                            </div>
                          </div>
                        )
                      )}

                    {draft.listingType ===
                      'shortlet' &&
                      !draft.hasMultipleUnits && (
                      <>
                        <label>
                          Nightly Price *

                          <input
                            type="number"
                            min="0"
                            value={
                              draft.shortletNightlyPrice ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                shortletNightlyPrice:
                                  numberValue(
                                    event.target.value
                                  ),
                              })
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
                              draft.shortletWeeklyPrice ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                shortletWeeklyPrice:
                                  numberValue(
                                    event.target.value
                                  ),
                              })
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
                              draft.shortletMonthlyPrice ||
                              ''
                            }
                            onChange={(
                              event
                            ) =>
                              updateDraft({
                                shortletMonthlyPrice:
                                  numberValue(
                                    event.target.value
                                  ),
                              })
                            }
                            placeholder="Optional"
                          />
                        </label>
                      </>
                    )}

                    {draft.listingType ===
                      'shortlet' && (
                      <div
                        className={
                          styles.full
                        }
                      >
                        <div
                          className={
                            styles.sectionTitleRow
                          }
                        >
                          <div>
                            <span
                              className={
                                styles.fieldLabel
                              }
                            >
                              General Amenities
                            </span>

                            <p>
                              Add amenities that apply to the short-let property generally.
                            </p>
                          </div>

                          <button
                            type="button"
                            className={
                              styles.smallAddButton
                            }
                            onClick={
                              addShortletAmenity
                            }
                          >
                            <Plus
                              size={15}
                              aria-hidden="true"
                            />

                            Add Amenity
                          </button>
                        </div>

                        {draft.shortletAmenities.map(
                          (
                            amenity,
                            index
                          ) => (
                            <div
                              key={`amenity-${index}`}
                              className={
                                styles.arrayRow
                              }
                            >
                              <input
                                value={
                                  amenity
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateShortletAmenity(
                                    index,
                                    event.target.value
                                  )
                                }
                                placeholder="Wi-Fi, parking, generator, air conditioning..."
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeShortletAmenity(
                                    index
                                  )
                                }
                                aria-label="Remove amenity"
                              >
                                <Trash2
                                  size={16}
                                  aria-hidden="true"
                                />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )}

                {step ===
                  4 && (
                  <ListingApplicationMediaStep
                    draft={
                      draft
                    }
                    onChange={
                      setDraft
                    }
                  />
                )}

                {step ===
                  5 && (
                  <div
                    className={
                      styles.fields
                    }
                  >
                    <label>
                      Full Name *

                      <input
                        value={
                          draft.applicant.name
                        }
                        onChange={(
                          event
                        ) =>
                          updateApplicant(
                            'name',
                            event.target.value
                          )
                        }
                        placeholder="Your full name"
                      />
                    </label>

                    <label>
                      Your Role *

                      <select
                        value={
                          draft.applicant.role
                        }
                        onChange={(
                          event
                        ) =>
                          updateApplicant(
                            'role',
                            event.target.value as
                              ApplicantRole
                          )
                        }
                      >
                        <option value="">
                          Select role
                        </option>

                        <option value="owner">
                          Property Owner
                        </option>

                        <option value="agent">
                          Agent
                        </option>

                        <option value="representative">
                          Owner Representative
                        </option>
                      </select>
                    </label>

                    <label>
                      Phone Number *

                      <input
                        type="tel"
                        value={
                          draft.applicant.phone
                        }
                        onChange={(
                          event
                        ) =>
                          updateApplicant(
                            'phone',
                            event.target.value
                          )
                        }
                        placeholder="+234..."
                      />
                    </label>

                    <label>
                      WhatsApp Number *

                      <input
                        type="tel"
                        value={
                          draft.applicant.whatsapp
                        }
                        onChange={(
                          event
                        ) =>
                          updateApplicant(
                            'whatsapp',
                            event.target.value
                          )
                        }
                        placeholder="+234..."
                      />
                    </label>

                    <label>
                      Email Address *

                      <input
                        type="email"
                        value={
                          draft.applicant.email
                        }
                        onChange={(
                          event
                        ) =>
                          updateApplicant(
                            'email',
                            event.target.value
                          )
                        }
                        placeholder="you@example.com"
                      />
                    </label>

                    <label>
                      Company / Agency

                      <input
                        value={
                          draft.applicant.company
                        }
                        onChange={(
                          event
                        ) =>
                          updateApplicant(
                            'company',
                            event.target.value
                          )
                        }
                        placeholder="Optional"
                      />
                    </label>

                    <label
                      className={
                        styles.full
                      }
                    >
                      Website / Social Page

                      <input
                        type="url"
                        value={
                          draft.applicant.website
                        }
                        onChange={(
                          event
                        ) =>
                          updateApplicant(
                            'website',
                            event.target.value
                          )
                        }
                        placeholder="Optional"
                      />
                    </label>

                    <div
                      className={
                        styles.honeypot
                      }
                      aria-hidden="true"
                    >
                      <label>
                        Website

                        <input
                          tabIndex={
                            -1
                          }
                          autoComplete="off"
                          value={
                            draft.website
                          }
                          onChange={(
                            event
                          ) =>
                            updateDraft({
                              website:
                                event.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}

                {step ===
                  6 && (
                  <div
                    className={
                      styles.packageArea
                    }
                  >
                    <div
                      className={
                        styles.packageCard
                      }
                    >
                      <div
                        className={
                          styles.packageTop
                        }
                      >
                        <div>
                          <span>
                            Advertising Package
                          </span>

                          <h3>
                            {
                              STANDARD_LISTING_PACKAGE.name
                            }
                          </h3>
                        </div>

                        <div
                          className={
                            styles.packageCheck
                          }
                        >
                          <Check
                            size={18}
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <strong
                        className={
                          styles.packagePrice
                        }
                      >
                        {formatNaira(
                          STANDARD_LISTING_PACKAGE.priceNaira
                        )}
                      </strong>

                      <p>
                        {
                          STANDARD_LISTING_PACKAGE.description
                        }
                      </p>

                      <div
                        className={
                          styles.packageFeatures
                        }
                      >
                        <span>
                          <Check
                            size={15}
                            aria-hidden="true"
                          />

                          30-day listing
                        </span>

                        <span>
                          <Check
                            size={15}
                            aria-hidden="true"
                          />

                          Living Spring review
                        </span>

                        <span>
                          <Check
                            size={15}
                            aria-hidden="true"
                          />

                          Property detail page
                        </span>

                        <span>
                          <Check
                            size={15}
                            aria-hidden="true"
                          />

                          Direct enquiries
                        </span>
                      </div>
                    </div>

                    <div
                      className={
                        styles.paymentNotice
                      }
                    >
                      <CircleDollarSign
                        size={21}
                        aria-hidden="true"
                      />

                      <div>
                        <strong>
                          Do not pay yet.
                        </strong>

                        <p>
                          Living Spring reviews the application first. Approved
                          applications receive payment instructions. Your
                          30-day advertising period begins only when the listing
                          is published.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {step ===
                  7 && (
                  <div
                    className={
                      styles.review
                    }
                  >
                    <div
                      className={
                        styles.reviewSection
                      }
                    >
                      <div
                        className={
                          styles.reviewHeading
                        }
                      >
                        <Building2
                          size={19}
                          aria-hidden="true"
                        />

                        <strong>
                          Listing
                        </strong>
                      </div>

                      <dl>
                        <div>
                          <dt>
                            Type
                          </dt>

                          <dd>
                            {formatApplicationListingType(
                              draft.listingType
                            )}
                          </dd>
                        </div>

                        {draft.listingType ===
                          'property' && (
                          <div>
                            <dt>
                              Category
                            </dt>

                            <dd>
                              {formatApplicationSubtype(
                                draft.propertySubtype
                              )}
                            </dd>
                          </div>
                        )}

                        <div>
                          <dt>
                            Title
                          </dt>

                          <dd>
                            {
                              draft.title
                            }
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Specific Type
                          </dt>

                          <dd>
                            {
                              draft.propertyType
                            }
                          </dd>
                        </div>

                        {(draft.listingType ===
                          'hostel' ||
                          draft.hasMultipleUnits) && (
                          <div>
                            <dt>
                              Unit Variants
                            </dt>

                            <dd>
                              {draft.listingType ===
                              'hostel'
                                ? draft.hostelRoomTypes.filter(
                                    (
                                      unit
                                    ) =>
                                      unit.name.trim()
                                  ).length
                                : draft.unitVariants.filter(
                                    (
                                      unit
                                    ) =>
                                      unit.name.trim()
                                  ).length}
                            </dd>
                          </div>
                        )}
                      </dl>
                    </div>

                    <div
                      className={
                        styles.reviewSection
                      }
                    >
                      <div
                        className={
                          styles.reviewHeading
                        }
                      >
                        <Globe2
                          size={19}
                          aria-hidden="true"
                        />

                        <strong>
                          Location
                        </strong>
                      </div>

                      <dl>
                        <div>
                          <dt>
                            Public Area
                          </dt>

                          <dd>
                            {
                              locationPreview
                            }
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Address
                          </dt>

                          <dd>
                            {draft.location.address ||
                              'Not provided'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div
                      className={
                        styles.reviewSection
                      }
                    >
                      <div
                        className={
                          styles.reviewHeading
                        }
                      >
                        <UserRound
                          size={19}
                          aria-hidden="true"
                        />

                        <strong>
                          Applicant
                        </strong>
                      </div>

                      <dl>
                        <div>
                          <dt>
                            Name
                          </dt>

                          <dd>
                            {
                              draft.applicant.name
                            }
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Role
                          </dt>

                          <dd>
                            {formatApplicantRole(
                              draft.applicant.role
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Phone
                          </dt>

                          <dd>
                            {
                              draft.applicant.phone
                            }
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Email
                          </dt>

                          <dd>
                            {
                              draft.applicant.email
                            }
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div
                      className={
                        styles.reviewSection
                      }
                    >
                      <div
                        className={
                          styles.reviewHeading
                        }
                      >
                        <ImagePlus
                          size={19}
                          aria-hidden="true"
                        />

                        <strong>
                          Media
                        </strong>
                      </div>

                      <p>
                        {mediaSummary.images}{' '}
                        photo
                        {mediaSummary.images ===
                        1
                          ? ''
                          : 's'}

                        {mediaSummary.videos >
                        0
                          ? ` • ${mediaSummary.videos} video${
                              mediaSummary.videos ===
                              1
                                ? ''
                                : 's'
                            }`
                          : ''}
                      </p>
                    </div>

                    <div
                      className={
                        styles.reviewSection
                      }
                    >
                      <div
                        className={
                          styles.reviewHeading
                        }
                      >
                        <CircleDollarSign
                          size={19}
                          aria-hidden="true"
                        />

                        <strong>
                          Package
                        </strong>
                      </div>

                      <dl>
                        <div>
                          <dt>
                            Package
                          </dt>

                          <dd>
                            Standard
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Listing Fee
                          </dt>

                          <dd>
                            ₦20,000
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Duration
                          </dt>

                          <dd>
                            30 days from publication
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <label
                      className={
                        styles.confirmation
                      }
                    >
                      <input
                        type="checkbox"
                        checked={
                          draft.termsAccepted
                        }
                        onChange={(
                          event
                        ) =>
                          updateDraft({
                            termsAccepted:
                              event.target.checked,
                          })
                        }
                      />

                      <span>
                        I confirm that the information supplied is accurate to
                        the best of my knowledge and that I am authorised to
                        advertise this property.
                      </span>
                    </label>

                    <div
                      className={
                        styles.reviewNotice
                      }
                    >
                      <ClipboardCheck
                        size={20}
                        aria-hidden="true"
                      />

                      <p>
                        Submission does not automatically publish the property.
                        Living Spring may approve it, ask for changes or reject
                        it before payment.
                      </p>
                    </div>
                  </div>
                )}

                <div
                  className={
                    styles.actions
                  }
                >
                  {step >
                  1 ? (
                    <button
                      type="button"
                      className={
                        styles.backButton
                      }
                      onClick={
                        goBack
                      }
                    >
                      <ArrowLeft
                        size={17}
                        aria-hidden="true"
                      />

                      Back
                    </button>
                  ) : (
                    <Link
                      href="/"
                      className={
                        styles.backButton
                      }
                    >
                      <ArrowLeft
                        size={17}
                        aria-hidden="true"
                      />

                      Home
                    </Link>
                  )}

                  {step <
                  LISTING_APPLICATION_MAX_STEP ? (
                    <button
                      type="button"
                      className={
                        styles.nextButton
                      }
                      onClick={
                        goNext
                      }
                    >
                      Continue

                      <ArrowRight
                        size={17}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className={
                        styles.submitButton
                      }
                      disabled={
                        submitting
                      }
                    >
                      <CheckCircle2
                        size={18}
                        aria-hidden="true"
                      />

                      {submitting
                        ? 'Submitting...'
                        : 'Submit for Review'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}