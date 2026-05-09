import { useEffect, useState } from "react";
import { NeuCard } from "@/components/ui/neu";
import { buscarDadosClimaticos, DadosClimaticos } from "@/lib/weather/weatherService";
import { RefreshCw, Satellite, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  fazendaNome?: string;
}

export function CurrentConditionsCard({ latitude, longitude, fazendaNome }: Props) {
  const [dados, setDados] = useState<DadosClimaticos | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = async () => {
    if (latitude == null || longitude == null) return;
    setCarregando(true); setErro(null);
    const r = await buscarDadosClimaticos(latitude, longitude, new Date());
    if (r.sucesso === true) setDados(r); else setErro(r.erro);
    setCarregando(false);
  };

  useEffect(() => { setDados(null); carregar(); /* eslint-disable-next-line */ }, [latitude, longitude]);

  if (latitude == null || longitude == null) {
    return (
      <NeuCard>
        <h3 className="font-semibold mb-2">🌤 Condições Hoje</h3>
        <div className="neu-inset p-3 rounded-xl text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Cadastre a localização da fazenda.
          <Link to="/fazendas" className="text-primary font-semibold ml-1 hover:underline">Editar</Link>
        </div>
      </NeuCard>
    );
  }

  return (
    <NeuCard>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h3 className="font-semibold">🌤 Condições Hoje{fazendaNome ? ` — ${fazendaNome}` : ""}</h3>
        <button onClick={carregar} disabled={carregando}
          className="neu-button px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${carregando ? "animate-spin" : ""}`} /> Atualizar agora
        </button>
      </div>

      {carregando && !dados && (
        <div className="neu-inset p-3 rounded-xl text-sm text-muted-foreground">Consultando...</div>
      )}

      {erro && !dados && (
        <div className="neu-inset p-3 rounded-xl text-sm text-destructive">{erro}</div>
      )}

      {dados && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="neu-inset p-3 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">ET₀</div>
              <div className="font-display text-xl font-bold text-primary">{dados.et0} mm</div>
            </div>
            <div className="neu-inset p-3 rounded-xl">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Chuva</div>
              <div className="font-display text-xl font-bold text-secondary">{dados.chuva} mm</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
            <span>🌡 {dados.tmax}°/{dados.tmin}°</span>
            {dados.vento != null && <span>💨 {dados.vento} m/s</span>}
            {dados.umidade != null && <span>💧 {dados.umidade}%</span>}
          </div>
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Satellite className="w-3 h-3" /> Atualizado às {format(new Date(dados.obtidoEm), "HH:mm")}
          </div>
        </div>
      )}
    </NeuCard>
  );
}
