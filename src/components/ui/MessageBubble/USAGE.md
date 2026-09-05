# MessageBubble

**Categoria:** composto (MessageAck + MarkdownText + Icon + Button + Popover + slot Avatar). Bolha de mensagem do **atendimento / chat WhatsApp** — o maior bloco do ChatV2.

## Quando usar

- Renderizar uma mensagem dentro de uma timeline de conversa (enviada ou recebida).
- Suporta texto markdown WA, mídia (imagem/áudio/vídeo/documento/localização/contato), citação (reply), edição, exclusão, status de entrega e ações por hover.

Não use para notificações de sistema, separadores de data ou logs de chamada — esses são blocos próprios.

## Anatomia

```
[avatar]  ┌───────────────────────────────┐   ← side="received" (esquerda, bg-surface + border-subtle)
          │ Autor (grupos)            ⋮   │   ← ⋮ = actions (Popover, hover top-right)
          │ ▏ citação (reply) ............│   ← quotedMessage (border-l + nome + prévia)
          │ [ mídia / MessageMediaRenderer]│
          │ corpo markdown WA             │
          │            editada · HH:mm ✓✓ │   ← meta: editada? + hora + MessageAck (só sent)
          └───────────────────────────────┘
                  ┌──────────────────┐  [avatar] ← side="sent" (direita, bg-success-muted)
                  │ ...              │
                  └──────────────────┘
```

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `side` | `"sent" \| "received"` | — | **Obrigatório.** `sent` = direita (bg verde sutil) · `received` = esquerda (bg surface). |
| `createdAt` | `string \| Date` | — | **Obrigatório.** Formatada como `HH:mm` (24h). |
| `body` | `string` | — | Corpo em markdown WA → `MarkdownText`. |
| `ack` | `0..5` | — | Status de entrega → `MessageAck`. **Só aparece em `side="sent"`.** |
| `ackError` | `boolean` | `false` | Sobrepõe o `ack` com o glifo de erro de envio (encaminha `error` ao `MessageAck`). Só junto de `ack` em `side="sent"`. |
| `mediaType` | `text \| image \| audio \| video \| document \| location \| vcard \| contact` | `"text"` | Tipo de mídia (switch interno). |
| `mediaUrl` | `string` | — | URL da mídia (usada pelo renderer interno). |
| `media` | `ReactNode` | — | Slot — **override completo** do renderer interno. |
| `quotedMessage` | `{ authorName?, fromMe?, body?, mediaType?, mediaUrl? } \| null` | — | Citação/reply (barra lateral + prévia truncada). |
| `isEdited` | `boolean` | `false` | Adiciona label `editada` no rodapé. |
| `isDeleted` | `boolean` | `false` | Itálico mudo + ícone proibido; **suprime corpo, mídia e ações**. |
| `tail` | `boolean` | `true` | Rabeta (canto reto) no lado do remetente. |
| `origin` | `"human" \| "ai"` | `"human"` | `ai` = contorno sutil da marca na bolha (resposta da IA/Sol). **Quem decide é o consumidor**; `human` não muda nada. |
| `authorName` | `string` | — | Nome no topo (útil em grupos). |
| `avatar` | `ReactNode` | — | Slot de avatar ao lado da bolha. |
| `actions` | `ReactNode` | — | Conteúdo do Popover de ações (botão ⋮ aparece no hover). |
| `onMediaClick` | `() => void` | — | Clique na mídia (ex: abrir lightbox). |
| `className` | `string` | — | className da linha inteira. |

## Variants

| Variant | Valores | Efeito |
|---------|---------|--------|
| `side` | `sent` · `received` | bg da bolha + alinhamento + lado da rabeta + lado do ack |
| `tail` | `true` · `false` | canto reto (`rounded-br-none`/`rounded-bl-none`) vs todos arredondados |
| `origin` | `human` · `ai` | `ai` troca a borda da bolha por `border-border-brand-subtle` (contorno sutil da marca, nos dois lados); `human` = borda padrão |

`disabled` = n/a (bolha não é controle interativo).

## Exemplo mínimo

