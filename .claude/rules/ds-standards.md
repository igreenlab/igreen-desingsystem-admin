---
description: Regras do iGreen DS — comportamento, anti-patterns, lições (L-NNN), dark mode, Radix, multi-marca. Entra como project instruction em TODA sessão do repo, sem escopo por pasta.
---

# iGreen DS — Regras essenciais

> **Carregamento (verificado em 2026-08-08, não presumido).** Todo `.md` de
> `.claude/rules/` é entregue ao agente como **project instruction**, junto do
> `CLAUDE.md`, na sessão inteira — não há ação a tomar, e não há escopo por pasta.
>
> O frontmatter tinha um bloco `globs:` (`src/components/**`, `tokens/**`, `.ai/**`…)
> que é sintaxe do **Cursor** e era **inerte** aqui. Removido porque descrevia um
> mecanismo de escopo que não existe — e pior, um escopo que teria deixado de fora
> justamente `src/preview/**` (onde os builders escrevem) e as skills não-`ds-*`
> (`crud-builder`, `list-builder`, `dashboard-builder`, `brand-builder`, …). Quem
> lesse o frontmatter concluiria que estas regras não valem ao gerar uma tela.
>
> **Consequência prática:** este arquivo custa contexto em 100% das sessões. Ao
> acrescentar seção, prefira 1 linha + ponteiro pro `.ai/` a 30 linhas de detalhe.

Fonte única de regras para sessões DS. Resumo executivo + lições + anti-patterns + dark mode + Radix. Para referência longa do padrão tv() completo: `.ai/rules/coding-standards.md`.

---

## ⛔ Regras de comportamento (8)

1. **NUNCA** criar token sem verificar se já existe em `.ai/context/tokens/`
2. **NUNCA** criar componente sem verificar `.ai/context/components/inventory.md`
3. DS Dev **NUNCA** cria token inline → **PARAR** → sinalizar cascata ao Orchestrator
4. **Gate obrigatório** para tokens novos e componentes novos (sem exceção)
5. Classes DS sempre antes de Tailwind literal
6. Self-interrupt: "estou criando algo novo?" → verificar primeiro
7. **Gate de pre-commit obrigatório** antes de commit significativo (release, refactor amplo, token novo, componente novo, lição nova) → invocar `ds-reviewer/pre-commit-check.md`
8. **Handoff via PR sempre (L-041)** — TODO trabalho de componente (criar/alterar) ou mudança significativa termina, sem exceção, com: **branch própria** → **commit descritivo** (o quê + por quê, não deixar a diff falar sozinha) → **push no remote CANÔNICO** (= o remote cuja URL é `igreenlab/igreen-desingsystem-admin` — resolva por **URL, nunca por nome**: é `origin` em clone direto e no CI, e `empresa` em clone onde `origin` é o fork pessoal parado. `git remote -v` antes; L-069 + receita em `ds-dev/handoff-pr.md`) → **`gh pr create`** → **reportar o link do PR pro gate humano**. Nunca commitar direto em `main`. Distribuição (registry.json + embed + bump) **não** vai por-PR-de-componente — consolida no `/ds-release` ao fechar o conjunto (anotar no PR body que falta registrar).

   **⚠️ Onde a IA para — a linha é o MERGE, não o push:**

   | A IA faz sozinha | A IA NUNCA faz sozinha (exige autorização explícita na mesma sessão — L-020) |
   |---|---|
   | branch · commit · push da **branch** · abrir PR | merge · `npm publish` · bump de `package.json.version` · deploy · `git push` em `main` · force-push |

   Até 2026-08-08 o `CLAUDE.md` (também auto-carregado) dizia *"NUNCA dê `git push` … sozinho → pare e peça"*, contradizendo esta regra frontalmente. A intenção original era proteger **publicação**, não o push da branch de trabalho — que é justamente o que produz o PR onde o humano decide. Os dois arquivos agora dizem a mesma coisa, com a mesma numeração de 1 a 8.

---

## Mecanismos do pipeline

### Gate com perspectiva Strategist

Toda spec do DS Designer deve incluir:

- **Alternativas descartadas** — o que foi considerado e por que não serve
- **Assumption central** — o que precisa ser verdade pra decisão funcionar

Orchestrator usa esses campos no gate. Reviewer verifica assumption após implementação.

### Critique genuína (DS Reviewer)

Após checklist: _"Esta revisão encontrou algo que muda direção — ou apenas confirmou?"_
Se apenas confirmou → examinar assumption do gate antes de aprovar.

### Campo Assumption no pipeline-state.md

Toda entrada CONCLUÍDO, APROVADO e PAUSADO (gate) inclui `Assumption`. Torna decisões reversíveis — quando um problema aparecer, você sabe qual assumption quebrou.

### Cascata (token faltante)

Dev encontra token inexistente → PARAR → sinalizar Orchestrator → registrar PAUSADO em pipeline-state → Designer cria token (gate) → retomar implementação.

### Hooks automáticos

→ **A tabela dos 5 hooks está no `CLAUDE.md`** §"Hooks automáticos (pipeline autônomo)" —
gatilho, o que cada um faz, e **qual deles alcança o agente**. Os dois arquivos são project
instruction: manter a tabela em ambos gastava **1.884 tokens em 100% das sessões** pra
descrever os mesmos 5 hooks, e duas cópias divergem (foi o que aconteceu com a afirmação
"Claude vê", falsa nos dois até 2026-08-17).

O essencial, que vale repetir em uma linha porque muda comportamento: **nenhum dos 3
informativos desfaz o Edit**; `ds-inventory-check` e `ds-tokens-check` saem com `exit 2` e
**chegam** no agente; o `ds-lint-styles` sai 0 e **não chega** — depois de mexer em
componente, consulte `.ai/scratch/hook-log.txt`. Bloqueiam de verdade só o `block-rm-rf` e o
`block-sensitive-edit`.

### Auto-review na release (`/ds-release`)

Passo 1.5 do skill `ds-dev/release.md` roda o auto-review do diff completo desde a última entry antes de propor bump. Violação encontrada → aparece no preview do gate; usuário decide se corrige antes, aceita débito ou cancela.

---

## Skills por tarefa

