# Tokens de tipografia — contexto do agente

> Carregar quando a tarefa envolve: preset tipográfico, escala de fontes,
> line-height, letter-spacing, font-weight, hierarquia de texto.

## Sistema de unidades: rem + clamp()

Todos os valores tipográficos usam **rem** (nunca px). Isso respeita a preferência
de tamanho de fonte do usuário no navegador (acessibilidade).

- **Presets grandes** (display, heading-sm a heading-xl) usam **`clamp()`** para
  tipografia fluida responsiva. O tamanho escala suavemente entre viewports.
  - Viewport range: **375px** (mobile) → **1280px** (desktop).
  - Line heights: **unitless** (1.1, 1.15, 1.2, 1.25) — escalam com o font-size.
- **Presets menores** (heading-xs, heading-2xs, title, label, paragraph, caption,
  subheading, code) usam **rem estático**. Fluid não faz diferença prática abaixo de ~32px.
  - Line heights: **rem** (ex: 1.25rem, 1.5rem).

Zero px em qualquer preset tipográfico. Figma mostra px — converter para rem (dividir por 16).

## Arquitetura tipográfica (2 camadas)

```
fonts.ts (primitivo)
  BASE = 16px, RATIO = 1.25 (major third)
  typeSize(step), lh(), fontFamilies, fontWeights, letterSpacing
       ↓
typography.ts (semântico — presets compostos, valores em rem/clamp)
  display      → hero sections (fluid — clamp)
  heading      → títulos de página (fluid sm→xl, estático xs/2xs)
  title        → títulos de card/seção (estático rem)
  label        → botões, inputs, tabs, font-weight 500 (estático rem)
  paragraph    → texto corrido, font-weight 400 (estático rem)
  subheading   → categorias acima de conteúdo, letter-spacing positivo (estático rem)
  body         → legado — alias para paragraph (preferir paragraph/label)
  caption      → texto auxiliar (estático rem)
  overline     → legado — alias para subheading
  code         → código inline e blocos (estático rem)
```

## Hierarquia de presets — valores exatos

### display (hero sections — fluid clamp)
| Preset | Size (mobile → desktop) | Line-height | Weight | Letter-spacing |
|--------|-------------------------|-------------|--------|----------------|
| `display-2xl` | clamp(2.5rem, ..., 4.75rem) | 1.1 | 700 | -0.02em |
| `display-xl` | clamp(2.25rem, ..., 3.8125rem) | 1.1 | 700 | -0.02em |
| `display-lg` | clamp(2rem, ..., 3.0625rem) | 1.15 | 600 | -0.01em |
| `display-md` | clamp(1.75rem, ..., 2.4375rem) | 1.15 | 600 | -0.01em |

### heading (títulos de página — fluid sm→xl, estático xs/2xs)
| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `heading-xl` | clamp(2.25rem, ..., 3.5rem) | 1.15 | 500 | -0.01em |
| `heading-lg` | clamp(2rem, ..., 3rem) | 1.2 | 500 | -0.01em |
| `heading-md` | clamp(1.75rem, ..., 2.5rem) | 1.2 | 500 | -0.01em |
| `heading-sm` | clamp(1.5rem, ..., 2rem) | 1.25 | 500 | -0.005em |
| `heading-xs` | 1.5rem (24px) | 2rem | 500 | 0em |
| `heading-2xs` | 1.25rem (20px) | 1.75rem | 500 | 0em |

### title (títulos de card/seção — estático rem)
| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `title-lg` | 1.25rem (20px) | 1.75rem | 500 | 0em |
| `title-md` | 1rem (16px) | 1.5rem | 500 | 0em |
| `title-sm` | 0.875rem (14px) | 1.25rem | 500 | 0em |

### label (botoes, inputs, tabs — weight 500, estatico rem)
| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `label-xl` | 1.5rem (24px) | 2rem | 500 | -0.015em |
| `label-lg` | 1.125rem (18px) | 1.5rem | 500 | -0.015em |
| `label-md` | 1rem (16px) | 1.5rem | 500 | -0.011em |
| `label-sm` | 0.875rem (14px) | 1.25rem | 500 | -0.006em |
| `label-xs` | 0.75rem (12px) | 1rem | 500 | 0em |

