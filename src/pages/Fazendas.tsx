import { useState } from "react";
import { useSelecao, Fazenda, Talhao } from "@/contexts/SelecaoContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NeuCard, NeuButton, NeuInput, NeuSelect, NeuLabel, NeuTextarea } from "@/components/ui/neu";
import { SOIL_TYPES, SOIL_DATA, FONTES_AGUA, ESTADOS_BR, CULTURAS, ESTADIOS, SISTEMAS_IRRIGACAO, getKc, getF, getAFD } from "@/lib/agro/reference";
import { Plus, Pencil, Trash2, Sprout, MapPin, X, Loader2 } from "lucide-react";
import { TalhaoDrawMap } from "@/components/map/TalhaoDrawMap";

export default function Fazendas() {
  const { user } = useAuth();
  const { fazendas, talhoes, refresh } = useSelecao();
  const [modalFz, setModalFz] = useState<Partial<Fazenda> | null>(null);
  const [modalTl, setModalTl] = useState<{ fazenda_id: string; data?: Partial<Talhao> } | null>(null);

  const salvarFazenda = async (f: Partial<Fazenda>) => {
    if (!user || !f.nome) { toast.error("Nome é obrigatório"); return; }
    const payload: any = { ...f, user_id: user.id, nome: f.nome };
    delete payload.id;
    const { error } = f.id
      ? await supabase.from("fazendas").update(payload).eq("id", f.id)
      : await supabase.from("fazendas").insert(payload as any);
    if (error) toast.error(error.message); else { toast.success("Fazenda salva!"); setModalFz(null); refresh(); }
  };

  const removerFazenda = async (id: string) => {
    if (!confirm("Remover esta fazenda e todos os seus talhões?")) return;
    const { error } = await supabase.from("fazendas").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removida"); refresh(); }
  };

  const salvarTalhao = async (t: Partial<Talhao>, fazenda_id: string) => {
    if (!user || !t.nome) { toast.error("Nome é obrigatório"); return; }
    const payload: any = { ...t, user_id: user.id, fazenda_id };
    delete payload.id;
    const { error } = t.id
      ? await supabase.from("talhoes").update(payload).eq("id", t.id)
      : await supabase.from("talhoes").insert(payload);
    if (error) toast.error(error.message); else { toast.success("Talhão salvo!"); setModalTl(null); refresh(); }
  };

  const removerTalhao = async (id: string) => {
    if (!confirm("Remover este talhão?")) return;
    const { error } = await supabase.from("talhoes").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removido"); refresh(); }
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Minhas Fazendas</h1>
          <p className="text-sm text-muted-foreground">Cadastre fazendas e seus talhões</p>
        </div>
        <NeuButton variant="primary" onClick={() => setModalFz({})}>
          <Plus className="w-4 h-4" /> Nova Fazenda
        </NeuButton>
      </div>

      {fazendas.length === 0 && (
        <NeuCard className="text-center py-16">
          <Sprout className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Nenhuma fazenda cadastrada ainda.</p>
        </NeuCard>
      )}

      <div className="grid gap-5">
        {fazendas.map(f => {
          const ts = talhoes.filter(t => t.fazenda_id === f.id);
          return (
            <NeuCard key={f.id}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <Sprout className="w-5 h-5 text-primary" /> {f.nome}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {f.municipio || "—"} {f.estado ? `/ ${f.estado}` : ""} • {f.area_total ?? 0} ha • {f.tipo_solo || "—"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <NeuButton onClick={() => setModalFz(f)}><Pencil className="w-4 h-4" /></NeuButton>
                  <NeuButton onClick={() => removerFazenda(f.id)} variant="danger"><Trash2 className="w-4 h-4" /></NeuButton>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm">Talhões ({ts.length})</h4>
                  <NeuButton onClick={() => setModalTl({ fazenda_id: f.id })}>
                    <Plus className="w-3.5 h-3.5" /> Talhão
                  </NeuButton>
                </div>
                {ts.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhum talhão cadastrado.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {ts.map(t => (
                      <div key={t.id} className="neu-inset p-3">
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <div className="font-semibold text-sm truncate">{t.nome}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {t.cultura || "—"} • {t.area ?? 0} ha
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-1">
                              {t.estadio_fenologico || "—"} • Kc {t.kc_atual ?? "—"}
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <button onClick={() => setModalTl({ fazenda_id: f.id, data: t })} className="neu-button p-1.5 rounded-lg">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => removerTalhao(t.id)} className="neu-button p-1.5 rounded-lg text-destructive">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </NeuCard>
          );
        })}
      </div>

      {modalFz && <FazendaModal data={modalFz} onClose={() => setModalFz(null)} onSave={salvarFazenda} />}
      {modalTl && <TalhaoModal fazenda_id={modalTl.fazenda_id} data={modalTl.data ?? {}} onClose={() => setModalTl(null)} onSave={salvarTalhao} />}
    </div>
  );
}

function Modal({ children, onClose, title }: any) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="neu max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="neu-button p-2 rounded-lg"><X className="w-4 h-4" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FazendaModal({ data, onClose, onSave }: { data: Partial<Fazenda>; onClose: () => void; onSave: (f: Partial<Fazenda>) => void }) {
  const [f, setF] = useState<Partial<Fazenda>>(data);
  const [geo, setGeo] = useState(false);
  const set = (k: keyof Fazenda, v: any) => setF(prev => ({ ...prev, [k]: v }));

  const usarLocalizacao = () => {
    if (!navigator.geolocation) { toast.error("Geolocalização não suportada neste dispositivo."); return; }
    setGeo(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set("latitude", parseFloat(pos.coords.latitude.toFixed(7)));
        set("longitude", parseFloat(pos.coords.longitude.toFixed(7)));
        toast.success("Localização preenchida!");
        setGeo(false);
      },
      () => {
        toast.error("Permita o acesso à localização ou insira as coordenadas manualmente.");
        setGeo(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <Modal title={f.id ? "Editar Fazenda" : "Nova Fazenda"} onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><NeuLabel>Nome</NeuLabel><NeuInput value={f.nome ?? ""} onChange={e => set("nome", e.target.value)} /></div>
        <div><NeuLabel>Município</NeuLabel><NeuInput value={f.municipio ?? ""} onChange={e => set("municipio", e.target.value)} /></div>
        <div><NeuLabel>Estado</NeuLabel>
          <NeuSelect value={f.estado ?? ""} onChange={e => set("estado", e.target.value)}>
            <option value="">—</option>{ESTADOS_BR.map(e => <option key={e}>{e}</option>)}
          </NeuSelect>
        </div>
        <div><NeuLabel>Área Total (ha)</NeuLabel><NeuInput type="number" step="0.01" value={f.area_total ?? ""} onChange={e => set("area_total", parseFloat(e.target.value) || null)} /></div>
        <div><NeuLabel>Tipo de Solo</NeuLabel>
          <NeuSelect value={f.tipo_solo ?? ""} onChange={e => {
            const v = e.target.value; set("tipo_solo", v);
            if (v && SOIL_DATA[v as keyof typeof SOIL_DATA]) set("cad", SOIL_DATA[v as keyof typeof SOIL_DATA].cad);
          }}>
            <option value="">—</option>{SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
          </NeuSelect>
        </div>
        <div><NeuLabel>CAD (mm)</NeuLabel><NeuInput type="number" step="0.1" value={f.cad ?? ""} onChange={e => set("cad", parseFloat(e.target.value) || null)} /></div>
        <div><NeuLabel>Fonte de Água</NeuLabel>
          <NeuSelect value={f.fonte_agua ?? ""} onChange={e => set("fonte_agua", e.target.value)}>
            <option value="">—</option>{FONTES_AGUA.map(s => <option key={s}>{s}</option>)}
          </NeuSelect>
        </div>

        <div className="sm:col-span-2 neu-inset p-3 rounded-xl space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <NeuLabel className="mb-0">📍 Localização (para dados climáticos)</NeuLabel>
            <button type="button" onClick={usarLocalizacao} disabled={geo}
              className="neu-button px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
              {geo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
              {geo ? "Buscando..." : "Usar minha localização atual"}
            </button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div><NeuLabel>Latitude</NeuLabel>
              <NeuInput type="number" step="0.0000001" placeholder="-21.1234" value={f.latitude ?? ""}
                onChange={e => set("latitude", e.target.value === "" ? null : parseFloat(e.target.value))} />
            </div>
            <div><NeuLabel>Longitude</NeuLabel>
              <NeuInput type="number" step="0.0000001" placeholder="-47.8765" value={f.longitude ?? ""}
                onChange={e => set("longitude", e.target.value === "" ? null : parseFloat(e.target.value))} />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">Necessário para buscar ET₀ e chuva automaticamente via NASA POWER e Open-Meteo.</p>
        </div>

        <div className="sm:col-span-2"><NeuLabel>Observações</NeuLabel><NeuTextarea rows={3} value={f.observacoes ?? ""} onChange={e => set("observacoes", e.target.value)} /></div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <NeuButton onClick={onClose}>Cancelar</NeuButton>
        <NeuButton variant="primary" onClick={() => onSave(f)}>Salvar</NeuButton>
      </div>
    </Modal>
  );
}

function TalhaoModal({ fazenda_id, data, onClose, onSave }: { fazenda_id: string; data: Partial<Talhao>; onClose: () => void; onSave: (t: Partial<Talhao>, fid: string) => void }) {
  const [t, setT] = useState<Partial<Talhao>>(data);
  const { fazendas } = useSelecao();
  const fz = fazendas.find(x => x.id === fazenda_id);
  const set = (k: keyof Talhao, v: any) => setT(prev => ({ ...prev, [k]: v }));
  const estadios = t.cultura ? ESTADIOS[t.cultura] || [] : [];
  const f = getF(t.cultura);
  const afd = getAFD(fz?.cad, t.cultura);

  return (
    <Modal title={t.id ? "Editar Talhão" : "Novo Talhão"} onClose={onClose}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><NeuLabel>Nome / Identificação</NeuLabel><NeuInput value={t.nome ?? ""} onChange={e => set("nome", e.target.value)} /></div>
        <div><NeuLabel>Área irrigada (ha)</NeuLabel><NeuInput type="number" step="0.01" value={t.area ?? ""} onChange={e => set("area", parseFloat(e.target.value) || null)} /></div>
        <div><NeuLabel>Cultura</NeuLabel>
          <NeuSelect value={t.cultura ?? ""} onChange={e => { set("cultura", e.target.value); set("estadio_fenologico", null); set("kc_atual", null); }}>
            <option value="">—</option>{CULTURAS.map(c => <option key={c}>{c}</option>)}
          </NeuSelect>
        </div>
        <div><NeuLabel>Estádio fenológico</NeuLabel>
          <NeuSelect value={t.estadio_fenologico ?? ""} onChange={e => { const v = e.target.value; set("estadio_fenologico", v); if (t.cultura && v) set("kc_atual", getKc(t.cultura, v)); }}>
            <option value="">—</option>{estadios.map(s => <option key={s}>{s}</option>)}
          </NeuSelect>
        </div>
        <div><NeuLabel>Kc atual</NeuLabel><NeuInput type="number" step="0.01" value={t.kc_atual ?? ""} onChange={e => set("kc_atual", parseFloat(e.target.value) || null)} /></div>
        <div><NeuLabel>Data de plantio</NeuLabel><NeuInput type="date" value={t.data_plantio ?? ""} onChange={e => set("data_plantio", e.target.value)} /></div>
        <div><NeuLabel>Data prevista de colheita</NeuLabel><NeuInput type="date" value={t.data_colheita ?? ""} onChange={e => set("data_colheita", e.target.value)} /></div>
        <div><NeuLabel>Sistema de irrigação</NeuLabel>
          <NeuSelect value={t.tipo_sistema ?? ""} onChange={e => set("tipo_sistema", e.target.value)}>
            <option value="">—</option>{SISTEMAS_IRRIGACAO.map(s => <option key={s}>{s}</option>)}
          </NeuSelect>
        </div>
        <div><NeuLabel>Espaçamento emissores (m)</NeuLabel><NeuInput type="number" step="0.01" value={t.espac_emissores ?? ""} onChange={e => set("espac_emissores", parseFloat(e.target.value) || null)} /></div>
        <div><NeuLabel>Espaçamento linhas (m)</NeuLabel><NeuInput type="number" step="0.01" value={t.espac_linhas ?? ""} onChange={e => set("espac_linhas", parseFloat(e.target.value) || null)} /></div>
        <div><NeuLabel>Vazão emissor (L/h)</NeuLabel><NeuInput type="number" step="0.01" value={t.vazao ?? ""} onChange={e => set("vazao", parseFloat(e.target.value) || null)} /></div>
        <div><NeuLabel>Pressão de serviço (mca)</NeuLabel><NeuInput type="number" step="0.1" value={t.pressao ?? ""} onChange={e => set("pressao", parseFloat(e.target.value) || null)} /></div>
        <div><NeuLabel>Eficiência aplicação (%)</NeuLabel><NeuInput type="number" step="0.1" value={t.eficiencia ?? ""} onChange={e => set("eficiencia", parseFloat(e.target.value) || null)} /></div>
        <div>
          <NeuLabel>Fração de depleção (f)</NeuLabel>
          <NeuInput value={f.toFixed(2)} disabled />
          <p className="text-[11px] text-muted-foreground mt-1">Definido pela cultura.</p>
        </div>
        <div>
          <NeuLabel>AFD (mm)</NeuLabel>
          <NeuInput value={afd || ""} disabled />
          <p className="text-[11px] text-muted-foreground mt-1">CAD × f {fz?.cad ? `= ${fz.cad} × ${f.toFixed(2)}` : ""}</p>
        </div>
        <div className="sm:col-span-2">
          <NeuLabel>Armazenamento inicial (mm) — máx. {afd || "—"}</NeuLabel>
          <NeuInput type="number" step="0.1" max={afd || undefined} value={t.arm_inicial ?? ""} onChange={e => {
            let v: number | null = parseFloat(e.target.value);
            if (isNaN(v)) v = null;
            if (v !== null && afd > 0 && v > afd) { toast.warning(`Limitado ao AFD (${afd} mm)`); v = afd; }
            set("arm_inicial", v);
          }} />
        </div>

        <div className="sm:col-span-2 neu-inset p-3 rounded-xl space-y-3">
          <NeuLabel className="mb-0">📍 Localização e Delimitação do Talhão</NeuLabel>
          <p className="text-[11px] text-muted-foreground">Desenhe o polígono do talhão no mapa. A área será calculada automaticamente.</p>
          <TalhaoDrawMap
            initialCenter={fz?.latitude && fz?.longitude ? { lat: Number(fz.latitude), lon: Number(fz.longitude) } : null}
            initialPolygon={(t.coordenadas_poligono as any) || null}
            onConfirm={({ coords, areaHa, centroide }) => {
              set("coordenadas_poligono" as any, coords);
              set("area_calculada_ha" as any, areaHa);
              set("centroide_lat" as any, centroide.lat);
              set("centroide_lon" as any, centroide.lon);
              set("area", areaHa);
              toast.success(`Polígono salvo · ${areaHa.toFixed(2)} ha`);
            }}
          />
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <NeuButton onClick={onClose}>Cancelar</NeuButton>
        <NeuButton variant="primary" onClick={() => onSave(t, fazenda_id)}>Salvar</NeuButton>
      </div>
    </Modal>
  );
}
