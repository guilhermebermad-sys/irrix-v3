import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Onboarding() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-lg neu p-10 rounded-3xl text-center">
        <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--gradient-brand)" }}>
          <CheckCircle2 className="w-10 h-10 text-white" />
        </div>
        <Logo className="h-12 w-12 mx-auto mb-3 object-contain" />
        <h1 className="font-display font-bold text-3xl">Conta criada!</h1>
        <p className="text-muted-foreground mt-3">
          Bem-vindo ao IrriX. Vamos cadastrar sua primeira fazenda para começar
          a calcular o balanço hídrico do seu talhão.
        </p>
        <Link to="/fazendas"
          className="btn-shimmer neu-button mt-8 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white"
          style={{ background: "var(--gradient-brand)", boxShadow: "0 10px 24px rgba(16,185,129,0.35)" }}>
          Cadastrar minha fazenda <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="mt-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">Ir para o dashboard</Link>
        </div>
      </div>
    </div>
  );
}
