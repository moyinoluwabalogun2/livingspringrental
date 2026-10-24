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
    'Short-Let Accommodation',

  description:
    'Browse published Living Spring short-let accommodation for nightly, weekly and flexible stays across Nigeria.',

  alternates: {
    canonical:
      absoluteUrl(
        '/shortlet'
      ),
  },

  openGraph: {
    title:
      'Living Spring Short-Let Accommodation',

    description:
      'Discover furnished short-let stays with nightly and flexible accommodation options through Living Spring.',

    url:
      absoluteUrl(
        '/shortlet'
      ),

    siteName:
      'Living Spring',

    type:
      'website',
  },
};

export default function ShortletLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}