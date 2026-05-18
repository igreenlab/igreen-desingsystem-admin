# Panel — USAGE

Drawer flutuante lateral (right/left/top/bottom) — 560px com header + body scrollável + footer sticky.

## Quando usar
- Detail/edit panel que precisa de mais espaço que `<Modal>`
- Forms longos com seções (preferível a Modal large)
- Quando user precisa ver conteúdo ao lado enquanto interage

## Import
```tsx
import {
  Panel,
  PanelHeader,
  PanelBody,
  PanelFooter,
} from "@/components/ui/Panel";
```

## Variants
| Variant | Valores | Default | Tamanho |
|---|---|---|---|
| `side` | right / left / top / bottom | right | 560px lateral, 70vh top/bottom |

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `open` | boolean | Visibilidade |
| `onOpenChange` | (open: boolean) => void | Callback de fechamento |
| `side` | "right" \| "left" \| "top" \| "bottom" | Lado de ancoragem |
| `title` | string | Header title |
| `description` | string | Header subtitle |
| `onClose` | () => void | Callback explícito do X (além de onOpenChange) |

## Exemplo mínimo
```tsx
<Panel
  open={panelOpen}
  onOpenChange={setPanelOpen}
  side="right"
  title="Editar cliente"
  description="Salvo automaticamente"
>
  <PanelBody>
    <ClientForm />
  </PanelBody>
  <PanelFooter>
    <Button variant="ghost" onClick={() => setPanelOpen(false)}>Cancelar</Button>
    <Button onClick={handleSave}>Salvar</Button>
  </PanelFooter>
</Panel>
```

## Cuidados / Gotchas
- **Modal** (com backdrop) — bloqueia interação com página atrás. Pra non-modal, usar `<FloatingPanel>`
- Gutter encolhe no mobile (`max-md:` classes ajustam)
- Body é único elemento scrollável — header e footer ficam sticky
- Pra `side="top"` ou `side="bottom"`, layout vira sheet com altura 70vh
