'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ChevronLeft,
  ChevronRight,
  Clock3,
  Wrench,
} from 'lucide-react';

import {
  collection,
  documentId,
  endAt,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
} from 'firebase/firestore';

import {
  db,
} from '@/lib/firebase';

import {
  availabilityStatusLabels,
  buildMonthGrid,
  formatMonthTitle,
  getLagosTodayKey,
  getMonthBounds,
  type AvailabilityDay,
  type AvailabilityStatus,
} from '@/lib/availability';

import styles
  from './AvailabilityCalendar.module.css';

type AvailabilityCalendarProps = {
  calendarId: string;

  overallStatus?: string;

  compact?: boolean;
};

function normalizeStatus(
  value: unknown
):
  AvailabilityStatus | null {
  if (
    value ===
      'reserved' ||
    value ===
      'booked' ||
    value ===
      'blocked' ||
    value ===
      'maintenance'
  ) {
    return value;
  }

  return null;
}

export default function AvailabilityCalendar({
  calendarId,
  overallStatus,
  compact = false,
}: AvailabilityCalendarProps) {
  const now =
    new Date();

  const [
    viewMonth,
    setViewMonth,
  ] =
    useState(
      new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          1
        )
      )
    );

  const [
    days,
    setDays,
  ] =
    useState<
      Record<
        string,
        AvailabilityDay
      >
    >({});

  const [
    loading,
    setLoading,
  ] =
    useState(
      Boolean(
        calendarId
      )
    );

  const [
    loadError,
    setLoadError,
  ] =
    useState('');

  const today =
    useMemo(
      () =>
        getLagosTodayKey(),
      []
    );

  useEffect(() => {
    if (!calendarId) {
      return;
    }

    let active =
      true;

    const bounds =
      getMonthBounds(
        viewMonth
      );

    const daysRef =
      collection(
        db,
        'availabilityCalendars',
        calendarId,
        'days'
      );

    const monthQuery =
      query(
        daysRef,

        orderBy(
          documentId()
        ),

        startAt(
          bounds.start
        ),

        endAt(
          bounds.end
        ),

        limit(62)
      );

    void getDocs(
      monthQuery
    )
      .then(
        (
          snapshot
        ) => {
          if (!active) {
            return;
          }

          const next:
            Record<
              string,
              AvailabilityDay
            > = {};

          snapshot.docs.forEach(
            (
              document
            ) => {
              const data =
                document.data();

              const status =
                normalizeStatus(
                  data.status
                );

              if (!status) {
                return;
              }

              next[
                document.id
              ] = {
                date:
                  document.id,

                status,

                note: '',
              };
            }
          );

          setDays(
            next
          );

          setLoadError(
            ''
          );
        }
      )
      .catch(
        (
          error
        ) => {
          console.error(
            'Failed to load availability:',
            error
          );

          if (!active) {
            return;
          }

          setDays(
            {}
          );

          setLoadError(
            'Availability could not be loaded right now.'
          );
        }
      )
      .finally(
        () => {
          if (active) {
            setLoading(
              false
            );
          }
        }
      );

    return () => {
      active =
        false;
    };
  }, [
    calendarId,
    viewMonth,
  ]);

  const grid =
    useMemo(
      () =>
        buildMonthGrid(
          viewMonth
        ),
      [
        viewMonth,
      ]
    );

  const moveMonth =
    (
      amount: number
    ) => {
      setLoading(
        true
      );

      setViewMonth(
        (
          current
        ) =>
          new Date(
            Date.UTC(
              current
                .getUTCFullYear(),

              current
                .getUTCMonth() +
                amount,

              1
            )
          )
      );
    };

  const unavailableOverall =
    Boolean(
      overallStatus &&
      overallStatus !==
        'available'
    );

  if (!calendarId) {
    return (
      <section
        className={`${styles.wrapper} ${
          compact
            ? styles.compact
            : ''
        }`}
      >
        <div
          className={
            styles.header
          }
        >
          <div>
            <span
              className={
                styles.eyebrow
              }
            >
              Availability
            </span>

            <h3>
              Calendar not
              configured.
            </h3>

            <p>
              Contact Living Spring
              for the latest
              availability.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`${styles.wrapper} ${
        compact
          ? styles.compact
          : ''
      }`}
    >
      <div
        className={
          styles.header
        }
      >
        <div>
          <span
            className={
              styles.eyebrow
            }
          >
            Availability
          </span>

          <h3>
            Check available
            dates.
          </h3>

          <p>
            Dates follow the
            Living Spring property
            timezone.
          </p>
        </div>

        <div
          className={
            styles.monthControls
          }
        >
          <button
            type="button"
            onClick={() =>
              moveMonth(-1)
            }
            aria-label="Previous month"
            disabled={
              loading
            }
          >
            <ChevronLeft
              size={18}
              aria-hidden="true"
            />
          </button>

          <strong>
            {formatMonthTitle(
              viewMonth
            )}
          </strong>

          <button
            type="button"
            onClick={() =>
              moveMonth(1)
            }
            aria-label="Next month"
            disabled={
              loading
            }
          >
            <ChevronRight
              size={18}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      {unavailableOverall && (
        <div
          className={
            styles.statusNotice
          }
        >
          <Clock3
            size={18}
            aria-hidden="true"
          />

          <p>
            This unit is currently
            marked{' '}

            <strong>
              {
                overallStatus
              }
            </strong>
            . Contact Living Spring
            before making plans.
          </p>
        </div>
      )}

      {loadError && (
        <div
          className={
            styles.statusNotice
          }
          role="status"
        >
          <Clock3
            size={18}
            aria-hidden="true"
          />

          <p>
            {loadError}
          </p>
        </div>
      )}

      <div
        className={
          styles.legend
        }
      >
        <span>
          <i
            className={
              styles.availableDot
            }
          />

          Available
        </span>

        <span>
          <i
            className={
              styles.reservedDot
            }
          />

          Reserved
        </span>

        <span>
          <i
            className={
              styles.bookedDot
            }
          />

          Booked
        </span>

        <span>
          <i
            className={
              styles.blockedDot
            }
          />

          Blocked
        </span>

        <span>
          <Wrench
            size={13}
            aria-hidden="true"
          />

          Maintenance
        </span>
      </div>

      <div
        className={
          styles.weekdays
        }
      >
        {[
          'Sun',
          'Mon',
          'Tue',
          'Wed',
          'Thu',
          'Fri',
          'Sat',
        ].map(
          (
            day
          ) => (
            <span
              key={
                day
              }
            >
              {day}
            </span>
          )
        )}
      </div>

      <div
        className={
          styles.calendar
        }
        aria-busy={
          loading
        }
      >
        {grid.map(
          (
            item
          ) => {
            const availability =
              days[
                item.key
              ];

            const isPast =
              item.key <
              today;

            const status =
              availability
                ?.status;

            const statusLabel =
              status
                ? availabilityStatusLabels[
                    status
                  ]
                : 'Available';

            const classNames = [
              styles.day,

              !item.currentMonth
                ? styles.outside
                : '',

              isPast
                ? styles.past
                : '',

              status
                ? styles[
                    status
                  ]
                : styles.available,
            ]
              .filter(
                Boolean
              )
              .join(' ');

            return (
              <div
                key={
                  item.key
                }
                className={
                  classNames
                }
                title={
                  statusLabel
                }
              >
                <span
                  className={
                    styles.dayNumber
                  }
                >
                  {
                    item.date
                      .getUTCDate()
                  }
                </span>

                {item.currentMonth &&
                  !isPast && (
                  <small>
                    {
                      statusLabel
                    }
                  </small>
                )}
              </div>
            );
          }
        )}
      </div>

      {loading && (
        <div
          className={
            styles.loading
          }
          role="status"
        >
          Updating calendar...
        </div>
      )}

      <p
        className={
          styles.disclaimer
        }
      >
        Calendar availability is
        provided as a guide.
        A reservation is confirmed
        only after Living Spring
        confirms the booking.
      </p>
    </section>
  );
}