---
description: Monta uma tela CRUD/tabela (DataTable do iGreen DS) via entrevista guiada
---

> **Modo submódulo (`ds-link`).** Existe `.claude/ds-config.json` com `"mode": "submodule"`?
> Então **NÃO rode `igreen:add`** — esse script não existe no seu projeto. Os componentes e
> exemplos já estão no disco em `<dsPath>/src`: importe pelo `importBase` do config
> (compostos) e pelo `primitivesBase` (primitivos shadcn), e **leia** o exemplo direto de
> `<dsPath>/src/examples/`.

Carregue e siga a skill `.claude/skills/crud-builder/SKILL.md`.

Execute o fluxo de 3 estágios: entrevista (`interview.md`) → blueprint com GATE
(`blueprint.md`) → geração (`generate.md`). Não pule o gate. Não toque em arquivo
antes da aprovação. Espelhe o exemplo `example-clientes` (e `example-finance` pros
drawers) — nunca gere de memória.

Argumento opcional do usuário ($ARGUMENTS): nome da entidade / contexto inicial
da tabela (ex.: "clientes", "pedidos com kanban por status").
