import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

interface ProxyRequest {
  provider: 'metos' | 'davis';
  latitude: number;
  longitude: number;
  date: string; // yyyy-MM-dd
}

function bad(status: number, error: string) {
  return new Response(JSON.stringify({ sucesso: false, erro: error }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function callRemote(url: string, headers: Record<string, string>) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json', ...headers }, signal: ctrl.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } finally { clearTimeout(t); }
}

function mapMetos(d: any, lat: number, lon: number, isoDate: string) {
  const day = d?.day ?? d;
  const tmax = Number(day?.tmax ?? day?.airTempMax);
  const tmin = Number(day?.tmin ?? day?.airTempMin);
  const tmed = Number(day?.tmed ?? day?.airTempAvg ?? (tmax + tmin) / 2);
  const et0 = Number(day?.et0 ?? day?.evapotranspiration);
  const chuva = Number(day?.rain ?? day?.precipitation ?? 0);
  if ([tmax, tmin, et0].some((v) => Number.isNaN(v))) return null;
  return {
    sucesso: true, fonte: 'Open-Meteo' as const,
    metodo: 'Estação Metos (medido)',
    et0: +et0.toFixed(2), chuva: +chuva.toFixed(1),
    tmax: +tmax.toFixed(1), tmin: +tmin.toFixed(1), tmed: +tmed.toFixed(1),
    umidade: day?.rh ?? day?.humidity, vento: day?.wind ?? day?.windSpeed,
    radiacao: day?.solar ?? day?.solarRadiation,
    coordenadas: { latitude: lat, longitude: lon },
    data: isoDate.split('-').reverse().join('/'), dataIso: isoDate,
    obtidoEm: new Date().toISOString(),
  };
}

function mapDavis(d: any, lat: number, lon: number, isoDate: string) {
  const s = d?.sensors?.[0]?.data?.[0] ?? d;
  const tmax = Number(s?.temp_hi ?? s?.tmax);
  const tmin = Number(s?.temp_lo ?? s?.tmin);
  const tmed = Number(s?.temp_avg ?? s?.tmed ?? (tmax + tmin) / 2);
  const et0 = Number(s?.et_day ?? s?.et0 ?? 0);
  const chuva = Number(s?.rainfall_in ?? s?.rain ?? 0);
  if ([tmax, tmin].some((v) => Number.isNaN(v))) return null;
  return {
    sucesso: true, fonte: 'Open-Meteo' as const,
    metodo: 'Estação Davis (medido)',
    et0: +et0.toFixed(2), chuva: +chuva.toFixed(1),
    tmax: +tmax.toFixed(1), tmin: +tmin.toFixed(1), tmed: +tmed.toFixed(1),
    umidade: s?.hum_out ?? s?.humidity, vento: s?.wind_speed_avg ?? s?.wind,
    radiacao: s?.solar_rad_avg ?? s?.solar,
    coordenadas: { latitude: lat, longitude: lon },
    data: isoDate.split('-').reverse().join('/'), dataIso: isoDate,
    obtidoEm: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return bad(401, 'missing authorization');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: userData, error: userErr } = await supabase.auth.getUser();
    if (userErr || !userData.user) return bad(401, 'invalid token');

    const body = (await req.json()) as ProxyRequest;
    if (!body?.provider || !['metos', 'davis'].includes(body.provider)) return bad(400, 'invalid provider');
    if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') return bad(400, 'invalid coords');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date)) return bad(400, 'invalid date');

    const { data: perfil } = await supabase
      .from('usuarios_perfil').select('weather_config').eq('user_id', userData.user.id).maybeSingle();
    const cfg = (perfil?.weather_config as any)?.[body.provider];
    if (!cfg?.baseUrl) return bad(400, `${body.provider}: configure a baseUrl nas Configurações`);

    const stationId = cfg.extras?.stationId ?? (body.provider === 'metos' ? 'default' : '');
    const baseUrl = String(cfg.baseUrl).replace(/\/$/, '');
    const headers: Record<string, string> = {};
    if (cfg.apiKey) {
      headers[body.provider === 'metos' ? 'Authorization' : 'X-Api-Key'] =
        body.provider === 'metos' ? `Bearer ${cfg.apiKey}` : cfg.apiKey;
    }

    const url = body.provider === 'metos'
      ? `${baseUrl}/data/${stationId}/daily/${body.date}`
      : `${baseUrl}/current/${stationId}?date=${body.date}`;

    const remote = await callRemote(url, headers);
    const mapped = body.provider === 'metos'
      ? mapMetos(remote, body.latitude, body.longitude, body.date)
      : mapDavis(remote, body.latitude, body.longitude, body.date);

    if (!mapped) return bad(502, `${body.provider}: campos ausentes na resposta`);
    return new Response(JSON.stringify(mapped), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return bad(500, e?.message ?? 'erro inesperado');
  }
});
