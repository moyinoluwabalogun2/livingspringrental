import { Home, MessageCircle, Search, ShieldCheck } from 'lucide-react';
import styles from './HomeSections.module.css';

export default function ProcessSection() {
  const steps = [
    { icon: Search, title: 'Browse', text: 'Search by location, category, purpose, and unit type.' },
    { icon: Home, title: 'Choose', text: 'Open the property page and review units, photos, videos, and maps.' },
    { icon: MessageCircle, title: 'Inquire', text: 'Send details through WhatsApp or EmailJS from the same form.' },
    { icon: ShieldCheck, title: 'Inspect', text: 'Confirm availability and arrange inspection with the agent.' },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className={styles.sectionHeader}>
          <span>Simple process</span>
          <h2>From browsing to inspection without confusion.</h2>
        </div>

        <div className={styles.processGrid}>
          {steps.map(({ icon: Icon, title, text }, index) => (
            <div className={styles.stepCard} key={title}>
              <div className={styles.stepNumber}>0{index + 1}</div>
              <Icon size={30} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}