'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Bath,
  BedDouble,
  Building2,
  MapPin,
  Video,
} from 'lucide-react';
import styles from './PropertyCard.module.css';

type Unit = {
  unitType?: string;
  price?: number;
  pricePeriod?: string;
  bedrooms?: number;
  bathrooms?: number;
  status?: string;
};

type Property = {
  id?: string;
  title?: string;
  category?: string;
  listingPurpose?: string;
  propertyType?: string;
  location?: string;
  media?: string[];
  units?: Unit[];
  featured?: boolean;
};

type PropertyCardProps = {
  property: Property;
};

function formatPrice(price?: number, period?: string) {
  if (!price) {
    return 'Price on request';
  }

  const amount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);

  if (!period || period === 'one-time') {
    return amount;
  }

  return `${amount}/${period}`;
}

function isDirectVideo(url?: string) {
  if (!url) return false;

  const cleanUrl = url.split('?')[0].split('#')[0];

  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(cleanUrl);
}

export default function PropertyCard({
  property,
}: PropertyCardProps) {
  const units = property.units || [];

  const availableUnits = units.filter(
    (unit) => unit.status === 'available'
  );

  const unitsForPrice = availableUnits.length
    ? availableUnits
    : units;

  const lowestUnit = unitsForPrice.length
    ? [...unitsForPrice].sort(
        (a, b) =>
          Number(a.price || 0) - Number(b.price || 0)
      )[0]
    : undefined;

  const mediaUrl = property.media?.find(Boolean);
  const video = isDirectVideo(mediaUrl);

  const availabilityText = availableUnits.length
    ? `${availableUnits.length} Available`
    : units.length
      ? 'Currently Unavailable'
      : 'Contact Agent';

  const href = property.id
    ? `/properties/${property.id}`
    : '/properties';

  return (
    <Link
      href={href}
      className={styles.card}
      aria-label={`View ${property.title || 'property'}`}
    >
      <div className={styles.media}>
        {mediaUrl && !video ? (
          <img
            src={mediaUrl}
            alt={property.title || 'Property'}
            className={styles.image}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className={styles.fallbackMedia}>
            {video ? (
              <Video size={32} />
            ) : (
              <Building2 size={36} />
            )}

            <span>
              {video ? 'Video Tour Available' : 'Living Springs'}
            </span>
          </div>
        )}

        <div className={styles.badges}>
          <span>
            {property.listingPurpose || 'Rent'}
          </span>

          <span
            className={
              availableUnits.length
                ? styles.available
                : styles.unavailable
            }
          >
            {availabilityText}
          </span>
        </div>

        {property.featured && (
          <div className={styles.featured}>
            Featured
          </div>
        )}
      </div>

      <div className={styles.body}>
        <p className={styles.location}>
          <MapPin size={15} />

          {property.location ||
            'Location available on request'}
        </p>

        <h3>{property.title || 'Untitled Property'}</h3>

        <p className={styles.price}>
          {units.length > 1 ? 'From ' : ''}

          {formatPrice(
            lowestUnit?.price,
            lowestUnit?.pricePeriod
          )}
        </p>

        <div className={styles.meta}>
          <span>
            <Building2 size={15} />

            {property.propertyType ||
              property.category ||
              'Property'}
          </span>

          {lowestUnit?.bedrooms !== undefined && (
            <span>
              <BedDouble size={15} />
              {lowestUnit.bedrooms} Bed
            </span>
          )}

          {lowestUnit?.bathrooms !== undefined && (
            <span>
              <Bath size={15} />
              {lowestUnit.bathrooms} Bath
            </span>
          )}
        </div>

        {units.length > 1 && (
          <p className={styles.units}>
            {units
              .slice(0, 3)
              .map((unit) => unit.unitType)
              .filter(Boolean)
              .join(' • ')}

            {units.length > 3
              ? ` +${units.length - 3} more`
              : ''}
          </p>
        )}

        <span className={styles.viewBtn}>
          View Property
          <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  );
}