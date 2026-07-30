---
name: iGreen DS — nomenclatura V3 dos tokens (drift de doc RESOLVIDO + gate no CI)
description: Código usa brand/danger/default. O drift V2 nas docs foi corrigido em 2026-07-30 e agora há gate mecânico (dead-theme-classes no npm test). Continuar validando token de cor contra o CSS gerado, não contra doc.
type: project
---

## Estado atual (2026-07-30)

Nomenclatura **V3** em `tokens/brands/default/semantic/color-light.ts` e no CSS gerado:

- `bg.brand` (não `bg.primary`) · `bg.danger` (não `bg.critical`)
- `fg.default` (não `fg.foreground`) · `fg.on-brand` (não `fg.on-primary`)
- `border.default` (não `border.main`) · `ring.brand` (não `ring.primary`)
- Tom sutil **depende da família**: status (`success`/`warning`/`danger`/`info`) → `-muted`;
  `brand` → `-subtle`; papel neutro → `-subtle` sem cor. Não existe `bg.success-subtle`,
  `bg.brand-muted`, nem `border.{status}` cru.
- **Não existe sufixo `-inverted` em nenhum token** — a doc descrevia essa família inteira
  e era ficção (zero ocorrências de "inverted" no CSS). Também não existe `bg.disabled`.

## O que a previsão desta memória custou

Esta memória já dizia, antes do conserto: *"confiar nas docs leva a usar tokens
inexistentes que somem no CSS gerado"*. Estava certa e não foi agida. Custo medido em
2026-07-30: **25 usos de classe de cor morta em `src/`** — 9 deles `ring-ring-primary` em
**4 componentes distribuídos** (ColorPicker, ConversationListItem, FileUploadField,
MessageBubble), com o anel de foco caindo em `currentColor` em vez da marca (regressão de
acessibilidade silenciosa), mais `border-border-critical`/`text-fg-critical` no
TableToolbar, que está no registry.

Corrigido na mesma data: os 25 usos, a seção de nomenclatura do `CLAUDE.md`, e o
`.ai/context/tokens/color.md` (reescrito da fonte real — a seção "Nomes a evitar" estava
com a **direção invertida**, dizia `fg.brand → renomeado para fg.primary`).

## Por que esta memória não foi arquivada

Porque o que resolve não é a doc estar certa hoje — é existir gate:
**`scripts/lib/dead-theme-classes.mjs` + teste no `npm test`** reprova a PR quando uma
classe de cor não tem `--color-*` correspondente. Doc vai derivar de novo; o gate não.

**Why:** classe inexistente é a classe de defeito da L-057 — não quebra build, não quebra
`tsc`, não quebra teste, e o ratchet do `lint-styles` não vê (procura token literal do
Tailwind, não var ausente). Texto era a única proteção, e texto foi o que falhou.

**How to apply:** ao escrever token de cor, validar contra
`src/styles/theme/tailwind-theme.css` (o que o transform emitiu de fato), não contra doc.
Ao mexer no check, cuidado com a **fronteira à direita** do regex: sem ela,
`border-border-warning` casa dentro de `border-border-warning-muted` (que é a correta) e o
check acusa ~40 falsos-positivos em código bom — aconteceu durante a construção do gate e
quase virou edição em 20 arquivos certos.
