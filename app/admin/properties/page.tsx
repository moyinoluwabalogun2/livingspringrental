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
  BedDouble,
  Building2,
  Edit,
  Eye,
  FileEdit,
  MoonStar,
  Plus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';

import {
  db,
} from '@/lib/firebase';

import {
  formatLifecycleStatus,
  formatPropertyService,
  normalizeProperty,
  type PropertyRecord,
} from '@/lib/property';

import styles
  from './page.module.css';

export default function AdminPropertiesPage() {
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

  useEffect(() => {
    let active =
      true;

    async function loadProperties() {
      try {
        /*
         * Performance guard:
         * admin does not need an
         * unlimited collection read.
         *
         * Proper cursor pagination
         * will be added with the
         * larger admin work.
         */
        const snapshot =
          await getDocs(
            query(
              collection(
                db,
                'properties'
              ),

              limit(100)
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

        if (active) {
          setProperties(
            data
          );
        }
      } catch (error) {
        console.error(
          'Failed to load properties:',
          error
        );
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }

    void loadProperties();

    return () => {
      active =
        false;
    };
  }, []);

  const filtered =
    useMemo(() => {
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
            ]
              .join(' ')
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

          const matchesStatus =
            statusFilter ===
              'all' ||
            property.lifecycleStatus ===
              statusFilter;

          return (
            matchesSearch &&
            matchesService &&
            matchesStatus
          );
        }
      );
    }, [
      keyword,
      properties,
      serviceFilter,
      statusFilter,
    ]);

  const deleteProperty =
    async (
      property:
        PropertyRecord
    ) => {
      const confirmed =
        window.confirm(
          `Delete "${property.title}" permanently?`
        );

      if (!confirmed) {
        return;
      }

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
      } catch (error) {
        console.error(
          'Failed to delete property:',
          error
        );

        window.alert(
          'The property could not be deleted.'
        );
      }
    };

  const getServiceIcon =
    (
      service:
        PropertyRecord['serviceType']
    ) => {
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
    };

  const getStatusIcon =
    (
      status:
        PropertyRecord['lifecycleStatus']
    ) => {
      if (
        status ===
        'published'
      ) {
        return Eye;
      }

      if (
        status ===
        'archived'
      ) {
        return Archive;
      }

      return FileEdit;
    };

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
            Manage property,
            hostel and short-let
            listings from one
            place.
          </p>
        </div>

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

          <option value="published">
            Published
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

              const StatusIcon =
                getStatusIcon(
                  property.lifecycleStatus
                );

              const availableUnits =
                property.units.filter(
                  (
                    unit
                  ) =>
                    unit.status ===
                    'available'
                ).length;

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
                      // Arbitrary legacy/admin URLs
                      // are still supported until
                      // storage is standardized.
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
                        className={`${styles.statusBadge} ${
                          styles[
                            property.lifecycleStatus
                          ]
                        }`}
                      >
                        <StatusIcon
                          size={14}
                        />

                        {formatLifecycleStatus(
                          property.lifecycleStatus
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

                    <div
                      className={
                        styles.stats
                      }
                    >
                      <span>
                        <strong>
                          {
                            property.units.length
                          }
                        </strong>

                        Units
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
                      {property.lifecycleStatus ===
                        'published' && (
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

                      <button
                        type="button"
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
            Adjust your filters
            or create a new
            Living Spring
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