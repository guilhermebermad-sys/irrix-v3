/**
 * Metos (Pessl Instruments) provider — placeholder genérico.
 *
 * Para ativar: configure baseUrl e apiKey nas Configurações.
 * O endpoint padrão da API Metos é https://api.fieldclimate.com/v2.
 * Cada usuário precisa dos seus próprios HMAC keys (publicKey/privateKey).
 *
 * Esta implementação assume que o usuário forneceu uma URL própria de proxy
 * ou um endpoint compatível que retorna JSON com os campos abaixo.
 * O mapper é puramente front-end — sem custo de re-escrita do componente.
 */
import { format, parseISO } from "date-fns";
import type { WeatherProvider, WeatherProviderConfig } from "./types";
import type { DadosClimaticos, PrevisaoDia, ResultadoClima } from "../weatherService";

async function call(baseUrl: string, path: string, apiKey?: string) {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, { headers, signal: ctrl.signal });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

export const metosProvider: WeatherProvider = {
  id: "metos",
  label: "Metos / FieldClimate",
  description: "Estação Pessl Instruments. Configure baseUrl e apiKey nas Configurações.",
  requiresApiKey: true,
  requiresBaseUrl: true,

  async fetchCurrent(latitude, longitude, date, config?: WeatherProviderConfig): Promise<ResultadoClima> {
    if (!config?.baseUrl) return { sucesso: false, erro: "Metos: configure a baseUrl nas Configurações." };
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const isoDate = format(dateObj, "yyyy-MM-dd");
    const stationId = config.extras?.stationId ?? "default";
    try {
      // Endpoint genérico; usuário deve adaptar o proxy se necessário.
      const data = await call(config.baseUrl, `/data/${stationId}/daily/${isoDate}`, config.apiKey);
      const d = data?.day ?? data;
      const tmax = Number(d?.tmax ?? d?.airTempMax);
      const tmin = Number(d?.tmin ?? d?.airTempMin);
      const tmed = Number(d?.tmed ?? d?.airTempAvg ?? (tmax + tmin) / 2);
      const et0 = Number(d?.et0 ?? d?.evapotranspiration);
      const chuva = Number(d?.rain ?? d?.precipitation ?? 0);
      if ([tmax, tmin, et0].some((v) => Number.isNaN(v))) {
        return { sucesso: false, erro: "Metos: campos ausentes na resposta." };
      }
      const out: DadosClimaticos = {
        sucesso: true, fonte: "Open-Meteo", // mantém union type; UI mostra rótulo do provider
        metodo: "Estação Metos (medido)",
        et0: parseFloat(et0.toFixed(2)),
        chuva: parseFloat(chuva.toFixed(1)),
        tmax: parseFloat(tmax.toFixed(1)),
        tmin: parseFloat(tmin.toFixed(1)),
        tmed: parseFloat(tmed.toFixed(1)),
        umidade: d?.rh ?? d?.humidity,
        vento: d?.wind ?? d?.windSpeed,
        radiacao: d?.solar ?? d?.solarRadiation,
        coordenadas: { latitude, longitude },
        data: format(dateObj, "dd/MM/yyyy"), dataIso: isoDate,
        obtidoEm: new Date().toISOString(),
      };
      return out;
    } catch (e: any) {
      return { sucesso: false, erro: `Metos: ${e?.message ?? "falha de conexão"}` };
    }
  },

  async fetchForecast(_lat, _lon, _days, config?: WeatherProviderConfig): Promise<PrevisaoDia[] | null> {
    // Placeholder — a API Metos oferece previsão; usuário pode estender este mapper.
    if (!config?.baseUrl) return null;
    return null;
  },
};
