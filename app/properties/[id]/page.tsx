'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  PlayCircle,
  Toilet,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db, doc, getDoc } from '@/lib/firebase';
import styles from './page.module.css';

type PropertyUnit = {
  id?: string;
  unitType?: string;
  price?: number | string;
  pricePeriod?: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  status?: string;
};

type Property = {
  id: string;
  title?: string;
  category?: string;
  listingPurpose?: string;
  location?: string;
  address?: string;
  propertyType?: string;
  description?: string;
  media?: string[];
  amenities?: string[];
  units?: PropertyUnit[];
  mapEmbedUrl?: string;
  nearbyLandmarks?: string[];
};

function formatPrice(price?: number | string, period?: string) {
  if (price === undefined || price === null || price === '') return 'Price on request';

  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
    return 'Price on request';
  }

  const amount = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(numericPrice);

  if (!period || period === 'one-time') return amount;
  return `${amount}/${period}`;
}

function isVideo(url?: string) {
  return Boolean(url && /\.(mp4|webm|ogg)$/i.test(url));
}

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();

  const [property, setProperty] = useState<Property | null>(null);
  const [activeMedia, setActiveMedia] = useState('');
  const [selectedUnitIndex, setSelectedUnitIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperty() {
      try {
        if (!params?.id) {
          setLoading(false);
          return;
        }

        const ref = doc(db, 'properties', params.id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = {
            id: snap.id,
            ...(snap.data() as Omit<Property, 'id'>),
          };

          setProperty(data);

          const firstMedia =
            Array.isArray(data.media) && data.media.length > 0
              ? data.media[0]
              : '';

          setActiveMedia(firstMedia);
        }
      } catch (error) {
        console.error('Error loading property:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProperty();
  }, [params?.id]);

  const units = property?.units ?? [];
  const selectedUnit = units[selectedUnitIndex] || units[0];

  const whatsappMessage = useMemo(() => {
    if (!property) return '';

    const text = `Hello, I am interested in ${
      selectedUnit?.unitType || 'this property'
    } at ${property.title || 'your listed property'} in ${
      property.location || 'your listed location'
    }. I would like to request more information or book an inspection.`;

    return encodeURIComponent(text);
  }, [property, selectedUnit]);

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">
          <div className="loading-spinner" />
        </div>
        <Footer />
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <main className={styles.notFound}>
          <h1>Property not found</h1>
          <Link href="/properties" className="btn btn-dark">
            Back to Properties
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.top}>
          <div className="container">
            <Link href="/properties" className={styles.backLink}>
              <ArrowLeft size={17} />
              Back to properties
            </Link>

            <div className={styles.titleGrid}>
              <div>
                <span className={styles.kicker}>
                  {property.category || 'Property'} · {property.listingPurpose || 'Rent'}
                </span>
                <h1>{property.title || 'Property Details'}</h1>
                <p>
                  <MapPin size={17} />
                  {property.location || property.address || 'Location available on request'}
                </p>
              </div>

              <div className={styles.priceBox}>
                <span>Starting from</span>
                <strong>{formatPrice(selectedUnit?.price, selectedUnit?.pricePeriod)}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="container">
          <div className={styles.galleryGrid}>
            <div className={styles.mainMedia}>
              {activeMedia ? (
                isVideo(activeMedia) ? (
                  <video src={activeMedia} controls />
                ) : (
                  <img src={activeMedia} alt={property.title || 'Property media'} />
                )
              ) : (
                <div className={styles.mediaFallback}>
                  <Building2 size={42} />
                  <span>No media available</span>
                </div>
              )}
            </div>

            <div className={styles.thumbnails}>
              {(property.media ?? []).map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => setActiveMedia(item)}
                  className={item === activeMedia ? styles.activeThumb : ''}
                >
                  {isVideo(item) ? (
                    <span className={styles.videoThumb}>
                      <PlayCircle size={24} />
                    </span>
                  ) : (
                    <img src={item} alt="" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.detailsSection}>
          <div className="container">
            <div className={styles.detailsGrid}>
              <div className={styles.left}>
                <div className={styles.panel}>
                  <span className={styles.kicker}>Overview</span>
                  <h2>Property Description</h2>
                  <p className={styles.description}>
                    {property.description || 'Property description will be available soon.'}
                  </p>

                  <div className={styles.metaGrid}>
                    <div>
                      <Building2 size={20} />
                      <span>Type</span>
                      <strong>{property.propertyType || property.category || 'Property'}</strong>
                    </div>

                    <div>
                      <BedDouble size={20} />
                      <span>Bedrooms</span>
                      <strong>{selectedUnit?.bedrooms ?? 0}</strong>
                    </div>

                    <div>
                      <Bath size={20} />
                      <span>Bathrooms</span>
                      <strong>{selectedUnit?.bathrooms ?? 0}</strong>
                    </div>

                    <div>
                      <Toilet size={20} />
                      <span>Toilets</span>
                      <strong>{selectedUnit?.toilets ?? 0}</strong>
                    </div>
                  </div>
                </div>

                {(property.amenities?.length ?? 0) > 0 && (
                  <div className={styles.panel}>
                    <span className={styles.kicker}>Amenities</span>
                    <h2>Property Features</h2>

                    <div className={styles.amenities}>
                      {(property.amenities ?? []).map((item) => (
                        <span key={item}>
                          <CheckCircle2 size={17} />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {units.length > 0 && (
                  <div className={styles.panel}>
                    <span className={styles.kicker}>Units</span>
                    <h2>Available Units</h2>

                    <div className={styles.unitsList}>
                      {units.map((unit, index) => (
                        <button
                          type="button"
                          key={unit.id || index}
                          onClick={() => setSelectedUnitIndex(index)}
                          className={index === selectedUnitIndex ? styles.selectedUnit : ''}
                        >
                          <div>
                            <strong>{unit.unitType || `Unit ${index + 1}`}</strong>
                            <span>{formatPrice(unit.price, unit.pricePeriod)}</span>
                          </div>

                          <small className={unit.status === 'available' ? styles.available : ''}>
                            {unit.status || 'available'}
                          </small>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {property.mapEmbedUrl && (
                  <div className={styles.panel}>
                    <span className={styles.kicker}>Location</span>
                    <h2>Property Location</h2>

                    <div className={styles.mapBox}>
                      <iframe
                        src={property.mapEmbedUrl}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}

                {(property.nearbyLandmarks?.length ?? 0) > 0 && (
                  <div className={styles.panel}>
                    <span className={styles.kicker}>Nearby</span>
                    <h2>Nearby Landmarks</h2>

                    <div className={styles.landmarks}>
                      {(property.nearbyLandmarks ?? []).map((item) => (
                        <span key={item}>
                          <MapPin size={16} />
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <aside className={styles.sidebar}>
                <div className={styles.contactCard}>
                  <span className={styles.kicker}>Contact Agent</span>
                  <h2>Interested in this property?</h2>
                  <p>
                    Send an inquiry or request an inspection. Property and unit details will be
                    included automatically.
                  </p>

                  <div className={styles.selectedBox}>
                    <strong>{selectedUnit?.unitType || property.title || 'Selected property'}</strong>
                    <span>{formatPrice(selectedUnit?.price, selectedUnit?.pricePeriod)}</span>
                  </div>

                  <a
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.whatsappBtn}
                  >
                    <FaWhatsapp />
                    Message on WhatsApp
                  </a>

                  <Link href="/contact" className={styles.emailBtn}>
                    <Mail size={18} />
                    Send Inquiry
                  </Link>

                  <div className={styles.note}>
                    <CalendarDays size={17} />
                    Inspection is subject to confirmation and property availability.
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}