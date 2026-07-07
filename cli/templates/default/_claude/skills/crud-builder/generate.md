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

### Regras de coluna (OBRIGATÓRIO — pega bugs comuns)

1. **Filtro em TODAS as colunas de dados**: cada coluna ganha `enableColumnFilter: true` + `filterType` (text→`"text"`, number/currency/percentage→`"number"`, date→`"date"`, badge/status/select→`"select"`, multiSelect/tags→`"multiSelect"`). Só ficam de fora `actions` e render-custom sem valor. ⚠️ O funil/drawer de filtros só lista colunas com `enableColumnFilter` — marcar só 2 = bug "filtra só 2 colunas".
2. **Coluna `actions` por ÚLTIMO**, `type: "actions"` (via `actionColumn`/`getActions`). O DataTable ancora à direita e estreita por default — não precisa `pinned`/`width`.
3. **Prefira NÃO setar `width`** nas colunas de dados — `autoFit` (default ON) distribui pra preencher o container (sem 1ª coluna esticada, sem scroll). Nunca `autoFit: false` sem motivo. **(v0.22.0+)** `col.width` virou **base/piso** (não trava fixa): o autoFit usa como mínimo e ainda distribui a sobra proporcionalmente — setar `width` em várias colunas **não** deixa mais sobra à direita. Travar de fato = `width`+`maxWidth` iguais (ou `type` fixo). Título do header **nunca trunca** (a largura mínima já inclui o `headerName`).

### Padrões de CÉLULA (consistência finance — OBRIGATÓRIO)

Espelhar `finance-screen.tsx` (puxe `example-finance`). **Componente do DS sempre antes de markup manual**:

- **Coluna primária (nome)**: `isPrimary` + `render` com `<Avatar size="md">` + nome `text-body-sm font-medium` + secundária `text-caption-md text-fg-muted` (email/ID/doc) + ícone "abrir detalhe" (`<SquareArrowOutUpRight>` num `size-[24px] rounded-radius-sm border bg-bg-canvas shadow-sh-sm`) quando o row click abre painel.
- **Status / badge**: `type: "badge"` + `render` com `<Chip variant="soft" size="sm" shape="pill">` (cor semântica). Nunca pill na unha com `<span>` estilizado.
- **Avatar**: `size="md"` na tabela (não `sm`). **Números/moeda/%**: `tabular-nums` + `type` (`currency`/`percentage`) + `align: "right"`. **Tags**: `type: "tags"` + `<Chip soft sm rounded>`.

### Detail panel (row click → painel)

Espelhe `FinanceDetailPanel` — **sempre** `<FloatingPanel>` (não markup solto):
`titleSlot` (Avatar lg + nome + `ID · Chip status`) · `headerActions`/`footer` com `<Button>` · `bodyPadded={false}` · **agrupar por categoria** em `<FloatingPanelSection title>` · cada dado simples = **uma linha** `<FloatingPanelField label value/>` (lista) · destaque (saldo/progresso) = bloco próprio · conteúdo rico (checklist/extrato) mantém formato próprio dentro da Section (NÃO forçar em Field).

- **Tabela + Lista (toggle)**: se o usuário quer alternar entre tabela e uma **lista de cards** (não kanban), use `viewMode` + `listConfig={{ renderItem(row), paginated?, hierarchical?, getPath?, getMenuItems? }}` no próprio `<DataTable>` — mesma toolbar, toggle Tabela/Lista automático. NÃO monte um `<DataList>` paralelo + toggle na mão.
  - **Lista flat paginada**: `listConfig.paginated: true` — a lista usa a MESMA paginação da tabela + mostra o footer. Default `false` (mostra todas, sem footer); ignorado em `hierarchical`. Use quando a lista flat puder ter muitas linhas.
- **Visões pré-definidas read-only (`allowCreateView={false}`, v0.23.0+)**: passe `defaultViews={[presetView({ id, name, filters?, sort?, viewMode? })]}` + `persistId` pras abas nativas da tela. `allowCreateView={false}` esconde o botão "+" (o usuário não salva visões próprias — só usa as suas). Default `true`. **viewMode "sticky"**: trocar de visão só muda Tabela↔Lista↔Kanban se o preset declarar `viewMode` explícito; sem isso, mantém a view que o usuário está vendo (só declare `viewMode` no preset que DEVE forçar uma view).
  - Lista árvore **+ tabela árvore**: `hierarchical` + `getTreeDataPath` (tabela não pagina).
  - **Tabela FLAT paginada + lista em ÁRVORE**: `hierarchical` + **`listConfig.getPath`** e NÃO passe `getTreeDataPath` (senão a tabela vira tree-data e perde paginação).
- Drawers de criar/editar: espelhe `NovoClienteDrawer` (Panel + FormField + `gap-form-gap`), ligados via estado da página (igual ao `finance-screen.tsx`).
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
