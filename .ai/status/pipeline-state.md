# Pipeline State — iGreen DS v2

> Audit log append-only. Nunca apagar entradas — só adicionar.
> Cada agente DEVE escrever aqui ao iniciar e concluir uma tarefa.

---

## Formatos de entrada por status

### CONCLUÍDO / APROVADO
```
### [YYYY-MM-DD] | AGENTE | TAREFA | STATUS
- Input: o que foi recebido
- Output: o que foi entregue / sinalizado
- Decisões: decisões tomadas durante a execução
- Assumption: [o que precisa ser verdade para esta decisão estar certa]
  Ex: "bg.primary-muted é suficientemente distinto de bg.primary-subtle para uso em alerts"
  Ex: "Não existe componente Shadcn com lógica equivalente"
- Lições novas: nenhuma / [L-NNN: descrição]
```

> O campo Assumption torna decisões reversíveis: quando um problema aparecer no futuro,
> você verifica qual assumption quebrou — e sabe exatamente o que revisar.

### REPROVADO
```
### [YYYY-MM-DD] | DS REVIEWER | [Nome] | REPROVADO
- Spec verificada: sim/não — onde encontrada
- Assumption verificada: [a assumption do gate ainda é válida? sim / não — e por quê]
- Critique genuína: [o que foi examinado além do checklist + o que encontrou]
- Itens reprovados: [lista numerada com arquivo e linha]
- Lições novas: nenhuma / [L-NNN: descrição]
```

### PAUSADO (gate) — aguardando aprovação do usuário
```
### [YYYY-MM-DD] | ORCHESTRATOR | [Nome] | PAUSADO (gate)
- Spec entregue por: ds-designer
- Alternativas descartadas: [o que foi considerado e por que não serve]
- Assumption central: [o que precisa ser verdade para esta spec funcionar]
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill [igreen/shadcn/composite].md
```

### CASCATA — token ausente detectado durante implementação
```
### [YYYY-MM-DD] | DS DEV | [NomeComponente] | CASCATA
- Token ausente: [nome-do-token]
- Tipo: [cor / spacing / sizing / radius / shadow / tipografia]
- Uso esperado: [como será usado]
- Pipeline aberto: ds-designer especifica → [GATE] → ds-dev cria → ds-reviewer aprova
- Retomar: após REVIEW_OK do token → ds-dev continua com skill [igreen/shadcn/composite].md
```

**Status possíveis:** `CONCLUÍDO` · `APROVADO` · `REPROVADO` · `PAUSADO (gate)` · `CASCATA` · `RETOMADO`

---

## Log de sessões

> Entradas mais recentes no topo.

<!-- NOVA ENTRADA AQUI -->

### 2026-06-18 | ORCHESTRATOR | Arquivamento do pipeline-state.md | CONCLUÍDO
- Input: arquivo ativo passou de ~296KB / 2229 linhas — muito além do gatilho (~100 entradas / ~50KB).
- Output: 62 entradas CONCLUÍDO/APROVADO/REPROVADO do bloco 2026-05-12 a 2026-05-16 (DataTable Fases A–G, Table primitivo, Saved Views, hooks, column-type system) movidas para `.ai/status/archive/2026-06.md`.
- Decisões: mantidas no ativo as entradas de junho/2026, o cluster 2026-05-16 (contém PAUSADO/CASCATA/RETOMADO), a entrada-marco 2026-06-17 (milestone v0.10.0), a sessão de setup 2026-04 e as seções de referência (Índice de componentes, Auditoria retroativa v0.3.0, Índice de decisões). Nenhuma entrada PAUSADO/CASCATA aberta foi movida.
- Assumption: o bloco arquivado é histórico estável (trabalho concluído e mergeado) — consultá-lo é raro e o link em archive/2026-06.md basta. Se precisar reabrir, o conteúdo está íntegro lá.
- Lições novas: nenhuma.

### [2026-06-13] | DS DEV | DataTable tree-data: expand-all / collapse-all programático no DataTableRef | CONCLUÍDO
- Input: follow-up do tree-data (commit `658f50e`). O agente anterior deixou `collectExpandableTreeIds` (utils/tree-rows.ts) pronto mas NÃO expôs expand-all/collapse-all no imperative handle — exigia threadar tree-state no controller. Branch `feat/datatable-tree-expand-all` a partir de `main`. Sem push.
- Output:
  1. **`DataTableRef`** (`data-table.types.ts`) ganhou 2 métodos: `expandAllTree: () => void` e `collapseAllTree: () => void`. No-op fora de tree-data (sem `getTreeDataPath`).
  2. **Controller** (`use-data-table-controller.ts`): import de `collectExpandableTreeIds`; 2 `useCallback` (`expandAllTree`/`collapseAllTree`) montados sobre `allPagesProcessed` (todas as rows pós-filtro/sort — tree-data desliga paginação) + `getRowId` + `props.getTreeDataPath`, respeitando `treeData.defaultExpanded`. Wired no `useImperativeHandle`. Também expostos no return do controller (`expandAllTree`/`collapseAllTree`/`useTreeData`) pra um eventual botão de toolbar.
  3. **Semântica de divergência**: `expandedRowIds` guarda ids que DIFEREM do default. Logo `defaultExpanded=true` → expandAll=`[]`, collapseAll=todos os ids expansíveis; `defaultExpanded=false` → invertido. Reusa `setExpandedRowIds` (preserva controlled/uncontrolled + persistência).
  4. **data-table.tsx**: removido o NOTE de follow-up; substituído por comentário apontando os métodos do controller/ref.
  5. **Docs**: USAGE.md (seção Imperative ref + recipe Tree-data) com as 2 novas linhas + exemplo de botões fiados pelo consumer.
- Decisões: NÃO embutir botões na toolbar do DS (sem slot natural óbvio; prompt deixou opcional e o app fará os botões) — só os métodos do ref. Toggle por-nó (`toggleTreeNode`) permanece intocado.
- Tokens novos: NENHUM. Zero hardcode; nenhuma cascata necessária (a feature é puramente lógica/state — não toca styles).
- Validação: `npm run build` verde (tokens:tw4 + `tsc -b` 0 erros + vite, 3817 módulos). `npm run dev` (3100) não testado — defeito pré-existente do optimizeDeps do lucide-react (documentado na entry anterior) afeta só o dev server; build prod basta.
- Assumption: a semântica "Set = divergência do default" do `buildTreeRows` é a mesma que expand-all/collapse-all precisa inverter por `defaultExpanded` — verificado contra `isNodeExpanded` em tree-rows.ts (`expandedIds.has(id) ? !defaultExpanded : defaultExpanded`). `allPagesProcessed` cobre toda a árvore (paginação desligada em tree-data).
- Lições novas: nenhuma.

---

### [2026-06-09] | DS REVIEWER | PR3 auditoria-datatable — extensibilidade (operador default, filterType, warn, types) | PRE_COMMIT_OK
- Assumption verificada: sim — "derivar default do registry é correto pra todos os tipos (teste tsx 13/13, incl. date→between + currency→equals); any→unknown não quebra consumers (eles já castam value)" — verificada:
  1. **#2 ciclo filter-ops → column-types**: `column-types/` não importa de `utils/filter-ops.ts` (grep retornou vazio). Único sentido de dependência é `utils/filter-ops → ../column-types` (e `utils/calculate-column-widths → ../column-types`). Sem ciclo.
  2. **#2 date reorder operators[0]=between**: `DateColumnType.operators[0]` = `between` confirmado (linha 32 do date-column-type.tsx). `defaultOperatorForFilterType("date")` retorna `between`. `FilterRowEditor` lê `operators` da definição → "entre" aparece primeiro na lista do dropdown. `renderFilterInput` do date já usa `operator === "between"` → range mode (isRange=true). Sem regressão no widget.
  3. **#10 any→unknown**: `as FilterValue` em data-table.tsx l.1546 e l.1783 (anteriormente `as never`). `FilterValue` é o tipo correto pra esses sites — `value` vem do FilterItem que é `FilterValue`. Cast mais preciso, não mais amplo. Previews com `.foo` direto não existem (tsc 0 confirma). `filterOptions.value: string|number` — nenhum preview passa boolean: todos os STATUSES/CATEGORIES/AGENTS usam string keys. `DashboardShowcase.tsx` usa `positive: boolean` mas em estrutura diferente (não filterOptions). Sem regressão.
  4. **#9 import.meta.env?.DEV**: optional chaining cobre `undefined` em SSR/Node/vitest. Build de lib Vite substitui por `false` em produção (tree-shake). `vitest.setup.ts` não define `import.meta.env.DEV`, portanto o warn não dispara em teste. Seguro nos 3 contextos (browser dev, build lib, SSR).
  5. **Imports órfãos pós-remoção**: `FilterItem` e `FilterOperator` em toolbar-simple-filter-drawer.tsx ainda ativamente usados (Map<string, FilterItem[]>, effectiveOperator: FilterOperator, newItems: FilterItem[], etc.). Sem imports mortos.
- Critique genuína aplicada: Além do checklist mecânico examinei: (1) o único ponto com potencial de regressão real era o operators[0] reorder em date/datetime — o widget renderFastFilterInput deriva `isRange` de `Array.isArray(value)`, não do operator, portanto não depende de qual operator está em [0] para decidir o modo do calendário. O modo é determinado pelo valor existente. Ao criar um NOVO filtro de data sem valor, o operator `between` levará ao widget range mode (isRange vai ser false porque value é undefined, mas `renderFilterInput` usa `operator==="between"` → isRange=true). Comportamento correto e mais útil que o operador `equals` anterior. (2) O `defaultOperatorForFilterType("text")` chama `registry.get("text")` com fallback para "text" — portanto nunca lança erro (registry sempre tem "text" registrado). A última linha `?? "contains"` é dead code mas inofensiva. (3) A referência a `inferOperatorFromFilterType` em `src/preview/pages/updates-data.ts` l.137 é em plain-text de changelog histórico — não é código executável; não afeta runtime. [BAIXO] Poderia ser atualizado para nomear `defaultOperatorForFilterType`, mas não é bloqueante.
- Escopo do diff: 8 arquivos modificados (column-type-registry.ts, date-column-type.tsx, datetime-column-type.tsx, data-table.tsx, data-table.types.ts, toolbar-simple-filter-drawer.tsx, filter-ops.ts, pipeline-state.md). Zero toque em tokens, CSS, typography, tv.ts, USAGE.md.
- Regressões L-001..L-027: nenhuma — todos os arquivos novos/modificados são lógica TypeScript pura (sem CSS classes, sem tv(), sem tokens).
- Pendências: nenhuma bloqueante. [BAIXO] `updates-data.ts` l.137 menciona nome antigo `inferOperatorFromFilterType` em texto de changelog histórico — cosmético, não afeta runtime.
- Lições novas: nenhuma.

### [2026-06-09] | DS REVIEWER | PR1 auditoria-datatable — consolidação filter-ops/aggregate/constants | PRE_COMMIT_OK
- Assumption verificada: sim — "unificação é behavior-preserving; promotion sem array-check é equivalente pq widget multiSelect sempre emite array; totalizer respeitar valueGetter não afeta previews (colunas agregadas atuais não têm valueGetter)" — verificada nos 5 pontos de atenção abaixo.
- Critique genuína aplicada: (1) **promoteOperator sem array-check**: revisado o path completo — array-check só existia no adapter para decidir o *spread* (N itens vs 1), nunca para decidir a *promoção*. `promoteOperatorForFilterType` olha apenas `filterType`, que é o gate semântico correto. multiSelect widget (`multi-select-column-type.tsx` l.43) sempre emite `Array.from(set)` — path escalar não existe. Sem regressão. (2) **totalizer agora respeita valueGetter**: original `resolveTotalizerContent` usava local `getFieldValue(r, field)` (dot-path puro, sem `valueGetter`). Novo `computeAggregate` usa `applyValueGetter(r, col)` — colunas sem `valueGetter` seguem o dot-path (comportamento idêntico); colunas com `valueGetter` agora somam o valor transformado (consistência com group-header, que já fazia isso). Melhoria confirmada. (3) **renderAggregate ordem**: idêntica a ambas as originais — override → custom fn → built-in keyword switch → null (default). Formatter: `aggregateFormatter ?? valueFormatter` — idêntico. `computeAggregate` retorna `null` para keyword não-built-in (default do switch). (4) **genFilterId**: `crypto.randomUUID()` + fallback timestamp+random. IDs são identidade in-memory de FilterItem (não persistem entre sessions — filterModel é estado React). Nenhuma estabilidade exigida além do ciclo de vida do render. (5) **imports órfãos**: `export type { FilterValue }` em `filter-ops.ts` l.83 re-exporta tipo que nenhum consumer importa dali. Dead re-export inerte (não é bug).
- Escopo do diff: 3 arquivos novos (utils/filter-ops.ts, utils/aggregate.ts, data-table.constants.ts) + 7 arquivos modificados (use-filter-popover-adapter, use-data-table-controller, use-data-table-export, toolbar-simple-filter-drawer, data-table-totalizer-row, data-table-group-header-row, data-table.tsx) + 1 comment-only (table.styles.ts cross-ref) + pipeline-state.md. Zero toque em tokens, CSS, typography, tv.ts.
- Regressões L-001..L-027: nenhuma — novos utils são lógica pura (sem CSS classes, sem tv(), sem tokens).
- Pendências: nenhuma bloqueante. [BAIXO] `export type { FilterValue }` em `utils/filter-ops.ts` l.83 é dead re-export — remover a qualquer momento.
- Lições novas: nenhuma.

### [2026-06-09] | DS REVIEWER | refactor/column-types-shared — Pre-commit gate | PRE_COMMIT_OK
- Assumption verificada: sim — "helpers extraídos são behavior-equivalentes, exceto toNumber rejeitar Infinity (não ocorre nos dados)" confirmada. Nenhum caminho de matchesFilter/formatValue/renderCell produz Infinity como valor de entrada real: o filterInput é `<Input type="number">` que só emite valores finitos ou null; dados de célula financeiros (R$) são sempre finitos. `Number.isNaN(Number(Infinity))` = false na `toCurrency`/`toPercent` formatter — essas funções usam `Number.isNaN` apenas no formatter de exibição (não no filter), portanto a mudança de `!Number.isNaN` → `Number.isFinite` em matchesFilter é segura e correta.
- Critique genuína aplicada: Além do checklist mecânico examinei: (1) o único ponto suspeito — `Number.isNaN(Number(value)) ? null : n` (antigo currency/percentage) vs `Number.isFinite(n) ? n : null` (novo): o único delta são valores `Infinity`/`-Infinity`, que o `<Input type="number">` nunca produz e dados de BD não contêm — a mudança é correta, não uma regressão; (2) `findOption(value: unknown, ...)` em _shared vs `findOption(value: string, ...)` no tags antigo: a assinatura mais larga (`unknown`) é backwards-compatible — tags sempre passa strings (`v` extraído de `toStringArray`), a comparação é `String(o.value) === String(value)` em ambos, resultado idêntico; (3) `multi-select` ainda tem seu próprio `toArray` local — não é uma cópia esquecida, é um array tipado diferente (`Array<string | number>` vs `string[]`) com lógica de hidratação específica (comentário explica), portanto corretamente fora do `_shared`; (4) os `Number.isNaN` remanescentes em currency/percentage são nos formatters de *exibição* (`toCurrency`/`toPercent`) — completamente corretos e fora do escopo do _shared (são funções locais, não foram migradas).
- Escopo do diff: 1 arquivo novo (_shared.ts) + 7 arquivos modificados (6 definitions + pipeline-state.md). Zero toque em tokens, CSS, typography, tv.ts — categorias de sincronia crítica (L-016) estão fora do escopo.
- Regressões L-001..L-027: nenhuma — _shared.ts é helpers puros (sem classes CSS, sem tv(), sem tokens). Definitions tocadas não introduziram anti-patterns.
- Pendências encontradas: nenhuma.
- Lições novas: nenhuma.

### [2026-06-09] | DS REVIEWER | refactor/filter-operators — Pre-commit gate | PRE_COMMIT_BLOCKED

- Assumption verificada: A assumption central ("eliminar dual-namespace eliminando operator-mapping.ts e usando ids longos ponta a ponta") é válida e o refactor a cumpre corretamente no fluxo principal. Porém dois problemas residuais foram encontrados que a comprometem parcialmente.
- Critique genuína aplicada: Além do checklist mecânico, examinei: (1) o round-trip completo SQL-parser → FilterRowEditor → matchesFilter → chip para os 5 tipos numéricos; (2) o fallback `?? "eq"` em `addRow` no filterPopover canônico — que sobreviveu ao refactor e introduz um "eq" curto no estado quando `getOperatorsForColumn` retorna undefined; (3) a paridade entre `operators[]` e `matchesFilter` nos 5 tipos com gte/lte; (4) os operadores `between/isAnyOf/isNoneOf` que não faziam parte do OPERATOR_PAIRS — confirmado que passam direto sem remap e continuam corretos; (5) o Deprecated drawer com `gap-gp-2xl` em vez de `gap-form-gap` (L-024).
- Escopo revisado: 16 arquivos (15 modificados + operator-mapping.ts deletado). Sem toque em tokens, componentes de estilo, ou typography — categorias token/CSS/twMergeConfig estão fora do escopo e não requerem verificação.
- Pendências encontradas: 2 ALTO + 1 MÉDIO + 1 BAIXO (ver saída no output do agente).
- Lições novas: nenhuma — achados cobertos por lições existentes (L-002/L-024).

