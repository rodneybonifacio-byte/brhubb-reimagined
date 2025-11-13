import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AtualizarEmail() {
  const [atualizando, setAtualizando] = useState(false);
  const navigate = useNavigate();

  const atualizarEmailParaFinanceiro = async () => {
    try {
      setAtualizando(true);
      
      // Atualizar o email do usuário atual
      const { data, error } = await supabase.auth.updateUser({
        email: 'financeiro@brhubb.com.br'
      });

      if (error) throw error;

      toast.success('Email atualizado com sucesso! Você receberá um email de confirmação.');
      toast.info('Faça logout e login novamente com o novo email.');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao atualizar email:', error);
      toast.error('Erro ao atualizar email: ' + error.message);
    } finally {
      setAtualizando(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Atualizar Email para financeiro@brhubb.com.br
          </CardTitle>
          <CardDescription>
            Clique no botão abaixo para atualizar seu email de login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Importante:</strong> Após atualizar o email, você receberá um email de confirmação no novo endereço.
              Será necessário fazer logout e login novamente com o novo email.
            </p>
          </div>

          <Button 
            onClick={atualizarEmailParaFinanceiro}
            disabled={atualizando}
            className="w-full"
            size="lg"
          >
            {atualizando ? 'Atualizando...' : 'Atualizar para financeiro@brhubb.com.br'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
