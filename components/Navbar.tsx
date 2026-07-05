'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, Home, Info, Mail, Menu, Phone, X } from 'lucide-react';
import { useState } from 'react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/properties', label: 'Properties', icon: Building2 },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <Link href="/" className={styles.logo} onClick={() => setOpen(false)}>
          <Image
            src="/images/living-springs-logo.png"
            alt="Living Springs Rentals"
            width={180}
            height={70}
            priority
            className={styles.logoImage}
          />
        </Link>

        <button
          className={styles.menuButton}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav className={`${styles.links} ${open ? styles.show : ''}`}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={pathname === href ? styles.active : ''}
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}

          <Link href="/contact" className={styles.cta} onClick={() => setOpen(false)}>
            <Phone size={17} />
            Book Inspection
          </Link>
        </nav>
      </div>
    </header>
  );
}