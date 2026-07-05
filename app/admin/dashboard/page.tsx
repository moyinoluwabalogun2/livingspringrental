'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Home, PlusCircle, XCircle } from 'lucide-react';
import { collection, db, getDocs } from '@/lib/firebase';
import styles from './page.module.css';

export default function AdminDashboardPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const snap = await getDocs(collection(db, 'properties'));
        setProperties(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const stats = useMemo(() => {
    const units = properties.flatMap((item) => item.units || []);
    return {
      properties: properties.length,
      units: units.length,
      available: units.filter((unit) => unit.status === 'available').length,
      unavailable: units.filter((unit) => unit.status !== 'available').length,
    };
  }, [properties]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span>Admin Dashboard</span>
          <h1>Manage Living Springs listings.</h1>
          <p>Add properties, update units, and keep public listings accurate.</p>
        </div>

        <Link href="/admin/properties/new" className={styles.addBtn}>
          <PlusCircle size={18} />
          Add Property
        </Link>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner" />
        </div>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div>
              <Building2 size={24} />
              <span>Total Properties</span>
              <strong>{stats.properties}</strong>
            </div>

            <div>
              <Home size={24} />
              <span>Total Units</span>
              <strong>{stats.units}</strong>
            </div>

            <div>
              <CheckCircle2 size={24} />
              <span>Available Units</span>
              <strong>{stats.available}</strong>
            </div>

            <div>
              <XCircle size={24} />
              <span>Unavailable Units</span>
              <strong>{stats.unavailable}</strong>
            </div>
          </div>

          <section className={styles.panel}>
            <div className={styles.panelTop}>
              <h2>Recent Properties</h2>
              <Link href="/admin/properties">View All</Link>
            </div>

            {properties.length ? (
              <div className={styles.list}>
                {properties.slice(0, 5).map((property) => (
                  <Link href={`/admin/properties/edit/${property.id}`} key={property.id}>
                    <div>
                      <strong>{property.title}</strong>
                      <span>
                        {property.category} · {property.listingPurpose} ·{' '}
                        {(property.units || []).length} unit
                        {(property.units || []).length === 1 ? '' : 's'}
                      </span>
                    </div>
                    <small>{property.featured ? 'Featured' : 'Standard'}</small>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.empty}>
                <h3>No properties yet</h3>
                <p>Create the first property listing to start populating the website.</p>
                <Link href="/admin/properties/new" className={styles.addBtn}>
                  <PlusCircle size={18} />
                  Add Property
                </Link>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}