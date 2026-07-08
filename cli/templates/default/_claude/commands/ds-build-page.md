---
description: Monta uma tela do zero seguindo os padrões e exemplos do iGreen DS
---

Carregue e siga o orquestrador `.claude/skills/ds-kit/SKILL.md`.

Classifique a intenção do usuário ($ARGUMENTS = descrição da tela desejada) e
roteie pro caminho certo: CRUD/tabela → skill `crud-builder`; edição → exemplo
`example-edit-page`; detalhe → `example-order-detail`; dashboard/gráficos →
`example-dashboard`; financeiro → `example-finance`. Puxe o exemplo com
`npm run igreen:add`, leia-o + o `USAGE.md` dos componentes, e adapte aplicando
`DESIGN.md` (anatomia, espaçamento, responsividade). `npx tsc --noEmit` limpo
antes de entregar.

> **Modo submódulo:** se existe `.claude/ds-config.json` com `"mode": "submodule"`, NÃO rode
> `igreen:add` — o ds-kit trata o modo (componentes/exemplos já estão em `<dsPath>/src`, import via
> `importBase` do config).
