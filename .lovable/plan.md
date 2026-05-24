## Problema

O PWA está publicado corretamente em `irrixv3.lovable.app` (manifest, service worker e ícones respondem 200), mas o botão "Instalar IrriX" só aparece quando o navegador dispara o evento `beforeinstallprompt`. Esse evento:

- **NUNCA dispara no iOS (Safari/Chrome iOS)** — por isso usuários de iPhone/iPad nunca veem o botão.
- No **Chrome/Edge desktop e Android** só dispara após a heurística de engajamento (usuário precisa interagir alguns segundos com o site, manifest válido, SW ativo e HTTPS).
- Pode ser bloqueado se o manifest tiver alertas (faltando `id`, ícones `maskable`, etc.).

## O que será feito

### 1. `public/manifest.json` — endurecer o manifest
- Adicionar campo `id: "/"` (recomendado pelo Chrome, evita duplicar instalações).
- Adicionar uma entrada de ícone com `purpose: "maskable"` (usando o 512x512) para passar nos requisitos de "installability" mais recentes do Chrome/Android.
- Manter o restante intacto.

### 2. `index.html` — meta tags
- Adicionar `<meta name="mobile-web-app-capable" content="yes">` (sucessor do `apple-mobile-web-app-capable`, exigido pelo Chrome para esconder o aviso no DevTools).

### 3. `src/components/InstallButton.tsx` — suportar iOS e fallback
- Detectar iOS Safari (onde `beforeinstallprompt` não existe) e mostrar um botão alternativo que, ao clicar, abre um pequeno modal/tooltip com instruções: **"Toque em Compartilhar ▸ Adicionar à Tela de Início"** com ícone ilustrativo.
- Garantir que o botão não some imediatamente em desktop antes da heurística: manter o listener registrado o tempo todo (já está) e logar no console quando `beforeinstallprompt` é capturado para facilitar diagnóstico.
- Continuar respeitando: já instalado (standalone) → não mostra; dispensado na sessão → não mostra.

### 4. Verificação pós-deploy
Após publicar, validar em:
- Chrome desktop: o ícone de instalar deve aparecer na barra de endereço após ~10s de interação, e o botão flutuante "Instalar IrriX" deve surgir.
- Android Chrome: idem, mais o banner nativo.
- iOS Safari: o novo botão de instruções deve aparecer com o passo a passo "Compartilhar → Adicionar à Tela de Início".

## Fora do escopo

- Não vou alterar o service worker / `vite.config.ts` (já está funcionando, retorna 200).
- Não vou mexer no Lovable Cloud, autenticação ou backend.
- Mudanças em `start_url`/`scope`/`display` não se propagam para PWAs já instalados — usuários que já adicionaram à tela precisariam reinstalar (não é o caso aqui).

## Observação

Lembre que mudanças de frontend só ficam ativas em `irrixv3.lovable.app` depois de clicar em **Publish → Update** no editor.
