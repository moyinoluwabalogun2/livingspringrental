import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Living Springs Real Estate | Premium Properties in Nigeria',
  description: 'Find your dream property with Living Springs. Browse residential, commercial, and land listings for rent, sale, or lease.',
  keywords: 'real estate, properties for sale, rent, lease, Lagos property, Nigeria real estate',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}