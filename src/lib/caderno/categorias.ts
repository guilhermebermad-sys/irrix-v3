import {
  Droplets, Sprout, FlaskConical, Shield, Scissors, Wheat,
  Wrench, Eye, CloudRain, ClipboardList, LucideIcon,
} from "lucide-react";

export type CategoriaKey =
  | "irrigacao" | "plantio" | "adubacao" | "defensivos" | "poda"
  | "colheita" | "manutencao" | "monitoramento" | "clima" | "outro";

export interface Categoria {
  key: CategoriaKey;
  label: string;
  emoji: string;
  icon: LucideIcon;
  cor: string; // tailwind text color class
  bg: string;  // bg color hex
}

export const CATEGORIAS: Categoria[] = [
  { key: "irrigacao",     label: "Irrigação",                emoji: "💧", icon: Droplets,      cor: "text-cyan-600",   bg: "#06b6d4" },
  { key: "plantio",       label: "Plantio",                  emoji: "🌱", icon: Sprout,        cor: "text-green-600",  bg: "#10b981" },
  { key: "adubacao",      label: "Adubação / Fertirrigação", emoji: "🧪", icon: FlaskConical,  cor: "text-amber-600",  bg: "#f59e0b" },
  { key: "defensivos",    label: "Aplicação de Defensivos",  emoji: "🛡", icon: Shield,        cor: "text-orange-600", bg: "#f97316" },
  { key: "poda",          label: "Poda / Raleio",            emoji: "✂️", icon: Scissors,      cor: "text-purple-600", bg: "#a855f7" },
  { key: "colheita",      label: "Colheita",                 emoji: "🌾", icon: Wheat,         cor: "text-emerald-700",bg: "#047857" },
  { key: "manutencao",    label: "Manutenção",               emoji: "🔧", icon: Wrench,        cor: "text-slate-500",  bg: "#64748b" },
  { key: "monitoramento", label: "Monitoramento / Vistoria", emoji: "👁", icon: Eye,           cor: "text-blue-600",   bg: "#3b82f6" },
  { key: "clima",         label: "Evento Climático",         emoji: "🌧", icon: CloudRain,     cor: "text-blue-800",   bg: "#1e40af" },
  { key: "outro",         label: "Outro",                    emoji: "📋", icon: ClipboardList, cor: "text-slate-400",  bg: "#94a3b8" },
];

export const getCategoria = (key: string) =>
  CATEGORIAS.find((c) => c.key === key) ?? CATEGORIAS[CATEGORIAS.length - 1];

export const CONDICOES_CLIMA = [
  "Ensolarado", "Nublado", "Parcialmente nublado", "Chuvoso", "Vento forte", "Geada",
];
