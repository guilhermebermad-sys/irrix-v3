# Plano

## 1. Login com Google
- Habilitar provider Google via `configure_social_auth(["google"])` — usa credenciais gerenciadas do Lovable Cloud (sem necessidade de chaves).
- Adicionar botão "Continuar com Google" em **`src/pages/Login.tsx`** e em **`src/pages/Cadastro.tsx`** (logo abaixo do divisor "ou"), usando `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" })` do módulo gerado em `src/integrations/lovable`.
- Estilo neumórfico consistente com o resto do app, com ícone do Google.

## 2. Ajustes na Landing (`src/components/landing/Sections.tsx`)

**Footer (linhas 575–586):**
- Trocar `📧 contato@irrix.com.br` → `📧 irrixapp@gmail.com`
- Remover linha `📱 WhatsApp: (XX) XXXXX-XXXX`
- Remover linha `🌎 irrix.com.br`

**SocialProof (linha 27–30):**
- Remover o bloco com `★★★★★ 4.9/5 de satisfação · +500+ talhões monitorados` (mantém apenas os ícones das culturas e APIs climáticas acima).

## Fora de escopo
- Nenhuma mudança em backend, RLS, ou outras páginas além das listadas.
