import Image
  from 'next/image';

import Link
  from 'next/link';

import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  Globe2,
  Handshake,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  MoonStar,
  School,
  ShieldCheck,
} from 'lucide-react';

import Navbar
  from '@/components/Navbar';

import Footer
  from '@/components/Footer';

import {
  getWhatsAppHref,
} from '@/lib/site';

import styles
  from './page.module.css';

const values = [
  {
    icon:
      ShieldCheck,

    title:
      'Trust & clarity',

    text:
      'Property information should be presented clearly so people can understand what is available before taking the next step.',
  },

  {
    icon:
      KeyRound,

    title:
      'Simple access',

    text:
      'Visitors can browse listings and contact Living Spring directly without creating an unnecessary customer account.',
  },

  {
    icon:
      Handshake,

    title:
      'Professional support',

    text:
      'Living Spring provides a structured route between property discovery, enquiries, inspections and accommodation requests.',
  },
];

const platformAreas = [
  {
    icon:
      Building2,

    title:
      'Properties',

    text:
      'Residential, commercial and land opportunities for rent, sale or lease.',
  },

  {
    icon:
      School,

    title:
      'Hostels',

    text:
      'Hostel buildings with room and unit information presented clearly.',
  },

  {
    icon:
      MoonStar,

    title:
      'Short-Lets',

    text:
      'Flexible furnished accommodation for nightly, weekly and temporary stays.',
  },
];

