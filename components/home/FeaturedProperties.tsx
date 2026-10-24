'use client';

import {
  useEffect,
  useState,
} from 'react';

import Link
  from 'next/link';

import {
  ArrowRight,
  Building2,
} from 'lucide-react';

import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from 'firebase/firestore';

import {
  db,
} from '@/lib/firebase';

import {
  isPublicProperty,
  normalizeProperty,
  type PropertyRecord,
} from '@/lib/property';

import PropertyCard
  from '@/components/PropertyCard';

import styles
  from './FeaturedProperties.module.css';

export default function FeaturedProperties() {
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

  useEffect(() => {
    let active =
      true;

    async function loadFeatured() {
      try {
        /*
         * Fetch a small pool,
         * filter private listings,
         * then display three.
         */
        const featuredSnapshot =
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
    'featured',
    '==',
    true
  ),

  limit(8)
)
          );

        let result =
          featuredSnapshot.docs
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
            )
            .slice(
              0,
              3
            );

        if (
          result.length ===
          0
        ) {
          const fallbackSnapshot =
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

  limit(8)
)
            );

          result =
            fallbackSnapshot.docs
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
              )
              .slice(
                0,
                3
              );
        }

        if (active) {
          setProperties(
            result
          );
        }
      } catch (error) {
        console.error(
          'Failed to load featured listings:',
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

    void loadFeatured();

    return () => {
      active =
        false;
    };
  }, []);

  return (
    <section
      className={`${styles.section} content-auto`}
    >
      <div className="container">
        <div
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
              <Building2
                size={16}
              />

              Featured Listings
            </span>

            <h2>
              Explore current
              Living Spring
              opportunities.
            </h2>

            <p>
              A selected view of
              current published
              property and
              accommodation
              listings.
            </p>
          </div>

          <Link
            href="/properties"
            className="btn btn-outline"
          >
            View All Properties

            <ArrowRight
              size={17}
            />
          </Link>
        </div>

        {loading ? (
          <div
            className={
              styles.skeletonGrid
            }
          >
            <div
              className={
                styles.skeletonCard
              }
            />

            <div
              className={
                styles.skeletonCard
              }
            />

            <div
              className={
                styles.skeletonCard
              }
            />
          </div>
        ) : properties.length >
          0 ? (
          <div className="grid">
            {properties.map(
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
              styles.empty
            }
          >
            <h3>
              New listings are
              being prepared.
            </h3>

            <p>
              Contact Living Spring
              for current
              availability.
            </p>

            <Link
              href="/contact"
              className="btn btn-dark"
            >
              Make an Enquiry
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}