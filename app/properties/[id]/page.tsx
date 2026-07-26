'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Toilet,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';

import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MediaGallery from '@/components/property/MediaGallery';

import styles from './page.module.css';

type Landmark =
  | string
  | {
      name?: string;
      distance?: string;
    };

type PropertyUnit = {
  id?: string;
  unitType?: string;
  price?: number | string;
  pricePeriod?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  toilets?: number | string;
  status?: string;
  description?: string;
  inspectionInfo?: string;
  media?: string[];
  videoUrl?: string;
};

type Property = {
  id: string;
  title?: string;
  category?: string;
  propertyType?: string;
  listingPurpose?: string;
  location?: string;
  address?: string;
  description?: string;
  featured?: boolean;

  media?: string[];
  videoUrl?: string;

  amenities?: string[];
  landmarks?: Landmark[];
  units?: PropertyUnit[];

  /*
   * Current and older possible map field names.
   * The page checks all of them.
   */
  mapEmbedUrl?: string;
  googleMapsEmbedUrl?: string;
  googleMapEmbedUrl?: string;
  googleMapUrl?: string;
  mapUrl?: string;
  mapLink?: string;

  latitude?: number | string;
  longitude?: number | string;
};

function formatPrice(
  price?: number | string,
  pricePeriod?: string
) {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 'Price on request';
  }

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);

  const period = String(pricePeriod || '')
    .trim()
    .toLowerCase();

  if (
    !period ||
    period === 'one-time' ||
    period === 'one time' ||
    period === 'once'
  ) {
    return formattedPrice;
  }

  const periodLabels: Record<string, string> = {
    yearly: 'year',
    annually: 'year',
    annual: 'year',
    monthly: 'month',
    weekly: 'week',
    daily: 'day',
  };

  return `${formattedPrice}/${
    periodLabels[period] || pricePeriod
  }`;
}

function formatStatus(status?: string) {
  const cleanStatus = String(status || 'available')
    .replaceAll('-', ' ')
    .replaceAll('_', ' ')
    .trim();

  return cleanStatus.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}

function getLandmarkText(landmark: Landmark) {
  if (typeof landmark === 'string') {
    return landmark.trim();
  }

  return [landmark.name, landmark.distance]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' — ');
}

function cleanMediaList(
  values: Array<string | undefined>
) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || '').trim())
        .filter(Boolean)
    )
  );
}

/**
 * Accepts either:
 *
 * 1. Full iframe HTML:
 *    <iframe src="https://www.google.com/maps/embed?..."></iframe>
 *
 * 2. Google Maps embed URL:
 *    https://www.google.com/maps/embed?pb=...
 *
 * 3. Google Maps query URL with output=embed.
 */
function extractGoogleMapUrl(value?: string) {
  const input = String(value || '').trim();

  if (!input) {
    return '';
  }

  const iframeSourceMatch = input.match(
    /src\s*=\s*["']([^"']+)["']/i
  );

  const possibleUrl = (
    iframeSourceMatch?.[1] || input
  )
    .replaceAll('&amp;', '&')
    .trim();

  try {
    const parsedUrl = new URL(possibleUrl);

    const hostname = parsedUrl.hostname.toLowerCase();

    const isGoogleMapsHost =
      hostname === 'google.com' ||
      hostname.endsWith('.google.com') ||
      hostname === 'maps.google.com';

    if (!isGoogleMapsHost) {
      return '';
    }

    const isEmbedUrl =
      parsedUrl.pathname.includes('/maps/embed') ||
      parsedUrl.searchParams.get('output') === 'embed';

    if (isEmbedUrl) {
      return parsedUrl.toString();
    }

    /*
     * Accept a Google Maps URL containing a q parameter and
     * convert it into an embeddable query URL.
     */
    const query = parsedUrl.searchParams.get('q');

    if (query) {
      return `https://www.google.com/maps?q=${encodeURIComponent(
        query
      )}&z=17&output=embed`;
    }
  } catch {
    return '';
  }

  return '';
}

