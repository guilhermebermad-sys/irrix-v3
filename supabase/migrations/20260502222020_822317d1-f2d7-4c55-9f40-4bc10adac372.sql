
-- PROFILE
CREATE TABLE public.usuarios_perfil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  crea TEXT,
  empresa TEXT,
  telefone TEXT,
  logo_url TEXT,
  unidade_lamina TEXT DEFAULT 'mm',
  unidade_volume TEXT DEFAULT 'm3',
  unidade_area TEXT DEFAULT 'ha',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.usuarios_perfil ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perfil_select_own" ON public.usuarios_perfil FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "perfil_insert_own" ON public.usuarios_perfil FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "perfil_update_own" ON public.usuarios_perfil FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "perfil_delete_own" ON public.usuarios_perfil FOR DELETE USING (auth.uid() = user_id);

-- FAZENDAS
CREATE TABLE public.fazendas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  municipio TEXT,
  estado TEXT,
  area_total NUMERIC,
  tipo_solo TEXT,
  cad NUMERIC,
  fonte_agua TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fazendas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fazendas_select_own" ON public.fazendas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fazendas_insert_own" ON public.fazendas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fazendas_update_own" ON public.fazendas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "fazendas_delete_own" ON public.fazendas FOR DELETE USING (auth.uid() = user_id);

-- TALHOES
CREATE TABLE public.talhoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fazenda_id UUID NOT NULL REFERENCES public.fazendas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  area NUMERIC,
  cultura TEXT,
  estadio_fenologico TEXT,
  kc_atual NUMERIC,
  data_plantio DATE,
  data_colheita DATE,
  tipo_sistema TEXT,
  espac_emissores NUMERIC,
  espac_linhas NUMERIC,
  vazao NUMERIC,
  pressao NUMERIC,
  eficiencia NUMERIC,
  arm_inicial NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.talhoes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "talhoes_select_own" ON public.talhoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "talhoes_insert_own" ON public.talhoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "talhoes_update_own" ON public.talhoes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "talhoes_delete_own" ON public.talhoes FOR DELETE USING (auth.uid() = user_id);

-- REGISTROS DIARIOS
CREATE TABLE public.registros_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talhao_id UUID NOT NULL REFERENCES public.talhoes(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  et0 NUMERIC,
  chuva NUMERIC,
  kc NUMERIC,
  etc NUMERIC,
  lamina_liquida NUMERIC,
  lamina_bruta NUMERIC,
  arm_inicial NUMERIC,
  arm_final NUMERIC,
  perc_cad NUMERIC,
  drenagem_profunda NUMERIC,
  taxa_aplicacao NUMERIC,
  tib NUMERIC,
  tempo_horas NUMERIC,
  diagnostico TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (talhao_id, data)
);
ALTER TABLE public.registros_diarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regs_select_own" ON public.registros_diarios FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "regs_insert_own" ON public.registros_diarios FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "regs_update_own" ON public.registros_diarios FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "regs_delete_own" ON public.registros_diarios FOR DELETE USING (auth.uid() = user_id);

-- ALERTAS
CREATE TABLE public.alertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  talhao_id UUID REFERENCES public.talhoes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lido BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alertas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alertas_select_own" ON public.alertas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "alertas_insert_own" ON public.alertas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "alertas_update_own" ON public.alertas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "alertas_delete_own" ON public.alertas FOR DELETE USING (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios_perfil (user_id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket para logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "logos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'logos');
CREATE POLICY "logos_upload_own" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_update_own" ON storage.objects FOR UPDATE USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_delete_own" ON storage.objects FOR DELETE USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
