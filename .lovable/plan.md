## Trocar vídeo de fundo do Hero

Substituir o clipe atual (`4887998` — gotejamento) por **Pexels 5232113** — aspersão em close-up ao pôr do sol, com luz dourada em contraluz.

### Arquivo afetado

- `src/components/landing/Hero.tsx` — atualizar apenas as constantes `VIDEO_SRC` e `VIDEO_POSTER`.

### Mudanças

```ts
const VIDEO_SRC    = "https://videos.pexels.com/video-files/5232113/5232113-uhd_2732_1440_25fps.mp4";
const VIDEO_POSTER = "https://images.pexels.com/videos/5232113/pexels-photo-5232113.jpeg";
```

Também usar o mesmo poster no `background-image` da fallback mobile (já é automático, pois lê `VIDEO_POSTER`).

### Ajuste de overlay (recomendado)

O novo clipe tem dominante dourada/quente. Para preservar legibilidade e identidade verde da marca, suavizo o overlay para puxar mais verde e menos preto puro:

- Antes: `from-black/60 via-emerald-950/50 to-black/70`
- Depois: `from-emerald-950/70 via-emerald-900/55 to-black/75`

### Não muda

- Estrutura de z-index, parallax, IntersectionObserver, fade-in, fallback gradiente, conteúdo, mockup, ripples, badge, CTA — tudo permanece.
- `tailwind.config.ts` não é tocado.
- Demais seções da landing intactas.

### Notas

- Pexels permite uso comercial sem atribuição.
- Se o clipe `5232113` não carregar bem em algum browser por tamanho, posso trocar a variante para `hd_1920_1080_25fps.mp4` (mais leve) numa segunda iteração.
