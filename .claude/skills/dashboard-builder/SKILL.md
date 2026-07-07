---
name: dashboard-builder
description: >
  Construtor guiado de tela de DASHBOARD / PAINEL (composição de KPIs + gráficos +
  rankings + resumos) com os primitivos do iGreen DS. Entrevista o usuário (quais
  KPIs rápidos, quais gráficos, rankings/fusão, card dividido/mapa, tabela/lista
  embutida, layout das rows), consolida um blueprint, apresenta GATE e só então
  gera a página — sempre ancorando nas RECEITAS canônicas
  (.ai/context/components/dashboard-patterns.md) e no example-dashboard. Entry
  points: /ds-create-dashboard (direto) ou /ds-create-screen (front-door).
---

# Dashboard Builder — Router

Você guia a criação de uma tela de **dashboard/painel** que **compõe** os primitivos
do DS (`Kpi`/`KpiGroup`/`KpiDelta`, `Chart`, `Panel`, `DataTable`, `DataList`, `Chip`,
`Avatar`) nos **padrões canônicos** já validados. Você NÃO inventa API, NÃO gera de
memória e NÃO toca em arquivo antes do gate.

> Irmão do `crud-builder` (tabela) e do `list-builder` (lista de cards). Dashboard
> não é um componente — é uma **composição** de seções. Por isso a fonte primária
> aqui é a **receita** (`dashboard-patterns.md`), não um único componente. Uma tabela
> ou lista DENTRO do dashboard é delegada ao crud/list-builder.

## ⚠️ Desambiguação ANTES de tudo (anti-erro)

| Dashboard (ESTA skill) | Não é dashboard → outro builder |
|---|---|
| **compõe** várias seções: KPIs rápidos + gráfico(s) + ranking/resumo numa tela de "visão geral" | 1 tabela/grade densa de registros → `crud-builder` |
| foco em métricas/tendência/comparação, pouca edição | 1 lista de cards standalone (feed/árvore/membros) → `list-builder` |
| ex: painel do líder, resumo de categoria, visão da rede | 1 gráfico isolado sem o resto → skill `charts` / Chart/USAGE |

Se o pedido é só UMA grade, UMA lista ou UM gráfico → **PARAR** e rotear pro builder
certo. Dashboard = **2+ tipos de seção** numa tela de visão geral.

## Escopo (fixo)

- ✅ Composição de dashboard: shell (`PageHeader` + rows), **KPI-group "Painel do
  Líder"** (§1), **chart-cards** (§2), **fusão KPI+evolução / ranking** (§3), **card
  dividido em 2 / mapa** (§4), e **tabela/lista embutida** (delegando distribuição a
  §5/§6). Period selector, SectionLabel, layout responsivo (1 card/row estreito,
  rows 2–3 col).
- ⛔ CRUD denso standalone (→ `crud-builder`), lista standalone (→ `list-builder`),
  gráfico isolado (→ `charts`), form/wizard (→ `page-edit`).

## Fonte primária — as RECEITAS canônicas

**LER SEMPRE antes de montar**: `.ai/context/components/dashboard-patterns.md`. Ela
tem as 6 receitas com class strings verbatim + tokens + regra. NÃO reescreva de
memória — cite a §correspondente. O `example-dashboard` é a referência runnable
(KPI-group divided + chart-cards).

## Fluxo — 3 estágios com carga incremental

```
/ds-create-dashboard  (ou /ds-create-screen → desambiguação → aqui)
   │
   ▼  carregar interview.md
1. ENTREVISTA  (fases 0-6: intent → KPIs → gráficos → ranking/fusão → dividido/mapa → tabela/lista → layout)
   │  acumula escolhas — ZERO edição em disco
   ▼  carregar blueprint.md
2. BLUEPRINT [GATE]  — preview consolidado (mapa de seções/rows) + pré-validações
   │  aguardar "aprovar" do usuário
   ▼  carregar generate.md
3. GERAÇÃO  — ler dashboard-patterns.md + example-dashboard → montar página → registrar → tsc → handoff
```

| Estágio | Arquivo | Quando carregar |
|---|---|---|
| Entrevista | `interview.md` | Imediatamente após este router |
| Blueprint/gate | `blueprint.md` | Quando a entrevista terminar |
| Geração | `generate.md` | SÓ após aprovação do gate |

