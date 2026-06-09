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

**data-table.tsx (2428 LOC):**
- Extrair `parts/data-table-toolbar.tsx` + `parts/data-table-toolbar-legacy.tsx` (corta ~700 LOC,
  isola a branch legada).
- Extrair `parts/data-table-body.tsx` (IIFE de ~256 LOC com renderRow/renderItem/virtualização).
- `useExportMenuItems()` — lógica de export-menu triplicada 3×.
- `enhancedAppliedFilters` (~50 LOC no render) → mover pro filter adapter.

**Hooks (naming/consistência):**
- Adapters: prefixo `handle*` uniforme + `useCallback` nos handlers (sort/cols/filter falam línguas diferentes).
- Tipo de retorno explícito `*Result` (renomear `UseToolbarFilterControlReturn`); `exportHook`→`exportCsv`.
- Documentar fronteira `useToolbar*` (standalone, NÃO usados pela DataTable).

**Toolbar Deprecated:**
- **Remover `TableToolbarDeprecated/`** quando o branch `deprecatedToolbar` do DataTable
  não for mais necessário (1.705 LOC duplicadas vivas; a11y `focus-visible:shadow-sh-ring`
  ficou só na canônica). Decidir prazo.

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
