export const SITE_NAME =
  'Living Spring';

export const SITE_FULL_NAME =
  'Living Spring Properties & Accommodation';

export const SITE_URL =
  (
    process.env
      .NEXT_PUBLIC_SITE_URL ||
    'https://livingspringproperties.netlify.app'
  ).replace(
    /\/+$/,
    ''
  );

export const SITE_DESCRIPTION =
  'Discover properties, land, hostel accommodation and short-let stays across Nigeria with Living Spring.';

export const SITE_EMAIL =
  (
    process.env
      .NEXT_PUBLIC_CONTACT_EMAIL ||
    'bolsimfarmss@gmail.com'
  ).trim();

export const SITE_PHONE =
  (
    process.env
      .NEXT_PUBLIC_CONTACT_PHONE ||
    '08033373639'
  ).trim();

export const SITE_WHATSAPP =
  (
    process.env
      .NEXT_PUBLIC_WHATSAPP_NUMBER ||
    '447983788435'
  )
    .replace(
      /\D/g,
      ''
    );

export const ISARA_ADDRESS =
  'Jewayo Community, Near Focus Hotel, Before Isara Sec. School, Isara Remo, Ogun State, Nigeria';

export function absoluteUrl(
  path = '/'
) {
  if (
    /^https?:\/\//i.test(
      path
    )
  ) {
    return path;
  }

  const normalized =
    path.startsWith('/')
      ? path
      : `/${path}`;

  return `${SITE_URL}${normalized}`;
}

export function cleanSeoText(
  value: string,
  maxLength = 160
) {
  const cleaned =
    value
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  if (
    cleaned.length <=
    maxLength
  ) {
    return cleaned;
  }

  return `${cleaned
    .slice(
      0,
      maxLength - 1
    )
    .trim()}…`;
}