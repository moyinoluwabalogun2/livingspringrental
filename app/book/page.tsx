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

import BookingRequestClient
  from '@/components/booking/BookingRequestClient';

export const metadata:
  Metadata = {
  title:
    'Short-Let Booking Request',

  description:
    'Request a Living Spring short-let stay and confirm availability directly with Living Spring.',
};

export default function BookingPage() {
  return (
    <>
      <Navbar />

      <main>
        <Suspense
          fallback={
            <section
              className="loading"
            >
              <div
                className="loading-spinner"
              />
            </section>
          }
        >
          <BookingRequestClient />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}