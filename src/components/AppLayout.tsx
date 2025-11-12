import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  Home,
  Users,
  Package,
  FileText,
  Truck,
  Settings,
  Wrench,
  DollarSign,
  Menu,
  Search,
  Moon,
  Sun,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  submenu?: { title: string; url: string }[];
}

const menuItems: MenuItem[] = [
  { title: "Home", url: "/", icon: Home },
  {
    title: "Cadastros",
    url: "/cadastros",
    icon: Users,
    submenu: [{ title: "Clientes", url: "/cadastros/clientes" }],
  },
  {
    title: "Envios",
    url: "/envios",
    icon: Package,
    submenu: [
      { title: "Pré-Postagem", url: "/envios/pre-postagem" },
      { title: "Nova Pré-Postagem", url: "/envios/nova" },
      { title: "Integrações", url: "/envios/integracoes" },
    ],
  },
  {
    title: "Acompanhamento",
    url: "/acompanhamento",
    icon: Truck,
    submenu: [
      { title: "Envios", url: "/acompanhamento/envios" },
      { title: "Coletas", url: "/acompanhamento/coletas" },
    ],
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: DollarSign,
    submenu: [
      { title: "Faturas a Receber", url: "/financeiro/faturas" },
      { title: "Contas a Pagar", url: "/financeiro/contas-pagar" },
    ],
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    submenu: [{ title: "Transportadoras", url: "/configuracoes/transportadoras" }],
  },
  {
    title: "Ferramentas",
    url: "/ferramentas",
    icon: Wrench,
    submenu: [
      { title: "Imprimir Etiquetas", url: "/ferramentas/etiquetas" },
      { title: "Manifestos", url: "/ferramentas/manifestos" },
      { title: "Rastrear Pacote", url: "/ferramentas/rastrear" },
      { title: "Simulador de Frete", url: "/ferramentas/simulador" },
    ],
  },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const location = useLocation();

  const toggleMenu = (title: string) => {
    setExpandedMenus((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-full w-64 border-r border-border bg-sidebar transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <h1 className="text-2xl font-bold text-primary">BRHUB</h1>
        </div>

        <nav className="space-y-1 p-4">
          {menuItems.map((item) => (
            <div key={item.title}>
              {item.submenu ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    {expandedMenus.includes(item.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {expandedMenus.includes(item.title) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.submenu.map((subItem) => (
                        <NavLink
                          key={subItem.url}
                          to={subItem.url}
                          className="block rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        >
                          {subItem.title}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.url}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-border bg-sidebar p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              FB
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">FINANCEIRO BRHUB</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex flex-1 items-center gap-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar manifestos, entregas..."
                className="pl-10"
              />
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  FB
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuItem>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6">
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
