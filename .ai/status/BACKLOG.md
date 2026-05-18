# Backlog de features — iGreen DS v2

> Atualizar sempre que criar, concluir ou descartar uma feature.
> Última revisão: 2026-04

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
- iGreen DS v2 como produto replicável para outros times

---

## 🗑️ Descartadas

| Feature | Motivo |
|---------|--------|
| claw-code | Problema diferente |
| opensquad como framework | Squads dinâmicos vs fixos |
| Responsive tokens | Responsividade no componente, não no token |
| Fluid typography universal | clamp() só ≥ 32px tem ganho real |
