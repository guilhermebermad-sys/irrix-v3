DROP POLICY IF EXISTS "caderno_fotos_public_read" ON storage.objects;
CREATE POLICY "caderno_fotos_user_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'caderno-fotos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );