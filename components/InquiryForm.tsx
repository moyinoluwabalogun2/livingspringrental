'use client';

import { useState } from 'react';
import { FaWhatsapp, FaEnvelope, FaUser, FaPhone, FaCalendar, FaComment } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { sendInquiryEmail, getWhatsAppMessage } from '@/lib/emailjs';
import styles from './InquiryForm.module.css';

interface InquiryFormProps {
  propertyTitle: string;
  unitType?: string;
  price?: number;
  pricePeriod?: string;
  propertyId: string;
}

export default function InquiryForm({ propertyTitle, unitType, price, pricePeriod, propertyId }: InquiryFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    preferredInspectionDate: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsApp = () => {
    const message = getWhatsAppMessage({
      name: formData.name,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      preferredInspectionDate: formData.preferredInspectionDate,
      message: formData.message,
      propertyTitle,
      unitType,
      price
    });
    
    const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phoneNumber || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    
    const result = await sendInquiryEmail({
      ...formData,
      propertyTitle,
      unitType,
      price,
      pricePeriod
    });
    
    if (result.success) {
      setSuccess('Your inquiry has been sent successfully! We will contact you soon.');
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        preferredInspectionDate: '',
        message: ''
      });
    } else {
      setError('Failed to send inquiry. Please try again or use WhatsApp.');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.inquiryForm}>
      <h3>Request Inspection</h3>
      <p className={styles.propertyInfo}>
        Interested in: <strong>{propertyTitle}</strong>
        {unitType && <span> - {unitType}</span>}
        {price && <span> - ₦{price.toLocaleString()}/{pricePeriod}</span>}
      </p>

      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleEmail}>
        <div className={styles.formGroup}>
          <FaUser className={styles.inputIcon} />
          <input
            type="text"
            name="name"
            placeholder="Your Name *"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <FaPhone className={styles.inputIcon} />
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number *"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <FaEnvelope className={styles.inputIcon} />
          <input
            type="email"
            name="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <FaCalendar className={styles.inputIcon} />
          <input
            type="date"
            name="preferredInspectionDate"
            value={formData.preferredInspectionDate}
            onChange={handleChange}
          />
        </div>

        <div className={styles.formGroup}>
          <FaComment className={styles.inputIcon} />
          <textarea
            name="message"
            placeholder="Additional Message"
            rows={4}
            value={formData.message}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className={styles.formActions}>
          <button type="button" className={styles.whatsappBtn} onClick={handleWhatsApp}>
            <FaWhatsapp /> Send via WhatsApp
          </button>
          
          <button type="submit" className={styles.emailBtn} disabled={loading}>
            <FaEnvelope /> {loading ? 'Sending...' : 'Send via Email'}
          </button>
        </div>
      </form>
    </div>
  );
}