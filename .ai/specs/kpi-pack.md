# Spec — KPI Pack (showcase de modelos)

**Data:** 2026-06-23 · **Tipo:** template (showcase) · **Branch:** `feat/kpi-pack`

## O que é

Um **pack de KPIs**: galeria de ~9 variações distintas de cards de KPI/estatística,
construídas 100% com o iGreen DS, para servir de **modelos copy-paste** ("inspirar e
usar"). **Não é um componente** com props — é uma página de showcase com exemplos.
Categoria: **Templates**.

> Primitivo (`KpiCard`/`Stat`) fica para depois — só quando os padrões se repetirem
> e justificarem extração (decisão do usuário).

## Decisões (gate)

| Tema                  | Decisão                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Estrutura             | Galeria de modelos (showcase). Sem componente novo com props.                                                                                                                                   |
| Distribuição          | **Só showcase** (`#/kpi-pack`). Sem registry/CLI copy-in.                                                                                                                                       |
| Tema                  | **Theme-aware** — tudo via tokens light/dark. Refs "always-dark"/coloridos viram cards normais (escurecem no dark) ou usam tokens de marca (`bg-bg-brand`/`bg-bg-brand-subtle`). Zero hardcode. |
| Sparklines            | Reusar `ChartContainer` do DS (Recharts) — bars/line/area/donut.                                                                                                                                |
| Delta (+%/-%)         | `Chip` do DS — `color="success"` / `color="danger"`, `variant="soft"`.                                                                                                                          |
| Ilustração (modelo 1) | Pular (slot vazio, sem asset externo).                                                                                                                                                          |
| Escopo 1ª entrega     | Os 9 modelos de uma vez.                                                                                                                                                                        |

## Arquitetura

- Arquivo único: `src/preview/pages/KpiPackDoc.tsx`.
- **Reusa o padrão canônico do `ChartShowcaseDoc`**: helpers `Panel`
  (`rounded-radius-lg bg-bg-surface p-pad-4xl shadow-sh-lg ring-1`), `CardHead`,
  `KPI_LABEL` (`text-caption-md text-fg-muted`), `KPI_VALUE` (~30px bold),
  `SectionLabel` (categoria). Mesma linguagem visual do DS.
- Cada modelo num `ExampleSection` (preview + código copy-paste).
- **Grid responsivo** (KPIs são compactos → multi-coluna `grid-cols-2/3/4`,
  diferente do 1-card-por-linha dos charts).
- Agrupado por categoria via `SectionLabel`:
  - **Simples & ícone**: modelos 2, 8
  - **Com sparkline**: modelos 3, 5, 6, 9
  - **Destaque & detalhe**: modelos 1, 4, 7

## Os 9 modelos

| #   | Ref            | Modelo                | Construção DS (theme-aware)                                                                                                                                                    |
| --- | -------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | statistics-01  | Feature + split + CTA | Card largo: `CardHead` + 2 métricas inline (Earnings/Expense) com `Chip` ± · 2 cards compactos (valor + `Chip` + ícone circular + `Button` link "See Report"). Sem ilustração. |
| 2   | statistics-02  | KPI row + ícone       | 4 col com divisória (`border-border-subtle`): título + ícone círculo (`bg-bg-muted`) + `KPI_VALUE` + "Last 7 days" + `Chip`.                                                   |
| 3   | statistics-03  | KPI + sparkline       | ícone+título + valor + `Chip` + mini bars/line/donut (`ChartContainer`).                                                                                                       |
| 4   | statistics-05  | Destaque brand/area   | Total Sales (area sparkline) · Monthly Sales (`bg-bg-brand` + `fg-on-brand` + bars) · Revenue Growth (`bg-bg-brand-subtle`).                                                   |
| 5   | 1.png          | KPI + bars + nota     | valor + arrow + `Chip` success + texto · bars com barra destacada (`chart-1`) · footer (divider) com nota.                                                                     |
| 6   | 2.png          | Faixa de métricas     | strip: por métrica → label + valor + `Chip` + sparkline (line success / danger).                                                                                               |
| 7   | 3.png          | Detail strip          | faixa de campos (label + valor) com marcador vertical colorido + badge de status (`Chip` success).                                                                             |
| 8   | 4.png          | Quad 2×2              | grid 2×2: ícone círculo colorido + label + `KPI_VALUE` + delta "vs prev. 28 days".                                                                                             |
| 9   | dashboard.html | Trading row           | 4 KPIs: label + valor + sub-delta + `Chip` + sparkline (bars/area) accent.                                                                                                     |

## Tokens / componentes (todos existentes)

- Superfícies: `bg-bg-surface`, `bg-bg-muted`, `bg-bg-brand` + `fg-on-brand`,
  `bg-bg-brand-subtle`, `border-border-subtle/-default`, `shadow-sh-*`,
  `rounded-radius-*`.
- Delta/status: `Chip` (`success`/`danger`, `variant="soft"`).
- Sparklines: `Chart` (`ChartContainer` + `chart-1..5`).
- Tipografia: presets (`KPI_VALUE` ~30px, `caption-md`, `body-sm`, `title-*`).
- Ícones: `lucide-react`.
- **Nenhum token novo. Nenhuma cascata.**

## Superfícies tocadas (L-042)

- ✅ `src/preview/pages/KpiPackDoc.tsx` (novo)
- ✅ `src/App.tsx` (import + render + `DOC_PAGES` `"kpi-pack"`)
- ✅ `src/preview/components/doc-nav-data.ts` (nav **Templates** → "KPI Pack")
- ⏭️ Changelog (`updates-data.ts`) — no `/ds-release`.
- **N/A**: inventory, USAGE, registry, CLI (não é componente, sem distribuição).

## Assumption central

O padrão `Panel`/`KPI_LABEL`/`KPI_VALUE` do ChartShowcase + `Chip` + `ChartContainer`
cobre os 9 refs sem precisar de token/componente novo, mantendo tudo theme-aware.
Se algum ref exigir um efeito que não sai dos tokens (ex.: superfície escura fixa),
ele é adaptado pro padrão DS (não se cria hardcode).

## Out of scope

- Componente reusável com props (primitivo) — fica para depois.
- Distribuição via registry/CLI.
- Ilustrações/assets externos.
- Token novo.
