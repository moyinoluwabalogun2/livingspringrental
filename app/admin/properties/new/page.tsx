'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ImagePlus,
  MapPin,
  PlusCircle,
  Save,
  Trash2,
} from 'lucide-react';
import {
  addDoc,
  collection,
  db,
  doc,
  getDoc,
  updateDoc,
} from '@/lib/firebase';
import styles from './page.module.css';

type Unit = {
  id: string;
  unitType: string;
  price: number;
  pricePeriod: 'year' | 'month' | 'one-time';
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  status: 'available' | 'rented' | 'sold';
  description: string;
  media: string[];
  inspectionNotes: string;
};

type FormState = {
  title: string;
  category: 'Residential' | 'Commercial' | 'Land';
  listingPurpose: 'Rent' | 'Sale' | 'Lease';
  structureType: 'single-unit' | 'multi-unit';
  propertyType: string;
  location: string;
  address: string;
  description: string;
  media: string[];
  amenities: string[];
  featured: boolean;
  mapEmbedUrl: string;
  latitude: string;
  longitude: string;
  nearbyLandmarks: string[];
  units: Unit[];
};

const categories = ['Residential', 'Commercial', 'Land'] as const;
const purposes = ['Rent', 'Sale', 'Lease'] as const;
const structureTypes = ['single-unit', 'multi-unit'] as const;
const pricePeriods = ['year', 'month', 'one-time'] as const;
const statuses = ['available', 'rented', 'sold'] as const;

const propertyTypes = {
  Residential: [
    'Self Contain',
    'Room',
    'Room & Parlour',
    'Mini Flat',
    '1 Bedroom Flat',
    '2 Bedroom Flat',
    '3 Bedroom Flat',
    '4 Bedroom Flat',
    'Duplex',
    'Bungalow',
    'Detached House',
    'Semi Detached House',
    'Apartment Building',
  ],
  Commercial: [
    'Shop',
    'Office Space',
    'Warehouse',
    'Plaza Space',
    'Event Space',
    'Industrial Property',
  ],
  Land: [
    'Residential Land',
    'Commercial Land',
    'Agricultural Land',
    'Investment Land',
  ],
};

const createId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const blankUnit = (): Unit => ({
  id: createId(),
  unitType: '',
  price: 0,
  pricePeriod: 'year',
  bedrooms: 0,
  bathrooms: 0,
  toilets: 0,
  status: 'available',
  description: '',
  media: [''],
  inspectionNotes: '',
});

const initialForm = (): FormState => ({
  title: '',
  category: 'Residential',
  listingPurpose: 'Rent',
  structureType: 'single-unit',
  propertyType: '',
  location: '',
  address: '',
  description: '',
  media: [''],
  amenities: [''],
  featured: false,
  mapEmbedUrl: '',
  latitude: '',
  longitude: '',
  nearbyLandmarks: [''],
  units: [blankUnit()],
});

const cleanStringArray = (items: string[]) =>
  items.map((item) => item.trim()).filter(Boolean);

const cleanUnits = (units: Unit[]) =>
  units.map((unit) => ({
    id: unit.id || createId(),
    unitType: unit.unitType.trim(),
    price: Number(unit.price) || 0,
    pricePeriod: unit.pricePeriod || 'year',
    bedrooms: Number(unit.bedrooms) || 0,
    bathrooms: Number(unit.bathrooms) || 0,
    toilets: Number(unit.toilets) || 0,
    status: unit.status || 'available',
    description: unit.description.trim(),
    media: cleanStringArray(unit.media || []),
    inspectionNotes: unit.inspectionNotes.trim(),
  }));

