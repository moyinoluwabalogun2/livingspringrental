import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Handshake,
  Home,
  KeyRound,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function AboutPage() {
  const values = [
    {
      icon: ShieldCheck,
      title: 'Trust',
      text: 'Clear property information and honest communication throughout the process.',
    },
    {
      icon: KeyRound,
      title: 'Access',
      text: 'Simple inspection requests and direct support for interested clients.',
    },
    {
      icon: Handshake,
      title: 'Professional Support',
      text: 'Helping clients make property decisions with confidence and clarity.',
    },
  ];

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <span className={styles.kicker}>About Living Springs</span>
            <h1>Helping clients find properties with clarity and confidence.</h1>
            <p>
              Living Springs Rentals is built to make property discovery easier, cleaner and more
              trustworthy for clients searching for rental homes, apartments and future investment
              opportunities.
            </p>
          </div>
        </section>

        <section className={styles.storySection}>
          <div className="container">
            <div className={styles.storyGrid}>
              <div className={styles.imageWrap}>
                <img
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85"
                  alt="Modern residential property"
                />
              </div>

              <div className={styles.storyText}>
                <span className={styles.kicker}>Our Purpose</span>
                <h2>A better way to present and manage property listings.</h2>
                <p>
                  Living Springs Rentals helps clients explore property options through organized
                  listings, clear details, property media, location information and direct
                  inspection requests.
                </p>
                <p>
                  The platform is designed to support single homes, buildings with multiple units,
                  residential rentals, and future property opportunities such as sales, commercial
                  spaces and land listings.
                </p>

                <div className={styles.checks}>
                  <p>
                    <CheckCircle2 size={18} />
                    Clear property details and availability
                  </p>
                  <p>
                    <CheckCircle2 size={18} />
                    Support for single and multi-unit properties
                  </p>
                  <p>
                    <CheckCircle2 size={18} />
                    Simple inquiry and inspection request process
                  </p>
                </div>

                <Link href="/properties" className="btn btn-gold">
                  Browse Properties
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.valuesSection}>
          <div className="container">
            <div className={styles.sectionHead}>
              <span>What We Stand For</span>
              <h2>Property service built around trust, access and clarity.</h2>
            </div>

            <div className={styles.valueGrid}>
              {values.map(({ icon: Icon, title, text }) => (
                <article className={styles.valueCard} key={title}>
                  <Icon size={30} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.statsSection}>
          <div className="container">
            <div className={styles.statsGrid}>
              <div>
                <Home size={28} />
                <strong>Residential</strong>
                <span>Homes, apartments and rental units</span>
              </div>

              <div>
                <Building2 size={28} />
                <strong>Multi-Unit Ready</strong>
                <span>Buildings with different unit types</span>
              </div>

              <div>
                <MapPin size={28} />
                <strong>Location Focused</strong>
                <span>Maps and nearby landmarks for confidence</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <span>Ready to move forward?</span>
              <h2>Explore listings or request property information today.</h2>
              <p>
                Browse available properties and contact the agent directly when you find a suitable
                option.
              </p>

              <div className={styles.actions}>
                <Link href="/properties" className="btn btn-gold">
                  View Properties
                  <ArrowRight size={18} />
                </Link>
                <Link href="/contact" className={styles.lightBtn}>
                  Contact Agent
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}