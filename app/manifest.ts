import type {
  MetadataRoute,
} from 'next';

export default function manifest():
  MetadataRoute.Manifest {
  return {
    name:
      'Living Spring Properties & Accommodation',

    short_name:
      'Living Spring',

    description:
      'Hostel accommodation, short-let stays and properties across Ogun State.',

    start_url:
      '/',

    display:
      'standalone',

    background_color:
      '#f6f4ee',

    theme_color:
      '#07111f',

    icons: [
      {
        src:
          '/icon.png',

        sizes:
          'any',

        type:
          'image/png',
      },
    ],
  };
}