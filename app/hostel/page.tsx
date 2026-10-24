import {
  Suspense,
} from 'react';

import Navbar
  from '@/components/Navbar';

import Footer
  from '@/components/Footer';

import PublicInventory
  from '@/components/listings/PublicInventory';

export default function HostelPage() {
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
          service="hostel"
        />
      </Suspense>

      <Footer />
    </>
  );
}