import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import styles from './HomeSections.module.css';

export default function ShowcaseSection() {
  return (
    <section className={styles.showcase}>
      <div className="container">
        <div className={styles.showcaseGrid}>
          <div>
            <span className={styles.goldText}>Living Springs Rentals</span>
            <h2>Built for rentals now, ready for sales and land listings later.</h2>
            <p>
              The platform supports individual homes, buildings with multiple units,
              commercial spaces, and land listings — all managed from one dashboard.
            </p>

            <div className={styles.checks}>
              <span><CheckCircle2 size={18} /> Residential rentals</span>
              <span><CheckCircle2 size={18} /> Multiple units per building</span>
              <span><CheckCircle2 size={18} /> Google Maps and media galleries</span>
            </div>

            <Link href="/properties" className="btn btn-gold">
              Explore Listings <ArrowRight size={18} />
            </Link>
          </div>

          <div className={styles.imagePanel}>
            <div className={styles.statCard}>
              <strong>Rent · Sale · Land</strong>
              <small>One flexible real estate system</small>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}