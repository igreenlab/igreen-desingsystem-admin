<!--
Este texto aparece preenchido automaticamente ao abrir PR. Apague o que não
se aplicar. As caixinhas não são burocracia: cada uma existe porque a falta
dela já causou um problema real neste repo (as lições L-0NN citadas).
-->

## O que muda e por quê

<!-- O "por quê" importa mais que o "o quê" — a diff já mostra o quê. -->

## Como testei

<!-- Comando + resultado. "Testei localmente" não é evidência. -->

---

## Checklist

Marque só o que se aplica ao seu caso.

### Sempre

- [ ] `npx vitest run` e `npx tsc --noEmit` passam
- [ ] Se o check **`check`** ficou vermelho, eu olhei o motivo (o gate de estilos marca a linha exata na aba *Files changed*)

### Se mexi em `*.styles.ts` ou criei/alterei componente

- [ ] Usei **classe DS**, não Tailwind literal — `gap-gp-md` (não `gap-4`), `min-h-form-lg` (não `h-10`), `rounded-radius-lg` (não `rounded-lg`), `shadow-sh-md`, `size-comp-*`
- [ ] `tv` importado de `@/utils/tv` (nunca de `tailwind-variants`)
- [ ] `disabled` é o **último** `compoundVariant` (L-006)
- [ ] Zero hardcode (`#fff`, `16px`, `0.875rem`)

### Se criei componente novo

O componente toca **8 superfícies** (L-042). Nesta PR fecham as 4 primeiras + o barrel:

- [ ] Código em `src/components/ui/<Nome>/`
- [ ] `USAGE.md` ao lado do componente
- [ ] Entrada em `.ai/context/components/inventory.md` (L-016)
- [ ] Showcase — os **3** registros, sem os quais a rota renderiza em branco (L-042):
      1. `src/preview/pages/<Nome>Doc.tsx` — a doc page
      2. `src/App.tsx` — **três** edições: `import { <Nome>Doc } from "./preview/pages/<Nome>Doc";`
         no topo, `"<id-kebab>",` no array `DOC_PAGES` **e**
         `{activePage === "<id-kebab>" && <<Nome>Doc />}` na cascata de render
      3. `src/preview/components/doc-nav-data.ts` — `{ label: "...", href: "<id-kebab>" }`
- [ ] `export * from "./ui/<Nome>"` em `src/components/index.ts` — **8ª superfície**, é o que define o canal npm; sem isso `import { X } from "@snksergio/design-system"` estoura "not exported" (gate: `barrel-completeness`)
- [ ] Declarei no `package.json` toda dependência nova que o componente importa de fato — **inclusive dep de TIPO** (`@types/*` que o `.d.ts` publicado referencia) (L-058 / gate `deps-declared`)

As 3 restantes (registry · catálogo do CLI · changelog) **não** vão nesta PR — consolidam no `/ds-release` (Regra 8). Se o check de débito de distribuição apontou algo, anote aqui o que falta registrar:

<!-- ex.: "falta registrar o ChoroplethMap no registry.json + catálogo do CLI" -->

### Se mexi em token

- [ ] Rodei `npm run tokens:tw4` (e `npm run tokens:brand:<id>` se mexi em marca) — o CSS gerado é **commitado**, e desde 2026-08-08 o gate `generated-artifacts` reprova se ele estiver defasado dos tokens
- [ ] Se criei preset tipográfico, registrei em `src/utils/tv.ts` (`twMergeConfig`) — sem isso o `tailwind-merge` remove a classe **em silêncio** (L-016)
- [ ] Dark mode conferido (`color-dark.ts`)

---

## Para o revisor

<!-- Onde você quer atenção? O que já sabe que ficou de débito? -->
