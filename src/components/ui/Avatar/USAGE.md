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
| `lg` | 32px   | caption-md (13px) |
| `xl` | 40px   | label-sm (14px)   |

## Colors

| Color      | Background         | Foreground          |
|------------|--------------------|--------------------|
| `brand`    | `bg-bg-brand`      | `fg-on-brand`      |
| `success`  | `bg-bg-success`    | `fg-on-success`    |
| `warning`  | `bg-bg-warning`    | `fg-on-warning`    |
| `critical` | `bg-bg-danger`     | `fg-on-danger`     |
| `info`     | `bg-bg-info`       | `fg-on-info`       |
| `muted`    | `bg-bg-muted`      | `fg-muted`         |

## colorHex override

When `colorHex` is provided (string starting with `#`), the background is set via
inline style and text becomes white. The `color` prop is ignored.

```tsx
<Avatar colorHex="#f59e0b">MS</Avatar>
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
