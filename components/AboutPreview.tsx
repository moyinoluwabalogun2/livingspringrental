'use client';

import Link
  from 'next/link';

import {
  Building2,
  CheckCircle2,
} from 'lucide-react';

import {
  motion,
} from 'framer-motion';

import styles
  from './AboutPreview.module.css';

const features = [
  'Property listings',
  'Direct enquiries',
  'Inspection support',
  'Clear availability information',
];

export default function AboutPreview() {
  return (
    <section
      className={
        styles.aboutPreview
      }
    >
      <div className="container">
        <div
          className={
            styles.grid
          }
        >
          <motion.div
            className={
              styles.content
            }
            initial={{
              opacity: 0,
              x: -30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
          >
            <h2>
              About Living Spring
            </h2>

            <p>
              Living Spring provides
              clear property
              information, direct
              communication and a
              simpler way to enquire
              about available
              accommodation and
              property opportunities.
            </p>

            <div
              className={
                styles.features
              }
            >
              {features.map(
                (
                  feature
                ) => (
                  <div
                    key={
                      feature
                    }
                    className={
                      styles.feature
                    }
                  >
                    <CheckCircle2
                      size={17}
                      aria-hidden="true"
                    />

                    {feature}
                  </div>
                )
              )}
            </div>

            <Link
              href="/about"
              className="btn btn-primary"
            >
              Learn More About Us
            </Link>
          </motion.div>

          <motion.div
            className={
              styles.image
            }
            initial={{
              opacity: 0,
              x: 30,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
          >
            <div
              className={
                styles.imagePlaceholder
              }
            >
              <Building2
                size={48}
                aria-hidden="true"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}