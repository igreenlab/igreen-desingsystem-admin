# FloatingPanel — USAGE

Drawer card flutuante non-modal — resizável, maximizável, coexiste com página atrás (sem backdrop).

## Quando usar
- Detail panel que precisa ficar visível enquanto user interage com lista atrás
- Side-drawer leve sem bloquear navegação
- Painel de propriedades estilo Figma/Notion

## Import
```tsx
import { FloatingPanel } from "@/components/ui/FloatingPanel";
```

## Variants
| Variant | Valores | Default | Quando |
|---|---|---|---|
| `side` | left / right | right | Lado de ancoragem |
| `size` | sm / md / lg / xl | md | sm=320, md=400, lg=560, xl=720px |

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `open` | boolean | Visibilidade |
| `onOpenChange` | (open: boolean) => void | Callback de fechamento |
| `title` | string | Header title |
| `description` | string | Header subtitle |
| `resizable` | boolean | Habilita drag-resize |
| `maximizable` | boolean | Botão de expandir pra fullscreen |
| `headerActions` | ReactNode | Slots no header |
| `footer` | ReactNode | Slot do footer sticky |
| `titleSlot` | ReactNode | Override total do header (avatar + nome custom) |

## Exemplo mínimo
```tsx
<FloatingPanel
  open={panelOpen}
  onOpenChange={setPanelOpen}
  side="right"
  size="md"
  title="Detalhes do cliente"
  description="Última edição há 2h"
  resizable
  maximizable
  footer={<><Button variant="ghost">Cancelar</Button><Button>Salvar</Button></>}
>
  <ClientDetails />
</FloatingPanel>
```

## Cuidados / Gotchas
- Renderizado via **portal em document.body** — escapa de overflow/transform ancestrais
- Em mobile (<md) vira **sheet bottom-up colado nas bordas** do device: flush nas laterais + bottom, só cantos superiores arredondados, sem outline/shadow, `max-height: 92vh`
- **Backdrop só em mobile** — scrim suave (toque fora fecha). No **desktop segue non-modal** (sem backdrop, página atrás clicável). Pra modal full use `<Modal>` ou `<AlertModal>`
- **Body com scroll automático** (`overflow-y-auto` + `min-h-0`) — header/footer ficam fixos, conteúdo longo rola
- **Footer fluido**: botões crescem lado a lado e **empilham quando não cabem** (`flex-wrap` + `flex-1` + `min-w-140px`). Não precisa passar `fullWidth` nos Buttons
- `maximizable=true` adiciona botão de expandir; estado controlado internamente
