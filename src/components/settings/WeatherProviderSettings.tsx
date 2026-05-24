import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NeuCard, NeuButton, NeuInput, NeuLabel, NeuSelect } from "@/components/ui/neu";
import { Antenna, CheckCircle2 } from "lucide-react";
import {
  listProviders, getActiveProviderId, setActiveProviderId,
  loadProviderConfig, saveProviderConfig, isServerBackedProvider, PROVIDERS,
} from "@/lib/weather/providers/registry";
import type { WeatherProviderConfig } from "@/lib/weather/providers/types";

export function WeatherProviderSettings() {
  const [activeId, setActive] = useState<string>(getActiveProviderId());
  const provider = PROVIDERS[activeId];
  const [cfg, setCfg] = useState<WeatherProviderConfig>({});
  const [stationId, setStationId] = useState("");
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (!isServerBackedProvider(activeId)) {
      setCfg({}); setStationId(""); return;
    }
    setLoading(true);
    loadProviderConfig(activeId)
      .then((c) => {
        if (!active) return;
        setCfg(c);
        setStationId(c.extras?.stationId ?? "");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [activeId]);

  const onChangeProvider = (id: string) => {
    setActive(id);
    setActiveProviderId(id);
    toast.success(`Provider ativo: ${PROVIDERS[id]?.label}`);
  };

  const salvar = async () => {
    if (!isServerBackedProvider(activeId)) return;
    setSaving(true);
    try {
      const next = { ...cfg, extras: { ...(cfg.extras ?? {}), stationId } };
      await saveProviderConfig(activeId, next);
      setCfg(next);
      toast.success("Configuração salva com segurança no servidor");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao salvar");
    } finally { setSaving(false); }
  };

  const testar = async () => {
    setTesting(true);
    try {
      if (isServerBackedProvider(activeId)) {
        const next = { ...cfg, extras: { ...(cfg.extras ?? {}), stationId } };
        await saveProviderConfig(activeId, next);
      }
      const r = await provider.fetchCurrent(-15.78, -47.93, new Date());
      if (r.sucesso) toast.success(`✓ Conexão OK — T̄ ${r.tmed}°C`);
      else toast.error(`Falha: ${(r as any).erro}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao testar");
    } finally { setTesting(false); }
  };

  const serverBacked = isServerBackedProvider(activeId);

  return (
    <NeuCard>
      <h2 className="font-semibold mb-1 flex items-center gap-2">
        <Antenna className="w-4 h-4 text-primary" /> Estação meteorológica
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Escolha o provedor de dados climáticos. Open-Meteo e NASA POWER funcionam direto;
        Metos e Davis exigem credenciais (armazenadas com segurança no servidor).
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <NeuLabel>Provider</NeuLabel>
          <NeuSelect value={activeId} onChange={(e) => onChangeProvider(e.target.value)}>
            {listProviders().map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </NeuSelect>
          <p className="text-[11px] text-muted-foreground mt-1">{provider?.description}</p>
        </div>

        {serverBacked && provider?.requiresBaseUrl && (
          <div>
            <NeuLabel>Base URL</NeuLabel>
            <NeuInput
              value={cfg.baseUrl ?? ""}
              disabled={loading}
              onChange={(e) => setCfg({ ...cfg, baseUrl: e.target.value })}
              placeholder="https://api.fieldclimate.com/v2"
            />
          </div>
        )}

        {serverBacked && provider?.requiresApiKey && (
          <div>
            <NeuLabel>API Key</NeuLabel>
            <NeuInput
              type="password"
              value={cfg.apiKey ?? ""}
              disabled={loading}
              onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        )}

        {serverBacked && (provider?.requiresApiKey || provider?.requiresBaseUrl) && (
          <div>
            <NeuLabel>ID da estação (opcional)</NeuLabel>
            <NeuInput value={stationId} disabled={loading} onChange={(e) => setStationId(e.target.value)} />
          </div>
        )}
      </div>

      {serverBacked && (
        <div className="flex gap-2 justify-end mt-4">
          <NeuButton onClick={testar} disabled={testing || loading}>
            <CheckCircle2 className="w-4 h-4" /> {testing ? "Testando..." : "Testar conexão"}
          </NeuButton>
          <NeuButton variant="primary" onClick={salvar} disabled={saving || loading}>
            {saving ? "Salvando..." : "Salvar"}
          </NeuButton>
        </div>
      )}
    </NeuCard>
  );
}
