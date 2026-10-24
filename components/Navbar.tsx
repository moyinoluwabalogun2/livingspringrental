'use client';

import {
  useEffect,
  useState,
} from 'react';

import Image from 'next/image';
import Link from 'next/link';

import {
  usePathname,
} from 'next/navigation';

import {
  Menu,
  Plus,
  X,
} from 'lucide-react';

import livingSpringsLogo
  from '../assets/living-springs-logo.png';

import styles
  from './Navbar.module.css';

const navigation = [
  {
    href: '/',
    label: 'Home',
  },

  {
    href: '/properties',
    label: 'Properties',
  },

  {
    href: '/hostel',
    label: 'Hostels',
  },

  {
    href: '/shortlet',
    label: 'Short-Lets',
  },

  {
    href: '/about',
    label: 'About',
  },

  {
    href: '/contact',
    label: 'Contact',
  },
];

export default function Navbar() {
  const pathname =
    usePathname();

  const [
    menuOpen,
    setMenuOpen,
  ] =
    useState(false);

  useEffect(() => {
    if (
      menuOpen
    ) {
      document.body
        .classList
        .add(
          'menu-open'
        );
    } else {
      document.body
        .classList
        .remove(
          'menu-open'
        );
    }

    return () => {
      document.body
        .classList
        .remove(
          'menu-open'
        );
    };
  }, [
    menuOpen,
  ]);

  useEffect(() => {
    function handleEscape(
      event:
        KeyboardEvent
    ) {
      if (
        event.key ===
        'Escape'
      ) {
        setMenuOpen(
          false
        );
      }
    }

    window.addEventListener(
      'keydown',
      handleEscape
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleEscape
      );
    };
  }, []);

  function closeMenu() {
    setMenuOpen(
      false
    );
  }

  function isActive(
    href:
      string
  ) {
    if (
      href === '/'
    ) {
      return (
        pathname === '/'
      );
    }

    return pathname.startsWith(
      href
    );
  }

  return (
    <header
      className={
        styles.navbar
      }
    >
      <div
        className={
          styles.inner
        }
      >
        <Link
          href="/"
          className={
            styles.brand
          }
          onClick={
            closeMenu
          }
          aria-label="Living Spring home"
        >
          <Image
            src={
              livingSpringsLogo
            }
            alt="Living Spring"
            width={120}
            height={64}
            sizes="(max-width: 900px) 92px, 120px"
            quality={75}
            priority
            className={
              styles.logo
            }
          />

          <span
            className={
              styles.brandDivider
            }
            aria-hidden="true"
          />

          <span
            className={
              styles.brandText
            }
          >
            <strong>
              Living Spring
            </strong>

            <small>
              Properties & Accommodation
            </small>
          </span>
        </Link>

        <button
          type="button"
          className={
            styles.menuButton
          }
          onClick={() =>
            setMenuOpen(
              (
                current
              ) =>
                !current
            )
          }
          aria-label={
            menuOpen
              ? 'Close navigation menu'
              : 'Open navigation menu'
          }
          aria-expanded={
            menuOpen
          }
          aria-controls="main-navigation"
        >
          {menuOpen ? (
            <X
              size={22}
              aria-hidden="true"
            />
          ) : (
            <Menu
              size={22}
              aria-hidden="true"
            />
          )}
        </button>

        <nav
          id="main-navigation"
          className={`${styles.links} ${
            menuOpen
              ? styles.show
              : ''
          }`}
          aria-label="Main navigation"
        >
          {navigation.map(
            (
              item
            ) => (
              <Link
                key={
                  item.href
                }
                href={
                  item.href
                }
                className={
                  isActive(
                    item.href
                  )
                    ? styles.active
                    : ''
                }
                onClick={
                  closeMenu
                }
              >
                {
                  item.label
                }
              </Link>
            )
          )}

          <Link
            href="/list-with-us"
            className={
              styles.cta
            }
            onClick={
              closeMenu
            }
          >
            <Plus
              size={18}
              aria-hidden="true"
            />

            List With Us
          </Link>
        </nav>
      </div>
    </header>
  );
}