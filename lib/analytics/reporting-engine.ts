/**
 * Comprehensive Analytics and Reporting Engine
 * Generates revenue management reports, KPI dashboards, and business intelligence
 */

import { Database } from '@/lib/supabase/types';
import { createClient } from '@supabase/supabase-js';

type SupabaseClient = ReturnType<typeof createClient<Database>>;

export interface RevenueMetrics {
  totalRevenue: number;
  roomRevenue: number;
  ancillaryRevenue: number;
  averageDailyRate: number;
  revPAR: number; // Revenue per Available Room
  occupancyRate: number;
  averageLengthOfStay: number;
  totalBookings: number;
  cancellationRate: number;
  noShowRate: number;
  repeatGuestRate: number;
  directBookingRate: number;
  leadTime: number;
  conversionRate?: number;
}

export interface ChannelPerformance {
  channelName: string;
  bookings: number;
  revenue: number;
  averageRate: number;
  conversionRate: number;
  commissionPaid: number;
  netRevenue: number;
  marketShare: number;
}

export interface GuestAnalytics {
  totalGuests: number;
  newGuests: number;
  returningGuests: number;
  vipGuests: number;
  averageSpend: number;
  topCountries: { country: string; count: number; revenue: number }[];
  guestSatisfaction: number;
  loyaltyProgramEnrollment: number;
}

export interface OperationalMetrics {
  checkInTime: number; // average in minutes
  checkOutTime: number;
  housekeepingEfficiency: number;
  maintenanceRequests: number;
  guestComplaints: number;
  roomReadiness: number; // percentage
  staffProductivity: number;
  energyConsumption?: number;
  waterUsage?: number;
}

export interface ForecastData {
  date: string;
  predictedOccupancy: number;
  predictedRevenue: number;
  confidence: number;
  factors: {
    historical: number;
    seasonal: number;
    events: number;
    bookingPace: number;
    marketTrends: number;
  };
}

export interface CompetitiveAnalysis {
  hotelName: string;
  averageRate: number;
  occupancyEstimate: number;
  revPAREstimate: number;
  onlineRating: number;
  reviewCount: number;
  marketPosition: 'leader' | 'challenger' | 'follower' | 'niche';
}

export interface DashboardData {
  period: { start: Date; end: Date };
  revenue: RevenueMetrics;
  channels: ChannelPerformance[];
  guests: GuestAnalytics;
  operations: OperationalMetrics;
  forecast: ForecastData[];
  competitive?: CompetitiveAnalysis[];
  alerts: PerformanceAlert[];
}

export interface PerformanceAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  category: 'revenue' | 'operations' | 'guest_service' | 'inventory';
  title: string;
  description: string;
  metric: string;
  currentValue: number;
  threshold: number;
  recommendation: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
}

export interface ReportConfiguration {
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  hotelIds: string[];
  startDate: Date;
  endDate: Date;
  metrics: string[];
  groupBy?: 'hotel' | 'room_type' | 'channel' | 'date';
  compareWith?: 'previous_period' | 'same_period_last_year' | 'budget';
  includeForecasting?: boolean;
  includeCompetitive?: boolean;
  format: 'json' | 'pdf' | 'excel' | 'csv';
}

