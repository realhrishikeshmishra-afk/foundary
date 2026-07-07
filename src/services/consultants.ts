import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Consultant = Database['public']['Tables']['consultants']['Row'];
type ConsultantInsert = Database['public']['Tables']['consultants']['Insert'];
type ConsultantUpdate = Database['public']['Tables']['consultants']['Update'];

export const consultantsService = {
  async getAll(activeOnly = false) {
    let query = supabase.from('consultants').select('*').order('created_at', { ascending: false });
    
    if (activeOnly) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Consultant[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('consultants')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Consultant;
  },

  async create(consultant: ConsultantInsert) {
    const { data, error } = await supabase
      .from('consultants')
      .insert(consultant)
      .select()
      .single();
    
    if (error) throw error;
    return data as Consultant;
  },

  async update(id: string, updates: ConsultantUpdate) {
    const { data, error } = await supabase
      .from('consultants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Consultant;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('consultants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean) {
    return this.update(id, { is_active: isActive });
  },
};
