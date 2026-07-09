---
description: Replica uma família de telas (módulo/segmento) trocando dataset + rótulos, mantendo a estrutura
---

Carregue e siga a skill `.claude/skills/module-replicator/SKILL.md`.

$ARGUMENTS = origem → destino (ex.: "energia → telecom"). **Primeiro** avalie
copiar vs **parametrizar** (≥3 clones idênticos → parametrizar 1 componente por
config; 1-2 ou vão divergir → copiar arquivos). Se copiar: separe o que VARIA
(dataset/mock, rótulos, id/ícone/cor do contexto, hrefs) do ESTRUTURAL (layout,
colunas, componentes — fica idêntico), copie as telas pro novo segmento, troque
só o que varia, e registre o contexto em `nav-data` + as rotas (skill
`app-builder`, mapa declarativo). `npx tsc --noEmit` limpo. Aplique `DESIGN.md`.

> Nunca altere a estrutura na cópia (vira manutenção ×N). Mock: 1 arquivo por
> segmento, mesma shape (reuse os tipos).