| Agente      | Tarefa                                                                        | Skill                                                |
| ----------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| DS Designer | cor / dark mode                                                               | `spec-token.md` (args `tipo=color`)                  |
| DS Designer | spacing / gap / pad                                                           | `spec-token.md` (args `tipo=spacing`)                |
| DS Designer | sizing / radius / shadow                                                      | `spec-token.md` (args `tipo=sizing\|radius\|shadow`) |
| DS Designer | tipografia                                                                    | `spec-token.md` (args `tipo=typography`)             |
| —           | **marca / tema de cor novo** (overlay `[data-theme]`)                         | `brand-builder/SKILL.md` via `/ds-create-brand`      |
| DS Designer | componente novo                                                               | `spec-component.md`                                  |
| DS Designer | extração Figma                                                                | `figma-extract.md`                                   |
| DS Dev      | implementar token                                                             | `impl-token.md`                                      |
| DS Dev      | componente Shadcn                                                             | `impl-shadcn.md`                                     |
| DS Dev      | componente iGreen (tv())                                                      | `impl-igreen.md`                                     |
| DS Dev      | componente composto                                                           | `impl-composite.md`                                  |
| DS Reviewer | revisar token                                                                 | `ds-reviewer/SKILL.md`                               |
| DS Reviewer | revisar componente                                                            | `review-component.md`                                |
| DS Reviewer | gate pre-commit amplo (antes de release / refactor / token / componente novo) | `pre-commit-check.md`                                |
| DS Dev      | atualizar Updates timeline                                                    | `update-changelog.md`                                |
| DS Dev      | release completa (changelog + bump + commit + PR)                             | `release.md`                                         |
| —           | tela CRUD/tabela consumindo DataTable (entrevista guiada)                     | `crud-builder/SKILL.md` via `/ds-create-crud`        |
| —           | tela lista de cards consumindo DataList (entrevista guiada)                   | `list-builder/SKILL.md` via `/ds-create-list`        |
| —           | tela dashboard/painel (KPIs + gráficos + rankings/resumos) — entrevista guiada | `dashboard-builder/SKILL.md` via `/ds-create-dashboard` |
| —           | tela de dados sem saber se é tabela, lista ou dashboard (desambigua + roteia) | front-door `/ds-create-screen`                       |
| **DS Dev**  | **fechar QUALQUER trabalho por PR (Regra 8)**                                  | **`ds-dev/handoff-pr.md`**                           |
| —           | **esqueleto do app** (AppShell + nav + rotas)                                  | **`app-builder/SKILL.md` via `/ds-create-app`**      |
| —           | **tela de login/auth**                                                         | **`auth-builder/SKILL.md` via `/ds-create-login`**   |
| —           | **composição de 2+ peças que reagem entre si** (master-detail, cross-filter)   | **`screen-composer/SKILL.md` via `/ds-create-screen`** |
| —           | **replicar um módulo existente pra outro domínio**                             | **`module-replicator/SKILL.md` via `/ds-replicate-module`** |
| —           | **página/bloco solto no DS, sem entrevista** (fallback)                        | **`igreen-frontend/SKILL.md`** — ⚠️ prefira os builders acima: eles têm gate |

> **As 5 últimas linhas entraram em 2026-08-08.** `app-builder`, `auth-builder`,
> `screen-composer` e `module-replicator` estavam roteadas no `orchestrator.md` e tinham
> command próprio, mas **zero ocorrências** nesta tabela — e `handoff-pr.md`, que a
> **Regra 8 torna obrigatória**, também não estava. Um agente que consultasse a tabela
> pra saber "qual skill uso" nunca as encontrava. É a DoD da L-047 (4 superfícies de
> roteamento) falhando na superfície "rule". Gate: `skills-routing.test.mjs`.

Path base: `.claude/skills/<agent>/<skill>`. Skills de pipeline sem agente
(`app-builder`, `auth-builder`, `brand-builder`, `crud-builder`, `dashboard-builder`,
`igreen-frontend`, `list-builder`, `module-replicator`, `screen-composer`) vivem direto em
`.claude/skills/<nome>/`. A `igreen-page` foi **removida** em 2026-08-08: ela mesma dizia
*"Quando carregar: **nunca**"*, e uma skill sem conteúdo continua competindo por matching
de description.

### DoD — nova skill/command builder (L-047)

Criar os `.md` da skill NÃO basta. Uma skill builder nova toca **4 superfícies de
roteamento** — preveja todas (o smoke test do list-builder pegou o orchestrator faltando):

1. **Skill** em `.claude/skills/<nome>/` (+ sub-arquivos do fluxo).
2. **Command(s)** em `.claude/commands/` (`/ds-create-<x>`) — entry point.
3. **Orchestrator** (`.claude/agents/orchestrator.md`) — linha na tabela de roteamento.
4. **Consumer** (se distribuída): `cli/templates/default/_claude/` (skill + command adaptados
   p/ copy-in) + `ds-kit/SKILL.md` (tabela de intenção) + bump CLI.

Depois: **smoke test** (invocar de verdade + checar os 4 pontos) antes de considerar pronta.

---

## Contexto sob demanda

| Tipo                                                | Localização                                  |
| --------------------------------------------------- | -------------------------------------------- |
| Tokens (color, spacing, sizing, typography, motion) | `.ai/context/tokens/*.md`                    |
| Inventário componentes                              | `.ai/context/components/inventory.md`        |
| Guia componentes                                    | `.ai/context/components/guide.md`            |
| Mapa Shadcn → tokens                                | `.ai/context/components/shadcn-token-map.md` |
| Arquitetura completa                                | `.ai/context/architecture.md`                |
| Padrão tv() detalhado                               | `.ai/rules/coding-standards.md`              |
| Audit log                                           | `.ai/status/pipeline-state.md`               |
| Lições completas                                    | `.ai/status/lessons.md`                      |
| USAGE por componente                                | `src/components/ui/<Nome>/USAGE.md`          |

---

## ⛔ O tema gerado é a FONTE ÚNICA dos 4 canais — `globals.css` não redeclara

`src/styles/theme/tailwind-theme.css` (gerado por `tokens/transforms/to-tailwind-v4.ts`) é o
**único arquivo que os 4 canais leem**. O `globals.css` é do **showcase apenas** — nada que
mora só nele chega em npm, submódulo ou copy-in.

**Regra prática:** precisa de regra CSS global, `@utility`, `@font-face` ou `@custom-variant`
novo? → edite `to-tailwind-v4.ts` + `npm run tokens:tw4`. **Nunca** o `globals.css`.

**Por que duplicar é PIOR que faltar** (o que justifica a regra ser absoluta): classe sem
layer vence `@utility`, e a **segunda** declaração de `@custom-variant` vence a primeira.
Redeclarar faz o showcase mostrar o comportamento certo enquanto o consumidor recebe o
errado — o defeito fica invisível justamente onde a gente olha. Foi assim que 6 defeitos
passaram meses (v0.35/0.36).

Também nunca use vocabulário da bridge shadcn (`bg-popover`, `ring-foreground`, as 19 chaves)
nem paleta nativa do Tailwind (`bg-red-500`) em componente: só existem no `globals.css` e a
cor cai em `currentColor` nos canais (L-039).

> **O detalhe todo é gate, não leitura.** O que o transform emite, o CSS commitado estar em
> sync, as duas listas de exceção, dep de tipo, classe de cor morta e os tokens de scrollbar
> estão descritos em `.ai/context/architecture.md` §"O que o transform emite" e no cabeçalho
> de cada módulo — cada um com **teste que reprova**: `runtime-base` · `orphan-utilities` ·
> `shadcn-vocab` · `generated-artifacts` · `deps-declared` · `dead-theme-classes` ·
> `barrel-completeness`. Todos no `npm test`. Não reproduza a explicação aqui: este arquivo é
> project instruction e custa em 100% das sessões (item D1 do plano de fechamento).

---

## 🖼️ Referência visual (print, Figma, tela existente) — o que ela decide e o que não

Input visual é o caso mais comum no consumo real, e as skills assumiam entrevista em
texto: sem regra, cada agente escolhe sozinho o que copiar. A divisão é por CAMADA, não
por elemento:

| A referência decide | O DS decide, sempre |
|---|---|
| copy, labels, nomenclatura, ordem/agrupamento de campos, densidade percebida do domínio | fonte e família, tamanho, peso, tracking, cor, espaçamento, radius, sombra, foco, **comportamento de componente** |

