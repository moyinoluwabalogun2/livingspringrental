import { Star } from 'lucide-react';
import styles from './HomeSections.module.css';

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Prospective Tenant',
      text: 'The property details were clear, and it was easy to contact the agent directly.',
    },
    {
      name: 'Family Client',
      text: 'Seeing the location, images, and available units made the process feel more trustworthy.',
    },
    {
      name: 'Business Client',
      text: 'The listings are organized and simple to understand before booking inspection.',
    },
  ];

  return (
    <section className={styles.testimonials}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <span>Client confidence</span>
          <h2>Designed to make property decisions easier.</h2>
        </div>

        <div className="grid">
          {testimonials.map((item) => (
            <div className={styles.testimonialCard} key={item.name}>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => <Star key={star} size={16} fill="currentColor" />)}
              </div>
              <p>“{item.text}”</p>
              <strong>{item.name}</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}