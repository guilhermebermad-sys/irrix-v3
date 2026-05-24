import { format, parseISO, subDays } from "date-fns";

export interface DadosClimaticos {
  sucesso: true;
  fonte: "NASA POWER" | "Open-Meteo";
  metodo: string;
  et0: number;
  chuva: number;
  tmax: number;
  tmin: number;
  tmed: number;
  umidade?: number;
  vento?: number;
  radiacao?: number;
  ra?: number;
  J?: number;
  coordenadas: { latitude: number; longitude: number };
  data: string; // dd/MM/yyyy
  dataIso: string; // yyyy-MM-dd
  obtidoEm: string; // ISO timestamp
}

export interface ErroClimatico {
  sucesso: false;
  erro: string;
}

export type ResultadoClima = DadosClimaticos | ErroClimatico;

export interface PrevisaoDia {
  data: string; // dd/MM
  dataIso: string; // yyyy-MM-dd
  diaSemana: string;
  et0: number;
  chuva: number;
  tmax: number;
  tmin: number;
  weathercode: number;
  emoji: string;
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ───────── Helpers ─────────
export function getDayOfYear(dateStr: string): number {
  const date = new Date(dateStr);
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function calcularRa(latitude: number, dayOfYear: number): number {
  const phi = (Math.PI / 180) * latitude;
  const J = dayOfYear;
  const dr = 1 + 0.033 * Math.cos((2 * Math.PI / 365) * J);
  const delta = 0.409 * Math.sin((2 * Math.PI / 365) * J - 1.39);
  const ws = Math.acos(-Math.tan(phi) * Math.tan(delta));
  return (24 * 60 / Math.PI) * 0.0820 * dr * (
    ws * Math.sin(phi) * Math.sin(delta) +
    Math.cos(phi) * Math.cos(delta) * Math.sin(ws)
  );
}

export function calcularET0Hargreaves(
  tmax: number, tmin: number, tmed: number, latitude: number, dateStr: string
): number {
  const J = getDayOfYear(dateStr);
  const Ra = calcularRa(latitude, J);
  const et0 = 0.0023 * Ra * Math.sqrt(Math.max(0, tmax - tmin)) * (tmed + 17.8);
  return Math.max(0, parseFloat(et0.toFixed(2)));
}

export function emojiPorWeathercode(code: number): string {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫";
  if ([51, 53, 55].includes(code)) return "🌦";
  if ([61, 63, 65].includes(code)) return "🌧";
  if ([71, 73, 75].includes(code)) return "🌨";
  if ([80, 81, 82].includes(code)) return "🌩";
  if (code === 95) return "⛈";
  return "🌤";
}

function validarCoords(lat: number, lon: number): string | null {
  if (lat == null || lon == null || isNaN(lat) || isNaN(lon)) {
    return "Coordenadas inválidas. Cadastre latitude e longitude da fazenda.";
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return "Coordenadas inválidas. Latitude deve estar entre -90 e 90 e Longitude entre -180 e 180.";
  }
  return null;
}

async function fetchComTimeout(url: string, ms = 15000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

function ehInvalido(v: any): boolean {
  return v == null || v === -999 || (typeof v === "number" && (isNaN(v) || v <= -900));
}

// ───────── Função principal — dia único ─────────
// ───────── Provider-agnostic wrappers (delegam ao provider ativo) ─────────
import { getActiveProvider, getActiveProviderId } from "./providers/registry";

export async function buscarDadosClimaticos(
  latitude: number, longitude: number, date: string | Date
): Promise<ResultadoClima> {
  const id = getActiveProviderId();
  // Provider padrão: usa cascata legada (NASA→Open-Meteo) abaixo.
  if (id !== "open-meteo") {
    const provider = getActiveProvider();
    // Provedores que requerem credenciais leem o config do servidor internamente.
    const r = await provider.fetchCurrent(latitude, longitude, date);
    if (r.sucesso) return r;
    // fallback para cascata padrão
  }
  return _buscarDadosClimaticosLegacy(latitude, longitude, date);
}

async function _buscarDadosClimaticosLegacy(
  latitude: number, longitude: number, date: string | Date
): Promise<ResultadoClima> {
  const erroCoord = validarCoords(latitude, longitude);
  if (erroCoord) return { sucesso: false, erro: erroCoord };

  const dateObj = typeof date === "string" ? parseISO(date) : date;
  const isoDate = format(dateObj, "yyyy-MM-dd");
  const nasaDate = format(dateObj, "yyyyMMdd");

  // Datas muito antigas
  if (dateObj.getFullYear() < 1981) {
    return { sucesso: false, erro: "Dados disponíveis a partir de 01/01/1981. Selecione uma data mais recente." };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const ehFutura = dateObj.getTime() > hoje.getTime();

  // ── Tentar NASA POWER (somente datas passadas/hoje) ──
  if (!ehFutura) {
    try {
      const nasaUrl =
        `https://power.larc.nasa.gov/api/temporal/daily/point` +
        `?parameters=T2M_MAX,T2M_MIN,T2M,RH2M,WS2M,ALLSKY_SFC_SW_DWN,PRECTOTCORR` +
        `&community=AG&longitude=${longitude}&latitude=${latitude}` +
        `&start=${nasaDate}&end=${nasaDate}&format=JSON`;
      const resp = await fetchComTimeout(nasaUrl, 15000);
      if (!resp.ok) throw new Error(`NASA HTTP ${resp.status}`);
      const data = await resp.json();
      const p = data?.properties?.parameter;
      if (!p) throw new Error("Resposta NASA inválida");

      const tmax = p.T2M_MAX?.[nasaDate];
      const tmin = p.T2M_MIN?.[nasaDate];
      const tmed = p.T2M?.[nasaDate];
      const rain = p.PRECTOTCORR?.[nasaDate];
      const rad = p.ALLSKY_SFC_SW_DWN?.[nasaDate];
      const rh = p.RH2M?.[nasaDate];
      const wind = p.WS2M?.[nasaDate];

      if ([tmax, tmin, tmed, rain].some(ehInvalido)) {
        throw new Error("DADOS_INDISPONIVEIS");
      }

      const J = getDayOfYear(isoDate);
      const Ra = calcularRa(latitude, J);
      const et0 = calcularET0Hargreaves(tmax, tmin, tmed, latitude, isoDate);

      return {
        sucesso: true,
        fonte: "NASA POWER",
        metodo: "Hargreaves-Samani (FAO-56)",
        et0,
        chuva: parseFloat(Number(rain).toFixed(1)),
        tmax: parseFloat(Number(tmax).toFixed(1)),
        tmin: parseFloat(Number(tmin).toFixed(1)),
        tmed: parseFloat(Number(tmed).toFixed(1)),
        umidade: ehInvalido(rh) ? undefined : parseFloat(Number(rh).toFixed(1)),
        vento: ehInvalido(wind) ? undefined : parseFloat(Number(wind).toFixed(1)),
        radiacao: ehInvalido(rad) ? undefined : parseFloat(Number(rad).toFixed(1)),
        ra: parseFloat(Ra.toFixed(2)),
        J,
        coordenadas: { latitude, longitude },
        data: format(dateObj, "dd/MM/yyyy"),
        dataIso: isoDate,
        obtidoEm: new Date().toISOString(),
      };
    } catch (e: any) {
      // continua para Open-Meteo
      if (e?.message === "DADOS_INDISPONIVEIS") {
        // segue p/ fallback
      }
    }
  }

  // ── Fallback: Open-Meteo ──
  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,relative_humidity_2m_mean,wind_speed_10m_max,shortwave_radiation_sum` +
      `&start_date=${isoDate}&end_date=${isoDate}` +
      `&timezone=America%2FSao_Paulo`;
    const res = await fetchComTimeout(url, 15000);
    if (!res.ok) throw new Error("Open-Meteo HTTP " + res.status);
    const d = await res.json();
    const dly = d.daily;
    if (!dly?.time?.length) throw new Error("Sem dados Open-Meteo");

    const tmax = dly.temperature_2m_max[0];
    const tmin = dly.temperature_2m_min[0];
    const et0 = dly.et0_fao_evapotranspiration[0];
    const chuva = dly.precipitation_sum[0];
    if ([tmax, tmin, et0].some(ehInvalido)) {
      return { sucesso: false, erro: "Dados não disponíveis para esta localização nesta data. Tente coordenadas próximas ou insira manualmente." };
    }
    const tmed = parseFloat(((tmax + tmin) / 2).toFixed(1));

    return {
      sucesso: true,
      fonte: "Open-Meteo",
      metodo: "Penman-Monteith (FAO-56)",
      et0: parseFloat(Number(et0).toFixed(2)),
      chuva: parseFloat(Number(chuva ?? 0).toFixed(1)),
      tmax: parseFloat(Number(tmax).toFixed(1)),
      tmin: parseFloat(Number(tmin).toFixed(1)),
      tmed,
      umidade: dly.relative_humidity_2m_mean?.[0] ?? undefined,
      vento: dly.wind_speed_10m_max?.[0] != null
        ? parseFloat((dly.wind_speed_10m_max[0] / 3.6).toFixed(1)) // km/h → m/s
        : undefined,
      radiacao: dly.shortwave_radiation_sum?.[0] ?? undefined,
      coordenadas: { latitude, longitude },
      data: format(dateObj, "dd/MM/yyyy"),
      dataIso: isoDate,
      obtidoEm: new Date().toISOString(),
    };
  } catch (e: any) {
    if (e?.name === "AbortError") {
      return { sucesso: false, erro: "A consulta demorou mais que o esperado. Tente novamente." };
    }
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return { sucesso: false, erro: "Sem conexão com a internet. Verifique sua rede e tente novamente." };
    }
    return { sucesso: false, erro: "Não foi possível obter dados climáticos. Verifique sua conexão ou insira ET₀ manualmente." };
  }
}

// ───────── Previsão 7 dias (cache 1h) ─────────
const CACHE_TTL_MS = 60 * 60 * 1000;

export async function buscarPrevisao7Dias(
  latitude: number, longitude: number, force = false
): Promise<PrevisaoDia[] | null> {
  const id = getActiveProviderId();
  if (id !== "open-meteo") {
    const provider = getActiveProvider();
    const cfg = getProviderConfig(id);
    const r = await provider.fetchForecast(latitude, longitude, 7, cfg);
    if (r) return r;
  }
  return _buscarPrevisao7DiasLegacy(latitude, longitude, force);
}

async function _buscarPrevisao7DiasLegacy(
  latitude: number, longitude: number, force = false
): Promise<PrevisaoDia[] | null> {
  const erroCoord = validarCoords(latitude, longitude);
  if (erroCoord) return null;

  const cacheKey = `weather:forecast:${latitude.toFixed(4)}:${longitude.toFixed(4)}`;
  if (!force && typeof localStorage !== "undefined") {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (raw) {
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL_MS) return data;
      }
    } catch { /* ignore */ }
  }

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,weathercode` +
      `&timezone=America%2FSao_Paulo&forecast_days=7`;
    const res = await fetchComTimeout(url, 15000);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    const d = data.daily;
    const result: PrevisaoDia[] = d.time.map((iso: string, i: number) => {
      const dt = parseISO(iso);
      const code = d.weathercode[i] ?? 0;
      return {
        data: format(dt, "dd/MM"),
        dataIso: iso,
        diaSemana: DIAS_SEMANA[dt.getDay()],
        et0: parseFloat(Number(d.et0_fao_evapotranspiration[i] ?? 0).toFixed(2)),
        chuva: parseFloat(Number(d.precipitation_sum[i] ?? 0).toFixed(1)),
        tmax: Math.round(d.temperature_2m_max[i]),
        tmin: Math.round(d.temperature_2m_min[i]),
        weathercode: code,
        emoji: emojiPorWeathercode(code),
      };
    });

    if (typeof localStorage !== "undefined") {
      try { localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: result })); } catch { /* ignore */ }
    }
    return result;
  } catch {
    return null;
  }
}

