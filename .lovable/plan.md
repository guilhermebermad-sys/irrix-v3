
# Plano: Perfil do Solo redesenhado + Gráfico Temporal Hídrico

Substituir os visuais atuais por dois componentes fiéis aos esboços fornecidos.

## 1) `src/components/SoilProfile.tsx` — reescrita visual

Mantém a mesma API pública (props `armFinal`, `CAD`, `AFD`, `cultura`, `estadio`, `compact`, `width`, `height`) e o named export `SoilWaterBar` para não quebrar imports. Muda apenas o desenho SVG.

### Novo layout (viewBox 240×360)

De cima para baixo:

1. **Acima do solo (y: 0–60)** — planta estilizada centrada
   - Caule vertical marrom-esverdeado (#65a30d)
   - 3 pares de folhas ovais simétricas em verde (`hsl(var(--primary))`)
   - Tamanho/forma varia por `cultura` (milho = folhas longas pendentes; soja = trifólios; café = arbusto; default = genérica)

2. **Linha de superfície (y=60)** — terra ondulada marrom (#92400e), com textura sutil

3. **Zona de excesso (y: 60–80)** — faixa azul clara (#dbeafe) acima da CC

4. **CC — y=80** — linha tracejada azul (#1d4ed8) + label "CC" à esquerda com `{CAD}mm`

5. **Zona AFD (y: 80 → yLimite)** — faixa verde esmeralda (`#a7f3d0` → `#34d399`)

6. **Limite AFD — y=yLimite** — linha tracejada âmbar (#f59e0b) + label "AFD {AFD}mm"

7. **Zona de Estresse (yLimite → 240)** — faixa âmbar/laranja (`#fed7aa` → `#fb923c`)

8. **PMP — y=240** — linha tracejada vermelha (#dc2626) + label "PMP"

9. **Abaixo do PMP (y: 240–280)** — hachura cinza escura `<pattern>` cinza-grafite (#475569)

10. **Sistema radicular (y: 60→240)** — 5–7 curvas Bézier finas saindo da base do caule, descendo e ramificando. Mais densas no topo, esparsas próximas ao PMP. Cor depende da posição vs nível d'água:
    - Acima do nível: marrom claro #a16207 (raízes secas)
    - Abaixo do nível: verde-azulado #0d9488 com opacidade 0.7 (submersas)
    - Renderizar 2 cópias por raiz (clip-path acima/abaixo do nível)

11. **Nível d'água atual** — preenchimento de `yPMP` até `yNivel`
    - Cor por zona (verde/âmbar/azul/vermelho escuro) usando `SIT_COLORS`
    - Onda senoidal animada SMIL no topo (mantém a atual)
    - Transição CSS de 800ms no `y`

12. **Bracket lateral esquerdo (x: 4–22)** — como no esboço
    - Bracket externo grande de y=80 (CC) até y=240 (PMP) → label vertical "CAD {CAD}mm"
    - Bracket interno de y=80 (CC) até y=yLimite → label vertical "AFD {AFD}mm"
    - Desenhados como `<path>` em formato de colchete `[`
    - Texto rotacionado -90°

13. **Régua de % opcional à direita (oculta em compact)**

### Modo `compact=true` (80×130)
Mesma estrutura mas sem brackets, sem labels e sem planta detalhada (só uma folhinha simples). Mantém zonas + nível animado + linhas CC/AFD/PMP finas.

### Painel info (não-compact)
Mantém o painel neumórfico atual (badge de situação + interpretação). Sem mudança.

## 2) `src/components/HydricTimelineChart.tsx` — NOVO

Gráfico de linha temporal conforme Imagem 1 do esboço, baseado em Recharts (já usado no projeto).

### Props
```ts
interface Props {
  registros: Array<{
    data: string;        // ISO yyyy-mm-dd
    arm_final: number;
    etc?: number;
    chuva?: number;
    lamina_bruta?: number;
    perc_cad?: number;
  }>;
  CAD: number;
  AFD: number;
  periodo?: 7 | 14 | 30;   // default 14
  onPeriodoChange?: (p: 7|14|30) => void;
  height?: number;         // default 320
}
```

### Estrutura visual

- **`<ComposedChart>`** com:
  - `<CartesianGrid>` discreto
  - **`<ReferenceArea y1={CAD-AFD} y2={CAD}>`** fill verde claro #d1fae5 opacity 0.4 → zona ótima
  - **`<ReferenceArea y1={0} y2={CAD-AFD}>`** fill âmbar #fef3c7 opacity 0.4 → zona estresse
  - **`<ReferenceArea y1={-10} y2={0}>`** fill vermelho #fee2e2 opacity 0.4 → murcha
  - **`<ReferenceLine y={CAD}>`** azul tracejada + label "CC {CAD}mm"
  - **`<ReferenceLine y={CAD-AFD}>`** âmbar tracejada + label "AFD {AFD}mm"
  - **`<ReferenceLine y={0}>`** vermelha tracejada + label "PMP"
  - **`<XAxis dataKey="data">`** formatado dd/MM
  - **`<YAxis>`** domínio `[-10, CAD * 1.1]`
  - **`<Line dataKey="arm_final">`** azul/verde, dots visíveis r=4
  - **`<Tooltip>`** customizado mostrando: Data | Arm | %AFD | ETc | Chuva | Lâmina | Status (chama `classificarSituacao` de SoilProfile)

- **Marcadores customizados** (camada SVG sobreposta dentro do `ResponsiveContainer` via `<Customized>`):
  - Para cada `lamina_bruta > 0`: ícone gota 💧 + valor "{X}mm" abaixo do eixo X na posição do dia
  - Para cada `chuva > 0`: ícone 🌧 + valor "{X}mm" acima do eixo X (offset)
  - Calcular posição X via `xAxisMap` do Recharts ou usar `<Scatter>` com shape custom

- **Header com seletor de período** (botões neumórficos): 7 / 14 / 30 dias
  - Estado interno se `onPeriodoChange` não passado
  - Filtra `registros` aos últimos N dias antes de renderizar

### Estilo
- Container: `<NeuCard>` no consumidor
- Cores via tokens HSL onde possível, paletas fixas para zonas hídricas (alinhado com SoilProfile)

## 3) Integrações

### `src/pages/Dashboard.tsx`
- Já usa `SoilProfile` — atualização automática (mesma API)
- Adicionar `<HydricTimelineChart registros={registros} CAD={cad} AFD={afd} />` **substituindo** o `LineChart` atual de "Disponibilidade Hídrica — AFD (%)"
- Manter o gráfico de barras "Lâminas e Consumo"

### `src/pages/ManejoDiario.tsx`
- Já usa `SoilProfile` — sem mudanças

### `src/pages/Historico.tsx`
- Substituir o `<LineChart>` "Série temporal — Arm. Final e % CAD" pelo novo `<HydricTimelineChart registros={filtrados} CAD={cad} AFD={afd} periodo={30} />`
- Adicionar leitura de `cad` e `afd` da fazenda/talhão ativos (via `useSelecao` + `getAFD`)

### `src/components/map/TalhoesOverviewMap.tsx`
- Já usa `SoilProfile compact` — sem mudanças (apenas se beneficia do novo visual)

## 4) Arquivos
- **Reescrever**: `src/components/SoilProfile.tsx` (apenas a parte SVG; mantém API, exports e helpers)
- **Criar**: `src/components/HydricTimelineChart.tsx`
- **Editar**: `src/pages/Dashboard.tsx`, `src/pages/Historico.tsx`

## 5) Validação
- `bunx tsc --noEmit` limpo
- QA visual no Dashboard e Histórico (claro/escuro, mobile/desktop)
- Verificar marcadores de irrigação aparecem corretamente em dias com `lamina_bruta > 0`
