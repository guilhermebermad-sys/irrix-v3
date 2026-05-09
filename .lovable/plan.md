## Causa raiz

O build publicado (e o share preview, que reaproveita o mesmo bundle) não recebeu as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` substituídas pelo Vite. No console do `irrixv3.lovable.app` aparece:

> `[Supabase] Missing Supabase environment variable(s): SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY.`

`src/integrations/supabase/client.ts` é um arquivo auto-gerenciado (não pode ser editado) e lança `Error` no primeiro acesso ao `supabase`. Como `AuthProvider` importa `supabase` direto, o app trava no boot → tela preta.

A boa notícia: o próprio `client.ts` tem fallback para `process.env.SUPABASE_URL` / `process.env.SUPABASE_PUBLISHABLE_KEY`. Como esses valores são **públicos** (URL do projeto + anon key, já presentes no system prompt), basta populá-los no `globalThis.process.env` antes de qualquer import do supabase.

## Mudanças propostas

### 1. Novo arquivo `src/lib/supabaseEnvShim.ts`
Shim de ambiente, executado por efeito colateral no entrypoint. Apenas roda no browser e só preenche o que estiver faltando — não sobrescreve nada já injetado pelo Vite no preview normal.

```ts
// Garante que o cliente Supabase encontre URL/anon key mesmo se o build
// não tiver substituído as variáveis VITE_* (acontece em alguns bundles
// publicados/share preview). URL e anon key são públicos por design.
const SUPABASE_URL = "https://qjmcozgprfprsqyyoppm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqbWNvemdwcmZwcnNxeXlvcHBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyODA4NzQsImV4cCI6MjA5Mzg1Njg3NH0.0bb_X1BABMg4EKpa0sS0okGS4ZeiwO4oR2t-cplQwVA";

if (typeof window !== "undefined") {
  const g = globalThis as any;
  g.process = g.process ?? {};
  g.process.env = g.process.env ?? {};
  if (!g.process.env.SUPABASE_URL) g.process.env.SUPABASE_URL = SUPABASE_URL;
  if (!g.process.env.SUPABASE_PUBLISHABLE_KEY) g.process.env.SUPABASE_PUBLISHABLE_KEY = SUPABASE_PUBLISHABLE_KEY;
}
export {};
```

### 2. Editar `src/main.tsx`
Adicionar **a primeira linha** (antes de qualquer outro import):

```ts
import "./lib/supabaseEnvShim";
```

Essa ordem é crítica: o `supabase` é um Proxy lazy, e qualquer importação anterior que dispare `supabase.auth.*` antes do shim faria o erro voltar.

## Validação
1. Salvar mudanças → preview normal continua funcionando (shim é no-op se VITE vars já existem).
2. Republicar via botão **Update** no diálogo de publicação.
3. Abrir `https://irrixv3.lovable.app` em aba anônima → app deve carregar e ir pra tela de auth/dashboard normalmente.
4. Compartilhar share preview → mesma coisa.

## Fora do escopo
- **Não** editar `src/integrations/supabase/client.ts` nem `.env` (gerenciados pela plataforma).
- Não mexer em rotas, RLS, edge functions ou auth flow — o problema é puramente de bootstrap de ambiente no browser.
- Não trocar `client.server.ts` ou `auth-middleware.ts` (rodam no servidor com `process.env` real do Worker, não são afetados).

## Observação
Esse shim é uma rede de segurança. Se a plataforma corrigir a injeção de `VITE_*` no build publicado no futuro, ele simplesmente vira no-op (não sobrescreve nada). Pode ser removido depois sem impacto.
