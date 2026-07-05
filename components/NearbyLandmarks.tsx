// components/NearbyLandmarks.tsx
import { FaMapMarkerAlt } from 'react-icons/fa';
import styles from './NearbyLandmarks.module.css';

export default function NearbyLandmarks({ landmarks }: { landmarks: string[] }) {
  if (!landmarks || landmarks.length === 0) return null;

  return (
    <div className={styles.landmarks}>
      <h2>Nearby Landmarks</h2>
      <div className={styles.list}>
        {landmarks.map((landmark, index) => (
          <div key={index} className={styles.landmark}>
            <FaMapMarkerAlt /> {landmark}
          </div>
        ))}
      </div>
    </div>
  );
}