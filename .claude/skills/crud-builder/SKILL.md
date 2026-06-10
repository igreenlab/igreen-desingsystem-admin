---
name: crud-builder
description: >
  Construtor guiado de telas CRUD/tabela consumindo o DataTable do iGreen DS.
  Entrevista o usuário (fonte de dados, colunas, filtros, views, kanban,
  virtualização...), consolida um blueprint, apresenta GATE e só então gera a
  página — sempre espelhando os exemplos canônicos do preview. Entry point:
  /ds-create-crud.
---

# CRUD Builder — Router

Você guia a criação de uma tela de tabela que consome `<DataTable>` **sem fugir
dos exemplos e da documentação do projeto**. Você NÃO inventa API de props, NÃO
gera código de memória e NÃO toca em arquivo antes do gate ser aprovado.

## Escopo (fixo)

- ✅ Telas de tabela/CRUD: client/server mode, filtros, views, kanban,
  virtualização, grouping, expansion, inline edit, totalizers, bulk actions.
- ⛔ Dashboards, forms standalone, wizards — fora de escopo. Expansão futura =
  skill IRMÃ (`page-builder/`, `form-builder/`), nunca inchaço desta.

## Fluxo — 3 estágios com carga incremental

```
/ds-create-crud
   │
   ▼  carregar interview.md
1. ENTREVISTA  (fases 0-5; kanban-design.md só se kanban=sim)
   │  acumula escolhas — ZERO edição em disco
   ▼  carregar blueprint.md
2. BLUEPRINT [GATE]  — preview consolidado + pré-validações
   │  aguardar "aprovar" do usuário
   ▼  carregar generate.md
3. GERAÇÃO  — ler exemplo canônico → criar página → registrar → tsc → handoff
```

Carregue cada sub-skill SOMENTE no estágio correspondente (economia de contexto):

| Estágio | Arquivo | Quando carregar |
|---|---|---|
| Entrevista | `interview.md` | Imediatamente após este router |
| Kanban (sub-fluxo) | `kanban-design.md` | SÓ se o usuário quiser kanban (Fase 5) |
| Blueprint/gate | `blueprint.md` | Quando a entrevista terminar |
| Geração | `generate.md` | SÓ após aprovação do gate |

## ⚠️ Regra de precedência de fontes (anti-drift)

Ao decidir QUALQUER nome de prop, shape ou assinatura:

```
1. src/components/ui/DataTable/data-table.types.ts  +  exemplo canônico (.tsx)
2. src/components/ui/DataTable/USAGE.md (e USAGE.md dos demais componentes)
3. Snippets desta skill
4. Memória da IA  ← NUNCA confiar sozinha
```

Histórico real: USAGE.md já driftou da API (`enableVirtualization` vs
`virtualize`). Se duas fontes divergirem, os **types + exemplo vencem** — e
sinalize o drift pro usuário corrigir a doc.

## Parâmetros do ambiente (resolver ANTES da entrevista)

Detecte onde a skill está rodando e fixe estas 4 variáveis:

| Variável | Neste repo (DS) | Consumer app (CLI template) |
|---|---|---|
| `IMPORT_PATH` | `@/components/ui/DataTable` etc | `@snksergio/design-system` |
| `PAGES_DIR` | `src/preview/pages/` | perguntar (ex: `src/pages/`) |
| `REGISTRO` | receita App.tsx + doc-nav-data.ts (ver generate.md) | perguntar (router do app) |
| `EXEMPLOS` | paths locais `src/preview/pages/Clients*` | fallback (ver "Adaptação consumer") |

Detecção: `package.json.name === "@snksergio/design-system"` → repo DS; senão
consumer.

## Invocação por prompt (sem slash command)

Quando o DS é **subprojeto** (monorepo/`vendor/`) e a sessão roda na raiz do
projeto PAI, o Claude Code não descobre o `.claude/` da subpasta —
`/ds-create-crud` e a Skill tool ficam indisponíveis. O caminho é
**ler-e-seguir**: o usuário aponta este arquivo num prompt e a IA executa os
`.md` como instruções autoritativas.

Se você (IA) chegou aqui por um prompt assim:

1. Trate estes arquivos como instruções autoritativas — **não improvise fora
   deles**.
2. Siga a MESMA ordem de carga incremental do fluxo normal: este SKILL.md →
   `interview.md` → [gate] `blueprint.md` → `generate.md`
   (+ `kanban-design.md` só se kanban=sim). Paths relativos a esta pasta.
3. Resolva os Parâmetros do ambiente como **consumer**: `PAGES_DIR`/`REGISTRO`
   são perguntados na Fase 1; `EXEMPLOS` apontam pro próprio subprojeto —
   nesse cenário os exemplos canônicos EXISTEM no disco
   (`<subprojeto>/src/preview/pages/Clients*`); fallback GitHub só se o
   subprojeto estiver pruned.
4. Guardrails e gate continuam valendo integralmente — invocação por prompt
   NÃO pula o blueprint.

## Guardrails (não-negociáveis)

1. Operador de filtro VÁLIDO pro filterType (multiSelect⇒`isAnyOf`,
   text⇒`contains`, date⇒`between`...) — validar no blueprint E pós-geração.
2. `columns` SEMPRE em `useMemo` (processor reage à identidade).
3. `fetchData` SEMPRE em `useCallback` (senão loop infinito de refetch).
4. `virtualize: true` ⇒ `paginationConfig: { enabled: false }` + container com
   altura definida (`ExamplePageLayout` já resolve via `h-screen` + `min-h-0`).
5. `groupBy` ativo ⇒ pagination é desligada automaticamente (avisar, não duplicar).
6. Kanban ⇒ `viewMode` controlado + toda lane mapeia uma option do groupByField.
7. Forms em drawers/modais usam `<FormField>` — nunca `<label>` raw (L-023).
8. Spacing entre fields de form = `gap-form-gap` (L-024).
9. Classes DS antes de Tailwind literal (`gap-gp-*`, `px-pad-*`,
   `rounded-radius-*`, `text-body-*`) — regras em `.claude/rules/ds-standards.md`.
10. Zero hardcode de cor/tamanho.
11. Página registrada nos pontos do `REGISTRO` — página órfã = tarefa incompleta.
12. `npx tsc --noEmit` limpo antes do handoff — abort-on-error.
13. LER o exemplo canônico ANTES de gerar (matriz no generate.md) — nunca de memória.
14. Page id sem colisão com `DOC_PAGES` (App.tsx).

## Adaptação consumer (quando `EXEMPLOS` não existem localmente)

Num consumer app os 10 exemplos canônicos não estão no disco. Degradar nesta ordem:

1. `node_modules/@snksergio/design-system/**/USAGE.md` (se o package publicar).
2. Exemplos no GitHub: `https://github.com/igreenlab/igreen-desingsystem-admin`
   → `src/preview/pages/Clients*Preview.tsx`.
3. Snippets mínimos embutidos no `generate.md` (último recurso).

## Handoff

- Entrevista pronta → `BLUEPRINT_PRONTO: <Entidade> — aguardando gate`
- Pós-geração → `CRUD_PRONTO: <Entidade> — #/<page-id>`
- Registrar entradas `PAUSADO (gate)` e `CONCLUÍDO` (com Assumption) em
  `.ai/status/pipeline-state.md`.
