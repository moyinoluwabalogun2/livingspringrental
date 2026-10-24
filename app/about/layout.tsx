import type {
  Metadata,
} from 'next';

import type {
  ReactNode,
} from 'react';

import {
  absoluteUrl,
} from '@/lib/seo';

export const metadata:
  Metadata = {
  title:
    'About Living Spring',

  description:
    'Learn about Living Spring, a property and accommodation platform helping people discover properties, land, hostels and short-let stays across Nigeria.',

  alternates: {
    canonical:
      absoluteUrl(
        '/about'
      ),
  },

  openGraph: {
    title:
      'About Living Spring',

    description:
      'Living Spring brings properties, hostels and short-let accommodation together in one organised platform.',

    url:
      absoluteUrl(
        '/about'
      ),

    type:
      'website',

    siteName:
      'Living Spring',
  },
};

export default function AboutLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}