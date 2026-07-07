import { supabase } from '@/lib/supabase';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
  created_at: string;
}

export const faqsService = {
  async getAll() {
    const { data, error } = await (supabase as any)
      .from('faqs')
      .select('*')
      .order('order_index');
    
    if (error) throw error;
    return data as FAQ[];
  },

  async create(faq: { question: string; answer: string; order_index: number }) {
    const { data, error } = await (supabase as any)
      .from('faqs')
      .insert(faq)
      .select()
      .single();
    
    if (error) throw error;
    return data as FAQ;
  },

  async update(id: string, updates: { question?: string; answer?: string; order_index?: number }) {
    const { data, error} = await (supabase as any)
      .from('faqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as FAQ;
  },

  async delete(id: string) {
    const { error } = await (supabase as any)
      .from('faqs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },
};
