
import { Vehicle, Settings, PricingMode } from './types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'v1',
    name: 'Economy Sedan',
    type: 'Sedan',
    minCapacity: 1,
    capacity: 4,
    luggage: 2,
    basePrice: 20,
    pricePerKm: 1.2,
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'v2',
    name: 'Business Van',
    type: 'Van',
    minCapacity: 1,
    capacity: 8,
    luggage: 6,
    basePrice: 35,
    pricePerKm: 1.8,
    image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'v3',
    name: 'Luxury Executive',
    type: 'Luxury',
    minCapacity: 1,
    capacity: 3,
    luggage: 2,
    basePrice: 50,
    pricePerKm: 2.5,
    image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=400',
  }
];

export const INITIAL_SETTINGS: Settings = {
  stripeApiKey: '',
  pricingMode: PricingMode.PER_KM,
  currency: 'EUR',
  defaultPricePerKm: 1.5,
};
