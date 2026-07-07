---
name: drawers
description: >
  Monta drawers/painéis laterais de criar, editar e ver-detalhe no padrão iGreen
  DS. Use quando o usuário pedir "drawer", "painel lateral", "modal de criar/editar",
  "side sheet", ou quando um CRUD/detalhe precisar de criar/editar/detalhe.
  Ancora nos drawers do example-finance (NovoClienteDrawer + FinanceDetailPanel).
---

# drawers — Criar / Editar / Detalhe

Padrão de drawer do DS, ligado ao CRUD/detalhe. Três variantes, mesma família visual.

## Fluxo
1. `npm run igreen:add -- example-finance` (traz os drawers + `Panel`, `FloatingPanel`, `FormField`).
2. **Leia** os componentes-modelo:
   - Criar/editar → `src/examples/finance/components/NovoClienteDrawer` e `.../EditarFinanceDrawer` (base: `Panel` + `FormField`).
   - Ver detalhe → `src/examples/finance/components/FinanceDetailPanel` (base: `FloatingPanel`, não-modal).
3. Adapte os campos/conteúdo ao caso. Ligue ao estado da página (igual `finance-screen.tsx`: `open`/`onOpenChange` + registro selecionado).

## Gotchas do tipo
- **Criar/Editar** = `Panel` (drawer modal lateral) com form em `<FormField>` + `gap-form-gap`. Footer sticky com Cancelar/Salvar.
- **Detalhe** = `FloatingPanel` (não-modal, não bloqueia a página; pode coexistir com a tabela). `shadow-sh-aside`.
- Largura: drawer `drawer-md` (480px) padrão. Mobile (<1024px): vira Sheet full.
- Nunca `<label>` cru; nunca `<button onClick>` como "card de seleção" (use label/FormField nativo).
- Abrir detalhe no click da linha (`onRowClick`); abrir editar via ação da linha.

Aplique `DESIGN.md` + regras. Handoff: `DRAWER_PRONTO: <criar|editar|detalhe> de <Entidade>`.
