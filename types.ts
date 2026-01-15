
export enum PricingMode {
  PER_KM = 'PER_KM',
  PER_ZONE = 'PER_ZONE',
  FIXED = 'FIXED'
}

export enum PaymentMethod {
  CASH = 'CASH',
  STRIPE = 'STRIPE'
}

export interface Vehicle {
  id: string;
  name: string;
  type: 'Sedan' | 'Van' | 'Luxury' | 'Minibus';
  minCapacity: number;
  capacity: number; // Max capacity
  luggage: number;
  basePrice: number;
  pricePerKm: number;
  image: string;
}

export interface Booking {
  id: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  destination: string;
  tripType: 'One Way' | 'Return';
  passengers: {
    adults: number;
    children: number;
  };
  vehicleId: string;
  totalDistance: number;
  totalDuration: number;
  totalPrice: number;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  flightDateTime?: string;
  paymentMethod: PaymentMethod;
  createdAt: string;
}

export interface Settings {
  stripeApiKey: string;
  pricingMode: PricingMode;
  currency: string;
  defaultPricePerKm: number;
}
