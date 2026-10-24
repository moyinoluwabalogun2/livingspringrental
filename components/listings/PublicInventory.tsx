'use client';

import Link
  from 'next/link';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'next/navigation';

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  MapPin,
  MoonStar,
  School,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';

import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import PropertyCard
  from '@/components/PropertyCard';

import {
  db,
} from '@/lib/firebase';

import {
  isPublicProperty,
  normalizeProperty,
  type PropertyRecord,
  type PropertyService,
} from '@/lib/property';

import styles
  from './PublicInventory.module.css';

type PublicInventoryProps = {
  service:
    PropertyService;
};

type Filters = {
  keyword:
    string;

  location:
    string;

  category:
    string;

  listingPurpose:
    string;

  unitType:
    string;

  maxPrice:
    string;

  bedrooms:
    string;

  guests:
    string;

  availableOnly:
    boolean;
};

const serviceContent:
  Record<
    PropertyService,
    {
      eyebrow: string;
      title: string;
      description: string;
      heroImage: string;
      resultsTitle: string;
      emptyTitle: string;
    }
  > = {
  property: {
    eyebrow:
      'Properties Across Nigeria',

    title:
      'Find land, homes and commercial property.',

    description:
      'Browse published residential, commercial and land opportunities for rent, sale or lease through Living Spring.',

    heroImage:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=85',

    resultsTitle:
      'Available properties',

    emptyTitle:
      'No matching properties found',
  },

  hostel: {
    eyebrow:
      'Hostel Accommodation',

    title:
      'Find the room or hostel setup that works for you.',

    description:
      'Browse published hostel listings, compare available room and unit types, review prices and enquire directly.',

    heroImage:
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=2000&q=85',

    resultsTitle:
      'Available hostels',

    emptyTitle:
      'No matching hostels found',
  },

  shortlet: {
    eyebrow:
      'Short-Let Accommodation',

    title:
      'Flexible stays for the nights you need.',

    description:
      'Browse furnished short-let accommodation, compare nightly options and continue to availability or enquiry.',

    heroImage:
      'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2000&q=85',

    resultsTitle:
      'Available short-lets',

    emptyTitle:
      'No matching short-lets found',
  },
};

function ServiceTypeIcon({
  service,
}: {
  service:
    PropertyService;
}) {
  if (
    service ===
    'hostel'
  ) {
    return (
      <School
        size={17}
        aria-hidden="true"
      />
    );
  }

  if (
    service ===
    'shortlet'
  ) {
    return (
      <MoonStar
        size={17}
        aria-hidden="true"
      />
    );
  }

  return (
    <Building2
      size={17}
      aria-hidden="true"
    />
  );
}

function getUnitPrice(
  property:
    PropertyRecord,

  index:
    number
) {
  const unit =
    property.units[
      index
    ];

  if (!unit) {
    return 0;
  }

  if (
    property.serviceType ===
    'shortlet'
  ) {
    if (
      unit.nightlyRate >
      0
    ) {
      return unit.nightlyRate;
    }

    if (
      unit.pricePeriod ===
        'night' &&
      unit.price >
        0
    ) {
      return unit.price;
    }

    if (
      unit.price >
      0
    ) {
      return unit.price;
    }

    return (
      unit.weeklyRate ||
      unit.monthlyRate ||
      0
    );
  }

  if (
    property.serviceType ===
    'hostel'
  ) {
    return (
      unit.annualRate ||
      unit.price ||
      unit.monthlyRate ||
      0
    );
  }

  return (
    unit.price ||
    unit.annualRate ||
    unit.monthlyRate ||
    0
  );
}

function getLowestPrice(
  property:
    PropertyRecord
) {
  const availableUnits =
    property.units.filter(
      (
        unit
      ) =>
        unit.status ===
        'available'
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
        ) => {
          const index =
            property.units.indexOf(
              unit
            );

          return getUnitPrice(
            property,
            index
          );
        }
      )
      .filter(
        (
          price
        ) =>
          price >
          0
      );

  if (
    !prices.length
  ) {
    return 0;
  }

  return Math.min(
    ...prices
  );
}

