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

## [L-021] Compound component que serve de anchor pra Radix asChild PRECISA usar `forwardRef`

**Erro cometido:** ao criar `<ButtonGroup>` (compound component v0.7.0), implementei `ButtonGroupRoot` como function component normal sem `forwardRef`. Tudo funcionava no preview standalone. Quando o DataTable usou ButtonGroup como `anchor` do `<FilterPopover>` (split button pattern via `PopoverAnchor asChild`), o popover advanced abriu mas em `top=-506px` — fora do viewport. Demorou pra diagnosticar porque o problema era invisível (popover existia no DOM com `data-state="open"`, mas posicionado fora).

**Causa raiz:** Radix `*Anchor` / `*Trigger` com `asChild` clona o filho e injeta `ref` pra obter o DOM node como anchor de posicionamento. Compound sem `forwardRef` ignora o ref injetado → Radix não acha anchor → fallback posiciona em (0, default) que pode estar fora do viewport.

**Regra derivada:** componente compound que possivelmente será wrap-ed por `PopoverAnchor/Trigger`, `TooltipTrigger`, `DropdownMenuTrigger`, `Slot` ou similar PRECISA usar `forwardRef`. Mesmo que hoje você não use anchor — facilita extensão futura. Custo é mínimo (~3 linhas).

```tsx
// ❌ Antes (componente compound sem ref)
function ButtonGroupRoot({ children, ...props }: ButtonGroupProps) {
  return <div role="group" {...props}>{children}</div>;
}

// ✅ Depois (forwardRef)
const ButtonGroupRoot = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroupRoot({ children, ...props }, ref) {
    return <div ref={ref} role="group" {...props}>{children}</div>;
  },
);
```

**Sintomas de diagnóstico:** popover/tooltip aparece com `data-state="open"` no DOM mas é invisível ou posicionado errado. `getBoundingClientRect()` retorna posição fora do viewport (top negativo grande, ou top=0 left=0 quando deveria estar no canto direito). React DevTools mostra o popover montado normalmente.

**Contexto:** qualquer componente que será trigger/anchor de overlay Radix. Aplicar em todos os compound components novos do DS por default (Button já usa forwardRef, mas Card/Panel/etc deveriam).

---

## [L-022] Split button com Radix Popover: usar `PopoverAnchor` em vez de `PopoverTrigger`

**Erro cometido:** ao montar split button (ButtonGroup com Primary=ação A + Chevron=ação B), envolvi o ButtonGroup inteiro em `<PopoverTrigger asChild>`. O Chevron tinha `onClick` próprio (toggle do popover) e o Primary tinha `onClick` próprio (abrir drawer). Mas o `PopoverTrigger asChild` faz merge do `onClick` interno do Radix com o wrapper — qualquer click dentro do wrapper bubble e dispara `onOpenChange` interno do Radix, conflitando com o setState do handler do filho. Race condition: meu state seta `open=true`, o Radix entende como trigger click e seta `open=false` no mesmo tick. Resultado: popover não abre OU abre e fecha imediatamente.

**Tentativas que NÃO resolveram:**
- `e.stopPropagation()` no onClick — Radix usa pointerDown, não click
- `e.preventDefault()` + `e.stopPropagation()` no `onPointerDown` — Radix Slot ainda merge antes do handler do filho
- `dispatchEvent` manual com pointerdown sintético — mesmo resultado

**Solução:** usar `<PopoverAnchor asChild>` em vez de `<PopoverTrigger asChild>`. Anchor SÓ POSICIONA — não tem handler de toggle. Consumer controla `open` / `onOpenChange` externamente via state. Implementação na lib (`<FilterPopover>` v0.7.0):

```tsx
<Popover open={open} onOpenChange={handleOpenChange}>
  {anchor ? (
    // Anchor mode: posiciona mas NÃO dispara abertura — consumer controla via prop `open`
    <PopoverAnchor asChild>{anchor}</PopoverAnchor>
  ) : (
    <PopoverTrigger asChild>{trigger}</PopoverTrigger>
  )}
  <PopoverContent>{...}</PopoverContent>
</Popover>
```

**Regra derivada:** Popover/Tooltip/HoverCard com **trigger composto** (2+ filhos com handlers diferentes) DEVE usar `Anchor` (posicionamento) + `open` controlled (consumer dispara). `Trigger` só é seguro quando o componente inteiro é 1 handler de toggle.

**Heurística:** *"O wrapper tem mais de 1 onClick distinto? Se sim → use Anchor + controlled open."*

