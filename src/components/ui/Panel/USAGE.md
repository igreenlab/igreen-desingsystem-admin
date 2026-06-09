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
- **Modal** (com backdrop suave / `SheetOverlay`) — bloqueia interação com página atrás. Pra non-modal, usar `<FloatingPanel>`
- **Mobile (<md)**: independente do `side`, vira **sheet bottom-up colado nas bordas** do device — flush nas laterais + bottom, só cantos superiores arredondados, sem outline/shadow, `max-height: 92vh`, slide bottom-up. O backdrop (modal) continua
- Body é único elemento scrollável (`overflow-y-auto` + `min-h-0`) — header e footer ficam fixos; conteúdo longo rola automaticamente
- **Footer fluido**: botões crescem lado a lado e **empilham quando não cabem** (`flex-wrap` + `flex-1` + `min-w-140px`). Não precisa passar `fullWidth` nos Buttons
- No desktop o `side` controla orientação/slide normalmente (right/left/top/bottom)
