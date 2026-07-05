'use client';

import { useState } from 'react';
import Link from 'next/link';
import emailjs from '@emailjs/browser';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  User,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    property: '',
    unit: '',
    preferredDate: '',
    message: '',
  });

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const buildMessage = () => {
    return `Hello Living Springs Rentals,

My name is ${formData.name || 'a customer'}.

I would like to make an inquiry.

Property: ${formData.property || 'Not specified'}
Unit/Type: ${formData.unit || 'Not specified'}
Preferred inspection date: ${formData.preferredDate || 'Not specified'}

Phone: ${formData.phone || 'Not provided'}
Email: ${formData.email || 'Not provided'}

Message:
${formData.message || 'I would like to request more information.'}`;
  };

  const sendWhatsApp = () => {
    const message = encodeURIComponent(buildMessage());
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  const sendEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccess('');
    setSending(true);

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || '',
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || '',
        {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          property: formData.property,
          unit: formData.unit,
          preferred_date: formData.preferredDate,
          message: formData.message,
          full_message: buildMessage(),
        },
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
      );

      setSuccess('Your inquiry has been sent successfully.');
      setFormData({
        name: '',
        phone: '',
        email: '',
        property: '',
        unit: '',
        preferredDate: '',
        message: '',
      });
    } catch (error) {
      console.error('Inquiry error:', error);
      setSuccess('Could not send inquiry. Please try WhatsApp or call directly.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <span className={styles.kicker}>Contact Living Springs</span>
            <h1>Request Property Information or Book an Inspection.</h1>
            <p>
              Send your details and the property you are interested in. The agent will follow up
              with current availability and inspection guidance.
            </p>
          </div>
        </section>

        <section className={styles.contactSection}>
          <div className="container">
            <div className={styles.grid}>
              <div className={styles.infoPanel}>
                <span className={styles.kicker}>Speak With The Agent</span>
                <h2>Simple contact, clear follow-up.</h2>
                <p>
                  Whether you are asking about a rental unit, a full building, commercial space, or
                  future land listing, send the inquiry and include as much detail as possible.
                </p>

                <div className={styles.infoCards}>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
                    <FaWhatsapp />
                    <div>
                      <strong>WhatsApp</strong>
                      <span>Fast response for inspections</span>
                    </div>
                  </a>

                  <a href="mailto:info@livingspringsrental.com">
                    <Mail size={22} />
                    <div>
                      <strong>Email</strong>
                      <span>Send formal property inquiries</span>
                    </div>
                  </a>

                  <div>
                    <MapPin size={22} />
                    <div>
                      <strong>Service Area</strong>
                      <span>Lagos and surrounding locations</span>
                    </div>
                  </div>
                </div>

                <div className={styles.noteBox}>
                  <CalendarDays size={20} />
                  <p>
                    Inspection dates are confirmed based on property availability and agent
                    schedule.
                  </p>
                </div>
              </div>

              <form className={styles.formCard} onSubmit={sendEmail}>
                <div className={styles.formHeader}>
                  <span className={styles.kicker}>Inquiry Form</span>
                  <h2>Send your property request</h2>
                </div>

                {success && <div className={styles.alert}>{success}</div>}

                <div className={styles.formGrid}>
                  <label>
                    Full Name *
                    <div className={styles.inputWrap}>
                      <User size={17} />
                      <input
                        value={formData.name}
                        onChange={(event) => updateField('name', event.target.value)}
                        placeholder="Your full name"
                        required
                      />
                    </div>
                  </label>

                  <label>
                    Phone Number *
                    <div className={styles.inputWrap}>
                      <Phone size={17} />
                      <input
                        value={formData.phone}
                        onChange={(event) => updateField('phone', event.target.value)}
                        placeholder="Your phone number"
                        required
                      />
                    </div>
                  </label>

                  <label>
                    Email Address
                    <div className={styles.inputWrap}>
                      <Mail size={17} />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(event) => updateField('email', event.target.value)}
                        placeholder="Your email address"
                      />
                    </div>
                  </label>

                  <label>
                    Preferred Inspection Date
                    <div className={styles.inputWrap}>
                      <CalendarDays size={17} />
                      <input
                        type="date"
                        value={formData.preferredDate}
                        onChange={(event) => updateField('preferredDate', event.target.value)}
                      />
                    </div>
                  </label>

                  <label>
                    Property Name
                    <div className={styles.inputWrap}>
                      <Building2 size={17} />
                      <input
                        value={formData.property}
                        onChange={(event) => updateField('property', event.target.value)}
                        placeholder="Property name if known"
                      />
                    </div>
                  </label>

                  <label>
                    Unit / Property Type
                    <div className={styles.inputWrap}>
                      <MessageCircle size={17} />
                      <input
                        value={formData.unit}
                        onChange={(event) => updateField('unit', event.target.value)}
                        placeholder="2 Bedroom, self contain, shop..."
                      />
                    </div>
                  </label>

                  <label className={styles.full}>
                    Message
                    <textarea
                      value={formData.message}
                      onChange={(event) => updateField('message', event.target.value)}
                      placeholder="Tell us what you are looking for..."
                      rows={5}
                    />
                  </label>
                </div>

                <div className={styles.actions}>
                  <button type="button" className={styles.whatsappBtn} onClick={sendWhatsApp}>
                    <FaWhatsapp />
                    Send via WhatsApp
                  </button>

                  <button type="submit" className={styles.emailBtn} disabled={sending}>
                    <Send size={18} />
                    {sending ? 'Sending...' : 'Send Inquiry'}
                  </button>
                </div>

                <p className={styles.smallText}>
                  Your property details will be included automatically when you inquire from a
                  property page.
                </p>
              </form>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className="container">
            <div className={styles.ctaBox}>
              <h2>Want to browse first?</h2>
              <p>View current listings and choose the property you want to inspect.</p>
              <Link href="/properties" className="btn btn-gold">
                Browse Properties
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      {/* Map Section */}
        <section className={styles.mapSection}>
          <div className={styles.mapPlaceholder}>
            <iframe 
              src="https://maps.google.com/maps?q=Lagos,Nigeria&z=12&output=embed" 
              width="100%" 
              height="400" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy"
            ></iframe>
          </div>
        </section>
      

      <Footer />
    </>
  );
}
