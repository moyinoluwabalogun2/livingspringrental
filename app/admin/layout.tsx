'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building2, LayoutDashboard, LogOut, PlusCircle } from 'lucide-react';
import { auth, onAuthStateChanged } from '@/lib/firebase';
import styles from './layout.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';

  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setChecking(false);

      if (!currentUser && !isLogin) router.replace('/admin/login');
      if (currentUser && isLogin) router.replace('/admin/dashboard');
    });

    return () => unsub();
  }, [isLogin, router]);

  if (isLogin) return <>{children}</>;

  if (checking || !user) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  const links = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/properties', label: 'Properties', icon: Building2 },
    { href: '/admin/properties/new', label: 'Add Property', icon: PlusCircle },
  ];

  const logout = async () => {
    await auth.signOut();
    router.replace('/admin/login');
  };

  return (
    <div className={styles.adminShell}>
      <aside className={styles.sidebar}>
        <Link href="/admin/dashboard" className={styles.brand}>
          <span>LS</span>
          <div>
            <strong>Living Springs</strong>
            <small>Admin Portal</small>
          </div>
        </Link>

        <nav className={styles.nav}>
          {links.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={pathname === href ? styles.active : ''}>
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <button type="button" onClick={logout} className={styles.logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  );
}