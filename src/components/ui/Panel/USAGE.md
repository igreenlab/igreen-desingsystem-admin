# Panel — USAGE

Drawer flutuante lateral (right/left/top/bottom) — default `md` (560px) com header + body scrollável + footer sticky.

## Quando usar
- Detail/edit panel que precisa de mais espaço que `<Modal>`
- Forms longos com seções (preferível a Modal large)
- Quando user precisa ver conteúdo ao lado enquanto interage

## Import
```tsx
import { Panel } from "@/components/ui/Panel";

// Composição manual (avançado): PanelRoot, PanelTrigger, PanelContent,
// PanelHeader, PanelBody, PanelFooter, PanelCloseAction
```

## Variants
| Variant | Valores | Default | Tamanho |
|---|---|---|---|
| `side` | right / left / top / bottom | right | right/left: largura via `size`, altura full (gutter 24px); top/bottom: largura via inset, altura conforme conteúdo |
| `size` | sm / md / lg / xl / full \| string CSS | md | 320 / 560 / 720 / 920px / full (viewport − gutter). Aceita CSS arbitrário: `"720px"`, `"60vw"` |

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `open` | boolean | Visibilidade (controlled) |
| `onOpenChange` | (open: boolean) => void | Callback de abertura/fechamento (o X do header fecha por aqui) |
| `trigger` | ReactNode | Elemento que abre o panel sem state externo (vira `<SheetTrigger asChild>`) |
| `side` | "right" \| "left" \| "top" \| "bottom" | Lado de ancoragem (default: "right") |
| `size` | "sm" \| "md" \| "lg" \| "xl" \| "full" \| string | Largura (default: "md" = 560px) |
| `title` | string | Header title |
| `description` | string | Header subtitle |
| `titleIcon` | LucideIcon | Ícone à esquerda do título (cor brand) |
| `footer` | ReactNode | Footer sticky — geralmente botões de ação (único caminho pro footer no modo all-in-one) |

## Exemplo mínimo
```tsx
<Panel
  open={panelOpen}
  onOpenChange={setPanelOpen}
  side="right"
  title="Editar cliente"
  description="Salvo automaticamente"
  footer={
    <>
      <Button variant="ghost" onClick={() => setPanelOpen(false)}>Cancelar</Button>
      <Button onClick={handleSave}>Salvar</Button>
    </>
  }
>
  <ClientForm />
</Panel>
```

## Cuidados / Gotchas
- **Children são auto-embrulhados em `<PanelBody>`** — NÃO passar `<PanelBody>`/`<PanelFooter>` como filhos do `<Panel>` (duplica o body e o footer perde o sticky). Footer vai SEMPRE via prop `footer`. Pra composição manual, usar `PanelRoot`/`PanelTrigger`/`PanelContent` do barrel
- **Modal** (com backdrop suave / `SheetOverlay`) — bloqueia interação com página atrás. Pra non-modal, usar `<FloatingPanel>`
- **Mobile (<md)**: independente do `side`, vira **sheet bottom-up colado nas bordas** do device — flush nas laterais + bottom, só cantos superiores arredondados, sem outline/shadow, `max-height: 92vh`, slide bottom-up. O backdrop (modal) continua
- Body é único elemento scrollável (`overflow-y-auto` + `min-h-0`) — header e footer ficam fixos; conteúdo longo rola automaticamente
- **Footer fluido**: botões crescem lado a lado e **empilham quando não cabem** (`flex-wrap` + `flex-1` + `min-w-140px`). Não precisa passar `fullWidth` nos Buttons
- No desktop o `side` controla orientação/slide normalmente (right/left/top/bottom)