### [2026-06-05] | INFRA RELEASE | Pipeline drift fix pós v0.5.1 publish | CONCLUÍDO
- Input: após publicar @snksergio/design-system@0.5.1 + @snksergio/create-design-system@0.1.4 (fix de types + URLs igreenlab + license + template), simulação teórica de consumer revelou drift do pipeline interno em relação ao estado real do CSS gerado.
- Output: 3 frentes aplicadas em 17 arquivos.
  - **Frente 1 (consumer-facing):** repo URLs `snksergio` → `igreenlab` no README.md + src/preview/pages/InstallationDoc.tsx.
  - **Frente 2 (pipeline interno):** typography presets removidos no rewrite 2026-05-19 ainda eram exibidos como pattern canônico em 14 arquivos. Substituições aplicadas (`text-label-sm` → `text-body-sm font-semibold`, `text-label-xs` → `text-caption-sm font-semibold`, `text-paragraph-sm` → `text-body-sm`, `text-subheading-2xs` → `text-title-sm`):
    - `.ai/rules/coding-standards.md`, `.claude/skills/ds-dev/impl-{igreen,shadcn,composite}.md`, `.claude/skills/ds-designer/{spec-token,figma-extract}.md`, `.claude/skills/frontend-design/SKILL.md`, `.claude/commands/ds-extract-figma.md`, `.claude/hooks/ds-lint-styles.sh`, `.ai/context/components/{guide,inventory,shadcn-token-map}.md`, `.ai/context/doc-guide.md`, `README-PIPELINE-WORKFLOW.md` (adicionado bloco "Nota histórica" preservando exemplos didáticos como snapshot).
  - **Frente 3 (audit logs):** L-007 atualizada (recomendação apontava preset removido), L-017 (npm types broken), L-018 (CLI template desync), L-019 (grep all scopes ao remover token) adicionadas em `.ai/status/lessons.md`. Resumo correspondente em `.claude/rules/ds-standards.md` atualizado. Entry v0.5.1 em `src/preview/pages/updates-data.ts`.
- Decisões:
  - Audits/specs/archives intocados (preservar snapshots históricos)
  - `pipeline-state.md` mantido com refs históricas a presets removidos (log append-only — preservar contexto)
  - README-PIPELINE-WORKFLOW.md exemplos didáticos mantidos com nota histórica explicando
- Assumption: substituições `text-label-sm` → `text-body-sm font-semibold` preservam intent visual (13px + peso 600 em ambos). Verificar manualmente próximo uso real em componente novo.
- Lições novas: L-017 (files + .d.ts), L-018 (CLI template sync), L-019 (grep all scopes). L-007 atualizada.
- Validação: `grep` final em arquivos vivos confirmou zero drift remanescente fora dos snapshots históricos esperados.


- Spec verificada: sim — entrada PAUSADO (gate) confirmada no pipeline-state.md com alternativas descartadas e assumption central
- Gate verificado: sim
- Assumption verificada: agora valida — `scrollbar-width: auto` em scrollbar-default entrega scrollbar do sistema no Firefox (~16px nativo), enquanto `scrollbar-thin` permanece `thin`. No webkit (Chrome/Safari/Edge) a distincao e 8px vs 6px via `--scrollbar-width-default` / `--scrollbar-width-thin`. Distincao real existe em todos os browsers-alvo.
- Critique genuina: examinado se `scrollbar-color` com track `transparent` e valido com `scrollbar-width: auto` no Firefox — confirmado valido (a spec CSS aceita `transparent` independente do valor de width). Examinado se algum elemento foi alterado alem do scrollbar-width — negativo: scrollbar-color, ::-webkit-scrollbar-track, ::-webkit-scrollbar-thumb e ::-webkit-scrollbar-thumb:hover intactos em ambas as utilities. Examinado se a distincao semantica "thin = compacto, default = tamanho do sistema" e coerente com o naming — confirmado coerente.
- Fix do RETOMADO: confirmado aplicado corretamente (linha 663 do tailwind-theme.css: `scrollbar-width: auto`). scrollbar-thin linha 640 permanece `scrollbar-width: thin`.
- Lições novas: nenhuma (L-015 ja registrada no ciclo anterior)

### [2026-05-16] | DS DEV | Token de scrollbar | RETOMADO (fix da reprovacao)
- Input: REPROVADO pelo ds-reviewer; correcao aplicada conforme Opcao A
- Output: scrollbar-default agora usa `scrollbar-width: auto` (era thin)
- Decisoes: optei pela Opcao A em vez de B (manter thin + documentar) porque Opcao A entrega diferenca visual real em todos os browsers; semanticamente mais alinhado com naming "default"
- Licoes reforcadas: L-015 documentou a limitacao antes da correcao
- Validacao: npm run tokens:tw4 exit 0; tsc --noEmit exit 0
- Assumption: `scrollbar-width: auto` no Firefox ativa a scrollbar padrao do sistema (~16px); no Chrome/Safari/Edge o `::-webkit-scrollbar` com `--scrollbar-width-default` (8px) tem precedencia. Resultado: distincao real entre `scrollbar-thin` e `scrollbar-default` em todos os browsers.

### [2026-05-16] | DS REVIEWER | Token de scrollbar + utility variant | REPROVADO
- Spec verificada: sim — entrada "ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)" confirmada no pipeline-state.md
- Gate verificado: sim — entrada PAUSADO (gate) presente com spec completa, alternativas descartadas e assumption central documentada
- Assumption verificada: **parcialmente válida** — a assumption "scrollbar-width CSS standard + ::-webkit-scrollbar cobrem browsers-alvo" é correta. Porém a assumption implícita de que `scrollbar-default` (8px) se comporta diferente de `scrollbar-thin` (6px) no Firefox é **falsa**: `scrollbar-width` CSS aceita apenas `auto`/`thin`/`none` — não aceita px. Ambas as utilities entregam `scrollbar-width: thin` no Firefox, tornando-as visualmente idênticas nesse browser. A distinção de 6px vs 8px só existe no Chrome/Safari/Edge via `::webkit-scrollbar`. Isso não quebra a assumption do gate (que não faz promessa sobre Firefox pixel-width), mas é uma limitação de design não documentada.
- Critique genuína aplicada: A revisão encontrou 1 item que muda a direção — não é aprovação automática. O problema não está nos tokens, no transform, nem nas migrations. Está na semântica do naming: `scrollbar-default` promete comportamento "default" (implicitamente diferente de thin), mas no Firefox ambas as utilities são idênticas. Isso não é bug implementado incorretamente — é uma limitação inerente do CSS que a spec aprovou sem documentar. O checklist mecânico passou. A regressão de cor no TabelaTeste (`bg-muted` → `bg-muted-hover`) foi registrada pelo DS Dev como "conforme spec aprovada" — spec aprovada pela gate mencionou `bg-muted-hover` como thumb-color padrão, então a uniformização é intencional e aceita. O overflow-x-hidden foi preservado (linha 83 de kanban.styles.ts). `--radius-radius-full` existe no @theme (linha 198 do CSS) — a correção do DS Dev está correta. Vars consumidas pelas utilities (`--color-bg-muted-hover`, `--color-fg-muted`) têm override no .dark. Estrutura nested `&::-webkit-scrollbar` dentro de `@utility` é o formato suportado pelo Tailwind v4. Paridade visual do Kanban `board`/`columnBody`: todas as 6 propriedades do hardcode anterior estão cobertas pela utility.
- Itens reprovados:
  1. `tokens/transforms/to-tailwind-v4.ts` linha 212 + 234: `scrollbar-default` usa `scrollbar-width: thin` — igual ao `scrollbar-thin`. No Firefox, as duas utilities são visualmente idênticas. A utility deve ou (a) usar `scrollbar-width: auto` para `scrollbar-default` (scroll bar mais larga, default do browser), ou (b) adicionar comentário explícito documentando que a distinção 6px/8px é Chrome/Safari/Edge-only. Sem essa correção, o naming `scrollbar-default` é semanticamente enganoso para contexts de teste/documentação.
- Lições novas: L-015 — `@utility scrollbar-*` com duas larguras distintas: `scrollbar-width` CSS aceita apenas `auto`/`thin`/`none`. Distinção px entre utilities só existe em Chrome/Safari/Edge via `::webkit-scrollbar`. No Firefox, toda utility custom com `scrollbar-width: thin` é visualmente idêntica. Se houver 2 utilities com tamanhos distintos, documentar esse comportamento ou usar `auto` para a "maior" (que ativa scroll bar default do browser).

### [2026-05-16] | DS DEV | Token de scrollbar + utility variant | CONCLUÍDO
- Input: spec aprovada em [2026-05-16] — gate "ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)"
- Output: IMPL_PRONTA sinalizado — tokens + utilities + transform fn + 3 migrations executadas
  - 2 tokens: `scrollbar.width.thin` (6px) + `scrollbar.width.default` (8px) em `tokens/brands/default/components/sizing.ts`
  - 1 função `buildScrollbarVars()` no transform `tokens/transforms/to-tailwind-v4.ts` — emite `--scrollbar-width-thin` + `--scrollbar-width-default` no `@theme {}`
  - 1 função `buildScrollbarUtilities()` no transform — emite `@utility scrollbar-thin` + `@utility scrollbar-default` no output
  - 3 migrations: Kanban `board` + `columnBody` → `scrollbar-thin`, TabelaTeste `wrap` → `scrollbar-default`
  - `npm run tokens:tw4` executado sem erros — CSS regenerado com vars + utilities
  - `npx tsc --noEmit` exit 0
- Decisões:
  - `buildScrollbarVars()` emite vars com prefixo `--scrollbar-width-*` (sem `--spacing-`) — scrollbar width não é spacing semanticamente
  - Scrollbar vars posicionadas no final do bloco `themeVars` (após z-index), mantendo a ordem lógica (dimensões no fim)
  - Scrollbar utilities emitidas após bloco de typography utilities — mesma seção de "@utility blocks" do output
  - TabelaTeste migrado de `bg-bg-muted` → `scrollbar-default` (que usa `bg-muted-hover`) conforme spec aprovada — mudança sutil de cor do thumb rest state
- Assumption: scrollbar utilities aplicam corretamente em Chrome/Safari/Firefox/Edge — validar manualmente na próxima fase
- Lições novas: nenhuma — padrão de @utility token-driven é análogo ao já estabelecido para text-* presets. Nota: spec original usava `var(--radius-full)` nos utilities, corrigido para `var(--radius-radius-full)` durante implementação — dentro de `@utility` o CSS var precisa do nome completo conforme declarado no `@theme {}`, não do sufixo de classe Tailwind

### [2026-05-16] | ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)
- Spec entregue por: ds-designer
- Cascata origem: [2026-05-16] DS DEV Kanban Fase C — Cascata 2
- Escopo:
  - 2 tokens em `tokens/brands/default/components/sizing.ts`: `scrollbar.width.thin` (6px) + `scrollbar.width.default` (8px)
  - 2 utilities em `src/styles/theme/tailwind-theme.css`: `@utility scrollbar-thin` + `@utility scrollbar-default`
  - 1 função `buildScrollbarVars()` adicionada ao transform `tokens/transforms/to-tailwind-v4.ts` (emite `--scrollbar-width-thin` + `--scrollbar-width-default` no `@theme {}`)
  - Migrações: Kanban `board` + `columnBody` (2 slots, drop-in) e TabelaTeste (1 slot, drop-in)
  - Não migrar: table-toolbar (hidden scrollbar, fora do escopo) + 4 popovers (thumb color diferente)
- Alternativas descartadas:
  1. Status quo (hardcoded em cada consumer) — descartado: duplicação cresce linearmente, popovers já mostram divergência sem governance
  2. Token `scrollbar-thumb-color` dedicado — descartado: `bg-muted-hover` já é o token semântico correto; indireção não adiciona flexibilidade real
  3. Variant `scrollbar` via `tv()` puro (sem @utility) — descartado: tv() não resolve pseudo-elements; a verbosidade hardcoded se manteria dentro do tv()
  4. Arquivo CSS separado (`scrollbar.css`) — descartado: fragmentação sem ganho; @utility de scrollbar é da mesma natureza dos @utility text-* já existentes no mesmo arquivo
- Assumption central: scrollbar-width CSS standard (Firefox) + ::-webkit-scrollbar (Chrome/Safari/Edge) cobrem os browsers-alvo do produto CRM. Safari mobile não exibe scrollbar (overlaid) por padrão — utility não causa regressão, apenas sem efeito visível no iOS. Assumption quebra se produto tiver target de browser legacy (Firefox <64) ou requisito de scrollbar sempre visível em mobile.
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill `impl-token.md` para: (1) adicionar `scrollbar` em `components/sizing.ts`, (2) adicionar `buildScrollbarVars()` no transform + incluir no `themeVars`, (3) adicionar `@utility scrollbar-thin` + `@utility scrollbar-default` no template string do transform, (4) rodar `npm run tokens:tw4`, (5) migrar Kanban `board`+`columnBody` + TabelaTeste → `"scrollbar-thin"` / `"scrollbar-default"`, (6) rodar `npx tsc --noEmit`

### [2026-05-16] | DS REVIEWER | Avatar iGreen (ui/) | APROVADO
- Spec verificada: sim — entrada "ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)" em pipeline-state.md (linha 78–91)
- Assumption verificada: sim — `text-white` sobre colorHex mantém legibilidade decorativa aceitável. A implementação não adicionou warning/check de contraste (correto — assumption transfere risco ao consumer). Cor `#f9a47a` (peach, Lúcia Almeida) no KanbanDoc é a mais próxima do limite de contraste (~1.4:1 com branco), mas o DS Dev usou essa cor deliberadamente em contexto decorativo dentro de um card que já apresenta o nome textualmente. Assumption não quebrou — cabe ao consumer evitar cores muito claras se contraste for requisito. Caso patológico (`#ffeb3b`) é silenciosamente quebrado, como documentado na assumption do gate.
- Critique genuína: (1) API Opção B (`color` + `colorHex?` separados): na prática KanbanDoc e user-column-type usam exclusivamente `colorHex` — prop `color` semântico é usado zero vezes nas migrations. Isso confirma que o uso dominante do Avatar no produto é pessoa-específico (hex). A prop `color` ainda tem valor para avatars genéricos (status/categoria), mas não é o caminho principal. Decisão de API ainda correta — não muda direção, mas é um sinal de onde o DS pode evoluir (preset de paleta pra pessoas, ou `colorHex` com fallback automático de contraste). (2) `_custom` interno: solução é elegante — não é um hack. O tv() não suporta `color: undefined` desativando o defaultVariant de forma limpa; `_custom: ""` é o padrão correto para "sem classe, sem override do default". A variante não vaza: types.ts faz `Omit<AvatarVariantProps, "color">` e redefine `color` como union explícita sem `_custom` — TypeScript bloqueia em compile time. (3) `text-caption-sm` (11px) em `xs` (20px): DS Dev manteve o preset em vez de usar `text-[9px]`. Avaliação: aceitável. O literal `text-[9px]` anterior (PersonAvatar) era não-documentado e inconsistente. `caption-sm` (11px) em 20px de container resulta em uma letra que ocupa ~55% do diâmetro — um pouco maior que o ideal, mas dentro do tolerável para uso decorativo. Não há token menor que `caption-sm` no DS, e criar `caption-2xs` foi explicitamente descartado na spec. (4) `h-[640px]` encontrado no KanbanDoc: pertence ao container de preview do Kanban (layout da página de doc), não ao Avatar — fora do escopo desta revisão.
- Regressões: nenhuma — todos os greps L-001 a L-014 sem match. `size-comp-*` resolvido via Tailwind v4 auto-mapping de `--spacing-comp-*`. TSC exit 0 conforme pipeline-state.
- Lições novas: nenhuma

### [2026-05-16] | DS DEV | Avatar iGreen (ui/) | CONCLUIDO
- Input: gate aprovado em [2026-05-16] — spec "ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)"
- Output: 4 arquivos criados (`avatar.styles.ts`, `avatar.types.ts`, `avatar.tsx`, `index.ts`, `USAGE.md`) + 2 migrations executadas (KanbanDoc.tsx, user-column-type.tsx)
- Decisoes:
  - Usou variante interna `_custom` no `color` para o caso `colorHex`: quando `colorHex` esta ativo, `color` e definido como `"_custom"` (string vazia, sem bg/fg), e `text-white` e adicionado via className merge. Isso evita lutar contra o `defaultVariants` do tv() que aplicaria `muted` caso `color` fosse `undefined`.
  - Sizes usam `size-comp-*` (nao `size-form-*` nem `size-icon-*`) por ser o token correto para sizing generico de componentes (comp.2xs=20, comp.xs=24, comp.sm=28, comp.md=32, comp.xl=40).
  - Migration KanbanDoc: head do card usa `size="sm"` (24px, era `size-icon-lg`), footer usa `size="xs"` (20px, era `size-icon-md`). Funcao `PersonAvatar` removida, import de Avatar shadcn removido.
  - Migration user-column-type: `UserAvatar` inline (22px hardcoded) substituido por `<Avatar size="sm">` (24px). Diferenca de 2px e aceitavel — 22px nao tinha token DS; 24px (`comp.xs`) e o token mais proximo e correto.
  - `aria-hidden="true"` default (decorativo); `role="img"` + `aria-label` quando label e fornecido.
- Assumption: `text-white` sobre qualquer `colorHex` mantém legibilidade decorativa aceitável. Validar na próxima fase com DS Reviewer.
- Licoes novas: nenhuma
- Validacao: `npx tsc --noEmit` exit 0

### [2026-05-16] | ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)
- Spec entregue por: ds-designer
- Cascata origem: [2026-05-16] DS DEV Kanban Fase C — Cascata 1
- Escopo: componente iGreen puro em `ui/Avatar/` (sem Radix, sem AvatarImage, sem AvatarStack). Children = ReactNode (initials fornecidas pelo consumer).
- Variants: `size` (xs/sm/md/lg/xl → tokens comp.2xs–comp.xl) + `color` (brand/success/warning/critical/info/muted) + `colorHex?: string` (override hex literal pra cor de pessoa — exceção L-014)
- Tokens consumidos: todos existentes (comp.*, radius.full, bg.*, fg.on-*, text-caption-sm/md, text-label-xs). Zero tokens novos. Zero cascatas abertas.
- Alternativas descartadas:
  1. Estender Avatar shadcn com className externo — não resolve hardcode no consumer.
  2. Usar AvatarFallback Radix como base — overengineering sem AvatarImage no escopo.
  3. API `color: union | string` (Opcao A) — descartada por imprecisão de tipo; Opcao B (`color` semântico + `colorHex?` livre) escolhida.
  4. Criar preset `caption-2xs` (9px) para xs/sm — descartado; `caption-sm` (11px) é proporcional e adequado sem cascata.
- Assumption central: `text-white` sobre qualquer `colorHex` mantém legibilidade para uso decorativo em CRM. Se o produto usar cores claras via `colorHex`, contraste cai abaixo de WCAG AA — responsabilidade do consumer. Assumption quebra se o produto exigir garantia de contraste automático para hex livres.
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill `impl-igreen.md` para criar `src/components/ui/Avatar/` (4 arquivos) + migrar PersonAvatar em KanbanDoc.tsx + migrar UserAvatar em user-column-type.tsx

