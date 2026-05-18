# Guia de componentes — iGreen DS

> Carregar quando a tarefa envolve: criar componente iGreen, editar estilo
> de componente existente, ou adicionar variante.
>
> Para Shadcn: usar `.ai/context/components/shadcn-token-map.md`
> Para compostos: usar `/ds-create-composite`
> Para implementação completa: usar `.claude/skills/ds-dev/impl-igreen.md` (fonte de verdade)

---

## Como funciona o sistema de estilos

```
color-light.ts → bg.primary = oklch(...)
      ↓
to-tailwind-v4.ts → --color-bg-primary: oklch(...)
      ↓
Tailwind v4 → bg-bg-primary { background: var(--color-bg-primary) }
      ↓
button.styles.ts → "bg-bg-primary text-fg-on-primary"
```

O `.styles.ts` é a única fonte de verdade visual do componente.

---

## Estrutura obrigatória

```
src/components/ui/NomeComponente/
├── index.ts
├── nome-componente.tsx        # lógica e markup — ZERO hardcode
├── nome-componente.styles.ts  # tv() — variantes, tamanhos, estados
├── nome-componente.types.ts   # interfaces e VariantProps
└── USAGE.md                   # documentação — OBRIGATÓRIO
```

---

## Padrão de `.styles.ts` — referência completa

```typescript
import { tv, type VariantProps } from "@/utils/tv"; // ← SEMPRE @/utils/tv

export const nomeVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    "select-none whitespace-nowrap",
    "border border-transparent",     // ← obrigatório para transição suave
    "transition-all duration-200 ease-out",
    // Focus ring: APENAS outline-none no base.
    // O ring por cor fica em cada color variant abaixo.
    "focus-visible:outline-none",
  ],

  variants: {
    color: {
      // ⚠️ Ring POR COR — cada variante usa seu próprio ring token
      // NUNCA colocar ring-ring-primary fixo no base (errado para secondary/danger/etc.)
      primary:   "focus-visible:ring-4 focus-visible:ring-ring-primary",
      secondary: "focus-visible:ring-4 focus-visible:ring-ring-secondary",
      danger:    "focus-visible:ring-4 focus-visible:ring-ring-danger",
      success:   "focus-visible:ring-4 focus-visible:ring-ring-success",
      warning:   "focus-visible:ring-4 focus-visible:ring-ring-warning",
    },
    variant: {
      filled:  "",
      outline: "",
      soft:    "",
      ghost:   "bg-transparent",
    },
    size: {
      // Prefixos obrigatórios: gap-gp-*, px-pad-*, rounded-radius-*, min-h-form-*
      xxs: "min-h-form-xs  px-pad-md  gap-gp-sm  rounded-radius-3xl  text-label-sm",
      xs:  "min-h-form-sm  px-pad-lg  gap-gp-sm  rounded-radius-3xl  text-label-sm",
      sm:  "min-h-form-md  px-pad-xl  gap-gp-md  rounded-radius-base text-label-sm",
      md:  "min-h-form-lg  px-pad-2xl gap-gp-md  rounded-radius-base text-label-sm",
    },
    fullWidth: { true: "w-full flex-1" },
    disabled:  { true: "pointer-events-none" },
  },

  compoundVariants: [
    // ── 1. Compostos cor × variant ────────────────────────────────────────
    { color: "primary", variant: "filled",
      class: "bg-bg-primary text-fg-on-primary hover:bg-bg-primary-hover" },
    { color: "primary", variant: "outline",
      class: "bg-bg-surface border-border-primary text-fg-primary shadow-sh-sm hover:bg-bg-primary-subtle hover:border-transparent hover:shadow-sh-none" },
    { color: "primary", variant: "soft",
      class: "bg-bg-primary-subtle text-fg-primary hover:bg-bg-surface hover:border-border-primary" },
    { color: "primary", variant: "ghost",
      class: "text-fg-primary hover:bg-bg-primary-subtle" },

    { color: "secondary", variant: "filled",
      class: "bg-bg-secondary text-fg-on-secondary hover:bg-bg-secondary-hover" },
    { color: "secondary", variant: "outline",
      class: "bg-bg-surface border-border-main text-fg-muted shadow-sh-sm hover:bg-bg-secondary-subtle hover:text-fg-foreground hover:border-transparent hover:shadow-sh-none" },
    { color: "secondary", variant: "soft",
      class: "bg-bg-muted text-fg-muted hover:bg-bg-surface hover:text-fg-foreground hover:border-border-main" },
    { color: "secondary", variant: "ghost",
      class: "text-fg-muted hover:bg-bg-muted hover:text-fg-foreground" },

    { color: "danger", variant: "filled",
      class: "bg-bg-danger text-fg-on-danger hover:bg-bg-danger-hover" },
    { color: "danger", variant: "outline",
      class: "bg-bg-surface border-border-danger-muted text-fg-danger shadow-sh-sm hover:bg-bg-danger-muted hover:border-transparent hover:shadow-sh-none" },
    { color: "danger", variant: "soft",
      class: "bg-bg-danger-muted text-fg-danger hover:bg-bg-surface hover:border-border-danger-muted" },
    { color: "danger", variant: "ghost",
      class: "text-fg-danger hover:bg-bg-danger-muted" },

    { color: "success", variant: "filled",
      class: "bg-bg-success text-fg-on-success hover:bg-bg-success-hover" },
    { color: "success", variant: "outline",
      class: "bg-bg-surface border-border-success text-fg-success shadow-sh-sm hover:bg-bg-success-subtle hover:border-transparent hover:shadow-sh-none" },
    { color: "success", variant: "soft",
      class: "bg-bg-success-subtle text-fg-success hover:bg-bg-surface hover:border-border-success" },
    { color: "success", variant: "ghost",
      class: "text-fg-success hover:bg-bg-success-subtle" },

    { color: "warning", variant: "filled",
      class: "bg-bg-warning text-fg-on-warning hover:bg-bg-warning-hover" },
    { color: "warning", variant: "outline",
      class: "bg-bg-surface border-border-warning text-fg-warning shadow-sh-sm hover:bg-bg-warning-subtle hover:border-transparent hover:shadow-sh-none" },
    { color: "warning", variant: "soft",
      class: "bg-bg-warning-subtle text-fg-warning hover:bg-bg-surface hover:border-border-warning" },
    { color: "warning", variant: "ghost",
      class: "text-fg-warning hover:bg-bg-warning-subtle" },

    // ── 2. Disabled — SEMPRE por último ──────────────────────────────────
    { disabled: true,
      class: "bg-bg-disabled text-fg-disabled border-transparent shadow-sh-none" },
    { disabled: true, variant: "outline",
      class: "bg-transparent border-border-disabled" },
    { disabled: true, variant: "soft",  class: "bg-bg-disabled" },
    { disabled: true, variant: "ghost", class: "bg-transparent" },
  ],

  defaultVariants: { color: "primary", variant: "filled", size: "md" },
});

export type NomeVariantProps = VariantProps<typeof nomeVariants>;
```

