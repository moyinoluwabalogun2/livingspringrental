'use client';

import Link
  from 'next/link';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useParams,
} from 'next/navigation';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  ShieldCheck,
  Toilet,
  Users,
} from 'lucide-react';

import {
  FaWhatsapp,
} from 'react-icons/fa';

import {
  db,
} from '@/lib/firebase';

import Navbar
  from '@/components/Navbar';

import Footer
  from '@/components/Footer';

import MediaGallery
  from '@/components/property/MediaGallery';

import AvailabilityCalendar
  from '@/components/availability/AvailabilityCalendar';

import SimilarProperties
  from '@/components/SimilarProperties';

import {
  buildAvailabilityCalendarId,
} from '@/lib/availability';

import {
  formatLandSize,
  formatListingSource,
  formatPrice,
  formatPropertyService,
  getAvailableQuantity,
  getPublicLocation,
  getStartingPrice,
  getTotalAvailableUnits,
  getUnitDisplayPrice,
  isLandProperty,
  isPublicProperty,
  normalizeProperty,
  type PropertyRecord,
  type PropertyUnit,
} from '@/lib/property';

import {
  getWhatsAppHref,
  siteConfig,
} from '@/lib/site';

import styles
  from './page.module.css';

/* =========================================
   HELPERS
========================================= */

function cleanMediaList(
  values:
    Array<
      string | undefined
    >
) {
  return Array.from(
    new Set(
      values
        .map(
          (
            value
          ) =>
            String(
              value ||
              ''
            ).trim()
        )
        .filter(
          Boolean
        )
    )
  );
}

function formatStatus(
  value:
    string
) {
  return value
    .replaceAll(
      '-',
      ' '
    )
    .replaceAll(
      '_',
      ' '
    )
    .replace(
      /\b\w/g,
      (
        character
      ) =>
        character
          .toUpperCase()
    );
}

function getBackRoute(
  service:
    PropertyRecord[
      'serviceType'
    ]
) {
  if (
    service ===
    'hostel'
  ) {
    return '/hostel';
  }

  if (
    service ===
    'shortlet'
  ) {
    return '/shortlet';
  }

  return '/properties';
}

function getBackLabel(
  service:
    PropertyRecord[
      'serviceType'
    ]
) {
  if (
    service ===
    'hostel'
  ) {
    return 'Back to Hostels';
  }

  if (
    service ===
    'shortlet'
  ) {
    return 'Back to Short-Lets';
  }

  return 'Back to Properties';
}

