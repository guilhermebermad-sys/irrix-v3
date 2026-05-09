-- Melhoria 2: campos de polígono em talhoes
ALTER TABLE public.talhoes
  ADD COLUMN IF NOT EXISTS coordenadas_poligono JSONB,
  ADD COLUMN IF NOT EXISTS area_calculada_ha NUMERIC(10,4),
  ADD COLUMN IF NOT EXISTS centroide_lat NUMERIC(10,7),
  ADD COLUMN IF NOT EXISTS centroide_lon NUMERIC(10,7);

-- Melhoria 4: Caderno de Campo
CREATE TABLE IF NOT EXISTS public.caderno_campo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  talhao_id UUID,
  fazenda_id UUID,
  data DATE NOT NULL,
  categoria TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  produto TEXT,
  dose TEXT,
  unidade_dose TEXT,
  area_aplicada NUMERIC(10,2),
  custo_unitario NUMERIC(10,2),
  custo_total NUMERIC(10,2),
  responsavel TEXT,
  condicao_clima TEXT,
  fotos_urls TEXT[],
  dados_extras JSONB,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.caderno_campo ENABLE ROW LEVEL SECURITY;

CREATE POLICY caderno_select_own ON public.caderno_campo
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY caderno_insert_own ON public.caderno_campo
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY caderno_update_own ON public.caderno_campo
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY caderno_delete_own ON public.caderno_campo
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_caderno_user_data ON public.caderno_campo(user_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_caderno_talhao ON public.caderno_campo(talhao_id);

-- Storage bucket para fotos
INSERT INTO storage.buckets (id, name, public)
VALUES ('caderno-fotos', 'caderno-fotos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "caderno_fotos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'caderno-fotos');
CREATE POLICY "caderno_fotos_user_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'caderno-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "caderno_fotos_user_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'caderno-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "caderno_fotos_user_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'caderno-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);