// ───────── Importação histórica em lote ─────────
export interface RegistroHistorico {
  data: string; // yyyy-MM-dd
  et0: number;
  chuva: number;
}

export interface ResultadoImportacao {
  sucesso: boolean;
  registros?: RegistroHistorico[];
  erro?: string;
  fonte?: "Open-Meteo" | "NASA POWER";
  metodo?: string;
  diasSolicitados?: number;
}

export async function importarHistoricoNasa(
  latitude: number, longitude: number, dias = 30
): Promise<ResultadoImportacao> {
  const erroCoord = validarCoords(latitude, longitude);
  if (erroCoord) return { sucesso: false, erro: erroCoord };

  // ── 1) Tentar Open-Meteo (ET₀ FAO-56 Penman-Monteith, baixa latência ~1 dia) ──
  try {
    const fim = subDays(new Date(), 1);
    const inicio = subDays(fim, dias - 1);
    const startIso = format(inicio, "yyyy-MM-dd");
    const endIso = format(fim, "yyyy-MM-dd");
    const url =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}` +
      `&daily=precipitation_sum,et0_fao_evapotranspiration` +
      `&start_date=${startIso}&end_date=${endIso}` +
      `&timezone=America%2FSao_Paulo`;
    const resp = await fetchComTimeout(url, 15000);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const data = await resp.json();
    const d = data?.daily;
    if (!d?.time?.length) throw new Error("Sem dados");
    const registros: RegistroHistorico[] = [];
    for (let i = 0; i < d.time.length; i++) {
      const et0 = d.et0_fao_evapotranspiration[i];
      const chuva = d.precipitation_sum[i];
      if (ehInvalido(et0)) continue;
      registros.push({
        data: d.time[i],
        et0: parseFloat(Number(et0).toFixed(2)),
        chuva: parseFloat(Number(chuva ?? 0).toFixed(1)),
      });
    }
    if (registros.length > 0) {
      return {
        sucesso: true, registros,
        fonte: "Open-Meteo", metodo: "Penman-Monteith (FAO-56)",
        diasSolicitados: dias,
      };
    }
  } catch { /* segue p/ fallback */ }

  // ── 2) Fallback: NASA POWER (delay 2-4 dias → buscar janela maior e filtrar -999) ──
  const fim = subDays(new Date(), 2);
  const inicio = subDays(fim, dias + 14); // buffer p/ compensar dias inválidos
  const startStr = format(inicio, "yyyyMMdd");
  const endStr = format(fim, "yyyyMMdd");

  try {
    const url =
      `https://power.larc.nasa.gov/api/temporal/daily/point` +
      `?parameters=T2M_MAX,T2M_MIN,T2M,PRECTOTCORR` +
      `&community=AG&longitude=${longitude}&latitude=${latitude}` +
      `&start=${startStr}&end=${endStr}&format=JSON`;
    const resp = await fetchComTimeout(url, 15000);
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    const data = await resp.json();
    const p = data?.properties?.parameter;
    if (!p) throw new Error("Resposta inválida");

    const datas = Object.keys(p.T2M_MAX || {}).sort();
    const registros: RegistroHistorico[] = [];
    for (const k of datas) {
      const tmax = p.T2M_MAX[k], tmin = p.T2M_MIN[k], tmed = p.T2M[k], rain = p.PRECTOTCORR[k];
      if ([tmax, tmin, tmed, rain].some(ehInvalido)) continue;
      const iso = `${k.slice(0, 4)}-${k.slice(4, 6)}-${k.slice(6, 8)}`;
      registros.push({
        data: iso,
        et0: calcularET0Hargreaves(tmax, tmin, tmed, latitude, iso),
        chuva: parseFloat(Number(rain).toFixed(1)),
      });
    }
    // Mantém apenas os 'dias' mais recentes válidos
    const recortados = registros.slice(-dias);
    return {
      sucesso: true, registros: recortados,
      fonte: "NASA POWER", metodo: "Hargreaves-Samani (FAO-56)",
      diasSolicitados: dias,
    };
  } catch (e: any) {
    if (e?.name === "AbortError") return { sucesso: false, erro: "Tempo limite excedido na consulta climática." };
    return { sucesso: false, erro: "Não foi possível importar dados históricos. Verifique sua conexão." };
  }
}
