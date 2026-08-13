---
name: impl-shadcn
description: >
  Adicionar ou adaptar componente Shadcn ao DS.
  Substituir classes Tailwind por tokens DS, aplicar tv().
---

# DS Dev — Componente Shadcn

## Verificação obrigatória
```
shadcn/[nome].tsx já existe? → PARAR. Editar existente, não reinstalar.
```

## ⛔ A bridge NÃO é "mapeamento automático" — trocar os tokens é OBRIGATÓRIO

Esta seção dizia o contrário até 2026-08-08, e foi ela que produziu o defeito da v0.37.1.
O texto antigo era:

```
componente usa  → bg-primary          ← ERRADO
globals.css     → --primary: var(--color-bg-brand)   "mapeamento automático"
Instalar + mover para shadcn/ já é suficiente para bg-*/text-*.
```

**Por que é falso:** esse mapeamento (`@theme inline`) mora só no `globals.css` (showcase) e
no `index.css` (scaffold). Ele **NÃO viaja** pros canais **npm** e **submódulo** — lá a var
não existe e a cor cai em `currentColor`, em opacidade cheia.

Medido no consumidor npm, no `Card`:

```
intenção : ring-foreground/5   → oklch(0.15 0 0 / 0.05)   fio quase invisível
real     : ring-1 currentColor → oklch(0.15 0 0)           linha preta sólida
```

Eram 8 classes em 5 componentes (`card`, `drawer`, `menubar`, `select`, `separator`), e quem
achou foi o mantenedor **num print** — nenhum gate pegava na época.

**Regra:** componente distribuído **não pode** usar nenhuma das 19 chaves da bridge —
`background` `foreground` `card` `popover` `primary` `secondary` `muted` `accent`
`destructive` `border` `input` `ring` (+ as variantes `-foreground`). Gate:
`scripts/lib/shadcn-vocab.mjs`, no `npm test`. A tabela `EQUIVALENTE` desse módulo dá o
token DS de cada chave — **use-a**, e note que ela avisa onde as duas bridges divergem
(`popover`, `secondary`, `accent`, `ring`), porque nessas 4 não existe substituto que
preserve o valor nos dois canais.

⚠️ Armadilha real: `popover` → **`bg-bg-surface`**, NÃO `bg-bg-dropdown`. O `dropdown` é o
token da receita de FLUTUANTE e é translúcido no dark (`canvas` a 70%), pareado com
`before:backdrop-blur-2xl`. Trocar sem o blur muda o fundo — aconteceu no `command.tsx`.

**Exceção 1 — focus ring:** precisa substituição manual obrigatória (abaixo).
**Exceção 2 — BORDA (L-039):** no Tailwind v4 a classe `border` (e `border-x/y/l/r/t/b`)
define **só a largura** — sem uma classe de cor a borda usa `currentColor` (branca no
dark / preta no light). O bridge NÃO cobre borda crua. **Sempre** trocar `border` →
`border border-border-default` (ou `-subtle`/`-brand`/...). Ex.: `rounded-md border bg-popover`
→ `rounded-radius-md border border-border-default bg-bg-surface`.
**Exceção 3 — FLUTUANTE (L-040):** menu/popover/painel (dropdown, context-menu, menubar,
navigation-menu, hover-card, select…) segue a **receita única** — espelhar
`dropdown-menu.tsx`/`popover.tsx`, NÃO os defaults shadcn. Superfície: `relative
bg-bg-dropdown border border-border-default rounded-[12px] shadow-sh-lg outline-float`
+ frosted `before:backdrop-blur-2xl ...`. Item: `px-pad-lg py-pad-md rounded-radius-sm
text-fg-muted focus:bg-bg-muted focus:text-fg-default`. Separator/Label/Shortcut por token.

## Passos

```bash
# 1. Instalar
npx shadcn@4.17.0 add [nome]

# 2. Mover
mv src/components/ui/[nome].tsx src/components/shadcn/[nome].tsx
```

```typescript
// 3. Substituir focus ring (OBRIGATÓRIO)
// ❌ Remover padrão Shadcn:
"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

// ✅ Padrão 1 — estático (selects, checkboxes, triggers):
"focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"

// ✅ Padrão 2 — animado (inputs, textareas):
// base: "ring-0 ring-ring-brand transition-[color,box-shadow,background-color] focus-visible:outline-none"
// focus: "focus-visible:ring-4"
```

