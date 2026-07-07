---
name: ds-create-dashboard
description: >
  Construtor guiado de tela de DASHBOARD/PAINEL (composição de KPIs + gráficos +
  rankings/resumos + tabela/lista embutida) com os primitivos do iGreen DS.
  Entrevista (intent → KPIs → gráficos → ranking/fusão → dividido/mapa → tabela/lista
  → layout) → blueprint → [GATE] → geração ancorada em dashboard-patterns.md +
  example-dashboard. Skill: .claude/skills/dashboard-builder/
---

# Criar tela de Dashboard — iGreen DS

## Fluxo

```
/ds-create-dashboard [hint]
        │
        ▼  SKILL.md (router) + interview.md
1. ENTREVISTA — fases 0-6 (intent/fonte → KPIs → gráficos → ranking/fusão → dividido/mapa → tabela/lista → layout)
        │
        ▼  blueprint.md
2. [GATE] BLUEPRINT — mapa de rows/seções + pré-validações
        │        aguardar "aprovar" — ⛔ zero edição antes
        ▼  generate.md
3. GERAÇÃO — ler dashboard-patterns.md + example-dashboard → montar → registrar → tsc → handoff
```

## Argumento opcional

`hint` — contexto inicial em prosa (ex: `/ds-create-dashboard painel do líder com
KPIs de inativos/licença + gráfico de evolução + ranking`). A entrevista usa como
ponto de partida.

## ⛔ Verificações antes de qualquer ação

```
1. É mesmo DASHBOARD (2+ tipos de seção: KPIs + gráfico + ranking/resumo)?
   Se for só 1 tabela → /ds-create-crud · só 1 lista → /ds-create-list ·
   só 1 gráfico → skill charts. (A SKILL.md confirma na desambiguação.)
2. Primitivos existem/estáveis? (Kpi, Chart, Panel, DataTable, DataList)
3. LER a fonte de receitas: .ai/context/components/dashboard-patterns.md + example-dashboard.
4. Resolver parâmetros do ambiente (repo DS vs consumer) — ver SKILL.md.
```

## Handoff

Delegado à skill: `BLUEPRINT_PRONTO:` (gate) → `DASHBOARD_PRONTO: <Painel> — #/<page-id>`.
