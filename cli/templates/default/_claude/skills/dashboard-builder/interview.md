# Dashboard Builder (consumidor) — Entrevista (fases 0–6)

Uma pergunta (ou grupo curto) por vez. Acumule as escolhas — **ZERO edição em disco**
até o gate. Use `AskUserQuestion` pra escolhas fechadas; proponha um default sensato.
As receitas de cada seção estão no `generate.md` (§1–§6) + no `example-dashboard`.

## Fase 0 — Intent + fonte
- Do que é o painel? (visão geral de quê, pra quem — ex.: painel do líder, resumo de
  categoria, financeiro consolidado).
- Dados: mock ou API? Se API, anote o shape → a geração cria mock tipado espelhando.
- Período/segmentação no topo? (quase sempre → PeriodSelector no `actions` do PageHeader).

## Fase 1 — KPIs rápidos ("Painel do Líder", §1)
- Quais métricas rápidas? (label + valor + tom do ícone).
- Delta? O sinal é literalmente bom/ruim → `signed`. Senão, tom explícito (tempo ↓ = success).
- Quantas colunas (4–6)? → `<KpiGroup columns={N} divided>`.

## Fase 2 — Gráficos (chart-cards, §2)
- Quais gráficos? Tipo (barras/linha/área/pizza-donut), séries, o que comparam (ver skill `charts`).
- Cada um num SectionCard (head título+subtítulo discreto). Big-number liderando? Legenda/metric-rows?
- Donut com total no centro? 2 séries → verde+âmbar; pizza → rampa da marca.

## Fase 3 — Ranking / fusão KPI+evolução (§3)
- Ranking (reconhecimento, top do mês) ou linha de lista rica que funde identidade +
  mini-KPIs em colunas + métrica headline com delta (ex.: cidades/licenciados por status)?
- Se sim: mini-KPIs (label+ícone+tom), métrica headline à direita (delta Chip), identificador (rank/nome/sub).

## Fase 4 — Card dividido em 2 / mapa (§4)
- Seção que junta dados + visual lado a lado (ex.: barras por UF | mapa)? → card dividido (divisor no 2º painel).
- Precisa de mapa? (SVG por região/UF + legenda). Anote regiões/UFs.

## Fase 5 — Tabela / lista embutida (delega)
- Termina com tabela (grade) ou lista (cards) de detalhe?
- Tabela → geração delega a distribuição de colunas ao `crud-builder` (identidade → status →
  categóricos → muted → moeda/data à direita; filtros nativos pré-aplicados).
- Lista/kanban → delega ao `list-builder` (linha1 título+secundário, linha2 meta, status chip,
  valor à direita; sem botão de ação).
- Nenhuma → pula.

## Fase 6 — Layout das rows
- Ordem/agrupamento. Padrão: (1) hero/insight opcional · (2) KPI-group "Painel do Líder" faixa larga ·
  (3) gráfico principal (2/3) + donut/resumo (1/3) · (4) qualidade/ranking/fusão · (5) listas/tabela.
- Estreito → 1 card/row + coluna única. Rows 2–3 col via `grid grid-cols-1 lg:grid-cols-{2,3} gap-gp-2xl items-stretch`.

## Fim
Resumir em 1 frase + `BLUEPRINT_PRONTO: <Painel> (dashboard) — aguardando gate` → carregar `blueprint.md`.
