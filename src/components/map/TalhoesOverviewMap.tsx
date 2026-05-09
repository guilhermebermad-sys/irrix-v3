import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Layers, MapPin, Maximize2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { corPorPercCad, LatLon } from "@/lib/map/geo";
import { CropImage } from "@/components/CropImage";
import { getCropImage } from "@/lib/cultivos/cropImages";

export interface TalhaoMapItem {
  id: string;
  nome: string;
  cultura: string | null;
  estadio: string | null;
  area: number | null;
  poligono: LatLon[] | null;
  centroideLat: number | null;
  centroideLon: number | null;
  percCad: number | null;
  arm: number | null;
  et0: number | null;
  ultimaData: string | null;
}

const TILES = {
  map: { url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attr: "© OpenStreetMap" },
  sat: { url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", attr: "© Esri" },
};

interface Props {
  talhoes: TalhaoMapItem[];
  fazendaCentro?: { lat: number; lon: number } | null;
  height?: number;
}

export function TalhoesOverviewMap({ talhoes, fazendaCentro, height }: Props) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const [tileMode, setTileMode] = useState<"map" | "sat">("sat");
  const [selecionado, setSelecionado] = useState<TalhaoMapItem | null>(null);

  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const map = L.map(mapDiv.current).setView(
      fazendaCentro ? [fazendaCentro.lat, fazendaCentro.lon] : [-15.78, -47.93],
      fazendaCentro ? 14 : 4
    );
    const tl = L.tileLayer(TILES[tileMode].url, { attribution: TILES[tileMode].attr, maxZoom: 19 });
    tl.addTo(map);
    tileRef.current = tl;
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    mapRef.current.removeLayer(tileRef.current);
    const t = L.tileLayer(TILES[tileMode].url, { attribution: TILES[tileMode].attr, maxZoom: 19 });
    t.addTo(mapRef.current);
    tileRef.current = t;
  }, [tileMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];

    const bounds = L.latLngBounds([]);
    talhoes.forEach((t) => {
      const cor = corPorPercCad(t.percCad);
      const cropSrc = getCropImage(t.cultura);
      const tooltipHtml = `
        <div style="min-width:220px">
          <div style="display:flex;align-items:center;gap:8px;font-weight:600">
            <img src="${cropSrc}" width="28" height="28" style="object-fit:contain" />
            <span>${t.nome}</span>
          </div>
          <div style="font-size:11px;color:#64748b">${t.cultura ?? "—"}${t.estadio ? " · " + t.estadio : ""}</div>
          <div style="font-size:11px">Área: ${t.area ?? "—"} ha</div>
          <div style="font-size:11px">💧 AFD: ${t.percCad != null && !isNaN(t.percCad) ? t.percCad.toFixed(0) + "%" : "—"} · Arm: ${t.arm != null && !isNaN(t.arm) ? t.arm.toFixed(1) + "mm" : "—"}</div>
          <div style="font-size:11px">ET₀: ${t.et0 != null ? t.et0 + "mm" : "—"}</div>
          <div style="font-size:11px">Último: ${t.ultimaData ?? "—"}</div>
          <div style="font-size:11px;font-weight:600;margin-top:2px">Status: ${cor.label}</div>
        </div>`;

      if (t.poligono && t.poligono.length >= 3) {
        const poly = L.polygon(
          t.poligono.map((c) => [c.lat, c.lon] as [number,number]),
          {
            color: cor.stroke,
            weight: 2,
            fillColor: cor.fill,
            fillOpacity: cor.fillOpacity,
            className: cor.pulse ? "leaflet-pulse-poly" : undefined,
          }
        ).addTo(map);
        poly.bindTooltip(tooltipHtml, { sticky: true });
        poly.on("mouseover", () => poly.setStyle({ weight: 3 }));
        poly.on("mouseout", () => poly.setStyle({ weight: 2 }));
        poly.on("click", () => setSelecionado(t));
        layersRef.current.push(poly);
        bounds.extend(poly.getBounds());
      } else if (t.centroideLat && t.centroideLon) {
        const ic = L.divIcon({
          html: `<div style="width:22px;height:28px;background:${cor.fill};border:2px solid ${cor.stroke};border-radius:50% 50% 50% 0;transform:rotate(-45deg);"></div>`,
          className: "",
          iconSize: [22, 28],
          iconAnchor: [11, 28],
        });
        const m = L.marker([t.centroideLat, t.centroideLon], { icon: ic }).addTo(map);
        m.bindTooltip(tooltipHtml, { sticky: true });
        m.on("click", () => setSelecionado(t));
        layersRef.current.push(m);
        bounds.extend([t.centroideLat, t.centroideLon]);
      }
    });

    if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 16 });
  }, [talhoes]);

  const fitAll = () => {
    const map = mapRef.current!;
    const b = L.latLngBounds([]);
    layersRef.current.forEach((l: any) => {
      if (l.getBounds) b.extend(l.getBounds());
      else if (l.getLatLng) b.extend(l.getLatLng());
    });
    if (b.isValid()) map.fitBounds(b, { padding: [30, 30], maxZoom: 16 });
  };
  const myLoc = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((p) =>
      mapRef.current!.setView([p.coords.latitude, p.coords.longitude], 15)
    );
  };

  const h = height ?? 450;
  return (
    <div className="relative" style={{ height: h }}>
      <div ref={mapDiv} className="absolute inset-0 rounded-xl overflow-hidden neu-inset" />

      <div className="absolute top-2 right-2 z-[400] flex flex-col gap-2">
        <button onClick={() => setTileMode((m) => (m === "map" ? "sat" : "map"))}
          className="neu-button px-2 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 bg-background">
          <Layers className="w-3.5 h-3.5" /> {tileMode === "map" ? "Satélite" : "Mapa"}
        </button>
        <button onClick={fitAll} className="neu-button px-2 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 bg-background">
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button onClick={myLoc} className="neu-button px-2 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 bg-background">
          <MapPin className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="absolute bottom-2 left-2 z-[400] neu-sm bg-background/95 backdrop-blur p-3 rounded-lg text-[11px] space-y-1">
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: "#0891b2" }} /> Transbordamento (&gt;100%)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: "#10b981" }} /> Adequado (&gt;80%)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: "#f59e0b" }} /> Atenção (50–80%)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: "#f97316" }} /> Baixa Disp. (20–50%)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: "#ef4444" }} /> Crítico (&lt;20%)</div>
        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded" style={{ background: "#94a3b8" }} /> Sem dados</div>
      </div>

      {selecionado && (
        <div className="absolute inset-y-0 right-0 w-80 max-w-[85%] z-[500] neu bg-background p-5 overflow-y-auto animate-slide-in-right">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <CropImage cultura={selecionado.cultura} estadio={selecionado.estadio} size={48} withRing />
              <h3 className="font-display font-bold text-lg">{selecionado.nome}</h3>
            </div>
            <button onClick={() => setSelecionado(null)} className="neu-button p-1.5 rounded-lg"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-2 text-sm">
            <Row k="Cultura" v={selecionado.cultura ?? "—"} />
            <Row k="Estádio" v={selecionado.estadio ?? "—"} />
            <Row k="Área" v={`${selecionado.area ?? "—"} ha`} />
            <Row k="% AFD" v={selecionado.percCad != null && !isNaN(selecionado.percCad) ? `${selecionado.percCad.toFixed(0)}%` : "—"} />
            <Row k="Armazenamento" v={selecionado.arm != null && !isNaN(selecionado.arm) ? `${selecionado.arm.toFixed(1)} mm` : "—"} />
            <Row k="ET₀ último dia" v={selecionado.et0 != null ? `${selecionado.et0} mm` : "—"} />
            <Row k="Último registro" v={selecionado.ultimaData ?? "—"} />
            <div className="pt-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full neu-sm">{corPorPercCad(selecionado.percCad).label}</span>
            </div>
          </div>
          <Link to="/manejo" className="mt-5 block w-full neu-button text-center py-2.5 rounded-xl font-semibold text-white"
            style={{ background: "var(--gradient-brand)" }}>
            Ir para Manejo Diário
          </Link>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold text-right">{v}</span>
    </div>
  );
}
