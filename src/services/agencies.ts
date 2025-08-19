import { supabase } from '@/lib/supabase';
import { Agency, AgencyWithMembers, User } from '@/types/models';

export interface CreateAgencyData {
  name: string;
  status?: 'Open to Work' | 'Busy' | 'Break/Vacation' | 'Holiday';
}

export interface UpdateAgencyData {
  name?: string;
  status?: 'Open to Work' | 'Busy' | 'Break/Vacation' | 'Holiday';
  recent_activity?: string[];
}

export interface CreateMemberData {
  full_name: string;
  email: string;
  password: string;
  agency_roles: string[];
}

export const AgencyService = {
  async getAllAgencies(): Promise<AgencyWithMembers[]> {
    const { data: agencies, error: agenciesError } = await supabase
      .from('agencies')
      .select('*')
      .order('created_at', { ascending: false });

    if (agenciesError) throw agenciesError;

    const agenciesWithMembers = await Promise.all(
      agencies.map(async (agency) => {
        const { data: members, error: membersError } = await supabase
          .from('agency_members')
          .select(`
            *,
            user_profiles (*)
          `)
          .eq('agency_id', agency.id);

        if (membersError) throw membersError;

        const { data: owner, error: ownerError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', agency.owner_id)
          .single();

        if (ownerError) throw ownerError;

        // Get email from auth.users for owner
        const { data: ownerAuth } = await supabase.auth.admin.getUserById(agency.owner_id);

        return {
          ...agency,
          members: members.map(m => ({ 
            ...m.user_profiles, 
            email: '' // We'll need to fetch this separately if needed
          })),
          owner: { 
            ...owner, 
            email: ownerAuth.user?.email || '' 
          },
        };
      })
    );

    return agenciesWithMembers;
  },

  async getAgencyById(agencyId: string): Promise<AgencyWithMembers | null> {
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

    // Get email from auth.users for owner
    const { data: ownerAuth } = await supabase.auth.admin.getUserById(agency.owner_id);

    return {
      ...agency,
      members: members.map(m => ({ 
        ...m.user_profiles, 
        email: '' // We'll need to fetch this separately if needed
      })),
      owner: { 
        ...owner, 
        email: ownerAuth.user?.email || '' 
      },
    };
  },

  async createAgency(data: CreateAgencyData, ownerId: string): Promise<Agency> {
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
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ agency_id: agency.id })
      .eq('id', ownerId);

    if (updateError) throw updateError;

    return agency;
  },

  async updateAgency(agencyId: string, updates: UpdateAgencyData): Promise<Agency> {
    const { data, error } = await supabase
      .from('agencies')
      .update(updates)
      .eq('id', agencyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAgency(agencyId: string): Promise<void> {
    // First remove all members
    const { error: membersError } = await supabase
      .from('agency_members')
      .delete()
      .eq('agency_id', agencyId);

    if (membersError) throw membersError;

    // Update user profiles to remove agency_id
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ agency_id: null })
      .eq('agency_id', agencyId);

    if (updateError) throw updateError;

    // Delete the agency
    const { error } = await supabase
      .from('agencies')
      .delete()
      .eq('id', agencyId);

    if (error) throw error;
  },

  async addRecentActivity(agencyId: string, activity: string): Promise<Agency> {
    // Get current activities
    const { data: agency, error: fetchError } = await supabase
      .from('agencies')
      .select('recent_activity')
      .eq('id', agencyId)
      .single();

    if (fetchError) throw fetchError;

    const updatedActivities = [activity, ...(agency.recent_activity || [])].slice(0, 10);

    const { data, error } = await supabase
      .from('agencies')
      .update({ recent_activity: updatedActivities })
      .eq('id', agencyId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async createMember(agencyId: string, memberData: CreateMemberData): Promise<User> {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: memberData.email,
      password: memberData.password,
      user_metadata: {
        full_name: memberData.full_name,
      },
    });

    if (authError) throw authError;

    // Update user profile with agency roles
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .update({
        agency_roles: memberData.agency_roles,
        agency_id: agencyId,
      })
      .eq('id', authData.user.id)
      .select()
      .single();

    if (profileError) throw profileError;

    // Add to agency members
    const { error: memberError } = await supabase
      .from('agency_members')
      .insert({
        agency_id: agencyId,
        user_id: authData.user.id,
      });

    if (memberError) throw memberError;

    return {
      ...profile,
      email: memberData.email,
    };
  },

  async updateMemberRoles(userId: string, agencyRoles: string[]): Promise<User> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({ agency_roles: agencyRoles })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Get email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);

    return {
      ...data,
      email: authUser.user?.email || '',
    };
  },

  async removeMember(agencyId: string, userId: string): Promise<void> {
    // Remove from agency members
    const { error: memberError } = await supabase
      .from('agency_members')
      .delete()
      .eq('agency_id', agencyId)
      .eq('user_id', userId);

    if (memberError) throw memberError;

    // Update user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({ 
        agency_id: null,
        agency_roles: [],
      })
      .eq('id', userId);

    if (profileError) throw profileError;
  },
};