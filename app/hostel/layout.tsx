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
    'Hostel Accommodation',

  description:
    'Browse published hostel accommodation and available room or unit types with Living Spring across Nigeria.',

  alternates: {
    canonical:
      absoluteUrl(
        '/hostel'
      ),
  },

  openGraph: {
    title:
      'Living Spring Hostel Accommodation',

    description:
      'Discover hostel accommodation, available room types and current listings with Living Spring.',

    url:
      absoluteUrl(
        '/hostel'
      ),

    siteName:
      'Living Spring',

    type:
      'website',
  },
};

export default function HostelLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}