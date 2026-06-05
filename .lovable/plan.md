## Objetivo
Inserir os 6 links de checkout Stripe nos lugares corretos: landing page (seção Planos) e página de expiração do teste grátis (`/assinar`).

## 1. Landing Page — Seção Planos (`src/components/landing/Sections.tsx`)
- Adicionar `monthlyUrl` e `annualUrl` ao objeto de cada plano (Básico, Pro, Consultor).
- Alterar o botão CTA de cada card: quando for link externo Stripe, usar `<a>` com `target="_blank" rel="noopener noreferrer"` em vez de `<Link>` interno.
- O toggle Mensal/Anual já existe; o botão deve apontar para o link correspondente à seleção atual.
- Ajustar textos dos CTAs para refletir a ação real de assinatura (ex: "Assinar Básico", "Assinar Pro", "Assinar Consultor").

Links a inserir:
| Plano | Mensal | Anual |
|---|---|---|
| Básico | https://buy.stripe.com/bJe8wPeNZ0nIc672Fb4gg01 | https://buy.stripe.com/dRm6oHcFRgmGc67enT4gg04 |
| Pro | https://buy.stripe.com/7sY8wP7lxgmGdab93z4gg02 | https://buy.stripe.com/14A9ATbBN9YigmnenT4gg05 |
| Consultor | https://buy.stripe.com/9B66oH35h0nI1rt4Nj4gg03 | https://buy.stripe.com/00w7sL49l4DYb233Jf4gg06 |

## 2. Página `/assinar` (`src/pages/Assinar.tsx`)
- Substituir o botão desabilitado "Assinar plano (em breve)" por um link ativo que redireciona o usuário para a seção de planos na landing page (`/landing#planos`).
- Manter o visual neumórfico consistente.
- Remover o texto "Em breve os planos estarão disponíveis...".

## Fora de escopo
- Nenhuma alteração de banco de dados, RLS, webhooks ou backend.
- Não criar nova página de checkout; reaproveita a seção existente da landing.

## Arquivos alterados
- `src/components/landing/Sections.tsx`
- `src/pages/Assinar.tsx`