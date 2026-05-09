import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Mail, Lock, User as UserIcon } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

type Mode = "login" | "signup" | "forgot";

export default function Auth() {
  const { user, signIn, signUp, resetPassword } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      const { error } = await signIn(email, senha);
      if (error) toast.error("Erro ao entrar: " + error.message);
      else { toast.success("Bem-vindo!"); nav("/"); }
    } else if (mode === "signup") {
      if (senha.length < 6) { toast.error("A senha deve ter pelo menos 6 caracteres"); setLoading(false); return; }
      const { error } = await signUp(email, senha, nome);
      if (error) toast.error("Erro no cadastro: " + error.message);
      else { toast.success("Conta criada! Você já pode entrar."); setMode("login"); }
    } else {
      const { error } = await resetPassword(email);
      if (error) toast.error("Erro: " + error.message);
      else { toast.success("Email de recuperação enviado!"); setMode("login"); }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="neu p-4 rounded-2xl mb-4">
            <Logo className="h-20 w-20 object-contain" />
          </div>
          <h1 className="font-display font-bold text-3xl text-gradient-brand">IrriX</h1>
          <p className="text-sm text-muted-foreground mt-1">Precision Irrigation</p>
        </div>

        <div className="neu p-6 md:p-8">
          <h2 className="font-display font-semibold text-xl mb-5 text-center">
            {mode === "login" ? "Entrar" : mode === "signup" ? "Criar conta" : "Recuperar senha"}
          </h2>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <Field icon={UserIcon} type="text" placeholder="Seu nome" value={nome} onChange={setNome} required />
            )}
            <Field icon={Mail} type="email" placeholder="seu@email.com" value={email} onChange={setEmail} required />
            {mode !== "forgot" && (
              <Field icon={Lock} type="password" placeholder="Senha" value={senha} onChange={setSenha} required />
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white neu-button disabled:opacity-50"
              style={{ background: "var(--gradient-brand)" }}>
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : mode === "signup" ? "Cadastrar" : "Enviar link"}
            </button>
          </form>

          <div className="mt-5 flex flex-col items-center gap-2 text-sm">
            {mode === "login" && (
              <>
                <button onClick={() => setMode("signup")} className="text-primary hover:underline">Criar nova conta</button>
                <button onClick={() => setMode("forgot")} className="text-muted-foreground hover:underline">Esqueci minha senha</button>
              </>
            )}
            {mode !== "login" && (
              <button onClick={() => setMode("login")} className="text-primary hover:underline">Voltar para login</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange, required }: any) {
  return (
    <div className="relative">
      <Icon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input
        type={type} placeholder={placeholder} value={value} required={required}
        onChange={(e) => onChange(e.target.value)}
        className="neu-input w-full pl-12 pr-4 py-3 text-sm" />
    </div>
  );
}
