import { supabase } from '@/lib/supabase';
import { Channel, UserGroup, ChannelMessage, StartupShowcase } from './networking';

export interface Report {
  id: string;
  reporter_id: string;
  message_id: string | null;
  showcase_id: string | null;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
  reporter?: {
    full_name: string | null;
  };
  message?: ChannelMessage;
  showcase?: StartupShowcase;
}

export const adminNetworkingService = {
  // Channels Management
  async getAllChannelsAdmin() {
    const { data, error } = await supabase
      .from('channels')
      .select('*, created_by_profile:profiles!channels_created_by_fkey(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createChannelAdmin(channel: Partial<Channel>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('channels')
      .insert({
        ...channel,
        created_by: user?.id,
        member_count: 0,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateChannelAdmin(id: string, updates: Partial<Channel>) {
    const { data, error } = await supabase
      .from('channels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteChannelAdmin(id: string) {
    // Delete related data first
    await supabase.from('channel_members').delete().eq('channel_id', id);
    await supabase.from('channel_messages').delete().eq('channel_id', id);
    await supabase.from('startup_showcases').delete().eq('channel_id', id);
    
    const { error } = await supabase
      .from('channels')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleChannelStatus(id: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('channels')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Groups Management
  async getAllGroupsAdmin() {
    const { data, error } = await supabase
      .from('user_groups')
      .select(`
        *,
        creator:profiles!user_groups_created_by_fkey(full_name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async deleteGroupAdmin(id: string) {
    // Delete related data
    await supabase.from('group_members').delete().eq('group_id', id);
    await supabase.from('group_posts').delete().eq('group_id', id);
    
    const { error } = await supabase
      .from('user_groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async toggleGroupStatus(id: string, isDisabled: boolean) {
    const { data, error } = await supabase
      .from('user_groups')
      .update({ is_disabled: isDisabled })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Messages Management
  async getAllMessagesAdmin(limit = 100) {
    const { data, error } = await supabase
      .from('channel_messages')
      .select(`
        *,
        profiles:user_id(full_name),
        channels:channel_id(name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  async getMessagesByChannel(channelId: string) {
    const { data, error } = await supabase
      .from('channel_messages')
      .select(`
        *,
        profiles:user_id(full_name)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async deleteMessageAdmin(id: string) {
    // Delete replies first
    await supabase
      .from('channel_messages')
      .delete()
      .eq('reply_to', id);
    
    const { error } = await supabase
      .from('channel_messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Showcases Management
  async getAllShowcasesAdmin() {
    const { data, error } = await supabase
      .from('startup_showcases')
      .select(`
        *,
        profiles:user_id(full_name),
        channels:channel_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateShowcaseStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('startup_showcases')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteShowcaseAdmin(id: string) {
    const { error } = await supabase
      .from('startup_showcases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async featureShowcase(id: string, isFeatured: boolean) {
    const { data, error } = await supabase
      .from('startup_showcases')
      .update({ is_featured: isFeatured })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Reports Management
  async getAllReports() {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reports_reporter_id_fkey(full_name),
        message:channel_messages(id, content, user_id),
        showcase:startup_showcases(id, startup_name, user_id)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Report[];
  },

  async updateReportStatus(id: string, status: 'pending' | 'resolved' | 'dismissed') {
    const { data, error } = await supabase
      .from('reports')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async createReport(report: {
    message_id?: string;
    showcase_id?: string;
    reason: string;
  }) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('reports')
      .insert({
        ...report,
        reporter_id: user?.id,
        status: 'pending',
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Statistics
  async getNetworkingStats() {
    const [channels, groups, messages, showcases, reports] = await Promise.all([
      supabase.from('channels').select('id', { count: 'exact', head: true }),
      supabase.from('user_groups').select('id', { count: 'exact', head: true }),
      supabase.from('channel_messages').select('id', { count: 'exact', head: true }),
      supabase.from('startup_showcases').select('id', { count: 'exact', head: true }),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

    return {
      totalChannels: channels.count || 0,
      totalGroups: groups.count || 0,
      totalMessages: messages.count || 0,
      totalShowcases: showcases.count || 0,
      pendingReports: reports.count || 0,
    };
  },
};