- **Conteúdo é do domínio** — você não tem como adivinhar que `prod/hml/dev` é o jargão
  da casa. Copie e **não "melhore"** sem pedir.
- **Pele e comportamento não são seus pra adaptar.** Preset existe → use o preset (o papel
  `code` cobre chave/ID/hash: `text-code-sm`). Compor `font-mono text-body-sm` +
  `tracking-widest` na unha porque "ficou parecido com o print" é drift — é exatamente o
  que o DS existe pra impedir.
- **Cor: a referência escolhe o CONJUNTO, nunca o valor.** Print escuro → `dark`; print de
  outra marca → `data-theme="<id>"`. O que não se faz é derivar hex do pixel do print.
- **Chrome na referência (rail/menu/header) = shell no escopo.** Print de app inteiro com
  pedido de "uma tela" é `shell + tela`, não `tela`. Não dá pra entregar o shell? Diga em
  **linha destacada** o que do print fica de fora — antes de gerar, não depois.

> Medido no dogfood de 2026-08-20 (consumidor real, submódulo): dos desvios da tela
> gerada, **nenhum** foi componente errado ou token inexistente — foram 6 pontos em que a
> fidelidade ao print venceu a regra, e o mantenedor resumiu melhor que a spec:
> *"conteúdo do print, pele e comportamento do DS"*.

---

## ❌ Anti-patterns proibidos

### Tailwind literal com equivalente DS

```typescript
gap-4   → gap-gp-md       gap-2   → gap-gp-xs
p-4     → p-sp-md         px-3    → px-pad-lg
rounded-lg → rounded-radius-lg
shadow-md  → shadow-sh-md
```

### Form layout — usar `gap-form-gap` (L-024, v0.7.1+)

```typescript
// ❌ ERRADO — semântico genérico em form
<form className="flex flex-col gap-gp-lg">    // 10px — apertado
<form className="flex flex-col gap-gp-xl">    // 12px — ainda curto
<div className="grid grid-cols-2 gap-gp-md">  // grids dentro de form

// ✅ CORRETO — token DS específico
<form className="flex flex-col gap-form-gap">          // 20px DS
<div className="grid grid-cols-2 gap-form-gap">        // mesmo no grid

// Aplica-se a: drawers (NovoClienteDrawer), modais (SacarDialog),
// pages de formulário, sections com 2+ FormField units empilhados.
```

### Heights fixos proibidos

```typescript
h-7  → min-h-form-xs   (28px)
h-8  → min-h-form-sm   (32px)
h-9  → min-h-form-md   (36px)   ← h-9 = 36px = form-md, NÃO form-lg
h-10 → min-h-form-lg   (40px)
h-11 → min-h-form-xl   (44px)   ← target WCAG mobile
```

### Ring / focus

```typescript
ring-ring-brand/30 → ring-ring-brand   (token já tem alpha)
ring-3 → ring-4                            (ring-3 não existe no Tailwind)
outline-none → focus-visible:outline-none  (acessibilidade)
```

### Tipografia avulsa

```typescript
text-xs font-semibold → text-body-xs (12/500) ou caption-md font-semibold
text-sm font-medium  → text-body-md font-medium (14/500)
text-[14px] font-medium → text-body-md font-medium (preset + override de weight)
text-[13px]            → text-body-sm font-normal (preserva 13/400)
text-[Npx]             → preset DS sempre que houver tier equivalente
```

**Roles**: 27 presets em 7 roles —
display / heading / title / body / caption / **stat** / code. Detalhes em
`.ai/context/tokens/typography.md`. Body padrão do projeto = `body-sm` (13/500).
Valor de KPI/métrica = `stat-{sm|md|lg|xl}` (20/24/30/34px, estático, bold) +
`tabular-nums` — nunca `text-[Npx]` na unha (o VP tinha ~33 desses; `stat` mata).
Title default = weight 600. Override de weight via `font-bold/semibold/medium/normal`.

⚠️ **L-016**: ao adicionar novo preset, REGISTRAR em `src/utils/tv.ts`
(`twMergeConfig.extend.classGroups["font-size"][0].text`) — senão
`tailwind-merge` confunde com `text-fg-X` e remove a classe silenciosamente.

### Imports

```typescript
import { tv } from "tailwind-variants" → import { tv } from "@/utils/tv"
```

### Variants order

```typescript
// disabled DEVE ser o último compoundVariant
compoundVariants: [
  { color: "primary", class: "..." },
  { disabled: true, class: "..." }, // ← último wins
];
```

### Boundaries

- DS Dev cria token inline → **PARAR** → sinalizar cascata ao Orchestrator
- Componente novo sem verificar `inventory.md` primeiro → proibido

### Filtro em tabela/lista → nativo, NUNCA form acima (L-051)

Intenção de "adicionar filtro" numa tabela/lista (select de status em cima, campo de
período, "filtrar por X") → **proibido** gerar form/selects soltos acima da grade. Use o
motor reativo do componente (chips clicáveis/editáveis):

- **coluna/campo** → `enableColumnFilter`/`filterFields`; já filtrado → **pré-aplicar**
  (`defaultViews`/`presetView`/`filterModel` · DataList: `views`/`filterModel`) → chip aplicado.
- **toolbar.actions/toolbarActions SÓ pra caso pequeno/simples não-coluna** (ex.: data),
  label curta, **máx ~2**. Mexe com coluna, grande ou muitos → **não** use o toolbar.
- **muitos ou ligados a coluna** → sempre nativos **pré-aplicados (chips)**. As skills
  crud/list + ds-kit sugerem isso.

### DataTable autoFit — header-floor, fill proporcional, toggle (L-052b/v0.22.0)

`autoFit` do DataTable (v0.22.0): (1) a largura mínima de cada coluna inclui o **header
inteiro** (`headerName` + ícone/sort/menu) — título nunca trunca em "..."; (2) a sobra de
espaço é distribuída **proporcionalmente** e **`col.width` virou base/piso** (não trava
fixa) que entra no rateio — pra travar use `width`+`maxWidth` iguais; (3) toggle de view
re-mede via `recalcKey: viewMode`. Regra: prefira NÃO fixar `width`. Detalhe em
`lessons.md` L-053 + skills crud-builder.

### DataTable view Lista — paginação opt-in (L-052)

`DataTable` na view Lista (`viewMode="list"` + `listConfig`) **não pagina por padrão** —
mostra todas as rows processadas (igual kanban). Pra paginar a **lista flat** (mesma
paginação da tabela + footer) passe **`listConfig.paginated: true`** (v0.21.0+).
Opt-in/não-breaking; ignorado quando `hierarchical` (árvore desliga paginação). Documentado
em `crud-builder/generate.md` (repo + `cli/templates`). Use sempre que a lista flat puder
ter muitas linhas (senão rola "infinito" enquanto a tabela pagina).

### DataTable saved-views — viewMode sticky + `allowCreateView` (L-054/v0.23.0)

