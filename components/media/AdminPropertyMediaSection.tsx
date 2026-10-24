'use client';

import {
  type MediaCollection,
} from '@/lib/media';

import {
  type PropertyService,
} from '@/lib/property';

import CloudinaryUploader
  from '@/components/media/CloudinaryUploader';

import styles
  from './AdminPropertyMediaSection.module.css';

export type AdminMediaUnit = {
  id: string;

  name: string;

  quantity?: number;

  media:
    MediaCollection;
};

type Props = {
  draftId: string;

  serviceType:
    PropertyService;

  generalMedia:
    MediaCollection;

  units:
    AdminMediaUnit[];

  onGeneralMediaChange:
    (
      media:
        MediaCollection
    ) => void;

  onUnitMediaChange:
    (
      unitId: string,
      media:
        MediaCollection
    ) => void;
};

export default function
AdminPropertyMediaSection({
  draftId,
  serviceType,
  generalMedia,
  units,
  onGeneralMediaChange,
  onUnitMediaChange,
}: Props) {
  const multiUnit =
    serviceType ===
      'hostel' ||
    units.length >
      1 ||
    units.some(
      (
        unit
      ) =>
        (
          unit.quantity ??
          1
        ) >
        1
    );

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
          Cloudinary Media
        </span>

        <h2>
          Property photos &
          videos
        </h2>

        <p>
          Upload the public
          listing gallery here.
          Multi-unit properties
          can also have separate
          media for each unit
          variant.
        </p>
      </div>

      <CloudinaryUploader
        origin="admin"
        draftId={
          draftId
        }
        listingType={
          serviceType
        }
        scope="general"
        multiUnit={
          multiUnit
        }
        value={
          generalMedia
        }
        onChange={
          onGeneralMediaChange
        }
        title={
          multiUnit
            ? 'Building / general media'
            : 'Listing media'
        }
        description={
          multiUnit
            ? 'Exterior, compound, common areas and media representing the property generally.'
            : 'Upload the photos and videos visitors should see for this listing.'
        }
      />

      {multiUnit &&
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
                Unit media
              </span>

              <h3>
                Separate galleries
                by unit variant
              </h3>

              <p>
                Use this for
                materially different
                units such as Self
                Contain, Room &
                Parlour, 2 Bedroom,
                3 Bedroom, shops,
                offices or premium
                variants.
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

                  <CloudinaryUploader
                    origin="admin"
                    draftId={
                      draftId
                    }
                    listingType={
                      serviceType
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
                      onUnitMediaChange(
                        unit.id,
                        media
                      )
                    }
                    title={
                      unit.name
                        ? `${unit.name} media`
                        : `Unit ${index + 1} media`
                    }
                    description="Upload photos that specifically represent this unit variant and one short walkthrough video where available."
                  />
                </div>
              )
            )}
          </div>
        )}
    </div>
  );
}
