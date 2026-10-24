'use client';

import {
  type FormEvent,
  useMemo,
  useState,
} from 'react';

import {
  useSearchParams,
} from 'next/navigation';

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
} from 'lucide-react';

import {
  buildWhatsAppHref,
  getEmailHref,
  getPhoneHref,
  inferEnquiryType,
  publicContact,
  type EnquiryType,
} from '@/lib/enquiry';

import {
  enquiryEmailConfigured,
  sendEnquiryNotification,
} from '@/lib/enquiryEmail';

import styles
  from './EnquiryForm.module.css';

type FormState = {
  enquiryType:
    EnquiryType;

  fullName: string;

  email: string;

  phone: string;

  preferredContact:
    'WhatsApp' |
    'Phone' |
    'Email';

  message: string;

  companyWebsite:
    string;
};

const enquiryTypes:
  EnquiryType[] = [
  'General Enquiry',
  'Property Enquiry',
  'Hostel Enquiry',
  'Short-Let Enquiry',
  'Inspection Request',
];

const COOLDOWN_MS =
  30_000;

const LAST_SENT_KEY =
  'living-spring-last-enquiry';

function cleanParam(
  value:
    string | null
) {
  return (
    value ||
    ''
  ).trim();
}

function validEmail(
  email: string
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );
}

