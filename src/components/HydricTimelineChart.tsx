import { useMemo, useState } from "react";
import {
  ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceArea, ReferenceLine, Scatter,
} from "recharts";
import { format, parseISO } from "date-fns";
import { classificarSituacao } from "@/components/SoilProfile";
import { cn } from "@/lib/utils";

export interface RegistroHidrico {
  data: string;          // yyyy-mm-dd
  arm_final: number;
  etc?: number | null;
  chuva?: number | null;
  lamina_bruta?: number | null;
  perc_cad?: number | null;
}

interface Props {
  registros: RegistroHidrico[];
  CAD: number;
  AFD: number;
  periodo?: 7 | 14 | 30;
  onPeriodoChange?: (p: 7 | 14 | 30) => void;
  height?: number;
  title?: string;
  className?: string;
}

const SITUACAO_LABEL: Record<string, string> = {
  excesso: "Excesso", acima_afd: "Acima AFD", otimo: "Ótimo",
  adequado: "Adequado", atencao: "Atenção", critico: "Crítico", murcha: "Murcha",
};

export function HydricTimelineChart({
  registros, CAD, AFD,
  periodo: periodoProp, onPeriodoChange,
  height = 320, title = "Evolução Hídrica do Solo", className,
}: Props) {
  const [periodoState, setPeriodoState] = useState<7 | 14 | 30>(14);
  const periodo = periodoProp ?? periodoState;

  const setPeriodo = (p: 7 | 14 | 30) => {
    if (onPeriodoChange) onPeriodoChange(p);
    else setPeriodoState(p);
  };

  const dados = useMemo(() => {
    const ordenados = [...registros].sort((a, b) => a.data.localeCompare(b.data));
    const ultimos = ordenados.slice(-periodo);
    const limiteAFD = CAD - AFD;
    return ultimos.map(r => {
      const percAFD = AFD > 0 ? Math.max(0, ((r.arm_final - limiteAFD) / AFD) * 100) : 0;
      return {
        ...r,
        dataLabel: (() => { try { return format(parseISO(r.data), "dd/MM"); } catch { return r.data; } })(),
        percAFD,
        situacao: classificarSituacao(r.arm_final, CAD, AFD),
        irrigMarker: (r.lamina_bruta ?? 0) > 0 ? -5 : null,
        chuvaMarker: (r.chuva ?? 0) > 0 ? CAD * 1.05 : null,
      };
    });
  }, [registros, periodo, CAD, AFD]);

  const limiteAFD = CAD - AFD;
  const yMax = CAD * 1.1;
  const yMin = -10;

  const Tip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const r = payload[0].payload;
    return (
      <div className="neu-sm rounded-xl p-3 text-xs space-y-1 bg-card border border-border shadow-lg">
        <div className="font-bold text-sm">{r.dataLabel}</div>
        <div>Arm: <strong>{r.arm_final?.toFixed(1)} mm</strong></div>
        <div>%AFD: <strong>{r.percAFD?.toFixed(0)}%</strong></div>
        {r.etc != null && <div>ETc: {r.etc} mm</div>}
        {(r.chuva ?? 0) > 0 && <div>🌧 Chuva: {r.chuva} mm</div>}
        {(r.lamina_bruta ?? 0) > 0 && <div>💧 Lâmina: {r.lamina_bruta} mm</div>}
        <div className="pt-1 border-t border-border/50 mt-1">
          Status: <strong className="text-primary">{SITUACAO_LABEL[r.situacao]}</strong>
        </div>
      </div>
    );
  };

  // Scatter shape para irrigação (gota debaixo do eixo)
  const IrrigShape = (props: any) => {
    const { cx, cy, payload } = props;
    if (cy == null || !payload?.lamina_bruta) return null;
    return (
      <g>
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={11}>💧</text>
        <text x={cx} y={cy + 16} textAnchor="middle" fontSize={8} fill="#1d4ed8" fontWeight={700}>
          {payload.lamina_bruta}mm
        </text>
      </g>
    );
  };
  const ChuvaShape = (props: any) => {
    const { cx, cy, payload } = props;
    if (cy == null || !payload?.chuva) return null;
    return (
      <g>
        <text x={cx} y={cy} textAnchor="middle" fontSize={11}>🌧</text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize={8} fill="#0369a1" fontWeight={700}>
          {payload.chuva}mm
        </text>
      </g>
    );
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-base">{title}</h3>
        <div className="flex gap-1 neu-inset rounded-xl p-1">
          {([7, 14, 30] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                periodo === p ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dados} margin={{ top: 24, right: 60, bottom: 28, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />

            {/* Zonas de fundo */}
            <ReferenceArea y1={limiteAFD} y2={CAD} fill="#d1fae5" fillOpacity={0.45} />
            <ReferenceArea y1={0} y2={limiteAFD} fill="#fef3c7" fillOpacity={0.45} />
            <ReferenceArea y1={yMin} y2={0} fill="#fee2e2" fillOpacity={0.5} />
            <ReferenceArea y1={CAD} y2={yMax} fill="#dbeafe" fillOpacity={0.4} />

            {/* Linhas de referência */}
            <ReferenceLine y={CAD} stroke="#1d4ed8" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: `CC ${CAD}mm`, position: "right", fill: "#1d4ed8", fontSize: 10, fontWeight: 700 }} />
            <ReferenceLine y={limiteAFD} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: `AFD ${AFD.toFixed(0)}mm`, position: "right", fill: "#d97706", fontSize: 10, fontWeight: 700 }} />
            <ReferenceLine y={0} stroke="#dc2626" strokeDasharray="5 3" strokeWidth={1.5}
              label={{ value: "PMP", position: "right", fill: "#dc2626", fontSize: 10, fontWeight: 700 }} />

            <XAxis dataKey="dataLabel" axisLine={false} tickLine={false} fontSize={10}
              tick={{ fill: "hsl(var(--muted-foreground))" }} />
            <YAxis domain={[yMin, yMax]} axisLine={false} tickLine={false} fontSize={10}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
              label={{ value: "Arm (mm)", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
            <Tooltip content={<Tip />} />

            {/* Marcadores de chuva (acima) */}
            <Scatter dataKey="chuvaMarker" shape={<ChuvaShape />} isAnimationActive={false} />

            {/* Linha do armazenamento */}
            <Line
              type="monotone"
              dataKey="arm_final"
              stroke="hsl(var(--primary))"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 1.5, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              isAnimationActive
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default HydricTimelineChart;
