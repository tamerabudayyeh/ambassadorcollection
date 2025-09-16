/**
 * Booking Session Management Service
 * Handles session persistence, booking holds, and timeout mechanisms
 */

import { BookingSession, BookingHold, AvailabilityRequest } from '@/lib/booking-types';

export interface SessionConfig {
  sessionTimeoutMinutes: number;
  holdTimeoutMinutes: number;
  maxSessionsPerUser: number;
  persistToStorage: boolean;
}

export interface SessionState {
  searchCriteria?: AvailabilityRequest;
  selectedHotelId?: string;
  selectedRoomTypeId?: string;
  selectedRatePlanId?: string;
  guestDetails?: any;
  step: 'search' | 'results' | 'guest-info' | 'payment' | 'confirmation';
  timestamp: number;
  expiresAt: number;
}

export class BookingSessionManager {
  private static readonly DEFAULT_CONFIG: SessionConfig = {
    sessionTimeoutMinutes: 30,
    holdTimeoutMinutes: 15,
    maxSessionsPerUser: 3,
    persistToStorage: true
  };

  private static readonly STORAGE_KEY = 'ambassador_booking_session';
  private static readonly HOLD_STORAGE_KEY = 'ambassador_booking_holds';

  /**
   * Create a new booking session
   */
  static createSession(
    sessionId: string = this.generateSessionId(),
    config: Partial<SessionConfig> = {}
  ): BookingSession {
    const fullConfig = { ...this.DEFAULT_CONFIG, ...config };
    const now = Date.now();
    const expiresAt = new Date(now + fullConfig.sessionTimeoutMinutes * 60 * 1000);

    const session: BookingSession = {
      sessionId,
      expiresAt,
      hotel: null,
      searchCriteria: {
        hotelId: '',
        checkInDate: new Date(),
        checkOutDate: new Date(),
        adults: 2,
        children: 0
      }
    };

    if (fullConfig.persistToStorage && typeof window !== 'undefined') {
      this.saveSessionToStorage(session);
    }

    return session;
  }

  /**
   * Get current session from storage or create new one
   */
  static getCurrentSession(): BookingSession | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;

      const session: BookingSession = JSON.parse(stored);
      
      // Check if session is expired
      if (new Date(session.expiresAt) < new Date()) {
        this.clearSession();
        return null;
      }

