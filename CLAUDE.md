# iGreen Design System — v2

Stack agnóstico. Tailwind e Shadcn são adapters opcionais, não a fundação.

---

## Checklist de início de sessão

Antes de qualquer tarefa, na ordem:

```
1. Ler este arquivo (CLAUDE.md) — regras e mapa de tarefas
2. Confirmar que .claude/rules/ds-standards.md foi carregado automaticamente
3. Verificar .ai/status/pipeline-state.md — há tarefa PAUSADA ou CASCATA aberta?
4. Perguntar: "Qual o foco desta sessão?"
```

⛔ Não escanear src/, tokens/ ou node_modules/ sem solicitação.
⛔ Não rodar npm sem solicitação.

---

## Checklist de encerramento de sessão

Antes de encerrar uma sessão onde houve alterações:

```
1. pipeline-state.md atualizado? — se criou/modificou token ou componente, registrar
2. Há tarefa incompleta? — marcar como PAUSADO em pipeline-state.md com contexto para retomada
3. Houve lição nova? — se um padrão de erro se repetiu, registrar em lessons.md
```

⛔ Não consolidar sem confirmação do usuário.

---

## ⛔ REGRAS DE COMPORTAMENTO — LER ANTES DE QUALQUER AÇÃO

### Regra 1 — NUNCA criar token sem verificação prévia
```
1. Ler o arquivo semântico correspondente
2. Verificar se token existente já serve
3. Só criar se NENHUM existente atender
```

### Regra 2 — NUNCA criar componente sem verificar o inventário
```
1. Ler .ai/context/components/inventory.md
2. Verificar se existe em shadcn/ ou ui/
3. Só criar se COMPROVADAMENTE ausente
```

### Regra 3 — DS Dev NUNCA cria token durante implementação
```
Token faltante → PARAR → sinalizar cascata → aguardar token ser criado
```

### Regra 4 — Gate é OBRIGATÓRIO para tokens novos e componentes novos
```
DS Designer entrega spec → PARAR → apresentar ao usuário → aguardar "sim"
Aplica-se a: token novo, componente novo, extração Figma.
Não aplica-se a: edição de existente, adapters, tarefas técnicas.
```

### Regra 5 — Classes DS sempre antes de Tailwind literal
```
gap-4?    → gap-gp-md   |   p-4?      → p-sp-md
rounded?  → rounded-radius-*   |   shadow?  → shadow-sh-*
h-9?      → min-h-form-md (36px)  |   h-10? → min-h-form-lg (40px)
```

### Regra 6 — Self-interrupt obrigatório
```
"Estou prestes a criar algo novo?" → verificar se já existe antes de prosseguir
```

---

## Leitura automática no início de qualquer sessão

`.claude/rules/ds-standards.md` é carregado automaticamente (rules/).
Contém: regras de comportamento + mapa completo de skills + lições L-001 a L-016.

Para referência de código detalhada (padrão tv() completo, tabela de tokens, naming):
→ `.ai/rules/coding-standards.md`

---

## Hooks automáticos (pipeline autônomo)

Não precisam ser invocados. Rodam em todo Edit/Write:

| Hook | Quando dispara | O que faz |
|------|----------------|-----------|
| `format-on-save.sh` | qualquer .ts/.tsx/.md | prettier nos arquivos editados |
| `ds-lint-styles.sh` | `src/components/**/*styles.{ts,tsx}` | greps L-001/L-002/L-003/L-004/L-005/L-007 — warning em stderr quando encontra anti-pattern |
| `ds-inventory-check.sh` | `src/components/ui/<Nome>/**` | alerta se USAGE.md ausente ou inventory.md não menciona o componente (L-016) |
| `block-rm-rf.sh` | Bash | bloqueia `rm -rf` perigoso |
| `block-sensitive-edit.sh` | Edit/Write | bloqueia .env, credentials, migrations |

