# Modal — USAGE

Dialog modal centrado com header (icon + title + description), body livre e footer com actions.

## Quando usar
- Confirmação ou input que **interrompe** o fluxo (ex: editar dados, formulário curto)
- Ação destrutiva → preferir `<AlertModal>` (mais explícito sobre tone)
- Side-drawer → preferir `<Panel>` ou `<FloatingPanel>`

## Import
```tsx
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/Modal";
```

## Variants
| Variant | Valores | Default | Tamanho |
|---|---|---|---|
| `size` | sm / md / lg | md | 440 / 540 / 720px max-width |
| Footer `layout` | end / between | end | "between" pra tertiary à esquerda |

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `open` | boolean | Visibilidade |
| `onOpenChange` | (open: boolean) => void | Callback |
| `title` | string | Header title |
| `description` | string | Header subtitle (opcional) |
| `icon` | ReactNode | Icon decorativo no header |
| `size` | "sm" \| "md" \| "lg" | Largura máxima |

## Exemplo mínimo
```tsx
<Modal
  open={open}
  onOpenChange={setOpen}
  size="md"
  title="Editar cliente"
  description="Alterações são salvas automaticamente"
>
  <ModalBody>
    <FormFields />
  </ModalBody>
  <ModalFooter layout="end">
    <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
    <Button onClick={handleSave}>Salvar</Button>
  </ModalFooter>
</Modal>
```

## Cuidados / Gotchas
- Footer `layout="between"` exige tertiary à esquerda (ex: "Deletar" + grupo de cancel/save à direita)
- Body é scrollável automaticamente (max-h interno)
- Render via portal — escapa de overflow/transform ancestrais
- Pra confirmação destrutiva, use `<AlertModal>` (tem `tone="danger"` semântico)
