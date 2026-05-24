## Ocultar seção "O que dizem nossos consultores"

A seção `<Depoimentos />` é renderizada em `src/pages/Landing.tsx` (linha 18) e definida em `src/components/landing/Sections.tsx`.

### Mudança
- **`src/pages/Landing.tsx`** — comentar a linha `<Depoimentos />` para que a seção fique oculta na landing, mas o componente permanece exportado e pronto para ser reativado depois trocando uma linha.

### Não vou
- Apagar o componente `Depoimentos` nem o array `testimonials` — fica preservado para reuso futuro.
- Mexer em outras menções à palavra "consultores" (texto do hero, FAQ, plano "Consultor" etc.).