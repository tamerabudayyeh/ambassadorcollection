// Booking System Type Definitions

export interface RoomType {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  size: number; // in sqm
  bedConfiguration: string;
  images: string[];
  amenities: string[];
  totalInventory: number;
  status: 'active' | 'inactive';
}

export interface RatePlan {
  id: string;
  roomTypeId: string;
  name: string;
  description: string;
  rateType: 'flexible' | 'non_refundable' | 'advance_purchase' | 'package';
  baseRateModifier: number; // percentage modifier from base price
  includesBreakfast: boolean;
  includesTaxes: boolean;
  cancellationPolicy: CancellationPolicy;
  paymentTerms: PaymentTerms;
  minimumStay?: number;
  maximumStay?: number;
  advanceBookingDays?: number; // required days in advance
  validFrom: Date;
  validTo: Date;
  daysOfWeek: number[]; // 0-6 for days of week this rate applies
  status: 'active' | 'inactive';
}

export interface CancellationPolicy {
  type: 'flexible' | 'moderate' | 'strict' | 'non_refundable';
  deadlineHours: number; // hours before check-in
  penaltyAmount?: number; // fixed amount or percentage
  penaltyType?: 'fixed' | 'percentage' | 'nights';
  description: string;
}

export interface PaymentTerms {
  type: 'pay_now' | 'pay_later' | 'deposit';
  depositAmount?: number;
  depositType?: 'fixed' | 'percentage';
  dueDate?: 'booking' | 'arrival' | 'days_before'; // when payment is due
  daysBefore?: number;
}

export interface DynamicPricing {
  id: string;
  roomTypeId: string;
  date: Date;
  baseRateMultiplier: number; // multiply base rate by this
  minimumRate?: number;
  maximumRate?: number;
  closeOut: boolean; // room not available for sale
  minimumStay?: number;
  closedToArrival: boolean;
  closedToDeparture: boolean;
}

export interface Availability {
  roomTypeId: string;
  date: Date;
  totalRooms: number;
  bookedRooms: number;
  blockedRooms: number;
  availableRooms: number;
  netAvailable: number; // available - (holds + tentative)
}

export interface Booking {
  id: string;
  confirmationNumber: string;
  hotelId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed';
  
  // Guest Information
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry?: string;
  specialRequests?: string;
  
  // Stay Details
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children: number;
  infants?: number;
  
  // Room Details
  roomTypeId: string;
  roomTypeName: string;
  ratePlanId: string;
  ratePlanName: string;
  roomNumber?: string; // assigned at check-in
  
  // Pricing
  roomRate: number; // per night rate
  numberOfNights: number;
  roomTotal: number;
  taxes: number;
  fees: number;
  totalAmount: number;
  currency: string;
  
  // Payment
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod?: 'card' | 'cash' | 'bank_transfer' | 'other';
  paymentIntentId?: string; // Payment processor reference
  depositAmount?: number;
  depositPaid?: boolean;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  
  // Source
  bookingSource: 'website' | 'phone' | 'email' | 'walk_in' | 'ota';
  bookingChannel?: string; // specific OTA or channel
  
  // Additional
  notes?: string;
  tags?: string[];
}

export interface BookingModification {
  id: string;
  bookingId: string;
  modificationType: 'date_change' | 'room_change' | 'guest_change' | 'cancellation';
  previousValues: any;
  newValues: any;
  reason?: string;
  modifiedBy: string;
  modifiedAt: Date;
}

export interface InventoryBlock {
  id: string;
  hotelId: string;
  roomTypeId: string;
  blockName: string;
  startDate: Date;
  endDate: Date;
  roomsBlocked: number;
  reason: 'maintenance' | 'group' | 'event' | 'other';
  notes?: string;
  createdBy: string;
  createdAt: Date;
}

// Availability Check Request/Response
export interface AvailabilityRequest {
  hotelId: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children?: number;
  roomCount?: number;
  ratePlanId?: string;
  promocode?: string;
}

export interface AvailableRoom {
  roomType: RoomType;
  ratePlans: RatePlanWithPricing[];
  availableCount: number;
  lowestRate: number;
  originalRate?: number;
  taxes: number;
  fees: number;
  totalPrice: number;
}

export interface RatePlanWithPricing extends RatePlan {
  nightlyRates: { date: Date; rate: number }[];
  averageRate: number;
  totalRoomCost: number;
  totalTaxes: number;
  totalFees: number;
  totalPrice: number;
  savings?: number;
  savingsPercentage?: number;
}

// Booking Flow States
export interface BookingSession {
  sessionId: string;
  expiresAt: Date;
  hotel: any;
  searchCriteria: AvailabilityRequest;
  selectedRoom?: AvailableRoom;
  selectedRatePlan?: RatePlanWithPricing;
  guestDetails?: GuestDetails;
  paymentDetails?: PaymentDetails;
  bookingHold?: BookingHold;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  address?: string;
  city?: string;
  postalCode?: string;
  specialRequests?: string;
  marketingOptIn?: boolean;
}

export interface PaymentDetails {
  paymentMethod: 'card' | 'bank_transfer' | 'pay_at_hotel';
  cardDetails?: {
    last4: string;
    brand: string;
    expiryMonth: number;
    expiryYear: number;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export interface BookingHold {
  holdId: string;
  roomTypeId: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomCount: number;
  expiresAt: Date;
  status: 'active' | 'expired' | 'converted';
}

// API Response Types
export interface BookingApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: Date;
    requestId: string;
  };
}

// Validation Rules
export interface BookingValidation {
  minimumAdvanceBooking: number; // hours
  maximumAdvanceBooking: number; // days
  minimumStayNights: number;
  maximumStayNights: number;
  minimumAge: number;
  maxGuestsPerRoom: number;
  maxRoomsPerBooking: number;
}

// Reporting & Analytics
export interface BookingMetrics {
  date: Date;
  hotelId: string;
  totalBookings: number;
  totalRevenue: number;
  averageDailyRate: number;
  occupancyRate: number;
  revPAR: number; // Revenue per available room
  cancellationRate: number;
  noShowRate: number;
  averageLeadTime: number; // days between booking and check-in
  averageLengthOfStay: number;
  bookingSourceBreakdown: Record<string, number>;
}