'use client';

import { FaSearch, FaHandshake, FaFileSignature, FaKey } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './RentalProcess.module.css';

export default function RentalProcess() {
  const steps = [
    { icon: <FaSearch />, title: 'Search Properties', desc: 'Browse our extensive collection of properties' },
    { icon: <FaHandshake />, title: 'Request Inspection', desc: 'Schedule a viewing of your favorite properties' },
    { icon: <FaFileSignature />, title: 'Make Offer', desc: 'Submit your offer and negotiate terms' },
    { icon: <FaKey />, title: 'Move In', desc: 'Sign documents and get your keys' },
  ];

  return (
    <section className={styles.process}>
      <div className="container">
        <h2 className="section-title">Simple Process</h2>
        <p className="section-subtitle">Your journey to finding the perfect property</p>
        
        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className={styles.step}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className={styles.stepNumber}>{index + 1}</div>
              <div className={styles.stepIcon}>{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}