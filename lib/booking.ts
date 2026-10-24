export type BookingContext = {
  propertyId?: string;

  unitId?: string;

  propertyName: string;

  unitName?: string;

  locationSlug?: string;

  locationLabel: string;
};

export const bookingConfig = {
  isaraRemoFormUrl:
    (
      process.env
        .NEXT_PUBLIC_ISARA_SHORTLET_BOOKING_FORM_URL ||
      ''
    ).trim(),

  checkInDisplay:
    'From 3:00 PM',

  checkOutDisplay:
    'On or before 12:00 Noon',

  defaultIsaraLocation:
    'Jewayo Community, Isara-Remo, Ogun State',
};

function isGoogleFormUrl(
  value: string
) {
  if (!value) {
    return false;
  }

  try {
    const url =
      new URL(value);

    return (
      url.hostname ===
        'forms.gle' ||
      url.hostname ===
        'docs.google.com'
    );
  } catch {
    return false;
  }
}

function isIsaraRemo(
  context:
    BookingContext
) {
  if (
    context.locationSlug ===
    'isara-remo'
  ) {
    return true;
  }

  const searchable =
    context.locationLabel
      .toLowerCase();

  return (
    searchable.includes(
      'isara'
    ) ||
    searchable.includes(
      'jewayo'
    )
  );
}

/*
 * Current launch rule:
 *
 * Living Spring's Isara-Remo
 * short-let uses the Google
 * booking form.
 *
 * Future short-lets can be
 * connected independently
 * without changing /book.
 */
export function getExternalBookingForm(
  context:
    BookingContext
) {
  if (
    isIsaraRemo(
      context
    ) &&
    isGoogleFormUrl(
      bookingConfig
        .isaraRemoFormUrl
    )
  ) {
    return {
      provider:
        'google' as const,

      url:
        bookingConfig
          .isaraRemoFormUrl,

      label:
        'Living Spring Isara-Remo Booking Form',
    };
  }

  return null;
}

export const bookingRequirements = [
  'Full name',

  'Phone / WhatsApp number',

  'Email address',

  'Check-in and check-out dates',

  'Number of guests',

  'Purpose of stay',

  'Valid government ID',

  'Emergency contact',

  'Guest declaration',
];