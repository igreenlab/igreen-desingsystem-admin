---
name: dashboard-builder
description: >
  Construtor guiado de tela de DASHBOARD/PAINEL (composição de KPIs + gráficos +
  rankings/resumos + tabela/lista embutida) com o iGreen DS (copy-in). Entrevista
  (KPIs → gráficos → ranking/fusão → dividido/mapa → tabela/lista → layout) →
  blueprint → GATE → geração espelhando o example-dashboard e as receitas canônicas.
  Entry point: /ds-create-dashboard.
---

# Dashboard Builder (consumidor) — Router

Você guia a criação de uma tela de **dashboard/painel** que **compõe** os primitivos
do DS (`Kpi`/`KpiGroup`/`KpiDelta`, `Chart`, `Panel`, `DataTable`, `DataList`) nos
**padrões canônicos**. NÃO inventa API, NÃO gera de memória, NÃO toca em arquivo
antes do gate.

> Irmão do `crud-builder` (tabela) e do `list-builder` (lista). Dashboard não é um
> componente — é **composição** de seções. Uma tabela/lista DENTRO do dashboard é
> delegada ao crud/list-builder.

## ⚠️ Desambiguação ANTES de tudo

| Dashboard (ESTA skill) | Não é dashboard |
|---|---|
| **compõe** 2+ tipos de seção: KPIs + gráfico(s) + ranking/resumo numa "visão geral" | 1 tabela densa → `crud-builder` |
| foco em métrica/tendência/comparação, pouca edição | 1 lista de cards standalone → `list-builder` |
| ex: painel do líder, resumo de categoria, visão da rede | 1 gráfico isolado → skill `charts` |

Só 1 grade/lista/gráfico → **PARAR** e rotear pro builder certo.

## Ambiente (projeto CONSUMIDOR, copy-in)

| Variável | Valor |
| --- | --- |
| `IMPORT_PATH` | `@/components/ui/Kpi`, `@/components/ui/Chart`, `@/components/ui/Panel`, etc (copy-in via alias) |
| `EXEMPLO_CANÔNICO` | `example-dashboard` → `npm run igreen:add -- example-dashboard` → ler `src/examples/dashboard/dashboard-screen.tsx` |
| `DOC` | `src/components/ui/Kpi/USAGE.md` + `Chart/USAGE.md` (após `igreen:add`) + types ao lado; catálogo visual hospedado `#/dashboard-showcase` |
| `PAGES_DIR` / `REGISTRO` | perguntar ao usuário (onde mora a página + como registra rota) |

Se o componente/exemplo não está no disco, **puxe via `igreen:add`** antes de ler.

## Fluxo — 3 estágios

```
/ds-create-dashboard
   ▼ interview.md
1. ENTREVISTA (fases 0-6)   — KPIs → gráficos → ranking/fusão → dividido/mapa → tabela/lista → layout; ZERO edição
   ▼ blueprint.md
2. BLUEPRINT [GATE]         — mapa de rows + pré-validações → aguarda "aprovar"
   ▼ generate.md
3. GERAÇÃO                  — igreen:add example-dashboard → ler → montar → registrar → tsc → handoff
```

Carregue cada sub-arquivo só no estágio: `interview.md` agora, `blueprint.md` ao fim
da entrevista, `generate.md` só após o gate.

## ⚠️ Precedência de fontes (anti-drift)

```
1. src/examples/dashboard/dashboard-screen.tsx (exemplo real — vence tudo)
2. src/components/ui/Kpi/USAGE.md + Chart/USAGE.md + types ao lado
3. Snippets/receitas desta skill (generate.md)
4. Memória da IA  ← NUNCA confiar sozinha
```

## Guardrails (não-negociáveis)

1. LER `example-dashboard` ANTES de montar — nunca de memória.
2. **KPI rápido = "Painel do Líder"**: `<KpiGroup divided>` + `<Kpi>` + `<KpiDelta>`.
   Tone colore SÓ o ícone (círculo); valor default (só KPI de alerta ganha cor).
   Delta: `signed` só quando sinal = bom/ruim; senão `tone` explícito ("-12s" é melhora → success).
3. Gráfico = SEMPRE `<ChartContainer>`, cor só por token (`--color-chart-1..5`); ver skill `charts`.
4. Ranking/fusão + card dividido: divisor via `border-l`/`border-t` (nunca só gap);
   ícone mini-stat = **quadrado** `size-comp-lg rounded-radius-base`, KPI-group = **círculo** `size-form-lg rounded-radius-full`.
5. Tabela/lista embutida → delegar a `crud-builder`/`list-builder`; filtros nativos pré-aplicados, sem form solto acima.
6. Classes DS antes de Tailwind literal; zero hardcode (ver `.claude/rules/ds-design.md`, `DESIGN.md`). Números grandes literais só onde não há preset.
7. Shell: `flex flex-col h-full min-h-0 gap-gp-2xl` (PageHeader → 24px → rows). Estreito → 1 card/row.
8. Página registrada no roteador do usuário — órfã = incompleto.
9. `npx tsc --noEmit` limpo antes do handoff.

## Handoff

- Entrevista pronta → `BLUEPRINT_PRONTO: <Painel> (dashboard) — aguardando gate`
- Pós-geração → `DASHBOARD_PRONTO: <Painel>` (+ onde foi registrada)
