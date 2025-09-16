'use client';

import React from 'react';
import { ChevronDown, DollarSign } from 'lucide-react';
import { SupportedCurrency, CURRENCY_CONFIG } from '@/lib/stripe/config';

interface CurrencySelectorProps {
  selectedCurrency: SupportedCurrency;
  onCurrencyChange: (currency: SupportedCurrency) => void;
  className?: string;
}

export default function CurrencySelector({ 
  selectedCurrency, 
  onCurrencyChange, 
  className = '' 
}: CurrencySelectorProps) {
  return (
    <div className={`relative ${className}`}>
      <label htmlFor="currency" className="sr-only">
        Select Currency
      </label>
      <div className="relative">
        <select
          id="currency"
          value={selectedCurrency}
          onChange={(e) => onCurrencyChange(e.target.value as SupportedCurrency)}
          className="appearance-none bg-white border border-gray-300 rounded-lg pl-10 pr-10 py-2 text-sm font-medium text-gray-900 hover:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors cursor-pointer"
        >
          {Object.entries(CURRENCY_CONFIG).map(([code, config]) => (
            <option key={code} value={code}>
              {config.symbol} {code}
            </option>
          ))}
        </select>
        
        {/* Currency Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <DollarSign className="h-4 w-4 text-gray-400" />
        </div>
        
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}