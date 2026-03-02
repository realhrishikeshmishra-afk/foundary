import { supabase } from '@/lib/supabase';

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  category: string;
  icon: string | null;
  is_public: boolean;
  member_count: number;
  created_by: string | null;
  created_at: string;
  is_member?: boolean;
}

export interface ChannelMessage {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  attachments: any[];
  reply_to: string | null;
  reactions: any;
  tags?: string[];
  is_edited?: boolean;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

export interface UserGroup {
  id: string;
  name: string;
  description: string | null;
  category: string;
  avatar_url: string | null;
  is_private: boolean;
  created_by: string;
  member_count: number;
  created_at: string;
  is_member?: boolean;
}

export interface StartupShowcase {
  id: string;
  channel_id: string;
  user_id: string;
  startup_name: string;
  industry: string;
  description: string;
  website: string | null;
  looking_for: string[];
  logo_url: string | null;
  likes_count: number;
  created_at: string;
  profiles?: {
    full_name: string | null;
  };
}

export const COLLABORATION_TAGS = [
  { value: 'co-founder', label: 'Looking for Co-founder', icon: '🤝' },
  { value: 'hiring', label: 'Hiring', icon: '👥' },
  { value: 'seeking-investors', label: 'Seeking Investors', icon: '💰' },
  { value: 'partnership', label: 'Partnership', icon: '🤜🤛' },
  { value: 'mentorship', label: 'Mentorship', icon: '🎓' },
  { value: 'open-to-collaborate', label: 'Open to Collaborate', icon: '✨' },
];

export const networkingService = {
  // Channels
  async getAllChannels() {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    
    if (error) throw error;
    return data as Channel[];
  },

  async getChannelById(id: string) {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Channel;
  },

  async createChannel(channel: Partial<Channel>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('channels')
      .insert({
        ...channel,
        created_by: user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Channel;
  },

  async joinChannel(channelId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await (supabase as any)
      .from('channel_members')
      .insert({
        channel_id: channelId,
        user_id: user?.id
      });
    
    if (error) throw error;
  },

  async leaveChannel(channelId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('channel_members')
      .delete()
      .eq('channel_id', channelId)
      .eq('user_id', user?.id);
    
    if (error) throw error;
  },

  async isChannelMember(channelId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('channel_members')
      .select('id')
      .eq('channel_id', channelId)
      .eq('user_id', user?.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking channel membership:', error);
      return false;
    }
    
    return !!data;
  },

  // Messages
  async getChannelMessages(channelId: string, limit = 50) {
    const { data, error } = await supabase
      .from('channel_messages')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data as any[]).reverse() as ChannelMessage[];
  },

  async sendMessage(channelId: string, content: string, replyTo?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('channel_messages')
      .insert({
        channel_id: channelId,
        user_id: user?.id,
        content,
        reply_to: replyTo || null
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as ChannelMessage;
  },

  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('channel_messages')
      .delete()
      .eq('id', messageId);
    
    if (error) throw error;
  },

  // User Groups
  async getAllGroups() {
    const { data, error } = await supabase
      .from('user_groups')
      .select('*')
      .eq('is_private', false)
      .eq('is_disabled', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as UserGroup[];
  },

  async getMyGroups() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    // Get group IDs first
    const { data: memberData, error: memberError } = await (supabase as any)
      .from('group_members')
      .select('group_id')
      .eq('user_id', user?.id);
    
    if (memberError) throw memberError;
    
    const groupIds = memberData?.map((m: any) => m.group_id) || [];
    
    if (groupIds.length === 0) return [];
    
    const { data, error } = await (supabase as any)
      .from('user_groups')
      .select('*')
      .in('id', groupIds)
      .eq('is_disabled', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as UserGroup[];
  },

  async createGroup(group: Partial<UserGroup>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('user_groups')
      .insert({
        ...group,
        created_by: user?.id
      })
      .select()
      .single();
    
    if (error) throw error;

    // Auto-join creator as owner
    await (supabase as any)
      .from('group_members')
      .insert({
        group_id: data.id,
        user_id: user?.id,
        role: 'owner'
      });
    
    return data as UserGroup;
  },

  async joinGroup(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await (supabase as any)
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: user?.id
      });
    
    if (error) throw error;
  },

  async leaveGroup(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user?.id);
    
    if (error) throw error;
  },

  // Group Posts (Messages)
  async getGroupPosts(groupId: string, limit = 50) {
    const { data, error } = await (supabase as any)
      .from('group_posts')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return (data as any[]).reverse();
  },

  async sendGroupPost(groupId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('group_posts')
      .insert({
        group_id: groupId,
        user_id: user?.id,
        content,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateGroupPost(postId: string, content: string) {
    const { data, error } = await (supabase as any)
      .from('group_posts')
      .update({ content })
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteGroupPost(postId: string) {
    const { error } = await (supabase as any)
      .from('group_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
  },

  async isGroupMember(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;
    
    const { data, error } = await (supabase as any)
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user?.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking group membership:', error);
      return false;
    }
    
    return !!data;
  },

  // Startup Showcases
  async getChannelShowcases(channelId: string) {
    const { data, error } = await (supabase as any)
      .from('startup_showcases')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as StartupShowcase[];
  },

  async createShowcase(showcase: Partial<StartupShowcase>) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('startup_showcases')
      .insert({
        ...showcase,
        user_id: user?.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as StartupShowcase;
  },

  async updateShowcase(id: string, updates: Partial<StartupShowcase>) {
    const { data, error } = await (supabase as any)
      .from('startup_showcases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as StartupShowcase;
  },

  async deleteShowcase(id: string) {
    const { error } = await (supabase as any)
      .from('startup_showcases')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Message Management
  async updateMessage(messageId: string, content: string) {
    const { data, error } = await (supabase as any)
      .from('channel_messages')
      .update({ content })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ChannelMessage;
  },

  async addMessageTags(messageId: string, tags: string[]) {
    const { data, error } = await (supabase as any)
      .from('channel_messages')
      .update({ tags })
      .eq('id', messageId)
      .select()
      .single();
    
    if (error) throw error;
    return data as ChannelMessage;
  },

  async getMessagesByTag(channelId: string, tag: string) {
    const { data, error } = await (supabase as any)
      .from('channel_messages')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq('channel_id', channelId)
      .contains('tags', [tag])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as ChannelMessage[];
  },
};
