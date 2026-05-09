## Objetivo

Redesenhar o card **"Perfil Hídrico do Solo"** do Dashboard num painel escuro fotorrealista de duas colunas, mantendo os mesmos dados (ARM, AFD, CAD, %AFD, cultura, estádio) e a lógica atual de cálculo.

## Escopo

- `src/components/SoilProfile.tsx` → reescrever o SVG do perfil para visual fotorrealista
- `src/pages/Dashboard.tsx` (linhas 214–252) → reorganizar a coluna direita (resumo, barra de progresso com ícones, painel de notas)
- Apenas este card. Resto do app intocado. Sem mudança no tema global — o card terá superfície escura própria (`#1C1E23`) que funciona em light/dark.

## Coluna esquerda — Perfil do solo (SVG)

Largura fixa do perfil, novo viewBox vertical. Camadas:

1. **Fundo do perfil** — gradiente marrom/areia + `<filter feTurbulence>` para textura granulada de terra.
2. **Zona CC (topo)** — banda azul-clara translúcida com onda animada já existente (manter, mas refinar gradiente).
3. **Zona AFD (meio)** — gradiente verde→laranja claro, com ruído sutil de "solo úmido".
4. **Zona PMP (base)** — gradiente laranja escuro→vermelho, com padrão de rachaduras (paths finos brancos com baixa opacidade).
5. **Zona Indisponível** — hachura cinza (manter).
6. **Raízes da soja R1-R2** — substituir o desenho genérico por uma silhueta de soja em floração: caule ramificado, folhas trifoliadas, pequenas flores roxas, e sistema radicular pivotante com radicelas finas atravessando AFD/PMP.
7. **Marcadores laterais (esquerda)** — chips coloridos alinhados verticalmente:
   - `CC 100mm` (azul `#3B82F6`)
   - `AFD 50mm` (laranja/verde `#10B981`)
   - `PMP` (vermelho `#EF4444`)
8. **Indicador de água atual** — linha horizontal verde luminosa (`stroke #34d399` + `filter drop-shadow`), com "bolha" flutuante (pill arredondado) acima exibindo `60.3mm` em negrito.

## Coluna direita — Painéis de dados

Três blocos empilhados, todos com superfície `#1C1E23`, bordas arredondadas (`rounded-2xl`) e sombra suave.

### 1. Painel "RESUMO ATUAL"
- Título pequeno: `RESUMO ATUAL (Valores em mm)` — uppercase, tracking largo, cinza claro.
- Status grande: `Confortável` em laranja `#FF9900`, fonte display, ~36px (cor reage ao status: verde/laranja/vermelho).
- Subtítulo: `21% da AFD` em cinza médio.
- Linha de 3 chips lado a lado: `ARM.: 60.3 mm`, `AFD: 50.0 mm`, `CAD: 100 mm` — cada chip com label pequeno cinza e valor branco.

### 2. Barra de progresso
Refazer o `SoilWaterBar` com visual mais limpo:
- Trilho com gradiente `vermelho → laranja → verde → azul` (PMP→AFD→CC→Excesso).
- 4 ícones lucide alinhados nos limites: `Cactus` (PMP), `Droplet` (AFD), `Cloud` (CC), `CloudRain` (Excesso) — cinza claro com label pequeno embaixo.
- Marcador: triângulo laranja neon (`#FF9900`, drop-shadow) apontando para a posição de 60.3mm, com tooltip "60.3mm" em pill.

### 3. Painel de notas
- Pill `Atenção` em laranja translúcido no topo.
- Linha 1 (mono-ish, pequeno): `%AFD: 21% • AFD = 0.50 × 100 = 50.0mm`.
- Linha 2 (frase): `Plantas com restrição hídrica leve.` — texto reativo conforme situação.
- Rodapé: `SOJA • FLORAÇÃO R1-R2` — uppercase, tracking largo, cinza claro (vem de `talhaoAtivo`).

## Detalhes técnicos

- Tipografia: usar a `font-display` já configurada para títulos/destaques; `font-sans` (Inter) para corpo.
- Cores via tokens semânticos quando possível; tokens fixos (#1C1E23, #FF9900) entram como utilitários inline já que o card tem identidade própria.
- Garantir que `armFinal`, `percAFD`, `cad`, `afd` exibidos no SVG, no painel "RESUMO" e na barra **usem o mesmo número arredondado** (utility helper local).
- Acessibilidade: rótulos `<title>` no SVG; contraste AA sobre `#1C1E23`.
- Responsivo: em mobile (<lg) coluna direita vai abaixo da esquerda; SVG mantém aspect ratio.

## Fora do escopo

- Não alterar `HydricTimelineChart`, header, sidebar, outros cards.
- Não mexer em cálculos agronômicos (`src/lib/agro/calculations.ts`).
- Não tocar no tema global do app (light/dark continuam funcionando).
