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
- **Presets menores** (heading-xs, title, body, caption, code) usam **rem estático**.
  Fluid não faz diferença prática abaixo de ~32px.
  - Line heights: **rem** (ex: 1.25rem, 1.5rem).

Zero px em qualquer preset tipográfico. Figma mostra px — converter para rem (dividir por 16).

## Arquitetura tipográfica (2 camadas)

```
fonts.ts (primitivo)
  BASE = 16px, RATIO = 1.25 (major third)
  typeSize(step), lh(), fontFamilies, fontWeights, letterSpacing
       ↓
typography.ts (semântico — 23 presets compostos em 6 roles, valores em rem/clamp)
  display      → hero sections (fluid — clamp)              4 presets
  heading      → títulos de página (fluid sm→xl, estático xs)  5 presets
  title        → títulos de card/seção (estático, weight 600 default)  3 presets
  body         → texto corrido + interactive (estático)        6 presets
  caption      → texto auxiliar, meta, microlabels (estático)  3 presets
  code         → código inline e blocos (estático, mono)       2 presets
```

## Escala discreta de pixels (sem decimais, sem órfãos)

- **Tier pequeno (incremento 1px)**: 10, 11, 12, 13, 14
- **Tier médio (incremento 2px)**: 16, 18, 20
- **Tier grande (incremento 4px)**: 24
- **Tier display (fluid clamp)**: ≥ 28px

## Hierarquia de presets — valores exatos

### display (hero sections — fluid clamp, weight semibold/bold)

| Preset | Size (mobile → desktop) | Line-height | Weight | Letter-spacing |
|--------|-------------------------|-------------|--------|----------------|
| `display-2xl` | clamp(2.5rem, ..., 4.75rem) | 1.1 | 700 | -0.02em |
| `display-xl` | clamp(2.25rem, ..., 3.8125rem) | 1.1 | 700 | -0.02em |
| `display-lg` | clamp(2rem, ..., 3.0625rem) | 1.15 | 600 | -0.01em |
| `display-md` | clamp(1.75rem, ..., 2.4375rem) | 1.15 | 600 | -0.01em |

### heading (títulos de página — fluid sm→xl, estático xs, weight 500)

| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `heading-xl` | clamp(2.25rem, ..., 3.5rem) | 1.15 | 500 | -0.01em |
| `heading-lg` | clamp(2rem, ..., 3rem) | 1.2 | 500 | -0.01em |
| `heading-md` | clamp(1.75rem, ..., 2.5rem) | 1.2 | 500 | -0.01em |
| `heading-sm` | clamp(1.5rem, ..., 2rem) | 1.25 | 500 | -0.005em |
| `heading-xs` | 1.5rem (24px) | 2rem | 500 | 0em |

### title (títulos de card/modal/seção — estático rem, **weight 600 default**)

| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `title-lg` | 1.25rem (20px) | 1.75rem | **600** | 0em |
| `title-md` | 1rem (16px) | 1.5rem | **600** | -0.011em |
| `title-sm` | 0.875rem (14px) | 1.25rem | **600** | -0.006em |

### body (texto corrido + interactive — xs/sm = 500, md+ = 400)

| Preset | Size | Line-height | Weight | Letter-spacing | Uso típico |
|--------|------|-------------|--------|----------------|------------|
| `body-2xl` | 1.5rem (24px) | 2rem | 400 | -0.015em | KPI, lead paragraph |
| `body-xl` | 1.125rem (18px) | 1.5rem | 400 | -0.015em | callout, intro |
| `body-lg` | 1rem (16px) | 1.5rem | 400 | -0.011em | body padrão de leitura |
| `body-md` | 0.875rem (14px) | 1.25rem | 400 | -0.006em | body corrido, doc pages |
| `body-sm` | 0.8125rem (13px) | 1.125rem | **500** | -0.003em | **body default do projeto** (button, dropdown, input, table cell) |
| `body-xs` | 0.75rem (12px) | 1rem | **500** | 0em | chip, sub-item, interactive small |

### caption (texto auxiliar — weight 400)

| Preset | Size | Line-height | Weight | Letter-spacing | Uso típico |
|--------|------|-------------|--------|----------------|------------|
| `caption-md` | 0.75rem (12px) | 1rem | 400 | 0em | helper, hint, table caption |
| `caption-sm` | 0.6875rem (11px) | 0.875rem | 400 | 0em | tooltip, timestamp, meta |
| `caption-xs` | 0.625rem (10px) | 0.75rem | 400 | 0em | badge meta, micro caption |

### code (mono regular)

| Preset | Size | Line-height | Weight | Letter-spacing |
|--------|------|-------------|--------|----------------|
| `code-md` | 1rem (16px) | 1.6 | 400 | 0em |
| `code-sm` | 0.8125rem (13px) | 1.6 | 400 | 0em |

