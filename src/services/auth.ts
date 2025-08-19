import { supabase } from "@/lib/supabase";
import { User } from "@/types/models";

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

const uploadProfileImage = async (file: File, userId: string) => {
  if (!file) return null;

  // unique filename (user id + timestamp to avoid collisions)
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}_${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error } = await supabase.storage
    .from("profiles")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Image upload error:", error.message);
    return null;
  }

  // Get public URL
  const { data } = supabase.storage.from("profiles").getPublicUrl(filePath);
  return data.publicUrl;
};

export const AuthService = {
  async signUp(data: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
        },
      },
    });

    if (authError) throw authError;

    // Profile will be created automatically via trigger
    return authData;
  },

  async signIn(data: SignInData) {
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
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
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    // Get email from auth.users
    const { data: authUser } = await supabase.auth.getUser();

    return {
      ...data,
      email: authUser.user?.email || "",
      profile_pic: data.profile_pic || data.avatar_url,
      background_pic: data.background_pic || data.background_img,
      theme_pic: data.theme_pic || data.theme_url,
    };
  },

  async updateProfile(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    return this.getProfile(user.id);
  },
};