      return session;
    } catch (error) {
      console.error('Error loading session:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Update session data
   */
  static updateSession(updates: Partial<BookingSession>): void {
    const currentSession = this.getCurrentSession();
    if (!currentSession) return;

    const updatedSession = {
      ...currentSession,
      ...updates,
      // Extend expiration when session is updated
      expiresAt: new Date(Date.now() + this.DEFAULT_CONFIG.sessionTimeoutMinutes * 60 * 1000)
    };

    this.saveSessionToStorage(updatedSession);
  }

  /**
   * Save session to localStorage
   */
  private static saveSessionToStorage(session: BookingSession): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  /**
   * Clear current session
   */
  static clearSession(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.HOLD_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  /**
   * Create a booking hold for selected room
   */
  static async createBookingHold(
    roomTypeId: string,
    checkInDate: Date,
    checkOutDate: Date,
    roomCount: number = 1
  ): Promise<BookingHold | null> {
    try {
      const holdId = this.generateHoldId();
      const expiresAt = new Date(Date.now() + this.DEFAULT_CONFIG.holdTimeoutMinutes * 60 * 1000);

      const hold: BookingHold = {
        holdId,
        roomTypeId,
        checkInDate,
        checkOutDate,
        roomCount,
        expiresAt,
        status: 'active'
      };

      // In a real implementation, this would call the backend API
      const response = await fetch('/api/booking/hold', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hold)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Store hold locally for quick access
        this.saveHoldToStorage(result.hold || hold);
        
        return result.hold || hold;
      }

      return null;
    } catch (error) {
      console.error('Error creating booking hold:', error);
      return null;
    }
  }

  /**
   * Release a booking hold
   */
  static async releaseBookingHold(holdId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/booking/hold/${holdId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        this.removeHoldFromStorage(holdId);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error releasing booking hold:', error);
      return false;
    }
  }

  /**
   * Get active booking holds
   */
  static getActiveHolds(): BookingHold[] {
    if (typeof window === 'undefined') return [];

    try {
      const stored = localStorage.getItem(this.HOLD_STORAGE_KEY);
      if (!stored) return [];

      const holds: BookingHold[] = JSON.parse(stored);
      const now = new Date();

      // Filter out expired holds
      const activeHolds = holds.filter(hold => new Date(hold.expiresAt) > now);
      
      // Update storage if any holds were expired
      if (activeHolds.length !== holds.length) {
        localStorage.setItem(this.HOLD_STORAGE_KEY, JSON.stringify(activeHolds));
      }

      return activeHolds;
    } catch (error) {
      console.error('Error loading holds:', error);
      return [];
    }
  }

  /**
   * Save hold to storage
   */
  private static saveHoldToStorage(hold: BookingHold): void {
    if (typeof window === 'undefined') return;

    try {
      const existingHolds = this.getActiveHolds();
      const updatedHolds = [...existingHolds, hold];
      localStorage.setItem(this.HOLD_STORAGE_KEY, JSON.stringify(updatedHolds));
    } catch (error) {
      console.error('Error saving hold:', error);
    }
  }

  /**
   * Remove hold from storage
   */
  private static removeHoldFromStorage(holdId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const existingHolds = this.getActiveHolds();
      const updatedHolds = existingHolds.filter(hold => hold.holdId !== holdId);
      localStorage.setItem(this.HOLD_STORAGE_KEY, JSON.stringify(updatedHolds));
    } catch (error) {
      console.error('Error removing hold:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  static generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique hold ID
   */
  static generateHoldId(): string {
    return `hold_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Session timeout warning (for UI notifications)
   */
  static getTimeoutWarning(session: BookingSession): {
    showWarning: boolean;
    minutesRemaining: number;
  } {
    const now = Date.now();
    const expiresAt = new Date(session.expiresAt).getTime();
    const minutesRemaining = Math.floor((expiresAt - now) / (1000 * 60));
    
    return {
      showWarning: minutesRemaining <= 5 && minutesRemaining > 0,
      minutesRemaining: Math.max(0, minutesRemaining)
    };
  }

  /**
   * Extend session timeout
   */
  static extendSession(additionalMinutes: number = 30): boolean {
    const session = this.getCurrentSession();
    if (!session) return false;

    const newExpiresAt = new Date(Date.now() + additionalMinutes * 60 * 1000);
    this.updateSession({ expiresAt: newExpiresAt });
    
    return true;
  }

  /**
   * Validate session integrity
   */
  static validateSession(session: BookingSession): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (!session.sessionId) {
      issues.push('Missing session ID');
    }

    if (new Date(session.expiresAt) < new Date()) {
      issues.push('Session expired');
    }

    if (!session.searchCriteria) {
      issues.push('Missing search criteria');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get session statistics for analytics
   */
  static getSessionStats(): {
    sessionAge: number;
    timeRemaining: number;
    step: string;
    hasHolds: boolean;
  } {
    const session = this.getCurrentSession();
    if (!session) {
      return {
        sessionAge: 0,
        timeRemaining: 0,
        step: 'none',
        hasHolds: false
      };
    }

    const now = Date.now();
    const sessionStart = new Date(session.expiresAt).getTime() - (this.DEFAULT_CONFIG.sessionTimeoutMinutes * 60 * 1000);
    
    return {
      sessionAge: Math.floor((now - sessionStart) / (1000 * 60)),
      timeRemaining: Math.floor((new Date(session.expiresAt).getTime() - now) / (1000 * 60)),
      step: session.bookingHold ? 'held' : 'browsing',
      hasHolds: this.getActiveHolds().length > 0
    };
  }
}

/**
 * React Hook for session management
 */
export function useBookingSession() {
  const [session, setSession] = React.useState<BookingSession | null>(null);
  const [timeoutWarning, setTimeoutWarning] = React.useState(false);

  React.useEffect(() => {
    // Load session on mount
    const currentSession = BookingSessionManager.getCurrentSession();
    setSession(currentSession);

    // Set up timeout warning timer
    if (currentSession) {
      const checkTimeout = () => {
        const warning = BookingSessionManager.getTimeoutWarning(currentSession);
        setTimeoutWarning(warning.showWarning);
      };

      const interval = setInterval(checkTimeout, 60000); // Check every minute
      checkTimeout(); // Check immediately

      return () => clearInterval(interval);
    }
  }, []);

  const updateSession = React.useCallback((updates: Partial<BookingSession>) => {
    BookingSessionManager.updateSession(updates);
    const updatedSession = BookingSessionManager.getCurrentSession();
    setSession(updatedSession);
  }, []);

  const extendSession = React.useCallback(() => {
    const success = BookingSessionManager.extendSession();
    if (success) {
      const updatedSession = BookingSessionManager.getCurrentSession();
      setSession(updatedSession);
      setTimeoutWarning(false);
    }
    return success;
  }, []);

  const clearSession = React.useCallback(() => {
    BookingSessionManager.clearSession();
    setSession(null);
    setTimeoutWarning(false);
  }, []);

  return {
    session,
    timeoutWarning,
    updateSession,
    extendSession,
    clearSession
  };
}

// Import React for the hook
import React from 'react';