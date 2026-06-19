# Adicionar novas culturas ao IRRIX

Acrescentar à tabela de referências (`src/lib/agro/reference.ts`) as culturas solicitadas, com seus estádios fenológicos, coeficiente de cultivo (Kc, FAO-56) e fração de depleção hídrica (f). Também atualizar o mapa de imagens (`src/lib/cultivos/cropImages.ts`) para reusar arte existente quando aplicável e gerar novas ilustrações para as culturas sem ícone.

## Culturas a incluir

- Laranja (Citros) — já existe como "Citros"; será expandida para usar o nome "Laranja (Citros)" e estádios mais detalhados.
- Banana
- Uva (Mesa) e Uva (Vinho) — separadas, pois Kc difere
- Manga
- Melão
- Melancia
- Tomate (Indústria) e Tomate (Mesa) — substituem o "Tomate" genérico
- Batata
- Cebola
- Alho
- Folhosas (Alface/Rúcula/Agrião) — Alface já existe; será generalizada

## Valores de referência (FAO-56 / Allen et al., 1998; Bernardo et al., 2006)

```text
Cultura              | Estádios (Kc)                                                      | f
---------------------+--------------------------------------------------------------------+-----
Banana               | Estabelecimento 0.50 | Vegetativo 0.85 | Floração/Cacho 1.10 |       
                     | Enchimento 1.20 | Colheita 1.05                                     | 0.35
Uva (Mesa)           | Brotação 0.30 | Crescimento 0.70 | Floração 0.85 |                  
                     | Maturação 0.70 | Pós-colheita 0.45                                  | 0.35
Uva (Vinho)          | Brotação 0.30 | Crescimento 0.70 | Floração 0.70 |                  
                     | Maturação 0.60 | Pós-colheita 0.40                                  | 0.45
Manga                | Brotação 0.45 | Floração 0.70 | Frutificação 0.85 |                 
                     | Maturação 0.75 | Pós-colheita 0.70                                  | 0.50
Melão                | Inicial 0.50 | Vegetativo 0.75 | Floração 1.00 |                    
                     | Frutificação 1.05 | Maturação 0.75                                  | 0.40
Melancia             | Inicial 0.40 | Vegetativo 0.75 | Floração 1.00 |                    
                     | Frutificação 1.05 | Maturação 0.70                                  | 0.40
Tomate (Indústria)   | Inicial 0.50 | Vegetativo 0.80 | Floração 1.15 |                    
                     | Frutificação 1.20 | Maturação 0.70                                  | 0.40
Tomate (Mesa)        | Inicial 0.60 | Vegetativo 0.90 | Floração 1.15 |                    
                     | Frutificação 1.20 | Maturação 0.80                                  | 0.40
Batata               | Inicial 0.50 | Vegetativo 0.85 | Tuberização 1.15 |                 
                     | Enchimento 1.10 | Maturação 0.75                                    | 0.35
Cebola               | Inicial 0.70 | Vegetativo 1.00 | Bulbificação 1.05 | Maturação 0.75 | 0.30
Alho                 | Inicial 0.70 | Vegetativo 1.00 | Bulbificação 1.00 | Maturação 0.70 | 0.30
Folhosas (Alface/Rúcula/Agrião) | Inicial 0.70 | Crescimento 0.95 |                        
                                | Formação 1.00 | Colheita 0.95                            | 0.30
Laranja (Citros)     | Brotação 0.65 | Floração 0.70 | Pegamento 0.70 |                    
                     | Crescimento de frutos 0.70 | Maturação 0.65                         | 0.50
```

## Detalhes técnicos

1. **`src/lib/agro/reference.ts`**
   - Substituir o array `CULTURAS` pela lista atualizada, mantendo as existentes (Soja, Milho, Feijão, Café, Cana-de-açúcar, Morango) e acrescentando as novas (`Laranja (Citros)`, `Banana`, `Uva (Mesa)`, `Uva (Vinho)`, `Manga`, `Melão`, `Melancia`, `Tomate (Indústria)`, `Tomate (Mesa)`, `Batata`, `Cebola`, `Alho`, `Folhosas (Alface/Rúcula/Agrião)`, `Outro`). Manter "Citros", "Tomate" e "Alface" como aliases (mantém compatibilidade com dados já cadastrados).
   - Estender `ESTADIOS` e `KC` com os valores acima.
   - Estender `F_DEPLECAO` com `f` para cada nova cultura.

2. **`src/lib/cultivos/cropImages.ts`**
   - Mapear: `laranja (citros)` → citros; `tomate (mesa)`/`tomate (indústria)` → tomate; `folhosas (alface/rúcula/agrião)` → alface.
   - Importar e mapear novas imagens: `banana`, `uva`, `manga`, `melao`, `melancia`, `batata`, `cebola`, `alho` (gerar arte em `src/assets/crops/`).

3. **Imagens a gerar** (estilo coerente com as existentes — ilustração simples sobre fundo branco):
   - banana.png, uva.png, manga.png, melao.png, melancia.png, batata.png, cebola.png, alho.png

## Fora de escopo

- Migração de banco; os campos `cultura` e `estadio` em `talhoes` já são texto livre.
- Nenhuma alteração de UI nos formulários — eles já consomem `CULTURAS`/`ESTADIOS`.