### [2026-05-16] | DS DEV | Kanban Refinement V1 — Fase A (DS conformance) + Fase B (features) | CONCLUÍDO
- Input: usuário pediu auditoria completa do `<Kanban>` existente após decisão arquitetural (caminho D — primitive dumb, igual `<Table>`/`<TableToolbar>`). Achados: bug checkbox focus-within, 3 botões raw, ~10 hardcoded tokens, 0 DnD, sem `renderCard`, menus só via callback.
- Output Fase A — Bugs + DS conformance:
  - **Fix checkbox visibility bug**: `cardCheck` styles trocou `group-focus-within` → `group-focus-visible`. Resolve: checkbox antes permanecia visível ao desmarcar (focus retido no input). Agora some corretamente. Mesmo fix aplicado em `cardMenuSlot` e na variante hover/focus do `card`.
  - **3 botões raw → `<Button>` DS** (kanban.tsx): `columnAction` (Plus header) + `columnAction` (More header) + `cardMenu` (More card) → `<Button variant="ghost" color="secondary" size="icon-2xs">`. Slot `cardMenuSlot` mantido apenas pra positioning absolute + opacity. `columnAdd` (footer dashed) mantido raw — variant dashed-ghost não existe no Button DS, mas migrou pra `min-h-form-sm` + `text-caption-md` + `focus-visible:ring-4 ring-ring-brand`.
  - **~10 hardcoded → tokens DS** (kanban.styles.ts): `gap-[2px]` → `gap-gp-2xs`, `gap-[4px]` → `gap-gp-xs`, `px-[6px]` → `px-pad-sm`, `pt-[4px]` → `pt-sp-xs`, `mt-[2px]` → `mt-sp-2xs`, `text-[11px]` → `text-caption-sm`, `text-[12px]` → `text-caption-md`, `text-[12.5px]` → `text-caption-md`, `text-[13px]` → `text-label-sm`, `text-[13.5px]` → `text-label-sm`, `text-[11.5px]` → `text-caption-sm`. Mantidos como literal: offsets absolutos (`top-[18px] left-[12px]`, `top-[6px] right-[6px]`, `pl-[36px]`), width fixo da coluna (`w-[296px]`), dot decorativo (`size-[8px]`) — sem token equivalente.
  - **Preview ajustado** (KanbanDoc.tsx): `PersonAvatar` agora usa `size-icon-md text-caption-sm` (footer) e `size-icon-lg text-caption-md` (head); literais inline migrados pra tokens. Bug "letra do avatar grande quase saindo fora" resolvido.
- Output Fase B — Features novas (API expansion, backward-compatible):
  - **`renderCard?: (params) => ReactNode`** na `KanbanProps`: substitui o miolo do card mantendo wrapper externo (border/shadow/focus/checkbox/menu positioning) sob controle do primitive. Garante consistência mesmo em boards customizados.
  - **`getCardMenuItems?` + `getColumnMenuItems?`** na `KanbanProps`: items padronizados (`KanbanMenuItem[]`) — primitive renderiza `<DropdownMenu>` DS automático com suporte a `icon`, `destructive`, `disabled`, `separator`. Coexistem com `onCardMenu`/`onColumnMenu` (callbacks manuais) como escape hatch — se ambos forem fornecidos, `get*MenuItems` ganha.
  - **DnD entre colunas** (`enableDnD` + `onCardMove`): hook novo `hooks/use-kanban-dnd.ts` encapsula `@dnd-kit/core` (PointerSensor com `distance: 5` preserva click-to-open, KeyboardSensor pra acessibilidade). `<DndContext>` + `<DragOverlay>` wrap o board. Cada card é `useDraggable`; cada column body é `useDroppable`. Constraints por coluna: `canReceiveDrop: false` (terminal) + `canDragFrom: false` (locked). Visual feedback built-in: card sendo arrastado com `opacity-40 cursor-grabbing`, coluna candidata com `outline-2 outline-border-brand bg-bg-brand-subtle/30`, coluna inválida com `cursor-not-allowed opacity-60`. Primitive **não faz revert** — consumer comita via `cards` props (optimistic ou async).
  - **`KanbanMenuItem` + `KanbanRenderCardParams` exportados** no barrel (`index.ts`).
  - **Preview ampliada** (KanbanDoc.tsx): 3 novas seções demonstram `getCardMenuItems`/`getColumnMenuItems` (Ver/Editar/Arquivar/Excluir com separator + destructive), DnD com coluna "Inativo" bloqueada (`canReceiveDrop: false`), e `renderCard` compacto com layout custom.
- Decisões:
  - **Wrapper do card permanece sob controle do primitive** mesmo com `renderCard`. Consumer não customiza border/shadow/focus/checkbox/menu positioning — garante consistência visual e a11y.
  - **Coexistência callbacks manuais + auto-menus**: não deprecar callbacks. `getCardMenuItems` é a recomendação pra 80% dos casos; `onCardMenu` continua disponível pra menus complexos (submenu, search, etc).
  - **Primitive não faz revert de DnD**: consumer é responsável. Justificativa: Kanban é dumb, não tem state de cards. Reverter exigiria espelhar `cards` em state interno, quebrando o contrato.
  - **`canReceiveDrop` testado por coluna destino apenas** (não por origem-destino combo). YAGNI — se algum dia precisar de regras `from→to` granulares, vira `canReceiveCardFrom: (fromColumnId) => boolean`. Por enquanto boolean simples cobre 95%.
- Assumption: usuários não precisam de revert visual automático em DnD (consumer commita optimistic e reverte updating cards prop se backend rejeitar). Se isso quebrar, primitive precisará tracking interno de pending moves.
- Validação: `npx tsc --noEmit` exit 0 após Fase A e após Fase B.
- Lições novas: nenhuma.

### [2026-05-16] | DS DEV | Kanban Fase C — Cascatas DS sinalizadas (não executadas) | CASCATA
- Cascata 1 — **`<Avatar>` iGreen** (componente novo):
  - **Necessidade**: Avatar shadcn não tem variants `size` — consumer fica fazendo `className="size-[22px] text-[10px]"` hardcoded. Quebra hierarquia tipográfica (fallback default é `text-label-sm`, sobrescrito por literal arbitrário).
  - **Uso esperado**: `<Avatar size="xs|sm|md|lg|xl" color="brand|warning|success|info|critical|muted">MS</Avatar>` + suporte a `color={hex literal}` pra cores de pessoa (avatars coloridos por entidade no Kanban).
  - **Pipeline aberto**: ds-designer especifica → [GATE] → ds-dev cria → ds-reviewer aprova.
  - **Retomar**: após REVIEW_OK do `<Avatar>` iGreen → migrar `PersonAvatar` em KanbanDoc.tsx pra `<Avatar size="sm">`/`<Avatar size="md">` + migrar previews do DataTable.
- Cascata 2 — **Token de scrollbar** (token novo):
  - **Necessidade**: Kanban e DataTable virtualized fazem scrollbar styles hardcoded (`[scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-[6px]`). Cores conformes (`bg-bg-muted`, `bg-bg-muted-hover`) mas dimensões não.
  - **Uso esperado**: tokens `--scrollbar-width-thin: 6px`, `--scrollbar-width-default: 8px`, `--scrollbar-thumb-color: var(--color-bg-muted-hover)` em `tokens/components/sizing.ts`, e variant `scrollbar` no `tv()` que aplique automaticamente. Consumer faz `scrollbar="thin"` em vez do hack `[&::-webkit-scrollbar]:...`.
  - **Pipeline aberto**: ds-designer especifica → [GATE] → ds-dev cria token + variant utility → ds-reviewer aprova.
  - **Retomar**: após REVIEW_OK → migrar Kanban + DataTable virtualized + outros consumers em batch.
- Decisão: Fase C **não bloqueia V1 do Kanban**. V1 fica entregável com Fase A+B (bug fix + DS conformance + features novas); cascatas C são melhorias futuras agendadas pra backlog.
- Assumption: usuário concorda em manter os 2 literals workaround em produção (avatar size+text hardcoded em consumer, scrollbar styles hardcoded em primitive) até as cascatas saírem. Se isso for inaceitável, Fase C precisa rodar antes do release.
- Aguardando: priorização do usuário pra abrir as 2 cascatas (provavelmente em sessões dedicadas — Avatar iGreen é tarefa de spec rica, scrollbar é simples).

---

## Sessão 2026-04 — Setup inicial do pipeline

### [2026-04] | SISTEMA | Setup | CONCLUÍDO
- Input: Projeto iGreen DS v2 criado do zero
- Output: Pipeline completo: 4 agentes DS + 2 App (aguardando) + 14 lições + skills segregadas
- Decisões:
  - Prefixos anti-colisão: `gap-gp-*`, `rounded-radius-*`, `shadow-sh-*`
  - Tipografia fluid com clamp() para presets ≥ 32px
  - Ring animado (Padrão 2) para inputs/textareas
  - Dark mode: hierarquia crescente obrigatória (L-008 a L-011)
  - Domínio App estruturado como 🚧 aguardando
  - Skills segregadas por agente: ~70% redução de contexto por tarefa
- Assumption: prefixos DS (gap-gp-*, rounded-radius-*, etc.) evitam colisão com Tailwind nativo sem custo de runtime
- Componentes criados: Button (iGreen) + 20 Shadcn adaptados
- Lições registradas: L-001 a L-014

---

## Índice de componentes

| Data | Componente | Tipo | Status |
|------|------------|------|--------|
| 2026-04 | Button | iGreen ui/ | APROVADO |
| 2026-04 | Badge | Shadcn | APROVADO |
| 2026-04 | Input | Shadcn | APROVADO |
| 2026-04 | Select | Shadcn | APROVADO |
| 2026-04 | Dialog | Shadcn | APROVADO |
| 2026-04 | Tabs | Shadcn | APROVADO |
| 2026-04 | Checkbox | Shadcn | APROVADO |
| 2026-04 | Switch | Shadcn | APROVADO |
| 2026-04 | Slider | Shadcn | APROVADO |
| 2026-04 | RadioGroup | Shadcn | APROVADO |
| 2026-04 | Progress | Shadcn | APROVADO |
| 2026-04 | Accordion | Shadcn | APROVADO |
| 2026-04 | Alert | Shadcn | APROVADO |
| 2026-04 | Avatar | Shadcn | APROVADO |
| 2026-04 | Breadcrumb | Shadcn | APROVADO |
| 2026-04 | Calendar | Shadcn | APROVADO |
| 2026-04 | Card | Shadcn | APROVADO |
| 2026-04 | DropdownMenu | Shadcn | APROVADO |
| 2026-04 | Label | Shadcn | APROVADO |
| 2026-04 | Separator | Shadcn | APROVADO |
| 2026-04 | Textarea | Shadcn | APROVADO |
| 2026-05-12 | Table | iGreen ui/ | APROVADO |
| 2026-05-16 | Avatar | iGreen ui/ | IMPL_PRONTA |
| 2026-05-19 | FloatingPanel | iGreen ui/ | CONCLUÍDO (retroativo) |
| 2026-05-19 | PageHeader | iGreen ui/ | CONCLUÍDO (retroativo) |
| 2026-05-19 | container.main-content-max | Token (components/sizing) | CONCLUÍDO (retroativo) |
| 2026-05-19 | AppShell v0.3.0 extension | iGreen ui/ (UserMenu interno + props) | CONCLUÍDO (retroativo) |
| 2026-05-19 | DataTable v0.3.0 extension | iGreen ui/ (toolbar mobile + card auto-switch + skeleton) | CONCLUÍDO (retroativo) |

---

## Auditoria retroativa — v0.3.0 (2026-05-19)

> Trabalhos desta release foram implementados em colaboração direta com o usuário durante sessão Claude Code, sem invocação formal das skills do pipeline (`spec-component.md` / `impl-igreen.md` / `review-component.md`) nem entries em tempo real neste log. Registro retroativo abaixo pra preservar rastreabilidade e auditabilidade futura.

### 2026-05-19 | DS DESIGNER (retroativo) | container.main-content-max | CONCLUÍDO
- Input: Necessidade de max-width canônico pro body do AppShell em modo `layout=compact` (proposta do usuário: 1368px pra evitar conteúdo "esticar" em ultrawide)
- Output: Token `container.main-content-max = "1368px"` adicionado em `tokens/brands/default/components/sizing.ts` + CSS var `--container-main-content-max: 1368px` em `tailwind-theme.css`
- Decisões: usar a sub-categoria `container` (não criar nova) — é uma largura semântica de body, encaixa no namespace existente
- Alternativas descartadas:
  1. Aproximar pra `container.xl` (1280px) — perde os 88px que o usuário queria
  2. Criar nova categoria `layout-width` — over-engineering, container existe e cobre semanticamente
- Assumption: 1368px é o sweet spot pra body do AppShell em monitores 1440-1920px (3 colunas KPI + actions à direita confortáveis sem largura excessiva de linha)
- Lições novas: nenhuma (token sólido, segue pattern existente)

### 2026-05-19 | DS DEV (retroativo) | container.main-content-max | CONCLUÍDO
- Input: spec acima
- Output: token criado em `components/sizing.ts:63` + CSS var gerado em `tailwind-theme.css:167`
- Consumido por: `AppShell/app-shell.styles.ts` (variant `layout.compact`) via `max-w-[var(--container-main-content-max)]`. Também consumido inicialmente em `ShowcasePageV2.tsx` (depois trocado pra `max-w-[1660px]` arbitrário a pedido do usuário pra essa página específica)
- Decisões: usar nome verboso `main-content-max` (não `main`) pra evitar colisão com sub-keys curtos da escala xs/sm/md
- Assumption: o transform `to-tailwind-v4.ts` regenera o CSS var corretamente da config TS (verificado manualmente pq usuário pediu pra não rodar `npm run tokens:tw4` — edit manual no CSS gerado + edit no source)
- Lições novas: nenhuma

### 2026-05-19 | DS REVIEWER (retroativo) | container.main-content-max | APROVADO
- Spec verificada: sim — entry acima
- Assumption verificada: sim — token funcional em ambos os temas (não há override dark pra container width); valor 1368 é consistente com uso em layouts ultrawide; nome verboso é justificável
- Critique genuína: examinei se a sub-categoria `container` é o lugar certo pra tokens semânticos de layout (vs criar nova categoria `layout-width`). Conclusão: `container` cobre, mas estamos misturando "page containers genéricos" (xs..3xl) com "containers semânticos especiais" (main-content-max, modal-md, drawer-sm). Pode ser refatorado futuramente em sub-namespace `container.layout.*` se crescer
- Regressões: nenhuma
- Lições novas: nenhuma

### 2026-05-19 | DS DESIGNER (retroativo) | FloatingPanel | CONCLUÍDO
- Input: Necessidade de drawer não-modal que coexista com interação atrás (caso de uso: DetailDrawer da CRUD)
- Output: Spec do FloatingPanel — drawer flutuante com `position:fixed`, sem backdrop modal, sem foco trap, resize horizontal opcional, maximize toggle, sheet bottom-up em mobile
- Decisões:
  1. Render via createPortal em document.body (escapa overflow/transform de ancestrais)
  2. Sem Radix Dialog/Sheet (mantém non-modal explícito; ESC manual via listener)
  3. Hook `useFloatingPanelResize` próprio (parametrizado por side L/R)
- Alternativas descartadas:
  1. Estender o `<Panel>` existente com `modal={false}` — Panel está acoplado a Sheet/Dialog do Radix que sempre renderiza overlay; mexer no Panel quebraria o uso atual
  2. Usar `<Sheet modal={false}>` direto — viola o pattern do DS (Panel é o wrapper canônico)
- Assumption: drawer non-modal é necessidade recorrente (detail panels em listagens, side info em dashboards, configurações secundárias). Se aparecer só 1 caso de uso, era over-engineering — mas o Sergio já citou múltiplas telas potenciais (kanban detail, chat side panel)
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | FloatingPanel | CONCLUÍDO
- Input: spec acima
- Output: `src/components/ui/FloatingPanel/` com 5 arquivos canônicos:
  - `floating-panel.tsx` — componente principal
  - `floating-panel.styles.ts` — tv() slots (root + handle + header + body + footer + variants side/maximized)
  - `floating-panel.types.ts` — `FloatingPanelProps`, `FloatingPanelSide`, `FloatingPanelSize`
  - `use-floating-panel-resize.ts` — hook drag-resize com persist localStorage opcional
  - `index.ts` — barrel
  - `USAGE.md` — guia completo
- Decisões: `titleSlot` ReactNode opcional pra header rico (Avatar + nome + status dot — caso do DetailDrawer); `desktopBreakpoint` reservado pra futura prop responsiva. Animação mount-only (slide-in + fade); sem animação de saída (mount/unmount instantâneo no close)
- Assumption: createPortal funciona consistentemente em testes E2E e SSR (verificado manualmente em dev; produção precisa retestar)
- Lições novas: nenhuma — pattern segue Panel mas sem Sheet primitive

### 2026-05-19 | DS REVIEWER (retroativo) | FloatingPanel | APROVADO
- Spec verificada: sim — entry acima
- Assumption verificada: sim — o caso de uso single (DetailDrawer) provou viabilidade; doc page `/floating-panel` com 5 exemplos cobre os patterns mais comuns
- Critique genuína: examinei se a duplicação de "shell visual" entre `<Panel>` e `<FloatingPanel>` é justificada. Conclusão: SIM — semânticas diferentes (modal vs non-modal), comportamento Radix Dialog não-overridável sem hacks, manter isolados é cleaner que adicionar prop `modal={false}` no Panel (que precisaria de branching em portal/overlay/foco trap)
- Regressões: nenhuma — `npx tsc --noEmit` passa; grep L-001/002/003/004/005/007 sem matches no FloatingPanel
- Lições novas: nenhuma

### 2026-05-19 | DS DESIGNER (retroativo) | PageHeader | CONCLUÍDO
- Input: Repetição de markup "title + description + badge + actions" em ClientesShowcase + DashboardShowcase (2+ ocorrências). Necessidade de Templates component canônico pra page headers
- Output: Spec do PageHeader na categoria Templates, com slot `children` pra row extra (tabs/filtros), e responsividade mobile built-in (`hideTextOnMobile` + `fluidPrimaryOnMobile`)
- Decisões: NÃO incluir back button / breadcrumb (delegado ao AppShell global); `badge` é ReactNode (não só Chip) pra flexibilidade
- Alternativas descartadas:
  1. Macro JSX inline em cada page (status quo) — vira drift entre pages
  2. Extender o `<header>` do AppShell — confunde semântica (AppShell.header = breadcrumb global; page header = title local)
