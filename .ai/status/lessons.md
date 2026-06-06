# Lessons — iGreen DS v2

> Loop de auto-aperfeiçoamento. Cada erro identificado vira regra permanente.
> Carregar quando surgir comportamento não coberto pelo resumo em `ds-standards.md`.
> Atualizar sempre que o Claude cometer um erro novo.

---

## Formato

```
## [L-NNN] Título curto
**Erro cometido:** o que o Claude fez de errado
**Regra derivada:** o que fazer corretamente
**Contexto:** onde se aplica
```

---

## [L-001] Ring com modificador de opacidade

**Erro cometido:** usar `ring-ring-primary/30` ou `ring-ring-primary/20`

**Regra derivada:** tokens `ring-ring-*` já possuem alpha de 20% embutido via OKLCH.
Usar sempre sem modificador:
```typescript
// ✅
"focus-visible:ring-4 focus-visible:ring-ring-primary"
// ❌ NUNCA
"focus-visible:ring-4 focus-visible:ring-ring-primary/30"
```

**Contexto:** qualquer componente com focus ring

---

## [L-002] Tailwind literal em vez de token DS

**Erro cometido:** usar `gap-4`, `rounded-lg`, `shadow-md`, `p-4` quando existem tokens DS equivalentes

**Regra derivada:** sempre verificar se existe token DS antes de usar Tailwind puro:
```typescript
gap-4      → gap-gp-md      (8px)
gap-2      → gap-gp-xs      (4px)
p-4        → p-sp-md        (16px)
rounded-lg → rounded-radius-lg
shadow-md  → shadow-sh-md
px-3       → px-pad-lg      (12px)
h-9        → min-h-form-md  (36px)   ← h-9 = 36px = form-md, NÃO form-lg
h-10       → min-h-form-lg  (40px)
```

**Contexto:** qualquer arquivo `.styles.ts` ou componente Shadcn

---

## [L-003] `ring-3` não existe no Tailwind

**Erro cometido:** usar `ring-3`

**Regra derivada:** valores válidos de ring width: `ring-0`, `ring-1`, `ring-2`, `ring-4`, `ring-8`.
Para focus rings do DS usar sempre `ring-4`.

**Contexto:** qualquer componente com focus ring

---

## [L-004] `outline-none` sem `focus-visible:` prefix

**Erro cometido:** usar `outline-none` na base sem o prefix `focus-visible:`

**Regra derivada:**
```typescript
// ✅
"focus-visible:outline-none"
// ❌
"outline-none"
```

**Contexto:** base de qualquer componente interativo

---

## [L-005] `bg-input/50` e vars Shadcn com opacidade

**Erro cometido:** manter `bg-input/50` ao adaptar componente Shadcn

**Regra derivada:**
```typescript
// ❌
"bg-input/50"
// ✅
"bg-bg-surface"
```

**Contexto:** componentes Shadcn migrados para tokens iGreen

---

## [L-006] Disabled antes dos compoundVariants de cor

**Erro cometido:** colocar `{ disabled: true }` antes dos compostos de cor

**Regra derivada:** `disabled` SEMPRE deve ser o último item do array `compoundVariants`.

**Contexto:** qualquer componente com variante `disabled`

---

## [L-007] `text-xs font-semibold` em vez de preset tipográfico

**Erro cometido:** usar classes Tailwind avulsas `text-xs font-semibold`, `text-sm font-medium`

**Regra derivada:**
```typescript
// ❌
"text-xs font-semibold" → "text-caption-sm font-semibold"  // 11/600
"text-sm font-medium"   → "text-body-sm font-semibold"     // 13/600
```

**Contexto:** badge, tab, qualquer componente com texto de UI

**Nota histórica (atualizada 2026-06-05):** o typography rewrite 2026-05-19 removeu os presets `label-*`, `paragraph-*` e `subheading-*`. Os 6 roles atuais são `display | heading | title | body | caption | code`. Override de peso via Tailwind nativo sobre o preset. Esta lição foi atualizada porque a recomendação anterior (`text-label-xs`/`text-label-sm`) apontava pra presets que não existem mais. Ver L-019.

---

## [L-008] Dark mode bg hierarchy invertida

**Erro cometido:** definir `bg.subtle` e `bg.muted` mais escuros que `bg.canvas` no dark mode.

**Regra derivada:** hierarquia DEVE ser monotonicamente crescente em luminosidade:
```
canvas (8%) < surface (18%) < subtle (24%) < muted (32%) < moderate (40%) < strong (52%)
```

**Contexto:** `color-dark.ts` — qualquer edição de bg neutral

---

