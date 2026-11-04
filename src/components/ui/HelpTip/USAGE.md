# HelpTip

<!-- ds:regras
- `about` é o RÓTULO que o "?" acompanha ("SLA", "CPF"), não uma frase — ele vira o nome acessível "Ajuda sobre {about}"
- o texto da ajuda vai em `children`; explique COMO a coisa é calculada, não repita o rótulo
- nada de link, botão ou campo dentro da dica: tooltip não recebe foco — isso é `Popover`
- dentro do `Kpi` não use `HelpTip` à mão: passe `helperText` e o card monta
-->

**O que é** — O "?" que explica um rótulo: botão de ícone discreto que revela um
tooltip curto. **Categoria**: iGreen (tv()). Doc viva: `#/help-tip`.

Nasceu dentro do `Kpi` (prop `helperText`) e saiu de lá para acompanhar qualquer
rótulo.

## Quando usar

- Ao lado de um título de seção, do cabeçalho de um grupo de campos, de um
  cabeçalho de coluna, de um valor de KPI — qualquer rótulo cuja definição não
  cabe no próprio rótulo.
- Para explicar **como** uma métrica é calculada, o que conta e o que não conta,
  de onde vem o dado.

**Não** use para:

- Mensagem de erro ou de validação de campo → `FormField` (`error`/`warning`).
- Texto de apoio que todo mundo precisa ler → `helperText` do `FormField`, que
  fica visível. Dica escondida atrás de hover é opcional por definição.
- Conteúdo com link, botão ou campo → tooltip não recebe foco; use `Popover`.
- Dentro do `Kpi` → passe `helperText` ao card, que já monta a peça.

## Props

| Prop               | Tipo                                      | Default | Descrição                                                                |
| ------------------ | ----------------------------------------- | ------- | ------------------------------------------------------------------------ |
| `about`            | `string`                                  | — (obrigatório) | O que está sendo explicado. Vira o nome acessível `"Ajuda sobre {about}"`. |
| `children`         | `ReactNode`                               | — (obrigatório) | O texto da dica.                                                          |
| `side`             | `"top" \| "right" \| "bottom" \| "left"`  | `"top"` | Lado em que a dica abre.                                                  |
| `contentClassName` | `string`                                  | —       | className do CONTEÚDO da dica — na prática, a largura.                    |
| `className`        | `string`                                  | —       | className do botão.                                                       |

Sem variante de tamanho e sem prop de ícone, de propósito: a peça existe para que
o "?" seja o mesmo em toda tela.

## Exemplo mínimo

```tsx
import { HelpTip } from "@snksergio/design-system";

// ao lado de um título de seção
<h2 className="flex items-center gap-gp-xs text-heading-sm text-fg-default">
  Margem de contribuição
  <HelpTip about="Margem de contribuição">
    Receita menos custos variáveis, antes dos custos fixos.
  </HelpTip>
</h2>

// ao lado do label de um campo, com a dica à direita e mais larga
<FormField
  label={
    <span className="flex items-center gap-gp-xs">
      Código de integração
      <HelpTip about="Código de integração" side="right" contentClassName="max-w-tooltip-lg">
        O identificador que a concessionária usa na fatura. Fica no canto superior
        direito do PDF, com 11 dígitos.
      </HelpTip>
    </span>
  }
/>
```

## Gotchas

- **É `<button>`, não ícone com `title`.** O `title` nativo não abre por teclado,
  não abre no toque e some sozinho. O botão entra na ordem de tabulação, abre no
  foco e tem nome acessível próprio.
- **Não tem `onClick`.** O clique existe só para abrir a dica no toque — por isso
  a peça se chama `HelpTip` e não `HelpButton`. Se você quer uma ação, o
  componente é `Button`.
- **Não há prop para sobrescrever o nome acessível inteiro.** A fórmula `"Ajuda
  sobre {about}"` é do DS para que a mesma coisa seja anunciada do mesmo jeito em
  toda tela. Se aparecer um caso real que não cabe nela, a prop entra então.
- **A largura padrão da dica é 256px** (o teto do `TooltipContent`). Texto de
  ajuda longo ali vira uma coluna alta e difícil de ler — `contentClassName`
  aceita `max-w-tooltip-lg` (320px) ou `max-w-page-xs`.
- **`relative z-10` já vem na base** e não é enfeite: o `ClickableSurface` do DS
  estica um alvo `inset-0 z-0` sobre o card inteiro, e sem esse par o botão
  existe e **não clica** — o hover e o foco continuam parecendo certos. Vale para
  o `Kpi` com `onClick`/`href` e para qualquer card clicável do consumidor.
- **Dentro de `<form>`** ele já é `type="button"`; não precisa repetir, e nunca
  submete.
- ⛔ **Nunca dentro de um `<label>`** — nem do `label` de um `FormField`. O
  content model do `<label>` proíbe conteúdo interativo, e na prática o clique na
  ajuda cairia no campo. Num formulário, o "?" acompanha o **cabeçalho do grupo**
  de campos, como irmão. (Hoje `FormFieldBaseProps.label` é `string`, então o TS
  já barra o caminho errado.)
