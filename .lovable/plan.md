## Objetivo

A onda da superfície da água atualmente desliza da esquerda para a direita (efeito de "preenchimento"). Trocar isso por um movimento sutil de ondulação no lugar.

## Arquivo

`src/components/SoilProfile.tsx` (bloco "Onda animada", ~linhas 252–262)

## Mudanças

1. **Remover o `<animateTransform>`** que translada de `-150 0` para `0 0` em 3s.
2. **Reduzir o path** da onda para cobrir apenas a largura do perfil (`xSolo` a `xSolo + wSolo`), sem o excesso lateral usado para o efeito de scroll.
3. **Adicionar oscilação vertical no lugar** usando `<animate>` no atributo `d` do path, alternando entre duas formas de onda em fase oposta (cristas e vales trocam de posição). Duração ~2,5s, `repeatCount="indefinite"`, easing suave (`calcMode="spline"`).

Resultado: a onda fica fixa horizontalmente dentro do perfil e apenas balança verticalmente, dando sensação de superfície d'água viva sem o efeito de preenchimento.

Nada mais é alterado (clip do perfil, gradientes, raízes, badges, etc. permanecem iguais).
