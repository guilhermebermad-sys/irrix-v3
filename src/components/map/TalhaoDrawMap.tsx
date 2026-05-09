import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Pencil, RotateCcw, Check, Layers, MapPin, Undo2, X } from "lucide-react";
import { areaHaFromPolygon, centroide, LatLon } from "@/lib/map/geo";

interface Props {
  initialCenter?: { lat: number; lon: number } | null;
  initialPolygon?: LatLon[] | null;
  onConfirm: (data: { coords: LatLon[]; areaHa: number; centroide: LatLon }) => void;
}

const TILES = {
  map: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: "© OpenStreetMap",
  },
  sat: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri",
  },
};

export function TalhaoDrawMap({ initialCenter, initialPolygon, onConfirm }: Props) {
  const mapDiv = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const polyRef = useRef<L.Polygon | null>(null);
  const previewRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [coords, setCoords] = useState<LatLon[]>(initialPolygon ?? []);
  const [tileMode, setTileMode] = useState<"map" | "sat">("sat");

  // init map
  useEffect(() => {
    if (!mapDiv.current || mapRef.current) return;
    const center: [number, number] = initialCenter
      ? [initialCenter.lat, initialCenter.lon]
      : [-15.78, -47.93];
    const map = L.map(mapDiv.current).setView(center, initialCenter ? 16 : 4);
    const tile = L.tileLayer(TILES[tileMode].url, { attribution: TILES[tileMode].attr, maxZoom: 19 });
    tile.addTo(map);
    tileRef.current = tile;
    mapRef.current = map;

    if (initialPolygon && initialPolygon.length >= 3) {
      polyRef.current = L.polygon(initialPolygon.map((c) => [c.lat, c.lon] as [number,number]), {
        color: "#10b981",
        weight: 2,
        fillOpacity: 0.3,
      }).addTo(map);
      map.fitBounds(polyRef.current.getBounds(), { padding: [20, 20] });
    }
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  // switch tile
  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    mapRef.current.removeLayer(tileRef.current);
    const t = L.tileLayer(TILES[tileMode].url, { attribution: TILES[tileMode].attr, maxZoom: 19 });
    t.addTo(mapRef.current);
    tileRef.current = t;
  }, [tileMode]);

  // re-render preview line + markers
  const redraw = (current: LatLon[]) => {
    const map = mapRef.current!;
    if (previewRef.current) map.removeLayer(previewRef.current);
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    if (polyRef.current) {
      map.removeLayer(polyRef.current);
      polyRef.current = null;
    }
    if (current.length >= 1) {
      previewRef.current = L.polyline(
        current.map((c) => [c.lat, c.lon] as [number,number]),
        { color: "#06b6d4", weight: 2, dashArray: "6 6" }
      ).addTo(map);
      current.forEach((c, i) => {
        const m = L.circleMarker([c.lat, c.lon], {
          radius: 5,
          color: i === 0 ? "#10b981" : "#06b6d4",
          fillColor: "#fff",
          fillOpacity: 1,
          weight: 2,
        }).addTo(map);
        markersRef.current.push(m);
      });
    }
  };

  // Drawing handlers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!drawing) return;
    const onClick = (e: L.LeafletMouseEvent) => {
      const next = [...coords, { lat: +e.latlng.lat.toFixed(7), lon: +e.latlng.lng.toFixed(7) }];
      setCoords(next);
      redraw(next);
    };
    const onDbl = () => {
      if (coords.length >= 3) finalize(coords);
    };
    map.on("click", onClick);
    map.on("dblclick", onDbl);
    map.doubleClickZoom.disable();
    return () => {
      map.off("click", onClick);
      map.off("dblclick", onDbl);
      map.doubleClickZoom.enable();
    };
  }, [drawing, coords]);

  const finalize = (c: LatLon[]) => {
    if (c.length < 3) return;
    setDrawing(false);
    const map = mapRef.current!;
    if (previewRef.current) map.removeLayer(previewRef.current);
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    polyRef.current = L.polygon(c.map((p) => [p.lat, p.lon] as [number,number]), {
      color: "#10b981",
      weight: 2,
      fillOpacity: 0.3,
    }).addTo(map);
    map.fitBounds(polyRef.current.getBounds(), { padding: [20, 20] });
  };

  const start = () => {
    setCoords([]);
    setDrawing(true);
    if (polyRef.current) mapRef.current!.removeLayer(polyRef.current);
    polyRef.current = null;
    redraw([]);
  };
  const reset = () => {
    setCoords([]);
    setDrawing(true);
    if (polyRef.current) mapRef.current!.removeLayer(polyRef.current);
    polyRef.current = null;
    redraw([]);
  };
  const confirm = () => {
    const ar = areaHaFromPolygon(coords);
    const ct = centroide(coords);
    if (!ct) return;
    onConfirm({ coords, areaHa: ar, centroide: ct });
  };
  const useLoc = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      mapRef.current!.setView([pos.coords.latitude, pos.coords.longitude], 17);
    });
  };

  const area = areaHaFromPolygon(coords);
  return (
    <div className="space-y-3">
      <div className="relative" style={{ height: 350 }}>
        <div ref={mapDiv} className="absolute inset-0 rounded-xl overflow-hidden neu-inset" />
        <div className="absolute top-2 right-2 z-[400] flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setTileMode((m) => (m === "map" ? "sat" : "map"))}
            className="neu-button px-2 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 bg-background"
            title="Alternar mapa/satélite"
          >
            <Layers className="w-3.5 h-3.5" /> {tileMode === "map" ? "Satélite" : "Mapa"}
          </button>
          <button
            type="button"
            onClick={useLoc}
            className="neu-button px-2 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 bg-background"
            title="Minha localização"
          >
            <MapPin className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        {!drawing && coords.length === 0 && (
          <button type="button" onClick={start} className="neu-button px-3 py-2 rounded-lg font-semibold inline-flex items-center gap-1.5">
            <Pencil className="w-4 h-4" /> ✏️ Desenhar Talhão
          </button>
        )}
        {drawing && (
          <>
            <span className="text-xs text-muted-foreground w-full">
              Toque no mapa para adicionar vértices ({coords.length} pontos). Quando terminar, use o botão <b>Fechar polígono</b>.
            </span>
            {coords.length >= 1 && (
              <button
                type="button"
                onClick={() => { const next = coords.slice(0, -1); setCoords(next); redraw(next); }}
                className="neu-button px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5"
              >
                <Undo2 className="w-4 h-4" /> Desfazer ponto
              </button>
            )}
            {coords.length >= 3 && (
              <button
                type="button"
                onClick={() => finalize(coords)}
                className="neu-button px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Check className="w-4 h-4" /> ✓ Fechar polígono
              </button>
            )}
            <button
              type="button"
              onClick={() => { setDrawing(false); setCoords([]); redraw([]); }}
              className="neu-button px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5 text-destructive"
            >
              <X className="w-4 h-4" /> Cancelar
            </button>
          </>
        )}
        {!drawing && coords.length >= 3 && (
          <>
            <span className="font-semibold text-primary">
              Área calculada: {area.toFixed(2)} ha
            </span>
            <button type="button" onClick={reset} className="neu-button px-3 py-2 rounded-lg text-sm inline-flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4" /> Redesenhar
            </button>
            <button
              type="button"
              onClick={confirm}
              className="neu-button px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-1.5 text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Check className="w-4 h-4" /> Confirmar delimitação
            </button>
          </>
        )}
      </div>
    </div>
  );
}