**Contexto:** qualquer split button, button group com dropdown, ou wrap de Radix overlay com children que têm interactions próprias. Pattern aplicado em `FilterPopover` (nova prop `anchor?: ReactNode`). Replicar quando criar novos componentes com split pattern.

---

## [L-023] Forms PRECISAM usar `<FormField>` do DS — nunca `<label>` raw

**Erro cometido:** ao implementar `<ToolbarSimpleFilterDrawer>` v0.7.0, montei manualmente:

```tsx
// ❌ ERRADO — label raw com classes na unha
<div className="flex flex-col gap-gp-xs">
  <label className="text-body-sm font-medium text-fg-default">
    {col.label}
  </label>
  <div>{widget}</div>
</div>
```

Tudo "funcionou" no light mode. No dark mode, Sergio notou que os labels do drawer estavam **MAIS FORTES** que o padrão do form "Novo cliente" (NovoClienteDrawer no mesmo projeto). Comparando:

| Aspecto | Meu (errado) | DS (FormField) |
|---|---|---|
| font-weight | `font-medium` (500) | `font-semibold` (600) |
| Cor light | `text-fg-default` | `text-fg-default` |
| Cor dark | `text-fg-default` (BRANCO forte) | `text-fg-muted` (cinza suave) |
| tracking | (nenhum) | `tracking-[0.01em]` |
| leading | (default) | `leading-none` |

Resultado: label do drawer ficava com peso DIFERENTE e cor MAIS FORTE no dark vs todos os outros forms do projeto. Inconsistência visual silenciosa — só vista em comparação direta com outra tela.

**Causa raiz:** subestimei o pattern do DS. Pensei "label simples, vou só usar `<label>` com classes". Mas `<FormField>` encapsula MUITO mais que cor de label:
- `formFieldLabel()` tv com peso/cor/tracking/leading corretos
- `useId()` auto pra linkar `htmlFor` (a11y)
- `disabled` propaga pro label visual (`opacity-50 cursor-not-allowed`)
- `formFieldRequired()` pra asterisco vermelho
- `formFieldMessage()` pra helper text / error / warning / success com state
- Spacing consistente (`gap-[7px]`)

**Solução:** sempre usar `<FormField>` (ou `<FormFieldInput/Select/Textarea>` se input é nativo). Pra widget custom (registry, slot, etc), `<FormField>` aceita children como render-prop:

```tsx
// ✅ CORRETO — FormField wrap qualquer widget
<FormField label={col.label}>
  {() => (
    <div>{def.renderFilterInput({ ... })}</div>
  )}
</FormField>
```

**Regra derivada:** TODO form / drawer com label + input PRECISA usar `<FormField>` do DS. Não importa se o input é raw, do registry, custom — sempre wrap em FormField. Se o input já é nativo do DS, prefira `<FormFieldInput>` / `<FormFieldSelect>` / `<FormFieldTextarea>` (atalho que combina FormField + Input).

**Regra pra IA:** ao escrever código que tem `<label className=...>` na unha + um input/select abaixo, PARE e considere usar `<FormField>`. 90% dos casos é o pattern correto. Sem prejuízo: FormField aceita widget custom via render-prop.

**Hooks de detecção:**
- `ds-lint-styles.sh` ou similar pode grep por `<label className="text-body-` em arquivos `src/components/**` (provável anti-pattern)
- Reviewer manual: comparar visualmente com NovoClienteDrawer no dark mode — se label do novo componente tem peso/cor diferente, está errado

**Contexto:** qualquer drawer/dialog/page de form. Aplicar retroativamente a componentes existentes se houver tempo. Showcase: `NovoClienteDrawer` é referência canônica do pattern.

---

## [L-024] Forms usam `gap-form-gap` (20px) — token DS dedicado pra spacing entre fields

**Sessão:** 2026-06-09, v0.7.1.

**Problema observado:** ao revisar SacarDialog v0.7.0 e NovoClienteDrawer, ficou evidente que cada formulário escolhia gap diferente entre `FormField` units:

| Form | Gap usado antes | Resultado visual |
|---|---|---|
| NovoClienteDrawer | `gap-gp-lg` (12px) | Apertado, labels colando |
| SacarDialog form "Outra conta" v0.7.0 | `gap-gp-lg` (12px) | Mesma queixa |
| ToolbarSimpleFilterDrawer | `gap-gp-xl` (16px) | Ainda curto pra 5+ filtros |
| KPI cards grid (ClientesFinanceiro) | `gap-gp-2xl` (24px) | OK pra cards, mas viraria solto demais em form |

Sergio notou diretamente: *"o gap entre os inputs poderia ser 20px... deixar isso como padrão criar até um token para isso de componentes spacing"*.

