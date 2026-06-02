# Plano: Teste grátis de 7 dias + tela de pagamento

## Visão geral
Cada novo usuário ganha 7 dias de acesso completo a partir do cadastro. Após esse período, é redirecionado para uma tela de pagamento (onde depois colocaremos os links Stripe). Duas contas terão acesso vitalício: `guinascifranco@gmail.com` e `irrixapp@gmail.com`.

## 1. Banco de dados
Adicionar colunas em `usuarios_perfil`:
- `trial_started_at` (timestamptz, default `now()`) — marca início do teste
- `plano` (text, default `'trial'`) — valores: `trial`, `ativo`, `vitalicio`, `expirado`
- `acesso_expira_em` (timestamptz) — calculado como `trial_started_at + 7 dias` no trigger

Atualizar `handle_new_user()` para já gravar `trial_started_at = now()` e definir `plano = 'vitalicio'` quando o email for um dos dois autorizados.

Backfill via insert tool:
- Para usuários existentes sem `trial_started_at`: setar = `created_at`
- Para os 2 emails autorizados: `plano = 'vitalicio'`

## 2. Hook de verificação de acesso
Criar `src/hooks/useAcessoPlano.ts`:
- Lê `usuarios_perfil` do usuário logado
- Retorna `{ plano, diasRestantes, expirado, vitalicio, loading }`
- Lógica: `vitalicio` ou `ativo` → liberado; `trial` → calcula dias restantes; se ≤ 0 → expirado

## 3. Bloqueio de rotas privadas
Em `src/components/layout/AppLayout.tsx`:
- Usar o hook; se `expirado` → `<Navigate to="/assinar" replace />`
- Mostrar banner sutil no `Header` quando em trial com dias restantes (ex: "Teste grátis: 3 dias restantes")

## 4. Tela de pagamento `/assinar`
Nova página `src/pages/Assinar.tsx` (rota pública pós-login):
- Visual neumórfico consistente com Login
- Mostra: "Seu teste de 7 dias terminou" + benefícios + placeholders para os botões/links Stripe (a serem fornecidos depois)
- Botão "Sair" e link para suporte (`irrixapp@gmail.com`)
- Quando o usuário enviar os links Stripe, substituímos os placeholders

Adicionar rota em `src/App.tsx`.

## 5. Fora do escopo
- Webhook Stripe / ativação automática do plano após pagamento (faremos quando os links chegarem)
- Cobrança recorrente / gestão de assinatura

## Detalhes técnicos
- Migration cria colunas + atualiza função `handle_new_user`
- Insert tool faz o backfill dos usuários atuais e marca os 2 emails como vitalício
- Sem alteração em RLS (perfil já tem políticas por `user_id`)
