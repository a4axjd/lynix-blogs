
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export type AuthUser = {
  id: string;
  email: string;
};

export async function signIn(email: string, password: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    if (data?.user) {
      return {
        id: data.user.id,
        email: data.user.email!
      };
    }
    
    return null;
  } catch (error) {
    console.error("Authentication error:", error);
    toast({
      title: "Login failed",
      description: "An unexpected error occurred during login.",
      variant: "destructive",
    });
    return null;
  }
}

export async function signUp(email: string, password: string): Promise<AuthUser | null> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      });
      return null;
    }

    if (data?.user) {
      return {
        id: data.user.id,
        email: data.user.email!
      };
    }
    
    return null;
  } catch (error) {
    console.error("Registration error:", error);
    toast({
      title: "Registration failed",
      description: "An unexpected error occurred during registration.",
      variant: "destructive",
    });
    return null;
  }
}

export async function signOut(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
    return true;
  } catch (error) {
    console.error("Sign out error:", error);
    toast({
      title: "Sign out failed",
      description: "An unexpected error occurred during sign out.",
      variant: "destructive",
    });
    return false;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    return {
      id: session.user.id,
      email: session.user.email!
    };
  } catch (error) {
    console.error("Get user error:", error);
    return null;
  }
}
