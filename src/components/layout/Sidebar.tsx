import { NavLink, useNavigate } from "react-router-dom";
import { Home, Sprout, Droplets, Calendar, Bell, Settings, LogOut, Menu, X, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";

const items = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/fazendas", label: "Minhas Fazendas", icon: Sprout },
  { to: "/manejo", label: "Manejo Diário", icon: Droplets },
  { to: "/historico", label: "Histórico", icon: Calendar },
  { to: "/caderno", label: "Caderno de Campo", icon: BookOpen },
  { to: "/alertas", label: "Alertas", icon: Bell },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
];

interface SidebarCtxValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  desktopCollapsed: boolean;
  setDesktopCollapsed: (v: boolean) => void;
}

const SidebarCtx = createContext<SidebarCtxValue>({
  open: false, setOpen: () => {},
  desktopCollapsed: false, setDesktopCollapsed: () => {},
});

const COLLAPSED_KEY = "irrix:sidebar-collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [desktopCollapsed, setCollapsedRaw] = useState<boolean>(() => {
    try { return localStorage.getItem(COLLAPSED_KEY) === "1"; } catch { return false; }
  });
  const setDesktopCollapsed = (v: boolean) => {
    setCollapsedRaw(v);
    try { localStorage.setItem(COLLAPSED_KEY, v ? "1" : "0"); } catch {}
  };
  useEffect(() => {
    // notify listeners (header) of state changes via storage event isn't needed — context covers it
  }, [desktopCollapsed]);
  return (
    <SidebarCtx.Provider value={{ open, setOpen, desktopCollapsed, setDesktopCollapsed }}>
      {children}
    </SidebarCtx.Provider>
  );
}

export const useSidebarMobile = () => useContext(SidebarCtx);
export const useSidebarState = () => useContext(SidebarCtx);

export function SidebarToggle() {
  const { setOpen, desktopCollapsed, setDesktopCollapsed } = useSidebarMobile();
  return (
    <>
      {/* Mobile: abre drawer */}
      <button onClick={() => setOpen(true)}
        aria-label="Abrir menu"
        className="neu-button w-10 h-10 rounded-xl flex items-center justify-center md:hidden">
        <Menu className="w-5 h-5 text-foreground" />
      </button>
      {/* Desktop: alterna colapso */}
      <button onClick={() => setDesktopCollapsed(!desktopCollapsed)}
        aria-label={desktopCollapsed ? "Expandir menu" : "Recolher menu"}
        className="neu-button w-10 h-10 rounded-xl items-center justify-center hidden md:inline-flex">
        {desktopCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
      </button>
    </>
  );
}

export function Sidebar() {
  const { signOut } = useAuth();
  const nav = useNavigate();
  const { open, setOpen, desktopCollapsed } = useSidebarMobile();

  const renderItems = (collapsed: boolean) => (
    <nav className="flex flex-col gap-2">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === "/"} onClick={() => setOpen(false)}
          title={collapsed ? label : undefined}
          className={({ isActive }) => cn(
            "flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
            collapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
            isActive ? "neu-pressed text-primary" : "neu-button text-foreground hover:text-primary"
          )}>
          <Icon className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{label}</span>}
        </NavLink>
      ))}
    </nav>
  );

  const headerBlock = (collapsed: boolean) => (
    <div className={cn("neu mb-2 flex items-center gap-3", collapsed ? "p-2 justify-center" : "p-4")}>
      {!collapsed && <Logo className="h-12 w-12 object-contain" />}
      {!collapsed && (
        <div className="flex-1">
          <div className="font-display font-bold text-lg leading-none text-gradient-brand">IrriX</div>
          <div className="text-[10px] text-muted-foreground tracking-wider">PRECISION IRRIGATION</div>
        </div>
      )}
      {collapsed && <Logo className="h-9 w-9 object-contain" />}
      <button onClick={() => setOpen(false)} className="md:hidden neu-button p-1.5 rounded-lg ml-auto">
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className={cn(
        "shrink-0 p-4 hidden md:flex flex-col gap-2 transition-all duration-300",
        desktopCollapsed ? "w-20" : "w-64"
      )}>
        {headerBlock(desktopCollapsed)}
        {renderItems(desktopCollapsed)}
        <button
          onClick={async () => { await signOut(); nav("/auth"); }}
          title={desktopCollapsed ? "Sair" : undefined}
          className={cn(
            "mt-auto flex items-center gap-3 rounded-xl text-sm font-medium neu-button text-destructive",
            desktopCollapsed ? "px-0 py-3 justify-center" : "px-4 py-3",
          )}>
          <LogOut className="w-5 h-5" /> {!desktopCollapsed && "Sair"}
        </button>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-[2000] md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="relative w-72 max-w-[85%] h-full p-4 flex flex-col gap-2 bg-background shadow-2xl animate-slide-in-right">
            {headerBlock(false)}
            {renderItems(false)}
            <button
              onClick={async () => { await signOut(); nav("/auth"); }}
              className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium neu-button text-destructive">
              <LogOut className="w-5 h-5" /> Sair
            </button>
          </aside>
        </div>
      )}
    </>
  );
}
