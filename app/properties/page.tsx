'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { collection, db, getDocs } from '@/lib/firebase';
import styles from './page.module.css';

function PropertiesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    keyword: '',
    category: searchParams.get('category') || 'All',
    listingPurpose: 'All',
    unitType: 'All',
    maxPrice: '',
  });

  useEffect(() => {
    const saved = localStorage.getItem('searchFilters');

    if (saved) {
      try {
        setFilters((current) => ({ ...current, ...JSON.parse(saved) }));
        localStorage.removeItem('searchFilters');
      } catch {
        localStorage.removeItem('searchFilters');
      }
    }
  }, []);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const snap = await getDocs(collection(db, 'properties'));

        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProperties(
          data.sort((a: any, b: any) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          })
        );
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const filteredProperties = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    const maxPrice = Number(filters.maxPrice);

    return properties.filter((property) => {
      const units = property.units || [];
      const prices = units.map((unit: any) => Number(unit.price) || 0).filter(Boolean);
      const lowestPrice = prices.length ? Math.min(...prices) : 0;

      const keywordText = [
        property.title,
        property.location,
        property.address,
        property.category,
        property.propertyType,
        property.listingPurpose,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const unitTypeMatch =
        filters.unitType === 'All' ||
        units.some((unit: any) => unit.unitType === filters.unitType);

      return (
        (!keyword || keywordText.includes(keyword)) &&
        (filters.category === 'All' || property.category === filters.category) &&
        (filters.listingPurpose === 'All' || property.listingPurpose === filters.listingPurpose) &&
        unitTypeMatch &&
        (!maxPrice || !lowestPrice || lowestPrice <= maxPrice)
      );
    });
  }, [filters, properties]);

  const updateFilter = (name: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      keyword: '',
      category: 'All',
      listingPurpose: 'All',
      unitType: 'All',
      maxPrice: '',
    });
  };

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <span className={styles.kicker}>Property Listings</span>

            <h1>Browse Available Properties.</h1>

            <p>
              Search through current Living Springs listings and find the property that fits your
              next move.
            </p>
          </div>
        </section>

        <section className="container">
          <div className={styles.filterCard}>
            <div className={styles.filterTop}>
              <div>
                <span>
                  <SlidersHorizontal size={16} />
                  Search Filters
                </span>

                <h2>Refine your search</h2>
              </div>

              <button type="button" onClick={resetFilters}>
                <X size={16} />
                Reset
              </button>
            </div>

            <div className={styles.filterGrid}>
              <label>
                Search
                <div className={styles.searchInput}>
                  <Search size={17} />
                  <input
                    value={filters.keyword}
                    onChange={(event) => updateFilter('keyword', event.target.value)}
                    placeholder="Location, title, area..."
                  />
                </div>
              </label>

              <label>
                Category
                <select
                  value={filters.category}
                  onChange={(event) => updateFilter('category', event.target.value)}
                >
                  <option>All</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
              </label>

              <label>
                Purpose
                <select
                  value={filters.listingPurpose}
                  onChange={(event) => updateFilter('listingPurpose', event.target.value)}
                >
                  <option>All</option>
                  <option>Rent</option>
                  <option>Sale</option>
                  <option>Lease</option>
                </select>
              </label>

              <label>
                Unit Type
                <select
                  value={filters.unitType}
                  onChange={(event) => updateFilter('unitType', event.target.value)}
                >
                  <option>All</option>
                  <option>Self Contain</option>
                  <option>Mini Flat</option>
                  <option>Room & Parlour</option>
                  <option>2 Bedroom Flat</option>
                  <option>3 Bedroom Flat</option>
                  <option>Shop</option>
                  <option>Office Space</option>
                  <option>Land</option>
                </select>
              </label>

              <label>
                Max Price
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) => updateFilter('maxPrice', event.target.value)}
                  placeholder="e.g. 900000"
                />
              </label>
            </div>
          </div>

          <div className={styles.resultsTop}>
            <div>
              <span>
                {filteredProperties.length} result
                {filteredProperties.length === 1 ? '' : 's'}
              </span>

              <h2>Property results</h2>
            </div>
          </div>

          {loading ? (
            <div className={styles.skeletonGrid}>
              <div />
              <div />
              <div />
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid">
              {filteredProperties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onClick={() => router.push(`/properties/${property.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h3>No matching properties found</h3>

              <p>
                Try adjusting your filters or contact Living Springs Rentals for current
                availability.
              </p>

              <button type="button" className="btn btn-gold" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />
          <div className="loading">
            <div className="loading-spinner" />
          </div>
          <Footer />
        </>
      }
    >
      <PropertiesPageContent />
    </Suspense>
  );
}