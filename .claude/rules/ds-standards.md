---
description: Regras do iGreen DS — comportamento, anti-patterns, lições, dark mode, Radix. Carregado automaticamente nas pastas src/components, src/styles, tokens, .claude/skills/ds-*, .ai/
globs:
  - "src/components/**"
  - "src/styles/**"
  - "tokens/**"
  - ".claude/skills/ds-*/**"
  - ".ai/**"
---

# iGreen DS — Regras essenciais

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
8. **Handoff via PR sempre (L-041)** — TODO trabalho de componente (criar/alterar) ou mudança significativa termina, sem exceção, com: **branch própria** → **commit descritivo** (o quê + por quê, não deixar a diff falar sozinha) → **push no `mirror`** → **`gh pr create`** → **reportar o link do PR pro gate humano**. A IA executa a parte mecânica (branch/commit/push/PR) automaticamente; **PARA no merge** — merge/`npm publish`/deploy só com autorização explícita do usuário na mesma sessão. Nunca commitar direto em `main`. Distribuição (registry.json + embed + bump) **não** vai por-PR-de-componente — consolida no `/ds-release` ao fechar o conjunto (anotar no PR body que falta registrar).

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

### Hooks automáticos (autonomia do pipeline)

Três hooks PostToolUse rodam sem intervenção quando Claude edita arquivos. Eles fecham os loops das lições mais comuns sem depender de invocação manual de DS Reviewer:

| Hook                    | Trigger                                            | O que faz                                                                                                                                                                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `format-on-save.sh`     | qualquer Edit/Write                                | Roda prettier nos arquivos editados                                                                                                                                                                                                                                                                                            |
| `ds-lint-styles.sh`     | Edit/Write em `src/components/**/*styles.{ts,tsx}` | Grep das lições L-001 a L-007 + import de tv. Warning em stderr — não bloqueia, mas Claude vê                                                                                                                                                                                                                                  |
| `ds-inventory-check.sh` | Edit/Write em `src/components/ui/<Nome>/**`        | Alerta se USAGE.md ausente, se não consta no `inventory.md` (L-016), se não consta em `registry.json` (não será distribuído), se está no registry mas **fora do catálogo do CLI** (`cli/templates/default/CLAUDE.md`), ou se a **DocPage existe mas não está roteada** no `App.tsx`/`DOC_PAGES`+nav (render em branco) — L-042 |
| `ds-tokens-check.sh`    | Edit/Write em `tokens/**/*.ts`                     | Alerta pra rodar `tokens:tw4` + lembra que token novo só chega no consumidor via `registry:build` + bump (`/ds-release`). Tokens/theme versionados pelo stamp = `package.json.version`                                                                                                                                         |

Logs em `.ai/scratch/hook-log.txt`. Bloqueio só acontece em `block-rm-rf.sh` (Bash perigoso) e `block-sensitive-edit.sh` (.env, credentials, migrations) — os hooks DS são informativos por design.

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
| —           | tela de dados sem saber se é tabela ou lista (desambigua + roteia)            | front-door `/ds-create-screen`                       |

Path base: `.claude/skills/<agent>/<skill>`. Skills de pipeline sem agente
(`crud-builder`, `list-builder`, `frontend-design`, `igreen-page`) vivem direto em
`.claude/skills/<nome>/`.

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
<form className="flex flex-col gap-gp-lg">    // 12px — apertado
<form className="flex flex-col gap-gp-xl">    // 16px — ainda curto
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
ring-ring-primary/30 → ring-ring-primary   (token já tem alpha)
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

**Novos roles (2026-05-19 rewrite)**: 23 presets em 6 roles —
display / heading / title / body / caption / code. Detalhes em
`.ai/context/tokens/typography.md`. Body padrão do projeto = `body-sm` (13/500).
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
base:  "ring-0 ring-ring-primary"
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

## 43 Lições — resumo

Formato completo em `.ai/status/lessons.md`. Aqui é o atalho 1-linha:

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

