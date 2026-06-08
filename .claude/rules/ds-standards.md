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

## ⛔ Regras de comportamento (7)

1. **NUNCA** criar token sem verificar se já existe em `.ai/context/tokens/`
2. **NUNCA** criar componente sem verificar `.ai/context/components/inventory.md`
3. DS Dev **NUNCA** cria token inline → **PARAR** → sinalizar cascata ao Orchestrator
4. **Gate obrigatório** para tokens novos e componentes novos (sem exceção)
5. Classes DS sempre antes de Tailwind literal
6. Self-interrupt: "estou criando algo novo?" → verificar primeiro
7. **Gate de pre-commit obrigatório** antes de commit significativo (release, refactor amplo, token novo, componente novo, lição nova) → invocar `ds-reviewer/pre-commit-check.md`

---

## Mecanismos do pipeline

### Gate com perspectiva Strategist
Toda spec do DS Designer deve incluir:
- **Alternativas descartadas** — o que foi considerado e por que não serve
- **Assumption central** — o que precisa ser verdade pra decisão funcionar

Orchestrator usa esses campos no gate. Reviewer verifica assumption após implementação.

### Critique genuína (DS Reviewer)
Após checklist: *"Esta revisão encontrou algo que muda direção — ou apenas confirmou?"*
Se apenas confirmou → examinar assumption do gate antes de aprovar.

### Campo Assumption no pipeline-state.md
Toda entrada CONCLUÍDO, APROVADO e PAUSADO (gate) inclui `Assumption`. Torna decisões reversíveis — quando um problema aparecer, você sabe qual assumption quebrou.

### Cascata (token faltante)
Dev encontra token inexistente → PARAR → sinalizar Orchestrator → registrar PAUSADO em pipeline-state → Designer cria token (gate) → retomar implementação.

### Hooks automáticos (autonomia do pipeline)

Três hooks PostToolUse rodam sem intervenção quando Claude edita arquivos. Eles fecham os loops das lições mais comuns sem depender de invocação manual de DS Reviewer:

| Hook | Trigger | O que faz |
|------|---------|-----------|
| `format-on-save.sh` | qualquer Edit/Write | Roda prettier nos arquivos editados |
| `ds-lint-styles.sh` | Edit/Write em `src/components/**/*styles.{ts,tsx}` | Grep das lições L-001 a L-007 + import de tv. Warning em stderr — não bloqueia, mas Claude vê |
| `ds-inventory-check.sh` | Edit/Write em `src/components/ui/<Nome>/**` | Alerta se USAGE.md ausente ou se componente não consta no `inventory.md` (L-016) |

Logs em `.ai/scratch/hook-log.txt`. Bloqueio só acontece em `block-rm-rf.sh` (Bash perigoso) e `block-sensitive-edit.sh` (.env, credentials, migrations) — os hooks DS são informativos por design.

### Auto-review na release (`/ds-release`)

Passo 1.5 do skill `ds-dev/release.md` roda o auto-review do diff completo desde a última entry antes de propor bump. Violação encontrada → aparece no preview do gate; usuário decide se corrige antes, aceita débito ou cancela.

---

## Skills por tarefa

| Agente | Tarefa | Skill |
|---|---|---|
| DS Designer | cor / dark mode | `spec-token.md` (args `tipo=color`) |
| DS Designer | spacing / gap / pad | `spec-token.md` (args `tipo=spacing`) |
| DS Designer | sizing / radius / shadow | `spec-token.md` (args `tipo=sizing\|radius\|shadow`) |
| DS Designer | tipografia | `spec-token.md` (args `tipo=typography`) |
| DS Designer | componente novo | `spec-component.md` |
| DS Designer | extração Figma | `figma-extract.md` |
| DS Dev | implementar token | `impl-token.md` |
| DS Dev | componente Shadcn | `impl-shadcn.md` |
| DS Dev | componente iGreen (tv()) | `impl-igreen.md` |
| DS Dev | componente composto | `impl-composite.md` |
| DS Reviewer | revisar token | `ds-reviewer/SKILL.md` |
| DS Reviewer | revisar componente | `review-component.md` |
| DS Reviewer | gate pre-commit amplo (antes de release / refactor / token / componente novo) | `pre-commit-check.md` |
| DS Dev | atualizar Updates timeline | `update-changelog.md` |
| DS Dev | release completa (changelog + bump + commit + PR) | `release.md` |

Path base: `.claude/skills/<agent>/<skill>`

---

## Contexto sob demanda

| Tipo | Localização |
|---|---|
| Tokens (color, spacing, sizing, typography, motion) | `.ai/context/tokens/*.md` |
| Inventário componentes | `.ai/context/components/inventory.md` |
| Guia componentes | `.ai/context/components/guide.md` |
| Mapa Shadcn → tokens | `.ai/context/components/shadcn-token-map.md` |
| Arquitetura completa | `.ai/context/architecture.md` |
| Padrão tv() detalhado | `.ai/rules/coding-standards.md` |
| Audit log | `.ai/status/pipeline-state.md` |
| Lições completas | `.ai/status/lessons.md` |
| USAGE por componente | `src/components/ui/<Nome>/USAGE.md` |

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
  { disabled: true, class: "..." },   // ← último wins
]
```

### Boundaries

- DS Dev cria token inline → **PARAR** → sinalizar cascata ao Orchestrator
- Componente novo sem verificar `inventory.md` primeiro → proibido

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
className="bg-white"  // Switch/Slider thumb (L-014)
```

- Avatar text sizes (10/11/13/14px) — calibrados pelo diâmetro do círculo, sem preset DS
- Pseudo-elements posicionais finos (`before:w-[3px]`, `top-[10px]`) — decisões visuais específicas
- Tier órfãos sem preset (15px, 17px, 22px, 26px) — manter literal ou criar preset DS via cascata

---

## 16 Lições — resumo

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

---

## USAGE.md por componente

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
