'use client';

import { useState } from 'react';
import { FaSearch, FaMapMarkerAlt, FaBuilding, FaTag, FaHome, FaBed, FaDollarSign } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SearchFilters.module.css';

interface SearchFiltersProps {
  onSearch: (filters: any) => void;
}

export default function SearchFilters({ onSearch }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    location: '',
    category: '',
    listingPurpose: '',
    propertyType: '',
    unitType: '',
    bedrooms: '',
    minPrice: '',
    maxPrice: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const locations = ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano', 'Enugu'];
  const categories = ['Residential', 'Commercial', 'Land'];
  const listingPurposes = ['Rent', 'Sale', 'Lease'];
  const residentialTypes = ['Self Contain', 'Room', 'Room & Parlour', 'Mini Flat', '1 Bedroom Flat', '2 Bedroom Flat', '3 Bedroom Flat', '4 Bedroom Flat', 'Duplex', 'Bungalow', 'Detached House', 'Semi Detached House'];
  const commercialTypes = ['Shop', 'Office Space', 'Warehouse', 'Plaza Space', 'Event Space', 'Industrial Property'];
  const landTypes = ['Residential Land', 'Commercial Land', 'Agricultural Land', 'Investment Land'];
  const bedrooms = ['Studio', '1', '2', '3', '4', '5+'];

  const getPropertyTypes = () => {
    if (filters.category === 'Residential') return residentialTypes;
    if (filters.category === 'Commercial') return commercialTypes;
    if (filters.category === 'Land') return landTypes;
    return [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleReset = () => {
    setFilters({
      location: '',
      category: '',
      listingPurpose: '',
      propertyType: '',
      unitType: '',
      bedrooms: '',
      minPrice: '',
      maxPrice: ''
    });
    onSearch({});
  };

  return (
    <div className={styles.searchFilters}>
      <form onSubmit={handleSubmit}>
        <div className={styles.mainFilters}>
          <div className={styles.filterGroup}>
            <FaMapMarkerAlt className={styles.filterIcon} />
            <select 
              value={filters.location} 
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="">Location</option>
              {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <FaBuilding className={styles.filterIcon} />
            <select 
              value={filters.category} 
              onChange={(e) => setFilters({...filters, category: e.target.value, propertyType: ''})}
            >
              <option value="">Category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <FaTag className={styles.filterIcon} />
            <select 
              value={filters.listingPurpose} 
              onChange={(e) => setFilters({...filters, listingPurpose: e.target.value})}
            >
              <option value="">Purpose</option>
              {listingPurposes.map(purpose => <option key={purpose} value={purpose}>{purpose}</option>)}
            </select>
          </div>

          <button type="submit" className={styles.searchBtn}>
            <FaSearch /> Search
          </button>

          <button type="button" className={styles.expandBtn} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Less Filters' : 'More Filters'}
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className={styles.expandedFilters}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.filterRow}>
                <div className={styles.filterGroup}>
                  <FaHome className={styles.filterIcon} />
                  <select 
                    value={filters.propertyType} 
                    onChange={(e) => setFilters({...filters, propertyType: e.target.value})}
                  >
                    <option value="">Property Type</option>
                    {getPropertyTypes().map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <FaBed className={styles.filterIcon} />
                  <select 
                    value={filters.bedrooms} 
                    onChange={(e) => setFilters({...filters, bedrooms: e.target.value})}
                  >
                    <option value="">Bedrooms</option>
                    {bedrooms.map(bed => <option key={bed} value={bed}>{bed}</option>)}
                  </select>
                </div>

                <div className={styles.filterGroup}>
                  <FaDollarSign className={styles.filterIcon} />
                  <input 
                    type="number" 
                    placeholder="Min Price" 
                    value={filters.minPrice}
                    onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                  />
                </div>

                <div className={styles.filterGroup}>
                  <FaDollarSign className={styles.filterIcon} />
                  <input 
                    type="number" 
                    placeholder="Max Price" 
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                  />
                </div>
              </div>

              <div className={styles.filterActions}>
                <button type="button" className={styles.resetBtn} onClick={handleReset}>
                  Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}