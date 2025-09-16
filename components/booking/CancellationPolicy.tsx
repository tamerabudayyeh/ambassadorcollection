/**
 * Cancellation Policy Display Component
 * Shows clear cancellation terms for transparency
 */

'use client';

import React from 'react';
import { Calendar, Clock, DollarSign, Shield, AlertTriangle } from 'lucide-react';

export type CancellationPolicyType = 'flexible' | 'moderate' | 'strict' | 'non_refundable';

interface CancellationPolicyProps {
  policyType: CancellationPolicyType;
  checkInDate: Date;
  totalAmount: number;
  currency: string;
  className?: string;
}

interface PolicyDetails {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  deadlineHours: number;
  penaltyType: 'none' | 'percentage' | 'fixed' | 'full';
  penaltyAmount?: number;
  description: string;
  benefits: string[];
  restrictions: string[];
}

const POLICY_CONFIG: Record<CancellationPolicyType, PolicyDetails> = {
  flexible: {
    title: 'Flexible Cancellation',
    icon: Shield,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    deadlineHours: 24,
    penaltyType: 'none',
    description: 'Free cancellation until 24 hours before check-in',
    benefits: [
      'Cancel for free until 24 hours before arrival',
      'Full refund processed within 5-7 business days',
      'Modify dates without penalty (subject to availability)',
      'No prepayment required'
    ],
    restrictions: [
      'Cancellations after deadline incur full charge',
      'No-show results in full charge'
    ]
  },
  moderate: {
    title: 'Moderate Cancellation',
    icon: Clock,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    deadlineHours: 72,
    penaltyType: 'percentage',
    penaltyAmount: 50,
    description: 'Free cancellation until 72 hours before check-in',
    benefits: [
      'Cancel for free until 72 hours before arrival',
      'Partial refund available after deadline',
      'Date changes permitted with fees'
    ],
    restrictions: [
      'Cancellations within 72 hours: 50% penalty',
      'No-show results in full charge',
      'Date changes subject to rate differences'
    ]
  },
  strict: {
    title: 'Strict Cancellation',
    icon: AlertTriangle,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    deadlineHours: 168, // 7 days
    penaltyType: 'percentage',
    penaltyAmount: 100,
    description: 'Free cancellation until 7 days before check-in',
    benefits: [
      'Cancel for free until 7 days before arrival',
      'Lower room rates due to restrictions'
    ],
    restrictions: [
      'Cancellations within 7 days: No refund',
      'No date changes permitted',
      'No-show results in full charge'
    ]
  },
  non_refundable: {
    title: 'Non-Refundable Rate',
    icon: DollarSign,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    deadlineHours: 0,
    penaltyType: 'full',
    description: 'No cancellation or refund permitted',
    benefits: [
      'Lowest available rate',
      'Immediate confirmation',
      'Best value for confirmed travel'
    ],
    restrictions: [
      'No cancellations permitted',
      'No refunds under any circumstances',
      'No date changes allowed',
      'Full payment required at booking'
    ]
  }
};

