import type { WeatherProvider, WeatherProviderConfig } from "./types";
import { openMeteoProvider } from "./openMeteo";
import { nasaPowerProvider } from "./nasaPower";
import { metosProvider } from "./metos";
import { davisProvider } from "./davis";
import { supabase } from "@/integrations/supabase/client";

export const PROVIDERS: Record<string, WeatherProvider> = {
  "open-meteo": openMeteoProvider,
  "nasa-power": nasaPowerProvider,
  "metos": metosProvider,
  "davis": davisProvider,
};

const ACTIVE_KEY = "irrix:weather-provider";
const LEGACY_CONFIG_PREFIX = "irrix:weather-provider-config";

/** Server-backed providers: credentials live in usuarios_perfil.weather_config */
const SERVER_PROVIDERS = new Set(["metos", "davis"]);

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

/** One-time cleanup: wipe any legacy localStorage credentials for sensitive providers. */
export function purgeLegacyProviderSecrets() {
  try {
    for (const id of SERVER_PROVIDERS) {
      localStorage.removeItem(`${LEGACY_CONFIG_PREFIX}:${id}`);
    }
  } catch {}
}

/** Load provider config. Sensitive providers fetch from DB; others return {} (no client config needed). */
export async function loadProviderConfig(id: string): Promise<WeatherProviderConfig> {
  if (!SERVER_PROVIDERS.has(id)) return {};
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return {};
  const { data } = await supabase
    .from("usuarios_perfil").select("weather_config").eq("user_id", auth.user.id).maybeSingle();
  const cfg = (data?.weather_config as any)?.[id];
  return cfg ?? {};
}

/** Save provider config to DB (sensitive providers only). */
export async function saveProviderConfig(id: string, cfg: WeatherProviderConfig): Promise<void> {
  if (!SERVER_PROVIDERS.has(id)) return;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Não autenticado");
  const { data: perfil } = await supabase
    .from("usuarios_perfil").select("weather_config").eq("user_id", auth.user.id).maybeSingle();
  const next = { ...((perfil?.weather_config as any) ?? {}), [id]: cfg };
  const { error } = await supabase
    .from("usuarios_perfil")
    .upsert({ user_id: auth.user.id, weather_config: next, updated_at: new Date().toISOString() },
      { onConflict: "user_id" });
  if (error) throw error;
}

export function listProviders(): WeatherProvider[] {
  return Object.values(PROVIDERS);
}

export function isServerBackedProvider(id: string): boolean {
  return SERVER_PROVIDERS.has(id);
}
