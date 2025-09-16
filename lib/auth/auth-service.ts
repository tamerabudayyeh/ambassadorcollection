import { supabase as supabaseClient } from '@/lib/supabase/client';
import { User, AuthError, Session } from '@supabase/supabase-js';

export interface GuestProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: string;
  preferredCurrency: string;
  marketingOptIn: boolean;
  profileImageUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryRestrictions?: string[];
  accessibilityNeeds?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  marketingOptIn?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
}

export class AuthService {
  private supabase = supabaseClient;

  /**
   * Sign up a new guest
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            country: data.country,
            marketingOptIn: data.marketingOptIn || false,
          },
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Create guest profile
      const { error: profileError } = await this.supabase
        .from('guest_profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          country: data.country,
          preferred_currency: 'USD',
          marketing_opt_in: data.marketingOptIn || false,
        });

      if (profileError) {
        console.error('Failed to create guest profile:', profileError);
        // Don't fail the registration, profile can be created later
      }

      return {
        success: true,
        user: authData.user,
        session: authData.session || undefined,
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message || 'Sign up failed' };
    }
  }

  /**
   * Sign in an existing guest
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        user: authData.user,
        session: authData.session || undefined,
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message || 'Sign in failed' };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signOut();
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message || 'Sign out failed' };
    }
  }

  /**
   * Get the current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Get the current session
   */
  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get current session error:', error);
      return null;
    }
  }

  /**
   * Get guest profile
   */
  async getGuestProfile(userId: string): Promise<GuestProfile | null> {
    try {
      const { data, error } = await this.supabase
        .from('guest_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Get guest profile error:', error);
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone,
        country: data.country,
        city: data.city,
        address: data.address,
        postalCode: data.postal_code,
        dateOfBirth: data.date_of_birth,
        preferredCurrency: data.preferred_currency,
        marketingOptIn: data.marketing_opt_in,
        profileImageUrl: data.profile_image_url,
        emergencyContactName: data.emergency_contact_name,
        emergencyContactPhone: data.emergency_contact_phone,
        dietaryRestrictions: data.dietary_restrictions,
        accessibilityNeeds: data.accessibility_needs,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Get guest profile error:', error);
      return null;
    }
  }

  /**
   * Update guest profile
   */
  async updateGuestProfile(
    userId: string,
    updates: Partial<Omit<GuestProfile, 'id' | 'email' | 'createdAt' | 'updatedAt'>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {};
      
      if (updates.firstName) updateData.first_name = updates.firstName;
      if (updates.lastName) updateData.last_name = updates.lastName;
      if (updates.phone) updateData.phone = updates.phone;
      if (updates.country) updateData.country = updates.country;
      if (updates.city) updateData.city = updates.city;
      if (updates.address) updateData.address = updates.address;
      if (updates.postalCode) updateData.postal_code = updates.postalCode;
      if (updates.dateOfBirth) updateData.date_of_birth = updates.dateOfBirth;
      if (updates.preferredCurrency) updateData.preferred_currency = updates.preferredCurrency;
      if (updates.marketingOptIn !== undefined) updateData.marketing_opt_in = updates.marketingOptIn;
      if (updates.profileImageUrl) updateData.profile_image_url = updates.profileImageUrl;
      if (updates.emergencyContactName) updateData.emergency_contact_name = updates.emergencyContactName;
      if (updates.emergencyContactPhone) updateData.emergency_contact_phone = updates.emergencyContactPhone;
      if (updates.dietaryRestrictions) updateData.dietary_restrictions = updates.dietaryRestrictions;
      if (updates.accessibilityNeeds) updateData.accessibility_needs = updates.accessibilityNeeds;

      const { error } = await this.supabase
        .from('guest_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update guest profile error:', error);
      return { success: false, error: error.message || 'Profile update failed' };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Reset password error:', error);
      return { success: false, error: error.message || 'Password reset failed' };
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update password error:', error);
      return { success: false, error: error.message || 'Password update failed' };
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return { success: false, error: error.message || 'Google sign in failed' };
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (user: User | null) => void) {
    return this.supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}

// Export singleton instance
export const authService = new AuthService();