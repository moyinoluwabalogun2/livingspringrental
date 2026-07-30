import Link from 'next/link';
import Image from 'next/image';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { FaWhatsapp, FaInstagram, FaFacebookF } from 'react-icons/fa';
import styles from './Footer.module.css';
import livingSpringsLogo from "../assets/living-springs-logo.png";

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.brand}>
            <Image
              src={livingSpringsLogo}
              alt="Living Springs Rentals"
              width={210}
              height={80}
              unoptimized
              priority
              className={styles.logo}
            />

            <p>
              Helping clients find rental homes, apartments and property opportunities with
              clear information and direct support.
            </p>

            <div className={styles.socials}>
              <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
                <FaWhatsapp />
              </a>
              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>
            </div>
          </div>

          <div className={styles.column}>
            <h3>Explore</h3>
            <Link href="/">Home</Link>
            <Link href="/properties">Properties</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>

          <div className={styles.column}>
            <h3>Property Types</h3>
            <Link href="/properties?category=Residential">Residential</Link>
            <Link href="/properties?category=Commercial">Commercial</Link>
            <Link href="/properties?category=Land">Land</Link>
          </div>

          <div className={styles.column}>
            <h3>Contact</h3>
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
              <Phone size={16} /> WhatsApp Agent
            </a>
            <a href="mailto:bolsimfarmss@gmail.com">
              <Mail size={16} /> Email Us
            </a>
            <Link href="/contact">
              <Send size={16} /> Request Inspection
            </Link>
            <span>
              <MapPin size={16} />  Nigeria
            </span>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>© {new Date().getFullYear()} Living Springs Rentals. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}