```tsx
import { MessageBubble, MessageReplyIcon } from "@snksergio/design-system";

<MessageBubble
  side="received"
  authorName="Maria"
  avatar={<Avatar name="Maria" size="sm" />}
  body="Olá! *Tudo certo* com o pedido?"
  createdAt="2026-06-22T14:32:00Z"
/>

<MessageBubble
  side="sent"
  body="Sim, já está a caminho 🚚"
  createdAt={new Date()}
  ack={3}
  isEdited
  actions={<button onClick={onReply}><MessageReplyIcon /> Responder</button>}
/>

<MessageBubble
  side="received"
  mediaType="image"
  mediaUrl="/uploads/nota.jpg"
  body="Comprovante"
  createdAt="14:40"
  onMediaClick={() => openLightbox("/uploads/nota.jpg")}
  quotedMessage={{ authorName: "João", body: "Pode mandar o comprovante?" }}
/>

<MessageBubble
  side="sent"
  origin="ai"
  body="Oi! Sou a Sol. Posso ajudar com a sua fatura?"
  createdAt={new Date()}
  ack={3}
  actions={<button onClick={onReply}><MessageReplyIcon /> Responder</button>}
/>
```

## Gotchas

- **`max-w-[70%]` é exceção de hardcode documentada** — não há token DS de porcentagem para largura de balão de chat; a coluna da bolha limita a 70% da linha por regra do domínio. Todo o resto é token DS.
- **Ack só em `sent`:** `MessageAck` nunca aparece em mensagens recebidas (regra WA), mesmo se `ack` for passado. `ackError` (encaminhado como `error` ao `MessageAck`) troca o glifo pelo ícone de erro de envio.
- **Mídia clicável é acessível por teclado:** quando `onMediaClick` é passado, a imagem/vídeo recebe `role="button"` + `tabIndex={0}` + ativação por Enter/Space e anel de foco DS. Sem `onMediaClick`, a mídia não é focável (apenas exibição).
- **Documento: o CARD INTEIRO é o alvo do clique**, não um ícone na borda. Com `onMediaClick` o card vira `<button>` (teclado e leitor de tela de graça) e o ícone de baixar é só decoração — botão dentro de botão seria HTML inválido. Sem `onMediaClick` ele fica inerte e o rótulo passa de "Toque para abrir" para "Documento recebido": componente dumb não promete gesto que ninguém ligou. Até 2026-08-20 só o ícone de ~16px tinha clique, e em coluna estreita ele fica fora da área visível — o card ensinava um gesto que não existia.
- **`isDeleted` vence tudo:** suprime corpo, mídia, citação e ações — só mostra "Mensagem apagada" em itálico mudo com ícone de proibido.
- **`media` slot = override:** quando passado, substitui o `MessageMediaRenderer` interno por completo (use para players custom, mapas embedados, etc).
- **Citação inline:** a prévia da citação usa `<MarkdownText inline>` (1 linha, truncável). Sem body, mostra o rótulo do tipo de mídia ("Imagem", "Áudio"…).
- **Ações via Popover não-modal:** o botão ⋮ usa `PopoverAnchor` (não Trigger) + `modal={false}` (L-022/L-031) para o toggle externo não conflitar com o hover; aparece no `group-hover` da bolha (e no foco por teclado).
- **O botão ⋮ tem superfície própria** (`bg-bg-emphasis` em pílula + `shadow-sh-sm`, glifo de 16px via `size="icon-xs"`). Sem isso ele sumia no tema escuro: bolha recebida (`bg-bg-surface`) e fundo da conversa têm quase a mesma luminância, e o ghost secundário só tinha `hover:bg-bg-muted` (3% de branco). Pelo mesmo motivo a bolha recebida tem `border-border-subtle` em vez de borda transparente.
- **`origin="ai"` é só a variante:** o componente não sabe quem escreveu. O consumidor aplica o mesmo critério que já usa para ligar `actions` só às mensagens da IA.
- **Subcomponente `MessageMediaRenderer` é interno** — não exportado. Consuma só via `MessageBubble`.
```
