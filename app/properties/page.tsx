import type {
  Metadata,
} from 'next';

import {
  Suspense,
} from 'react';

import Navbar
  from '@/components/Navbar';

import Footer
  from '@/components/Footer';

import PublicInventory
  from '@/components/listings/PublicInventory';

import {
  absoluteUrl,
} from '@/lib/seo';

export const metadata:
  Metadata = {
  title:
    'Properties',

  description:
    'Browse residential property, commercial property and land for rent, sale or lease through Living Spring across Nigeria.',

  alternates: {
    canonical:
      absoluteUrl(
        '/properties'
      ),
  },

  openGraph: {
    title:
      'Properties | Living Spring',

    description:
      'Discover residential, commercial and land opportunities through Living Spring.',

    url:
      absoluteUrl(
        '/properties'
      ),

    type:
      'website',

    siteName:
      'Living Spring',
  },
};

export default function PropertiesPage() {
  return (
    <>
      <Navbar />

      <Suspense
        fallback={
          <div className="loading">
            <div
              className="loading-spinner"
            />
          </div>
        }
      >
        <PublicInventory
          service="property"
        />
      </Suspense>

      <Footer />
    </>
  );
}