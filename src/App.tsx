import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InstallButton } from "@/components/InstallButton";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Onboarding from "./pages/Onboarding";
import Landing from "./pages/Landing";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Fazendas from "./pages/Fazendas";
import ManejoDiario from "./pages/ManejoDiario";
import Historico from "./pages/Historico";
import Alertas from "./pages/Alertas";
import CadernoCampo from "./pages/CadernoCampo";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="top-right" richColors />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fazendas" element={<Fazendas />} />
              <Route path="/manejo" element={<ManejoDiario />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/alertas" element={<Alertas />} />
              <Route path="/caderno" element={<CadernoCampo />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <InstallButton />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
