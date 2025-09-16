/**
 * Centralized Rate Calculation Service
 * Ensures consistent pricing across all booking components
 */

import { SupportedCurrency } from '@/lib/stripe/config';

export interface RateCalculationInput {
  baseRate: number;
  numberOfNights: number;
  hotelId: string;
  roomTypeId: string;
  checkInDate: Date;
  checkOutDate: Date;
  currency: SupportedCurrency;
  exchangeRates: Record<SupportedCurrency, number>;
  ratePlanType?: 'flexible' | 'non_refundable' | 'advance_purchase';
  guests: {
    adults: number;
    children: number;
  };
}

export interface RateBreakdown {
  baseAmount: number;
  taxes: TaxBreakdown;
  fees: FeeBreakdown;
  discounts: DiscountBreakdown;
  totalAmount: number;
  currency: SupportedCurrency;
  averageNightlyRate: number;
  depositAmount: number;
  depositPercentage: number;
}

export interface TaxBreakdown {
  vatTax: number;
  cityTax: number;
  serviceTax: number;
  totalTaxes: number;
  taxRate: number;
}

export interface FeeBreakdown {
  serviceFee: number;
  cleaningFee: number;
  resortFee: number;
  totalFees: number;
}

export interface DiscountBreakdown {
  earlyBookingDiscount: number;
  lengthOfStayDiscount: number;
  loyaltyDiscount: number;
  promotionalDiscount: number;
  totalDiscounts: number;
}

export class RateCalculator {
  private static readonly TAX_RATES = {
    // Israel tax rates by region
    'jerusalem': 0.17,
    'bethlehem': 0.16,
    'default': 0.17
  };

  private static readonly FEES_CONFIG = {
    // Dynamic fees based on hotel and room type
    serviceFee: {
      percentage: 0.05, // 5% of base rate
      minimum: 15,
      maximum: 50
    },
    cleaningFee: {
      perNight: 20,
      oneTime: false
    },
    cityTax: {
      perPersonPerNight: 5.50, // Jerusalem city tax
      maxNights: 7
    }
  };

  private static readonly DEPOSIT_RULES = {
    'flexible': 0.30,
    'non_refundable': 0.20,
    'advance_purchase': 0.50,
    'default': 0.30
  };

  /**
   * Calculate comprehensive rate breakdown
   */
  static calculateRate(input: RateCalculationInput): RateBreakdown {
    const {
      baseRate,
      numberOfNights,
      hotelId,
      checkInDate,
      currency,
      exchangeRates,
      ratePlanType = 'flexible',
      guests
    } = input;

    // Convert base rate to selected currency
    const exchangeRate = exchangeRates[currency] || 1;
    const baseAmountInCurrency = baseRate * exchangeRate * numberOfNights;

    // Calculate taxes
    const taxes = this.calculateTaxes(baseAmountInCurrency, hotelId, guests, numberOfNights);
    
    // Calculate fees
    const fees = this.calculateFees(baseAmountInCurrency, guests, numberOfNights);
    
    // Calculate discounts
    const discounts = this.calculateDiscounts(
      baseAmountInCurrency,
      checkInDate,
      numberOfNights,
      ratePlanType
    );

    // Calculate totals
    const subtotal = baseAmountInCurrency + taxes.totalTaxes + fees.totalFees;
    const totalAmount = subtotal - discounts.totalDiscounts;
    const averageNightlyRate = totalAmount / numberOfNights;

    // Calculate deposit
    const depositPercentage = this.DEPOSIT_RULES[ratePlanType] || this.DEPOSIT_RULES.default;
    const depositAmount = Math.round(totalAmount * depositPercentage);

    return {
      baseAmount: Math.round(baseAmountInCurrency),
      taxes,
      fees,
      discounts,
      totalAmount: Math.round(totalAmount),
      currency,
      averageNightlyRate: Math.round(averageNightlyRate),
      depositAmount,
      depositPercentage
    };
  }

  /**
   * Calculate taxes based on location and policies
   */
  private static calculateTaxes(
    baseAmount: number,
    hotelId: string,
    guests: { adults: number; children: number },
    numberOfNights: number
  ): TaxBreakdown {
    // Determine tax rate based on hotel location
    const location = this.getHotelLocation(hotelId);
    const taxRate = (this.TAX_RATES as any)[location] || this.TAX_RATES.default;

    // VAT/Service tax on room rate
    const vatTax = Math.round(baseAmount * taxRate);

    // City tax (per person per night, capped)
    const totalGuests = guests.adults + guests.children;
    const cityTaxNights = Math.min(numberOfNights, 7); // Max 7 nights
    const cityTax = Math.round(totalGuests * this.FEES_CONFIG.cityTax.perPersonPerNight * cityTaxNights);

    const totalTaxes = vatTax + cityTax;

    return {
      vatTax,
      cityTax,
      serviceTax: 0, // Not applicable in Israel
      totalTaxes,
      taxRate
    };
  }

