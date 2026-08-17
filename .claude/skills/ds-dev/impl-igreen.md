---
name: impl-igreen
description: >
  Criar ou editar componente iGreen com tv().
  Estrutura: index.ts + .tsx + .styles.ts + .types.ts + USAGE.md.
---

# DS Dev — Componente iGreen (tv())

> **Leitura obrigatória.** Abra este arquivo com a tool **Read** — é sub-arquivo da skill `ds-dev`, e `ds-create-component` é um COMMAND, não uma skill: o Skill tool não resolve nenhum dos dois. ANTES de criar qualquer componente iGreen com `tv()` — não confie em memória de sessão anterior.

## Verificações antes de escrever código

```
1. Existe em .ai/context/components/inventory.md? → PARAR. Usar existente.
2. Tem lógica interativa complexa (Radix, etc)? → Usar impl-shadcn.md
3. Todos os tokens necessários existem? → Se não: PARAR, sinalizar cascata.
```

## Estrutura padrão (componente novo)

```
src/components/ui/NomeComponente/
├── index.ts
├── nome-componente.tsx        # ZERO hardcode
├── nome-componente.styles.ts  # tv() — fonte de verdade visual
├── nome-componente.types.ts   # VariantProps
└── USAGE.md                   # OBRIGATÓRIO
```

---

## Template `.styles.ts` completo

```typescript
import { tv, type VariantProps } from "@/utils/tv"  // NUNCA tailwind-variants

export const nomeVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    "select-none whitespace-nowrap",
    "border border-transparent",           // transição suave obrigatória
    "transition-all duration-200 ease-out",
    "focus-visible:outline-none",          // apenas outline-none no base — ring nas color variants
  ],
  variants: {
    color: {
      // Ring POR COR — cada variante usa seu próprio ring token
      // NUNCA colocar ring-ring-brand no base
      primary:   "focus-visible:ring-4 focus-visible:ring-ring-brand",
      secondary: "focus-visible:ring-4 focus-visible:ring-ring-secondary",
      danger:    "focus-visible:ring-4 focus-visible:ring-ring-danger",
      success:   "focus-visible:ring-4 focus-visible:ring-ring-success",
      warning:   "focus-visible:ring-4 focus-visible:ring-ring-warning",
    },
    variant: { filled: "", outline: "", soft: "", ghost: "bg-transparent" },
    size: {
      // NUNCA: gap-4, rounded-lg, shadow-md, px-3, h-10
      // Valores espelhados do Button real (button.styles.ts): radius md (8px) nos
      // dois menores, lg (10px) do sm pra cima. `rounded-radius-base` é alias de
      // `lg` — prefira o nome do degrau, que é o que os componentes usam.
      "2xs": "min-h-form-xs  px-pad-lg  gap-gp-sm  rounded-radius-md text-body-sm font-semibold",
      xs:    "min-h-form-sm  px-pad-xl  gap-gp-sm  rounded-radius-md text-body-sm font-semibold",
      sm:    "min-h-form-md  px-pad-xl  gap-gp-sm  rounded-radius-lg text-body-sm font-semibold",
      md:    "min-h-form-lg  px-pad-2xl gap-gp-sm  rounded-radius-lg text-body-sm font-semibold",
    },
    fullWidth: { true: "w-full flex-1" },
    disabled:  { true: "pointer-events-none" },
  },
  compoundVariants: [
    // 1. Compostos cor × variant
    { color: "primary", variant: "filled",
      class: "bg-bg-brand text-fg-on-brand hover:bg-bg-brand-hover" },
    { color: "primary", variant: "outline",
      class: "bg-bg-surface border-border-brand text-fg-brand shadow-sh-sm hover:bg-bg-brand-subtle hover:border-transparent hover:shadow-sh-none" },
    { color: "primary", variant: "soft",
      class: "bg-bg-brand-subtle text-fg-brand hover:bg-bg-surface hover:border-border-brand" },
    { color: "primary", variant: "ghost",
      class: "text-fg-brand hover:bg-bg-brand-subtle" },
    // (demais cores seguem o mesmo padrão)

    // 2. Disabled — SEMPRE POR ÚLTIMO (L-006)
    // Não existe `bg.disabled` nem `border.disabled` no V3 — só `fg.disabled`.
    // O padrão do DS é opacidade, não uma paleta de desabilitado (Button real:
    // `pointer-events-none opacity-50`). Um `bg-bg-disabled` não emite CSS e a
    // classe some em silêncio.
    { disabled: true, class: "pointer-events-none opacity-50" },
  ],
  defaultVariants: { color: "primary", variant: "filled", size: "md" },
})

export type NomeVariantProps = VariantProps<typeof nomeVariants>
```

## Template `.tsx`

