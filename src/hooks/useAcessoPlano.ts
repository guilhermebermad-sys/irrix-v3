import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Plano = "trial" | "ativo" | "vitalicio" | "expirado";

export interface AcessoPlano {
  plano: Plano;
  diasRestantes: number | null;
  expirado: boolean;
  vitalicio: boolean;
  loading: boolean;
}

export function useAcessoPlano(): AcessoPlano {
  const { user } = useAuth();
  const [state, setState] = useState<AcessoPlano>({
    plano: "trial",
    diasRestantes: null,
    expirado: false,
    vitalicio: false,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    let cancel = false;
    (async () => {
      const { data } = await supabase
        .from("usuarios_perfil")
        .select("plano, acesso_expira_em")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancel) return;

      const plano = (data?.plano as Plano) ?? "trial";
      const vitalicio = plano === "vitalicio";
      const ativo = plano === "ativo";

      let diasRestantes: number | null = null;
      let expirado = false;

      if (!vitalicio && !ativo) {
        if (data?.acesso_expira_em) {
          const ms = new Date(data.acesso_expira_em).getTime() - Date.now();
          diasRestantes = Math.max(0, Math.ceil(ms / 86400000));
          expirado = ms <= 0;
        } else {
          expirado = true;
        }
      }

      setState({ plano, diasRestantes, expirado, vitalicio, loading: false });
    })();
    return () => {
      cancel = true;
    };
  }, [user]);

  return state;
}
