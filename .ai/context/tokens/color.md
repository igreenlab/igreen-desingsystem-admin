# Tokens de cor — contexto do agente

> Carregar quando a tarefa envolve: nova cor semântica, ajuste de paleta,
> dark mode, tokens de feedback, overlay, scrim.

⚠️ **A fonte de verdade é `tokens/brands/default/semantic/color-light.ts` e o CSS gerado
`src/styles/theme/tailwind-theme.css` — não esta doc.** Nome que não estiver no CSS gerado
**não emite classe nenhuma**: a utility é ignorada em silêncio, sem quebrar build, `tsc`
ou teste. Para conferir um nome antes de usar:

```bash
grep -oE "\-\-color-(bg|fg|border|ring)-[a-z0-9-]+" src/styles/theme/tailwind-theme.css | sort -u
```

Gate automático: `scripts/lib/dead-theme-classes.mjs`, roda no `npm test`.

---

## ⚠️ Esta doc descreve a marca `default`. Existem 5.

O DS é **multi-marca**: `default` · `blue` · `green` · `pay` · `vibrant`. Tudo abaixo (nomes
de token, sufixos, roles, `on-*`) vale igual pras 5 — o **contrato de nomes é idêntico**. O que
muda por marca são só os **valores**, e só de **cor**.

| | |
|---|---|
| Onde vive | `tokens/brands/<id>/` — `primitives/color-palette.ts` + `semantic/color-{light,dark}.ts` |
| Como vira CSS | `npm run tokens:brand:<id>` → `src/styles/theme/brand-<id>.css` |
| Como ativa | `data-theme="<id>"` no `<html>`; `default` = sem atributo (é o tema-base) |
| Escopo do overlay | só o **DIFF** contra a default — 43 a 91 vars, não as ~400 |

A `default` é a única sem overlay: ela **é** o `tailwind-theme.css`. As outras 4 são camadas
por cima, e marca × claro/escuro são **eixos independentes** que combinam livremente.

**Marca muda SOMENTE cor.** Spacing, sizing, radius, elevation e tipografia vêm sempre de
`brands/default/` — o `to-tailwind-v4.ts` os importa fixos de lá. Pedido de "mudar espaçamento
ou fonte só nesta marca" **não é tema**.

Duas coisas que só existem em marca não-default e surpreendem quem lê só esta doc:

- **`grayDark`** — a `vibrant` tem rampa neutra **por modo** (`gray` no light, `grayDark` no
  dark), e o `color-dark.ts` dela importa `grayDark as gray`. Nenhuma outra marca tem.
- **`success` pode ser a própria cor da marca** — e por dois mecanismos diferentes, então não
  procure o mesmo padrão nas duas: a `vibrant` faz **alias no primitivo**
  (`export const success = brand`), enquanto a `pay` declara um `success` primitivo próprio
  (`#3bc882`) e faz os valores **coincidirem no semantic** (`bg.success` = `bg.brand` =
  `#00a859`). Em ambas, `fg.on-success` segue a família brand, não a de status — no caso da
  `vibrant` isso é obrigatório, porque branco sobre o neon dá 1.37:1.

Pra criar ou alterar marca: `.claude/rules/ds-standards.md` §"Sistema multi-marca" tem as 6
superfícies de registro e as 7 armadilhas medidas. Doc humana: `#/themes` no showcase.

---

## Arquitetura de cor (2 tiers)

```
color-palette.ts (primitivo — OKLCH)
  brand[0–1000]         → verde da marca (default; azul e a marca `blue`)
  neutral[0–950]        → slate (levemente frio, hue ~247)
  success/warning/caution/danger/info [50–950]
  purple/teal/sky/pink/yellow [50–950]
  alpha.black[4–64]
  alpha.white[8–64]
  alpha.neutral[10–24]  → overlays neutros
  alpha.brand[10–24]    → overlays de marca
       ↓
color-light.ts  /  color-dark.ts (semântico)
  bg.*      → fundos de superfície e containers   (49 tokens)
  fg.*      → texto e ícones (sem namespace separado para icon)  (17)
  border.*  → bordas e dividers                    (12)
  ring.*    → focus rings (outline de foco acessível)  (7)
  overlay.* → float, scrim                          (2)
  chart.*   → 1–5 + grid                            (6)
```

---

## A regra de sufixo — depende da FAMÍLIA, não do papel

