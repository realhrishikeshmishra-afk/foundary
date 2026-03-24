import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type ConsultantApplication = Database['public']['Tables']['consultant_applications']['Row'];
type ConsultantApplicationInsert = Database['public']['Tables']['consultant_applications']['Insert'];
type ConsultantApplicationUpdate = Database['public']['Tables']['consultant_applications']['Update'];

export const consultantApplicationsService = {
  async getAll(status?: 'pending' | 'approved' | 'rejected') {
    let query = (supabase as any)
      .from('consultant_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ConsultantApplication[];
  },

  async getById(id: string) {
    const { data, error } = await (supabase as any)
      .from('consultant_applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ConsultantApplication;
  },

  async create(application: ConsultantApplicationInsert) {
    const { data, error } = await (supabase as any)
      .from('consultant_applications')
      .insert(application)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error.message, error.code, error.details);
      throw error;
    }
    return data as ConsultantApplication;
  },

  async update(id: string, updates: ConsultantApplicationUpdate) {
    const { data, error } = await (supabase as any)
      .from('consultant_applications')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as ConsultantApplication;
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from('consultant_applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
