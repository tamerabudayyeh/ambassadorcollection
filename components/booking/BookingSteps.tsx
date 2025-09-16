'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Check, ChevronRight } from 'lucide-react';

interface Step {
  id: number;
  name: string;
  path: string;
}

interface BookingStepsProps {
  currentStep?: number;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ currentStep }) => {
  const pathname = usePathname();
  
  const steps: Step[] = [
    { id: 1, name: 'Search', path: '/booking' },
    { id: 2, name: 'Room Selection', path: '/booking/results' },
    { id: 3, name: 'Guest Information', path: '/booking/guest-info' },
    { id: 4, name: 'Payment', path: '/booking/payment' },
    { id: 5, name: 'Confirmation', path: '/booking/confirmation' },
  ];
  
  const getCurrentStepIndex = () => {
    if (currentStep !== undefined) {
      return currentStep - 1;
    }
    const index = steps.findIndex(step => step.path === pathname);
    return index >= 0 ? index : 0;
  };
  
  const currentStepIndex = getCurrentStepIndex();
  
  return (
    <div className="py-4">
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <li key={step.id} className={`relative ${index !== steps.length - 1 ? 'pr-8 w-full' : ''}`}>
                  {index !== 0 && (
                    <div className="absolute inset-0 flex items-center\" aria-hidden="true">
                      <div 
                        className={`h-0.5 w-full ${index <= currentStepIndex ? 'bg-primary-800' : 'bg-gray-200'}`}
                      />
                    </div>
                  )}
                  
                  <div className="relative flex flex-col items-center group">
                    <span 
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        isCompleted 
                          ? 'bg-primary-800' 
                          : isCurrent 
                            ? 'bg-primary-600' 
                            : 'bg-gray-200'
                      } transition-colors`}
                    >
                      {isCompleted ? (
                        <Check size={16} className="text-white" />
                      ) : (
                        <span className={`text-sm font-medium ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                          {step.id}
                        </span>
                      )}
                    </span>
                    <span className="text-sm font-medium mt-2">
                      {step.name}
                    </span>
                  </div>
                  
                  {index !== steps.length - 1 && (
                    <div className="hidden md:block absolute right-0 top-0 bottom-0 flex items-center">
                      <ChevronRight 
                        size={16} 
                        className={`${index < currentStepIndex ? 'text-primary-600' : 'text-gray-300'}`} 
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
      
      {/* Mobile steps */}
      <div className="md:hidden">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {steps.length}
          </p>
          <p className="mt-1 text-lg font-medium">
            {steps[currentStepIndex].name}
          </p>
        </div>
        <div className="mt-4 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-2 bg-primary-800 rounded-full" 
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default BookingSteps;