export default function AboutPage() {
  const whatsappHref =
    getWhatsAppHref(
      'Hello Living Spring, I would like to make a property or accommodation enquiry.'
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
              src="https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1900&q=85"
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

          <div className="container">
            <div
              className={
                styles.heroContent
              }
            >
              <span
                className={
                  styles.eyebrow
                }
              >
                <Building2
                  size={16}
                  aria-hidden="true"
                />

                About Living Spring
              </span>

              <h1>
                Property and
                accommodation,
                presented with
                more clarity.
              </h1>

              <p>
                Living Spring is
                building a
                professional
                platform for people
                looking for
                property, hostel
                accommodation and
                short-let stays
                across Nigeria.
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
                  href="/contact"
                  className={
                    styles.heroSecondary
                  }
                >
                  <MessageCircle
                    size={18}
                    aria-hidden="true"
                  />

                  Contact Living Spring
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            STORY
        ====================================== */}

        <section
          className={
            styles.storySection
          }
        >
          <div className="container">
            <div
              className={
                styles.storyGrid
              }
            >
              <div
                className={
                  styles.imageWrap
                }
              >
                <Image
                  src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1500&q=85"
                  alt="Modern residential property"
                  fill
                  quality={75}
                  sizes="(max-width: 900px) 100vw, 50vw"
                  className={
                    styles.storyImage
                  }
                />

                <div
                  className={
                    styles.imageOverlay
                  }
                  aria-hidden="true"
                />

                <div
                  className={
                    styles.imageBadge
                  }
                >
                  <MapPin
                    size={19}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Built to grow
                      across Nigeria
                    </strong>

                    <span>
                      Location is a
                      listing detail,
                      not a business
                      limitation.
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.storyText
                }
              >
                <span
                  className={
                    styles.kicker
                  }
                >
                  Our Purpose
                </span>

                <h2>
                  One organised
                  platform for
                  different property
                  needs.
                </h2>

                <p>
                  People search for
                  property in very
                  different ways.
                  Some are looking
                  for land or a
                  family home.
                  Others need a
                  hostel room or a
                  furnished place
                  for a few nights.
                </p>

                <p>
                  Living Spring is
                  structured to
                  support those
                  different journeys
                  without forcing
                  everything into one
                  generic property
                  experience.
                </p>

                <div
                  className={
                    styles.checks
                  }
                >
                  <p>
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />

                    Residential,
                    commercial and
                    land listings
                  </p>

                  <p>
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />

                    Hostel buildings
                    with different
                    room and unit
                    types
                  </p>

                  <p>
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />

                    Short-let stays
                    with nightly and
                    weekly pricing
                  </p>

                  <p>
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />

                    Direct enquiries
                    without mandatory
                    customer accounts
                  </p>
                </div>

                <Link
                  href="/properties"
                  className="btn btn-dark"
                >
                  Explore Listings

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
            PLATFORM AREAS
        ====================================== */}

        <section
          className={
            styles.platformSection
          }
        >
          <div className="container">
            <div
              className={
                styles.sectionHead
              }
            >
              <span>
                What Living Spring Covers
              </span>

              <h2>
                More than one kind
                of property journey.
              </h2>

              <p>
                Living Spring keeps
                the main service
                types separate so
                visitors can quickly
                find the experience
                that matches what
                they need.
              </p>
            </div>

            <div
              className={
                styles.platformGrid
              }
            >
              {platformAreas.map(
                ({
                  icon:
                    Icon,
                  title,
                  text,
                }) => (
                  <article
                    key={
                      title
                    }
                    className={
                      styles.platformCard
                    }
                  >
                    <span
                      className={
                        styles.platformIcon
                      }
                    >
                      <Icon
                        size={28}
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
            VALUES
        ====================================== */}

        <section
          className={
            styles.valuesSection
          }
        >
          <div className="container">
            <div
              className={
                styles.sectionHead
              }
            >
              <span>
                What We Stand For
              </span>

              <h2>
                A better property
                experience starts
                with better
                information.
              </h2>

              <p>
                Living Spring is
                designed around
                simple principles
                that can continue to
                work as the platform
                grows.
              </p>
            </div>

            <div
              className={
                styles.valueGrid
              }
            >
              {values.map(
                ({
                  icon:
                    Icon,
                  title,
                  text,
                }) => (
                  <article
                    className={
                      styles.valueCard
                    }
                    key={
                      title
                    }
                  >
                    <span
                      className={
                        styles.valueIcon
                      }
                    >
                      <Icon
                        size={25}
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
            BUSINESS DIRECTION
        ====================================== */}

        <section
          className={
            styles.businessSection
          }
        >
          <div className="container">
            <div
              className={
                styles.businessGrid
              }
            >
              <div>
                <span
                  className={
                    styles.kicker
                  }
                >
                  Built for growth
                </span>

                <h2>
                  Living Spring can
                  serve both property
                  seekers and
                  property owners.
                </h2>

                <p>
                  Living Spring
                  started with
                  directly managed
                  properties, but the
                  platform is being
                  designed to support
                  approved third-party
                  listings as well.
                </p>

                <p>
                  Property owners and
                  agents will be able
                  to submit
                  advertising
                  requests while
                  Living Spring keeps
                  control of review,
                  presentation and
                  publication.
                </p>
              </div>

              <div
                className={
                  styles.businessCards
                }
              >
                <article>
                  <BadgeCheck
                    size={25}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Living Spring
                      Direct
                    </strong>

                    <span>
                      Properties
                      directly managed
                      or represented by
                      Living Spring.
                    </span>
                  </div>
                </article>

                <article>
                  <Handshake
                    size={25}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Partner Listings
                    </strong>

                    <span>
                      Approved
                      properties
                      advertised on
                      behalf of owners
                      and agents.
                    </span>
                  </div>
                </article>

                <article>
                  <Globe2
                    size={25}
                    aria-hidden="true"
                  />

                  <div>
                    <strong>
                      Nationwide
                      structure
                    </strong>

                    <span>
                      Listings can be
                      organised by
                      state, city,
                      area and
                      neighbourhood
                      anywhere in
                      Nigeria.
                    </span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            STATS / POSITIONING
        ====================================== */}

        <section
          className={
            styles.statsSection
          }
        >
          <div className="container">
            <div
              className={
                styles.statsGrid
              }
            >
              <div>
                <Home
                  size={27}
                  aria-hidden="true"
                />

                <strong>
                  Residential
                </strong>

                <span>
                  Homes, flats and
                  accommodation
                  opportunities
                </span>
              </div>

              <div>
                <Building2
                  size={27}
                  aria-hidden="true"
                />

                <strong>
                  Multi-unit ready
                </strong>

                <span>
                  Buildings can
                  contain multiple
                  room and unit types
                </span>
              </div>

              <div>
                <MapPin
                  size={27}
                  aria-hidden="true"
                />

                <strong>
                  Nigeria-wide
                </strong>

                <span>
                  Location structure
                  designed to grow
                  beyond current
                  inventory
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================
            CTA
        ====================================== */}

        <section
          className={
            styles.ctaSection
          }
        >
          <div className="container">
            <div
              className={
                styles.ctaBox
              }
            >
              <span>
                Ready to explore?
              </span>

              <h2>
                Find a property,
                room or stay with
                Living Spring.
              </h2>

              <p>
                Browse current
                listings or speak
                directly with Living
                Spring if you need
                help finding the
                right option.
              </p>

              <div
                className={
                  styles.actions
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

                {whatsappHref ? (
                  <a
                    href={
                      whatsappHref
                    }
                    target="_blank"
                    rel="noreferrer"
                    className={
                      styles.lightBtn
                    }
                  >
                    <MessageCircle
                      size={18}
                      aria-hidden="true"
                    />

                    WhatsApp
                  </a>
                ) : (
                  <Link
                    href="/contact"
                    className={
                      styles.lightBtn
                    }
                  >
                    Contact Us
                  </Link>
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