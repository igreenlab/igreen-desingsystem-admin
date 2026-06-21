# List Builder — Geração (consumidor)

Só entre aqui após o gate aprovado. Ordem obrigatória:

## 1. Puxar do registry (componente + exemplo canônico)

```bash
npm run igreen:add -- data-list example-mapa-rede
# + outros componentes citados no blueprint (chip, page-header, floating-panel,
#   alert-modal, etc — o registry resolve as deps automaticamente)
```

`data-list` traz junto `list`, `table-toolbar`, `data-table` (via registryDependencies).

## 2. LER antes de escrever (precedência de fontes)

1. `src/examples/mapa-rede/mapa-rede-screen.tsx` — o molde real (DataList
   `layout="hierarchical"` + `branchHighlight` + `renderItem` do card + `fillHeight`
   - painel de detalhe `FloatingPanel` + `AlertModal`).
2. `src/components/ui/DataList/USAGE.md` + `src/components/ui/List/USAGE.md` + types ao lado — API exata.
3. Pra card rico / outros layouts (standard/grouped/DnD): adapte a forma do exemplo.

Nunca gere props de memória — copie a forma do exemplo.

## 3. Criar a página

- Caminho/rota conforme o blueprint (`PAGES_DIR`/`REGISTRO`).
- Wrapper: `<div className="flex flex-col h-full min-h-0 gap-gp-2xl">` → `<PageHeader .../>`
  → `<DataList fillHeight className="flex-1 min-h-0" .../>`.
- Card via **slots** (`leading/title/subtitle/meta/trailing`) OU `renderItem` (card rico).
- Layout `standard`/`grouped`(+`enableDnD`)/`hierarchical`(+`branchHighlight`) conforme blueprint.
- `filterFields` com `accessor: (item) => valor`; views (abas); seleção/bulk; escala
  (`virtualized` XOR `onLoadMore`) — um por vez.
- Painel de detalhe / modais (se houver): espelhe `ConsultorDetailPanel` (FloatingPanel) e
  o `AlertModal` do exemplo, ligados via estado da página.
- Tokens/spacing/typography conforme `.claude/rules/ds-design.md` + `DESIGN.md`.

## 4. Registrar a rota

No ponto que o usuário indicou (router / App). Página órfã = incompleto.

## 5. Validar

```bash
npx tsc --noEmit   # abort se falhar — corrija antes do handoff
```

## 6. Handoff

`LIST_PRONTO: <Entidade>` + onde foi registrada + como rodar (`npm run dev`).
Sugira ao usuário abrir a tela e conferir; ofereça ajustes finos (card, filtros, layout).