## ⚠️ Regra de precedência de fontes (anti-drift)

```
1. .ai/context/components/dashboard-patterns.md (receitas) + example-dashboard
   + types dos primitivos (Kpi/kpi.types.ts, Chart/USAGE.md, DataTable/DataList types)
2. USAGE.md de cada primitivo (Kpi, Chart, Panel, DataTable, DataList)
3. Snippets desta skill
4. Memória da IA  ← NUNCA confiar sozinha
```

Divergência → **receita + types vencem**; sinalize o drift pro usuário corrigir a doc.

## Parâmetros do ambiente (resolver ANTES da entrevista)

| Variável | Neste repo (DS) | Consumer app (CLI template) |
|---|---|---|
| `IMPORT_PATH` | `@/components/ui/*` | `@/components/ui/*` (copy-in) |
| `PAGES_DIR` | `src/preview/pages/` | perguntar (ex: `src/pages/`) |
| `REGISTRO` | receita App.tsx + doc-nav-data.ts (ver generate.md) | perguntar (router do app) |
| `RECEITAS` | `.ai/context/components/dashboard-patterns.md` + `src/examples/dashboard/` | via CLI: `npm run igreen:add -- example-dashboard` + `dashboard-patterns` (doc hospedada) |

Detecção: `package.json.name === "@snksergio/design-system"` → repo DS; senão consumer.

## Invocação por prompt (sem slash command)

DS como subprojeto / sessão na raiz do pai: o usuário aponta este arquivo e a IA
executa os `.md` como autoritativos. Mesma ordem de carga (SKILL → interview →
[gate] blueprint → generate). Ambiente = consumer; `RECEITAS` apontam pro pattern
doc do subprojeto (fallback GitHub). Guardrails e gate valem integralmente.

## Guardrails (não-negociáveis)

1. **LER `dashboard-patterns.md` + example-dashboard ANTES de gerar** (matriz no
   generate.md) — nunca compor de memória.
2. **KPI rápido = KPI-group "Painel do Líder"** (§1): `<KpiGroup divided>` +
   `<Kpi>` + `<KpiDelta>`. Tone colore SÓ o ícone (círculo); valor default (só KPI
   de alerta ganha cor). Delta: `signed` só quando o sinal = bom/ruim; senão
   `tone`/`positive` explícito (ex.: "-12s" é melhora → success).
3. **Gráfico = SEMPRE `<ChartContainer>`**, cor só por token (`--color-chart-1..5`);
   caveats do Recharts 3 em `chart-patterns.md`/`charts`. Chart em card `h-[160px]`.
4. **Ranking/fusão** (§3) e **card dividido** (§4): divisor via `border-l`/`border-t`
   (L-039), nunca só por gap; ícone mini-stat = **quadrado** `size-comp-lg
   rounded-radius-base`, KPI-group = **círculo** `size-form-lg rounded-radius-full`.
5. **Tabela/lista embutida** → delegar a `crud-builder`/`list-builder` (distribuição
   §5/§6): filtros nativos pré-aplicados, sem form solto acima (L-051).
6. Classes DS antes de Tailwind literal; zero hardcode de cor. Números grandes
   literais (`text-[24px]/[28px]/[30px]`) só onde não há preset.
7. Layout: estreito → 1 card/row + coluna única; rows 2–3 col via grid; `gap-gp-2xl`
   entre seções. Shell: `flex flex-col gap-gp-2xl` + `PageHeader` + spacer de rodapé.
8. Página registrada nos pontos do `REGISTRO` — página órfã = tarefa incompleta.
9. `npx tsc --noEmit` limpo antes do handoff — abort-on-error.
10. Page id sem colisão com `DOC_PAGES` (App.tsx).

## Handoff

- Entrevista pronta → `BLUEPRINT_PRONTO: <Painel> (dashboard) — aguardando gate`
- Pós-geração → `DASHBOARD_PRONTO: <Painel> — #/<page-id>`
- Registrar `PAUSADO (gate)` e `CONCLUÍDO` (com Assumption) em
  `.ai/status/pipeline-state.md`.
