export type MediaResourceType =
  | 'image'
  | 'video';

export type MediaScope =
  | 'general'
  | 'unit';

export interface MediaAsset {
  assetId: string;
  publicId: string;
  secureUrl: string;

  resourceType:
    MediaResourceType;

  format?: string;

  bytes?: number;

  width?: number;
  height?: number;

  duration?: number;

  originalFilename?: string;

  createdAt?: string;
}

export interface MediaCollection {
  images: MediaAsset[];
  videos: MediaAsset[];
}

export interface MediaLimits {
  images: number;
  videos: number;

  maxImageBytes: number;
  maxVideoBytes: number;

  maxVideoDurationSeconds: number;
}

const MB =
  1024 * 1024;

export const MEDIA_LIMITS = {
  singleListing: {
    images: 20,
    videos: 2,

    maxImageBytes:
      10 * MB,

    maxVideoBytes:
      25 * MB,

    maxVideoDurationSeconds:
      45,
  },

  multiUnitGeneral: {
    images: 10,
    videos: 1,

    maxImageBytes:
      10 * MB,

    maxVideoBytes:
      25 * MB,

    maxVideoDurationSeconds:
      45,
  },

  unit: {
    images: 6,
    videos: 1,

    maxImageBytes:
      10 * MB,

    maxVideoBytes:
      25 * MB,

    maxVideoDurationSeconds:
      45,
  },
} satisfies Record<
  string,
  MediaLimits
>;

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export function createEmptyMediaCollection():
  MediaCollection {
  return {
    images: [],
    videos: [],
  };
}

export function isMediaResourceType(
  value: unknown
): value is MediaResourceType {
  return (
    value === 'image' ||
    value === 'video'
  );
}

export function isMediaScope(
  value: unknown
): value is MediaScope {
  return (
    value === 'general' ||
    value === 'unit'
  );
}

export function getMediaCount(
  collection: MediaCollection,
  resourceType: MediaResourceType
) {
  return resourceType === 'image'
    ? collection.images.length
    : collection.videos.length;
}