- **L-024** **Forms usam `gap-form-gap` (20px) entre fields — token DS dedicado**. Antes (v0.7.0-): cada drawer/modal escolhia `gap-gp-lg` (12px) ou `gap-gp-xl` (16px) ad-hoc → inconsistência visual e correção repetida em PRs. Solução v0.7.1: token `formGap = scale[5]` em `tokens/.../components/spacing.ts` → CSS var `--spacing-form-gap` → classe `gap-form-gap`. **Regra pra IA**: ao implementar qualquer formulário (vertical ou grid 2-col interno), usar `className="flex flex-col gap-form-gap"` ou `"grid grid-cols-2 gap-form-gap"`. Não usar `gap-gp-*` semânticos pra spacing entre FormField units — eles permanecem pra cards, icon-to-text, section spacing. Padrão validado em SacarDialog "Outra conta" + NovoClienteDrawer.
- **L-025** **Componente "card variant" de input precisa de `<label htmlFor>` nativo wrap**, não `<button onClick>`. Caso: `CardCheckbox` v0.7.1. Usar `<button>` quebra acessibilidade (screen reader anuncia "button" em vez de "checkbox"), form integration (sem name/value pra submit nativo) e click target (stopPropagation no checkbox interno faz clique no card mas não no checkbox). Pattern correto: `<label htmlFor={id}><Checkbox id={id} ... /><div>...</div></label>` — label nativo propaga clique pro checkbox real, semântica preservada. Aplicar ao criar futuros `CardRadio`, `CardSwitch`, etc.
- **L-026** **TableHeadCell right-aligned reserva `pr-[60px]` SOMENTE quando sort ativo**, não pra hover-only icons. Bug pré-fix: o `pr-[60px]` era aplicado sempre que `sortable || headMenu` → reservava 60px de "vazio" no header mesmo sem sort/hover. Headers `align="right"` (ex: coluna `Saldo disponível`) ficavam com texto artificialmente deslocado da borda. **Solução:** condicionar a `isSorted` apenas. Hover-only icons (sort hint + headMenu) usam `headRightStack` absolute com `bg-bg-table-head` → mascaram texto durante hover (UX padrão). Regra pra IA: ao revisar layout de table header com align right, NÃO reservar padding fixo pra ícones hover-only.
- **L-027** **Avatar (e qualquer componente com bg arbitrário) escolhe cor de texto via WCAG contrast — não aplica `text-white` cego.** Utility: `getContrastTextColor(hex)` em `src/utils/color-contrast.ts` (luminância WCAG 2.x + contrast ratio). Avatar v0.7.1 refatorado: branch `colorHex` calcula `white` vs `black` automaticamente. Caso real: BB #FAE128 + branco = ratio 1.29:1 (fail AA) → agora preto 16.3:1 (AAA). **Regra pra IA**: ao criar novo componente que aceita bg dinâmico/externo (lookup de marca, persona, status custom), usar `getContrastTextColor()` em vez de hard-code. NÃO aplicar a pares semânticos DS pré-validados (`bg-bg-brand-subtle` + `text-fg-brand` etc — esses já foram casados em `color-light/dark.ts`).
- **L-028** **Componente memoizado (`React.memo`) com handlers do pai → latest-ref pattern, não `useCallback` em massa.** Handlers num `useRef` reatribuído todo render (ref estável não invalida o memo; `.current` lido NO CALL-TIME dentro da closure evita stale). ❌ `const h = ref.current` no topo do render captura snapshot stale quando o memo bloqueia re-render (bug pego no gate do PR4). Dados de RENDER (columns/widths/selected/editState) vão como props comparadas; estado reativo por-linha (edit) bundled num objeto passado só à linha afetada. Caso: `DataTableRow` v0.8.0.

### Fast-filter + mobile overlays (lições v0.8.x)

