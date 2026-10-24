import Link from 'next/link';

import {
  ArrowRight,
  Building2,
  MapPin,
  MoonStar,
  Search,
  School,
} from 'lucide-react';

import styles
  from './HomeSearch.module.css';

const serviceChoices = [
  {
    label: 'Hostel',
    description:
      'Student and longer-stay accommodation',
    href: '/#hostel',
    icon: School,
  },

  {
    label: 'Short-Let',
    description:
      'Flexible stays for days, weeks or visits',
    href: '/#shortlet',
    icon: MoonStar,
  },

  {
    label: 'Properties',
    description:
      'Residential, commercial and land listings',
    href: '/properties',
    icon: Building2,
  },
];

export default function HomeSearch() {
  return (
    <section
      className={
        styles.wrapper
      }
      aria-label="Find accommodation or property"
    >
      <div
        className={
          styles.serviceRow
        }
      >
        {serviceChoices.map(
          ({
            label,
            description,
            href,
            icon: Icon,
          }) => (
            <Link
              href={href}
              key={label}
              className={
                styles.serviceChoice
              }
            >
              <span
                className={
                  styles.choiceIcon
                }
              >
                <Icon
                  size={20}
                  aria-hidden="true"
                />
              </span>

              <span
                className={
                  styles.choiceText
                }
              >
                <strong>
                  {label}
                </strong>

                <small>
                  {description}
                </small>
              </span>

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          )
        )}
      </div>

      <div
        className={
          styles.searchCard
        }
      >
        <div
          className={
            styles.searchIntro
          }
        >
          <span>
            Property Search
          </span>

          <h2>
            Find what fits.
          </h2>
        </div>

        {/*
          Pure HTML GET form.

          No React state.
          No router JavaScript.
          No localStorage.

          This keeps homepage
          search very lightweight.
        */}
        <form
          action="/properties"
          method="get"
          className={
            styles.form
          }
        >
          <label
            className={
              styles.keywordField
            }
          >
            <span>
              Search
            </span>

            <div
              className={
                styles.inputShell
              }
            >
              <Search
                size={18}
                aria-hidden="true"
              />

              <input
                type="search"
                name="keyword"
                placeholder="Area, property or location"
                autoComplete="off"
              />
            </div>
          </label>

          <label>
            <span>
              Category
            </span>

            <select
              name="category"
              defaultValue="All"
            >
              <option value="All">
                All
              </option>

              <option value="Residential">
                Residential
              </option>

              <option value="Commercial">
                Commercial
              </option>

              <option value="Land">
                Land
              </option>
            </select>
          </label>

          <label>
            <span>
              Purpose
            </span>

            <select
              name="listingPurpose"
              defaultValue="All"
            >
              <option value="All">
                Any
              </option>

              <option value="Rent">
                Rent
              </option>

              <option value="Sale">
                Sale
              </option>

              <option value="Lease">
                Lease
              </option>
            </select>
          </label>

          <button
            type="submit"
            className={
              styles.searchButton
            }
          >
            <Search
              size={18}
              aria-hidden="true"
            />

            Search
          </button>
        </form>

        <div
          className={
            styles.searchFoot
          }
        >
          <MapPin
            size={15}
            aria-hidden="true"
          />

          <span>
            Search Living Spring
            listings across current
            property locations.
          </span>
        </div>
      </div>
    </section>
  );
}