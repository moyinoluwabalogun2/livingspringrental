'use client';

import Image from 'next/image';
import { ArrowRight, Bath, BedDouble, Building2, MapPin, Video } from 'lucide-react';
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

type Props = {
  property: Property;
  onClick?: () => void;
};

function formatPrice(price?: number, period?: string) {
  if (!price) return 'Price on request';

  const amount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);

  if (!period || period === 'one-time') return amount;
  return `${amount}/${period}`;
}

function isVideo(url?: string) {
  return Boolean(url && /\.(mp4|webm|ogg)$/i.test(url));
}

export default function PropertyCard({ property, onClick }: Props) {
  const units = property.units || [];
  const availableUnits = units.filter((unit) => unit.status === 'available');
  const displayUnits = availableUnits.length ? availableUnits : units;

  const lowestUnit = displayUnits.length
    ? [...displayUnits].sort((a, b) => Number(a.price || 0) - Number(b.price || 0))[0]
    : undefined;

  const mediaUrl = property.media?.[0];
  const hasVideo = isVideo(mediaUrl);

  const statusText = availableUnits.length
    ? `${availableUnits.length} Available`
    : units.length
      ? 'Currently Unavailable'
      : 'Contact Agent';

  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.media}>
        {mediaUrl && !hasVideo ? (
          <Image
            src={mediaUrl}
            alt={property.title || 'Property'}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.fallbackMedia}>
            {hasVideo ? <Video size={30} /> : <Building2 size={34} />}
            <span>{hasVideo ? 'Video Tour' : 'Living Springs'}</span>
          </div>
        )}

        <div className={styles.badges}>
          <span>{property.listingPurpose || 'Rent'}</span>
          <span className={availableUnits.length ? styles.available : styles.unavailable}>
            {statusText}
          </span>
        </div>

        {property.featured && <div className={styles.featured}>Featured</div>}
      </div>

      <div className={styles.body}>
        <p className={styles.location}>
          <MapPin size={15} />
          {property.location || 'Location available on request'}
        </p>

        <h3>{property.title || 'Untitled Property'}</h3>

        <p className={styles.price}>
          {units.length > 1 ? 'From ' : ''}
          {formatPrice(lowestUnit?.price, lowestUnit?.pricePeriod)}
        </p>

        <div className={styles.meta}>
          <span>
            <Building2 size={15} />
            {property.propertyType || property.category || 'Property'}
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
            {units.length > 3 ? ` +${units.length - 3} more` : ''}
          </p>
        )}

        <button type="button" className={styles.viewBtn}>
          View Property
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}