Os 3 primeiros são informativos — nunca bloqueiam o Edit, só sinalizam pelo stderr. Quando ver o aviso, corrija antes de continuar.

Logs em `.ai/scratch/hook-log.txt`.

---

## Arquitetura de tokens (3 tiers)

```
TIER 1 — Primitives (API privada, nunca em componentes)
  color-palette.ts · scales.ts · fonts.ts · motion.ts

TIER 2 — Semantic (API pública via CSS vars)
  color-light.ts / color-dark.ts
  spacing.ts · sizing.ts · shape.ts · elevation.ts · typography.ts

TIER 2.5 — Component tokens
  components/sizing.ts  → form.* · layout.* · icon.* · container.*
  components/spacing.ts → padCard.* · padPage.*

  ↓ transforms/to-tailwind-v4.ts → src/styles/theme/tailwind-theme.css
  ↓ consumidos via classes: gap-gp-*, rounded-radius-*, shadow-sh-*, etc.
```

---

## Prefixos CSS — anti-colisão com Tailwind nativo

| Token | Classe DS | Nunca usar |
|-------|-----------|------------|
| gap | `gap-gp-md` | `gap-4` |
| space | `p-sp-md` | `p-4` |
| pad | `px-pad-lg` | `px-3` |
| radius | `rounded-radius-base` | `rounded-sm/md/lg` |
| shadow | `shadow-sh-md` | `shadow-sm/md/lg` |
| form height | `min-h-form-lg` (40px) | `h-10` |
| form height | `min-h-form-md` (36px) | `h-9` |
| icon | `size-icon-md` | `size-5` |
| container | `max-w-container-md` | `max-w-sm/md/lg` |

---

## Nomenclatura de cores

- `primary` = cor da marca. NÃO é "texto principal"
- `fg.foreground` = texto padrão (neutral)
- `danger` = feedback destrutivo (semântico DS — primitivo, CSS gerado e tokens usam `danger`; APIs antigas como `Button.color="critical"` mapeiam para tokens `-danger` internamente)
- `on-*` = texto sobre cor de marca (`fg.on-primary`)
- `ring.*` = focus rings — NUNCA `border.*` para isso

---

## Onde cada tarefa começa

| Tarefa | Arquivo a editar | Skill do agente |
|--------|------------------|----------------|
| Nova cor semântica | `color-light.ts` + `color-dark.ts` | `ds-designer/spec-token.md` (tipo=color) |
| Novo spacing | `spacing.ts` | `ds-designer/spec-token.md` (tipo=spacing) |
| Novo sizing/height | `components/sizing.ts` | `ds-designer/spec-token.md` (tipo=sizing) |
| Novo radius/border | `shape.ts` | `ds-designer/spec-token.md` (tipo=radius) |
| Nova shadow | `elevation.ts` | `ds-designer/spec-token.md` (tipo=shadow) |
| Novo preset tipográfico | `typography.ts` | `ds-designer/spec-token.md` (tipo=typography) |
| Spec de componente novo | — | `ds-designer/spec-component.md` |
| Extração do Figma | — | `ds-designer/figma-extract.md` |
| Implementar token | arquivo semântico | `ds-dev/impl-token.md` |
| Componente iGreen (tv()) | `ui/[Nome]/` | `ds-dev/impl-igreen.md` |
| Componente Shadcn | `shadcn/[nome].tsx` | `ds-dev/impl-shadcn.md` |
| Componente composto | `ui/[Nome]/` | `ds-dev/impl-composite.md` |
| Editar visual existente | `[nome].styles.ts` APENAS | `ds-dev/impl-igreen.md` |
| Revisar token | — | `ds-reviewer/SKILL.md` |
| Revisar componente | — | `ds-reviewer/review-component.md` |
| Atualizar Updates timeline | `src/preview/pages/updates-data.ts` | `ds-dev/update-changelog.md` |
| Release completa (changelog + bump + commit + PR) | `updates-data.ts` + `package.json` + git | `ds-dev/release.md` |

