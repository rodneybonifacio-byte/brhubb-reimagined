import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";
import { auth } from "@/lib/api";

export function ImpersonationBanner() {
  const navigate = useNavigate();
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [clientName, setClientName] = useState("");

  useEffect(() => {
    const impersonating = localStorage.getItem('is_impersonating') === 'true';
    const name = localStorage.getItem('impersonated_client_name') || '';
    
    setIsImpersonating(impersonating);
    setClientName(name);
  }, []);

  const handleStopImpersonation = () => {
    // Restaurar token e dados do admin
    const adminToken = localStorage.getItem('admin_impersonation_token');
    const adminUserData = localStorage.getItem('admin_impersonation_user');

    if (adminToken && adminUserData) {
      auth.setToken(adminToken);
      localStorage.setItem('user_data', adminUserData);
    }

    // Limpar dados de impersonation
    localStorage.removeItem('admin_impersonation_token');
    localStorage.removeItem('admin_impersonation_user');
    localStorage.removeItem('is_impersonating');
    localStorage.removeItem('impersonated_client_id');
    localStorage.removeItem('impersonated_client_name');

    toast.success("Voltou ao usuário administrador");
    
    // Redirecionar e recarregar
    navigate('/admin/gestao-clientes');
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (!isImpersonating) {
    return null;
  }

  return (
    <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <User className="h-4 w-4 text-orange-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-orange-900 dark:text-orange-100 font-medium">
          Você está visualizando o sistema como: <strong>{clientName}</strong>
        </span>
        <Button
          onClick={handleStopImpersonation}
          variant="outline"
          size="sm"
          className="ml-4 border-orange-500 hover:bg-orange-100"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Voltar ao Admin
        </Button>
      </AlertDescription>
    </Alert>
  );
}
