'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link
  from 'next/link';

import {
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  FileWarning,
  Globe2,
  RefreshCw,
  RotateCcw,
  TimerOff,
  WalletCards,
} from 'lucide-react';

import {
  deleteField,
  doc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

import {
  auth,
  db,
} from '@/lib/firebase';

import {
  publishPaidApplication,
} from '@/lib/publishApplication';

import type {
  ListingApplicationDraft,
} from '@/lib/listingApplication';

import styles
  from '@/app/admin/applications/applications.module.css';


type PublishRecord = {
  reference:
    string;

  listingTitle:
    string;

  reviewStatus:
    string;

  paymentStatus:
    string;

  published:
    string;

  publishedAt?:
    string;

  expiryDate?:
    string;

  application:
    ListingApplicationDraft;
};


type PublishApplicationCardProps = {
  record:
    PublishRecord;

  onPublished:
    () =>
      Promise<void>;
};


type RenewalState = {
  status?:
    string;

  renewalNumber?:
    number;

  renewalCount?:
    number;

  paymentReference?:
    string;

  paymentUrl?:
    string;

  paidAt?:
    string;

  paymentChannel?:
    string;

  requestedAt?:
    string;

  activatedAt?:
    string;
};


type RenewalApiResponse = {
  ok?:
    boolean;

  error?:
    string;

  message?:
    string;

  application?: {
    reference?:
      string;

    listingTitle?:
      string;

    expiryDate?:
      string;
  };

  renewal?:
    RenewalState;

  reused?:
    boolean;

  paymentUrl?:
    string;

  paymentReference?:
    string;

  renewalNumber?:
    number;

  propertyId?:
    string;

  activationAt?:
    string;

  expiryDate?:
    string;

  activated?:
    boolean;
};


function parseDate(
  value:
    string | undefined
) {
  if (
    !value
  ) {
    return null;
  }

  const date =
    new Date(
      value
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
}


function formatDate(
  date:
    Date | null
) {
  if (
    !date
  ) {
    return '—';
  }

  return new Intl.DateTimeFormat(
    'en-NG',
    {
      day:
        'numeric',

      month:
        'short',

      year:
        'numeric',
    }
  ).format(
    date
  );
}


function daysUntil(
  date:
    Date | null
) {
  if (
    !date
  ) {
    return null;
  }

  const difference =
    date.getTime() -
    Date.now();

  if (
    difference <=
    0
  ) {
    return 0;
  }

  return Math.ceil(
    difference /
    (
      24 *
      60 *
      60 *
      1000
    )
  );
}


function statusText(
  value:
    string | undefined
) {
  return String(
    value ||
    ''
  )
    .trim()
    .toUpperCase();
}


async function adminToken() {
  const user =
    auth.currentUser;

  if (
    !user
  ) {
    throw new Error(
      'ADMIN_LOGIN_REQUIRED'
    );
  }

  return user.getIdToken();
}


async function readJson(
  response:
    Response
) {
  const text =
    await response.text();

  let data:
    RenewalApiResponse;

  try {
    data =
      JSON.parse(
        text
      ) as
        RenewalApiResponse;
  } catch {
    throw new Error(
      'Server returned an invalid response.'
    );
  }

  if (
    !response.ok ||
    data.ok !==
      true
  ) {
    throw new Error(
      data.message ||
      data.error ||
      'Request failed.'
    );
  }

  return data;
}


export default function
PublishApplicationCard({
  record,
  onPublished,
}: PublishApplicationCardProps) {
  const [
    publishing,
    setPublishing,
  ] =
    useState(false);

  const [
    confirming,
    setConfirming,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    publishedUrl,
    setPublishedUrl,
  ] =
    useState('');

  const [
    renewal,
    setRenewal,
  ] =
    useState<
      RenewalState | null
    >(
      null
    );

  const [
    renewalApplicationExpiry,
    setRenewalApplicationExpiry,
  ] =
    useState('');

  const [
    renewalLoading,
    setRenewalLoading,
  ] =
    useState(false);

  const [
    renewalBusy,
    setRenewalBusy,
  ] =
    useState(false);


  const alreadyPublished =
    statusText(
      record.published
    ) ===
    'YES';


  const approved =
    statusText(
      record.reviewStatus
    ) ===
    'APPROVED';


  const paid =
    statusText(
      record.paymentStatus
    ) ===
    'PAID';


  const propertyId =
    `partner-${record.reference.toLowerCase()}`;


  const publicUrl =
    `/properties/${propertyId}`;


  const editUrl =
    `/admin/properties/edit/${propertyId}`;


  const publishedAt =
    useMemo(
      () =>
        parseDate(
          record.publishedAt
        ),

      [
        record.publishedAt,
      ]
    );


  const effectiveExpiryText =
    renewalApplicationExpiry ||
    record.expiryDate ||
    '';


  const expiresAt =
    useMemo(
      () =>
        parseDate(
          effectiveExpiryText
        ),

      [
        effectiveExpiryText,
      ]
    );


  const daysRemaining =
    daysUntil(
      expiresAt
    );


  const expired =
    alreadyPublished &&
    expiresAt !==
      null &&
    daysRemaining ===
      0;


  const expiringSoon =
    alreadyPublished &&
    !expired &&
    daysRemaining !==
      null &&
    daysRemaining <=
      7;


  const renewalStatus =
    statusText(
      renewal?.status
    );


  const loadRenewal =
    useCallback(
      async () => {
        if (
          !alreadyPublished
        ) {
          return;
        }

        setRenewalLoading(
          true
        );

        try {
          const token =
            await adminToken();

          const response =
            await fetch(
              `/api/admin/listing-applications/renewal/manage?reference=${encodeURIComponent(
                record.reference
              )}`,
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },

                cache:
                  'no-store',
              }
            );

          const data =
            await readJson(
              response
            );

          setRenewal(
            data.renewal ||
            null
          );

          setRenewalApplicationExpiry(
            data.application
              ?.expiryDate ||
            ''
          );
        } catch (
          loadError
        ) {
          console.error(
            'Could not load renewal:',
            loadError
          );
        } finally {
          setRenewalLoading(
            false
          );
        }
      },
      [
        alreadyPublished,
        record.reference,
      ]
    );


  useEffect(() => {
    if (
      !alreadyPublished
    ) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          void loadRenewal();
        },
        0
      );

    return () => {
      window.clearTimeout(
        timer
      );
    };
  }, [
    alreadyPublished,
    loadRenewal,
  ]);


  async function publish() {
    setPublishing(
      true
    );

    setError(
      ''
    );

    try {
      const result =
        await publishPaidApplication({
          reference:
            record.reference,

          application:
            record.application,
        });

      setPublishedUrl(
        result.publicUrl
      );

      setConfirming(
        false
      );

      await onPublished();
    } catch (
      publishError
    ) {
      setError(
        publishError instanceof
        Error
          ? publishError.message
          : 'Could not publish listing.'
      );
    } finally {
      setPublishing(
        false
      );
    }
  }


  async function
  requestRenewal() {
    const confirmed =
      window.confirm(
        'Create a new ₦20,000 renewal payment request for this expired Partner Listing?'
      );

    if (
      !confirmed
    ) {
      return;
    }

    setRenewalBusy(
      true
    );

    setError(
      ''
    );

    try {
      const token =
        await adminToken();

      const response =
        await fetch(
          '/api/admin/listing-applications/renewal',
          {
            method:
              'POST',

            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                reference:
                  record.reference,
              }),
          }
        );

      const data =
        await readJson(
          response
        );

      await loadRenewal();

      if (
        data.paymentUrl
      ) {
        window.alert(
          'Renewal request created successfully. The owner has been emailed the official Paystack payment link.'
        );
      }
    } catch (
      renewalError
    ) {
      setError(
        renewalError instanceof
        Error
          ? renewalError.message
          : 'Could not request renewal.'
      );
    } finally {
      setRenewalBusy(
        false
      );
    }
  }


  async function
  activateRenewal() {
    const confirmed =
      window.confirm(
        'Activate this paid renewal and start a fresh 30-day advertising period now?'
      );

    if (
      !confirmed
    ) {
      return;
    }

    setRenewalBusy(
      true
    );

    setError(
      ''
    );

    try {
      const token =
        await adminToken();


      /*
       * STEP 1
       *
       * Apps Script verifies the renewal
       * is actually PAID and fixes the
       * activation timestamp.
       */

      const prepareResponse =
        await fetch(
          '/api/admin/listing-applications/renewal/manage',
          {
            method:
              'POST',

            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                reference:
                  record.reference,

                phase:
                  'prepare',
              }),
          }
        );


      const prepared =
        await readJson(
          prepareResponse
        );


      if (
        prepared.activated ===
        true
      ) {
        await loadRenewal();
        await onPublished();

        return;
      }


      if (
        !prepared.activationAt ||
        !prepared.expiryDate ||
        !prepared.renewalNumber ||
        !prepared.paymentReference
      ) {
        throw new Error(
          'Renewal activation data is incomplete.'
        );
      }


      const activationDate =
        new Date(
          prepared.activationAt
        );


      const expiryDate =
        new Date(
          prepared.expiryDate
        );


      if (
        Number.isNaN(
          activationDate.getTime()
        ) ||
        Number.isNaN(
          expiryDate.getTime()
        )
      ) {
        throw new Error(
          'Renewal activation dates are invalid.'
        );
      }


      /*
       * STEP 2
       *
       * Reactivate the SAME Firestore
       * property.
       *
       * Original publishedAt is NOT
       * changed.
       */

      await updateDoc(
        doc(
          db,
          'properties',
          propertyId
        ),

        {
          lifecycleStatus:
            'published',

          // Clear archival metadata from the previous paid period.
          archivedReason:
            deleteField(),

          archivedAt:
            deleteField(),

          renewedAt:
            Timestamp.fromDate(
              activationDate
            ),

          expiresAt:
            Timestamp.fromDate(
              expiryDate
            ),

          renewalCount:
            prepared.renewalNumber,

          advertisingDurationDays:
            30,

          lastRenewalNumber:
            prepared.renewalNumber,

          lastRenewalPaymentReference:
            prepared.paymentReference,

          updatedAt:
            serverTimestamp(),
        }
      );


      /*
       * STEP 3
       *
       * Firestore succeeded.
       * Finalize the business record.
       */

      const completeResponse =
        await fetch(
          '/api/admin/listing-applications/renewal/manage',
          {
            method:
              'POST',

            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                reference:
                  record.reference,

                phase:
                  'complete',
              }),
          }
        );


      await readJson(
        completeResponse
      );


      await loadRenewal();

      await onPublished();


      window.alert(
        'Renewal activated successfully. The listing is live again for 30 days.'
      );
    } catch (
      renewalError
    ) {
      setError(
        renewalError instanceof
        Error
          ? renewalError.message
          : 'Could not activate renewal.'
      );
    } finally {
      setRenewalBusy(
        false
      );
    }
  }


  if (
    !approved
  ) {
    return null;
  }


  return (
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
        {expired ? (
          <TimerOff
            size={19}
          />
        ) : (
          <Globe2
            size={19}
          />
        )}

        <h2>
          Publication
        </h2>
      </div>


      {alreadyPublished ? (
        <>
          <div
            className={
              styles.paymentRow
            }
          >
            <span>
              Status
            </span>

            <strong>
              {expired
                ? 'EXPIRED'
                : expiringSoon
                  ? 'EXPIRING SOON'
                  : 'LIVE ✓'}
            </strong>
          </div>


          {publishedAt && (
            <div
              className={
                styles.paymentRow
              }
            >
              <span>
                First published
              </span>

              <strong>
                {formatDate(
                  publishedAt
                )}
              </strong>
            </div>
          )}


          {expiresAt && (
            <div
              className={
                styles.paymentRow
              }
            >
              <span>
                Expires
              </span>

              <strong>
                {formatDate(
                  expiresAt
                )}
              </strong>
            </div>
          )}


          {daysRemaining !==
            null &&
            !expired && (
            <div
              className={
                styles.paymentRow
              }
            >
              <span>
                Time left
              </span>

              <strong>
                {daysRemaining}{' '}
                {daysRemaining ===
                1
                  ? 'day'
                  : 'days'}
              </strong>
            </div>
          )}


          {renewal &&
            renewalStatus !==
              'NOT REQUESTED' &&
            renewalStatus !==
              '' && (
            <>
              <div
                className={
                  styles.paymentRow
                }
              >
                <span>
                  Renewal
                </span>

                <strong>
                  #
                  {
                    renewal
                      .renewalNumber
                  }
                </strong>
              </div>

              <div
                className={
                  styles.paymentRow
                }
              >
                <span>
                  Renewal Status
                </span>

                <strong>
                  {
                    renewalStatus
                  }
                </strong>
              </div>
            </>
          )}


          <small
            className={
              styles.paymentNote
            }
          >
            {expired
              ? renewalStatus ===
                  'PAID'
                ? 'The ₦20,000 renewal payment has been verified. Activate the renewal to start the new 30-day advertising period.'
                : renewalStatus ===
                    'PENDING'
                  ? 'A renewal checkout has been issued. The listing remains offline until Paystack verifies payment.'
                  : renewalStatus ===
                      'ACTIVATING'
                    ? 'Renewal activation started. Complete the activation to restore the listing.'
                    : 'This 30-day advert has expired and is no longer publicly visible. A new ₦20,000 renewal payment is required.'
              : expiringSoon
                ? `This Partner Listing expires soon. ${daysRemaining} ${
                    daysRemaining ===
                    1
                      ? 'day remains'
                      : 'days remain'
                  }.`
                : renewalStatus ===
                    'ACTIVATED'
                  ? 'This Partner Listing is live under its renewed advertising period.'
                  : 'This Partner Listing is currently live.'}
          </small>


          {!expired && (
            <a
              href={
                publishedUrl ||
                publicUrl
              }
              target="_blank"
              rel="noreferrer"
              className={
                styles.approveButton
              }
              style={{
                color:
                  '#ffffff',

                textDecoration:
                  'none',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                gap:
                  '8px',
              }}
            >
              <ExternalLink
                size={17}
              />

              View Live Listing
            </a>
          )}


          <Link
            href={
              editUrl
            }
            className={
              styles.changesButton
            }
            style={{
              textDecoration:
                'none',

              display:
                'flex',

              alignItems:
                'center',

              justifyContent:
                'center',

              gap:
                '8px',
            }}
          >
            <CalendarClock
              size={17}
            />

            Edit Listing
          </Link>


          {expired &&
            !renewalLoading &&
            (
              renewalStatus ===
                '' ||
              renewalStatus ===
                'NOT REQUESTED' ||
              renewalStatus ===
                'ACTIVATED'
            ) && (
            <button
              type="button"
              className={
                styles.changesButton
              }
              disabled={
                renewalBusy
              }
              onClick={() =>
                void requestRenewal()
              }
            >
              <WalletCards
                size={17}
              />

              {renewalBusy
                ? 'Creating...'
                : 'Request ₦20,000 Renewal'}
            </button>
          )}


          {expired &&
            renewalStatus ===
              'PENDING' &&
            renewal
              ?.paymentUrl && (
            <a
              href={
                renewal
                  .paymentUrl
              }
              target="_blank"
              rel="noreferrer"
              className={
                styles.changesButton
              }
              style={{
                textDecoration:
                  'none',

                display:
                  'flex',

                alignItems:
                  'center',

                justifyContent:
                  'center',

                gap:
                  '8px',
              }}
            >
              <WalletCards
                size={17}
              />

              Open Renewal Checkout
            </a>
          )}


          {expired &&
            (
              renewalStatus ===
                'PAID' ||
              renewalStatus ===
                'ACTIVATING'
            ) && (
            <button
              type="button"
              className={
                styles.approveButton
              }
              disabled={
                renewalBusy
              }
              onClick={() =>
                void activateRenewal()
              }
            >
              <RotateCcw
                size={17}
              />

              {renewalBusy
                ? 'Activating...'
                : renewalStatus ===
                    'ACTIVATING'
                  ? 'Complete Activation'
                  : 'Activate Renewal'}
            </button>
          )}


          {alreadyPublished && (
            <button
              type="button"
              className={
                styles.changesButton
              }
              disabled={
                renewalLoading ||
                renewalBusy
              }
              onClick={() =>
                void loadRenewal()
              }
            >
              <RefreshCw
                size={16}
              />

              {renewalLoading
                ? 'Checking...'
                : 'Refresh Renewal Status'}
            </button>
          )}
        </>
      ) : !paid ? (
        <>
          <div
            className={
              styles.paymentRow
            }
          >
            <span>
              Publication
            </span>

            <strong>
              LOCKED
            </strong>
          </div>

          <small
            className={
              styles.paymentNote
            }
          >
            This application is
            approved, but payment
            must show PAID before it
            can be published.
          </small>
        </>
      ) : confirming ? (
        <div
          className={
            styles.confirmBox
          }
        >
          <strong>
            Publish this listing?
          </strong>

          <p>
            This will make the
            property public and
            start its 30-day
            advertising period.
          </p>

          <div
            className={
              styles.confirmActions
            }
          >
            <button
              type="button"
              disabled={
                publishing
              }
              onClick={() =>
                setConfirming(
                  false
                )
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
              disabled={
                publishing
              }
              onClick={() =>
                void publish()
              }
            >
              {publishing
                ? 'Publishing...'
                : 'Confirm Publish'}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div
            className={
              styles.paymentRow
            }
          >
            <span>
              Payment
            </span>

            <strong>
              PAID ✓
            </strong>
          </div>

          <small
            className={
              styles.paymentNote
            }
          >
            Payment is verified.
            Publishing will create
            the Partner Listing and
            start the 30-day advert.
          </small>

          <button
            type="button"
            className={
              styles.approveButton
            }
            disabled={
              publishing
            }
            onClick={() =>
              setConfirming(
                true
              )
            }
          >
            <Globe2
              size={17}
            />

            Publish Listing
          </button>
        </>
      )}


      {error && (
        <div
          className={
            styles.error
          }
        >
          <FileWarning
            size={17}
          />

          {error}
        </div>
      )}


      {publishedUrl && (
        <div
          className={
            styles.paymentRow
          }
        >
          <CheckCircle2
            size={17}
          />

          <strong>
            Published successfully
          </strong>
        </div>
      )}
    </section>
  );
}