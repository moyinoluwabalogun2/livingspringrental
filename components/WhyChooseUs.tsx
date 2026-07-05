'use client';

import { FaShieldAlt, FaClock, FaHandshake, FaUsers, FaCertificate, FaHeadset } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './WhyChooseUs.module.css';

export default function WhyChooseUs() {
  const features = [
    { icon: <FaShieldAlt />, title: 'Secure Transactions', desc: 'Safe and verified property deals with legal backing' },
    { icon: <FaClock />, title: 'Fast Response', desc: 'Quick responses to all inquiries within 24 hours' },
    { icon: <FaHandshake />, title: 'Trusted Partners', desc: 'Work with verified agents and trusted developers' },
    { icon: <FaUsers />, title: 'Expert Team', desc: 'Professional real estate experts guiding you' },
    { icon: <FaCertificate />, title: 'Verified Listings', desc: 'All properties are thoroughly verified' },
    { icon: <FaHeadset />, title: '24/7 Support', desc: 'Round-the-clock customer support' },
  ];

  return (
    <section className={styles.whyChooseUs}>
      <div className="container">
        <h2 className="section-title">Why Choose Us</h2>
        <p className="section-subtitle">Experience excellence in real estate services</p>
        
        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <motion.div 
              key={index}
              className={styles.featureCard}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}