// Garante que o cliente Supabase encontre URL/anon key mesmo se o build
// não tiver substituído as variáveis VITE_* (acontece em alguns bundles
// publicados/share preview). URL e anon key são públicos por design.
const SUPABASE_URL = "https://qjmcozgprfprsqyyoppm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbWNvemdwcmZwcnNxeXlvcHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODA4NzQsImV4cCI6MjA5Mzg1Njg3NH0.0bb_X1BABMg4EKpa0sS0okGS4ZeiwO4oR2t-cplQwVA";

if (typeof window !== "undefined") {
  const g = globalThis as any;
  g.process = g.process ?? {};
  g.process.env = g.process.env ?? {};
  if (!g.process.env.SUPABASE_URL) g.process.env.SUPABASE_URL = SUPABASE_URL;
  if (!g.process.env.SUPABASE_PUBLISHABLE_KEY)
    g.process.env.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;
}

export {};
