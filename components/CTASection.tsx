'use client';

import { FaWhatsapp, FaEnvelope, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './CTASection.module.css';

export default function CTASection() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <motion.div 
          className={styles.ctaContent}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2>Ready to Find Your Perfect Property?</h2>
          <p>Contact our team today for personalized assistance and expert guidance</p>
          
          <div className={styles.ctaButtons}>
            <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}`} className={styles.whatsappBtn}>
              <FaWhatsapp /> WhatsApp Us
            </a>
            <a href="mailto:info@livingsprings.com" className={styles.emailBtn}>
              <FaEnvelope /> Send Email
            </a>
            <a href="tel:+2341234567890" className={styles.callBtn}>
              <FaPhone /> Call Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}