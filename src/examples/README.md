# src/examples — telas distribuíveis (registry `example-*`)

Cada pasta aqui é a fonte de um item `example-*` do `registry.json` — uma **extração
1:1 do showcase correspondente** do preview, contendo só o **conteúdo da página**
(sem `AppShell`/shell), pronta pro consumidor baixar via `igreen:add example-<x>` e
adaptar.

| Exemplo | Showcase-fonte (preview) |
|---|---|
| `clientes` | `src/preview/pages/ClientesShowcase` |
| `finance` | `src/preview/pages/ClientesFinanceiroShowcase` |
| `dashboard` | `src/preview/pages/DashboardShowcase.tsx` |
| `order-detail` | `src/preview/pages/OrderDetailShowcase` |
| `edit-page` | `src/preview/pages/OrderEditShowcase` |
| `chat` | `src/preview/pages/ChatV2` |

## ⚠️ Relação fonte → exemplo (manutenção)

A extração é **manual** (strip do `AppShell` + remoção de `useTheme`/`app-shell-mocks`
+ inline de `TableDoc` → `_table-data.ts` + rewrite de imports relativos + rename do
export pra `<Nome>Screen`). NÃO há geração automática.

**Se você editar um showcase-fonte** (corrigir bug, mudar layout), o exemplo
correspondente **não** atualiza sozinho — precisa ser re-extraído, senão a versão que
o consumidor baixa atrasa.

O `npm run examples:drift` (roda automático no `registry:build`) guarda um hash da
fonte e **avisa** quando ela muda desde a última sincronização:

```
node scripts/examples-drift-check.mjs          # checa + avisa
# (re-extraia o exemplo afetado, depois:)
node scripts/examples-drift-check.mjs --baseline  # re-baselina o lock
```

Lock: `scripts/examples-sources.lock.json` (commitado).

> Decisão (auditoria 2026-06): mantida a extração + drift-check em vez de
> geração automática (transform tem julgamento) ou inversão preview→examples
> (refatora a catálogo viva, risco alto). Reavaliar se o nº de exemplos crescer muito.
