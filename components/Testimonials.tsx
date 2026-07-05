'use client';

import { useState } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Testimonials.module.css';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const testimonials = [
    {
      name: 'John Doe',
      role: 'Homeowner',
      content: 'Living Springs helped me find my dream home. Their team was professional and attentive to my needs.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Jane Smith',
      role: 'Investor',
      content: 'Great experience investing in commercial properties. The team provided excellent guidance.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      name: 'Mike Johnson',
      role: 'First-time Buyer',
      content: 'As a first-time buyer, I was nervous but the team made the process smooth and easy.',
      rating: 5,
      image: 'https://randomuser.me/api/portraits/men/2.jpg'
    },
  ];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className={styles.testimonials}>
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>
        <p className="section-subtitle">Trusted by hundreds of happy clients</p>
        
        <div className={styles.testimonialSlider}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentIndex}
              className={styles.testimonialCard}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <FaQuoteLeft className={styles.quoteIcon} />
              <p className={styles.content}>{testimonials[currentIndex].content}</p>
              <div className={styles.rating}>
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
              <div className={styles.author}>
                <img src={testimonials[currentIndex].image} alt={testimonials[currentIndex].name} />
                <div>
                  <h4>{testimonials[currentIndex].name}</h4>
                  <span>{testimonials[currentIndex].role}</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <button className={`${styles.navBtn} ${styles.prevBtn}`} onClick={prev}>
            <FaChevronLeft />
          </button>
          <button className={`${styles.navBtn} ${styles.nextBtn}`} onClick={next}>
            <FaChevronRight />
          </button>
        </div>
        
        <div className={styles.dots}>
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`${styles.dot} ${currentIndex === index ? styles.active : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}