- **L-029** **Fast-filter de chip renderiza lista DIRETA, nunca `<Select open>` aninhado.** Um `<Select open>` dentro do PopoverContent do chip ancora o listbox no próprio trigger sr-only (~0px) → popover deslocado + "dot" residual + dismiss travado. Usar `FastSingleSelectList` (`column-types/_filter-field.tsx`) pra single (boolean/select) e `MultiSelectDropdown` pra multi. Selecionar fecha via `onClose`; clique-fora fecha (sem layer aninhado). Caso: `boolean/select-column-type` v0.8.x.
- **L-030** **Mobile-sheet acionado de dentro de overlay z-50 precisa ficar ACIMA.** App usa z-50 como camada-topo; o drawer mobile do MenuSidebar também é z-50 → sheet empatava e renderizava atrás ("aparece por trás"). Wrapper do mobile-sheet vai a **z-60** (globals.css) + backdrop **z-[55]** (dropdown-menu/popover). Não confiar em empate por ordem de DOM. Combina com L-031.
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
- **L-039** Tailwind v4: `border`/`border-{x,y,l,r,t,b}` cru = **só largura**; sem classe de cor a borda usa `currentColor` (branca no dark / preta no light). SEMPRE acompanhar de `border-border-default` (ou `-subtle`/`-brand`/`-danger-muted`...). Bridge cobre `bg-*`/`text-*`, **não** a borda crua. Exceção: base `cva` com `border` cru só se TODAS as variantes setarem cor (ex.: `alert`). Ao adaptar shadcn, trocar `border` → `border border-border-default` e preferir `bg-bg-surface`/`text-fg-default` a `bg-popover`/`text-popover-foreground`.
- **L-040** Componente **flutuante** (menu/popover/painel) segue a **receita única** do DS — espelhar `dropdown-menu.tsx`/`popover.tsx`, nunca os defaults shadcn. Superfície: `relative bg-bg-dropdown border border-border-default rounded-[12px] shadow-sh-lg outline-float` + frosted `before:backdrop-blur-2xl ...` + `text-fg-default/-muted`. Item: `px-pad-lg py-pad-md rounded-radius-sm text-fg-muted focus:bg-bg-muted focus:text-fg-default` (ativo `bg-bg-brand-subtle/fg-brand`, destructive danger). Separator/Label/Shortcut por token. Tooltip é exceção (menor). Delay default: Tooltip 200 / HoverCard openDelay 200 (Radix 700 é lento).
- **L-042** Componente novo toca **7 superfícies** — prever TODAS (não só código+USAGE): (1) código · (2) USAGE · (3) inventory · (4) showcase (`<Nome>Doc` + `App.tsx` import/render/**`DOC_PAGES`** + `doc-nav-data`) · (5) `registry.json` · (6) **catálogo do CLI** (`cli/templates/default/CLAUDE.md` + bump + republicar) · (7) changelog. 1–4 no PR; 5/6/7 no `/ds-release`. Checklist = `handoff-pr.md` "Definição de Pronto". Distribuído no registry mas fora do catálogo CLI = gap (caso Toast). Hook `ds-inventory-check` acusa.
- **L-043** Tailwind v4 **inlina** valores de `shadow`/`drop-shadow`/`text-shadow` da `@theme` na utility → `.dark { --shadow-* }` é **código morto** (no dark a sombra fica com o valor light; `md` light usa cinza-claro → "halo"). Fix: `@theme inline { --shadow-sh-*: var(--ds-sh-*) }` + `:root`/`.dark { --ds-sh-* }` (indireção que o cascade flipa). Cor usa `var()` e é dark-aware; shadow não — nunca confiar em `.dark{--shadow}` direto. Foundational (rebake no release).
- **L-041** Trabalho de componente **fecha por PR + link pro gate humano** (Regra 8) — branch + commit descritivo + push mirror + `gh pr create` + reportar link; IA faz o mecânico e **para no merge** (humano aprova; merge/publish/deploy só autorizado — L-020). Skill: `ds-dev/handoff-pr.md`. Distribuição (registry/embed/bump) consolida no `/ds-release`, não por-PR; vários componentes = batches (1 PR cada) + 1 release. Nunca encerrar sem PR; nunca commit órfão em `main`.

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

Nova lição descoberta → Reviewer adiciona como L-NNN em `.ai/status/lessons.md` → atualiza resumo aqui → próxima sessão já tem a regra. Loop fechado.
