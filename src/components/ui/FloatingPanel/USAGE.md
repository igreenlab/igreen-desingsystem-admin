# FloatingPanel — USAGE

<!-- ds:regras
- painel de DETALHE → siga um bloco da família `dsgreen-paneldetail-*`: registro com muitos campos → `-1` · tarefa com anexo/comentário/log → `-2` · com tabela dentro → `-3` (e aí `size="xl"`)
- em todos: identidade ou contexto no `titleSlot`, ações de ícone `soft` + `aria-label` no `headerActions`, ação primária no `footer` — nunca botão de ação solto no corpo
- `bodyPadded={false}` quando usar `FloatingPanelSection` (a section gerencia padding e divisória full-width)
- é REDIMENSIONÁVEL em runtime — nenhuma largura escrita na mão acompanha o arrasto
- aba dentro dele → `<Tabs fullWidth>` na variante default; `line` aqui vira trilho curto
-->

Drawer card flutuante non-modal — resizável, maximizável, coexiste com página atrás (sem backdrop).

## Quando usar
- Detail panel que precisa ficar visível enquanto user interage com lista atrás
- Side-drawer leve sem bloquear navegação
- Painel de propriedades estilo Figma/Notion

## Import
```tsx
import {
  FloatingPanel,
  FloatingPanelSection, // seção colapsável (detail panel)
  FloatingPanelField,   // linha label : valor
} from "@/components/ui/FloatingPanel";
```

## Variants
| Variant | Valores | Default | Quando |
|---|---|---|---|
| `side` | left / right | right | Lado de ancoragem |
| `size` | sm / md / lg / xl / number (px) | md | sm=320, md=400, lg=560, xl=720px. `number` = largura custom em px; com `resizable`, vira a largura inicial |

## Props essenciais
| Prop | Tipo | Função |
|---|---|---|
| `open` | boolean | Visibilidade |
| `onOpenChange` | (open: boolean) => void | Callback de fechamento |
| `title` | string | Header title |
| `description` | string | Header subtitle |
| `titleIcon` | LucideIcon | Ícone à esquerda do título |
| `hideClose` | boolean | Esconde o botão X de fechar (default `false`) |
| `resizable` | boolean | Habilita drag-resize (desabilitado em mobile) |
| `resizableMinWidth` / `resizableMaxWidth` | number | Bounds do resize em px (defaults `320` / `800`). São **px cegos à viewport** — quem impede o estouro é o teto `md:max-w-[calc(100vw-48px)]` do próprio painel, que mantém o gutter de 24px dos dois lados. Antes dele, props default numa janela de 800px punham a borda esquerda em **-24px** (800 de largura + 24 de gutter = 824 necessários) |
| `resizableStorageKey` | string | Chave do localStorage pra persistir width entre sessões |
| `maximizable` | boolean | Botão de expandir pra fullscreen |
| `headerActions` | ReactNode | Slots no header |
| `footer` | ReactNode | Slot do footer sticky |
| `titleSlot` | ReactNode | Override total do header (avatar + nome custom) |
| `bodyPadded` | boolean | Padding interno padrão do body (gutter 18px). **Default `true`** — conteúdo livre já respira. Use `false` com `<FloatingPanelSection>` (sections gerenciam o próprio padding edge-to-edge) |

## Exemplo mínimo (conteúdo livre — padding automático)
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
  {/* bodyPadded=true (default) → conteúdo já tem gutter, não precisa de p-* manual */}
  <ClientDetails />
</FloatingPanel>
```

## Detail panel padrão → o bloco `dsgreen-paneldetail-1`

**Painel de detalhe de registro tem estrutura definida, e ela é referenciável por ID.** A
composição inteira (com fixture, medições e o porquê de cada decisão) vive em
`src/blocks/paneldetail/` e é renderizada em `#/blocks-paneldetail`. Cite o ID em vez de
recompor: `use a referência dsgreen-paneldetail-1 no painel de detalhe do pedido`.

As quatro zonas, que são o que a IA erra quando compõe do zero — ela joga tudo no corpo:

| zona | o que vai | por que |
|---|---|---|
| `titleSlot` | avatar + nome + código · Chip de status | responde "de quem é este painel"; fica fixo no scroll |
| `headerActions` | 1–2 ações de ícone, **sempre `variant="soft"`** | `ghost` no meio da fileira fica sem container e lê como desabilitada ao lado do maximize/close, que são `soft` |
| corpo, 1ª seção | métricas em **cards compactos** (não `Kpi`) | responde "como este registro está?" — vem antes dos campos, que respondem "quais são os dados" |
| corpo, resto | campos em `FloatingPanelSection` por assunto | o colapso é o que permite 20 campos sem obrigar a rolar 20 |
| `footer` | Fechar + ação primária | a ação que fecha a tarefa, sempre alcançável |

⛔ **Não use aba aqui.** Se o corpo já é pilha de seções colapsáveis, o colapso **é** o
mecanismo de esconder — ter os dois faz o usuário procurar o dado em dois lugares. Recorte
volumoso de verdade (extrato de 200 linhas) não é aba nem seção: é outra tela.

### Anatomia mínima

Use `bodyPadded={false}` (as sections têm padding + divisória própria):

```tsx
<FloatingPanel open={open} onOpenChange={setOpen} bodyPadded={false} titleSlot={<HeaderCustom />}>
  <FloatingPanelSection title="Contato">          {/* colapsável (default) */}
    <FloatingPanelField label="Email" value={<a href={...}>{email}</a>} />
    <FloatingPanelField label="Telefone" value={phone} />
  </FloatingPanelSection>
  <FloatingPanelSection title="Financeiro" defaultOpen={false}>
    <FloatingPanelField label="Saldo" value={formatBRL(saldo)} />
  </FloatingPanelSection>
</FloatingPanel>
```

- `FloatingPanelSection` — props: `title`, `collapsible` (default `true`), `defaultOpen` (default `true`).
- `FloatingPanelField` — props: `label`, `value` (fallback "—" quando vazio).

## Cuidados / Gotchas
- **Aba dentro do FloatingPanel** → `<Tabs fullWidth>` com a variante **default** (`segmented`). Aqui é o caso mais forte da prop: o painel é **redimensionável em runtime** (`sm` 320 · `md` 400 · `lg` 560 · `xl` 720, e o usuário arrasta), então nenhuma largura escrita na mão acompanha — `fullWidth` distribui os triggers e a aba segue o arrasto.

- Renderizado via **portal em document.body** — escapa de overflow/transform ancestrais
- Em mobile (<md) vira **sheet bottom-up colado nas bordas** do device: flush nas laterais + bottom, só cantos superiores arredondados, sem outline/shadow, `max-height: 92vh`
- **Backdrop só em mobile** — scrim suave (toque fora fecha). No **desktop segue non-modal** (sem backdrop, página atrás clicável). Pra modal full use `<Modal>` ou `<AlertModal>`
- **Body com scroll automático** (`overflow-y-auto` + `min-h-0`) — header/footer ficam fixos, conteúdo longo rola
- **Footer fluido**: botões crescem lado a lado e **empilham quando não cabem** (`flex-wrap` + `flex-1` + `min-w-140px`). Não precisa passar `fullWidth` nos Buttons
- `maximizable=true` adiciona botão de expandir; estado controlado internamente — `defaultMaximized` (default `false`) inicia maximizado
- **ESC fecha por padrão** (`closeOnEscape` default `true`) — passe `false` pra desativar