**Causa raiz:** os tokens `gap.*` semânticos (xs=4px / sm=6px / md=8px / lg=12px / xl=16px / 2xl=24px / 3xl=32px) **não têm tier exato em 20px**. Cada implementação escolhia o mais próximo conforme o gosto — gerava inconsistência horizontal entre forms do mesmo projeto.

20px é o sweet-spot:
- 12px (gap-gp-lg) → label colando no campo de cima, leitura prejudicada
- 16px (gap-gp-xl) → ainda apertado quando há helper text embaixo do field
- 20px → respira sem inflar viewport
- 24px (gap-gp-2xl) → desperdício vertical em drawers com 5+ fields

**Solução:** token dedicado `formGap = scale[5]` (20px) em `tokens/brands/default/components/spacing.ts`:

```ts
// tokens/brands/default/components/spacing.ts
export const formGap = scale[5];   // 20px — gap entre fields de formulário
export const componentSpacing = { padCard, padPage, formGap } as const;
```

Transform `to-tailwind-v4.ts` exporta como CSS var:

```ts
result["--spacing-form-gap"] = componentSpacing.formGap;
```

Classe resultante: `gap-form-gap` (20px).

**Regra pra IA (obrigatória em forms):**

```tsx
// ✅ CORRETO — gap-form-gap pra form vertical
<form className="flex flex-col gap-form-gap">
  <FormFieldInput label="Nome" ... />
  <FormFieldSelect label="País" ... />
</form>

// ✅ CORRETO — gap-form-gap pra grid 2-col DENTRO de form
<div className="grid grid-cols-2 gap-form-gap">
  <FormFieldInput label="Agência" ... />
  <FormFieldInput label="Conta" ... />
</div>

// ❌ ERRADO — semântico genérico
<form className="flex flex-col gap-gp-lg">    // 12px
<form className="flex flex-col gap-gp-xl">    // 16px

// ❌ ERRADO — Tailwind literal
<form className="flex flex-col gap-5">        // 20px raw, sem token
```

**Aplica-se a:** drawers (NovoClienteDrawer, ToolbarSimpleFilterDrawer), modais (SacarDialog), páginas de formulário, qualquer section com 2+ `FormField` units empilhados.

**Não aplica a:** cards em grid, lista de chips, icon-to-text spacing, section spacing — esses continuam usando `gap-gp-*` semânticos. O `formGap` é específico pra contexto de form.

**Implementação confirmada em:**
- `SacarDialog` aba "Outra conta" → 3 FormField units (Banco/Agência/Conta) + CardCheckbox final, todos com `gap-form-gap`
- Próximo PR deve migrar NovoClienteDrawer + ToolbarSimpleFilterDrawer pra `gap-form-gap`

**Atualização cascata:**
1. `tokens/.../components/spacing.ts` → adicionar `formGap`
2. `tokens/transforms/to-tailwind-v4.ts` → expor como `--spacing-form-gap`
3. `npm run tokens:tw4` → gerar CSS
4. `.ai/context/tokens/spacing.md` → seção "formGap" + regra obrigatória
5. `.claude/rules/ds-standards.md` → anti-pattern + L-024 no resumo

---

## [L-027] Avatar com `colorHex` deve calcular contraste WCAG — não aplicar `text-white` cego

**Sessão:** 2026-06-09 (descoberta visual pelo Sergio em bancos amarelos).

**Bug observado:** ao usar `<Avatar colorHex="#FAE128">BB</Avatar>` (BB amarelo), o texto branco ficava ilegível — contrast ratio 1.29:1, **falha WCAG AA** (mín. 4.5:1 pra texto normal). Sergio notou: *"o Banco do Brasil é amarelo e o branco por cima ficou um contraste muito ruim"*.

**Causa raiz:** `avatar.tsx` aplicava `text-white` cegamente quando `colorHex` era fornecido (linha original: `className: isHex ? ["text-white", ...] : ...`). Funcionava bem pra cores escuras (Nubank roxo, Bradesco vermelho) — falhava em cores claras (BB amarelo, Itaú laranja médio).

**Solução:** criar utility `getContrastTextColor(hex)` em `src/utils/color-contrast.ts` que:
1. Converte hex → RGB
2. Calcula relative luminance WCAG 2.x (com gamma correction)
3. Calcula contrast ratio (white, bg) vs (black, bg)
4. Retorna `"white" | "black"` — o de MAIOR ratio

Avatar passa a usar:
```ts
const autoTextClass = isHex
  ? getContrastTextColor(colorHex) === "black" ? "text-black" : "text-white"
  : null;
```

