import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/api";

interface User {
  id: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const checkAdminStatus = async (userId: string) => {
    try {
      console.log('Checking admin status for user:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      console.log('Admin check result:', { data, error });
      
      if (!error && data) {
        const isAdminUser = data.role === 'admin';
        setIsAdmin(isAdminUser);
        console.log('User is admin:', isAdminUser);
        return isAdminUser;
      } else {
        setIsAdmin(false);
        return false;
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Pegar token da API externa
        const token = auth.getToken();
        
        if (!token) {
          setUser(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Decodificar token JWT para extrair dados do usuário
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.id; // ID do usuário da API externa
        const userEmail = payload.email;

        console.log('User from token:', { userId, userEmail });

        setUser({
          id: userId,
          email: userEmail
        });

        // Verificar se é admin no Supabase usando o ID da API externa
        await checkAdminStatus(userId);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const signOut = async () => {
    auth.removeToken();
    setUser(null);
    setIsAdmin(false);
    navigate("/login", { replace: true });
  };

  return {
    user,
    session: null, // Mantido para compatibilidade
    isAdmin,
    loading,
    signOut
  };
}
