'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import styles from './SearchSection.module.css';

export default function SearchSection() {
  const router = useRouter();

  const [filters, setFilters] = useState({
    keyword: '',
    category: 'All',
    listingPurpose: 'All',
    unitType: 'All',
  });

  const updateFilter = (field: keyof typeof filters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
  };

  const handleSearch = () => {
    localStorage.setItem('searchFilters', JSON.stringify(filters));
    router.push('/properties');
  };

  return (
    <section className={styles.wrapper}>
      <div className="container">
        <div className={styles.searchCard}>
          <div>
            <span className={styles.eyebrow}>Smart search</span>
            <h3>Find a Property</h3>
          </div>

          <div className={styles.grid}>
            <input
              placeholder="Location or keyword"
              value={filters.keyword}
              onChange={(event) => updateFilter('keyword', event.target.value)}
            />

            <select
              value={filters.category}
              onChange={(event) => updateFilter('category', event.target.value)}
            >
              <option>All</option>
              <option>Residential</option>
              <option>Commercial</option>
              <option>Land</option>
            </select>

            <select
              value={filters.listingPurpose}
              onChange={(event) => updateFilter('listingPurpose', event.target.value)}
            >
              <option>All</option>
              <option>Rent</option>
              <option>Sale</option>
              <option>Lease</option>
            </select>

            <select
              value={filters.unitType}
              onChange={(event) => updateFilter('unitType', event.target.value)}
            >
              <option>All</option>
              <option>Self Contain</option>
              <option>Room & Parlour</option>
              <option>2 Bedroom Flat</option>
              <option>3 Bedroom Flat</option>
              <option>Shop</option>
              <option>Office Space</option>
              <option>Land</option>
            </select>

            <button className="btn btn-primary" type="button" onClick={handleSearch}>
              <Search size={18} />
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}