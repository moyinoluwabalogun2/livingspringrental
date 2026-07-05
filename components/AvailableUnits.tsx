// components/AvailableUnits.tsx
'use client';

import { useState } from 'react';
import { FaBed, FaBath, FaToilet, FaEye } from 'react-icons/fa';
import styles from './AvailableUnits.module.css';

interface Unit {
  unitType: string;
  price: number;
  pricePeriod: string;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  status: string;
  description: string;
}

export default function AvailableUnits({ units, propertyId, propertyTitle }: { units: Unit[], propertyId: string, propertyTitle: string }) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  if (!units || units.length === 0) return null;

  const availableUnits = units.filter(u => u.status === 'available');

  return (
    <div className={styles.units}>
      <h2>Available Units</h2>
      <div className={styles.unitsGrid}>
        {availableUnits.map((unit, index) => (
          <div key={index} className={styles.unitCard}>
            <h3>{unit.unitType}</h3>
            <div className={styles.price}>
              ₦{unit.price.toLocaleString()}
              <span>/{unit.pricePeriod}</span>
            </div>
            <div className={styles.specs}>
              {unit.bedrooms > 0 && <span><FaBed /> {unit.bedrooms} beds</span>}
              {unit.bathrooms > 0 && <span><FaBath /> {unit.bathrooms} baths</span>}
              {unit.toilets > 0 && <span><FaToilet /> {unit.toilets} toilets</span>}
            </div>
            <button 
              className="btn btn-outline" 
              onClick={() => setSelectedUnit(unit)}
              style={{ width: '100%', marginTop: '1rem' }}
            >
              <FaEye /> Request Inspection
            </button>
          </div>
        ))}
      </div>

      {selectedUnit && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Request Inspection: {selectedUnit.unitType}</h3>
            <p>Property: {propertyTitle}</p>
            <p>Price: ₦{selectedUnit.price.toLocaleString()}/{selectedUnit.pricePeriod}</p>
            <p>Please fill out the inquiry form below.</p>
            <button onClick={() => setSelectedUnit(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}