function extractGoogleMapUrl(
  value:
    string
) {
  const input =
    value.trim();

  if (!input) {
    return '';
  }

  const iframeSourceMatch =
    input.match(
      /src\s*=\s*["']([^"']+)["']/i
    );

  const possibleUrl =
    (
      iframeSourceMatch?.[
        1
      ] ||
      input
    )
      .replaceAll(
        '&amp;',
        '&'
      )
      .trim();

  try {
    const parsed =
      new URL(
        possibleUrl
      );

    const hostname =
      parsed.hostname
        .toLowerCase();

    const isGoogle =
      hostname ===
        'google.com' ||
      hostname ===
        'maps.google.com' ||
      hostname.endsWith(
        '.google.com'
      );

    if (!isGoogle) {
      return '';
    }

    if (
      parsed.pathname.includes(
        '/maps/embed'
      ) ||
      parsed.searchParams.get(
        'output'
      ) ===
        'embed'
    ) {
      return parsed
        .toString();
    }

    const query =
      parsed.searchParams.get(
        'q'
      );

    if (query) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        query
      )}&z=16&output=embed`;
    }
  } catch {
    return '';
  }

  return '';
}

function buildPublicMapUrl(
  property:
    PropertyRecord
) {
  /*
   * If Living Spring has explicitly
   * chosen to expose the exact address,
   * precise map data is allowed.
   */
  if (
    property.showFullAddress
  ) {
    const storedMap =
      extractGoogleMapUrl(
        property.mapEmbedUrl
      );

    if (
      storedMap
    ) {
      return storedMap;
    }

    if (
      property.latitude !==
        null &&
      property.longitude !==
        null
    ) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        `${property.latitude},${property.longitude}`
      )}&z=17&output=embed`;
    }

    if (
      property.address
        .trim()
    ) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        property.address
      )}&z=17&output=embed`;
    }
  }

  /*
   * Privacy-safe fallback:
   * only map the public area/city/state,
   * not saved coordinates or exact address.
   */
  const publicLocation =
    getPublicLocation(
      property
    );

  if (
    !publicLocation ||
    publicLocation ===
      'Nigeria'
  ) {
    return '';
  }

  return `https://www.google.com/maps?q=${encodeURIComponent(
    publicLocation
  )}&z=13&output=embed`;
}

function findPreferredUnit(
  property:
    PropertyRecord
):
  PropertyUnit | null {
  if (
    !property.units
      .length
  ) {
    return null;
  }

  return (
    property.units.find(
      (
        unit
      ) =>
        getAvailableQuantity(
          unit
        ) > 0
    ) ||
    property.units[0] ||
    null
  );
}

/* =========================================
   PAGE
========================================= */

export default function PropertyDetailsPage() {
  const params =
    useParams<{
      id:
        string;
    }>();

  const propertyId =
    String(
      params?.id ||
      ''
    ).trim();

  const [
    property,
    setProperty,
  ] =
    useState<
      PropertyRecord | null
    >(null);

  const [
    selectedUnitId,
    setSelectedUnitId,
  ] =
    useState('');

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState('');

  /* =======================================
     LOAD PROPERTY
  ======================================= */

  useEffect(() => {
    let active =
      true;

    async function loadProperty() {
      if (
        !propertyId
      ) {
        setError(
          'The listing ID is missing.'
        );

        setLoading(
          false
        );

        return;
      }

      setLoading(
        true
      );

      setError(
        ''
      );

      try {
        const snapshot =
          await getDoc(
            doc(
              db,
              'properties',
              propertyId
            )
          );

        if (
          !snapshot.exists()
        ) {
          if (
            active
          ) {
            setError(
              'This listing could not be found.'
            );
          }

          return;
        }

        const normalized =
          normalizeProperty(
            snapshot.id,
            snapshot.data()
          );

        if (
          !isPublicProperty(
            normalized
          )
        ) {
          if (
            active
          ) {
            setError(
              'This listing is not currently available publicly.'
            );
          }

          return;
        }

        const preferredUnit =
          findPreferredUnit(
            normalized
          );

        if (
          active
        ) {
          setProperty(
            normalized
          );

          setSelectedUnitId(
            preferredUnit?.id ||
            ''
          );
        }
      } catch (
        loadError
      ) {
        console.error(
          'Failed to load listing:',
          loadError
        );

        if (
          active
        ) {
          setProperty(
            null
          );

          setError(
            'Living Spring could not load this listing. Please try again.'
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

  /* =======================================
     DERIVED DATA
  ======================================= */

  const selectedUnit =
    useMemo(() => {
      if (
        !property ||
        !property.units
          .length
      ) {
        return null;
      }

      if (
        selectedUnitId
      ) {
        const selected =
          property.units.find(
            (
              unit
            ) =>
              unit.id ===
              selectedUnitId
          );

        if (
          selected
        ) {
          return selected;
        }
      }

      return findPreferredUnit(
        property
      );
    }, [
      property,
      selectedUnitId,
    ]);

  const galleryMedia =
    useMemo(() => {
      if (
        !property
      ) {
        return [];
      }

      return cleanMediaList([
        property.coverImage,

        ...property.media,

        ...(selectedUnit
          ?.media ||
          []),
      ]);
    }, [
      property,
      selectedUnit,
    ]);

  const amenities =
    useMemo(() => {
      if (
        !property
      ) {
        return [];
      }

      return Array.from(
        new Set(
          [
            ...property
              .amenities,

            ...(selectedUnit
              ?.amenities ||
              []),
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
        )
      );
    }, [
      property,
      selectedUnit,
    ]);

  /* =======================================
     STATES
  ======================================= */

  if (
    loading
  ) {
    return (
      <>
        <Navbar />

        <main
          className={
            styles.statePage
          }
        >
          <div
            className={
              styles.stateCard
            }
          >
            <div
              className={
                styles.spinner
              }
            />

            <h1>
              Loading listing...
            </h1>

            <p>
              Please wait while
              Living Spring
              retrieves the
              property information.
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (
    error ||
    !property
  ) {
    return (
      <>
        <Navbar />

        <main
          className={
            styles.statePage
          }
        >
          <div
            className={
              styles.stateCard
            }
          >
            <Building2
              size={42}
              aria-hidden="true"
            />

            <h1>
              Listing unavailable
            </h1>

            <p>
              {error ||
                'This listing is not currently available.'}
            </p>

            <Link
              href="/properties"
              className="btn btn-gold"
            >
              <ArrowLeft
                size={18}
                aria-hidden="true"
              />

              Browse Listings
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  /* =======================================
     PROPERTY-SPECIFIC VALUES
  ======================================= */

  const isLand =
    isLandProperty(
      property
    );

  const serviceLabel =
    formatPropertyService(
      property.serviceType
    );

  const sourceLabel =
    formatListingSource(
      property.listingSource
    );

  const publicLocation =
    getPublicLocation(
      property
    );

  const totalAvailable =
    getTotalAvailableUnits(
      property
    );

  const startingPrice =
    getStartingPrice(
      property
    );

  const selectedPrice =
    selectedUnit
      ? getUnitDisplayPrice(
          selectedUnit,
          property.serviceType
        )
      : startingPrice;

  const priceText =
    selectedPrice
      ? formatPrice(
          selectedPrice.amount,
          selectedPrice.period
        )
      : 'Price on request';

  const propertyName =
    property.title ||
    `${serviceLabel} Listing`;

  const selectedUnitName =
    selectedUnit
      ?.unitType ||
    '';

  const backHref =
    getBackRoute(
      property.serviceType
    );

  const backLabel =
    getBackLabel(
      property.serviceType
    );

  const mapEmbedUrl =
    buildPublicMapUrl(
      property
    );

  const calendarId =
    property.serviceType ===
    'shortlet'
      ? buildAvailabilityCalendarId({
          propertyId:
            property.id,

          unitId:
            selectedUnit
              ?.id,

          propertyName,

          unitName:
            selectedUnitName,

          locationSlug:
            property
              .locationSlug,
        })
      : '';

  const configuredSiteUrl =
    siteConfig.siteUrl
      .replace(
        /\/+$/,
        ''
      );

  const pageUrl =
    configuredSiteUrl
      ? `${configuredSiteUrl}/properties/${property.id}`
      : '';

  const enquiryType =
    property.serviceType ===
    'shortlet'
      ? 'stay'
      : isLand
        ? 'land'
        : property.serviceType ===
            'hostel'
          ? 'hostel'
          : 'property';

  const whatsappMessage = [
    'Hello Living Spring,',
    '',
    `I am interested in this ${enquiryType}: ${propertyName}`,
    selectedUnitName
      ? `Option: ${selectedUnitName}`
      : '',
    `Price: ${priceText}`,
    publicLocation
      ? `Location: ${publicLocation}`
      : '',
    '',
    property.serviceType ===
    'shortlet'
      ? 'Please confirm availability for my intended stay.'
      : 'Please confirm availability and let me know how I can arrange an inspection.',
    pageUrl
      ? `Listing: ${pageUrl}`
      : '',
  ]
    .filter(
      Boolean
    )
    .join(
      '\n'
    );

  const whatsappHref =
    getWhatsAppHref(
      whatsappMessage
    );

  const contactHref =
    `/contact?property=${encodeURIComponent(
      propertyName
    )}&unit=${encodeURIComponent(
      selectedUnitName
    )}&price=${encodeURIComponent(
      priceText
    )}`;

  const bookingHref =
    `/book?propertyId=${encodeURIComponent(
      property.id
    )}${
      selectedUnit
        ?.id
        ? `&unitId=${encodeURIComponent(
            selectedUnit.id
          )}`
        : ''
    }`;

  return (
    <>
      <Navbar />

      <main
        className={
          styles.page
        }
      >
        {/* =================================
            HERO
        ================================== */}

        <section
          className={
            styles.hero
          }
        >
          <div className="container">
            <Link
              href={
                backHref
              }
              className={
                styles.backLink
              }
            >
              <ArrowLeft
                size={17}
                aria-hidden="true"
              />

              {backLabel}
            </Link>

            <div
              className={
                styles.heroGrid
              }
            >
              <div
                className={
                  styles.heroMain
                }
              >
                <div
                  className={
                    styles.badges
                  }
                >
                  <span
                    className={
                      styles.badge
                    }
                  >
                    {serviceLabel}
                  </span>

                  {property.serviceType ===
                    'property' &&
                    property.listingPurpose && (
                      <span
                        className={
                          styles.badge
                        }
                      >
                        {
                          property.listingPurpose
                        }
                      </span>
                    )}

                  <span
                    className={
                      styles.sourceBadge
                    }
                  >
                    <ShieldCheck
                      size={13}
                      aria-hidden="true"
                    />

                    {sourceLabel}
                  </span>

                  {property.featured && (
                    <span
                      className={
                        styles.featuredBadge
                      }
                    >
                      Featured
                    </span>
                  )}
                </div>

                <h1>
                  {propertyName}
                </h1>

                <p
                  className={
                    styles.heroLocation
                  }
                >
                  <MapPin
                    size={18}
                    aria-hidden="true"
                  />

                  {publicLocation}
                </p>
              </div>

              <div
                className={
                  styles.heroPricePanel
                }
              >
                <span
                  className={
                    styles.priceKicker
                  }
                >
                  {selectedUnitName
                    ? selectedUnitName
                    : isLand
                      ? 'Land price'
                      : 'Starting price'}
                </span>

                <strong
                  className={
                    styles.price
                  }
                >
                  {priceText}
                </strong>

                {selectedUnitName && (
                  <span
                    className={
                      styles.priceUnit
                    }
                  >
                    Selected option
                  </span>
                )}

                {property.units
                  .length >
                  0 && (
                  <span
                    className={
                      totalAvailable >
                      0
                        ? styles.availabilityPill
                        : styles.unavailablePill
                    }
                  >
                    {totalAvailable >
                    0
                      ? property.serviceType ===
                          'hostel'
                        ? `${totalAvailable} available`
                        : 'Available'
                      : 'Confirm availability'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =================================
            GALLERY
        ================================== */}

        <section
          className={
            styles.gallerySection
          }
        >
          <div className="container">
            <MediaGallery
              title={
                propertyName
              }
              media={
                galleryMedia
              }
            />
          </div>
        </section>

        {/* =================================
            CONTENT
        ================================== */}

        <section
          className={
            styles.contentSection
          }
        >
          <div className="container">
            <div
              className={
                styles.layout
              }
            >
              <div
                className={
                  styles.mainColumn
                }
              >
                {/* =========================
                    UNIT / ROOM OPTIONS
                ========================== */}

                {!isLand &&
                  property.units
                    .length >
                    0 && (
                    <section
                      className={
                        styles.sectionCard
                      }
                    >
                      <div
                        className={
                          styles.sectionHeading
                        }
                      >
                        <span>
                          {property.serviceType ===
                          'hostel'
                            ? 'Room Types'
                            : property.serviceType ===
                                'shortlet'
                              ? 'Stay Options'
                              : 'Property Units'}
                        </span>

                        <h2>
                          {property.serviceType ===
                          'hostel'
                            ? 'Choose an available room type'
                            : property.serviceType ===
                                'shortlet'
                              ? 'Choose your accommodation option'
                              : 'Choose a unit'}
                        </h2>

                        <p>
                          Select an option
                          to update the
                          price, media and
                          details shown on
                          this page.
                        </p>
                      </div>

                      <div
                        className={
                          styles.optionsGrid
                        }
                      >
                        {property.units.map(
                          (
                            unit,
                            index
                          ) => {
                            const unitPrice =
                              getUnitDisplayPrice(
                                unit,
                                property.serviceType
                              );

                            const availableQuantity =
                              getAvailableQuantity(
                                unit
                              );

                            const quantity =
                              unit.quantity ??
                              1;

                            const active =
                              selectedUnit?.id ===
                              unit.id;

                            return (
                              <button
                                type="button"
                                key={
                                  unit.id ||
                                  index
                                }
                                className={`${styles.optionCard} ${
                                  active
                                    ? styles.activeOption
                                    : ''
                                }`}
                                onClick={() =>
                                  setSelectedUnitId(
                                    unit.id
                                  )
                                }
                              >
                                <div
                                  className={
                                    styles.optionTop
                                  }
                                >
                                  <div>
                                    <span>
                                      {property.serviceType ===
                                      'hostel'
                                        ? 'Room type'
                                        : 'Option'}{' '}
                                      {index +
                                        1}
                                    </span>

                                    <h3>
                                      {unit.unitType ||
                                        'Accommodation'}
                                    </h3>
                                  </div>

                                  <span
                                    className={`${styles.optionStatus} ${
                                      availableQuantity >
                                      0
                                        ? styles.availableStatus
                                        : styles.unavailableStatus
                                    }`}
                                  >
                                    {formatStatus(
                                      unit.status
                                    )}
                                  </span>
                                </div>

                                <strong
                                  className={
                                    styles.optionPrice
                                  }
                                >
                                  {unitPrice
                                    ? formatPrice(
                                        unitPrice.amount,
                                        unitPrice.period
                                      )
                                    : 'Price on request'}
                                </strong>

                                {property.serviceType ===
                                  'hostel' && (
                                  <p
                                    className={
                                      styles.optionQuantity
                                    }
                                  >
                                    {availableQuantity}{' '}
                                    of{' '}
                                    {quantity}{' '}
                                    currently
                                    available
                                  </p>
                                )}

                                <div
                                  className={
                                    styles.optionMeta
                                  }
                                >
                                  {unit.bedrooms >
                                    0 && (
                                    <span>
                                      <BedDouble
                                        size={15}
                                        aria-hidden="true"
                                      />

                                      {
                                        unit.bedrooms
                                      }{' '}
                                      bed
                                    </span>
                                  )}

                                  {unit.bathrooms >
                                    0 && (
                                    <span>
                                      <Bath
                                        size={15}
                                        aria-hidden="true"
                                      />

                                      {
                                        unit.bathrooms
                                      }{' '}
                                      bath
                                    </span>
                                  )}

                                  {unit.maxGuests >
                                    0 && (
                                    <span>
                                      <Users
                                        size={15}
                                        aria-hidden="true"
                                      />

                                      {
                                        unit.maxGuests
                                      }{' '}
                                      guests
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          }
                        )}
                      </div>

                      {selectedUnit && (
                        <div
                          className={
                            styles.unitDetails
                          }
                        >
                          <div
                            className={
                              styles.unitDetailsGrid
                            }
                          >
                            {selectedUnit.bedrooms >
                              0 && (
                              <div
                                className={
                                  styles.detailItem
                                }
                              >
                                <BedDouble
                                  size={20}
                                  aria-hidden="true"
                                />

                                <span>
                                  Bedrooms
                                </span>

                                <strong>
                                  {
                                    selectedUnit.bedrooms
                                  }
                                </strong>
                              </div>
                            )}

                            {selectedUnit.bathrooms >
                              0 && (
                              <div
                                className={
                                  styles.detailItem
                                }
                              >
                                <Bath
                                  size={20}
                                  aria-hidden="true"
                                />

                                <span>
                                  Bathrooms
                                </span>

                                <strong>
                                  {
                                    selectedUnit.bathrooms
                                  }
                                </strong>
                              </div>
                            )}

                            {selectedUnit.toilets >
                              0 && (
                              <div
                                className={
                                  styles.detailItem
                                }
                              >
                                <Toilet
                                  size={20}
                                  aria-hidden="true"
                                />

                                <span>
                                  Toilets
                                </span>

                                <strong>
                                  {
                                    selectedUnit.toilets
                                  }
                                </strong>
                              </div>
                            )}

                            {selectedUnit.maxGuests >
                              0 && (
                              <div
                                className={
                                  styles.detailItem
                                }
                              >
                                <Users
                                  size={20}
                                  aria-hidden="true"
                                />

                                <span>
                                  Max Guests
                                </span>

                                <strong>
                                  {
                                    selectedUnit.maxGuests
                                  }
                                </strong>
                              </div>
                            )}
                          </div>

                          {selectedUnit.description && (
                            <div
                              className={
                                styles.unitDescription
                              }
                            >
                              <h3>
                                About this
                                option
                              </h3>

                              <p>
                                {
                                  selectedUnit.description
                                }
                              </p>
                            </div>
                          )}

                          {selectedUnit.inspectionNotes && (
                            <div
                              className={
                                styles.notice
                              }
                            >
                              <CheckCircle2
                                size={19}
                                aria-hidden="true"
                              />

                              <div>
                                <strong>
                                  Inspection
                                  information
                                </strong>

                                <p>
                                  {
                                    selectedUnit.inspectionNotes
                                  }
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  )}

                {/* =========================
                    LAND DETAILS
                ========================== */}

                {isLand && (
                  <section
                    className={
                      styles.sectionCard
                    }
                  >
                    <div
                      className={
                        styles.sectionHeading
                      }
                    >
                      <span>
                        Land Information
                      </span>

                      <h2>
                        Key land details
                      </h2>

                      <p>
                        Important land
                        information is
                        separated from
                        normal building
                        specifications.
                      </p>
                    </div>

                    <div
                      className={
                        styles.landGrid
                      }
                    >
                      <div
                        className={
                          styles.landFact
                        }
                      >
                        <Maximize2
                          size={22}
                          aria-hidden="true"
                        />

                        <span>
                          Land size
                        </span>

                        <strong>
                          {formatLandSize(
                            property.landSize,
                            property.landSizeUnit
                          ) ||
                            'Ask Living Spring'}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.landFact
                        }
                      >
                        <FileText
                          size={22}
                          aria-hidden="true"
                        />

                        <span>
                          Title /
                          Document
                        </span>

                        <strong>
                          {property.titleDocument ||
                            'Available on request'}
                        </strong>
                      </div>

                      <div
                        className={
                          styles.landFact
                        }
                      >
                        <Building2
                          size={22}
                          aria-hidden="true"
                        />

                        <span>
                          Purpose
                        </span>

                        <strong>
                          {property.listingPurpose ||
                            'Enquire'}
                        </strong>
                      </div>
                    </div>
                  </section>
                )}

                {/* =========================
                    SHORT-LET RATES
                ========================== */}

                {property.serviceType ===
                  'shortlet' &&
                  selectedUnit && (
                    <section
                      className={
                        styles.sectionCard
                      }
                    >
                      <div
                        className={
                          styles.sectionHeading
                        }
                      >
                        <span>
                          Stay Pricing
                        </span>

                        <h2>
                          Rates & stay
                          information
                        </h2>
                      </div>

                      <div
                        className={
                          styles.shortletRates
                        }
                      >
                        {selectedUnit.nightlyRate >
                          0 && (
                          <div
                            className={
                              styles.rate
                            }
                          >
                            <span>
                              Per night
                            </span>

                            <strong>
                              {formatPrice(
                                selectedUnit.nightlyRate,
                                'night'
                              )}
                            </strong>
                          </div>
                        )}

                        {selectedUnit.weeklyRate >
                          0 && (
                          <div
                            className={
                              styles.rate
                            }
                          >
                            <span>
                              Per week
                            </span>

                            <strong>
                              {formatPrice(
                                selectedUnit.weeklyRate,
                                'week'
                              )}
                            </strong>
                          </div>
                        )}

                        {selectedUnit.monthlyRate >
                          0 && (
                          <div
                            className={
                              styles.rate
                            }
                          >
                            <span>
                              Per month
                            </span>

                            <strong>
                              {formatPrice(
                                selectedUnit.monthlyRate,
                                'month'
                              )}
                            </strong>
                          </div>
                        )}

                        {selectedUnit.cleaningFee >
                          0 && (
                          <div
                            className={
                              styles.rate
                            }
                          >
                            <span>
                              Cleaning fee
                            </span>

                            <strong>
                              {new Intl.NumberFormat(
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
                                selectedUnit.cleaningFee
                              )}
                            </strong>
                          </div>
                        )}

                        {selectedUnit.cautionDeposit >
                          0 && (
                          <div
                            className={
                              styles.rate
                            }
                          >
                            <span>
                              Caution deposit
                            </span>

                            <strong>
                              {new Intl.NumberFormat(
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
                                selectedUnit.cautionDeposit
                              )}
                            </strong>
                          </div>
                        )}
                      </div>

                      <div
                        className={
                          styles.stayRules
                        }
                      >
                        <div>
                          <Clock3
                            size={20}
                            aria-hidden="true"
                          />

                          <span>
                            Check-in
                          </span>

                          <strong>
                            {property.checkInTime ||
                              'Confirm time'}
                          </strong>
                        </div>

                        <div>
                          <Clock3
                            size={20}
                            aria-hidden="true"
                          />

                          <span>
                            Check-out
                          </span>

                          <strong>
                            {property.checkOutTime ||
                              'Confirm time'}
                          </strong>
                        </div>

                        <div>
                          <CalendarDays
                            size={20}
                            aria-hidden="true"
                          />

                          <span>
                            Minimum stay
                          </span>

                          <strong>
                            {Math.max(
                              1,
                              property.minStayNights ||
                                1
                            )}{' '}
                            {Math.max(
                              1,
                              property.minStayNights ||
                                1
                            ) ===
                            1
                              ? 'night'
                              : 'nights'}
                          </strong>
                        </div>

                        <div>
                          <Users
                            size={20}
                            aria-hidden="true"
                          />

                          <span>
                            Guests
                          </span>

                          <strong>
                            Up to{' '}
                            {selectedUnit.maxGuests ||
                              property.maxGuests ||
                              '—'}
                          </strong>
                        </div>
                      </div>
                    </section>
                  )}

                {/* =========================
                    OVERVIEW
                ========================== */}

                <section
                  className={
                    styles.sectionCard
                  }
                >
                  <div
                    className={
                      styles.sectionHeading
                    }
                  >
                    <span>
                      Overview
                    </span>

                    <h2>
                      About this{' '}
                      {property.serviceType ===
                      'shortlet'
                        ? 'stay'
                        : property.serviceType ===
                            'hostel'
                          ? 'hostel'
                          : isLand
                            ? 'land'
                            : 'property'}
                    </h2>
                  </div>

                  <p
                    className={
                      styles.description
                    }
                  >
                    {property.description ||
                      `Contact Living Spring for complete information about this ${enquiryType}.`}
                  </p>

                  <div
                    className={
                      styles.factsGrid
                    }
                  >
                    <div
                      className={
                        styles.fact
                      }
                    >
                      <Building2
                        size={20}
                        aria-hidden="true"
                      />

                      <span>
                        Type
                      </span>

                      <strong>
                        {property.propertyType ||
                          serviceLabel}
                      </strong>
                    </div>

                    <div
                      className={
                        styles.fact
                      }
                    >
                      <MapPin
                        size={20}
                        aria-hidden="true"
                      />

                      <span>
                        Location
                      </span>

                      <strong>
                        {publicLocation}
                      </strong>
                    </div>

                    <div
                      className={
                        styles.fact
                      }
                    >
                      <ShieldCheck
                        size={20}
                        aria-hidden="true"
                      />

                      <span>
                        Listing Source
                      </span>

                      <strong>
                        {sourceLabel}
                      </strong>
                    </div>

                    {property.serviceType ===
                      'property' && (
                      <div
                        className={
                          styles.fact
                        }
                      >
                        <FileText
                          size={20}
                          aria-hidden="true"
                        />

                        <span>
                          Listing Purpose
                        </span>

                        <strong>
                          {property.listingPurpose ||
                            'Enquire'}
                        </strong>
                      </div>
                    )}
                  </div>
                </section>

                {/* =========================
                    AMENITIES
                ========================== */}

                {amenities.length >
                  0 && (
                  <section
                    className={
                      styles.sectionCard
                    }
                  >
                    <div
                      className={
                        styles.sectionHeading
                      }
                    >
                      <span>
                        Features
                      </span>

                      <h2>
                        Amenities &
                        facilities
                      </h2>
                    </div>

                    <div
                      className={
                        styles.amenitiesGrid
                      }
                    >
                      {amenities.map(
                        (
                          amenity
                        ) => (
                          <div
                            key={
                              amenity
                            }
                            className={
                              styles.amenity
                            }
                          >
                            <CheckCircle2
                              size={17}
                              aria-hidden="true"
                            />

                            <span>
                              {amenity}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* =========================
                    LANDMARKS
                ========================== */}

                {property
                  .nearbyLandmarks
                  .length >
                  0 && (
                  <section
                    className={
                      styles.sectionCard
                    }
                  >
                    <div
                      className={
                        styles.sectionHeading
                      }
                    >
                      <span>
                        Nearby
                      </span>

                      <h2>
                        Landmarks &
                        useful places
                      </h2>
                    </div>

                    <div
                      className={
                        styles.landmarksList
                      }
                    >
                      {property.nearbyLandmarks.map(
                        (
                          landmark
                        ) => (
                          <div
                            key={
                              landmark
                            }
                            className={
                              styles.landmark
                            }
                          >
                            <MapPin
                              size={17}
                              aria-hidden="true"
                            />

                            <span>
                              {
                                landmark
                              }
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {/* =========================
                    SHORT-LET AVAILABILITY
                ========================== */}

                {property.serviceType ===
                  'shortlet' &&
                  calendarId && (
                    <section
                      className={
                        styles.sectionCard
                      }
                    >
                      <div
                        className={
                          styles.sectionHeading
                        }
                      >
                        <span>
                          Availability
                        </span>

                        <h2>
                          Check your
                          intended dates
                        </h2>

                        <p>
                          Dates marked
                          reserved, booked,
                          blocked or under
                          maintenance are
                          unavailable.
                        </p>
                      </div>

                      <div
                        className={
                          styles.calendarWrap
                        }
                      >
                        <AvailabilityCalendar
                          calendarId={
                            calendarId
                          }
                          overallStatus={
                            selectedUnit
                              ?.status
                          }
                        />
                      </div>
                    </section>
                  )}

                {/* =========================
                    MAP
                ========================== */}

                {mapEmbedUrl && (
                  <section
                    className={
                      styles.sectionCard
                    }
                  >
                    <div
                      className={
                        styles.sectionHeading
                      }
                    >
                      <span>
                        Location
                      </span>

                      <h2>
                        {property.showFullAddress
                          ? 'Property location'
                          : 'Approximate area'}
                      </h2>

                      <p>
                        {property.showFullAddress
                          ? 'The advertiser has allowed the exact property location to be displayed.'
                          : 'The exact address is withheld publicly. The map shows the general listing area.'}
                      </p>
                    </div>

                    <div
                      className={
                        styles.mapFrame
                      }
                    >
                      <iframe
                        src={
                          mapEmbedUrl
                        }
                        title={`${propertyName} location`}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </section>
                )}
              </div>

              {/* =============================
                  SIDEBAR
              ============================== */}

              <aside
                className={
                  styles.sidebar
                }
              >
                <div
                  className={
                    styles.contactCard
                  }
                >
                  <span
                    className={
                      styles.contactKicker
                    }
                  >
                    {property.serviceType ===
                    'shortlet'
                      ? 'Interested in this stay?'
                      : isLand
                        ? 'Interested in this land?'
                        : property.serviceType ===
                            'hostel'
                          ? 'Interested in this hostel?'
                          : 'Interested in this property?'}
                  </span>

                  <h2>
                    {property.serviceType ===
                    'shortlet'
                      ? 'Request your stay'
                      : 'Arrange an inspection'}
                  </h2>

                  <p>
                    {property.serviceType ===
                    'shortlet'
                      ? 'Confirm your dates and availability with Living Spring before making any travel plans.'
                      : 'Confirm current availability with Living Spring and arrange a suitable inspection time.'}
                  </p>

                  <div
                    className={
                      styles.selectedSummary
                    }
                  >
                    <div
                      className={
                        styles.summaryRow
                      }
                    >
                      <span>
                        Listing
                      </span>

                      <strong>
                        {propertyName}
                      </strong>
                    </div>

                    {selectedUnitName && (
                      <div
                        className={
                          styles.summaryRow
                        }
                      >
                        <span>
                          Selected
                        </span>

                        <strong>
                          {
                            selectedUnitName
                          }
                        </strong>
                      </div>
                    )}

                    <div
                      className={
                        styles.summaryRow
                      }
                    >
                      <span>
                        Price
                      </span>

                      <strong>
                        {priceText}
                      </strong>
                    </div>

                    <div
                      className={
                        styles.summaryRow
                      }
                    >
                      <span>
                        Location
                      </span>

                      <strong>
                        {publicLocation}
                      </strong>
                    </div>
                  </div>

                  {property.serviceType ===
                    'shortlet' && (
                    <Link
                      href={
                        bookingHref
                      }
                      className={
                        styles.bookingButton
                      }
                    >
                      <CalendarDays
                        size={18}
                        aria-hidden="true"
                      />

                      Request Booking
                    </Link>
                  )}

                  {whatsappHref && (
                    <a
                      href={
                        whatsappHref
                      }
                      target="_blank"
                      rel="noreferrer"
                      className={
                        styles.whatsappButton
                      }
                    >
                      <FaWhatsapp
                        aria-hidden="true"
                      />

                      WhatsApp Living
                      Spring
                    </a>
                  )}

                  <Link
                    href={
                      contactHref
                    }
                    className={
                      styles.enquiryButton
                    }
                  >
                    <Mail
                      size={18}
                      aria-hidden="true"
                    />

                    Send Enquiry
                  </Link>

                  {siteConfig
                    .contactPhone && (
                    <a
                      href={`tel:${siteConfig.contactPhone}`}
                      className={
                        styles.directContact
                      }
                    >
                      <Phone
                        size={17}
                        aria-hidden="true"
                      />

                      {
                        siteConfig.contactPhone
                      }
                    </a>
                  )}

                  {siteConfig
                    .contactEmail && (
                    <a
                      href={`mailto:${siteConfig.contactEmail}`}
                      className={
                        styles.directContact
                      }
                    >
                      <Mail
                        size={17}
                        aria-hidden="true"
                      />

                      {
                        siteConfig.contactEmail
                      }
                    </a>
                  )}

                  <div
                    className={
                      styles.notice
                    }
                  >
                    <ShieldCheck
                      size={18}
                      aria-hidden="true"
                    />

                    <p>
                      Confirm
                      availability,
                      inspection or
                      booking details
                      before travelling
                      or making any
                      arrangement.
                    </p>
                  </div>
                </div>
              </aside>
            </div>

            {/* =============================
                SIMILAR LISTINGS
            ============================== */}

            <div
              className={
                styles.similarSection
              }
            >
              <SimilarProperties
                currentPropertyId={
                  property.id
                }
                category={
                  property.category
                }
                serviceType={
                  property.serviceType
                }
              />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}