import { supabase } from '@/lib/supabase';

interface SiteSetting {
  id: string;
  setting_key: string;
  setting_value: string | null;
  updated_at: string;
}

export const settingsService = {
  async getAll() {
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('*');
    
    if (error) throw error;
    return data as SiteSetting[];
  },

  async getBySetting(settingKey: string) {
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .select('*')
      .eq('setting_key', settingKey)
      .single();
    
    if (error) throw error;
    return data as SiteSetting;
  },

  async update(settingKey: string, settingValue: string | null) {
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .update({ 
        setting_value: settingValue
      })
      .eq('setting_key', settingKey)
      .select()
      .single();
    
    if (error) throw error;
    return data as SiteSetting;
  },

  async upsert(settingKey: string, settingValue: string | null) {
    const { data, error } = await (supabase as any)
      .from('site_settings')
      .upsert({ 
        setting_key: settingKey, 
        setting_value: settingValue,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'setting_key'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as SiteSetting;
  },
};
