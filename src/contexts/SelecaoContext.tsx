import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface Fazenda {
  id: string; nome: string; municipio: string | null; estado: string | null;
  area_total: number | null; tipo_solo: string | null; cad: number | null;
  fonte_agua: string | null; observacoes: string | null;
  latitude: number | null; longitude: number | null;
}
export interface Talhao {
  id: string; fazenda_id: string; nome: string; area: number | null;
  cultura: string | null; estadio_fenologico: string | null; kc_atual: number | null;
  data_plantio: string | null; data_colheita: string | null; tipo_sistema: string | null;
  espac_emissores: number | null; espac_linhas: number | null; vazao: number | null;
  pressao: number | null; eficiencia: number | null; arm_inicial: number | null;
  coordenadas_poligono?: any; area_calculada_ha?: number | null;
  centroide_lat?: number | null; centroide_lon?: number | null;
}

interface Ctx {
  fazendas: Fazenda[]; talhoes: Talhao[];
  fazendaAtiva: Fazenda | null; talhaoAtivo: Talhao | null;
  setFazendaAtivaId: (id: string | null) => void;
  setTalhaoAtivoId: (id: string | null) => void;
  refresh: () => Promise<void>;
  loading: boolean;
}

const C = createContext<Ctx | undefined>(undefined);

export function SelecaoProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [fazendas, setFazendas] = useState<Fazenda[]>([]);
  const [talhoes, setTalhoes] = useState<Talhao[]>([]);
  const [fazendaId, setFazendaId] = useState<string | null>(null);
  const [talhaoId, setTalhaoId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user) { setFazendas([]); setTalhoes([]); return; }
    setLoading(true);
    const [{ data: fz }, { data: tl }] = await Promise.all([
      supabase.from("fazendas").select("*").order("nome"),
      supabase.from("talhoes").select("*").order("nome"),
    ]);
    setFazendas((fz as Fazenda[]) || []);
    setTalhoes((tl as Talhao[]) || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [user?.id]);

  useEffect(() => {
    if (!fazendaId && fazendas.length) setFazendaId(fazendas[0].id);
    if (fazendaId && !fazendas.find(f => f.id === fazendaId)) setFazendaId(fazendas[0]?.id ?? null);
  }, [fazendas, fazendaId]);

  useEffect(() => {
    const ts = talhoes.filter(t => t.fazenda_id === fazendaId);
    if (!talhaoId && ts.length) setTalhaoId(ts[0].id);
    if (talhaoId && !ts.find(t => t.id === talhaoId)) setTalhaoId(ts[0]?.id ?? null);
  }, [talhoes, fazendaId, talhaoId]);

  const fazendaAtiva = fazendas.find(f => f.id === fazendaId) ?? null;
  const talhaoAtivo = talhoes.find(t => t.id === talhaoId) ?? null;

  return (
    <C.Provider value={{
      fazendas, talhoes, fazendaAtiva, talhaoAtivo,
      setFazendaAtivaId: setFazendaId, setTalhaoAtivoId: setTalhaoId,
      refresh, loading,
    }}>{children}</C.Provider>
  );
}

export const useSelecao = () => {
  const c = useContext(C);
  if (!c) throw new Error("useSelecao deve ser usado dentro de SelecaoProvider");
  return c;
};
