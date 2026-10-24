import type {
  Metadata,
} from 'next';

import AvailabilityManager
  from '@/components/admin/AvailabilityManager';

export const metadata:
  Metadata = {
  title:
    'Short-Let Availability | Living Spring Admin',
};

export default function AdminAvailabilityPage() {
  return (
    <AvailabilityManager />
  );
}