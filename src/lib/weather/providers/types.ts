import type { DadosClimaticos, PrevisaoDia, ResultadoClima } from "../weatherService";

export interface WeatherProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  /** Provider-specific extra fields (e.g. station id) */
  extras?: Record<string, string>;
}

export interface WeatherProvider {
  id: string;
  label: string;
  description: string;
  requiresApiKey: boolean;
  requiresBaseUrl: boolean;

  fetchCurrent(
    lat: number,
    lon: number,
    date: string | Date,
    config?: WeatherProviderConfig,
  ): Promise<ResultadoClima>;

  fetchForecast(
    lat: number,
    lon: number,
    days: number,
    config?: WeatherProviderConfig,
  ): Promise<PrevisaoDia[] | null>;
}

export type { DadosClimaticos, PrevisaoDia, ResultadoClima };
