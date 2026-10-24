import type {
  MetadataRoute,
} from 'next';

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
  SITE_URL,
} from '@/lib/seo';

type FirestoreTimestampLike = {
  toDate?: () => Date;
};

function timestampToDate(
  value:
    unknown
) {
  if (
    value &&
    typeof value ===
      'object' &&
    'toDate' in value
  ) {
    const timestamp =
      value as
        FirestoreTimestampLike;

    if (
      typeof
        timestamp.toDate ===
      'function'
    ) {
      return timestamp
        .toDate();
    }
  }

  return new Date();
}

export default async function sitemap():
  Promise<
    MetadataRoute.Sitemap
  > {
  const now =
    new Date();

  /*
   * Only real canonical public pages
   * belong in the sitemap.
   *
   * Old Isara / Ijebu URLs remain as
   * redirects for backwards compatibility,
   * but redirects should not be advertised
   * as canonical sitemap destinations.
   */
  const staticRoutes:
    MetadataRoute.Sitemap = [
    {
      url:
        `${SITE_URL}/`,

      lastModified:
        now,

      changeFrequency:
        'weekly',

      priority:
        1,
    },

    {
      url:
        `${SITE_URL}/properties`,

      lastModified:
        now,

      changeFrequency:
        'daily',

      priority:
        0.95,
    },

    {
      url:
        `${SITE_URL}/hostel`,

      lastModified:
        now,

      changeFrequency:
        'daily',

      priority:
        0.9,
    },

    {
      url:
        `${SITE_URL}/shortlet`,

      lastModified:
        now,

      changeFrequency:
        'daily',

      priority:
        0.9,
    },

    {
      url:
        `${SITE_URL}/about`,

      lastModified:
        now,

      changeFrequency:
        'monthly',

      priority:
        0.65,
    },

    {
      url:
        `${SITE_URL}/contact`,

      lastModified:
        now,

      changeFrequency:
        'monthly',

      priority:
        0.7,
    },
  ];

  try {
    /*
     * Public Firestore rules require
     * lifecycleStatus == published.
     *
     * The current public-rule ceiling is
     * 60 documents, so keep this query
     * within that limit for V2.
     *
     * We will replace this with cursor /
     * server-side scalable indexing once
     * inventory volume warrants it.
     */
    const propertiesQuery =
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

        limit(
          60
        )
      );

    const snapshot =
      await getDocs(
        propertiesQuery
      );

    const propertyRoutes:
      MetadataRoute.Sitemap =
      snapshot.docs.map(
        (
          propertyDocument
        ) => {
          const data =
            propertyDocument.data();

          return {
            url:
              `${SITE_URL}/properties/${propertyDocument.id}`,

            lastModified:
              timestampToDate(
                data.updatedAt
              ),

            changeFrequency:
              'weekly',

            priority:
              data.featured ===
              true
                ? 0.85
                : 0.8,
          };
        }
      );

    return [
      ...staticRoutes,
      ...propertyRoutes,
    ];
  } catch (
    error
  ) {
    /*
     * A temporary Firebase problem
     * should never cause sitemap.xml
     * itself to fail.
     */
    console.error(
      'Living Spring sitemap property fetch failed:',
      error
    );

    return staticRoutes;
  }
}