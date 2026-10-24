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
    'Contact Living Spring',

  description:
    'Contact Living Spring about properties, hostel accommodation, short-let stays, inspections and property advertising enquiries across Nigeria.',

  alternates: {
    canonical:
      absoluteUrl(
        '/contact'
      ),
  },

  openGraph: {
    title:
      'Contact Living Spring',

    description:
      'Ask Living Spring about properties, hostels, short-lets, inspections and property advertising.',

    url:
      absoluteUrl(
        '/contact'
      ),

    type:
      'website',

    siteName:
      'Living Spring',
  },
};

export default function ContactLayout({
  children,
}: {
  children:
    ReactNode;
}) {
  return children;
}