---

## Regra de ouro

Componente NUNCA importa primitivos ou tokens semânticos diretamente.
Componente SEMPRE usa classes CSS geradas via `*.styles.ts` com `tv()`.

**Dependency flow:** primitives → semantic → to-tailwind-v4 → CSS vars → tv() classes → componente

---

## Regras críticas de código

- Zero hardcoded (`#fff`, `16px`, `0.875rem` → proibido)
- Tipografia via presets, rem/clamp — nunca px
- `tv` de `@/utils/tv` (nunca `tailwind-variants`)
- `disabled` sempre como último `compoundVariant`
- Mudar visual = mudar só `[nome].styles.ts`
- Dark mode = só `color-dark.ts`
- Após tokens: `npm run tokens:tw4`

---

## Hierarquia de fonte única — onde buscar cada coisa

⚠️ **Cada tipo de informação tem 1 fonte canônica.** Sem duplicação entre `.claude/` e `.ai/`. Quando ambos teriam, o pipeline aponta de um pro outro.

### `.claude/` — Pipeline organizacional (Claude Code)

| Pasta | Função | Carregamento |
|---|---|---|
| `agents/` | IDENTIDADE dos 6 agents (papel + workflow) | Sob demanda via subagent |
| `commands/` | SLASH commands (entry points) | Quando user digita `/<nome>` |
| `skills/<agent>/` | COMO fazer (templates + checklists) | Sob demanda via SkillTool |
| `rules/` | REGRAS auto-carregadas (glob-scoped) | Automático nos globs |
| `hooks/` | AUTOMAÇÕES shell (sempre disparam) | Auto via settings.json |
| `output-styles/` | SHAPE da resposta | Auto via settings.json |
| `settings.json` | Control panel (permissions + hooks + outputStyle) | Auto |

### `.ai/` — Contexto técnico do projeto

| Pasta | Função | Carregamento |
|---|---|---|
| `context/` | CONTEXTO técnico (architecture, tokens, components, doc-guide) | Sob demanda |
| `rules/coding-standards.md` | REFERÊNCIA longa do padrão tv() | Sob demanda |
| `status/pipeline-state.md` | AUDIT log (append-only) | Sempre verificar no início |
| `status/lessons.md` | LIÇÕES completas L-NNN | Sob demanda |
| `status/BACKLOG.md` | Backlog de features | Sob demanda |
| `specs/` | SPECS ativas (humano-facing) | Sob demanda |

### Co-localizado com o código

| Arquivo | Função |
|---|---|
| `src/components/ui/<Nome>/USAGE.md` | ATALHO IA por componente (consumir sem ler source) |
| `src/components/ui/<Nome>/<nome>.styles.ts` | Fonte de verdade visual (tv()) |

### Fontes únicas críticas

| Tipo de informação | Fonte canônica única |
|---|---|
| Regras DS + 14 lições + anti-patterns | `.claude/rules/ds-standards.md` |
| Identidade do orchestrator + roteamento | `.claude/agents/orchestrator.md` |
| Templates de implementação iGreen (tv()) | `.claude/skills/ds-dev/impl-igreen.md` |
| Padrão tv() completo (referência longa) | `.ai/rules/coding-standards.md` |
| Arquitetura completa | `.ai/context/architecture.md` |
| Inventário de componentes | `.ai/context/components/inventory.md` |
| Tokens por tipo | `.ai/context/tokens/<tipo>.md` |
| Audit log de decisões | `.ai/status/pipeline-state.md` |
| Lições completas (L-NNN formato canônico) | `.ai/status/lessons.md` |
| Doc humana do pipeline | `README-PIPELINE-WORKFLOW.md` (raiz) |

---

## Preview app

`npm run dev` → porta 3100
Componentes iGreen: `src/components/ui/`
Componentes Shadcn: `src/components/shadcn/`

## Stack / arquitetura detalhada

Ler `.ai/context/architecture.md`