## [L-009] Border invisível no dark (mesmo L% que surface)

**Erro cometido:** `border-subtle` com mesmo valor oklch que `bg-surface`.

**Regra derivada:** bordas devem ter no mínimo 6% de diferença de luminosidade sobre a superfície.

**Contexto:** `color-dark.ts` — qualquer edição de border neutral

---

## [L-010] `--input` e `--border` vars Shadcn no dark

**Erro cometido:** vars em `.dark {}` do globals.css apontavam para mesmo token do light.

**Regra derivada:** no `.dark {}`:
- `--border` → `--color-bg-subtle` (24%)
- `--input` → `--color-bg-moderate` (32%)

**Contexto:** `globals.css` — seção `.dark {}`

---

## [L-011] Shadows e rings fracos no dark

**Erro cometido:** mesma opacidade de shadow e ring no dark e no light.

**Regra derivada:**
- Shadows dark: opacidade ≥2x do light
- Rings dark: alpha 1.5x do light

**Contexto:** `elevation.ts` shadow.dark + `color-dark.ts` ring tokens

---

## [L-012] Radix `data-state=checked` vs CSS `:checked`

**Erro cometido:** usar `has-[:checked]` para detectar estado de Radix.

**Regra derivada:** usar `has-[[data-state=checked]]` (colchetes duplos no Tailwind).

**Contexto:** qualquer wrapper com filho Radix checked

---

## [L-013] Slider com multiple thumbs

**Erro cometido:** renderizar apenas 1 `<SliderPrimitive.Thumb>` hardcoded.

**Regra derivada:** `Array.from({ length: values.length }, (_, i) => <Thumb key={i} />)`

**Contexto:** `slider.tsx`

---

## [L-014] `bg-white` fixo é OK para thumbs

**Erro cometido:** usar `bg-bg-surface-inverted` para thumbs de Switch/Slider.

**Regra derivada:** thumbs de Switch e Slider devem usar `bg-white` fixo.

**Contexto:** `switch.tsx`, `slider.tsx` — thumb elements

---

## [L-015] `scrollbar-width` CSS não aceita valores px — utilities com tamanhos distintos são idênticas no Firefox

**Erro cometido:** criar duas `@utility scrollbar-*` (thin/default) com larguras distintas em px sem documentar que a distinção é Chrome/Safari/Edge-only. Ambas usam `scrollbar-width: thin` — no Firefox são visualmente idênticas.

**Regra derivada:** `scrollbar-width` aceita apenas `auto` / `thin` / `none`. Para criar utilities de scrollbar com tamanhos visualmente distintos no Firefox, usar `scrollbar-width: auto` na utility "maior" (ativa scroll bar padrão do browser). Sempre documentar esse comportamento no comment da utility.

**Contexto:** `@utility scrollbar-*` token-driven em `to-tailwind-v4.ts` / `tailwind-theme.css`. Aplica-se a qualquer `@utility` de scrollbar com mais de um tamanho.

---

## [L-016] Preset tipográfico novo sem registro em `tv.ts` é silenciosamente removido pelo tailwind-merge

**Erro cometido:** adicionar novo preset (ex: `body-sm`) ao `typography.ts` e ao
CSS gerado (`@utility text-body-sm`), mas **esquecer** de registrar o nome em
`src/utils/tv.ts` (`twMergeConfig.extend.classGroups["font-size"][0].text`).
Resultado: o `tailwind-merge` (usado pelo `tv()`) trata o novo `text-body-sm`
como `text-color` (por causa do prefixo `text-`), e quando o componente também
tem `text-fg-default` (color real), considera AMBOS conflitantes e **remove o
`text-body-sm`** do className final. No DOM, o elemento perde font-size, lineHeight,
weight, tracking, family — e cai no default do browser (16px). Visual quebrado
silenciosamente — sem erro de tsc, sem warning.

**Regra derivada:** Sempre que adicionar/renomear preset tipográfico no
`typography.ts`, IMEDIATAMENTE atualizar a lista em
`src/utils/tv.ts > twMergeConfig.extend.classGroups["font-size"][0].text`.
A lista deve estar 1:1 com os presets exportados.

```ts
// src/utils/tv.ts
const twMergeConfig = {
  extend: {
    classGroups: {
      "font-size": [
        { text: [
          "display-2xl", "display-xl", ..., "code-md", "code-sm"
        ] },
      ],
    },
  },
};
```

**Verificação rápida:** depois de qualquer mudança em `typography.ts`, abrir
DevTools no browser, inspecionar um elemento com a nova classe, e checar se
`text-X` aparece na className final. Se não aparecer, é certeza que o
`twMergeConfig` está desatualizado.

