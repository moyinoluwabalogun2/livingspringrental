'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link
  from 'next/link';

import {
  Archive,
  BedDouble,
  Building2,
  CalendarClock,
  CalendarX2,
  Edit,
  Eye,
  FileEdit,
  MoonStar,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
  Trash2,
  WalletCards,
} from 'lucide-react';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

import {
  db,
} from '@/lib/firebase';

import {
  formatEffectiveListingStatus,
  formatListingSource,
  formatPropertyService,
  getDaysRemaining,
  getEffectiveListingStatus,
  getPropertyExpiresAt,
  getTotalAvailableUnits,
  isPublicProperty,
  normalizeProperty,
  type EffectiveListingStatus,
  type PropertyRecord,
} from '@/lib/property';

import styles
  from './page.module.css';


function formatDate(
  value:
    Date | null
) {
  if (
    !value
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      day:
        'numeric',

      month:
        'short',

      year:
        'numeric',
    }
  ).format(
    value
  );
}


function statusStyle(
  status:
    EffectiveListingStatus
):
React.CSSProperties {
  if (
    status ===
    'live'
  ) {
    return {};
  }

  if (
    status ===
    'expiring'
  ) {
    return {
      background:
        '#fff3cd',

      color:
        '#8a5a00',

      borderColor:
        '#edd78b',
    };
  }

  if (
    status ===
    'expired'
  ) {
    return {
      background:
        '#fff0f0',

      color:
        '#a43232',

      borderColor:
        '#efc2c2',
    };
  }

  return {};
}


