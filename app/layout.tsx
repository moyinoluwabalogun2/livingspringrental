import type {
  Metadata,
} from 'next';

import {
  Inter,
  Playfair_Display,
} from 'next/font/google';

import './globals.css';

const inter =
  Inter({
    subsets: [
      'latin',
    ],

    variable:
      '--font-sans',

    display:
      'swap',

    preload:
      true,
  });

const playfair =
  Playfair_Display({
    subsets: [
      'latin',
    ],

    variable:
      '--font-display',

    display:
      'swap',

    preload:
      true,
  });

export const metadata:
  Metadata = {
  title: {
    default:
      'Living Spring | Properties, Hostels & Short-Lets',

    template:
      '%s | Living Spring',
  },

  description:
    'Discover properties, land, hostel accommodation and short-let stays across Nigeria with Living Spring.',

  applicationName:
    'Living Spring',

  category:
    'real estate',

  keywords: [
    'property in Nigeria',
    'houses in Nigeria',
    'land in Nigeria',
    'hostels in Nigeria',
    'short lets in Nigeria',
    'Living Spring Properties',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children:
    React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body
        className={
          `${inter.variable} ${playfair.variable}`
        }
      >
        {children}
      </body>
    </html>
  );
}