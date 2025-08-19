import { supabase } from '@/lib/supabase';
import { User } from '@/types/models';

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  base_roles?: string[];
  agency_roles?: string[];
  agency_name?: string;
  profile_image?: File;
}

export interface SignInData {
  email: string;
  password: string;
}

export const AuthService = {
  async signUp(data: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          base_roles: data.base_roles || ['Core Member'],
          agency_roles: data.agency_roles || [],
          agency_name: data.agency_name,
        },
      },
    });

    if (authError) throw authError;

    // Upload profile image if provided
    if (data.profile_image && authData.user) {
      try {
        await this.uploadProfileImage(authData.user.id, data.profile_image);
      } catch (error) {
        console.error('Error uploading profile image:', error);
        // Don't fail signup if image upload fails
      }
    }

    // Profile will be created automatically via trigger
    return authData;
  },

  async signIn(data: SignInData) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) throw authError;

    // Fetch user profile
    if (authData.user) {
      const profile = await this.getProfile(authData.user.id);
      return { ...authData, profile };
    }

    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getProfile(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    // Get email from auth.users
    const { data: authUser } = await supabase.auth.getUser();
    
    return {
      ...data,
      email: authUser.user?.email || '',
      profile_pic: data.profile_pic || data.avatar_url,
      background_pic: data.background_pic || data.background_img,
      theme_pic: data.theme_pic || data.theme_url,
    };
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;
    
    return this.getProfile(user.id);
  },

  async uploadProfileImage(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/profile_${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profiles')
      .getPublicUrl(fileName);

    // Update user profile with new image URL
    await this.updateProfile(userId, { profile_pic: publicUrl });

    return publicUrl;
  },
};