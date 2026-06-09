# Backlog de features — iGreen DS

> Atualizar sempre que criar, concluir ou descartar uma feature.
> Última revisão: 2026-06-09

---

## 🔜 Próxima PR — Padronização DataTable + TableToolbar ("AMPLO")

> Origem: auditoria pré-PR de 2026-06-09 (5 revisores) durante o swap TableToolbar
> canônica/Deprecated. Escopo deliberadamente adiado pra um PR dedicado de
> padronização (o PR do swap ficou "enxuto": só 3 bugs latentes + @deprecated).

**Filtros / operadores (débito de fundo do bug "É"):**
- Unificar vocabulário de operador pra id longo único (`equals`) ponta a ponta →
  **deletar `utils/operator-mapping.ts`** (mapa de 11 pares onde só eq↔equals diverge).
  Toca: `DEFAULT_FILTER_OPERATORS`, `filter-sql-parser` OP_MAP, `AppliedFilterOp`.
- Resolver label de operador **pelo registry** (não `DEFAULT_OP_LABELS` paralelo —
  já divergiu: currency popover "maior que" vs chip ">").
- Extrair `promoteOperatorForColumn` (multiSelect→isAnyOf) pra util — hoje triplicada
  (adapter:307,409 + controller:46).
- `filter-sql-parser` emite `gte`/`lte` que nenhuma definition implementa → filtro
  silenciosamente ignorado. Implementar ou remover do parser.
- Util `filter-value.ts`: `isFilterValueEmpty` (3×) + `genId` (4×) compartilhados.

**column-types:**
- `_shared.ts` com `toNumber`/`toDate`/`resolveChipColor` (duplicados ~150 LOC; divergência
  sutil: number usa `Number.isFinite`, currency/percentage `!Number.isNaN`).
- Factories `makeTextColumnType`/`makeSelectColumnType` (text/email/phone/url e select/user/badge
  viram declarativos).

**data-table.tsx (slim — Frente C):** ⏭️ AVALIADA E NÃO FEITA. Pós-Frente D o
arquivo caiu pra ~1.400 LOC e o resto é complexidade essencial de orquestrador.
`useExportMenuItems` virou moot (triplicação era das cópias deprecadas, removidas
na D). Extrair `DataTableBody`/toolbar JSX exigiria prop-drilling de 25+ deps (ou
expor 25+ valores no Provider) — net-negativo (relocaliza complexidade + indireção).
`enhancedAppliedFilters` poderia ir pro adapter mas acopla state de UI; ganho modesto.
**Conclusão:** não splitar mecanicamente. Reabrir só se a complexidade essencial crescer.

**Hooks (naming/consistência — Frente E):** ✅ FEITO — `*Return`→`*Result`,
`exportHook`→`exporter`, return types explícitos + fronteira standalone documentada
nos `useToolbar*`. `useCallback`/rename `handle*` dos adapters NÃO feito (BAIXA no
audit — popovers não são hot path; churn alto, valor marginal).

**Toolbar Deprecated:** ✅ FEITO (Frente D) — `TableToolbarDeprecated/` + branch
`deprecatedToolbar` + DocPage removidos. ~1.700 LOC dup eliminadas.

**Infra (repo-wide, separado):**
- Line endings: repo é CRLF-wide (412 arquivos); `core.autocrlf=true` normaliza no commit,
  então NÃO é problema de PR — mas considerar `.gitattributes` (`* text=auto eol=lf`) +
  renormalização repo-wide num PR de infra próprio.

**Menores:** `group-rows.ts` key colide valores não-primitivos; `viewNameToString` helper (coerção
`String(name)` em 4 lugares); tokens de altura na Table (`h-[40px/56px/64px/42px]` → cascata DS Designer);
`owner`/`ownerName` no tipo `SavedView` (hoje injetado fora do tipo).

---

## ✅ Implementado

### 3 cenários de criação de componente
- `add-shadcn-component.md`, `create-component.md`, `create-composite.md`
- Entry points finos que delegam para skills

