---
name: screen-composer
description: >
  Compõe uma PÁGINA DE NEGÓCIO inteira a partir de várias peças que CONVERSAM
  entre si (estado compartilhado): master-detail (clicar na linha abre o
  detalhe), cross-filter (um período/segmento que muda KPIs + gráfico + tabela
  juntos). Use quando o pedido combina 2+ peças com interação — "tabela + detalhe
  ao lado", "filtro no topo que muda tudo", "página com KPIs, gráfico e tabela
  que reagem juntos". Orquestra os builders + cabeia o estado.
---

# screen-composer — Página composta (estado compartilhado)

Não é um tipo de peça — é a **cola** entre peças. Cada peça vem de um builder
(crud/list/dashboard/drawers); aqui você monta o layout e **cabeia o estado que
elas compartilham**. Receita canônica: `dashboard-patterns.md` **§7**.

## Quando esta skill (vs os builders diretos)

- 1 peça só (uma tabela, uma lista, um dashboard) → vá direto no builder.
- **2+ peças que reagem entre si** (master-detail e/ou cross-filter) → **aqui**.

## Fluxo

1. **Decomponha** a página: quais peças (tabela / lista / KPIs+gráfico / detalhe /
   filtro global) e quais **interações** (clicar→detalhe? controle→filtra tudo?).
2. **Monte cada peça** pelo builder certo (crud/list/dashboard) OU puxe o exemplo
   composto: `npm run igreen:add -- example-finance` (master-detail: tabela +
   detail panel + drawers) / `example-order-detail`. **Leia** o exemplo.
3. **Cabeie o estado no nível da PÁGINA** (dashboard-patterns §7):
   - master-detail → `selectedId` na página; grade recebe `onRowClick`, detalhe recebe o id.
   - cross-filter → filtro na página; **1** `useMemo` deriva o dataset; todas as peças leem dele.
4. `npx tsc --noEmit` limpo.

> **Modo submódulo (ds-link).** Se existe `.claude/ds-config.json` com `"mode": "submodule"`,
> NÃO rode `igreen:add` — leia os exemplos em `<dsPath>/src/examples/` e importe via `importBase`.

## Gotchas do tipo

- **Single source of truth**: estado que 2+ peças compartilham SOBE pra página, não
  fica duplicado em cada peça. Peça isolada mantém o seu.
- **Master-detail**: passe só `id`/objeto seleto pro detalhe (nunca remonte a linha).
  Ao lado = `FloatingPanel`/painel fixo; por cima = `Drawer`/`Sheet`.
- **Cross-filter**: um `useMemo(filtrar(base, filtro))` alimenta KPIs+gráfico+tabela;
  não refaça fetch por peça. Filtro por COLUNA continua nativo/pré-aplicado (L-051);
  o cross-filter é o escopo global (período/segmento), no `PageHeader.actions`.
- **Layout**: shell `flex flex-col gap-gp-2xl` (ou `flex gap` p/ master-detail lado a lado);
  `fillHeight`/`flex-1 min-h-0` nas peças que rolam.
- Conteúdo/estilo de cada peça = responsabilidade do builder dela; aqui é só layout + estado.

Aplique `DESIGN.md`. Handoff: `SCREEN_PRONTO: <página>` + rota.
