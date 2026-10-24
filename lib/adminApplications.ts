'use client';

import {
  getAuth,
} from 'firebase/auth';

import '@/lib/firebase';

import type {
  ListingApplicationDraft,
} from '@/lib/listingApplication';

export type AdminReviewStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'NEEDS CHANGES'
  | 'REJECTED';

export type AdminPaymentStatus =
  | 'NOT REQUESTED'
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED';

export type AdminApplicationDecision =
  | 'approve'
  | 'needs_changes'
  | 'reject';

export interface AdminApplicationSummary {
  reference:
    string;

  submittedAt:
    string;

  applicantName:
    string;

  phone:
    string;

  whatsapp:
    string;

  email:
    string;

  role:
    string;

  company:
    string;

  listingType:
    string;

  propertyCategory:
    string;

  listingTitle:
    string;

  propertyType:
    string;

  state:
    string;

  city:
    string;

  area:
    string;

  packageName:
    string;

  packageFee:
    number;

  reviewStatus:
    AdminReviewStatus;

  paymentStatus:
    AdminPaymentStatus;

  paymentReference:
    string;

  published:
    string;

  adminNotes:
    string;
}

export interface AdminApplicationDetail
  extends AdminApplicationSummary {
  application:
    ListingApplicationDraft;
}

type ListResponse = {
  ok:
    boolean;

  applications?:
    AdminApplicationSummary[];

  error?:
    string;
};

type DetailResponse = {
  ok:
    boolean;

  application?:
    AdminApplicationDetail;

  error?:
    string;
};

type DecisionResponse = {
  ok:
    boolean;

  application?:
    AdminApplicationSummary;

  error?:
    string;
};


async function getAdminToken() {
  const auth =
    getAuth();

  const user =
    auth.currentUser;

  if (
    !user
  ) {
    throw new Error(
      'ADMIN_LOGIN_REQUIRED'
    );
  }

  return user.getIdToken(
    true
  );
}


async function adminRequest<T>(
  url:
    string,

  options?:
    RequestInit
) {
  const token =
    await getAdminToken();

  const response =
    await fetch(
      url,
      {
        ...options,

        headers: {
          'Content-Type':
            'application/json',

          Authorization:
            `Bearer ${token}`,

          ...options
            ?.headers,
        },

        cache:
          'no-store',
      }
    );

  const data =
    (await response.json()) as
      T & {
        error?: string;
      };

  if (
    response.status ===
      401 ||
    response.status ===
      403
  ) {
    throw new Error(
      'ADMIN_LOGIN_REQUIRED'
    );
  }

  if (
    !response.ok
  ) {
    throw new Error(
      data.error ||
        'Admin request failed.'
    );
  }

  return data;
}


export async function
fetchAdminApplications(
  status =
    'ALL'
) {
  const data =
    await adminRequest<
      ListResponse
    >(
      `/api/admin/listing-applications?status=${encodeURIComponent(
        status
      )}`
    );

  if (
    !data.ok
  ) {
    throw new Error(
      data.error ||
        'Could not load applications.'
    );
  }

  return (
    data.applications ||
    []
  );
}


export async function
fetchAdminApplication(
  reference:
    string
) {
  const data =
    await adminRequest<
      DetailResponse
    >(
      `/api/admin/listing-applications?reference=${encodeURIComponent(
        reference
      )}`
    );

  if (
    !data.ok ||
    !data.application
  ) {
    throw new Error(
      data.error ||
        'Could not load this application.'
    );
  }

  return data.application;
}


export async function
submitAdminDecision(
  reference:
    string,

  decision:
    AdminApplicationDecision,

  notes:
    string
) {
  const data =
    await adminRequest<
      DecisionResponse
    >(
      '/api/admin/listing-applications',
      {
        method:
          'PATCH',

        body:
          JSON.stringify({
            reference,
            decision,
            notes,
          }),
      }
    );

  if (
    !data.ok
  ) {
    throw new Error(
      data.error ||
        'Could not save the decision.'
    );
  }

  return data.application;
}