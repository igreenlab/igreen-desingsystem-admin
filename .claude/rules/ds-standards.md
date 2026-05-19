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

## ⛔ Regras de comportamento (6)

1. **NUNCA** criar token sem verificar se já existe em `.ai/context/tokens/`
2. **NUNCA** criar componente sem verificar `.ai/context/components/inventory.md`
3. DS Dev **NUNCA** cria token inline → **PARAR** → sinalizar cascata ao Orchestrator
4. **Gate obrigatório** para tokens novos e componentes novos (sem exceção)
5. Classes DS sempre antes de Tailwind literal
6. Self-interrupt: "estou criando algo novo?" → verificar primeiro

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
text-xs font-semibold → text-label-xs
text-sm font-medium  → text-label-sm
text-[14px] font-medium leading-5 → text-label-sm (preset composto)
```

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

## 14 Lições — resumo

Formato completo em `.ai/status/lessons.md`. Aqui é o atalho 1-linha:

### Focus rings / Tailwind
- **L-001** `ring-ring-*` já tem alpha embutido. **NUNCA** `/30`, `/20`, etc.
- **L-002** Tailwind literal proibido se houver token DS (heights, gap, pad, shadow).
- **L-003** `ring-3` não existe. Usar `ring-4`.
- **L-004** `outline-none` sozinho viola acessibilidade. Sempre `focus-visible:outline-none`.
- **L-005** Shadcn `bg-input/50` → `bg-bg-surface` (token DS).

### Variants & tipografia
- **L-006** `disabled` SEMPRE último em `compoundVariants`. Senão é sobrescrito.
- **L-007** `text-xs font-semibold` avulso → usar preset `text-label-xs`.

### Dark mode (4 regras combinadas)
- **L-008** Hierarquia bg crescente: `canvas < surface < subtle < muted`.
- **L-009** Border no dark: L% (lightness) ≥ surface + 6%.
- **L-010** `--input` e `--border` no `.dark{}` devem ser **diferentes** dos do `:root`.
- **L-011** Shadows ≥ 2× opacidade do light, rings ≥ 1.5× alpha do light.

### Radix
- **L-012** Radix usa data attributes: `has-[[data-state=checked]]` (não `has-[:checked]`).
- **L-013** Slider Radix: renderizar N `<SliderPrimitive.Thumb>` pra N valores.
- **L-014** Switch/Slider thumb `bg-white` literal é exceção válida.

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
