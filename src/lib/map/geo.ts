// Utilities for polygon area + centroide on geographic coords.
export interface LatLon { lat: number; lon: number; }

const R = 6371000; // earth radius (m)

// Spherical excess polygon area in m² then converted to ha.
// Uses simple equirectangular projection around mean latitude (good for small fields).
export function areaHaFromPolygon(coords: LatLon[]): number {
  if (coords.length < 3) return 0;
  const meanLat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
  const cosLat = Math.cos((meanLat * Math.PI) / 180);
  const pts = coords.map((c) => ({
    x: ((c.lon * Math.PI) / 180) * R * cosLat,
    y: ((c.lat * Math.PI) / 180) * R,
  }));
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  const m2 = Math.abs(s) / 2;
  return +(m2 / 10000).toFixed(4);
}

export function centroide(coords: LatLon[]): LatLon | null {
  if (!coords.length) return null;
  const lat = coords.reduce((s, c) => s + c.lat, 0) / coords.length;
  const lon = coords.reduce((s, c) => s + c.lon, 0) / coords.length;
  return { lat: +lat.toFixed(7), lon: +lon.toFixed(7) };
}

export function corPorPercCad(p: number | null): {
  fill: string;
  stroke: string;
  label: string;
  fillOpacity: number;
  pulse: boolean;
} {
  if (p == null)
    return { fill: "#94a3b8", stroke: "#64748b", label: "📋 Sem dados", fillOpacity: 0.3, pulse: false };
  
  if (p > 100) return { fill: "#0891b2", stroke: "#155e75", label: "💧 Transbordamento", fillOpacity: 0.6, pulse: false };
  if (p >= 80) return { fill: "#10b981", stroke: "#047857", label: "✅ Adequado", fillOpacity: 0.4, pulse: false };
  if (p >= 50) return { fill: "#f59e0b", stroke: "#b45309", label: "👍 Atenção", fillOpacity: 0.4, pulse: false };
  if (p >= 20) return { fill: "#f97316", stroke: "#c2410c", label: "🚨 Baixa Disponibilidade", fillOpacity: 0.6, pulse: false };
  return { fill: "#ef4444", stroke: "#991b1b", label: "🔴 Crítico (Irrigar)", fillOpacity: 0.7, pulse: true };
}
