'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eraser,
  MapPin,
  Save,
} from 'lucide-react';

import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';

import {
  db,
} from '@/lib/firebase';

import {
  normalizeProperty,
  type PropertyRecord,
} from '@/lib/property';

import {
  availabilityStatusLabels,
  availabilityStatuses,
  buildAvailabilityCalendarId,
  enumerateDateKeys,
  getLagosTodayKey,
  type AvailabilityStatus,
} from '@/lib/availability';

import AvailabilityCalendar
  from '@/components/availability/AvailabilityCalendar';

import styles
  from './AvailabilityManager.module.css';

type AvailabilityResource = {
  calendarId: string;

  propertyId?: string;

  unitId?: string;

  propertyName: string;

  unitName: string;

  location: string;

  overallStatus?: string;

  source:
    | 'managed'
    | 'listing';
};

const ISARA_STARTER:
  AvailabilityResource = {
  calendarId:
    'managed-isara-remo-shortlet',

  propertyName:
    'Living Spring Short-Let – Isara-Remo',

  unitName:
    'Current Isara-Remo Short-Let',

  location:
    'Jewayo Community, Isara-Remo, Ogun State',

  source:
    'managed',
};

export default function AvailabilityManager() {
  const [
    properties,
    setProperties,
  ] =
    useState<
      PropertyRecord[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    selectedCalendarId,
    setSelectedCalendarId,
  ] =
    useState(
      ISARA_STARTER
        .calendarId
    );

  const [
    startDate,
    setStartDate,
  ] =
    useState(
      getLagosTodayKey()
    );

  const [
    endDate,
    setEndDate,
  ] =
    useState(
      getLagosTodayKey()
    );

  const [
    status,
    setStatus,
  ] =
    useState<
      AvailabilityStatus
    >(
      'booked'
    );

  const [
    note,
    setNote,
  ] =
    useState('');

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState('');

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);

  useEffect(() => {
    let active =
      true;

    async function loadShortLets() {
      try {
        const snapshot =
          await getDocs(
            query(
              collection(
                db,
                'properties'
              ),

              limit(100)
            )
          );

        const result =
          snapshot.docs
            .map(
              (
                document
              ) =>
                normalizeProperty(
                  document.id,
                  document.data()
                )
            )
            .filter(
              (
                property
              ) =>
                property.serviceType ===
                'shortlet'
            );

        if (active) {
          setProperties(
            result
          );
        }
      } catch (error) {
        console.error(
          'Availability property load failed:',
          error
        );

        if (active) {
          setMessage(
            'Could not load short-let listings.'
          );
        }
      } finally {
        if (active) {
          setLoading(
            false
          );
        }
      }
    }

    void loadShortLets();

    return () => {
      active =
        false;
    };
  }, []);

  const resources =
    useMemo<
      AvailabilityResource[]
    >(() => {
      const dynamic =
        properties.flatMap(
          (
            property
          ) =>
            property.units.map(
              (
                unit
              ) => ({
                calendarId:
                  buildAvailabilityCalendarId(
                    {
                      propertyId:
                        property.id,

                      unitId:
                        unit.id,

                      propertyName:
                        property.title,

                      unitName:
                        unit.unitType,

                      locationSlug:
                        property.locationSlug,
                    }
                  ),

                propertyId:
                  property.id,

                unitId:
                  unit.id,

                propertyName:
                  property.title ||
                  'Untitled Short-Let',

                unitName:
                  unit.unitType ||
                  'Unnamed Unit',

                location:
                  property.address ||
                  property.location,

                overallStatus:
                  unit.status,

                source:
                  'listing' as const,
              })
            )
        );

      return [
        ISARA_STARTER,
        ...dynamic,
      ];
    }, [
      properties,
    ]);

  const selected =
    useMemo(
      () =>
        resources.find(
          (
            resource
          ) =>
            resource.calendarId ===
            selectedCalendarId
        ) ||
        ISARA_STARTER,
      [
        resources,
        selectedCalendarId,
      ]
    );

  const validateRange =
    () => {
      const dates =
        enumerateDateKeys(
          startDate,
          endDate
        );

      if (
        dates.length ===
        0
      ) {
        setMessage(
          'Choose a valid start and end date.'
        );

        return null;
      }

      if (
        dates.length >
        366
      ) {
        setMessage(
          'A single availability update cannot exceed 366 days.'
        );

        return null;
      }

      return dates;
    };

  /*
   * ============================================
   * APPLY AVAILABILITY STATUS
   * ============================================
   *
   * PUBLIC:
   *
   * availabilityCalendars/{calendarId}/days/{date}
   *
   * contains only:
   * - date
   * - status
   * - updatedAt
   *
   *
   * PRIVATE:
   *
   * availabilityAdmin/{calendarId}/days/{date}
   *
   * contains:
   * - internal note
   * - property context
   * - unit context
   */

  const applyStatus =
    async () => {
      const dates =
        validateRange();

      if (!dates) {
        return;
      }

      setSaving(
        true
      );

      setMessage(
        ''
      );

      try {
        const batch =
          writeBatch(
            db
          );

        dates.forEach(
          (
            dateKey
          ) => {
            const publicRef =
              doc(
                db,
                'availabilityCalendars',
                selected.calendarId,
                'days',
                dateKey
              );

            /*
             * Important:
             *
             * No merge.
             *
             * This deliberately replaces any
             * older Batch 5 document that may
             * still contain a public "note".
             */

            batch.set(
              publicRef,
              {
                date:
                  dateKey,

                status,

                updatedAt:
                  serverTimestamp(),
              }
            );

            const privateRef =
              doc(
                db,
                'availabilityAdmin',
                selected.calendarId,
                'days',
                dateKey
              );

            if (
              note.trim()
            ) {
              batch.set(
                privateRef,
                {
                  date:
                    dateKey,

                  status,

                  note:
                    note.trim(),

                  propertyId:
                    selected.propertyId ||
                    null,

                  unitId:
                    selected.unitId ||
                    null,

                  propertyName:
                    selected.propertyName,

                  unitName:
                    selected.unitName,

                  location:
                    selected.location,

                  updatedAt:
                    serverTimestamp(),
                }
              );
            } else {
              /*
               * Remove an old private note
               * if the admin intentionally
               * saves the date without one.
               */

              batch.delete(
                privateRef
              );
            }
          }
        );

        await batch.commit();

        setMessage(
          `${dates.length} ${
            dates.length ===
            1
              ? 'day'
              : 'days'
          } marked ${
            availabilityStatusLabels[
              status
            ]
          }.`
        );

        setRefreshKey(
          (
            current
          ) =>
            current + 1
        );
      } catch (error) {
        console.error(
          'Availability update failed:',
          error
        );

        setMessage(
          'Could not update availability.'
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  /*
   * ============================================
   * MAKE DATES AVAILABLE
   * ============================================
   */

  const clearDates =
    async () => {
      const dates =
        validateRange();

      if (!dates) {
        return;
      }

      const confirmed =
        window.confirm(
          `Make ${dates.length} ${
            dates.length ===
            1
              ? 'day'
              : 'days'
          } available again?`
        );

      if (!confirmed) {
        return;
      }

      setSaving(
        true
      );

      setMessage(
        ''
      );

      try {
        const batch =
          writeBatch(
            db
          );

        dates.forEach(
          (
            dateKey
          ) => {
            batch.delete(
              doc(
                db,
                'availabilityCalendars',
                selected.calendarId,
                'days',
                dateKey
              )
            );

            batch.delete(
              doc(
                db,
                'availabilityAdmin',
                selected.calendarId,
                'days',
                dateKey
              )
            );
          }
        );

        await batch.commit();

        setMessage(
          `${dates.length} ${
            dates.length ===
            1
              ? 'day is'
              : 'days are'
          } available again.`
        );

        setRefreshKey(
          (
            current
          ) =>
            current + 1
        );
      } catch (error) {
        console.error(
          'Availability clear failed:',
          error
        );

        setMessage(
          'Could not clear the selected dates.'
        );
      } finally {
        setSaving(
          false
        );
      }
    };

  return (
    <div
      className={
        styles.page
      }
    >
      <div
        className={
          styles.header
        }
      >
        <span>
          Living Spring Admin
        </span>

        <h1>
          Short-Let
          Availability
        </h1>

        <p>
          Block, reserve and
          confirm dates for every
          short-let property and
          unit from one calendar.
        </p>
      </div>

      {message && (
        <div
          className={
            styles.message
          }
          role="status"
        >
          {message}
        </div>
      )}

      <div
        className={
          styles.layout
        }
      >
        <aside
          className={
            styles.controls
          }
        >
          <div
            className={
              styles.cardHeading
            }
          >
            <CalendarDays
              size={21}
              aria-hidden="true"
            />

            <div>
              <h2>
                Manage dates
              </h2>

              <p>
                Select the exact
                short-let unit
                first.
              </p>
            </div>
          </div>

          <label>
            Short-Let Unit

            <select
              value={
                selectedCalendarId
              }
              onChange={(
                event
              ) => {
                setSelectedCalendarId(
                  event.target
                    .value
                );

                setMessage(
                  ''
                );

                setNote(
                  ''
                );
              }}
              disabled={
                loading
              }
            >
              {resources.map(
                (
                  resource
                ) => (
                  <option
                    key={
                      resource.calendarId
                    }
                    value={
                      resource.calendarId
                    }
                  >
                    {
                      resource.propertyName
                    }
                    {' — '}
                    {
                      resource.unitName
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <div
            className={
              styles.selectedInfo
            }
          >
            <strong>
              {
                selected.propertyName
              }
            </strong>

            <span>
              {
                selected.unitName
              }
            </span>

            <p>
              <MapPin
                size={14}
                aria-hidden="true"
              />

              {
                selected.location
              }
            </p>
          </div>

          <div
            className={
              styles.dateGrid
            }
          >
            <label>
              Start Date

              <input
                type="date"
                value={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  setStartDate(
                    event.target
                      .value
                  )
                }
              />
            </label>

            <label>
              End Date

              <input
                type="date"
                value={
                  endDate
                }
                min={
                  startDate
                }
                onChange={(
                  event
                ) =>
                  setEndDate(
                    event.target
                      .value
                  )
                }
              />
            </label>
          </div>

          <label>
            Status

            <select
              value={
                status
              }
              onChange={(
                event
              ) =>
                setStatus(
                  event.target
                    .value as AvailabilityStatus
                )
              }
            >
              {availabilityStatuses.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item
                    }
                    value={
                      item
                    }
                  >
                    {
                      availabilityStatusLabels[
                        item
                      ]
                    }
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Private Admin Note

            <textarea
              rows={4}
              value={
                note
              }
              onChange={(
                event
              ) =>
                setNote(
                  event.target
                    .value
                )
              }
              placeholder="Optional: guest reference, maintenance reason, owner block..."
            />
          </label>

          <button
            type="button"
            className={
              styles.saveButton
            }
            disabled={
              saving
            }
            onClick={() =>
              void applyStatus()
            }
          >
            <Save
              size={17}
              aria-hidden="true"
            />

            {saving
              ? 'Updating...'
              : 'Apply Status'}
          </button>

          <button
            type="button"
            className={
              styles.clearButton
            }
            disabled={
              saving
            }
            onClick={() =>
              void clearDates()
            }
          >
            <Eraser
              size={17}
              aria-hidden="true"
            />

            Make Available
          </button>

          <div
            className={
              styles.help
            }
          >
            <Clock3
              size={17}
              aria-hidden="true"
            />

            <p>
              Private admin notes
              are stored separately
              and are never exposed
              through the public
              availability calendar.
            </p>
          </div>
        </aside>

        <div
          className={
            styles.calendarSide
          }
        >
          <AvailabilityCalendar
            key={`${selected.calendarId}-${refreshKey}`}
            calendarId={
              selected.calendarId
            }
            overallStatus={
              selected.overallStatus
            }
          />

          <div
            className={
              styles.explanation
            }
          >
            <CheckCircle2
              size={19}
              aria-hidden="true"
            />

            <div>
              <strong>
                How the statuses
                work
              </strong>

              <p>
                Reserved means a
                temporary hold.
                Booked means the
                stay is confirmed.
                Blocked means the
                owner made the date
                unavailable.
                Maintenance means
                the accommodation
                cannot be used.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}