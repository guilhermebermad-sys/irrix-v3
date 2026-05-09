
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "logos_public_read" ON storage.objects;
CREATE POLICY "logos_read_own" ON storage.objects FOR SELECT USING (
  bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]
);
