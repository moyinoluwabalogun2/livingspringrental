'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Edit,
  Eye,
  PlusCircle,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import {
  collection,
  db,
  deleteDoc,
  doc,
  getDocs,
} from '@/lib/firebase';
import styles from './page.module.css';

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const snap = await getDocs(collection(db, 'properties'));
      const data = snap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
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
  };

  const filteredProperties = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    if (!text) return properties;

    return properties.filter((property) =>
      [
        property.title,
        property.location,
        property.category,
        property.propertyType,
        property.listingPurpose,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(text)
    );
  }, [keyword, properties]);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`);

    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, 'properties', id));
      setProperties((current) => current.filter((property) => property.id !== id));
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Could not delete property. Please try again.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span>Property Management</span>
          <h1>Manage Properties</h1>
          <p>Add, edit, delete and review all Living Springs listings.</p>
        </div>

        <Link href="/admin/properties/new" className={styles.addBtn}>
          <PlusCircle size={18} />
          Add Property
        </Link>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Search by title, location, category..."
          />
        </div>

        <div className={styles.count}>
          {filteredProperties.length} property
          {filteredProperties.length === 1 ? '' : 'ies'}
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner" />
        </div>
      ) : filteredProperties.length ? (
        <div className={styles.tableCard}>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Property</span>
              <span>Category</span>
              <span>Units</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {filteredProperties.map((property) => {
              const units = property.units || [];
              const available = units.filter((unit: any) => unit.status === 'available').length;

              return (
                <div className={styles.tableRow} key={property.id}>
                  <div className={styles.propertyCell}>
                    <div className={styles.thumb}>
                      {property.media?.[0] ? (
                        <img src={property.media[0]} alt={property.title} />
                      ) : (
                        <span>LS</span>
                      )}
                    </div>

                    <div>
                      <strong>
                        {property.featured && <Star size={15} fill="currentColor" />}
                        {property.title}
                      </strong>
                      <small>{property.location || 'Location not set'}</small>
                    </div>
                  </div>

                  <div>
                    <strong>{property.category || 'Property'}</strong>
                    <small>{property.listingPurpose || 'Rent'}</small>
                  </div>

                  <div>
                    <strong>{units.length}</strong>
                    <small>{available} available</small>
                  </div>

                  <div>
                    <span className={available ? styles.available : styles.unavailable}>
                      {available ? 'Available' : 'Unavailable'}
                    </span>
                  </div>

                  <div className={styles.actions}>
                    <Link href={`/properties/${property.id}`} target="_blank" title="View">
                      <Eye size={17} />
                    </Link>

                    <Link href={`/admin/properties/edit/${property.id}`} title="Edit">
  <Edit size={17} />
</Link>

                    <button
                      type="button"
                      title="Delete"
                      onClick={() => handleDelete(property.id, property.title)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className={styles.empty}>
          <h2>No properties found</h2>
          <p>Create a new listing or adjust your search keyword.</p>
          <Link href="/admin/properties/new" className={styles.addBtn}>
            <PlusCircle size={18} />
            Add Property
          </Link>
        </div>
      )}
    </div>
  );
}