import { 
  RoomType, 
  RatePlan, 
  DynamicPricing, 
  Availability,
  AvailabilityRequest,
  AvailableRoom,
  RatePlanWithPricing,
  CancellationPolicy,
  PaymentTerms
} from './booking-types';
import { addDays, differenceInDays, format, isSameDay, isWithinInterval } from 'date-fns';

// Mock Room Types Data
export const mockRoomTypes: Record<string, RoomType[]> = {
  'ambassador-jerusalem': [
    {
      id: 'rm-aje-01',
      hotelId: 'ambassador-jerusalem',
      name: 'Classic King Room',
      description: 'Elegant room with king-size bed, city views, and modern amenities',
      basePrice: 280,
      maxOccupancy: 2,
      size: 32,
      bedConfiguration: '1 King Bed',
      images: [
        'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
        'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg'
      ],
      amenities: [
        'Free WiFi',
        'Air Conditioning',
        'Mini Bar',
        'Safe',
        'Flat-screen TV',
        'Coffee/Tea Maker',
        'Bathroom with Shower',
        'Hairdryer',
        'Iron & Ironing Board',
        'Work Desk'
      ],
      totalInventory: 15,
      status: 'active'
    },
    {
      id: 'rm-aje-02',
      hotelId: 'ambassador-jerusalem',
      name: 'Deluxe Twin Room',
      description: 'Spacious room with two twin beds, perfect for friends or colleagues',
      basePrice: 300,
      maxOccupancy: 2,
      size: 35,
      bedConfiguration: '2 Twin Beds',
      images: [
        'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg'
      ],
      amenities: [
        'Free WiFi',
        'Air Conditioning',
        'Mini Bar',
        'Safe',
        'Flat-screen TV',
        'Coffee/Tea Maker',
        'Bathroom with Bathtub',
        'Bathrobes & Slippers',
        'Premium Toiletries',
        'Work Desk',
        'Seating Area'
      ],
      totalInventory: 12,
      status: 'active'
    },
    {
      id: 'rm-aje-03',
      hotelId: 'ambassador-jerusalem',
      name: 'Executive Suite',
      description: 'Luxurious suite with separate living area and panoramic city views',
      basePrice: 480,
      maxOccupancy: 4,
      size: 65,
      bedConfiguration: '1 King Bed + Sofa Bed',
      images: [
        'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg'
      ],
      amenities: [
        'Free WiFi',
        'Air Conditioning',
        'Mini Bar',
        'In-room Safe',
        '55" Flat-screen TV',
        'Nespresso Machine',
        'Separate Living Room',
        'Dining Area',
        'Marble Bathroom with Separate Shower and Bathtub',
        'Luxury Bath Amenities',
        'Bathrobes & Slippers',
        'Work Desk with Ergonomic Chair',
        'Complimentary Fruit Basket',
        'Evening Turndown Service'
      ],
      totalInventory: 5,
      status: 'active'
    },
    {
      id: 'rm-aje-04',
      hotelId: 'ambassador-jerusalem',
      name: 'Family Room',
      description: 'Comfortable room designed for families with children',
      basePrice: 350,
      maxOccupancy: 4,
      size: 42,
      bedConfiguration: '1 King Bed + 2 Single Beds',
      images: [
        'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg'
      ],
      amenities: [
        'Free WiFi',
        'Air Conditioning',
        'Mini Fridge',
        'Safe',
        'Two Flat-screen TVs',
        'Coffee/Tea Maker',
        'Spacious Bathroom',
        'Kids Amenities',
        'Baby Crib (on request)',
        'Game Console',
        'Board Games'
      ],
      totalInventory: 8,
      status: 'active'
    }
  ],
  'ambassador-boutique': [
    {
      id: 'rm-abo-01',
      hotelId: 'ambassador-boutique',
      name: 'Boutique Room',
      description: 'Intimate and stylish room with unique design elements',
      basePrice: 220,
      maxOccupancy: 2,
      size: 28,
      bedConfiguration: '1 Queen Bed',
      images: [
        'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg'
      ],
      amenities: [
        'Free WiFi',
        'Climate Control',
        'Mini Bar',
        'Safe',
        'Smart TV',
        'Locally Sourced Toiletries',
        'Rain Shower',
        'Original Artwork',
        'Vintage Furniture'
      ],
      totalInventory: 10,
      status: 'active'
    },
    {
      id: 'rm-abo-02',
      hotelId: 'ambassador-boutique',
      name: 'Artist Suite',
      description: 'Creative space featuring local art and designer furnishings',
      basePrice: 380,
      maxOccupancy: 3,
      size: 48,
      bedConfiguration: '1 King Bed',
      images: [
        'https://images.pexels.com/photos/1579253/pexels-photo-1579253.jpeg'
      ],
      amenities: [
        'Free WiFi',
        'Climate Control',
        'Curated Mini Bar',
        'Safe',
        'Smart TV with Art Mode',
        'Record Player with Vinyl Collection',
        'Designer Bathroom',
        'Luxury Organic Toiletries',
        'Private Balcony',
        'Art Library',
        'Yoga Mat',
        'Meditation Cushions'
      ],
      totalInventory: 4,
      status: 'active'
    }
  ]
};

