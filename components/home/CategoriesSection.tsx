import {
  Building2,
  BriefcaseBusiness,
  Map
} from 'lucide-react';

import styles from './CategoriesSection.module.css';

export default function CategoriesSection() {

  const categories = [
    {
      icon: Building2,
      title: 'Residential',
      description:
        'Apartments, flats, duplexes and family homes.'
    },

    {
      icon: BriefcaseBusiness,
      title: 'Commercial',
      description:
        'Office spaces, shops and warehouses.'
    },

    {
      icon: Map,
      title: 'Land',
      description:
        'Residential and investment land opportunities.'
    }
  ];

  return (
    <section className="section">

      <div className="container">

        <h2>Browse Categories</h2>

        <div className="grid">

          {categories.map((item) => {

            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="card"
                style={{
                  padding:'2rem'
                }}
              >

                <Icon
                  size={40}
                  color="var(--accent)"
                />

                <h3>{item.title}</h3>

                <p>{item.description}</p>

              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}