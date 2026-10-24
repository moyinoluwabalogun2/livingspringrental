'use client';

import {
  useEffect,
  useState,
} from 'react';

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
  from './PropertyCard';

import styles
  from './SimilarProperties.module.css';

type SimilarPropertiesProps = {
  currentPropertyId:
    string;

  category:
    string;

  serviceType?:
    PropertyRecord[
      'serviceType'
    ];
};

export default function SimilarProperties({
  currentPropertyId,
  category,
  serviceType =
    'property',
}: SimilarPropertiesProps) {
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

    async function fetchSimilarProperties() {
      try {
        /*
         * Public Firestore rules
         * require the query to be
         * constrained to published
         * listings.
         */
        const similarQuery =
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
              serviceType
            ),

            limit(
              12
            )
          );

        const snapshot =
          await getDocs(
            similarQuery
          );

        const data =
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
            )
            .filter(
              (
                property
              ) =>
                property.id !==
                  currentPropertyId &&
                (
                  !category ||
                  property.category ===
                    category ||
                  serviceType !==
                    'property'
                )
            )
            .slice(
              0,
              3
            );

        if (
          active
        ) {
          setProperties(
            data
          );
        }
      } catch (
        error
      ) {
        console.error(
          'Error fetching similar properties:',
          error
        );
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

    void fetchSimilarProperties();

    return () => {
      active =
        false;
    };
  }, [
    category,
    currentPropertyId,
    serviceType,
  ]);

  if (
    loading ||
    properties.length ===
      0
  ) {
    return null;
  }

  return (
    <div
      className={
        styles.similar
      }
    >
      <h2>
        Similar Listings
      </h2>

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
    </div>
  );
}