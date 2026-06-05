import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAcessoPlano } from "@/hooks/useAcessoPlano";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Check, LogOut, Mail } from "lucide-react";

export default function Assinar() {
  const { user, signOut, loading } = useAuth();
  const acesso = useAcessoPlano();

  if (loading || acesso.loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando...</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!acesso.expirado) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-background">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <div className="w-full max-w-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="neu p-4 rounded-2xl mb-4">
            <Logo className="h-16 w-16 object-contain" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gradient-brand">IrriX</h1>
        </div>

        <div className="neu p-8 rounded-2xl">
          <h2 className="font-display font-bold text-2xl text-center">Seu teste grátis terminou</h2>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Assine o IrriX para continuar gerenciando suas fazendas com precisão.
          </p>

          <ul className="space-y-3 mt-6">
            {[
              "Balanço hídrico em tempo real",
              "Kc automático por cultura",
              "Caderno de campo e histórico completos",
              "Relatórios profissionais com 1 clique",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm">
                <div className="neu-button w-7 h-7 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                {t}
              </li>
            ))}
          </ul>

          <div className="mt-7 space-y-3">
            <Link
              to="/landing#planos"
              className="block w-full text-center py-3.5 rounded-xl font-semibold text-white neu-button btn-shimmer"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 10px 24px rgba(16,185,129,0.35)" }}>
              Ver planos e assinar
            </Link>
            <p className="text-xs text-center text-muted-foreground">
              Escolha o plano ideal e finalize o pagamento com segurança via Stripe.
            </p>
          </div>


          <div className="mt-7 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <a href="mailto:irrixapp@gmail.com" className="flex items-center gap-2 text-primary hover:underline">
              <Mail className="w-4 h-4" /> irrixapp@gmail.com
            </a>
            <button
              onClick={() => signOut()}
              className="neu-button px-4 py-2 rounded-xl flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Logado como {user.email} · <Link to="/landing" className="text-primary hover:underline">voltar ao site</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
