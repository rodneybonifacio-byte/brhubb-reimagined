import { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { auth } from "@/lib/api";
import { NavLink } from "@/components/NavLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import {
  Home,
  Users,
  Package,
  Truck,
  DollarSign,
  Settings,
  Wrench,
  Menu,
  Bell,
  User,
  LogOut,
  X,
  Search,
  CreditCard,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
}

const menuItems: MenuItem[] = [
  { title: "Home", url: "/", icon: Home },
  { title: "Etiquetas", url: "/envios/pre-postagem", icon: Package },
  { title: "Rastreio", url: "/rastreio", icon: Search },
  { title: "Acompanhamento", url: "/acompanhamento/envios", icon: Truck },
  { title: "Financeiro", url: "/financeiro/faturas", icon: DollarSign },
  { title: "Clientes", url: "/cadastros/clientes", icon: Users },
  { title: "Ferramentas", url: "/ferramentas", icon: Wrench },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

const adminMenuItems: MenuItem[] = [
  { title: "Gerenciar Créditos", url: "/admin/creditos", icon: CreditCard },
  { title: "Ajustes de Custos", url: "/admin/ajustes-custo", icon: Receipt },
  { title: "Gestão de Clientes", url: "/admin/gestao-clientes", icon: Users },
  { title: "Configurações do Sistema", url: "/admin/configuracoes-gerais", icon: Settings },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  // Monitorar expiração do token e avisar o usuário
  useTokenRefresh();

  const handleLogout = () => {
    auth.removeToken();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Estilo SuperFrete */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full w-[200px] flex-col border-r border-border bg-card transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <h1 className="text-xl font-bold text-primary">BRHUB</h1>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.title}</span>
              </NavLink>
            );
          })}
          
          {/* Menu Admin */}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-border pt-2">
                <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                  Administração
                </p>
              </div>
              {adminMenuItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.title}</span>
                  </NavLink>
                );
              })}
            </>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-border p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-accent">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  FB
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-medium">Financeiro</p>
                  <p className="truncate text-xs text-muted-foreground">Admin</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-[200px]">
        {/* Header - Mobile */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card px-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <h1 className="flex-1 text-lg font-bold text-primary lg:hidden">BRHUB</h1>

          <ThemeToggle />

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100vh-3.5rem)] bg-muted/30 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