### Pipeline com gate de aprovação
- Gate obrigatório para tokens novos e componentes novos
- `orchestrator.md` gerencia gate, cascata e rollback

### `.claude/rules/` carregada automaticamente
- `ds-standards.md` com regras + lições + dark mode + Radix

### Skills segregadas por agente (~70% redução de contexto por tarefa)
- `ds-designer/` — 7 arquivos: color/spacing/sizing/typography/component-spec/figma + SKILL.md router
- `ds-dev/` — 5 arquivos: token/shadcn/igreen/composite + SKILL.md router
- `ds-reviewer/` — 2 arquivos: SKILL.md (checklist token) + component.md (grep)
- `app-designer/` — 🚧 estruturado (aguardando app)
- `app-dev-react/` — 🚧 estruturado (aguardando app)
- Skills deprecated: igreen-component, igreen-token, igreen-reviewer-guard

### lessons.md — auto-aprendizado
- 14 lições (L-001 a L-014) cobrindo ring, Tailwind literal, dark mode, Radix

### Shadcn instalado — 21 componentes
- 20 Shadcn + Button iGreen · `component-inventory.md` atualizado

### Domínio App estruturado
- `app-designer.md`, `app-dev-react.md` como 🚧 aguardando
- `shared-app-context.md` com estrutura e cascata cross-domínio

### Observabilidade — pipeline-state.md funcional
- Formato de audit log append-only com 3 tipos de entrada
- CONCLUÍDO · PAUSADO (gate) · CASCATA com campo "Retomar"
- Agentes DS Dev e DS Reviewer com instrução obrigatória de escrita

### Sync script agentes → Cursor ✅
- `.claude/scripts/sync-agents-to-cursor.js`
- `package.json` com `"sync:agents"` script
- Mirrors Cursor sincronizados (4 agentes DS)

---

## 🔴 Próxima sessão (alta prioridade)

### Teste em produção real — primeira tela funcional

| Campo | Detalhe |
|-------|---------|
| **Tipo** | Validação / Produção |
| **O que fazer** | Construir uma tela real do app desktop (dashboard, listagem, formulário) 100% com tokens DS e componentes existentes, sem hardcode |
| **Impacto** | Valida o DS em condição real · revela gaps de tokens/componentes que preview não revela · documenta padrões para `igreen-page` skill |
| **Critério** | Aprovada pelo ds-reviewer sem nenhuma lição nova gerada |

### FormField — composto prioritário

| Campo | Detalhe |
|-------|---------|
| **O que fazer** | `ui/FormField/` via `/create-composite` — Input + Label + HelperText + ErrorMessage |
| **Dependências** | Input ✅, Label ✅ |

### pipeline-state.md — validar em uso real

| Campo | Detalhe |
|-------|---------|
| **O que fazer** | Executar uma tarefa completa com agentes e verificar se o log está sendo preenchido corretamente |

---

## 🟡 Após primeira tela validada

### DataTable
- TanStack Table + tokens iGreen · sorting, pagination, row selection

### Templates de arquitetura
- `/create-page`, `/create-feature`, `/create-hook` expandindo o modelo de `/create-component`

### Toast / Sonner · Tooltip · Popover · Command/Combobox
- Componentes Shadcn restantes via `/add-shadcn-component`

---

## 🟢 Modelo estável em produção

### Pixel Agents
- Extensão VS Code para monitorar sessões Claude Code em tempo real
- github.com/pablodelucca/pixel-agents — gratuita no marketplace

### Claude Code agent-memory nativo
- O campo `memory: user` nos frontmatters já está configurado
- Explorar agent-memory nativo para complementar o `lessons.md` manual

### Builder visual com ReactFlow
- iGreen DS como produto replicável para outros times

---

## 🗑️ Descartadas

| Feature | Motivo |
|---------|--------|
| claw-code | Problema diferente |
| opensquad como framework | Squads dinâmicos vs fixos |
| Responsive tokens | Responsividade no componente, não no token |
| Fluid typography universal | clamp() só ≥ 32px tem ganho real |
