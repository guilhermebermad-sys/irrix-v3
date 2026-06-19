# Alterar "14 dias" para "7 dias" nos textos de teste grátis

Trocar as menções de "14 dias" por "7 dias" nos textos voltados ao usuário sobre o teste grátis. O texto do Dashboard ("Últimos 14 dias") refere-se a histórico, não ao trial — fica inalterado.

## Alterações

- `src/components/landing/Sections.tsx`
  - linha 454: "14 dias grátis sem cartão" → "7 dias grátis sem cartão"
  - linha 520: "14 dias grátis. Sem cartão de crédito. Sem complicação." → "7 dias grátis. Sem cartão de crédito. Sem complicação."
- `src/pages/Cadastro.tsx`
  - linha 116: "14 dias grátis · Sem cartão · Cancele quando quiser" → "7 dias grátis · Sem cartão · Cancele quando quiser"

## Fora de escopo

- `src/pages/Dashboard.tsx:191` ("Últimos 14 dias") — métrica de histórico, não relacionada ao trial.
