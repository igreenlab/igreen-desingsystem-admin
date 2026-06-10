# CardCheckbox

**Categoria:** Form input (opção destacada).
**Status:** Disponível v0.7.0+.

## O que é

Checkbox apresentado como card clicável grande, com label + description
visíveis. Mesma estética dos radio cards do design system (bg verde fraco no
selected, border-brand, shadow leve).

Diferente do `FormFieldCheckbox` que é layout horizontal compact (ideal pra
um aceite "li os termos") — `CardCheckbox` é pra opções que merecem destaque
visual ("salvar essa conta", "marcar como favorito", "ativar notificações").

## Quando usar

- Opção dentro de form que precisa de visibilidade extra (com explicação)
- Toggle de feature opcional após uma ação principal (ex: "salvar essa conta
  pra usar depois")
- Item de lista de opções binárias onde cada item tem título + descrição
- Quando você quer área-clique grande (acessibilidade) sem inflar visualmente
  um checkbox simples

## Quando NÃO usar

- Lista de aceite legal (terms & conditions) → use `FormFieldCheckbox`
- Múltiplos checkboxes em sequência (form denso) → use `FormFieldCheckbox` com
  `gap-form-gap`
- Toggle ON/OFF de uma config (sem descrição longa) → use `Switch`

## Props essenciais

| Prop              | Tipo                    | Default | Descrição                                    |
|-------------------|-------------------------|---------|----------------------------------------------|
| `label`           | `ReactNode`             | —       | Título do card (obrigatório)                 |
| `description`    | `ReactNode`             | —       | Texto secundário abaixo do label             |
| `icon`            | `ReactNode`             | —       | Ícone opcional à esquerda (antes do checkbox)|
| `checked`         | `boolean \| "indeterminate"` | — | Estado controlado                         |
| `onCheckedChange` | `(checked) => void`     | —       | Callback de mudança                          |
| `disabled`        | `boolean`               | `false` | Desativa o card inteiro                      |
| `className`       | `string`                | —       | Override de classe no card root              |

Aceita também as demais props do `CheckboxPrimitive.Root` do Radix
(`name`, `required`, etc), **exceto `id`** (gerado automaticamente via
`useId()` pra vincular o `<label>` ao checkbox) e `className`, que é
aplicado ao card root (`<label>`), não ao checkbox Radix.

## Exemplo mínimo

```tsx
import { useState } from "react";
import { CardCheckbox } from "@/components/ui/CardCheckbox";

function MyForm() {
  const [save, setSave] = useState(true);
  return (
    <CardCheckbox
      label="Salvar essa conta pra usar depois"
      description="A conta aparecerá nas próximas vezes em 'Contas cadastradas'."
      checked={save}
      onCheckedChange={(v) => setSave(v === true)}
    />
  );
}
```

## Variants (via card-checkbox.styles.ts)

| Variant   | Valores                  | Efeito                                            |
|-----------|--------------------------|---------------------------------------------------|
| `selected` | `true` \| `false`       | Selected: bg-success-muted + border-brand + shadow|
| `disabled` | `true`                   | Opacity 50% + pointer-events none                 |

`selected` é derivado de `checked` automaticamente — não precisa passar.

## Gotchas

- **Não usar dentro de `<form>` sem prevenir submit** — clicar no card
  dispara o checkbox via label htmlFor. Se houver `<button type="submit">`
  no mesmo form, o teclado Enter no card pode submeter. Use
  `<button type="button">` em outros controles próximos.
- **`onCheckedChange` recebe `boolean | "indeterminate"`** — não pode passar
  direto pra `setState<boolean>`. Use `(v) => setX(v === true)`.
- **icon prop** é renderizado dentro de um `<span aria-hidden>` — não use
  ícone como controle clicável, só como dica visual.

## Tokens usados

- `bg-bg-success-muted` (selected bg)
- `border-border-brand` (selected border)
- `bg-bg-muted` (hover bg, não-selected)
- `text-fg-default` (label)
- `text-fg-muted` (description)
- `shadow-sh-sm` (selected shadow)
- `rounded-radius-lg`
- `p-pad-xl`
- `gap-gp-lg` (entre checkbox/icon/body)
- `ring-ring-brand` (focus)
