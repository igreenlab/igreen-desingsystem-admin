# Avatar

Circular badge displaying user initials. Supports semantic colors and per-person hex overrides.

## Basic usage

```tsx
import { Avatar } from "@/components/ui/Avatar";

// Semantic color (default: muted)
<Avatar size="md" color="brand">MS</Avatar>

// Person-specific hex color
<Avatar size="sm" colorHex="#8754ec">CO</Avatar>
```

## Sizes

| Size | Pixels | Typography preset |
|------|--------|-------------------|
| `xs` | 20px   | caption-sm (11px) |
| `sm` | 24px   | caption-sm (11px) |
| `md` | 28px   | caption-sm (11px) |
| `lg` | 32px   | body-sm font-normal (13px) |
| `xl` | 40px   | body-md font-medium (14px) |

## Colors

| Color      | Background         | Foreground          |
|------------|--------------------|--------------------|
| `brand`    | `bg-bg-brand`      | `fg-on-brand`      |
| `success`  | `bg-bg-success`    | `fg-on-success`    |
| `warning`  | `bg-bg-warning`    | `fg-on-warning`    |
| `critical` | `bg-bg-danger`     | `fg-on-danger`     |
| `info`     | `bg-bg-info`       | `fg-on-info`       |
| `muted`    | `bg-bg-muted`      | `fg-muted`         |

## colorHex override + auto contrast (v0.7.1+)

When `colorHex` is provided (string starting with `#`), the background is set
via inline style and **a cor de texto é escolhida automaticamente** pra ter
o maior contraste WCAG entre `white` ou `black`. O prop `color` é ignorado.

| Hex bg               | Texto auto-pickado | Motivo (WCAG ratio)                    |
|----------------------|--------------------|----------------------------------------|
| `#FAE128` (BB)       | `black`            | white 1.29 vs black 16.3 → preto vence |
| `#820AD1` (Nubank)   | `white`            | white 6.2 vs black 3.4 → branco vence  |
| `#EC7000` (Itaú)     | `black`            | white 2.7 vs black 7.8 → preto vence   |
| `#CC092F` (Bradesco) | `white`            | white 6.5 vs black 3.2 → branco vence  |
| `#FFFFFF`            | `black`            | óbvio                                   |
| `#000000`            | `white`            | óbvio                                   |

A escolha vem de `getContrastTextColor()` em `@/utils/color-contrast.ts`
(WCAG 2.x relative luminance + contrast ratio).

```tsx
<Avatar colorHex="#FAE128">BB</Avatar>      // texto preto auto
<Avatar colorHex="#820AD1">NU</Avatar>      // texto branco auto
```

**Override manual:** se precisar forçar uma cor específica (caso raro de
brand guideline), passe via `className`:

```tsx
<Avatar colorHex="#FAE128" className="text-white">BB</Avatar>
// (não recomendado — quebra WCAG AA)
```

## Accessibility

- With `aria-label`: renders `role="img"` (semantic avatar).
- Without `aria-label`: renders `aria-hidden="true"` (decorative).

```tsx
// Semantic — standalone avatar with meaning
<Avatar aria-label="Maria Silva">MS</Avatar>

// Decorative — inside a card/cell that already provides context
<Avatar colorHex="#8754ec">CO</Avatar>
```

## Props

| Prop         | Type                                                        | Default   |
|--------------|-------------------------------------------------------------|-----------|
| `size`       | `"xs" \| "sm" \| "md" \| "lg" \| "xl"`                     | `"md"`    |
| `color`      | `"brand" \| "success" \| "warning" \| "critical" \| "info" \| "muted"` | `"muted"` |
| `colorHex`   | `string` (hex starting with `#`)                            | —         |
| `children`   | `ReactNode` (initials)                                      | —         |
| `className`  | `string`                                                    | —         |
| `aria-label` | `string`                                                    | —         |
