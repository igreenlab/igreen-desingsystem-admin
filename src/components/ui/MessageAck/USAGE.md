# MessageAck — USAGE

Glifo de status/ack de mensagem (estilo WhatsApp/Baileys) — ícone + cor semântica derivados do valor de `ack`. Componente composto / atômico de chat.

## Quando usar
- Indicar entrega/leitura de mensagens enviadas (bolha de chat)
- Rodapé da bolha, ao lado do timestamp
- Estado de erro de envio (com `error`)

## Import
```tsx
import { MessageAck } from "@/components/ui/MessageAck";
```

## Props essenciais
| Prop | Tipo | Default | Função |
|---|---|---|---|
| `ack` | `0 \| 1 \| 2 \| 3 \| 4 \| 5` | — (obrigatória) | Estado de entrega da mensagem |
| `error` | boolean | `false` | Sobrepõe o ack e mostra glifo de erro |
| `className` | string | — | Classes extras no ícone |

## Mapa ack → ícone + cor
| ack | Significado | Ícone | Cor |
|---|---|---|---|
| 0 / 1 | Pendente / enviando | Clock | `fg-muted` |
| 2 | Enviado ao servidor | Check | `fg-muted` |
| 3 | Entregue | CheckCheck | `fg-muted` |
| 4 / 5 | Lido / reproduzido | CheckCheck | `fg-success` |
| — (error) | Falha no envio | AlertCircle | `fg-danger` |

## Exemplo mínimo
```tsx
// Mensagem entregue
<MessageAck ack={3} />

// Mensagem lida (duplo check verde)
<MessageAck ack={4} />

// Falha no envio
<MessageAck ack={1} error />

// No rodapé da bolha, junto ao timestamp
<span className="inline-flex items-center gap-gp-xs text-fg-muted">
  10:42
  <MessageAck ack={message.ack} error={message.failed} />
</span>
```

## Cuidados / Gotchas
- Ícone é `size-icon-xs` fixo — para outro tamanho, passar `className` (override de `size-*`).
- Decorativo por padrão (`aria-hidden`) — o status é comunicado pelo timestamp/contexto da bolha; não duplica leitura no screen reader.
- `error` tem precedência sobre `ack` (qualquer ack + error = AlertCircle danger).
- Cores claro/escuro resolvidas via tokens (`fg-muted`/`fg-success`/`fg-danger`) — não passar cor inline.
