'use client';

import {
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  PlayCircle,
} from 'lucide-react';

import {
  useMemo,
  useState,
} from 'react';

import styles
  from './MediaGallery.module.css';

type MediaGalleryProps = {
  title: string;

  media: string[];
};

function getCleanPath(
  url: string
) {
  return url
    .split('?')[0]
    .split('#')[0];
}

function isDirectVideo(
  url: string
) {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(
    getCleanPath(
      url
    )
  );
}

function getYouTubeEmbedUrl(
  url: string
) {
  try {
    const parsedUrl =
      new URL(url);

    if (
      parsedUrl.hostname.includes(
        'youtu.be'
      )
    ) {
      const id =
        parsedUrl.pathname.replace(
          '/',
          ''
        );

      return id
        ? `https://www.youtube.com/embed/${id}`
        : '';
    }

    if (
      parsedUrl.hostname.includes(
        'youtube.com'
      )
    ) {
      if (
        parsedUrl.pathname.startsWith(
          '/embed/'
        )
      ) {
        return url;
      }

      const id =
        parsedUrl.searchParams.get(
          'v'
        );

      return id
        ? `https://www.youtube.com/embed/${id}`
        : '';
    }
  } catch {
    return '';
  }

  return '';
}

function getVimeoEmbedUrl(
  url: string
) {
  try {
    const parsedUrl =
      new URL(url);

    if (
      !parsedUrl.hostname.includes(
        'vimeo.com'
      )
    ) {
      return '';
    }

    const id =
      parsedUrl.pathname
        .split('/')
        .filter(Boolean)
        .pop();

    return id
      ? `https://player.vimeo.com/video/${id}`
      : '';
  } catch {
    return '';
  }
}

function getMediaType(
  url: string
) {
  if (
    getYouTubeEmbedUrl(
      url
    )
  ) {
    return 'youtube';
  }

  if (
    getVimeoEmbedUrl(
      url
    )
  ) {
    return 'vimeo';
  }

  if (
    isDirectVideo(
      url
    )
  ) {
    return 'video';
  }

  return 'image';
}

export default function MediaGallery({
  title,
  media,
}: MediaGalleryProps) {
  const [
    activeIndex,
    setActiveIndex,
  ] =
    useState(0);

  const cleanMedia =
    useMemo(() => {
      return Array.from(
        new Set(
          (
            media || []
          )
            .map(
              (
                item
              ) =>
                item?.trim()
            )
            .filter(
              (
                item
              ):
                item is string =>
                  Boolean(
                    item
                  )
            )
        )
      );
    }, [
      media,
    ]);

  if (
    cleanMedia.length ===
    0
  ) {
    return (
      <div
        className={
          styles.empty
        }
      >
        <ImageIcon
          size={42}
        />

        <h3>
          No property media
          available
        </h3>

        <p>
          Images and videos
          will appear here
          when added.
        </p>
      </div>
    );
  }

  /*
   * Do not reset state in
   * an effect.
   *
   * If the media collection
   * becomes shorter, derive a
   * safe index instead.
   */
  const safeActiveIndex =
    activeIndex <
    cleanMedia.length
      ? activeIndex
      : 0;

  const activeMedia =
    cleanMedia[
      safeActiveIndex
    ];

  const activeType =
    getMediaType(
      activeMedia
    );

  const previous =
    () => {
      setActiveIndex(
        (
          current
        ) => {
          const safeCurrent =
            current <
            cleanMedia.length
              ? current
              : 0;

          return safeCurrent ===
            0
            ? cleanMedia.length -
                1
            : safeCurrent -
                1;
        }
      );
    };

  const next = () => {
    setActiveIndex(
      (
        current
      ) => {
        const safeCurrent =
          current <
          cleanMedia.length
            ? current
            : 0;

        return safeCurrent ===
          cleanMedia.length -
            1
          ? 0
          : safeCurrent +
              1;
      }
    );
  };

  const renderMainMedia =
    () => {
      if (
        activeType ===
        'youtube'
      ) {
        return (
          <iframe
            src={
              getYouTubeEmbedUrl(
                activeMedia
              )
            }
            title={`${title} video tour`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        );
      }

      if (
        activeType ===
        'vimeo'
      ) {
        return (
          <iframe
            src={
              getVimeoEmbedUrl(
                activeMedia
              )
            }
            title={`${title} video tour`}
            loading="lazy"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        );
      }

      if (
        activeType ===
        'video'
      ) {
        return (
          <video
            src={
              activeMedia
            }
            controls
            playsInline
            preload="metadata"
          >
            Your browser does
            not support this
            video.
          </video>
        );
      }

      return (
        // Property URLs are still arbitrary
        // until the media overhaul batch.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={
            activeMedia
          }
          alt={`${title} - media ${
            safeActiveIndex +
            1
          }`}
          decoding="async"
          referrerPolicy="no-referrer"
        />
      );
    };

  return (
    <div
      className={
        styles.gallery
      }
    >
      <div
        className={
          styles.mainMedia
        }
      >
        {renderMainMedia()}

        <div
          className={
            styles.counter
          }
        >
          {safeActiveIndex +
            1}{' '}
          /{' '}
          {
            cleanMedia.length
          }
        </div>

        {cleanMedia.length >
          1 && (
          <>
            <button
              type="button"
              className={`${styles.navigation} ${styles.previous}`}
              onClick={
                previous
              }
              aria-label="Previous image or video"
            >
              <ChevronLeft
                size={24}
              />
            </button>

            <button
              type="button"
              className={`${styles.navigation} ${styles.next}`}
              onClick={
                next
              }
              aria-label="Next image or video"
            >
              <ChevronRight
                size={24}
              />
            </button>
          </>
        )}
      </div>

      {cleanMedia.length >
        1 && (
        <div
          className={
            styles.thumbnailGrid
          }
        >
          {cleanMedia.map(
            (
              item,
              index
            ) => {
              const type =
                getMediaType(
                  item
                );

              const isActive =
                index ===
                safeActiveIndex;

              return (
                <button
                  type="button"
                  key={`${item}-${index}`}
                  className={`${styles.thumbnail} ${
                    isActive
                      ? styles.activeThumbnail
                      : ''
                  }`}
                  onClick={() =>
                    setActiveIndex(
                      index
                    )
                  }
                  aria-label={`Open media ${
                    index +
                    1
                  }`}
                >
                  {type ===
                  'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={
                        item
                      }
                      alt=""
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span
                      className={
                        styles.videoThumbnail
                      }
                    >
                      <PlayCircle
                        size={
                          26
                        }
                      />

                      <small>
                        Video
                      </small>
                    </span>
                  )}

                  <span
                    className={
                      styles.thumbnailNumber
                    }
                  >
                    {index +
                      1}
                  </span>
                </button>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}