const rawWhatsappNumber =
  process.env
    .NEXT_PUBLIC_WHATSAPP_NUMBER ||
  '';

const whatsappNumber =
  rawWhatsappNumber.replace(
    /\D/g,
    ''
  );

const contactPhone =
  process.env
    .NEXT_PUBLIC_CONTACT_PHONE ||
  '';

const contactEmail =
  process.env
    .NEXT_PUBLIC_CONTACT_EMAIL ||
  '';

const siteUrl =
  process.env
    .NEXT_PUBLIC_SITE_URL ||
  '';

export const siteConfig = {
  name:
    'Living Spring',

  fullName:
    'Living Spring Properties',

  descriptor:
    'Properties • Hostels • Short-Lets',

  tagline:
    'Find your next property, room or stay.',

  region:
    'Nigeria',

  contactPhone,

  contactEmail,

  whatsappNumber,

  siteUrl,
};

export function getWhatsAppHref(
  message?: string
) {
  if (
    !whatsappNumber
  ) {
    return '';
  }

  if (
    !message
  ) {
    return `https://wa.me/${whatsappNumber}`;
  }

  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}