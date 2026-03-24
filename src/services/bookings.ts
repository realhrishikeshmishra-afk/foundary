import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

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
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    
    if (error) throw error;
    return data as Booking;
  },

  async update(id: string, updates: BookingUpdate) {
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
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async updateStatus(id: string, status: Booking['status']) {
    return this.update(id, { status });
  },

  async updatePaymentStatus(id: string, paymentStatus: Booking['payment_status']) {
    return this.update(id, { payment_status: paymentStatus });
  },

  async reschedule(id: string, newDate: string, newTime: string) {
    return this.update(id, { 
      date: newDate, 
      time: newTime,
      status: 'confirmed' // Reset to confirmed when rescheduled
    });
  },
};
