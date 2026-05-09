import { useState, useMemo } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Lock, Eye, EyeOff, User, Droplets, Sprout, BarChart3, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

function strength(pwd: string) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { label: "Fraca", color: "hsl(var(--destructive))", w: "33%" };
  if (score === 2 || score === 3) return { label: "Média", color: "hsl(var(--warning))", w: "66%" };
  return { label: "Forte", color: "hsl(var(--primary))", w: "100%" };
}

export default function Cadastro() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [conf, setConf] = useState("");
  const [show, setShow] = useState(false);
  const [isAgr, setIsAgr] = useState(false);
  const [crea, setCrea] = useState("");
  const [aceito, setAceito] = useState(false);
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/onboarding" replace />;

  const s = useMemo(() => strength(senha), [senha]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aceito) return toast.error("Você precisa aceitar os Termos de Uso");
    if (senha.length < 6) return toast.error("A senha deve ter pelo menos 6 caracteres");
    if (senha !== conf) return toast.error("As senhas não coincidem");
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password: senha,
      options: {
        data: { nome, is_agronomo: isAgr, crea: isAgr ? crea : null },
        emailRedirectTo: `${window.location.origin}/onboarding`,
      },
    });
    setLoading(false);
    if (error) toast.error("Erro no cadastro: " + error.message);
    else { toast.success("Conta criada!"); nav("/onboarding"); }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <div className="absolute top-4 right-4 z-50"><ThemeToggle /></div>
      <aside className="md:w-2/5 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden"
        style={{ background: "var(--gradient-brand)" }}>
        <div aria-hidden className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/10" />
        <div aria-hidden className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-white/5" />
        <Link to="/landing" className="relative flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur p-2 rounded-xl">
            <Logo className="h-9 w-9 object-contain" />
          </div>
          <div>
            <div className="font-display font-bold text-xl">IrriX</div>
            <div className="text-xs opacity-80">Precision Irrigation</div>
          </div>
        </Link>
        <div className="relative">
          <h2 className="font-display font-bold text-3xl md:text-4xl leading-tight">
            Cada gota no<br />lugar certo.
          </h2>
          <ul className="space-y-3 mt-8">
            {[
              { Icon: Droplets, t: "Balanço hídrico em tempo real" },
              { Icon: Sprout, t: "Kc automático por cultura" },
              { Icon: BarChart3, t: "Relatórios com 1 clique" },
            ].map(({ Icon, t }) => (
              <li key={t} className="flex items-center gap-3 text-sm font-medium">
                <div className="bg-white/20 backdrop-blur p-2 rounded-lg"><Icon className="w-4 h-4" /></div>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm opacity-90">
          Já tem conta? <Link to="/login" className="font-semibold underline">Faça login</Link>
        </p>
      </aside>

      <main className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md neu p-8 md:p-10 rounded-2xl">
          <h1 className="font-display font-bold text-2xl">Crie sua conta grátis</h1>
          <p className="text-sm text-muted-foreground mt-1">14 dias grátis · Sem cartão · Cancele quando quiser</p>

          <form onSubmit={submit} className="space-y-4 mt-6">
            <Field icon={User} type="text" placeholder="Nome completo" value={nome} onChange={setNome} />
            <Field icon={Mail} type="email" placeholder="Email profissional" value={email} onChange={setEmail} />

            <div>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type={show ? "text" : "password"} placeholder="Senha" value={senha} required
                  onChange={(e) => setSenha(e.target.value)}
                  className="neu-input w-full pl-12 pr-12 py-3 text-sm" />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {senha && (
                <div className="mt-2">
                  <div className="h-1.5 w-full neu-inset rounded-full overflow-hidden">
                    <div className="h-full transition-all" style={{ width: s.w, background: s.color }} />
                  </div>
                  <div className="text-[11px] mt-1 font-semibold" style={{ color: s.color }}>
                    Força: {s.label}
                  </div>
                </div>
              )}
            </div>

            <Field icon={Lock} type={show ? "text" : "password"} placeholder="Confirmar senha" value={conf} onChange={setConf} />

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={isAgr} onChange={(e) => setIsAgr(e.target.checked)} className="accent-primary" />
              <BadgeCheck className="w-4 h-4 text-primary" />
              <span>Sou Engenheiro Agrônomo / Consultor Técnico</span>
            </label>

            {isAgr && (
              <Field icon={BadgeCheck} type="text" placeholder="CREA / CFT" value={crea} onChange={setCrea} />
            )}

            <label className="flex items-start gap-2 text-xs cursor-pointer">
              <input type="checkbox" checked={aceito} onChange={(e) => setAceito(e.target.checked)}
                className="accent-primary mt-0.5" required />
              <span className="text-muted-foreground">
                Li e aceito os <a href="#" className="text-primary hover:underline">Termos de Uso</a> e a{" "}
                <a href="#" className="text-primary hover:underline">Política de Privacidade</a>
              </span>
            </label>

            <button type="submit" disabled={loading}
              className="btn-shimmer w-full py-3.5 rounded-xl font-semibold text-white neu-button disabled:opacity-50"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 10px 24px rgba(16,185,129,0.35)" }}>
              {loading ? "Criando conta..." : "Criar conta grátis →"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-5">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }: any) {
  return (
    <div className="relative">
      <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input type={type} placeholder={placeholder} value={value} required
        onChange={(e) => onChange(e.target.value)}
        className="neu-input w-full pl-12 pr-4 py-3 text-sm" />
    </div>
  );
}
