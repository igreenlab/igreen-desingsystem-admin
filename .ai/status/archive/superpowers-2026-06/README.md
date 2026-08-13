# superpowers-2026-06 — specs de design do DataList/List

Arquivadas em 2026-08-08. Vinham de `docs/superpowers/specs/`, na raiz do repo.

## Por que estavam órfãs

O lote **irmão**, de maio, já tinha sido movido pra `.ai/status/archive/superpowers-2026-05/`
numa migração anterior. Estes dois, de **junho**, ficaram pra trás — e `docs/superpowers/`
seguiu existindo na raiz com exatamente 2 arquivos e **zero referências entrantes**
(`grep -rIl "datalist-design\|list-component-design"` fora do próprio diretório: nada).

O diretório `docs/` ficou vazio e saiu junto.

## Conteúdo (implementado)

| Spec | Virou |
|---|---|
| `2026-06-20-list-component-design.md` | `src/components/ui/List/` — o primitivo "burro", análogo ao `Table` |
| `2026-06-20-datalist-design.md` | `src/components/ui/DataList/` — o inteligente sobre o `List`, análogo ao `DataTable` sobre o `Table` |

## Cuidado ao ler

As duas trazem a "Definição de Pronto (L-042 — **7 superfícies**)". Hoje são **8**: o
**barrel** (`src/components/index.ts`) entrou em 2026-08-08 como 8ª, com gate
(`barrel-completeness`), depois que `Chart`/`DataList`/`List`/`Toast` passaram meses com
6 de 7 fechadas e `import { ChartContainer }` estourando "not exported" no consumidor npm.
Fonte atual da lista: `.claude/skills/ds-dev/handoff-pr.md`.
