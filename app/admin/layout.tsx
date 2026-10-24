import type {
  Metadata,
} from 'next';

import type {
  ReactNode,
} from 'react';

import AdminShell
  from '@/components/admin/AdminShell';

export const metadata:
  Metadata = {
  title: {
    default:
      'Living Spring Admin',

    template:
      '%s | Living Spring Admin',
  },

  robots: {
    index:
      false,

    follow:
      false,

    googleBot: {
      index:
        false,

      follow:
        false,
    },
  },
};

type AdminLayoutProps = {
  children:
    ReactNode;
};

export default function AdminLayout({
  children,
}: AdminLayoutProps) {
  return (
    <AdminShell>
      {children}
    </AdminShell>
  );
}