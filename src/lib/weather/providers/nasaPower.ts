/**
 * NASA POWER provider (somente dados históricos / até hoje).
 * Para previsão, retorna null — fluxo deve cair em outro provider.
 */
import { format, parseISO } from "date-fns";
import type { WeatherProvider } from "./types";
import {
  calcularET0Hargreaves,
  calcularRa,
  getDayOfYear,
  type DadosClimaticos,
  type ResultadoClima,
} from "../weatherService";

async function fetchTimeout(url: string, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}
function ehInvalido(v: any): boolean {
  return v == null || v === -999 || (typeof v === "number" && (isNaN(v) || v <= -900));
}

export const nasaPowerProvider: WeatherProvider = {
  id: "nasa-power",
  label: "NASA POWER",
  description: "Dados históricos via satélite. ET₀ por Hargreaves-Samani. Sem previsão.",
  requiresApiKey: false,
  requiresBaseUrl: false,

  async fetchCurrent(latitude, longitude, date): Promise<ResultadoClima> {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const isoDate = format(dateObj, "yyyy-MM-dd");
    const nasaDate = format(dateObj, "yyyyMMdd");
    if (dateObj.getTime() > Date.now()) {
      return { sucesso: false, erro: "NASA POWER não fornece previsão. Use outro provider." };
    }
    try {
      const url =
        `https://power.larc.nasa.gov/api/temporal/daily/point` +
        `?parameters=T2M_MAX,T2M_MIN,T2M,RH2M,WS2M,ALLSKY_SFC_SW_DWN,PRECTOTCORR` +
        `&community=AG&longitude=${longitude}&latitude=${latitude}` +
        `&start=${nasaDate}&end=${nasaDate}&format=JSON`;
      const r = await fetchTimeout(url);
      if (!r.ok) throw new Error("HTTP " + r.status);
      const data = await r.json();
      const p = data?.properties?.parameter;
      const tmax = p?.T2M_MAX?.[nasaDate];
      const tmin = p?.T2M_MIN?.[nasaDate];
      const tmed = p?.T2M?.[nasaDate];
      const rain = p?.PRECTOTCORR?.[nasaDate];
      if ([tmax, tmin, tmed, rain].some(ehInvalido)) throw new Error("DADOS_INDISPONIVEIS");
      const J = getDayOfYear(isoDate);
      const Ra = calcularRa(latitude, J);
      const et0 = calcularET0Hargreaves(tmax, tmin, tmed, latitude, isoDate);
      const out: DadosClimaticos = {
        sucesso: true, fonte: "NASA POWER", metodo: "Hargreaves-Samani (FAO-56)",
        et0, chuva: parseFloat(Number(rain).toFixed(1)),
        tmax: parseFloat(Number(tmax).toFixed(1)),
        tmin: parseFloat(Number(tmin).toFixed(1)),
        tmed: parseFloat(Number(tmed).toFixed(1)),
        umidade: ehInvalido(p?.RH2M?.[nasaDate]) ? undefined : parseFloat(Number(p.RH2M[nasaDate]).toFixed(1)),
        vento: ehInvalido(p?.WS2M?.[nasaDate]) ? undefined : parseFloat(Number(p.WS2M[nasaDate]).toFixed(1)),
        radiacao: ehInvalido(p?.ALLSKY_SFC_SW_DWN?.[nasaDate]) ? undefined : parseFloat(Number(p.ALLSKY_SFC_SW_DWN[nasaDate]).toFixed(1)),
        ra: parseFloat(Ra.toFixed(2)), J,
        coordenadas: { latitude, longitude },
        data: format(dateObj, "dd/MM/yyyy"), dataIso: isoDate,
        obtidoEm: new Date().toISOString(),
      };
      return out;
    } catch (e: any) {
      return { sucesso: false, erro: e?.message ?? "Falha NASA POWER" };
    }
  },

  async fetchForecast() { return null; },
};
