import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Clock3,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  MoonStar,
  School,
  Search,
  ShieldCheck,
  Store,
  Trees,
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeaturedProperties from '@/components/home/FeaturedProperties';

import {
  getWhatsAppHref,
} from '@/lib/site';

import styles from './page.module.css';

const services = [
  {
    id: 'properties',
    eyebrow: 'Properties',
    title:
      'Land, homes and commercial opportunities.',
    text:
      'Browse residential, commercial and land listings for rent, sale or lease with clear pricing and property details.',
    icon: Building2,
    href: '/properties',
    action: 'Browse Properties',
  },

  {
    id: 'hostel',
    eyebrow: 'Hostels',
    title:
      'Find rooms and longer-stay accommodation.',
    text:
      'Explore hostel buildings and available unit types such as single rooms, self-contained units and other accommodation options.',
    icon: School,
    href: '/hostel',
    action: 'Explore Hostels',
  },

  {
    id: 'shortlet',
    eyebrow: 'Short-Lets',
    title:
      'Flexible furnished stays by the night or week.',
    text:
      'Discover short-stay accommodation for business trips, family visits, holidays and temporary stays.',
    icon: MoonStar,
    href: '/shortlet',
    action: 'Explore Short-Lets',
  },
];

const categories = [
  {
    title: 'Residential',
    text:
      'Flats, apartments, self-contained units, duplexes, bungalows and family homes.',
    icon: Home,
    href:
      '/properties?category=Residential',
  },

  {
    title: 'Commercial',
    text:
      'Shops, offices, warehouses and other spaces for business and investment.',
    icon: Store,
    href:
      '/properties?category=Commercial',
  },

  {
    title: 'Land',
    text:
      'Residential, commercial, agricultural and investment land opportunities.',
    icon: Trees,
    href:
      '/properties?category=Land',
  },
];

const reasons = [
  {
    icon: BadgeCheck,
    title:
      'Clear listing details',
    text:
      'See the property type, location, pricing, unit information and relevant features before making contact.',
  },

  {
    icon: KeyRound,
    title:
      'No account required',
    text:
      'Browse freely and move straight to WhatsApp, phone, enquiry or inspection when you find something suitable.',
  },

  {
    icon: ShieldCheck,
    title:
      'Living Spring review',
    text:
      'Listings are managed through Living Spring so the platform can stay organised as more owners and agents come on board.',
  },
];

const advertiserTypes = [
  'Land and buildings',
  'Hostels and available units',
  'Short-let accommodation',
];

