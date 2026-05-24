-- 1) Tornar buckets privados
UPDATE storage.buckets SET public = false WHERE id IN ('logos','caderno-fotos');

-- 2) Garantir policies de objects por dono (pasta = user_id)
-- Drop existing equivalent policies if any (idempotent guard via name)
DO $$ BEGIN
  -- LOGOS
  DROP POLICY IF EXISTS "logos_owner_select" ON storage.objects;
  DROP POLICY IF EXISTS "logos_owner_insert" ON storage.objects;
  DROP POLICY IF EXISTS "logos_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "logos_owner_delete" ON storage.objects;
  DROP POLICY IF EXISTS "caderno_owner_select" ON storage.objects;
  DROP POLICY IF EXISTS "caderno_owner_insert" ON storage.objects;
  DROP POLICY IF EXISTS "caderno_owner_update" ON storage.objects;
  DROP POLICY IF EXISTS "caderno_owner_delete" ON storage.objects;
END $$;

CREATE POLICY "logos_owner_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "logos_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "caderno_owner_select" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'caderno-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "caderno_owner_insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'caderno-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "caderno_owner_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'caderno-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "caderno_owner_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'caderno-fotos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3) Realtime: restringir assinatura por topic = 'user:<auth.uid()>'
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "realtime_user_scoped_topics" ON realtime.messages;
CREATE POLICY "realtime_user_scoped_topics" ON realtime.messages
  FOR SELECT TO authenticated
  USING (realtime.topic() = 'user:' || auth.uid()::text);