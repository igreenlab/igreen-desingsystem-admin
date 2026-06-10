# Modal — USAGE

Dialog modal centrado com header (icon + title + description), body livre via `children` e footer estruturado por props de action (até 3 botões) — não há subcomponentes de composição.

## Quando usar
- Confirmação ou input que **interrompe** o fluxo (ex: editar dados, formulário curto)
- Ação destrutiva → preferir `<AlertModal>` (mais explícito sobre tone)
- Side-drawer → preferir `<Panel>` ou `<FloatingPanel>`

## Import
```tsx
import { Modal } from "@/components/ui/Modal";
// types: import type { ModalProps, ModalAction, ModalSize } from "@/components/ui/Modal";
```

## Variants
| Variant | Valores | Default | Tamanho |
|---|---|---|---|
| `size` | sm / md / lg | md | 440 / 540 / 720px max-width |

O layout do footer NÃO é prop: com `tertiaryAction` presente o footer vira
`justify-between` (tertiary à esquerda, secondary+primary à direita);
sem tertiary, tudo fica à direita (`justify-end`).

## Props essenciais
| Prop | Tipo | Default | Função |
|---|---|---|---|
| `open` | boolean | — | Controlled open (obrigatória) |
| `onClose` | () => void | — | Callback quando o modal pede pra fechar — X, ESC, overlay click ou ação (obrigatória) |
| `title` | ReactNode | — | Header title |
| `description` | ReactNode | — | Header subtitle (opcional) |
| `icon` | ReactNode | — | Icon decorativo no header (container 40×40) |
| `children` | ReactNode | — | Conteúdo do body (flex-col, gap 18px) |
| `primaryAction` | ModalAction | — | Botão filled à direita (critical quando `danger: true`) |
| `secondaryAction` | ModalAction | — | Botão outline secondary. `onClick` default = `onClose` |
| `tertiaryAction` | ModalAction | — | Botão ghost à ESQUERDA (ativa justify-between). Ghost critical quando `danger: true` |
| `footer` | ReactNode | — | Escape hatch — substitui inteiramente as 3 actions estruturadas |
| `size` | "sm" \| "md" \| "lg" | "md" | Largura máxima |
| `hideClose` | boolean | false | Esconde o X de fechar |
| `closeOnOverlay` | boolean | true | Click no overlay fecha o modal |

Shape de `ModalAction`:
```ts
type ModalAction = {
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean; // pinta o botão com cor critical (destrutivo)
};
```

## Exemplo mínimo
```tsx
<Modal
  open={open}
  onClose={() => setOpen(false)}
  size="md"
  title="Editar cliente"
  description="Alterações são salvas automaticamente"
  primaryAction={{ label: "Salvar", onClick: handleSave }}
  secondaryAction={{ label: "Cancelar" }}
>
  <FormFields />
</Modal>
```

## Cuidados / Gotchas
- Footer aparece só quando há `footer` OU alguma action estruturada — sem nada disso, o modal não renderiza footer
- `tertiaryAction` à esquerda é o padrão pra ações destrutivas (ex: "Deletar") ou neutras (ajuda); o grupo cancel/save fica à direita
- Body NÃO scrolla automaticamente — o container tem `overflow-hidden`, conteúdo maior que o viewport é clipado. Pra conteúdo longo, controle a altura/scroll no próprio children
- `closeOnOverlay={false}` ignora fechamento por overlay E por ESC (Radix dispara o mesmo callback) — pra prevenção fina, controle externamente
- Render via portal — escapa de overflow/transform ancestrais
- Pra confirmação destrutiva, use `<AlertModal>` (tem `tone="danger"` semântico)
