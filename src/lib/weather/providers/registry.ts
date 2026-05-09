import type { WeatherProvider, WeatherProviderConfig } from "./types";
import { openMeteoProvider } from "./openMeteo";
import { nasaPowerProvider } from "./nasaPower";
import { metosProvider } from "./metos";
import { davisProvider } from "./davis";

export const PROVIDERS: Record<string, WeatherProvider> = {
  "open-meteo": openMeteoProvider,
  "nasa-power": nasaPowerProvider,
  "metos": metosProvider,
  "davis": davisProvider,
};

const ACTIVE_KEY = "irrix:weather-provider";
const CONFIG_KEY = "irrix:weather-provider-config";

export function getActiveProviderId(): string {
  try { return localStorage.getItem(ACTIVE_KEY) || "open-meteo"; }
  catch { return "open-meteo"; }
}
export function setActiveProviderId(id: string) {
  try { localStorage.setItem(ACTIVE_KEY, id); } catch {}
}
export function getActiveProvider(): WeatherProvider {
  return PROVIDERS[getActiveProviderId()] ?? openMeteoProvider;
}
export function getProviderConfig(id: string): WeatherProviderConfig {
  try {
    const raw = localStorage.getItem(`${CONFIG_KEY}:${id}`);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
export function setProviderConfig(id: string, cfg: WeatherProviderConfig) {
  try { localStorage.setItem(`${CONFIG_KEY}:${id}`, JSON.stringify(cfg)); } catch {}
}

export function listProviders(): WeatherProvider[] {
  return Object.values(PROVIDERS);
}
