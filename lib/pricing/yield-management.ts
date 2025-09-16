/**
 * Advanced Dynamic Pricing Engine with Yield Management
 * Implements sophisticated pricing strategies for revenue optimization
 */

import { Database } from '@/lib/supabase/types';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface PricingRule {
  id: string;
  hotelId: string;
  roomTypeId?: string;
  name: string;
  ruleType: 'occupancy_based' | 'lead_time' | 'day_of_week' | 'seasonal' | 'event_based' | 'competitor_based';
  triggerConditions: {
    occupancyThresholds?: { min: number; max: number; multiplier: number }[];
    leadTimeDays?: { min: number; max: number; multiplier: number }[];
    daysOfWeek?: { [key: number]: number };
    seasonalPeriods?: { startDate: string; endDate: string; multiplier: number }[];
    eventTypes?: string[];
    competitorPricing?: { threshold: number; action: 'match' | 'undercut' | 'premium' };
  };
  priceAdjustments: {
    type: 'percentage' | 'fixed_amount' | 'absolute_rate';
    value: number;
    minRate?: number;
    maxRate?: number;
  };
  priority: number;
  isActive: boolean;
  validFrom?: Date;
  validTo?: Date;
}

export interface DemandForecast {
  date: string;
  predictedOccupancy: number;
  confidence: number;
  factors: {
    historical: number;
    events: number;
    seasonality: number;
    bookingPace: number;
  };
}

export interface PricingRecommendation {
  roomTypeId: string;
  date: string;
  currentRate: number;
  recommendedRate: number;
  confidence: number;
  reasoning: string[];
  potentialRevenue: number;
  competitorRates?: {
    average: number;
    min: number;
    max: number;
  };
}

export interface YieldOptimizationResult {
  hotelId: string;
  dateRange: { start: string; end: string };
  currentRevenue: number;
  optimizedRevenue: number;
  revenueLift: number;
  recommendations: PricingRecommendation[];
}

