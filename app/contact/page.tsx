'use client';

import {
  Suspense,
  type FormEvent,
  useMemo,
  useState,
} from 'react';

import Link from 'next/link';

import {
  useSearchParams,
} from 'next/navigation';

import emailjs
  from '@emailjs/browser';

import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  User,
} from 'lucide-react';

import {
  FaWhatsapp,
} from 'react-icons/fa';

import Navbar
  from '@/components/Navbar';

import Footer
  from '@/components/Footer';

import styles
  from './page.module.css';

type FeedbackType =
  | 'success'
  | 'error'
  | '';

type FormData = {
  name: string;
  phone: string;
  email: string;
  property: string;
  unit: string;
  price: string;
  preferredDate: string;
  message: string;
  companyWebsite: string;
};

type EnquiryType =
  | 'General Enquiry'
  | 'Property Enquiry'
  | 'Hostel Enquiry'
  | 'Short-Let Enquiry'
  | 'Inspection Request';

const LAST_SENT_KEY =
  'living-spring-last-enquiry';

const COOLDOWN_MS =
  30_000;

function cleanParam(
  value: string | null
) {
  return (
    value ||
    ''
  ).trim();
}

function validOptionalEmail(
  value: string
) {
  const email =
    value.trim();

  if (!email) {
    return true;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

function ContactPageContent() {
  const searchParams =
    useSearchParams();

  const queryProperty =
    cleanParam(
      searchParams.get(
        'property'
      )
    );

  const propertyId =
    cleanParam(
      searchParams.get(
        'propertyId'
      )
    );

  const queryUnit =
    cleanParam(
      searchParams.get(
        'unit'
      )
    );

  const queryPrice =
    cleanParam(
      searchParams.get(
        'price'
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
    ).toLowerCase();

  const requestedType =
    cleanParam(
      searchParams.get(
        'type'
      )
    ).toLowerCase();

  const [
    formData,
    setFormData,
  ] =
    useState<FormData>(
      () => ({
        name: '',
        phone: '',
        email: '',

        property:
          queryProperty,

        unit:
          queryUnit,

        price:
          queryPrice,

        preferredDate:
          '',

        message:
          '',

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
    feedback,
    setFeedback,
  ] =
    useState('');

  const [
    feedbackType,
    setFeedbackType,
  ] =
    useState<FeedbackType>(
      ''
    );

  const whatsappNumber =
    (
      process.env
        .NEXT_PUBLIC_WHATSAPP_NUMBER ||
      ''
    ).trim();

  const contactEmail =
    (
      process.env
        .NEXT_PUBLIC_CONTACT_EMAIL ||
      'bolsimfarmss@gmail.com'
    ).trim();

  const contactPhone =
    (
      process.env
        .NEXT_PUBLIC_CONTACT_PHONE ||
      ''
    ).trim();

  const emailServiceId =
    (
      process.env
        .NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
      ''
    ).trim();

  const emailTemplateId =
    (
      process.env
        .NEXT_PUBLIC_EMAILJS_ENQUIRY_TEMPLATE_ID ||
      process.env
        .NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ||
      ''
    ).trim();

  const emailPublicKey =
    (
      process.env
        .NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
      ''
    ).trim();

  const cleanWhatsappNumber =
    useMemo(
      () =>
        whatsappNumber.replace(
          /\D/g,
          ''
        ),
      [
        whatsappNumber,
      ]
    );

  const enquiryType =
    useMemo<EnquiryType>(
      () => {
        if (
          requestedType ===
            'inspection' ||
          requestedType ===
            'inspection-request'
        ) {
          return 'Inspection Request';
        }

        if (
          service ===
          'shortlet'
        ) {
          return 'Short-Let Enquiry';
        }

        if (
          service ===
          'hostel'
        ) {
          return 'Hostel Enquiry';
        }

        if (
          service ===
            'property' ||
          formData.property
        ) {
          return 'Property Enquiry';
        }

        return 'General Enquiry';
      },
      [
        requestedType,
        service,
        formData.property,
      ]
    );

  const updateField =
    (
      field:
        keyof FormData,

      value:
        string
    ) => {
      setFormData(
        (
          current
        ) => ({
          ...current,

          [field]:
            value,
        })
      );
    };

  const buildMessage =
    () => {
      const lines = [
        'Hello Living Spring,',
        '',
        `My name is ${
          formData.name ||
          'a customer'
        }.`,
        '',
        `I would like to make a ${enquiryType.toLowerCase()}.`,
        '',
        `Property: ${
          formData.property ||
          'Not specified'
        }`,
        `Unit/Type: ${
          formData.unit ||
          'Not specified'
        }`,
        `Listed price: ${
          formData.price ||
          'Not specified'
        }`,
        `Preferred inspection date: ${
          formData.preferredDate ||
          'Not specified'
        }`,
      ];

      if (location) {
        lines.push(
          `Location: ${location}`
        );
      }

      lines.push(
        '',
        `Phone: ${
          formData.phone ||
          'Not provided'
        }`,
        `Email: ${
          formData.email ||
          'Not provided'
        }`,
        '',
        'Message:',
        formData.message ||
          'I would like to request more information.'
      );

      return lines.join(
        '\n'
      );
    };

  const sendWhatsApp =
    () => {
      setFeedback('');
      setFeedbackType('');

      if (
        !cleanWhatsappNumber
      ) {
        setFeedback(
          'WhatsApp is not configured yet. Please use email or call Living Spring.'
        );

        setFeedbackType(
          'error'
        );

        return;
      }

      const message =
        encodeURIComponent(
          buildMessage()
        );

      window.open(
        `https://wa.me/${cleanWhatsappNumber}?text=${message}`,
        '_blank',
        'noopener,noreferrer'
      );
    };

  const sendEmail =
    async (
      event:
        FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      setFeedback('');
      setFeedbackType('');

      /*
       * Spam honeypot.
       * Normal users never see this field.
       */
      if (
        formData.companyWebsite
      ) {
        setFeedback(
          'Your inquiry has been sent successfully.'
        );

        setFeedbackType(
          'success'
        );

        return;
      }

      if (
        formData.name
          .trim()
          .length <
        2
      ) {
        setFeedback(
          'Please enter your full name.'
        );

        setFeedbackType(
          'error'
        );

        return;
      }

      if (
        formData.phone
          .trim()
          .length <
        7
      ) {
        setFeedback(
          'Please enter a valid phone number.'
        );

        setFeedbackType(
          'error'
        );

        return;
      }

      if (
        !validOptionalEmail(
          formData.email
        )
      ) {
        setFeedback(
          'Please enter a valid email address.'
        );

        setFeedbackType(
          'error'
        );

        return;
      }

      if (
        !emailServiceId ||
        !emailTemplateId ||
        !emailPublicKey
      ) {
        setFeedback(
          'Email enquiries are temporarily unavailable. Please use WhatsApp or call Living Spring directly.'
        );

        setFeedbackType(
          'error'
        );

        return;
      }

      const lastSent =
        Number(
          window
            .sessionStorage
            .getItem(
              LAST_SENT_KEY
            ) ||
          0
        );

      if (
        Date.now() -
          lastSent <
        COOLDOWN_MS
      ) {
        setFeedback(
          'Your previous inquiry was just sent. Please wait a moment before sending another.'
        );

        setFeedbackType(
          'error'
        );

        return;
      }

      setSending(true);

      try {
        await emailjs.send(
          emailServiceId,

          emailTemplateId,

          {
            /*
             * Existing template variables.
             * These preserve compatibility with
             * your former EmailJS template.
             */

            to_email:
              contactEmail,

            name:
              formData.name.trim(),

            phone:
              formData.phone.trim(),

            email:
              formData.email.trim(),

            property:
              formData.property.trim(),

            unit:
              formData.unit.trim(),

            price:
              formData.price.trim(),

            preferred_date:
              formData.preferredDate,

            message:
              formData.message.trim(),

            full_message:
              buildMessage(),

            /*
             * Batch 8 notification variables.
             */

            enquiry_type:
              enquiryType,

            full_name:
              formData.name.trim(),

            from_name:
              formData.name.trim(),

            reply_to:
              formData.email.trim(),

            property_id:
              propertyId ||
              '—',

            property_name:
              formData.property.trim() ||
              'General enquiry',

            unit_name:
              formData.unit.trim() ||
              '—',

            location:
              location ||
              '—',

            submitted_at:
              new Intl.DateTimeFormat(
                'en-GB',
                {
                  timeZone:
                    'Africa/Lagos',

                  dateStyle:
                    'medium',

                  timeStyle:
                    'short',
                }
              ).format(
                new Date()
              ),

            source:
              'Living Spring Website',
          },

          emailPublicKey
        );

        window
          .sessionStorage
          .setItem(
            LAST_SENT_KEY,
            String(
              Date.now()
            )
          );

        setFeedback(
          'Your inquiry has been sent successfully. Living Spring will get back to you shortly.'
        );

        setFeedbackType(
          'success'
        );

        /*
         * Clear visitor details after success,
         * but keep listing context.
         */
        setFormData(
          (
            current
          ) => ({
            ...current,

            name: '',
            phone: '',
            email: '',

            preferredDate:
              '',

            message: '',

            companyWebsite:
              '',
          })
        );
      } catch (error) {
        console.error(
          'Living Spring inquiry error:',
          error
        );

        setFeedback(
          'Could not send your inquiry. Please try WhatsApp or call Living Spring directly.'
        );

        setFeedbackType(
          'error'
        );
      } finally {
        setSending(false);
      }
    };

  return (
    <>
      <Navbar />

      <main
        className={
          styles.page
        }
      >
        {/* =====================================
            FORMER HERO DESIGN
        ====================================== */}

        <section
          className={
            styles.hero
          }
        >
          <div className="container">
            <span
              className={
                styles.kicker
              }
            >
              Contact Living
              Spring
            </span>

            <h1>
              Request Property
              Information or Book
              an Inspection.
            </h1>

            <p>
              Send your details
              and the property you
              are interested in.
              Living Spring will
              follow up with
              current availability
              and inspection
              guidance.
            </p>
          </div>
        </section>

        {/* =====================================
            CONTACT SECTION
        ====================================== */}

        <section
          className={
            styles.contactSection
          }
        >
          <div
            className={`container ${styles.grid}`}
          >
            {/* LEFT CONTACT PANEL */}

            <aside
              className={
                styles.infoPanel
              }
            >
              <div
                className={
                  styles.panelTop
                }
              >
                <span
                  className={
                    styles.kicker
                  }
                >
                  Direct Contact
                </span>

                <h2>
                  Speak with
                  Living Spring.
                </h2>

                <p>
                  Reach us directly
                  for property,
                  hostel,
                  short-let and
                  inspection
                  enquiries.
                </p>
              </div>

              <div
                className={
                  styles.infoCards
                }
              >
                {cleanWhatsappNumber ? (
                  <a
                    href={`https://wa.me/${cleanWhatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span
                      className={
                        styles.iconBox
                      }
                    >
                      <FaWhatsapp />
                    </span>

                    <div>
                      <strong>
                        WhatsApp
                      </strong>

                      <span>
                        Fastest way
                        to reach us
                      </span>
                    </div>

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </a>
                ) : (
                  <div>
                    <span
                      className={
                        styles.iconBox
                      }
                    >
                      <FaWhatsapp />
                    </span>

                    <div>
                      <strong>
                        WhatsApp
                      </strong>

                      <span>
                        Coming soon
                      </span>
                    </div>
                  </div>
                )}

                <a
                  href={`mailto:${contactEmail}`}
                >
                  <span
                    className={
                      styles.iconBox
                    }
                  >
                    <Mail
                      size={20}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <strong>
                      Email
                    </strong>

                    <span>
                      {
                        contactEmail
                      }
                    </span>
                  </div>

                  <ArrowRight
                    size={16}
                    aria-hidden="true"
                  />
                </a>

                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                  >
                    <span
                      className={
                        styles.iconBox
                      }
                    >
                      <Phone
                        size={20}
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <strong>
                        Call
                      </strong>

                      <span>
                        {
                          contactPhone
                        }
                      </span>
                    </div>

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </a>
                )}

                <div>
                  <span
                    className={
                      styles.iconBox
                    }
                  >
                    <MapPin
                      size={20}
                      aria-hidden="true"
                    />
                  </span>

                  <div>
                    <strong>
                      Service Area
                    </strong>

                    <span>
                      Ogun State
                      and listed
                      locations
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={
                  styles.noteBox
                }
              >
                <ShieldCheck
                  size={19}
                  aria-hidden="true"
                />

                <div>
                  <strong>
                    Inspection
                    confirmation
                  </strong>

                  <p>
                    Inspection dates
                    are confirmed
                    based on current
                    availability.
                  </p>
                </div>
              </div>
            </aside>

            {/* ENQUIRY FORM */}

            <form
              className={
                styles.formCard
              }
              onSubmit={
                sendEmail
              }
            >
              <div
                className={
                  styles.formHeader
                }
              >
                <span
                  className={
                    styles.kicker
                  }
                >
                  Enquiry Form
                </span>

                <h2>
                  Tell us what you
                  need.
                </h2>

                <p>
                  Send your details
                  and we&apos;ll
                  follow up
                  directly.
                </p>
              </div>

              {feedback && (
                <div
                  className={
                    feedbackType ===
                    'error'
                      ? styles.errorAlert
                      : styles.successAlert
                  }
                  role={
                    feedbackType ===
                    'error'
                      ? 'alert'
                      : 'status'
                  }
                >
                  {feedbackType ===
                    'success' && (
                    <CheckCircle2
                      size={18}
                      aria-hidden="true"
                    />
                  )}

                  {feedback}
                </div>
              )}

              {(formData.property ||
                formData.unit ||
                formData.price) && (
                <div
                  className={
                    styles.contextCard
                  }
                >
                  <Building2
                    size={19}
                    aria-hidden="true"
                  />

                  <div>
                    <span>
                      You&apos;re
                      enquiring
                      about
                    </span>

                    <strong>
                      {
                        formData.property ||
                        'Property enquiry'
                      }
                    </strong>

                    <p>
                      {formData.unit
                        ? formData.unit
                        : 'Listing'}

                      {formData.price
                        ? ` • ${formData.price}`
                        : ''}
                    </p>
                  </div>
                </div>
              )}

              <div
                className={
                  styles.formGrid
                }
              >
                <label>
                  Full Name *

                  <div
                    className={
                      styles.inputWrap
                    }
                  >
                    <User
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      type="text"
                      value={
                        formData.name
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'name',
                          event.target
                            .value
                        )
                      }
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                  </div>
                </label>

                <label>
                  Phone Number *

                  <div
                    className={
                      styles.inputWrap
                    }
                  >
                    <Phone
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      type="tel"
                      value={
                        formData.phone
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
                      placeholder="Your phone number"
                      autoComplete="tel"
                      required
                    />
                  </div>
                </label>

                <label>
                  Email Address

                  <div
                    className={
                      styles.inputWrap
                    }
                  >
                    <Mail
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      type="email"
                      value={
                        formData.email
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
                      placeholder="Your email address"
                      autoComplete="email"
                    />
                  </div>
                </label>

                <label>
                  Inspection Date

                  <div
                    className={
                      styles.inputWrap
                    }
                  >
                    <CalendarDays
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      type="date"
                      value={
                        formData.preferredDate
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'preferredDate',
                          event.target
                            .value
                        )
                      }
                    />
                  </div>
                </label>

                <label>
                  Property Name

                  <div
                    className={
                      styles.inputWrap
                    }
                  >
                    <Building2
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      type="text"
                      value={
                        formData.property
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'property',
                          event.target
                            .value
                        )
                      }
                      placeholder="Property name if known"
                    />
                  </div>
                </label>

                <label>
                  Unit / Property
                  Type

                  <div
                    className={
                      styles.inputWrap
                    }
                  >
                    <MessageCircle
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      type="text"
                      value={
                        formData.unit
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          'unit',
                          event.target
                            .value
                        )
                      }
                      placeholder="2 Bedroom, self contain..."
                    />
                  </div>
                </label>

                <label
                  className={
                    styles.full
                  }
                >
                  Message

                  <textarea
                    value={
                      formData.message
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
                    placeholder="Tell us what you are looking for..."
                    rows={6}
                  />
                </label>

                {/* Hidden spam trap */}

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
                      value={
                        formData.companyWebsite
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
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </label>
                </div>
              </div>

              <div
                className={
                  styles.actions
                }
              >
                <button
                  type="button"
                  className={
                    styles.whatsappBtn
                  }
                  onClick={
                    sendWhatsApp
                  }
                >
                  <FaWhatsapp />

                  WhatsApp
                </button>

                <button
                  type="submit"
                  className={
                    styles.emailBtn
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
                </button>
              </div>

              <p
                className={
                  styles.smallText
                }
              >
                Property details
                are automatically
                included when you
                enquire from a
                listing.
              </p>
            </form>
          </div>
        </section>

        {/* =====================================
            MAP
        ====================================== */}

        <section
          className={
            styles.mapSection
          }
        >
          <div className="container">
            <div
              className={
                styles.mapWrap
              }
            >
              <div
                className={
                  styles.mapHeader
                }
              >
                <div>
                  <span
                    className={
                      styles.kicker
                    }
                  >
                    Service Area
                  </span>

                  <h2>
                    Serving key
                    locations in
                    Ogun State.
                  </h2>
                </div>

                <MapPin
                  size={27}
                  aria-hidden="true"
                />
              </div>

              <iframe
                src="https://maps.google.com/maps?q=Ogun%20State,Nigeria&z=9&output=embed"
                width="100%"
                height="390"
                allowFullScreen
                loading="lazy"
                title="Living Spring service area"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* =====================================
            FINAL CTA
        ====================================== */}

        <section
          className={
            styles.finalCta
          }
        >
          <div className="container">
            <div
              className={
                styles.ctaBox
              }
            >
              <div>
                <span
                  className={
                    styles.kicker
                  }
                >
                  Explore Listings
                </span>

                <h2>
                  Still deciding?
                </h2>

                <p>
                  Browse available
                  properties and
                  accommodation
                  before sending an
                  enquiry.
                </p>
              </div>

              <Link
                href="/properties"
                className="btn btn-gold"
              >
                Browse Properties

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <>
          <Navbar />

          <div className="loading">
            <div
              className="loading-spinner"
            />
          </div>

          <Footer />
        </>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}