import { useEffect, useState, useMemo } from "react";
import { useSelecao } from "@/contexts/SelecaoContext";
import { supabase } from "@/integrations/supabase/client";
import { NeuCard, NeuButton, NeuInput, NeuLabel } from "@/components/ui/neu";
import { Download, FileSpreadsheet, FileText, Satellite, X, Loader2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { format, parseISO } from "date-fns";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { logoSrc } from "@/components/Logo";
import { importarHistoricoNasa, RegistroHistorico } from "@/lib/weather/weatherService";
import { DataSourcesFooter } from "@/components/DataSourcesFooter";
import { HydricTimelineChart } from "@/components/HydricTimelineChart";
import { getAFD } from "@/lib/agro/reference";

export default function Historico() {
  const { user } = useAuth();
  const { talhaoAtivo, fazendaAtiva } = useSelecao();
  const [regs, setRegs] = useState<any[]>([]);
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [soIrrig, setSoIrrig] = useState(false);
  const [soAlerta, setSoAlerta] = useState(false);
  const [importando, setImportando] = useState(false);
  const [previewImport, setPreviewImport] = useState<null | { rows: (RegistroHistorico & { existe: boolean; sel: boolean })[]; fonte?: string; metodo?: string; diasSolicitados?: number }>(null);
  const [salvandoImport, setSalvandoImport] = useState(false);

  const abrirImportacao = async () => {
    if (!talhaoAtivo || !fazendaAtiva) return;
    if (fazendaAtiva.latitude == null || fazendaAtiva.longitude == null) {
      toast.warning("Cadastre a localização (lat/lon) da fazenda primeiro.");
      return;
    }
    setImportando(true);
    const r = await importarHistoricoNasa(fazendaAtiva.latitude, fazendaAtiva.longitude, 30);
    setImportando(false);
    if (!r.sucesso || !r.registros) { toast.error(r.erro || "Falha na importação"); return; }
    const existentes = new Set(regs.map(x => x.data));
    setPreviewImport({
      rows: r.registros.map(x => ({ ...x, existe: existentes.has(x.data), sel: !existentes.has(x.data) })),
      fonte: r.fonte, metodo: r.metodo, diasSolicitados: r.diasSolicitados,
    });
  };

  const confirmarImportacao = async () => {
    if (!previewImport || !user || !talhaoAtivo) return;
    const sel = previewImport.rows.filter(r => r.sel);
    if (!sel.length) { toast.warning("Selecione ao menos um dia."); return; }
    setSalvandoImport(true);
    const payload = sel.map(r => ({
      user_id: user.id, talhao_id: talhaoAtivo.id, data: r.data,
      et0: r.et0, chuva: r.chuva,
    }));
    const { error } = await supabase.from("registros_diarios").upsert(payload, { onConflict: "talhao_id,data" });
    setSalvandoImport(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${sel.length} dias importados com sucesso`);
    setPreviewImport(null);
    const { data } = await supabase.from("registros_diarios").select("*").eq("talhao_id", talhaoAtivo.id).order("data", { ascending: true });
    setRegs(data || []);
  };

  useEffect(() => {
    if (!talhaoAtivo) { setRegs([]); return; }
    supabase.from("registros_diarios").select("*").eq("talhao_id", talhaoAtivo.id)
      .order("data", { ascending: true })
      .then(({ data }) => setRegs(data || []));
  }, [talhaoAtivo?.id]);

  const filtrados = useMemo(() => regs.filter(r => {
    if (de && r.data < de) return false;
    if (ate && r.data > ate) return false;
    if (soIrrig && (r.lamina_bruta ?? 0) <= 0) return false;
    if (soAlerta && r.diagnostico !== "⚠ Risco de Escoamento e Erosão") return false;
    return true;
  }), [regs, de, ate, soIrrig, soAlerta]);

  const safeName = (talhaoAtivo?.nome || "talhao").replace(/[^a-zA-Z0-9_-]/g, "_");

  const exportCsv = () => {
    try {
      if (!filtrados.length) { toast.warning("Nenhum registro no período."); return; }
      const headers = ["Data","ET0","Kc","ETc","Chuva","LL","LB","Arm.Ini","Arm.Fin","%CAD","Drenagem","Taxa Apl","TiB","Diagnóstico","Tempo (h)"];
      const rows = filtrados.map(r => [r.data, r.et0, r.kc, r.etc, r.chuva, r.lamina_liquida, r.lamina_bruta, r.arm_inicial, r.arm_final, r.perc_cad, r.drenagem_profunda, r.taxa_aplicacao, r.tib, r.diagnostico, r.tempo_horas]);
      const csv = [headers, ...rows].map(r => r.map(v => v ?? "").join(";")).join("\n");
      saveAs(new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" }), `irrix_${safeName}.csv`);
      toast.success("CSV exportado!");
    } catch (e: any) { console.error(e); toast.error("Falha ao exportar CSV: " + e.message); }
  };

  const exportXlsx = () => {
    try {
      if (!filtrados.length) { toast.warning("Nenhum registro no período."); return; }
      const linhas = filtrados.map(r => ({
        Data: r.data, ET0: r.et0, Kc: r.kc, ETc: r.etc, Chuva: r.chuva,
        "Lâmina Líquida": r.lamina_liquida, "Lâmina Bruta": r.lamina_bruta,
        "Arm. Inicial": r.arm_inicial, "Arm. Final": r.arm_final, "% CAD": r.perc_cad,
        "Drenagem Prof.": r.drenagem_profunda, "Taxa Apl.": r.taxa_aplicacao,
        TiB: r.tib, Diagnóstico: r.diagnostico, "Tempo (h)": r.tempo_horas,
      }));
      const wb = XLSX.utils.book_new();
      const grupos: Record<string, any[]> = {};
      filtrados.forEach(r => { const m = r.data.slice(0, 7); (grupos[m] ||= []).push(r); });
      Object.entries(grupos).forEach(([mes, dados]) => {
        const w = XLSX.utils.json_to_sheet(dados);
        XLSX.utils.book_append_sheet(wb, w, mes);
      });
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(linhas), "Tudo");
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([out], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `irrix_${safeName}.xlsx`);
      toast.success("Excel exportado!");
    } catch (e: any) { console.error(e); toast.error("Falha ao exportar Excel: " + e.message); }
  };

  const exportPdf = async () => {
    try {
      if (!filtrados.length) { toast.warning("Nenhum registro no período."); return; }
      const doc = new jsPDF();
      const { data: perfil } = await supabase.from("usuarios_perfil").select("*").eq("user_id", user!.id).maybeSingle();
      try {
        const resp = await fetch(logoSrc);
        const blob = await resp.blob();
        const b64 = await new Promise<string>(res => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(blob); });
        doc.addImage(b64, "PNG", 14, 10, 18, 18);
      } catch { /* logo opcional */ }
      doc.setFontSize(18); doc.setTextColor(16, 185, 129);
      doc.text("IrriX — Precision Irrigation Report", 36, 20);
      doc.setFontSize(11); doc.setTextColor(80);
      doc.text(`Fazenda: ${fazendaAtiva?.nome ?? "-"}`, 14, 36);
      doc.text(`Talhão: ${talhaoAtivo?.nome ?? "-"} | Cultura: ${talhaoAtivo?.cultura ?? "-"}`, 14, 42);
      doc.text(`Período: ${de || filtrados[0]?.data} a ${ate || filtrados[filtrados.length-1]?.data}`, 14, 48);
      autoTable(doc, {
        startY: 54,
        head: [["Data","ET0","Kc","ETc","Chuva","LB","Arm.Fin","%CAD","Diagnóstico"]],
        body: filtrados.map(r => [r.data, r.et0, r.kc, r.etc, r.chuva, r.lamina_bruta, r.arm_final, `${r.perc_cad?.toFixed(0)}%`, r.diagnostico]),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [16, 185, 129] },
      });
      const finalY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(10); doc.setTextColor(60);
      doc.text(`Responsável Técnico: ${perfil?.nome ?? ""}  CREA/CFT: ${perfil?.crea ?? ""}`, 14, finalY);
      doc.text(`Empresa: ${perfil?.empresa ?? ""}`, 14, finalY + 6);
      doc.text("_____________________________________", 14, finalY + 22);
      doc.text("Assinatura do Consultor", 14, finalY + 28);
      doc.save(`irrix_${safeName}.pdf`);
      toast.success("PDF exportado!");
    } catch (e: any) { console.error(e); toast.error("Falha ao exportar PDF: " + e.message); }
  };

  if (!talhaoAtivo) return <NeuCard className="text-center py-12 text-muted-foreground">Selecione um talhão para visualizar histórico.</NeuCard>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold">Histórico</h1>
        <p className="text-sm text-muted-foreground">{fazendaAtiva?.nome} • {talhaoAtivo.nome}</p>
      </div>

      <NeuCard>
        <div className="grid sm:grid-cols-4 gap-3 items-end">
          <div><NeuLabel>De</NeuLabel><NeuInput type="date" value={de} onChange={e => setDe(e.target.value)} /></div>
          <div><NeuLabel>Até</NeuLabel><NeuInput type="date" value={ate} onChange={e => setAte(e.target.value)} /></div>
          <label className="neu-inset px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={soIrrig} onChange={e => setSoIrrig(e.target.checked)} /> Só dias com irrigação
          </label>
          <label className="neu-inset px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={soAlerta} onChange={e => setSoAlerta(e.target.checked)} /> Só dias com alerta
          </label>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <NeuButton onClick={exportCsv}><Download className="w-4 h-4" /> CSV</NeuButton>
          <NeuButton onClick={exportXlsx}><FileSpreadsheet className="w-4 h-4" /> Excel</NeuButton>
          <NeuButton onClick={exportPdf}><FileText className="w-4 h-4" /> PDF</NeuButton>
          <NeuButton onClick={abrirImportacao} disabled={importando}>
            {importando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Satellite className="w-4 h-4" />}
            🛰 Importar dados climáticos — últimos 30 dias
          </NeuButton>
        </div>
      </NeuCard>

      <NeuCard>
        <HydricTimelineChart
          registros={filtrados}
          CAD={fazendaAtiva?.cad ?? 100}
          AFD={getAFD(fazendaAtiva?.cad ?? 100, talhaoAtivo?.cultura)}
          periodo={30}
          height={340}
          title="Série temporal — Arm. Final"
        />
      </NeuCard>

      <NeuCard className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              {["Data","ET₀","Kc","ETc","Chuva","LL","LB","Arm.Ini","Arm.Fin","%CAD","Dren.","Taxa","TiB","Diagnóstico","Tempo"].map(h =>
                <th key={h} className="py-2 px-2 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(r => (
              <tr key={r.id} className="border-b border-border/30 hover:bg-muted/30">
                <td className="py-2 px-2">{format(parseISO(r.data), "dd/MM/yy")}</td>
                <td className="px-2">{r.et0}</td><td className="px-2">{r.kc}</td><td className="px-2">{r.etc}</td>
                <td className="px-2">{r.chuva}</td><td className="px-2">{r.lamina_liquida}</td><td className="px-2">{r.lamina_bruta}</td>
                <td className="px-2">{r.arm_inicial}</td><td className="px-2">{r.arm_final}</td>
                <td className="px-2">{r.perc_cad?.toFixed(0)}%</td>
                <td className="px-2">{r.drenagem_profunda}</td><td className="px-2">{r.taxa_aplicacao}</td><td className="px-2">{r.tib}</td>
                <td className="px-2 text-[10px]">{r.diagnostico}</td>
                <td className="px-2">{r.tempo_horas?.toFixed(1)}h</td>
              </tr>
            ))}
            {filtrados.length === 0 && <tr><td colSpan={15} className="text-center py-8 text-muted-foreground">Nenhum registro.</td></tr>}
          </tbody>
        </table>
      </NeuCard>

      {previewImport && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setPreviewImport(null)}>
          <div className="neu max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold flex items-center gap-2">
                <Satellite className="w-5 h-5 text-secondary" /> Importar dados climáticos
              </h2>
              <button onClick={() => setPreviewImport(null)} className="neu-button p-2 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              {previewImport.fonte && (
                <span className="neu-sm px-2 py-1 rounded-lg font-semibold text-secondary">
                  Fonte: {previewImport.fonte} · {previewImport.metodo}
                </span>
              )}
              <span className="neu-sm px-2 py-1 rounded-lg text-muted-foreground">
                {previewImport.rows.length} de {previewImport.diasSolicitados ?? 30} dias retornados
              </span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Selecione os dias que deseja importar (ET₀ e Chuva). Dias já existentes podem ser sobrescritos.
            </p>
            <div className="flex gap-2 mb-3 text-xs">
              <button className="neu-button px-3 py-1 rounded-lg" onClick={() => setPreviewImport({ ...previewImport, rows: previewImport.rows.map(r => ({ ...r, sel: !r.existe })) })}>Selecionar novos</button>
              <button className="neu-button px-3 py-1 rounded-lg" onClick={() => setPreviewImport({ ...previewImport, rows: previewImport.rows.map(r => ({ ...r, sel: true })) })}>Todos</button>
              <button className="neu-button px-3 py-1 rounded-lg" onClick={() => setPreviewImport({ ...previewImport, rows: previewImport.rows.map(r => ({ ...r, sel: false })) })}>Nenhum</button>
            </div>
            <div className="neu-inset rounded-xl overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-muted-foreground border-b border-border">
                  <th className="py-2 px-2"></th><th className="py-2 px-2">Data</th><th className="px-2">ET₀</th><th className="px-2">Chuva</th><th className="px-2">Status</th>
                </tr></thead>
                <tbody>
                  {previewImport.rows.map((r, i) => (
                    <tr key={r.data} className="border-b border-border/30">
                      <td className="px-2 py-1.5"><input type="checkbox" checked={r.sel} onChange={e => {
                        const rows = [...previewImport.rows]; rows[i] = { ...r, sel: e.target.checked }; setPreviewImport({ ...previewImport, rows });
                      }} /></td>
                      <td className="px-2">{r.data.split("-").reverse().join("/")}</td>
                      <td className="px-2">{r.et0} mm</td>
                      <td className="px-2">{r.chuva} mm</td>
                      <td className="px-2">{r.existe ? <span className="text-warning">Já existe</span> : <span className="text-primary">Novo</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3 justify-end mt-5">
              <NeuButton onClick={() => setPreviewImport(null)}>Cancelar</NeuButton>
              <NeuButton variant="primary" onClick={confirmarImportacao} disabled={salvandoImport}>
                {salvandoImport ? "Importando..." : "Importar selecionados"}
              </NeuButton>
            </div>
          </div>
        </div>
      )}
      <DataSourcesFooter />
    </div>
  );
}
