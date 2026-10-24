'use client';

import {
  useParams,
} from 'next/navigation';

import PropertyForm
  from '@/components/admin/PropertyForm';

export default function EditPropertyPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const propertyId =
    String(
      params.id ||
        ''
    );

  return (
    <PropertyForm
      propertyId={
        propertyId
      }
    />
  );
}