# FormField — USAGE

Container de form com label + input/select/etc + mensagem de validação (error/warning/success).

## Quando usar
- Qualquer campo de formulário que tenha label + input + validação
- Garantir spacing e tipografia consistente entre campos

## Import
```tsx
import {
  FormField,
  FormFieldLabel,
  FormFieldMessage,
} from "@/components/ui/FormField";
```

## Variants
| Slot | Variant | Valores | Default |
|---|---|---|---|
| Container | `disabled` | boolean | false |
| Container | `required` | boolean | false |
| Label | `disabled` | true/false | false |
| Message | `state` | default / error / warning / success | default |

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `disabled` | boolean | Aplica opacity 50% em todos os children |
| `required` | boolean | Mostra `*` no label |
| `children` | ReactNode | Label + Input + Message (ordem) |

## Exemplo mínimo
```tsx
<FormField required>
  <FormFieldLabel>Email</FormFieldLabel>
  <Input type="email" value={email} onChange={...} />
  <FormFieldMessage state="error">Email inválido</FormFieldMessage>
</FormField>
```

## Cuidados / Gotchas
- `FormFieldMessage` precisa de `state` explícito pra cor (default = `text-fg-muted`)
- Spacing entre label/input/message é controlado pelo container — não adicionar margins customizados
- Input usado dentro é qualquer `<Input>`, `<Select>`, `<Textarea>` do shadcn — todos respeitam o state via context
- `required` só visual — validação real é responsabilidade do consumer
