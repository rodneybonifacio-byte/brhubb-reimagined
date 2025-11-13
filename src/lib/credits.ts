import { supabase } from "@/integrations/supabase/client";
import { auth as apiAuth } from "@/lib/api";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  clienteId: string;
  name: string;
}

export async function getClientCredits(): Promise<number | null> {
  try {
    const token = apiAuth.getToken();
    if (!token) return null;

    const decoded = jwtDecode<DecodedToken>(token);
    const clienteId = decoded.clienteId;

    const { data, error } = await supabase
      .from('client_credits')
      .select('credits')
      .eq('client_id', clienteId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching credits:', error);
      return null;
    }

    return data ? parseFloat(data.credits.toString()) : null;
  } catch (error) {
    console.error('Error getting client credits:', error);
    return null;
  }
}

export async function ensureClientCreditsExist() {
  try {
    const token = apiAuth.getToken();
    if (!token) return;

    const decoded = jwtDecode<DecodedToken>(token);
    const clienteId = decoded.clienteId;
    const clientName = decoded.name;

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('client_credits')
      .select('id')
      .eq('client_id', clienteId)
      .maybeSingle();

    if (!existing) {
      // Criar registro inicial
      await supabase
        .from('client_credits')
        .insert({
          client_id: clienteId,
          client_name: clientName,
          credits: 0.00
        });
    }
  } catch (error) {
    console.error('Error ensuring client credits exist:', error);
  }
}

export async function consumeCredit(
  emissionId: string,
  amount: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const token = apiAuth.getToken();
    if (!token) {
      return { success: false, message: "Token não encontrado" };
    }

    const decoded = jwtDecode<DecodedToken>(token);
    const clienteId = decoded.clienteId;

    // Buscar créditos atuais
    const { data: creditData, error: fetchError } = await supabase
      .from('client_credits')
      .select('id, credits')
      .eq('client_id', clienteId)
      .single();

    if (fetchError || !creditData) {
      return { success: false, message: "Cliente não encontrado" };
    }

    const currentCredits = parseFloat(creditData.credits.toString());

    // Verificar se tem crédito suficiente
    if (currentCredits < amount) {
      return {
        success: false,
        message: `Crédito insuficiente. Saldo: R$ ${currentCredits.toFixed(2)} | Necessário: R$ ${amount.toFixed(2)}`
      };
    }

    const newBalance = currentCredits - amount;

    // Atualizar créditos
    const { error: updateError } = await supabase
      .from('client_credits')
      .update({ credits: newBalance })
      .eq('id', creditData.id);

    if (updateError) {
      return { success: false, message: "Erro ao atualizar créditos" };
    }

    // Registrar transação
    const { error: transactionError } = await supabase
      .from('credit_transactions')
      .insert({
        client_id: clienteId,
        transaction_type: 'CONSUME',
        amount: amount,
        previous_balance: currentCredits,
        new_balance: newBalance,
        description: `Crédito consumido pela emissão ${emissionId}`,
        emission_id: emissionId
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      // Não falha se não conseguir registrar a transação
    }

    return { success: true };
  } catch (error) {
    console.error('Error consuming credit:', error);
    return { success: false, message: "Erro ao consumir crédito" };
  }
}
