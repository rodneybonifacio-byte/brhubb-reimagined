import { useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const forceRefreshAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      console.log('Force refresh admin status:', { data, error });
      
      if (!error && data) {
        setIsAdmin(data.role === 'admin');
      }
    }
  };

  // Forçar verificação de admin a cada 2 segundos (apenas para debug)
  useEffect(() => {
    const interval = setInterval(() => {
      forceRefreshAdminStatus();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('Admin check result:', { data, error });
      
      if (!error && data) {
        setIsAdmin(data.role === 'admin');
        console.log('User is admin:', data.role === 'admin');
      } else {
        // Se não encontrou role, criar uma role de admin automaticamente
        console.log('No role found, creating admin role...');
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
        
        if (!insertError) {
          setIsAdmin(true);
          console.log('Admin role created successfully');
        } else {
          console.error('Failed to create admin role:', insertError);
          setIsAdmin(false);
        }
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return {
    user,
    session,
    isAdmin,
    loading,
    signOut
  };
}