// Mock Rate Plans
export const mockRatePlans: RatePlan[] = [
  {
    id: 'rp-001',
    roomTypeId: 'rm-aje-01',
    name: 'Flexible Rate',
    description: 'Best available rate with free cancellation',
    rateType: 'flexible',
    baseRateModifier: 1.0,
    includesBreakfast: true,
    includesTaxes: false,
    cancellationPolicy: {
      type: 'flexible',
      deadlineHours: 24,
      penaltyAmount: 0,
      penaltyType: 'fixed',
      description: 'Free cancellation up to 24 hours before arrival'
    },
    paymentTerms: {
      type: 'pay_later',
      dueDate: 'arrival'
    },
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2025-12-31'),
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    status: 'active'
  },
  {
    id: 'rp-002',
    roomTypeId: 'rm-aje-01',
    name: 'Non-Refundable Saver',
    description: 'Save 15% with non-refundable booking',
    rateType: 'non_refundable',
    baseRateModifier: 0.85,
    includesBreakfast: true,
    includesTaxes: false,
    cancellationPolicy: {
      type: 'non_refundable',
      deadlineHours: 0,
      penaltyAmount: 100,
      penaltyType: 'percentage',
      description: 'Non-refundable booking'
    },
    paymentTerms: {
      type: 'pay_now',
      dueDate: 'booking'
    },
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2025-12-31'),
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    status: 'active'
  },
  {
    id: 'rp-003',
    roomTypeId: 'rm-aje-01',
    name: 'Advance Purchase - 21 Days',
    description: 'Book 21 days in advance and save 20%',
    rateType: 'advance_purchase',
    baseRateModifier: 0.80,
    includesBreakfast: true,
    includesTaxes: false,
    cancellationPolicy: {
      type: 'strict',
      deadlineHours: 168, // 7 days
      penaltyAmount: 1,
      penaltyType: 'nights',
      description: 'Cancellation allowed up to 7 days before arrival with 1 night penalty'
    },
    paymentTerms: {
      type: 'deposit',
      depositAmount: 50,
      depositType: 'percentage',
      dueDate: 'booking',
      daysBefore: 21
    },
    advanceBookingDays: 21,
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2025-12-31'),
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    status: 'active'
  }
];

// Dynamic Pricing Engine
export function calculateDynamicPrice(
  basePrice: number,
  checkInDate: Date,
  checkOutDate: Date,
  occupancyRate: number = 0.7
): number[] {
  const nights = differenceInDays(checkOutDate, checkInDate);
  const prices: number[] = [];
  
  for (let i = 0; i < nights; i++) {
    const currentDate = addDays(checkInDate, i);
    const dayOfWeek = currentDate.getDay();
    
    let multiplier = 1.0;
    
    // Weekend pricing (Friday & Saturday)
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      multiplier *= 1.25;
    }
    
    // Seasonal pricing
    const month = currentDate.getMonth();
    if (month >= 6 && month <= 8) { // Summer peak
      multiplier *= 1.30;
    } else if (month === 11 || month === 0) { // Holiday season
      multiplier *= 1.35;
    }
    
    // Occupancy-based pricing
    if (occupancyRate > 0.85) {
      multiplier *= 1.20;
    } else if (occupancyRate > 0.75) {
      multiplier *= 1.10;
    }
    
    // Last-minute deals (booking within 2 days)
    const daysUntilCheckIn = differenceInDays(currentDate, new Date());
    if (daysUntilCheckIn <= 2 && daysUntilCheckIn >= 0 && occupancyRate < 0.5) {
      multiplier *= 0.85;
    }
    
    prices.push(Math.round(basePrice * multiplier));
  }
  
  return prices;
}

