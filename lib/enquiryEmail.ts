'use client';

import emailjs
  from '@emailjs/browser';

import type {
  EnquiryType,
} from '@/lib/enquiry';

export type EnquiryEmailPayload = {
  enquiryType:
    EnquiryType;

  fullName: string;

  email: string;

  phone: string;

  preferredContact:
    string;

  message: string;

  propertyId?: string;

  propertyName?: string;

  unitName?: string;

  location?: string;
};

function getConfig() {
  const serviceId =
    (
      process.env
        .NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
      ''
    ).trim();

  const templateId =
    (
      process.env
        .NEXT_PUBLIC_EMAILJS_ENQUIRY_TEMPLATE_ID ||
      process.env
        .NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
      ''
    ).trim();

  const publicKey =
    (
      process.env
        .NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
      ''
    ).trim();

  return {
    serviceId,
    templateId,
    publicKey,
  };
}

export function enquiryEmailConfigured() {
  const config =
    getConfig();

  return Boolean(
    config.serviceId &&
    config.templateId &&
    config.publicKey
  );
}

function submittedAt() {
  return new Intl.DateTimeFormat(
    'en-GB',
    {
      timeZone:
        'Africa/Lagos',

      dateStyle:
        'medium',

      timeStyle:
        'short',
    }
  ).format(
    new Date()
  );
}

export async function sendEnquiryNotification(
  payload:
    EnquiryEmailPayload
) {
  const config =
    getConfig();

  if (
    !config.serviceId ||
    !config.templateId ||
    !config.publicKey
  ) {
    throw new Error(
      'EmailJS enquiry notification is not configured.'
    );
  }

  const response =
    await emailjs.send(
      config.serviceId,

      config.templateId,

      {
        enquiry_type:
          payload.enquiryType,

        full_name:
          payload.fullName,

        from_name:
          payload.fullName,

        email:
          payload.email,

        reply_to:
          payload.email,

        phone:
          payload.phone,

        preferred_contact:
          payload.preferredContact,

        message:
          payload.message,

        property_id:
          payload.propertyId ||
          '—',

        property_name:
          payload.propertyName ||
          'General enquiry',

        unit_name:
          payload.unitName ||
          '—',

        location:
          payload.location ||
          '—',

        submitted_at:
          submittedAt(),

        source:
          'Living Spring Website',
      },

      {
        publicKey:
          config.publicKey,
      }
    );

  if (
    response.status < 200 ||
    response.status >= 300
  ) {
    throw new Error(
      'Email notification was not accepted.'
    );
  }

  return response;
}