```typescript
import { forwardRef } from "react"
import { nomeVariants } from "./nome-componente.styles"
import type { NomeComponenteProps } from "./nome-componente.types"

// ⚠️ Adaptar HTMLButtonElement e <button> para o elemento HTML correto
// Ex: HTMLDivElement + <div role="button"> para custom interactive
//     HTMLAnchorElement + <a> para links navegáveis
export const NomeComponente = forwardRef<HTMLButtonElement, NomeComponenteProps>(
  function NomeComponente(
    { color, variant, size, disabled, fullWidth, className, children, ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        className={nomeVariants({ color, variant, size, disabled, fullWidth, className })}
        {...rest}
      >
        {children}
      </button>
    )
  }
)
NomeComponente.displayName = "NomeComponente"
```

## Template `.types.ts`

⛔ **`Omit` de toda variante que também é atributo HTML nativo — sem isso NÃO COMPILA.**
`color` e `disabled` (as duas variantes do template acima) existem como atributo HTML:
`color` é `string`, a variante é união literal (`"primary" | "danger" | …`). Estender sem
omitir dá **TS2320 — "cannot simultaneously extend"**, e a mensagem não aponta a causa.

```typescript
import type { ComponentPropsWithoutRef } from "react"
import type { NomeVariantProps } from "./nome-componente.styles"

export interface NomeComponenteProps
  extends Omit<ComponentPropsWithoutRef<"button">, "color" | "disabled">,
    NomeVariantProps {
  // props customizadas opcionais (iconLeft, iconRight, loading, etc)
}
```

Regra geral: **toda chave de `variants` que colida com prop do elemento entra no `Omit`.**
É o que os 9 componentes do repo que enfrentam a colisão fazem — o `Button` real declara
`Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "disabled" | "color">`, omitindo
exatamente as duas variantes que cria.

> Medido em 2026-08-14: o template anterior não trazia o `Omit`. Quem o seguisse ao pé da
> letra não compilava — e `npm test` passava verde, porque o `tsc` era step separado do CI.
> Nenhum componente do repo seguia o template; todos divergiam dele pra funcionar.

## Template `index.ts`

```typescript
export { NomeComponente } from "./nome-componente"
export type { NomeComponenteProps } from "./nome-componente.types"
```

---

## Padrão Focus Ring — 2 variantes

### Padrão 1 — estático (Button, Select, Chip)

```typescript
base:  "focus-visible:outline-none"
color: "focus-visible:ring-4 focus-visible:ring-ring-{color}"
```

### Padrão 2 — animado (Input, Textarea)

```typescript
base:  "ring-0 ring-ring-brand"
       "transition-[color,box-shadow,background-color] focus-visible:outline-none"
focus: "focus-visible:ring-4"
```

---

## Padrões críticos resumidos

### Focus ring (L-001, L-003, L-004)
- **Sempre** `focus-visible:outline-none` no base
- Ring `focus-visible:ring-4 focus-visible:ring-ring-{color}` **por cor** (não no base)
- Nunca `ring-ring-*/30` (token já tem alpha)
- Nunca `ring-3` (não existe)

### Tamanhos (L-002)
- `min-h-form-{xs/sm/md/lg/xl}` — nunca `h-*` fixo
- Padding via `px-pad-*`, gap via `gap-gp-*`
- Tipografia via preset (`text-body-sm font-semibold`, etc) — nunca `text-[Npx] font-*` avulso (L-007)

### Variants order (L-006)
- `disabled` SEMPRE último em `compoundVariants`
- Caso contrário, é sobrescrito por color variants

### Imports
```typescript
import { tv, type VariantProps } from "@/utils/tv"  // NUNCA "tailwind-variants"
```

### Border base
```typescript
"border border-transparent"  // transição suave obrigatória
```

---

## Checklist antes de sinalizar `IMPL_PRONTA`

- [ ] Ring em cada `color` variant — NÃO no base; `focus-visible:outline-none` apenas no base
- [ ] Nenhum `ring-*/30`, `ring-3`, `outline-none` sem `focus-visible:`
- [ ] `tv` de `@/utils/tv`; `disabled` por último; `type="button"`
- [ ] Nenhum Tailwind literal com equivalente DS (consultar `.claude/rules/ds-standards.md`)
- [ ] Tipografia via presets; `min-h-form-*` (nunca `h-*`)
- [ ] **`USAGE.md` criado** em `src/components/ui/NomeComponente/USAGE.md`
- [ ] Exports em DOIS arquivos: `ui/[Nome]/index.ts` (criado) + `src/components/index.ts` (atualizado)
- [ ] Imports de outros componentes via alias específico `@/components/(shadcn|ui)/<x>`
  (NUNCA relativo cross-dir `../../shadcn/x` nem barrel — quebra a distribuição copy-in)
