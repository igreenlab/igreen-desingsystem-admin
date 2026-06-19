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

## Como tokens iGreen chegam automaticamente

```
componente usa  → bg-primary
Tailwind gera   → var(--primary)
globals.css     → --primary: var(--color-bg-primary)  ← mapeamento automático
resultado       → token iGreen ✓
```

Instalar + mover para `shadcn/` já é suficiente para `bg-*`/`text-*`.
**Exceção 1 — focus ring:** precisa substituição manual obrigatória (abaixo).
**Exceção 2 — BORDA (L-039):** no Tailwind v4 a classe `border` (e `border-x/y/l/r/t/b`)
define **só a largura** — sem uma classe de cor a borda usa `currentColor` (branca no
dark / preta no light). O bridge NÃO cobre borda crua. **Sempre** trocar `border` →
`border border-border-default` (ou `-subtle`/`-brand`/...). Ex.: `rounded-md border bg-popover`
→ `rounded-radius-md border border-border-default bg-bg-surface`.

## Passos

```bash
# 1. Instalar
npx shadcn@latest add [nome]

# 2. Mover
mv src/components/ui/[nome].tsx src/components/shadcn/[nome].tsx
```

```typescript
// 3. Substituir focus ring (OBRIGATÓRIO)
// ❌ Remover padrão Shadcn:
"focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

// ✅ Padrão 1 — estático (selects, checkboxes, triggers):
"focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-primary"

// ✅ Padrão 2 — animado (inputs, textareas):
// base: "ring-0 ring-ring-primary transition-[color,box-shadow,background-color] focus-visible:outline-none"
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

// Tipografia (typography rewrite 2026-05-19 — só 6 roles: display/heading/title/body/caption/code)
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
- [ ] **Registry (distribuição):** `node scripts/registry-add-item.mjs <nome>` → revisar a
  entrada proposta (registryDeps + deps) → adicionar ao `registry.json`. Distribuição efetiva
  no próximo `/ds-release` (Passo 6.2b). Sem isso, não é consumível via `@igreen/<nome>`.
- [ ] `pipeline-state.md` atualizado com formato CONCLUÍDO incluindo campo `Assumption`
  Ex: `Assumption: "não existe componente Shadcn com lógica equivalente instalado anteriormente"`
