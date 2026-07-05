// components/AmenitiesList.tsx
import { FaCheck } from 'react-icons/fa';
import styles from './AmenitiesList.module.css';

export default function AmenitiesList({ amenities }: { amenities: string[] }) {
  if (!amenities || amenities.length === 0) return null;
  
  return (
    <div className={styles.amenities}>
      <h2>Amenities</h2>
      <div className={styles.grid}>
        {amenities.map((amenity, index) => (
          <div key={index} className={styles.amenity}>
            <FaCheck /> {amenity}
          </div>
        ))}
      </div>
    </div>
  );
}