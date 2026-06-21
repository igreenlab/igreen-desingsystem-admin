---
description: Monta uma tela de LISTA DE CARDS (DataList do iGreen DS) via entrevista guiada
---

Carregue e siga a skill `.claude/skills/list-builder/SKILL.md`.

Execute o fluxo de 3 estágios: entrevista (`interview.md`) → blueprint com GATE
(`blueprint.md`) → geração (`generate.md`). Não pule o gate. Não toque em arquivo
antes da aprovação. Espelhe o exemplo `example-mapa-rede` (`npm run igreen:add --
example-mapa-rede`) — nunca gere de memória.

⚠️ Se o caso for grade de colunas / edição por célula / planilha, é TABELA →
use `/ds-create-crud` (skill `crud-builder`). Na dúvida, `/ds-create-screen`.

Argumento opcional do usuário ($ARGUMENTS): nome da entidade / contexto inicial
da lista (ex.: "membros com filtro de papel", "organização em árvore", "rede de consultores").