**Contexto:** qualquer alteração em `tokens/brands/default/semantic/typography.ts`
— adição, remoção ou renomeação de preset. Atinge especialmente componentes que
usam `tv()` + `text-fg-X` no mesmo array de classes (a maioria deles).

---

## [L-017] `files` no package.json deve incluir paths das declarações TypeScript

**Erro cometido:** publicar lib no npm com `vite-plugin-dts` gerando `.d.ts` que referenciam paths preservados do source (`./src/components/index`, `./tokens/index`) que **NÃO estavam listados em `files`** do `package.json`. Resultado: tarball publicado tinha `dist-lib/index.d.ts` e `dist-lib/tokens.d.ts` apontando pra arquivos fantasma. Consumers TypeScript instalavam o package mas qualquer `import` retornava `any` ou erro "Cannot find module". **Bug afetou v0.1.0 até v0.5.0 silenciosamente** (4 releases) — corrigido em v0.5.1.

**Regra derivada:** ao publicar lib que usa `vite-plugin-dts` com estrutura preservada, o `files` do `package.json` DEVE incluir os paths emitidos:

```json
"files": [
  "dist-lib/index.*",
  "dist-lib/tokens.*",
  "dist-lib/preview/**",
  "dist-lib/chunks/**",
  "dist-lib/src/**",       // ← types preservam estrutura do source
  "dist-lib/tokens/**",    // ← idem
  "dist-lib/theme.css",
  "README.md"
]
```

**Verificação obrigatória antes de cada publish:**
```bash
npm pack --dry-run --json | grep -E '"path".*(src/components|tokens/index)' | head -5
# Deve retornar arquivos. Se vazio → bug presente, NÃO publicar.
```

Alternativa mais robusta: configurar `vite-plugin-dts` com `rollupTypes: true` pra gerar um único `dist-lib/index.d.ts` self-contained, eliminando a dependência de paths preservados.

**Contexto:** qualquer release de lib npm com TypeScript + múltiplos entries no mapa `exports`. Bug é silencioso (build passa, runtime JS funciona, só types quebram).

---

## [L-018] Template do CLI bootstrap precisa sincronizar com versão atual da lib

**Erro cometido:** ao bumpar `@snksergio/design-system` de v0.1.1 → v0.5.0 sem revisar o template default do `@snksergio/create-design-system` (CLI bootstrap), o template continuou pinando `^0.1.1` da lib. Projetos novos criados via `npx @snksergio/create-design-system` instalavam versão 5 minor atrasada. Plus: o template usava classes de tipografia REMOVIDAS no rewrite 2026-05-19 (`text-paragraph-sm`, `text-label-md`), props inválidas (`tone="critical"` em AlertModal — só aceita `default/neutral/danger/warning/success`), e strings JSX hardcoded mostrando "@0.1.1" como se fosse versão atual. Resultado: primeiro consumer que rodou `npx create-...` viu UI com tipografia quebrada + texto desinformado.

**Regra derivada:** toda release minor ou major da lib principal DEVE incluir, na mesma rodada:
1. **Bump do pin** em `cli/templates/default/package.json` (`@snksergio/design-system: ^X.Y.Z`)
2. **Auditoria do template** (`cli/templates/default/src/App.tsx` + `src/index.css`) contra API atual — greppar todas as classes/props usadas e validar que existem
3. **Atualizar strings JSX** que exibam versão como label
4. **Bump da CLI** (`cli/package.json`) e republish do `@snksergio/create-design-system`

Releases patch da lib não precisam bump da CLI **se** template não muda. Mas mesmo em patch, vale grep rápido de classes do template no diff da lib.

**Contexto:** qualquer release minor/major. Adicionar como item obrigatório no skill `ds-dev/release.md`.

---

## [L-019] Remover/renomear token exige grep em TODOS os consumers (não só `src/`)

**Erro cometido:** o typography rewrite 2026-05-19 consolidou 32→23 presets (removeu `paragraph-*`, `label-*`, `subheading-*`). A migration foi executada cuidadosamente em `src/` (Ondas 1-5 documentadas em `.ai/audits/typography-inventory-2026-05-19.md`), MAS deixou 14+ arquivos vivos no pipeline com pattern morto, **descobertos 17 dias depois** (2026-06-05):