function buildPropertyMapUrl(property: Property | null) {
  if (!property) {
    return '';
  }

  /*
   * First choice:
   * Use the exact map iframe or embed URL stored for this property.
   */
  const savedMapValues = [
    property.mapEmbedUrl,
    property.googleMapsEmbedUrl,
    property.googleMapEmbedUrl,
    property.googleMapUrl,
    property.mapUrl,
    property.mapLink,
  ];

  for (const savedValue of savedMapValues) {
    const extractedUrl =
      extractGoogleMapUrl(savedValue);

    if (extractedUrl) {
      return extractedUrl;
    }
  }

  /*
   * Second choice:
   * Use this property's latitude and longitude.
   */
  const latitude = String(
    property.latitude ?? ''
  ).trim();

  const longitude = String(
    property.longitude ?? ''
  ).trim();

  const validLatitude =
    latitude !== '' &&
    Number.isFinite(Number(latitude));

  const validLongitude =
    longitude !== '' &&
    Number.isFinite(Number(longitude));

  if (validLatitude && validLongitude) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      `${latitude},${longitude}`
    )}&z=17&output=embed`;
  }

  /*
   * Last choice:
   * Search Google Maps using this property's address/location.
   *
   * There is no Lagos fallback or headquarters location here.
   */
  const propertyAddress = Array.from(
    new Set(
      [property.address, property.location]
        .map((value) =>
          String(value || '').trim()
        )
        .filter(Boolean)
    )
  ).join(', ');

  if (propertyAddress) {
    return `https://www.google.com/maps?q=${encodeURIComponent(
      propertyAddress
    )}&z=17&output=embed`;
  }

  /*
   * No valid location information:
   * do not display a map.
   */
  return '';
}

export default function PropertyDetailsPage() {
  const params = useParams<{ id: string }>();

  const propertyId = String(params?.id || '').trim();

  const [property, setProperty] =
    useState<Property | null>(null);

  const [selectedUnitIndex, setSelectedUnitIndex] =
    useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [pageUrl, setPageUrl] = useState('');

  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadProperty() {
      if (!propertyId) {
        setError('The property ID is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        const propertyReference = doc(
          db,
          'properties',
          propertyId
        );

        const propertySnapshot = await getDoc(
          propertyReference
        );

        if (!propertySnapshot.exists()) {
          if (active) {
            setProperty(null);
            setError(
              'This property could not be found.'
            );
          }

          return;
        }

        const propertyData =
          propertySnapshot.data() as Omit<
            Property,
            'id'
          >;

        if (active) {
          setProperty({
            ...propertyData,
            id: propertySnapshot.id,
          });

          setSelectedUnitIndex(0);
        }
      } catch (loadError) {
        console.error(
          'Failed to load property:',
          loadError
        );

        if (active) {
          setProperty(null);
          setError(
            'The property could not be loaded. Please try again.'
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProperty();

    return () => {
      active = false;
    };
  }, [propertyId]);

  const units = useMemo(() => {
    return Array.isArray(property?.units)
      ? property.units
      : [];
  }, [property]);

  const selectedUnit =
    units[selectedUnitIndex] || units[0];

  const galleryMedia = useMemo(() => {
    const propertyMedia = Array.isArray(
      property?.media
    )
      ? property.media
      : [];

    const unitMedia = Array.isArray(
      selectedUnit?.media
    )
      ? selectedUnit.media
      : [];

    return cleanMediaList([
      ...propertyMedia,
      property?.videoUrl,
      ...unitMedia,
      selectedUnit?.videoUrl,
    ]);
  }, [property, selectedUnit]);

  const amenities = useMemo(() => {
    if (!Array.isArray(property?.amenities)) {
      return [];
    }

    return property.amenities
      .map((amenity) =>
        String(amenity || '').trim()
      )
      .filter(Boolean);
  }, [property]);

  const landmarks = useMemo(() => {
    if (!Array.isArray(property?.landmarks)) {
      return [];
    }

    return property.landmarks
      .map(getLandmarkText)
      .filter(Boolean);
  }, [property]);

  const mapEmbedUrl = useMemo(() => {
    return buildPropertyMapUrl(property);
  }, [property]);

  if (loading) {
    return (
      <>
        <Navbar />

        <main className={styles.statePage}>
          <div className={styles.loadingCard}>
            <div className={styles.spinner} />

            <h1>Loading property...</h1>

            <p>
              Please wait while we retrieve the
              property information.
            </p>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  if (error || !property) {
    return (
      <>
        <Navbar />

        <main className={styles.statePage}>
          <div className={styles.errorCard}>
            <Building2 size={44} />

            <h1>Property unavailable</h1>

            <p>
              {error ||
                'The requested property could not be found.'}
            </p>

            <Link
              href="/properties"
              className="btn btn-gold"
            >
              <ArrowLeft size={18} />
              Browse Properties
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const selectedPrice = formatPrice(
    selectedUnit?.price,
    selectedUnit?.pricePeriod
  );

  const whatsappNumber = String(
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
      ''
  ).replace(/\D/g, '');

  const contactEmail =
    process.env.NEXT_PUBLIC_CONTACT_EMAIL || '';

  const contactPhone =
    process.env.NEXT_PUBLIC_CONTACT_PHONE || '';

  const propertyName =
    property.title || 'Living Springs Property';

  const unitName =
    selectedUnit?.unitType ||
    property.propertyType ||
    '';

  const whatsappMessage = [
    'Hello Living Springs Rentals,',
    '',
    `I am interested in: ${propertyName}`,
    unitName ? `Unit: ${unitName}` : '',
    `Price: ${selectedPrice}`,
    property.location
      ? `Location: ${property.location}`
      : '',
    '',
    'Please let me know if it is still available and when I can inspect it.',
    pageUrl ? `Property page: ${pageUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`
    : '';

  const contactHref = `/contact?property=${encodeURIComponent(
    propertyName
  )}&unit=${encodeURIComponent(
    unitName
  )}&price=${encodeURIComponent(selectedPrice)}`;

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.propertyHeader}>
          <div className="container">
            <Link
              href="/properties"
              className={styles.backLink}
            >
              <ArrowLeft size={17} />
              Back to Properties
            </Link>

            <div className={styles.headerGrid}>
              <div className={styles.headerContent}>
                <div className={styles.badges}>
                  <span>
                    {property.listingPurpose ||
                      'For Rent'}
                  </span>

                  {property.featured && (
                    <span
                      className={
                        styles.featuredBadge
                      }
                    >
                      Featured
                    </span>
                  )}
                </div>

                <h1>{propertyName}</h1>

                <p className={styles.location}>
                  <MapPin size={18} />

                  {property.address ||
                    property.location ||
                    'Location available on request'}
                </p>
              </div>

              <div className={styles.headerPrice}>
                <span>
                  {selectedUnit
                    ? 'Selected unit price'
                    : 'Property price'}
                </span>

                <strong>{selectedPrice}</strong>

                {unitName && <p>{unitName}</p>}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.gallerySection}>
          <div className="container">
            <MediaGallery
              title={propertyName}
              media={galleryMedia}
            />
          </div>
        </section>

        <section className={styles.detailsSection}>
          <div className="container">
            <div className={styles.detailsGrid}>
              <div className={styles.mainColumn}>
                {units.length > 0 && (
                  <section
                    className={styles.contentCard}
                  >
                    <div
                      className={styles.sectionHeading}
                    >
                      <span>Available Options</span>

                      <h2>
                        Choose a room or unit
                      </h2>

                      <p>
                        Select a unit to view its
                        information, price, pictures
                        and video.
                      </p>
                    </div>

                    <div className={styles.unitsGrid}>
                      {units.map((unit, index) => {
                        const isSelected =
                          selectedUnitIndex === index;

                        const status = String(
                          unit.status || 'available'
                        ).toLowerCase();

                        return (
                          <button
                            type="button"
                            key={
                              unit.id ||
                              `${unit.unitType}-${index}`
                            }
                            className={`${
                              styles.unitCard
                            } ${
                              isSelected
                                ? styles.activeUnit
                                : ''
                            }`}
                            onClick={() =>
                              setSelectedUnitIndex(
                                index
                              )
                            }
                          >
                            <div
                              className={
                                styles.unitCardHeader
                              }
                            >
                              <div>
                                <span>
                                  Unit {index + 1}
                                </span>

                                <h3>
                                  {unit.unitType ||
                                    'Property Unit'}
                                </h3>
                              </div>

                              <span
                                className={`${
                                  styles.unitStatus
                                } ${
                                  status ===
                                  'available'
                                    ? styles.availableStatus
                                    : styles.unavailableStatus
                                }`}
                              >
                                {formatStatus(
                                  unit.status
                                )}
                              </span>
                            </div>

                            <strong
                              className={
                                styles.unitPrice
                              }
                            >
                              {formatPrice(
                                unit.price,
                                unit.pricePeriod
                              )}
                            </strong>

                            <div
                              className={
                                styles.unitMeta
                              }
                            >
                              {unit.bedrooms !==
                                undefined && (
                                <span>
                                  <BedDouble
                                    size={16}
                                  />
                                  {unit.bedrooms} Bed
                                </span>
                              )}

                              {unit.bathrooms !==
                                undefined && (
                                <span>
                                  <Bath size={16} />
                                  {unit.bathrooms}{' '}
                                  Bath
                                </span>
                              )}

                              {unit.toilets !==
                                undefined && (
                                <span>
                                  <Toilet size={16} />
                                  {unit.toilets}{' '}
                                  Toilet
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {selectedUnit?.description && (
                      <div
                        className={
                          styles.unitDescription
                        }
                      >
                        <h3>About this unit</h3>

                        <p>
                          {
                            selectedUnit.description
                          }
                        </p>
                      </div>
                    )}

                    {selectedUnit?.inspectionInfo && (
                      <div
                        className={
                          styles.inspectionNote
                        }
                      >
                        <CheckCircle2 size={20} />

                        <div>
                          <strong>
                            Inspection information
                          </strong>

                          <p>
                            {
                              selectedUnit.inspectionInfo
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                )}

                <section
                  className={styles.contentCard}
                >
                  <div
                    className={styles.sectionHeading}
                  >
                    <span>Property Overview</span>
                    <h2>About this property</h2>
                  </div>

                  <p className={styles.description}>
                    {property.description ||
                      'Contact Living Springs for complete information about this property.'}
                  </p>

                  <div
                    className={styles.propertyFacts}
                  >
                    <div>
                      <Building2 size={21} />

                      <span>Property Type</span>

                      <strong>
                        {property.propertyType ||
                          property.category ||
                          'Property'}
                      </strong>
                    </div>

                    <div>
                      <MapPin size={21} />

                      <span>Location</span>

                      <strong>
                        {property.location ||
                          property.address ||
                          'Contact Agent'}
                      </strong>
                    </div>

                    <div>
                      <Building2 size={21} />

                      <span>Listing</span>

                      <strong>
                        {property.listingPurpose ||
                          'For Rent'}
                      </strong>
                    </div>
                  </div>
                </section>

                {amenities.length > 0 && (
                  <section
                    className={styles.contentCard}
                  >
                    <div
                      className={styles.sectionHeading}
                    >
                      <span>Property Features</span>
                      <h2>Amenities available</h2>
                    </div>

                    <div
                      className={
                        styles.amenitiesGrid
                      }
                    >
                      {amenities.map(
                        (amenity, index) => (
                          <div
                            key={`${amenity}-${index}`}
                            className={
                              styles.amenity
                            }
                          >
                            <CheckCircle2
                              size={18}
                            />
                            <span>{amenity}</span>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {landmarks.length > 0 && (
                  <section
                    className={styles.contentCard}
                  >
                    <div
                      className={styles.sectionHeading}
                    >
                      <span>Nearby Places</span>

                      <h2>
                        Places close to the property
                      </h2>
                    </div>

                    <div
                      className={
                        styles.landmarksList
                      }
                    >
                      {landmarks.map(
                        (landmark, index) => (
                          <div
                            key={`${landmark}-${index}`}
                          >
                            <MapPin size={18} />
                            <span>{landmark}</span>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

                {mapEmbedUrl && (
                  <section
                    className={styles.contentCard}
                  >
                    <div
                      className={styles.sectionHeading}
                    >
                      <span>Property Location</span>

                      <h2>
                        View this property on the map
                      </h2>

                      <p>
                        This map belongs specifically
                        to {propertyName}.
                      </p>
                    </div>

                    <div className={styles.mapFrame}>
                      <iframe
                        key={mapEmbedUrl}
                        src={mapEmbedUrl}
                        title={`${propertyName} location`}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </section>
                )}
              </div>

              <aside className={styles.sidebar}>
                <div
                  className={styles.contactCard}
                >
                  <span
                    className={styles.contactKicker}
                  >
                    Interested in this property?
                  </span>

                  <h2>Book an inspection</h2>

                  <p>
                    Contact Living Springs to confirm
                    availability and arrange a suitable
                    inspection time.
                  </p>

                  <div
                    className={
                      styles.selectedSummary
                    }
                  >
                    <span>Property</span>
                    <strong>{propertyName}</strong>

                    {unitName && (
                      <>
                        <span>Selected Unit</span>
                        <strong>{unitName}</strong>
                      </>
                    )}

                    <span>Price</span>
                    <strong>{selectedPrice}</strong>
                  </div>

                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        styles.whatsappButton
                      }
                    >
                      <FaWhatsapp />
                      Continue on WhatsApp
                    </a>
                  )}

                  <Link
                    href={contactHref}
                    className={styles.emailButton}
                  >
                    <Mail size={18} />
                    Send Email Inquiry
                  </Link>

                  {contactEmail && (
                    <a
                      href={`mailto:${contactEmail}`}
                      className={
                        styles.directContact
                      }
                    >
                      <Mail size={17} />
                      {contactEmail}
                    </a>
                  )}

                  {contactPhone && (
                    <a
                      href={`tel:${contactPhone}`}
                      className={
                        styles.directContact
                      }
                    >
                      <Phone size={17} />
                      {contactPhone}
                    </a>
                  )}

                  <div
                    className={
                      styles.contactNotice
                    }
                  >
                    <CheckCircle2 size={18} />

                    <p>
                      Always confirm the inspection
                      before travelling to the
                      property.
                    </p>
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