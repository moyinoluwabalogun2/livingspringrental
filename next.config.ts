import type {
  NextConfig,
} from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,

  images: {
    formats: [
      'image/avif',
      'image/webp',
    ],

    minimumCacheTTL:
      60 * 60 * 24 * 7,

    remotePatterns: [
      {
        protocol: 'https',
        hostname:
          'images.unsplash.com',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname:
          'i.imgur.com',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname:
          'res.cloudinary.com',
        pathname: '/**',
      },

      {
        protocol: 'https',
        hostname:
          'firebasestorage.googleapis.com',
        pathname: '/**',
      },
    ],

    qualities: [
      60,
      75,
      80,
      85,
    ],
  },
};

export default nextConfig;