export default function AddPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();

  const propertyId =
    pathname.includes('/admin/properties/edit/') && params?.id
      ? String(params.id)
      : '';

  const isEdit = Boolean(propertyId);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fetching, setFetching] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const currentPropertyTypes = useMemo(
    () => propertyTypes[form.category],
    [form.category]
  );

  useEffect(() => {
    if (!isEdit || !propertyId) return; 

    async function fetchProperty() {
      try {
        const ref = doc(db, 'properties', propertyId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          router.replace('/admin/properties');
          return;
        }

        const data: any = snap.data();

        setForm({
          title: data.title || '',
          category: data.category || 'Residential',
          listingPurpose: data.listingPurpose || 'Rent',
          structureType: data.structureType || 'single-unit',
          propertyType: data.propertyType || '',
          location: data.location || '',
          address: data.address || '',
          description: data.description || '',
          media: data.media?.length ? data.media : [''],
          amenities: data.amenities?.length ? data.amenities : [''],
          featured: Boolean(data.featured),
          mapEmbedUrl:
    data.mapEmbedUrl ||
    data.googleMapsEmbedUrl ||
    data.googleMapEmbedUrl ||
    data.googleMapUrl ||
    data.mapUrl ||
    data.mapLink ||
    '',
          latitude: String(data.latitude ?? ''),
  longitude: String(data.longitude ?? ''),
          nearbyLandmarks: data.nearbyLandmarks?.length ? data.nearbyLandmarks : [''],
          units: data.units?.length
            ? data.units.map((unit: Partial<Unit>) => ({
                ...blankUnit(),
                ...unit,
                id: unit.id || createId(),
                media: unit.media?.length ? unit.media : [''],
              }))
            : [blankUnit()],
        });
      } catch (error) {
        console.error('Error fetching property:', error);
        alert('Could not load this property.');
      } finally {
        setFetching(false);
      }
    }

    fetchProperty();
   }, [isEdit, propertyId, router]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateArray = (
    field: 'media' | 'amenities' | 'nearbyLandmarks',
    index: number,
    value: string
  ) => {
    setForm((current) => {
      const next = [...current[field]];
      next[index] = value;
      return { ...current, [field]: next };
    });
  };

  const addArrayItem = (field: 'media' | 'amenities' | 'nearbyLandmarks') => {
    setForm((current) => ({ ...current, [field]: [...current[field], ''] }));
  };

  const removeArrayItem = (
    field: 'media' | 'amenities' | 'nearbyLandmarks',
    index: number
  ) => {
    setForm((current) => {
      const next = current[field].filter((_, itemIndex) => itemIndex !== index);
      return { ...current, [field]: next.length ? next : [''] };
    });
  };

  const updateUnit = <K extends keyof Unit>(
    index: number,
    field: K,
    value: Unit[K]
  ) => {
    setForm((current) => {
      const next = [...current.units];
      next[index] = { ...next[index], [field]: value };
      return { ...current, units: next };
    });
  };

  const updateUnitMedia = (unitIndex: number, mediaIndex: number, value: string) => {
    setForm((current) => {
      const nextUnits = [...current.units];
      const media = [...(nextUnits[unitIndex].media || [])];
      media[mediaIndex] = value;
      nextUnits[unitIndex] = { ...nextUnits[unitIndex], media };
      return { ...current, units: nextUnits };
    });
  };

  const addUnitMedia = (unitIndex: number) => {
    setForm((current) => {
      const nextUnits = [...current.units];
      nextUnits[unitIndex] = {
        ...nextUnits[unitIndex],
        media: [...(nextUnits[unitIndex].media || []), ''],
      };
      return { ...current, units: nextUnits };
    });
  };

  const removeUnitMedia = (unitIndex: number, mediaIndex: number) => {
    setForm((current) => {
      const nextUnits = [...current.units];
      const media = (nextUnits[unitIndex].media || []).filter(
        (_, index) => index !== mediaIndex
      );
      nextUnits[unitIndex] = {
        ...nextUnits[unitIndex],
        media: media.length ? media : [''],
      };
      return { ...current, units: nextUnits };
    });
  };

  const addUnit = () => {
    setForm((current) => ({ ...current, units: [...current.units, blankUnit()] }));
  };

  const removeUnit = (index: number) => {
    setForm((current) => {
      const units = current.units.filter((_, itemIndex) => itemIndex !== index);
      return { ...current, units: units.length ? units : [blankUnit()] };
    });
  };

  const handleCategoryChange = (category: FormState['category']) => {
    setForm((current) => ({
      ...current,
      category,
      propertyType: '',
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = form.title.trim();
    const location = form.location.trim() || form.address.trim();
    const propertyType = form.propertyType.trim();

    const missingFields: string[] = [];

    if (!title) missingFields.push('property title');
    if (!location) missingFields.push('location or full address');
    if (!propertyType) missingFields.push('property type');

    if (missingFields.length > 0) {
      alert(`Please fill in: ${missingFields.join(', ')}.`);
      return;
    }

    setSaving(true);

    const payload = {
      title,
      category: form.category,
      listingPurpose: form.listingPurpose,
      structureType: form.structureType,
      propertyType,
      location,
      address: form.address.trim(),
      description: form.description.trim(),
      media: cleanStringArray(form.media),
      amenities: cleanStringArray(form.amenities),
      featured: Boolean(form.featured),
      mapEmbedUrl: form.mapEmbedUrl.trim(),
      latitude: form.latitude.trim()
        ? Number(form.latitude)
        : null,
      longitude: form.longitude.trim()
        ? Number(form.longitude)
        : null,

      nearbyLandmarks: cleanStringArray(form.nearbyLandmarks),
      units: cleanUnits(form.units),
      updatedAt: new Date(),
    };

    try {
      if (isEdit && propertyId) {
  await updateDoc(doc(db, 'properties', propertyId), payload);
      } else {
        await addDoc(collection(db, 'properties'), {
          ...payload,
          createdAt: new Date(),
        });
      }

      alert(isEdit ? 'Property updated successfully.' : 'Property created successfully.');
      router.push('/admin/properties');
      router.refresh();
    } catch (error) {
      console.error('Error saving property:', error);
      alert('Could not save property. Please check Firebase and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (fetching) {
    return (
      <div className="loading">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <span>{isEdit ? 'Update Listing' : 'New Listing'}</span>
          <h1>{isEdit ? 'Edit Property' : 'Add Property'}</h1>
          <p>
            Add property information, media URLs, location details and rental units.
          </p>
        </div>

        <button type="button" onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <Building2 size={20} />
            <div>
              <h2>Property Details</h2>
              <p>Main listing information shown on the website.</p>
            </div>
          </div>

          <div className={styles.grid}>
            <label>
              Property Title *
              <input
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                placeholder="Living Springs Residence"
                required
              />
            </label>

            <label>
              Category *
              <select
                value={form.category}
                onChange={(event) =>
                  handleCategoryChange(event.target.value as FormState['category'])
                }
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Purpose *
              <select
                value={form.listingPurpose}
                onChange={(event) =>
                  update('listingPurpose', event.target.value as FormState['listingPurpose'])
                }
              >
                {purposes.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              Structure *
              <select
                value={form.structureType}
                onChange={(event) =>
                  update('structureType', event.target.value as FormState['structureType'])
                }
              >
                {structureTypes.map((item) => (
                  <option key={item} value={item}>
                    {item === 'single-unit' ? 'Single Unit' : 'Multi Unit'}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Property Type *
              <select
                value={form.propertyType}
                onChange={(event) => update('propertyType', event.target.value)}
                required
              >
                <option value="">Select type</option>
                {currentPropertyTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            

            <label>
              Location / Area *
              <input
                value={form.location}
                onChange={(event) => update('location', event.target.value)}
                placeholder="Isara-Remo, Ogun State"
                required
              />
            </label>

            <label className={styles.full}>
              Full Address
              <input
                value={form.address}
                onChange={(event) => update('address', event.target.value)}
                placeholder="Jewayo Community, near Focus Hotel, before Isara Secondary School"
              />
            </label>

            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => update('featured', event.target.checked)}
              />
              <span>
                Featured Property
                <small>Show this listing in highlighted sections.</small>
              </span>
            </label>

            <label className={styles.full}>
              Description
              <textarea
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                rows={5}
                placeholder="Describe the property, environment, features and access..."
              />
            </label>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <ImagePlus size={20} />
            <div>
              <h2>Media URLs</h2>
              <p>Add image or video links. This avoids upload billing for now.</p>
            </div>
          </div>

          {form.media.map((item, index) => (
            <div className={styles.arrayRow} key={`media-${index}`}>
              <input
                value={item}
                onChange={(event) => updateArray('media', index, event.target.value)}
                placeholder="https://example.com/property-image.jpg or video.mp4"
              />
              <button type="button" onClick={() => removeArrayItem('media', index)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button type="button" onClick={() => addArrayItem('media')} className={styles.addSmall}>
            <PlusCircle size={16} />
            Add Media
          </button>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <CheckCircle2 size={20} />
            <div>
              <h2>Amenities</h2>
              <p>Add property features such as parking, security, water and power.</p>
            </div>
          </div>

          {form.amenities.map((item, index) => (
            <div className={styles.arrayRow} key={`amenity-${index}`}>
              <input
                value={item}
                onChange={(event) => updateArray('amenities', index, event.target.value)}
                placeholder="Parking, Security, Borehole..."
              />
              <button type="button" onClick={() => removeArrayItem('amenities', index)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addArrayItem('amenities')}
            className={styles.addSmall}
          >
            <PlusCircle size={16} />
            Add Amenity
          </button>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <MapPin size={20} />
            <div>
              <h2>Map & Landmarks</h2>
              <p>Add map embed and nearby landmarks.</p>
            </div>
          </div>

          <div className={styles.grid}>
            <label className={styles.full}>
              Google Maps Embed URL
              <input
                value={form.mapEmbedUrl}
                onChange={(event) => update('mapEmbedUrl', event.target.value)}
                placeholder="https://www.google.com/maps/embed?pb=..."
              />
            </label>

            <label>
              Latitude
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(event) => update('latitude', event.target.value)}
              />
            </label>

            <label>
              Longitude
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(event) => update('longitude', event.target.value)}
              />
            </label>
          </div>

          <div className={styles.arrayBlock}>
            {form.nearbyLandmarks.map((item, index) => (
              <div className={styles.arrayRow} key={`landmark-${index}`}>
                <input
                  value={item}
                  onChange={(event) =>
                    updateArray('nearbyLandmarks', index, event.target.value)
                  }
                  placeholder="Airport, mall, school, market..."
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem('nearbyLandmarks', index)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => addArrayItem('nearbyLandmarks')}
              className={styles.addSmall}
            >
              <PlusCircle size={16} />
              Add Landmark
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardHead}>
            <Building2 size={20} />
            <div>
              <h2>Units & Pricing</h2>
              <p>Add one unit for a single property or multiple units for a building.</p>
            </div>
          </div>

          <div className={styles.unitsStack}>
            {form.units.map((unit, unitIndex) => (
              <div className={styles.unitCard} key={unit.id}>
                <div className={styles.unitTop}>
                  <div>
                    <span>Unit {unitIndex + 1}</span>
                    <h3>{unit.unitType || 'Untitled Unit'}</h3>
                  </div>

                  <button type="button" onClick={() => removeUnit(unitIndex)}>
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className={styles.grid}>
                  <label>
                    Unit Type *
                    <input
                      value={unit.unitType}
                      onChange={(event) =>
                        updateUnit(unitIndex, 'unitType', event.target.value)
                      }
                      placeholder="2 Bedroom Flat"
                      required
                    />
                  </label>

                  <label>
                    Price *
                    <input
                      type="number"
                      min="0"
                      value={unit.price}
                      onChange={(event) =>
                        updateUnit(unitIndex, 'price', Number(event.target.value))
                      }
                      required
                    />
                  </label>

                  <label>
                    Price Period
                    <select
                      value={unit.pricePeriod}
                      onChange={(event) =>
                        updateUnit(
                          unitIndex,
                          'pricePeriod',
                          event.target.value as Unit['pricePeriod']
                        )
                      }
                    >
                      {pricePeriods.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Status
                    <select
                      value={unit.status}
                      onChange={(event) =>
                        updateUnit(unitIndex, 'status', event.target.value as Unit['status'])
                      }
                    >
                      {statuses.map((item) => (
                        <option key={item}>{item}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Bedrooms
                    <input
                      type="number"
                      min="0"
                      value={unit.bedrooms}
                      onChange={(event) =>
                        updateUnit(unitIndex, 'bedrooms', Number(event.target.value))
                      }
                    />
                  </label>

                  <label>
                    Bathrooms
                    <input
                      type="number"
                      min="0"
                      value={unit.bathrooms}
                      onChange={(event) =>
                        updateUnit(unitIndex, 'bathrooms', Number(event.target.value))
                      }
                    />
                  </label>

                  <label>
                    Toilets
                    <input
                      type="number"
                      min="0"
                      value={unit.toilets}
                      onChange={(event) =>
                        updateUnit(unitIndex, 'toilets', Number(event.target.value))
                      }
                    />
                  </label>

                  <label className={styles.full}>
                    Unit Description
                    <textarea
                      rows={4}
                      value={unit.description}
                      onChange={(event) =>
                        updateUnit(unitIndex, 'description', event.target.value)
                      }
                      placeholder="Describe this unit..."
                    />
                  </label>

                  <label className={styles.full}>
                    Inspection Notes
                    <textarea
                      rows={3}
                      value={unit.inspectionNotes}
                      onChange={(event) =>
                        updateUnit(unitIndex, 'inspectionNotes', event.target.value)
                      }
                      placeholder="Inspection notes for this unit..."
                    />
                  </label>
                </div>

                <div className={styles.unitMedia}>
                  <h4>Unit Media URLs</h4>

                  {unit.media.map((item, mediaIndex) => (
                    <div className={styles.arrayRow} key={`${unit.id}-${mediaIndex}`}>
                      <input
                        value={item}
                        onChange={(event) =>
                          updateUnitMedia(unitIndex, mediaIndex, event.target.value)
                        }
                        placeholder="https://example.com/unit-image.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => removeUnitMedia(unitIndex, mediaIndex)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addUnitMedia(unitIndex)}
                    className={styles.addSmall}
                  >
                    <PlusCircle size={16} />
                    Add Unit Media
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addUnit} className={styles.addUnit}>
            <PlusCircle size={17} />
            Add Another Unit
          </button>
        </section>

        <div className={styles.formActions}>
          <button type="submit" disabled={saving} className={styles.saveBtn}>
            <Save size={18} />
            {saving ? 'Saving...' : isEdit ? 'Update Property' : 'Create Property'}
          </button>
        </div>
      </form>
    </div>
  );
}
