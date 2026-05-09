import { useState } from "react";
import { toast } from "sonner";
import { NeuCard, NeuButton, NeuInput, NeuLabel, NeuSelect } from "@/components/ui/neu";
import { Antenna, CheckCircle2 } from "lucide-react";
import {
  listProviders, getActiveProviderId, setActiveProviderId,
  getProviderConfig, setProviderConfig, PROVIDERS,
} from "@/lib/weather/providers/registry";

export function WeatherProviderSettings() {
  const [activeId, setActive] = useState<string>(getActiveProviderId());
  const provider = PROVIDERS[activeId];
  const [cfg, setCfg] = useState(() => getProviderConfig(activeId));
  const [stationId, setStationId] = useState(cfg.extras?.stationId ?? "");
  const [testing, setTesting] = useState(false);

  const onChangeProvider = (id: string) => {
    setActive(id);
    setActiveProviderId(id);
    const c = getProviderConfig(id);
    setCfg(c);
    setStationId(c.extras?.stationId ?? "");
    toast.success(`Provider ativo: ${PROVIDERS[id]?.label}`);
  };

  const salvar = () => {
    const next = { ...cfg, extras: { ...(cfg.extras ?? {}), stationId } };
    setProviderConfig(activeId, next);
    setCfg(next);
    toast.success("Configuração salva");
  };

  const testar = async () => {
    setTesting(true);
    try {
      const next = { ...cfg, extras: { ...(cfg.extras ?? {}), stationId } };
      setProviderConfig(activeId, next);
      const r = await provider.fetchCurrent(-15.78, -47.93, new Date(), next);
      if (r.sucesso) toast.success(`✓ Conexão OK — T̄ ${r.tmed}°C`);
      else toast.error(`Falha: ${(r as any).erro}`);
    } finally { setTesting(false); }
  };

  return (
    <NeuCard>
      <h2 className="font-semibold mb-1 flex items-center gap-2">
        <Antenna className="w-4 h-4 text-primary" /> Estação meteorológica
      </h2>
      <p className="text-xs text-muted-foreground mb-4">
        Escolha o provedor de dados climáticos. Open-Meteo e NASA POWER funcionam direto;
        Metos e Davis exigem URL e chave da estação (configuração futura).
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

        {provider?.requiresBaseUrl && (
          <div>
            <NeuLabel>Base URL</NeuLabel>
            <NeuInput
              value={cfg.baseUrl ?? ""}
              onChange={(e) => setCfg({ ...cfg, baseUrl: e.target.value })}
              placeholder="https://api.fieldclimate.com/v2"
            />
          </div>
        )}

        {provider?.requiresApiKey && (
          <div>
            <NeuLabel>API Key</NeuLabel>
            <NeuInput
              type="password"
              value={cfg.apiKey ?? ""}
              onChange={(e) => setCfg({ ...cfg, apiKey: e.target.value })}
              placeholder="••••••••"
            />
          </div>
        )}

        {(provider?.requiresApiKey || provider?.requiresBaseUrl) && (
          <div>
            <NeuLabel>ID da estação (opcional)</NeuLabel>
            <NeuInput value={stationId} onChange={(e) => setStationId(e.target.value)} />
          </div>
        )}
      </div>

      <div className="flex gap-2 justify-end mt-4">
        <NeuButton onClick={testar} disabled={testing}>
          <CheckCircle2 className="w-4 h-4" /> {testing ? "Testando..." : "Testar conexão"}
        </NeuButton>
        <NeuButton variant="primary" onClick={salvar}>Salvar</NeuButton>
      </div>
    </NeuCard>
  );
}
