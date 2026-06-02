import { Outlet, Navigate } from "react-router-dom";
import { Sidebar, SidebarProvider } from "./Sidebar";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";
import { SelecaoProvider } from "@/contexts/SelecaoContext";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useAcessoPlano } from "@/hooks/useAcessoPlano";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const acesso = useAcessoPlano();
  if (loading || acesso.loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  if (acesso.expirado) return <Navigate to="/assinar" replace />;

  return (
    <SelecaoProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0">
            <OfflineIndicator />
            <Header />
            <main className="flex-1 p-4 md:p-6 animate-fade-in">
              <Outlet />
            </main>
          </div>
        </div>
      </SidebarProvider>
    </SelecaoProvider>
  );
}

