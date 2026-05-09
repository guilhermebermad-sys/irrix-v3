import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Lock, Waves } from "lucide-react";

export default function ResetPassword() {
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (senha.length < 6) { toast.error("Senha muito curta"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) toast.error(error.message);
    else { toast.success("Senha atualizada!"); nav("/"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center neu" style={{ background: "var(--gradient-brand)" }}>
            <Waves className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="neu p-8">
          <h1 className="font-display font-semibold text-xl mb-5 text-center">Definir nova senha</h1>
          <form onSubmit={submit} className="space-y-4">
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="password" placeholder="Nova senha" value={senha} onChange={(e) => setSenha(e.target.value)}
                className="neu-input w-full pl-12 pr-4 py-3 text-sm" required />
            </div>
            <button disabled={loading} className="w-full py-3 rounded-xl text-white font-semibold neu-button"
              style={{ background: "var(--gradient-brand)" }}>
              {loading ? "Salvando..." : "Atualizar senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
