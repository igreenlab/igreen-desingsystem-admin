---
name: spec-token-spacing
description: >
  Especificar token de spacing (gap, padding, margin).
  Verificar se token existente já atende antes de criar novo.
---

# DS Designer — Spacing

## ⛔ Verificação prévia obrigatória

```
Antes de propor qualquer token de spacing:
1. Abrir semantic/spacing.ts
2. Verificar gap.*, space.*, pad.* — existe token com valor similar?
   Sim → usar o existente. NÃO criar.
   Ex: gap.md (8px) já existe → não criar gap.component-icon (8px)
   Não → justificar por que nenhum existente serve → prosseguir
```

## Grupos semânticos (arquivo: `semantic/spacing.ts`)

| Grupo | CSS var | Classe | Uso |
|-------|---------|--------|-----|
| `gap` | `--spacing-gp-*` | `gap-gp-*` | Entre filhos flex/grid, icon-to-label |
| `space` | `--spacing-sp-*` | `p-sp-*`, `m-sp-*` | Espaço genérico, margin, offset |
| `pad` | `--spacing-pad-*` | `px-pad-*` | Padding interno de componente |

## Escala base: 4px × n

| Token gap | Valor | Token space | Valor | Token pad | Valor |
|-----------|-------|-------------|-------|-----------|-------|
| `gap.2xs` | 2px | `space.2xs` | 2px | `pad.2xs` | 2px |
| `gap.xs` | 4px | `space.xs` | 4px | `pad.xs` | 4px |
| `gap.sm` | 6px | `space.sm` | 8px | `pad.sm` | 6px |
| `gap.md` | 8px | `space.md` | 16px | `pad.md` | 8px |
| `gap.lg` | 12px | `space.lg` | 24px | `pad.lg` | 12px |
| `gap.xl` | 16px | `space.xl` | 32px | `pad.xl` | 14px |
| `gap.2xl` | 24px | `space.2xl` | 48px | `pad.2xl` | 16px |
| `gap.3xl` | 32px | | | `pad.3xl` | 24px |

## Tokens de componente (`components/spacing.ts`)

| Token | Classe | Valor | Uso |
|-------|--------|-------|-----|
| `padCard.base` | `p-pad-card-base` | 24px | Card default |
| `padCard.sm` | `p-pad-card-sm` | 16px | Card compacto |
| `padPage.base` | `px-pad-page-base` | 24px | Page padding default |
| `padPage.sm` | `px-pad-page-sm` | 16px | Mobile |
| `padPage.lg` | `px-pad-page-lg` | 40px | Desktop wide |

## Escolher grupo correto

| Situação | Grupo |
|----------|-------|
| Gap entre ícone e texto em botão | `gap` → `gap-gp-md` |
| Gap entre cards na grid | `gap` → `gap-gp-xl` |
| Padding botão/input (horizontal) | `pad` → `px-pad-lg` |
| Padding de card | `padCard` → `p-pad-card-base` |
| Padding lateral de página | `padPage` → `px-pad-page-base` |
| Margin/offset genérico | `space` → `m-sp-md` |

## Regra: NUNCA Tailwind literal com equivalente DS

`gap-4` → `gap-gp-md` · `p-4` → `p-sp-md` · `px-3` → `px-pad-lg`