export function CancellationPolicy({ 
  policyType, 
  checkInDate, 
  totalAmount, 
  currency,
  className = ''
}: CancellationPolicyProps) {
  const policy = POLICY_CONFIG[policyType];
  const IconComponent = policy.icon;

  // Calculate deadline date
  const deadlineDate = new Date(checkInDate.getTime() - policy.deadlineHours * 60 * 60 * 1000);
  const isDeadlinePassed = new Date() > deadlineDate;

  // Calculate penalty amount
  const getPenaltyAmount = () => {
    switch (policy.penaltyType) {
      case 'none':
        return 0;
      case 'percentage':
        return (totalAmount * (policy.penaltyAmount || 0)) / 100;
      case 'fixed':
        return policy.penaltyAmount || 0;
      case 'full':
        return totalAmount;
      default:
        return 0;
    }
  };

  const penaltyAmount = getPenaltyAmount();

  return (
    <div className={`rounded-lg border p-4 ${policy.bgColor} ${policy.borderColor} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <IconComponent className={`w-6 h-6 ${policy.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`text-lg font-medium ${policy.color}`}>
              {policy.title}
            </h3>
            {isDeadlinePassed && policy.deadlineHours > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Deadline Passed
              </span>
            )}
          </div>
          
          <p className={`text-sm mb-3 ${policy.color}`}>
            {policy.description}
          </p>

          {/* Deadline Information */}
          {policy.deadlineHours > 0 && (
            <div className="mb-3 p-3 bg-white/50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Cancellation Deadline:</span>
              </div>
              <div className="mt-1 text-sm text-gray-600">
                {deadlineDate.toLocaleDateString()} at {deadlineDate.toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              {!isDeadlinePassed && (
                <div className="mt-1 text-xs text-gray-500">
                  ({Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining)
                </div>
              )}
            </div>
          )}

          {/* Penalty Information */}
          {policy.penaltyType !== 'none' && (
            <div className="mb-3 p-3 bg-white/50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Cancellation Penalty:</span>
                <span className="font-bold">
                  {policy.penaltyType === 'percentage' 
                    ? `${policy.penaltyAmount}% (${currency} ${penaltyAmount.toFixed(2)})`
                    : policy.penaltyType === 'full'
                    ? `${currency} ${totalAmount.toFixed(2)} (Full Amount)`
                    : `${currency} ${penaltyAmount.toFixed(2)}`
                  }
                </span>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">What's Included:</h4>
            <ul className="space-y-1">
              {policy.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Restrictions */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Important Notes:</h4>
            <ul className="space-y-1">
              {policy.restrictions.map((restriction, index) => (
                <li key={index} className="flex items-start space-x-2 text-xs text-gray-600">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>{restriction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          {policy.deadlineHours > 0 && !isDeadlinePassed && (
            <div className="mt-4 pt-3 border-t border-white/50">
              <div className="flex space-x-2">
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  View Full Terms
                </button>
                <span className="text-xs text-gray-400">•</span>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Compare Policies
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for display in booking summary
 */
export function CancellationPolicyCompact({ 
  policyType, 
  checkInDate,
  className = ''
}: Pick<CancellationPolicyProps, 'policyType' | 'checkInDate' | 'className'>) {
  const policy = POLICY_CONFIG[policyType];
  const IconComponent = policy.icon;
  
  const deadlineDate = new Date(checkInDate.getTime() - policy.deadlineHours * 60 * 60 * 1000);
  const isDeadlinePassed = new Date() > deadlineDate;

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <IconComponent className={`w-4 h-4 ${policy.color}`} />
      <span className={policy.color}>
        {policy.title}
      </span>
      {policy.deadlineHours > 0 && (
        <span className="text-gray-500">
          • Cancel by {deadlineDate.toLocaleDateString()}
        </span>
      )}
      {isDeadlinePassed && policy.deadlineHours > 0 && (
        <span className="text-red-600 text-xs font-medium">
          (Deadline passed)
        </span>
      )}
    </div>
  );
}

/**
 * Policy comparison component for rate selection
 */
export function CancellationPolicyComparison({ 
  policies,
  selectedPolicy,
  onPolicySelect,
  checkInDate,
  totalAmount,
  currency
}: {
  policies: CancellationPolicyType[];
  selectedPolicy: CancellationPolicyType;
  onPolicySelect: (policy: CancellationPolicyType) => void;
  checkInDate: Date;
  totalAmount: number;
  currency: string;
}) {
  return (
    <div className="grid gap-3">
      {policies.map((policyType) => {
        const policy = POLICY_CONFIG[policyType];
        const IconComponent = policy.icon;
        const isSelected = selectedPolicy === policyType;

        return (
          <button
            key={policyType}
            onClick={() => onPolicySelect(policyType)}
            className={`text-left p-4 rounded-lg border-2 transition-all ${
              isSelected 
                ? `${policy.borderColor} ${policy.bgColor}` 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <IconComponent className={`w-5 h-5 ${isSelected ? policy.color : 'text-gray-400'}`} />
                <span className={`font-medium ${isSelected ? policy.color : 'text-gray-900'}`}>
                  {policy.title}
                </span>
              </div>
              {isSelected && (
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {policy.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}