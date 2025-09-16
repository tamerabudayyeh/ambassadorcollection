/**
 * Booking Error Handling Service
 * Comprehensive error recovery patterns for the booking system
 */

export type BookingErrorType = 
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'AVAILABILITY_ERROR'
  | 'PAYMENT_ERROR'
  | 'SESSION_EXPIRED'
  | 'RATE_CHANGED'
  | 'INVENTORY_INSUFFICIENT'
  | 'SYSTEM_ERROR';

export interface BookingError {
  code: string;
  type: BookingErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
  timestamp: Date;
  recoveryActions: RecoveryAction[];
}

export interface RecoveryAction {
  type: 'retry' | 'fallback' | 'redirect' | 'refresh' | 'contact_support';
  label: string;
  action: () => Promise<void> | void;
  priority: number;
}

export class BookingErrorHandler {
  private static readonly ERROR_CATALOG: Record<string, Omit<BookingError, 'timestamp' | 'context'>> = {
    'NETWORK_TIMEOUT': {
      code: 'NETWORK_TIMEOUT',
      type: 'NETWORK_ERROR',
      message: 'Request timed out',
      userMessage: 'Connection timeout. Please check your internet connection and try again.',
      retryable: true,
      severity: 'medium',
      recoveryActions: [
        {
          type: 'retry',
          label: 'Try Again',
          action: () => window.location.reload(),
          priority: 1
        }
      ]
    },
    
    'AVAILABILITY_CHANGED': {
      code: 'AVAILABILITY_CHANGED',
      type: 'AVAILABILITY_ERROR',
      message: 'Room availability changed during booking process',
      userMessage: 'Room availability has changed. We\'ll help you find the best alternative.',
      retryable: true,
      severity: 'high',
      recoveryActions: [
        {
          type: 'refresh',
          label: 'Check New Availability',
          action: async () => {
            // Refresh availability
          },
          priority: 1
        },
        {
          type: 'fallback',
          label: 'View Similar Rooms',
          action: async () => {
            // Show similar rooms
          },
          priority: 2
        }
      ]
    },
    
    'PAYMENT_DECLINED': {
      code: 'PAYMENT_DECLINED',
      type: 'PAYMENT_ERROR',
      message: 'Payment method declined',
      userMessage: 'Your payment was declined. Please try a different payment method or contact your bank.',
      retryable: true,
      severity: 'high',
      recoveryActions: [
        {
          type: 'retry',
          label: 'Try Different Card',
          action: () => {},
          priority: 1
        },
        {
          type: 'contact_support',
          label: 'Contact Support',
          action: () => {},
          priority: 2
        }
      ]
    },
    
    'SESSION_EXPIRED': {
      code: 'SESSION_EXPIRED',
      type: 'SESSION_EXPIRED',
      message: 'Booking session has expired',
      userMessage: 'Your booking session has expired for security reasons. Please start a new search.',
      retryable: true,
      severity: 'medium',
      recoveryActions: [
        {
          type: 'redirect',
          label: 'Start New Search',
          action: () => {
            window.location.href = '/booking';
          },
          priority: 1
        }
      ]
    },
    
    'RATE_CHANGED': {
      code: 'RATE_CHANGED',
      type: 'RATE_CHANGED',
      message: 'Room rate has changed',
      userMessage: 'The room rate has changed since you started booking. The new rate is shown below.',
      retryable: true,
      severity: 'medium',
      recoveryActions: [
        {
          type: 'refresh',
          label: 'Accept New Rate',
          action: async () => {
            // Update with new rate
          },
          priority: 1
        },
        {
          type: 'redirect',
          label: 'Search Again',
          action: () => {
            window.location.href = '/booking';
          },
          priority: 2
        }
      ]
    },
    
    'INVENTORY_INSUFFICIENT': {
      code: 'INVENTORY_INSUFFICIENT',
      type: 'INVENTORY_INSUFFICIENT',
      message: 'Not enough rooms available',
      userMessage: 'We don\'t have enough rooms available for your group size. Please modify your search or contact us directly.',
      retryable: true,
      severity: 'high',
      recoveryActions: [
        {
          type: 'fallback',
          label: 'Modify Search',
          action: () => {
            window.history.back();
          },
          priority: 1
        },
        {
          type: 'contact_support',
          label: 'Contact Support',
          action: () => {
            window.location.href = '/contact';
          },
          priority: 2
        }
      ]
    }
  };

  /**
   * Create a standardized error object
   */
  static createError(
    errorCode: string,
    context?: any,
    customMessage?: string
  ): BookingError {
    const template = this.ERROR_CATALOG[errorCode];
    
    if (!template) {
      return this.createGenericError(errorCode, context, customMessage);
    }

    return {
      ...template,
      userMessage: customMessage || template.userMessage,
      context,
      timestamp: new Date()
    };
  }

  /**
   * Create a generic error for unknown error codes
   */
  private static createGenericError(
    errorCode: string,
    context?: any,
    customMessage?: string
  ): BookingError {
    return {
      code: errorCode,
      type: 'SYSTEM_ERROR',
      message: customMessage || 'An unexpected error occurred',
      userMessage: 'We encountered an unexpected error. Please try again or contact support if the problem persists.',
      retryable: true,
      severity: 'medium',
      context,
      timestamp: new Date(),
      recoveryActions: [
        {
          type: 'retry',
          label: 'Try Again',
          action: () => window.location.reload(),
          priority: 1
        },
        {
          type: 'contact_support',
          label: 'Contact Support',
          action: () => { window.location.href = '/contact' },
          priority: 2
        }
      ]
    };
  }

