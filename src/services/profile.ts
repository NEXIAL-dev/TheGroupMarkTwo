import { supabase } from '@/lib/supabase';
import { User, Agency, AgencyMember, AgencyWithMembers } from '@/types/models';

export interface UpdateProfileData {
  full_name?: string;
  base_roles?: string[];
  agency_roles?: string[];
  profile_pic?: string;
  background_pic?: string;
  theme_pic?: string;
}

export interface CreateAgencyData {
  name: string;
  status?: 'Open to Work' | 'Busy' | 'Break/Vacation' | 'Holiday';
}

export interface UpdateAgencyData {
  name?: string;
  status?: 'Open to Work' | 'Busy' | 'Break/Vacation' | 'Holiday';
  recent_activity?: string[];
}

export const ProfileService = {
  async updateProfile(userId: string, updates: UpdateProfileData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async uploadProfileImage(userId: string, file: File, type: 'profile' | 'background' | 'theme') {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);

    // Update user profile with new image URL
    const updateField = type === 'profile' ? 'profile_pic' : 
                       type === 'background' ? 'background_pic' : 'theme_pic';
    
    await this.updateProfile(userId, { [updateField]: publicUrl });

    return publicUrl;
  },

  async createAgency(data: CreateAgencyData, ownerId: string) {
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .insert({
        name: data.name,
        owner_id: ownerId,
        status: data.status || 'Open to Work',
      })
      .select()
      .single();

    if (agencyError) throw agencyError;

    // Add owner as member
    const { error: memberError } = await supabase
      .from('agency_members')
      .insert({
        agency_id: agency.id,
        user_id: ownerId,
      });

    if (memberError) throw memberError;

    // Update user profile with agency_id
    await this.updateProfile(ownerId, { agency_id: agency.id });

    return agency;
  },

  async updateAgency(agencyId: string, updates: UpdateAgencyData) {
    const { data, error } = await supabase
      .from('agencies')
      .update(updates)
      .eq('id', agencyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAgency(agencyId: string) {
    const { error } = await supabase
      .from('agencies')
      .delete()
      .eq('id', agencyId);

    if (error) throw error;
  },

  async getAgencyWithMembers(agencyId: string): Promise<AgencyWithMembers | null> {
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*')
      .eq('id', agencyId)
      .single();

    if (agencyError) throw agencyError;

    const { data: members, error: membersError } = await supabase
      .from('agency_members')
      .select(`
        *,
        user_profiles (*)
      `)
      .eq('agency_id', agencyId);

    if (membersError) throw membersError;

    const { data: owner, error: ownerError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', agency.owner_id)
      .single();

    if (ownerError) throw ownerError;

    return {
      ...agency,
      members: members.map(m => ({ ...m.user_profiles, email: '' })),
      owner: { ...owner, email: '' },
    };
  },

  async addAgencyMember(agencyId: string, userId: string) {
    const { data, error } = await supabase
      .from('agency_members')
      .insert({
        agency_id: agencyId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async removeAgencyMember(agencyId: string, userId: string) {
    const { error } = await supabase
      .from('agency_members')
      .delete()
      .eq('agency_id', agencyId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async addRecentActivity(agencyId: string, activity: string) {
    // Get current activities
    const { data: agency, error: fetchError } = await supabase
      .from('agencies')
      .select('recent_activity')
      .eq('id', agencyId)
      .single();

    if (fetchError) throw fetchError;

    const updatedActivities = [activity, ...(agency.recent_activity || [])].slice(0, 10); // Keep last 10

    const { data, error } = await supabase
      .from('agencies')
      .update({ recent_activity: updatedActivities })
      .eq('id', agencyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};