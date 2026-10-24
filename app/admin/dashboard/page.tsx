'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link
  from 'next/link';

import {
  Archive,
  ArrowRight,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Eye,
  FileEdit,
  Home,
  MapPin,
  Plus,
  Wrench,
} from 'lucide-react';

import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

import {
  db,
} from '@/lib/firebase';

import {
  normalizeProperty,
  type PropertyRecord,
} from '@/lib/property';

import styles
  from './page.module.css';

type DashboardCounts = {
  totalListings:
    number;

  published:
    number;

  drafts:
    number;

  archived:
    number;

  properties:
    number;

  hostels:
    number;

  shortLets:
    number;

  totalUnits:
    number;

  availableUnits:
    number;

  reservedUnits:
    number;

  bookedUnits:
    number;

  maintenanceUnits:
    number;
};

type RecentProperty = {
  property:
    PropertyRecord;

  updatedAt:
    number;
};

const EMPTY_COUNTS:
  DashboardCounts = {
  totalListings: 0,

  published: 0,

  drafts: 0,

  archived: 0,

  properties: 0,

  hostels: 0,

  shortLets: 0,

  totalUnits: 0,

  availableUnits: 0,

  reservedUnits: 0,

  bookedUnits: 0,

  maintenanceUnits: 0,
};

function timestampToMillis(
  value: unknown
) {
  if (
    value instanceof
    Date
  ) {
    return value.getTime();
  }

  if (
    typeof value ===
      'number'
  ) {
    return value;
  }

  if (
    value &&
    typeof value ===
      'object' &&
    'toMillis' in
      value
  ) {
    const timestamp =
      value as {
        toMillis?:
          () => number;
      };

    if (
      typeof timestamp
        .toMillis ===
      'function'
    ) {
      return timestamp.toMillis();
    }
  }

  return 0;
}

function formatDate(
  value: number
) {
  if (!value) {
    return 'Recently updated';
  }

  return new Intl.DateTimeFormat(
    'en-GB',
    {
      day:
        'numeric',

      month:
        'short',

      year:
        'numeric',

      timeZone:
        'Africa/Lagos',
    }
  ).format(
    new Date(
      value
    )
  );
}

function serviceLabel(
  property:
    PropertyRecord
) {
  if (
    property.serviceType ===
    'shortlet'
  ) {
    return 'Short-Let';
  }

  if (
    property.serviceType ===
    'hostel'
  ) {
    return 'Hostel';
  }

  return 'Property';
}

