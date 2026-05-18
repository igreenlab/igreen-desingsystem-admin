# Shadcn → iGreen token map

> Carregar em qualquer tarefa que envolva componente Shadcn.

---

## Como funciona a integração (não precisa substituir classes)

A camada de compatibilidade em `globals.css` mapeia as CSS vars do Shadcn
para os tokens iGreen. Qualquer componente Shadcn instalado já consome
os tokens iGreen automaticamente via CSS vars:

```
componente usa  →  bg-primary
Tailwind gera   →  background-color: var(--primary)
globals.css tem →  --primary: var(--color-bg-primary)
resultado final →  token iGreen ✓
```

**Conclusão: instalar e mover para `shadcn/` já é suficiente.**
Substituição de classes é opcional — só fazer para deixar o código mais explícito.

---

## Camada de compatibilidade — globals.css

```css
/* Já está em src/styles/globals.css */
:root {
  --background:             var(--color-bg-canvas);
  --foreground:             var(--color-fg-foreground);
  --card:                   var(--color-bg-surface);
  --card-foreground:        var(--color-fg-foreground);
  --popover:                var(--color-bg-surface);
  --popover-foreground:     var(--color-fg-foreground);
  --primary:                var(--color-bg-primary);
  --primary-foreground:     var(--color-fg-on-primary);
  --secondary:              var(--color-bg-secondary);
  --secondary-foreground:   var(--color-fg-on-secondary);
  --muted:                  var(--color-bg-muted);
  --muted-foreground:       var(--color-fg-muted);
  --accent:                 var(--color-bg-muted);
  --accent-foreground:      var(--color-fg-foreground);
  --destructive:            var(--color-bg-danger);
  --destructive-foreground: var(--color-fg-on-danger);
  --border:                 var(--color-border-main);
  --input:                  var(--color-border-main);
  --ring:                   var(--color-ring-primary);
  --radius:                 var(--radius-md);
}
```

---

## Tabela de substituição (OPCIONAL)

Usar apenas quando quiser código mais explícito com nomes iGreen.

| Classe Shadcn | Classe iGreen equivalente | Observação |
|---------------|--------------------------|------------|
| `bg-primary` | `bg-bg-primary` | opcional |
| `text-primary-foreground` | `text-fg-on-primary` | opcional |
| `bg-secondary` | `bg-bg-secondary` | opcional |
| `text-secondary-foreground` | `text-fg-on-secondary` | opcional |
| `bg-destructive` | `bg-bg-danger` | opcional |
| `text-destructive-foreground` | `text-fg-on-danger` | opcional |
| `bg-muted` | `bg-bg-muted` | opcional |
| `text-muted-foreground` | `text-fg-muted` | opcional |
| `bg-background` | `bg-bg-canvas` | opcional |
| `bg-card` | `bg-bg-surface` | opcional |
| `text-foreground` | `text-fg-foreground` | opcional |
| `border-border` | `border-border-main` | opcional |
| `ring-ring` | `ring-ring-primary` | opcional |
| `text-xs font-semibold` | `text-label-xs` | recomendado |
| `text-sm font-medium` | `text-label-sm` | recomendado |

---

## O que é obrigatório substituir (independente de preferência)

1. **`h-*` fixo → `min-h-form-*`** — height fixo quebra acessibilidade

   | Shadcn usa | Altura real | Substituir por | Altura iGreen |
   |------------|-------------|----------------|---------------|
   | `h-8` | 32px | `min-h-form-sm` | 32px |
   | `h-9` | 36px | `min-h-form-md` | 36px |
   | `h-10` | 40px | `min-h-form-lg` | 40px |
   | `h-11` | 44px | `min-h-form-xl` | 44px |

   *Para targets interativos mobile: sempre `min-h-form-xl` (44px WCAG).
   Para desktop: `min-h-form-lg` (40px) é o padrão.

2. **`text-sm font-*` → preset tipográfico** — para consistência iGreen
3. **`hover:bg-primary/80`** — opacidade via `/` não funciona com CSS vars. Usar `hover:bg-bg-primary-hover`

---

## O que NUNCA substituir

Manter exatamente como o Shadcn entrega:
- Layout: `flex`, `items-center`, `justify-between`, `gap-*`
- Transições: `transition-*`, `duration-*`
- Estados Radix: `data-[state=*]`, `data-[side=*]`, `data-[disabled]`
- Posicionamento: `absolute`, `relative`, `inset-*`, `z-*`
- `overflow-hidden`, `pointer-events-none`, `cursor-*`
