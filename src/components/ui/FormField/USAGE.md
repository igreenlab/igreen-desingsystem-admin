# FormField — USAGE

Container de form com label + field + mensagem de validação (error/warning/success). Inclui wrappers "one-shot" (`FormFieldInput`, `FormFieldSelect`, etc) — a forma recomendada de consumo em forms (L-023).

## Quando usar

- Qualquer campo de formulário que tenha label + input + validação
- Garantir spacing e tipografia consistente entre campos
- NUNCA escrever `<label>` raw com classes manuais em forms (L-023)

## Import

```tsx
import {
  FormField, // base (children render-prop) — para widgets custom
  FormFieldInput, // wrappers one-shot (recomendados)
  FormFieldTextarea,
  FormFieldSelect,
  FormFieldCheckbox,
  FormFieldSwitch,
} from "@/components/ui/FormField";
import type { FieldState, FormFieldSelectOption } from "@/components/ui/FormField";
```

## Props essenciais

### `FormFieldBaseProps` — comuns a todos

| Prop             | Tipo                                              | Default       | Função                                                       |
| ---------------- | ------------------------------------------------- | ------------- | ------------------------------------------------------------ |
| `label`          | `string`                                          | —             | Label acima do field (Checkbox/Switch: `ReactNode`, inline)  |
| `required`       | boolean                                           | `false`       | Asterisco vermelho ao lado do label (só visual)              |
| `helperText`     | `ReactNode`                                       | —             | Texto auxiliar abaixo do field                               |
| `state`          | `"default" \| "error" \| "warning" \| "success"`  | `"default"`   | Estado semântico — afeta borda do field e mensagem exibida   |
| `errorMessage`   | `ReactNode`                                       | —             | Exibida quando `state="error"` (substitui o helperText)      |
| `warningMessage` | `ReactNode`                                       | —             | Exibida quando `state="warning"`                             |
| `successMessage` | `ReactNode`                                       | —             | Exibida quando `state="success"`                             |
| `id`             | `string`                                          | auto (`useId`) | Linka label↔input via `htmlFor`                             |
| `className`      | `string`                                          | —             | className do container externo                               |

### Específicas do `FormField` (base)

| Prop        | Tipo                                                  | Função                                                                       |
| ----------- | ----------------------------------------------------- | ---------------------------------------------------------------------------- |
| `children`  | `(ctx: { id: string; state: FieldState }) => ReactNode` | **Render-prop obrigatório** — recebe o id gerado + state pra repassar ao field |
| `hideLabel` | boolean                                               | Esconde o label (field self-contained, ex: Checkbox com label inline)        |
| `disabled`  | boolean                                               | Esmaece SÓ o label (opacity-50) — o field filho precisa do próprio `disabled` |

### Wrappers one-shot (recomendados — L-023)

| Componente          | Field interno                  | Extras                                                                                                                                        |
| ------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `FormFieldInput`    | `Input` / `InputGroup` (shadcn) | `startAddon` / `endAddon` (`ReactNode`; string vira `InputGroupText`, ex `"R$"`) + props de `Input`                                            |
| `FormFieldTextarea` | `Textarea` (shadcn)            | props de `Textarea`                                                                                                                            |
| `FormFieldSelect`   | `Select` (radix/shadcn)        | `options: FormFieldSelectOption[]` (`{ value, label, disabled? }`), `placeholder`, `value`, `defaultValue`, `onValueChange`, `disabled`, `triggerClassName`, `contentClassName` |
| `FormFieldCheckbox` | `Checkbox` (shadcn)            | label inline à direita do checkbox; props do Radix `Checkbox.Root`                                                                             |
| `FormFieldSwitch`   | `Switch` (shadcn)              | label inline; `switchPosition?: "start" \| "end"` (default `"end"`); props do Radix `Switch.Root`                                              |

## Variants (slots internos de estilo)

| Slot                        | Variant    | Valores                              | Default |
| --------------------------- | ---------- | ------------------------------------ | ------- |
| Label (`formFieldLabel`)    | `disabled` | true/false                           | false   |
| Message (`formFieldMessage`) | `state`    | default / error / warning / success  | default |

O container (`formFieldRoot`) não tem variants — é base-only (`flex flex-col gap-[7px] w-full`).

## Exemplo mínimo

```tsx
// Wrapper one-shot — forma recomendada
<FormFieldInput
  label="Email"
  required
  type="email"
  state="error"
  errorMessage="Email inválido"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// Com addons
<FormFieldInput label="Valor" startAddon="R$" placeholder="0,00" />

// Select
<FormFieldSelect
  label="País"
  placeholder="Selecione..."
  options={[
    { value: "br", label: "Brasil" },
    { value: "us", label: "Estados Unidos" },
  ]}
/>

// Base com widget custom — children é render-prop
<FormField label="Email" required state="error" errorMessage="Email inválido">
  {({ id, state }) => <Input id={id} state={state} type="email" />}
</FormField>
```

## Cuidados / Gotchas

- `children` do `FormField` base é **função** (render-prop), não JSX direto — passar ReactNode é erro de tipo e quebra em runtime
- NÃO existem componentes `FormFieldLabel`/`FormFieldMessage` — label e mensagem são props (`label`, `errorMessage`, `helperText`...); esses nomes existem só como slots internos em `form-field.styles.ts`
- Prioridade da mensagem: error → warning → success → helperText. A mensagem do state só aparece se a prop correspondente (`errorMessage`, etc) for passada
- O `state` é propagado ao field via argumento do render-prop (`ctx.state`) — não há context; em widget custom, repasse `id` e `state` manualmente
- `disabled` no `FormField` base esmaece apenas o label — passe `disabled` também ao field. Os wrappers (`FormFieldInput`, etc) propagam automaticamente
- Mensagem com `state="error"` recebe `role="alert"` (acessibilidade)
- Spacing label/field/message é do container — não adicionar margins customizados; entre fields empilhados use `gap-form-gap` (L-024)
- `required` é só visual — validação real é responsabilidade do consumer
