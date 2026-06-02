import { Bell, ChevronDown, User as UserIcon } from "lucide-react";
import { useSelecao } from "@/contexts/SelecaoContext";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link, useLocation } from "react-router-dom";
import { SidebarToggle, useSidebarState } from "./Sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { useAcessoPlano } from "@/hooks/useAcessoPlano";

export function Header() {
  const { fazendas, talhoes, fazendaAtiva, talhaoAtivo, setFazendaAtivaId, setTalhaoAtivoId } = useSelecao();
  const { user } = useAuth();
  const { desktopCollapsed } = useSidebarState();
  const [naoLidos, setNaoLidos] = useState(0);
  const location = useLocation();
  const acesso = useAcessoPlano();

  const fetchCount = useCallback(async () => {
    if (!user) { setNaoLidos(0); return; }
    const { count } = await supabase.from("alertas")
      .select("id", { count: "exact", head: true })
      .eq("lido", false);
    setNaoLidos(count ?? 0);
  }, [user]);

  useEffect(() => { fetchCount(); }, [fetchCount, location.pathname]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`user:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alertas", filter: `user_id=eq.${user.id}` },
        () => fetchCount()
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, fetchCount]);


  const talhoesDaFazenda = talhoes.filter(t => t.fazenda_id === fazendaAtiva?.id);

  return (
    <header className="sticky top-0 z-[1001] px-4 md:px-6 py-3 bg-background/80 backdrop-blur-sm">
      {acesso.plano === "trial" && acesso.diasRestantes !== null && (
        <div className="mb-2 px-4 py-2 rounded-xl text-xs font-medium text-center neu" style={{ color: "hsl(var(--primary))" }}>
          Teste grátis: {acesso.diasRestantes} {acesso.diasRestantes === 1 ? "dia restante" : "dias restantes"} ·{" "}
          <Link to="/assinar" className="underline font-semibold">assinar agora</Link>
        </div>
      )}
      <div className="neu px-4 py-3 flex items-center gap-3 flex-wrap">
        <SidebarToggle />
        {/* Logo dinâmico: aparece apenas em mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Logo className="h-9 w-9 object-contain" />
        </div>
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative">
            <select
              value={fazendaAtiva?.id ?? ""}
              onChange={(e) => setFazendaAtivaId(e.target.value || null)}
              className="neu-input pl-4 pr-10 py-2 text-sm font-medium appearance-none cursor-pointer min-w-[160px]">
              <option value="">— Selecione fazenda —</option>
              {fazendas.map(f => <option key={f.id} value={f.id}>{f.nome}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={talhaoAtivo?.id ?? ""}
              onChange={(e) => setTalhaoAtivoId(e.target.value || null)}
              className="neu-input pl-4 pr-10 py-2 text-sm font-medium appearance-none cursor-pointer min-w-[160px]"
              disabled={!fazendaAtiva}>
              <option value="">— Selecione talhão —</option>
              {talhoesDaFazenda.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <ThemeToggle />

        <Link to="/alertas" className="neu-button w-10 h-10 rounded-xl flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-foreground" />
          {naoLidos > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {naoLidos}
            </span>
          )}
        </Link>

        <Link to="/configuracoes" className="neu-button w-10 h-10 rounded-xl flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-foreground" />
        </Link>
      </div>
    </header>
  );
}