// Check Room Availability
export async function checkAvailability(
  request: AvailabilityRequest
): Promise<AvailableRoom[]> {
  const hotelSlug = request.hotelId;
  const roomTypes = mockRoomTypes[hotelSlug] || [];
  const availableRooms: AvailableRoom[] = [];
  
  for (const roomType of roomTypes) {
    // Skip if room doesn't meet occupancy requirements
    if (roomType.maxOccupancy < request.adults + (request.children || 0)) {
      continue;
    }
    
    // Calculate availability (mock - in production, check actual bookings)
    const nights = differenceInDays(request.checkOutDate, request.checkInDate);
    const occupancyRate = Math.random() * 0.4 + 0.5; // Mock 50-90% occupancy
    const availableCount = Math.max(
      1,
      Math.floor(roomType.totalInventory * (1 - occupancyRate))
    );
    
    // Get applicable rate plans
    const applicableRatePlans = mockRatePlans
      .filter(rp => rp.roomTypeId === roomType.id && rp.status === 'active')
      .map(ratePlan => {
        // Calculate nightly rates with dynamic pricing
        const nightlyRates = calculateDynamicPrice(
          roomType.basePrice * ratePlan.baseRateModifier,
          request.checkInDate,
          request.checkOutDate,
          occupancyRate
        );
        
        const totalRoomCost = nightlyRates.reduce((sum, rate) => sum + rate, 0);
        const averageRate = totalRoomCost / nights;
        const totalTaxes = totalRoomCost * 0.17; // 17% VAT
        const totalFees = 25 * nights; // Service fee per night
        const totalPrice = totalRoomCost + totalTaxes + totalFees;
        
        // Calculate savings for special rates
        let savings = 0;
        let savingsPercentage = 0;
        if (ratePlan.baseRateModifier < 1.0) {
          const originalTotal = roomType.basePrice * nights;
          savings = originalTotal - totalRoomCost;
          savingsPercentage = (1 - ratePlan.baseRateModifier) * 100;
        }
        
        const ratePlanWithPricing: RatePlanWithPricing = {
          ...ratePlan,
          nightlyRates: nightlyRates.map((rate, index) => ({
            date: addDays(request.checkInDate, index),
            rate
          })),
          averageRate,
          totalRoomCost,
          totalTaxes,
          totalFees,
          totalPrice,
          savings,
          savingsPercentage
        };
        
        return ratePlanWithPricing;
      });
    
    if (applicableRatePlans.length > 0) {
      const lowestRate = Math.min(...applicableRatePlans.map(rp => rp.averageRate));
      const lowestTotalPrice = Math.min(...applicableRatePlans.map(rp => rp.totalPrice));
      
      availableRooms.push({
        roomType,
        ratePlans: applicableRatePlans,
        availableCount,
        lowestRate,
        originalRate: roomType.basePrice,
        taxes: lowestTotalPrice * 0.17,
        fees: 25 * nights,
        totalPrice: lowestTotalPrice
      });
    }
  }
  
  // Sort by lowest rate
  availableRooms.sort((a, b) => a.lowestRate - b.lowestRate);
  
  return availableRooms;
}

// Generate mock availability calendar
export function generateAvailabilityCalendar(
  roomTypeId: string,
  startDate: Date,
  days: number = 30
): Availability[] {
  const calendar: Availability[] = [];
  const roomType = Object.values(mockRoomTypes)
    .flat()
    .find(rt => rt.id === roomTypeId);
  
  if (!roomType) return calendar;
  
  for (let i = 0; i < days; i++) {
    const date = addDays(startDate, i);
    const dayOfWeek = date.getDay();
    
    // Simulate varying occupancy
    let occupancyRate = 0.5 + Math.random() * 0.4; // 50-90% base occupancy
    
    // Higher occupancy on weekends
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      occupancyRate = Math.min(0.95, occupancyRate + 0.15);
    }
    
    const bookedRooms = Math.floor(roomType.totalInventory * occupancyRate);
    const blockedRooms = Math.random() > 0.9 ? 1 : 0; // 10% chance of blocked room
    const availableRooms = roomType.totalInventory - bookedRooms - blockedRooms;
    
    calendar.push({
      roomTypeId,
      date,
      totalRooms: roomType.totalInventory,
      bookedRooms,
      blockedRooms,
      availableRooms,
      netAvailable: Math.max(0, availableRooms - 1) // Keep 1 room buffer
    });
  }
  
  return calendar;
}

// Check if specific dates are available
export function isDatesAvailable(
  roomTypeId: string,
  checkIn: Date,
  checkOut: Date,
  roomsNeeded: number = 1
): boolean {
  const calendar = generateAvailabilityCalendar(roomTypeId, checkIn, differenceInDays(checkOut, checkIn));
  
  return calendar.every(day => day.netAvailable >= roomsNeeded);
}

// Calculate total price for a booking
export function calculateBookingTotal(
  roomType: RoomType,
  ratePlan: RatePlan,
  checkIn: Date,
  checkOut: Date,
  rooms: number = 1
): {
  nightlyRates: number[];
  subtotal: number;
  taxes: number;
  fees: number;
  total: number;
  averageRate: number;
} {
  const nights = differenceInDays(checkOut, checkIn);
  const nightlyRates = calculateDynamicPrice(
    roomType.basePrice * ratePlan.baseRateModifier,
    checkIn,
    checkOut
  );
  
  const subtotal = nightlyRates.reduce((sum, rate) => sum + rate, 0) * rooms;
  const taxes = subtotal * 0.17; // 17% VAT
  const fees = 25 * nights * rooms; // Service fee
  const total = subtotal + taxes + fees;
  const averageRate = subtotal / nights / rooms;
  
  return {
    nightlyRates,
    subtotal,
    taxes,
    fees,
    total,
    averageRate
  };
}