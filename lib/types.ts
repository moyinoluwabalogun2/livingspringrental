export type PropertyCategory = 'Residential' | 'Commercial' | 'Land';
export type ListingPurpose = 'Rent' | 'Sale' | 'Lease';
export type StructureType = 'single-unit' | 'multi-unit';
export type UnitStatus = 'available' | 'rented' | 'sold';
export type PricePeriod = 'year' | 'month' | 'one-time';

export interface Unit {
  id?: string;
  unitType: string;
  price: number;
  pricePeriod: PricePeriod;
  bedrooms: number;
  bathrooms: number;
  toilets: number;
  status: UnitStatus;
  description: string;
  media: string[];
  inspectionNotes?: string;
}

export interface Property {
  id?: string;
  title: string;
  category: PropertyCategory;
  listingPurpose: ListingPurpose;
  structureType: StructureType;
  propertyType: string;
  location: string;
  address: string;
  description: string;
  media: string[];
  amenities: string[];
  featured: boolean;
  mapEmbedUrl: string;
  latitude: number;
  longitude: number;
  nearbyLandmarks: string[];
  units: Unit[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Inquiry {
  id?: string;
  name: string;
  phoneNumber: string;
  email: string;
  preferredInspectionDate: string;
  message: string;
  propertyId: string;
  propertyTitle: string;
  unitType?: string;
  price?: number;
  pricePeriod?: string;
  status: 'pending' | 'contacted' | 'completed';
  createdAt?: Date;
}