'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Link
  from 'next/link';

import {
  useSearchParams,
} from 'next/navigation';

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  IdCard,
  LockKeyhole,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  db,
} from '@/lib/firebase';

import {
  isPublicProperty,
  normalizeProperty,
  type PropertyRecord,
  type PropertyUnit,
} from '@/lib/property';

import {
  bookingConfig,
  bookingRequirements,
  getExternalBookingForm,
  type BookingContext,
} from '@/lib/booking';

import {
  buildAvailabilityCalendarId,
} from '@/lib/availability';

import AvailabilityCalendar
  from '@/components/availability/AvailabilityCalendar';

import styles
  from './BookingRequestClient.module.css';

function firstParam(
  value:
    string | null
) {
  return (
    value ||
    ''
  ).trim();
}

function findUnit(
  property:
    PropertyRecord,

  unitId:
    string
):
  PropertyUnit | null {
  if (
    !property.units.length
  ) {
    return null;
  }

  if (unitId) {
    const requested =
      property.units.find(
        (
          unit
        ) =>
          unit.id ===
          unitId
      );

    if (requested) {
      return requested;
    }
  }

  const available =
    property.units.find(
      (
        unit
      ) =>
        unit.status ===
        'available'
    );

  return (
    available ||
    property.units[0] ||
    null
  );
}