function searchableText(
  property:
    PropertyRecord
) {
  return [
    property.title,
    property.location,
    property.address,
    property.category,
    property.propertyType,
    property.listingPurpose,
    property.description,

    ...property.nearbyLandmarks,

    ...property.units.map(
      (
        unit
      ) =>
        unit.unitType
    ),

    ...property.amenities,
  ]
    .join(' ')
    .toLowerCase();
}

export default function PublicInventory({
  service,
}: PublicInventoryProps) {
  const searchParams =
    useSearchParams();

  const content =
    serviceContent[
      service
    ];

  const [
    properties,
    setProperties,
  ] =
    useState<
      PropertyRecord[]
    >([]);

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

  const [
    filters,
    setFilters,
  ] =
    useState<Filters>(
      () => ({
        keyword:
          searchParams.get(
            'keyword'
          ) ||
          '',

        location:
          searchParams.get(
            'location'
          ) ||
          'All',

        category:
          searchParams.get(
            'category'
          ) ||
          'All',

        listingPurpose:
          searchParams.get(
            'listingPurpose'
          ) ||
          'All',

        unitType:
          searchParams.get(
            'unitType'
          ) ||
          'All',

        maxPrice:
          searchParams.get(
            'maxPrice'
          ) ||
          '',

        bedrooms:
          searchParams.get(
            'bedrooms'
          ) ||
          'Any',

        guests:
          searchParams.get(
            'guests'
          ) ||
          'Any',

        availableOnly:
          searchParams.get(
            'availableOnly'
          ) ===
          'true',
      })
    );

  useEffect(() => {
    let active =
      true;

    async function loadListings() {
      setLoading(
        true
      );

      setError(
        ''
      );

      try {
        const snapshot =
          await getDocs(
            query(
              collection(
                db,
                'properties'
              ),

              where(
                'lifecycleStatus',
                '==',
                'published'
              ),

              where(
                'serviceType',
                '==',
                service
              ),

              limit(
                60
              )
            )
          );

        const listings =
          snapshot.docs
            .map(
              (
                document
              ) =>
                normalizeProperty(
                  document.id,
                  document.data()
                )
            )
            .filter(
              isPublicProperty
            );

        if (
          active
        ) {
          setProperties(
            listings
          );
        }
      } catch (
        loadError
      ) {
        console.error(
          `Failed to load ${service} listings:`,
          loadError
        );

        if (
          active
        ) {
          setError(
            'We could not load the current listings. Please try again shortly.'
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

    void loadListings();

    return () => {
      active =
        false;
    };
  }, [
    service,
  ]);

  const locations =
    useMemo(
      () =>
        Array.from(
          new Set(
            properties
              .map(
                (
                  property
                ) =>
                  property.location
                    .trim()
              )
              .filter(
                Boolean
              )
          )
        ).sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b
            )
        ),

      [
        properties,
      ]
    );

  const unitTypes =
    useMemo(
      () =>
        Array.from(
          new Set(
            properties
              .flatMap(
                (
                  property
                ) =>
                  property.units
              )
              .map(
                (
                  unit
                ) =>
                  unit.unitType
                    .trim()
              )
              .filter(
                Boolean
              )
          )
        ).sort(
          (
            a,
            b
          ) =>
            a.localeCompare(
              b
            )
        ),

      [
        properties,
      ]
    );

  const filteredProperties =
    useMemo(() => {
      const keyword =
        filters.keyword
          .trim()
          .toLowerCase();

      const maxPrice =
        Number(
          filters.maxPrice
        );

      const requiredBedrooms =
        filters.bedrooms ===
        'Any'
          ? 0
          : Number(
              filters.bedrooms
            );

      const requiredGuests =
        filters.guests ===
        'Any'
          ? 0
          : Number(
              filters.guests
            );

      return properties
        .filter(
          (
            property
          ) => {
            const availableUnits =
              property.units.filter(
                (
                  unit
                ) =>
                  unit.status ===
                  'available'
              );

            const matchesKeyword =
              !keyword ||
              searchableText(
                property
              ).includes(
                keyword
              );

            const matchesLocation =
              filters.location ===
                'All' ||
              property.location ===
                filters.location;

            const matchesCategory =
              service !==
                'property' ||
              filters.category ===
                'All' ||
              property.category ===
                filters.category;

            const matchesPurpose =
              service !==
                'property' ||
              filters.listingPurpose ===
                'All' ||
              property.listingPurpose ===
                filters.listingPurpose;

            const matchesUnit =
              filters.unitType ===
                'All' ||
              property.units.some(
                (
                  unit
                ) =>
                  unit.unitType ===
                  filters.unitType
              );

            const lowestPrice =
              getLowestPrice(
                property
              );

            const matchesPrice =
              !maxPrice ||
              !lowestPrice ||
              lowestPrice <=
                maxPrice;

            const matchesBedrooms =
              !requiredBedrooms ||
              property.units.some(
                (
                  unit
                ) =>
                  unit.bedrooms >=
                  requiredBedrooms
              );

            const propertyMaxGuests =
              Math.max(
                property.maxGuests,
                ...property.units.map(
                  (
                    unit
                  ) =>
                    unit.maxGuests
                ),
                0
              );

            const matchesGuests =
              !requiredGuests ||
              propertyMaxGuests >=
                requiredGuests;

            const matchesAvailability =
              !filters.availableOnly ||
              availableUnits.length >
                0;

            return (
              matchesKeyword &&
              matchesLocation &&
              matchesCategory &&
              matchesPurpose &&
              matchesUnit &&
              matchesPrice &&
              matchesBedrooms &&
              matchesGuests &&
              matchesAvailability
            );
          }
        )
        .sort(
          (
            a,
            b
          ) => {
            if (
              a.featured !==
              b.featured
            ) {
              return a.featured
                ? -1
                : 1;
            }

            return a.title
              .localeCompare(
                b.title
              );
          }
        );
    }, [
      filters,
      properties,
      service,
    ]);

  function updateFilter(
    key:
      keyof Filters,

    value:
      string | boolean
  ) {
    setFilters(
      (
        current
      ) => ({
        ...current,

        [key]:
          value,
      })
    );
  }

  function resetFilters() {
    setFilters({
      keyword:
        '',

      location:
        'All',

      category:
        'All',

      listingPurpose:
        'All',

      unitType:
        'All',

      maxPrice:
        '',

      bedrooms:
        'Any',

      guests:
        'Any',

      availableOnly:
        false,
    });
  }

  return (
    <main
      className={
        styles.page
      }
    >
      {/* =====================================
          HERO
      ====================================== */}

      <section
        className={
          styles.hero
        }
        style={{
          backgroundImage:
            `linear-gradient(90deg, rgba(4, 10, 20, 0.96) 0%, rgba(4, 10, 20, 0.86) 48%, rgba(4, 10, 20, 0.48) 100%), url("${content.heroImage}")`,
        }}
      >
        <div className="container">
          <div
            className={
              styles.heroContent
            }
          >
            <span
              className={
                styles.eyebrow
              }
            >
             <ServiceTypeIcon
  service={service}
/>

              {
                content.eyebrow
              }
            </span>

            <h1>
              {
                content.title
              }
            </h1>

            <p>
              {
                content.description
              }
            </p>

            <div
              className={
                styles.heroActions
              }
            >
              <a
                href="#inventory"
                className="btn btn-gold"
              >
                Browse Listings

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </a>

              <Link
                href="/contact"
                className={
                  styles.heroSecondary
                }
              >
                Ask Living Spring
              </Link>
            </div>

            <div
              className={
                styles.heroTrust
              }
            >
              <span>
                <CheckCircle2
                  size={16}
                  aria-hidden="true"
                />

                No account required
              </span>

              <span>
                <CheckCircle2
                  size={16}
                  aria-hidden="true"
                />

                Direct enquiries
              </span>

              <span>
                <CheckCircle2
                  size={16}
                  aria-hidden="true"
                />

                Listings across Nigeria
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          SERVICE SWITCHER
      ====================================== */}

      <section
        className={
          styles.switcherSection
        }
      >
        <div className="container">
          <div
            className={
              styles.serviceSwitcher
            }
          >
            <Link
              href="/properties"
              className={
                service ===
                'property'
                  ? styles.activeService
                  : ''
              }
            >
              <Building2
                size={17}
                aria-hidden="true"
              />

              Properties
            </Link>

            <Link
              href="/hostel"
              className={
                service ===
                'hostel'
                  ? styles.activeService
                  : ''
              }
            >
              <School
                size={17}
                aria-hidden="true"
              />

              Hostels
            </Link>

            <Link
              href="/shortlet"
              className={
                service ===
                'shortlet'
                  ? styles.activeService
                  : ''
              }
            >
              <MoonStar
                size={17}
                aria-hidden="true"
              />

              Short-Lets
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================
          INVENTORY
      ====================================== */}

      <section
        id="inventory"
        className={
          styles.inventorySection
        }
      >
        <div className="container">
          <div
            className={
              styles.inventoryHeader
            }
          >
            <div>
              <span>
                Current Inventory
              </span>

              <h2>
                {
                  content.resultsTitle
                }
              </h2>

              <p>
                Search using the
                filters below.
                Locations appear
                automatically from
                the listings that
                are currently
                published.
              </p>
            </div>

            <div
              className={
                styles.resultCount
              }
            >
              <strong>
                {
                  filteredProperties.length
                }
              </strong>

              <span>
                {filteredProperties.length ===
                1
                  ? 'listing'
                  : 'listings'}
              </span>
            </div>
          </div>

          {/* FILTERS */}

          <div
            className={
              styles.filterCard
            }
          >
            <div
              className={
                styles.filterTop
              }
            >
              <span>
                <SlidersHorizontal
                  size={17}
                  aria-hidden="true"
                />

                Refine your search
              </span>

              <button
                type="button"
                onClick={
                  resetFilters
                }
              >
                <X
                  size={15}
                  aria-hidden="true"
                />

                Reset
              </button>
            </div>

            <div
              className={
                styles.filterGrid
              }
            >
              <label
                className={
                  styles.searchField
                }
              >
                <span>
                  Search
                </span>

                <div
                  className={
                    styles.inputShell
                  }
                >
                  <Search
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    value={
                      filters.keyword
                    }
                    onChange={(
                      event
                    ) =>
                      updateFilter(
                        'keyword',
                        event.target.value
                      )
                    }
                    placeholder="Location, title, area, landmark..."
                  />
                </div>
              </label>

              <label>
                <span>
                  Location
                </span>

                <select
                  value={
                    filters.location
                  }
                  onChange={(
                    event
                  ) =>
                    updateFilter(
                      'location',
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All locations
                  </option>

                  {locations.map(
                    (
                      location
                    ) => (
                      <option
                        key={
                          location
                        }
                        value={
                          location
                        }
                      >
                        {
                          location
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              {service ===
                'property' && (
                <>
                  <label>
                    <span>
                      Category
                    </span>

                    <select
                      value={
                        filters.category
                      }
                      onChange={(
                        event
                      ) =>
                        updateFilter(
                          'category',
                          event.target.value
                        )
                      }
                    >
                      <option value="All">
                        All categories
                      </option>

                      <option value="Residential">
                        Residential
                      </option>

                      <option value="Commercial">
                        Commercial
                      </option>

                      <option value="Land">
                        Land
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>
                      Purpose
                    </span>

                    <select
                      value={
                        filters.listingPurpose
                      }
                      onChange={(
                        event
                      ) =>
                        updateFilter(
                          'listingPurpose',
                          event.target.value
                        )
                      }
                    >
                      <option value="All">
                        Rent, sale or lease
                      </option>

                      <option value="Rent">
                        Rent
                      </option>

                      <option value="Sale">
                        Sale
                      </option>

                      <option value="Lease">
                        Lease
                      </option>
                    </select>
                  </label>
                </>
              )}

              <label>
                <span>
                  Unit Type
                </span>

                <select
                  value={
                    filters.unitType
                  }
                  onChange={(
                    event
                  ) =>
                    updateFilter(
                      'unitType',
                      event.target.value
                    )
                  }
                >
                  <option value="All">
                    All unit types
                  </option>

                  {unitTypes.map(
                    (
                      unitType
                    ) => (
                      <option
                        key={
                          unitType
                        }
                        value={
                          unitType
                        }
                      >
                        {
                          unitType
                        }
                      </option>
                    )
                  )}
                </select>
              </label>

              {service ===
                'shortlet' && (
                <>
                  <label>
                    <span>
                      Bedrooms
                    </span>

                    <select
                      value={
                        filters.bedrooms
                      }
                      onChange={(
                        event
                      ) =>
                        updateFilter(
                          'bedrooms',
                          event.target.value
                        )
                      }
                    >
                      <option value="Any">
                        Any
                      </option>

                      <option value="1">
                        1+
                      </option>

                      <option value="2">
                        2+
                      </option>

                      <option value="3">
                        3+
                      </option>

                      <option value="4">
                        4+
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>
                      Guests
                    </span>

                    <select
                      value={
                        filters.guests
                      }
                      onChange={(
                        event
                      ) =>
                        updateFilter(
                          'guests',
                          event.target.value
                        )
                      }
                    >
                      <option value="Any">
                        Any
                      </option>

                      <option value="1">
                        1+
                      </option>

                      <option value="2">
                        2+
                      </option>

                      <option value="4">
                        4+
                      </option>

                      <option value="6">
                        6+
                      </option>

                      <option value="8">
                        8+
                      </option>
                    </select>
                  </label>
                </>
              )}

              <label>
                <span>
                  Max Price
                </span>

                <input
                  type="number"
                  min="0"
                  inputMode="numeric"
                  value={
                    filters.maxPrice
                  }
                  onChange={(
                    event
                  ) =>
                    updateFilter(
                      'maxPrice',
                      event.target.value
                    )
                  }
                  placeholder={
                    service ===
                    'shortlet'
                      ? 'Max per night'
                      : 'Maximum price'
                  }
                />
              </label>
            </div>

            <label
              className={
                styles.availableToggle
              }
            >
              <input
                type="checkbox"
                checked={
                  filters.availableOnly
                }
                onChange={(
                  event
                ) =>
                  updateFilter(
                    'availableOnly',
                    event.target.checked
                  )
                }
              />

              <span
                className={
                  styles.toggleControl
                }
                aria-hidden="true"
              />

              <span>
                Show listings with
                available units only
              </span>
            </label>
          </div>

          {/* RESULTS */}

          {loading ? (
            <div
              className={
                styles.skeletonGrid
              }
            >
              <div />
              <div />
              <div />
            </div>
          ) : error ? (
            <div
              className={
                styles.emptyState
              }
            >
              <h3>
                Could not load listings
              </h3>

              <p>
                {error}
              </p>
            </div>
          ) : filteredProperties.length >
            0 ? (
            <div className="grid">
              {filteredProperties.map(
                (
                  property
                ) => (
                  <PropertyCard
                    key={
                      property.id
                    }
                    property={
                      property
                    }
                  />
                )
              )}
            </div>
          ) : (
            <div
              className={
                styles.emptyState
              }
            >
              <div
                className={
                  styles.emptyIcon
                }
              >
                <Search
                  size={28}
                  aria-hidden="true"
                />
              </div>

              <h3>
                {
                  content.emptyTitle
                }
              </h3>

              <p>
                Try changing your
                filters or contact
                Living Spring about
                what you need.
              </p>

              <div
                className={
                  styles.emptyActions
                }
              >
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={
                    resetFilters
                  }
                >
                  Clear Filters
                </button>

                <Link
                  href="/contact"
                  className="btn btn-outline"
                >
                  Contact Living Spring
                </Link>
              </div>
            </div>
          )}

          {/* BOTTOM CTA */}

          <div
            className={
              styles.helpPanel
            }
          >
            <div>
              <MapPin
                size={24}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Looking in a
                  location that
                  is not listed yet?
                </strong>

                <p>
                  Living Spring is
                  structured for
                  listings anywhere
                  in Nigeria. Tell us
                  what and where you
                  are looking for.
                </p>
              </div>
            </div>

            <Link
              href="/contact"
              className="btn btn-gold"
            >
              Make an Enquiry

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}