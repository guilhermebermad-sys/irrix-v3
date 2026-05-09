import { useEffect, useMemo, useState } from "react";
import { useSelecao } from "@/contexts/SelecaoContext";
import { supabase } from "@/integrations/supabase/client";
import { NeuCard } from "@/components/ui/neu";
import { Sprout, Droplets, AlertCircle, Bell, TrendingUp, Map as MapIcon, Cloud, CloudRain, Droplet, Flame } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, CartesianGrid } from "recharts";
import { format, parseISO } from "date-fns";
import { SOIL_DATA, getAFD } from "@/lib/agro/reference";
import { Link } from "react-router-dom";
import { CurrentConditionsCard } from "@/components/weather/CurrentConditionsCard";
import { WeatherForecastCard } from "@/components/weather/WeatherForecastCard";
import { SoilWaterBar } from "@/components/SoilProfile";
import { HydricTimelineChart } from "@/components/HydricTimelineChart";
import { TalhoesOverviewMap, TalhaoMapItem } from "@/components/map/TalhoesOverviewMap";
import { DataSourcesFooter } from "@/components/DataSourcesFooter";
import { SoilProfile } from "@/components/SoilProfile";
import { CropImage } from "@/components/CropImage";

export default function Dashboard() {
  const { fazendas, talhoes, talhaoAtivo, fazendaAtiva } = useSelecao();
  const [registros, setRegistros] = useState<any[]>([]);
  const [alertas, setAlertas] = useState<number>(0);
  const [ultimosPorTalhao, setUltimosPorTalhao] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!talhaoAtivo) { setRegistros([]); return; }
    supabase.from("registros_diarios").select("*").eq("talhao_id", talhaoAtivo.id)
      .order("data", { ascending: false }).limit(14)
      .then(({ data }) => setRegistros((data || []).reverse()));
  }, [talhaoAtivo?.id]);

  useEffect(() => {
    supabase.from("alertas").select("id", { count: "exact", head: true }).eq("lido", false)
      .then(({ count }) => setAlertas(count ?? 0));
  }, []);

  // Last record per talhão of the active fazenda (for map colors)
  useEffect(() => {
    if (!fazendaAtiva || !talhoes) { setUltimosPorTalhao({}); return; }
    const ids = talhoes
      .filter(t => t && t.fazenda_id === fazendaAtiva.id)
      .map(t => t.id);
    
    if (ids.length === 0) { setUltimosPorTalhao({}); return; }
    
    supabase.from("registros_diarios").select("*").in("talhao_id", ids)
      .order("data", { ascending: false })
      .then(({ data }) => {
        const map: Record<string, any> = {};
        (data || []).forEach((r: any) => { if (!map[r.talhao_id]) map[r.talhao_id] = r; });
        setUltimosPorTalhao(map);
      });
  }, [fazendaAtiva?.id, talhoes]);

  const cad = fazendaAtiva?.cad ?? 100;
  const afd = useMemo(() => getAFD(cad, talhaoAtivo?.cultura), [cad, talhaoAtivo?.cultura]);
  const ultimoArm = registros[registros.length - 1]?.arm_final ?? talhaoAtivo?.arm_inicial ?? 0;
  
  // Formula: 100% = AFD (referencial), 0% = Limite de Depleção
  const limiteAFD = cad - afd;
  // Usamos Math.max para não travar em 100%, permitindo visualização de excesso
  const percAFD = afd > 0 ? ((ultimoArm - limiteAFD) / afd) * 100 : 0;

  const tib = fazendaAtiva?.tipo_solo ? (SOIL_DATA[fazendaAtiva.tipo_solo as keyof typeof SOIL_DATA]?.tib ?? 8) : 8;

  const dadosLinha = useMemo(() => (registros || []).map(r => {
    try {
      const d = r.data ? format(parseISO(r.data), "dd/MM") : "—";
      const pAFD = afd > 0 ? ((r.arm_final - limiteAFD) / afd) * 100 : 0;
      // Se houver drenagem, somamos ao percentual para mostrar o transbordamento no gráfico
      const pTotal = pAFD + (r.drenagem_profunda > 0 ? (r.drenagem_profunda / afd) * 100 : 0);
      return { data: d, Arm: r.arm_final ?? 0, "% AFD": pTotal };
    } catch {
      return { data: "—", Arm: 0, "% AFD": 0 };
    }
  }), [registros, afd, limiteAFD]);

  const dadosBarra = useMemo(() => (registros || []).map(r => {
    try {
      const d = r.data ? format(parseISO(r.data), "dd/MM") : "—";
      return { data: d, ETc: r.etc ?? 0, Chuva: r.chuva ?? 0, Lâmina: r.lamina_bruta ?? 0 };
    } catch {
      return { data: "—", ETc: 0, Chuva: 0, Lâmina: 0 };
    }
  }), [registros]);

  const precisaIrrigar = (() => {
    if (!talhaoAtivo) return false;
    return percAFD < 20;
  })();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header / KPIs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <TrendingUp className="w-8 h-8" />
            </div>
            Painel de Controle
          </h1>
          <p className="text-muted-foreground mt-1 ml-11">
            {talhaoAtivo ? `Monitoramento do Talhão ${talhaoAtivo.nome}` : "Visão geral da sua produção agrícola"}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/alertas" className="relative p-2 rounded-xl neu hover:scale-105 transition-all">
            <Bell className="w-6 h-6 text-muted-foreground" />
            {alertas > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                {alertas}
              </span>
            )}
          </Link>
          <div className="neu-sm px-4 py-2 rounded-xl flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${percAFD < 20 ? 'bg-destructive animate-pulse' : percAFD < 50 ? 'bg-warning' : 'bg-primary'}`} />
            <span className="text-sm font-bold uppercase tracking-wider">
              {percAFD < 20 ? 'Crítico (Irrigar)' : percAFD < 50 ? 'Atenção' : 'Estável'}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <NeuCard className="lg:col-span-2 overflow-hidden p-0 relative">
          <div className="absolute top-4 left-4 z-[400] bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 shadow-lg">
             <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <MapIcon className="w-3.5 h-3.5 text-primary" /> Panorama da Fazenda
             </h3>
          </div>
          <TalhoesOverviewMap 
            talhoes={talhoes.filter(t => t.fazenda_id === fazendaAtiva?.id).map<TalhaoMapItem>(t => ({
              id: t.id,
              nome: t.nome,
              cultura: t.cultura,
              estadio: t.estadio_fenologico,
              area: t.area,
              poligono: (t.coordenadas_poligono as any) ?? null,
              centroideLat: t.centroide_lat ?? null,
              centroideLon: t.centroide_lon ?? null,
              percCad: (() => {
                const cadT = (fazendaAtiva?.cad ?? 100);
                const afdT = getAFD(cadT, t.cultura);
                const arm = ultimosPorTalhao[t.id]?.arm_final;
                if (arm == null || afdT <= 0) return null;
                return ((arm - (cadT - afdT)) / afdT) * 100;
              })(),
              arm: ultimosPorTalhao[t.id]?.arm_final ?? null,
              et0: ultimosPorTalhao[t.id]?.et0 ?? null,
              ultimaData: ultimosPorTalhao[t.id]?.data ? format(parseISO(ultimosPorTalhao[t.id].data), "dd/MM") : null
            }))}
            fazendaCentro={fazendaAtiva?.latitude ? { lat: fazendaAtiva.latitude, lon: fazendaAtiva.longitude } : null}
            height={400}
          />
        </NeuCard>

        {/* Current Conditions */}
        <div className="space-y-6">
           <CurrentConditionsCard 
             latitude={fazendaAtiva?.latitude ?? null} 
             longitude={fazendaAtiva?.longitude ?? null} 
           />
           <WeatherForecastCard 
             latitude={fazendaAtiva?.latitude ?? null} 
             longitude={fazendaAtiva?.longitude ?? null} 
           />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <NeuCard className="p-6">
          <HydricTimelineChart
            registros={registros}
            CAD={cad}
            AFD={afd}
            height={300}
            title="Evolução Hídrica do Solo"
          />
        </NeuCard>

        <NeuCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" /> Lâminas e Consumo (mm)
              </h3>
              <p className="text-xs text-muted-foreground">Últimos 14 dias</p>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosBarra}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                <XAxis dataKey="data" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} tick={{ fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: "12px", border: "none", boxShadow: "var(--shadow-neu)" }}
                  itemStyle={{ fontSize: "12px", fontWeight: "bold" }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px", fontSize: "10px" }} />
                <Bar dataKey="ETc" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} name="Consumo (ETc)" />
                <Bar dataKey="Chuva" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} name="Chuva" />
                <Bar dataKey="Lâmina" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Lâmina Irrigada" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </NeuCard>
      </div>

      <NeuCard className="p-8 mb-8">
        <h3 className="font-display font-bold text-xl mb-6 text-center">Perfil Hídrico do Solo</h3>
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          <SoilProfile
            armFinal={ultimoArm}
            CAD={cad}
            AFD={afd}
            cultura={talhaoAtivo?.cultura ?? undefined}
            estadio={talhaoAtivo?.estadio_fenologico ?? undefined}
          />
          <div className="hidden lg:block w-px h-48 bg-border" />
          <div className="space-y-4 text-center lg:text-left max-w-xs">
            <div className="neu-sm p-4 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Status Atual</div>
              <div className={`text-2xl font-black ${percAFD < 20 ? 'text-destructive' : percAFD < 50 ? 'text-warning' : 'text-primary'}`}>
                {percAFD > 100 ? 'Transbordamento' : percAFD < 20 ? 'Déficit Crítico' : 'Confortável'}
              </div>
              <div className="text-sm font-bold text-muted-foreground">{percAFD.toFixed(0)}% da AFD</div>
            </div>
            <div className="flex gap-3 justify-center lg:justify-start">
              <div className="text-center px-3 py-2 rounded-xl bg-muted/50">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Arm.</div>
                <div className="text-lg font-black">{ultimoArm.toFixed(1)}<span className="text-[10px] ml-0.5">mm</span></div>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-muted/50">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">AFD</div>
                <div className="text-lg font-black">{afd.toFixed(1)}<span className="text-[10px] ml-0.5">mm</span></div>
              </div>
              <div className="text-center px-3 py-2 rounded-xl bg-muted/50">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">CAD</div>
                <div className="text-lg font-black">{cad.toFixed(0)}<span className="text-[10px] ml-0.5">mm</span></div>
              </div>
            </div>
            <div className="pt-2">
              <SoilWaterBar armFinal={ultimoArm} CAD={cad} AFD={afd} />
            </div>
          </div>
        </div>
      </NeuCard>

      <DataSourcesFooter />
    </div>
  );
}