### paragraph (texto corrido — weight 400, estatico rem)
| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `paragraph-xl` | 1.5rem (24px) | 2rem | 400 | -0.015em |
| `paragraph-lg` | 1.125rem (18px) | 1.5rem | 400 | -0.015em |
| `paragraph-md` | 1rem (16px) | 1.5rem | 400 | -0.011em |
| `paragraph-sm` | 0.875rem (14px) | 1.25rem | 400 | -0.006em |
| `paragraph-xs` | 0.75rem (12px) | 1rem | 400 | 0em |

### caption (texto auxiliar — estatico rem)
| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `caption-md` | 0.8125rem (13px) | 1.125rem | 400 | 0em |
| `caption-sm` | 0.6875rem (11px) | 0.875rem | 400 | 0em |

### subheading (categorias — letter-spacing positivo, estatico rem)
| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `subheading-md` | 1rem (16px) | 1.5rem | 500 | +0.06em |
| `subheading-sm` | 0.875rem (14px) | 1.25rem | 500 | +0.06em |
| `subheading-xs` | 0.75rem (12px) | 1rem | 500 | +0.04em |
| `subheading-2xs` | 0.6875rem (11px) | 0.75rem | 500 | +0.02em |

### code (estatico rem)
| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `code-md` | 1rem (16px) | 1.6 | 400 | 0em |
| `code-sm` | 0.8125rem (13px) | 1.6 | 400 | 0em |

## Uso por componente

| Componente | Preset |
|------------|--------|
| Button | `label-sm` (0.875rem, 500) |
| Input value | `paragraph-sm` (0.875rem, 400) |
| Input placeholder | `paragraph-sm` (0.875rem, 400) |
| Label de campo | `label-sm` (0.875rem, 500) |
| Hint / Helper text | `paragraph-xs` (0.75rem, 400) |
| Badge sm | `subheading-2xs` (0.6875rem, 500) |
| Badge md | `label-xs` (0.75rem, 500) |
| Tabs item | `label-sm` (0.875rem, 500) |
| Titulo de card | `label-md` (1rem, 500) |

## Regras inviolaveis

1. **Nunca combinar valores avulsos em componentes:**
   ```typescript
   // ❌ ERRADO — valores avulsos
   "text-[14px] font-medium leading-5"
   "text-[0.875rem] font-medium leading-5"

   // ✅ CERTO — preset composto via utility class
   "text-label-sm"
   ```

2. **Nunca usar `font-bold`, `font-semibold` diretamente** — usar preset que ja define o peso.

3. **Tipografia sempre em rem ou clamp(rem), nunca px.**

4. **`label` vs `paragraph`** — mesmos tamanhos, pesos diferentes:
   - `label-sm` (0.875rem, 500) → botao, tab, campo de form
   - `paragraph-sm` (0.875rem, 400) → texto corrido, input value

5. **`subheading`** tem letter-spacing positivo (abertura) — para categorias e secoes acima do conteudo.

6. **Line heights de presets fluidos sao unitless** (1.1, 1.15, 1.2, 1.25) — escalam com o font-size.
   **Line heights de presets estaticos sao em rem** (ex: 1.25rem, 1.5rem).

## Para adicionar novo preset

```typescript
// typography.ts — presets estaticos usam rem
export const typography = {
  // ...existentes...
  "novo-preset": {
    fontSize:      "0.875rem",     // 14px ÷ 16 = 0.875rem
    lineHeight:    "1.25rem",      // 20px ÷ 16 = 1.25rem
    fontWeight:    "500",
    letterSpacing: "-0.006em",
    fontFamily:    fontFamily.sans,
  },
};

// Para presets fluidos (display/heading grandes), usar clamp:
// fontSize: "clamp(minRem, calc(... + ...vw), maxRem)"
// lineHeight: unitless (ex: "1.2")
// Viewport range: 375px → 1280px
```

Apos adicionar:
1. Rodar `npm run tokens:tw4` — gera `@utility text-novo-preset { ... }`
2. Registrar em `src/utils/tv.ts` na lista de `font-size` do tailwind-merge

## Sobre `letterSpacing`

| Valor | Uso |
|-------|-----|
| Negativo (-0.015em a -0.006em) | Labels, paragraphs — melhor leitura |
| Zero (0em) | Captions, xs sizes |
| Positivo (+0.02em a +0.06em) | Subheadings — abertura/categorias |
