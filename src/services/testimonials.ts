import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type Testimonial = Database['public']['Tables']['testimonials']['Row'];
type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert'];
type TestimonialUpdate = Database['public']['Tables']['testimonials']['Update'];

export const testimonialsService = {
  async getAll(publishedOnly = false) {
    let query = supabase.from('testimonials').select('*').order('created_at', { ascending: false });
    
    if (publishedOnly) {
      query = query.eq('status', 'published');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as Testimonial[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Testimonial;
  },

  async create(testimonial: TestimonialInsert) {
    const { data, error } = await (supabase as any)
      .from('testimonials')
      .insert(testimonial)
      .select()
      .single();
    
    if (error) throw error;
    return data as Testimonial;
  },

  async update(id: string, updates: TestimonialUpdate) {
    const { data, error } = await (supabase as any)
      .from('testimonials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Testimonial;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleStatus(id: string, status: 'published' | 'draft') {
    return this.update(id, { status });
  },
};