export default function AdminDashboardPage() {
  const [
    counts,
    setCounts,
  ] =
    useState<DashboardCounts>(
      EMPTY_COUNTS
    );

  const [
    recent,
    setRecent,
  ] =
    useState<
      RecentProperty[]
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
    unitSnapshotCapped,
    setUnitSnapshotCapped,
  ] =
    useState(false);

  useEffect(() => {
    let active =
      true;

    const propertiesRef =
      collection(
        db,
        'properties'
      );

    const inventoryPromise =
      getDocs(
        query(
          propertiesRef,

          limit(100)
        )
      );

    const recentPromise =
      getDocs(
        query(
          propertiesRef,

          orderBy(
            'updatedAt',
            'desc'
          ),

          limit(6)
        )
      ).catch(
        (
          recentError
        ) => {
          console.warn(
            'Recent listings query failed:',
            recentError
          );

          return null;
        }
      );

    const totalPromise =
      getCountFromServer(
        propertiesRef
      );

    const draftsPromise =
      getCountFromServer(
        query(
          propertiesRef,

          where(
            'lifecycleStatus',
            '==',
            'draft'
          )
        )
      );

    const archivedPromise =
      getCountFromServer(
        query(
          propertiesRef,

          where(
            'lifecycleStatus',
            '==',
            'archived'
          )
        )
      );

    const hostelPromise =
      getCountFromServer(
        query(
          propertiesRef,

          where(
            'serviceType',
            '==',
            'hostel'
          )
        )
      );

    const shortLetPromise =
      getCountFromServer(
        query(
          propertiesRef,

          where(
            'serviceType',
            '==',
            'shortlet'
          )
        )
      );

    void Promise.all([
      inventoryPromise,
      recentPromise,
      totalPromise,
      draftsPromise,
      archivedPromise,
      hostelPromise,
      shortLetPromise,
    ])
      .then(
        (
          [
            inventorySnapshot,
            recentSnapshot,
            totalSnapshot,
            draftsSnapshot,
            archivedSnapshot,
            hostelSnapshot,
            shortLetSnapshot,
          ]
        ) => {
          if (!active) {
            return;
          }

          const inventory =
            inventorySnapshot
              .docs
              .map(
                (
                  document
                ) =>
                  normalizeProperty(
                    document.id,
                    document.data()
                  )
              );

          const totalListings =
            totalSnapshot
              .data()
              .count;

          const drafts =
            draftsSnapshot
              .data()
              .count;

          const archived =
            archivedSnapshot
              .data()
              .count;

          const hostels =
            hostelSnapshot
              .data()
              .count;

          const shortLets =
            shortLetSnapshot
              .data()
              .count;

          /*
           * Legacy documents without a lifecycleStatus
           * are treated as published by normalizeProperty.
           * Therefore:
           *
           * published = total - drafts - archived
           */

          const published =
            Math.max(
              0,

              totalListings -
                drafts -
                archived
            );

          /*
           * Legacy documents without serviceType
           * are treated as regular properties.
           */

          const properties =
            Math.max(
              0,

              totalListings -
                hostels -
                shortLets
            );

          let totalUnits =
            0;

          let availableUnits =
            0;

          let reservedUnits =
            0;

          let bookedUnits =
            0;

          let maintenanceUnits =
            0;

          inventory.forEach(
            (
              property
            ) => {
              property.units.forEach(
                (
                  unit
                ) => {
                  totalUnits +=
                    1;

                  if (
                    unit.status ===
                    'available'
                  ) {
                    availableUnits +=
                      1;
                  }

                  if (
                    unit.status ===
                    'reserved'
                  ) {
                    reservedUnits +=
                      1;
                  }

                  /*
                   * The property model currently uses
                   * reserved for temporary occupancy.
                   *
                   * Batch 5's calendar has a separate
                   * "booked" date state.
                   *
                   * A unit itself is considered booked
                   * here when its overall status is
                   * rented.
                   */

                  if (
                    unit.status ===
                    'rented'
                  ) {
                    bookedUnits +=
                      1;
                  }

                  if (
                    unit.status ===
                    'maintenance'
                  ) {
                    maintenanceUnits +=
                      1;
                  }
                }
              );
            }
          );

          setUnitSnapshotCapped(
            totalListings >
              inventorySnapshot
                .size
          );

          setCounts({
            totalListings,

            published,

            drafts,

            archived,

            properties,

            hostels,

            shortLets,

            totalUnits,

            availableUnits,

            reservedUnits,

            bookedUnits,

            maintenanceUnits,
          });

          let recentItems:
            RecentProperty[] =
            [];

          if (
            recentSnapshot &&
            !recentSnapshot.empty
          ) {
            recentItems =
              recentSnapshot
                .docs
                .map(
                  (
                    document
                  ) => {
                    const data =
                      document.data();

                    return {
                      property:
                        normalizeProperty(
                          document.id,
                          data
                        ),

                      updatedAt:
                        timestampToMillis(
                          data.updatedAt ||
                          data.createdAt
                        ),
                    };
                  }
                );
          } else {
            recentItems =
              inventorySnapshot
                .docs
                .slice(
                  0,
                  6
                )
                .map(
                  (
                    document
                  ) => {
                    const data =
                      document.data();

                    return {
                      property:
                        normalizeProperty(
                          document.id,
                          data
                        ),

                      updatedAt:
                        timestampToMillis(
                          data.updatedAt ||
                          data.createdAt
                        ),
                    };
                  }
                );
          }

          setRecent(
            recentItems
          );
        }
      )
      .catch(
        (
          loadError
        ) => {
          console.error(
            'Dashboard load failed:',
            loadError
          );

          if (active) {
            setError(
              'The dashboard could not load all management data. Refresh the page and try again.'
            );
          }
        }
      )
      .finally(
        () => {
          if (active) {
            setLoading(
              false
            );
          }
        }
      );

    return () => {
      active =
        false;
    };
  }, []);

  const occupancyPercent =
    useMemo(
      () => {
        if (
          counts.totalUnits ===
          0
        ) {
          return 0;
        }

        const unavailable =
          counts.reservedUnits +
          counts.bookedUnits +
          counts.maintenanceUnits;

        return Math.round(
          (
            unavailable /
            counts.totalUnits
          ) *
            100
        );
      },
      [
        counts,
      ]
    );

  return (
    <div
      className={
        styles.page
      }
    >
      <header
        className={
          styles.header
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Living Spring
            Management
          </span>

          <h1>
            Dashboard
          </h1>

          <p>
            Properties,
            accommodation and
            availability in one
            place.
          </p>
        </div>

        <Link
          href="/admin/properties/new"
          className={
            styles.primaryAction
          }
        >
          <Plus
            size={18}
            aria-hidden="true"
          />

          Add Listing
        </Link>
      </header>

      {error && (
        <div
          className={
            styles.error
          }
          role="status"
        >
          {error}
        </div>
      )}

      <section
        className={
          styles.statsGrid
        }
      >
        <article
          className={
            styles.statCard
          }
        >
          <span
            className={
              styles.statIcon
            }
          >
            <Building2
              size={20}
              aria-hidden="true"
            />
          </span>

          <div>
            <small>
              Total Listings
            </small>

            <strong>
              {loading
                ? '—'
                : counts
                    .totalListings}
            </strong>

            <p>
              All managed
              properties
            </p>
          </div>
        </article>

        <article
          className={
            styles.statCard
          }
        >
          <span
            className={
              styles.statIcon
            }
          >
            <Eye
              size={20}
              aria-hidden="true"
            />
          </span>

          <div>
            <small>
              Published
            </small>

            <strong>
              {loading
                ? '—'
                : counts
                    .published}
            </strong>

            <p>
              Visible publicly
            </p>
          </div>
        </article>

        <article
          className={
            styles.statCard
          }
        >
          <span
            className={
              styles.statIcon
            }
          >
            <FileEdit
              size={20}
              aria-hidden="true"
            />
          </span>

          <div>
            <small>
              Drafts
            </small>

            <strong>
              {loading
                ? '—'
                : counts
                    .drafts}
            </strong>

            <p>
              Awaiting publish
            </p>
          </div>
        </article>

        <article
          className={
            styles.statCard
          }
        >
          <span
            className={
              styles.statIcon
            }
          >
            <BedDouble
              size={20}
              aria-hidden="true"
            />
          </span>

          <div>
            <small>
              Available Units
            </small>

            <strong>
              {loading
                ? '—'
                : counts
                    .availableUnits}
            </strong>

            <p>
              Ready for enquiries
            </p>
          </div>
        </article>
      </section>

      <section
        className={
          styles.contentGrid
        }
      >
        <div
          className={
            styles.mainColumn
          }
        >
          <article
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <span>
                  Portfolio
                </span>

                <h2>
                  Listing overview
                </h2>
              </div>

              <Link
                href="/admin/properties"
              >
                Manage Listings

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div
              className={
                styles.portfolioGrid
              }
            >
              <div
                className={
                  styles.portfolioItem
                }
              >
                <span>
                  <Home
                    size={19}
                    aria-hidden="true"
                  />
                </span>

                <strong>
                  {
                    counts.properties
                  }
                </strong>

                <small>
                  Properties
                </small>
              </div>

              <div
                className={
                  styles.portfolioItem
                }
              >
                <span>
                  <BedDouble
                    size={19}
                    aria-hidden="true"
                  />
                </span>

                <strong>
                  {
                    counts.hostels
                  }
                </strong>

                <small>
                  Hostel Listings
                </small>
              </div>

              <div
                className={
                  styles.portfolioItem
                }
              >
                <span>
                  <CalendarDays
                    size={19}
                    aria-hidden="true"
                  />
                </span>

                <strong>
                  {
                    counts.shortLets
                  }
                </strong>

                <small>
                  Short-Lets
                </small>
              </div>

              <div
                className={
                  styles.portfolioItem
                }
              >
                <span>
                  <Archive
                    size={19}
                    aria-hidden="true"
                  />
                </span>

                <strong>
                  {
                    counts.archived
                  }
                </strong>

                <small>
                  Archived
                </small>
              </div>
            </div>
          </article>

          <article
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <span>
                  Inventory
                </span>

                <h2>
                  Unit status
                </h2>
              </div>

              <Link
                href="/admin/availability"
              >
                Availability

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div
              className={
                styles.unitOverview
              }
            >
              <div
                className={
                  styles.unitTotal
                }
              >
                <span>
                  Total units
                </span>

                <strong>
                  {
                    counts.totalUnits
                  }
                </strong>

                <small>
                  {occupancyPercent}%
                  currently unavailable,
                  reserved or occupied
                </small>
              </div>

              <div
                className={
                  styles.unitStatuses
                }
              >
                <div>
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    Available
                  </span>

                  <strong>
                    {
                      counts
                        .availableUnits
                    }
                  </strong>
                </div>

                <div>
                  <Clock3
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    Reserved
                  </span>

                  <strong>
                    {
                      counts
                        .reservedUnits
                    }
                  </strong>
                </div>

                <div>
                  <BedDouble
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    Occupied
                  </span>

                  <strong>
                    {
                      counts
                        .bookedUnits
                    }
                  </strong>
                </div>

                <div>
                  <Wrench
                    size={17}
                    aria-hidden="true"
                  />

                  <span>
                    Maintenance
                  </span>

                  <strong>
                    {
                      counts
                        .maintenanceUnits
                    }
                  </strong>
                </div>
              </div>
            </div>

            {unitSnapshotCapped && (
              <p
                className={
                  styles.snapshotNotice
                }
              >
                Unit statistics are
                currently calculated
                from a maximum of
                100 listings to keep
                dashboard reads
                bounded.
              </p>
            )}
          </article>

          <article
            className={
              styles.panel
            }
          >
            <div
              className={
                styles.panelHeader
              }
            >
              <div>
                <span>
                  Recently Updated
                </span>

                <h2>
                  Latest listings
                </h2>
              </div>

              <Link
                href="/admin/properties"
              >
                View All

                <ArrowRight
                  size={15}
                  aria-hidden="true"
                />
              </Link>
            </div>

            {loading ? (
              <div
                className={
                  styles.emptyState
                }
              >
                Loading latest
                listings...
              </div>
            ) : recent.length ===
              0 ? (
              <div
                className={
                  styles.emptyState
                }
              >
                <Building2
                  size={26}
                  aria-hidden="true"
                />

                <strong>
                  No listings yet
                </strong>

                <p>
                  Create the first
                  Living Spring
                  property.
                </p>

                <Link
                  href="/admin/properties/new"
                >
                  Add Listing
                </Link>
              </div>
            ) : (
              <div
                className={
                  styles.recentList
                }
              >
                {recent.map(
                  (
                    item
                  ) => {
                    const property =
                      item.property;

                    return (
                      <Link
                        key={
                          property.id
                        }
                        href={`/admin/properties/edit/${property.id}`}
                        className={
                          styles.recentItem
                        }
                      >
                        <span
                          className={
                            styles.recentIcon
                          }
                        >
                          {property.serviceType ===
                          'shortlet' ? (
                            <CalendarDays
                              size={20}
                              aria-hidden="true"
                            />
                          ) : property.serviceType ===
                            'hostel' ? (
                            <BedDouble
                              size={20}
                              aria-hidden="true"
                            />
                          ) : (
                            <Building2
                              size={20}
                              aria-hidden="true"
                            />
                          )}
                        </span>

                        <span
                          className={
                            styles.recentContent
                          }
                        >
                          <span
                            className={
                              styles.recentTop
                            }
                          >
                            <strong>
                              {property.title ||
                                'Untitled listing'}
                            </strong>

                            <small
                              data-status={
                                property.lifecycleStatus
                              }
                            >
                              {
                                property.lifecycleStatus
                              }
                            </small>
                          </span>

                          <span
                            className={
                              styles.recentMeta
                            }
                          >
                            <span>
                              {
                                serviceLabel(
                                  property
                                )
                              }
                            </span>

                            {(property.location ||
                              property.address) && (
                              <span>
                                <MapPin
                                  size={12}
                                  aria-hidden="true"
                                />

                                {property.location ||
                                  property.address}
                              </span>
                            )}

                            <span>
                              {
                                property.units
                                  .length
                              }{' '}
                              {property.units
                                .length ===
                              1
                                ? 'unit'
                                : 'units'}
                            </span>
                          </span>
                        </span>

                        <span
                          className={
                            styles.recentDate
                          }
                        >
                          {formatDate(
                            item.updatedAt
                          )}
                        </span>

                        <ArrowRight
                          size={16}
                          aria-hidden="true"
                        />
                      </Link>
                    );
                  }
                )}
              </div>
            )}
          </article>
        </div>

        <aside
          className={
            styles.sideColumn
          }
        >
          <article
            className={
              styles.quickPanel
            }
          >
            <span
              className={
                styles.quickEyebrow
              }
            >
              Quick Actions
            </span>

            <h2>
              What do you want
              to manage?
            </h2>

            <Link
              href="/admin/properties/new"
              className={
                styles.quickActionPrimary
              }
            >
              <span>
                <Plus
                  size={19}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  New Listing
                </strong>

                <small>
                  Property, hostel
                  or short-let
                </small>
              </div>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/admin/properties"
              className={
                styles.quickAction
              }
            >
              <span>
                <Building2
                  size={19}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  Properties
                </strong>

                <small>
                  Edit and publish
                  listings
                </small>
              </div>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>

            <Link
              href="/admin/availability"
              className={
                styles.quickAction
              }
            >
              <span>
                <CalendarDays
                  size={19}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  Availability
                </strong>

                <small>
                  Block and manage
                  short-let dates
                </small>
              </div>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </Link>
          </article>

          <article
            className={
              styles.statusPanel
            }
          >
            <span
              className={
                styles.quickEyebrow
              }
            >
              Publishing
            </span>

            <h3>
              Listing health
            </h3>

            <div
              className={
                styles.healthRows
              }
            >
              <div>
                <span>
                  <CheckCircle2
                    size={15}
                    aria-hidden="true"
                  />

                  Published
                </span>

                <strong>
                  {
                    counts.published
                  }
                </strong>
              </div>

              <div>
                <span>
                  <CircleDashed
                    size={15}
                    aria-hidden="true"
                  />

                  Draft
                </span>

                <strong>
                  {
                    counts.drafts
                  }
                </strong>
              </div>

              <div>
                <span>
                  <Archive
                    size={15}
                    aria-hidden="true"
                  />

                  Archived
                </span>

                <strong>
                  {
                    counts.archived
                  }
                </strong>
              </div>
            </div>
          </article>
        </aside>
      </section>
    </div>
  );
}