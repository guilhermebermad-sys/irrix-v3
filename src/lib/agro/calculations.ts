// IRRIX — Motor de cálculo do balanço hídrico e tempo de irrigação

export interface CalcInputs {
  et0: number;
  chuva: number;
  kc: number;
  eficiencia: number;        // %
  vazaoEmissor: number;      // L/h
  espacEmissores: number;    // m
  espacLinhas: number;       // m
  area: number;              // ha
  cad: number;               // mm
  afd?: number;               // mm (Easily Available Water)
  armInicial: number;        // mm
  tib: number;               // mm/h
  laminaAplicada?: number;   // mm — lâmina realmente aplicada (override do recomendado)
}

export interface CalcResults {
  etc: number;
  laminaLiquida: number;
  laminaBruta: number;
  taxaAplicacao: number;     // mm/h
  emissoresPorHa: number;
  vazaoPorHa: number;        // L/h/ha
  vazaoTotal: number;        // m³/h
  volumeTotal: number;       // m³
  tempoHoras: number;
  tempoFormatado: string;    // hh:mm
  armBruto: number;
  drenagemProfunda: number;
  armFinal: number;
  percAFD: number;
  diagnostico: { tipo: "ok" | "alerta"; mensagem: string; diferenca: number };
  passos: { titulo: string; formula: string; resultado: string }[];
}

const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