  /**
   * Calculate fees based on hotel policies
   */
  private static calculateFees(
    baseAmount: number,
    guests: { adults: number; children: number },
    numberOfNights: number
  ): FeeBreakdown {
    // Service fee - percentage of base rate with min/max
    const serviceFeeCalc = baseAmount * this.FEES_CONFIG.serviceFee.percentage;
    const serviceFee = Math.max(
      this.FEES_CONFIG.serviceFee.minimum,
      Math.min(serviceFeeCalc, this.FEES_CONFIG.serviceFee.maximum)
    );

    // Cleaning fee
    const cleaningFee = this.FEES_CONFIG.cleaningFee.perNight * numberOfNights;

    const totalFees = Math.round(serviceFee + cleaningFee);

    return {
      serviceFee: Math.round(serviceFee),
      cleaningFee: Math.round(cleaningFee),
      resortFee: 0, // Not applicable
      totalFees
    };
  }

  /**
   * Calculate available discounts
   */
  private static calculateDiscounts(
    baseAmount: number,
    checkInDate: Date,
    numberOfNights: number,
    ratePlanType: string
  ): DiscountBreakdown {
    let totalDiscounts = 0;

    // Early booking discount (30+ days advance)
    const daysToCheckIn = Math.ceil((checkInDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const earlyBookingDiscount = daysToCheckIn >= 30 ? Math.round(baseAmount * 0.10) : 0;

    // Length of stay discount (7+ nights)
    const lengthOfStayDiscount = numberOfNights >= 7 ? Math.round(baseAmount * 0.05) : 0;

    // Non-refundable rate discount
    const promotionalDiscount = ratePlanType === 'non_refundable' ? Math.round(baseAmount * 0.15) : 0;

    totalDiscounts = earlyBookingDiscount + lengthOfStayDiscount + promotionalDiscount;

    return {
      earlyBookingDiscount,
      lengthOfStayDiscount,
      loyaltyDiscount: 0, // To be implemented
      promotionalDiscount,
      totalDiscounts
    };
  }

  /**
   * Get hotel location for tax calculation
   */
  private static getHotelLocation(hotelId: string): string {
    const locationMap: Record<string, string> = {
      'a1111111-1111-1111-1111-111111111111': 'jerusalem',
      'a2222222-2222-2222-2222-222222222222': 'jerusalem',
      'a3333333-3333-3333-3333-333333333333': 'bethlehem',
      'a4444444-4444-4444-4444-444444444444': 'jerusalem'
    };
    
    return locationMap[hotelId] || 'default';
  }

  /**
   * Format rate breakdown for display
   */
  static formatRateBreakdown(breakdown: RateBreakdown): string {
    return JSON.stringify({
      baseAmount: `${breakdown.currency} ${breakdown.baseAmount}`,
      taxes: breakdown.taxes.totalTaxes,
      fees: breakdown.fees.totalFees,
      discounts: breakdown.discounts.totalDiscounts,
      total: `${breakdown.currency} ${breakdown.totalAmount}`,
      deposit: `${breakdown.currency} ${breakdown.depositAmount}`
    }, null, 2);
  }

  /**
   * Validate rate calculation input
   */
  static validateInput(input: RateCalculationInput): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (input.baseRate <= 0) {
      errors.push('Base rate must be greater than 0');
    }

    if (input.numberOfNights <= 0) {
      errors.push('Number of nights must be greater than 0');
    }

    if (input.numberOfNights > 365) {
      errors.push('Number of nights cannot exceed 365');
    }

    if (input.guests.adults < 1) {
      errors.push('At least one adult is required');
    }

    if (input.guests.adults + input.guests.children > 8) {
      errors.push('Maximum 8 guests per booking');
    }

    if (input.checkInDate < new Date()) {
      errors.push('Check-in date cannot be in the past');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Helper function for components to get formatted pricing
 */
export function calculateAndFormatRate(input: RateCalculationInput): {
  breakdown: RateBreakdown;
  formatted: {
    baseAmount: string;
    totalAmount: string;
    depositAmount: string;
    averageNightly: string;
    savings?: string;
  };
} {
  const breakdown = RateCalculator.calculateRate(input);
  
  return {
    breakdown,
    formatted: {
      baseAmount: `${input.currency} ${breakdown.baseAmount}`,
      totalAmount: `${input.currency} ${breakdown.totalAmount}`,
      depositAmount: `${input.currency} ${breakdown.depositAmount}`,
      averageNightly: `${input.currency} ${breakdown.averageNightlyRate}`,
      savings: breakdown.discounts.totalDiscounts > 0 
        ? `${input.currency} ${breakdown.discounts.totalDiscounts}` 
        : undefined
    }
  };
}