export class YieldManagementEngine {
  private supabase: SupabaseClient;
  private pricingRules: Map<string, PricingRule[]> = new Map();

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Load pricing rules for a hotel
   */
  async loadPricingRules(hotelId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('yield_management_rules')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      if (error) {
        throw new Error(`Failed to load pricing rules: ${error.message}`);
      }

      const rules: PricingRule[] = data?.map(rule => ({
        id: rule.id,
        hotelId: rule.hotel_id,
        roomTypeId: rule.room_type_id || undefined,
        name: rule.rule_name,
        ruleType: rule.rule_type as any,
        triggerConditions: rule.trigger_conditions as any,
        priceAdjustments: rule.price_adjustments as any,
        priority: rule.priority,
        isActive: rule.is_active,
        validFrom: rule.valid_from ? new Date(rule.valid_from) : undefined,
        validTo: rule.valid_to ? new Date(rule.valid_to) : undefined
      })) || [];

      this.pricingRules.set(hotelId, rules);
    } catch (error) {
      console.error('Error loading pricing rules:', error);
      throw error;
    }
  }

  /**
   * Calculate dynamic rate for a specific room type and date
   */
  async calculateDynamicRate(
    hotelId: string,
    roomTypeId: string,
    date: Date,
    baseRate: number,
    context?: {
      occupancyRate?: number;
      bookingLeadTime?: number;
      competitorRates?: number[];
      eventData?: any;
    }
  ): Promise<{
    finalRate: number;
    appliedRules: string[];
    breakdown: { rule: string; adjustment: number; multiplier: number }[];
  }> {
    try {
      // Ensure rules are loaded
      if (!this.pricingRules.has(hotelId)) {
        await this.loadPricingRules(hotelId);
      }

      const rules = this.pricingRules.get(hotelId) || [];
      let finalRate = baseRate;
      const appliedRules: string[] = [];
      const breakdown: { rule: string; adjustment: number; multiplier: number }[] = [];

      // Get additional context if not provided
      if (!context) {
        context = await this.getPricingContext(hotelId, roomTypeId, date);
      }

      // Apply rules in priority order
      for (const rule of rules) {
        // Skip if rule doesn't apply to this room type
        if (rule.roomTypeId && rule.roomTypeId !== roomTypeId) continue;

        // Skip if rule is outside valid date range
        if (rule.validFrom && date < rule.validFrom) continue;
        if (rule.validTo && date > rule.validTo) continue;

        // Check if rule conditions are met
        const shouldApply = this.evaluateRuleConditions(rule, date, context);
        if (!shouldApply) continue;

        // Apply the rule
        const adjustment = this.applyPricingRule(rule, finalRate, context);
        if (adjustment.applied) {
          finalRate = adjustment.newRate;
          appliedRules.push(rule.name);
          breakdown.push({
            rule: rule.name,
            adjustment: adjustment.adjustment,
            multiplier: adjustment.multiplier
          });
        }
      }

      // Check for dynamic pricing overrides in database
      const { data: override } = await this.supabase
        .from('dynamic_pricing')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('room_type_id', roomTypeId)
        .eq('date', date.toISOString().split('T')[0])
        .single();

      if (override && !override.close_out) {
        finalRate *= override.base_rate_multiplier;
        
        if (override.minimum_rate && finalRate < override.minimum_rate) {
          finalRate = override.minimum_rate;
        }
        if (override.maximum_rate && finalRate > override.maximum_rate) {
          finalRate = override.maximum_rate;
        }
      }

      return {
        finalRate: Math.round(finalRate * 100) / 100,
        appliedRules,
        breakdown
      };
    } catch (error) {
      console.error('Dynamic rate calculation error:', error);
      throw error;
    }
  }

  /**
   * Get pricing context for a specific date
   */
  private async getPricingContext(
    hotelId: string,
    roomTypeId: string,
    date: Date
  ): Promise<any> {
    try {
      // Get occupancy rate for the date
      const occupancyRate = await this.getOccupancyRate(hotelId, date);

      // Calculate booking lead time (average for the date)
      const bookingLeadTime = await this.getAverageLeadTime(hotelId, date);

      // Get competitor rates if available
      const competitorRates = await this.getCompetitorRates(hotelId, date);

      // Get event data
      const eventData = await this.getEventData(hotelId, date);

      return {
        occupancyRate,
        bookingLeadTime,
        competitorRates,
        eventData
      };
    } catch (error) {
      console.error('Error getting pricing context:', error);
      return {};
    }
  }

  /**
   * Evaluate if a pricing rule should be applied
   */
  private evaluateRuleConditions(
    rule: PricingRule,
    date: Date,
    context: any
  ): boolean {
    const conditions = rule.triggerConditions;

    switch (rule.ruleType) {
      case 'occupancy_based':
        if (conditions.occupancyThresholds && context.occupancyRate !== undefined) {
          return conditions.occupancyThresholds.some(threshold =>
            context.occupancyRate >= threshold.min && context.occupancyRate <= threshold.max
          );
        }
        break;

      case 'lead_time':
        if (conditions.leadTimeDays && context.bookingLeadTime !== undefined) {
          return conditions.leadTimeDays.some(threshold =>
            context.bookingLeadTime >= threshold.min && context.bookingLeadTime <= threshold.max
          );
        }
        break;

      case 'day_of_week':
        if (conditions.daysOfWeek) {
          const dayOfWeek = date.getDay();
          return conditions.daysOfWeek[dayOfWeek] !== undefined;
        }
        break;

      case 'seasonal':
        if (conditions.seasonalPeriods) {
          const dateStr = date.toISOString().split('T')[0];
          return conditions.seasonalPeriods.some(period =>
            dateStr >= period.startDate && dateStr <= period.endDate
          );
        }
        break;

      case 'event_based':
        if (conditions.eventTypes && context.eventData) {
          return conditions.eventTypes.some(eventType =>
            context.eventData.some((event: any) => event.type === eventType)
          );
        }
        break;

      case 'competitor_based':
        if (conditions.competitorPricing && context.competitorRates?.length > 0) {
          const avgCompetitorRate = context.competitorRates.reduce((a: number, b: number) => a + b) / context.competitorRates.length;
          return avgCompetitorRate > conditions.competitorPricing.threshold;
        }
        break;
    }

    return false;
  }

  /**
   * Apply a pricing rule and return the new rate
   */
  private applyPricingRule(
    rule: PricingRule,
    currentRate: number,
    context: any
  ): { applied: boolean; newRate: number; adjustment: number; multiplier: number } {
    const conditions = rule.triggerConditions;
    const adjustments = rule.priceAdjustments;
    let multiplier = 1;
    let adjustment = 0;

    switch (rule.ruleType) {
      case 'occupancy_based':
        const occupancyThreshold = conditions.occupancyThresholds?.find(threshold =>
          context.occupancyRate >= threshold.min && context.occupancyRate <= threshold.max
        );
        if (occupancyThreshold) {
          multiplier = occupancyThreshold.multiplier;
        }
        break;

      case 'lead_time':
        const leadTimeThreshold = conditions.leadTimeDays?.find(threshold =>
          context.bookingLeadTime >= threshold.min && context.bookingLeadTime <= threshold.max
        );
        if (leadTimeThreshold) {
          multiplier = leadTimeThreshold.multiplier;
        }
        break;

      case 'day_of_week':
        const dayOfWeek = new Date().getDay();
        if (conditions.daysOfWeek?.[dayOfWeek]) {
          multiplier = conditions.daysOfWeek[dayOfWeek];
        }
        break;

      case 'seasonal':
        const seasonalPeriod = conditions.seasonalPeriods?.find(period => {
          const dateStr = new Date().toISOString().split('T')[0];
          return dateStr >= period.startDate && dateStr <= period.endDate;
        });
        if (seasonalPeriod) {
          multiplier = seasonalPeriod.multiplier;
        }
        break;
    }

    let newRate = currentRate;

    switch (adjustments.type) {
      case 'percentage':
        newRate = currentRate * (1 + (adjustments.value / 100));
        adjustment = newRate - currentRate;
        break;

      case 'fixed_amount':
        newRate = currentRate + adjustments.value;
        adjustment = adjustments.value;
        break;

      case 'absolute_rate':
        newRate = adjustments.value;
        adjustment = newRate - currentRate;
        break;
    }

    // Apply multiplier if applicable
    if (multiplier !== 1) {
      newRate = currentRate * multiplier;
      adjustment = newRate - currentRate;
    }

    // Apply min/max constraints
    if (adjustments.minRate && newRate < adjustments.minRate) {
      newRate = adjustments.minRate;
    }
    if (adjustments.maxRate && newRate > adjustments.maxRate) {
      newRate = adjustments.maxRate;
    }

    return {
      applied: newRate !== currentRate,
      newRate,
      adjustment,
      multiplier
    };
  }

  /**
   * Generate yield optimization recommendations
   */
  async generateYieldRecommendations(
    hotelId: string,
    startDate: Date,
    endDate: Date
  ): Promise<YieldOptimizationResult> {
    try {
      const recommendations: PricingRecommendation[] = [];
      let currentRevenue = 0;
      let optimizedRevenue = 0;

      // Get all room types for the hotel
      const { data: roomTypes } = await this.supabase
        .from('room_types')
        .select('*')
        .eq('hotel_id', hotelId)
        .eq('status', 'active');

      if (!roomTypes) {
        throw new Error('No room types found for hotel');
      }

      // Generate recommendations for each room type and date
      const dates = this.generateDateRange(startDate, endDate);
      
      for (const roomType of roomTypes) {
        for (const date of dates) {
          const context = await this.getPricingContext(hotelId, roomType.id, date);
          const currentRate = roomType.base_price;

          // Calculate optimized rate
          const { finalRate, appliedRules } = await this.calculateDynamicRate(
            hotelId,
            roomType.id,
            date,
            currentRate,
            context
          );

          // Get demand forecast
          const demandForecast = await this.getDemandForecast(hotelId, roomType.id, date);

          // Calculate potential revenue
          const expectedBookings = Math.floor(
            roomType.total_inventory * (demandForecast?.predictedOccupancy || 0.7)
          );
          
          const currentDayRevenue = currentRate * expectedBookings;
          const optimizedDayRevenue = finalRate * expectedBookings;

          currentRevenue += currentDayRevenue;
          optimizedRevenue += optimizedDayRevenue;

          // Only include if there's a significant difference
          if (Math.abs(finalRate - currentRate) > 5) {
            recommendations.push({
              roomTypeId: roomType.id,
              date: date.toISOString().split('T')[0],
              currentRate,
              recommendedRate: finalRate,
              confidence: demandForecast?.confidence || 0.8,
              reasoning: appliedRules,
              potentialRevenue: optimizedDayRevenue - currentDayRevenue,
              competitorRates: context.competitorRates ? {
                average: context.competitorRates.reduce((a: number, b: number) => a + b) / context.competitorRates.length,
                min: Math.min(...context.competitorRates),
                max: Math.max(...context.competitorRates)
              } : undefined
            });
          }
        }
      }

      return {
        hotelId,
        dateRange: {
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        },
        currentRevenue,
        optimizedRevenue,
        revenueLift: optimizedRevenue - currentRevenue,
        recommendations: recommendations.sort((a, b) => b.potentialRevenue - a.potentialRevenue)
      };
    } catch (error) {
      console.error('Yield optimization error:', error);
      throw error;
    }
  }

  /**
   * Apply yield recommendations to dynamic pricing
   */
  async applyYieldRecommendations(
    hotelId: string,
    recommendations: PricingRecommendation[],
    approvedOnly: boolean = true
  ): Promise<{ applied: number; failed: number }> {
    let applied = 0;
    let failed = 0;

    try {
      for (const rec of recommendations) {
        try {
          // Calculate rate multiplier
          const { data: roomType } = await this.supabase
            .from('room_types')
            .select('base_price')
            .eq('id', rec.roomTypeId)
            .single();

          if (!roomType) {
            failed++;
            continue;
          }

          const multiplier = rec.recommendedRate / roomType.base_price;

          // Upsert dynamic pricing record
          const { error } = await this.supabase
            .from('dynamic_pricing')
            .upsert({
              hotel_id: hotelId,
              room_type_id: rec.roomTypeId,
              date: rec.date,
              base_rate_multiplier: multiplier,
              minimum_rate: rec.recommendedRate * 0.9, // 10% buffer
              maximum_rate: rec.recommendedRate * 1.1,
              close_out: false
            }, {
              onConflict: 'hotel_id,room_type_id,date'
            });

          if (error) {
            console.error('Failed to apply recommendation:', error);
            failed++;
          } else {
            applied++;
          }
        } catch (error) {
          console.error('Error applying recommendation:', error);
          failed++;
        }
      }

      return { applied, failed };
    } catch (error) {
      console.error('Error applying yield recommendations:', error);
      throw error;
    }
  }

  /**
   * Helper methods for getting context data
   */
  private async getOccupancyRate(hotelId: string, date: Date): Promise<number> {
    try {
      // Implement occupancy calculation based on bookings and availability
      const { data } = await this.supabase.rpc('get_occupancy_rate', {
        p_hotel_id: hotelId,
        p_date: date.toISOString().split('T')[0]
      });

      return data || 0.7; // Default assumption
    } catch (error) {
      return 0.7; // Default fallback
    }
  }

  private async getAverageLeadTime(hotelId: string, date: Date): Promise<number> {
    try {
      const { data } = await this.supabase
        .from('bookings')
        .select('created_at, check_in_date')
        .eq('hotel_id', hotelId)
        .eq('check_in_date', date.toISOString().split('T')[0])
        .eq('status', 'confirmed');

      if (!data?.length) return 14; // Default 2 weeks

      const leadTimes = data.map(booking => {
        const createdAt = new Date(booking.created_at);
        const checkIn = new Date(booking.check_in_date);
        return Math.floor((checkIn.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      });

      return leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length;
    } catch (error) {
      return 14; // Default fallback
    }
  }

  private async getCompetitorRates(hotelId: string, date: Date): Promise<number[]> {
    // This would integrate with competitor rate intelligence APIs
    // For now, return mock data
    return [150, 175, 165, 180, 155];
  }

  private async getEventData(hotelId: string, date: Date): Promise<any[]> {
    // This would integrate with local event calendars and data sources
    // For now, return empty array
    return [];
  }

  private async getDemandForecast(
    hotelId: string,
    roomTypeId: string,
    date: Date
  ): Promise<DemandForecast | null> {
    // Implement demand forecasting algorithm
    // This would analyze historical data, booking pace, etc.
    return {
      date: date.toISOString().split('T')[0],
      predictedOccupancy: 0.75,
      confidence: 0.8,
      factors: {
        historical: 0.7,
        events: 0.05,
        seasonality: 0.15,
        bookingPace: 0.1
      }
    };
  }

  private generateDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
}

/**
 * Promotional pricing manager
 */
export class PromotionalPricingManager {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Validate and apply promotional code
   */
  async validatePromoCode(
    promoCode: string,
    hotelId: string,
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    baseRate: number,
    guestId?: string
  ): Promise<{
    valid: boolean;
    discount: number;
    finalRate: number;
    message: string;
  }> {
    try {
      const { data: promo, error } = await this.supabase
        .from('promotions')
        .select('*')
        .eq('promo_code', promoCode.toUpperCase())
        .eq('hotel_id', hotelId)
        .eq('is_active', true)
        .single();

      if (error || !promo) {
        return {
          valid: false,
          discount: 0,
          finalRate: baseRate,
          message: 'Invalid promotional code'
        };
      }

      // Check validity dates
      const today = new Date().toISOString().split('T')[0];
      if (today < promo.valid_from || today > promo.valid_to) {
        return {
          valid: false,
          discount: 0,
          finalRate: baseRate,
          message: 'Promotional code has expired'
        };
      }

      // Check usage limits
      if (promo.max_uses && promo.current_uses >= promo.max_uses) {
        return {
          valid: false,
          discount: 0,
          finalRate: baseRate,
          message: 'Promotional code usage limit reached'
        };
      }

      // Check room type eligibility
      if (promo.applicable_room_types?.length > 0 && 
          !promo.applicable_room_types.includes(roomTypeId)) {
        return {
          valid: false,
          discount: 0,
          finalRate: baseRate,
          message: 'Promotional code not valid for selected room type'
        };
      }

      // Check blackout dates
      if (promo.blackout_dates?.length > 0) {
        const stayDates = this.generateDateRange(checkInDate, checkOutDate);
        const hasBlackoutDates = stayDates.some(date => 
          promo.blackout_dates?.includes(date.toISOString().split('T')[0])
        );
        
        if (hasBlackoutDates) {
          return {
            valid: false,
            discount: 0,
            finalRate: baseRate,
            message: 'Promotional code not valid for selected dates'
          };
        }
      }

      // Calculate discount
      let discount = 0;
      let finalRate = baseRate;

      switch (promo.promo_type) {
        case 'percentage':
          discount = baseRate * (promo.discount_value / 100);
          finalRate = baseRate - discount;
          break;
        
        case 'fixed_amount':
          discount = promo.discount_value;
          finalRate = Math.max(baseRate - discount, 0);
          break;
      }

      return {
        valid: true,
        discount,
        finalRate,
        message: `Promotional code applied: ${promo.promo_name}`
      };
    } catch (error) {
      console.error('Promo code validation error:', error);
      return {
        valid: false,
        discount: 0,
        finalRate: baseRate,
        message: 'Error validating promotional code'
      };
    }
  }

  private generateDateRange(startDate: Date, endDate: Date): Date[] {
    const dates: Date[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate < endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }
}