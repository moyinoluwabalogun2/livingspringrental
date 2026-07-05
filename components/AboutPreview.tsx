'use client';

import Image from 'next/image';
import { FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import styles from './AboutPreview.module.css';

export default function AboutPreview() {
  return (
    <section className={styles.aboutPreview}>
      <div className="container">
        <div className={styles.grid}>
          <motion.div 
            className={styles.content}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2>About Living Springs</h2>
            <p>Living Springs is a premier real estate platform dedicated to providing exceptional property solutions across Nigeria. With years of experience and a team of dedicated professionals, we've helped thousands of clients find their perfect properties.</p>
            
            <div className={styles.features}>
              {['10+ Years Experience', '500+ Properties Sold', '1000+ Happy Clients', '24/7 Support'].map((feature, i) => (
                <div key={i} className={styles.feature}>
                  <FaCheckCircle /> {feature}
                </div>
              ))}
            </div>
            
            <button className="btn btn-primary" onClick={() => window.location.href = '/about'}>
              Learn More About Us
            </button>
          </motion.div>
          
          <motion.div 
            className={styles.image}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className={styles.imagePlaceholder}>
              <span>🏢</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}