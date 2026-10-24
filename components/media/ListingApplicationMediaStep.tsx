'use client';

import {
  type MediaCollection,
} from '@/lib/media';

import {
  type ListingApplicationDraft,
} from '@/lib/listingApplication';

import CloudinaryUploader
  from '@/components/media/CloudinaryUploader';

import styles
  from './ListingApplicationMediaStep.module.css';

interface Props {
  draft:
    ListingApplicationDraft;

  onChange:
    (
      draft:
        ListingApplicationDraft
    ) => void;
}

export default function
ListingApplicationMediaStep({
  draft,
  onChange,
}: Props) {
  const isHostel =
    draft.listingType ===
    'hostel';

  const hasUnits =
    isHostel ||
    draft.hasMultipleUnits;

  const units =
    isHostel
      ? draft.hostelRoomTypes
      : draft.unitVariants;

  const updateGeneralMedia =
    (
      media:
        MediaCollection
    ) => {
      onChange({
        ...draft,
        generalMedia:
          media,
      });
    };

  const updateUnitMedia =
    (
      unitId: string,
      media:
        MediaCollection
    ) => {
      if (isHostel) {
        onChange({
          ...draft,

          hostelRoomTypes:
            draft.hostelRoomTypes.map(
              (unit) =>
                unit.id ===
                unitId
                  ? {
                      ...unit,
                      media,
                    }
                  : unit
            ),
        });

        return;
      }

      onChange({
        ...draft,

        unitVariants:
          draft.unitVariants.map(
            (unit) =>
              unit.id ===
              unitId
                ? {
                    ...unit,
                    media,
                  }
                : unit
          ),
      });
    };

  const generalTitle =
    hasUnits
      ? 'Building / general media'
      : 'Property media';

  const generalDescription =
    hasUnits
      ? 'Upload photos and a short video showing the exterior, compound, entrance, common areas and the property generally.'
      : 'Upload clear recent photos and videos that accurately represent this listing.';

  return (
    <div
      className={
        styles.wrapper
      }
    >
      <div
        className={
          styles.intro
        }
      >
        <span>
          Step 4
        </span>

        <h2>
          Photos & videos
        </h2>

        <p>
          Upload clear,
          recent media.
          Different
          rentable unit
          variants can
          have their own
          galleries.
        </p>
      </div>

      <CloudinaryUploader
        draftId={
          draft.uploadDraftId
        }
        listingType={
          draft.listingType ===
          ''
            ? 'property'
            : draft.listingType
        }
        scope="general"
        multiUnit={
          hasUnits
        }
        value={
          draft.generalMedia
        }
        onChange={
          updateGeneralMedia
        }
        title={
          generalTitle
        }
        description={
          generalDescription
        }
      />

      {hasUnits &&
        units.length >
          0 && (
          <div
            className={
              styles.units
            }
          >
            <div
              className={
                styles.unitHeading
              }
            >
              <span>
                Unit galleries
              </span>

              <h3>
                Add media for
                each different
                unit.
              </h3>

              <p>
                A unit can be a
                self contain,
                room & parlour,
                two-bedroom,
                three-bedroom,
                shop, office or
                any other
                separately
                priced variant.
              </p>
            </div>

            {units.map(
              (
                unit,
                index
              ) => (
                <div
                  key={
                    unit.id
                  }
                  className={
                    styles.unitBlock
                  }
                >
                  <div
                    className={
                      styles.unitLabel
                    }
                  >
                    <div>
                      <span>
                        Unit{' '}
                        {index +
                          1}
                      </span>

                      <strong>
                        {unit.name ||
                          `Unit variant ${index + 1}`}
                      </strong>
                    </div>

                    {unit.quantity >
                      0 && (
                      <small>
                        {
                          unit.quantity
                        }{' '}
                        unit
                        {unit.quantity ===
                        1
                          ? ''
                          : 's'}
                      </small>
                    )}
                  </div>

                  <CloudinaryUploader
                    draftId={
                      draft.uploadDraftId
                    }
                    listingType={
                      draft.listingType ===
                      ''
                        ? 'property'
                        : draft.listingType
                    }
                    scope="unit"
                    unitId={
                      unit.id
                    }
                    value={
                      unit.media
                    }
                    onChange={(
                      media
                    ) =>
                      updateUnitMedia(
                        unit.id,
                        media
                      )
                    }
                    title={
                      unit.name
                        ? `${unit.name} media`
                        : `Unit ${index + 1} media`
                    }
                    description="Upload photos that specifically show this unit type. Add one short walkthrough video where available."
                  />
                </div>
              )
            )}
          </div>
        )}

      {hasUnits &&
        units.length ===
          0 && (
          <div
            className={
              styles.emptyUnits
            }
          >
            Add your unit
            variants in the
            property details
            section first.
            Their individual
            media uploaders
            will then appear
            here.
          </div>
        )}

      <div
        className={
          styles.tip
        }
      >
        <strong>
          Good listing
          photos matter.
        </strong>

        <span>
          Show the actual
          property and each
          materially different
          unit. Avoid duplicate
          photos, screenshots
          and heavily edited
          images.
        </span>
      </div>
    </div>
  );
}