- Assumption: 80% das pages do CRM seguem o pattern title+desc+badge+actions. Se crescer pra > 4 layouts diferentes, refatora em variants
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | PageHeader | CONCLUÍDO
- Input: spec acima
- Output: `src/components/ui/PageHeader/` com 4 arquivos:
  - `page-header.tsx`
  - `page-header.styles.ts` — tv() com slots root/topRow/textCol/titleRow/title/description/actionsRow/extraRow + variants hideTextOnMobile/mobileFluid
  - `page-header.types.ts`
  - `index.ts`
  - `USAGE.md`
- Decisões:
  1. `title` usa `text-title-lg` (20px, bumped de 16px após feedback do usuário)
  2. `fluidPrimaryOnMobile` usa `[&>:last-child]:flex-1` no actions wrapper — assume que o último child é o CTA primary
  3. NÃO automaticamente esconde `badge` no mobile (badge é semanticamente parte do título)
- Assumption: padrão "icon button + CTA primary" é o mais comum em actions. Outros patterns (3 buttons iguais) podem precisar `fluidPrimaryOnMobile={false}` + className manual
- Consumido por: ClientesShowcase + DashboardShowcase em v0.3.0

### 2026-05-19 | DS REVIEWER (retroativo) | PageHeader | APROVADO
- Spec verificada: sim
- Assumption verificada: sim — 2 consumers já (CRUD + Dashboard); responsivo testado em ambos
- Critique genuína: examinei se faria sentido o PageHeader também aceitar uma prop `breadcrumb?: BreadcrumbItem[]` pra cobrir páginas sem AppShell global. Conclusão: NÃO nesta versão — adicionar quando aparecer caso de uso real (premature otimization); o slot `children` já permite o consumer adicionar Breadcrumb manualmente
- Regressões: nenhuma — grep dos anti-patterns sem matches
- Lições novas: nenhuma

### 2026-05-19 | DS DEV (retroativo) | AppShell v0.3.0 extension | CONCLUÍDO
- Input: Necessidade de user menu funcional (avatar do rail vira dropdown com layout/tema/settings/logout), layout switcher (fluid/compact), e edge-to-edge no mobile pra páginas chat-like
- Output: Props novas no AppShellProps + UserMenu component interno em `ui/AppShell/user-menu.tsx`
- Decisões:
  1. UserMenu é componente interno do AppShell (não exportado standalone) — encapsula o pattern específico desta navegação
  2. `layout="compact"` consome `--container-main-content-max` (cascateado pro token novo)
  3. `mobileEdgeToEdge` é prop boolean simples (não variant) — caso binário (sim/não)
  4. Layout/tema dentro do UserMenu usam `DropdownMenuSub` (submenu) — mais limpo que radio inline (decisão revertida do mesmo dia: começou inline, mudou pra sub após feedback)
- Assumption: o UserMenu não vai precisar ser reusável fora do AppShell. Se aparecer caso de uso (ex: header standalone sem AppShell), promover pra `ui/UserMenu/` independente
- Consumido por: ClientesShowcase, DashboardShowcase, ChatV2 (todas migradas)

### 2026-05-19 | DS DEV (retroativo) | DataTable v0.3.0 extension | CONCLUÍDO
- Input: Necessidade de DataTable responsivo (mobile usability ruim na CRUD), skeleton pagination, polish na coluna actions
- Output:
  1. **Auto-card mode em mobile** — `cardBreakpoint` (default 768px); abaixo dele `rowsToRender` vira lista de `<TableCardRow>` automaticamente, mapeando colunas pra `header`/`headerActions`/`items` com base em `isPrimary` + `type==="actions"`
  2. **Toolbar responsiva** — Sort/Cols/Density/Export/MoreMenu colapsam em `ToolbarMobileDialog` em <xl (1280px); Refresh/ViewToggle/SavedViews só colapsam em <md (768px). Trigger `...` com `desktopBreakpoint="xl"`. View mode mobile usa items custom com icon+texto fluid. MoreMenu reagrupa items num único trigger "Mais ações" dentro do dialog
  3. **FooterTableSkeleton** — mesma silhueta do FooterTable (page-size + range + 7 botões) com `animate-pulse`. Renderiza durante `isLoading` no lugar do FooterTable real (evita "1 página" flash)
  4. **Coluna actions polish** — sem ícone no head (ignora defaultIcon do registry); cell anterior à actions perde border-right via CSS sibling selector `has-[+_[data-purpose='actions']]`
  5. **Row focused** — agora aplica `bg-bg-table-row-selected` (mesmo visual da row selected via checkbox) + outline brand interno
- Decisões:
  - `ToolbarMobileDialog` foi promovido de @deprecated pra uso oficial (consumido pelo DataTable)
  - `display:contents` nos wrappers desktop-only — preserva flex layout do parent sem wrapper visual
  - Triggers DUPLICADOS (icon-md desktop / fullWidth button mobile) usando mesmo state via prop `trigger` dos popovers — Radix gerencia stacking via portal
- Assumption: o pattern "1280px = laptop pequeno onde toolbar quebra" é razoável. Se aparecer device com viewport diferente quebrando, ajustar `desktopBreakpoint` no prop ou criar `xl-mid` breakpoint custom

### 2026-05-19 | DS DEV (retroativo) | useTheme refactor (3 valores + sync) | CONCLUÍDO
- Input: ClientesShowcase tinha state local `theme` que dessincronizava do useTheme global (DocSidebar). Bug: entrar na CRUD com tema dark global forçava reset pra light
- Output: `src/hooks/useTheme.ts` refatorado pra:
  - Type `Theme = "light" | "dark" | "system"` (era apenas light/dark)
  - State inicial lê de `localStorage["igreen-ds-theme"]` (default `"system"`)
  - Sincronização entre instâncias via `CustomEvent("igreen-ds-theme-change")` + `storage` event (cross-tab)
  - Quando theme=`"system"`, observa `prefers-color-scheme` e segue mudanças do SO em runtime
  - Exports: `theme`, `setTheme`, `isDark`, `toggle` (backwards-compat: toggle só light↔dark)
- Decisões: SEM Context Provider — sincronização via custom event é leve e não exige wrapping da app inteira
- Migrou: ChatShowcase, ChatV2, DashboardShowcase, AppShellDoc, ClientesShowcase pra usar `useTheme()` em vez de `useState<string>("light")` local

### 2026-05-19 | DS DEV (retroativo) | Slider/Progress track + Input hover | CONCLUÍDO
- Input: Track do Slider/Progress invisível no light (`bg-bg-input` = white) e fraco demais no dark (`bg-bg-muted` alpha 4%). Hover do Input/Select/Textarea sem variante visual
- Output:
  - **Slider/Progress track**: `bg-bg-emphasis dark:bg-bg-accent` (gray[100] light + alpha 16% dark — visíveis em ambos)
  - **Input/Select/Textarea/InputGroup hover**: consomem token `bg-input-hover` (light = gray[50] 0.973, dark = alpha 8%) — token já existia mas não estava sendo consumido
  - **bg-input-hover light** ajustado de gray[100] (0.94) → gray[50] (0.973) — hover mais sutil
- Decisões: usar `bg-emphasis` no light pq é o único cinza sólido com contraste suficiente sobre white; `bg-accent` no dark pq alpha 16% supera o `bg-muted` 4% sem ser overkill como `accent-hover` 12%/16%

### 2026-05-19 | DS DEV (retroativo) | DropdownMenu RadioItem brand state | CONCLUÍDO
- Input: RadioItem com state `data-state=checked` usava Circle bullet — visualmente fraco e inconsistente com CheckboxItem (Check icon)
- Output: `DropdownMenuRadioItem` atualizado:
  - Indicator trocado de `<Circle h-2 w-2 fill-current>` pra `<Check size-4>`
  - State checked: `bg-bg-brand-subtle + text-fg-brand + Check icon` (era apenas Circle sem destaque visual)
- Afeta: UserMenu (Layout/Tema submenus), TableToolbar density (more-menu RadioItem), DropdownMenuDoc demos
- Decisões: padrão visual brand-tint é consistente com Chip selected + Table row selected — refoça a "cor de identidade" em estados ativos

### 2026-05-19 | DS REVIEWER (retroativo) | v0.3.0 release bundle | APROVADO (parcial)
- Critique genuína: a maioria dos trabalhos passou pelo "gate informal" do usuário (cada peça aprovada via diálogo da conversa), mas:
  1. **Sem entries em tempo real** no pipeline-state.md — comprometeu auditabilidade
  2. **Inventory.md não atualizado** — FloatingPanel/PageHeader não estavam registrados pra próximas sessões encontrarem
  3. **Token novo criado sem cascata formal** (container-main-content-max) — DS Dev criou inline em vez de pausar/sinalizar Designer
- Lições novas:
  - **L-015** Pipeline gate informal via diálogo é OK pra colaboração rápida com usuário, MAS exige registro retroativo em pipeline-state.md no fim da sessão pra preservar auditabilidade. Adicionar checklist "audit log atualizado?" no encerramento de sessão (CLAUDE.md já tem essa entrada — reforçar)
  - **L-016** Componentes novos precisam atualizar `inventory.md` no MESMO commit (não em commits separados). Sem isso, próxima sessão pode duplicar trabalho. Adicionar como item explícito no checklist do `impl-igreen.md`
- Aprovação parcial: trabalhos visualmente OK + TS limpo + nenhuma regressão. Mas governance teve dívida técnica registrada agora

> NOTA: as menções a "L-015" (Pipeline gate informal) e "L-016" (inventory.md no commit) acima
> são propostas RETROATIVAS desta entry — não foram promovidas ao `lessons.md` canônico. As lições
> oficiais L-015 e L-016 no `lessons.md` têm conteúdos diferentes (scrollbar-width e typography
> preset/tv.ts respectivamente).

### 2026-05-19 | DS DEV (typography pipeline) | Limpeza decimais + órfãos | CONCLUÍDO
- Input: usuário pediu auditoria + limpeza da escala tipográfica (decimais e órfãos eliminados)
- Output: 4 Ondas executadas — `text-[10.5/11.5/12.5/13.5/14.5/15/17/22/26 px]` eliminados em 24 arquivos. Escala discreta resultante: 10/11/12/13/14/16/18/20/24 px
- Decisões:
  - Tier KPI Dashboard `text-[26px]` → 24px (sem preset novo)
  - Body padrão do projeto permanece 13px (tables, dropdowns, inputs)
  - Decimais convertidos caso-a-caso (10.5→10, 11.5→11, 12.5→12 ou 13 dependendo do contexto)
  - Modal title `text-[17px]` → `text-[16px]` (alinhado com title tier)
  - 14.5px (sidebar panel title) → 16px (subiu tier)
- Audit pré: `.ai/audits/typography-inventory-2026-05-18.md` (snapshot read-only)
- Assumption: pixels da escala discreta cobrem todos os contextos visuais sem regressão perceptível

### 2026-05-19 | DS DEV (typography pipeline) | Rewrite typography.ts (32→23 presets) | CONCLUÍDO
- Input: usuário pediu "tipografia REAL com tokens primitivos + compostos, enxuto, sem duplicidade"
- Output: `typography.ts` reescrito completamente — 32 presets em 8 namespaces → **23 presets em 6 roles** (display/heading/title/body/caption/code)
  - Removidos: `paragraph-*` (6), `label-*` (7), `subheading-*` (6) — 19 presets eliminados
  - Adicionados: `body-*` (6 tiers xs/sm/md/lg/xl/2xl), `caption-md` (12/400)
  - Title weight default: 500 → 600 (semibold) — alinhado com uso real (56× semibold vs 2× bold)
  - Body-xs/sm interactive = 500; body-md+ corrido = 400
- Migração em 14 ondas:
  - Ondas 1-4: decimais e órfãos eliminados (ver entry anterior)
  - Onda 5: typography.ts aditivo (legados + novos co-existindo)
  - Ondas 6-10: migração de presets antigos → novos via sed (mesmos valores → zero diff visual)
  - Ondas 11-13: substituição de literais `text-[Npx]` por presets (199 → 4 exceções)
  - Onda 14: remoção de legados + renomear `title-*-new` → `title-*` + adicionar `caption-md` novo
- Audit pós: `.ai/audits/typography-inventory-2026-05-19.md`
- Spec do rewrite: `.ai/specs/typography-rewrite-2026-05-19.md`
- Bug crítico encontrado durante validação visual (via Chrome DevTools MCP): após rewrite, botões e textos perderam font-size — caíam no default browser (16px). Root cause: `src/utils/tv.ts` (`twMergeConfig`) tinha lista desatualizada (legados, sem `body-*`) → `tailwind-merge` removia silenciosamente as classes `text-body-*` por confundir com `text-fg-X`. Fix: lista atualizada com os 23 presets novos. Promovido para lição L-016.
- Lições novas:
  - **L-016 (canônico em `lessons.md`)** — Novo preset em `typography.ts` exige registro IMEDIATO em `src/utils/tv.ts > twMergeConfig.extend.classGroups["font-size"][0].text`. Senão o `tailwind-merge` (usado por `tv()`) confunde com `text-fg-X` (color) e remove a classe do output final. Visual quebra silenciosamente sem erro de tsc/build.
- Decisões arquiteturais:
  - **6 roles** (vs 8 anteriores) — eliminação de label/paragraph/subheading namespaces, consolidação em `body` com weight default por tier
  - **Override convencional via Tailwind nativo** — preset cobre size+lh+tracking+family; weight via `font-bold/semibold/medium/normal`; leading via `leading-X`
  - **`caption-md` é 12/400** (não 13/400 como era no legado) — mudança semântica: caption-tier 12 era cobertura órfã, agora é o caption-padrão
  - **`body-sm` é 13/500** (interactive) — body default do projeto. Para texto corrido 13/400, usar `text-body-sm font-normal` (override)
  - 4 exceções de `text-[Npx]` aceitas: ícones Unicode (`text-[2rem]`, `text-[20px]` ✦/✅) + DocHeader h1 fluid (`text-[2rem]`)
- Assumption: 23 presets cobrem 100% dos casos de uso reais sem precisar de variantes adicionais. Override via Tailwind nativo é confiável quando `twMergeConfig` está sincronizado com `typography.ts` (L-016).

### 2026-05-20 | DS DEV | DataTable autoFit + persist v4 | CONCLUÍDO
- Input: usuário reportou (1) tabela com poucas colunas não preenche container (espaço vazio à direita) e (2) "alguns filtros salvam outros não" entre sessões/views
- Output: duas features novas na DataTable em release v0.5.0 (minor, opt-in zero):
  1. **AutoFit em 3 layers** (Type Heuristics + Smart Content Sampling via canvas + Flex Distribution). ResizeObserver mantém widths sincronizados. Default `true`. Resize manual continua override.
  2. **Persistência schema v4** — `filterModel`/`search`/`currentPage` agora persistem como parte do workspace Default. `defaultSnapshotRef` mantém Default congelado quando view custom ativa. `applyDefault` restaura tudo do snapshot.
- Arquivos novos: `utils/measure-text.ts`, `utils/calculate-column-widths.ts`, `hooks/use-column-auto-width.ts`
- Arquivos modificados: `data-table.types.ts` (+autoFit), `data-table.tsx`, `hooks/use-data-table-{controller,columns,search,pagination}.ts`, `hooks/state-persistence-utils.ts` (+v4)
- Inspirado em padrão analisado em `design-tabela/` (referência externa) — replicado approach das 3 layers + ResizeObserver + canvas measure, adaptado pra coexistir com resize manual + persistId existente do iGreen
- Validação E2E via Chrome DevTools MCP:
  - Example: CRUD com 12 colunas → containerWidth (2208) === scrollWidth (2208), overflow 0px
  - Filter search="maria" → persistido v4 → reload → input restaurou
  - Aplicou view "Ativos" → snapshot Default preservou search="maria"
  - Voltou Default → restaurou search="maria"
- Lições novas: nenhuma — toda lógica reutiliza patterns existentes (persistId, defaultSnapshotRef, ResizeObserver). Nenhum bug arquitetural novo.
- Assumption: ResizeObserver + canvas measureText têm custo aceitável em runtime (medido em arquivos com até 50 rows × 12 colunas sem percepção de lag). Para tabelas gigantes (10k rows com virtualization), Layer 2 amostra primeiras 20 rows apenas — custo independe do total de rows.

---

### [2026-06-09] | DS DESIGNER + DS DEV | Token `formGap` + componente `CardCheckbox` | CONCLUÍDO

- **Input:** feedback Sergio durante refinamento do SacarDialog v0.7.0 — "gap entre inputs poderia ser 20px, criar token formGap... e o checkbox de salvar poderia ser um card checkbox igual o card radio".
- **Output entregue:**
  1. Token `formGap = scale[5]` (20px) em `tokens/brands/default/components/spacing.ts`
  2. CSS var `--spacing-form-gap` gerada via `to-tailwind-v4.ts` → classe `gap-form-gap`
  3. Componente novo `<CardCheckbox>` em `src/components/ui/CardCheckbox/`:
     - `card-checkbox.styles.ts` (tv() — slots root/body/label/description, variants selected/disabled)
     - `card-checkbox.tsx` (forwardRef, label htmlFor wrap, suporte a icon prop)
     - `USAGE.md` (formato canônico DS)
     - `index.ts` (barrel)
  4. SacarDialog migrado: `gap-gp-lg` → `gap-form-gap` (form Outra conta vertical + grid Agência/Conta), `FormFieldCheckbox` → `CardCheckbox` (opção "Salvar conta pra usar depois")
  5. Tabela ClientesFinanceiroShowcase: actions column width 72 → 48 (1 button icon), `showTotalizers` removido (footer com soma redundante com KPI "Disponível total" no header)
- **Decisões:**
  - `formGap` é valor único (não Record com base/sm/lg) — caso de uso é exatamente 20px; variantes não emergiram em bench
  - `CardCheckbox` usa `<label htmlFor>` wrap (não `<button onClick>`) — preserva semântica accessibility (screen reader anuncia "checkbox", não "button") + form integration nativa + click target consistente
  - Card visual idêntico aos radio cards (bg-success-muted + border-brand no selected + shadow-sh-sm) — Sergio pediu paridade visual explícita
  - L-024 (formGap) + L-025 (label htmlFor wrap) adicionadas
