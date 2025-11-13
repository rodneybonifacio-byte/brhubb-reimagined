import { useEffect } from "react";
import { auth } from "@/lib/api";
import { toast } from "sonner";

/**
 * Hook para monitorar e renovar automaticamente o token de autenticação
 * quando ele estiver próximo de expirar (menos de 30 minutos)
 */
export function useTokenRefresh() {
  useEffect(() => {
    // Verificar a cada 5 minutos se o token precisa ser renovado
    const checkTokenInterval = setInterval(() => {
      if (auth.shouldRefreshToken()) {
        const minutesLeft = auth.getTokenExpirationMinutes();
        
        toast.info(
          `Sua sessão expira em ${minutesLeft} minutos. Por favor, salve seu trabalho.`,
          {
            duration: 10000,
            action: {
              label: "Entendi",
              onClick: () => {},
            },
          }
        );
      }
    }, 5 * 60 * 1000); // 5 minutos

    // Verificar imediatamente ao montar o componente
    if (auth.shouldRefreshToken()) {
      const minutesLeft = auth.getTokenExpirationMinutes();
      if (minutesLeft && minutesLeft < 30) {
        toast.warning(
          `Sua sessão expira em ${minutesLeft} minutos. Recomendamos fazer login novamente.`,
          {
            duration: 8000,
          }
        );
      }
    }

    return () => clearInterval(checkTokenInterval);
  }, []);
}
