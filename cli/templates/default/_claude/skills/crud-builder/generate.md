# CRUD Builder — Geração

Só entre aqui após o gate aprovado. Ordem obrigatória:

## 1. Puxar do registry (componentes + exemplo canônico)
```bash
npm run igreen:add -- data-table example-clientes
# + example-finance  (se houver drawers de criar/editar/detalhe)
# + outros componentes citados no blueprint (chip, avatar, etc — o registry resolve deps)
```

## 2. LER antes de escrever (precedência de fontes)
1. `src/examples/clientes/clientes-screen.tsx` — o molde real (colunas via `textColumn/currencyColumn/dateColumn/statusColumn/actionColumn`, `useMemo`, toolbar, paginação, seleção).
2. `src/components/ui/DataTable/USAGE.md` + types ao lado — API exata.
3. Pra drawers: `src/examples/finance/components/NovoClienteDrawer` e `.../FinanceDetailPanel`.

Nunca gere props de memória — copie a forma do exemplo.

## 3. Criar a página
- Caminho/rota conforme o blueprint (`PAGES_DIR`/`REGISTRO`).
- Wrapper: `<div className="flex flex-col h-full min-h-0 gap-gp-2xl">` → `<PageHeader .../>` → `<DataTable className="flex-1 min-h-0" .../>`.
- `columns` em `useMemo`; server mode ⇒ `fetchData` em `useCallback`.
- Drawers (se houver): espelhe `NovoClienteDrawer` (Panel + FormField + `gap-form-gap`) e `FinanceDetailPanel` (FloatingPanel), ligados via estado da página (igual ao `finance-screen.tsx`).
- Tokens/spacing/typography conforme `.claude/rules/ds-design.md` + `DESIGN.md`.

## 4. Registrar a rota
No ponto que o usuário indicou (router / App). Página órfã = incompleto.

## 5. Validar
```bash
npx tsc --noEmit   # abort se falhar — corrija antes do handoff
```

## 6. Handoff
`CRUD_PRONTO: <Entidade>` + onde foi registrada + como rodar (`npm run dev`).
Sugira ao usuário abrir a tela e conferir; ofereça ajustes finos (larguras de coluna, filtros).