**Casos validados (BANKS lookup do ClientesFinanceiroShowcase):**
| Banco | Hex | Antes (white) | Depois (auto) | Ratio after |
|---|---|---|---|---|
| Banco do Brasil | #FAE128 | branco 1.29:1 ❌ | preto 16.3:1 ✅ | AAA |
| Itaú | #EC7000 | branco 2.69:1 ❌ | preto 7.79:1 ✅ | AAA |
| Nubank | #820AD1 | branco 6.20:1 ✅ | branco 6.20:1 ✅ | AA |
| Santander | #EC0000 | branco 4.50:1 ✅ | branco 4.50:1 ✅ | AA |
| Bradesco | #CC092F | branco 6.53:1 ✅ | branco 6.53:1 ✅ | AAA |

**Override:** consumer pode forçar cor específica via `className="text-white"` (cascade override). Não recomendado quando quebra WCAG.

**Regra pra IA:** ao criar componente que aceita `bgColor` arbitrário (Avatar, Chip futuro, Badge custom etc), sempre usar `getContrastTextColor()` em vez de hard-code `text-white`. Aplicar em qualquer slot de texto sobre fundo dinâmico.

**Caso edge:** `bg-bg-brand-subtle` + `text-fg-brand` (semânticos DS) — esses NÃO precisam do utility porque o par foi pré-validado pelo design system (cores casadas em `color-light/dark.ts`). Auto-contrast só pra casos onde `colorHex` é input externo (lookup de marca, persona, etc).

**Arquivos:**
- `src/utils/color-contrast.ts` (novo)
- `src/components/ui/Avatar/avatar.tsx` (refatorado — branch isHex usa auto)
- `src/components/ui/Avatar/USAGE.md` (tabela de casos)

---

## [L-026] TableHeadCell right-aligned: reservar `pr-[60px]` SOMENTE quando sort ativo, não pra hover-only icons

**Sessão:** 2026-06-09 (descoberta visual pelo Sergio em viewport reduzido).

**Bug observado:** colunas right-aligned (ex: `Saldo disponível`) tinham o texto do header artificialmente afastado da borda direita por ~60px, mesmo quando os ícones do hover-stack (sort hint, headMenu kebab) não estavam visíveis.

```
sem hover (errado, antes):  [        Saldo disponível          ]   ← 60px de "vazio" inexplicável
                             ←----- texto deslocado ----→

com hover (esperado):       [   Saldo disponível 1↓ ⋯ ]            ← ícones aparecem em absolute right-pad-md
```

**Causa raiz:** em `table.tsx` (`TableHeadCell`), a `<span>` do label tinha:
```ts
align === "right" && (sortable || headMenu) && "pr-[60px]"
```

O comentário original justificava: *"reserva espaço pro headRightStack pra não ser coberto no hover"*. Mas isso reservava espaço **permanentemente**, mesmo sem hover, **mesmo sem sort ativo**. Os ícones do hover-stack são `display: hidden` por default → não ocupam espaço no layout natural; o `pr-[60px]` introduzia um vazio gratuito.

**Solução:** condicionar a reserva ao estado `isSorted` (quando `sortDirection !== null`):

```ts
align === "right" && (
  // pr só quando sort ATIVO (sort badge + indicator visíveis sempre)
  isSorted && "pr-[60px]"
)
```

- **Sem sort, sem hover** → texto encosta na borda direita (correto)
- **Sem sort, com hover** → ícones aparecem em `absolute right-pad-md` com `bg-bg-table-head`; mascaram texto natural durante hover (aceitável — UX padrão de tabelas)
- **Sort ativo** → `pr-[60px]` preserva texto visível ao lado do sort badge

**Detalhe do design original:** `headRightStack` tem:
```ts
"absolute right-pad-md top-1/2 -translate-y-1/2 z-[1]",
"bg-bg-table-head pl-pad-xs",
```
Ele já tem `bg-bg-table-head` (cobre texto debaixo) e `z-[1]` (sobreposição). Logo, mascarar texto natural no hover é o comportamento intencional.

**Regra pra IA:** ao revisar layout de header com `align="right"`, **não reservar espaço fixo pra ícones hover-only** — só pra elementos sempre visíveis (sort badge ativo, indicator). Para hover-only icons, confiar no `headRightStack` absolute + bg mask.

**Arquivos tocados:** `src/components/ui/Table/table.tsx` — single line change (`(sortable || headMenu)` → `isSorted`).

---

## [L-025] Componente "card variant" de input (CardCheckbox, futuros CardRadio etc) precisa de label htmlFor — não basta clique no checkbox

**Sessão:** 2026-06-09, v0.7.1.

