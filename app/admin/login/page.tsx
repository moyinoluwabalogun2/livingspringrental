'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import { auth, signInWithEmailAndPassword } from '@/lib/firebase';
import styles from './page.module.css';

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/admin/dashboard');
    } catch {
      setError('Invalid admin email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link href="/" className={styles.back}>
          <ArrowLeft size={17} />
          Back to website
        </Link>

        <div className={styles.logoWrap}>
          <Image
            src="/images/living-springs-logo.png"
            alt="Living Springs Rentals"
            width={220}
            height={90}
            priority
            unoptimized
            className={styles.logo}
          />
        </div>

        <div className={styles.header}>
          <span>Admin Portal</span>
          <h1>Welcome back.</h1>
          <p>Sign in to manage properties, units, availability and listing details.</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={login} className={styles.form}>
          <label>
            Email Address
            <div className={styles.inputWrap}>
              <Mail size={18} />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                required
              />
            </div>
          </label>

          <label>
            Password
            <div className={styles.inputWrap}>
              <LockKeyhole size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}