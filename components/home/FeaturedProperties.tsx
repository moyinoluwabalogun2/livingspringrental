'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import PropertyCard from '@/components/PropertyCard';
import { collection, db, getDocs, limit, orderBy, query } from '@/lib/firebase';
import styles from './FeaturedProperties.module.css';

type FeaturedPropertyUnit = {
  id?: string;
  unitType?: string;
  price?: number;
  pricePeriod?: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  status?: string;
};

type FeaturedProperty = {
  id: string;
  title?: string;
  category?: string;
  listingPurpose?: string;
  location?: string;
  address?: string;
  propertyType?: string;
  description?: string;
  media?: string[];
  images?: string[];
  featured?: boolean;
  units?: FeaturedPropertyUnit[];
  price?: number;
  pricePeriod?: string;
  createdAt?: unknown;
};

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;

  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : undefined;
}

export default function FeaturedProperties() {
  const router = useRouter();

  const [properties, setProperties] = useState<FeaturedProperty[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'properties'), orderBy('createdAt', 'desc'), limit(6));
        const snap = await getDocs(q);

        const data = snap.docs.map((document) => {
          const rawData = document.data();

          const units = Array.isArray(rawData.units)
            ? rawData.units.map((unit) => ({
                ...unit,
                price: toNumber(unit.price),
              }))
            : undefined;

          return {
            id: document.id,
            ...rawData,
            price: toNumber(rawData.price),
            units,
          } as FeaturedProperty;
        });

        const featured = data.filter((property) => property.featured === true);

        setProperties(featured.length ? featured.slice(0, 6) : data.slice(0, 6));
      } catch (error) {
        console.error('Error fetching featured properties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              <Building2 size={17} />
              Featured listings
            </span>

            <h2>Premium properties currently on the market.</h2>

            <p>
              Explore selected residential, commercial, and land opportunities managed through
              Living Springs.
            </p>
          </div>

          <Link href="/properties" className="btn btn-outline">
            View All Properties
            <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.skeletonGrid}>
            {[1, 2, 3].map((item) => (
              <div key={item} className={styles.skeletonCard} />
            ))}
          </div>
        ) : properties.length ? (
          <div className="grid">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onClick={() => router.push(`/properties/${property.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <h3>No properties added yet</h3>

            <p>
              Once properties are added from the admin dashboard, featured listings will appear here.
            </p>

            <Link href="/admin/login" className="btn btn-primary">
              Go to Admin
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}