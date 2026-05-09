/**
 * Open-Meteo provider — wraps the existing weatherService logic via internal helpers.
 * The legacy `buscarDadosClimaticos` already implements the NASA→Open-Meteo cascade.
 * Here we expose Open-Meteo only.
 */
import { format, parseISO } from "date-fns";
import type { WeatherProvider } from "./types";
import {
  emojiPorWeathercode,
  type DadosClimaticos,
  type PrevisaoDia,
  type ResultadoClima,
} from "../weatherService";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

async function fetchTimeout(url: string, ms = 15000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try { return await fetch(url, { signal: ctrl.signal }); }
  finally { clearTimeout(t); }
}

function ehInvalido(v: any): boolean {
  return v == null || v === -999 || (typeof v === "number" && (isNaN(v) || v <= -900));
}

export const openMeteoProvider: WeatherProvider = {
  id: "open-meteo",
  label: "Open-Meteo (Padrão)",
  description: "API global gratuita. Usa Penman-Monteith FAO-56 para ET₀.",
  requiresApiKey: false,
  requiresBaseUrl: false,

  async fetchCurrent(latitude, longitude, date): Promise<ResultadoClima> {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const isoDate = format(dateObj, "yyyy-MM-dd");
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,relative_humidity_2m_mean,wind_speed_10m_max,shortwave_radiation_sum` +
        `&start_date=${isoDate}&end_date=${isoDate}&timezone=America%2FSao_Paulo`;
      const res = await fetchTimeout(url);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const d = await res.json();
      const dly = d.daily;
      if (!dly?.time?.length) throw new Error("Sem dados");
      const tmax = dly.temperature_2m_max[0];
      const tmin = dly.temperature_2m_min[0];
      const et0 = dly.et0_fao_evapotranspiration[0];
      const chuva = dly.precipitation_sum[0];
      if ([tmax, tmin, et0].some(ehInvalido)) {
        return { sucesso: false, erro: "Dados não disponíveis para esta localização nesta data." };
      }
      const tmed = parseFloat(((tmax + tmin) / 2).toFixed(1));
      const out: DadosClimaticos = {
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
          ? parseFloat((dly.wind_speed_10m_max[0] / 3.6).toFixed(1)) : undefined,
        radiacao: dly.shortwave_radiation_sum?.[0] ?? undefined,
        coordenadas: { latitude, longitude },
        data: format(dateObj, "dd/MM/yyyy"),
        dataIso: isoDate,
        obtidoEm: new Date().toISOString(),
      };
      return out;
    } catch (e: any) {
      return { sucesso: false, erro: e?.message ?? "Falha ao consultar Open-Meteo" };
    }
  },

  async fetchForecast(latitude, longitude, days): Promise<PrevisaoDia[] | null> {
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,et0_fao_evapotranspiration,weathercode` +
        `&timezone=America%2FSao_Paulo&forecast_days=${Math.max(1, Math.min(16, days))}`;
      const res = await fetchTimeout(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const d = data.daily;
      return d.time.map((iso: string, i: number) => {
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
    } catch { return null; }
  },
};
