# Plano: Importar projeto IRRIX – Precision Irrigation

O zip enviado é um app **Vite + React 18 + React Router DOM + Supabase + PWA** já completo (115 arquivos, ~3,5 MB de código), com páginas em português (Dashboard, Fazendas, Manejo Diário, Histórico, Alertas, Caderno de Campo, Configurações, Auth, Onboarding, Landing), integração Leaflet (mapas), Recharts, jsPDF, XLSX e 6 migrações SQL do Supabase.

O template atual deste projeto Lovable é **TanStack Start** (estrutura totalmente diferente, com `src/routes/` baseado em arquivos). Reescrever 115 arquivos para TanStack seria arriscado e demorado. A abordagem mais segura é **substituir o template pelo projeto enviado**, mantendo a stack original (Vite + React Router), e religar o backend pelo Lovable Cloud.

## O que vai ser feito

1. **Limpar o template TanStack atual**
   - Remover `src/routes/`, `src/router.tsx`, `src/server.ts`, `src/start.ts`, `src/routeTree.gen.ts`, `wrangler.jsonc`, `vite.config.ts`, `package.json`, `src/styles.css`, etc.

2. **Copiar o conteúdo do zip para o projeto**
   - `src/` completo (App.tsx, main.tsx, pages/, components/, contexts/, hooks/, integrations/, lib/, assets/, test/)
   - `index.html`, `vite.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `tsconfig*.json`, `eslint.config.js`, `vitest.config.ts`, `components.json`
   - `public/` (ícones PWA, manifest, etc.)
   - `package.json` (todas as dependências: leaflet, jspdf, xlsx, recharts, supabase-js, react-router-dom, vite-plugin-pwa, etc.)

3. **Instalar dependências** com `bun install`.

4. **Habilitar Lovable Cloud** (Supabase gerenciado) — necessário porque o app usa autenticação, banco de dados, RLS e armazenamento.

5. **Aplicar as 6 migrações SQL** (`supabase/migrations/*.sql`) no banco do Lovable Cloud, em ordem cronológica, criando tabelas, políticas RLS, funções e seeds.

6. **Religar o cliente Supabase** — o `src/integrations/supabase/client.ts` original lê `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`. Vou ajustá-lo para usar as variáveis injetadas pelo Lovable Cloud (ou regenerar com URL/anon key do projeto Cloud).

7. **Verificar build e preview** — confirmar que o app carrega, a tela de Landing/Login aparece e o Service Worker (PWA) registra sem erros.

## Detalhes técnicos

- **Stack final**: Vite 5 + React 18 + TypeScript + Tailwind 3 + shadcn/ui + React Router v6 + Supabase + vite-plugin-pwa.
- **Não vou converter para TanStack Start** — o custo/risco de reescrever todas as rotas, loaders e tipos não compensa, e o usuário pediu "criar o projeto desse código" (preservar como está).
- **Migrações SQL**: serão aplicadas via ferramenta de migração do Lovable Cloud (não via `psql`), pois criam tabelas e políticas.
- **Secrets**: nenhuma chave externa nos arquivos enviados além das do Supabase. Se o app usar APIs externas (clima, etc.) descobrirei ao ler `lib/` e pedirei as chaves antes de seguir.
- **PWA**: `vite-plugin-pwa` já configurado no `vite.config.ts` original — mantido.

## Pontos que podem precisar de ajuste depois

- Caso alguma migração dependa de extensões Postgres não habilitadas no Cloud, precisarei adaptar.
- Se o `package.json` original tiver alguma dependência incompatível com o ambiente de build atual, faço o downgrade/substituição pontual.
- Eventuais imports quebrados pós-cópia serão corrigidos individualmente.

Posso seguir com a importação?