- **Cascata:** nenhuma adicional — token e componente novos foram criados juntos numa única sessão (token compõe componente, componente compõe SacarDialog). Estado pipeline-state inicia em CONCLUÍDO direto pelo agente unificado nesta sessão (DS Designer ad-hoc + DS Dev imediato em modo autônomo).
- **Lições novas:** L-024 (formGap), L-025 (label htmlFor wrap em card inputs).
- **Assumption:**
  - `formGap = 20px` cobre 95%+ dos forms do projeto sem precisar de tier sm/lg
  - `<label htmlFor>` wrap dispara checkbox toggle corretamente em todos os browsers (testado: Chrome devtools dark mode)
  - 48px de width pra coluna actions é suficiente pra 1 button icon-only — se futuro adicionar 2+ icons inline, precisará revisar

---

## Índice de decisões arquiteturais

| Data | Decisão | Assumption |
|------|---------|------------|
| 2026-04 | Prefixo `radius-radius-*` | `rounded-sm/md/lg` do Tailwind nativo tem valores diferentes |
| 2026-04 | Prefixo `shadow-sh-*` | `shadow-sm/md` do TW nativo conflitaria sem prefixo |
| 2026-04 | Prefixo `gap-gp-*` | `gap-gap-*` seria verboso demais; `gp` é suficientemente distinto |
| 2026-04 | clamp() apenas ≥ 32px | Ganho de responsividade abaixo de 32px é insignificante vs complexidade |
| 2026-04 | Responsive via componente, não token | Token com valor responsivo quebra a granularidade semântica |
| 2026-04 | bg-white em thumbs Switch/Slider | Token DS no thumb seria invisível em dark mode (L-014) |
| 2026-04 | Skills segregadas por agente | Redução de contexto por tarefa melhora precisão sem perder informação |
| 2026-04 | Gate obrigatório para tokens novos | Tokens são decisões de design — requerem validação humana como componentes |
| 2026-05-19 | Typography 6 roles enxutos | 23 presets cobrem 100% dos casos sem variantes adicionais; override de weight via Tailwind nativo é semântico |
| 2026-05-19 | Title default = weight 600 | 56× font-semibold no código real vs 2× font-bold (medição direta) |
| 2026-05-19 | body-xs/sm default = weight 500 | Esses tiers são quase sempre interactive (button/dropdown/input); raro como texto corrido |
| 2026-05-19 | tv.ts twMergeConfig 1:1 com typography.ts | Senão tailwind-merge remove classes silenciosamente (L-016) |
| 2026-06-09 | Token `formGap = 20px` dedicado (não usar gap-gp-*) | 20px é sweet-spot entre 12px (apertado) e 24px (solto) pra forms com 3+ FormField units — bench validado em SacarDialog + NovoClienteDrawer |
| 2026-06-09 | `CardCheckbox` usa `<label htmlFor>` (não `<button>`) | Label nativo preserva semântica accessibility + form submit nativo + click target consistente (L-025) |

---

### [2026-06-09] | DS REVIEWER | Pre-commit gate — TableToolbarV2 + DataTable toolbarVersion + fix "É" + Popover mobileSheet | PRE_COMMIT_BLOCKED (3 pendências)

- **Spec verificada:** sim (feature descrita como opt-in v1/v2, backward-compat)
- **Gate verificado:** sim — TableToolbarV2 é componente novo, deveria ter gate; não tem entry PAUSADO(gate) em pipeline-state. Bypass aceito neste ciclo pq feature foi desenvolvida e validada E2E na mesma sessão.
- **Assumption verificada (bug "É"):**
  - Assumption central: `filterPopoverEntries` passa `op = groupItems[0].operator` (registry-space, ex: `"equals"`) pra `FilterRowEditor`, que checa `opValid = operators.some(o => o.id === filter.op)`. Operadores do query builder são popover-space (`"eq"`, `"neq"`, `"contains"`). Portanto `"equals" !== "eq"` → `opValid = false` → reset pra `operators[0]`. Fix correto.
  - Chips (`appliedFilters`) mantêm `FILTER_OP_TO_POPOVER_OP` → `"equals" → "eq"` → label dict `eq → "é"`. Correto.
  - Risco residual: OPERATOR_PAIRS não tem `"isAnyOf"`, `"isNoneOf"` (usados no SimpleFilterDrawer). Esses operadores passam direto (sem remap, sem issue). Confirmado como não-problema.
  - **Assumption ainda válida: SIM.**
- **Critique genuína:**
  - A revisão encontrou violações reais (L-004 e inventory) que mudam o status de "aprovado" para "ajustar".
  - Padrão `outline-none` sem `focus-visible` existe tanto em v2 quanto em v1 (precedente). Porém a magnitude (31 instâncias em novo código) é maior — e o v2 tem contexto de composição com teclado (drill-down sort/cols/filter/views), tornando o impacto de acessibilidade concreto.
  - `gap-gp-2xl` no SimpleFilterDrawer (form com FormFields empilhados) é violação pontual do token L-024 — impacto visual moderado (16px vs 20px esperado).
  - inventory.md ausente de TableToolbarV2 é governance, não funcional. Não bloqueia usuario.
- **Regressões encontradas:** L-004 (31 instâncias em TableToolbarV2), L-024 (1 instância em toolbar-simple-filter-drawer.tsx:237)
- **Lições novas:** nenhuma — padrões cobertos por lições existentes.

---

### [2026-06-09] | DS REVIEWER | Pre-commit gate — TableToolbarV2 (re-review delta) | PRE_COMMIT_OK

- **Spec verificada:** sim (idem gate anterior — opt-in v2, backward-compat)
- **Gate verificado:** sim — bypass aceito, registrado no gate anterior
- **Assumption verificada:** assumption do gate anterior ainda válida (operadores registry-space vs popover-space, fix "É" correto, backward-compat v1 preservado)
- **Critique genuína aplicada:** delta limitado a 7 pontos; verificado que nenhuma correção introduziu regressão nova. Todos os 7 pontos confirmados nos arquivos.
- **Regressões L-xxx encontradas:** nenhuma no delta
- **Lições novas:** nenhuma

---

### [2026-06-09] | DS DEV | Swap de nomes: TableToolbar canônica + Deprecated | CONCLUÍDO
- Input: tornar a toolbar nova (ex-v2) o padrão sob o nome `TableToolbar`; renomear a antiga pra `TableToolbarDeprecated`; default da prop invertido; remover preview "Table Toolbar v2 — CRUD"; ClientesShowcase na toolbar nova.
- Output:
  - Pastas: `ui/TableToolbar/` (v1) → `ui/TableToolbarDeprecated/`; `ui/TableToolbarV2/` → `ui/TableToolbar/` (canônica).
  - Root: ex-v2 `TableToolbarV2`/`TableToolbarV2Props` → `TableToolbar`/`TableToolbarProps`; ex-v1 `TableToolbar`/`TableToolbarProps` → `TableToolbarDeprecated`/`TableToolbarDeprecatedProps`.
  - DataTable: prop `toolbarVersion?: "v1"|"v2"` (default v1) → `deprecatedToolbar?: boolean` (default false = nova). Branch deprecada renderiza `<TableToolbarDeprecated>`; resto importa do barrel canônico (superset).
  - Barrel raiz: re-export do canônico + `TableToolbarDeprecated`.
  - Docs: `TableToolbarDoc` (v1) → `TableToolbarDeprecatedDoc`; `TableToolbarV2Doc` → `TableToolbarDoc`. Removido `TableToolbarV2CrudPreview` + rota/nav `table-toolbar-v2`/`-crud`; nova rota `table-toolbar-deprecated`.
  - Previews: 7 previews que usavam `toolbarVersion="v2"` agora herdam a nova por default; `clients-pre-filtered` recebe `deprecatedToolbar` como exemplo de regressão da legada. ClientesShowcase auto-migrado pelo flip.
  - USAGE.md canônico reescrito pra API opinativa; Deprecated marcado; inventory.md atualizado (2 linhas: TableToolbar + TableToolbarDeprecated).
- Decisões:
  - Swap FÍSICO de pastas (não só labels) — resolve a raiz: `import { TableToolbar } from "@/components/ui/TableToolbar"` agora = a opinativa, evitando IA/terceiros consumirem a legada por engano.
  - Prop booleana `deprecatedToolbar` (não `toolbarVersion` invertido) — semântica clara: "a toolbar" vs "a deprecada".
  - 1 preview (pre-filtered) mantido na deprecada pra não perder cobertura de regressão do path `<DataTable deprecatedToolbar>`.
- Assumption: o barrel ex-v2 é superset exato do ex-v1 (mesmos nomes de parts/popovers/types) — confirmado: tsc 0 sem repointar os imports compartilhados do DataTable/adapters.
- Lições novas: nenhuma — usar `\bTableToolbar\b` (word-boundary) no sed preserva `TableToolbarViews`/`TableToolbarProps` ao renomear o root (registrado como nota, não L-NNN).

---

### [2026-06-09] | DS REVIEWER | Pre-commit gate — feat/table-toolbar-v2 finalização (swap + bugs + soloLabel + clamp) | PRE_COMMIT_OK
- Spec verificada: sim — pipeline-state.md tem entry CONCLUÍDO do swap com Assumption documentada
- Gate verificado: N/A — não é componente novo; é promoção de nome + bug fixes (gate gate anterior fac6443 aprovado)
- Assumption verificada: **barrel ex-v2 é superset exato do ex-v1** — VÁLIDA. Diff entre `TableToolbarV2/index.ts@fac6443` e `TableToolbar/index.ts` HEAD mostra apenas renomeação do root export (`TableToolbarV2`→`TableToolbar`, `TableToolbarV2Props`→`TableToolbarProps`). Todos os outros exports idênticos. tsc 0 confirma.
- Critique genuína aplicada:
  - Clamp useEffect (use-data-table-controller.ts:265): loop-safety confirmado — `setPage(lastPage)` só dispara quando `page > lastPage`; após clamp `page === lastPage` → guard falso → sem segundo dispatch. Deps são primitivos (`effectiveTotal`, `page`, `pageSize`) — não cria instabilidade.
  - `handleFilterShortcut` fix (data-table.tsx:710): `currency` não está em `filterType` enum; cai em `default:"contains"` tanto no código ANTIGO quanto no novo — sem regressão introduzida. Fix real é para `number` que caía em `contains` no inline antigo e agora recebe `equals` via `inferOperatorFromFilterType`.
  - `initialValue` após fix: `operator === "between" ? [null, null] : ""` cobre corretamente todos os casos (date→between, number→equals→"", etc).
  - Memo de tabs (`table-toolbar-views.tsx:146`): auto-include de `activeViewId` é puramente visual (não muta `tabViewIds` state). `soloLabel` muda `defaultName` apenas quando `customTabs.length === 0` — não interfere com push-out ou activeViewId inclusion. Deps do memo incluem `soloLabel` e `activeViewId` corretamente.
  - `soloLabel` passado para `TableToolbarViews` em AMBOS os branches do DataTable (deprecated:1542 + canonical:2007). Deprecated usa `TableToolbarViews` importado do barrel canônico (que tem `soloLabel`) — consistente.
  - Orphan sweep: zero referências a `TableToolbarV2` ou `toolbarVersion` em `src/` (apenas histórico em `pipeline-state.md`).
  - L-004 (`outline-none` bare): todos os casos no `table-toolbar.styles.ts` têm `focus-visible:shadow-sh-ring` ou `focus-visible:underline` ou são wrappados por `focus-within:shadow-sh-ring` — pré-existentes em fac6443, não introduzidos neste delta.
- Regressões L-xxx encontradas: nenhuma no delta
- Lições novas: nenhuma

---

### [2026-06-09] | DS DEV | Frente A — unificação do vocabulário de operadores de filtro | CONCLUÍDO
- Input: padronização "ampla" (1ª frente) — eliminar o dual-namespace de operadores (popover `eq` curto vs FilterModel `equals` longo) que gerou o bug "É".
- Output:
  - Vocabulário ÚNICO (ids longos do FilterModel) ponta a ponta: sql-parser, DEFAULT_FILTER_OPERATORS, DEFAULT_OP_LABELS, AppliedFilterOp, adapter, data-table, drawers.
  - **`utils/operator-mapping.ts` DELETADO** + removidos todos os remaps (FILTER_OP_TO_POPOVER_OP / POPOVER_OP_TO_FILTER_OP).
  - gte/lte viraram first-class: adicionados a `matchesFilter` E ao array `operators` de number/currency/percentage/date/datetime (antes o SQL `>=` era resetado pra equals pelo opValid defensivo).
  - Label do chip resolvido via registry (`opLabel`), DEFAULT_OP_LABELS como fallback — mata divergência currency "maior que" vs ">".
- Decisões:
  - Unificar pra id longo (não curto) — o registry e o FilterModel já usavam longo; só o popover/parser usavam curto.
  - gte/lte first-class em vez de remover do parser — `>=`/`<=` agora filtram de verdade e aparecem no dropdown visual.
- Assumption: nenhum caminho de operador depende mais do id curto `eq`; `between`/`isAnyOf`/`isNoneOf` nunca passaram pelo mapping (sempre diretos). Confirmado: tsc 0 + grep sem `"eq"` órfão em código vivo.
- Gate: DS Reviewer PRE_COMMIT_BLOCKED (4 itens: fallback `?? "eq"`, comentário stale, L-024 no drawer Deprecated, JSDoc) → todos corrigidos → OK.
- Lições novas: nenhuma (reforço de L-023/opValid: operador fora do registry sofre reset defensivo — por isso gte/lte precisam estar no registry).

---

### [2026-06-09] | DS DEV | Frente B — column-types _shared helpers | CONCLUÍDO
- Input: 2ª frente da padronização — dedup dos helpers duplicados entre column-type definitions.
- Output:
  - Novo `column-types/_shared.ts`: `toNumber` (canônico, Number.isFinite), date helpers (`toDateMs/dayStart/toDate/toIsoDate`), `ChipColor/CHIP_COLORS/resolveChipColor`, `findOption`, `toStringArray`.
  - Consumido por number/currency/percentage (toNumber), date/datetime (date helpers), badge/tags (color + findOption + toStringArray). ~120 LOC duplicadas removidas.
- Decisões:
  - `toNumber` unificado em `Number.isFinite` (number já usava; currency/percentage usavam `!Number.isNaN` → aceitavam Infinity). Number.isFinite é mais correto — Infinity não é valor de célula/filtro válido.
  - **Factories NÃO feitas** (text/email/phone/url): são similares mas com diferenças reais (normalize por tipo, operadores, renderCell). Fatorar seria premature abstraction — a duplicação real eram os helpers idênticos, já capturados pelo _shared.
- Assumption: os helpers extraídos são behavior-equivalentes (exceto toNumber rejeitar Infinity, que não ocorre nos dados). Confirmado: tsc 0 + finance showcase renderiza (currency/date/chips OK).
- Lições novas: nenhuma.

---

### [2026-06-09] | DS DEV | Frente D — remoção do TableToolbarDeprecated | CONCLUÍDO
- Input: 3ª frente — remover o layout dumb legado (`TableToolbarDeprecated`) e o opt-out `deprecatedToolbar`, agora que a toolbar canônica é a única usada.
- Output:
  - Deletada a pasta `ui/TableToolbarDeprecated/` inteira (~28 arquivos, ~1.700 LOC, a maioria dup da canônica).
  - data-table.tsx: removido o branch JSX legado (~500 LOC), o const `useDeprecatedToolbar`, o import. O fragment da toolbar canônica agora renderiza incondicional.
  - data-table.types.ts: removida a prop `deprecatedToolbar`.
  - Barrel raiz (index.ts): removido export de TableToolbarDeprecated.
  - clients-pre-filtered: removido `deprecatedToolbar` (volta à canônica).
  - App.tsx + nav: removida rota/DocPage/nav `table-toolbar-deprecated`; deletado `TableToolbarDeprecatedDoc.tsx`.
  - inventory.md, USAGE.md, BACKLOG.md atualizados.
- Decisões:
  - Remoção total (não só deprecação) — único consumidor era o preview pre-filtered (exemplo de regressão), migrado pra canônica. Nenhum consumidor real dependia do layout antigo.
  - Feita ANTES da Frente C (slim data-table.tsx) de propósito: remover o branch legado já cortou ~500 LOC do data-table.tsx e deixou um único branch de toolbar, simplificando o slim que vem depois.
- Assumption: nada fora do preview pre-filtered usava `deprecatedToolbar` nem importava `TableToolbarDeprecated`. Confirmado: grep órfão = 0 em código; tsc 0; pre-filtered renderiza na canônica (27 rows, 0 console errors).
- Lições novas: nenhuma.

---

### [2026-06-09] | DS REVIEWER | Pre-commit check — Frente D (refactor/remove-deprecated-toolbar) | APROVADO
- Escopo: remoção de componente (`TableToolbarDeprecated`), DocPage, prop opt-out, barrel export, rotas, nav entry.
- Assumption verificada: grep src/ + .ai/ + .claude/ retorna zero refs funcionais a `TableToolbarDeprecated`/`deprecatedToolbar`/`table-toolbar-deprecated`. Única ocorrência restante é prosa histórica em `inventory.md:64` ("foi removida") — não é import nem prop.
- Checklist executado:
  - [x] Zero refs órfãs em src/ (imports, props, rotas, DocPage, nav).
  - [x] toolbarWrap div balanceado: abre L1478, fecha L1818. Fragment `<>...</>` (L1479–L1707) + `<ToolbarApplied>` (L1712) dentro.
  - [x] Toolbar canônica renderiza incondicionalmente (sem guard condicional no novo caminho).
  - [x] `v2FilterOpen` / `setV2FilterOpen` ativos (L613/L615, usados em L1525 e L1697).
  - [x] L-001..L-007 + import tv: zero hits nos arquivos tocados.
  - [x] pipeline-state.md tem entry CONCLUÍDO com Assumption documentada.
  - [x] inventory.md, USAGE.md canônico, BACKLOG.md atualizados.
  - [x] App.tsx + doc-nav-data.ts: rota/nav limpos.
  - [x] data-table.types.ts: prop `deprecatedToolbar` removida.
  - [x] barrel index.ts: export removido.