Dois ajustes de visões do `DataTable`: (1) **viewMode "sticky"** — aplicar uma visão (preset
ou "Default") só troca Tabela↔Lista↔Kanban se a visão **declarar `viewMode` explícito**;
presets sem `viewMode` (o caso comum) mantêm a view que o usuário está vendo (antes,
qualquer troca de visão voltava pra Tabela). (2) **`allowCreateView={false}`** — esconde o
botão "+" das visões (read-only: só `defaultViews` + Default, o usuário não salva visões
próprias). Default `true`, não-breaking. **Regra**: abas fixas → `allowCreateView={false}`;
só declare `viewMode` no `presetView` que DEVE forçar uma view. Detalhe em `lessons.md` L-054
+ skills crud-builder + USAGE DataTable/TableToolbar.

### DataTable — grab-to-scroll nativo + coluna `copyable` (v0.26.0)

Dois recursos: (1) **grab-to-scroll agora é NATIVO** — `grabToScroll` passou a **default
`true`**: toda tabela rola lateralmente ao arrastar o corpo (mouse/pen, threshold ~6px,
clique/seleção preservados, pulado em touch). Não precisa ligar; `grabToScroll={false}`
desabilita. (2) opção de coluna **`copyable`** (`true` ou `{ value?, label? }`) → ícone de
copiar revelado no **hover/foco** da célula + feedback "Copiado!" (~2s, `navigator.clipboard`,
sem dep nova). **Regra pra IA**: em colunas cujo valor o usuário copia (CNPJ/documento,
e-mail, ID, conta) marque `copyable: true`; NÃO reimplemente scroll-drag (já é nativo). Doc:
DataTableDoc + USAGE + skills crud-builder (repo + payload) + `example-finance`.

---

## ✅ Obrigatório sempre

```typescript
import { tv, type VariantProps } from "@/utils/tv"
"min-h-form-xl"             // 44px WCAG mobile
"min-h-form-lg"             // 40px desktop default
"border border-transparent" // transição suave na base
<button type="button">

// Padrão 1 — estático (botões, selects, chips)
base:  "focus-visible:outline-none"
color: "focus-visible:ring-4 focus-visible:ring-ring-{color}"

// Padrão 2 — animado (inputs, textareas)
base:  "ring-0 ring-ring-brand"
       "transition-[color,box-shadow,background-color] focus-visible:outline-none"
focus: "focus-visible:ring-4"
```

---

## Dark mode (L-008 a L-011)

```
bg: canvas < surface < subtle < muted     (hierarquia crescente OBRIGATÓRIA)
border dark: L% ≥ surface + 6%             (senão some no fundo escuro)
shadows dark: ≥ 2× opacidade do light      (amplificar)
rings dark: ≥ 1.5× alpha do light          (amplificar)
--input/--border no .dark {}: diferentes do :root (light)
```

---

## Radix patterns

```typescript
"has-[[data-state=checked]]"  // L-012 — Radix usa data attributes
Array.from({ length: values.length }, (_, i) => <Thumb key={i} />)  // L-013
```

### Exceções de hardcode válidas

```typescript
className = "bg-white"; // Switch/Slider thumb (L-014)
```

- Avatar text sizes (10/11/13/14px) — calibrados pelo diâmetro do círculo, sem preset DS
- Pseudo-elements posicionais finos (`before:w-[3px]`, `top-[10px]`) — decisões visuais específicas
- Tier órfãos sem preset (15px, 17px, 22px, 26px) — manter literal ou criar preset DS via cascata

---

## 70 Lições (L-001 a L-070) — resumo

Formato completo em `.ai/status/lessons.md`; as absorvidas em gate automático (L-001/002/003/005 no lint, L-017 no `lib-verify`) vivem em `.ai/status/lessons-archive.md` — continuam valendo, o pipeline só já as aplica sozinho. Aqui é o atalho 1-linha de TODAS, ativas e arquivadas — e **isso agora é verificado**:
`scripts/lib/lessons-index.mjs` (no `npm test`) reprova lição que existe na fonte e não é
citada aqui, e confere a contagem do próprio título acima. Em 2026-08-08 faltavam 6
(L-044/045/046/048/049/050) atrás desta mesma frase.

### Focus rings / Tailwind

- **L-001** `ring-ring-*` já tem alpha embutido. **NUNCA** `/30`, `/20`, etc.
- **L-002** Tailwind literal proibido se houver token DS (heights, gap, pad, shadow).
- **L-003** `ring-3` não existe. Usar `ring-4`.
- **L-004** `outline-none` sozinho viola acessibilidade. Sempre `focus-visible:outline-none`.
- **L-005** Shadcn `bg-input/50` → `bg-bg-surface` (token DS).

### Variants & tipografia

- **L-006** `disabled` SEMPRE último em `compoundVariants`. Senão é sobrescrito.
- **L-007** `text-xs font-semibold` avulso → usar preset `text-body-xs` (ou equivalente).

### Dark mode (4 regras combinadas)

- **L-008** Hierarquia bg crescente: `canvas < surface < subtle < muted`.
- **L-009** Border no dark: L% (lightness) ≥ surface + 6%.
- **L-010** `--input` e `--border` no `.dark{}` devem ser **diferentes** dos do `:root`.
- **L-011** Shadows ≥ 2× opacidade do light, rings ≥ 1.5× alpha do light.

### Radix

- **L-012** Radix usa data attributes: `has-[[data-state=checked]]` (não `has-[:checked]`).
- **L-013** Slider Radix: renderizar N `<SliderPrimitive.Thumb>` pra N valores.
- **L-014** Switch/Slider thumb `bg-white` literal é exceção válida.

### Tokens / Infra

- **L-015** `scrollbar-width` CSS só aceita `auto/thin/none` — tamanhos px iguais no Firefox.
- **L-016** Novo preset tipográfico em `typography.ts` → registrar em `src/utils/tv.ts` `twMergeConfig` senão `tailwind-merge` remove silenciosamente.

### Release / npm (lições 2026-06-05)

- **L-017** `files` do `package.json` DEVE incluir `dist-lib/src/**` e `dist-lib/tokens/**` quando usar `vite-plugin-dts` sem `rollupTypes`. Bug afetou v0.1.0-v0.5.0 (types quebrados silenciosamente). Validar via `npm pack --dry-run` antes de publish.
- **L-018** Release minor/major da lib → bump pin no `cli/templates/default/package.json` + auditoria do template + bump CLI na mesma rodada.
- **L-019** Remover/renomear token → grep TODOS os scopes (`src/`, `cli/templates/**`, `.claude/**`, `.ai/context/**`, `.ai/rules/**`, `lessons.md`). Preservar `audits/`, `specs/`, `archive/`, `pipeline-state.md`.
- **L-020** Patches/hotfixes também usam `/ds-release` — branch + PR obrigatórios. **TODO `npm publish` ou bump em `package.json.version` exige o fluxo completo**, incluindo pre-commit-check e gate humano. Direct push no `main` pra release quebra a convenção do projeto (releases v0.3-v0.5 vieram via PR; sessão 2026-06-05 burlou isso por urgência percebida — não justifica).

### Compound components + Radix (lições 2026-06-08, v0.7.0)

