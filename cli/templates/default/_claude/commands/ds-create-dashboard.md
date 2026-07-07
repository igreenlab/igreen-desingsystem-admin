---
description: Monta uma tela de DASHBOARD/PAINEL (KPIs + gráficos + rankings/resumos, iGreen DS) via entrevista guiada
---

Carregue e siga a skill `.claude/skills/dashboard-builder/SKILL.md`.

Execute o fluxo de 3 estágios: entrevista (`interview.md`) → blueprint com GATE
(`blueprint.md`) → geração (`generate.md`). Não pule o gate. Não toque em arquivo
antes da aprovação. Espelhe o exemplo `example-dashboard` (`npm run igreen:add --
example-dashboard`) — nunca gere de memória.

⚠️ Dashboard = **compõe 2+ tipos de seção** (KPIs + gráfico + ranking/resumo). Se for
só 1 tabela → `/ds-create-crud`; só 1 lista → `/ds-create-list`; só 1 gráfico → skill
`charts`. Dashboard com tabela/lista embutida cai AQUI (delega a tabela/lista ao
crud/list-builder na Fase 5). Na dúvida, `/ds-create-screen`.

Argumento opcional do usuário ($ARGUMENTS): nome/contexto do painel (ex.: "painel do
líder com KPIs de inativos + gráfico de evolução + ranking", "resumo da categoria").
