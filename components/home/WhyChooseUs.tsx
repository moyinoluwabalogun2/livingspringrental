import { CalendarCheck, MapPin, ShieldCheck, WalletCards } from 'lucide-react';
import styles from './HomeSections.module.css';

export default function WhyChooseUs() {
  const items = [
    { icon: ShieldCheck, title: 'Verified Listings', text: 'Clear property information with photos, location details, and availability.' },
    { icon: CalendarCheck, title: 'Easy Inspection', text: 'Request inspections quickly through WhatsApp or email inquiry forms.' },
    { icon: WalletCards, title: 'Transparent Pricing', text: 'See rental or sale pricing clearly before contacting the agent.' },
    { icon: MapPin, title: 'Location Confidence', text: 'View maps and nearby landmarks before making a decision.' },
  ];

  return (
    <section className="section">
      <div className="container">
        <div className={styles.sectionHeader}>
          <span>Why choose us</span>
          <h2>A smoother way to find serious property options.</h2>
        </div>

        <div className="grid">
          {items.map(({ icon: Icon, title, text }) => (
            <div className={styles.featureCard} key={title}>
              <Icon size={34} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}