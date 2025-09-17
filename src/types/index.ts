export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: 'DOG_OWNER' | 'FIELD_OWNER' | 'ADMIN';
  phone: string | null;
  emailVerified: Date | null;
  createdAt: string;
  _count?: {
    bookings: number;
    fields: number;
  };
}

export interface Field {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  price?: number;
  pricePerHour?: number; // Keep for backward compatibility
  size: number;
  type: 'PRIVATE' | 'PUBLIC' | 'TRAINING';
  amenities: string[];
  images: string[];
  availability: any[];
  isActive: boolean;
  isClaimed?: boolean;
  owner: User;
  createdAt: string;
  bookingDuration?: string;
  maxDogs?: number;
  totalEarnings?: number;
  joinedOn?: string;
  _count?: {
    bookings: number;
  };
}

export interface Booking {
  id: string;
  userId: string;
  fieldId: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  dogs: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  recurringDays?: string[];
  isRecurring: boolean;
  recurringEndDate?: string;
  parentBookingId?: string;
  notes?: string;
  user: User;
  field: Field & { owner: User };
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  refundId?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalFields: number;
  totalBookings: number;
  totalRevenue: number;
  dogOwners: number;
  fieldOwners: number;
  upcomingBookings?: number;
  recentBookings: Booking[];
  growth?: {
    users: number;
    fields: number;
    bookings: number;
    revenue: number;
    upcomingBookings: number;
  };
}