export type EnquiryType =
  | 'General Enquiry'
  | 'Property Enquiry'
  | 'Hostel Enquiry'
  | 'Short-Let Enquiry'
  | 'Inspection Request';

export type EnquiryContext = {
  propertyId?: string;
  propertyName?: string;
  unitName?: string;
  location?: string;
};

export type WhatsAppEnquiry = EnquiryContext & {
  enquiryType: EnquiryType;
  fullName?: string;
  phone?: string;
  message?: string;
};

const fallbackContact = {
  email:
    'bolsimfarmss@gmail.com',

  phone:
    '08033373639',

  whatsapp:
    '447983788435',
};

export const publicContact = Object.freeze({
  email:
    (
      process.env
        .NEXT_PUBLIC_CONTACT_EMAIL ||
      fallbackContact.email
    ).trim(),

  phone:
    (
      process.env
        .NEXT_PUBLIC_CONTACT_PHONE ||
      fallbackContact.phone
    ).trim(),

  whatsapp:
    (
      process.env
        .NEXT_PUBLIC_WHATSAPP_NUMBER ||
      fallbackContact.whatsapp
    )
      .replace(
        /\D/g,
        ''
      )
      .trim(),
});

export function inferEnquiryType(
  service?: string,
  requestedType?: string
): EnquiryType {
  const type =
    (
      requestedType ||
      ''
    )
      .trim()
      .toLowerCase();

  if (
    type ===
      'inspection' ||
    type ===
      'inspection-request'
  ) {
    return 'Inspection Request';
  }

  const normalizedService =
    (
      service ||
      ''
    )
      .trim()
      .toLowerCase();

  if (
    normalizedService ===
    'shortlet'
  ) {
    return 'Short-Let Enquiry';
  }

  if (
    normalizedService ===
    'hostel'
  ) {
    return 'Hostel Enquiry';
  }

  if (
    normalizedService ===
    'property'
  ) {
    return 'Property Enquiry';
  }

  return 'General Enquiry';
}

export function buildWhatsAppHref(
  enquiry:
    WhatsAppEnquiry
) {
  const lines: string[] = [
    'Hello Living Spring,',
    '',
    `I would like to make a ${enquiry.enquiryType.toLowerCase()}.`,
  ];

  if (
    enquiry.propertyName
  ) {
    lines.push(
      '',
      `Property: ${enquiry.propertyName}`
    );
  }

  if (
    enquiry.unitName
  ) {
    lines.push(
      `Unit: ${enquiry.unitName}`
    );
  }

  if (
    enquiry.location
  ) {
    lines.push(
      `Location: ${enquiry.location}`
    );
  }

  if (
    enquiry.fullName
  ) {
    lines.push(
      '',
      `Name: ${enquiry.fullName}`
    );
  }

  if (
    enquiry.phone
  ) {
    lines.push(
      `Phone: ${enquiry.phone}`
    );
  }

  if (
    enquiry.message
  ) {
    lines.push(
      '',
      'Message:',
      enquiry.message
    );
  }

  lines.push(
    '',
    'Please let me know the next step. Thank you.'
  );

  return (
    `https://wa.me/${publicContact.whatsapp}` +
    `?text=${encodeURIComponent(
      lines.join(
        '\n'
      )
    )}`
  );
}

export function getPhoneHref() {
  return `tel:${publicContact.phone}`;
}

export function getEmailHref() {
  return `mailto:${publicContact.email}`;
}