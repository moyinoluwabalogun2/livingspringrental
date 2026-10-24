'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useParams,
  useRouter,
} from 'next/navigation';

import {
  ArrowLeft,
  Banknote,
  Building2,
  CheckCircle2,
  FileWarning,
  ImageIcon,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
  WalletCards,
  XCircle,
} from 'lucide-react';

import {
  fetchAdminApplication,
  submitAdminDecision,
  type AdminApplicationDecision,
  type AdminApplicationDetail,
} from '@/lib/adminApplications';

import type {
  ApplicationUnitVariant,
} from '@/lib/listingApplication';

import PublishApplicationCard
  from '@/components/admin/PublishApplicationCard';

import styles
  from '../applications.module.css';


function formatMoney(
  value:
    number | undefined
) {
  return new Intl.NumberFormat(
    'en-NG',
    {
      style:
        'currency',

      currency:
        'NGN',

      maximumFractionDigits:
        0,
    }
  ).format(
    Number(
      value
    ) ||
    0
  );
}


function formatPeriod(
  value:
    string | undefined
) {
  if (
    value ===
    'one-time'
  ) {
    return 'one-time';
  }

  return `per ${
    value ||
    'year'
  }`;
}


function statusClass(
  status:
    string
) {
  const value =
    status
      .toUpperCase();

  if (
    value ===
    'APPROVED'
  ) {
    return styles
      .statusApproved;
  }

  if (
    value ===
    'NEEDS CHANGES'
  ) {
    return styles
      .statusChanges;
  }

  if (
    value ===
    'REJECTED'
  ) {
    return styles
      .statusRejected;
  }

  return styles
    .statusPending;
}


