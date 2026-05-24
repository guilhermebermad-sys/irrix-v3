/**
 * Davis Instruments (WeatherLink) provider — credenciais ficam no backend.
 * A chamada à API Davis é feita pela edge function `weather-station-proxy`,
 * que mantém apiKey/baseUrl/stationId armazenados de forma segura no servidor.
 */
import { format, parseISO } from "date-fns";
import type { WeatherProvider } from "./types";
import type { PrevisaoDia, ResultadoClima } from "../weatherService";
import { supabase } from "@/integrations/supabase/client";

export const davisProvider: WeatherProvider = {
  id: "davis",
  label: "Davis WeatherLink",
  description: "Estação Davis Instruments. Credenciais armazenadas com segurança no servidor.",
  requiresApiKey: true,
  requiresBaseUrl: true,

  async fetchCurrent(latitude, longitude, date): Promise<ResultadoClima> {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const isoDate = format(dateObj, "yyyy-MM-dd");
    try {
      const { data, error } = await supabase.functions.invoke("weather-station-proxy", {
        body: { provider: "davis", latitude, longitude, date: isoDate },
      });
      if (error) return { sucesso: false, erro: `Davis: ${error.message}` };
      if (!data?.sucesso) return { sucesso: false, erro: data?.erro ?? "Davis: falha desconhecida" };
      return data as ResultadoClima;
    } catch (e: any) {
      return { sucesso: false, erro: `Davis: ${e?.message ?? "falha de conexão"}` };
    }
  },

  async fetchForecast(): Promise<PrevisaoDia[] | null> { return null; },
};
