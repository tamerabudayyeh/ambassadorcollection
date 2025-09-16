import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SupportedCurrency, CURRENCY_CONFIG } from '@/lib/stripe/config';

// Mock exchange rates for development
const MOCK_RATES: Record<SupportedCurrency, number> = {
  USD: 1.0,
  EUR: 0.85,
  GBP: 0.75,
  CAD: 1.35,
  AUD: 1.45,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base') as SupportedCurrency || 'USD';
    
    // In production, you would fetch from a real API like:
    // - Fixer.io
    // - Open Exchange Rates
    // - CurrencyAPI
    // For now, we'll use our database rates
    
    const supabase = createClient();
    
    // Try to get rates from database first
    const { data: dbRates, error } = await supabase
      .from('currency_rates')
      .select('*')
      .eq('base_currency', base)
      .eq('effective_date', new Date().toISOString().split('T')[0]);
    
    let rates: Record<SupportedCurrency, number>;
    
    if (error || !dbRates || dbRates.length === 0) {
      // Fall back to mock rates if database doesn't have current rates
      console.log('Using mock currency rates');
      rates = MOCK_RATES;
    } else {
      // Convert database rates to our format
      rates = { ...MOCK_RATES };
      dbRates.forEach(rate => {
        if (rate.target_currency in CURRENCY_CONFIG) {
          rates[rate.target_currency as SupportedCurrency] = parseFloat(rate.rate);
        }
      });
    }
    
    // If base currency is not USD, we need to convert all rates
    if (base !== 'USD') {
      const baseRate = rates[base];
      const convertedRates: Record<SupportedCurrency, number> = {} as any;
      
      Object.entries(rates).forEach(([currency, rate]) => {
        convertedRates[currency as SupportedCurrency] = rate / baseRate;
      });
      
      rates = convertedRates;
    }
    
    return NextResponse.json({
      success: true,
      data: {
        base,
        rates,
        timestamp: new Date().toISOString(),
        source: dbRates && dbRates.length > 0 ? 'database' : 'mock',
      },
    });
  } catch (error: any) {
    console.error('Error fetching currency rates:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch currency rates',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rates, source = 'manual' } = body;
    
    if (!rates || typeof rates !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid rates data',
        },
        { status: 400 }
      );
    }
    
    const supabase = createClient();
    const today = new Date().toISOString().split('T')[0];
    
    // Update currency rates in database
    const rateUpdates = Object.entries(rates).map(([currency, rate]) => ({
      base_currency: 'USD',
      target_currency: currency,
      rate: parseFloat(rate as string),
      effective_date: today,
      source,
    }));
    
    const { error } = await supabase
      .from('currency_rates')
      .upsert(rateUpdates, {
        onConflict: 'base_currency,target_currency,effective_date'
      });
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Currency rates updated successfully',
      data: {
        updated: rateUpdates.length,
        date: today,
      },
    });
  } catch (error: any) {
    console.error('Error updating currency rates:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update currency rates',
        message: error.message,
      },
      { status: 500 }
    );
  }
}