---
name: iGreen DS — nomenclatura V3 dos tokens é a verdade, docs em .ai/context estão V2
description: O código real usa brand/danger/default; .ai/context/tokens/color.md descreve a antiga V2 (primary/critical/foreground). Sempre verificar tokens/brands/default/semantic/*.ts antes de seguir a doc.
type: project
---

## Estado atual

O código em `src/components/**` e `tokens/brands/default/semantic/color-light.ts` usa nomenclatura **V3**:

- `bg.brand` (não `bg.primary`)
- `bg.danger` (não `bg.critical`)
- `fg.default` (não `fg.foreground`)
- `fg.on-brand` (não `fg.on-primary`)
- `border.default` (não `border.main`)
- `ring.brand` (não `ring.primary`)
- variantes alpha: `*-subtle`, `*-muted`, `*-muted-hover`, `*-subtle-hover` (color-mix com transparent)

A doc `.ai/context/tokens/color.md` ainda descreve V2 (primary/critical/foreground) e diz "renomeado para primary" no rodapé — está invertida na direção real. O `CLAUDE.md` na raiz também diz "critical (não danger)" — também desatualizado.

## Por que ainda não foi consertado
Migração V2 → V3 aconteceu sem atualização das docs. Pipeline-state.md e component-inventory.md também estão parados em abril/2026 enquanto 8 componentes ui/ e 6 shadcn/ novos foram adicionados depois.

**Why:** confiar nas docs leva a usar tokens inexistentes (`bg-bg-primary`, `text-fg-foreground`) que somem no CSS gerado pelo `to-tailwind-v4` e produzem componentes sem estilo.

**How to apply:** antes de citar ou escrever qualquer token de cor, validar no arquivo `tokens/brands/default/semantic/color-light.ts` (ou `color-dark.ts`). Quando o usuário pedir housekeeping, oferecer atualizar as docs como follow-up.
