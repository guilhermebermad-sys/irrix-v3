## Objetivo

1. Trocar o rótulo **"Transbordamento"** por **"Excesso"** em todos os pontos onde aparece, mantendo a UI íntegra em qualquer largura de tela.
2. Fazer o card **"Perfil Hídrico do Solo"** (no Dashboard) respeitar o tema atual: hoje ele é renderizado com gradiente/cores fixas escuras (`#22252c → #1C1E23`, `text-white`, `rgba(255,255,255,…)`) e parece "modo noturno" mesmo no tema claro.

## Alterações

### 1) Texto "Transbordamento" → "Excesso"

Substituir o literal nos 3 locais:
- `src/pages/Dashboard.tsx` (linha 217) — rótulo de status quando `pct > 100` no painel Resumo Atual.
- `src/lib/map/geo.ts` (linha 43) — label `"💧 Transbordamento"` → `"💧 Excesso"` usado no mapa de talhões.
- `src/components/map/TalhoesOverviewMap.tsx` (linha 163) — legenda do mapa.

"Excesso" é mais curto que "Transbordamento", então não há risco de overflow; ao contrário, melhora o ajuste em telas estreitas (390 px) onde "Transbordamento" hoje é a palavra mais larga do bloco "Resumo Atual".

### 2) Card "Perfil Hídrico do Solo" condicional ao tema

No `src/pages/Dashboard.tsx`, bloco entre as linhas ~230 e ~336, substituir cores fixas por tokens semânticos do design system (`bg-card`, `text-foreground`, `text-muted-foreground`, `border-border`, `bg-muted`) para que o card herde automaticamente o esquema do tema (claro/escuro), mantendo a aparência atual no modo escuro:

- Container externo: remover `style={{ background: "linear-gradient(180deg,#22252c,#1C1E23)", border: "1px solid rgba(255,255,255,0.06)" }}` → trocar por `bg-card border border-border` (já reage ao tema).
- Título "Perfil Hídrico do Solo": `text-white` → `text-foreground`.
- Subtítulos/labels com `text-white/40 … /60`: trocar para `text-muted-foreground` (intensidade controlada por opacidade do token onde necessário).
- Sub-cards internos (Resumo, Barra, Notas): trocar o `style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}` por `bg-muted/40 border border-border`.
- Mini-cards ARM/AFD/CAD: `bg: rgba(255,255,255,0.04)` → `bg-muted/60`; valores numéricos `text-white` → `text-foreground`; sufixo "mm" `text-white/40` → `text-muted-foreground`.
- Bloco Notas: `text-white/80` → `text-foreground/90`; divisor `border-white/5` → `border-border`.
- Os badges de status coloridos (verde/laranja, ARM grande colorida pelo `status.color`, marcador da barra) permanecem com cor inline — eles representam dados, não cromática de tema.
- A barra gradiente (PMP→Excesso) e os ícones `Flame/Droplet/Cloud/CloudRain` permanecem; só o `text-white/50` dos rótulos vira `text-muted-foreground`.

Resultado: no modo claro o card aparece com fundo claro e textos escuros legíveis; no modo escuro mantém o visual atual.

## Fora do escopo

- Não mexer no SVG `SoilProfile` em si (já usa cores próprias do perfil de solo, que são semanticamente "terra/água" e não devem mudar com tema).
- Nenhuma mudança em lógica de cálculo, dados ou rotas.