- [ ] `.ai/context/components/inventory.md` atualizado
- [ ] **Registry — NÃO nesta entrega.** `registry.json` é a superfície 5 e consolida no
  `/ds-release` (Regra 8 / L-042: "1–4 no PR; 5/6/7 no release"). O que fazer aqui é **anotar
  no corpo da PR** que falta registrar. Se quiser adiantar a entrada proposta pra quem fizer a
  release, rode `node scripts/registry-add-item.mjs <Nome>` e **cole a saída no PR** — sem
  editar o `registry.json`.
  > Até 2026-08-15 este item mandava adicionar ao `registry.json` **e**, vinte linhas abaixo,
  > a seção de showcase dizia "não faz parte desta entrega: `registry.json`". O mesmo arquivo
  > se contradizia, e quem seguisse o checklist mexia num arquivo que a revisão mandaria tirar.
- [ ] `pipeline-state.md` atualizado com formato CONCLUÍDO incluindo campo `Assumption`

Exemplo Assumption:
> "não existe componente Shadcn com lógica equivalente e a lógica é simples o suficiente para tv()"

---

## Antes de considerar pronto — showcase (L-042, superfície 4)

Sem os três, a rota abre **em branco**. O CI reprova (`showcase-check`).

1. `src/preview/pages/<Nome>Doc.tsx` — a doc page. **O padrão está abaixo — não adivinhe.**

```tsx
   import { Kbd } from "../../components/ui/Kbd";       // relativo, não @/
   import {
     DocLayout, DocHeader, DocSeparator,
     SectionH2, ExampleSection, PropsTable,
   } from "../components";                              // o BARREL, não arquivo a arquivo

   const TOC = [{ id: "tamanhos", label: "Tamanhos" }]; // ids = os das SectionH2

   const KBD_PROPS = [                                  // o campo é defaultVal
     { name: "size", type: "sm | md", defaultVal: "md", description: "..." },
   ];

   export function KbdDoc() {
     return (
       <DocLayout toc={TOC}>
         <DocHeader category="Componentes" title="Kbd" description="..." />
         <SectionH2 id="tamanhos" title="Tamanhos" />   {/* title, NÃO children */}
         <ExampleSection id="ex-tamanhos" title="..." description="...">
           {/* o preview */}
         </ExampleSection>
         <DocSeparator />
         <SectionH2 id="props" title="Props" />
         <PropsTable items={KBD_PROPS} />               {/* items, NÃO rows */}
       </DocLayout>
     );
   }
```

   **As quatro pegadinhas**, medidas por dogfood em 2026-08-17. Cada uma custou uma
   ida-e-volta no `tsc` — que é quem salva, mas depois de 4 tentativas:

   | Erro natural | O certo |
   |---|---|
   | `from "../components/SectionH2"` | o barrel: `from "../components"` |
   | `<SectionH2>Texto</SectionH2>` | prop `title`, não children |
   | `<DocHeader title description />` | `category` é **obrigatória** |
   | `<PropsTable rows={…}>` com `default:` | `items={…}` e o campo é **`defaultVal`** |

   ⛔ **L-050 — `PropsTable` vai DIRETO sob `SectionH2`**, nunca dentro de
   `ExampleSection`: as duas têm superfície própria (ring) e vira card-dentro-de-card. E
   `SectionH2` tem `mb` sem `margin-top` — tabela seguida de heading cola; separe com
   `DocSeparator`.

   ⚠️ **Chave desconhecida num array de props é descartada em SILÊNCIO.** Array literal
   atribuído a variável não dispara o excess-property check do TS. Já aconteceu: o
   `AppShellDoc` escreveu uma `description` de 4 linhas que **nunca renderizou**. Confira o
   tipo `PropItem` em `src/preview/components/doc-props-table.tsx` antes de inventar campo.
2. `src/App.tsx` — **três** edições: `import { <Nome>Doc } from "./preview/pages/<Nome>Doc";`
   no topo, `"<id-kebab>",` no array `DOC_PAGES` **e**
   `{activePage === "<id-kebab>" && <<Nome>Doc />}` na cascata de render
3. `src/preview/components/doc-nav-data.ts` — `{ label: "...", href: "<id-kebab>" }`

**Não** faz parte desta entrega: `registry.json`, vocabulário do consumidor e changelog —
consolidam no `/ds-release` (Regra 8). Anote no corpo da PR o que ficou pendente.

Componente interno de propósito (sem showcase) → declare em
`scripts/lib/ds-exceptions.mjs` com o motivo.

---

## Referências

- Anti-patterns proibidos + 68 lições → `.claude/rules/ds-standards.md`
- Padrão tv() detalhado e exemplos longos → `.ai/rules/coding-standards.md`
- Inventário de componentes existentes → `.ai/context/components/inventory.md`
- USAGE.md por componente → `src/components/ui/<Nome>/USAGE.md`
