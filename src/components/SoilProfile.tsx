import { useEffect, useId, useState } from "react";
import { cn } from "@/lib/utils";

export type SituacaoHidrica =
  | "excesso" | "acima_afd" | "otimo" | "adequado"
  | "atencao" | "critico" | "murcha";

export function classificarSituacao(arm: number, CAD: number, AFD: number): SituacaoHidrica {
  if (CAD <= 0) return "murcha";
  if (arm > CAD) return "excesso";
  const limiteAFD = CAD - AFD;
  if (arm >= limiteAFD) {
    const percAFD = AFD > 0 ? ((arm - limiteAFD) / AFD) * 100 : 0;
    if (arm > CAD * 0.95 && arm <= CAD) return "acima_afd";
    if (percAFD >= 70) return "otimo";
    if (percAFD >= 40) return "adequado";
    if (percAFD >= 20) return "atencao";
    if (percAFD > 0) return "critico";
    return "murcha";
  }
  return arm <= 0 ? "murcha" : "critico";
}

const SIT_COLORS: Record<SituacaoHidrica, { from: string; to: string; solid: string; label: string }> = {
  excesso:   { from: "#60a5fa", to: "#3b82f6", solid: "#3b82f6", label: "Excesso (drenagem)" },
  acima_afd: { from: "#60a5fa", to: "#3b82f6", solid: "#2563eb", label: "Acima do AFD" },
  otimo:     { from: "#34d399", to: "#10b981", solid: "#10b981", label: "Ótimo" },
  adequado:  { from: "#86efac", to: "#22c55e", solid: "#22c55e", label: "Adequado" },
  atencao:   { from: "#fcd34d", to: "#f59e0b", solid: "#f59e0b", label: "Atenção" },
  critico:   { from: "#fca5a5", to: "#ef4444", solid: "#ef4444", label: "Crítico" },
  murcha:    { from: "#fecaca", to: "#991b1b", solid: "#991b1b", label: "Ponto de Murcha" },
};

const INTERPRETACAO: Record<SituacaoHidrica, string> = {
  excesso:   "Solo acima da CC. Drenagem ativa. Risco de lixiviação de nutrientes.",
  acima_afd: "Solo úmido acima do limite AFD. Água disponível. Não irrigar.",
  otimo:     "Faixa ótima do AFD. Planta com pleno acesso à água.",
  adequado:  "Faixa adequada. Monitorar e planejar próxima irrigação.",
  atencao:   "Abaixo de 40% do AFD. Planta sob restrição hídrica leve.",
  critico:   "Estresse hídrico severo. Irrigar imediatamente!",
  murcha:    "Ponto de Murcha atingido. Água indisponível para a planta.",
};

interface SoilProfileProps {
  armFinal: number;
  CAD: number;
  AFD: number;
  fatorDeplecao?: number;
  cultura?: string | null;
  estadio?: string | null;
  situacaoHidrica?: SituacaoHidrica;
  width?: number;
  height?: number;
  compact?: boolean;
  className?: string;
  /** legacy */
  percentage?: number;
  arm?: number;
  cad?: number;
  afd?: number;
}