Ao criar `CardCheckbox`, primeiro impulso seria fazer `<button onClick={toggle}>` com `<Checkbox>` interno. Mas isso quebra:

1. **Acessibilidade:** screen reader anuncia "button" em vez de "checkbox" — perde semântica
2. **Form integration:** `<button>` não tem `name`/`value` → não submete em forms nativos
3. **Click target ambíguo:** se checkbox tem `onClick stopPropagation`, clicar no checkbox NÃO toggla — clicar no card sim

**Solução correta:** `<label htmlFor={id}>` wrapping `<Checkbox id={id}>`. O label nativo HTML propaga clique pro checkbox, mantém semântica accessibility, e o checkbox real fica embedado (com `onCheckedChange` controlando state).

```tsx
// ✅ CORRETO — label nativo wrap
<label htmlFor={id} className="card-styles">
  <Checkbox id={id} checked={x} onCheckedChange={setX} />
  <div>
    <span>Label</span>
    <span>Description</span>
  </div>
</label>
```

**Aplicar quando criar:** `CardRadio`, `CardSwitch`, qualquer "form input visualizado como card grande".

---

## [L-028] Componente memoizado com handlers externos → latest-ref pattern (não `useCallback` em massa)

Ao extrair uma linha/item pra `React.memo` (ex: `DataTableRow`), os handlers que vêm
do componente pai NÃO devem ser passados como props diretas (mudam de identidade →
invalidam o memo) nem exigir `useCallback` em cada um (dep-hell + risco de stale deps).

**Pattern correto — latest-ref:**
```typescript
// No pai:
const handlersRef = useRef<RowHandlers>(null as never);
handlersRef.current = { onClick, onKeyDown, ... }; // reatribui TODO render → sempre fresh
<MemoRow handlers={handlersRef} selected={...} editState={...} />  // ref é prop ESTÁVEL

// No componente memoizado — ler `.current` NO CALL-TIME (dentro da closure do evento):
onClick={() => handlers.current.onClick(row, index)}   // ✅ fresh
// ❌ ERRADO: const h = handlers.current (no topo do render) → closures capturam snapshot
//    stale quando o memo bloqueia o re-render. Foi exatamente o bug que o gate do PR4 pegou.
```

**Regras:**
- Handlers (event-time) → ref estável, lido via `.current` DENTRO da closure.
- Dados de RENDER (columns, widths, selected, editState) → props comparadas pelo memo
  (mudam → re-renderiza, como deve). NUNCA ler dado de render via o ref (não re-renderizaria).
- Estado reativo que afeta UMA linha (ex: edit) → bundle num objeto (`{field,isLoading,error}|null`)
  passado só pra linha afetada; as outras recebem `null` (estável) e não re-renderizam.

**Caso real:** `DataTableRow` (v0.8.0). Barreira de re-render — foco/refresh/popover em
outra linha não repinta as demais.

---

## [L-029] Fast-filter de chip nunca usa `<Select open>` aninhado — renderiza lista direta
**Erro cometido:** o `renderFastFilterInput` de boolean/select renderizava um
`<Select open>` (Radix Select forçado-aberto) dentro do `PopoverContent` do chip
aplicado. O listbox do Radix Select ancora no SEU PRÓPRIO trigger (`sr-only`, ~0px)
→ o popover do chip aparecia deslocado pra baixo, com um "dot" residual visível, e o
layer sempre-aberto travava o dismiss por clique-fora (precisava refresh pra fechar).
**Regra derivada:** o conteúdo de um `renderFastFilterInput` (que já vive DENTRO de um
PopoverContent) deve renderizar as opções **direto** — lista de `<button role="option">`
ou checkboxes — nunca um segundo popper aninhado. Usar `FastSingleSelectList`
(`column-types/_filter-field.tsx`) pra single-select e `MultiSelectDropdown` pra multi.
**Contexto:** `boolean-column-type.tsx`, `select-column-type.tsx` (v0.8.x). Vale pra
qualquer column-type novo com fast-filter. Selecionar fecha via `onClose` (passado pelo
DataTable ao `renderFastFilterInput`); clique-fora fecha porque não há layer aninhado.

---

