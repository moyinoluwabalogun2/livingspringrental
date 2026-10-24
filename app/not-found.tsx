import Link from 'next/link';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import styles from './system.module.css';

export default function NotFound() {
  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.card}>
          <span className={styles.eyebrow}>
            404 • Page not found
          </span>

          <h1>
            We couldn&apos;t find that page.
          </h1>

          <p>
            The page may have moved, the link may
            be outdated, or the address may have
            been typed incorrectly.
          </p>

          <div className={styles.actions}>
            <Link
              href="/"
              className="btn btn-dark"
            >
              Return Home
            </Link>

            <Link
              href="/properties"
              className="btn btn-gold"
            >
              Browse Properties
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}