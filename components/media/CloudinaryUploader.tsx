'use client';

import {
  ChangeEvent,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  CheckCircle2,
  FileVideo2,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud,
} from 'lucide-react';

import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MEDIA_LIMITS,
  MediaAsset,
  MediaCollection,
  MediaResourceType,
  MediaScope,
} from '@/lib/media';

import styles
  from './CloudinaryUploader.module.css';

type ListingType =
  | 'property'
  | 'hostel'
  | 'shortlet';

type UploadOrigin =
  | 'application'
  | 'admin';

interface CloudinaryUploaderProps {
  draftId: string;

  listingType:
    ListingType;

  scope:
    MediaScope;

  unitId?: string;

  multiUnit?: boolean;

  origin?: UploadOrigin;

  value:
    MediaCollection;

  onChange: (
    value: MediaCollection
  ) => void;

  title?: string;

  description?: string;
}

interface SignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;

  returnDeleteToken:
    boolean;

  resourceType:
    MediaResourceType;

  origin:
    UploadOrigin;
}

interface CloudinaryUploadResponse {
  asset_id: string;
  public_id: string;
  secure_url: string;

  resource_type:
    MediaResourceType;

  format?: string;

  bytes?: number;

  width?: number;
  height?: number;

  duration?: number;

  original_filename?:
    string;

  created_at?: string;

  delete_token?: string;

  error?: {
    message?: string;
  };
}

interface UploadProgress {
  resourceType:
    MediaResourceType;

  fileName: string;

  current: number;

  total: number;

  percent: number;
}

const MB =
  1024 * 1024;

function formatBytes(
  value?: number
) {
  if (!value) {
    return '';
  }

  if (value < MB) {
    return `${Math.round(
      value / 1024
    )} KB`;
  }

  return `${(
    value / MB
  ).toFixed(1)} MB`;
}

function optimizedImageUrl(
  url: string
) {
  if (
    !url.includes(
      '/upload/'
    )
  ) {
    return url;
  }

  return url.replace(
    '/upload/',
    '/upload/f_auto,q_auto,w_700,c_limit/'
  );
}

function readVideoDuration(
  file: File
): Promise<number> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const video =
        document.createElement(
          'video'
        );

      const objectUrl =
        URL.createObjectURL(
          file
        );

      video.preload =
        'metadata';

      video.onloadedmetadata =
        () => {
          const duration =
            video.duration;

          URL.revokeObjectURL(
            objectUrl
          );

          if (
            !Number.isFinite(
              duration
            )
          ) {
            reject(
              new Error(
                'Could not read video duration.'
              )
            );

            return;
          }

          resolve(
            duration
          );
        };

      video.onerror =
        () => {
          URL.revokeObjectURL(
            objectUrl
          );

          reject(
            new Error(
              'Could not read this video file.'
            )
          );
        };

      video.src =
        objectUrl;
    }
  );
}

function uploadWithProgress(
  url: string,
  body: FormData,
  onProgress:
    (
      percent: number
    ) => void
): Promise<CloudinaryUploadResponse> {
  return new Promise(
    (
      resolve,
      reject
    ) => {
      const request =
        new XMLHttpRequest();

      request.open(
        'POST',
        url
      );

      request.upload.onprogress =
        (event) => {
          if (
            !event
              .lengthComputable
          ) {
            return;
          }

          const percent =
            Math.round(
              (
                event.loaded /
                event.total
              ) *
                100
            );

          onProgress(
            percent
          );
        };

      request.onerror =
        () => {
          reject(
            new Error(
              'The upload was interrupted. Check your connection and try again.'
            )
          );
        };

      request.onload =
        () => {
          let data:
            CloudinaryUploadResponse;

          try {
            data =
              JSON.parse(
                request
                  .responseText
              ) as CloudinaryUploadResponse;
          } catch {
            reject(
              new Error(
                'Cloudinary returned an invalid response.'
              )
            );

            return;
          }

          if (
            request.status <
              200 ||
            request.status >=
              300
          ) {
            reject(
              new Error(
                data.error
                  ?.message ||
                  'Upload failed.'
              )
            );

            return;
          }

          resolve(data);
        };

      request.send(
        body
      );
    }
  );
}