---

## Regras invioláveis

1. **`import { tv } from "@/utils/tv"`** — nunca de `tailwind-variants` direto
2. **Zero hardcode** — nenhum hex, px, rem solto, classe Tailwind literal com equivalente DS
3. **`min-h-form-*`** — nunca `h-*` fixo (h-9 = min-h-form-md, h-10 = min-h-form-lg)
4. **Disabled por último** — compound `{ disabled: true }` sempre ao final do array
5. **`border border-transparent` na base** — transição suave para variantes com borda
6. **Ring no color variant, não no base** — cada cor usa seu próprio `ring-ring-{color}`
7. **Mudar visual** = mudar só `.styles.ts`, nunca o `.tsx`

---

## Prefixos de classe obrigatórios

| Tipo | Prefixo DS | Nunca usar |
|------|-----------|------------|
| Gap | `gap-gp-*` | `gap-4`, `gap-gap-*` |
| Padding genérico | `p-sp-*` | `p-4`, `p-6` |
| Padding componente | `px-pad-*` | `px-3`, `px-4` |
| Border radius | `rounded-radius-*` | `rounded-sm`, `rounded-lg` |
| Shadow | `shadow-sh-*` | `shadow-sm`, `shadow-md` |
| Focus ring | `ring-ring-{color}` (sem `/`) | `ring-primary/30`, `ring-ring-primary` no base |
| Height interativo | `min-h-form-*` | `h-10`, `h-11` |
| Icon size | `size-icon-*` | `size-5`, `w-5 h-5` |
| Container | `max-w-container-*` | `max-w-sm`, `max-w-2xl` |

---

## Como o `.tsx` consome o `.styles.ts`

```typescript
import { forwardRef } from "react";
import { nomeVariants } from "./nome-componente.styles";
import type { NomeComponenteProps } from "./nome-componente.types";

export const NomeComponente = forwardRef<HTMLButtonElement, NomeComponenteProps>(
  function NomeComponente(
    { color, variant, size, disabled, fullWidth, className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={nomeVariants({ color, variant, size, disabled, fullWidth, className })}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

NomeComponente.displayName = "NomeComponente";
```

> Adaptar `HTMLButtonElement` e `<button>` para o elemento HTML correto se o componente não for um botão.

---

## Mapa de componentes — o que existe

Ver sempre `component-inventory.md` antes de criar.
