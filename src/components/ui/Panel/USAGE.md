# Panel — USAGE

<!-- ds:regras
- painel de DETALHE de registro → siga o bloco `dsgreen-paneldetail-1` (estrutura: identidade no header, métricas em cards, seções colapsáveis, ação primária no footer)
- header aqui é só STRING (`title`/`description`): precisa de avatar, Chip de status ou ação de ícone? → `FloatingPanel`
- form dentro dele → `<FormField>` + `gap-form-gap`, nunca `<label>` cru
- aba dentro dele → `<Tabs fullWidth>` na variante default (560px é estreito pro `line`)
-->

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

## Painel de DETALHE de registro → o bloco `dsgreen-paneldetail-1`

Detalhe de registro tem estrutura definida e referenciável por ID: a composição inteira mora
em `src/blocks/paneldetail/` e renderiza em `#/blocks-paneldetail`. Cite o ID em vez de
recompor — `use a referência dsgreen-paneldetail-1 no painel de detalhe do pedido`. As zonas
(identidade no header · métricas em cards · seções colapsáveis · ação primária no footer) e o
porquê de cada uma estão documentados no arquivo do bloco.

⚠️ **O bloco usa `FloatingPanel`, e a razão é este componente aqui:** o header do `Panel`
aceita `title`/`description` como **string**, então avatar, `Chip` de status inline e ação de
ícone não cabem nele. Precisa desse header → `FloatingPanel` (`titleSlot` + `headerActions`).
Escolha o `Panel` quando o que importa é **bloquear** a tela atrás e o header é texto simples.

## Cuidados / Gotchas
- **Aba dentro do Panel** → `<Tabs fullWidth>` com a variante **default** (`segmented`). O Panel tem 560px: `line` aqui vira um trilho curto que lê como fragmento, e sem `fullWidth` as abas ficam num canto. `line` só se houver um `segmented` num nível acima.

- **Children são auto-embrulhados em `<PanelBody>`** — NÃO passar `<PanelBody>`/`<PanelFooter>` como filhos do `<Panel>` (duplica o body e o footer perde o sticky). Footer vai SEMPRE via prop `footer`. Pra composição manual, usar `PanelRoot`/`PanelTrigger`/`PanelContent` do barrel
- **Modal** (com backdrop suave / `SheetOverlay`) — bloqueia interação com página atrás. Pra non-modal, usar `<FloatingPanel>`
- **Mobile (<md)**: independente do `side`, vira **sheet bottom-up colado nas bordas** do device — flush nas laterais + bottom, só cantos superiores arredondados, sem outline/shadow, `max-height: 92vh`, slide bottom-up. O backdrop (modal) continua
- Body é único elemento scrollável (`overflow-y-auto` + `min-h-0`) — header e footer ficam fixos; conteúdo longo rola automaticamente
- **Footer fluido**: botões crescem lado a lado e **empilham quando não cabem** (`flex-wrap` + `flex-1` + `min-w-140px`). Não precisa passar `fullWidth` nos Buttons
- No desktop o `side` controla orientação/slide normalmente (right/left/top/bottom)
