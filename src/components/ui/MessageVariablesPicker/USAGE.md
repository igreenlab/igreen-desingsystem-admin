# MessageVariablesPicker

**Categoria:** composto (ui/) — picker de variáveis de mensagem.

Picker de variáveis `{{...}}` que emite `onSelect(token)`. Composto a partir de `Popover` (mobileSheet), `Button`, `Chip`, `Icon` e `Separator` do DS.

> ⚠️ **Não contém o textarea.** O componente só dispara `onSelect(token)` — quem insere o token no cursor é o consumer (campo de texto/editor).

---

## Quando usar

- Editores de mensagem (quick messages, campanhas, respostas automáticas) onde o usuário precisa inserir variáveis dinâmicas (`{{firstName}}`, `{{protocol}}`, etc).
- Ao lado/dentro da toolbar de um `<textarea>` — o trigger só-ícone cabe numa barra de ações.

---

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `onSelect` | `(token: string) => void` | — (req) | Recebe o token escolhido. O consumer insere no cursor. |
| `variables` | `MessageVariable[]` | `DEFAULT_MESSAGE_VARIABLES` | Lista exibida (`{ token, label }`). |
| `label` | `string` | `"Variáveis"` | Rótulo do trigger (`triggerVariant="button"`). |
| `triggerVariant` | `"icon" \| "button"` | `"icon"` | `icon` = só-ícone (glyph chaves) · `button` = ícone + label. |
| `open` / `onOpenChange` | `boolean` / `(o)=>void` | — | Controle externo de abertura (opcional). |
| `closeOnSelect` | `boolean` | `true` | Fecha o popover ao selecionar. |
| `size` | `"sm" \| "md"` | `"sm"` | Tamanho do trigger e largura mínima do conteúdo. |
| `disabled` | `boolean` | — | Desabilita o trigger. |
| `className` | `string` | — | Classe extra no trigger. |

### `MessageVariable`

```ts
type MessageVariable = { token: string; label: string };
```

### `DEFAULT_MESSAGE_VARIABLES`

```ts
[
  { token: "{{firstName}}", label: "Primeiro Nome" },
  { token: "{{name}} ",     label: "Nome" },
  { token: "{{ms}} ",       label: "Saudação" },
  { token: "{{protocol}} ", label: "Protocolo" },
  { token: "{{hora}} ",     label: "Hora" },
]
```

> Os trailing spaces são **propositais** (token concatenado direto no texto) — todos têm espaço final **exceto** `{{firstName}}`.

---

## Variants

| Variant | Valores | Default |
|---------|---------|---------|
| `triggerVariant` | `icon`, `button` | `icon` |
| `size` | `sm`, `md` | `sm` |

---

## Exemplo mínimo

```tsx
import { MessageVariablesPicker } from "@/components/ui/MessageVariablesPicker";

function MessageEditor() {
  const ref = useRef<HTMLTextAreaElement>(null);

  function insertAtCursor(token: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e, value } = el;
    el.value = value.slice(0, s) + token + value.slice(e);
    const pos = s + token.length;
    el.setSelectionRange(pos, pos);
    el.focus();
  }

  return (
    <div className="flex items-end gap-gp-sm">
      <textarea ref={ref} />
      <MessageVariablesPicker onSelect={insertAtCursor} />
    </div>
  );
}
```

Variante com label:

```tsx
<MessageVariablesPicker triggerVariant="button" onSelect={insertAtCursor} />
```

---

## Gotchas / cuidados

- **Sem textarea embutido.** O componente só emite `onSelect`. Se você não inserir no cursor, nada acontece visualmente no campo.
- **Foco do textarea.** Os Chips usam `onMouseDown` + `preventDefault()` para não roubar o foco do campo antes do clique — preserve isso ao customizar.
- **Trailing spaces.** Não normalize os tokens de `DEFAULT_MESSAGE_VARIABLES`; o espaço final é parte do contrato.
- **A11y.** Trigger só-ícone tem `aria-label="Inserir variável"` + `aria-haspopup="dialog"`; cada Chip tem `aria-label="Inserir <label>"`.
- **Mobile.** Em telas `<md` o popover vira bottom-sheet (via `mobileSheet` do Popover).
