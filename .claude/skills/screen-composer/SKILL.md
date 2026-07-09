---
name: screen-composer
description: >
  Compõe uma PÁGINA DE NEGÓCIO inteira a partir de várias peças que CONVERSAM
  (estado compartilhado): master-detail (clicar na linha abre o detalhe),
  cross-filter (um período/segmento que muda KPIs + gráfico + tabela juntos). Use
  quando o pedido combina 2+ peças com interação. Orquestra os builders + cabeia
  o estado. Ancora em example-finance/order-detail + dashboard-patterns §7.
---

# screen-composer — Página composta (estado compartilhado, repo DS)

A **cola** entre peças. Cada peça vem de um builder (crud/list/dashboard/drawers);
aqui você monta o layout e cabeia o estado compartilhado. Receita canônica:
`.ai/context/components/dashboard-patterns.md` **§7**.

## Quando esta skill (vs os builders diretos)

- 1 peça só → vá direto no builder.
- **2+ peças que reagem entre si** (master-detail e/ou cross-filter) → aqui.

## Fluxo

1. **Decomponha** a página: peças (tabela/lista/KPIs+gráfico/detalhe/filtro global)
   + interações (clicar→detalhe? controle→filtra tudo?).
2. **Leia** os exemplos compostos: `src/examples/finance/` (master-detail: tabela +
   `FinanceDetailPanel` + drawers) e `src/examples/order-detail/`. Monte cada peça
   pelo builder (`crud-builder`/`list-builder`/`dashboard-builder`).
3. **Cabeie o estado no nível da PÁGINA** (dashboard-patterns §7): master-detail
   (`selectedId`) e/ou cross-filter (1 `useMemo` deriva o dataset; peças leem dele).
4. `npx tsc --noEmit` limpo.

## Gotchas do tipo

- **Single source of truth**: estado compartilhado sobe pra página; peça isolada
  mantém o seu. Passe só `id`/objeto pro detalhe (não remonte a linha).
- **Cross-filter**: `useMemo(filtrar(base, filtro))` único alimenta tudo; sem fetch
  por peça. Filtro por coluna = nativo/pré-aplicado (L-051); cross-filter = escopo
  global no `PageHeader.actions`.
- **Layout**: `flex flex-col gap-gp-2xl` (ou `flex gap` p/ master-detail lado a lado);
  `fillHeight`/`flex-1 min-h-0` nas peças que rolam.
- Conteúdo/estilo de cada peça é do builder dela; aqui só layout + estado.

Handoff: `SCREEN_PRONTO: <página>` + rota. Registrar CONCLUÍDO em `.ai/status/pipeline-state.md`.
