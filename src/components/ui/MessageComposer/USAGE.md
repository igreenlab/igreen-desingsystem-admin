# MessageComposer

**Categoria:** composto (chat / atendimento). Compõe `Textarea` + `Button` + `Icon` + `Separator`.

Shell DUMB (sem lógica de API/upload/emoji/áudio) da barra de envio de mensagem,
usado no Atendimento e no Chat interno. Só a moldura + slots; o consumer pluga
emoji, anexo, mic, quick-messages, gravação, etc.

## Quando usar

- Caixa de digitação de qualquer conversa (ticket WhatsApp, chat interno).
- Sempre que precisar de textarea auto-grow + botão de envio + slots de toolbar,
  citação e aviso, sem reimplementar a moldura.

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `string` | — (req) | Texto controlado da mensagem. |
| `onChange` | `(v: string) => void` | — (req) | Disparado a cada digitação. |
| `onSend` | `() => void` | — (req) | Enter (sem Shift) ou clique no botão. Só dispara com texto e fora de disabled/sending. |
| `onKeyDown` | `(e) => void` | — | Roda ANTES do Enter→onSend interno; `e.preventDefault()` suprime o envio padrão. |
| `placeholder` | `string` | — | Placeholder da textarea (também vira `aria-label`). |
| `state` | `'open' \| 'disabled' \| 'read-only'` | `'open'` | `read-only` esconde o campo e mostra só o `banner`. |
| `size` | `'sm' \| 'md'` | `'md'` | Padding/altura do field e da textarea. |
| `toolbarStart` | `ReactNode` | — | Slot à esquerda (emoji/anexo). |
| `toolbarEnd` | `ReactNode` | — | Slot à direita, antes do envio (mic/extra). |
| `replyPreview` | `ReactNode` | — | Barra de citação acima da textarea. |
| `banner` | `ReactNode` | — | Aviso acima do campo (janela 24h / read-only). |
| `sending` | `boolean` | `false` | Botão de envio em loading + bloqueado. |
| `recording` | `ReactNode` | — | SUBSTITUI a textarea enquanto grava (waveform/timer). |
| `className` | `string` | — | className do container. |

`ref` é encaminhado para a `<textarea>` interna (foco programático).

## Variants

| Variant | Valores | Efeito |
|---------|---------|--------|
| `state` | open · disabled · read-only | editável · bloqueado · sem campo (só banner) |
| `size` | sm · md | altura/padding compacto · padrão |

## Exemplo mínimo

```tsx
import { MessageComposer } from "@/components/ui/MessageComposer";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const [text, setText] = useState("");

<MessageComposer
  value={text}
  onChange={setText}
  onSend={() => {
    sendMessage(text);
    setText("");
  }}
  placeholder="Digite uma mensagem..."
  toolbarStart={
    <Button variant="ghost" color="secondary" size="icon-sm" aria-label="Anexar">
      <Icon name="line-file-attachment" />
    </Button>
  }
/>
```

## Gotchas / cuidados

- **DUMB por design:** emoji picker, upload, gravação de áudio e quick-messages são
  responsabilidade do consumer (slots). O composer não tem estado de negócio.
- **Enter→onSend** é embutido. Para desabilitar (ex.: textarea multiline puro), trate
  no `onKeyDown` e chame `e.preventDefault()`.
- **Auto-grow** cresce até um teto (`max-h` interno) e então rola; a altura é
  recalculada via `useLayoutEffect` a cada mudança de `value`. Componentes controlados.
- **Botão de envio** usa o ícone `line-telegram` e só habilita com `value.trim()`.
  Em `sending` entra em loading e bloqueia.
- **`recording`** remove a textarea E o botão de envio padrão — o consumer controla as
  ações de gravação dentro desse slot (cancelar/enviar áudio).
- Ícone de anexo/emoji/mic não vem embutido: passe Buttons ghost com `Icon` nos slots.