Errar isso é o defeito mais comum, porque a classe some sem avisar.

| Família | Tons que existem | Não existe |
|---|---|---|
| `brand` | `bg.brand`, `bg.brand-hover`, `bg.brand-subtle`, `bg.brand-subtle-hover` | `bg.brand-muted` |
| status (`success` `warning` `caution` `danger` `info`) | `bg.{s}`, `bg.{s}-hover`, `bg.{s}-muted`, `bg.{s}-muted-hover` | `bg.{s}-subtle` |
| neutro | `bg.subtle`, `bg.muted`, `bg.emphasis`, `bg.accent` | — |
| borda de status | **só** `border.{s}-muted` | `border.{s}` cru |
| borda de marca | `border.brand`, `border.brand-subtle` | — |

`caution` é o degrau **entre `warning` e `danger`** — laranja, hue 55 (warning é 81, danger 25),
mesma família de status e mesmos sufixos. Nasceu para escala por gravidade em 3 faixas
(amarelo → laranja → vermelho), como a espera de um ticket; `warning` sozinho não separa
"atenção" de "quase crítico". Existe nas 5 marcas.

## `on-*` — texto que senta SOBRE uma cor de marca ou status

Usado quando o fundo **é** uma cor específica. Só existe para marca e status:

```
bg.brand      → fundo verde da marca (default)
fg.on-brand   → texto que vai SOBRE bg.brand
```

Existem: `fg.on-brand`, `fg.on-caution`, `fg.on-danger`, `fg.on-info`, `fg.on-success`, `fg.on-warning`.
Não existe `fg.on-primary` (esse é o nome V2, extinto).

> ⛔ **Não existe sufixo `-inverted` em nenhum token.** Esta doc descrevia uma família
> `fg.{papel}-inverted` até 2026-07-30 — medido: **zero** ocorrências de "inverted" no CSS
> gerado. Era ficção. Para texto sobre superfície escura em tema light, use o par
> `bg.*`/`fg.on-*` correspondente, ou `dark:` quando o contexto é o tema.

---

## Roles semânticos — nomes reais

### `bg.*` — fundos

| Grupo | Tokens |
|---|---|
| Superfície | `canvas` · `surface` · `surface-elevated` · `surface-panels` · `subtle` · `muted` (+`-hover`) · `emphasis` · `accent` (+`-hover`) |
| Marca | `brand` · `brand-hover` · `brand-subtle` · `brand-subtle-hover` |
| Status | `success` · `warning` · `caution` · `danger` · `info`, cada um com `-hover`, `-muted`, `-muted-hover` |
| Form / chrome | `input` (+`-hover`) · `dropdown` · `sidebar` · `sidebar-accent` (+`-hover`) |
| Tabela | `table` · `table-head` · `table-row-hover` · `table-row-selected` (+`-hover`, `-solid`, `-hover-solid`) |
| Scrollbar | `scrollbar-thumb` (+`-hover`) — ⚠️ **alpha, não cor sólida** (ver abaixo) |

Hierarquia obrigatória de fundo: `canvas < surface < subtle < muted` (L-008).

⚠️ `bg.scrollbar-thumb` / `-hover` são a **única exceção** do grupo: valem `alpha.black[24/32]`
no light e `alpha.white[24/32]` no dark, iguais nas 5 marcas. A barra precisa de contraste
**próprio**, independente da cor de superfície da marca — por isso alpha neutro e não um token
de superfície. Consumidos só pelos `@utility scrollbar-*` do transform; não use como fundo de
elemento. Antes deles a utility usava `bg.muted-hover`, que no light é cinza **opaco** sobre
branco: a barra sumia em todo consumidor, e o showcase mascarava com um override hardcoded.

### `fg.*` — texto e ícones

| Token | Uso |
|---|---|
| `default` | texto base neutro — máximo contraste |
| `strong` | ênfase acima do default |
| `muted` / `subtle` | texto secundário / terciário |
| `disabled` | texto de elemento desabilitado |
| `brand` | cor da marca — links, CTAs |
| `success` `warning` `caution` `danger` `info` | texto de status |
| `on-brand` `on-success` `on-warning` `on-caution` `on-danger` `on-info` | texto sobre a cor correspondente |

### `border.*`

`default` · `subtle` · `input` · `table` · `sidebar` · `brand` · `brand-subtle` ·
`danger-muted` · `caution-muted` · `warning-muted` · `success-muted` · `info-muted`