- **L-021** Compound component wrapper que serve de **anchor pra Radix Popover/Tooltip/etc** PRECISA usar `forwardRef`. Sem isso, `asChild` não consegue obter o DOM node ref e o popover ancora em `top=-506` (fora do viewport). Caso real: `ButtonGroupRoot` sem forwardRef → popover advanced do DataTable simpleFilter quebrou posicionamento. Fix: refatorar pra `forwardRef<HTMLDivElement, Props>`.
- **L-022** Split button com Radix Popover: usar `<PopoverAnchor asChild>` (NÃO `<PopoverTrigger asChild>`) quando o wrapper tem 2+ onClick handlers separados (ex: ButtonGroup Primary + Chevron). PopoverTrigger asChild faz merge do onClick com o wrapper → qualquer click bubble dispara o toggle interno do Radix, conflitando com handlers de filho específicos (race condition mesmo com `e.stopPropagation()` + `e.preventDefault()`). Anchor só posiciona; consumer controla `open`/`onOpenChange` externamente via state. Pattern aplicado em `<FilterPopover>` v0.7.0 — nova prop `anchor?: ReactNode` substitui `trigger` quando consumer quer split button externo.
- **L-023** **Forms PRECISAM usar `<FormField>` (ou `<FormFieldInput/Select/Textarea>`) do DS**. Nunca `<label>` raw com classes manuais — divergência visual silenciosa do padrão (font-weight diferente, cor errada no dark mode). FormField encapsula `formFieldLabel()` (`text-body-sm font-semibold tracking-[0.01em] text-fg-default dark:text-fg-muted`) + spacing + id htmlFor + helper text + error/warning/success states. Pra widget custom (vindo de registry, slot, etc), use `<FormField label="..."><{() => myWidget}></FormField>` (children é render-prop). Caso real: `<ToolbarSimpleFilterDrawer>` v0.7.0 inicial usava `<label class="text-body-sm font-medium text-fg-default">` raw — peso 500 (DS é 600) e sem dark-mode-aware → labels ficaram MAIS FORTES no dark que o padrão NovoClienteDrawer (FormField). Fix: trocar pra `<FormField>` wrap. **Regra pra IA**: ao implementar qualquer form/drawer com label+input, IMPORTAR `FormField` antes de escrever `<label>` na unha.

### Form spacing + Card inputs (lições 2026-06-09, v0.7.1)

- **L-024** **Forms usam `gap-form-gap` (20px) entre fields — token DS dedicado**. Antes (v0.7.0-): cada drawer/modal escolhia `gap-gp-lg` (10px) ou `gap-gp-xl` (12px) ad-hoc → inconsistência visual e correção repetida em PRs. Solução v0.7.1: token `formGap = scale[5]` em `tokens/.../components/spacing.ts` → CSS var `--spacing-form-gap` → classe `gap-form-gap`. **Regra pra IA**: ao implementar qualquer formulário (vertical ou grid 2-col interno), usar `className="flex flex-col gap-form-gap"` ou `"grid grid-cols-2 gap-form-gap"`. Não usar `gap-gp-*` semânticos pra spacing entre FormField units — eles permanecem pra cards, icon-to-text, section spacing. Padrão validado em SacarDialog "Outra conta" + NovoClienteDrawer.
- **L-025** **Componente "card variant" de input precisa de `<label htmlFor>` nativo wrap**, não `<button onClick>`. Caso: `CardCheckbox` v0.7.1. Usar `<button>` quebra acessibilidade (screen reader anuncia "button" em vez de "checkbox"), form integration (sem name/value pra submit nativo) e click target (stopPropagation no checkbox interno faz clique no card mas não no checkbox). Pattern correto: `<label htmlFor={id}><Checkbox id={id} ... /><div>...</div></label>` — label nativo propaga clique pro checkbox real, semântica preservada. Aplicar ao criar futuros `CardRadio`, `CardSwitch`, etc.
- **L-026** **TableHeadCell right-aligned reserva `pr-[60px]` SOMENTE quando sort ativo**, não pra hover-only icons. Bug pré-fix: o `pr-[60px]` era aplicado sempre que `sortable || headMenu` → reservava 60px de "vazio" no header mesmo sem sort/hover. Headers `align="right"` (ex: coluna `Saldo disponível`) ficavam com texto artificialmente deslocado da borda. **Solução:** condicionar a `isSorted` apenas. Hover-only icons (sort hint + headMenu) usam `headRightStack` absolute com `bg-bg-table-head` → mascaram texto durante hover (UX padrão). Regra pra IA: ao revisar layout de table header com align right, NÃO reservar padding fixo pra ícones hover-only.
- **L-027** **Avatar (e qualquer componente com bg arbitrário) escolhe cor de texto via WCAG contrast — não aplica `text-white` cego.** Utility: `getContrastTextColor(hex)` em `src/utils/color-contrast.ts` (luminância WCAG 2.x + contrast ratio). Avatar v0.7.1 refatorado: branch `colorHex` calcula `white` vs `black` automaticamente. Caso real: BB #FAE128 + branco = ratio 1.29:1 (fail AA) → agora preto 16.3:1 (AAA). **Regra pra IA**: ao criar novo componente que aceita bg dinâmico/externo (lookup de marca, persona, status custom), usar `getContrastTextColor()` em vez de hard-code. NÃO aplicar a pares semânticos DS pré-validados (`bg-bg-brand-subtle` + `text-fg-brand` etc — esses já foram casados em `color-light/dark.ts`).
- **L-028** **Componente memoizado (`React.memo`) com handlers do pai → latest-ref pattern, não `useCallback` em massa.** Handlers num `useRef` reatribuído todo render (ref estável não invalida o memo; `.current` lido NO CALL-TIME dentro da closure evita stale). ❌ `const h = ref.current` no topo do render captura snapshot stale quando o memo bloqueia re-render (bug pego no gate do PR4). Dados de RENDER (columns/widths/selected/editState) vão como props comparadas; estado reativo por-linha (edit) bundled num objeto passado só à linha afetada. Caso: `DataTableRow` v0.8.0.

### Fast-filter + mobile overlays (lições v0.8.x)

- **L-029** **Fast-filter de chip renderiza lista DIRETA, nunca `<Select open>` aninhado.** Um `<Select open>` dentro do PopoverContent do chip ancora o listbox no próprio trigger sr-only (~0px) → popover deslocado + "dot" residual + dismiss travado. Usar `FastSingleSelectList` (`column-types/_filter-field.tsx`) pra single (boolean/select) e `MultiSelectDropdown` pra multi. Selecionar fecha via `onClose`; clique-fora fecha (sem layer aninhado). Caso: `boolean/select-column-type` v0.8.x.
- **L-030** **Mobile-sheet acionado de dentro de overlay z-50 precisa ficar ACIMA.** App usa z-50 como camada-topo; o drawer mobile do MenuSidebar também é z-50 → sheet empatava e renderizava atrás ("aparece por trás"). Wrapper do mobile-sheet vai a **z-60** + backdrop **z-[55]** (dropdown-menu/popover). Não confiar em empate por ordem de DOM. Combina com L-031. ⚠️ A regra do wrapper **mudou-se pro tema gerado** em 2026-08-07 (`to-tailwind-v4.ts` → `buildFloatingUtilities`), porque no `globals.css` ela não chegava em canal nenhum — não a procure (nem a redeclare) lá.
- **L-031** **`DropdownMenu` dentro de drawer/overlay → `modal={false}` + backdrop `pointer-events-none`.** Modo modal do Radix injeta dismiss/scroll-lock que corre com o gesto → abre no pointerdown e fecha no click do mesmo toque ("some", precisa 2-3 toques). Backdrop `pointer-events-auto` do dropdown intercepta o pointerup. Fix: `modal={false}` no consumer + backdrop do dropdown `pointer-events-none` (dismiss segue via DismissableLayer a nível de document). Popover não sofre (abre no click). Caso: `AppShell/user-menu.tsx` v0.8.x.

