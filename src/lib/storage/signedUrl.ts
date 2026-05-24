import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const cache = new Map<string, { url: string; exp: number }>();

export function extractStoragePath(bucket: string, value: string | null | undefined): string {
  if (!value) return "";
  const pub = `/storage/v1/object/public/${bucket}/`;
  const sig = `/storage/v1/object/sign/${bucket}/`;
  let i = value.indexOf(pub);
  if (i >= 0) return value.slice(i + pub.length);
  i = value.indexOf(sig);
  if (i >= 0) return value.slice(i + sig.length).split("?")[0];
  return value;
}

export async function signedUrl(
  bucket: string,
  pathOrUrl: string | null | undefined,
  expires = 3600
): Promise<string> {
  if (!pathOrUrl) return "";
  const path = extractStoragePath(bucket, pathOrUrl);
  if (!path) return "";
  const key = `${bucket}:${path}`;
  const now = Date.now();
  const c = cache.get(key);
  if (c && c.exp > now + 60_000) return c.url;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, expires);
  if (data?.signedUrl) {
    cache.set(key, { url: data.signedUrl, exp: now + expires * 1000 });
    return data.signedUrl;
  }
  return "";
}

export function useSignedUrl(bucket: string, pathOrUrl: string | null | undefined) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    let active = true;
    signedUrl(bucket, pathOrUrl).then((u) => { if (active) setUrl(u); });
    return () => { active = false; };
  }, [bucket, pathOrUrl]);
  return url;
}
