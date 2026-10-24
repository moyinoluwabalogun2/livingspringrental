'use client';

import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import Link
  from 'next/link';

import {
  usePathname,
  useRouter,
} from 'next/navigation';

import {
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';

import {
  Building2,
  CalendarDays,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';

import {
  auth,
} from '@/lib/firebase';

import {
  getAdminProfile,
  type AdminProfile,
} from '@/lib/admin';

import styles
  from './AdminShell.module.css';

type AdminShellProps = {
  children:
    ReactNode;
};

const navigation = [
  {
    href:
      '/admin/dashboard',

    label:
      'Overview',

    icon:
      LayoutDashboard,
  },

  {
    href:
      '/admin/properties',

    label:
      'Properties',

    icon:
      Building2,
  },

  {
    href:
      '/admin/applications',

    label:
      'Applications',

    icon:
      ClipboardList,
  },

  {
    href:
      '/admin/availability',

    label:
      'Availability',

    icon:
      CalendarDays,
  },
];

export default function AdminShell({
  children,
}: AdminShellProps) {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const isLoginPage =
    pathname ===
    '/admin/login';

  const [
    user,
    setUser,
  ] =
    useState<User | null>(
      null
    );

  const [
    admin,
    setAdmin,
  ] =
    useState<AdminProfile | null>(
      null
    );

  const [
    checkingAuth,
    setCheckingAuth,
  ] =
    useState(true);

  const [
    mobileOpen,
    setMobileOpen,
  ] =
    useState(false);

  /*
   * ============================================
   * AUTH + ADMIN ROLE VERIFICATION
   * ============================================
   */

  useEffect(() => {
    if (
      isLoginPage
    ) {
      return;
    }

    let active =
      true;

    const unsubscribe =
      onAuthStateChanged(
        auth,

        async (
          nextUser
        ) => {
          if (!active) {
            return;
          }

          if (!nextUser) {
            setUser(
              null
            );

            setAdmin(
              null
            );

            setCheckingAuth(
              false
            );

            router.replace(
              '/admin/login'
            );

            return;
          }

          try {
            const profile =
              await getAdminProfile(
                nextUser
              );

            if (!active) {
              return;
            }

            if (!profile) {
              await signOut(
                auth
              );

              if (
                active
              ) {
                setUser(
                  null
                );

                setAdmin(
                  null
                );

                setCheckingAuth(
                  false
                );

                router.replace(
                  '/admin/login?reason=unauthorized'
                );
              }

              return;
            }

            setUser(
              nextUser
            );

            setAdmin(
              profile
            );

            setCheckingAuth(
              false
            );
          } catch (error) {
            console.error(
              'Admin verification failed:',
              error
            );

            try {
              await signOut(
                auth
              );
            } catch (
              signOutError
            ) {
              console.error(
                'Failed to sign out unverified account:',
                signOutError
              );
            }

            if (
              active
            ) {
              setUser(
                null
              );

              setAdmin(
                null
              );

              setCheckingAuth(
                false
              );

              router.replace(
                '/admin/login?reason=unauthorized'
              );
            }
          }
        }
      );

    return () => {
      active =
        false;

      unsubscribe();
    };
  }, [
    isLoginPage,
    router,
  ]);

  const logout =
    async () => {
      try {
        await signOut(
          auth
        );

        router.replace(
          '/admin/login'
        );
      } catch (error) {
        console.error(
          'Admin logout failed:',
          error
        );
      }
    };

  if (
    isLoginPage
  ) {
    return (
      <>
        {children}
      </>
    );
  }

  if (
    checkingAuth
  ) {
    return (
      <div
        className={
          styles.authLoading
        }
      >
        <div
          className="loading-spinner"
        />

        <p>
          Verifying Living Spring
          administrator...
        </p>
      </div>
    );
  }

  if (
    !user ||
    !admin
  ) {
    return (
      <div
        className={
          styles.authLoading
        }
      >
        <ShieldCheck
          size={24}
          aria-hidden="true"
        />

        <p>
          Redirecting securely...
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        styles.shell
      }
    >
      {mobileOpen && (
        <button
          type="button"
          className={
            styles.overlay
          }
          onClick={() =>
            setMobileOpen(
              false
            )
          }
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          mobileOpen
            ? styles.sidebarOpen
            : ''
        }`}
      >
        <div
          className={
            styles.sidebarHeader
          }
        >
          <Link
            href="/admin/dashboard"
            className={
              styles.brand
            }
            onClick={() =>
              setMobileOpen(
                false
              )
            }
          >
            <span
              className={
                styles.brandMark
              }
            >
              LS
            </span>

            <span>
              <strong>
                Living Spring
              </strong>

              <small>
                Property Admin
              </small>
            </span>
          </Link>

          <button
            type="button"
            className={
              styles.mobileClose
            }
            onClick={() =>
              setMobileOpen(
                false
              )
            }
            aria-label="Close admin menu"
          >
            <X
              size={20}
              aria-hidden="true"
            />
          </button>
        </div>

        <nav
          className={
            styles.navigation
          }
          aria-label="Admin navigation"
        >
          <span
            className={
              styles.navLabel
            }
          >
            Management
          </span>

          {navigation.map(
            (
              item
            ) => {
              const Icon =
                item.icon;

              const active =
                pathname ===
                  item.href ||
                (
                  item.href !==
                    '/admin/dashboard' &&
                  pathname.startsWith(
                    `${item.href}/`
                  )
                );

              return (
                <Link
                  key={
                    item.href
                  }
                  href={
                    item.href
                  }
                  className={`${styles.navItem} ${
                    active
                      ? styles.navItemActive
                      : ''
                  }`}
                  aria-current={
                    active
                      ? 'page'
                      : undefined
                  }
                  onClick={() =>
                    setMobileOpen(
                      false
                    )
                  }
                >
                  <Icon
                    size={19}
                    strokeWidth={
                      1.9
                    }
                    aria-hidden="true"
                  />

                  <span>
                    {
                      item.label
                    }
                  </span>
                </Link>
              );
            }
          )}

          <span
            className={
              styles.navLabel
            }
          >
            Quick action
          </span>

          <Link
            href="/admin/properties/new"
            className={
              styles.addListing
            }
            onClick={() =>
              setMobileOpen(
                false
              )
            }
          >
            <Plus
              size={18}
              aria-hidden="true"
            />

            Add Listing
          </Link>
        </nav>

        <div
          className={
            styles.sidebarFooter
          }
        >
          <div
            className={
              styles.account
            }
          >
            <span
              className={
                styles.accountAvatar
              }
            >
              {admin.displayName
                .charAt(0)
                .toUpperCase()}
            </span>

            <span
              className={
                styles.accountText
              }
            >
              <strong>
                {
                  admin.displayName
                }
              </strong>

              <small>
                {admin.email}
              </small>

              <small>
                {admin.role ===
                'owner'
                  ? 'Owner'
                  : 'Administrator'}
              </small>
            </span>
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className={
              styles.footerAction
            }
          >
            <ExternalLink
              size={17}
              aria-hidden="true"
            />

            View Website
          </Link>

          <button
            type="button"
            className={
              styles.footerAction
            }
            onClick={() =>
              void logout()
            }
          >
            <LogOut
              size={17}
              aria-hidden="true"
            />

            Sign Out
          </button>
        </div>
      </aside>

      <div
        className={
          styles.workspace
        }
      >
        <header
          className={
            styles.mobileHeader
          }
        >
          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                true
              )
            }
            aria-label="Open admin menu"
          >
            <Menu
              size={21}
              aria-hidden="true"
            />
          </button>

          <Link
            href="/admin/dashboard"
          >
            Living Spring
            <span>
              Admin
            </span>
          </Link>

          <Link
            href="/admin/properties/new"
            aria-label="Add listing"
          >
            <Plus
              size={21}
              aria-hidden="true"
            />
          </Link>
        </header>

        <main
          className={
            styles.content
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
}