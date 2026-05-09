import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import {
  validateUUID,
  validateDate,
  validateTime,
  validateAmount,
  validateSessionDuration,
  validateBookingStatus,
  validatePaymentStatus,
  sanitizeString,
  validateEmail,
} from '@/utils/security';

type Booking = Database['public']['Tables']['bookings']['Row'];
type BookingInsert = Database['public']['Tables']['bookings']['Insert'];
type BookingUpdate = Database['public']['Tables']['bookings']['Update'];

export const bookingsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        consultants (
          name,
          title
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getByUserId(userId: string) {
    if (!validateUUID(userId)) {
      throw new Error('Invalid user ID');
    }

    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        consultants (
          name,
          title
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async create(booking: BookingInsert) {
    // Validate all inputs
    if (!validateUUID(booking.user_id)) {
      throw new Error('Invalid user ID');
    }
    if (!validateUUID(booking.consultant_id)) {
      throw new Error('Invalid consultant ID');
    }
    if (!validateEmail(booking.email)) {
      throw new Error('Invalid email address');
    }
    if (!validateDate(booking.date)) {
      throw new Error('Invalid date format');
    }
    if (!validateTime(booking.time)) {
      throw new Error('Invalid time format');
    }
    if (!validateSessionDuration(booking.session_duration)) {
      throw new Error('Invalid session duration');
    }
    if (booking.session_price && !validateAmount(booking.session_price)) {
      throw new Error('Invalid session price');
    }

    // Sanitize string inputs
    const sanitizedBooking = {
      ...booking,
      name: sanitizeString(booking.name),
      email: booking.email.toLowerCase().trim(),
      message: booking.message ? sanitizeString(booking.message) : null,
    };

    const { data, error } = await supabase
      .from('bookings')
      .insert(sanitizedBooking)
      .select()
      .single();
    
    if (error) throw error;
    return data as Booking;
  },

  async update(id: string, updates: BookingUpdate) {
    if (!validateUUID(id)) {
      throw new Error('Invalid booking ID');
    }

    // Validate updates
    if (updates.status && !validateBookingStatus(updates.status)) {
      throw new Error('Invalid booking status');
    }
    if (updates.payment_status && !validatePaymentStatus(updates.payment_status)) {
      throw new Error('Invalid payment status');
    }
    if (updates.date && !validateDate(updates.date)) {
      throw new Error('Invalid date format');
    }
    if (updates.time && !validateTime(updates.time)) {
      throw new Error('Invalid time format');
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Booking;
  },

  async delete(id: string) {
    if (!validateUUID(id)) {
      throw new Error('Invalid booking ID');
    }

    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStatus(id: string, status: Booking['status']) {
    if (!validateBookingStatus(status)) {
      throw new Error('Invalid booking status');
    }
    return this.update(id, { status });
  },

  async updatePaymentStatus(id: string, paymentStatus: Booking['payment_status']) {
    if (!validatePaymentStatus(paymentStatus)) {
      throw new Error('Invalid payment status');
    }
    return this.update(id, { payment_status: paymentStatus });
  },

  async reschedule(id: string, newDate: string, newTime: string) {
    if (!validateDate(newDate) || !validateTime(newTime)) {
      throw new Error('Invalid date or time format');
    }
    return this.update(id, { 
      date: newDate, 
      time: newTime,
      status: 'confirmed'
    });
  },
};