export default function
CloudinaryUploader({
  draftId,
  listingType,
  scope,
  unitId,
  multiUnit = false,
  origin = 'application',
  value,
  onChange,
  title =
    'Property media',
  description =
    'Upload clear, recent photos and short videos.',
}: CloudinaryUploaderProps) {
  const imageInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const videoInputRef =
    useRef<HTMLInputElement>(
      null
    );

  const deleteTokensRef =
    useRef(
      new Map<
        string,
        string
      >()
    );

  const cloudNameRef =
    useRef<string>('');

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    progress,
    setProgress,
  ] =
    useState<
      UploadProgress | undefined
    >();

  const [
    message,
    setMessage,
  ] =
    useState('');

  const limits =
    useMemo(() => {
      if (
        scope === 'unit'
      ) {
        return MEDIA_LIMITS
          .unit;
      }

      if (
        multiUnit
      ) {
        return MEDIA_LIMITS
          .multiUnitGeneral;
      }

      return MEDIA_LIMITS
        .singleListing;
    }, [
      scope,
      multiUnit,
    ]);

  const requestSignature =
    async (
      resourceType:
        MediaResourceType
    ) => {
      const response =
        await fetch(
          '/api/cloudinary/signature',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                draftId,
                listingType,
                scope,
                unitId,
                resourceType,
                multiUnit,
                origin,
              }),
          }
        );

      const data =
        (await response.json()) as
          SignatureResponse & {
            error?: string;
          };

      if (
        !response.ok
      ) {
        throw new Error(
          data.error ||
            'Could not prepare upload.'
        );
      }

      return data;
    };

  const validateFile =
    async (
      file: File,
      resourceType:
        MediaResourceType
    ) => {
      if (
        resourceType ===
        'image'
      ) {
        if (
          !ACCEPTED_IMAGE_TYPES.includes(
            file.type as
              (typeof ACCEPTED_IMAGE_TYPES)[number]
          )
        ) {
          throw new Error(
            `${file.name}: please upload JPG, PNG, WebP or AVIF images.`
          );
        }

        if (
          file.size >
          limits.maxImageBytes
        ) {
          throw new Error(
            `${file.name}: images must be ${Math.round(
              limits.maxImageBytes /
                MB
            )} MB or smaller.`
          );
        }

        return;
      }

      if (
        !ACCEPTED_VIDEO_TYPES.includes(
          file.type as
            (typeof ACCEPTED_VIDEO_TYPES)[number]
        )
      ) {
        throw new Error(
          `${file.name}: please upload MP4, WebM or MOV videos.`
        );
      }

      if (
        file.size >
        limits.maxVideoBytes
      ) {
        throw new Error(
          `${file.name}: videos must be ${Math.round(
            limits.maxVideoBytes /
              MB
          )} MB or smaller.`
        );
      }

      const duration =
        await readVideoDuration(
          file
        );

      if (
        duration >
        limits
          .maxVideoDurationSeconds
      ) {
        throw new Error(
          `${file.name}: videos must be ${limits.maxVideoDurationSeconds} seconds or shorter.`
        );
      }
    };

  const uploadFiles =
    async (
      files:
        FileList | null,
      resourceType:
        MediaResourceType
    ) => {
      if (
        !files ||
        files.length === 0
      ) {
        return;
      }

      setMessage('');

      const selected =
        Array.from(
          files
        );

      const existingCount =
        resourceType ===
        'image'
          ? value.images.length
          : value.videos.length;

      const maximum =
        resourceType ===
        'image'
          ? limits.images
          : limits.videos;

      const remaining =
        maximum -
        existingCount;

      if (
        remaining <= 0
      ) {
        setMessage(
          `You have reached the ${maximum} ${resourceType} limit for this section.`
        );

        return;
      }

      if (
        selected.length >
        remaining
      ) {
        setMessage(
          `You can add only ${remaining} more ${
            resourceType ===
            'image'
              ? 'photo(s)'
              : 'video(s)'
          } here.`
        );

        return;
      }

      setUploading(
        true
      );

      const uploadedAssets:
        MediaAsset[] = [];

      try {
        for (
          let index = 0;
          index <
          selected.length;
          index += 1
        ) {
          const file =
            selected[index];

          await validateFile(
            file,
            resourceType
          );

          const signature =
            await requestSignature(
              resourceType
            );

          cloudNameRef.current =
            signature.cloudName;

          const formData =
            new FormData();

          formData.append(
            'file',
            file
          );

          formData.append(
            'api_key',
            signature.apiKey
          );

          formData.append(
            'timestamp',
            String(
              signature.timestamp
            )
          );

          formData.append(
            'signature',
            signature.signature
          );

          formData.append(
            'folder',
            signature.folder
          );

          formData.append(
            'return_delete_token',
            'true'
          );

          setProgress({
            resourceType,
            fileName:
              file.name,
            current:
              index + 1,
            total:
              selected.length,
            percent: 0,
          });

          const uploadUrl =
            `https://api.cloudinary.com/v1_1/${signature.cloudName}/${resourceType}/upload`;

          const response =
            await uploadWithProgress(
              uploadUrl,
              formData,
              (
                percent
              ) => {
                setProgress({
                  resourceType,
                  fileName:
                    file.name,
                  current:
                    index +
                    1,
                  total:
                    selected
                      .length,
                  percent,
                });
              }
            );

          const asset:
            MediaAsset = {
              assetId:
                response.asset_id,

              publicId:
                response.public_id,

              secureUrl:
                response.secure_url,

              resourceType:
                response.resource_type,

              format:
                response.format,

              bytes:
                response.bytes,

              width:
                response.width,

              height:
                response.height,

              duration:
                response.duration,

              originalFilename:
                response
                  .original_filename,

              createdAt:
                response.created_at,
            };

          if (
            response.delete_token
          ) {
            deleteTokensRef.current.set(
              asset.assetId,
              response.delete_token
            );
          }

          uploadedAssets.push(
            asset
          );
        }

        if (
          resourceType ===
          'image'
        ) {
          onChange({
            ...value,

            images: [
              ...value.images,
              ...uploadedAssets,
            ],
          });
        } else {
          onChange({
            ...value,

            videos: [
              ...value.videos,
              ...uploadedAssets,
            ],
          });
        }

        setMessage(
          `${uploadedAssets.length} ${
            resourceType ===
            'image'
              ? 'photo'
              : 'video'
          }${
            uploadedAssets.length ===
            1
              ? ''
              : 's'
          } uploaded successfully.`
        );
      } catch (error) {
        setMessage(
          error instanceof
          Error
            ? error.message
            : 'Upload failed. Please try again.'
        );
      } finally {
        setUploading(
          false
        );

        setProgress(
          undefined
        );

        if (
          resourceType ===
            'image' &&
          imageInputRef.current
        ) {
          imageInputRef.current.value =
            '';
        }

        if (
          resourceType ===
            'video' &&
          videoInputRef.current
        ) {
          videoInputRef.current.value =
            '';
        }
      }
    };

  const tryDeleteFreshAsset =
    async (
      asset:
        MediaAsset
    ) => {
      const deleteToken =
        deleteTokensRef.current.get(
          asset.assetId
        );

      const cloudName =
        cloudNameRef.current;

      if (
        !deleteToken ||
        !cloudName
      ) {
        return;
      }

      try {
        await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/delete_by_token`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                token:
                  deleteToken,
              }),
          }
        );
      } catch {
        /*
         * The item is still removed
         * from the current form.
         * Cleanup handles any leftover
         * Cloudinary asset later.
         */
      }

      deleteTokensRef.current.delete(
        asset.assetId
      );
    };

  const removeAsset =
    async (
      asset:
        MediaAsset
    ) => {
      await tryDeleteFreshAsset(
        asset
      );

      if (
        asset.resourceType ===
        'image'
      ) {
        onChange({
          ...value,

          images:
            value.images.filter(
              (
                current
              ) =>
                current.assetId !==
                asset.assetId
            ),
        });

        return;
      }

      onChange({
        ...value,

        videos:
          value.videos.filter(
            (
              current
            ) =>
              current.assetId !==
                asset.assetId
          ),
      });
    };

  const handleImageChange =
    (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {
      void uploadFiles(
        event.target.files,
        'image'
      );
    };

  const handleVideoChange =
    (
      event:
        ChangeEvent<HTMLInputElement>
    ) => {
      void uploadFiles(
        event.target.files,
        'video'
      );
    };

  return (
    <section
      className={
        styles.uploader
      }
    >
      <div
        className={
          styles.heading
        }
      >
        <div>
          <h3>
            {title}
          </h3>

          <p>
            {description}
          </p>
        </div>

        <div
          className={
            styles.counts
          }
        >
          <span>
            {
              value.images
                .length
            }
            /{limits.images}{' '}
            photos
          </span>

          <span>
            {
              value.videos
                .length
            }
            /{limits.videos}{' '}
            videos
          </span>
        </div>
      </div>

      <div
        className={
          styles.uploadActions
        }
      >
        <input
          ref={
            imageInputRef
          }
          type="file"
          accept={
            ACCEPTED_IMAGE_TYPES.join(
              ','
            )
          }
          multiple
          hidden
          onChange={
            handleImageChange
          }
        />

        <input
          ref={
            videoInputRef
          }
          type="file"
          accept={
            ACCEPTED_VIDEO_TYPES.join(
              ','
            )
          }
          multiple
          hidden
          onChange={
            handleVideoChange
          }
        />

        <button
          type="button"
          className={
            styles.uploadButton
          }
          disabled={
            uploading ||
            value.images
              .length >=
              limits.images
          }
          onClick={() =>
            imageInputRef.current
              ?.click()
          }
        >
          <ImagePlus
            size={18}
          />

          Upload photos
        </button>

        <button
          type="button"
          className={
            styles.secondaryButton
          }
          disabled={
            uploading ||
            value.videos
              .length >=
              limits.videos
          }
          onClick={() =>
            videoInputRef.current
              ?.click()
          }
        >
          <FileVideo2
            size={18}
          />

          Upload videos
        </button>
      </div>

      <div
        className={
          styles.rules
        }
      >
        <UploadCloud
          size={17}
        />

        <span>
          Photos up to{' '}
          {Math.round(
            limits.maxImageBytes /
              MB
          )}{' '}
          MB each. Videos
          up to{' '}
          {Math.round(
            limits.maxVideoBytes /
              MB
          )}{' '}
          MB and{' '}
          {
            limits
              .maxVideoDurationSeconds
          }{' '}
          seconds each.
        </span>
      </div>

      {progress && (
        <div
          className={
            styles.progressCard
          }
        >
          <div
            className={
              styles.progressTop
            }
          >
            <span>
              <LoaderCircle
                size={16}
                className={
                  styles.spin
                }
              />

              Uploading{' '}
              {
                progress.current
              }
              /
              {
                progress.total
              }
            </span>

            <strong>
              {
                progress.percent
              }
              %
            </strong>
          </div>

          <div
            className={
              styles.progressTrack
            }
          >
            <div
              className={
                styles.progressBar
              }
              style={{
                width:
                  `${progress.percent}%`,
              }}
            />
          </div>

          <small>
            {
              progress.fileName
            }
          </small>
        </div>
      )}

      {message && (
        <div
          className={
            styles.message
          }
          role="status"
        >
          <CheckCircle2
            size={16}
          />

          {message}
        </div>
      )}

      {value.images.length >
        0 && (
        <div
          className={
            styles.mediaSection
          }
        >
          <h4>
            Photos
          </h4>

          <div
            className={
              styles.imageGrid
            }
          >
            {value.images.map(
              (
                asset
              ) => (
                <article
                  key={
                    asset.assetId
                  }
                  className={
                    styles.mediaCard
                  }
                >
                  <div
                    className={
                      styles.imagePreview
                    }
                    style={{
                      backgroundImage:
                        `url("${optimizedImageUrl(
                          asset.secureUrl
                        )}")`,
                    }}
                    aria-label={
                      asset.originalFilename ||
                      'Uploaded property photo'
                    }
                    role="img"
                  />

                  <div
                    className={
                      styles.mediaInfo
                    }
                  >
                    <div>
                      <strong>
                        {asset.originalFilename ||
                          'Property photo'}
                      </strong>

                      <span>
                        {formatBytes(
                          asset.bytes
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={
                        styles.deleteButton
                      }
                      disabled={
                        uploading
                      }
                      onClick={() =>
                        void removeAsset(
                          asset
                        )
                      }
                      aria-label="Remove photo"
                    >
                      <Trash2
                        size={
                          16
                        }
                      />
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      )}

      {value.videos.length >
        0 && (
        <div
          className={
            styles.mediaSection
          }
        >
          <h4>
            Videos
          </h4>

          <div
            className={
              styles.videoGrid
            }
          >
            {value.videos.map(
              (
                asset
              ) => (
                <article
                  key={
                    asset.assetId
                  }
                  className={
                    styles.mediaCard
                  }
                >
                  <video
                    className={
                      styles.videoPreview
                    }
                    src={
                      asset.secureUrl
                    }
                    controls
                    preload="metadata"
                  />

                  <div
                    className={
                      styles.mediaInfo
                    }
                  >
                    <div>
                      <strong>
                        {asset.originalFilename ||
                          'Property video'}
                      </strong>

                      <span>
                        {asset.duration
                          ? `${Math.round(
                              asset.duration
                            )} sec`
                          : ''}

                        {asset.duration &&
                        asset.bytes
                          ? ' • '
                          : ''}

                        {formatBytes(
                          asset.bytes
                        )}
                      </span>
                    </div>

                    <button
                      type="button"
                      className={
                        styles.deleteButton
                      }
                      disabled={
                        uploading
                      }
                      onClick={() =>
                        void removeAsset(
                          asset
                        )
                      }
                      aria-label="Remove video"
                    >
                      <Trash2
                        size={
                          16
                        }
                      />
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        </div>
      )}
    </section>
  );
}