export default function
AdminPropertiesPage() {
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
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const [
    busyId,
    setBusyId,
  ] =
    useState('');

  const [
    keyword,
    setKeyword,
  ] =
    useState('');

  const [
    serviceFilter,
    setServiceFilter,
  ] =
    useState('all');

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState('all');


  const loadProperties =
    useCallback(
      async (
        quiet =
          false
      ) => {
        if (
          quiet
        ) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }

        try {
          const snapshot =
            await getDocs(
              query(
                collection(
                  db,
                  'properties'
                ),

                limit(
                  100
                )
              )
            );

          const data =
            snapshot.docs.map(
              (
                document
              ) =>
                normalizeProperty(
                  document.id,
                  document.data()
                )
            );

          setProperties(
            data
          );
        } catch (
          error
        ) {
          console.error(
            'Failed to load properties:',
            error
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );


  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void loadProperties();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    loadProperties,
  ]);


  const filtered =
    useMemo(
      () => {
        const search =
          keyword
            .trim()
            .toLowerCase();

        return properties.filter(
          (
            property
          ) => {
            const text =
              [
                property.title,
                property.location,
                property.address,
                property.propertyType,
                property.category,
                property.listingPurpose,
                property
                  .sourceApplicationReference,
              ]
                .join(
                  ' '
                )
                .toLowerCase();

            const matchesSearch =
              !search ||
              text.includes(
                search
              );

            const matchesService =
              serviceFilter ===
                'all' ||
              property.serviceType ===
                serviceFilter;

            const effectiveStatus =
              getEffectiveListingStatus(
                property
              );

            const matchesStatus =
              statusFilter ===
                'all' ||
              effectiveStatus ===
                statusFilter;

            return (
              matchesSearch &&
              matchesService &&
              matchesStatus
            );
          }
        );
      },
      [
        keyword,
        properties,
        serviceFilter,
        statusFilter,
      ]
    );


  async function
  archiveProperty(
    property:
      PropertyRecord
  ) {
    const confirmed =
      window.confirm(
        `Archive "${property.title}"?\n\nIt will be hidden from the public website but will remain in Admin.`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setBusyId(
      property.id
    );

    try {
      await updateDoc(
        doc(
          db,
          'properties',
          property.id
        ),
        {
          lifecycleStatus:
            'archived',

          archivedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      setProperties(
        (
          current
        ) =>
          current.map(
            (
              item
            ) =>
              item.id ===
              property.id
                ? {
                    ...item,

                    lifecycleStatus:
                      'archived',
                  }
                : item
          )
      );
    } catch (
      error
    ) {
      console.error(
        'Could not archive listing:',
        error
      );

      window.alert(
        'The listing could not be archived.'
      );
    } finally {
      setBusyId(
        ''
      );
    }
  }


  async function
  publishDirectProperty(
    property:
      PropertyRecord
  ) {
    if (
      property.listingSource !==
      'living-spring'
    ) {
      window.alert(
        'Partner Listings require a verified renewal payment before another advertising period can begin.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Publish "${property.title}" again?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setBusyId(
      property.id
    );

    try {
      await updateDoc(
        doc(
          db,
          'properties',
          property.id
        ),
        {
          lifecycleStatus:
            'published',

          publishedAt:
            serverTimestamp(),

          updatedAt:
            serverTimestamp(),
        }
      );

      await loadProperties(
        true
      );
    } catch (
      error
    ) {
      console.error(
        'Could not publish listing:',
        error
      );

      window.alert(
        'The listing could not be published.'
      );
    } finally {
      setBusyId(
        ''
      );
    }
  }


  async function
  deleteProperty(
    property:
      PropertyRecord
  ) {
    const effectiveStatus =
      getEffectiveListingStatus(
        property
      );

    if (
      effectiveStatus ===
        'live' ||
      effectiveStatus ===
        'expiring'
    ) {
      window.alert(
        'Archive a live listing before deleting it.'
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${property.title}" permanently?\n\nThis removes the Firestore listing. Application and payment history are not deleted.`
      );

    if (
      !confirmed
    ) {
      return;
    }

    setBusyId(
      property.id
    );

    try {
      await deleteDoc(
        doc(
          db,
          'properties',
          property.id
        )
      );

      setProperties(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              property.id
          )
      );
    } catch (
      error
    ) {
      console.error(
        'Failed to delete property:',
        error
      );

      window.alert(
        'The property could not be deleted.'
      );
    } finally {
      setBusyId(
        ''
      );
    }
  }


  function getServiceIcon(
    service:
      PropertyRecord[
        'serviceType'
      ]
  ) {
    if (
      service ===
      'hostel'
    ) {
      return BedDouble;
    }

    if (
      service ===
      'shortlet'
    ) {
      return MoonStar;
    }

    return Building2;
  }


  function getStatusIcon(
    status:
      EffectiveListingStatus
  ) {
    if (
      status ===
      'live'
    ) {
      return Eye;
    }

    if (
      status ===
      'expiring'
    ) {
      return CalendarClock;
    }

    if (
      status ===
      'expired'
    ) {
      return CalendarX2;
    }

    if (
      status ===
      'archived'
    ) {
      return Archive;
    }

    return FileEdit;
  }


  return (
    <div
      className={
        styles.page
      }
    >
      <div
        className={
          styles.header
        }
      >
        <div>
          <span>
            Living Spring Admin
          </span>

          <h1>
            Properties &
            Accommodation
          </h1>

          <p>
            Manage live adverts,
            expiry, partner listings,
            hostel accommodation and
            short-lets from one place.
          </p>
        </div>

        <div
          style={{
            display:
              'flex',

            gap:
              '10px',

            flexWrap:
              'wrap',
          }}
        >
          <button
            type="button"
            className={
              styles.addButton
            }
            disabled={
              refreshing
            }
            onClick={() =>
              void loadProperties(
                true
              )
            }
          >
            <RefreshCw
              size={17}
            />

            {refreshing
              ? 'Refreshing...'
              : 'Refresh'}
          </button>

          <Link
            href="/admin/properties/new"
            className={
              styles.addButton
            }
          >
            <Plus
              size={18}
            />

            Add Listing
          </Link>
        </div>
      </div>


      <div
        className={
          styles.toolbar
        }
      >
        <div
          className={
            styles.search
          }
        >
          <Search
            size={17}
          />

          <input
            value={
              keyword
            }
            onChange={(
              event
            ) =>
              setKeyword(
                event.target
                  .value
              )
            }
            placeholder="Search listings..."
          />
        </div>


        <select
          value={
            serviceFilter
          }
          onChange={(
            event
          ) =>
            setServiceFilter(
              event.target
                .value
            )
          }
        >
          <option value="all">
            All Types
          </option>

          <option value="property">
            Properties
          </option>

          <option value="hostel">
            Hostel
          </option>

          <option value="shortlet">
            Short-Let
          </option>
        </select>


        <select
          value={
            statusFilter
          }
          onChange={(
            event
          ) =>
            setStatusFilter(
              event.target
                .value
            )
          }
        >
          <option value="all">
            All Statuses
          </option>

          <option value="live">
            Live
          </option>

          <option value="expiring">
            Expiring Soon
          </option>

          <option value="expired">
            Expired
          </option>

          <option value="draft">
            Draft
          </option>

          <option value="archived">
            Archived
          </option>
        </select>
      </div>


      <div
        className={
          styles.resultsBar
        }
      >
        <span>
          {
            filtered.length
          }{' '}

          {filtered.length ===
          1
            ? 'listing'
            : 'listings'}
        </span>
      </div>


      {loading ? (
        <div
          className={
            styles.loading
          }
        >
          <div
            className="loading-spinner"
          />
        </div>
      ) : filtered.length >
        0 ? (
        <div
          className={
            styles.list
          }
        >
          {filtered.map(
            (
              property
            ) => {
              const ServiceIcon =
                getServiceIcon(
                  property.serviceType
                );

              const effectiveStatus =
                getEffectiveListingStatus(
                  property
                );

              const StatusIcon =
                getStatusIcon(
                  effectiveStatus
                );

              const availableUnits =
                getTotalAvailableUnits(
                  property
                );

              const expiresAt =
                getPropertyExpiresAt(
                  property
                );

              const daysRemaining =
                getDaysRemaining(
                  property
                );

              const publicVisible =
                isPublicProperty(
                  property
                );

              const isPartner =
                property.listingSource ===
                'partner';

              const busy =
                busyId ===
                property.id;

              return (
                <article
                  className={
                    styles.listingCard
                  }
                  key={
                    property.id
                  }
                >
                  <div
                    className={
                      styles.media
                    }
                  >
                    {property.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={
                          property.coverImage
                        }
                        alt={
                          property.title
                        }
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div
                        className={
                          styles.mediaFallback
                        }
                      >
                        <ServiceIcon
                          size={30}
                        />
                      </div>
                    )}

                    {property.featured && (
                      <span
                        className={
                          styles.featured
                        }
                      >
                        <Star
                          size={13}
                          fill="currentColor"
                        />

                        Featured
                      </span>
                    )}
                  </div>


                  <div
                    className={
                      styles.content
                    }
                  >
                    <div
                      className={
                        styles.badges
                      }
                    >
                      <span
                        className={
                          styles.serviceBadge
                        }
                      >
                        <ServiceIcon
                          size={14}
                        />

                        {formatPropertyService(
                          property.serviceType
                        )}
                      </span>


                      <span
                        className={
                          styles.serviceBadge
                        }
                      >
                        {formatListingSource(
                          property.listingSource
                        )}
                      </span>


                      <span
                        className={`${styles.statusBadge} ${
                          effectiveStatus ===
                            'live'
                            ? styles
                                .published
                            : effectiveStatus ===
                                'archived'
                              ? styles
                                  .archived
                              : styles
                                  .draft
                        }`}
                        style={
                          statusStyle(
                            effectiveStatus
                          )
                        }
                      >
                        <StatusIcon
                          size={14}
                        />

                        {formatEffectiveListingStatus(
                          effectiveStatus
                        )}
                      </span>
                    </div>


                    <h2>
                      {property.title ||
                        'Untitled Listing'}
                    </h2>


                    <p
                      className={
                        styles.location
                      }
                    >
                      {property.location ||
                        'Location not set'}
                    </p>


                    {isPartner &&
                      expiresAt && (
                      <div
                        style={{
                          margin:
                            '12px 0',

                          padding:
                            '12px 14px',

                          borderRadius:
                            '12px',

                          background:
                            effectiveStatus ===
                            'expired'
                              ? '#fff0f0'
                              : effectiveStatus ===
                                  'expiring'
                                ? '#fff7df'
                                : '#f7f4ec',

                          fontSize:
                            '0.83rem',

                          lineHeight:
                            1.55,
                        }}
                      >
                        <strong>
                          {effectiveStatus ===
                          'expired'
                            ? 'Advert expired'
                            : `Expires ${formatDate(
                                expiresAt
                              )}`}
                        </strong>

                        <br />

                        {effectiveStatus ===
                        'expired'
                          ? 'This Partner Listing is no longer publicly visible.'
                          : `${daysRemaining ?? 0} ${
                              daysRemaining ===
                              1
                                ? 'day'
                                : 'days'
                            } remaining in this advertising period.`}
                      </div>
                    )}


                    <div
                      className={
                        styles.stats
                      }
                    >
                      <span>
                        <strong>
                          {
                            property.units
                              .length
                          }
                        </strong>

                        Unit Types
                      </span>

                      <span>
                        <strong>
                          {
                            availableUnits
                          }
                        </strong>

                        Available
                      </span>

                      <span>
                        <strong>
                          {property.propertyType ||
                            '—'}
                        </strong>

                        Type
                      </span>
                    </div>


                    <div
                      className={
                        styles.actions
                      }
                    >
                      {publicVisible && (
                        <Link
                          href={`/properties/${property.id}`}
                          target="_blank"
                        >
                          <Eye
                            size={16}
                          />

                          View
                        </Link>
                      )}


                      <Link
                        href={`/admin/properties/edit/${property.id}`}
                      >
                        <Edit
                          size={16}
                        />

                        Edit
                      </Link>


                      {(effectiveStatus ===
                        'live' ||
                        effectiveStatus ===
                          'expiring' ||
                        effectiveStatus ===
                          'expired') && (
                        <button
                          type="button"
                          disabled={
                            busy
                          }
                          onClick={() =>
                            void archiveProperty(
                              property
                            )
                          }
                        >
                          <Archive
                            size={16}
                          />

                          Archive
                        </button>
                      )}


                      {(effectiveStatus ===
                        'draft' ||
                        effectiveStatus ===
                          'archived') &&
                        property
                          .listingSource ===
                          'living-spring' && (
                        <button
                          type="button"
                          disabled={
                            busy
                          }
                          onClick={() =>
                            void publishDirectProperty(
                              property
                            )
                          }
                        >
                          <RotateCcw
                            size={16}
                          />

                          Publish
                        </button>
                      )}


                      {effectiveStatus ===
                        'expired' &&
                        isPartner && (
                        property
                          .sourceApplicationReference ? (
                          <Link
                            href={`/admin/applications/${encodeURIComponent(
                              property
                                .sourceApplicationReference
                            )}`}
                          >
                            <WalletCards
                              size={16}
                            />

                            Renewal Payment
                          </Link>
                        ) : (
                          <button
                            type="button"
                            disabled
                            title="Partner renewal requires another verified listing payment."
                          >
                            <WalletCards
                              size={16}
                            />

                            Renewal Required
                          </button>
                        )
                      )}


                      {(effectiveStatus ===
                        'draft' ||
                        effectiveStatus ===
                          'archived') && (
                        <button
                          type="button"
                          disabled={
                            busy
                          }
                          onClick={() =>
                            void deleteProperty(
                              property
                            )
                          }
                        >
                          <Trash2
                            size={16}
                          />

                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            }
          )}
        </div>
      ) : (
        <div
          className={
            styles.empty
          }
        >
          <Building2
            size={34}
          />

          <h2>
            No listings found
          </h2>

          <p>
            Adjust your filters or
            create a new Living Spring
            listing.
          </p>

          <Link
            href="/admin/properties/new"
            className={
              styles.addButton
            }
          >
            <Plus
              size={18}
            />

            Add Listing
          </Link>
        </div>
      )}
    </div>
  );
}