export default function HomePage() {
  const enquiryWhatsappHref =
    getWhatsAppHref(
      'Hello Living Spring, I would like to ask about your current property, hostel or short-let listings.'
    );

  const advertiserWhatsappHref =
    getWhatsAppHref(
      'Hello Living Spring, I have a property I would like to advertise with you.'
    );

  return (
    <>
      <Navbar />

      <main
        className={
          styles.page
        }
      >
        {/* =====================================
            HERO
        ====================================== */}

        <section
          className={
            styles.hero
          }
        >
          <div
            className={
              styles.heroImage
            }
            aria-hidden="true"
          >
            <Image
              src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=85"
              alt=""
              fill
              priority
              quality={80}
              sizes="100vw"
            />
          </div>

          <div
            className={
              styles.heroOverlay
            }
            aria-hidden="true"
          />

          <div
            className={
              styles.heroGoldGlow
            }
            aria-hidden="true"
          />

          <div className="container">
            <div
              className={
                styles.heroContent
              }
            >
              <span
                className={
                  styles.heroBadge
                }
              >
                <Building2
                  size={17}
                  aria-hidden="true"
                />

                Living Spring •
                Nigeria
              </span>

              <h1>
                Find the right
                property,

                <span>
                  {' '}
                  room or stay.
                </span>
              </h1>

              <p>
                Browse property,
                hostel accommodation
                and flexible
                short-let stays
                with clear
                information, direct
                enquiries and a
                platform built to
                grow across Nigeria.
              </p>

              <div
                className={
                  styles.heroActions
                }
              >
                <Link
                  href="/properties"
                  className="btn btn-gold"
                >
                  Browse Properties

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </Link>

                <Link
                  href="/hostel"
                  className={
                    styles.heroSecondary
                  }
                >
                  <School
                    size={18}
                    aria-hidden="true"
                  />

                  Find a Hostel
                </Link>
              </div>

              <div
                className={
                  styles.heroTrust
                }
              >
                <span>
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />

                  No account required
                </span>

                <span>
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />

                  Clear listing
                  details
                </span>

                <span>
                  <CheckCircle2
                    size={17}
                    aria-hidden="true"
                  />

                  Direct enquiries
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            PROPERTY SEARCH
        ====================================== */}

        <section
          className={
            styles.searchSection
          }
        >
          <div className="container">
            <div
              className={
                styles.searchCard
              }
            >
              <div
                className={
                  styles.searchTop
                }
              >
                <div>
                  <span>
                    Property Search
                  </span>

                  <h2>
                    Start with what
                    matters.
                  </h2>

                  <p>
                    Search current
                    property listings
                    by location,
                    category, purpose
                    and unit type.
                  </p>
                </div>

                <div
                  className={
                    styles.quickServices
                  }
                >
                  <Link
                    href="/properties"
                  >
                    <Building2
                      size={16}
                      aria-hidden="true"
                    />

                    Properties
                  </Link>

                  <Link
                    href="/hostel"
                  >
                    <School
                      size={16}
                      aria-hidden="true"
                    />

                    Hostels
                  </Link>

                  <Link
                    href="/shortlet"
                  >
                    <MoonStar
                      size={16}
                      aria-hidden="true"
                    />

                    Short-Lets
                  </Link>
                </div>
              </div>

              <form
                action="/properties"
                method="get"
                className={
                  styles.searchGrid
                }
              >
                <label
                  className={
                    styles.locationField
                  }
                >
                  <span>
                    Location
                  </span>

                  <div
                    className={
                      styles.inputShell
                    }
                  >
                    <MapPin
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      type="search"
                      name="keyword"
                      placeholder="State, city, area or estate..."
                      autoComplete="off"
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Category
                  </span>

                  <select
                    name="category"
                    defaultValue="All"
                  >
                    <option value="All">
                      All
                    </option>

                    <option value="Residential">
                      Residential
                    </option>

                    <option value="Commercial">
                      Commercial
                    </option>

                    <option value="Land">
                      Land
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    Purpose
                  </span>

                  <select
                    name="listingPurpose"
                    defaultValue="All"
                  >
                    <option value="All">
                      All
                    </option>

                    <option value="Rent">
                      Rent
                    </option>

                    <option value="Sale">
                      Sale
                    </option>

                    <option value="Lease">
                      Lease
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    Unit Type
                  </span>

                  <select
                    name="unitType"
                    defaultValue="All"
                  >
                    <option value="All">
                      All
                    </option>

                    <option value="Self Contain">
                      Self Contain
                    </option>

                    <option value="Mini Flat">
                      Mini Flat
                    </option>

                    <option value="Room & Parlour">
                      Room & Parlour
                    </option>

                    <option value="2 Bedroom Flat">
                      2 Bedroom
                    </option>

                    <option value="3 Bedroom Flat">
                      3 Bedroom
                    </option>

                    <option value="Shop">
                      Shop
                    </option>

                    <option value="Office Space">
                      Office Space
                    </option>

                    <option value="Land">
                      Land
                    </option>
                  </select>
                </label>

                <button
                  type="submit"
                  className={
                    styles.searchButton
                  }
                >
                  <Search
                    size={18}
                    aria-hidden="true"
                  />

                  Search
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* =====================================
            TWO AUDIENCES
        ====================================== */}

        <section
          className={`${styles.audienceSection} content-auto`}
        >
          <div className="container">
            <div
              className={
                styles.audienceGrid
              }
            >
              <article
                className={
                  styles.audienceCard
                }
              >
                <span
                  className={
                    styles.audienceIcon
                  }
                >
                  <Search
                    size={23}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <span
                    className={
                      styles.audienceEyebrow
                    }
                  >
                    Looking for a
                    place?
                  </span>

                  <h2>
                    Discover what
                    is available.
                  </h2>

                  <p>
                    Explore land,
                    homes, commercial
                    spaces, hostel
                    rooms and
                    short-let stays
                    without creating
                    an account first.
                  </p>
                </div>

                <Link
                  href="/properties"
                  className={
                    styles.audienceLink
                  }
                >
                  Start browsing

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
              </article>

              <article
                className={`${styles.audienceCard} ${styles.audienceCardDark}`}
              >
                <span
                  className={
                    styles.audienceIcon
                  }
                >
                  <Building2
                    size={23}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <span
                    className={
                      styles.audienceEyebrow
                    }
                  >
                    Own or market
                    property?
                  </span>

                  <h2>
                    Advertise with
                    Living Spring.
                  </h2>

                  <p>
                    Property owners
                    and agents can
                    work with Living
                    Spring to present
                    their listings
                    professionally
                    and reach people
                    actively
                    searching.
                  </p>
                </div>

                <Link
                  href="/contact"
                  className={
                    styles.audienceLink
                  }
                >
                  Talk to Living
                  Spring

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                  />
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* =====================================
            SERVICES
        ====================================== */}

        <section
          className={`${styles.servicesSection} content-auto`}
        >
          <div className="container">
            <div
              className={
                styles.sectionHeading
              }
            >
              <span>
                Explore Living Spring
              </span>

              <h2>
                Three clear ways
                to find what you
                need.
              </h2>

              <p>
                Different property
                needs deserve
                different
                experiences.
                Living Spring keeps
                properties, hostel
                accommodation and
                short-let stays
                organised without
                mixing everything
                together.
              </p>
            </div>

            <div
              className={
                styles.serviceGrid
              }
            >
              {services.map(
                (
                  {
                    id,
                    eyebrow,
                    title,
                    text,
                    icon:
                      Icon,
                    href,
                    action,
                  },

                  index
                ) => (
                  <article
                    id={id}
                    key={id}
                    className={
                      styles.serviceCard
                    }
                  >
                    <div
                      className={
                        styles.serviceCardTop
                      }
                    >
                      <span
                        className={
                          styles.serviceIcon
                        }
                      >
                        <Icon
                          size={26}
                          aria-hidden="true"
                        />
                      </span>

                      <span
                        className={
                          styles.serviceNumber
                        }
                      >
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          '0'
                        )}
                      </span>
                    </div>

                    <span
                      className={
                        styles.serviceEyebrow
                      }
                    >
                      {
                        eyebrow
                      }
                    </span>

                    <h3>
                      {title}
                    </h3>

                    <p>
                      {text}
                    </p>

                    <Link
                      href={href}
                      className={
                        styles.cardLink
                      }
                    >
                      {action}

                      <ArrowRight
                        size={17}
                        aria-hidden="true"
                      />
                    </Link>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        {/* CURRENT FIRESTORE LISTINGS */}

        <FeaturedProperties />

        {/* =====================================
            CATEGORIES
        ====================================== */}

        <section
          className={`${styles.categoriesSection} content-auto`}
        >
          <div className="container">
            <div
              className={
                styles.sectionHeading
              }
            >
              <span>
                Property Categories
              </span>

              <h2>
                Browse by the
                opportunity you
                want.
              </h2>

              <p>
                From homes and
                commercial spaces
                to land, the
                property side of
                Living Spring is
                structured to
                support listings
                from different
                locations across
                Nigeria.
              </p>
            </div>

            <div
              className={
                styles.categoryGrid
              }
            >
              {categories.map(
                (
                  {
                    title,
                    text,
                    icon:
                      Icon,
                    href,
                  }
                ) => (
                  <Link
                    href={href}
                    className={
                      styles.categoryCard
                    }
                    key={
                      title
                    }
                  >
                    <span
                      className={
                        styles.categoryIcon
                      }
                    >
                      <Icon
                        size={27}
                        aria-hidden="true"
                      />
                    </span>

                    <h3>
                      {title}
                    </h3>

                    <p>
                      {text}
                    </p>

                    <span
                      className={
                        styles.categoryLink
                      }
                    >
                      Explore

                      <ArrowRight
                        size={16}
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            WHY LIVING SPRING
        ====================================== */}

        <section
          className={`${styles.whySection} content-auto`}
        >
          <div className="container">
            <div
              className={
                styles.sectionHeading
              }
            >
              <span>
                Why Living Spring
              </span>

              <h2>
                A cleaner route
                from search to
                enquiry.
              </h2>

              <p>
                The platform is
                designed to make
                discovery
                straightforward
                for visitors while
                giving property
                owners a
                professional place
                to be seen.
              </p>
            </div>

            <div
              className={
                styles.whyGrid
              }
            >
              {reasons.map(
                (
                  {
                    icon:
                      Icon,
                    title,
                    text,
                  }
                ) => (
                  <article
                    className={
                      styles.whyCard
                    }
                    key={
                      title
                    }
                  >
                    <span
                      className={
                        styles.whyIcon
                      }
                    >
                      <Icon
                        size={24}
                        aria-hidden="true"
                      />
                    </span>

                    <h3>
                      {title}
                    </h3>

                    <p>
                      {text}
                    </p>
                  </article>
                )
              )}
            </div>
          </div>
        </section>

        {/* =====================================
            PROPERTY OWNER / AGENT CTA
        ====================================== */}

        <section
          className={`${styles.ownerSection} content-auto`}
        >
          <div className="container">
            <div
              className={
                styles.ownerPanel
              }
            >
              <div
                className={
                  styles.ownerContent
                }
              >
                <span
                  className={
                    styles.ownerEyebrow
                  }
                >
                  For property
                  owners & agents
                </span>

                <h2>
                  Have something
                  worth listing?
                </h2>

                <p>
                  Living Spring is
                  being built to
                  support property
                  advertising beyond
                  our own inventory.
                  Whether you have
                  land, a building,
                  hostel
                  accommodation or a
                  short-let, we can
                  help present it
                  clearly and
                  professionally.
                </p>

                <div
                  className={
                    styles.ownerTypes
                  }
                >
                  {advertiserTypes.map(
                    (
                      item
                    ) => (
                      <span
                        key={
                          item
                        }
                      >
                        <CheckCircle2
                          size={17}
                          aria-hidden="true"
                        />

                        {item}
                      </span>
                    )
                  )}
                </div>

                <div
                  className={
                    styles.ownerActions
                  }
                >
                  <Link
                    href="/contact"
                    className="btn btn-gold"
                  >
                    Advertise a
                    Property

                    <ArrowRight
                      size={18}
                      aria-hidden="true"
                    />
                  </Link>

                  {advertiserWhatsappHref && (
                    <a
                      href={
                        advertiserWhatsappHref
                      }
                      target="_blank"
                      rel="noreferrer"
                      className={
                        styles.ownerSecondary
                      }
                    >
                      <MessageCircle
                        size={18}
                        aria-hidden="true"
                      />

                      Ask on WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div
                className={
                  styles.ownerVisual
                }
                aria-hidden="true"
              >
                <div
                  className={
                    styles.ownerVisualCard
                  }
                >
                  <span>
                    Living Spring
                  </span>

                  <strong>
                    Professional
                    property
                    presentation
                  </strong>

                  <p>
                    Clear details •
                    direct enquiries •
                    organised listings
                  </p>
                </div>

                <div
                  className={
                    styles.ownerStatCard
                  }
                >
                  <Clock3
                    size={20}
                  />

                  <div>
                    <strong>
                      30-day Standard
                      listing
                    </strong>

                    <span>
                      Standard pricing
                      starts at
                      ₦20,000
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            ABOUT
        ====================================== */}

        <section
          className={`${styles.aboutSection} content-auto`}
        >
          <div className="container">
            <div
              className={
                styles.aboutGrid
              }
            >
              <div
                className={
                  styles.aboutImage
                }
              >
                <Image
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1500&q=82"
                  alt="Modern residential accommodation"
                  fill
                  quality={75}
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className={
                    styles.aboutPhoto
                  }
                />

                <div
                  className={
                    styles.aboutImageOverlay
                  }
                  aria-hidden="true"
                />

                <div
                  className={
                    styles.aboutImageBadge
                  }
                >
                  <Building2
                    size={20}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Living Spring
                    </strong>

                    <span>
                      Properties &
                      Accommodation
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.aboutCopy
                }
              >
                <span>
                  About Living Spring
                </span>

                <h2>
                  Built around
                  property,
                  accommodation and
                  clearer decisions.
                </h2>

                <p>
                  Living Spring
                  brings property
                  opportunities,
                  hostel
                  accommodation and
                  flexible stays
                  into one organised
                  platform. The aim
                  is simple: present
                  useful information
                  well, make
                  communication
                  straightforward
                  and help people
                  move confidently
                  to the next step.
                </p>

                <div
                  className={
                    styles.checkList
                  }
                >
                  <p>
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />

                    Property listings
                    for rent, sale
                    and lease
                  </p>

                  <p>
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />

                    Hostel buildings
                    with unit-level
                    information
                  </p>

                  <p>
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />

                    Short-let stays
                    with
                    accommodation-
                    specific details
                  </p>
                </div>

                <Link
                  href="/about"
                  className="btn btn-dark"
                >
                  About Living Spring

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            FINAL CTA
        ====================================== */}

        <section
          className={`${styles.ctaSection} content-auto`}
        >
          <div className="container">
            <div
              className={
                styles.ctaBox
              }
            >
              <div>
                <span>
                  Need help finding
                  something?
                </span>

                <h2>
                  Tell Living Spring
                  what you are
                  looking for.
                </h2>

                <p>
                  Ask about a
                  current property,
                  hostel room,
                  short-let stay or
                  inspection and
                  move directly to
                  the next step.
                </p>
              </div>

              <div
                className={
                  styles.ctaActions
                }
              >
                <Link
                  href="/contact"
                  className="btn btn-gold"
                >
                  Make an Enquiry

                  <ArrowRight
                    size={18}
                    aria-hidden="true"
                  />
                </Link>

                {enquiryWhatsappHref && (
                  <a
                    href={
                      enquiryWhatsappHref
                    }
                    target="_blank"
                    rel="noreferrer"
                    className={
                      styles.ctaSecondary
                    }
                  >
                    <MessageCircle
                      size={18}
                      aria-hidden="true"
                    />

                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}