import Link from 'next/link';
import { ArrowRight, Phone } from 'lucide-react';
import styles from './HomeSections.module.css';

export default function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <div className={styles.ctaBox}>
          <span>Ready to inspect?</span>
          <h2>Find a property and contact the agent directly.</h2>
          <p>
            Browse available listings or send a quick message to request property information.
          </p>

          <div className={styles.ctaActions}>
            <Link href="/properties" className="btn btn-gold">
              Browse Properties <ArrowRight size={18} />
            </Link>
            <Link href="/contact" className="btn btn-outline">
              <Phone size={18} /> Contact Agent
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}