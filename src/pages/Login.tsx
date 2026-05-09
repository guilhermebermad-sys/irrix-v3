import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Mail, Lock, Eye, EyeOff, Droplets, Sprout, BarChart3, X } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const { user, signIn, resetPassword } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, senha);
    if (error) toast.error("Erro ao entrar: " + error.message);
    else { toast.success("Bem-vindo de volta!"); nav("/"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <div className="absolute top-4 right-4 z-50"><ThemeToggle /></div>
      {/* Painel esquerdo */}
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
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="font-semibold underline">Cadastre-se grátis</Link>
        </p>
      </aside>

      {/* Painel direito */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <div className="w-full max-w-md neu p-8 md:p-10 rounded-2xl">
          <h1 className="font-display font-bold text-2xl">Acesse sua conta</h1>
          <p className="text-sm text-muted-foreground mt-1">Bem-vindo de volta ao IrriX</p>

          <form onSubmit={submit} className="space-y-4 mt-7">
            <Field icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={setEmail} />
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type={show ? "text" : "password"} placeholder="Sua senha" value={senha} required
                onChange={(e) => setSenha(e.target.value)}
                className="neu-input w-full pl-12 pr-12 py-3 text-sm" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                  className="accent-primary" />
                <span>Lembrar de mim</span>
              </label>
              <button type="button" onClick={() => setForgotOpen(true)} className="text-primary hover:underline">
                Esqueci minha senha
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="btn-shimmer w-full py-3.5 rounded-xl font-semibold text-white neu-button disabled:opacity-50"
              style={{ background: "var(--gradient-brand)", boxShadow: "0 10px 24px rgba(16,185,129,0.35)" }}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary font-semibold hover:underline">Criar conta grátis →</Link>
          </p>
        </div>
      </main>

      {forgotOpen && <ForgotModal onClose={() => setForgotOpen(false)} resetPassword={resetPassword} />}
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

function ForgotModal({ onClose, resetPassword }: { onClose: () => void; resetPassword: (e: string) => Promise<{ error: Error | null }> }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) toast.error(error.message);
    else setSent(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="neu p-7 rounded-2xl w-full max-w-md bg-background relative">
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg neu-button">
          <X className="w-4 h-4" />
        </button>
        <h3 className="font-display font-bold text-xl">Recuperar senha</h3>
        {sent ? (
          <p className="text-sm text-muted-foreground mt-3">
            Enviamos um link de recuperação para <strong>{email}</strong>. Verifique sua caixa de entrada.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Informe seu email e enviaremos um link para redefinir a senha.
            </p>
            <Field icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={setEmail} />
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white neu-button disabled:opacity-50"
              style={{ background: "var(--gradient-brand)" }}>
              {loading ? "Enviando..." : "Enviar link de recuperação"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
