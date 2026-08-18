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

## [L-004] `outline-none` sem `focus-visible:` prefix

**Erro cometido:** usar `outline-none` na base sem o prefix `focus-visible:`

**Regra derivada:**

```typescript
// ✅
"focus-visible:outline-none";
// ❌
"outline-none";
```

**Contexto:** base de qualquer componente interativo

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

**Heurística pré-commit:** _"Tem `npm publish` ou bump em `package.json.version` no escopo? Se sim → `/ds-release` obrigatório."_

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
  return (
    <div role="group" {...props}>
      {children}
    </div>
  );
}

// ✅ Depois (forwardRef)
const ButtonGroupRoot = forwardRef<HTMLDivElement, ButtonGroupProps>(
  function ButtonGroupRoot({ children, ...props }, ref) {
    return (
      <div ref={ref} role="group" {...props}>
        {children}
      </div>
    );
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

**Heurística:** _"O wrapper tem mais de 1 onClick distinto? Se sim → use Anchor + controlled open."_

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

| Aspecto     | Meu (errado)                     | DS (FormField)                |
| ----------- | -------------------------------- | ----------------------------- |
| font-weight | `font-medium` (500)              | `font-semibold` (600)         |
| Cor light   | `text-fg-default`                | `text-fg-default`             |
| Cor dark    | `text-fg-default` (BRANCO forte) | `text-fg-muted` (cinza suave) |
| tracking    | (nenhum)                         | `tracking-[0.01em]`           |
| leading     | (default)                        | `leading-none`                |

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

| Form                                  | Gap usado antes     | Resultado visual                               |
| ------------------------------------- | ------------------- | ---------------------------------------------- |
| NovoClienteDrawer                     | `gap-gp-lg` (10px)  | Apertado, labels colando                       |
| SacarDialog form "Outra conta" v0.7.0 | `gap-gp-lg` (10px)  | Mesma queixa                                   |
| ToolbarSimpleFilterDrawer             | `gap-gp-xl` (12px)  | Ainda curto pra 5+ filtros                     |
| KPI cards grid (ClientesFinanceiro)   | `gap-gp-2xl` (16px) | OK pra cards, mas viraria solto demais em form |

Sergio notou diretamente: _"o gap entre os inputs poderia ser 20px... deixar isso como padrão criar até um token para isso de componentes spacing"_.

**Causa raiz:** nenhum token `gap.*` **nomeia o papel** "espaço entre campos de formulário", então cada implementação escolhia o degrau mais próximo conforme o gosto — inconsistência horizontal entre forms do mesmo projeto.

20px é o sweet-spot:

- 10px (gap-gp-lg) → label colando no campo de cima, leitura prejudicada
- 12px (gap-gp-xl) → ainda apertado quando há helper text embaixo do field
- 20px → respira sem inflar viewport
- 16px (gap-gp-2xl) → curto pra form; 24px (gap-gp-4xl) → desperdício vertical em drawers com 5+ fields

> ⚠️ **Corrigido em 2026-08-18 — dois erros de fato nesta lição, achados pelo `audit:token-docs`
> no gate de pre-commit da release.** (1) A escala citada era `xs=4 / sm=6 / md=8 / lg=12 /
> xl=16 / 2xl=24 / 3xl=32` — **essa escala nunca existiu**. A real, desde o commit inicial
> (2026-05-18, anterior a esta lição), tem 13 degraus:
> `2xs=2 xs=4 sm=6 md=8 lg=10 xl=12 2xl=16 3xl=20 4xl=24 5xl=28 6xl=32 7xl=48`.
> (2) Daí saiu a afirmação de que os tokens *"**não têm tier exato em 20px**"* — **falsa**:
> `gap-gp-3xl` **é** 20px, e sempre foi. Omitir os degraus intermediários deslocou todos os
> nomes de `lg` pra cima e fez o 20px parecer ausente.
>
> **A conclusão da lição continua válida, por outro motivo.** `gap-form-gap` não existe pra
> *fornecer* um valor que faltava — existe pra **nomear o papel**, que é o que a regra do DS
> manda preferir ("prefira o token de COMPONENTE ao genérico"). Um `gap-gp-3xl` num form
> comunica "degrau 3xl da escala"; `gap-form-gap` comunica "o espaçamento de formulário do
> DS", e pode ser recalibrado sem tocar em quem usa 20px por outra razão.
>
> Os números errados também estavam no `ds-standards.md`, que é **auto-carregado** — corrigidos
> na mesma passada. As fontes canônicas de spacing (`.ai/context/tokens/spacing.md`,
> `coding-standards.md`, `spec-token.md`) sempre estiveram certas, e o resumo 1-linha da própria
> L-024 no `ds-standards` também: o erro vivia só no texto longo daqui e na cópia que saiu dele.

**Solução:** token dedicado `formGap = scale[5]` (20px) em `tokens/brands/default/components/spacing.ts`:

```ts
// tokens/brands/default/components/spacing.ts
export const formGap = scale[5]; // 20px — gap entre fields de formulário
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
<form className="flex flex-col gap-gp-lg">    // 10px
<form className="flex flex-col gap-gp-xl">    // 12px

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

**Bug observado:** ao usar `<Avatar colorHex="#FAE128">BB</Avatar>` (BB amarelo), o texto branco ficava ilegível — contrast ratio 1.29:1, **falha WCAG AA** (mín. 4.5:1 pra texto normal). Sergio notou: _"o Banco do Brasil é amarelo e o branco por cima ficou um contraste muito ruim"_.

**Causa raiz:** `avatar.tsx` aplicava `text-white` cegamente quando `colorHex` era fornecido (linha original: `className: isHex ? ["text-white", ...] : ...`). Funcionava bem pra cores escuras (Nubank roxo, Bradesco vermelho) — falhava em cores claras (BB amarelo, Itaú laranja médio).

**Solução:** criar utility `getContrastTextColor(hex)` em `src/utils/color-contrast.ts` que:

1. Converte hex → RGB
2. Calcula relative luminance WCAG 2.x (com gamma correction)
3. Calcula contrast ratio (white, bg) vs (black, bg)
4. Retorna `"white" | "black"` — o de MAIOR ratio

Avatar passa a usar:

```ts
const autoTextClass = isHex
  ? getContrastTextColor(colorHex) === "black"
    ? "text-black"
    : "text-white"
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
align === "right" && (sortable || headMenu) && "pr-[60px]";
```

O comentário original justificava: _"reserva espaço pro headRightStack pra não ser coberto no hover"_. Mas isso reservava espaço **permanentemente**, mesmo sem hover, **mesmo sem sort ativo**. Os ícones do hover-stack são `display: hidden` por default → não ocupam espaço no layout natural; o `pr-[60px]` introduzia um vazio gratuito.

**Solução:** condicionar a reserva ao estado `isSorted` (quando `sortDirection !== null`):

```ts
align === "right" &&
  // pr só quando sort ATIVO (sort badge + indicator visíveis sempre)
  isSorted &&
  "pr-[60px]";
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

## [L-033] Copy-in: integridade se protege por HOOK + regra, não travando arquivo
O código é do consumidor (repo dele) — não dá pra impedir edição. O template embute
`.claude/hooks/protect-ds.mjs`: **bloqueia** (exit 2) edição de tema/tokens
(`src/styles/theme/**`) e fundação (`cn`/`tv`/`lucide-types`); **avisa** (exit 1) edição
de componente do DS (drift); libera telas. Regra pra IA do consumidor: **customizar na
COMPOSIÇÃO** (props/variantes + classes na tela), nunca nos tokens/internals.

## [L-034] `example-*` do registry = extração 1:1 do showcase real, nunca "toy"
Toy inventado (KPIs/colunas que o showcase não tem) fura a "garantia de produção conforme
os showcases". Extração: espelhar a árvore, strip do `AppShell` (vira `<div flex flex-col
h-full min-h-0 gap-gp-2xl>`), inline de `TableDoc` → `_table-data.ts`, rewrite de imports
relativos, manter `@/components/ui|shadcn/*`, validar tsc + render no consumidor.

## [L-035] examples↔preview são cópias paralelas SEM geração automática → drift-check
`scripts/examples-drift-check.mjs` guarda hash da fonte (`examples-sources.lock.json`) e
**avisa** quando um showcase muda sem o example re-extraído (roda no `registry:build`).
Re-sync após re-extrair: `--baseline`. Decisão: extração manual + check em vez de
geração/inversão (refatorar a catálogo viva = risco).

## [L-036] Roteamento de intenção no consumidor = SKILL, não AGENTE
Skill dispara nativo/barato pela `description` (sem custo de janela de contexto separada).
Agente de roteamento seria caro/lento. `ds-kit` é o front-door (skill); subagente só pra
trabalho pesado em paralelo. (Diferente do orquestrador-agente do próprio DS, multi-etapa.)

## [L-037] Item de registry precisa declarar TODAS as deps reais
`@igreen/data-table` não declarava `@tanstack/react-virtual` → DataTable crashava
(Invalid hook call) em consumidor limpo. Itens que importam `@/lib/lucide-types` devem
**embutir** `lib/lucide-types.ts` (`registry:file`) se não puxam via dep que já o entrega
(panel/floating-panel). Validar com render em consumidor real, não só tsc no DS.

## [L-038] Default vindo do `type` (column-type) tem que ser resolvido na FONTE ÚNICA, não por render-site
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

## [L-039] Tailwind v4: `border` (cru) é SÓ largura — a cor cai em `currentColor` (branca no dark, preta no light)
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

## [L-040] Todo componente FLUTUANTE segue a RECEITA ÚNICA do DS (Popover/DropdownMenu/Select)
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

## [L-041] Trabalho de componente FECHA por PR + link pro gate humano — o pipeline deve garantir, não depender de instinto
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

## [L-042] Componente novo toca 8 superfícies — o agente deve PREVER todas, não só código+USAGE

> **Atualizado 2026-08-08 — a lista era de 7 e virou 8.** A 8ª é o **barrel**
> (`src/components/index.ts`), que define o canal npm e era a única superfície sem
> vigilância nenhuma. `Chart`, `DataList`, `List` e `Toast` ficaram meses com 6 das 7
> fechadas, a doc anunciando "os 42 componentes ui/", e `import { ChartContainer }`
> estourando "not exported" no consumidor npm. Agora é gate:
> `scripts/lib/barrel-completeness.mjs` (no `npm test`), com `BARREL_EXCEPTIONS`
> separado do `DS_EXCEPTIONS` — são eixos diferentes (npm × registry), e os 6 internos
> do example-chat são exceção de registry **e estão** no barrel.

Reincidência: ao criar o `Toast` (v0.12.0), ficou faltando registrá-lo no **catálogo do CLI**
(`cli/templates/default/CLAUDE.md`) — só foi pego porque o humano perguntou. Mesmo padrão do
`DOC_PAGES` (o Toast renderizou em branco até `"toast"` ser adicionado ao array de páginas válidas
do `App.tsx`). **Causa:** o pipeline cobria USAGE + inventory + registry (hook `ds-inventory-check`),
mas **não o catálogo do CLI nem o registro de showcase (DOC_PAGES)** — e não havia uma "Definição
de Pronto" única que listasse TODAS as superfícies. **As 8 superfícies de um componente:**
(1) código `ui/<Nome>/` ou `shadcn/<nome>.tsx`; (2) USAGE (`ui/<Nome>/USAGE.md` ou 1 linha no
índice `shadcn/USAGE.md`); (3) `inventory.md` (+contador); (4) **showcase** = `<Nome>Doc.tsx` +
`App.tsx` (import + render + **`DOC_PAGES`**) + `doc-nav-data.ts`; (5) `registry.json` (+build+embed);
(6) **vocabulário do consumidor** (`cli/templates/default/_claude/rules/ds-components.md` +
bump `cli/package.json` + republicar); (7) changelog `updates-data.ts`; (8) **barrel**
`src/components/index.ts` (canal npm — ver a nota de 2026-08-08 acima). **Fix:** (a) hook
`ds-inventory-check` acusa "no registry mas fora do vocabulário do consumidor" **e** "DocPage existe
mas não roteada no `App.tsx`/`DOC_PAGES` ou sem nav" (pega o render-em-branco); (b) `handoff-pr.md`
ganhou a tabela "Definição de Pronto" (7 na época, **8 hoje** — o barrel entrou em 2026-08-08); (c) `pre-commit-check` 2.8 e `release.md` 6.2b
cobram a superfície 6. **Cadência:** 1–4 no PR do componente; 5/6/7 no `/ds-release` (mas anotar no
PR body que faltam). **Regra pra IA:** componente distribuído (no registry) SEM estar no vocabulário
= gap — qualquer toque em `cli/**` exige bump + `npm publish` manual.

> **Onde mora a superfície 6 (atualizado 2026-07-30).** Era a lista de nomes no
> `cli/templates/default/CLAUDE.md`; virou a rule auto-carregada
> `_claude/rules/ds-components.md` (nome **+ critério de escolha**, agrupado por tarefa) —
> uma lista de nomes diz que o componente existe, não quando preferi-lo ao vizinho. O
> `CLAUDE.md` do template segue citando nomes (mapa de intenção, `example-*`), então hook e
> `distribution-debt.mjs` medem a **união** dos dois arquivos: exigir os dois reprovaria
> componente que ESTÁ distribuído.

---

## [L-043] Tailwind v4 INLINA o valor de `shadow` da `@theme` na utility — `.dark { --shadow-* }` é código morto
Diferente de cores (que viram `var(--color-*)` na utility e são dark-aware), os tokens de
**shadow** num `@theme` normal são **inlinados** literalmente na classe
(`.shadow-sh-md { box-shadow: <valor light> }`). Logo, sobrescrever `--shadow-sh-md` em
`.dark {}` **não tem efeito** — no dark a sombra continua com o valor light. Como o `md` light
usa cinza-claro (`rgba(145,158,171,…)`), no fundo escuro virava um **"halo claro"** (mesma raiz
do bug antigo do Tooltip). **Sintoma:** `getComputedStyle(html)['--shadow-sh-md']` retorna o valor
dark, mas o `box-shadow` computado do elemento é o light → prova do inline. **Fix (transform
`to-tailwind-v4.ts`):** indireção — `@theme inline { --shadow-sh-*: var(--ds-sh-*) }` (a utility
passa a referenciar a var) + `:root { --ds-sh-*: <light> }` e `.dark { --ds-sh-*: <dark> }` (vars
comuns que o cascade FAZ flipar). **Regra pra IA:** qualquer token que precise mudar no dark e seja
INLINADO pelo Tailwind v4 (shadow, drop-shadow, text-shadow) → usar `@theme inline` + var de
indireção, nunca confiar em `.dark { --shadow-* }` direto. Mudança é FOUNDATIONAL (rebake no release).

---

## [L-044] Hooks bash dependem de jq + path forward-slash → no Windows ficam CEGOS

Os hooks PostToolUse (format-on-save, ds-lint-styles, ds-inventory-check, etc) extraíam
`file_path` via `jq`. **`jq` não existe no Git Bash/Windows** → file_path vazio → todos
`skip` silencioso. Pior: os que tinham fallback node casavam path com `/` enquanto o
harness no Windows manda `\` → extração ok mas matching falhava sem log. **Resultado: a
rede de segurança (lint L-001..L-007, registry/L-042, tokens) ficou no-op uma sessão
inteira — o gap de registry do DataList passou batido.** **Fix:** fallback `node` (sempre
presente em projeto JS) pra parsear o JSON + `tr '\\' '/'` antes de qualquer matching de
path (padrão que o `ds-tokens-check` já tinha). **Regra pra IA:** hook que depende de
ambiente externo (jq, python) PRECISA de fallback + self-test; ao auditar pipeline,
checar `.ai/scratch/hook-log.txt` — só `skip` = hook morto.

## [L-045] Hierarchical connector: coluna pass-through usa `ancestorHasNext[i+1]`, não `[i]`

No tree-as-list, a coluna de indent `i` (x = i·indent) hospeda o elbow de nós em **depth
i+1**, então a continuação vertical da guia depende do ancestral em depth i+1 ter irmão.
Usar `[i]` (off-by-one) era mascarado nos roots não-últimos (ancestorHasNext[0]=true), mas
no **último root** virava false → a guia sumia só no último ramo. **Regra pra IA:** bug que
"só aparece no último/primeiro item" geralmente é off-by-one mascarado por um valor que
coincide nos demais — teste sempre o caso de borda (último root, lista vazia, 1 item).

## [L-046] DataList: padrões de tela (fillHeight, measureElement, folha sem chevron)

(1) **Scroll no container, não na tela**: prop `fillHeight` faz a DataList ocupar a altura
do pai e só a lista rolar (toolbar/chips/bulk fixos) — pai com altura + `className="flex-1
min-h-0"`. Não combinar com `virtualized`. (2) **Virtualizado**: usar `measureElement` —
sem ele o `estimateItemSize` reserva mais que a altura real e o excedente vira "gap" falso.
(3) **Nó-folha** (sem filhos) no hierarchical NÃO recebe placeholder de chevron
(`expandToggle={undefined}`, igual ao modo conectores) — senão um espaço vazio empurra o
conteúdo. (4) `branchHighlight` (`block`/`active`) só em `layout="hierarchical"`; ramo ativo
usa o MESMO painel do block (não cor de marca fraca).

## [L-047] Nova skill builder toca 4 superfícies de roteamento — DoD de skill

Criar uma skill builder (ex: `list-builder`) não basta criar os `.md` — precisa registrar
em: (1) **orchestrator** (`.claude/agents/orchestrator.md` tabela de roteamento), (2)
**ds-kit** consumer (`cli/templates/default/_claude/skills/ds-kit/SKILL.md` se for
distribuída), (3) **command(s)** (`/ds-create-<x>`), (4) **front-door** se houver
desambiguação. O smoke test pegou que o orchestrator não tinha a linha de lista — sem o
teste, um pedido via agente orquestrador não acharia o builder. **Regra pra IA:** ao criar
skill/command, rodar um smoke test (invocar de verdade) + checar os 4 pontos de registro.

## [L-048] `block-rm-rf` casa o padrão em qualquer ponto do comando (inclusive commit message)

O hook greps `rm -rf <path>` no comando inteiro → **falso-positivo quando a string aparece
dentro de uma commit message** (heredoc do `git commit -m`). Bloqueou um commit cuja
mensagem citava `rm -rf src/`. **Workaround imediato:** não escrever `rm -rf <path>` literal
em mensagens/echos. **Melhoria do hook (backlog):** ignorar quando o comando começa com
`git commit`/`git`, ou só casar `rm` como token inicial de um segmento de comando.

## [L-049] registryDependency pode ficar "dangling" pra componente bundlado em outro item

`registry-add-item.mjs` gera registryDependencies a partir dos imports — `data-list`
importa `@/components/ui/TableToolbar`, então gerou `@igreen/table-toolbar`. Mas o
TableToolbar **não tem item próprio** no registry: é **bundlado** dentro do `data-table`
("acoplamento circular"). Logo `@igreen/table-toolbar` é um dep que **não resolve** →
`igreen:add data-list` quebraria. Fix: remover o dep e confiar no `@igreen/data-table`
(que o data-list já depende e que traz os arquivos do TableToolbar embutidos). **Regra
pra IA:** ao adicionar/editar item no registry, valide que cada `registryDependency`
existe como item OU é bundlado por outro dep já listado — `npm run distribution:debt`
(novo) + conferir os deps gerados pelo `registry-add-item` (ele não sabe o que é bundlado).

## [L-050] Showcase API Reference: `PropsTable` direto, nunca dentro de `ExampleSection`

`ExampleSection` é o **card de preview** (ring + shadow + min-h + centralização). `PropsTable`
**já tem superfície própria** (ring). Renderizar `<PropsTable>` dentro de `<ExampleSection>`
vira **card-dentro-de-card** — visual quebrado (caso real: API Reference do TableToolbarDoc).
Pattern correto (igual `SliderDoc`): `SectionH2 "API Reference"` → `PropsTable` **direto**;
pra 2+ tabelas, cada uma num wrapper `<div className="mb-gp-4xl"><h3 text-title-lg/><p/><PropsTable/></div>`.
**Segundo erro do mesmo caso:** usei vários `SectionH2` pras sub-tabelas e elas coladas —
`SectionH2` tem `mb-12` mas **sem margin-top**, então tabela seguida de heading cola. Sub-seções
de API usam `h3 text-title-lg` (não `SectionH2`) + wrapper `mb-gp-4xl` pro espaçamento.
Doc atualizada: `.ai/context/doc-guide.md` → "API Reference — padrão obrigatório". **Regra pra
IA:** ao documentar API no showcase, `PropsTable` nunca aninhado; espelhar `SliderDoc`.

## [L-051] Intenção de "adicionar filtro" em tabela/lista → filtro nativo, nunca form acima

Vibe-coders (gerando via IA) pedem "um select de status em cima da tabela" / "filtrar por
período" e a IA monta **form/selects soltos acima da grade** — feio, código extra, fora do
padrão. A tabela/lista do DS já tem **motor de filtro reativo** (chips clicáveis/editáveis,
zero código). Roteamento que as skills (crud-builder/list-builder/ds-kit, repo + CLI) devem
sugerir automaticamente nessa intenção:

- **por COLUNA/campo** (status/categoria/tipo/data) → filtro nativo (`enableColumnFilter`/
  `filterFields`); quer já filtrado → **pré-aplicar** (`defaultViews`/`presetView`/`filterModel`
  no DataTable; `views`/`filterModel` no DataList) → abre com **chip aplicado**, editável. Pode
  pré-setar vários de uma vez.
- **toolbar.actions/toolbarActions SÓ pra caso pequeno e simples não-coluna** (ex.: data/
  período, escopo) — **label curta, máx ~2**. Mexe com coluna, grande/complexo ou muitos →
  **não** use o toolbar (foi o gatilho de criar o slot, mas é pra casos simples).
- **muitos ou ligados a coluna/campo** → sempre nativos **pré-aplicados (chips)**. Nunca
  empilhar campos.
  Regra de ouro: **filtro é recurso da tabela/lista, não UI na unha.** Coberto nas 6 superfícies:
  crud-builder + list-builder (repo `.claude/skills` e CLI `cli/templates/default/_claude/skills`)

* ds-kit (CLI) + esta lição/`ds-standards`.

---

## [L-052] DataTable view Lista — paginação é opt-in (`listConfig.paginated`)

A view Lista do `DataTable` (`viewMode="list"` + `listConfig`) **mostra todas as rows
processadas por padrão** (filter+search+sort, sem slice de paginação — igual ao kanban).
Isso surpreende quando a tabela pagina mas a lista rola "infinito": o usuário liga o toggle
Lista e vê centenas de cards.

Fix (v0.21.0): prop opcional **`listConfig.paginated?: boolean`**. Quando `true` e a lista é
flat, o corpo passa a usar `rowsToRender` (página atual, mesma paginação da tabela) e o
footer de paginação renderiza também na view Lista. Default `false` (comportamento antigo,
não-breaking). Ignorado quando `hierarchical` (árvore desliga paginação por natureza).

Implementação: `data-table.tsx` (fonte das rows da lista escolhe `rowsToRender` vs
`rowsAllPagesProcessed` por `cfg.paginated`; condição do footer libera a lista flat
paginada) + `data-table.types.ts` (prop) + `USAGE.md`. Documentado nas skills
`crud-builder/generate.md` (repo + `cli/templates/default/_claude`). `list-builder`/`DataList`
**não** são afetados (componente diferente).

**Regra pra IA**: ao gerar tela com toggle Tabela↔Lista e volume de linhas relevante,
passar `listConfig.paginated: true`.

---

## [L-053] autoFit do DataTable — piso pelo header, fill proporcional, re-measure no toggle

3 comportamentos do autoFit corrigidos (v0.22.0) porque incomodavam na prática:

1. **Piso de cada coluna inclui o HEADER inteiro** (texto do `headerName` + ícone de tipo +
   reserva de sort/menu), não só o conteúdo das células. Antes, quando o conteúdo era mais
   estreito que o título, o **título** caía em "..." — e título é informação importante.
2. **Preenchimento proporcional.** A sobra é distribuída **proporcionalmente** entre as
   colunas (clamp por `maxWidth` + redistribuição do resíduo), em vez de uma coluna virar
   "gigante". **`col.width` deixou de ser largura fixa e virou BASE/piso** que entra no
   rateio — senão a única coluna sem `width` absorvia toda a sobra (caso real: tela Cidades,
   "Cidade" com 1321px). Travar de fato = `width` + `maxWidth` iguais (ou `type` fixo).
3. **Re-measure no toggle de view.** O corpo desmonta na view Lista; ao voltar pra Tabela o
   ResizeObserver continuava preso ao nó antigo (ref estável) e reaplicava larguras stale.
   Fix: `recalcKey: viewMode` no `useColumnAutoWidth` re-instala o observer e re-mede.

Arquivos: `use-column-auto-width.ts` (recalcKey), `calculate-column-widths.ts` (piso header +
fill proporcional), `use-data-table-controller.ts` (passa viewMode). Coberto nas skills
crud-builder (repo + `cli/templates`) + USAGE do DataTable.

**Regra pra IA**: prefira NÃO fixar `width` (autoFit distribui); `width` é base/piso, não
trava (travar = `width`+`maxWidth`). Hook de ResizeObserver preso a ref estável precisa de
`recalcKey` quando o nó observado desmonta/remonta sem trocar a ref.

---

## [L-054] DataTable — viewMode "sticky" ao trocar de visão + `allowCreateView` read-only

Dois ajustes de saved-views do DataTable (v0.23.0), ambos vindos de uso real na tela Cidades
(2+ visões + toggle Tabela/Lista):

1. **viewMode "sticky" ao aplicar visão.** Antes, aplicar qualquer visão (preset ou clicar
   "Default") forçava `setViewMode(state.viewMode ?? "table")` — então com 2-3 visões, mudar
   uma pra Lista e clicar em outra **voltava pra Tabela** (a outra visão não definia viewMode
   → caía no fallback `"table"`). Comportamento errado: trocar de visão flipava a view que o
   usuário escolheu. Fix: `applyViewState` só chama `setViewMode` **se `state.viewMode !==
   undefined`** (a visão define explicitamente); `applyDefault` (branch persistId) **não**
   reseta viewMode. Resultado: a view (table/list/kanban) é "sticky" — só muda quando o
   preset declara `viewMode` de propósito. Arquivo: `use-data-table-controller.ts`.
2. **`allowCreateView={false}` (opt-out, default `true`).** Esconde o botão "+" das visões +
   o modal de criar visão (`TableToolbarViews` ganhou prop `allowCreate`). Pra telas que só
   oferecem `defaultViews` pré-definidas (abas nativas read-only), sem o usuário salvar visões
   próprias. Não-breaking (default mantém o "+"). Arquivos: `data-table.types.ts` (prop),
   `data-table.tsx` (`allowCreate={props.allowCreateView !== false}`),
   `parts/table-toolbar-views.tsx` (gate de render do ViewsPopover + AddViewModal).

**Regra pra IA**: ao montar tela com `defaultViews` como abas fixas, passe
`allowCreateView={false}`; e só declare `viewMode` num `presetView` quando aquela visão DEVE
forçar uma view específica — senão deixe sem (sticky). Coberto nas skills crud-builder (repo +
`cli/templates`) + USAGE do DataTable/TableToolbar + showcase DataTableDoc.

---

## [L-055] Composições de tela viram receita canônica (não componente novo) + `KpiDelta signed`

Quando um conjunto de telas converge num **padrão de composição** (dashboard, KPI-group
"Painel do Líder", fusão KPI+evolução, chart-card, card dividido, distribuição de
tabela/lista), a forma de "deixar padrão" no DS **não é** criar um componente rígido pra
cada — é **capturar a receita** usando os primitivos existentes (`Kpi`/`KpiGroup`/`Chart`/
`Panel`/`DataTable`/`DataList`) numa fonte única (`.ai/context/components/dashboard-patterns.md`)
que showcase + exemplos + builders (crud/list/dashboard) referenciam, e distribuir isso via
CLI (ds-kit/catálogo + example pages). Componentiza-se só o gap real de componente — no caso,
`KpiDelta` ganhou `signed` (deriva tom verde/vermelho + seta do SINAL do value; opt-in,
backward-compat; `tone`/`direction` explícitos vencem). Motivo: a qualidade que levamos ~1
sessão pra atingir no consumidor estava presa em ~13 reimplementações inline lá, sem voltar
pro DS/exemplos/skills — então um consumidor novo (via CLI) não a alcançava sozinho. Receita
> componente quando a composição varia; componente só pro átomo estável. Regra pra IA: ao
padronizar "esse tipo de tela", escreva/estenda o pattern doc + aponte builders/exemplos pra
ele — NÃO crie um mega-componente de página.

---

## [L-056] Consumidor via submódulo não recebe o kit de IA — `ds-link` projeta; skills precisam de modo submódulo

O Claude Code só auto-descobre `.claude/` na **raiz do cwd** (+ `~/.claude`); **não desce**
pra `<submodulo>/.claude/`. Então quem consome o DS como git submódulo (subpasta) fica **sem**
as skills/commands do kit — ao contrário do consumidor npm, que recebe o payload copiado no
scaffold. Zero-touch é impossível (submódulo é apontamento externo à árvore que o Claude
varre) — o melhor é reduzir a **uma** ação idempotente. Solução: `scripts/ds-link.mjs`
(`npm run ds:link`) projeta o **mesmo payload consumidor** (`cli/templates/default/_claude`)
pro `.claude/` do pai. Três aprendizados que valem pra futuras mudanças:

1. **A lógica de "modo" mora no PAYLOAD, não nas skills do repo.** O que aterrissa no
   consumidor são as skills de `cli/templates/default/_claude/skills/*` — é lá que o 3º modo
   "submódulo" foi adicionado (crud/list/dashboard + ds-kit), lendo `.claude/ds-config.json`
   (gerado pelo ds-link) pra resolver `importBase` e **não** rodar `igreen:add` (não há
   registry no submódulo; componentes/exemplos já estão em `<dsPath>/src`).
2. **Nem todo payload serve pro submódulo.** `hooks/` + `settings.json` são específicos de
   copy-in (protect-ds/ds-lint miram `src/components/**`, layout que o submódulo não tem) →
   ds-link **exclui** esses; projeta só o path-agnóstico (commands/skills/rules).
3. **Detectar o alias, não assumir.** O import do submódulo é o alias do consumidor pra
   `<dsPath>/src` (`@`, `@ds`, etc.) — ds-link varre tsconfig/vite e cai em `@ds` com aviso.
   Manifest (`.claude/.ds-linked.json`) torna re-run/`--unlink` limpos (inclui prune de dirs).

Regra pra IA: paridade de experiência entre canais de distribuição (npm CLI vs submódulo) é
requisito, não bônus — ao mexer no kit do consumidor, lembre que o submódulo é um 3º canal
que consome o MESMO payload por um caminho diferente. Doc humana: `SUBMODULE-SETUP.md`.

## [L-057] `container` é a ÚNICA exceção do duplo-prefixo — e a doc ensinava a classe morta

Todo namespace do DS dobra o prefixo (`--spacing-gp-*` → `gap-gp-md`, `--radius-radius-*` →
`rounded-radius-base`, `--shadow-sh-*` → `shadow-sh-md`) para não colidir com o Tailwind
nativo. **`container` não** — o transform emite `--container-md`, que no Tailwind v4
**sobrescreve** a escala nativa de max-width. Logo a classe correta é **`max-w-md`** (768px
do DS, não os 448px do Tailwind), e **`max-w-container-md` não existe**.

Mesmo assim, 11 arquivos de doc/skill/README ensinavam `max-w-container-*` como a forma
certa, e havia 7 usos reais no código — inclusive `max-w-container-tooltip-lg` no popover
"Ler mais" do DataTable (**tooltip sem max-width em todo consumidor**) e no
`cli/templates/default/src/App.tsx`, ou seja **todo app novo criado pelo CLI nascia com uma
classe morta**.

Por que passou tanto tempo: no Tailwind v4 uma classe cujo token não existe **não gera erro**
— simplesmente não emite CSS. Não quebra build, não quebra `tsc`, não aparece em lint. Só
some na tela. Foi encontrada por auditoria que cruza as classes usadas contra o tema gerado
(`src/styles/theme/tailwind-theme.css`), e confirmada no CSS buildado: `.max-w-container-` →
0 ocorrências.

Por que NÃO "consertamos o transform" para o duplo-prefixo funcionar: 195 usos de
`max-w-{xs,sm,md,lg,xl,full}` (122 no próprio DS, 41 no academy, 19 no eventos, 11 no VO)
dependem hoje do override. Passar a emitir `--container-container-*` faria todos reverterem
em silêncio pro valor nativo — `max-w-sm` de 640px para 384px em 79 lugares. O código estava
certo; a doc, errada.

Regra pra IA: (1) `max-w-md`/`max-w-tooltip-lg`/`max-w-modal-sm` — **nunca** `max-w-container-*`;
(2) ao documentar um namespace, valide a classe contra o tema **gerado**, não contra a
convenção presumida; (3) classe DS que "não faz nada" na tela = suspeite de token inexistente
antes de suspeitar de especificidade.

---

## [L-058] Componente com 1 de 7 superfícies some num merge — e ninguém percebe

O `ChoroplethMap` foi criado como "gap do Rankings", ficou no repo com **código + USAGE +
export no barrel** — e **nada mais**: sem `inventory.md`, sem doc page, sem rota no
`App.tsx`, sem `registry.json`. Um merge de reorganização (a fase de infra do registry
shadcn) o deixou de fora da `main` e **nenhum sinal disparou**: não havia entrada de
inventário pra ficar órfã, nem página de showcase pra renderizar em branco, nem item de
registry pra quebrar. O único a notar foi um app em produção que o importava — meses
depois, ao tentar bumpar o submódulo.

Duas coisas que isso ensina, além da L-042:

1. **As superfícies não são burocracia — são detecção.** Cada uma é um lugar onde a
   ausência do componente vira erro visível. Com só o barrel, o componente é invisível
   para todo mecanismo do projeto (o hook `ds-inventory-check` inclusive) e depende de
   alguém lembrar que ele existe. (A recíproca também mordeu, e virou a 8ª superfície:
   componente em **tudo menos** o barrel some do canal npm sem sinal nenhum.)
2. **Deps do componente moram no DS, não no consumidor (L-037 de novo).** O
   `ChoroplethMap` usava `d3-geo` e `topojson-client` sem declarar nenhum dos dois no
   `package.json` do DS — funcionava só porque o Rankings, por coincidência, declarava.
   Um componente que só compila na árvore de um consumidor específico não é um
   componente do DS; é código emprestado.

Regra pra IA: ao restaurar ou criar componente, feche as superfícies **antes** de
considerar pronto — e rode `grep` das deps do arquivo contra o `package.json` do DS. Se
uma dep real não estiver declarada lá, PARE: ou declara, ou o componente não pertence ao
DS.

Corolário sobre **receita vs componente** (L-055): quando a `main` já resolve o caso
simples por receita (mapa fixo por paths inline, zero dep), o componente pesado só se
justifica pelo caso que a receita **não** faz — aqui, topologia arbitrária + drill-down
para municípios. Documente o "quando NÃO usar" no USAGE, senão o consumidor puxa 2 deps
para desenhar um mapa parado.

---

## [L-059] Gate mecânico só pra regra errada independente de contexto — L-004/L-007 saem do grep

Medição dos greps antigos de `ds-lint-styles.sh` contra os **40** `*.styles.ts` do repo
(baseline antes da extração pro módulo `scripts/lib/ds-lint-patterns.mjs`, ver
`.ai/specs/pipeline-governance-ci.md` §1.1): **51 hits, dos quais 50 eram ruído** e só 1
era violação real. Breakdown:

1. **33 hits** (31 de pad/space + 2 de gap) eram `p-0`/`py-0`/`px-0`/`!gap-0` — a
   alternação numérica incluía `0`, mas **não existe token DS pra zero** (ninguém escreve
   `p-sp-none`); são resets legítimos, comuns com `!` sobre base de um shadcn.
2. **9 hits** eram `rounded-full` — mas `rounded-full`/`rounded-none` são
   **numericamente idênticos** aos tokens DS (`--radius-radius-full: 9999px`,
   `--radius-radius-none: 0px`), logo **nunca podem causar defeito**. A divergência real
   está em `rounded-sm/md/lg/xl/2xl/3xl` (nativo `rounded-lg` = 0.5rem vs DS 0.625rem) —
   essa É a razão de existir da regra. O `Button` usava `!rounded-full` e estava sendo
   flagado: o componente-flagship "violando" uma regra ampla demais.
3. **8 hits** eram `outline-none` em `table-toolbar.styles.ts` — mas a affordance de foco
   estava visível nos 8 casos, via `focus-visible:shadow-sh-ring` no próprio elemento ou
   `focus-within:shadow-sh-ring` no **wrapper** (`toolbarSearch`), que vive num bloco
   `tv()` diferente. Um grep não enxerga isso.

**A classificação que sustenta a decisão:** uma regra só pertence a um gate mecânico
(grep/CI) se ela está errada **independente de contexto** — um valor que diverge
numericamente do token, ou uma classe que não existe (L-001, L-002, L-003, L-005). Uma
regra que exige contexto cross-elemento (**L-004**: o ring/foco pode estar no wrapper,
possivelmente em outro bloco `tv()` ou outro arquivo) ou julgamento de intenção (**L-007**:
qual preset tipográfico é o certo pro caso) **não** pertence — forçá-la no grep produz
exatamente a taxa de falso-positivo que faz o time desligar o check. L-004 e L-007 saem do
conjunto que `ds-lint-styles.sh`/CI cobrem; continuam válidas como lição, mas viram
trabalho de revisão semântica (reviewer humano ou skill), não linha de grep.

Corolário sobre o ratchet: julgar só as linhas que o `git diff -U0` **adicionou** (não o
arquivo inteiro) foi o que tornou o gate viável de ligar — 14 dos 40 arquivos de estilo já
carregavam pelo menos 1 hit de débito legado (35%); um gate whole-file teria reprovado
qualquer PR que apenas tocasse um desses arquivos por outro motivo. Débito legado fica
congelado onde está; o que o ratchet impede é a fila crescer.

Regra pra IA: antes de propor uma regra nova pro gate mecânico, pergunte "essa violação
está errada em qualquer arquivo/elemento, sem precisar olhar mais nada?". Se a resposta
depende de outro elemento (wrapper, arquivo irmão) ou de intenção do autor → mantenha como
lição de revisão semântica, não como entrada em `scripts/lib/ds-lint-patterns.mjs`.

---

## [L-060] Texto que descreve o mecanismo errado é PIOR que texto nenhum — 4 instâncias numa sessão

Comentário de código, tabela de doc e mensagem de erro são load-bearing: quem lê **para de
investigar**. Quando o texto afirma algo falso, ele não é ruído neutro — ele blinda o defeito.
Quatro instâncias na sessão de 2026-07-29, todas achadas por revisão adversarial, nenhuma por
teste ou CI:

1. **`ci.yml` jurava que rascunho não escapava.** O comentário dizia "Ninguém escapa — draft não
   mergeia, então pra mergear tem que sair de rascunho e aí o check vale". A premissa é verdadeira
   e a inferência é falsa: `ready_for_review` **não** está no conjunto default de atividades do
   `pull_request` (`opened`, `synchronize`, `reopened`), então sair de rascunho não dispara run
   nova e a run verde do rascunho — com o step pulado — satisfaz o required check. O guard era
   **bypass permanente**, não adiamento. O comentário é o que impediria a próxima pessoa de
   reexaminar.
2. **7 docs anunciavam um formatador que nunca rodou** (ver [L-061]). Duas delas
   (`ds-update.md`, `update-changelog.md`) mudavam **comportamento de agente**: diziam "o hook
   `format-on-save.sh` roda automaticamente", então o agente não se preocupava com formatação.
3. **Mensagem de erro mandava recriar a duplicação que a task acabou de eliminar.** Depois de
   extrair a lista de exceção pro módulo único `scripts/lib/ds-exceptions.mjs`, o
   `distribution-debt.mjs` continuou dizendo "inclua no IGNORE deste script" — o dev que
   obedecesse reintroduziria a lista local que a extração matou.
4. **`review-component.md` se contradizia dentro do mesmo arquivo** — exigia `.types.ts` sem
   qualificar numa linha e, algumas linhas depois, dizia que não é o padrão de todos (medido: 7 de
   42 componentes com tipos inline).

**Por que escapa de tudo:** nenhum desses casos quebra build, tsc, teste ou lint. O texto é o
único artefato que ninguém executa. Só revisão semântica pega — e só se o revisor **conferir a
afirmação contra o mecanismo**, em vez de assumir que quem escreveu sabia.

Regra pra IA: (a) ao escrever comentário/doc que **afirma** que um mecanismo tem certa garantia,
verifique a garantia antes de escrever — se não puder verificar, descreva o que o código faz, não
o que você acha que ele garante; (b) ao **mover** uma fonte de verdade, faça grep das mensagens de
erro e docs que apontam pro lugar antigo (elas viram instruções pra desfazer a mudança);
(c) ao revisar, trate cada frase de garantia como afirmação testável — as 4 acima foram achadas
lendo o comentário e perguntando "isso é verdade mesmo?".

---

## [L-061] No-op por dependência ausente ≠ desligado — está ARMADO

`.claude/hooks/format-on-save.sh` rodava `npx --no-install prettier` num projeto onde `prettier`
**nunca esteve** no `package.json`. Resultado: no-op silencioso desde sempre — o `CLAUDE.md`
anunciava 4 hooks PostToolUse ativos e um deles nunca tinha rodado uma vez. Isso é chato, mas o
problema real é outro: **a dependência que falta pode aparecer.**

Foi o que aconteceu. Um `npx prettier` usado pra validar YAML no meio da onda de correção populou
o cache do npx; no Edit seguinte o hook ligou sozinho e reformatou `impl-igreen.md` inteiro,
mutilando pseudo-código de uma skill. Ninguém pediu formatação, ninguém mudou config, e o gatilho
foi um comando de leitura não relacionado.

**A distinção:** um mecanismo desativado por **decisão** (removido do `settings.json`) não pode
voltar sozinho. Um mecanismo inerte por **dependência ausente** volta assim que a dependência
existir — e como ele nunca rodou, ninguém sabe o que ele faz quando roda. Decisão do mantenedor
(2026-07-29): não adotar prettier; hook e script **removidos**, não deixados inertes, mais nota ⛔
anti-reintrodução no `CLAUDE.md`/`ds-standards.md` com o motivo.

Regra pra IA: (a) hook/check que depende de binário externo tem que **declarar a dependência** no
`package.json` ou **falhar visível** ("skip: prettier ausente" no stderr, não só no log) — no-op
mudo é o pior dos três; (b) ao decidir não usar um mecanismo, **remova**, não deixe inerte;
(c) ao encontrar um mecanismo que "não faz nada", pergunte se ele está desligado ou **armado sem
munição** — a segunda hipótese é bug latente, não código morto.

---

## [L-062] `--diff-filter=A` é CEGO a rename — foi como o `ChoroplethMap` sumiu

O `showcase-check.mjs` (v1, 2026-07-29) detectava componente novo com
`git diff --name-status --diff-filter=A`. Rename de pasta vem como status **`R`**, não `A` — logo
`git mv Foo Bar` passava pelo gate **sem nenhum check**, e o componente renomeado nunca tinha o
registro de showcase reverificado. Exatamente o buraco da [L-058]: o `ChoroplethMap` saiu da `main`
num merge de reorganização e nenhum sinal disparou.

Pior: a cegueira **explicou um teste que eu tinha lido errado**. O guard de nome não-PascalCase
parecia não funcionar; reproduzido no commit real `54eee58` (`Avatar` → `avatar-ig`), o diff voltou
**vazio** — não era o guard, era o filtro nunca entregando a pasta.

Fix em duas camadas, porque a primeira sozinha era ruidosa:

1. **`--no-renames`** força o git a decompor rename em `D` + `A` → o nome novo aparece como
   adicionado e volta pro gate.
2. **Pasta é "nova" só se não existia no base ref** (`git cat-file -e <merge-base>:<path>`) — sem
   isso, `--no-renames` fazia qualquer arquivo adicionado dentro de pasta existente disparar o
   check. Medido nos 42 componentes: acusava `Chart` (documentado em 8 páginas) e `Icon` (roteado
   pra `IconLibraryDoc.tsx`) com instrução errada, e a escapatória sugerida pela própria mensagem
   teria tirado o `Chart` da varredura do `distribution-debt`, porque os dois consumidores
   compartilham o mesmo `Map` de exceção.

Pasta renomeada não existe sob o nome novo no base → continua sendo flagrada. As duas camadas
juntas dão detecção sem ruído; qualquer uma sozinha erra pra um dos lados.

Regra pra IA: ao escrever check que detecta "coisa nova" a partir de diff, (a) **nunca** confie em
`--diff-filter=A` sozinho — use `--no-renames` ou consulte o base ref; (b) prefira **"não existia
antes"** a **"tem arquivo adicionado"** como definição de novo; (c) valide com **commit real de
rename** do histórico, não só com arquivo novo — os dois casos passam por caminhos de git
diferentes.

---

## [L-063] Id derivado por convenção tem que VALIDAR a convenção

O `toKebab()` do `showcase-registration.mjs` derivava o id de rota a partir do nome da pasta
assumindo PascalCase (`EmptyState` → `empty-state`). Das 42 pastas de `src/components/ui`, **uma**
não segue: `avatar-ig`, cujo id real é `avatar` — a derivação cuspiria `avatar-ig` e o check
reprovaria um componente corretamente registrado.

Decisão: **não** criar API de override (YAGNI pra 1 caso em 42). O CLI **pula** pasta que não passa
por `isPascalCase()` e emite `::warning` — a premissa fica documentada e testada, e quem criar a
segunda pasta fora do padrão vê o aviso em vez de um falso-negativo mudo. O `::warning` (não
`console.log`) importa: aviso que não aparece na UI de Checks é aviso que não existe.

Regra pra IA: ao derivar identificador de um nome (pasta → rota, arquivo → chave, classe → token),
(a) **meça** quantos casos reais seguem a convenção antes de assumir que todos seguem;
(b) valide a premissa e **pule + avise** no caso fora do padrão, em vez de derivar errado em
silêncio; (c) resista a criar override configurável pra 1 exceção — premissa validada + aviso
custa menos e não vira API pra manter.

---

## [L-064] Gate novo só vale depois de reproduzir o defeito que ele existe pra pegar

Duas vezes no mesmo dia (2026-07-29) eu escrevi um check, validei pelo sinal que EU
supunha ser o certo, declarei resolvido — e o check era cego justamente ao bug que
motivou sua existência. As duas foram pegas por acidente, não por processo:

1. **`lib-verify`** — a 1ª versão conferia os *entry points* do `package.json`. Removi
   `dist-lib/src/**` do `files` pra testar (a L-017 exata): o tarball caiu de **959 pra
   123** arquivos e o check disse **"ok"**. Causa: `dist-lib/index.d.ts` é só
   `export * from ./src/components/index` — a superfície de tipos inteira estava no
   diretório removido, e nenhum *entry* ficou descoberto. A formulação correta era
   outra: o conjunto de `.d.ts` do tarball tem que ser **fechado sob imports relativos**.
2. **`api-doc-check`** — devolveu **0 finding** no commit real do Caio, o único caso que
   ele existe pra pegar. Causa: assumi que `parseAddedLines` devolvia `{arquivo: [string]}`;
   devolve um **`Map`** de `{n, text}`. Os testes passavam porque eu os escrevi com a
   MINHA suposição como fixture — testei minha ideia do contrato, não o contrato.

**O padrão comum não é descuido, é ordem de trabalho:** eu escrevia o check, escrevia o
teste a partir do mesmo modelo mental que gerou o check, e os dois concordavam por
construção. Teste que nasce da mesma suposição do código não é evidência independente.

**Regra:** um gate novo só está pronto quando você **reproduziu o defeito real** e viu
ele reprovar. Na prática:

- Use **dado real** — commit do histórico (`git diff <sha>~1 <sha>`), ou a fixture
  extraída da saída da ferramenta de verdade. Não invente o formato de entrada.
- Monte a entrada do teste **pela função de produção** que a gera (foi a correção do
  `api-doc-check`: os testes agora passam por `parseAddedLines`, então o formato não
  pode divergir em silêncio).
- **Propriedade computada não é evidência de comportamento.** No mesmo dia eu "corrigi"
  o alinhamento do `input[type=file]` com `items-center`, confirmei que o
  `alignItems` computado virou `center` e dei como pronto — o conteúdo continuou colado
  no topo, porque ele vive no shadow DOM e `align-items` não o move. O mantenedor viu na
  tela. Onde o render é do UA/shadow DOM, só medição visual vale (foi uma régua de 1px
  no centro da caixa que resolveu).

Vale pra qualquer pessoa escrevendo check, não só pra IA: **o gate que você acabou de
escrever é o menos testado contra a realidade de todo o repositório.**

---

## [L-065] Dogfood pega o que a simulação não pega — só o consumidor real exercita os artefatos shipados

Depois de shipar o "filtro nativo" (v0.30.3), validei o comportamento de duas formas. A
**simulação** — dois agentes cegos recebendo só a orientação do consumidor + o pedido
neutro — disse **passou**: os dois foram pro padrão certo (chip nativo, nada de form acima).
Mas quando montei um **sandbox de consumidor real** (scaffold via CLI + `igreen:add`, Claude
limpo pedindo a tela), a MESMA tarefa **achou 2 bugs** que a simulação não pegou:

1. **Import relativo pra shadcn quebra o copy-in.** `Modal` importava `"../../shadcn/dialog"`
   (relativo). O rewrite do `igreen:add` só reescreve import por **alias**
   (`@/components/shadcn/X` → `ui/X`); relativo é **preservado** → no consumidor aponta pra
   `shadcn/` inexistente → **crash do app inteiro** (Vite error screen), não só da tela nova.
   O `MessageVariablesPicker` tinha o mesmo padrão. Fix: alias + **gate standing** no
   `registry-check.mjs` (o warning do `registry-add-item` era propose-time, não pegava débito
   legado — L-059/L-062, mesma classe).
2. **Preset não virava aba read-only.** `defaultViews` entram com `owner:"preset"`, mas o
   `TableToolbarViews` só auto-pinava `owner:"me"` → com `allowCreateView={false}` (que
   esconde o "+") os presets ficavam **inalcançáveis**. USAGE + L-054 + a skill crud-builder
   **prometiam** o contrário. Fix: preset auto-pina como aba FIXA (sem X), matando a
   contradição doc↔comportamento.

**Por que a simulação não pegou:** ela roda o agente com a orientação **em isolamento** —
valida se a orientação é clara e steera certo. Não exercita os **artefatos distribuídos**: os
caminhos de import reescritos no copy-in, o comportamento real do componente com as props que
a skill instrui. Isso só o **consumidor real** exercita, rodando o `igreen:add` e renderizando.

**Regra:** simulação valida a **orientação** (clareza, steer); **dogfood num sandbox de
consumidor real** valida os **artefatos shipados** (copy-in, componente distribuído, o que a
skill de fato gera rodando). Pra comportamento consumer-facing use os dois — e o dogfood é o
que pega o que a simulação, por construção, não vê. Como montar o sandbox: scaffold da CLI
(`npm create @snksergio/design-system`) ou `SUBMODULE-SETUP.md`.

---

---

## [L-066] Override escopado gerado como DIFF precisa de seletor MUTUAMENTE EXCLUSIVO — senão a omissão herda do lugar errado

O sistema multi-marca emite `brand-<x>.css` com só o **diff** de cor contra a default, em
dois blocos: `[data-theme="x"]` (light) e `.dark[data-theme="x"]` (dark). A economia é real
— 14 vars em vez de 400. O furo está no seletor do light.

`[data-theme="x"]` e `.dark` têm a **mesma especificidade** (0,1,0). Como `brand-<x>.css` é
importado **depois** do `tailwind-theme.css`, o bloco light vencia o `.dark` do tema-base por
ordem de fonte. Consequência: todo token que a marca muda no light **mas cujo valor no dark é
idêntico ao da default** — e por isso está AUSENTE do diff dark — recebia o valor **claro** no
dark mode.

Medido em 2026-08-03, com o seletor antigo:

| marca | tokens vazando light→dark |
|---|---|
| `vibrant` | **13** — `bg-subtle`/`bg-muted` renderizando `#fafafa`, `fg-default` `#0e0e11`, `border-input` `#d4d4d8` |
| `blue` | 1 — `fg-strong` |
| `green` | 1 — `fg-strong` |
| `pay` | 0 |

Os dois de 1 são **bug vivo em marca publicada**: título com `text-fg-strong` saía escuro
sobre fundo escuro. `pay` escapou por acidente — ela diverge da default nos **dois** modos em
todo token que toca, então o diff dark nunca omite nada que o light tenha setado.

Note a assimetria perversa: **quanto mais a marca se parece com a default no dark, mais ela
vaza.** Um tema que só muda a cor da marca vaza pouco; um que troca a rampa neutra inteira
(vibrant) vaza muito. O bug premia divergência.

Fix (1 linha no transform): o seletor do light vira `[data-theme="x"]:not(.dark)`. Os 2
blocos passam a ser mutuamente exclusivos por construção, e no dark cada token cai em
`.dark[data-theme]` (0,2,0) quando a marca diverge, senão no `.dark` do tema-base — que é
exatamente o valor que a marca escolheu, já que o diff só omite o que é idêntico. Regenerar
as 4 marcas mudou **só o seletor**, nenhum valor.

**Regra:** ao gerar override escopado como diff contra um baseline, o seletor do escopo tem
de ser **mutuamente exclusivo** com o seletor do outro eixo (aqui, dark/light) — não basta
"o mais específico ganha onde eu emiti", porque **o diff aposta na omissão**, e omissão herda
de quem vencer o empate. Sempre que a otimização for "não emito o que é igual ao baseline",
verifique de qual regra o token omitido realmente herda, em CADA combinação dos eixos.

**E o mais importante:** nenhum gate pegou isso. `tsc` 0, 159 testes verdes, o
`dead-theme-classes` passou (as classes existiam — só resolviam pro valor errado), e a minha
própria verificação de contraste passou 10/10, porque eu media os **valores dos arquivos TS**,
não o que o **cascade resolvia no browser**. Quem achou foi o mantenedor, de olho, num print.
É a L-064 outra vez, de forma mais dura: `getComputedStyle` no browser com os dois eixos
ligados era o único teste que pegava, e eu não rodei até me mandarem olhar. Ao mexer em tema,
**meça no browser com cada combinação de eixos ativa** — arquivo de token não é evidência de
pixel.

---

## [L-067] `@keyframes` com nome que o framework já possui é NO-OP silencioso — e parece estar funcionando

**Erro cometido:** auditando o `globals.css`, encontrei 5 `@keyframes` e concluí, **lendo o
código**, que havia divergência showcase↔consumidor: `pulse` redefinia `50% { opacity: 0.3 }`
contra o `0.5` nativo do Tailwind, em **10 usos de componentes distribuídos** (skeleton,
DataTable loading, DataList infinite, FooterTable, List); `accordion-*` acrescentava um fade
de opacity que o `tw-animate-css` não tem. Classifiquei como CRÍTICO — "o showcase mostra o
comportamento certo e o consumidor recebe outro", a forma exata que a segunda regra de ouro
descreve. Cheguei a implementar a correção: mover os dois blocos pro tema gerado.

**O build derrubou a conclusão.** `grep` no `dist/assets/*.css`, no estado da `main`, ANTES
de qualquer mudança:

```
@keyframes pulse{50%{opacity:.5}}                            ← NATIVO, não o 0.3 do globals
@keyframes accordion-down{0%{height:0}to{height:var(…)}}     ← tw-animate-css, SEM o fade
```

E depois de mover pro tema: **exatamente o mesmo**. A declaração perdia nos dois lugares.

**Regra derivada:** `@keyframes` cujo nome o Tailwind ou uma lib de animação já possui **não
sobrescreve** — a versão do framework é a que sai no CSS final, independente da ordem no
arquivo-fonte. Declarar um é no-op mudo. Só há dois desfechos, e ambos são ruins:

- **nome do framework** → no-op silencioso, e quem lê o código acredita num comportamento
  que nunca existiu (foi o caso: a linha `opacity: 0.3` estava ali havia meses);
- **nome próprio** → funciona no showcase e **não chega** em npm/copy-in/submódulo, que é a
  divergência que o `outline-float` custou (L-039/L-040).

Animação do DS pertence ao **tema gerado**, com **nome próprio** (`ds-pulse`, não `pulse`).

**Contexto — por que isto não é a L-064 de novo, e sim o complemento dela:** a L-064 diz
"reproduza o defeito antes de confiar no gate". Aqui o alvo era outro: eu ia **consertar** um
defeito sem ter medido que ele existia. Ler CSS-fonte e afirmar comportamento é o mesmo erro
de ler token e afirmar pixel (L-066) — só que na direção da correção, não da validação.
**Antes de mover/duplicar regra CSS entre arquivos, grep no artefato BUILDADO pra ver qual
declaração de fato sobrevive.** Custa um `npm run build`.

**Desfecho:** os 5 `@keyframes` saíram do `globals.css` como código morto (não movidos), e
com eles `--animate-accordion-*` — que ESTE vencia, mas com valor funcionalmente idêntico ao
do `tw-animate-css` e estritamente menos capaz (a do pacote é `var(--tw-animation-duration,
var(--tw-duration,.2s))var(--tw-ease,ease-out)`, que respeita `duration-*`/`ease-*`).
Diff do CSS buildado: **34 linhas**, zero mudança de pixel. Gate:
`runtime-base.test.mjs` proíbe `@keyframes` e `--animate-*` no `globals.css`.

---

## [L-068] Componente que renderiza `<a href>` precisa de integração de router EXPLÍCITA — e testar com href de hash não exercita href de path

**Erro cometido:** o `MenuSidebar` renderiza `<a href={item.href}>` e o `handleClick` nunca
chamava `preventDefault`. Com `href` de **path** (`/app/clientes`) — o que todo app com
`BrowserRouter` usa — o handler do consumidor rodava **e** o browser executava a navegação:
**recarregamento completo da página a cada clique de menu**. Além disso, `onItemClick` era
`(item) => void`: sem o evento, o consumidor não tinha como cancelar nem sabendo do
problema. E não havia forma de injetar o `<Link>` do router. O `<a href="/">` do brand do
rail era **fixo no JSX**.

Quem descobriu foi um **consumidor**, em produção, meses depois. Relato dele: *"todo app que
usa MenuSidebar com react-router recarrega a página inteira a cada clique de menu"*.

**Por que nenhum gate pegou, e é o ponto da lição:** o exemplo canônico
(`src/examples/app-shell/nav-data.ts`) usa `href` de **HASH** (`#/app/clientes`) em **todos**
os itens. Mudança de fragmento **não** recarrega documento — então o showcase e o
`example-app-shell` funcionam perfeitamente. É a "segunda regra de ouro" (showcase mascara o
consumidor) numa superfície nova: não CSS, mas **forma de dado de teste**. `tsc`, os 335
testes, `registry-check` e `examples-drift` não exercitam roteamento.

**Regra derivada, em três partes:**

1. **Componente de navegação que emite `<a href>` deve aceitar o link do router** —
   `renderLink` (render-prop), não `linkComponent`. Prop que recebe *tipo de componente* e é
   escrita inline cria um tipo novo a cada render e o React **desmonta/remonta** a
   subárvore: perde foco, reinicia animação, e o sintoma parece aleatório.
2. **Cancelar navegação tem 5 exceções, e cada uma quebraria algo real** — clique modificado
   (nova aba), `target="_blank"`, href externo, **href de hash** (cancelar impede o
   `hashchange`: trocaria "recarrega" por "não navega") e ausência de handler. A regra vive
   em `nav-link.ts`, é exportada, e tem teste por exceção.
3. **Dado de teste com forma diferente da de produção não é teste.** Se o exemplo usa
   `#/rota` e o consumidor usa `/rota`, o exemplo não cobre o consumidor. Ao escrever
   fixture de navegação, inclua **as duas formas** — foi assim que o teste de regressão ficou
   honesto.

**Contexto — o gate me corrigiu duas vezes durante a correção:** (a) inferir "o consumidor
trata o clique?" por `!!onClick` **não funciona** no caminho composto, porque o
`SidebarPanel` SEMPRE passa um `onClick` (é como o item ativo funciona em modo uncontrolled);
inferir assim cancelava a navegação de quem não passou handler nenhum, trocando o bug do
reload por "o link não faz nada" — um teste pegou, e a intenção do consumidor passou a descer
explícita (`interceptNavigation`). (b) O `vocab-surface` reprovou o texto que escrevi no
vocabulário do consumidor porque eu pusera `` `href` `` em crase, e ele lê nome em crase como
id de componente — mesmo falso positivo que já tinha acontecido com `target`.

**Fix:** `renderLink` + evento no `onItemClick` + `brandHref`/`onBrandClick` + `nav-link.ts`
com a regra e 5 exceções · 36 testes novos, incluindo **regressão com react-router real**
(`MemoryRouter` + `Link`, provando troca de rota sem reload) · seção "Integração com router"
no USAGE do MenuSidebar e do AppShell · aviso no vocabulário do consumidor · `nav-link.ts`
registrado no `registry.json` (arquivo novo em componente distribuído).

---

## [L-069] Base de gate resolvida pelo NOME do remote mente onde `origin` não é o canônico — resolva por URL

**Erro cometido:** três gates de diff (`lint-styles --ratchet`, `showcase-check`,
`api-doc-check`) tinham `origin/main` como base default, e o `package.json` chumbava
`--ratchet origin/main` no `npm run lint:styles`. Neste repo `origin` é o **fork pessoal
parado** — a própria Regra 8 diz isso em letras maiúsculas, e o remote canônico se chama
`empresa`. Medido em 2026-08-10: `origin/main` = `9b86f6f` (2026-05-20, v0.5.0) contra
`empresa/main` = `756e912` (2026-08-10, PR #154). **Três meses** de distância.

**O que os gates diziam, rodando numa PR de 3 arquivos:**

| Gate | vs `origin/main` (default antigo) | vs base canônica |
|---|---|---|
| `lint:styles` | ✗ **17 violações** em `shadcn/` (carousel · context-menu · drawer · menubar · navigation-menu) | ✓ 0 |
| `showcase-check` | ✗ **exit 1** — "componente novo `Chart` sem showcase, a rota #/chart vai abrir EM BRANCO" | ✓ 0 |
| `api-doc-check` | 20+ linhas `fatal: path … exists on disk, but not in 9b86f6f` | ✓ limpo |

Nenhum dos três achados era real. E o `Chart` é o **mesmo falso positivo que a L-062 já
tinha consertado** — o critério "pasta é nova só se não existia no base ref" está correto;
ele só foi alimentado com um base ref de maio. Mesmo sintoma, **segunda causa raiz**.

**Por que passou tanto tempo invisível:** a saída era *plausível*. "17 violações de Tailwind
literal em primitivos shadcn" é exatamente o débito que o repo sabe ter (a própria política do
ratchet cita "27 violações congeladas em menubar/context-menu/drawer/select"). Um gate que
mente com números verossímeis é pior que um que estoura: quem roda conclui "isso é o passivo
conhecido" e para de olhar. É a L-059 num nível acima — não "grep sem contexto", mas **gate
correto medindo contra a referência errada**.

**Por que não é o `--merge-base`:** ele estava certo, e é o que impedia um estrago maior. O
defeito é no **ref**, não na aritmética do diff.

**Regra derivada:**

1. **Não chumbe nome de remote.** `origin/main` fixo é o bug; `empresa/main` fixo quebraria o
   CI, onde o único remote é `origin` (o `actions/checkout` o aponta pro repo buildado). O
   invariante que vale nos dois lugares é a **URL**: canônico = o remote que aponta pro
   `igreenlab/igreen-desingsystem-admin`, se chame `origin` ou `empresa`. Vive em
   `scripts/lib/canonical-base-ref.mjs` (`repoSlug` cobre as 3 formas de URL do git + case).
2. **Quem passa base explícita manda.** O CI passa `origin/${{ github.base_ref }}` porque a
   base pode não ser `main`; a resolução só entra quando ninguém passou. Isso é o que torna a
   mudança **zero-risco pro CI** — e tem teste afirmando que o caminho do CI não muda.
3. **Imprima a base resolvida, sempre.** Base silenciosa foi o que deixou isto durar: a saída
   não dizia contra o quê estava comparando, então não havia o que estranhar. Hoje sai
   `base do ratchet: empresa/main — remote "empresa" aponta pro …`.
4. **Mensagem de erro cita o remote REALMENTE resolvido.** Mandar `git fetch origin main` num
   repo onde `origin` é o fork parado é instrução pra reproduzir o bug (L-060).

**Como foi validado (L-064):** mutei o módulo pro comportamento antigo (filtrar `origin` pelo
nome) e **vi 5 testes reprovarem**, incluindo o do caso medido — o teste não concorda por
construção. Os dados do teste são a saída literal de `git remote -v` deste repo e a do
`actions/checkout`.

**Fix:** `scripts/lib/canonical-base-ref.mjs` + 21 testes · os 3 scripts resolvendo quando
não recebem base · `package.json` sem o ref chumbado.

---

## Como adicionar nova lição

Quando o Claude cometer um erro não listado aqui:

1. Identificar o padrão do erro
2. Adicionar no final deste arquivo com header **`## [L-NNN] Título`** — heading `##`,
   sem negrito e sem ponto final. As 63 lições usam esse formato exato; L-033 a L-043
   ficaram em `**[L-NNN] ...**` por um tempo e qualquer contagem automática precisava de
   duas regex (normalizado em 2026-07-29). Não invente variação.
3. Verificar se o resumo em `.claude/rules/ds-standards.md` precisa ser atualizado
   (é o arquivo auto-carregado — deve ter o resumo de todas as lições) e se a contagem
   no título da seção (`## NN Lições (L-001 a L-NNN)`) ainda bate

---

## Política de arquivamento

**Teto: ~120 KB** (revisto em 2026-07-30; era 50 KB). Ao passar, mover para
`.ai/status/lessons-archive.md` as lições já ABSORVIDAS em gate automático — elas
continuam valendo, mas o pipeline as aplica sozinho, então não dependem mais de
disciplina humana no dia a dia. Já arquivadas: L-001/002/003/005 (`ds-lint-patterns.mjs`)
e L-017 (`pack-contract.mjs`).

Manter no ativo as lições que AINDA dependem de disciplina humana (decisões de
arquitetura, padrões Radix/forwardRef, caveats de libs externas, regras de release).
O resumo 1-linha de TODAS as lições (ativas + arquivadas) permanece em
`.claude/rules/ds-standards.md` — é a fonte auto-carregada.

### Por que o teto subiu, e o que fazer quando estourar de novo

O teto de 50 KB foi escrito quando havia bem menos lição. Medido em 2026-07-30, com 59
ativas: **79 KB, ~1,3 KB por lição, distribuídos de forma uniforme** — 16% do peso em
L-001..020, 38% em L-021..040, 33% em L-041..059 e 13% em L-060..064. **Não existe
culpado**: 79 KB é o que 59 lições detalhadas pesam. Na densidade atual, 50 KB
equivaleria a ~38 lições, então a política envelheceu em vez de ser desobedecida.

Encurtar as lições seria o conserto errado. A densidade é deliberada: as recentes
carregam a medição, o contra-exemplo e o porquê — é exatamente isso que impede alguém
"consertar" uma decisão intencional depois (L-057, L-059 existem só pra isso).

Arquivar também não resolve o tamanho: quase nenhuma lição de Radix, dark mode ou
release virou código, então poucas se qualificam pelo critério "absorvida em gate".

**Quando estourar 120 KB, a saída é dividir por domínio**, não deletar:
`lessons-tokens.md` · `-componentes.md` · `-distribuicao.md` · `-pipeline.md`. O custo
real nunca foi o disco — é o contexto gasto quando alguém abre o arquivo inteiro pra
achar uma lição; dividido, abre-se só a fatia relevante. O resumo no `ds-standards.md`
segue como índice único. ⚠️ Não é tarefa de 5 minutos: exige reapontar as referências
cruzadas (`ver lessons.md L-0XX` espalhado em skills e specs) e provar que nenhuma
lição se perdeu — trate como tarefa própria, com verificação de integridade.