```typescript
// 4. Substituições recomendadas (para código explícito)
// Alturas — h-* fixo → min-h-form-* correspondente
"h-7"              → "min-h-form-xs"   // 28px
"h-8"              → "min-h-form-sm"   // 32px
"h-9"              → "min-h-form-md"   // 36px  ← h-9 = 36px, NÃO form-lg
"h-10"             → "min-h-form-lg"   // 40px
"h-11"             → "min-h-form-xl"   // 44px

// Tipografia — 27 presets em 7 roles: display/heading/title/body/caption/stat/code
"text-sm"                → "text-body-sm"           // 13/500
"text-sm font-medium"    → "text-body-sm font-semibold"  // 13/600
"text-xs"                → "text-body-xs"           // 12/500
"text-xs font-medium"    → "text-caption-sm font-semibold"  // 11/600

// Spacing e shape
"rounded-md"       → "rounded-radius-md"
"shadow-md"        → "shadow-sh-md"
"gap-2"            → "gap-gp-xs"
"px-3"             → "px-pad-lg"
```

```typescript
// 5. Barrel exports — DOIS arquivos obrigatórios
// a) shadcn/index.ts — adicionar export do componente novo
export { NomeComponente } from "./nome-componente"

// b) src/components/index.ts — re-export para consumo externo
export * from "./shadcn/nome-componente"
```

## Checklist

- [ ] Em `shadcn/` (não em `ui/`)
- [ ] Focus ring substituído
- [ ] Lógica Radix preservada (handlers, aria, data-state)
- [ ] Dark mode via CSS vars
- [ ] Exports criados em AMBOS: `shadcn/index.ts` e `src/components/index.ts`
- [ ] Usa `cn` de `@/lib/utils` / `tv` de `@/utils/tv` (alias) — distribuível
- [ ] `component-inventory.md` atualizado
- [ ] **USAGE (índice `shadcn/USAGE.md`) — decisão obrigatória, NÃO um arquivo por componente:**
  - **Tem gotcha?** (setup obrigatório tipo `<Toaster/>`/`<TooltipProvider>` no root, dep extra
    tipo `vaul`/`embla`, receita flutuante L-040, ring/acessibilidade fora do padrão, z-index L-030)
    → adicionar/editar **1 linha** na tabela do `shadcn/USAGE.md` (curta — só o não-óbvio).
  - **Sem gotcha?** (API shadcn/Radix padrão) → **não escrever nada na tabela**; se quiser, citar o
    nome na lista "Padrão sem gotcha". A doc viva é o showcase (`#/<nome>`).
  - ⛔ Não criar `USAGE.md` dentro de `shadcn/<nome>/` (primitivo é single-file; índice basta).
    Manter o índice enxuto — não repetir a API; só o que pega o consumidor de surpresa.
- [ ] **Registry (distribuição):** `node scripts/registry-add-item.mjs <nome>` → revisar a
  entrada proposta (registryDeps + deps) → adicionar ao `registry.json`. Distribuição efetiva
  no próximo `/ds-release` (Passo 6.2b). Sem isso, não é consumível via `@igreen/<nome>`.
- [ ] `pipeline-state.md` atualizado com formato CONCLUÍDO incluindo campo `Assumption`
  Ex: `Assumption: "não existe componente Shadcn com lógica equivalente instalado anteriormente"`

## Antes de considerar pronto — showcase (L-042, superfície 4)

Sem os três, a rota abre **em branco**.

⛔ **Aqui o CI NÃO é rede de segurança.** O `showcase-check` detecta **pasta** nova em
`src/components/ui/<Nome>/`; primitivo shadcn é **arquivo único**
(`src/components/shadcn/<nome>.tsx`), então a detecção por pasta nunca o vê — e o step
escopa o diff em `-- src/components/ui`. Registrar o showcase aqui é **disciplina de quem
implementa**, não algo verificado por máquina. (Só o import é pego, e pelo Typecheck.)

1. `src/preview/pages/<Nome>Doc.tsx` — a doc page
2. `src/App.tsx` — **três** edições: `import { <Nome>Doc } from "./preview/pages/<Nome>Doc";`
   no topo, `"<id-kebab>",` no array `DOC_PAGES` **e**
   `{activePage === "<id-kebab>" && <<Nome>Doc />}` na cascata de render
3. `src/preview/components/doc-nav-data.ts` — `{ label: "...", href: "<id-kebab>" }`

**Não** faz parte desta entrega: `registry.json`, vocabulário do consumidor e changelog —
consolidam no `/ds-release` (Regra 8). Anote no corpo da PR o que ficou pendente.

Componente interno de propósito (sem showcase) → declare em
`scripts/lib/ds-exceptions.mjs` com o motivo.
