import { useState } from "react";
import { buscarDadosClimaticos, DadosClimaticos } from "@/lib/weather/weatherService";
import { Satellite, Loader2, CheckCircle, AlertTriangle, ChevronDown, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  latitude?: number | null;
  longitude?: number | null;
  data: string; // yyyy-MM-dd
  onDados: (d: DadosClimaticos) => void;
}

type Estado = "idle" | "loading" | "success" | "error";

export function WeatherFetchButton({ latitude, longitude, data, onDados }: Props) {
  const [estado, setEstado] = useState<Estado>("idle");
  const [erro, setErro] = useState<string | null>(null);
  const [dados, setDados] = useState<DadosClimaticos | null>(null);
  const [aberto, setAberto] = useState(false);

  const semCoords = latitude == null || longitude == null;

  const buscar = async () => {
    if (semCoords) return;
    setEstado("loading"); setErro(null);
    const r = await buscarDadosClimaticos(latitude!, longitude!, data);
    if (r.sucesso === true) {
      setDados(r); setEstado("success"); onDados(r); setAberto(true);
    } else {
      setErro(r.erro); setEstado("error");
    }
  };

  if (semCoords) {
    return (
      <div className="neu-inset p-3 rounded-xl text-sm text-warning flex items-center gap-2 flex-wrap">
        <MapPin className="w-4 h-4" />
        ⚠ Cadastre a localização (lat/lon) da fazenda para usar esta função.
        <Link to="/fazendas" className="text-primary font-semibold ml-1 hover:underline">Editar fazenda</Link>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={buscar}
        disabled={estado === "loading"}
        className="w-full neu-button px-4 py-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 text-white disabled:opacity-70"
        style={{
          background: estado === "success"
            ? "hsl(var(--primary))"
            : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))"
        }}
      >
        {estado === "loading" && <><Loader2 className="w-4 h-4 animate-spin" /> ⏳ Consultando NASA POWER...</>}
        {estado === "idle" && <><Satellite className="w-4 h-4" /> 🛰 Buscar ET₀ e Chuva Automaticamente</>}
        {estado === "success" && <><CheckCircle className="w-4 h-4" /> ✅ Dados climáticos obtidos</>}
        {estado === "error" && <><AlertTriangle className="w-4 h-4" /> ⚠️ Não foi possível obter dados</>}
      </button>

      {estado === "idle" && (
        <div className="text-[10px] text-center text-muted-foreground">NASA POWER · Open-Meteo · Grátis · Sem chave de API</div>
      )}

      {estado === "error" && erro && (
        <div className="text-xs text-destructive text-center">{erro} — Insira ET₀ manualmente ou tente novamente.</div>
      )}

      {estado === "success" && dados && (
        <>
          <div className="neu-inset px-3 py-2 rounded-xl text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-0.5">
            <span>🛰 {dados.fonte} · {dados.metodo}</span>
            <span>📅 {dados.data}</span>
            <span>🌡 {dados.tmax}°C / {dados.tmin}°C</span>
            {dados.radiacao != null && <span>☀️ Rad: {dados.radiacao} MJ/m²</span>}
            {dados.vento != null && <span>💨 {dados.vento} m/s</span>}
          </div>

          <div className="neu-inset rounded-xl">
            <button onClick={() => setAberto(s => !s)}
              className="w-full px-3 py-2 flex items-center justify-between text-sm font-semibold">
              <span>🌤 Dados Climáticos do Dia</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${aberto ? "rotate-180" : ""}`} />
            </button>
            {aberto && (
              <div className="px-3 pb-3 grid grid-cols-2 gap-1.5 text-xs">
                <Linha label="🌡 Temp. Máxima" v={`${dados.tmax} °C`} />
                <Linha label="🌡 Temp. Mínima" v={`${dados.tmin} °C`} />
                <Linha label="🌡 Temp. Média" v={`${dados.tmed} °C`} />
                {dados.umidade != null && <Linha label="💧 Umidade Rel." v={`${dados.umidade} %`} />}
                {dados.vento != null && <Linha label="🌬 Vento (2m)" v={`${dados.vento} m/s`} />}
                {dados.radiacao != null && <Linha label="☀️ Radiação Solar" v={`${dados.radiacao} MJ/m²/dia`} />}
                <Linha label="🌧 Precipitação" v={`${dados.chuva} mm`} />
                <Linha label="📊 ET₀ Calculada" v={`${dados.et0} mm/dia`} />
                <div className="col-span-2 mt-1 pt-2 border-t border-border/50 text-[10px] text-muted-foreground space-y-0.5">
                  <div>Fonte: {dados.fonte}</div>
                  <div>Método: {dados.metodo}</div>
                  <div>Coords: {dados.coordenadas.latitude.toFixed(4)}, {dados.coordenadas.longitude.toFixed(4)}</div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Linha({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex justify-between gap-2 px-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