export default function EnquiryForm() {
  const searchParams =
    useSearchParams();

  const propertyId =
    cleanParam(
      searchParams.get(
        'propertyId'
      )
    );

  const propertyName =
    cleanParam(
      searchParams.get(
        'property'
      )
    );

  const unitName =
    cleanParam(
      searchParams.get(
        'unit'
      )
    );

  const location =
    cleanParam(
      searchParams.get(
        'location'
      )
    );

  const service =
    cleanParam(
      searchParams.get(
        'service'
      )
    );

  const requestedType =
    cleanParam(
      searchParams.get(
        'type'
      )
    );

  const defaultType =
    inferEnquiryType(
      service,
      requestedType
    );

  const [
    form,
    setForm,
  ] =
    useState<FormState>(
      () => ({
        enquiryType:
          defaultType,

        fullName:
          '',

        email:
          '',

        phone:
          '',

        preferredContact:
          'WhatsApp',

        message:
          propertyName
            ? `Hello, I would like more information about ${propertyName}${unitName ? ` — ${unitName}` : ''}.`
            : '',

        companyWebsite:
          '',
      })
    );

  const [
    sending,
    setSending,
  ] =
    useState(false);

  const [
    success,
    setSuccess,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState('');

  const whatsappHref =
    useMemo(
      () =>
        buildWhatsAppHref({
          enquiryType:
            form.enquiryType,

          propertyId,

          propertyName,

          unitName,

          location,

          fullName:
            form.fullName,

          phone:
            form.phone,

          message:
            form.message,
        }),
      [
        form.enquiryType,
        form.fullName,
        form.message,
        form.phone,
        location,
        propertyId,
        propertyName,
        unitName,
      ]
    );

  const updateField = <
    K extends keyof FormState,
  >(
    field: K,
    value:
      FormState[K]
  ) => {
    setForm(
      (
        current
      ) => ({
        ...current,
        [field]:
          value,
      })
    );
  };

  const validate =
    () => {
      if (
        form.fullName
          .trim()
          .length <
        2
      ) {
        return 'Enter your full name.';
      }

      if (
        !validEmail(
          form.email
        )
      ) {
        return 'Enter a valid email address.';
      }

      if (
        form.phone
          .trim()
          .length <
        7
      ) {
        return 'Enter a valid phone or WhatsApp number.';
      }

      if (
        form.message
          .trim()
          .length <
        10
      ) {
        return 'Please add a little more detail to your enquiry.';
      }

      return '';
    };

  const submit =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setError(
        ''
      );

      /*
       * Honeypot.
       *
       * Real visitors never see or
       * complete this field.
       */

      if (
        form.companyWebsite
      ) {
        setSuccess(
          true
        );

        return;
      }

      const validation =
        validate();

      if (validation) {
        setError(
          validation
        );

        return;
      }

      if (
        !enquiryEmailConfigured()
      ) {
        setError(
          'Email enquiries are temporarily unavailable. Please use WhatsApp or call Living Spring.'
        );

        return;
      }

      /*
       * Prevent accidental double
       * submissions from the same tab.
       */

      const lastSent =
        Number(
          window.sessionStorage.getItem(
            LAST_SENT_KEY
          ) ||
          0
        );

      if (
        Date.now() -
          lastSent <
        COOLDOWN_MS
      ) {
        setError(
          'Your previous enquiry was just sent. Please wait a moment before sending another.'
        );

        return;
      }

      setSending(
        true
      );

      try {
        await sendEnquiryNotification({
          enquiryType:
            form.enquiryType,

          fullName:
            form.fullName.trim(),

          email:
            form.email.trim(),

          phone:
            form.phone.trim(),

          preferredContact:
            form.preferredContact,

          message:
            form.message.trim(),

          propertyId:
            propertyId ||
            undefined,

          propertyName:
            propertyName ||
            undefined,

          unitName:
            unitName ||
            undefined,

          location:
            location ||
            undefined,
        });

        window.sessionStorage.setItem(
          LAST_SENT_KEY,
          String(
            Date.now()
          )
        );

        setSuccess(
          true
        );
      } catch (submitError) {
        console.error(
          'Living Spring enquiry failed:',
          submitError
        );

        setError(
          'We could not send your enquiry right now. Please use WhatsApp or call Living Spring instead.'
        );
      } finally {
        setSending(
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
      <section
        className={
          styles.hero
        }
      >
        <div
          className="container"
        >
          <span
            className={
              styles.eyebrow
            }
          >
            Living Spring
          </span>

          <h1>
            Let&apos;s talk about
            your next{' '}
            <span>
              property or stay.
            </span>
          </h1>

          <p>
            Ask about a property,
            hostel room, short-let,
            inspection or anything
            else you need.
          </p>
        </div>
      </section>

      <section
        className={
          styles.section
        }
      >
        <div
          className={`container ${styles.grid}`}
        >
          <div
            className={
              styles.formSide
            }
          >
            {propertyName && (
              <div
                className={
                  styles.contextCard
                }
              >
                <Building2
                  size={21}
                  aria-hidden="true"
                />

                <div>
                  <span>
                    Enquiring about
                  </span>

                  <strong>
                    {
                      propertyName
                    }
                  </strong>

                  {unitName && (
                    <small>
                      {
                        unitName
                      }
                    </small>
                  )}

                  {location && (
                    <p>
                      <MapPin
                        size={13}
                        aria-hidden="true"
                      />

                      {
                        location
                      }
                    </p>
                  )}
                </div>
              </div>
            )}

            {success ? (
              <div
                className={
                  styles.success
                }
              >
                <span>
                  <CheckCircle2
                    size={28}
                    aria-hidden="true"
                  />
                </span>

                <h2>
                  Enquiry sent.
                </h2>

                <p>
                  Living Spring has
                  received your
                  message and will
                  follow up using
                  your contact
                  details.
                </p>

                <a
                  href={
                    whatsappHref
                  }
                  target="_blank"
                  rel="noreferrer"
                  className={
                    styles.primaryButton
                  }
                >
                  <MessageCircle
                    size={18}
                    aria-hidden="true"
                  />

                  Continue on
                  WhatsApp

                  <ExternalLink
                    size={15}
                    aria-hidden="true"
                  />
                </a>

                <button
                  type="button"
                  className={
                    styles.secondaryButton
                  }
                  onClick={() => {
                    setSuccess(
                      false
                    );

                    setForm(
                      (
                        current
                      ) => ({
                        ...current,

                        message:
                          '',
                      })
                    );
                  }}
                >
                  Send Another
                  Enquiry
                </button>
              </div>
            ) : (
              <form
                className={
                  styles.form
                }
                onSubmit={
                  submit
                }
              >
                <div
                  className={
                    styles.formHeading
                  }
                >
                  <span>
                    Send an enquiry
                  </span>

                  <h2>
                    Tell us what you
                    need.
                  </h2>

                  <p>
                    Your enquiry is
                    sent directly to
                    Living Spring.
                  </p>
                </div>

                {error && (
                  <div
                    className={
                      styles.error
                    }
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <div
                  className={
                    styles.fields
                  }
                >
                  <label>
                    Enquiry Type

                    <select
                      value={
                        form.enquiryType
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'enquiryType',
                          event.target
                            .value as EnquiryType
                        )
                      }
                    >
                      {enquiryTypes.map(
                        (
                          type
                        ) => (
                          <option
                            key={
                              type
                            }
                            value={
                              type
                            }
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    Full Name *

                    <input
                      type="text"
                      autoComplete="name"
                      value={
                        form.fullName
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'fullName',
                          event.target
                            .value
                        )
                      }
                      placeholder="Your full name"
                      required
                    />
                  </label>

                  <label>
                    Email Address *

                    <input
                      type="email"
                      autoComplete="email"
                      value={
                        form.email
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'email',
                          event.target
                            .value
                        )
                      }
                      placeholder="you@example.com"
                      required
                    />
                  </label>

                  <label>
                    Phone / WhatsApp *

                    <input
                      type="tel"
                      autoComplete="tel"
                      value={
                        form.phone
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'phone',
                          event.target
                            .value
                        )
                      }
                      placeholder="+234..."
                      required
                    />
                  </label>

                  <label>
                    Preferred Contact

                    <select
                      value={
                        form.preferredContact
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'preferredContact',
                          event.target
                            .value as FormState[
                            'preferredContact'
                          ]
                        )
                      }
                    >
                      <option value="WhatsApp">
                        WhatsApp
                      </option>

                      <option value="Phone">
                        Phone
                      </option>

                      <option value="Email">
                        Email
                      </option>
                    </select>
                  </label>

                  <label
                    className={
                      styles.full
                    }
                  >
                    Message *

                    <textarea
                      rows={6}
                      value={
                        form.message
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'message',
                          event.target
                            .value
                        )
                      }
                      placeholder="Tell us what you would like to know..."
                      required
                    />
                  </label>

                  <div
                    className={
                      styles.honeypot
                    }
                    aria-hidden="true"
                  >
                    <label>
                      Company Website

                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={
                          form.companyWebsite
                        }
                        onChange={(
                          event
                        ) =>
                          updateField(
                            'companyWebsite',
                            event.target
                              .value
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                <div
                  className={
                    styles.formFooter
                  }
                >
                  <p>
                    <ShieldCheck
                      size={15}
                      aria-hidden="true"
                    />

                    Your message is
                    used only to
                    respond to this
                    enquiry.
                  </p>

                  <button
                    type="submit"
                    className={
                      styles.primaryButton
                    }
                    disabled={
                      sending
                    }
                  >
                    <Send
                      size={17}
                      aria-hidden="true"
                    />

                    {sending
                      ? 'Sending...'
                      : 'Send Enquiry'}

                    {!sending && (
                      <ArrowRight
                        size={15}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          <aside
            className={
              styles.contactSide
            }
          >
            <span
              className={
                styles.sideEyebrow
              }
            >
              Direct Contact
            </span>

            <h2>
              Prefer to speak
              directly?
            </h2>

            <p
              className={
                styles.sideIntro
              }
            >
              Reach Living Spring
              by WhatsApp, phone or
              email.
            </p>

            <a
              href={
                whatsappHref
              }
              target="_blank"
              rel="noreferrer"
              className={
                styles.contactCard
              }
            >
              <span>
                <MessageCircle
                  size={21}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  WhatsApp
                </strong>

                <small>
                  Start a
                  property-specific
                  conversation
                </small>
              </div>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </a>

            <a
              href={
                getPhoneHref()
              }
              className={
                styles.contactCard
              }
            >
              <span>
                <Phone
                  size={21}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  Call
                </strong>

                <small>
                  {
                    publicContact
                      .phone
                  }
                </small>
              </div>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </a>

            <a
              href={
                getEmailHref()
              }
              className={
                styles.contactCard
              }
            >
              <span>
                <Mail
                  size={21}
                  aria-hidden="true"
                />
              </span>

              <div>
                <strong>
                  Email
                </strong>

                <small>
                  {
                    publicContact
                      .email
                  }
                </small>
              </div>

              <ArrowRight
                size={16}
                aria-hidden="true"
              />
            </a>

            <div
              className={
                styles.responseNote
              }
            >
              <Clock3
                size={18}
                aria-hidden="true"
              />

              <div>
                <strong>
                  Booking requests
                </strong>

                <p>
                  Short-let booking
                  requests are only
                  confirmed after
                  Living Spring
                  verifies
                  availability.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}