## Uso por componente (referência rápida)

| Componente | Preset + override |
|------------|-------------------|
| Button text | `text-body-sm font-semibold leading-none` (13/600/lh-1) |
| Input value | `text-body-sm font-normal` (13/400) |
| Input placeholder | `text-body-sm font-normal` (13/400) |
| Label de form | `text-[13px] font-semibold tracking-[0.01em] leading-none` (caso especial — leading-none + tracking custom não bate com preset) |
| Hint / Helper text | `text-caption-sm` (11/400) |
| Badge sm (10px) | `text-caption-xs font-bold uppercase tracking-wider` |
| Badge md (11px) | `text-caption-sm font-bold uppercase tracking-wider` |
| Tabs item | `text-body-sm font-medium` (13/500) |
| Modal title | `text-title-md font-bold leading-[1.3] tracking-[-0.01em]` (override de leading custom) |
| Modal description | `text-caption-md leading-[1.45]` (12/400) |
| KPI principal | `text-body-2xl font-bold leading-none [font-variant-numeric:tabular-nums]` (24/700) |
| Section header uppercase | `text-caption-sm font-semibold uppercase tracking-wider leading-none` |

## Regras invioláveis

1. **Nunca usar `text-[Npx]` arbitrary** quando existir preset DS equivalente:
   ```typescript
   // ❌ ERRADO
   "text-[14px]"
   "text-[14px] font-medium"

   // ✅ CERTO
   "text-body-md"                  // 14/400
   "text-body-md font-medium"      // 14/500 (override de weight)
   ```

2. **Override convencional via Tailwind nativo**:
   - `font-bold` / `font-semibold` / `font-medium` / `font-normal` — peso diferente
   - `leading-none` / `leading-snug` / `leading-[1.X]` — line-height
   - `tracking-wider` / `tracking-widest` / `tracking-[Xem]` — letter-spacing

3. **Tipografia sempre em rem ou clamp(rem), nunca px** dentro do `typography.ts`.

4. **Body interactive (13/14) tem weight default 500**:
   - `body-xs` (12) e `body-sm` (13) — weight 500 default (interactive: button, dropdown)
   - `body-md` (14) e maiores — weight 400 default (body corrido)
   - Para usar 13/400 (texto corrido pequeno): `text-body-sm font-normal`

5. **Title default weight = 600** (semibold). Override para 700 (bold) só em casos específicos (modal/panel/dialog titles).

6. **Exceções de `text-[X]` aceitas** (não há preset estático equivalente):
   - Ícones Unicode decorativos (ex: `text-[2rem]` em `<span>✦</span>`)
   - DocHeader h1 fluid (`text-[2rem]`)

## Para adicionar novo preset

```typescript
// typography.ts — presets estaticos usam rem
export const body: Record<string, TypographyPreset> = {
  // ...existentes...
  "novo-preset": {
    fontSize:      "0.875rem",     // 14px ÷ 16 = 0.875rem
    lineHeight:    "1.25rem",      // 20px ÷ 16 = 1.25rem
    fontWeight:    fontWeight.medium,
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
2. **CRÍTICO**: Registrar em `src/utils/tv.ts` na lista `twMergeConfig.extend.classGroups["font-size"][0].text` — caso contrário o `tailwind-merge` confundirá `text-novo-preset` com `text-fg-X` (color) e removerá a classe do output final (ver L-016).

## Sobre `letterSpacing`

| Valor | Uso |
|-------|-----|
| Negativo (-0.015em a -0.003em) | Body interactive (12-14px) — melhor leitura |
| Zero (0em) | Captions, code, microlabels |
| Positivo (+0.02em a +0.06em) | Section headers uppercase (override `tracking-wider`) |

## Migration log (2026-05-19)

- Removidos: `paragraph-*` (6), `label-*` (7), `subheading-*` (6) — 19 presets eliminados
- Adicionados: `body-*` (6), `caption-md` (12/400) — 7 presets novos
- Title weight default: 500 → 600 (alinhado com uso real, 56× semibold vs 2× bold)
- Decimais e órfãos (10.5/11.5/12.5/13.5/14.5/15/17/22/26 px) eliminados (Ondas 1-4)
- 199 literais `text-[Npx]` → 4 exceções justificadas (ícones Unicode + DocHeader fluid)
- Audit pré-rewrite: `.ai/audits/typography-inventory-2026-05-18.md`
- Audit pós-Ondas: `.ai/audits/typography-inventory-2026-05-19.md`
- Spec do rewrite: `.ai/specs/typography-rewrite-2026-05-19.md`
