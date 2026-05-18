---
name: spec-token-sizing
description: >
  Especificar token de sizing, border-radius, shadow ou elevation.
  Verificar se token existente já atende antes de criar novo.
---

# DS Designer — Sizing, Radius, Shadow, Elevation

## ⛔ Verificação prévia obrigatória

```
Antes de propor qualquer token de sizing/radius/shadow:
1. Abrir o arquivo semântico correspondente
   - Form heights → components/sizing.ts
   - Radius → semantic/shape.ts
   - Shadow → semantic/elevation.ts
2. Existe token com valor similar?
   Sim → usar o existente. NÃO criar.
   Ex: form.md (36px) já existe → não criar form.button-compact (36px)
   Não → justificar por que nenhum existente serve → prosseguir
```

## Form heights — controles interativos (`components/sizing.ts`)
> `--spacing-form-*` → `min-h-form-*`

| Token | Valor | Uso |
|-------|-------|-----|
| `form.3xs` | 20px | badge micro, tab compacto |
| `form.2xs` | 24px | badge, tabs item |
| `form.xs` | 28px | button xxs |
| `form.sm` | 32px | button xs, input xs |
| `form.md` | 36px | desktop compacto |
| `form.lg` | 40px | **desktop default** |
| `form.xl` | 44px | **WCAG mobile** |

## Icon sizes (`components/sizing.ts`)
> `--spacing-icon-*` → `size-icon-*`

`icon.sm` 16px · `icon.md` 20px (default) · `icon.lg` 24px · `icon.xl` 32px

## Container widths
> `--container-*` → `max-w-container-*`

`xs` 480 · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1440
`sidebar-md` 280 · `modal-md` 640 · `dropdown-md` 240

## Radius (`semantic/shape.ts`)
> `--radius-radius-*` → `rounded-radius-*`
> Prefixo duplo INTENCIONAL — evita colisão com `rounded-sm/md/lg` TW nativo.

| Token | Valor | Uso |
|-------|-------|-----|
| `radius.xs` | 4px | sutil |
| `radius.md` | 8px | inputs |
| `radius.3xl` | 22px | badges, componentes menores |
| `radius.base` | 26px | **DEFAULT componentes interativos** |
| `radius.full` | 9999px | pills, avatars |

Relação form → radius:
- `form.lg/xl` → `rounded-radius-base` (26px)
- `form.xs/sm` → `rounded-radius-3xl` (22px)
- `form.2xs/3xs` → `rounded-radius-full` (pill) ou `rounded-radius-3xl`

**NUNCA:** `rounded-sm`, `rounded-md`, `rounded-lg` (são TW nativo, valores diferentes)

## Shadow (`semantic/elevation.ts`)
> `--shadow-sh-*` → `shadow-sh-*`
> Prefixo `sh` INTENCIONAL — evita colisão com `shadow-sm/md/lg` TW nativo.

| Token | Uso |
|-------|-----|
| `shadow.sm` | Card repouso, inputs |
| `shadow.md` | Card hover |
| `shadow.lg` | Dropdown, popover |
| `shadow.xl` | Modal |
| `shadow.2xl` | Toast |

**Dark mode:** opacidade ≥ 2× do light.
**NUNCA:** `shadow-sm`, `shadow-md`, `shadow-lg` (TW nativo)

## zIndex
`dropdown` 100 · `sticky` 200 · `overlay` 300 · `modal` 400 · `popover` 500 · `toast` 600 · `tooltip` 700

## Blur — usar TW nativo diretamente
Sem token DS para blur. Usar: `blur-sm` (4px) · `blur-md` (8px) · `blur-lg` (16px)
