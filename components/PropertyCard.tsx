'use client';

import Link
  from 'next/link';

import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  FileText,
  MapPin,
  Maximize2,
  MoonStar,
  School,
  Users,
  Video,
} from 'lucide-react';

import {
  formatLandSize,
  formatListingSource,
  formatPrice,
  formatPropertyService,
  getAvailableQuantity,
  getPublicLocation,
  getStartingPrice,
  getTotalAvailableUnits,
  isLandProperty,
  type PropertyRecord,
} from '@/lib/property';

import styles
  from './PropertyCard.module.css';

type PropertyCardProps = {
  property:
    PropertyRecord;
};

function isDirectVideo(
  url?: string
) {
  if (!url) {
    return false;
  }

  const cleanUrl =
    url
      .split('?')[0]
      .split('#')[0];

  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(
    cleanUrl
  );
}

function ServiceIcon({
  service,
}: {
  service:
    PropertyRecord[
      'serviceType'
    ];
}) {
  if (
    service ===
    'hostel'
  ) {
    return (
      <School
        size={15}
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
        size={15}
        aria-hidden="true"
      />
    );
  }

  return (
    <Building2
      size={15}
      aria-hidden="true"
    />
  );
}

export default function PropertyCard({
  property,
}: PropertyCardProps) {
  const isLand =
    isLandProperty(
      property
    );

  const publicLocation =
    getPublicLocation(
      property
    );

  const startingPrice =
    getStartingPrice(
      property
    );

  const totalAvailable =
    getTotalAvailableUnits(
      property
    );

  const availableUnits =
    property.units.filter(
      (
        unit
      ) =>
        getAvailableQuantity(
          unit
        ) > 0
    );

  const unitsForMeta =
    availableUnits.length
      ? availableUnits
      : property.units;

  const firstUnit =
    startingPrice
      ? property.units.find(
          (
            unit
          ) =>
            unit.id ===
            startingPrice.unitId
        )
      : unitsForMeta[0];

  const imageUrl =
    property.coverImage ||
    property.media.find(
      Boolean
    ) ||
    '';

  const video =
    isDirectVideo(
      imageUrl
    );

  const uniqueUnitTypes =
    Array.from(
      new Set(
        property.units
          .map(
            (
              unit
            ) =>
              unit.unitType.trim()
          )
          .filter(
            Boolean
          )
      )
    );

  const maxGuests =
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

  const href =
    `/properties/${property.id}`;

  let availabilityText =
    'Enquire';

  if (
    property.units.length >
    0
  ) {
    if (
      totalAvailable > 0
    ) {
      if (
        property.serviceType ===
        'hostel'
      ) {
        availabilityText =
          `${totalAvailable} ${
            totalAvailable ===
            1
              ? 'space'
              : 'spaces'
          } available`;
      } else {
        availabilityText =
          'Available';
      }
    } else {
      availabilityText =
        property.serviceType ===
        'property' &&
        property.listingPurpose ===
          'Sale'
          ? 'Ask for status'
          : 'Currently unavailable';
    }
  }

  const showFrom =
    property.units.length >
      1 ||
    uniqueUnitTypes.length >
      1;

  return (
    <Link
      href={href}
      className={
        styles.card
      }
      aria-label={`View ${
        property.title ||
        formatPropertyService(
          property.serviceType
        )
      }`}
    >
      <div
        className={
          styles.media
        }
      >
        {imageUrl &&
        !video ? (
          /*
           * Admin media can still
           * come from arbitrary URLs.
           * Keep native image loading
           * until media hosting is
           * standardised.
           */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={
              imageUrl
            }
            alt={
              property.title ||
              'Living Spring listing'
            }
            className={
              styles.image
            }
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className={
              styles.fallbackMedia
            }
          >
            <div
              className={
                styles.fallbackIcon
              }
            >
              {video ? (
                <Video
                  size={28}
                  aria-hidden="true"
                />
              ) : (
                <ServiceIcon
                  service={
                    property.serviceType
                  }
                />
              )}
            </div>

            <span>
              {video
                ? 'Video tour available'
                : formatPropertyService(
                    property.serviceType
                  )}
            </span>
          </div>
        )}

        <div
          className={
            styles.topBadges
          }
        >
          <span
            className={
              styles.serviceBadge
            }
          >
            <ServiceIcon
              service={
                property.serviceType
              }
            />

            {formatPropertyService(
              property.serviceType
            )}
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

        <div
          className={
            styles.sourceBadge
          }
        >
          {formatListingSource(
            property.listingSource
          )}
        </div>
      </div>

      <div
        className={
          styles.body
        }
      >
        <div
          className={
            styles.location
          }
        >
          <MapPin
            size={15}
            aria-hidden="true"
          />

          <span>
            {publicLocation}
          </span>
        </div>

        <h3>
          {property.title ||
            'Living Spring Listing'}
        </h3>

        <div
          className={
            styles.typeRow
          }
        >
          <span>
            {isLand
              ? property.propertyType ||
                'Land'
              : property.propertyType ||
                property.category ||
                formatPropertyService(
                  property.serviceType
                )}
          </span>

          {property.serviceType ===
            'property' &&
            property.listingPurpose && (
              <span
                className={
                  styles.purpose
                }
              >
                {
                  property.listingPurpose
                }
              </span>
            )}
        </div>

        <div
          className={
            styles.priceBlock
          }
        >
          <strong>
            {showFrom &&
            startingPrice
              ? 'From '
              : ''}

            {startingPrice
              ? formatPrice(
                  startingPrice.amount,
                  startingPrice.period
                )
              : 'Price on request'}
          </strong>

          {property.serviceType ===
            'shortlet' &&
            property.minStayNights >
              1 && (
              <span>
                Minimum{' '}
                {
                  property.minStayNights
                }{' '}
                nights
              </span>
            )}
        </div>

        {/* =================================
            LAND
        ================================== */}

        {isLand ? (
          <div
            className={
              styles.meta
            }
          >
            {property.landSize >
              0 && (
              <span>
                <Maximize2
                  size={15}
                  aria-hidden="true"
                />

                {formatLandSize(
                  property.landSize,
                  property.landSizeUnit
                )}
              </span>
            )}

            {property.titleDocument && (
              <span>
                <FileText
                  size={15}
                  aria-hidden="true"
                />

                {
                  property.titleDocument
                }
              </span>
            )}

            <span>
              <CheckCircle2
                size={15}
                aria-hidden="true"
              />

              {
                availabilityText
              }
            </span>
          </div>
        ) : (
          <>
            {/* =============================
                HOSTEL
            ============================== */}

            {property.serviceType ===
              'hostel' && (
              <div
                className={
                  styles.meta
                }
              >
                <span>
                  <School
                    size={15}
                    aria-hidden="true"
                  />

                  {uniqueUnitTypes.length ||
                    1}{' '}
                  {uniqueUnitTypes.length ===
                  1
                    ? 'room type'
                    : 'room types'}
                </span>

                <span>
                  <CheckCircle2
                    size={15}
                    aria-hidden="true"
                  />

                  {
                    availabilityText
                  }
                </span>
              </div>
            )}

            {/* =============================
                SHORT-LET
            ============================== */}

            {property.serviceType ===
              'shortlet' && (
              <div
                className={
                  styles.meta
                }
              >
                {firstUnit &&
                  firstUnit.bedrooms >
                    0 && (
                    <span>
                      <BedDouble
                        size={15}
                        aria-hidden="true"
                      />

                      {
                        firstUnit.bedrooms
                      }{' '}
                      {firstUnit.bedrooms ===
                      1
                        ? 'Bed'
                        : 'Beds'}
                    </span>
                  )}

                {firstUnit &&
                  firstUnit.bathrooms >
                    0 && (
                    <span>
                      <Bath
                        size={15}
                        aria-hidden="true"
                      />

                      {
                        firstUnit.bathrooms
                      }{' '}
                      {firstUnit.bathrooms ===
                      1
                        ? 'Bath'
                        : 'Baths'}
                    </span>
                  )}

                {maxGuests >
                  0 && (
                  <span>
                    <Users
                      size={15}
                      aria-hidden="true"
                    />

                    Up to{' '}
                    {
                      maxGuests
                    }{' '}
                    guests
                  </span>
                )}
              </div>
            )}

            {/* =============================
                NORMAL PROPERTY / BUILDING
            ============================== */}

            {property.serviceType ===
              'property' && (
              <div
                className={
                  styles.meta
                }
              >
                {firstUnit &&
                  firstUnit.bedrooms >
                    0 && (
                    <span>
                      <BedDouble
                        size={15}
                        aria-hidden="true"
                      />

                      {
                        firstUnit.bedrooms
                      }{' '}
                      {firstUnit.bedrooms ===
                      1
                        ? 'Bed'
                        : 'Beds'}
                    </span>
                  )}

                {firstUnit &&
                  firstUnit.bathrooms >
                    0 && (
                    <span>
                      <Bath
                        size={15}
                        aria-hidden="true"
                      />

                      {
                        firstUnit.bathrooms
                      }{' '}
                      {firstUnit.bathrooms ===
                      1
                        ? 'Bath'
                        : 'Baths'}
                    </span>
                  )}

                {property.units.length >
                  1 && (
                  <span>
                    <Building2
                      size={15}
                      aria-hidden="true"
                    />

                    {
                      property.units.length
                    }{' '}
                    units
                  </span>
                )}
              </div>
            )}
          </>
        )}

        {uniqueUnitTypes.length >
          0 &&
          !isLand && (
          <p
            className={
              styles.units
            }
          >
            {uniqueUnitTypes
              .slice(
                0,
                3
              )
              .join(
                ' • '
              )}

            {uniqueUnitTypes.length >
            3
              ? ` +${uniqueUnitTypes.length - 3} more`
              : ''}
          </p>
        )}

        <span
          className={
            styles.viewBtn
          }
        >
          {property.serviceType ===
          'shortlet'
            ? 'View Stay'
            : property.serviceType ===
                'hostel'
              ? 'View Hostel'
              : isLand
                ? 'View Land'
                : 'View Property'}

          <ArrowRight
            size={16}
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}