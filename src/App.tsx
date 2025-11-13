import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppLayout } from "./components/AppLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PrePostagem from "./pages/PrePostagem";
import NovaPrePostagem from "./pages/NovaPrePostagem";
import VisualizarEtiqueta from "./pages/VisualizarEtiqueta";
import SimuladorFrete from "./pages/SimuladorFrete";
import RastreioEncomenda from "./pages/RastreioEncomenda";
import AcompanhamentoEnvios from "./pages/AcompanhamentoEnvios";
import Coletas from "./pages/Coletas";
import Faturas from "./pages/Faturas";
import Clientes from "./pages/Clientes";
import AdminCredits from "./pages/AdminCredits";
import AdminCostAdjustments from "./pages/AdminCostAdjustments";
import AdminConfiguracoes from "./pages/AdminConfiguracoes";
import AdminConfiguracoesGerais from "./pages/AdminConfiguracoesGerais";
import AtualizarEmail from "./pages/AtualizarEmail";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="/" element={<Dashboard />} />
              <Route path="/envios/pre-postagem" element={<PrePostagem />} />
              <Route path="/envios/nova" element={<NovaPrePostagem />} />
              <Route path="/envios/visualizar" element={<VisualizarEtiqueta />} />
              <Route path="/simulador-frete" element={<SimuladorFrete />} />
              <Route path="/rastreio" element={<RastreioEncomenda />} />
              <Route path="/acompanhamento/envios" element={<AcompanhamentoEnvios />} />
              <Route path="/acompanhamento/coletas" element={<Coletas />} />
              <Route path="/financeiro/faturas" element={<Faturas />} />
              <Route path="/cadastros/clientes" element={<Clientes />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/admin/creditos" element={<AdminCredits />} />
              <Route path="/admin/ajustes-custo" element={<AdminCostAdjustments />} />
              <Route path="/admin/configuracoes" element={<AdminConfiguracoes />} />
              <Route path="/admin/configuracoes-gerais" element={<AdminConfiguracoesGerais />} />
              <Route path="/atualizar-email" element={<AtualizarEmail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
