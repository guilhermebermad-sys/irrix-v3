/**
 * Davis Instruments (WeatherLink) provider — placeholder genérico.
 *
 * Endpoint oficial: https://api.weatherlink.com/v2/current/{station-id}
 * Requer api-key + api-secret (HMAC). Recomenda-se proxy server-side.
 * Esta implementação é configurável via baseUrl/apiKey/extras.stationId.
 */
import { format, parseISO } from "date-fns";
import type { WeatherProvider, WeatherProviderConfig } from "./types";
import type { DadosClimaticos, PrevisaoDia, ResultadoClima } from "../weatherService";

async function call(url: string, apiKey?: string) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers["X-Api-Key"] = apiKey;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, { headers, signal: ctrl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

export const davisProvider: WeatherProvider = {
  id: "davis",
  label: "Davis WeatherLink",
  description: "Estação Davis Instruments. Configure baseUrl/apiKey/stationId.",
  requiresApiKey: true,
  requiresBaseUrl: true,

  async fetchCurrent(latitude, longitude, date, config?: WeatherProviderConfig): Promise<ResultadoClima> {
    if (!config?.baseUrl) return { sucesso: false, erro: "Davis: configure a baseUrl." };
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const isoDate = format(dateObj, "yyyy-MM-dd");
    const stationId = config.extras?.stationId ?? "";
    try {
      const url = `${config.baseUrl.replace(/\/$/, "")}/current/${stationId}?date=${isoDate}`;
      const data = await call(url, config.apiKey);
      const s = data?.sensors?.[0]?.data?.[0] ?? data;
      const tmax = Number(s?.temp_hi ?? s?.tmax);
      const tmin = Number(s?.temp_lo ?? s?.tmin);
      const tmed = Number(s?.temp_avg ?? s?.tmed ?? (tmax + tmin) / 2);
      const et0 = Number(s?.et_day ?? s?.et0 ?? 0);
      const chuva = Number(s?.rainfall_in ?? s?.rain ?? 0);
      if ([tmax, tmin].some((v) => Number.isNaN(v))) {
        return { sucesso: false, erro: "Davis: campos ausentes na resposta." };
      }
      const out: DadosClimaticos = {
        sucesso: true, fonte: "Open-Meteo",
        metodo: "Estação Davis (medido)",
        et0: parseFloat(et0.toFixed(2)),
        chuva: parseFloat(chuva.toFixed(1)),
        tmax: parseFloat(tmax.toFixed(1)),
        tmin: parseFloat(tmin.toFixed(1)),
        tmed: parseFloat(tmed.toFixed(1)),
        umidade: s?.hum_out ?? s?.humidity,
        vento: s?.wind_speed_avg ?? s?.wind,
        radiacao: s?.solar_rad_avg ?? s?.solar,
        coordenadas: { latitude, longitude },
        data: format(dateObj, "dd/MM/yyyy"), dataIso: isoDate,
        obtidoEm: new Date().toISOString(),
      };
      return out;
    } catch (e: any) {
      return { sucesso: false, erro: `Davis: ${e?.message ?? "falha de conexão"}` };
    }
  },

  async fetchForecast(): Promise<PrevisaoDia[] | null> { return null; },
};