## [L-030] Sheet/popover acionado DE DENTRO de um overlay z-50 precisa de z-index acima
**Erro cometido:** o mobile-sheet (DropdownMenu/Popover com `mobileSheet`) usava wrapper
z-50 e backdrop z-40. Quando acionado de dentro do drawer mobile do MenuSidebar (também
z-50), o sheet **empatava** em z-50 → renderizava atrás de forma intermitente ("aparece
por trás"), e o backdrop z-40 ficava atrás do drawer, sem cobrir nem capturar clique-fora.
**Regra derivada:** a app inteira usa z-50 como "camada-topo". Mobile-sheets (UI transiente
de maior prioridade) devem ficar **acima** disso: wrapper **z-60** (globals.css, regra
`[data-radix-popper-content-wrapper]:has(> [data-mobile-sheet])`) + backdrop **z-[55]**
(dropdown-menu/popover shadcn). Não confiar em empate resolvido por ordem de DOM — é frágil.
**Contexto:** v0.8.x. Surgiu no UserMenu (avatar no rail) dentro do drawer mobile. Combina
com [[L-031]].

---

## [L-031] `DropdownMenu` dentro de drawer/overlay → `modal={false}` + backdrop `pointer-events-none`
**Erro cometido:** o DropdownMenu do UserMenu (acionado dentro do drawer mobile) abria no
`pointerdown` e fechava no `click`/`pointerup` do MESMO toque — "aparece e some", exigindo
2-3 toques. O modo `modal` (default) do Radix injeta dismiss/scroll-lock que corre com o
gesto de abertura; e o backdrop `pointer-events-auto` do sheet montava no meio do gesto e
interceptava o `pointerup`.
**Regra derivada:** DropdownMenu acionado de dentro de outro overlay (drawer, sheet) usa
`modal={false}`. O backdrop do mobile-sheet do dropdown vira `pointer-events-none` — o
dismiss por toque-fora continua funcionando via DismissableLayer (escuta `pointerdown` a
nível de document, independente do backdrop capturar). Popover não sofre (abre no `click`,
gesto completa antes do backdrop montar) → mantém `pointer-events-auto`.
**Contexto:** `AppShell/user-menu.tsx` + `shadcn/dropdown-menu.tsx` (v0.8.x). Combina com [[L-030]].

---

## [L-032] Recharts 3 — caveats de chart que quebram silenciosamente
**Erro cometido:** ao construir os gráficos do showcase (Area/Bar/Line/Pie/Radar/Radial +
28 composições de dashboard), vários comportamentos do Recharts 3 falharam mudos: (1) KPIs
com `text-display-sm`/`text-display-xs` renderizaram **14px** porque esses utilities **não
existem** no DS; (2) `Pie` ignorou `activeIndex`/`activeShape` (saíram da API no v3); (3)
radial empilhado mostrou só 1 segmento; (4) o eixo Y omitiu o tick `0`; (5) `domain` máximo
diferente do maior tick desenhou uma linha-guia duplicada no topo; (6) o grid usava
`border-subtle/60` (no dark = 0.04 alpha) → imperceptível.
**Regra derivada:**
- Tipografia de KPI: usar `text-heading-sm` (24–32) / `heading-xs` (24) / `display-md`
  (28–39). **Nunca** `display-sm`/`display-xs` (inexistentes).
- Pizza com setor ativo → prop **`shape={(props, index) => <Sector/>}`**, não `activeIndex`.
- Radial empilhado/gauge parcial → `<PolarAngleAxis type="number" domain={[0, total]} />`.
- `YAxis`: `interval={0}` força todos os ticks; **`domain` máximo = maior tick**.
- Grid: token dedicado **`chart-grid`** (`--color-chart-grid`, light `gray[200]` / dark
  branco 12%), reescrito no `ChartContainer` pro stroke default `#ccc`. Não passar `stroke`.
- Cor só por token (`chart-1..5`); 2 séries = verde+âmbar; pizza = rampa monocromática da
  brand. Header padrão: `CardHead` (título+subtítulo) ou `KPI_LABEL`+`KPI_VALUE` (30px).
**Contexto:** `src/components/ui/Chart/chart.tsx`, `ChartShowcaseDoc.tsx`, tokens `chart`
(color-light/dark). Catálogo + padrões completos em
`.ai/context/components/chart-patterns.md` e `Chart/USAGE.md` (v0.9.x).

---

### Distribuição / consumidor (lições 2026-06-17, v0.10.0)

**[L-033] Copy-in: integridade se protege por HOOK + regra, não travando arquivo.**
O código é do consumidor (repo dele) — não dá pra impedir edição. O template embute
`.claude/hooks/protect-ds.mjs`: **bloqueia** (exit 2) edição de tema/tokens
(`src/styles/theme/**`) e fundação (`cn`/`tv`/`lucide-types`); **avisa** (exit 1) edição
de componente do DS (drift); libera telas. Regra pra IA do consumidor: **customizar na
COMPOSIÇÃO** (props/variantes + classes na tela), nunca nos tokens/internals.

**[L-034] `example-*` do registry = extração 1:1 do showcase real, nunca "toy".**
Toy inventado (KPIs/colunas que o showcase não tem) fura a "garantia de produção conforme
os showcases". Extração: espelhar a árvore, strip do `AppShell` (vira `<div flex flex-col
h-full min-h-0 gap-gp-2xl>`), inline de `TableDoc` → `_table-data.ts`, rewrite de imports
relativos, manter `@/components/ui|shadcn/*`, validar tsc + render no consumidor.

**[L-035] examples↔preview são cópias paralelas SEM geração automática → drift-check.**
`scripts/examples-drift-check.mjs` guarda hash da fonte (`examples-sources.lock.json`) e
**avisa** quando um showcase muda sem o example re-extraído (roda no `registry:build`).
Re-sync após re-extrair: `--baseline`. Decisão: extração manual + check em vez de
geração/inversão (refatorar a catálogo viva = risco).

**[L-036] Roteamento de intenção no consumidor = SKILL, não AGENTE.**
Skill dispara nativo/barato pela `description` (sem custo de janela de contexto separada).
Agente de roteamento seria caro/lento. `ds-kit` é o front-door (skill); subagente só pra
trabalho pesado em paralelo. (Diferente do orquestrador-agente do próprio DS, multi-etapa.)

**[L-037] Item de registry precisa declarar TODAS as deps reais.**
`@igreen/data-table` não declarava `@tanstack/react-virtual` → DataTable crashava
(Invalid hook call) em consumidor limpo. Itens que importam `@/lib/lucide-types` devem
**embutir** `lib/lucide-types.ts` (`registry:file`) se não puxam via dep que já o entrega
(panel/floating-panel). Validar com render em consumidor real, não só tsc no DS.

**[L-038] Default vindo do `type` (column-type) tem que ser resolvido na FONTE ÚNICA, não por render-site.**
DataTable: `align`/`ellipsis` do column-type (`defaultAlign`/`defaultEllipsis`) só chegavam
ao BODY — que fazia `col.align ?? typeDef?.defaultAlign` localmente
(`data-table-row.tsx`). HEADER (`data-table.tsx`) e FOOTER/totalizer
(`data-table-totalizer-row.tsx`) liam só `col.align` cru → coluna `type:"currency"/"number"`
(defaultAlign "right") alinhava o body à direita, mas header/label e footer/total à esquerda.
**Não reproduzia no showcase** porque lá as colunas setam `align:"right"` explícito; só
aparecia no CONSUMIDOR que confia no default do tipo. Fix: resolver `align`/`ellipsis` no
merge de `effectiveColumns` (`use-data-table-columns.ts`) — o comentário já PROMETIA isso,
o código só herdava `width/sortable/pinned`. **Regra pra IA**: quando um valor pode vir do
column-type como default, resolva-o UMA vez no merge das colunas efetivas (fonte única) —
nunca deixe cada render-site (header/body/footer) re-resolver, senão um esquece e diverge.
Validar SEMPRE no cenário sem o override explícito (= o que o consumidor faz).

**[L-039] Tailwind v4: `border` (cru) é SÓ largura — a cor cai em `currentColor` (branca no dark, preta no light).**
No Tailwind v3 a classe `border` aplicava largura **+** uma cor de borda default. No **v4 não**:
`border`/`border-x`/`border-y`/`border-l|r|t|b` definem apenas `border-width`; sem uma classe
de COR (`border-<token>`) a borda usa `currentColor` (a cor do texto) → no dark fica
**branca grotesca**, no light **preta**, totalmente fora do layout. Caso real: componentes
shadcn instalados via bridge (context-menu, hover-card, menubar, navigation-menu, drawer)
mantiveram `rounded-md border bg-popover` cru → borda branca/preta no popover. O bridge mapeia
`--border`, mas isso só vale quando a classe `border-border-*` é usada; o `border` cru não
consome o token. **Regra pra IA**: SEMPRE que usar `border`/`border-{x,y,l,r,t,b}`, acompanhe
de uma classe de cor de borda do DS — default `border border-border-default` (ou
`border-border-subtle`/`-brand`/`-danger-muted`...). Exceção válida: base de `cva` com `border`
cru SÓ quando TODAS as variantes setam uma cor de borda (ex.: `alert.tsx`). Nunca confie no
"bridge cobre cor" pra borda — o bridge cobre `bg-*`/`text-*`, mas a borda precisa da classe de cor.
Vale também pra `bg-popover`/`text-popover-foreground` etc.: preferir tokens DS explícitos
(`bg-bg-surface`/`text-fg-default`) quando reescrever um componente.

**[L-040] Todo componente FLUTUANTE segue a RECEITA ÚNICA do DS (Popover/DropdownMenu/Select).**
Menus e painéis flutuantes (DropdownMenu, Popover, Select, ContextMenu, Menubar,
NavigationMenu, HoverCard…) devem ter o MESMO visual — senão o app fica inconsistente
(caso real: os menus do batch 4 vieram com os defaults shadcn `bg-popover rounded-md
shadow-md focus:bg-accent` → destoavam do DropdownMenu consolidado). **Receita canônica
(copiar dos consolidados, não inventar):**
- **Superfície**: `relative bg-bg-dropdown border border-border-default rounded-[12px]
  shadow-sh-lg outline-float` + frosted `before:pointer-events-none before:absolute
  before:inset-0 before:-z-10 before:rounded-[inherit] before:backdrop-blur-2xl
  before:backdrop-saturate-150` + `text-fg-default` (painel) ou `text-fg-muted` (menu) +
  `p-pad-sm` (menu). Mobile-sheet (`max-md:rounded-b-none ...`) quando aplicável.
- **Item**: `gap-pad-lg px-pad-lg py-pad-md rounded-radius-sm text-fg-muted outline-none
  transition-colors focus:bg-bg-muted focus:text-fg-default` (+ `[&_svg]` segue a cor).
  Destructive: `text-fg-danger focus:bg-bg-danger-muted`. Ativo/checked:
  `data-[state=checked]:bg-bg-brand-subtle data-[state=checked]:text-fg-brand`.
- **Separator** `mx-pad-xs my-pad-xs h-px bg-border-default` · **Label** `px-pad-lg py-pad-sm
  text-caption-sm font-semibold uppercase tracking-wider text-fg-subtle` · **Shortcut**
  `ml-auto text-caption-sm tracking-wider text-fg-subtle`.
**Regra pra IA**: ao adaptar/criar qualquer flutuante, NÃO deixar os defaults shadcn —
espelhar `dropdown-menu.tsx`/`popover.tsx`. Tooltip é exceção (menor: surface + body-sm,
sem frosted). Default de delay: Tooltip `delayDuration=200`, HoverCard `openDelay=200`
(o default Radix 700 é lento demais).

**[L-041] Trabalho de componente FECHA por PR + link pro gate humano — o pipeline deve garantir, não depender de instinto.**
Antes, as skills de componente (`ds-add-shadcn`, `ds-create-component`, `ds-create-composite`,
`impl-*`) terminavam em `IMPL_PRONTA → DS Reviewer` — o handoff git (branch + commit
descritivo + PR + link) só estava no `/ds-release`. Resultado: a IA dependia de "instinto"
pra abrir PR (na sessão de 16 componentes funcionou, mas não era garantido — risco de
commit órfão em `main` ou "concluir" sem PR/aprovação). **Fix (Regra 8):** todo componente
criado/alterado e toda mudança significativa fecha com **branch + commit descritivo
(o quê + por quê) + push mirror + `gh pr create` + reportar o link**; a IA faz a parte
mecânica e **PARA no merge** (humano aprova; merge/publish/deploy só com autorização
explícita — L-020). Skill compartilhada: `ds-dev/handoff-pr.md`, referenciada pelos
3 commands de componente + orchestrator. **Distribuição** (registry.json + embed + bump)
NÃO vai no PR-de-componente — consolida no `/ds-release` ao fechar o conjunto; vários
componentes = **batches** (1 PR por batch) + 1 release no fim. **Regra pra IA**: nunca
encerrar uma implementação sem PR + link; nunca mergear/publicar sem "pode mergiar/publicar".

---

## Como adicionar nova lição

Quando o Claude cometer um erro não listado aqui:
1. Identificar o padrão do erro
2. Adicionar no formato `[L-NNN]` no final deste arquivo
3. Verificar se o resumo em `.claude/rules/ds-standards.md` precisa ser atualizado
   (é o arquivo auto-carregado — deve ter o resumo de todas as lições)

---

## Política de arquivamento

Quando este arquivo passar de ~50KB, mover para `.ai/status/lessons-archive.md` as
lições já ABSORVIDAS em hook ou regra (ex.: greps do `ds-lint-styles.sh`, prefixos
DS em `ds-standards.md`) — elas continuam valendo, mas o pipeline já as aplica
automaticamente, então não dependem mais de disciplina humana no dia-a-dia.

Manter no ativo as lições que AINDA dependem de disciplina humana (decisões de
arquitetura, padrões Radix/forwardRef, caveats de libs externas, regras de release).
O resumo 1-linha de TODAS as lições (ativas + arquivadas) permanece em
`.claude/rules/ds-standards.md` — é a fonte auto-carregada.
