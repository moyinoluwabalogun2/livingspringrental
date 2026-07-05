import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, Search } from 'lucide-react';
import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay} />

      <div className="container">
        <div className={styles.content}>
          <span className={styles.badge}>
            <Building2 size={17} />
            Living Spring Properties
          </span>

          <h1>Premium Homes, Apartments & Investment Properties.</h1>

          <p>
            Discover well-managed rental homes, commercial spaces, and future-ready
            property opportunities with a smooth inspection process.
          </p>

          <div className={styles.actions}>
            <Link href="/properties" className="btn btn-gold">
              Browse Properties
              <ArrowRight size={18} />
            </Link>

            <Link href="/contact" className={styles.secondaryBtn}>
              <Search size={18} />
              Request Inspection
            </Link>
          </div>

          <div className={styles.trustList}>
            <span>
              <CheckCircle2 size={18} />
              Verified property details
            </span>
            <span>
              <CheckCircle2 size={18} />
              Direct agent support
            </span>
            <span>
              <CheckCircle2 size={18} />
              Clear inspection flow
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}