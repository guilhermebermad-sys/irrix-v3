## Diagnóstico

Hoje a rota `/` carrega o `Dashboard` (protegido por `AppLayout`). Quem abre o link público é redirecionado para `/auth` ou cai em `NotFound` no build publicado. A rota `/landing` existe no código, mas o comportamento desejado é: **`/` sempre mostra a landing**, independentemente de login.

Hoje:
```
/              → Dashboard (protegido)  ← causa do problema
/landing       → Landing
/auth, /login, /cadastro, ...  → públicas
/fazendas, /manejo, ...        → protegidas
```

Alvo:
```
/              → Landing (pública, sempre)
/landing       → Landing (alias, mantido para não quebrar links existentes)
/dashboard     → Dashboard (protegido)
/fazendas, /manejo, ...        → protegidas (sem mudança)
```

## Mudanças

### 1) `src/App.tsx` — reorganizar rotas
- Adicionar `<Route path="/" element={<Landing />} />` como rota pública.
- Trocar a rota do Dashboard dentro do `AppLayout` de `path="/"` para `path="/dashboard"`.
- Manter `/landing` como alias (sem remover) para preservar qualquer link externo já compartilhado.

### 2) Atualizar referências internas de `/` → `/dashboard`
Trocar apenas onde "/" significava "ir para o app/Dashboard após login":
- `src/pages/Login.tsx` linhas 19 e 26 → `/dashboard`
- `src/pages/Auth.tsx` linhas 20 e 28 → `/dashboard`
- `src/pages/ResetPassword.tsx` linha 18 → `/dashboard`
- `src/pages/Onboarding.tsx` linha 30 (link "Ir para o dashboard") → `/dashboard`
- `src/components/layout/Sidebar.tsx` linha 9 (item "Dashboard" do menu) → `/dashboard` (e o `end={to === "/"}` na linha 82 passa a comparar com `/dashboard`)

### 3) `AppLayout` — manter
O `AppLayout` continua redirecionando usuários não autenticados para `/auth` quando tentam acessar áreas protegidas (`/dashboard`, `/fazendas`, etc.). Sem mudanças nele.

### 4) `src/pages/Index.tsx`
Verificar se ainda é referenciado em algum lugar; se não for, não mexer (não faz parte do escopo do bug).

## Validação

- Abrir `/` em aba anônima → carrega Landing (sem redirect).
- Abrir `/landing` → carrega Landing (alias).
- Clicar em "Já sou cliente" / "Teste Grátis" da landing → vai para `/login` / `/cadastro` (igual a hoje).
- Após login bem-sucedido → vai para `/dashboard` (novo caminho).
- Usuário logado abrindo `/` → vê a Landing (comportamento solicitado: "sempre a landing").
- Sidebar com "Dashboard" ativo em `/dashboard`.
- Rotas protegidas (`/fazendas`, `/manejo`, etc.) continuam exigindo login.

## Fora do escopo

- Sem alterações em estilo, conteúdo da landing ou layout.
- Sem alterações em autenticação, RLS ou Cloud.
- `Index.tsx` permanece intocado.

## Pós-deploy

Como a correção é frontend, será necessário **clicar em "Update" no diálogo de Publicar** para que o site publicado (`irrixv3.lovable.app`) reflita as mudanças.
