## Problema
O Header do app usa `z-[1001]`, enquanto o componente Modal em `src/pages/Fazendas.tsx` usa `z-50`. Isso faz com que o Header ("toolbar") fique sobreposto ao modal, tampando o campo "Nome" na criação/edição de fazendas e talhões.

## Solução
Ajustar o `z-index` do componente `Modal` em `src/pages/Fazendas.tsx` de `z-50` para `z-[1100]` (superior ao `z-[1001]` do Header), garantindo que o modal sempre fique acima de todos os elementos do layout.

## Arquivo alterado
- `src/pages/Fazendas.tsx` — linha do `z-50` no componente `Modal`