export default function
AdminApplicationDetailPage() {
  const params =
    useParams();

  const router =
    useRouter();

  const reference =
    String(
      params.reference ||
      ''
    )
      .trim()
      .toUpperCase();

  const [
    record,
    setRecord,
  ] =
    useState<
      AdminApplicationDetail |
      null
    >(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    notes,
    setNotes,
  ] =
    useState('');

  const [
    decisionMode,
    setDecisionMode,
  ] =
    useState<
      AdminApplicationDecision |
      ''
    >(
      ''
    );


  const load =
    useCallback(
      async () => {
        if (
          !reference
        ) {
          return;
        }

        setLoading(
          true
        );

        setError(
          ''
        );

        try {
          const data =
            await fetchAdminApplication(
              reference
            );

          setRecord(
            data
          );

          setNotes(
            data.adminNotes ||
            ''
          );
        } catch (
          loadError
        ) {
          const message =
            loadError instanceof
            Error
              ? loadError.message
              : 'Could not load application.';

          if (
            message ===
            'ADMIN_LOGIN_REQUIRED'
          ) {
            router.replace(
              '/admin/login'
            );

            return;
          }

          setError(
            message
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        reference,
        router,
      ]
    );


  useEffect(() => {
    const timer =
      window.setTimeout(
        () => {
          void load();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    load,
  ]);


  const application =
    record?.application;


  const location =
    application
      ?.location ?? {
        country:
          'Nigeria',

        state:
          record?.state ||
          '',

        city:
          record?.city ||
          '',

        area:
          record?.area ||
          '',

        address:
          '',

        landmark:
          '',
      };


  const generalImages =
    application
      ?.generalMedia
      ?.images ??
    [];


  const generalVideos =
    application
      ?.generalMedia
      ?.videos ??
    [];


  const legacyPhotoLinks =
    application
      ?.media
      ?.photoLinks
      ?.filter(
        (
          url
        ) =>
          Boolean(
            url?.trim()
          )
      ) ??
    [];


  const legacyVideoUrl =
    application
      ?.media
      ?.videoUrl
      ?.trim() ??
    '';


  const hasGeneralMedia =
    generalImages.length >
      0 ||
    generalVideos.length >
      0 ||
    legacyPhotoLinks.length >
      0 ||
    Boolean(
      legacyVideoUrl
    );


  const units =
    useMemo<
      ApplicationUnitVariant[]
    >(
      () => {
        if (
          !application
        ) {
          return [];
        }

        const source =
          application
            .listingType ===
          'hostel'
            ? application
                .hostelRoomTypes
            : application
                .unitVariants;

        return Array.isArray(
          source
        )
          ? source
          : [];
      },
      [
        application,
      ]
    );


  async function decide(
    decision:
      AdminApplicationDecision
  ) {
    if (
      (
        decision ===
          'needs_changes' ||
        decision ===
          'reject'
      ) &&
      !notes.trim()
    ) {
      setError(
        'Add a note explaining what needs to change or why the application is being rejected.'
      );

      return;
    }

    setSaving(
      true
    );

    setError(
      ''
    );

    try {
      await submitAdminDecision(
        reference,
        decision,
        notes.trim()
      );

      setDecisionMode(
        ''
      );

      await load();
    } catch (
      saveError
    ) {
      const message =
        saveError instanceof
        Error
          ? saveError.message
          : 'Could not save decision.';

      if (
        message ===
        'ADMIN_LOGIN_REQUIRED'
      ) {
        router.replace(
          '/admin/login'
        );

        return;
      }

      setError(
        message
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  if (
    loading
  ) {
    return (
      <div
        className={
          styles.loading
        }
      >
        <div
          className="loading-spinner"
        />

        <p>
          Loading application...
        </p>
      </div>
    );
  }


  if (
    !record ||
    !application
  ) {
    return (
      <div
        className={
          styles.page
        }
      >
        <div
          className={
            styles.error
          }
        >
          <FileWarning
            size={19}
          />

          {error ||
            'Application could not be loaded.'}
        </div>
      </div>
    );
  }


  return (
    <div
      className={
        styles.page
      }
    >
      <div
        className={
          styles.detailTopBar
        }
      >
        <button
          type="button"
          className={
            styles.backButton
          }
          onClick={() =>
            router.push(
              '/admin/applications'
            )
          }
        >
          <ArrowLeft
            size={17}
          />

          Applications
        </button>

        <button
          type="button"
          className={
            styles.refreshButton
          }
          onClick={() =>
            void load()
          }
          disabled={
            loading
          }
        >
          <RefreshCw
            size={16}
          />

          Refresh
        </button>
      </div>


      <header
        className={
          styles.detailHeader
        }
      >
        <div>
          <span
            className={
              styles.reference
            }
          >
            {
              record.reference
            }
          </span>

          <h1>
            {
              record.listingTitle ||
              application.title ||
              'Untitled Listing'
            }
          </h1>

          <p>
            {
              record.propertyType ||
              application.propertyType ||
              'Property'
            }
            {' · '}
            {
              record.listingType ||
              application.listingType ||
              'Listing'
            }
          </p>
        </div>

        <span
          className={`${styles.status} ${statusClass(
            record.reviewStatus
          )}`}
        >
          {
            record.reviewStatus
          }
        </span>
      </header>


      {error && (
        <div
          className={
            styles.error
          }
        >
          <FileWarning
            size={19}
          />

          {error}
        </div>
      )}


      <div
        className={
          styles.detailGrid
        }
      >
        <main
          className={
            styles.detailMain
          }
        >
          <section
            className={
              styles.detailCard
            }
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <Building2
                size={20}
              />

              <div>
                <h2>
                  Listing details
                </h2>

                <p>
                  Information submitted
                  by the owner, agent or
                  representative.
                </p>
              </div>
            </div>

            <dl
              className={
                styles.factGrid
              }
            >
              <div>
                <dt>
                  Listing Type
                </dt>

                <dd>
                  {
                    application
                      .listingType ||
                    '—'
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Property Category
                </dt>

                <dd>
                  {
                    application
                      .propertySubtype ||
                    '—'
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Property Type
                </dt>

                <dd>
                  {
                    application
                      .propertyType ||
                    '—'
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Purpose
                </dt>

                <dd>
                  {
                    application
                      .listingPurpose ||
                    '—'
                  }
                </dd>
              </div>

              {application
                .listingType ===
                'property' &&
                !application
                  .hasMultipleUnits && (
                <div>
                  <dt>
                    Asking Price
                  </dt>

                  <dd>
                    {formatMoney(
                      application
                        .askingPrice
                    )}
                  </dd>
                </div>
              )}

              <div>
                <dt>
                  Multi-unit
                </dt>

                <dd>
                  {application
                    .listingType ===
                    'hostel' ||
                  application
                    .hasMultipleUnits
                    ? 'Yes'
                    : 'No'}
                </dd>
              </div>
            </dl>

            {application
              .description && (
              <div
                className={
                  styles.description
                }
              >
                <h3>
                  Description
                </h3>

                <p>
                  {
                    application
                      .description
                  }
                </p>
              </div>
            )}
          </section>


          <section
            className={
              styles.detailCard
            }
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <MapPin
                size={20}
              />

              <div>
                <h2>
                  Location
                </h2>

                <p>
                  Public and internal
                  property location.
                </p>
              </div>
            </div>

            <dl
              className={
                styles.factGrid
              }
            >
              <div>
                <dt>
                  State / FCT
                </dt>

                <dd>
                  {
                    location.state ||
                    '—'
                  }
                </dd>
              </div>

              <div>
                <dt>
                  City / LGA
                </dt>

                <dd>
                  {
                    location.city ||
                    '—'
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Area
                </dt>

                <dd>
                  {
                    location.area ||
                    '—'
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Landmark
                </dt>

                <dd>
                  {
                    location.landmark ||
                    '—'
                  }
                </dd>
              </div>

              <div
                className={
                  styles.factWide
                }
              >
                <dt>
                  Full Address
                </dt>

                <dd>
                  {
                    location.address ||
                    '—'
                  }
                </dd>
              </div>
            </dl>
          </section>


          {units.length >
            0 && (
            <section
              className={
                styles.detailCard
              }
            >
              <div
                className={
                  styles.sectionHeading
                }
              >
                <Banknote
                  size={20}
                />

                <div>
                  <h2>
                    Unit variants &
                    pricing
                  </h2>

                  <p>
                    Separately priced
                    accommodation or
                    units.
                  </p>
                </div>
              </div>

              <div
                className={
                  styles.unitsReview
                }
              >
                {units.map(
                  (
                    unit,
                    index
                  ) => {
                    const unitImages =
                      unit.media
                        ?.images ??
                      [];

                    const unitVideos =
                      unit.media
                        ?.videos ??
                      [];

                    const unitFeatures =
                      Array.isArray(
                        unit.features
                      )
                        ? unit.features
                        : [];

                    const hasUnitMedia =
                      unitImages.length >
                        0 ||
                      unitVideos.length >
                        0;

                    return (
                      <article
                        key={
                          unit.id ||
                          `${index}-${unit.name || 'unit'}`
                        }
                        className={
                          styles
                            .reviewUnit
                        }
                      >
                        <div
                          className={
                            styles
                              .reviewUnitHead
                          }
                        >
                          <div>
                            <h3>
                              {
                                unit.name ||
                                `Unit ${index + 1}`
                              }
                            </h3>

                            <span>
                              Quantity:{' '}
                              {
                                unit.quantity ??
                                1
                              }
                              {' · '}
                              Available:{' '}
                              {
                                unit
                                  .availableQuantity ??
                                unit.quantity ??
                                1
                              }
                            </span>
                          </div>

                          <strong>
                            {application
                              .listingType ===
                            'shortlet'
                              ? `${formatMoney(
                                  unit
                                    .nightlyPrice
                                )} / night`
                              : `${formatMoney(
                                  unit.price
                                )} ${formatPeriod(
                                  unit
                                    .pricePeriod
                                )}`}
                          </strong>
                        </div>

                        <div
                          className={
                            styles
                              .miniFacts
                          }
                        >
                          <span>
                            {
                              unit.bedrooms ??
                              0
                            }{' '}
                            bed
                          </span>

                          <span>
                            {
                              unit.bathrooms ??
                              0
                            }{' '}
                            bath
                          </span>

                          <span>
                            {
                              unit.toilets ??
                              0
                            }{' '}
                            toilet
                          </span>

                          {unit.furnished && (
                            <span>
                              Furnished
                            </span>
                          )}
                        </div>

                        {unit
                          .description && (
                          <p>
                            {
                              unit
                                .description
                            }
                          </p>
                        )}

                        {unitFeatures
                          .length >
                          0 && (
                          <div
                            className={
                              styles
                                .featurePills
                            }
                          >
                            {unitFeatures.map(
                              (
                                feature,
                                featureIndex
                              ) => (
                                <span
                                  key={
                                    `${feature}-${featureIndex}`
                                  }
                                >
                                  {
                                    feature
                                  }
                                </span>
                              )
                            )}
                          </div>
                        )}

                        {hasUnitMedia && (
                          <div
                            className={
                              styles
                                .unitMediaReview
                            }
                          >
                            {unitImages.map(
                              (
                                asset,
                                assetIndex
                              ) => (
                                <a
                                  key={
                                    asset
                                      .assetId ||
                                    `${asset.secureUrl}-${assetIndex}`
                                  }
                                  href={
                                    asset
                                      .secureUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  className={
                                    styles
                                      .mediaThumb
                                  }
                                  style={{
                                    backgroundImage:
                                      `url("${asset.secureUrl}")`,
                                  }}
                                  aria-label={`Open ${unit.name || 'unit'} photo ${assetIndex + 1}`}
                                />
                              )
                            )}

                            {unitVideos.map(
                              (
                                asset,
                                assetIndex
                              ) => (
                                <video
                                  key={
                                    asset
                                      .assetId ||
                                    `${asset.secureUrl}-${assetIndex}`
                                  }
                                  src={
                                    asset
                                      .secureUrl
                                  }
                                  controls
                                  preload="metadata"
                                  className={
                                    styles
                                      .videoThumb
                                  }
                                />
                              )
                            )}
                          </div>
                        )}
                      </article>
                    );
                  }
                )}
              </div>
            </section>
          )}


          <section
            className={
              styles.detailCard
            }
          >
            <div
              className={
                styles.sectionHeading
              }
            >
              <ImageIcon
                size={20}
              />

              <div>
                <h2>
                  General media
                </h2>

                <p>
                  Building, exterior,
                  compound and general
                  listing media.
                </p>
              </div>
            </div>

            {!hasGeneralMedia ? (
              <p
                className={
                  styles.muted
                }
              >
                No media was included
                with this application.
              </p>
            ) : (
              <>
                <div
                  className={
                    styles.mediaReview
                  }
                >
                  {generalImages.map(
                    (
                      asset,
                      index
                    ) => (
                      <a
                        key={
                          asset.assetId ||
                          `${asset.secureUrl}-${index}`
                        }
                        href={
                          asset.secureUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={
                          styles.mediaItem
                        }
                        style={{
                          backgroundImage:
                            `url("${asset.secureUrl}")`,
                        }}
                        aria-label={`Open uploaded photo ${index + 1}`}
                      />
                    )
                  )}

                  {generalVideos.map(
                    (
                      asset,
                      index
                    ) => (
                      <video
                        key={
                          asset.assetId ||
                          `${asset.secureUrl}-${index}`
                        }
                        src={
                          asset.secureUrl
                        }
                        controls
                        preload="metadata"
                        className={
                          styles
                            .videoItem
                        }
                      />
                    )
                  )}

                  {legacyPhotoLinks.map(
                    (
                      url,
                      index
                    ) => (
                      <a
                        key={
                          `legacy-photo-${index}-${url}`
                        }
                        href={
                          url
                        }
                        target="_blank"
                        rel="noreferrer"
                        className={
                          styles.mediaItem
                        }
                        style={{
                          backgroundImage:
                            `url("${url}")`,
                        }}
                        aria-label={`Open legacy property photo ${index + 1}`}
                      />
                    )
                  )}
                </div>

                {legacyVideoUrl && (
                  <div
                    style={{
                      marginTop:
                        '14px',
                    }}
                  >
                    <a
                      href={
                        legacyVideoUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display:
                          'inline-flex',

                        alignItems:
                          'center',

                        gap:
                          '8px',

                        padding:
                          '10px 14px',

                        border:
                          '1px solid #ddd6c9',

                        borderRadius:
                          '10px',

                        color:
                          '#173247',

                        fontWeight:
                          700,

                        textDecoration:
                          'none',

                        fontSize:
                          '0.82rem',
                      }}
                    >
                      Open submitted video
                    </a>
                  </div>
                )}
              </>
            )}
          </section>
        </main>


        <aside
          className={
            styles.detailAside
          }
        >
          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideTitle
              }
            >
              <UserRound
                size={19}
              />

              <h2>
                Applicant
              </h2>
            </div>

            <strong
              className={
                styles.applicantName
              }
            >
              {
                record
                  .applicantName ||
                application
                  .applicant
                  ?.name ||
                'Applicant'
              }
            </strong>

            <span>
              {
                record.role ||
                application
                  .applicant
                  ?.role ||
                '—'
              }
            </span>

            {(record.company ||
              application
                .applicant
                ?.company) && (
              <span>
                {
                  record.company ||
                  application
                    .applicant
                    ?.company
                }
              </span>
            )}

            {(record.email ||
              application
                .applicant
                ?.email) && (
              <a
                href={`mailto:${
                  record.email ||
                  application
                    .applicant
                    ?.email
                }`}
              >
                <Mail
                  size={16}
                />

                {record.email ||
                  application
                    .applicant
                    ?.email}
              </a>
            )}

            {(record.phone ||
              application
                .applicant
                ?.phone) && (
              <a
                href={`tel:${
                  record.phone ||
                  application
                    .applicant
                    ?.phone
                }`}
              >
                <Phone
                  size={16}
                />

                {record.phone ||
                  application
                    .applicant
                    ?.phone}
              </a>
            )}

            {(record.whatsapp ||
              application
                .applicant
                ?.whatsapp) && (
              <a
                href={`https://wa.me/${(
                  record.whatsapp ||
                  application
                    .applicant
                    ?.whatsapp ||
                  ''
                ).replace(
                  /\D/g,
                  ''
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle
                  size={16}
                />

                WhatsApp
              </a>
            )}
          </section>


          <section
            className={
              styles.sideCard
            }
          >
            <div
              className={
                styles.sideTitle
              }
            >
              <WalletCards
                size={19}
              />

              <h2>
                Advertising
              </h2>
            </div>

            <div
              className={
                styles.paymentRow
              }
            >
              <span>
                Package
              </span>

              <strong>
                {
                  record
                    .packageName ||
                  'Standard Listing'
                }
              </strong>
            </div>

            <div
              className={
                styles.paymentRow
              }
            >
              <span>
                Fee
              </span>

              <strong>
                {formatMoney(
                  record
                    .packageFee ||
                  20000
                )}
              </strong>
            </div>

            <div
              className={
                styles.paymentRow
              }
            >
              <span>
                Payment
              </span>

              <strong>
                {
                  record
                    .paymentStatus ||
                  'NOT REQUESTED'
                }
              </strong>
            </div>

            <small
              className={
                styles.paymentNote
              }
            >
              {String(
                record.paymentStatus ||
                ''
              )
                .trim()
                .toUpperCase() ===
              'PAID'
                ? 'Payment has been verified. This listing is ready for publication.'
                : String(
                    record.paymentStatus ||
                    ''
                  )
                    .trim()
                    .toUpperCase() ===
                  'PENDING'
                  ? 'The Paystack payment request has been issued. Waiting for verified payment.'
                  : record.reviewStatus
                      .trim()
                      .toUpperCase() ===
                    'APPROVED'
                    ? 'This application is approved. The payment request must be completed before publication.'
                    : 'Approve the application before a Paystack payment request can be issued.'}
            </small>
          </section>


          <PublishApplicationCard
            record={
              record
            }
            onPublished={
              load
            }
          />


          {record.reviewStatus
            .trim()
            .toUpperCase() ===
          'APPROVED' ? (
            <section
              className={
                styles.decisionCard
              }
            >
              <div
                className={
                  styles.sideTitle
                }
              >
                <ShieldCheck
                  size={19}
                />

                <h2>
                  Review completed
                </h2>
              </div>

              <div
                className={
                  styles.paymentRow
                }
              >
                <span>
                  Application
                </span>

                <strong>
                  APPROVED ✓
                </strong>
              </div>

              <div
                className={
                  styles.paymentRow
                }
              >
                <span>
                  Payment
                </span>

                <strong>
                  {record.paymentStatus ||
                    'NOT REQUESTED'}
                </strong>
              </div>

              <div
                className={
                  styles.paymentRow
                }
              >
                <span>
                  Publication
                </span>

                <strong>
                  {String(
                    record.published ||
                    ''
                  )
                    .trim()
                    .toUpperCase() ===
                  'YES'
                    ? 'PUBLISHED ✓'
                    : 'NOT PUBLISHED'}
                </strong>
              </div>

              <small
                className={
                  styles.paymentNote
                }
              >
                {String(
                  record.published ||
                  ''
                )
                  .trim()
                  .toUpperCase() ===
                'YES'
                  ? 'Review is complete. Payment was verified and the listing has been published. Future advert lifecycle actions are managed from Properties.'
                  : String(
                      record.paymentStatus ||
                      ''
                    )
                      .trim()
                      .toUpperCase() ===
                    'PAID'
                    ? 'Review and payment are complete. Use the Publication section above to publish this listing.'
                    : 'Review is complete. Waiting for verified payment before publication.'}
              </small>
            </section>
          ) : (
            <section
              className={
                styles.decisionCard
              }
            >
              <div
                className={
                  styles.sideTitle
                }
              >
                <ShieldCheck
                  size={19}
                />

                <h2>
                  Review decision
                </h2>
              </div>

              <label>
                Admin Notes

                <textarea
                  rows={6}
                  value={
                    notes
                  }
                  onChange={(
                    event
                  ) =>
                    setNotes(
                      event.target
                        .value
                    )
                  }
                  placeholder="Explain required changes or rejection reason..."
                />
              </label>

              {decisionMode ? (
                <div
                  className={
                    styles.confirmBox
                  }
                >
                  <strong>
                    {decisionMode ===
                    'approve'
                      ? 'Approve this application?'
                      : decisionMode ===
                          'needs_changes'
                        ? 'Send change request?'
                        : 'Reject this application?'}
                  </strong>

                  <p>
                    An email will be
                    sent to the
                    applicant.
                  </p>

                  <div
                    className={
                      styles.confirmActions
                    }
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setDecisionMode(
                          ''
                        )
                      }
                      disabled={
                        saving
                      }
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      className={
                        styles
                          .confirmDecision
                      }
                      onClick={() =>
                        void decide(
                          decisionMode
                        )
                      }
                      disabled={
                        saving
                      }
                    >
                      {saving
                        ? 'Saving...'
                        : 'Confirm'}
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className={
                    styles.decisionActions
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.approveButton
                    }
                    onClick={() =>
                      setDecisionMode(
                        'approve'
                      )
                    }
                    disabled={
                      saving
                    }
                  >
                    <CheckCircle2
                      size={17}
                    />

                    Approve
                  </button>

                  <button
                    type="button"
                    className={
                      styles.changesButton
                    }
                    onClick={() =>
                      setDecisionMode(
                        'needs_changes'
                      )
                    }
                    disabled={
                      saving
                    }
                  >
                    <FileWarning
                      size={17}
                    />

                    Needs Changes
                  </button>

                  <button
                    type="button"
                    className={
                      styles.rejectButton
                    }
                    onClick={() =>
                      setDecisionMode(
                        'reject'
                      )
                    }
                    disabled={
                      saving
                    }
                  >
                    <XCircle
                      size={17}
                    />

                    Reject
                  </button>
                </div>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}