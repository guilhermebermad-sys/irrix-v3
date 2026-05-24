import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSelecao } from "@/contexts/SelecaoContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NeuCard, NeuButton, NeuInput, NeuSelect, NeuLabel, NeuTextarea } from "@/components/ui/neu";
import { CATEGORIAS, getCategoria, CONDICOES_CLIMA, CategoriaKey } from "@/lib/caderno/categorias";
import { BookOpen, Plus, Pencil, Trash2, X, Filter, FileDown, Camera } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Registro = any;

export default function CadernoCampo() {
  const { user } = useAuth();
  const { fazendas, talhoes } = useSelecao();
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroFaz, setFiltroFaz] = useState<string>("");
  const [filtroTal, setFiltroTal] = useState<string>("");
  const [filtroCat, setFiltroCat] = useState<CategoriaKey | "">("");
  const [modal, setModal] = useState<Partial<Registro> | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    const { data } = await supabase.from("caderno_campo" as any).select("*").order("data", { ascending: false });
    setRegistros((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { if (user) refresh(); }, [user?.id]);

  const filtrados = useMemo(() => registros.filter(r => {
    if (filtroFaz && r.fazenda_id !== filtroFaz) return false;
    if (filtroTal && r.talhao_id !== filtroTal) return false;
    if (filtroCat && r.categoria !== filtroCat) return false;
    return true;
  }), [registros, filtroFaz, filtroTal, filtroCat]);

  const resumo = useMemo(() => {
    const porCat: Record<string, number> = {};
    let total = 0;
    filtrados.forEach(r => {
      const c = Number(r.custo_total || 0);
      total += c;
      porCat[r.categoria] = (porCat[r.categoria] || 0) + c;
    });
    const area = Array.from(new Set(filtrados.map(r => r.area_aplicada).filter(Boolean)))
      .reduce((s: number, a: any) => s + Number(a || 0), 0) || 1;
    return { porCat, total, area, custoHa: total / area };
  }, [filtrados]);

  const excluir = async (id: string) => {
    const { error } = await supabase.from("caderno_campo" as any).delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Registro excluído"); refresh(); }
    setConfirmDel(null);
  };

  const exportarExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    CATEGORIAS.forEach(cat => {
      const rows = filtrados.filter(r => r.categoria === cat.key).map(r => ({
        Data: r.data, Título: r.titulo, Produto: r.produto, Dose: r.dose,
        Área: r.area_aplicada, "Custo Total": r.custo_total,
        Responsável: r.responsavel, Clima: r.condicao_clima, Observações: r.observacoes,
      }));
      if (rows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), cat.label.slice(0, 30));
    });
    XLSX.writeFile(wb, `caderno-campo-${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const exportarPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    doc.setFontSize(16); doc.text("Caderno de Campo", 14, 18);
    autoTable(doc, {
      startY: 24,
      head: [["Data", "Categoria", "Título", "Produto/Dose", "Custo R$", "Responsável"]],
      body: filtrados.map(r => [
        r.data, getCategoria(r.categoria).label, r.titulo,
        [r.produto, r.dose].filter(Boolean).join(" — "),
        r.custo_total ?? "—", r.responsavel ?? "—",
      ]),
    });
    doc.save(`caderno-campo-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const talhoesFiltro = filtroFaz ? talhoes.filter(t => t.fazenda_id === filtroFaz) : talhoes;

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-primary" /> 📓 Caderno de Campo
          </h1>
          <p className="text-sm text-muted-foreground">Registre todas as operações realizadas em campo</p>
        </div>
        <div className="flex gap-2">
          <NeuButton onClick={exportarExcel}><FileDown className="w-4 h-4" /> Excel</NeuButton>
          <NeuButton onClick={exportarPDF}><FileDown className="w-4 h-4" /> PDF</NeuButton>
          <NeuButton variant="primary" onClick={() => setModal({ data: format(new Date(), "yyyy-MM-dd") })}>
            <Plus className="w-4 h-4" /> Novo Registro
          </NeuButton>
        </div>
      </div>

      {/* Resumo financeiro */}
      <NeuCard>
        <h3 className="font-display font-bold text-lg mb-3">💰 Resumo da Safra Atual</h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {Object.entries(resumo.porCat).map(([k, v]) => {
            const c = getCategoria(k);
            return (
              <div key={k} className="flex items-center justify-between neu-inset px-3 py-2 rounded-lg">
                <span>{c.emoji} {c.label}</span>
                <strong>R$ {v.toFixed(2)}</strong>
              </div>
            );
          })}
        </div>
        <div className="grid sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-border/50">
          <div><div className="text-xs text-muted-foreground">💸 Custo Total</div><div className="font-display text-xl font-bold text-destructive">R$ {resumo.total.toFixed(2)}</div></div>
          <div><div className="text-xs text-muted-foreground">📐 Área</div><div className="font-display text-xl font-bold">{resumo.area} ha</div></div>
          <div><div className="text-xs text-muted-foreground">📊 Custo / ha</div><div className="font-display text-xl font-bold text-secondary">R$ {resumo.custoHa.toFixed(2)}</div></div>
        </div>
      </NeuCard>

      {/* Filtros */}
      <NeuCard>
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold"><Filter className="w-4 h-4" /> Filtros</div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <NeuLabel>Fazenda</NeuLabel>
            <NeuSelect value={filtroFaz} onChange={e => { setFiltroFaz(e.target.value); setFiltroTal(""); }}>
              <option value="">Todas</option>
              {fazendas.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </NeuSelect>
          </div>
          <div>
            <NeuLabel>Talhão</NeuLabel>
            <NeuSelect value={filtroTal} onChange={e => setFiltroTal(e.target.value)}>
              <option value="">Todos</option>
              {talhoesFiltro.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </NeuSelect>
          </div>
          <div>
            <NeuLabel>Categoria</NeuLabel>
            <NeuSelect value={filtroCat} onChange={e => setFiltroCat(e.target.value as any)}>
              <option value="">Todas</option>
              {CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </NeuSelect>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {CATEGORIAS.map(c => (
            <button key={c.key} onClick={() => setFiltroCat(filtroCat === c.key ? "" : c.key)}
              className={`text-xs px-3 py-1.5 rounded-full neu-button ${filtroCat === c.key ? "neu-pressed text-primary" : ""}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>
      </NeuCard>

      {/* Timeline */}
      {loading ? (
        <NeuCard className="text-center py-12 text-muted-foreground">Carregando…</NeuCard>
      ) : filtrados.length === 0 ? (
        <NeuCard className="text-center py-12 text-muted-foreground">Nenhum registro ainda. Clique em "+ Novo Registro" para começar.</NeuCard>
      ) : (
        <div className="space-y-3">
          {filtrados.map(r => {
            const cat = getCategoria(r.categoria);
            const fz = fazendas.find(f => f.id === r.fazenda_id);
            const tl = talhoes.find(t => t.id === r.talhao_id);
            return (
              <NeuCard key={r.id} className="border-l-4" style={{ borderColor: cat.bg }}>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span style={{ color: cat.bg }}>{cat.emoji} {cat.label}</span>
                      <span className="text-muted-foreground text-xs">· {r.data.split("-").reverse().join("/")}</span>
                    </div>
                    <h3 className="font-display font-bold mt-1">{r.titulo}</h3>
                    <p className="text-xs text-muted-foreground">
                      {tl?.nome ?? "—"} · {fz?.nome ?? "—"}
                    </p>
                    {(r.produto || r.dose) && <p className="text-sm mt-2">{r.produto} {r.dose ? `— ${r.dose} ${r.unidade_dose ?? ""}` : ""}</p>}
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                      {r.area_aplicada && <span>Área: {r.area_aplicada} ha</span>}
                      {r.custo_total && <span>Custo: R$ {r.custo_total}</span>}
                      {r.responsavel && <span>Resp.: {r.responsavel}</span>}
                      {r.condicao_clima && <span>Clima: {r.condicao_clima}</span>}
                    </div>
                    {r.observacoes && <p className="text-sm italic mt-2 text-foreground/70">"{r.observacoes}"</p>}
                    {r.fotos_urls?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {r.fotos_urls.map((u: string, i: number) => (
                          <img key={i} src={u} alt="" className="w-16 h-16 object-cover rounded-lg neu-inset" />
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <NeuButton onClick={() => setModal(r)}><Pencil className="w-4 h-4" /></NeuButton>
                    <NeuButton variant="danger" onClick={() => setConfirmDel(r.id)}><Trash2 className="w-4 h-4" /></NeuButton>
                  </div>
                </div>
              </NeuCard>
            );
          })}
        </div>
      )}

      {modal && (
        <RegistroModal
          data={modal}
          fazendas={fazendas}
          talhoes={talhoes}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); refresh(); }}
        />
      )}

      <AlertDialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir registro?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDel && excluir(confirmDel)}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RegistroModal({ data, fazendas, talhoes, onClose, onSaved }: any) {
  const { user } = useAuth();
  const [r, setR] = useState<any>(data);
  const [salvando, setSalvando] = useState(false);
  const [uploadando, setUploadando] = useState(false);
  const set = (k: string, v: any) => setR((p: any) => ({ ...p, [k]: v }));

  const tFiltrados = r.fazenda_id ? talhoes.filter((t: any) => t.fazenda_id === r.fazenda_id) : [];
  const cat = getCategoria(r.categoria || "outro");

  // auto custo total
  useEffect(() => {
    if (r.custo_unitario && r.area_aplicada && !r._manualTotal) {
      set("custo_total", +(Number(r.custo_unitario) * Number(r.area_aplicada)).toFixed(2));
    }
  }, [r.custo_unitario, r.area_aplicada]);

  const subirFotos = async (files: FileList) => {
    if (!user) return;
    setUploadando(true);
    const urls: string[] = [...(r.fotos_urls || [])];
    for (const f of Array.from(files)) {
      const path = `${user.id}/${Date.now()}-${f.name}`;
      const { error } = await supabase.storage.from("caderno-fotos").upload(path, f);
      if (error) { toast.error(error.message); continue; }
      // Bucket privado: armazena o path; signed URL é gerado na exibição.
      urls.push(path);
    }
    set("fotos_urls", urls);
    setUploadando(false);
  };


  const salvar = async () => {
    if (!user || !r.categoria || !r.titulo || !r.data) {
      toast.error("Categoria, título e data são obrigatórios"); return;
    }
    setSalvando(true);
    const payload: any = {
      user_id: user.id,
      data: r.data, categoria: r.categoria, titulo: r.titulo,
      descricao: r.descricao || null, produto: r.produto || null,
      dose: r.dose || null, unidade_dose: r.unidade_dose || null,
      area_aplicada: r.area_aplicada || null, custo_unitario: r.custo_unitario || null,
      custo_total: r.custo_total || null, responsavel: r.responsavel || null,
      condicao_clima: r.condicao_clima || null, fotos_urls: r.fotos_urls || null,
      observacoes: r.observacoes || null, fazenda_id: r.fazenda_id || null,
      talhao_id: r.talhao_id || null, dados_extras: r.dados_extras || null,
    };
    const { error } = r.id
      ? await supabase.from("caderno_campo" as any).update(payload).eq("id", r.id)
      : await supabase.from("caderno_campo" as any).insert(payload);
    setSalvando(false);
    if (error) toast.error(error.message);
    else { toast.success(r.id ? "Atualizado!" : "Registro salvo!"); onSaved(); }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="neu max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold">{r.id ? "Editar Registro" : "Novo Registro"}</h2>
          <button onClick={onClose} className="neu-button p-2 rounded-lg"><X className="w-4 h-4" /></button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div><NeuLabel>Categoria *</NeuLabel>
            <NeuSelect value={r.categoria ?? ""} onChange={e => set("categoria", e.target.value)}>
              <option value="">—</option>
              {CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
            </NeuSelect>
          </div>
          <div><NeuLabel>Data *</NeuLabel><NeuInput type="date" value={r.data ?? ""} onChange={e => set("data", e.target.value)} /></div>
          <div className="sm:col-span-2"><NeuLabel>Título / Operação *</NeuLabel><NeuInput value={r.titulo ?? ""} onChange={e => set("titulo", e.target.value)} /></div>
          <div><NeuLabel>Fazenda</NeuLabel>
            <NeuSelect value={r.fazenda_id ?? ""} onChange={e => { set("fazenda_id", e.target.value); set("talhao_id", null); }}>
              <option value="">—</option>
              {fazendas.map((f: any) => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </NeuSelect>
          </div>
          <div><NeuLabel>Talhão</NeuLabel>
            <NeuSelect value={r.talhao_id ?? ""} onChange={e => set("talhao_id", e.target.value)}>
              <option value="">—</option>
              {tFiltrados.map((t: any) => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </NeuSelect>
          </div>

          {/* Categoria-specific common fields */}
          {(r.categoria === "adubacao" || r.categoria === "defensivos" || r.categoria === "plantio") && (
            <>
              <div><NeuLabel>Produto / Cultivar</NeuLabel><NeuInput value={r.produto ?? ""} onChange={e => set("produto", e.target.value)} /></div>
              <div><NeuLabel>Dose</NeuLabel><NeuInput value={r.dose ?? ""} onChange={e => set("dose", e.target.value)} /></div>
              <div><NeuLabel>Unidade (kg/ha, L/ha…)</NeuLabel><NeuInput value={r.unidade_dose ?? ""} onChange={e => set("unidade_dose", e.target.value)} /></div>
              <div><NeuLabel>Área aplicada (ha)</NeuLabel><NeuInput type="number" step="0.01" value={r.area_aplicada ?? ""} onChange={e => set("area_aplicada", parseFloat(e.target.value) || null)} /></div>
            </>
          )}
          {r.categoria === "irrigacao" && (
            <>
              <div><NeuLabel>Lâmina aplicada (mm)</NeuLabel><NeuInput type="number" step="0.01" value={r.dose ?? ""} onChange={e => { set("dose", e.target.value); set("unidade_dose", "mm"); }} /></div>
              <div><NeuLabel>Tempo de irrigação (hh:mm)</NeuLabel><NeuInput value={r.produto ?? ""} onChange={e => set("produto", e.target.value)} /></div>
            </>
          )}
          {r.categoria === "colheita" && (
            <>
              <div><NeuLabel>Produtividade (sc/ha ou t/ha)</NeuLabel><NeuInput value={r.dose ?? ""} onChange={e => set("dose", e.target.value)} /></div>
              <div><NeuLabel>Área colhida (ha)</NeuLabel><NeuInput type="number" step="0.01" value={r.area_aplicada ?? ""} onChange={e => set("area_aplicada", parseFloat(e.target.value) || null)} /></div>
            </>
          )}

          <div><NeuLabel>Custo unitário (R$)</NeuLabel><NeuInput type="number" step="0.01" value={r.custo_unitario ?? ""} onChange={e => set("custo_unitario", parseFloat(e.target.value) || null)} /></div>
          <div><NeuLabel>Custo total (R$)</NeuLabel><NeuInput type="number" step="0.01" value={r.custo_total ?? ""} onChange={e => { set("_manualTotal", true); set("custo_total", parseFloat(e.target.value) || null); }} /></div>
          <div><NeuLabel>Responsável</NeuLabel><NeuInput value={r.responsavel ?? ""} onChange={e => set("responsavel", e.target.value)} /></div>
          <div><NeuLabel>Condição climática</NeuLabel>
            <NeuSelect value={r.condicao_clima ?? ""} onChange={e => set("condicao_clima", e.target.value)}>
              <option value="">—</option>
              {CONDICOES_CLIMA.map(c => <option key={c}>{c}</option>)}
            </NeuSelect>
          </div>
          <div className="sm:col-span-2"><NeuLabel>Observações</NeuLabel><NeuTextarea rows={3} value={r.observacoes ?? ""} onChange={e => set("observacoes", e.target.value)} /></div>

          <div className="sm:col-span-2 neu-inset p-3 rounded-xl">
            <NeuLabel><Camera className="inline w-4 h-4 mr-1" /> Fotos</NeuLabel>
            <input type="file" accept="image/*" multiple onChange={e => e.target.files && subirFotos(e.target.files)} className="text-xs" />
            {uploadando && <p className="text-xs text-muted-foreground mt-1">Enviando…</p>}
            {r.fotos_urls?.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {r.fotos_urls.map((u: string, i: number) => (
                  <img key={i} src={u} alt="" className="w-16 h-16 object-cover rounded-lg" />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <NeuButton onClick={onClose}>Cancelar</NeuButton>
          <NeuButton variant="primary" onClick={salvar} disabled={salvando}>{salvando ? "Salvando…" : "Salvar"}</NeuButton>
        </div>
      </div>
    </div>
  );
}