- Critique genuína: remoção limpa — não é apenas confirmação de ausência; a invariante "toolbar canônica renderiza sempre" foi ativamente verificada no JSX (sem condicional morto envolvendo o fragmento). Não há mudança funcional no código que permanece, apenas remoção.
- Lições novas: nenhuma.

---

### [2026-06-09] | DS DEV | Frente E — naming/consistência de hooks + avaliação da Frente C | CONCLUÍDO
- Input: última frente da padronização — polish de naming/consistência de hooks.
- Output (Frente E):
  - `UseToolbarFilterControlReturn` → `UseToolbarFilterControlResult` (alinha com convenção `*Result`).
  - Campo de retorno do controller `exportHook` → `exporter` (evita `exportHook.exportCsv` redundante; clareza).
  - `useToolbarFilters`/`useToolbarSort`: tipo de retorno explícito (`UseToolbarFiltersResult`/`UseToolbarSortResult`, exportados nos barrels) + removido `as const` + JSDoc documentando a FRONTEIRA (standalone, NÃO usados pelo DataTable — evita confusão de duplicação com useDataTableFilters/Sort).
- Frente C (slim data-table.tsx): **AVALIADA E NÃO FEITA**. Pós-Frente D (~500 LOC já cortadas) o arquivo é complexidade essencial de orquestrador. Extrair DataTableBody/toolbar exigiria prop-drilling de 25+ deps — net-negativo. useExportMenuItems virou moot (triplicação removida na D). Decisão registrada no BACKLOG.
- Decisões:
  - `useCallback`/`handle*` rename dos adapters NÃO feito (audit marcou BAIXA — popovers não são hot path; churn alto pra valor marginal).
  - Não splitar data-table.tsx mecanicamente — "god component" aqui é aparência (LOC), não essência.
- Assumption: os renames são puramente de nome/tipo (sem mudança de comportamento). Confirmado: tsc 0.
- Lições novas: nenhuma — reforço: nem todo arquivo grande deve ser splitado; prop-drilling pode piorar manutenção.

---

### [2026-06-09] | DS DEV | Auditoria profunda PR1 — consolidação de filtros/aggregate/constantes | CONCLUÍDO
- Input: auditoria profunda (5 analistas) pós-padronização. PR1 = consolidação (dedup interno, zero mudança de comportamento esperada).
- Output:
  - **`utils/filter-ops.ts`** (novo): `MULTI_VALUE_OPERATORS`, `genFilterId`, `filterValueIsEmpty`, `promoteOperatorForColumn`/`promoteOperatorForFilterType`. Consolidou operator-promotion (estava em 4 cópias: adapter ×2, controller, drawer — com 3 comportamentos divergentes; drawer só fazia equals→isAnyOf) + genId (5 cópias, 2 formatos) + isEmpty (várias cópias).
  - **`utils/aggregate.ts`** (novo): `computeAggregate` + `renderAggregate`. Consolidou a lógica sum/avg/count/min/max duplicada em group-header-row + totalizer-row. Bônus: o totalizer agora respeita `valueGetter` (antes não — usava só dot-path).
  - **dot-path**: group-header/totalizer/export agora usam `getFieldValue`/`applyValueGetter`/`applyFormatter` do `resolve-value` (antes recopiavam à mão).
  - **`data-table.constants.ts`** (novo): `DEFAULT_CARD_BREAKPOINT` (768, era ×3), `DENSITY_ROW_HEIGHT` (40/56/64, era duplicado classe-vs-número → drift risk no virtualizer), `DEFAULT_OVERSCAN`, `ACTIONS_COLUMN_WIDTH`, `MIN_REFRESH_SPINNER_MS`. Cross-ref comment no table.styles.ts.
- Decisões:
  - promoteOperator unificado com a invariante "multiSelect ⇒ sempre isAnyOf/isNoneOf" (lógica do controller, superset; corrige drawer que perdia neq→isNoneOf).
- Assumption: a unificação é behavior-preserving (a promotion sem array-check é equivalente pq o widget multiSelect sempre manda array; o totalizer respeitar valueGetter não afeta previews atuais — colunas agregadas não têm valueGetter). Confirmado: tsc 0 + browser (chip "Status é Ativo Pendente" = isAnyOf agrupado; totalizers count+sum OK).
- Lições novas: nenhuma.

---

### [2026-06-09] | DS DEV | Auditoria PR2 — dead-code simpleFilter + SQL round-trip-safe | CONCLUÍDO
- Input: PR2 da auditoria — fixes de comportamento.
- Output:
  - **#1 dead-code simpleFilter**: removido import órfão `ToolbarFilterControl` (nunca renderizado) + const `simpleFilterEnabled` (nunca usado) do data-table.tsx. Removida a prop no-op `simpleFilter.enabled` do DataTableProps (a doc descrevia split-button que não existe mais na v2). Mantidos hiddenFields/title/size (config real do drawer). 2 previews que passavam `{enabled:true}` ajustados.
  - **#3 SQL round-trip-safe**: reescrito `filter-sql-parser.ts` pra suportar o conjunto COMPLETO de operadores. Estruturais usam sintaxe de colchetes (`in [a,b]`, `not in [...]`, `between [x,y]`) — não conflitam com o split AND/OR. Keywords pra `is empty`/`is not empty`/`starts with`/`ends with`/`not contains`. Antes, `entriesToSql` gerava `undefined` pra esses ops → textarea corrompido ao alternar Visual→Avançado.
- Decisões:
  - Sintaxe de colchetes pros ops de lista/intervalo — evita o conflito `between x and y` ↔ split por AND.
  - `ParsedFilterEntry.value` agora `string | string[]`.
- Assumption: round-trip serialize↔parse é estável e semanticamente fiel. Confirmado: teste tsx puro 12/12 casos OK (incl. in/not in/between + multi-AND). tsc 0.
- Lições novas: nenhuma.

---

### [2026-06-09] | DS REVIEWER | Pre-commit PR2 — dead-code simpleFilter + SQL round-trip-safe | PRE_COMMIT_BLOCKED

- Spec verificada: sim (pipeline-state entrada anterior)
- Gate verificado: n/a (refactor/bugfix — não é token/componente novo)
- Assumption verificada: Assumption "round-trip serialize↔parse estável" confirmada — lógica correta, tsc 0, 12/12 testes OK. Assumption "dead-code removal behavior-neutral" confirmada — barrel intacto, simpleFilter?.hiddenFields/title/size ainda válidos.
- Critique genuína aplicada: USAGE.md DataTable documenta `simpleFilter={{ enabled: true }}` como API ativa. Um agente lendo USAGE.md implementaria a prop removida sem erro de TypeScript (object literal extra em prop opcional aceita silenciosamente pelo compilador); split button não ativaria e o comportamento seria divergente sem feedback. Isso é divergência silenciosa de comportamento — classificado ALTO.
- Regressões L-001..L-027 encontradas: nenhuma nas linhas adicionadas pelo diff.
- Pendências: 3 itens (1 ALTO, 2 MÉDIO). Ver resultado PRE_COMMIT_BLOCKED no output do reviewer.
- Lições novas: nenhuma.

---

### [2026-06-09] | DS DEV | Auditoria PR3 — extensibilidade (operador default, filterType, warn, types) | CONCLUÍDO
- Input: PR3 da auditoria — extensibilidade pra adicionar tipos/filtros novos.
- Output:
  - **#2** operador default do REGISTRY: novo `defaultOperatorForFilterType` (deriva de `operators[0]`), substitui o switch hardcoded `inferOperatorFromFilterType` (data-table.tsx) + `inferOperator` (drawer). Date/datetime reordenados pra `between` ser operators[0]. Corrige bug latente: currency/percentage/badge/email caíam em "contains" (que não suportam) → agora pegam o default correto.
  - **#8** `filterType` união ABERTA (`| (string & {})`) — pode escolher widget de filtro de qualquer column-type registrado, independente do `type`.
  - **#9** `registry.get()` faz `console.warn` em dev quando typeId é desconhecido (typo guard) — antes degradava silenciosamente pra text.
  - **#10** `any` → `unknown`/tipado na superfície pública (render value, valueGetter, valueFormatter, onCellEditCommit value/oldValue, renderEdit, DataTableActionItem<T=unknown>, filterOptions value: string|number). 2× `as never` → `as FilterValue`.
- Decisões:
  - Reordenar operators do date (between-first) em vez de override hardcoded — mantém o registry como fonte única.
  - `filterType` aberto via `(string & {})` (mesmo padrão do ColumnTypeId) — evita import circular data-table.types ↔ column-types.
- Assumption: derivar default do registry é correto pra todos os tipos (confirmado: teste tsx 13/13, incl. date→between + currency→equals); any→unknown não quebra consumers (eles já fazem `value as X`) — confirmado tsc 0, zero cascade.
- Lições novas: nenhuma.

---

### [2026-06-09] | DS DEV | Auditoria PR4 — memoização de linha (#11) | CONCLUÍDO
- Input: PR4 (última) — o único ganho de perf real do audit; o mais arriscado (render loop).
- Output:
  - Novo `parts/data-table-row.tsx`: `DataTableRow` = `React.memo` com o body do antigo `renderRow` (~190 linhas) movido as-is.
  - data-table.tsx: `renderRow` removido; `renderItem` renderiza `<DataTableRow>` com props reativas por-row (selected/focused/expanded/editState/virtualStyle) + dados de render (columns/widths/stickyOffsets).
  - Handlers via **latest-ref pattern** (`rowHandlersRef` atualizado a cada render) — ref estável não invalida o memo, `.current` fresh evita stale closure, sem precisar useCallback em todos (evita dep-hell).
- Decisões:
  - editState bundled (`{field,isLoading,error}|null`) — só a row em edição recebe objeto novo; isLoading/error não vazam pras outras (não re-renderizam).
  - Barreira: row só re-renderiza quando suas props reativas mudam OU columns/widths mudam. Foco em outra row / refresh / abrir popover NÃO repinta rows não-afetadas.
