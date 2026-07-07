---
name: page-detail
description: >
  Monta páginas de detalhe/detalhamento (ficha de um registro, com abas e cards de
  seção) com o iGreen DS. Use quando o usuário pedir "detalhe", "detalhamento",
  "ficha", "página de detalhe do pedido/cliente", "visão geral com abas".
  Ancora no example-order-detail.
---

# page-detail — Página de detalhamento

Página de leitura/inspeção de um registro: cabeçalho + abas + cards de seção.

## Fluxo
1. `npm run igreen:add -- example-order-detail` (traz a tela + `Tabs`, `Card`, `Chip`, `PageHeader`).
2. **Leia** `src/examples/order-detail/order-detail-screen.tsx` + USAGE dos componentes.
3. Adapte as abas/seções/campos ao registro do usuário.
4. Registre a rota. `npx tsc --noEmit` limpo.

## Gotchas do tipo
- Estrutura: `PageHeader` (título + badges de status + ações) → `Tabs` (visão geral / detalhes / atividade / comentários / anexos) → cards de seção (`section-card`).
- Layout 2 colunas (conteúdo + painel lateral do cliente/meta) num grid responsivo; empilha no mobile.
- Badges de status via `Chip`/`Badge` com cor semântica (`success`/`warning`/...).
- Wrapper de página: `flex flex-col h-full min-h-0 gap-gp-2xl`.
- Campos label/valor: rótulo `text-caption` em `fg-muted`, valor `text-body`.

Se a tela também edita inline ou abre drawer de edição → ver skill `drawers`. Aplique `DESIGN.md`. Handoff: `DETAIL_PRONTO: <Entidade>` + rota.
