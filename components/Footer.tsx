import Image
  from 'next/image';

import Link
  from 'next/link';

import {
  Building2,
  Mail,
  MapPin,
  Phone,
} from 'lucide-react';

import {
  FaWhatsapp,
} from 'react-icons/fa';

import styles
  from './Footer.module.css';

import livingSpringsLogo
  from '../assets/living-springs-logo.png';

import {
  getWhatsAppHref,
  siteConfig,
} from '@/lib/site';

export default function Footer() {
  const whatsappHref =
    getWhatsAppHref(
      'Hello Living Spring, I would like to make an enquiry.'
    );

  return (
    <footer
      className={
        styles.footer
      }
    >
      <div
        className="container"
      >
        <div
          className={
            styles.topRow
          }
        >
          <div
            className={
              styles.brand
            }
          >
            <Image
              src={
                livingSpringsLogo
              }
              alt="Living Spring"
              width={184}
              height={72}
              sizes="184px"
              quality={80}
              className={
                styles.logo
              }
            />

            <p
              className={
                styles.descriptor
              }
            >
              Properties •
              Hostels •
              Short-Lets
            </p>

            <h2
              className={
                styles.brandTitle
              }
            >
              Property opportunities,
              clearly presented.
            </h2>

            <p
              className={
                styles.summary
              }
            >
              Discover property,
              hostel accommodation
              and short-let stays
              across Nigeria with
              direct Living Spring
              support.
            </p>

            {whatsappHref && (
              <a
                href={
                  whatsappHref
                }
                target="_blank"
                rel="noreferrer"
                className={
                  styles.whatsapp
                }
              >
                <FaWhatsapp
                  aria-hidden="true"
                />

                Chat on WhatsApp
              </a>
            )}
          </div>

          <div
            className={
              styles.linksGrid
            }
          >
            <div
              className={
                styles.column
              }
            >
              <h3>
                Explore
              </h3>

              <Link
                href="/properties"
              >
                Properties
              </Link>

              <Link
                href="/hostel"
              >
                Hostels
              </Link>

              <Link
                href="/shortlet"
              >
                Short-Lets
              </Link>

              <Link
                href="/about"
              >
                About Living Spring
              </Link>
            </div>

            <div
              className={
                styles.column
              }
            >
              <h3>
                Property Types
              </h3>

              <Link
                href="/properties?category=Residential"
              >
                Residential
              </Link>

              <Link
                href="/properties?category=Commercial"
              >
                Commercial
              </Link>

              <Link
                href="/properties?category=Land"
              >
                Land
              </Link>

              <Link
                href="/book"
              >
                Short-Let Booking
              </Link>
            </div>

            <div
              className={
                styles.column
              }
            >
              <h3>
                Contact
              </h3>

              <Link
                href="/contact"
              >
                Send an Enquiry
              </Link>

              <span>
                <MapPin
                  size={16}
                  aria-hidden="true"
                />

                {
                  siteConfig.region
                }
              </span>

              {siteConfig
                .contactPhone && (
                <a
                  href={`tel:${siteConfig.contactPhone}`}
                >
                  <Phone
                    size={16}
                    aria-hidden="true"
                  />

                  {
                    siteConfig.contactPhone
                  }
                </a>
              )}

              {siteConfig
                .contactEmail && (
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                >
                  <Mail
                    size={16}
                    aria-hidden="true"
                  />

                  {
                    siteConfig.contactEmail
                  }
                </a>
              )}
            </div>
          </div>
        </div>

        <div
          className={
            styles.bottom
          }
        >
          <p>
            ©{' '}
            {
              new Date()
                .getFullYear()
            }{' '}
            Living Spring.
            All rights reserved.
          </p>

          <p>
            <Building2
              size={14}
              aria-hidden="true"
            />

            Properties &
            Accommodation
            across Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}