export default function BookingRequestClient() {
  const searchParams =
    useSearchParams();

  const propertyId =
    firstParam(
      searchParams.get(
        'propertyId'
      )
    );

  const requestedUnitId =
    firstParam(
      searchParams.get(
        'unitId'
      )
    );

  const queryProperty =
    firstParam(
      searchParams.get(
        'property'
      )
    );

  const queryUnit =
    firstParam(
      searchParams.get(
        'unit'
      )
    );

  const queryLocation =
    firstParam(
      searchParams.get(
        'location'
      )
    );

  const queryLocationSlug =
    firstParam(
      searchParams.get(
        'locationSlug'
      )
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      Boolean(
        propertyId
      )
    );

  const [
    error,
    setError,
  ] =
    useState('');

  const [
    property,
    setProperty,
  ] =
    useState<
      PropertyRecord | null
    >(null);

  const [
    selectedUnit,
    setSelectedUnit,
  ] =
    useState<
      PropertyUnit | null
    >(null);

  useEffect(() => {
    if (
      !propertyId
    ) {
      return;
    }

    const id: string =
      propertyId;

    let active =
      true;

    async function loadProperty() {
      try {
        const propertyRef =
          doc(
            db,
            'properties',
            id
          );

        const snapshot =
          await getDoc(
            propertyRef
          );

        if (
          !snapshot.exists()
        ) {
          if (active) {
            setError(
              'This short-let listing could not be found.'
            );
          }

          return;
        }

        const normalized =
          normalizeProperty(
            snapshot.id,
            snapshot.data()
          );

        if (
          !isPublicProperty(
            normalized
          )
        ) {
          if (active) {
            setError(
              'This listing is not currently available for public booking.'
            );
          }

          return;
        }

        if (
          normalized.serviceType !==
          'shortlet'
        ) {
          if (active) {
            setError(
              'This listing is not configured as a short-let.'
            );
          }

          return;
        }

        const unit =
          findUnit(
            normalized,
            requestedUnitId
          );

        if (active) {
          setProperty(
            normalized
          );

          setSelectedUnit(
            unit
          );
        }
      } catch (loadError) {
        console.error(
          'Booking property load failed:',
          loadError
        );

        if (active) {
          setError(
            'Living Spring could not load this listing. Please try again or make an enquiry.'
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

    void loadProperty();

    return () => {
      active =
        false;
    };
  }, [
    propertyId,
    requestedUnitId,
  ]);

  const bookingContext =
    useMemo<
      BookingContext
    >(() => {
      if (property) {
        return {
          propertyId:
            property.id,

          unitId:
            selectedUnit
              ?.id,

          propertyName:
            property.title ||
            'Living Spring Short-Let',

          unitName:
            selectedUnit
              ?.unitType ||
            '',

          locationSlug:
            property.locationSlug,

          locationLabel:
            property.address ||
            property.location ||
            bookingConfig
              .defaultIsaraLocation,
        };
      }

      return {
        propertyName:
          queryProperty ||
          'Living Spring Short-Let',

        unitName:
          queryUnit,

        locationSlug:
          queryLocationSlug,

        locationLabel:
          queryLocation ||
          (
            queryLocationSlug ===
            'isara-remo'
              ? bookingConfig
                  .defaultIsaraLocation
              : ''
          ),
      };
    }, [
      property,
      queryLocation,
      queryLocationSlug,
      queryProperty,
      queryUnit,
      selectedUnit,
    ]);

  const calendarId =
    useMemo(
      () =>
        buildAvailabilityCalendarId(
          {
            propertyId:
              bookingContext
                .propertyId,

            unitId:
              bookingContext
                .unitId,

            propertyName:
              bookingContext
                .propertyName,

            unitName:
              bookingContext
                .unitName,

            locationSlug:
              bookingContext
                .locationSlug,
          }
        ),
      [
        bookingContext,
      ]
    );

  const externalForm =
    getExternalBookingForm(
      bookingContext
    );

  const enquiryHref =
    `/contact?property=${encodeURIComponent(
      bookingContext
        .propertyName
    )}&unit=${encodeURIComponent(
      bookingContext
        .unitName ||
      'Short-Let'
    )}`;

  const unitUnavailable =
    selectedUnit &&
    selectedUnit.status !==
      'available';

  if (loading) {
    return (
      <section
        className={
          styles.loading
        }
      >
        <div
          className="loading-spinner"
        />

        <p>
          Loading booking
          details...
        </p>
      </section>
    );
  }

  return (
    <>
      <section
        className={
          styles.hero
        }
      >
        <div
          className={
            styles.heroGlow
          }
          aria-hidden="true"
        />

        <div className="container">
          <div
            className={
              styles.heroGrid
            }
          >
            <div
              className={
                styles.heroContent
              }
            >
              <span
                className={
                  styles.eyebrow
                }
              >
                <CalendarDays
                  size={16}
                  aria-hidden="true"
                />

                Short-Let
                Booking Request
              </span>

              <h1>
                Request your{' '}

                <span>
                  stay.
                </span>
              </h1>

              <p>
                Check the current
                availability, review
                the accommodation
                details and continue
                through the Living
                Spring booking
                request process.
              </p>

              <div
                className={
                  styles.heroTrust
                }
              >
                <span>
                  <ShieldCheck
                    size={17}
                    aria-hidden="true"
                  />

                  Availability
                  confirmed first
                </span>

                <span>
                  <LockKeyhole
                    size={17}
                    aria-hidden="true"
                  />

                  No ID stored in
                  Living Spring
                  Firebase
                </span>

                <span>
                  <UserCheck
                    size={17}
                    aria-hidden="true"
                  />

                  Direct follow-up
                </span>
              </div>
            </div>

            <div
              className={
                styles.summaryCard
              }
            >
              <span>
                Booking for
              </span>

              <h2>
                {
                  bookingContext
                    .propertyName
                }
              </h2>

              <div
                className={
                  styles.summaryRows
                }
              >
                {bookingContext
                  .unitName && (
                  <div>
                    <Building2
                      size={18}
                      aria-hidden="true"
                    />

                    <span>
                      <small>
                        Unit
                      </small>

                      <strong>
                        {
                          bookingContext
                            .unitName
                        }
                      </strong>
                    </span>
                  </div>
                )}

                {bookingContext
                  .locationLabel && (
                  <div>
                    <MapPin
                      size={18}
                      aria-hidden="true"
                    />

                    <span>
                      <small>
                        Location
                      </small>

                      <strong>
                        {
                          bookingContext
                            .locationLabel
                        }
                      </strong>
                    </span>
                  </div>
                )}

                <div>
                  <Clock3
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    <small>
                      Check-in
                    </small>

                    <strong>
                      {
                        bookingConfig
                          .checkInDisplay
                      }
                    </strong>
                  </span>
                </div>

                <div>
                  <Clock3
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    <small>
                      Check-out
                    </small>

                    <strong>
                      {
                        bookingConfig
                          .checkOutDisplay
                      }
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={
          styles.bookingSection
        }
      >
        <div className="container">
          <div
            className={
              styles.bookingGrid
            }
          >
            <div
              className={
                styles.mainColumn
              }
            >
              {error && (
                <div
                  className={
                    styles.errorBox
                  }
                >
                  <strong>
                    Booking details
                    unavailable
                  </strong>

                  <p>
                    {error}
                  </p>

                  <Link
                    href="/contact"
                    className={
                      styles.textLink
                    }
                  >
                    Contact Living
                    Spring
                  </Link>
                </div>
              )}

              <div
                className={
                  styles.sectionHeading
                }
              >
                <span>
                  Availability
                </span>

                <h2>
                  Check your dates
                  first.
                </h2>

                <p>
                  Green dates are
                  currently open.
                  Reserved, booked,
                  blocked and
                  maintenance dates
                  cannot be treated
                  as confirmed
                  availability.
                </p>
              </div>

              {calendarId && (
                <AvailabilityCalendar
                  calendarId={
                    calendarId
                  }
                  overallStatus={
                    selectedUnit
                      ?.status
                  }
                />
              )}

              <div
                className={
                  styles.sectionHeading
                }
                style={{
                  marginTop:
                    '3rem',
                }}
              >
                <span>
                  How it works
                </span>

                <h2>
                  A simple booking
                  request.
                </h2>

                <p>
                  Submitting a
                  booking request
                  does not
                  immediately reserve
                  the property.
                  Living Spring first
                  confirms the dates
                  and accommodation.
                </p>
              </div>

              <div
                className={
                  styles.steps
                }
              >
                <article>
                  <span>
                    01
                  </span>

                  <CalendarDays
                    size={23}
                    aria-hidden="true"
                  />

                  <h3>
                    Check the
                    calendar
                  </h3>

                  <p>
                    Review the dates
                    currently shown
                    as available.
                  </p>
                </article>

                <article>
                  <span>
                    02
                  </span>

                  <Users
                    size={23}
                    aria-hidden="true"
                  />

                  <h3>
                    Guest details
                  </h3>

                  <p>
                    Tell Living Spring
                    who will be staying
                    and how to contact
                    you.
                  </p>
                </article>

                <article>
                  <span>
                    03
                  </span>

                  <IdCard
                    size={23}
                    aria-hidden="true"
                  />

                  <h3>
                    Identification
                  </h3>

                  <p>
                    For the current
                    Isara-Remo
                    short-let, valid
                    ID is uploaded
                    through the
                    Google booking
                    form.
                  </p>
                </article>

                <article>
                  <span>
                    04
                  </span>

                  <CheckCircle2
                    size={23}
                    aria-hidden="true"
                  />

                  <h3>
                    Confirmation
                  </h3>

                  <p>
                    Living Spring
                    confirms
                    availability,
                    price and the
                    next step.
                  </p>
                </article>
              </div>

              <div
                className={
                  styles.securityNotice
                }
              >
                <LockKeyhole
                  size={22}
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Your
                    identification
                    is not uploaded
                    into this
                    website.
                  </strong>

                  <p>
                    The current
                    Isara-Remo
                    short-let uses a
                    Google-hosted
                    form for guest
                    identification.
                  </p>
                </div>
              </div>
            </div>

            <aside
              className={
                styles.actionCard
              }
            >
              {unitUnavailable ? (
                <>
                  <span
                    className={
                      styles.actionEyebrow
                    }
                  >
                    Currently
                    Unavailable
                  </span>

                  <h2>
                    Ask Living Spring
                    about this unit.
                  </h2>

                  <p>
                    This unit is
                    currently marked
                    {
                      ` ${selectedUnit.status}`
                    }.
                    Contact Living
                    Spring for the
                    latest information
                    or another
                    available unit.
                  </p>

                  <Link
                    href={
                      enquiryHref
                    }
                    className={
                      styles.bookingButton
                    }
                  >
                    <MessageCircle
                      size={18}
                      aria-hidden="true"
                    />

                    Make an Enquiry

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>
                </>
              ) : externalForm ? (
                <>
                  <span
                    className={
                      styles.actionEyebrow
                    }
                  >
                    Isara-Remo
                    Short-Let
                  </span>

                  <h2>
                    Continue your
                    booking request.
                  </h2>

                  <p>
                    Have the following
                    information ready.
                  </p>

                  <div
                    className={
                      styles.requirements
                    }
                  >
                    {bookingRequirements.map(
                      (
                        requirement
                      ) => (
                        <div
                          key={
                            requirement
                          }
                        >
                          <CheckCircle2
                            size={16}
                            aria-hidden="true"
                          />

                          <span>
                            {
                              requirement
                            }
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <a
                    href={
                      externalForm.url
                    }
                    target="_blank"
                    rel="noreferrer"
                    className={
                      styles.bookingButton
                    }
                  >
                    <FileCheck2
                      size={18}
                      aria-hidden="true"
                    />

                    Open Google
                    Booking Form

                    <ExternalLink
                      size={16}
                      aria-hidden="true"
                    />
                  </a>

                  <p
                    className={
                      styles.googleNote
                    }
                  >
                    Because the form
                    accepts an ID
                    upload, Google may
                    require sign-in
                    before submission.
                  </p>
                </>
              ) : (
                <>
                  <span
                    className={
                      styles.actionEyebrow
                    }
                  >
                    Booking Enquiry
                  </span>

                  <h2>
                    Ask about this
                    short-let.
                  </h2>

                  <p>
                    This listing does
                    not currently use
                    the Isara-Remo
                    Google form.
                    Contact Living
                    Spring for the
                    next step.
                  </p>

                  <Link
                    href={
                      enquiryHref
                    }
                    className={
                      styles.bookingButton
                    }
                  >
                    <MessageCircle
                      size={18}
                      aria-hidden="true"
                    />

                    Make an Enquiry

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>
                </>
              )}

              <div
                className={
                  styles.confirmationBox
                }
              >
                <strong>
                  Important
                </strong>

                <p>
                  A request does not
                  automatically
                  reserve the
                  accommodation.
                  Living Spring must
                  confirm it.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section
        className={
          styles.bottomSection
        }
      >
        <div className="container">
          <div
            className={
              styles.bottomBox
            }
          >
            <div>
              <span>
                Have a question?
              </span>

              <h2>
                Speak with Living
                Spring first.
              </h2>

              <p>
                Ask about dates,
                pricing, location
                or accommodation
                before submitting
                your request.
              </p>
            </div>

            <Link
              href={
                enquiryHref
              }
              className="btn btn-gold"
            >
              Make an Enquiry

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}