- `cli/templates/default/src/App.tsx` — quebrou onboarding de consumers novos via CLI bootstrap
- `.claude/skills/ds-dev/impl-{igreen,shadcn,composite}.md` — exemplos canônicos seguidos pelo DS Dev em criação de novos componentes
- `.claude/skills/ds-designer/{spec-token,figma-extract}.md` — recomendações de spec
- `.claude/skills/frontend-design/SKILL.md` — guia frontend
- `.claude/commands/ds-extract-figma.md` — comando slash
- `.claude/hooks/ds-lint-styles.sh` — mensagem de erro do lint mencionava preset removido
- `.ai/rules/coding-standards.md` — regras canônicas com Button.styles desatualizado
- `.ai/context/{components/guide,components/inventory,components/shadcn-token-map,doc-guide}.md` — context guides
- `.ai/status/lessons.md` — a própria L-007 recomendava preset removido

**Regra derivada:** ao remover/renomear QUALQUER token (typography, color, spacing, sizing, etc.), grep TODOS os scopes do projeto antes de fechar o rewrite:

```bash
grep -rln "{padrão-antigo}" \
  --include="*.{ts,tsx,md,sh,css}" \
  --exclude-dir={node_modules,dist*,audits,archive,specs} \
  .
```

**Scopes a sempre cobrir:**
- `src/` — código
- `cli/templates/**/` — bootstrap consumer
- `.claude/**/` — skills, hooks, commands, rules
- `.ai/context/**/` e `.ai/rules/**/` — context guides + rules canônicas
- `.ai/status/lessons.md` — lições podem mencionar pattern (atualizar a recomendação, não a história)

**Scopes a PRESERVAR (snapshots históricos):**
- `.ai/audits/` — fotografias de momentos pré/pós migration
- `.ai/specs/` — specs de quando o rewrite foi planejado
- `.ai/status/archive/` — planos arquivados
- `.ai/status/pipeline-state.md` — log append-only, contexto histórico

**Contexto:** qualquer rewrite/migration de token semântico. Especialmente crítico em typography (mais consumidores que color/spacing).

---

## [L-020] Não burlar `/ds-release` mesmo em "patch urgente"

**Erro cometido:** sessão 2026-06-05 publicou v0.5.1 com **6 commits direct no `main`** (sem branch `release/v0.5.1` nem PR), por considerar a urgência do fix crítico de types do npm justificativa pra pular o fluxo. Releases anteriores (v0.3.0, v0.3.1, v0.4.0, v0.5.0) seguiram rigorosamente o padrão branch + PR via skill `/ds-release` — evidência no git log (`Merge pull request #1..#4 from <user>/release/vX.Y.Z`). Convenção quebrada, rastreabilidade do release perdida no histórico. Sem auto-review do diff via `pre-commit-check.md`. Sem gate humano via preview.

**Regra derivada:** TODA release que toca `package.json.version` ou envolve `npm publish` DEVE usar `/ds-release` (skill `.claude/skills/ds-dev/release.md`). Isso inclui:
- Major bumps
- Minor bumps
- **Patches** (mesmo que pareçam "fix de 1 linha")
- **Hotfixes** (mesmo quando urgentes — o gate humano é PARTE do design, não obstáculo)

Chores e infra (sem bump de version) podem ir direto via commit normal — mas releases NÃO.

**Heurística pré-commit:** *"Tem `npm publish` ou bump em `package.json.version` no escopo? Se sim → `/ds-release` obrigatório."*

**Verificação retroativa:** se o git log da release tem padrão `Merge pull request #N from <user>/release/vX.Y.Z`, é porque o pipeline foi seguido. Direct commits no `main` com tag de version quebram esse padrão.

**Por que isso importa (não é só convenção):**
- `/ds-release` invoca `pre-commit-check.md` que valida USAGE.md, DocPages, sincronias técnicas (L-016 twMergeConfig), pipeline-state, lessons sincronizados com o diff
- Gate humano via preview consolidado permite ver tudo antes de commit irreversível
- Branch + PR criam ponto de revisão (mesmo solo-dev, é checkpoint de "sanity check")
- Histórico de releases via PR mantém rastreabilidade pra rollback e auditoria

**Contexto:** qualquer trabalho que termine em `npm publish`. Adicionar verificação explícita no Passo 1 do `release.md` ("rejeitar se invocado em main já com bump aplicado por commit direto"). Adicionar nota explícita no preamble da skill `release.md`.

**Validação aplicada:** o próprio PR que registra esta lição (`chore/release-skill-discipline-l020`) é feito via branch + PR — demonstrando o padrão correto sendo seguido.

---

## Como adicionar nova lição

Quando o Claude cometer um erro não listado aqui:
1. Identificar o padrão do erro
2. Adicionar no formato `[L-NNN]` no final deste arquivo
3. Verificar se o resumo em `.claude/rules/ds-standards.md` precisa ser atualizado
   (é o arquivo auto-carregado — deve ter o resumo de todas as lições)