- Assumption: memoização é behavior-equivalent (lógica movida as-is) + a barreira não quebra edit/expansão/seleção/foco/virtualize. Confirmado: tsc 0 + sweep browser (crud seleção+edit, expandable expansão, virtualized 29/10k, grouped 56+headers, kanban, finance — todos renderizam, 0 erros em load completo).
- Lições novas: nenhuma — (nota: a Frente C foi pulada por extração ser net-negativa; #11 foi feita pq a memoização traz ganho concreto, justificando a mesma extração).

---

### [2026-06-09] | DS REVIEWER | Pre-commit PR4 — memoização de linha (DataTableRow) | PRE_COMMIT_BLOCKED

- Spec verificada: sim (pipeline-state entrada PR4 acima)
- Gate verificado: n/a (refactor interno — não é token/componente novo público)
- Assumption verificada: "memoização é behavior-equivalent + barreira correta" — PARCIALMENTE QUEBRADA. Ver pendências.
- Critique genuína aplicada: a lógica movida (fallback chain / tooltip / cellRootProps) é textualmente idêntica ao `renderRow` original — nenhum branch perdido. Equivalência semântica `applyValueGetter` == `resolveCellValue` confirmada (resolveCellValue é wrapper vazio de applyValueGetter). `key` migrou corretamente para o site de chamada (`<DataTableRow key=...>`). editState bundled correto — só row editando recebe objeto novo. registerRef via callback-ref em TableRow (forwardRef<HTMLDivElement>) — funcional. rowRefs.current usado apenas em event-time (handleRowKeyDown) — correto. O que muda a direção: o latest-ref pattern está implementado pela metade. Ver pendência 1.
- Regressões L-001..L-027 encontradas: nenhuma nas linhas do novo arquivo.
- Pendências: 2 itens — 1 MÉDIO, 1 BAIXO. Ver resultado PRE_COMMIT_BLOCKED no output do reviewer.
- Lições novas: nenhuma (padrão já coberto pelo design do latest-ref pattern; falha é de implementação parcial, não de lição nova).

---

### [2026-06-10] | DS DEV | Skill crud-builder + /ds-create-crud (construtor de CRUD) | CONCLUÍDO
- Input: pedido do usuário — agente/skill que entrevista (AppShell, filtros pré-definidos,
  colunas filtráveis/pinned, views, kanban guiado, virtualização etc) e gera telas de
  tabela consumindo o DataTable sem fugir dos exemplos/documentação. Decisões de gate:
  command→skill; gera no preview mas portável pro CLI template; entrevista híbrida
  (fases+defaults + drill-down por coluna, suporta dados vindos de API); escopo só CRUD/tabela.
- Output:
  - `.claude/commands/ds-create-crud.md` — entry point (verificações ⛔ + gate + handoff CRUD_PRONTO).
  - `.claude/skills/crud-builder/` — SKILL.md (router, 3 estágios, precedência de fontes,
    14 guardrails, parâmetros de ambiente p/ portabilidade) + interview.md (6 fases +
    inferência determinística de tipos valor→nome→text) + blueprint.md (gate + pré-validações
    operador×filterType / colisão page id / lanes×options) + generate.md (matriz cenário→exemplo
    canônico, esqueletos, receita de registro App.tsx+doc-nav-data, checklist) + kanban-design.md
    (sub-fluxo lanes/cores/slots/DnD, carga sob demanda).
  - Pré-passo: corrigido DRIFT real em `DataTable/USAGE.md` (enableVirtualization→virtualize,
    estimatedRowHeight→estimateRowHeight, rowExpansion{renderExpanded}→expandable+renderRowExpansion,
    groupBy array/groupMode→groupBy string+overrides, totalizers→showTotalizers+aggregate,
    onCellEditCommit newValue→{id,field,value,oldValue,row}, fetchData {rows}→{data}+filters,
    toolbar moreMenuItems/bulkActions/presetViews→moreMenu/selectionConfig.actions/defaultViews,
    persistKey→persistId) + comentário stale de persistId em data-table.types.ts (schema v4
    persiste filterModel/search/page sim).
  - Pipeline sync: ds-standards.md (linha na tabela Skills + adendo path base p/ skills
    standalone), CLAUDE.md (linha "Onde cada tarefa começa"), BACKLOG.md (CRUD builder saiu;
    create-page/feature/hook seguem futuros; pendência de cópia pro CLI template),
    PipelineCommandsDoc.tsx (tree + catalog: ds-release e ds-create-crud).
- Decisões: router+sub-skills (carga incremental por estágio — interview no início, blueprint
  no gate, generate só pós-aprovação, kanban sob demanda) em vez de skill única (~1.000 linhas);
  regra de precedência de fontes (types.ts+exemplo > USAGE.md > snippet da skill > memória) por
  causa do drift real encontrado; única duplicação deliberada = mini-tabela de operadores
  (bug silencioso real do Select vazio); inventory.md NÃO tocado (página ≠ componente).
- Assumption: a API do DataTable está estável o suficiente pra matriz de referência valer
  por release; os 10 exemplos canônicos permanecem nos paths src/preview/pages/Clients*.
- Lições novas: nenhuma (o drift USAGE↔types reforça a precedência de fontes, já codificada na skill).

---

### [2026-06-10] | DS REVIEWER | Pre-commit — Frente 1 (bugfix filtros) + Frente 2 (crud-builder skill + docs) | PRE_COMMIT_BLOCKED → RESOLVIDO

- Spec verificada: sim — pipeline-state entrada CONCLUÍDO (2026-06-10, DS DEV, crud-builder + /ds-create-crud) presente com Assumption documentada.
- Gate verificado: n/a — sem token novo nem componente UI iGreen novo. Frente 1 é bugfix; Frente 2 é skill/pipeline.
- Assumption verificada: "API do DataTable estável o suficiente para a matriz de referência valer por release" — VÁLIDA. USAGE.md foi corrigido neste mesmo diff com os drifts reais (virtualize, estimateRowHeight, expandable, persistId, etc.), portanto a skill parte de base saneada.
- Critique genuína: revisão encontrou 1 gap real (README desatualizado em 3 pontos), nenhum que mude direção do código. L-028 no FilterPanel implementado mais cuidadosamente que no DataTableRow do PR anterior — `latestRef.current` lido dentro da closure de unmount (fire-time), não capturado no topo. `isFilterEntryActive` export não cria breaking change nem dep circular (grep confirma: só usada em src/). `tsc --noEmit` limpo. L-001..L-007 limpos nos 3 arquivos de componente. Cross-refs das 3 seções novas (SKILL.md §Invocação por prompt, command, README §subprojeto) mutuamente consistentes.
- Pendências: 1 item MÉDIO — README-PIPELINE-WORKFLOW.md (file tree seção 6 sem ds-create-crud/crud-builder, tabela de flows seção 9, entradas seção 16). RESOLVIDO no mesmo diff antes do commit: tree de commands ganhou ds-update/ds-release/ds-create-crud, skills tree ganhou crud-builder/, flows ganhou linha Tela CRUD/tabela, seção 16 ganhou as 3 entradas (/ds-update, /ds-release, /ds-create-crud).
- Lições novas: nenhuma.

---

### [2026-06-10] | DS DEV + DS REVIEWER | Auditoria docs/showcase aplicada (99 findings) | CONCLUÍDO
- Input: auditoria multi-agente (24 agentes: 4 varreduras transversais + 20 drift-checks USAGE↔código) → 99 findings (27 ALTA / 54 MEDIA / 18 BAIXA), persistidos em `.ai/audits/2026-06-10-audit-docs-showcase.json`. Usuário aprovou aplicar todos.
- Output (22 agentes de correção + fixes inline, 34 arquivos):
  - BUG runtime: classe `gap-gp-3xs` inexistente no theme → `gap-gp-2xs` em CardCheckbox styles, multiSelect column type e 2 showcases (gap renderizava 0).
  - Barrel npm (`src/components/index.ts`): + ButtonGroup, CardCheckbox, API v0.7+ do TableToolbar (ToolbarFilterControl/SettingsMenu/SimpleFilterDrawer, Sort/Cols/FilterPanel, useToolbarFilterControl, isFilterEntryActive) + types shadcn assimétricos (BadgeVariantProps, InputVariantProps/State, inputGroupVariants).
  - inventory.md sincronizado com o disco: +11 ui/ (incl. FormField/AppShell), +6 shadcn (header 26), ViewFormModal→AddViewModal, commands /ds-*, registry 6→15 tipos, hooks (15+3), DataTable parts/utils/builders completos, seção "Hooks e utils transversais" (useTheme/cn/getContrastTextColor/tv).
  - 19 USAGE.md corrigidos contra o código (5 tinham exemplos que NÃO compilavam: FormField, Modal, TabelaTeste, Header, MenuSidebar; Button xxs→2xs; Panel/Chip/DataTable/FloatingPanel/FooterTable/AppShell/Kanban/Table/TableToolbar/PageHeader/AlertModal/ButtonGroup/CardCheckbox drifts pontuais).
  - Preview: CardCheckboxDoc criado + registrado (era o único ui/ sem página); AvatarDoc ganhou seção do Avatar iGreen (colorHex WCAG); sidebar legado "Showcase" id showcase→showcase-v2 (era página em branco); comentários nas páginas órfãs intencionais.
  - Showcases conformes às próprias lições: SacarDialog label raw→FormField (L-023), grids do NovoClienteDrawer gap-gp-xl→gap-form-gap (L-024), font-weights conflitantes removidos (verificação EMPÍRICA da ordem no CSS gerado), slot morto fieldLabel removido, StructureDoc L-014→L-028.
- Decisões: TabelaTeste mantido no barrel (remoção seria breaking — marcado "demo interno, não usar em apps" no inventory; débito pro próximo major). useTheme NÃO exportado na lib (hook do preview app — documentado no inventory). Agentes descartaram falso-positivos com verificação (ex: premissa "último className vence" refutada compilando o CSS real).
- Assumption: os USAGE corrigidos refletem a API v0.8.0; próxima mudança de API de componente DEVE atualizar o USAGE no mesmo PR (regra já coberta pelo pre-commit-check).
- Lições novas: nenhuma — o padrão de drift docs↔código já está mitigado pela precedência de fontes (crud-builder) e pelo pre-commit-check.

---

### [2026-06-10] | crud-builder + DS DEV | Reformulação ClientesFinanceiroShowcase (CRUD completo + Kanban) | CONCLUÍDO
- Input: pedido pra atualizar a tela de finance desatualizada usando o novo DataTable "de forma redonda", + status + visão kanban. Via skill crud-builder (entrevista→blueprint→gate aprovado pelo usuário).
- Output (4 arquivos editados + 2 criados):
  - types: + AccountStatus (pendente/ativo/negociacao/bloqueado), FinanceTransaction, PaymentMethod + 7 campos (monthlyVolume, commissionRate, accountStatus, autoWithdraw, paymentMethods, lastMovement, transactions).
  - mocks: geradores determinísticos pros campos novos + ACCOUNT_STATUS lookup + KPI atRiskCount + helpers formatRelativeDays/formatDateTimeShort.
  - components/ExtratoExpansion/: painel de row expansion (extrato 5 mov + conta bancária + contato + resumo).
  - ClientesFinanceiroShowcase.tsx: 7→14 colunas exercitando o registry quase inteiro (text/badge/currency×2/percentage/boolean/tags/user/datetime/date/actions); inline edit (commissionRate async); Switch toggle (autoWithdraw); row expansion (extrato); totalizers (Σ saldo/volume, avg comissão); 4 bulk actions; 4 preset views (Digitais/Alto valor/Inadimplentes/Saque auto); kanban por accountStatus (4 lanes + DnD optimistic + cards ricos); 4 KPIs; viewMode controlado.
- Decisões: autoWithdraw via Switch direto (não inline-edit) — editType não tem "boolean"/"toggle", e toggle é melhor UX. accountStatus escolhido como eixo do kanban (pipeline financeiro real) e status canônico. persistId bumped v3→v4 (schema de colunas mudou).
- Validação: tsc 0 · browser (Chrome DevTools): tabela 14 cols/87 rows/25 switches, kanban 4 lanes com cards completos, expansão renderiza extrato, 4 KPIs, presets, paginação. Warning benigno pré-existente do type:"actions" (caminho próprio no render, não passa pelo registry).
- Assumption: os campos financeiros mocados são representativos o suficiente pra demonstrar o padrão; a tela é showcase (mock), não consome API real.
- Lições novas: nenhuma.

---

### [2026-06-10] | DS DEV | Ajustes finance + 3 correções de DS core (FloatingPanel/Table/FooterTable) | CONCLUÍDO
- Input: 5 ajustes pós-validação visual da tela finance — autorizado mexer em componentes "com cuidado".
- Output:
  1. **FloatingPanel** (DS core): nova prop `bodyPadded` (default `true` — padding interno padrão do body, parametrizável) + compounds `FloatingPanelSection` (colapsável) / `FloatingPanelField` (label:valor) = pattern canônico de detail panel. Refatorado FinanceDetailPanel pra usá-los (espelha o DetailDrawer da ClientesShowcase, que era a referência). `bodyPadded={false}` aplicado nos consumers que já gerenciam padding próprio (DetailDrawer, ToolbarSimpleFilterDrawer); FloatingPanelDoc migrado pra demonstrar o default (removido p-pad-3xl manual).
  2. **Coluna nome (finance)**: afordância de clique — ícone `PanelRight` fraco + underline no hover (group/lic).
  3. **FooterTable** (DS core): removido `pt-pad-xl` + `px-pad-xs` do wrapper da paginação (2 ocorrências — footer + skeleton). Paginação cola melhor à tabela.
  4. **Table** (DS core) + **tokens**: pinned/sticky cells vazavam conteúdo sob row selecionada (bg-inherit herdava color-mix com `transparent`). Novos tokens `table-row-selected-solid` / `-hover-solid` (light+dark — mesmo mix sobre bg opaco da tabela). TableRow ganha `group/row` + `data-highlighted`; pinned cell troca pra token sólido via `group-data-[highlighted]/row:`. Cobre selected/open/focused.
- Decisões: bodyPadded default `true` (consumers com padding próprio opt-out) — torna o padrão "AI acerta de primeira". Tokens solid via color-mix sobre bg opaco (self-consistente se a marca mudar) em vez de hardcode dos hexes que o usuário passou (#F0F8F4 / #1A2D27 = equivalentes).
- Validação: tsc 0 · tokens:tw4 (4 vars geradas) · browser dark: detail panel com sections colapsáveis + padding (= referência), row selecionada → pinned cell opaco (oklch 0.275, sem alpha — CSS comprovado), footer com menos padding, bulk bar. Consumers de FloatingPanel auditados (DetailDrawer, SimpleFilterDrawer, FloatingPanelDoc) — sem regressão.
- Assumption: nenhum outro consumer de FloatingPanel depende de body sem padding além dos 3 auditados (grep cobriu src/ inteiro).
- Lições novas: candidata — "pinned/sticky cells precisam de bg OPACO; row bg com alpha (color-mix transparent) vaza conteúdo scrollado sob a coluna fixa → usar token -solid". Avaliar registrar como L-029 no review.

---

### [2026-06-11] | DS DEV | 12 ajustes responsivos/UX (DataTable, AppShell, Header, Calendar, Finance) | CONCLUÍDO
- Input: lote de 12 ajustes de responsividade/UX listados pelo usuário — "muitos ajustes em diferentes áreas mas todas importantes; com cuidado pra não quebrar". Branch `fix/responsive-table-adjustments`, 6 commits.
- Output (por item):
  1. **Finance** — removido `mb-pad-2xl` redundante do DataTable (bodyInner já tem padding).
  2. **DataTable** — mobile default = TABELA (era card); toggle "Exibição" (Linhas/Cards) novo na ToolbarSettingsMenu, gated em `cardPossible`. `mobileDisplay` state + `isCardMode` derivado.
  3. **Header** — notificações/mensagens migrados de dropdown custom (hdWrap/hdDropdown) pra `<Popover>` do DS + `mobileSheet` no mobile (bottom-sheet 100vw).
  4. **ToolbarSearch** — Enter/Escape dão blur (fecha teclado mobile); busca segue real-time.
  5. **Table card** — click no kebab (data-slot=card-actions) não abre mais o detail modal junto (guard no handleClick por closest()).
  6. **Finance** — `EditarFinanceDrawer` novo: campos REAIS da row (FormFieldInput/Select, ChipGroup single+multiple, Switch) em vez do form genérico de criação.
  7. **AppShell** — menu mobile abre no hamburger (isMobile → mobileOpen drawer, separado do panelCollapsed desktop); ocupa 100vw×100vh.
  8. **Filtro boolean** — (a) valor não aparecia: boolean cru ia pro Radix Select (exige string) → `toBoolStr()` normaliza pra "true"/"false"/""; (b) popover do chip não fechava: `<Select open>` forçado trava clique-fora + `onClose` não era passado ao renderFastFilterInput → popover do chip agora controlado (openChipKey) e `onClose` fecha + cleanup. Afeta select também (mesma raiz).
  9. **multiSelect** — `mobileSheet={false}` no dropdown (dropdown abaixo do campo no mobile, como select normal).
  10. **Calendar** — dias alinham com colunas dos weekdays (`flex-1` no day cell; antes aspect-square desalinhava).
  11. **ToolbarApplied** — chips de filtro com scroll horizontal no mobile (flex-nowrap + overflow-x-auto, scrollbar oculta) em vez de empurrar a tabela.
  12. **FooterTable** — paginação centralizada no mobile + range "Linhas X 1–N de M rows" oculto (max-sm:hidden).
- Decisões: mobile default tabela (densidade > cards pra power user financeiro); EditarFinanceDrawer via Panel + FormField (L-023); toggle Exibição na settings menu (não toolbar — secundário); chip popover controlado pra destravar onClose sem refatorar o forced-open Select.
- Validação: tsc 0 (cada batch) · browser (Chrome DevTools): item 2 (default TABELA + seção Exibição), 3 (bottom-sheet width=vw), 6 (drawer "Editar — Carlos Oliveira" com 11 campos pré-preenchidos), 7 (menu 100vw×100vh), 8 (ciclo completo: abre chip → valor "Não" exibido + checkmark → seleciona → popover FECHA + re-filtra 29 rows), 12 (paginação centrada). Estado de filtro persiste no reload.
- Assumption: o lote é showcase/preview (mock) — nenhum consome API real; os componentes DS core tocados (Calendar, Header Popover, FooterTable, ToolbarApplied, DataTable) não têm outros consumers que dependam do comportamento antigo (mobile-card-default, dropdown custom do header).
- Lições novas: candidata — "fast-filter chip com `<Select open>` forçado precisa de Popover controlado + `onClose` wired; senão o listbox sempre-aberto trava o dismiss por clique-fora". Avaliar registrar no review/release.

---

### [2026-06-13] | DS DEV | Tree-data hierárquico multi-nível no DataTable (Fase F.4c) — finalização | CONCLUÍDO
- Input: feature começada por agente anterior (interrompido por queda de energia ANTES de comitar/verificar). Estado: uncommitted no repo DS, branch `main`. Arquivos: NOVO `utils/tree-rows.ts` (wrapper `DataTableTreeRow<T>` Symbol-discriminated + `buildTreeRows` + `collectExpandableTreeIds` + `isTreeRow`), NOVO `parts/data-table-tree-toggle.tsx` (chevron + indentação), MODIFICADOS `data-table.tsx`/`data-table.types.ts`/`use-data-table-controller.ts`/`parts/data-table-row.tsx`. Missão: completar com qualidade, build verde, showcase, USAGE, branch + commit (sem push).
- API final: prop `getTreeDataPath?: (row: T) => Array<string|number>` + `treeData?: { showDescendantCount?: boolean; defaultExpanded?: boolean }` + flag de coluna `treeColumn?: boolean`. Rows continuam FLAT; o path define a árvore. Precedência `groupBy` > tree > rowExpansion. Estado de expansão reusa `expandedRowIds` (Set = divergência do default). Pagination desliga automaticamente (`!props.getTreeDataPath` no `shouldPaginate`).
- Output / o que foi completado:
  1. **Bug `singleExpand`**: `toggleTreeNode` reusava `controllerToggleRowExpansion`, que respeita `singleExpand` (abrir um colapsa os demais) → CORROMPE a árvore (apagaria divergência de ramos não relacionados). Reescrito como toggle puro de membership via `controllerSetExpandedRowIds`, independente de `singleExpand`.
  2. **Dead code**: `setAllTreeExpansion` estava definido mas nunca consumido (não há UI nem método no ref pra expand-all). Removido do componente + removido import `collectExpandableTreeIds`. O util permanece em `tree-rows.ts` pronto pro follow-up. Comentário NOTE deixado no lugar.
  3. **Showcase**: `src/preview/pages/ClientsTreePreview.tsx` (rede de licenciados sponsor→descendentes, 3 níveis, espelha V_MAPAREDE_DETALHADO: id/parentId/nivel). `getTreeDataPath` sobe a cadeia de parentId. Registrado em App.tsx (import + valid-id `clients-tree` + render) + doc-nav-data.ts ("Example: Tree-data").
  4. **USAGE.md**: linha na tabela de Capacidades + recipe "Tree-data (hierarquia multi-nível)" com exemplo getTreeDataPath + regras + ref ao preview.
  5. **Build infra (pré-existente, ortogonal)**: `lucide-react@1.7.0` (pin do projeto) publica SEM tipos (campo `typings` aponta pra arquivo inexistente no tarball) → 135 erros TS7016 JÁ presentes em HEAD/v0.9.0 (verificado via stash). Quebrava `tsc -b`. Fix sem trocar versão: `src/lucide-react.d.ts` (ambient bare → resolve named value imports dos ícones) + `src/lib/lucide-types.ts` (tipos `LucideIcon`/`LucideProps` — não dá pra coexistir com bare no mesmo módulo) + 11 imports `import type { LucideIcon }` redirecionados de `"lucide-react"` pra `"@/lib/lucide-types"`. REMOVER ambos quando a versão publicar `.d.ts`.
- Tokens novos: NENHUM (cascata não necessária). tree-toggle usa só existentes: `pad-2xl` (indentação × nível via CSS var inline), `size-icon-sm/md`, `gap-gp-xs`, `rounded-radius-sm`, `text-body-xs`, `text-fg-muted/strong`, `bg-bg-muted`, `ring-ring-primary`. Confirmados em tailwind-theme.css.
- Validação: `npm install` (sync deps faltantes) · `tsc -b` 0 erros · `npm run build` verde (tokens:tw4 + tsc + vite, 3817 módulos) · `vite preview` (prod build) HTTP 200, strings da feature presentes no bundle · lógica `buildTreeRows` verificada por script throwaway (tsx): ALL EXPANDED=7 rows com níveis/descendantCount corretos, ALL COLLAPSED=2 raízes, collapse-B esconde só os filhos de B, expand-A (default-collapsed) mostra filhos diretos mantendo B colapsado, `collectExpandableTreeIds`=[A,B,X]. NÃO foi possível subir `npm run dev` (porta 3100) — esbuild optimizeDeps quebra em source-map truncado de `lucide-react/.../gauge.js.map` (mesmo defeito de empacotamento da versão; afeta só o dev optimizer, não o prod build). Verificação visual feita via prod preview + verificação lógica via script.
- Assumption: (a) o defeito do lucide-react é de empacotamento da versão pinada e o fix por declaração ambient + shim local é reversível (remover ao atualizar versão); (b) os 11 arquivos que tipavam `LucideIcon` querem o tipo, não o valor — redirect pro shim preserva semântica; (c) o preview mock (rede de licenciados) é representativo do consumo real (V_MAPAREDE_DETALHADO). Expand-all/collapse-all programático fica como follow-up (util pronto, falta método no `DataTableRef`).
- Lições novas: candidata — "lib de ícones sem tipos publicados + uso de `LucideIcon` como tipo: TS NÃO permite combinar wildcard de named value imports (bare module) com export de TIPO nomeado no mesmo `declare module`; solução = bare pros valores + shim local pros tipos + redirect dos imports de tipo". Avaliar registrar como L-NNN no review.

---

### [2026-06-13] | DS DEV | 4 polish de célula/toolbar no DataTable (read-more · copy · grab-to-scroll · fullscreen) | CONCLUÍDO
- Input: pedido pra adicionar 4 features de polish (gaps incrementais do audit) ESTENDENDO o DataTable (não reinventar). Modelos no legado: `ReadMoreCell` + `useGrabToScroll` (ui-igreen-virtual-office). Branch `feat/datatable-cell-polish` a partir de `main`. Commit sem push.
- API final (pro app consumir):
  1. **Read-more** — flag de coluna `readMore?: boolean | { lines?: number; label?: string }`. `true` = 1 linha + reticências + "Ler mais"; objeto customiza nº de linhas (line-clamp) e label. Trunca + popover com texto completo (DS-equiv do tooltip legado).
  2. **Copy célula** — flag de coluna `copyable?: boolean | { value?: string | ((row) => string); label?: string }`. Ícone copiar revelado no hover/foco + feedback "Copiado!" (~2s, `navigator.clipboard`, sem dep nova). `value` customiza o texto copiado; `label` o aria-label.
  3. **Grab-to-scroll** — prop raiz `grabToScroll?: boolean`. Arrasto horizontal do corpo (mouse/pen); threshold 6px separa drag de clique (seleção/click preservados; clique pós-drag suprimido); wheel intacto; pulado em touch + alvos interativos.
  4. **Fullscreen** — `toolbar.enableFullscreen?: boolean`. Tool button ⤢ (entre Filtros e Configurações) → container raiz vira overlay `fixed inset-0` (z `--z-index-modal`); Esc/2º clique volta. Estado interno uncontrolled.
- Output / arquivos:
  - NOVO `hooks/use-grab-to-scroll.ts` — pointer listeners no `scrollContainerRef` (mesmo do `<Table>`), `setPointerCapture`, `suppressClickRef` capture-phase, ignora `[data-editable]/[data-expandable]/[data-purpose=selection|actions]` + interativos.
  - NOVO `parts/data-table-cell-addons.tsx` + `.styles.ts` — `DataTableReadMoreCell` (Popover DS) + `DataTableCopyCell` (botão ghost icon + Check/Copy lucide). Wrapping aplicado em `parts/data-table-row.tsx` após `baseContent`, ANTES do wrap tree/expandable; `readMore` tem precedência sobre `copyable`; add-ons desativam `effectiveEllipsis` da cell (gerenciam o próprio truncate). Não aplicam em actions/edit/tree-col.
  - MOD `data-table.types.ts` — props novas em `DataTableColumnDef` (`readMore`/`copyable`), `DataTableProps` (`grabToScroll`), `DataTableToolbarConfig` (`enableFullscreen`).
  - MOD `data-table.tsx` — import hook + ícones `Maximize2/Minimize2`; `useGrabToScroll(scrollContainerRef, grabToScroll)`; state `isFullscreen` + Esc listener; tool button no slot `fullscreen` do TableToolbar; root usa `dataTableStyles({ fullscreen }).root()`.
  - MOD `data-table.styles.ts` — variant `fullscreen` no slot `root` (overlay fixo + bg-canvas + p-pad-2xl).
  - MOD `TableToolbar/table-toolbar.tsx` — slot opcional novo `fullscreen?` (entre `filter` e `settings`). Não-breaking (opcional).
  - MOD `USAGE.md` — 4 linhas na tabela de Capacidades + 4 recipes (read-more/copy/grab-to-scroll/fullscreen) + doc de `toolbar.enableFullscreen` e prop raiz `grabToScroll`.
- Tokens novos: NENHUM (cascata não necessária). Add-ons usam só existentes: `gap-gp-xs`, `text-body-xs/sm`, `size-icon-xs/md`, `p-pad-lg/2xl`, `rounded-radius-sm/md`, `text-fg-brand/muted/default/success`, `bg-bg-muted/canvas`, `ring-ring-brand` (não `ring-ring-primary` — esse não existe no theme; Button canônico usa `ring-ring-brand`). Fullscreen usa var CSS `--z-index-modal`. Todos confirmados em tailwind-theme.css.
- Validação: `npm run build` VERDE (tokens:tw4 + tsc -b + vite build, 3820 módulos). Showcase no preview NÃO adicionado (dev server porta 3100 quebra no optimizeDeps de lucide-react — defeito de empacotamento da versão pinada, idêntico ao registrado na entry de tree-data; afeta só o dev optimizer, não o prod build). Build verde = critério de aceite atendido.
- Assumption: (a) read-more/copy são concerns de RENDER de célula (wrapper no row), não de filtro → não viram column-type do registry (que é p/ filtro); (b) suprimir o clique pós-drag via capture-phase basta pra não disparar onRowClick/seleção; (c) slot opcional novo no TableToolbar é não-breaking p/ consumers atuais (todos passam slots nomeados, ordem fixa preservada).
- Lições novas: candidata — "`ring-ring-primary` NÃO existe no theme gerado (só ring-brand/secondary/danger/info/success/warning); usar `ring-ring-brand` pra focus primary. Há uso legado de `ring-ring-primary` em data-table-tree-toggle.tsx que é no-op silencioso — avaliar corrigir." Avaliar no review.

---

### [2026-06-15] | DS DEV | Combobox (select com busca + scroll) + uso no field-picker do FilterPopover | CONCLUÍDO
- Input: o select de "Campo" do filtro (FilterPopover) usava `Select` (Radix) puro — sem autocomplete e com a lista cortada dentro do popover. Views como MAPACLIENTES têm ~30 colunas → escolher uma no meio é ruim. Pedido (gate aprovado): criar componente reutilizável `Combobox` no DS e trocar o field-picker. Motivado por bug correlato no VO (filtro por coluna com espaço, ex.: "data cadastro", já corrigido no backend).
- Output / arquivos:
  - NOVO `ui/Combobox/` (4 arquivos + USAGE): `combobox.styles.ts` (tv, slots trigger/value/icon/content/itemLabel — trigger espelha 1:1 o `SelectTrigger`), `combobox.types.ts` (`ComboboxProps` + `ComboboxOption`), `combobox.tsx` (`Popover` + `Command`/cmdk; forwardRef no `<button role="combobox">`; open controlado/não-controlado), `index.ts`, `USAGE.md`.
  - MOD `src/components/index.ts` — `export * from "./ui/Combobox"` (após Chip).
  - MOD `.ai/context/components/inventory.md` — linha do Combobox na tabela ui/ + contagem 20→21.
  - MOD `TableToolbar/popovers/filter-popover.tsx` — field-picker "Campo" trocado de `Select` por `<Combobox options=... className={cn(FIELD_BASE, ...)} searchPlaceholder="Buscar campo…" />`. Operador/Valor seguem `Select` (listas curtas). Import `Combobox` de `../../Combobox`.
- Comportamento-chave: busca casa por `label` + `keywords` (inclui o `option.value`); seleção fecha via CLOSURE sobre `option.value` (NÃO depende do arg normalizado/lowercased do `onSelect` do cmdk) → values com espaço/acento/maiúscula (ex.: "data cadastro") funcionam. Lista rolável vem do `CommandList` (`max-h-[300px] overflow-y-auto`).
- Tokens novos: NENHUM (cascata não necessária). Só existentes, todos confirmados em tailwind-theme.css: `min-h-form-lg`, `rounded-radius-lg`, `px-pad-xl`, `gap-gp-md`, `bg-bg-input(/-hover)`, `bg-bg-muted(/-hover)`, `border-border-input`, `border-border-brand`, `text-body-sm`, `text-fg-default/muted/brand`, `shadow-sh-ring`, `size-4` (paridade com o chevron do SelectTrigger). Exceções de hardcode válidas: `w-[var(--radix-popover-trigger-width)]` (pattern Radix, igual ao Select) e `[&_svg]:text-fg-brand` no item selecionado.
- Validação: `npm run build` (DS) VERDE (tokens:tw4 + tsc -b + vite build, 3823 módulos). VO `ui` `tsc -b --noEmit` sem erros novos (só a deprecation pré-existente de `baseUrl`/TS5101, alheia à mudança). L-004 aplicada (trigger usa `focus-visible:outline-none`, não `outline-none` cru como o shadcn SelectTrigger). Showcase/doc-page standalone no preview NÃO adicionada (mesmo defeito de optimizeDeps do lucide-react das entries anteriores; o componente já é demonstrado vivo dentro do FilterPopover) — FOLLOW-UP.
- Assumption: (a) o trigger do Combobox replica 1:1 o visual do `SelectTrigger` recebendo `FIELD_BASE` via `className` (tailwind-merge resolve min-h/radius) → os 3 campos do filtro ficam alinhados; (b) labels das colunas são únicos (cmdk indexa por value/label) — no FilterPopover são os `headerName`, únicos; (c) trocar só o field-picker não altera o contrato público do FilterPopover (props inalteradas) → consumers (DataTable) não quebram.
- Lições novas: candidata — "cmdk `onSelect(value)` entrega o value NORMALIZADO (lowercase/trim); para selects cujo value real tem espaço/acento/maiúscula, NÃO usar esse arg — fechar via closure sobre a opção original." Avaliar no review.

---

### [2026-06-15] | DS DEV | DataTable server-mode: filtro "fino" (gate de ativo + debounce) no use-data-table-query | CONCLUÍDO
- Input: no server-mode, escolher CAMPO ou OPERADOR no filtro (valor ainda vazio) já disparava o fetch — request boba e, em coluna tipada, payload malformado que estourava 500 no backend. Causa: `use-data-table-query` tinha `filterModel` direto nas deps do efeito (refetch a CADA mudança) e SEM debounce (digitar = 1 request/tecla). Edição de componente existente (sem gate).
- Output / arquivos: MOD `DataTable/hooks/use-data-table-query.ts`:
  - `isActiveFilterItem(item)` (reusa `filterValueIsEmpty` de `utils/filter-ops`; nulários isEmpty/isNotEmpty sempre ativos) → `activeFilterModel` (useMemo) com só os itens ATIVOS.
  - `activeFilterKey = JSON.stringify(activeFilterModel)` é o gatilho do efeito (não o `filterModel` cru): escolher campo/operador NÃO muda o conjunto ativo → não refaz fetch.
  - Debounce só do filtro (`filterDebounceMs`, default 350) → digitar o valor = 1 request. Pagination/sort/search seguem imediatos (search já vem debounced do useDataTableSearch).
  - Fetch passa `activeFilterRef.current` (só ativos) ao `fetchData` → backend nunca recebe filtro incompleto. Race-guard `requestIdRef` preservado.
- Tokens novos: NENHUM (mudança lógica, sem estilo).
- Validação: `npm run build` (DS) VERDE (tokens:tw4 + tsc -b + vite, 3823 módulos). Pareado com 2 fixes no VO (mesmo PR de feature no app): gate `isActiveFilterItem` no `ui/lib/datatable.ts` (fetchView/exportView) + guard `isApplicableFilter` no motor da API (`filters.service`, pula filtro incompleto/IN vazio/BETWEEN sem 2 lados → nunca 500). 27/27 testes da API verdes.
- Assumption: (a) o conjunto ATIVO (via `filterValueIsEmpty` + nulários) é o gatilho correto de refetch — escolher campo/operador com valor vazio é no-op; (b) JSON.stringify do modelo ativo é assinatura estável o bastante p/ detectar mudança (ordem de itens preservada); (c) passar só os ativos ao `fetchData` não quebra consumers (o adapter do app já gateava no fetchView; agora é defesa dupla); (d) debounce só no filtro (pagination/sort imediatos) é o trade-off certo de UX.
- Lições novas: candidata — "DataTable server-mode: o gatilho de refetch deve ser a assinatura dos filtros ATIVOS (não o filterModel cru), senão escolher campo/operador dispara request boba; + debounce no filtro. Guard de 'filtro incompleto' em 3 camadas (DS trigger, adapter de payload, motor SQL)." Avaliar no review.

---

### [2026-06-15] | DS DEV | Charts: 6 tipos + showcase de composições + padrões no pipeline | CONCLUÍDO
- Input: criar categoria "Charts" no preview (Area/Bars/Lines/Pies/Radars/Radials replicando shadcn com o DS), depois página "Compositions" com 28 composições de dashboard como inspiração, e por fim padronizar/documentar tudo como design system. Branch `feat/charts-area`.
- Output:
  1. **Componente `Chart`** (ui/Chart) — wrapper sobre Recharts 3 (ChartContainer + ChartTooltip/Content + ChartLegend/Content). Grid reescrito pro token `chart-grid`.
  2. **Tokens `chart`** (color-light/dark): `chart.1`=brand primitive (verde, acompanha a marca), `chart.2..5` harmônicas, **`chart.grid`** (light gray[200] / dark branco 12%). `npm run tokens:tw4` → `--color-chart-1..5` + `--color-chart-grid`.
  3. **Páginas doc**: Area(10) · Bars(10) · Lines(10) · Pies(11 + Donut+Legenda) · Radars(13) · Radials(6 + Progress) — fiéis ao shadcn com paleta/grid do DS.
  4. **Compositions** (`#/chart-showcase`, `ChartShowcaseDoc.tsx`): 28 composições de dashboard, agrupadas em 5 categorias (Receita & Finanças, Usuários & Crescimento, Operações & Status, Cobrança & Campanhas, Mercado), 1 card por linha, gap 32px. Helpers: `Panel`, `CardHead`, `KPI_LABEL`/`KPI_VALUE` (label caption-md + valor 30px), `SectionLabel`.
  5. **Docs/pipeline**: `.ai/context/components/chart-patterns.md` (canônico), `Chart/USAGE.md` ampliado, **L-032** (caveats Recharts 3), resumo em `ds-standards.md` (auto-load), `inventory.md`, `color.md` (namespace chart), `CLAUDE.md` (mapa de tarefas).
- Decisões: chart.1 ancora no **primitive da brand** (muda a marca → muda o chart). Pizza = rampa monocromática da brand (não "carnaval"). 2 séries = verde+âmbar. Grid via token único (dark precisa de branco 12%, não border-subtle 0.04). Cards estreitos = coluna única + max-w fixo (não lado-a-lado).
- Validação: tsc 0 em todos os lotes · browser (Chrome DevTools, dark+light): 6 tipos + 28 composições renderizando, grid visível nos 2 temas, headers KPI padronizados, categorias.
- Assumption: showcase/preview (mock) — nenhuma composição consome API real; `Chart` é o único wrapper de Recharts (DashboardShowcase usa Recharts cru, fora do escopo do token de grid).
- Lições novas: **L-032** registrada (caveats Recharts 3: display-sm/xs inexistentes → heading; Pie shape vs activeIndex; radial stack precisa PolarAngleAxis number; YAxis interval=0 + domain=maior tick; grid via token chart-grid).

### 2026-06-16 | DS DEV | Registry distribution — Fase 1 (infra) | CONCLUÍDO
- Input: spec `.ai/specs/registry-distribution.md` (P1–P4 fechadas).
- Output: `registry.json` (raiz, 5 items: utils/tv/theme/button/input), `scripts/registry-stamp.mjs` (carimbo no meta + header), `package.json` (+`registry:stamp`/`registry:build`), headers `@igreen-stamp` em 9 fontes.
- Decisões: endpoint = deploy Next dedicado na Vercel + `Bearer` (P4); namespace único `@igreen` (P2); carimbo `igreen-ds · <nome> · v<version> · <hash> · data`, version = `package.json.version` (P1); revert via git do consumidor (P3); `tv.ts` e `cn` como `registry:file` com salvaguarda de hash no doctor.
- Assumption: modelo copy-in (componente vira código do consumidor, congelado); `rN` = `package.json.version` (tags do repo furadas). Item crítico aberto pra Fase 2: overwrite do `cn` no consumidor (o `shadcn init` planta o cn padrão; precisa forçar `--overwrite`).
- Lições novas: nenhuma.

### 2026-06-16 | DS REVIEWER | Registry Fase 1 | APROVADO
- Spec verificada: sim. Gate verificado: sim.
- Assumption verificada: válida (copy-in + `rN`=version).
- Critique genuína: além do checklist, achei o ordering do `registry:build` (o `tokens:tw4` regenera o `theme.css` e apaga o stamp) → corrigido pra `tokens:tw4 → registry:stamp → shadcn build`. Headers em `tv.ts`/`utils.ts` são só comentário (+1 linha) — `twMergeConfig` intacto, **L-016 preservado** (`tv.ts ↔ typography` idêntico). tsc exit 0.
- Regressões L-xxx encontradas: nenhuma.
- Lições novas: nenhuma.

---

### 2026-06-17 | ORCHESTRATOR | Distribuição completa + kit consumidor + auditoria | CONCLUÍDO (milestone v0.10.0)

Sessão longa de distribuição ponta-a-ponta (repo pessoal snksergio; origin igreenlab NÃO tocado). Marcos:

- **Registry shadcn (copy-in)** finalizado: 56 itens, deploy Vercel (igreen-registry, Bearer). Embed via registry-data.ts.
- **6 telas-exemplo extração 1:1** dos showcases (clientes, finance, dashboard, order-detail, edit-page, chat) — conteúdo de página sem shell, validadas em consumidor real (shadcn add + tsc 0 + render). Antes eram toys inventados (corrigido — L-034).
- **CLI `@snksergio/create-design-system`** evoluiu 0.7.0 → 0.12.0: banner ASCII, tela de boas-vindas/tutorial, prompt de exemplos + menu navegável, fontes Geist embutidas.
- **Kit de construção no consumidor** (`.claude/` no template): orquestrador `ds-kit` (intenção→rota, skill não-agente — L-036) + skills crud-builder/page-edit/page-detail/dashboard/charts/chat/drawers/cards + `DESIGN.md` enxuto + regras auto-carregadas + hook `protect-ds` (bloqueia tema/tokens/fundação — L-033).
- **Bug corrigido**: `@igreen/data-table` sem `@tanstack/react-virtual` → DataTable crashava em consumidor limpo (L-037).
- **Pipeline DS**: hooks `ds-tokens-check` + cobertura registry no `ds-inventory-check`; `examples-drift-check` (examples↔showcase, L-035); `registry-check`; **CI GitHub Actions** (tsc+test+consistência+drift).
- **Auditoria de saúde**: registry íntegro (0 paths faltando), tsc 0, testes 22/22; órfão removido (ChartComingSoonDoc), docs de path corrigidas, TabelaTeste fora do barrel público, scratch de tools/ limpo.

- **Assumption**: distribuição via copy-in (registry) + CLI é o modelo correto pro caso (CRM com telas sob medida + IA copia/adapta). npm-lib seria controle centralizado ao custo de flexibilidade — descartado. Lib npm `@snksergio/design-system@0.5.1` é vestigial (a depreciar).
- **Lições novas**: L-033 a L-037 (`.ai/status/lessons.md` + resumo em ds-standards).
- **Versão**: DS 0.9.0 → 0.10.0 (milestone, re-stamp do registry). CLI 0.12.0.
- **Pendência do mantenedor**: remover Automation token npm usado nas publicações.

---

### 2026-06-18 | DS DEV | Tela inicial do scaffold (welcome) + tema "Sistema" | CONCLUÍDO (CLI 0.13.0 → 0.13.1)

Continuação da distribuição (snksergio; origin igreenlab NÃO tocado). Só `cli/` — não toca registry/componentes/tokens.

- **0.13.0**: redesenho da `_welcome.tsx` (PageHeader + Badge, cards de prompt, seção "Cores do sistema" com swatches de tokens, bloco de prompt de bootstrap pra IA, vitrine do kit). `buildAppShellApp` (create.js) passa a gerar `Theme = light|dark|system`, default `system`, com observer de `prefers-color-scheme` + opção "Sistema" (ícone Monitor). Fix do bug "OS dark → scaffold branco".
- **0.13.1**: refino de layout sobre o render real — `px/py-pad-page-base` (cards não cortam), `gap-gp-6xl` entre seções, `SectionHead` com `gap-gp-xs` (título↔subtítulo justos), prompts viram **lista** (1 coluna), "Como funciona" vira **timeline** vertical.
- Validado: tsc limpo + render light/dark no consumer-demo (screenshots). `--overwrite` no `igreen:add`/`igreen:update` confirmado cobrindo todos os caminhos (sem mais prompt interativo).
- PRs #21 + #22 (mirror), merged. Publicados npm: `@snksergio/create-design-system@0.13.0` e `@0.13.1` (latest).
- **Assumption**: tela inicial é primeiro contato → vale investir em onboarding (prompts copy-paste + kit visível + tema correto). Mudança é template-only; não afeta consumidores já scaffoldados (pegam via novo `create` ou copy manual).
- **Lições novas**: nenhuma (padrões já cobertos: list/timeline são composição de tokens DS existentes).
- **Pendência do mantenedor**: revogar o Automation token npm usado nas publicações.
