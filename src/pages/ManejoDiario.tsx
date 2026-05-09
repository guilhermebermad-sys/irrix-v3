import { useEffect, useMemo, useState } from "react";
import { useSelecao } from "@/contexts/SelecaoContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NeuCard, NeuButton, NeuInput, NeuLabel } from "@/components/ui/neu";
import { calcular, turnoRega } from "@/lib/agro/calculations";
import { SOIL_DATA, getAFD } from "@/lib/agro/reference";
import { Calculator, Save, Droplets, Clock, AlertTriangle, CheckCircle, ChevronDown, Beaker, Satellite, Pencil } from "lucide-react";
import { format } from "date-fns";
import { WeatherFetchButton } from "@/components/weather/WeatherFetchButton";
import { WeatherForecastCard } from "@/components/weather/WeatherForecastCard";
import { DadosClimaticos } from "@/lib/weather/weatherService";
import { SoilProfile } from "@/components/SoilProfile";
import { enqueue } from "@/lib/offline/offlineSyncService";

export default function ManejoDiario() {
  const { user } = useAuth();
  const { talhaoAtivo, fazendaAtiva } = useSelecao();
  const hoje = format(new Date(), "yyyy-MM-dd");

  const [data, setData] = useState(hoje);
  const [et0, setEt0] = useState<number>(5);
  const [chuva, setChuva] = useState<number>(0);
  const [kc, setKc] = useState<number>(1);
  const [armInicial, setArmInicial] = useState<number>(0);
  const [irrigou, setIrrigou] = useState<boolean>(true);
  const [laminaAplicada, setLaminaAplicada] = useState<number | null>(null);
  const [laminaTocada, setLaminaTocada] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [dadosClima, setDadosClima] = useState<DadosClimaticos | null>(null);
  const [et0Tocado, setEt0Tocado] = useState(false);
  const [chuvaTocada, setChuvaTocada] = useState(false);

  const tib = useMemo(() => fazendaAtiva?.tipo_solo ? SOIL_DATA[fazendaAtiva.tipo_solo as keyof typeof SOIL_DATA]?.tib ?? 8 : 8, [fazendaAtiva]);
  const cad = fazendaAtiva?.cad ?? 100;
  const afd = useMemo(() => getAFD(fazendaAtiva?.cad, talhaoAtivo?.cultura), [fazendaAtiva?.cad, talhaoAtivo?.cultura]);

  // Carrega Kc do talhão e arm inicial encadeado
  useEffect(() => {
    if (!talhaoAtivo) return;
    setKc(talhaoAtivo.kc_atual ?? 1);
    (async () => {
      const { data: ant } = await supabase.from("registros_diarios")
        .select("arm_final, data").eq("talhao_id", talhaoAtivo.id)
        .lt("data", data).order("data", { ascending: false }).limit(1).maybeSingle();
      const base = ant?.arm_final ?? talhaoAtivo.arm_inicial ?? cad * 0.7;
      setArmInicial(Math.min(base, cad));
    })();
  }, [talhaoAtivo?.id, data, cad, afd]);

  const r = useMemo(() => {
    if (!talhaoAtivo) return null;
    const aplicada = !irrigou ? 0 : (laminaTocada && laminaAplicada !== null ? laminaAplicada : undefined);
    return calcular({
      et0, chuva, kc,
      eficiencia: talhaoAtivo.eficiencia ?? 90,
      vazaoEmissor: talhaoAtivo.vazao ?? 0,
      espacEmissores: talhaoAtivo.espac_emissores ?? 1,
      espacLinhas: talhaoAtivo.espac_linhas ?? 1,
      area: talhaoAtivo.area ?? 1,
      cad, afd, armInicial, tib,
      laminaAplicada: aplicada,
    } as any);
  }, [et0, chuva, kc, talhaoAtivo, cad, afd, armInicial, tib, irrigou, laminaAplicada, laminaTocada]);

  const laminaEfetiva = !irrigou ? 0 : (laminaTocada && laminaAplicada !== null ? laminaAplicada : (r?.laminaBruta ?? 0));

  const turno = r ? turnoRega(r.armFinal, cad, r.etc || et0 * kc, afd) : null;

  if (!talhaoAtivo) {
    return <NeuCard className="text-center py-16">
      <Beaker className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
      <p className="text-muted-foreground">Selecione um talhão no topo para iniciar o manejo diário.</p>
    </NeuCard>;
  }

  const registrar = async () => {
    if (!r || !user) return;
    setSalvando(true);
    const payload = {
      user_id: user.id, talhao_id: talhaoAtivo.id, data,
      et0, chuva, kc, etc: r.etc,
      lamina_liquida: r.laminaLiquida, lamina_bruta: laminaEfetiva,
      arm_inicial: armInicial, arm_final: r.armFinal, perc_cad: r.percAFD,
      drenagem_profunda: r.drenagemProfunda, taxa_aplicacao: r.taxaAplicacao,
      tib, tempo_horas: r.tempoHoras, diagnostico: r.diagnostico.mensagem,
    };
    const { error } = await supabase.from("registros_diarios").upsert(payload, { onConflict: "talhao_id,data" }).then(
      (res) => res,
      () => ({ error: { message: "network" } })
    );
    if (error) {
      if (!navigator.onLine || error.message === "network") {
        // Save to offline queue
        enqueue({ table: "registros_diarios", type: "upsert", payload, onConflict: "talhao_id,data" });
        toast.info("📡 Registro salvo localmente. Será sincronizado quando a conexão voltar.");
        setSalvando(false);
        return;
      }
      toast.error(error.message); setSalvando(false); return;
    }

    // Gera alertas automáticos baseado na AFD
    const alertas = [];
    if (r.percAFD <= 0) alertas.push({ tipo: "critico", mensagem: `🚨 AFD esgotada em ${talhaoAtivo.nome} — irrigar imediatamente!` });
    else if (r.percAFD < 20) alertas.push({ tipo: "critico", mensagem: `🚨 Nível Crítico em ${talhaoAtivo.nome} (${r.percAFD.toFixed(0)}% AFD) — alto estresse hídrico` });
    else if (r.percAFD < 50) alertas.push({ tipo: "aviso", mensagem: `⚠ Solo com baixa disponibilidade em ${talhaoAtivo.nome} (${r.percAFD.toFixed(0)}% AFD)` });
    if (r.drenagemProfunda > 0) alertas.push({ tipo: "aviso", mensagem: `💧 Excesso hídrico em ${talhaoAtivo.nome}: drenagem ${r.drenagemProfunda} mm — risco de lixiviação` });
    if (r.diagnostico.tipo === "alerta") alertas.push({ tipo: "critico", mensagem: `⛔ Risco de erosão em ${talhaoAtivo.nome}: taxa ${r.taxaAplicacao} > TiB ${tib} mm/h` });
    if (alertas.length) {
      const alertaPayloads = alertas.map(a => ({ ...a, user_id: user.id, talhao_id: talhaoAtivo.id }));
      const { error: alertaError } = await supabase.from("alertas").insert(alertaPayloads).then(
        (res) => res,
        () => ({ error: { message: "network" } })
      );
      if (alertaError && (!navigator.onLine || alertaError.message === "network")) {
        alertaPayloads.forEach(p => enqueue({ table: "alertas", type: "insert", payload: p }));
      }
    }
    toast.success("Dia registrado com sucesso!");
    setSalvando(false);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Droplets className="text-primary" /> Manejo Diário</h1>
        <p className="text-sm text-muted-foreground">Talhão {talhaoAtivo.nome} • Solo {fazendaAtiva?.tipo_solo} (TiB {tib} mm/h, CAD {cad} mm, AFD {afd} mm)</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Inputs */}
        <NeuCard className="lg:col-span-1">
          <h2 className="font-display font-semibold text-lg mb-4 flex items-center gap-2"><Calculator className="w-5 h-5 text-secondary" /> Entradas</h2>
          <div className="mb-4">
            <WeatherFetchButton
              latitude={fazendaAtiva?.latitude ?? null}
              longitude={fazendaAtiva?.longitude ?? null}
              data={data}
              onDados={(d) => {
                setDadosClima(d);
                setEt0(d.et0); setChuva(d.chuva);
                setEt0Tocado(false); setChuvaTocada(false);
              }}
            />
          </div>
          <div className="space-y-3">
            <div><NeuLabel>Data</NeuLabel><NeuInput type="date" value={data} onChange={e => setData(e.target.value)} /></div>
            <div>
              <NeuLabel>
                ET₀ — Evapotranspiração (mm)
                {dadosClima && !et0Tocado && <Satellite className="inline w-3 h-3 ml-1 text-secondary" />}
                {dadosClima && et0Tocado && <Pencil className="inline w-3 h-3 ml-1 text-warning" />}
              </NeuLabel>
              <NeuInput type="number" step="0.01" value={et0}
                onChange={e => { setEt0(parseFloat(e.target.value) || 0); if (dadosClima) setEt0Tocado(true); }} />
              {dadosClima && et0Tocado && Math.abs(et0 - dadosClima.et0) > 0.001 && (
                <p className="text-[10px] text-warning mt-1">Valor alterado manualmente — difere do dado da API ({dadosClima.et0}mm)</p>
              )}
            </div>
            <div>
              <NeuLabel>
                Precipitação efetiva (mm)
                {dadosClima && !chuvaTocada && <Satellite className="inline w-3 h-3 ml-1 text-secondary" />}
                {dadosClima && chuvaTocada && <Pencil className="inline w-3 h-3 ml-1 text-warning" />}
              </NeuLabel>
              <NeuInput type="number" step="0.01" value={chuva}
                onChange={e => { setChuva(parseFloat(e.target.value) || 0); if (dadosClima) setChuvaTocada(true); }} />
              {dadosClima && chuvaTocada && Math.abs(chuva - dadosClima.chuva) > 0.001 && (
                <p className="text-[10px] text-warning mt-1">Valor alterado manualmente — difere do dado da API ({dadosClima.chuva}mm)</p>
              )}
            </div>
            <div><NeuLabel>Kc do dia</NeuLabel><NeuInput type="number" step="0.01" value={kc} onChange={e => setKc(parseFloat(e.target.value) || 0)} /></div>
            <div>
              <NeuLabel>Arm. Inicial (mm) — máx. CAD {cad || "—"}</NeuLabel>
              <NeuInput type="number" step="0.1" max={cad || undefined} value={armInicial} onChange={e => {
                let v = parseFloat(e.target.value) || 0;
                if (cad > 0 && v > cad) { toast.warning(`Arm. inicial limitado à Cap. Campo (${cad} mm)`); v = cad; }
                setArmInicial(v);
              }} />
            </div>

            <div className="neu-inset p-3 rounded-xl space-y-2">
              <NeuLabel>Irrigou hoje?</NeuLabel>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setIrrigou(true); setLaminaTocada(false); setLaminaAplicada(null); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${irrigou ? "neu-pressed text-primary" : "neu-button"}`}>Sim</button>
                <button type="button" onClick={() => { setIrrigou(false); setLaminaTocada(false); setLaminaAplicada(null); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold ${!irrigou ? "neu-pressed text-destructive" : "neu-button"}`}>Não</button>
              </div>
              {irrigou && (
                <div>
                  <NeuLabel>Lâmina aplicada (mm) — recomendada: {r?.laminaBruta ?? 0}</NeuLabel>
                  <NeuInput type="number" step="0.01"
                    value={laminaTocada && laminaAplicada !== null ? laminaAplicada : (r?.laminaBruta ?? 0)}
                    onChange={e => { setLaminaTocada(true); setLaminaAplicada(parseFloat(e.target.value) || 0); }} />
                  <div className="text-[10px] text-muted-foreground mt-1">Edite se aplicou diferente do recomendado.</div>
                </div>
              )}
            </div>
          </div>
          <NeuButton variant="primary" className="w-full mt-5" onClick={registrar} disabled={salvando}>
            <Save className="w-4 h-4" /> {salvando ? "Salvando..." : "Registrar Dia"}
          </NeuButton>
        </NeuCard>

        {/* Resultados */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          <ResultCard label="Lâmina Líquida" valor={`${r?.laminaLiquida ?? 0} mm`} cor="primary" />
          <ResultCard label="Lâmina Bruta (recomendada)" valor={`${r?.laminaBruta ?? 0} mm`} sub={`Aplicada: ${laminaEfetiva.toFixed(2)} mm`} cor="secondary" />
          <ResultCard label="Tempo de Irrigação" valor={r?.tempoFormatado ?? "00:00"} icon={Clock} cor="secondary" />
          <ResultCard label="Taxa de Aplicação" valor={`${r?.taxaAplicacao ?? 0} mm/h`} sub={`TiB: ${tib} mm/h`} />
          <div className="sm:col-span-2 neu p-4 flex items-center justify-around gap-4 flex-wrap">
            <SoilProfile
              armFinal={r?.armFinal ?? 0}
              CAD={fazendaAtiva?.cad ?? 100}
              AFD={afd}
              cultura={talhaoAtivo?.cultura ?? undefined}
              estadio={talhaoAtivo?.estadio_fenologico ?? undefined}
            />
            <div className="text-sm space-y-1">
              <div className="text-muted-foreground">Arm. inicial: <strong className="text-foreground">{armInicial.toFixed(1)} mm</strong></div>
              <div className="text-muted-foreground">Arm. final: <strong className="text-foreground">{r?.armFinal ?? 0} mm</strong></div>
              <div className="text-muted-foreground">% AFD: <strong className="text-foreground">{r?.percAFD.toFixed(1) ?? 0}%</strong></div>
            </div>
          </div>
          <ResultCard label="Drenagem Profunda" valor={`${r?.drenagemProfunda ?? 0} mm`} cor={r && r.drenagemProfunda > 0 ? "warning" : "default"} />
          <div className="sm:col-span-2">
            <div className={`neu p-5 ${r?.diagnostico.tipo === "alerta" ? "ring-2 ring-destructive/30" : ""}`}>
              <div className="flex items-center gap-3">
                {r?.diagnostico.tipo === "alerta"
                  ? <AlertTriangle className="w-6 h-6 text-destructive" />
                  : <CheckCircle className="w-6 h-6 text-primary" />}
                <div className="flex-1">
                  <div className="font-semibold">{r?.diagnostico.mensagem}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {r?.diagnostico.tipo === "alerta"
                      ? `Excesso de ${r?.diagnostico.diferenca.toFixed(2)} mm/h. Reduza a taxa ou aumente o tempo de irrigação.`
                      : `Margem de segurança: ${r?.diagnostico.diferenca.toFixed(2)} mm/h.`}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sm:col-span-2 neu p-5">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-secondary" />
              <div>
                <div className="font-semibold">Próximo turno de rega</div>
                <div className="text-sm text-muted-foreground">
                  Recomendado em <strong className="text-foreground">{turno?.dias} dias</strong> — previsto para {turno && format(turno.data, "dd/MM/yyyy")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <NeuCard>
        <button onClick={() => setShowSteps(s => !s)} className="w-full flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2"><Beaker className="w-4 h-4" /> Memória de Cálculo (16 passos)</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showSteps ? "rotate-180" : ""}`} />
        </button>
        {showSteps && r && (
          <div className="mt-4 space-y-2">
            {dadosClima && dadosClima.fonte === "NASA POWER" && !et0Tocado && (
              <>
                <div className="neu-inset p-3 grid sm:grid-cols-3 gap-2 text-xs">
                  <div className="font-semibold">⓪a Origem dos Dados Climáticos</div>
                  <div className="font-mono text-muted-foreground">{dadosClima.fonte} · {dadosClima.coordenadas.latitude.toFixed(4)}, {dadosClima.coordenadas.longitude.toFixed(4)}</div>
                  <div className="font-mono font-semibold text-secondary text-right">
                    Tmax {dadosClima.tmax}°C · Tmin {dadosClima.tmin}°C · Tmed {dadosClima.tmed}°C{dadosClima.radiacao != null ? ` · Rad ${dadosClima.radiacao} MJ/m²` : ""} · P {dadosClima.chuva}mm
                  </div>
                </div>
                <div className="neu-inset p-3 grid sm:grid-cols-3 gap-2 text-xs">
                  <div className="font-semibold">⓪b ET₀ — Hargreaves-Samani (FAO-56)</div>
                  <div className="font-mono text-muted-foreground">
                    J={dadosClima.J}, Ra={dadosClima.ra} MJ/m²/dia<br />
                    ET₀ = 0.0023 × {dadosClima.ra} × √({dadosClima.tmax}−{dadosClima.tmin}) × ({dadosClima.tmed}+17.8)
                  </div>
                  <div className="font-mono font-semibold text-primary text-right">{dadosClima.et0} mm/dia</div>
                </div>
              </>
            )}
            {r.passos.map((p, i) => (
              <div key={i} className="neu-inset p-3 grid sm:grid-cols-3 gap-2 text-xs">
                <div className="font-semibold">{p.titulo}</div>
                <div className="font-mono text-muted-foreground">{p.formula}</div>
                <div className="font-mono font-semibold text-primary text-right">{p.resultado}</div>
              </div>
            ))}
          </div>
        )}
      </NeuCard>

      <WeatherForecastCard
        latitude={fazendaAtiva?.latitude ?? null}
        longitude={fazendaAtiva?.longitude ?? null}
      />
    </div>
  );
}

function ResultCard({ label, valor, sub, icon: Icon, cor = "default" }: { label: string; valor: string; sub?: string; icon?: any; cor?: string }) {
  const cores: Record<string, string> = {
    default: "text-foreground",
    primary: "text-primary",
    secondary: "text-secondary",
    danger: "text-destructive",
    warning: "text-warning",
  };
  return (
    <div className="neu p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}{label}
      </div>
      <div className={`font-display text-2xl font-bold mt-1 ${cores[cor]}`}>{valor}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