  /**
   * Handle API response errors
   */
  static handleApiError(response: Response, context?: any): BookingError {
    if (response.status === 408 || response.status === 504) {
      return this.createError('NETWORK_TIMEOUT', context);
    }
    
    if (response.status === 409) {
      return this.createError('AVAILABILITY_CHANGED', context);
    }
    
    if (response.status === 402) {
      return this.createError('PAYMENT_DECLINED', context);
    }
    
    if (response.status === 401 || response.status === 403) {
      return this.createError('SESSION_EXPIRED', context);
    }

    return this.createGenericError(
      `API_ERROR_${response.status}`,
      { ...context, status: response.status, statusText: response.statusText }
    );
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(error: Error, context?: any): BookingError {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return this.createError('NETWORK_TIMEOUT', { ...context, originalError: error.message });
    }

    return this.createGenericError(
      'NETWORK_ERROR',
      { ...context, originalError: error.message },
      'Network connection error. Please check your internet connection.'
    );
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(
    field: string,
    message: string,
    context?: any
  ): BookingError {
    return {
      code: `VALIDATION_${field.toUpperCase()}`,
      type: 'VALIDATION_ERROR',
      message: `Validation failed for field: ${field}`,
      userMessage: message,
      retryable: false,
      severity: 'low',
      context: { ...context, field },
      timestamp: new Date(),
      recoveryActions: []
    };
  }

  /**
   * Retry mechanism with exponential backoff
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s...
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Log error for monitoring and analytics
   */
  static logError(error: BookingError): void {
    // In production, this would send to monitoring service
    console.error('Booking Error:', {
      code: error.code,
      type: error.type,
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp
    });

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'booking_error', {
        error_code: error.code,
        error_type: error.type,
        error_severity: error.severity
      });
    }
  }

  /**
   * Get user-friendly error message with recovery options
   */
  static getErrorDisplay(error: BookingError): {
    title: string;
    message: string;
    actions: RecoveryAction[];
    severity: string;
  } {
    const titles = {
      low: 'Please Check',
      medium: 'Something Went Wrong',
      high: 'Booking Issue',
      critical: 'System Error'
    };

    return {
      title: titles[error.severity],
      message: error.userMessage,
      actions: error.recoveryActions.sort((a, b) => a.priority - b.priority),
      severity: error.severity
    };
  }

  /**
   * Check if error should trigger automatic retry
   */
  static shouldAutoRetry(error: BookingError): boolean {
    return error.retryable && 
           error.severity !== 'critical' &&
           ['NETWORK_ERROR', 'SYSTEM_ERROR'].includes(error.type);
  }

  /**
   * Global error handler for unhandled booking errors
   */
  static setupGlobalErrorHandler(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('unhandledrejection', (event) => {
      const error = this.createGenericError(
        'UNHANDLED_PROMISE_REJECTION',
        { reason: event.reason }
      );
      
      this.logError(error);
      
      // Don't prevent default if it's a booking-related error
      if (event.reason?.message?.includes('booking') || 
          event.reason?.message?.includes('payment')) {
        event.preventDefault();
        this.showErrorToUser(error);
      }
    });

    window.addEventListener('error', (event) => {
      if (event.filename?.includes('booking') || 
          event.message?.includes('booking')) {
        const error = this.createGenericError(
          'UNHANDLED_ERROR',
          { 
            message: event.message,
            filename: event.filename,
            lineno: event.lineno
          }
        );
        
        this.logError(error);
        this.showErrorToUser(error);
      }
    });
  }

  /**
   * Show error to user (integrate with your notification system)
   */
  private static showErrorToUser(error: BookingError): void {
    // This would integrate with your toast/notification system
    console.error('Booking Error:', error.userMessage);
  }
}

/**
 * React Hook for error handling in booking components
 */
export function useBookingErrorHandler() {
  const [currentError, setCurrentError] = React.useState<BookingError | null>(null);

  const handleError = React.useCallback((error: Error | BookingError, context?: any) => {
    let bookingError: BookingError;

    if ('code' in error && 'type' in error) {
      // Already a BookingError
      bookingError = error as BookingError;
    } else {
      // Convert regular Error to BookingError
      bookingError = BookingErrorHandler.handleNetworkError(error as Error, context);
    }

    BookingErrorHandler.logError(bookingError);
    setCurrentError(bookingError);

    return bookingError;
  }, []);

  const clearError = React.useCallback(() => {
    setCurrentError(null);
  }, []);

  const retryWithHandler = React.useCallback(async <T>(
    operation: () => Promise<T>,
    context?: any
  ): Promise<T | null> => {
    try {
      clearError();
      return await BookingErrorHandler.retryOperation(operation);
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError, clearError]);

  return {
    currentError,
    handleError,
    clearError,
    retryWithHandler
  };
}

// Import React for the hook
import React from 'react';