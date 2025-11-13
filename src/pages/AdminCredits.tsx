import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Minus, DollarSign, Users, History, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const creditSchema = z.object({
  amount: z.number()
    .positive("Valor deve ser maior que zero")
    .max(1000000, "Valor deve ser no máximo 1.000.000")
});

interface ClientCredit {
  id: string;
  client_id: string;
  client_name: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

interface CreditTransaction {
  id: string;
  client_id: string;
  transaction_type: string;
  amount: number;
  previous_balance: number;
  new_balance: number;
  description: string | null;
  emission_id: string | null;
  created_at: string;
}

export default function AdminCredits() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState<ClientCredit[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientCredit | null>(null);
  
  // Form states
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDescription, setCreditDescription] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Acesso negado. Apenas administradores podem acessar esta página.");
      navigate("/");
      return;
    }
    
    if (isAdmin) {
      loadClients();
      loadTransactions();
    }
  }, [isAdmin, authLoading, navigate]);

  const loadClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_credits')
        .select('*')
        .order('client_name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar clientes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Erro ao carregar transações:", error);
    }
  };

  const handleAddCredits = async () => {
    if (!selectedClient) return;

    // Validação com Zod
    const validation = creditSchema.safeParse({
      amount: parseFloat(creditAmount)
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast.error(errors);
      return;
    }

    const amount = parseFloat(creditAmount);

    try {
      setProcessing(true);
      
      const newBalance = parseFloat(selectedClient.credits.toString()) + amount;
      
      // Atualizar créditos do cliente
      const { error: updateError } = await supabase
        .from('client_credits')
        .update({ credits: newBalance })
        .eq('id', selectedClient.id);
      
      if (updateError) throw updateError;
      
      // Registrar transação
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          client_id: selectedClient.client_id,
          transaction_type: 'ADD',
          amount: amount,
          previous_balance: selectedClient.credits,
          new_balance: newBalance,
          description: creditDescription || 'Créditos adicionados pelo admin',
          performed_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (transactionError) throw transactionError;
      
      toast.success(`R$ ${amount.toFixed(2)} adicionados com sucesso!`);
      setShowAddModal(false);
      setCreditAmount("");
      setCreditDescription("");
      loadClients();
      loadTransactions();
    } catch (error: any) {
      toast.error("Erro ao adicionar créditos: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleRemoveCredits = async () => {
    if (!selectedClient) return;

    // Validação com Zod
    const validation = creditSchema.safeParse({
      amount: parseFloat(creditAmount)
    });

    if (!validation.success) {
      const errors = validation.error.errors.map(err => err.message).join(", ");
      toast.error(errors);
      return;
    }

    const amount = parseFloat(creditAmount);

    if (amount > parseFloat(selectedClient.credits.toString())) {
      toast.error("Valor maior que o saldo disponível");
      return;
    }

    try {
      setProcessing(true);
      
      const newBalance = parseFloat(selectedClient.credits.toString()) - amount;
      
      // Atualizar créditos do cliente
      const { error: updateError } = await supabase
        .from('client_credits')
        .update({ credits: newBalance })
        .eq('id', selectedClient.id);
      
      if (updateError) throw updateError;
      
      // Registrar transação
      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          client_id: selectedClient.client_id,
          transaction_type: 'REMOVE',
          amount: amount,
          previous_balance: selectedClient.credits,
          new_balance: newBalance,
          description: creditDescription || 'Créditos removidos pelo admin',
          performed_by: (await supabase.auth.getUser()).data.user?.id
        });
      
      if (transactionError) throw transactionError;
      
      toast.success(`R$ ${amount.toFixed(2)} removidos com sucesso!`);
      setShowRemoveModal(false);
      setCreditAmount("");
      setCreditDescription("");
      loadClients();
      loadTransactions();
    } catch (error: any) {
      toast.error("Erro ao remover créditos: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionBadge = (type: string) => {
    const badges = {
      ADD: <Badge className="bg-green-500">Adicionado</Badge>,
      REMOVE: <Badge variant="destructive">Removido</Badge>,
      CONSUME: <Badge variant="secondary">Consumido</Badge>,
      REFUND: <Badge className="bg-blue-500">Reembolso</Badge>,
    };
    return badges[type as keyof typeof badges] || <Badge>{type}</Badge>;
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Créditos</h1>
          <p className="text-muted-foreground">Controle os créditos de todos os clientes</p>
        </div>
        <Button onClick={loadClients} variant="outline" size="icon">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="clients" className="space-y-4">
        <TabsList>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clients" className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clients.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum cliente encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <Card key={client.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{client.client_name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">
                      ID: {client.client_id}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-primary/10 p-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">Saldo</span>
                      </div>
                      <span className="text-2xl font-bold text-primary">
                        R$ {parseFloat(client.credits.toString()).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Dialog open={showAddModal && selectedClient?.id === client.id} onOpenChange={(open) => {
                        setShowAddModal(open);
                        if (open) setSelectedClient(client);
                      }}>
                        <DialogTrigger asChild>
                          <Button className="flex-1" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Adicionar Créditos</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Cliente</Label>
                              <p className="text-sm font-medium">{selectedClient?.client_name}</p>
                            </div>
                            <div>
                              <Label htmlFor="amount">Valor (R$)</Label>
                              <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="description">Descrição</Label>
                              <Textarea
                                id="description"
                                placeholder="Motivo da adição de créditos..."
                                value={creditDescription}
                                onChange={(e) => setCreditDescription(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleAddCredits} disabled={processing}>
                              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Adicionar
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showRemoveModal && selectedClient?.id === client.id} onOpenChange={(open) => {
                        setShowRemoveModal(open);
                        if (open) setSelectedClient(client);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="flex-1" size="sm">
                            <Minus className="mr-2 h-4 w-4" />
                            Remover
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Remover Créditos</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>Cliente</Label>
                              <p className="text-sm font-medium">{selectedClient?.client_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Saldo atual: R$ {parseFloat(selectedClient?.credits.toString() || "0").toFixed(2)}
                              </p>
                            </div>
                            <div>
                              <Label htmlFor="amount-remove">Valor (R$)</Label>
                              <Input
                                id="amount-remove"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={creditAmount}
                                onChange={(e) => setCreditAmount(e.target.value)}
                              />
                            </div>
                            <div>
                              <Label htmlFor="description-remove">Descrição</Label>
                              <Textarea
                                id="description-remove"
                                placeholder="Motivo da remoção de créditos..."
                                value={creditDescription}
                                onChange={(e) => setCreditDescription(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setShowRemoveModal(false)}>
                              Cancelar
                            </Button>
                            <Button variant="destructive" onClick={handleRemoveCredits} disabled={processing}>
                              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                              Remover
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Últimas Transações</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação registrada
                </p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getTransactionBadge(transaction.transaction_type)}
                          <span className="text-sm font-mono text-muted-foreground">
                            {transaction.client_id}
                          </span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground">{transaction.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(transaction.created_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {transaction.transaction_type === 'ADD' || transaction.transaction_type === 'REFUND' ? '+' : '-'}
                          R$ {parseFloat(transaction.amount.toString()).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Saldo: R$ {parseFloat(transaction.new_balance.toString()).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
