import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { NeuCard, NeuButton } from "@/components/ui/neu";
import { Bell, Check, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { toast } from "sonner";
import { useSelecao } from "@/contexts/SelecaoContext";

export default function Alertas() {
  const { talhoes } = useSelecao();
  const [alertas, setAlertas] = useState<any[]>([]);

  const carregar = () => {
    supabase.from("alertas").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setAlertas(data || []));
  };
  useEffect(() => { carregar(); }, []);

  const marcarLido = async (id: string) => {
    await supabase.from("alertas").update({ lido: true }).eq("id", id);
    carregar();
  };
  const remover = async (id: string) => {
    await supabase.from("alertas").delete().eq("id", id);
    toast.success("Alerta removido"); carregar();
  };
  const marcarTodos = async () => {
    await supabase.from("alertas").update({ lido: true }).eq("lido", false);
    toast.success("Todos marcados como lidos"); carregar();
  };

  const nomeTalhao = (id: string) => talhoes.find(t => t.id === id)?.nome ?? "—";

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2"><Bell className="text-primary" /> Alertas</h1>
          <p className="text-sm text-muted-foreground">{alertas.filter(a => !a.lido).length} não lidos</p>
        </div>
        <NeuButton onClick={marcarTodos}><Check className="w-4 h-4" /> Marcar todos como lidos</NeuButton>
      </div>

      {alertas.length === 0 ? (
        <NeuCard className="text-center py-16 text-muted-foreground">
          <Bell className="w-12 h-12 mx-auto mb-3 opacity-40" />
          Nenhum alerta no momento.
        </NeuCard>
      ) : (
        <div className="space-y-3">
          {alertas.map(a => (
            <div key={a.id} className={`neu p-4 flex items-start gap-3 ${!a.lido ? "ring-2 ring-primary/20" : "opacity-70"}`}>
              <div className={`w-2 h-2 rounded-full mt-2 ${a.tipo === "critico" ? "bg-destructive" : "bg-warning"}`} />
              <div className="flex-1">
                <div className="font-medium text-sm">{a.mensagem}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Talhão: {nomeTalhao(a.talhao_id)} • {format(parseISO(a.created_at), "dd/MM/yyyy HH:mm")}
                </div>
              </div>
              <div className="flex gap-2">
                {!a.lido && <button onClick={() => marcarLido(a.id)} className="neu-button p-2 rounded-lg"><Check className="w-4 h-4" /></button>}
                <button onClick={() => remover(a.id)} className="neu-button p-2 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
