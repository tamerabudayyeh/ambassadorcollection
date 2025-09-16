// Booking service that uses API routes for database operations
export interface BookingRequest {
  hotelId: string;
  roomId: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children?: number;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    country?: string;
    city?: string;
    specialRequests?: string;
  };
  paymentMethod?: string;
}

export interface BookingResponse {
  success: boolean;
  booking?: any;
  error?: string;
}

export interface AvailabilityRequest {
  hotelId: string;
  checkInDate: Date;
  checkOutDate: Date;
  adults: number;
  children?: number;
}

export class BookingService {
  // Get all hotels with optional room information
  static async getHotels(includeRooms = false): Promise<any> {
    try {
      const url = includeRooms ? '/api/hotels?includeRooms=true' : '/api/hotels'
      const response = await fetch(url)
      return await response.json()
    } catch (error) {
      console.error('Error fetching hotels:', error)
      return { success: false, error: 'Failed to fetch hotels' }
    }
  }

  // Check room availability for given dates and criteria
  static async checkAvailability(request: AvailabilityRequest): Promise<any> {
    try {
      const response = await fetch('/api/booking/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: request.hotelId,
          checkInDate: request.checkInDate.toISOString(),
          checkOutDate: request.checkOutDate.toISOString(),
          adults: request.adults,
          children: request.children || 0
        })
      })
      
      return await response.json()
    } catch (error) {
      console.error('Error checking availability:', error)
      return { success: false, error: 'Failed to check availability' }
    }
  }

  // Create a new booking
  static async createBooking(request: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await fetch('/api/booking/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId: request.hotelId,
          roomId: request.roomId,
          checkInDate: request.checkInDate.toISOString(),
          checkOutDate: request.checkOutDate.toISOString(),
          adults: request.adults,
          children: request.children || 0,
          guestDetails: request.guestDetails,
          paymentMethod: request.paymentMethod || 'credit_card'
        })
      })
      
      return await response.json()
    } catch (error) {
      console.error('Error creating booking:', error)
      return { success: false, error: 'Failed to create booking' }
    }
  }

  // Look up booking by confirmation number or email + last name
  static async lookupBooking(params: { 
    confirmationNumber?: string; 
    email?: string; 
    lastName?: string; 
  }): Promise<any> {
    try {
      let url = '/api/booking/lookup?'
      if (params.confirmationNumber) {
        url += `confirmationNumber=${encodeURIComponent(params.confirmationNumber)}`
      } else if (params.email && params.lastName) {
        url += `email=${encodeURIComponent(params.email)}&lastName=${encodeURIComponent(params.lastName)}`
      } else {
        throw new Error('Either confirmation number or email + last name is required')
      }
      
      const response = await fetch(url)
      return await response.json()
    } catch (error) {
      console.error('Error looking up booking:', error)
      return { success: false, error: 'Failed to lookup booking' }
    }
  }

  // Cancel a booking
  static async cancelBooking(confirmationNumber: string, reason?: string): Promise<BookingResponse> {
    try {
      const response = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmationNumber,
          reason: reason || 'Guest cancellation'
        })
      })
      
      return await response.json()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      return { success: false, error: 'Failed to cancel booking' }
    }
  }

  // localStorage fallback methods for offline functionality
  static saveBookingToLocal(booking: any): void {
    try {
      const existingBookings = this.getLocalBookings()
      existingBookings.push(booking)
      localStorage.setItem('ambassador_bookings', JSON.stringify(existingBookings))
    } catch (error) {
      console.error('Error saving booking to localStorage:', error)
    }
  }

  static getLocalBookings(): any[] {
    try {
      const bookings = localStorage.getItem('ambassador_bookings')
      return bookings ? JSON.parse(bookings) : []
    } catch (error) {
      console.error('Error getting local bookings:', error)
      return []
    }
  }

  static removeLocalBooking(confirmationNumber: string): void {
    try {
      const bookings = this.getLocalBookings()
      const filtered = bookings.filter(b => b.confirmationNumber !== confirmationNumber)
      localStorage.setItem('ambassador_bookings', JSON.stringify(filtered))
    } catch (error) {
      console.error('Error removing local booking:', error)
    }
  }

  // Search functionality
  static generateConfirmationNumber(): string {
    return 'AMB' + Math.random().toString(36).substr(2, 6).toUpperCase()
  }

  // Validate booking request
  static validateBookingRequest(request: BookingRequest): { valid: boolean; message?: string } {
    if (request.checkInDate >= request.checkOutDate) {
      return { valid: false, message: 'Check-in date must be before check-out date' }
    }

    if (request.checkInDate < new Date()) {
      return { valid: false, message: 'Check-in date cannot be in the past' }
    }

    if (request.adults < 1) {
      return { valid: false, message: 'At least one adult is required' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(request.guestDetails.email)) {
      return { valid: false, message: 'Valid email address is required' }
    }

    if (!request.guestDetails.firstName || !request.guestDetails.lastName) {
      return { valid: false, message: 'First name and last name are required' }
    }

    return { valid: true }
  }
}