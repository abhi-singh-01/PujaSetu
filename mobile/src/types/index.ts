export type UserRole = 'customer' | 'pandit' | 'nau' | 'admin';

export interface User {
  id: string;
  mobile: string;
  name: string;
  role: UserRole;
  profilePhoto?: string;
  location?: {
    state?: string;
    district?: string;
    city?: string;
  };
  isVerified?: boolean;
}

export interface Provider {
  _id: string;
  providerType: 'pandit' | 'nau';
  fullName: string;
  profilePhoto?: string;
  experienceYears: number;
  languages: string[];
  services: string[];
  charges: {
    hourly: number;
    halfDay: number;
    fullDay: number;
    multiDay: number;
  };
  location: {
    state: string;
    district: string;
    city: string;
  };
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  verificationStatus: string;
  bio?: string;
  servicePricing?: Array<{
    serviceName: string;
    hourly: number;
    halfDay: number;
    fullDay: number;
    multiDay: number;
  }>;
}

export interface Booking {
  _id: string;
  bookingType: string;
  eventType: string;
  scheduledDate: string;
  startTime: string;
  amount: number;
  advancePercent?: number;
  advanceAmount: number;
  remainingAmount: number;
  status: string;
  address?: Record<string, string>;
  provider?: Provider;
  payment?: {
    advancePaid?: boolean;
    remainingPaid?: boolean;
    remainingPaymentUnlocked?: boolean;
    receiptNumber?: string;
  };
  completionOtp?: {
    customerVerified?: boolean;
    providerVerified?: boolean;
    expiresAt?: string;
  };
}

export interface LocationState {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  cities?: string[];
}
