'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

import styles from './system.module.css';

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({
  error,
  reset,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(
      'Living Spring route error:',
      error
    );
  }, [error]);

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.card}>
          <span className={styles.eyebrow}>
            Something went wrong
          </span>

          <h1>
            This page couldn&apos;t load properly.
          </h1>

          <p>
            Please try again. If the problem
            continues, return home and contact
            Living Spring for assistance.
          </p>

          <div className={styles.actions}>
            <button
              type="button"
              className="btn btn-dark"
              onClick={reset}
            >
              Try Again
            </button>

            <Link
              href="/"
              className="btn btn-gold"
            >
              Return Home
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}