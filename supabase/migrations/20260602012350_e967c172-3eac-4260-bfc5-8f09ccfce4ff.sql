
ALTER TABLE public.usuarios_perfil
  ADD COLUMN IF NOT EXISTS trial_started_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS plano text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS acesso_expira_em timestamptz;

UPDATE public.usuarios_perfil
SET acesso_expira_em = COALESCE(acesso_expira_em, trial_started_at + interval '7 days');

UPDATE public.usuarios_perfil
SET plano = 'vitalicio', acesso_expira_em = NULL
WHERE lower(email) IN ('guinascifranco@gmail.com','irrixapp@gmail.com');

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_plano text := 'trial';
  v_expira timestamptz := now() + interval '7 days';
BEGIN
  IF lower(NEW.email) IN ('guinascifranco@gmail.com','irrixapp@gmail.com') THEN
    v_plano := 'vitalicio';
    v_expira := NULL;
  END IF;

  INSERT INTO public.usuarios_perfil (user_id, nome, email, trial_started_at, plano, acesso_expira_em)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email), NEW.email, now(), v_plano, v_expira)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
