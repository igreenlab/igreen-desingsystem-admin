# MarkdownText

**Categoria:** composto (ui/) — renderização de texto · Chat/Atendimento

Renderiza markdown estilo WhatsApp já **sanitizado**. Faz parse manual do texto
para React nodes (sem `dangerouslySetInnerHTML`), então qualquer HTML/markdown
não suportado vira texto literal — seguro contra injeção por design. Porta do
legado `ui-igreen-hub/src/components/MarkdownWrapper`.

## Quando usar

- Corpo de bolha de mensagem no chat (negrito/itálico/tachado/mono/links).
- Prévia de última mensagem na lista de tickets (`inline` + `line-clamp-*` do consumer).
- Qualquer texto vindo do WhatsApp que use a sintaxe `*_~` `` ` ``.

## Sintaxe suportada

| Markdown | Resultado |
|----------|-----------|
| `*bold*` | **negrito** (`font-semibold`) |
| `_italic_` | _itálico_ |
| `~strike~` | ~~tachado~~ |
| `` `mono` `` ou ```` ```mono``` ```` | monoespaçado com fundo sutil (`bg-bg-muted`) |
| `http(s)://…` ou `www.…` | link em nova aba (`target=_blank rel=noopener noreferrer`) |

## Props

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `children` | `string` | — (obrigatório) | Texto-fonte em markdown WhatsApp. |
| `inline` | `boolean` | `false` | `true` → `<span>` e colapsa quebras de linha (prévia truncável). `false` → `<p>` preservando quebras (`whitespace-pre-wrap`). |
| `className` | `string` | — | Classe extra no elemento raiz. |

## Exemplo mínimo

```tsx
import { MarkdownText } from "@/components/ui/MarkdownText";

// Bolha de mensagem (multilinha, preserva quebras)
<MarkdownText>{"Olá *João*, segue o _link_: https://igreen.com.br"}</MarkdownText>

// Prévia de última mensagem (truncável)
<MarkdownText inline className="line-clamp-1">
  {lastMessage.body}
</MarkdownText>
```

## Gotchas

- **Sem `dangerouslySetInnerHTML`** — tags HTML digitadas pelo usuário aparecem
  como texto literal (intencional, sanitização).
- `inline` colapsa **todas** as quebras/espaços redundantes num único espaço;
  o truncamento (`line-clamp-1/2`) é responsabilidade do consumer.
- Code spans são **opacos**: o conteúdo entre crases não recebe bold/italic/link.
- `text-body-sm` é fixo (sem token novo). Para outro tamanho, sobreponha via
  `className` no consumer.
- Não é interativo além dos links (que herdam o foco padrão do `<a>`); não há
  variante de cor/foco própria.
```
