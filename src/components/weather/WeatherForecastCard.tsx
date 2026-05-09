import { useEffect, useState } from "react";
import { NeuCard } from "@/components/ui/neu";
import { buscarPrevisao7Dias, PrevisaoDia } from "@/lib/weather/weatherService";
import { Cloud, MapPin, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
}

function corET0(v: number) {
  if (v < 3) return "text-primary";
  if (v <= 5) return "text-warning";
  return "text-destructive";
}
function corChuva(v: number) {
  if (v <= 0) return "text-muted-foreground";
  if (v <= 10) return "text-secondary";
  return "text-blue-600 dark:text-blue-400";
}

export function WeatherForecastCard({ latitude, longitude }: Props) {
  const [dados, setDados] = useState<PrevisaoDia[] | null>(null);
  const [carregando, setCarregando] = useState(false);

  const carregar = async (force = false) => {
    if (latitude == null || longitude == null) return;
    setCarregando(true);
    const r = await buscarPrevisao7Dias(latitude, longitude, force);
    setDados(r);
    setCarregando(false);
  };

  useEffect(() => { carregar(false); /* eslint-disable-next-line */ }, [latitude, longitude]);

  if (latitude == null || longitude == null) {
    return (
      <NeuCard>
        <div className="flex items-center gap-2 mb-2">
          <Cloud className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold">☀️ Previsão Climática — Próximos 7 Dias</h3>
        </div>
        <div className="neu-inset p-4 rounded-xl text-sm text-muted-foreground flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          📍 Cadastre a localização da fazenda para ver a previsão climática.
          <Link to="/fazendas" className="text-primary font-semibold ml-1 hover:underline">Editar fazenda</Link>
        </div>
      </NeuCard>
    );
  }

  return (
    <NeuCard>
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-secondary" />
          <h3 className="font-semibold">☀️ Previsão Climática — Próximos 7 Dias</h3>
        </div>
        <button onClick={() => carregar(true)} disabled={carregando}
          className="neu-button px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5">
          <RefreshCw className={`w-3.5 h-3.5 ${carregando ? "animate-spin" : ""}`} /> Atualizar
        </button>
      </div>

      {!dados ? (
        <div className="neu-inset p-4 rounded-xl text-sm text-muted-foreground text-center">
          {carregando ? "Carregando previsão..." : "Não foi possível obter previsão. Tente novamente."}
        </div>
      ) : (
        <div className="flex overflow-x-auto pb-2 -mx-2 px-2 snap-x snap-mandatory md:grid md:grid-cols-7 md:overflow-visible gap-2 w-full">
          {dados.map((d) => (
            <div key={d.dataIso} className="neu-inset rounded-xl p-2 text-center flex-shrink-0 min-w-[80px] md:min-w-0 md:w-auto snap-start flex-1">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase">{d.diaSemana}</div>
              <div className="text-[10px] text-muted-foreground">{d.data}</div>
              <div className="text-2xl my-1">{d.emoji}</div>
              <div className={`text-[11px] font-bold ${corET0(d.et0)}`}>ET₀ {d.et0}</div>
              <div className={`text-[10px] font-semibold mt-0.5 ${corChuva(d.chuva)}`}>🌧 {d.chuva}</div>
              <div className="text-[10px] text-muted-foreground mt-1 font-bold">{d.tmax}° / {d.tmin}°</div>
            </div>
          ))}
        </div>
      )}
    </NeuCard>
  );
}