### Charts / Recharts 3 (lições v0.9.x)

- **L-032** **Recharts 3 tem caveats que quebram mudo.** (1) `text-display-sm`/`text-display-xs` **não existem** (renderizam 14px) → KPI usa `heading-sm`/`heading-xs`/`display-md`. (2) Pizza: sem `activeIndex`/`activeShape` → prop `shape={(props,index)=><Sector/>}`. (3) Radial empilhado/gauge parcial → `<PolarAngleAxis type="number" domain={[0,total]} />`. (4) Eixo Y omite tick de borda (ex: `0`) → `interval={0}`; e `domain` máximo **= maior tick** (senão linha-guia duplicada no topo). (5) Grid via token `chart-grid` (`--color-chart-grid`), reescrito no `ChartContainer` — não passar `stroke`. Padrões completos: `.ai/context/components/chart-patterns.md` + `Chart/USAGE.md`.

### Distribuição / consumidor (lições v0.10.0)

- **L-033** Copy-in: integridade se protege por **hook** (`protect-ds.mjs` bloqueia tema/tokens/`cn`/`tv`; avisa em componente) + regra, não travando arquivo. IA do consumidor customiza na **composição**, nunca nos tokens/internals.
- **L-034** `example-*` = **extração 1:1 do showcase real**, nunca toy. Strip `AppShell` → `<div flex flex-col h-full min-h-0 gap-gp-2xl>`, `TableDoc`→`_table-data.ts`, rewrite imports, validar render no consumidor.
- **L-035** examples↔preview são cópias paralelas → **drift-check** (`examples-drift-check.mjs`, hash da fonte) avisa quando o showcase muda; re-sync `--baseline`.
- **L-036** Roteamento de intenção no consumidor = **skill** (nativo/barato pela description), não agente. `ds-kit` é o front-door; subagente só pra trabalho pesado.
- **L-037** Item de registry declara **todas** as deps reais (`data-table` precisa `@tanstack/react-virtual`; quem usa `@/lib/lucide-types` embute o arquivo). Validar com render em consumidor, não só tsc.
- **L-038** Default vindo do column-type (`defaultAlign`/`defaultEllipsis`) deve ser resolvido na **fonte única** (`effectiveColumns` em `use-data-table-columns.ts`), nunca por render-site. Header/footer liam só `col.align` cru e divergiam do body em `type:"currency"/"number"` sem `align` explícito (não reproduz no showcase, só no consumidor). Validar no cenário SEM o override.
- **L-039** Tailwind v4: `border`/`border-{x,y,l,r,t,b}` cru = **só largura**; sem classe de cor a borda usa `currentColor` (branca no dark / preta no light). SEMPRE acompanhar de `border-border-default` (ou `-subtle`/`-brand`/`-danger-muted`...). Bridge cobre `bg-*`/`text-*`, **não** a borda crua. Exceção: base `cva` com `border` cru só se TODAS as variantes setarem cor (ex.: `alert`). Ao adaptar shadcn, trocar `border` → `border border-border-default` e **PROIBIDO** usar `bg-popover`/`text-popover-foreground` — ou qualquer das 19 chaves da bridge (`background` `foreground` `card` `popover` `primary` `secondary` `muted` `accent` `destructive` `border` `input` `ring` + `-foreground`). Elas só existem no `globals.css`/`index.css`, não viajam pros canais npm e submódulo, e a cor cai em `currentColor`. Gate: `scripts/lib/shadcn-vocab.mjs` no `npm test`; a tabela `EQUIVALENTE` dele dá o token DS de cada chave.
- **L-040** Componente **flutuante** (menu/popover/painel) segue a **receita única** do DS — espelhar `dropdown-menu.tsx`/`popover.tsx`, nunca os defaults shadcn. Superfície: `relative bg-bg-dropdown border border-border-default rounded-[12px] shadow-sh-lg outline-float` + frosted `before:backdrop-blur-2xl ...` + `text-fg-default/-muted`. Item: `px-pad-lg py-pad-md rounded-radius-sm text-fg-muted focus:bg-bg-muted focus:text-fg-default` (ativo `bg-bg-brand-subtle/fg-brand`, destructive danger). Separator/Label/Shortcut por token. Tooltip é exceção (menor). Delay default: Tooltip 200 / HoverCard openDelay 200 (Radix 700 é lento).
- **L-042** Componente novo toca **8 superfícies** — prever TODAS (não só código+USAGE): (1) código · (2) USAGE · (3) inventory · (4) showcase (`<Nome>Doc` + `App.tsx` import/render/**`DOC_PAGES`** + `doc-nav-data`) · (5) `registry.json` · (6) **vocabulário do consumidor** (`cli/templates/default/_claude/rules/ds-components.md`, no grupo de tarefa + critério de escolha, + bump + republicar) · (7) changelog · (8) **barrel** (`src/components/index.ts` — define o canal npm). 1–4 e 8 no PR; 5/6/7 no `/ds-release`. Checklist = `handoff-pr.md` "Definição de Pronto". Distribuído no registry mas fora do vocabulário = gap (caso Toast). Hook `ds-inventory-check` acusa 2/3/5/6 + showcase; o barrel é gate (`barrel-completeness`). **A 8ª entrou em 2026-08-08**: era a única superfície sem nenhuma vigilância, e por isso `Chart`/`DataList`/`List`/`Toast` passaram meses com 6 de 7 fechadas e `import { ChartContainer }` estourando "not exported" no consumidor npm.
- **L-043** Tailwind v4 **inlina** valores de `shadow`/`drop-shadow`/`text-shadow` da `@theme` na utility → `.dark { --shadow-* }` é **código morto** (no dark a sombra fica com o valor light; `md` light usa cinza-claro → "halo"). Fix: `@theme inline { --shadow-sh-*: var(--ds-sh-*) }` + `:root`/`.dark { --ds-sh-* }` (indireção que o cascade flipa). Cor usa `var()` e é dark-aware; shadow não — nunca confiar em `.dark{--shadow}` direto. Foundational (rebake no release).
- **L-041** Trabalho de componente **fecha por PR + link pro gate humano** (Regra 8) — branch + commit descritivo + push no remote canônico (resolvido por **URL**, não por nome — L-069) + `gh pr create --repo igreenlab/igreen-desingsystem-admin` + reportar link; IA faz o mecânico e **para no merge** (humano aprova; merge/publish/deploy só autorizado — L-020). Skill: `ds-dev/handoff-pr.md`. Distribuição (registry/embed/bump) consolida no `/ds-release`, não por-PR; vários componentes = batches (1 PR cada) + 1 release. Nunca encerrar sem PR; nunca commit órfão em `main`.

### Infra, componentes e registry (L-044 a L-050)

> ⚠️ Estas 6 estavam **ausentes** deste resumo até 2026-08-08, apesar de a linha de
> abertura prometer *"o atalho 1-linha de TODAS"*. Só existiam no `lessons.md`, que é
> sob demanda — ou seja, na prática não chegavam à sessão. A **L-044 é a mais grave a
> ter ficado invisível**: o repo roda em Windows.

- **L-044** Hooks bash dependiam de `jq` (**ausente no Git Bash/Windows**) e casavam path com `/` enquanto o harness manda `\` → **skip silencioso, rede de segurança inteira no-op por uma sessão**. Hoje todos têm fallback `node` + `tr '\\' '/'` antes de qualquer matching. Ao escrever hook novo: **nunca** dependa de binário fora do `package.json`, e normalize o path primeiro (ver também L-061).
- **L-045** Bug que "só aparece no último/primeiro item" é quase sempre **off-by-one mascarado** por um valor que coincide nos demais (caso real: conector hierárquico usando `ancestorHasNext[i]` em vez de `[i+1]` — invisível exceto no último root). Teste sempre a borda: último root, lista vazia, 1 item.
- **L-046** `DataList` — 4 padrões de tela: (1) `fillHeight` faz só a lista rolar (pai com altura + `flex-1 min-h-0`); **não** combinar com `virtualized`. (2) Virtualizado exige `measureElement`, senão o `estimateItemSize` reserva a mais e o excedente vira "gap" falso. (3) Nó-folha no `hierarchical` **não** recebe placeholder de chevron. (4) `branchHighlight` só em `layout="hierarchical"`.
- **L-048** `block-rm-rf.sh` casa o padrão em **qualquer ponto** do comando — inclusive dentro de uma commit message (bloqueou um `git commit` cuja mensagem citava `rm -rf src/`). Não escreva `rm -rf <path>` literal em mensagem/echo.
- **L-049** `registryDependency` pode ficar **dangling** pra componente **bundlado** em outro item: `data-list` importa `TableToolbar`, que não tem item próprio (vive dentro de `data-table`) → `@igreen/table-toolbar` não resolve e o `igreen:add` quebra. Ao editar o registry, valide que cada `registryDependency` existe como item.
- **L-050** Showcase: `PropsTable` vai **direto** sob `SectionH2`, nunca dentro de `ExampleSection` — as duas têm superfície própria (ring) e vira card-dentro-de-card. E `SectionH2` tem `mb` sem `margin-top`: tabela seguida de heading cola.

### Infra de gate, distribuição e armadilhas de plataforma (L-055 a L-069)

> Estas 15 entraram como seções de prosa entre 2026-07 e 2026-08 — cada uma pequena, e
> somadas **3.616 tokens** contra os ~87/lição dos bullets acima. A seção promete o
> *atalho 1-linha*; o detalhe integral de cada uma está no `lessons.md`, que é sob demanda.
> Voltaram ao formato em 2026-08-15 (item D1 do plano de fechamento). Nada foi removido.

- **L-055** Tela que converge num padrão (dashboard, KPI-group, chart-card, card dividido) → **capture a receita** com os primitivos existentes em `.ai/context/components/dashboard-patterns.md`; **não** crie mega-componente de página. Componentiza-se só o gap de átomo. Ícone: KPI-group = círculo `size-form-lg rounded-radius-full`; mini-stat/legenda = quadrado `size-comp-lg rounded-radius-base`.
- **L-056** Claude Code só descobre `.claude/` na **raiz do cwd** — consumidor por **submódulo** fica sem o kit de IA. `npm run ds:link` projeta o MESMO payload do consumidor no `.claude/` do pai (idempotente; `--unlink` desfaz), exclui `hooks/`+`settings.json` e gera `ds-config.json` com `importBase`. Submódulo é 1 dos **4** canais.
- **L-057** `container` é a **única** exceção que não dobra prefixo: o transform emite `--container-md` e sobrescreve a escala nativa. Use **`max-w-md`** (768px do DS) / `max-w-tooltip-lg` / `max-w-modal-sm`. **`max-w-container-*` não existe** e não emite CSS — falha silenciosa. Gate: `dead-theme-classes`.
- **L-058** As 8 superfícies são **detecção**, não burocracia: o `ChoroplethMap` tinha 3 delas, saiu da `main` num merge de reorganização e **nenhum sinal disparou** — quem achou foi um app em produção, meses depois. Confira também as deps reais do arquivo contra o `package.json` (ele usava `d3-geo`/`topojson` sem declarar). Gate: `deps-declared`.
- **L-059** Gate mecânico só pra regra **errada independente de contexto** (valor divergente, classe inexistente). Regra que exige contexto cross-elemento (L-004) ou julgamento de intenção (L-007) fica **só** com o revisor: medido, os greps antigos davam **51 hits, 50 ruído**. O **ratchet** (só linha adicionada) é o que torna o gate ligável.
- **L-060** Comentário, doc e mensagem de erro são **load-bearing**: quem lê para de investigar. Ao escrever frase que **afirma garantia**, verifique a garantia — sem poder verificar, descreva o que o código faz, não o que ele garante. Ao **mover** fonte de verdade, grep nas mensagens que apontam pro lugar antigo (viram instrução pra desfazer a mudança).
- **L-061** No-op por dependência ausente **não é desligado — está ARMADO**: o `format-on-save` era no-op mudo até um `npx` popular o cache e ele reformatar arquivo sozinho. Hook/check que depende de binário externo **declara a dependência** ou **falha visível**; decidir não usar = **remover**, não deixar inerte.
- **L-062** `--diff-filter=A` é **cego a rename** (status `R`) → `git mv Foo Bar` passava sem check. Use `--no-renames` **mais** o critério *"não existia no base ref"* (`git cat-file -e <merge-base>:<path>`) — só o primeiro dispararia em qualquer arquivo novo dentro de pasta existente. Valide com **commit real de rename**. Gate: `new-component-folders`.
- **L-063** Ao derivar identificador de um nome (pasta→rota), **meça** quantos casos reais seguem a convenção: das 42 pastas de `ui/`, **uma** não é PascalCase (`avatar-ig`) e seria reprovada estando correta. Valide e **pule + avise** (`::warning`, não `console.log`) em vez de derivar errado em silêncio. Resista a override configurável pra 1 exceção.
- **L-064** Gate novo só está pronto depois de **reproduzir o defeito real** e ver reprovar — teste escrito a partir do mesmo modelo mental que gerou o código concorda **por construção**. Use **dado real** (commit do histórico) e monte a entrada **pela função de produção**. E **propriedade computada não é evidência de comportamento**: onde o render é do UA, só medição visual vale.
- **L-065** **Simulação valida a orientação; dogfood valida os artefatos.** Um sandbox de consumidor real (scaffold + `igreen:add`) achou 2 bugs que a simulação não pegou — import **relativo** cross-dir sobrevivendo ao rewrite do copy-in (crash do app) e `defaultViews` inalcançável com `allowCreateView={false}`. Só o consumidor real exercita o que é distribuído.
- **L-066** Override escopado gerado como **diff** aposta na omissão, e omissão herda de quem vencer o empate: `[data-theme]` e `.dark` têm a **mesma especificidade**, então o bloco light vencia o dark por ordem de fonte — a `vibrant` vazava **13** tokens claros no escuro. Garanta exclusão mútua (`[data-theme="x"]:not(.dark)`) e **meça no browser com cada combinação de eixos ativa**.
- **L-067** `@keyframes` com nome que o Tailwind ou o `tw-animate-css` já possui **não sobrescreve** — no-op silencioso, e quem lê o código acredita num comportamento que nunca existiu. Animação do DS vai no tema gerado, com **nome próprio** (`ds-pulse`, não `pulse`). Antes de mover/duplicar regra CSS, **grep no artefato BUILDADO** pra ver qual declaração sobrevive.
- **L-068** Componente que emite `<a href>` precisa de integração de router: aceite **`renderLink`** (render-prop — `linkComponent` escrito inline remonta a subárvore a cada render), e cancelar navegação tem **5 exceções** que quebrariam algo real (clique modificado, `target="_blank"`, href externo, **href de hash**, ausência de handler). Fixture com forma diferente da de produção **não é teste**: o exemplo usava `#/rota` e o consumidor usava `/rota`.
- **L-069** Base de gate por **nome** de remote mente: `origin` aqui é o fork parado, e medir contra ele deu **17 violações** e um `exit 1` falso, tudo plausível. Resolva por **URL** (`canonical-base-ref.mjs`), deixe **base explícita mandar**, **imprima a base resolvida sempre**, e cite na mensagem de erro o remote **resolvido** — mandar `git fetch origin main` aqui é instrução pra reproduzir o bug.

---

## Sistema multi-marca (temas)

5 marcas: `default` · `blue` · `green` · `pay` · `vibrant`. Cada não-default é um **overlay
de cor** escopado em `[data-theme="<id>"]`, gerado por `npm run tokens:brand:<id>`.

⚠️ **Marca muda SOMENTE cor.** Spacing, sizing, radius, elevation e tipografia vêm sempre de
`brands/default/` — o transform os importa fixos de lá. Pedido de "mudar o espaçamento/a
fonte só nesta marca" **não é tema**: pare e pergunte. (Pra `font-weight` ser brand-aware os
presets teriam que referenciar var — mudança no transform, afeta as 5 marcas.)

⛔ **Três armadilhas que exigem JULGAMENTO** — não há gate que as pegue:

1. **"Mais vibrante" não é operação de saturação.** Os status da default já vivem a 84–100%
   do teto de croma do próprio hue, e o teto do sRGB depende de hue **e** de luminosidade:
   verde/amarelo picam claros, vermelho no meio, roxo escuro. **Não existe roxo claro e
   saturado em sRGB.** Meça o teto por hue **antes** de prometer vibração — e cor no teto não
   deriva estado por saturação (o hover fica idêntico ao repouso; desça a luminosidade).
2. **Handoff externo mapeia papel→shade pra UI DELE.** Seguir `semanticExample` ao pé da
   letra já comprimiu a separação título↔subtítulo de célula pra **1.34:1** (contra 2.49:1 da
   default) — o subtítulo virou o título. Showcase de cards não tem par título/subtítulo; a
   nossa UI é tabela densa. **Nosso mapeamento manda.**
3. **Verifique no BROWSER, com cada combinação de eixos ativa.** `tsc`, testes e
   `dead-theme-classes` passaram verdes com **13** tokens resolvendo errado no dark (L-066).
   Valor em arquivo de token não é evidência de pixel.

> **O resto é gate ou receita, não leitura.** As 10 superfícies de uma marca nova, o contrato
> dos 3 arquivos, os 4 canais de entrega e as armadilhas mecânicas (chave faltando herdando a
> default por `as`, `fg` de status precisando shade mais claro no dark, rampa neutra por modo)
> estão em `.claude/skills/brand-builder/generate.md` — que é o **passo-a-passo executável**,
> via `/ds-create-brand` — e em `.ai/context/tokens/color.md`. **Gate mecânico:**
> `npm run brand:check` (5 marcas × 10 superfícies, no CI e no `release:check`) +
> `brand:contrast`. Não reproduza a lista aqui: este arquivo custa em 100% das sessões
> (item D1 do plano de fechamento).

### Estado desabilitado (lição 2026-08-20)
- **L-070** `disabled` vai na área que ele desabilita (o `field`), **nunca na raiz** que
  também embrulha `banner`/aviso. No `MessageComposer` o `pointer-events-none` na raiz
  apagava e inertizava o botão "Reabrir com template" — a única saída do estado — e o
  atendente clicava sem efeito. Antes de pôr `pointer-events-none` num container: existe lá
  dentro alguma ação cuja função é encerrar este estado?

### Padrão de chart (resumo)

```
Gráfico SEMPRE em <ChartContainer config={...}>; cor SÓ por token (chart-1..5 / config keys).
2 séries = verde(chart-1)+âmbar(chart-4) · pizza = rampa monocromática da brand.
Grid: <CartesianGrid vertical={false} strokeDasharray="4 4" /> (token chart-grid, sem stroke).
Card: Panel + CardHead (título+subtítulo) ou KPI_LABEL/KPI_VALUE (label caption-md + valor 30px).
Estreito = max-w fixo + coluna única (nunca lado-a-lado). 1 card por linha; categorias via SectionLabel.
Catálogo vivo: #/chart-showcase (ChartShowcaseDoc.tsx).
```

---

## USAGE.md por componente

**Compostos iGreen (`ui/<Nome>/`)** → `USAGE.md` por componente (API custom, vale o atalho).
**Primitivos shadcn (`shadcn/*.tsx`)** → **NÃO** criar USAGE por arquivo (API shadcn/Radix é
padrão). Existe um **índice único** `src/components/shadcn/USAGE.md` que lista **só gotchas**
(setup no root, dep extra, receita flutuante L-040, z-index L-030, ring fora do padrão).
Ao adicionar/editar um shadcn: cria/edita 1 linha **só se houver gotcha**; sem gotcha →
nada (não inflar / não estourar tokens). Doc viva do primitivo = showcase `#/<nome>`.
Checklist em `impl-shadcn.md`; o `pre-commit-check.md` valida.

Cada componente em `src/components/ui/<Nome>/` tem `USAGE.md` ao lado — atalho rápido pra IA consumir o componente sem ler source. Formato canônico:

- O que é + categoria
- Quando usar
- Props essenciais (tabela)
- Variants (tabela)
- Exemplo mínimo
- Gotchas / cuidados

---

## Auto-update protocol

Achado novo → **as 4 perguntas** → só então vira L-NNN em `.ai/status/lessons.md` + 1 linha no
resumo acima. Falhou em qualquer uma: **não é lição** — é gate, ou é nada.

1. **Dá gate?** → faça o gate: 0 token/sessão e não depende de lembrar (L-059). Lição é pra quando NÃO dá.
2. **Já está no ponto de uso?** → não duplique; este arquivo cobra de 100% das sessões.
3. **Acontece com outra pessoa?** → erro de método do agente vai pra memória de sessão, não pra cá.
4. **Muda a decisão de quem lê?** → se não, é histórico: `pipeline-state.md`.

> Esta seção era um mandato incondicional (*"nova lição → adiciona"*) até 2026-08-17 — sem filtro,
> num arquivo que custa em toda sessão: era o motor que o triplicou em 4 meses. Aferido no dia: as
> 4 perguntas reprovaram **as 2** lições que eu mesmo propus ao fechar a sessão.
