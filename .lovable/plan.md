## Problema

A barra de cabeçalho com filtros (fazenda/talhão, alertas, tema) é `sticky top-0` com `z-20`, mas o mapa Leaflet (`TalhoesOverviewMap`) renderiza panes e controles com `z-index` interno entre 200 e 1000. Ao rolar, o mapa cobre o header.

## Correção

Em `src/components/layout/Header.tsx` (linha 41), aumentar o `z-index` do `<header>` sticky para um valor acima do Leaflet:

- Trocar `z-20` por `z-[1001]` (Leaflet usa até 1000 nos controles).

Isso mantém o cabeçalho visível e clicável sobre qualquer mapa, gráfico ou modal de página enquanto o usuário rola.

## Verificação

Após a mudança: rolar a Dashboard com o mapa visível e confirmar que o header e os dropdowns continuam por cima.
