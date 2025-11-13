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
  const [isImpersonating, setIsImpersonating] = useState(false);
  const navigate = useNavigate();

  const checkAdminStatus = async (userId: string) => {
    try {
      // Se estiver impersonando, não é admin na visão do sistema
      const impersonating = localStorage.getItem('is_impersonating') === 'true';
      if (impersonating) {
        setIsAdmin(false);
        setIsImpersonating(true);
        return false;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (!error && data) {
        const isAdminUser = data.role === 'admin';
        setIsAdmin(isAdminUser);
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
        // Verificar se está impersonando
        const impersonating = localStorage.getItem('is_impersonating') === 'true';
        
        // Pegar token da API externa
        const token = auth.getToken();
        
        if (!token) {
          setUser(null);
          setIsAdmin(false);
          setIsImpersonating(false);
          setLoading(false);
          return;
        }

        // Decodificar token JWT para extrair dados do usuário
        const payload = JSON.parse(atob(token.split('.')[1]));
        
        // Se estiver impersonando, usar dados do cliente impersonado
        if (impersonating) {
          const clientId = localStorage.getItem('impersonated_client_id');
          const clientName = localStorage.getItem('impersonated_client_name');
          
          setUser({
            id: clientId || payload.id,
            email: clientName || payload.email
          });
          setIsAdmin(false);
          setIsImpersonating(true);
        } else {
          // Caso contrário, usar dados do token
          const userId = payload.id;
          const userEmail = payload.email;

          setUser({
            id: userId,
            email: userEmail
          });

          // Verificar se é admin no Supabase
          await checkAdminStatus(userId);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setUser(null);
        setIsAdmin(false);
        setIsImpersonating(false);
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
    isImpersonating,
    loading,
    signOut
  };
}
