// components/SimilarProperties.tsx
'use client';

import { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where, limit } from '@/lib/firebase';
import PropertyCard from './PropertyCard';
import styles from './SimilarProperties.module.css';

export default function SimilarProperties({ currentPropertyId, category }: { currentPropertyId: string, category: string }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSimilarProperties();
  }, [category]);

  const fetchSimilarProperties = async () => {
    try {
      const q = query(collection(db, 'properties'), where('category', '==', category), limit(3));
      const querySnapshot = await getDocs(q);
      const propertiesData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.id !== currentPropertyId);
      setProperties(propertiesData as any);
    } catch (error) {
      console.error('Error fetching similar properties:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (properties.length === 0) return null;

  return (
    <div className={styles.similar}>
      <h2>Similar Properties</h2>
      <div className="grid">
        {properties.map((property: any) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            onClick={() => window.location.href = `/properties/${property.id}`}
          />
        ))}
      </div>
    </div>
  );
}