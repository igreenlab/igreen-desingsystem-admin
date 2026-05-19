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
"text-xs font-semibold" → "text-label-xs"
"text-sm font-medium"   → "text-label-sm"
```

**Contexto:** badge, tab, qualquer componente com texto de UI

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

## Como adicionar nova lição

Quando o Claude cometer um erro não listado aqui:
1. Identificar o padrão do erro
2. Adicionar no formato `[L-NNN]` no final deste arquivo
3. Verificar se o resumo em `.claude/rules/ds-standards.md` precisa ser atualizado
   (é o arquivo auto-carregado — deve ter o resumo de todas as lições)