export class AnalyticsEngine {
  private supabase: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Generate comprehensive dashboard data
   */
  async generateDashboard(
    hotelIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<DashboardData> {
    try {
      const [
        revenue,
        channels,
        guests,
        operations,
        forecast,
        alerts
      ] = await Promise.all([
        this.calculateRevenueMetrics(hotelIds, startDate, endDate),
        this.analyzeChannelPerformance(hotelIds, startDate, endDate),
        this.analyzeGuestMetrics(hotelIds, startDate, endDate),
        this.calculateOperationalMetrics(hotelIds, startDate, endDate),
        this.generateRevenueForecast(hotelIds, endDate, 30), // 30 days forecast
        this.generatePerformanceAlerts(hotelIds)
      ]);

      return {
        period: { start: startDate, end: endDate },
        revenue,
        channels,
        guests,
        operations,
        forecast,
        alerts
      };
    } catch (error) {
      console.error('Dashboard generation error:', error);
      throw error;
    }
  }

  /**
   * Calculate revenue metrics and KPIs
   */
  async calculateRevenueMetrics(
    hotelIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<RevenueMetrics> {
    try {
      // Get booking data for the period
      const { data: bookings, error: bookingsError } = await this.supabase
        .from('bookings')
        .select(`
          *,
          hotels(total_rooms),
          booking_addons(total_price)
        `)
        .in('hotel_id', hotelIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('status', ['confirmed', 'completed']);

      if (bookingsError) {
        throw new Error(`Failed to get bookings: ${bookingsError.message}`);
      }

      const confirmedBookings = bookings || [];
      const totalBookings = confirmedBookings.length;

      // Calculate revenue metrics
      const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.total_amount, 0);
      const roomRevenue = confirmedBookings.reduce((sum, b) => sum + b.room_total, 0);
      const ancillaryRevenue = confirmedBookings.reduce((sum, b) => 
        sum + (b.booking_addons?.reduce((addonSum: number, addon: any) => addonSum + addon.total_price, 0) || 0), 0
      );

      const totalRoomNights = confirmedBookings.reduce((sum, b) => sum + b.number_of_nights, 0);
      const averageDailyRate = totalRoomNights > 0 ? roomRevenue / totalRoomNights : 0;

      // Calculate occupancy rate
      const totalRooms = confirmedBookings.reduce((sum, b) => sum + (b.hotels?.total_rooms || 0), 0);
      const totalAvailableRoomNights = totalRooms * this.calculateDaysBetween(startDate, endDate);
      const occupancyRate = totalAvailableRoomNights > 0 ? totalRoomNights / totalAvailableRoomNights : 0;

      const revPAR = totalAvailableRoomNights > 0 ? roomRevenue / totalAvailableRoomNights : 0;

      // Calculate other metrics
      const averageLengthOfStay = totalBookings > 0 ? 
        confirmedBookings.reduce((sum, b) => sum + b.number_of_nights, 0) / totalBookings : 0;

      // Get cancellations for the period
      const { data: cancellations } = await this.supabase
        .from('bookings')
        .select('id')
        .in('hotel_id', hotelIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'cancelled');

      const cancellationRate = (totalBookings + (cancellations?.length || 0)) > 0 ? 
        (cancellations?.length || 0) / (totalBookings + (cancellations?.length || 0)) : 0;

      // Get no-shows
      const { data: noShows } = await this.supabase
        .from('bookings')
        .select('id')
        .in('hotel_id', hotelIds)
        .gte('check_in_date', startDate.toISOString().split('T')[0])
        .lte('check_in_date', endDate.toISOString().split('T')[0])
        .eq('status', 'no_show');

      const noShowRate = totalBookings > 0 ? (noShows?.length || 0) / totalBookings : 0;

      // Calculate repeat guest rate
      const guestIds = confirmedBookings.map(b => b.guest_id);
      const { data: guestBookingCounts } = await this.supabase
        .from('bookings')
        .select('guest_id')
        .in('guest_id', guestIds)
        .in('status', ['confirmed', 'completed']);

      const guestCounts = new Map<string, number>();
      guestBookingCounts?.forEach(b => {
        guestCounts.set(b.guest_id, (guestCounts.get(b.guest_id) || 0) + 1);
      });

      const repeatGuests = Array.from(guestCounts.values()).filter(count => count > 1).length;
      const repeatGuestRate = guestIds.length > 0 ? repeatGuests / guestIds.length : 0;

      // Calculate direct booking rate
      const directBookings = confirmedBookings.filter(b => b.booking_source === 'website').length;
      const directBookingRate = totalBookings > 0 ? directBookings / totalBookings : 0;

      // Calculate average lead time
      const leadTimes = confirmedBookings.map(b => {
        const bookingDate = new Date(b.created_at);
        const checkInDate = new Date(b.check_in_date);
        return Math.floor((checkInDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      });
      const leadTime = leadTimes.length > 0 ? 
        leadTimes.reduce((sum, days) => sum + days, 0) / leadTimes.length : 0;

      return {
        totalRevenue,
        roomRevenue,
        ancillaryRevenue,
        averageDailyRate,
        revPAR,
        occupancyRate,
        averageLengthOfStay,
        totalBookings,
        cancellationRate,
        noShowRate,
        repeatGuestRate,
        directBookingRate,
        leadTime
      };
    } catch (error) {
      console.error('Revenue metrics calculation error:', error);
      throw error;
    }
  }

  /**
   * Analyze channel performance
   */
  async analyzeChannelPerformance(
    hotelIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<ChannelPerformance[]> {
    try {
      const { data: bookings, error } = await this.supabase
        .from('bookings')
        .select('booking_source, booking_channel, total_amount, room_total, status')
        .in('hotel_id', hotelIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('status', ['confirmed', 'completed']);

      if (error) {
        throw new Error(`Failed to get channel data: ${error.message}`);
      }

      const channelData = new Map<string, {
        bookings: number;
        revenue: number;
        commissionPaid: number;
      }>();

      // Group by channel
      bookings?.forEach(booking => {
        const channel = booking.booking_channel || booking.booking_source;
        const existing = channelData.get(channel) || { bookings: 0, revenue: 0, commissionPaid: 0 };
        
        existing.bookings += 1;
        existing.revenue += booking.total_amount;
        
        // Calculate commission (example rates)
        const commissionRates: { [key: string]: number } = {
          'booking.com': 0.15,
          'expedia': 0.18,
          'agoda': 0.16,
          'website': 0,
          'phone': 0,
          'email': 0
        };
        
        const rate = commissionRates[channel.toLowerCase()] || 0.12;
        existing.commissionPaid += booking.total_amount * rate;
        
        channelData.set(channel, existing);
      });

      const totalRevenue = Array.from(channelData.values()).reduce((sum, ch) => sum + ch.revenue, 0);
      const totalBookings = Array.from(channelData.values()).reduce((sum, ch) => sum + ch.bookings, 0);

      return Array.from(channelData.entries()).map(([channel, data]) => ({
        channelName: channel,
        bookings: data.bookings,
        revenue: data.revenue,
        averageRate: data.bookings > 0 ? data.revenue / data.bookings : 0,
        conversionRate: 0, // Would need impression data to calculate
        commissionPaid: data.commissionPaid,
        netRevenue: data.revenue - data.commissionPaid,
        marketShare: totalRevenue > 0 ? data.revenue / totalRevenue : 0
      })).sort((a, b) => b.revenue - a.revenue);
    } catch (error) {
      console.error('Channel performance analysis error:', error);
      throw error;
    }
  }

  /**
   * Analyze guest metrics and behavior
   */
  async analyzeGuestMetrics(
    hotelIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<GuestAnalytics> {
    try {
      const { data: bookings, error } = await this.supabase
        .from('bookings')
        .select(`
          guest_id,
          total_amount,
          guests!inner(
            country,
            vip_status,
            total_bookings,
            created_at
          )
        `)
        .in('hotel_id', hotelIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .in('status', ['confirmed', 'completed']);

      if (error) {
        throw new Error(`Failed to get guest data: ${error.message}`);
      }

      const uniqueGuests = new Set(bookings?.map(b => b.guest_id) || []);
      const totalGuests = uniqueGuests.size;

      // Calculate new vs returning guests
      const newGuests = bookings?.filter((b: any) => 
        b.guests?.created_at && 
        new Date(b.guests.created_at) >= startDate && 
        new Date(b.guests.created_at) <= endDate
      ).length || 0;

      const returningGuests = totalGuests - newGuests;

      // VIP guests
      const vipGuests = bookings?.filter((b: any) => b.guests?.vip_status).length || 0;

      // Average spend
      const totalSpend = bookings?.reduce((sum, b) => sum + b.total_amount, 0) || 0;
      const averageSpend = totalGuests > 0 ? totalSpend / totalGuests : 0;

      // Top countries
      const countryData = new Map<string, { count: number; revenue: number }>();
      bookings?.forEach((booking: any) => {
        const country = booking.guests?.country || 'Unknown';
        const existing = countryData.get(country) || { count: 0, revenue: 0 };
        existing.count += 1;
        existing.revenue += booking.total_amount || 0;
        countryData.set(country, existing);
      });

      const topCountries = Array.from(countryData.entries())
        .map(([country, data]) => ({ country, ...data }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      return {
        totalGuests,
        newGuests,
        returningGuests,
        vipGuests,
        averageSpend,
        topCountries,
        guestSatisfaction: 4.2, // Would come from survey data
        loyaltyProgramEnrollment: Math.floor(totalGuests * 0.3) // Example calculation
      };
    } catch (error) {
      console.error('Guest analytics error:', error);
      throw error;
    }
  }

  /**
   * Calculate operational metrics
   */
  async calculateOperationalMetrics(
    hotelIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<OperationalMetrics> {
    try {
      // Get task completion times
      const { data: tasks } = await this.supabase
        .from('booking_tasks')
        .select(`
          task_type,
          created_at,
          completed_at,
          bookings!inner(hotel_id)
        `)
        .in('bookings.hotel_id', hotelIds)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .eq('status', 'completed');

      // Calculate check-in/check-out times
      const checkInTasks = tasks?.filter(t => t.task_type === 'check_in_prep') || [];
      const checkOutTasks = tasks?.filter(t => t.task_type === 'check_out_processing') || [];

      const checkInTime = this.calculateAverageTaskTime(checkInTasks);
      const checkOutTime = this.calculateAverageTaskTime(checkOutTasks);

      // Get housekeeping data
      const { data: housekeeping } = await this.supabase
        .from('housekeeping_status')
        .select('*')
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0]);

      const totalRoomsToClean = housekeeping?.length || 0;
      const cleanedOnTime = housekeeping?.filter(h => 
        h.actual_cleaning_time && h.estimated_cleaning_time &&
        h.actual_cleaning_time <= h.estimated_cleaning_time * 1.1 // 10% tolerance
      ).length || 0;

      const housekeepingEfficiency = totalRoomsToClean > 0 ? cleanedOnTime / totalRoomsToClean : 0;

      // Get maintenance requests
      const maintenanceRequests = housekeeping?.filter(h => h.maintenance_required).length || 0;

      // Get guest complaints (from communications)
      const { data: complaints } = await this.supabase
        .from('guest_communications')
        .select(`
          id,
          bookings!inner(hotel_id)
        `)
        .in('bookings.hotel_id', hotelIds)
        .gte('sent_at', startDate.toISOString())
        .lte('sent_at', endDate.toISOString())
        .eq('direction', 'inbound')
        .like('content', '%complaint%');

      const guestComplaints = complaints?.length || 0;

      // Room readiness
      const readyRooms = housekeeping?.filter(h => h.status === 'clean').length || 0;
      const roomReadiness = totalRoomsToClean > 0 ? readyRooms / totalRoomsToClean : 0;

      return {
        checkInTime,
        checkOutTime,
        housekeepingEfficiency,
        maintenanceRequests,
        guestComplaints,
        roomReadiness,
        staffProductivity: 0.85 // Would be calculated from actual staff metrics
      };
    } catch (error) {
      console.error('Operational metrics calculation error:', error);
      throw error;
    }
  }

  /**
   * Generate revenue forecast
   */
  async generateRevenueForecast(
    hotelIds: string[],
    startDate: Date,
    days: number
  ): Promise<ForecastData[]> {
    try {
      const forecast: ForecastData[] = [];
      
      // Get historical data for trend analysis
      const historicalStartDate = new Date(startDate);
      historicalStartDate.setDate(historicalStartDate.getDate() - 365); // Last year

      const { data: historicalBookings } = await this.supabase
        .from('bookings')
        .select('check_in_date, total_amount, number_of_nights')
        .in('hotel_id', hotelIds)
        .gte('check_in_date', historicalStartDate.toISOString().split('T')[0])
        .lte('check_in_date', startDate.toISOString().split('T')[0])
        .in('status', ['confirmed', 'completed']);

      // Simple forecasting algorithm (in production, use more sophisticated ML models)
      for (let i = 0; i < days; i++) {
        const forecastDate = new Date(startDate);
        forecastDate.setDate(forecastDate.getDate() + i);
        
        const dayOfWeek = forecastDate.getDay();
        const month = forecastDate.getMonth();
        
        // Historical average for this day of week and month
        const historicalForDay = historicalBookings?.filter(b => {
          const bookingDate = new Date(b.check_in_date);
          return bookingDate.getDay() === dayOfWeek && bookingDate.getMonth() === month;
        }) || [];

        const historicalRevenue = historicalForDay.reduce((sum, b) => sum + b.total_amount, 0);
        const historicalOccupancy = historicalForDay.length;

        // Apply seasonal and trend adjustments
        const seasonalMultiplier = this.getSeasonalMultiplier(month);
        const weekdayMultiplier = dayOfWeek >= 1 && dayOfWeek <= 5 ? 1.1 : 0.9; // Weekday vs weekend

        const predictedRevenue = (historicalRevenue / Math.max(historicalForDay.length, 1)) * 
                                seasonalMultiplier * weekdayMultiplier;
        const predictedOccupancy = Math.min(0.95, historicalOccupancy * seasonalMultiplier * weekdayMultiplier);

        forecast.push({
          date: forecastDate.toISOString().split('T')[0],
          predictedOccupancy,
          predictedRevenue,
          confidence: 0.75, // Base confidence
          factors: {
            historical: 0.4,
            seasonal: 0.2,
            events: 0.1,
            bookingPace: 0.2,
            marketTrends: 0.1
          }
        });
      }

      return forecast;
    } catch (error) {
      console.error('Revenue forecast error:', error);
      throw error;
    }
  }

  /**
   * Generate performance alerts
   */
  async generatePerformanceAlerts(hotelIds: string[]): Promise<PerformanceAlert[]> {
    const alerts: PerformanceAlert[] = [];
    
    try {
      // Get recent metrics
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7); // Last 7 days

      const metrics = await this.calculateRevenueMetrics(hotelIds, startDate, endDate);

      // Define alert thresholds
      const thresholds = {
        occupancyRate: { warning: 0.6, critical: 0.4 },
        cancellationRate: { warning: 0.15, critical: 0.25 },
        revPAR: { warning: 100, critical: 50 },
        averageDailyRate: { warning: 120, critical: 80 }
      };

      // Check occupancy rate
      if (metrics.occupancyRate < thresholds.occupancyRate.critical) {
        alerts.push({
          id: `occupancy_critical_${Date.now()}`,
          type: 'critical',
          category: 'revenue',
          title: 'Critical: Low Occupancy Rate',
          description: 'Occupancy rate is critically low and requires immediate attention',
          metric: 'occupancyRate',
          currentValue: metrics.occupancyRate,
          threshold: thresholds.occupancyRate.critical,
          recommendation: 'Consider aggressive pricing strategies, promotional campaigns, or last-minute deals',
          priority: 'high',
          createdAt: new Date()
        });
      } else if (metrics.occupancyRate < thresholds.occupancyRate.warning) {
        alerts.push({
          id: `occupancy_warning_${Date.now()}`,
          type: 'warning',
          category: 'revenue',
          title: 'Warning: Below Target Occupancy',
          description: 'Occupancy rate is below target levels',
          metric: 'occupancyRate',
          currentValue: metrics.occupancyRate,
          threshold: thresholds.occupancyRate.warning,
          recommendation: 'Review pricing strategy and marketing campaigns',
          priority: 'medium',
          createdAt: new Date()
        });
      }

      // Check cancellation rate
      if (metrics.cancellationRate > thresholds.cancellationRate.warning) {
        alerts.push({
          id: `cancellation_warning_${Date.now()}`,
          type: 'warning',
          category: 'operations',
          title: 'High Cancellation Rate',
          description: 'Cancellation rate is higher than normal',
          metric: 'cancellationRate',
          currentValue: metrics.cancellationRate,
          threshold: thresholds.cancellationRate.warning,
          recommendation: 'Review cancellation policies and guest communication',
          priority: 'medium',
          createdAt: new Date()
        });
      }

      return alerts;
    } catch (error) {
      console.error('Performance alerts generation error:', error);
      return alerts;
    }
  }

  /**
   * Export report in various formats
   */
  async exportReport(
    config: ReportConfiguration
  ): Promise<{ data: any; filename: string; mimeType: string }> {
    try {
      const dashboardData = await this.generateDashboard(
        config.hotelIds,
        config.startDate,
        config.endDate
      );

      const filename = `hotel_report_${config.startDate.toISOString().split('T')[0]}_${config.endDate.toISOString().split('T')[0]}`;

      switch (config.format) {
        case 'json':
          return {
            data: JSON.stringify(dashboardData, null, 2),
            filename: `${filename}.json`,
            mimeType: 'application/json'
          };

        case 'csv':
          const csvData = this.convertToCSV(dashboardData);
          return {
            data: csvData,
            filename: `${filename}.csv`,
            mimeType: 'text/csv'
          };

        default:
          throw new Error(`Unsupported format: ${config.format}`);
      }
    } catch (error) {
      console.error('Report export error:', error);
      throw error;
    }
  }

  /**
   * Helper methods
   */
  private calculateDaysBetween(startDate: Date, endDate: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round(Math.abs((endDate.getTime() - startDate.getTime()) / oneDay));
  }

  private calculateAverageTaskTime(tasks: any[]): number {
    if (tasks.length === 0) return 0;

    const durations = tasks
      .filter(t => t.completed_at && t.created_at)
      .map(t => {
        const start = new Date(t.created_at);
        const end = new Date(t.completed_at);
        return (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      });

    return durations.length > 0 ? 
      durations.reduce((sum, duration) => sum + duration, 0) / durations.length : 0;
  }

  private getSeasonalMultiplier(month: number): number {
    // Example seasonal adjustments (would be customized per market)
    const seasonalFactors: { [key: number]: number } = {
      0: 0.8,  // January
      1: 0.8,  // February
      2: 0.9,  // March
      3: 1.1,  // April
      4: 1.2,  // May
      5: 1.3,  // June
      6: 1.4,  // July
      7: 1.4,  // August
      8: 1.2,  // September
      9: 1.1,  // October
      10: 0.9, // November
      11: 1.0  // December
    };

    return seasonalFactors[month] || 1.0;
  }

  private convertToCSV(data: DashboardData): string {
    // Simple CSV conversion for revenue metrics
    const headers = [
      'Metric',
      'Value',
      'Period'
    ];

    const rows = [
      ['Total Revenue', data.revenue.totalRevenue.toString(), `${data.period.start.toISOString()} - ${data.period.end.toISOString()}`],
      ['Occupancy Rate', (data.revenue.occupancyRate * 100).toFixed(2) + '%', `${data.period.start.toISOString()} - ${data.period.end.toISOString()}`],
      ['Average Daily Rate', data.revenue.averageDailyRate.toFixed(2), `${data.period.start.toISOString()} - ${data.period.end.toISOString()}`],
      ['RevPAR', data.revenue.revPAR.toFixed(2), `${data.period.start.toISOString()} - ${data.period.end.toISOString()}`],
      ['Total Bookings', data.revenue.totalBookings.toString(), `${data.period.start.toISOString()} - ${data.period.end.toISOString()}`]
    ];

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}