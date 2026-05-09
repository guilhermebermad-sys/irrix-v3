// IRRIX — Tabelas internas de referência

export type SoilType =
  | "Areia" | "Areia Franca" | "Franco-Arenoso" | "Franco"
  | "Franco-Argiloso" | "Argilo-Siltoso" | "Argila";

export const SOIL_TYPES: SoilType[] = [
  "Areia", "Areia Franca", "Franco-Arenoso", "Franco",
  "Franco-Argiloso", "Argilo-Siltoso", "Argila",
];

// Bernardo et al. (2006): TiB (mm/h) e CAD de referência (mm)
export const SOIL_DATA: Record<SoilType, { tib: number; cad: number }> = {
  "Areia":           { tib: 25, cad: 60 },
  "Areia Franca":    { tib: 20, cad: 80 },
  "Franco-Arenoso":  { tib: 13, cad: 100 },
  "Franco":          { tib: 8,  cad: 120 },
  "Franco-Argiloso": { tib: 6,  cad: 140 },
  "Argilo-Siltoso":  { tib: 4,  cad: 150 },
  "Argila":          { tib: 2,  cad: 160 },
};

export const FONTES_AGUA = ["Rio", "Poço", "Represa", "Lago", "Outro"];
export const SISTEMAS_IRRIGACAO = ["Gotejamento", "Microaspersão", "Aspersão", "Pivô Central", "Outro"];

export const CULTURAS = [
  "Soja", "Milho", "Feijão", "Café", "Cana-de-açúcar",
  "Tomate", "Alface", "Morango", "Citros", "Outro",
];

// Estádios fenológicos por cultura
export const ESTADIOS: Record<string, string[]> = {
  "Soja": ["Emergência V1-V3", "Vegetativo V4-V6", "Floração R1-R2", "Enchimento de grãos R3-R5", "Maturação R6-R7"],
  "Milho": ["VE-V3", "V4-V6", "V7-VT", "R1 Espigamento", "R2-R4", "R5-R6"],
  "Feijão": ["V1-V3 Emergência", "V4 Vegetativo", "R5 Pré-floração", "R6 Floração", "R7-R8 Vagens", "R9 Maturação"],
  "Café": ["Vegetativo", "Floração", "Chumbinho/Expansão", "Granação", "Maturação", "Repouso"],
  "Cana-de-açúcar": ["Brotação", "Perfilhamento", "Crescimento", "Maturação"],
  "Tomate": ["Inicial", "Vegetativo", "Floração", "Frutificação", "Maturação"],
  "Alface": ["Inicial", "Crescimento", "Formação de cabeça", "Colheita"],
  "Morango": ["Estabelecimento", "Vegetativo", "Floração", "Frutificação", "Colheita"],
  "Citros": ["Brotação", "Floração", "Crescimento de frutos", "Maturação"],
  "Outro": ["Inicial", "Desenvolvimento", "Médio", "Final"],
};

// Kc por cultura/estádio (FAO-56)
export const KC: Record<string, Record<string, number>> = {
  "Soja": {
    "Emergência V1-V3": 0.40, "Vegetativo V4-V6": 0.85,
    "Floração R1-R2": 1.05, "Enchimento de grãos R3-R5": 1.15, "Maturação R6-R7": 0.50,
  },
  "Milho": {
    "VE-V3": 0.30, "V4-V6": 0.70, "V7-VT": 1.00,
    "R1 Espigamento": 1.20, "R2-R4": 1.15, "R5-R6": 0.60,
  },
  "Feijão": {
    "V1-V3 Emergência": 0.40, "V4 Vegetativo": 0.70, "R5 Pré-floração": 1.00,
    "R6 Floração": 1.15, "R7-R8 Vagens": 1.05, "R9 Maturação": 0.35,
  },
  "Café": {
    "Vegetativo": 0.90, "Floração": 0.95, "Chumbinho/Expansão": 1.05,
    "Granação": 1.05, "Maturação": 0.95, "Repouso": 0.90,
  },
  "Cana-de-açúcar": {
    "Brotação": 0.40, "Perfilhamento": 0.85, "Crescimento": 1.25, "Maturação": 0.75,
  },
  "Tomate": {
    "Inicial": 0.60, "Vegetativo": 0.90, "Floração": 1.10,
    "Frutificação": 1.15, "Maturação": 0.80,
  },
  "Alface": { "Inicial": 0.70, "Crescimento": 0.95, "Formação de cabeça": 1.00, "Colheita": 0.95 },
  "Morango": { "Estabelecimento": 0.40, "Vegetativo": 0.70, "Floração": 0.85, "Frutificação": 0.95, "Colheita": 0.85 },
  "Citros": { "Brotação": 0.65, "Floração": 0.70, "Crescimento de frutos": 0.70, "Maturação": 0.65 },
  "Outro": { "Inicial": 0.50, "Desenvolvimento": 0.85, "Médio": 1.10, "Final": 0.70 },
};

export const ESTADOS_BR = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR",
  "PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

export function getKc(cultura: string, estadio: string): number {
  return KC[cultura]?.[estadio] ?? 1.0;
}

// Fração de disponibilidade hídrica do solo (f) por cultura — FAO-56
export const F_DEPLECAO: Record<string, number> = {
  "Soja": 0.50,
  "Milho": 0.55,
  "Feijão": 0.45,
  "Café": 0.40,
  "Cana-de-açúcar": 0.65,
  "Tomate": 0.40,
  "Alface": 0.30,
  "Morango": 0.20,
  "Citros": 0.50,
  "Outro": 0.50,
};

export function getF(cultura?: string | null): number {
  if (!cultura) return 0.5;
  return F_DEPLECAO[cultura] ?? 0.5;
}

export function getAFD(cad?: number | null, cultura?: string | null): number {
  if (!cad) return 0;
  return Math.round(cad * getF(cultura) * 10) / 10;
}

