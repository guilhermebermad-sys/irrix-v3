/**
 * Metos (Pessl Instruments) provider — credenciais ficam no backend.
 * Esta função chama uma edge function que detém a apiKey e faz a requisição
 * server-side para a API Metos / FieldClimate, evitando expor chaves no browser.
 */
import { format, parseISO } from "date-fns";
import type { WeatherProvider } from "./types";
import type { PrevisaoDia, ResultadoClima } from "../weatherService";
import { supabase } from "@/integrations/supabase/client";

export const metosProvider: WeatherProvider = {
  id: "metos",
  label: "Metos / FieldClimate",
  description: "Estação Pessl Instruments. Credenciais armazenadas com segurança no servidor.",
  requiresApiKey: true,
  requiresBaseUrl: true,

  async fetchCurrent(latitude, longitude, date): Promise<ResultadoClima> {
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    const isoDate = format(dateObj, "yyyy-MM-dd");
    try {
      const { data, error } = await supabase.functions.invoke("weather-station-proxy", {
        body: { provider: "metos", latitude, longitude, date: isoDate },
      });
      if (error) return { sucesso: false, erro: `Metos: ${error.message}` };
      if (!data?.sucesso) return { sucesso: false, erro: data?.erro ?? "Metos: falha desconhecida" };
      return data as ResultadoClima;
    } catch (e: any) {
      return { sucesso: false, erro: `Metos: ${e?.message ?? "falha de conexão"}` };
    }
  },

  async fetchForecast(): Promise<PrevisaoDia[] | null> { return null; },
};