export function formatHHMM(h: number): string {
  if (!isFinite(h) || h < 0) return "00:00";
  const horas = Math.floor(h);
  const min = Math.round((h - horas) * 60);
  return `${String(horas).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

export function calcular(i: CalcInputs): CalcResults {
  const efDec = (i.eficiencia || 1) / 100;
  const etc = i.et0 * i.kc;
  const laminaLiquida = Math.max(0, etc - i.chuva);
  const laminaBruta = efDec > 0 ? laminaLiquida / efDec : 0;
  const areaEmissor = i.espacEmissores * i.espacLinhas;
  const taxaAplicacao = areaEmissor > 0 ? i.vazaoEmissor / areaEmissor : 0;
  const emissoresPorHa = areaEmissor > 0 ? 10000 / areaEmissor : 0;
  const vazaoPorHa = emissoresPorHa * i.vazaoEmissor;
  const vazaoTotal = (vazaoPorHa * i.area) / 1000;
  const volumeTotal = laminaBruta * i.area * 10;
  const tempoHoras = vazaoTotal > 0 ? volumeTotal / vazaoTotal : 0;

  const laminaUsada = i.laminaAplicada !== undefined ? Math.max(0, i.laminaAplicada) : laminaBruta;
  const armBruto = i.armInicial + i.chuva + laminaUsada - etc;
  const drenagemProfunda = Math.max(0, armBruto - i.cad);
  const armFinal = Math.min(Math.max(armBruto, 0), i.cad);
  
  // AFD logic: 100% = CC (i.cad), 0% = CC - AFD
  // Formula de exibição: (Armazenamento Atual / AFD) * 100
  // Onde Armazenamento Atual é medido a partir do limite inferior da AFD.
  const afd = i.afd ?? (i.cad * 0.5); 
  const limiteAFD = i.cad - afd;
  // Usamos armBruto para permitir valores > 100% (transbordamento)
  const percAFD = afd > 0 ? ((armBruto - limiteAFD) / afd) * 100 : 0;

  const diff = taxaAplicacao - i.tib;
  const diagnostico = taxaAplicacao > i.tib
    ? { tipo: "alerta" as const, mensagem: "⚠ Risco de Escoamento e Erosão", diferenca: diff }
    : { tipo: "ok" as const, mensagem: "✅ Absorção Adequada", diferenca: -diff };

  const passos = [
    { titulo: "1. ETc", formula: `ET₀ × Kc = ${i.et0} × ${i.kc}`, resultado: `${round(etc)} mm` },
    { titulo: "2. Lâmina Líquida", formula: `max(0, ETc − Chuva) = max(0, ${round(etc)} − ${i.chuva})`, resultado: `${round(laminaLiquida)} mm` },
    { titulo: "3. Lâmina Bruta", formula: `LL ÷ Ef = ${round(laminaLiquida)} ÷ ${efDec}`, resultado: `${round(laminaBruta)} mm` },
    { titulo: "4. Área por emissor", formula: `Ee × El = ${i.espacEmissores} × ${i.espacLinhas}`, resultado: `${round(areaEmissor)} m²` },
    { titulo: "5. Taxa de Aplicação", formula: `Vazão ÷ Área = ${i.vazaoEmissor} ÷ ${round(areaEmissor)}`, resultado: `${round(taxaAplicacao)} mm/h` },
    { titulo: "6. Emissores/ha", formula: `10.000 ÷ ${round(areaEmissor)}`, resultado: `${round(emissoresPorHa, 0)}` },
    { titulo: "7. Vazão/ha", formula: `${round(emissoresPorHa, 0)} × ${i.vazaoEmissor}`, resultado: `${round(vazaoPorHa)} L/h/ha` },
    { titulo: "8. Vazão Total", formula: `${round(vazaoPorHa)} × ${i.area} ÷ 1000`, resultado: `${round(vazaoTotal)} m³/h` },
    { titulo: "9. Volume Total", formula: `LB × Área × 10 = ${round(laminaBruta)} × ${i.area} × 10`, resultado: `${round(volumeTotal)} m³` },
    { titulo: "10. Tempo de Irrigação", formula: `${round(volumeTotal)} ÷ ${round(vazaoTotal)}`, resultado: `${round(tempoHoras)} h (${formatHHMM(tempoHoras)})` },
    { titulo: "11. Arm. Bruto", formula: `${i.armInicial} + ${i.chuva} + ${round(laminaUsada)} − ${round(etc)} (lâmina aplicada)`, resultado: `${round(armBruto)} mm` },
    { titulo: "12. Drenagem Profunda", formula: `max(0, ${round(armBruto)} − ${i.cad})`, resultado: `${round(drenagemProfunda)} mm` },
    { titulo: "13. Arm. Final", formula: `min(max(${round(armBruto)}, 0), ${i.cad})`, resultado: `${round(armFinal)} mm` },
    { titulo: "14. % AFD", formula: `((${round(armFinal)} − ${round(limiteAFD)}) ÷ ${round(afd)}) × 100`, resultado: `${round(percAFD)} %` },
    { titulo: "15. Diagnóstico Solo×Sistema", formula: `Taxa ${round(taxaAplicacao)} vs TiB ${i.tib}`, resultado: diagnostico.mensagem },
    { titulo: "16. Margem", formula: `|Taxa − TiB|`, resultado: `${round(Math.abs(diff))} mm/h` },
  ];

  return {
    etc: round(etc), laminaLiquida: round(laminaLiquida), laminaBruta: round(laminaBruta),
    taxaAplicacao: round(taxaAplicacao), emissoresPorHa: round(emissoresPorHa, 0),
    vazaoPorHa: round(vazaoPorHa), vazaoTotal: round(vazaoTotal), volumeTotal: round(volumeTotal),
    tempoHoras: round(tempoHoras), tempoFormatado: formatHHMM(tempoHoras),
    armBruto: round(armBruto), drenagemProfunda: round(drenagemProfunda),
    armFinal: round(armFinal), percAFD: round(percAFD), diagnostico, passos,
  };
}

export function turnoRega(armFinal: number, cad: number, etcMedia: number, afdInput?: number): { dias: number; data: Date } {
  const afd = afdInput ?? (cad * 0.5);
  const limite = cad - afd;
  const dias = etcMedia > 0 ? Math.max(0, Math.floor((armFinal - limite) / etcMedia)) : 0;
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return { dias, data };
}