### `ring.*` — focus rings

`brand` · `secondary` · `success` · `warning` · `caution` · `danger` · `info`

O ring padrão é **`ring-ring-brand`**. O token já embute alpha — **nunca** acrescentar
`/20`, `/30` (L-001). Aplicar como `focus-visible:ring-4 focus-visible:ring-ring-brand`
junto de `focus-visible:outline-none`.

### `overlay.*`

`scrim` (fundo de modal) · `float` (outline de superfície flutuante — ver L-040).

---

## Regras invioláveis

1. **Nunca usar primitivos em componentes.** `brand[600]` → proibido. Usar `bg-bg-brand`.
2. **Contraste mínimo:** `fg.default` / `bg.canvas` ≥ 7:1 (WCAG AAA).
3. **Dark mode:** mudar só `color-dark.ts`. Jamais lógica `if (isDark)` em componentes.
4. **`on-*` obrigatório:** todo `bg.{cor}` de marca/status precisa de `fg.on-{cor}`.
5. **Tom sutil segue a família** — status recebe `-muted`, marca recebe `-subtle`
   (ver a tabela acima). Não invente o par que falta.
6. **Ícones usam `fg.*`:** sem namespace separado para ícone.
7. **Focus ring usa `ring.*`:** nunca `border.*` para outline de foco.

---

## Fluxo para adicionar nova cor semântica

```
1. Existe primitivo em color-palette.ts?
   Sim → pular para passo 2
   Não → adicionar escala OKLCH em color-palette.ts

2. Adicionar em color-light.ts no role correto (bg / fg / border / ring)

3. Adicionar equivalente em color-dark.ts
   (border no dark: L% ≥ surface + 6% — L-009)

4. Se for bg.{cor} de marca/status:
   → criar fg.on-{cor}
   → criar o tom sutil da FAMÍLIA: status → bg.{cor}-muted · marca → bg.{cor}-subtle

5. Rodar npm run tokens:tw4 para gerar as classes CSS

6. Conferir que a classe existe de fato:
   grep "\-\-color-<nome>" src/styles/theme/tailwind-theme.css

7. Atualizar .ai/status/pipeline-state.md
```

---

## Quando usar cada padrão — guia rápido

| Situação | Token | Classe |
|----------|-------|--------|
| Texto padrão sobre superfície | `fg.default` | `text-fg-default` |
| Texto sobre botão da marca | `fg.on-brand` | `text-fg-on-brand` |
| Texto sobre fundo de erro | `fg.on-danger` | `text-fg-on-danger` |
| Texto de elemento desabilitado | `fg.disabled` | `text-fg-disabled` |
| Banner suave de sucesso | `bg.success-muted` + `border.success-muted` | `bg-bg-success-muted border-border-success-muted` |
| Banner suave da marca | `bg.brand-subtle` | `bg-bg-brand-subtle` |
| Fundo pastel por faixa de gravidade (30 min → 1 h → 2 h) | `bg.warning-muted` → `bg.caution-muted` → `bg.danger-muted` | `bg-bg-caution-muted` |
| Focus ring | `ring.brand` | `focus-visible:ring-4 focus-visible:ring-ring-brand` |

---

## Nomes a evitar — direção correta do rename

⚠️ Esta seção estava **invertida** até 2026-07-30 (dizia `fg.brand → renomeado para
fg.primary`, o oposto do real). A coluna da esquerda é o nome **morto**.

| Nome morto (V2) | Nome atual |
|---|---|
| `primary` (como cor da marca) | `brand` — `bg.brand`, `fg.brand`, `border.brand`, `ring.brand` |
| `fg.foreground` | `fg.default` |
| `fg.on-primary` | `fg.on-brand` |
| `border.main` | `border.default` |
| `critical` | `danger` |
| `bg.page` | `bg.canvas` |
| `border.focus` | movido para `ring.*` |
| `icon.*` | removido — usar `fg.*` |
| `*-inverted` (qualquer) | nunca existiu — ver aviso acima |
| `bg.disabled` | não existe — só `fg.disabled` |

Em 2026-07-30 havia **25 usos** de nomes desta coluna em `src/`, sendo 9 de
`ring-ring-brand` em 4 componentes distribuídos (anel de foco caindo em
`currentColor`). Todos corrigidos, e o gate `dead-theme-classes` agora reprova
reincidência no CI.
