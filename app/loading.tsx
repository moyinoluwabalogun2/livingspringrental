import styles from './system.module.css';

export default function Loading() {
  return (
    <main
      className={styles.page}
      aria-live="polite"
      aria-busy="true"
    >
      <section className={styles.card}>
        <div
          className={styles.spinner}
          aria-hidden="true"
        />

        <span className={styles.eyebrow}>
          Living Spring
        </span>

        <h1>Loading...</h1>

        <p>
          Please wait while we prepare the page.
        </p>
      </section>
    </main>
  );
}