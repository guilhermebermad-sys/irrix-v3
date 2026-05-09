## Vídeo de fundo cinematográfico no Hero

Substituir o vídeo atual do Hero (mixkit) por um vídeo do Pexels mostrando irrigação real, com overlay esverdeado, fallback animado, otimização mobile e parallax sutil.

### Arquivos afetados

- `src/components/landing/Hero.tsx` — reescrita da camada de fundo e ajustes de z-index/cores
- `tailwind.config.ts` — adicionar keyframe `gradient` e animação `gradient-slow`
- `src/hooks/use-mobile.tsx` — já existe, será reutilizado

Nenhuma outra seção da landing será tocada.

### Mudanças no `Hero.tsx`

1. **Camada de vídeo (z-0)**
   - `<video>` com `autoPlay muted loop playsInline preload="auto"` e `poster` do Pexels.
   - Source principal: `https://videos.pexels.com/video-files/4887998/4887998-uhd_2732_1440_25fps.mp4` (pivô central).
   - `ref` para controle via IntersectionObserver (pause quando fora da viewport).
   - `onCanPlay` define `videoLoaded=true` e o vídeo recebe `transition-opacity` (fade-in 1s).
   - No mobile (`useIsMobile()`), substituir o `<video>` por `<div>` com `background-image` (poster) — economiza dados e bateria.

2. **Fallback animado (z-0)**
   - Renderizado enquanto `!videoLoaded`: `bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 animate-gradient-slow`.

3. **Overlay (z-10)**
   - `bg-gradient-to-b from-black/60 via-emerald-950/50 to-black/70`.
   - Mantém os "ripples" decorativos existentes.

4. **Conteúdo (z-20)**
   - Wrapper do conteúdo passa a `relative z-20`.
   - Texto: título permanece `text-white`; subtítulo passa de `text-white/70` para `text-slate-200`.
   - Badge: `bg-emerald-500/20 backdrop-blur-sm border-emerald-400/30`.
   - CTA principal: adicionar `shadow-2xl shadow-emerald-500/40`.
   - Mockup do dashboard (lg+) permanece intacto.

5. **Parallax sutil (desktop apenas)**
   - `scrollY` via listener de scroll com throttle por `requestAnimationFrame`.
   - `style={{ transform: translateY(scrollY * 0.3px) }}` aplicado ao `<video>`; desativado no mobile.

6. **IntersectionObserver para play/pause**
   - Pausa o vídeo quando o Hero sai da viewport (economia).

### Mudanças em `tailwind.config.ts`

Adicionar em `keyframes`:
```
gradient: {
  "0%, 100%": { backgroundSize: "200% 200%", backgroundPosition: "left center" },
  "50%":      { backgroundSize: "200% 200%", backgroundPosition: "right center" },
}
```
e em `animation`:
```
"gradient-slow": "gradient 8s ease infinite",
```

### Notas

- Vídeo permanece `muted` (requisito de autoplay nos browsers).
- Pexels permite uso comercial sem atribuição.
- Sem partículas decorativas extras — o vídeo de irrigação real já carrega o impacto visual.
- Demais seções (`SocialProof`, `ProblemaSolucao`, etc.) ficam exatamente como estão.
