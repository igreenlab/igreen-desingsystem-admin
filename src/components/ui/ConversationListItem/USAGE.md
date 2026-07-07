# ConversationListItem

Item de **lista de conversa** (Atendimento / Chat) — uma linha clicável que
representa um ticket/conversa. **Composto** (categoria: composite): combina
`Avatar` + `Chip` (slot `badges`) + `Button`/`Icon` (slot `actions`) +
`MarkdownText` (prévia inline). NÃO é uma célula de DataTable.

## Quando usar

- Coluna lateral de tickets/conversas do Atendimento (variant `ticket`).
- Lista de conversas estilo DM/chat (variant `chat`).
- Qualquer lista vertical de conversas com avatar + prévia + hora + metadados.

Para tabelas de dados com colunas/sort/filtros → use `DataTable`, não este.

## Props essenciais

| Prop        | Tipo                                                     | Default        | Descrição |
|-------------|----------------------------------------------------------|----------------|-----------|
| `title`     | `string` (req)                                           | —              | Nome do contato/conversa. Truncado. |
| `avatar`    | `{ src?, name?, colorHex? }` \| `ReactNode`              | —              | Objeto-atalho monta o `Avatar` do DS (iniciais do nome; `src` vira `<img>`); ou nó custom. |
| `preview`   | `string`                                                 | —              | Última mensagem (markdown WA) → `MarkdownText` inline, `line-clamp-1`. |
| `time`      | `string`                                                 | —              | Hora já formatada (`14:32` / `21/06`). Tabular, caption. |
| `badges`    | `ReactNode`                                              | —              | Slot de `<Chip>`s coloridos (protocolo/conexão/agente/fila/tags). |
| `unread`    | `number`                                                 | —              | `> 0` → badge `bg-bg-danger`/`text-fg-on-danger` (mostra `99+`). |
| `actions`   | `ReactNode`                                              | —              | Slot de ações revelado no hover/focus (ex `<Button>` Pencil/Trash ou menu). |
| `onClick`   | `() => void`                                             | —              | Clique na linha (Enter/Space também disparam). |
| `selected`  | `boolean`                                                | `false`        | Stripe brand 3px à esquerda + `bg-bg-muted`. |
| `disabled`  | `boolean`                                                | `false`        | Desabilita interação. |
| `className` | `string`                                                 | —              | Classe extra no root. |

## Variants

| Variant       | Valores                          | Default         | Efeito |
|---------------|----------------------------------|-----------------|--------|
| `variant`     | `ticket` \| `chat`               | `ticket`        | `chat` aperta o espaçamento vertical do corpo. |
| `density`     | `comfortable` \| `compact`       | `comfortable`   | Padding vertical da linha. |
| `selected`    | `boolean`                        | `false`         | Stripe brand + bg muted. |
| `unread`(>0)  | derivado de `unread`             | —               | Título em bold + prévia mais forte. |
| `disabled`    | `boolean`                        | `false`         | Último compoundVariant (L-006). |

## Exemplo mínimo

```tsx
import { ConversationListItem } from "@/components/ui/ConversationListItem";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

<ConversationListItem
  title="Maria Silva"
  avatar={{ name: "Maria Silva", colorHex: "#8754ec" }}
  preview="*Olá!* Gostaria de saber sobre a fatura ```#A12```"
  time="14:32"
  unread={3}
  selected={selectedId === ticket.id}
  onClick={() => selectTicket(ticket.id)}
  badges={
    <>
      <Chip size="sm" color="info" variant="soft">#PROTO-1024</Chip>
      <Chip size="sm" color="success" variant="soft">WHATSAPP</Chip>
      <Chip size="sm" color="primary" variant="soft">SUPORTE</Chip>
    </>
  }
  actions={
    <>
      <Button size="xs" variant="ghost" iconLeft={<Icon name="line-pencil" />} aria-label="Editar" />
      <Button size="xs" variant="ghost" color="danger" iconLeft={<Icon name="line-delete-02" />} aria-label="Excluir" />
    </>
  }
/>
```

## Gotchas / cuidados

- **Renderiza `div[role="button"]`**, não `<button>` — porque o slot `actions`
  costuma conter `<button>` (botão aninhado é HTML inválido). A11y por teclado:
  `tabIndex=0` + Enter/Space disparam `onClick`. `role`/`tabIndex` só existem
  quando há `onClick` e não está `disabled`.
- O `Avatar` do DS exibe **iniciais**; quando você passa `avatar.src`, a imagem
  é renderizada como `<img>` DENTRO do Avatar (que já é `rounded-full overflow-hidden`).
  Sem `src`, as iniciais derivam de `name` (fallback: `title`).
- `preview` passa por `MarkdownText inline` — markdown WA (`*bold*` `_italic_`
  `~strike~` ` ```mono``` `) é sanitizado e truncado em 1 linha. Não passe HTML cru.
- `unread` só desenha o badge quando `> 0`; valores `> 99` viram `99+`.
- Cliques dentro de `actions` têm `stopPropagation` — não disparam o `onClick`
  da linha.
- Visual 100% via tokens DS. Única exceção de hardcode: `before:w-[3px]` da stripe
  e as dimensões finas do count-badge (`min-w-[18px] h-[18px] px-[5px]`) — mesmo
  padrão dos contadores de Chip/Table.