/** Desenho da planta acima do solo, varia por cultura */
function PlantaCultura({ cultura, cx, ySolo }: { cultura?: string | null; cx: number; ySolo: number }) {
  const c = (cultura ?? "").toLowerCase();
  const stem = "#65a30d";
  const leaf = "#16a34a";
  const leafDark = "#15803d";

  if (c.includes("milho") || c.includes("cana")) {
    // folhas longas pendentes
    return (
      <g>
        <line x1={cx} y1={ySolo} x2={cx} y2={ySolo - 50} stroke={stem} strokeWidth={2.5} strokeLinecap="round" />
        <path d={`M${cx},${ySolo - 20} Q${cx - 25},${ySolo - 35} ${cx - 35},${ySolo - 10}`} stroke={leaf} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d={`M${cx},${ySolo - 30} Q${cx + 25},${ySolo - 45} ${cx + 35},${ySolo - 15}`} stroke={leaf} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d={`M${cx},${ySolo - 42} Q${cx - 18},${ySolo - 55} ${cx - 28},${ySolo - 38}`} stroke={leafDark} strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <path d={`M${cx},${ySolo - 48} Q${cx + 18},${ySolo - 58} ${cx + 26},${ySolo - 42}`} stroke={leafDark} strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (c.includes("café") || c.includes("cafe") || c.includes("citros")) {
    // arbusto com folhas redondas
    return (
      <g>
        <line x1={cx} y1={ySolo} x2={cx} y2={ySolo - 30} stroke="#78350f" strokeWidth={2.5} strokeLinecap="round" />
        <ellipse cx={cx - 14} cy={ySolo - 32} rx={9} ry={7} fill={leaf} />
        <ellipse cx={cx + 14} cy={ySolo - 32} rx={9} ry={7} fill={leaf} />
        <ellipse cx={cx} cy={ySolo - 45} rx={11} ry={8} fill={leafDark} />
        <ellipse cx={cx - 8} cy={ySolo - 50} rx={7} ry={6} fill={leaf} />
        <ellipse cx={cx + 8} cy={ySolo - 50} rx={7} ry={6} fill={leaf} />
      </g>
    );
  }
  // genérica (soja, feijão, alface, default)
  return (
    <g>
      <line x1={cx} y1={ySolo} x2={cx} y2={ySolo - 45} stroke={stem} strokeWidth={2.2} strokeLinecap="round" />
      <ellipse cx={cx - 11} cy={ySolo - 18} rx={8} ry={4.5} fill={leaf} transform={`rotate(-25 ${cx - 11} ${ySolo - 18})`} />
      <ellipse cx={cx + 11} cy={ySolo - 18} rx={8} ry={4.5} fill={leaf} transform={`rotate(25 ${cx + 11} ${ySolo - 18})`} />
      <ellipse cx={cx - 13} cy={ySolo - 32} rx={9} ry={5} fill={leafDark} transform={`rotate(-25 ${cx - 13} ${ySolo - 32})`} />
      <ellipse cx={cx + 13} cy={ySolo - 32} rx={9} ry={5} fill={leafDark} transform={`rotate(25 ${cx + 13} ${ySolo - 32})`} />
      <ellipse cx={cx} cy={ySolo - 48} rx={10} ry={6} fill={leaf} />
    </g>
  );
}

export function SoilProfile(props: SoilProfileProps) {
  const armFinal = props.armFinal ?? props.arm ?? 0;
  const CAD = (props.CAD ?? props.cad ?? 100) || 100;
  const AFD = props.AFD ?? props.afd ?? 0;
  const { cultura, estadio, compact = false, className } = props;
  const fator = props.fatorDeplecao ?? (CAD > 0 ? AFD / CAD : 0.5);
  const width = props.width ?? (compact ? 80 : 240);
  const height = props.height ?? (compact ? 130 : 360);

  const safeArm = isNaN(armFinal) ? 0 : armFinal;
  const limiteAFD = CAD - AFD;
  const percAFD = AFD > 0 ? Math.max(0, ((safeArm - limiteAFD) / AFD) * 100) : 0;
  const situacao = props.situacaoHidrica ?? classificarSituacao(safeArm, CAD, AFD);
  const cores = SIT_COLORS[situacao];

  // ===== Geometria (viewBox 240×360) =====
  // Acima do solo: 0–60. Solo: 60–280. PMP em 240, base hachura 240–280.
  const yPlanta = 0;
  const ySolo = 60;
  const yCC = 80;
  const alturaDisponivel = 160;
  const yLimiteAFD = yCC + (AFD / CAD) * alturaDisponivel;
  const yPMP = yCC + alturaDisponivel; // 240
  const yRocha = yPMP + 40;            // 280

  // Coluna do solo (área do perfil)
  const xSolo = 50;
  const wSolo = 150;
  const cx = xSolo + wSolo / 2;

  const yNivelTarget =
    safeArm >= CAD ? ySolo + 2
    : safeArm <= 0 ? yPMP
    : yPMP - (safeArm / CAD) * alturaDisponivel;

  const [yNivel, setYNivel] = useState(yPMP);
  useEffect(() => {
    const id = requestAnimationFrame(() => setYNivel(yNivelTarget));
    return () => cancelAnimationFrame(id);
  }, [yNivelTarget]);

  const uid = useId().replace(/:/g, "");
  const pulseClass = (situacao === "critico" || situacao === "murcha") ? "soil-pulse" : "";

  // Sistema radicular (curvas Bézier saindo da base do caule)
  const raizes = [
    { d: `M${cx},${ySolo} C${cx - 10},${ySolo + 30} ${cx - 35},${ySolo + 60} ${cx - 45},${yPMP - 10}` },
    { d: `M${cx},${ySolo} C${cx - 4},${ySolo + 40} ${cx - 18},${ySolo + 90} ${cx - 22},${yPMP - 5}` },
    { d: `M${cx},${ySolo} C${cx},${ySolo + 50} ${cx - 5},${ySolo + 110} ${cx},${yPMP}` },
    { d: `M${cx},${ySolo} C${cx + 4},${ySolo + 40} ${cx + 18},${ySolo + 90} ${cx + 22},${yPMP - 5}` },
    { d: `M${cx},${ySolo} C${cx + 10},${ySolo + 30} ${cx + 35},${ySolo + 60} ${cx + 45},${yPMP - 10}` },
    // raízes secundárias finas
    { d: `M${cx},${ySolo + 20} C${cx - 20},${ySolo + 40} ${cx - 50},${ySolo + 50} ${cx - 60},${ySolo + 80}`, fina: true },
    { d: `M${cx},${ySolo + 20} C${cx + 20},${ySolo + 40} ${cx + 50},${ySolo + 50} ${cx + 60},${ySolo + 80}`, fina: true },
  ];

  return (
    <div className={cn("flex flex-col items-center gap-3 select-none", className)}>
      <svg viewBox="0 0 240 360" width={width} height={height} className={cn("overflow-visible", pulseClass)}>
        <defs>
          <pattern id={`hatch-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#475569" strokeWidth="1.6" strokeOpacity="0.55" />
          </pattern>
          <linearGradient id={`afd-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id={`stress-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id={`water-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cores.from} />
            <stop offset="100%" stopColor={cores.to} />
          </linearGradient>
          {/* Clip para raízes acima/abaixo do nível d'água */}
          <clipPath id={`above-${uid}`}>
            <rect x={0} y={0} width={240} height={yNivel} />
          </clipPath>
          <clipPath id={`below-${uid}`}>
            <rect x={0} y={yNivel} width={240} height={360 - yNivel} />
          </clipPath>
          {/* Clip para conter ondas dentro do perfil do solo */}
          <clipPath id={`soil-${uid}`}>
            <rect x={xSolo + 1} y={ySolo} width={wSolo - 2} height={yRocha - ySolo} />
          </clipPath>
        </defs>

        {/* Planta acima do solo */}
        {!compact && <PlantaCultura cultura={cultura} cx={cx} ySolo={ySolo} />}
        {compact && (
          <g>
            <line x1={cx} y1={ySolo} x2={cx} y2={ySolo - 18} stroke="#65a30d" strokeWidth={1.5} />
            <ellipse cx={cx - 5} cy={ySolo - 18} rx={4} ry={2.5} fill="#16a34a" />
            <ellipse cx={cx + 5} cy={ySolo - 18} rx={4} ry={2.5} fill="#16a34a" />
          </g>
        )}

        {/* Fundo do perfil */}
        <rect x={xSolo} y={ySolo} width={wSolo} height={yRocha - ySolo} fill="#f1f5f9" stroke="#c3c9d4" strokeWidth={1.2} rx={3} />

        {/* Zona excesso (acima CC) */}
        <rect x={xSolo} y={ySolo} width={wSolo} height={yCC - ySolo} fill="#dbeafe" opacity={0.55} />

        {/* Zona AFD */}
        <rect x={xSolo} y={yCC} width={wSolo} height={yLimiteAFD - yCC} fill={`url(#afd-${uid})`} opacity={0.55} />

        {/* Zona Estresse */}
        <rect x={xSolo} y={yLimiteAFD} width={wSolo} height={yPMP - yLimiteAFD} fill={`url(#stress-${uid})`} opacity={0.6} />

        {/* Indisponível (hachura cinza) */}
        <rect x={xSolo} y={yPMP} width={wSolo} height={yRocha - yPMP} fill={`url(#hatch-${uid})`} />
        {!compact && (
          <text x={cx} y={yPMP + 24} textAnchor="middle" fontSize={9} fontWeight={700} fill="#334155" opacity={0.75}>
            Indisponível
          </text>
        )}

        {/* Superfície ondulada de solo */}
        <path
          d={`M${xSolo},${ySolo} Q${xSolo + 25},${ySolo - 3} ${xSolo + 50},${ySolo} T${xSolo + 100},${ySolo} T${xSolo + 150},${ySolo} L${xSolo + wSolo},${ySolo + 4} L${xSolo},${ySolo + 4} Z`}
          fill="#92400e" opacity={0.85}
        />

        {/* Raízes — secas (acima do nível) */}
        <g clipPath={`url(#above-${uid})`}>
          {raizes.map((r, i) => (
            <path key={`a-${i}`} d={r.d} stroke="#a16207" strokeWidth={r.fina ? 0.6 : 1.1} fill="none" opacity={0.75} strokeLinecap="round" />
          ))}
        </g>
        {/* Raízes — submersas (abaixo do nível) */}
        <g clipPath={`url(#below-${uid})`}>
          {raizes.map((r, i) => (
            <path key={`b-${i}`} d={r.d} stroke="#0d9488" strokeWidth={r.fina ? 0.6 : 1.1} fill="none" opacity={0.7} strokeLinecap="round" />
          ))}
        </g>

        {/* Nível d'água */}
        <g style={{ transition: "all 800ms ease-in-out" }}>
          <rect
            x={xSolo + 1}
            y={yNivel}
            width={wSolo - 2}
            height={Math.max(0, yPMP - yNivel)}
            fill={`url(#water-${uid})`}
            opacity={0.45}
            style={{ transition: "y 800ms ease-in-out, height 800ms ease-in-out" }}
          />
          {/* Onda animada */}
          <g style={{ transform: `translateY(${yNivel - yPMP}px)`, transition: "transform 800ms ease-in-out" }}>
            <path
              d={`M${xSolo - 150},${yPMP} Q${xSolo - 115},${yPMP - 3} ${xSolo - 80},${yPMP} Q${xSolo - 45},${yPMP + 3} ${xSolo - 10},${yPMP} Q${xSolo + 25},${yPMP - 3} ${xSolo + 60},${yPMP} Q${xSolo + 95},${yPMP + 3} ${xSolo + 130},${yPMP} Q${xSolo + 165},${yPMP - 3} ${xSolo + 200},${yPMP} L${xSolo + 200},${yPMP + 3} L${xSolo - 150},${yPMP + 3} Z`}
              fill={cores.solid}
              opacity={0.9}
            >
              <animateTransform attributeName="transform" type="translate" from="-150 0" to="0 0" dur="3s" repeatCount="indefinite" />
            </path>
          </g>
        </g>

        {/* Linhas de referência */}
        <line x1={xSolo - 4} x2={xSolo + wSolo + 4} y1={yCC} y2={yCC} stroke="#1d4ed8" strokeWidth={1.4} strokeDasharray="5,3" opacity={0.75} />
        <line x1={xSolo - 4} x2={xSolo + wSolo + 4} y1={yLimiteAFD} y2={yLimiteAFD} stroke="#f59e0b" strokeWidth={1.4} strokeDasharray="5,3" opacity={0.75} />
        <line x1={xSolo - 4} x2={xSolo + wSolo + 4} y1={yPMP} y2={yPMP} stroke="#dc2626" strokeWidth={1.4} strokeDasharray="5,3" opacity={0.75} />

        {/* Labels CC / AFD / PMP à direita */}
        {!compact && (
          <g>
            <text x={xSolo + wSolo + 8} y={yCC + 3} fontSize={9} fontWeight={700} fill="#1d4ed8">CC</text>
            <text x={xSolo + wSolo + 8} y={yCC + 13} fontSize={7} fill="#64748b">{CAD}mm</text>

            <text x={xSolo + wSolo + 8} y={yLimiteAFD + 3} fontSize={9} fontWeight={700} fill="#d97706">AFD</text>
            <text x={xSolo + wSolo + 8} y={yLimiteAFD + 13} fontSize={7} fill="#64748b">{AFD.toFixed(0)}mm</text>

            <text x={xSolo + wSolo + 8} y={yPMP + 3} fontSize={9} fontWeight={700} fill="#dc2626">PMP</text>
          </g>
        )}

        {/* Bracket lateral esquerdo: CAD (externo) e AFD (interno) */}
        {!compact && (
          <g stroke="#475569" strokeWidth={1.2} fill="none">
            {/* CAD bracket — de yCC a yPMP, x=8 */}
            <path d={`M14,${yCC} L8,${yCC} L8,${yPMP} L14,${yPMP}`} />
            <text
              x={4} y={(yCC + yPMP) / 2}
              fontSize={9} fontWeight={700} fill="#1e293b"
              transform={`rotate(-90 4 ${(yCC + yPMP) / 2})`}
              textAnchor="middle"
            >
              CAD {CAD}mm
            </text>
            {/* AFD bracket — de yCC a yLimiteAFD, x=30 */}
            <path d={`M36,${yCC} L30,${yCC} L30,${yLimiteAFD} L36,${yLimiteAFD}`} stroke="#10b981" />
            <text
              x={26} y={(yCC + yLimiteAFD) / 2}
              fontSize={8} fontWeight={700} fill="#10b981"
              transform={`rotate(-90 26 ${(yCC + yLimiteAFD) / 2})`}
              textAnchor="middle"
            >
              AFD {AFD.toFixed(0)}mm
            </text>
          </g>
        )}

        {/* Badge nível atual */}
        {!compact && (
          <g style={{ transition: "all 800ms ease-in-out" }}>
            <rect x={xSolo + wSolo + 30} y={yNivel - 9} width={36} height={18} rx={4} fill={cores.solid} />
            <text x={xSolo + wSolo + 48} y={yNivel + 4} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
              {safeArm.toFixed(0)}mm
            </text>
            <line x1={xSolo + wSolo} x2={xSolo + wSolo + 30} y1={yNivel} y2={yNivel} stroke={cores.solid} strokeWidth={1.4} strokeDasharray="2,2" />
          </g>
        )}
      </svg>

      {compact ? (
        <div
          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
          style={{ background: cores.solid }}
        >
          {percAFD.toFixed(0)}% AFD
        </div>
      ) : (
        <div className="neu-sm rounded-2xl px-4 py-3 w-full max-w-[260px] text-center space-y-2">
          <div
            className="inline-block px-3 py-1 rounded-full text-[11px] font-bold text-white"
            style={{ background: cores.solid }}
          >
            {cores.label}
          </div>
          <div className="text-xs text-muted-foreground">
            <div>
              <strong className="text-foreground">{safeArm.toFixed(1)}</strong> mm de{" "}
              <strong className="text-foreground">{CAD}</strong> mm (CAD)
            </div>
            <div>
              %AFD: <strong className="text-foreground">{percAFD.toFixed(0)}%</strong> · AFD ={" "}
              {fator.toFixed(2)} × {CAD} = <strong className="text-foreground">{AFD.toFixed(1)}</strong> mm
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground italic leading-snug">
            {INTERPRETACAO[situacao]}
          </div>
          {(cultura || estadio) && (
            <div className="text-[10px] text-muted-foreground/80 uppercase tracking-wider font-bold">
              {cultura}{estadio ? ` · ${estadio}` : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SoilWaterBarProps {
  armFinal: number;
  CAD: number;
  AFD: number;
  showLabels?: boolean;
  className?: string;
}

export function SoilWaterBar({ armFinal, CAD, AFD, showLabels = true, className }: SoilWaterBarProps) {
  const safeArm = isNaN(armFinal) ? 0 : armFinal;
  const situacao = classificarSituacao(safeArm, CAD, AFD);
  const cores = SIT_COLORS[situacao];

  const baseW = 85;
  const stressW = ((CAD - AFD) / CAD) * baseW;
  const afdW = (AFD / CAD) * baseW;
  const excessW = 15;

  const markerPos = Math.min(100, Math.max(0, (safeArm / CAD) * baseW + (safeArm > CAD ? Math.min(15, ((safeArm - CAD) / CAD) * 100) : 0)));

  return (
    <div className={cn("w-full", className)}>
      <div className="relative h-3 rounded-full overflow-hidden flex" title={`${safeArm.toFixed(1)} mm`}>
        <div style={{ width: `${stressW}%`, background: "linear-gradient(90deg,#fef3c7,#fed7aa)" }} />
        <div style={{ width: `${afdW}%`, background: "linear-gradient(90deg,#d1fae5,#a7f3d0)" }} />
        <div style={{ width: `${excessW}%`, background: "#dbeafe" }} />
      </div>
      <div className="relative h-3 -mt-1">
        <div
          className="absolute -translate-x-1/2 transition-all duration-700"
          style={{ left: `${markerPos}%` }}
          title={`${safeArm.toFixed(1)} mm`}
        >
          <div style={{ color: cores.solid }} className="text-[10px] leading-none">▼</div>
        </div>
      </div>
      {showLabels && (
        <div className="flex justify-between text-[9px] text-muted-foreground mt-0.5">
          <span>PMP</span>
          <span>AFD ({AFD.toFixed(0)}mm)</span>
          <span>CC={CAD}mm</span>
          <span>Excesso</span>
        </div>
      )}
    </div>
  );
}

export default SoilProfile;
