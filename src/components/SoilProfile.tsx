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

const SIT_COLORS: Record<SituacaoHidrica, { solid: string; label: string; glow: string }> = {
  excesso:   { solid: "#3b82f6", glow: "#60a5fa", label: "Excesso (drenagem)" },
  acima_afd: { solid: "#2563eb", glow: "#60a5fa", label: "Acima do AFD" },
  otimo:     { solid: "#10b981", glow: "#34d399", label: "Ótimo" },
  adequado:  { solid: "#22c55e", glow: "#86efac", label: "Adequado" },
  atencao:   { solid: "#f59e0b", glow: "#fbbf24", label: "Atenção" },
  critico:   { solid: "#ef4444", glow: "#f87171", label: "Crítico" },
  murcha:    { solid: "#991b1b", glow: "#dc2626", label: "Ponto de Murcha" },
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

/** Soja em floração R1-R2 — silhueta detalhada acima do solo */
function PlantaSoja({ cx, ySolo }: { cx: number; ySolo: number }) {
  const stem = "#4d7c0f";
  const leaf = "#16a34a";
  const leafDark = "#14532d";
  const flower = "#a78bfa";

  const trifoliada = (px: number, py: number, scale = 1, rot = 0) => (
    <g transform={`translate(${px} ${py}) scale(${scale}) rotate(${rot})`}>
      <ellipse cx={-7} cy={-2} rx={6} ry={3.5} fill={leaf} transform="rotate(-30)" />
      <ellipse cx={7} cy={-2} rx={6} ry={3.5} fill={leaf} transform="rotate(30)" />
      <ellipse cx={0} cy={-9} rx={6.5} ry={4} fill={leafDark} />
      {/* nervura */}
      <line x1={-7} y1={-2} x2={0} y2={2} stroke={leafDark} strokeWidth={0.4} opacity={0.6} />
      <line x1={7} y1={-2} x2={0} y2={2} stroke={leafDark} strokeWidth={0.4} opacity={0.6} />
      <line x1={0} y1={-9} x2={0} y2={2} stroke={leafDark} strokeWidth={0.4} opacity={0.6} />
    </g>
  );

  return (
    <g>
      {/* caule principal */}
      <path d={`M${cx},${ySolo} C${cx + 1},${ySolo - 18} ${cx - 1},${ySolo - 38} ${cx},${ySolo - 56}`}
        stroke={stem} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      {/* ramos */}
      <path d={`M${cx},${ySolo - 18} Q${cx - 8},${ySolo - 22} ${cx - 14},${ySolo - 30}`}
        stroke={stem} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <path d={`M${cx},${ySolo - 30} Q${cx + 9},${ySolo - 34} ${cx + 16},${ySolo - 42}`}
        stroke={stem} strokeWidth={1.2} fill="none" strokeLinecap="round" />
      <path d={`M${cx},${ySolo - 44} Q${cx - 7},${ySolo - 48} ${cx - 13},${ySolo - 54}`}
        stroke={stem} strokeWidth={1.1} fill="none" strokeLinecap="round" />

      {/* folhas trifoliadas */}
      {trifoliada(cx - 14, ySolo - 30, 0.95, -20)}
      {trifoliada(cx + 16, ySolo - 42, 1.0, 25)}
      {trifoliada(cx - 13, ySolo - 54, 0.85, -15)}
      {trifoliada(cx + 4, ySolo - 58, 1.1, 5)}

      {/* flores R1-R2 (pequenas, lilás) */}
      <circle cx={cx - 5} cy={ySolo - 26} r={1.4} fill={flower} />
      <circle cx={cx + 6} cy={ySolo - 38} r={1.4} fill={flower} />
      <circle cx={cx - 4} cy={ySolo - 48} r={1.2} fill={flower} />
      <circle cx={cx + 2} cy={ySolo - 52} r={1.2} fill={flower} />
    </g>
  );
}

export function SoilProfile(props: SoilProfileProps) {
  const armFinal = props.armFinal ?? props.arm ?? 0;
  const CAD = (props.CAD ?? props.cad ?? 100) || 100;
  const AFD = props.AFD ?? props.afd ?? 0;
  const { cultura, estadio, compact = false, className } = props;
  const width = props.width ?? (compact ? 80 : 280);
  const height = props.height ?? (compact ? 130 : 420);

  const safeArm = isNaN(armFinal) ? 0 : armFinal;
  const limiteAFD = CAD - AFD;
  const percAFD = AFD > 0 ? Math.max(0, ((safeArm - limiteAFD) / AFD) * 100) : 0;
  const situacao = props.situacaoHidrica ?? classificarSituacao(safeArm, CAD, AFD);
  const cores = SIT_COLORS[situacao];

  // Geometria viewBox 280×420
  const ySolo = 90;
  const yCC = 110;
  const alturaDisponivel = 200;
  const yLimiteAFD = yCC + (AFD / CAD) * alturaDisponivel;
  const yPMP = yCC + alturaDisponivel; // 310
  const yRocha = yPMP + 50; // 360

  const xSolo = 70;
  const wSolo = 160;
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

  // Sistema radicular (pivotante de soja)
  const raizesPrincipais = [
    `M${cx},${ySolo} C${cx - 2},${ySolo + 60} ${cx + 2},${ySolo + 130} ${cx},${yPMP - 5}`,
    `M${cx},${ySolo} C${cx - 14},${ySolo + 40} ${cx - 30},${ySolo + 90} ${cx - 36},${yPMP - 20}`,
    `M${cx},${ySolo} C${cx + 14},${ySolo + 40} ${cx + 30},${ySolo + 90} ${cx + 36},${yPMP - 20}`,
    `M${cx},${ySolo} C${cx - 8},${ySolo + 30} ${cx - 22},${ySolo + 70} ${cx - 28},${ySolo + 100}`,
    `M${cx},${ySolo} C${cx + 8},${ySolo + 30} ${cx + 22},${ySolo + 70} ${cx + 28},${ySolo + 100}`,
  ];
  const radicelas = [
    `M${cx - 18},${ySolo + 50} q-8,4 -14,12`,
    `M${cx + 18},${ySolo + 60} q8,4 14,12`,
    `M${cx - 26},${ySolo + 90} q-10,2 -16,8`,
    `M${cx + 26},${ySolo + 100} q10,2 16,8`,
    `M${cx - 8},${ySolo + 140} q-6,4 -10,10`,
    `M${cx + 8},${ySolo + 150} q6,4 10,10`,
    `M${cx},${ySolo + 180} q-4,6 -8,10`,
  ];

  // Rachaduras na zona PMP
  const rachaduras = [
    `M${xSolo + 20},${yPMP + 8} l4,12 l-2,8`,
    `M${xSolo + 60},${yPMP + 12} l-3,10 l5,10`,
    `M${xSolo + 100},${yPMP + 6} l2,14 l-4,12`,
    `M${xSolo + 130},${yPMP + 14} l3,8 l-2,12`,
  ];

  return (
    <div className={cn("flex flex-col items-center gap-2 select-none", className)}>
      <svg viewBox="0 0 280 420" width={width} height={height} className="overflow-visible">
        <defs>
          {/* Texturas */}
          <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
            <feColorMatrix values="0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0.35 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>
          <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradientes de zonas */}
          <linearGradient id={`solo-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#92633a" />
            <stop offset="50%" stopColor="#7a4f2c" />
            <stop offset="100%" stopColor="#5a3820" />
          </linearGradient>
          <linearGradient id={`cc-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.65" />
          </linearGradient>
          <linearGradient id={`afd-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#86efac" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#fcd34d" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fdba74" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={`pmp-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c2410c" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id={`water-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={cores.glow} stopOpacity="0.55" />
            <stop offset="100%" stopColor={cores.solid} stopOpacity="0.35" />
          </linearGradient>

          <pattern id={`hatch-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="#64748b" strokeWidth="1.4" strokeOpacity="0.45" />
          </pattern>

          <clipPath id={`soil-${uid}`}>
            <rect x={xSolo} y={ySolo} width={wSolo} height={yRocha - ySolo} rx={6} />
          </clipPath>
          <clipPath id={`above-${uid}`}>
            <rect x={0} y={0} width={280} height={yNivel} />
          </clipPath>
          <clipPath id={`below-${uid}`}>
            <rect x={0} y={yNivel} width={280} height={420 - yNivel} />
          </clipPath>
          <clipPath id={`waterband-${uid}`}>
            <rect x={xSolo + 1} y={ySolo} width={wSolo - 2} height={yRocha - ySolo} />
          </clipPath>
        </defs>

        <title>Perfil hídrico do solo — {safeArm.toFixed(1)} mm de {CAD} mm</title>

        {/* Planta de soja R1-R2 */}
        {!compact && <PlantaSoja cx={cx} ySolo={ySolo} />}
        {compact && (
          <g>
            <line x1={cx} y1={ySolo} x2={cx} y2={ySolo - 18} stroke="#65a30d" strokeWidth={1.5} />
            <ellipse cx={cx - 5} cy={ySolo - 18} rx={4} ry={2.5} fill="#16a34a" />
            <ellipse cx={cx + 5} cy={ySolo - 18} rx={4} ry={2.5} fill="#16a34a" />
          </g>
        )}

        {/* Caixa do perfil */}
        <g clipPath={`url(#soil-${uid})`}>
          {/* Solo base */}
          <rect x={xSolo} y={ySolo} width={wSolo} height={yRocha - ySolo} fill={`url(#solo-${uid})`} />
          {/* Granulação de terra */}
          <rect x={xSolo} y={ySolo} width={wSolo} height={yRocha - ySolo} filter={`url(#grain-${uid})`} opacity={0.55} />

          {/* Zona CC (azul claro) */}
          <rect x={xSolo} y={ySolo} width={wSolo} height={yCC - ySolo} fill={`url(#cc-${uid})`} />
          {/* Zona AFD */}
          <rect x={xSolo} y={yCC} width={wSolo} height={yLimiteAFD - yCC} fill={`url(#afd-${uid})`} />
          {/* Zona PMP */}
          <rect x={xSolo} y={yLimiteAFD} width={wSolo} height={yPMP - yLimiteAFD} fill={`url(#pmp-${uid})`} />
          {/* Indisponível com hachura */}
          <rect x={xSolo} y={yPMP} width={wSolo} height={yRocha - yPMP} fill="#1f2937" opacity={0.85} />
          <rect x={xSolo} y={yPMP} width={wSolo} height={yRocha - yPMP} fill={`url(#hatch-${uid})`} />

          {/* Rachaduras na zona seca */}
          {rachaduras.map((d, i) => (
            <path key={`r-${i}`} d={d} stroke="#fef3c7" strokeWidth={0.5} fill="none" opacity={0.35} strokeLinecap="round" />
          ))}

          {/* Pedrinhas espalhadas */}
          {Array.from({ length: 18 }).map((_, i) => {
            const px = xSolo + 8 + ((i * 31) % (wSolo - 16));
            const py = ySolo + 25 + ((i * 47) % (yRocha - ySolo - 30));
            const r = 0.6 + (i % 3) * 0.5;
            return <circle key={`p-${i}`} cx={px} cy={py} r={r} fill="#3f2818" opacity={0.6} />;
          })}

          {/* Superfície ondulada de solo (linha) */}
          <path
            d={`M${xSolo},${ySolo + 1} Q${xSolo + 25},${ySolo - 2} ${xSolo + 50},${ySolo + 1} T${xSolo + 100},${ySolo + 1} T${xSolo + 150},${ySolo + 1} L${xSolo + wSolo},${ySolo + 3} L${xSolo + wSolo},${ySolo + 5} L${xSolo},${ySolo + 5} Z`}
            fill="#3f2818" opacity={0.7}
          />

          {/* Raízes — secas (acima do nível) */}
          <g clipPath={`url(#above-${uid})`}>
            {raizesPrincipais.map((d, i) => (
              <path key={`ra-${i}`} d={d} stroke="#a16207" strokeWidth={1.1} fill="none" opacity={0.7} strokeLinecap="round" />
            ))}
            {radicelas.map((d, i) => (
              <path key={`rda-${i}`} d={d} stroke="#92400e" strokeWidth={0.5} fill="none" opacity={0.6} strokeLinecap="round" />
            ))}
          </g>
          {/* Raízes — molhadas (abaixo do nível) */}
          <g clipPath={`url(#below-${uid})`}>
            {raizesPrincipais.map((d, i) => (
              <path key={`rb-${i}`} d={d} stroke="#0d9488" strokeWidth={1.1} fill="none" opacity={0.75} strokeLinecap="round" />
            ))}
            {radicelas.map((d, i) => (
              <path key={`rdb-${i}`} d={d} stroke="#0f766e" strokeWidth={0.5} fill="none" opacity={0.65} strokeLinecap="round" />
            ))}
          </g>

          {/* Banda de água (preenchimento abaixo do nível atual) */}
          <g clipPath={`url(#waterband-${uid})`} style={{ transition: "all 800ms ease-in-out" }}>
            <rect
              x={xSolo}
              y={yNivel}
              width={wSolo}
              height={Math.max(0, yPMP - yNivel)}
              fill={`url(#water-${uid})`}
              style={{ transition: "y 800ms ease-in-out, height 800ms ease-in-out" }}
            />
          </g>
        </g>

        {/* Borda do perfil */}
        <rect x={xSolo} y={ySolo} width={wSolo} height={yRocha - ySolo} fill="none" stroke="#0b0c10" strokeWidth={1.5} rx={6} opacity={0.6} />

        {/* Linha luminosa do nível d'água (faixa fina sobre o perfil) */}
        <g style={{ transition: "all 800ms ease-in-out" }}>
          <line
            x1={xSolo} x2={xSolo + wSolo}
            y1={yNivel} y2={yNivel}
            stroke={cores.glow}
            strokeWidth={2}
            filter={`url(#glow-${uid})`}
            style={{ transition: "y1 800ms ease-in-out, y2 800ms ease-in-out" }}
          />
          {/* Bolha com valor */}
          {!compact && (
            <g style={{ transition: "transform 800ms ease-in-out" }} transform={`translate(${xSolo + wSolo + 6} ${yNivel})`}>
              <rect x={0} y={-11} rx={11} ry={11} width={56} height={22} fill={cores.solid} />
              <rect x={0} y={-11} rx={11} ry={11} width={56} height={22} fill="none" stroke={cores.glow} strokeWidth={1} opacity={0.8} />
              <text x={28} y={4} textAnchor="middle" fontSize={11} fontWeight={800} fill="#fff">
                {safeArm.toFixed(1)}mm
              </text>
            </g>
          )}
        </g>

        {/* Marcadores laterais à esquerda — chips coloridos */}
        {!compact && (
          <g>
            {/* CC */}
            <g transform={`translate(0 ${yCC})`}>
              <line x1={50} x2={xSolo} y1={0} y2={0} stroke="#3b82f6" strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
              <rect x={4} y={-9} rx={4} ry={4} width={50} height={18} fill="#1e3a8a" />
              <text x={29} y={4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#bfdbfe">CC {CAD}mm</text>
            </g>
            {/* AFD */}
            <g transform={`translate(0 ${yLimiteAFD})`}>
              <line x1={50} x2={xSolo} y1={0} y2={0} stroke="#10b981" strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
              <rect x={4} y={-9} rx={4} ry={4} width={50} height={18} fill="#064e3b" />
              <text x={29} y={4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#a7f3d0">AFD {AFD.toFixed(0)}mm</text>
            </g>
            {/* PMP */}
            <g transform={`translate(0 ${yPMP})`}>
              <line x1={50} x2={xSolo} y1={0} y2={0} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,2" opacity={0.7} />
              <rect x={4} y={-9} rx={4} ry={4} width={50} height={18} fill="#7f1d1d" />
              <text x={29} y={4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fecaca">PMP</text>
            </g>
          </g>
        )}
      </svg>
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
