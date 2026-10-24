'use client';

import {
  useState,
} from 'react';

import {
  CheckCircle2,
  ExternalLink,
  FileWarning,
  Globe2,
} from 'lucide-react';

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

  const alreadyPublished =
    String(
      record.published ||
      ''
    )
      .trim()
      .toUpperCase() ===
    'YES';

  const approved =
    String(
      record
        .reviewStatus ||
      ''
    )
      .trim()
      .toUpperCase() ===
    'APPROVED';

  const paid =
    String(
      record
        .paymentStatus ||
      ''
    )
      .trim()
      .toUpperCase() ===
    'PAID';

  const propertyId =
    `partner-${record.reference.toLowerCase()}`;

  const publicUrl =
    `/properties/${propertyId}`;


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
        <Globe2
          size={19}
        />

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
              LIVE
            </strong>
          </div>

          <small
            className={
              styles.paymentNote
            }
          >
            This advert has already
            been published. Its
            30-day period started at
            the original publication
            time.
          </small>

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
          >
            <ExternalLink
              size={17}
            />

            View Live Listing
          </a>
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