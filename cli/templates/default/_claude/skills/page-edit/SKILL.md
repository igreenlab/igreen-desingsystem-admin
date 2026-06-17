---
name: page-edit
description: >
  Monta telas de edição/cadastro/formulário (criar ou editar um registro) com o
  iGreen DS. Use quando o usuário pedir "tela de edição", "cadastro",
  "formulário", "editar X", "novo X", "form multi-step". Ancora no example-edit-page.
---

# page-edit — Tela de edição/cadastro

Tela de formulário (criar/editar). Não gere de memória — puxe e adapte o exemplo.

## Fluxo
1. `npm run igreen:add -- example-edit-page` (traz a tela + `FormField`, `Button`, etc).
2. **Leia** `src/examples/edit-page/edit-page-screen.tsx` + `src/components/ui/FormField/USAGE.md`.
3. Adapte os campos ao caso do usuário (mantendo a estrutura de seções/steps).
4. Registre a rota onde o usuário indicar. `npx tsc --noEmit` limpo.

## Gotchas do tipo
- **Sempre `<FormField>`** (FormFieldInput/Select/Textarea/Switch) — nunca `<label>` cru (peso/cor/dark-mode divergem). Spacing entre campos = `gap-form-gap` (20px).
- Validação inline via `errorMessage` no FormField; helper via `helperText`.
- Multi-step: padrão `StepNav` lateral do example-edit-page (estado `activeStep` + refs de seção).
- Wrapper de página: `flex flex-col h-full min-h-0 gap-gp-2xl`; PageHeader com ações Cancelar/Salvar.
- Ações: Salvar = `<Button color="primary" variant="filled">`; Cancelar = `secondary outline`.

Aplique `DESIGN.md` + `.claude/rules/ds-design.md`. Handoff: `EDIT_PRONTO: <Entidade>` + rota.
