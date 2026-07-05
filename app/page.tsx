'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Home,
  KeyRound,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Trees,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyCard from '@/components/PropertyCard';
import { collection, db, getDocs } from '@/lib/firebase';
import styles from './page.module.css';

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      try {
        const snap = await getDocs(collection(db, 'properties'));
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sorted = data.sort((a: any, b: any) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });

        setProperties(sorted);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
  }, []);

  const featuredProperties = useMemo(() => {
    const featured = properties.filter((property) => property.featured);
    return (featured.length ? featured : properties).slice(0, 3);
  }, [properties]);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);

    localStorage.setItem(
      'searchFilters',
      JSON.stringify({
        keyword: form.get('keyword')?.toString() || '',
        category: form.get('category')?.toString() || 'All',
        listingPurpose: form.get('listingPurpose')?.toString() || 'All',
        unitType: form.get('unitType')?.toString() || 'All',
      })
    );

    router.push('/properties');
  };

  const categories = [
    {
      title: 'Residential',
      text: 'Apartments, flats, self-contain, duplexes and family homes.',
      icon: Home,
      href: '/properties?category=Residential',
    },
    {
      title: 'Commercial',
      text: 'Shops, offices and business spaces when available.',
      icon: Store,
      href: '/properties?category=Commercial',
    },
    {
      title: 'Land',
      text: 'Residential and investment land opportunities when available.',
      icon: Trees,
      href: '/properties?category=Land',
    },
  ];

  const whyChooseUs = [
    {
      icon: ShieldCheck,
      title: 'Clear Property Details',
      text: 'View property information, location, pricing, media and available units before making contact.',
    },
    {
      icon: KeyRound,
      title: 'Simple Inspection Flow',
      text: 'Request property inspection directly without unnecessary confusion or long back-and-forth.',
    },
    {
      icon: Building2,
      title: 'Managed Listings',
      text: 'Listings are structured properly for buildings, individual homes and multiple rental units.',
    },
  ];

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.heroShade} />

          <div className="container">
            <div className={styles.heroContent}>
              <span className={styles.kicker}>
                <Building2 size={16} />
                Living Spring Properties
              </span>

              <h1>Find Homes, Apartments & Property Opportunities.</h1>

              <p>
                Explore well-managed rental properties, available units and future investment
                opportunities with a clear and simple inspection process.
              </p>

              <div className={styles.heroActions}>
                <Link href="/properties" className="btn btn-gold">
                  Browse Properties
                  <ArrowRight size={18} />
                </Link>

                <Link href="/contact" className={styles.lightButton}>
                  Request Inspection
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.searchSection}>
          <div className="container">
            <form className={styles.searchCard} onSubmit={handleSearch}>
              <div className={styles.searchTitle}>
                <span>Property Search</span>
                <h2>Start your search here</h2>
              </div>

              <div className={styles.searchGrid}>
                <label>
                  Location
                  <input name="keyword" placeholder="Area, city, estate..." />
                </label>

                <label>
                  Category
                  <select name="category">
                    <option>All</option>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Land</option>
                  </select>
                </label>

                <label>
                  Purpose
                  <select name="listingPurpose">
                    <option>All</option>
                    <option>Rent</option>
                    <option>Sale</option>
                    <option>Lease</option>
                  </select>
                </label>

                <label>
                  Unit Type
                  <select name="unitType">
                    <option>All</option>
                    <option>Self Contain</option>
                    <option>Mini Flat</option>
                    <option>Room & Parlour</option>
                    <option>2 Bedroom Flat</option>
                    <option>3 Bedroom Flat</option>
                    <option>Shop</option>
                    <option>Office Space</option>
                    <option>Land</option>
                  </select>
                </label>

                <button type="submit" className="btn btn-dark">
                  <Search size={18} />
                  Search
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <span>Featured Listings</span>
              <h2>Available property listings from Living Springs.</h2>
              <p>
                Browse selected properties currently listed. New listings will appear here once
                they are added.
              </p>
            </div>

            {loading ? (
              <div className={styles.skeletonGrid}>
                <div />
                <div />
                <div />
              </div>
            ) : featuredProperties.length > 0 ? (
              <>
                <div className="grid">
                  {featuredProperties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>

                <div className={styles.centerAction}>
                  <Link href="/properties" className="btn btn-dark">
                    View All Properties
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>Featured properties coming soon</h3>
                <p>
                  New listings are being prepared. Please contact Living Springs Rentals for
                  current property availability.
                </p>
                <Link href="/contact" className="btn btn-gold">
                  Contact Agent
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className={styles.categoriesSection}>
          <div className="container">
            <div className={styles.sectionHead}>
              <span>Property Categories</span>
              <h2>Built for rentals now, ready for more opportunities later.</h2>
              <p>
                Living Springs can showcase residential properties today while supporting
                commercial spaces and land listings as the business grows.
              </p>
            </div>

            <div className={styles.categoryGrid}>
              {categories.map(({ title, text, icon: Icon, href }) => (
                <Link href={href} className={styles.categoryCard} key={title}>
                  <Icon size={30} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span>
                    Explore
                    <ArrowRight size={16} />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.aboutSection}>
          <div className="container">
            <div className={styles.aboutGrid}>
              <div className={styles.aboutImage}>
                <img
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1400&q=85"
                  alt="Modern residential property"
                />
              </div>

              <div className={styles.aboutText}>
                <span>About Living Springs</span>
                <h2>Property support built on clarity and trust.</h2>
                <p>
                  Living Springs Rentals helps clients find suitable homes and property
                  opportunities through clear listings, direct communication and simple inspection
                  requests.
                </p>

                <div className={styles.checkList}>
                  <p>
                    <CheckCircle2 size={18} />
                    Residential rentals and apartments
                  </p>
                  <p>
                    <CheckCircle2 size={18} />
                    Single homes and multi-unit buildings
                  </p>
                  <p>
                    <CheckCircle2 size={18} />
                    Sales, commercial and land listings ready for future expansion
                  </p>
                </div>

                <Link href="/about" className="btn btn-gold">
                  Learn More
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHead}>
              <span>Why Choose Us</span>
              <h2>A smoother way to move from interest to inspection.</h2>
            </div>

            <div className={styles.whyGrid}>
              {whyChooseUs.map(({ icon: Icon, title, text }) => (
                <article className={styles.whyCard} key={title}>
                  <Icon size={30} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBox}>
              <span>Ready to inspect?</span>
              <h2>Find your next property with Living Springs.</h2>
              <p>
                Browse current listings or contact the agent to ask about available rental
                properties.
              </p>

              <div className={styles.heroActions}>
                <Link href="/properties" className="btn btn-gold">
                  Browse Listings
                  <ArrowRight size={18} />
                </Link>

                <Link href="/contact" className={styles.lightButton}>
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