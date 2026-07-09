---
name: module-replicator
description: >
  Replica uma FAMÍLIA de telas (um módulo/segmento) para um novo segmento,
  trocando dataset + rótulos e mantendo a estrutura. Use quando o app tem
  segmentos espelhados — "cria o módulo Telecom igual ao Energia", "replica essas
  telas pro segmento X", "mesma estrutura pra outra vertical". Evita o copy-paste
  manual (e sinaliza quando é melhor parametrizar em vez de copiar).
---

# module-replicator — Replicar família de telas (segmento)

Quando um app tem **módulos espelhados** (ex.: Energia / Telecom / Seguros com a
mesma estrutura de telas), replica a família trocando só o que varia.

## ⚠️ Antes de copiar: copiar OU parametrizar?

Copiar N vezes = N cópias pra manter (todo bug/ajuste ×N). **Se as telas são
idênticas em estrutura e só mudam dados/rótulos**, o melhor costuma ser
**parametrizar** — 1 componente dirigido por config de segmento:

```tsx
const SEGMENTOS = { energia: {...}, telecom: {...}, seguros: {...} };
function SegmentoDashboard({ seg }: { seg: SegKey }) { /* lê SEGMENTOS[seg] */ }
```

Ofereça as duas ao usuário: **(a) parametrizar** (recomendado se ≥3 clones ou
manutenção conjunta) ou **(b) replicar arquivos** (ok pra 1-2 e quando os
segmentos devem divergir depois). Só siga pra cópia se ele escolher (b).

## Fluxo (replicar arquivos — opção b)

1. **Identifique o módulo-fonte**: as telas/arquivos + o contexto de nav dele
   (`nav-data`) + as rotas (`routes`).
2. **Separe o que VARIA** (dataset/mock, rótulos/títulos, id/ícone/cor do contexto,
   hrefs `#/<segmento>/...`) do que é **ESTRUTURAL** (layout, colunas, componentes,
   spacing) — o estrutural fica **idêntico**.
3. **Copie** as telas → novo segmento; troque só o que varia (1 arquivo de mock por
   segmento, mesma shape/tipos).
4. **Registre** o novo contexto em `nav-data` + as entradas no mapa de rotas
   (ver skill `app-builder`). Hrefs únicos por segmento.
5. `npx tsc --noEmit` limpo.

## Gotchas do tipo

- **Nunca altere a ESTRUTURA na cópia** — se divergir, vira manutenção ×N e perde o
  sentido de "família". Só dados/rótulos/ícone/cor/href mudam.
- **Mock**: um arquivo por segmento com a MESMA shape (reuse os tipos). Não duplique tipos.
- **Nav/rotas**: `id`/label/icon/color do contexto únicos; hrefs `#/<segmento>/<tela>`;
  1 linha por tela no mapa de rotas (não if-chain).
- Se depois um segmento precisar de tela exclusiva, aí sim diverge só aquela.

Aplique `DESIGN.md`. Handoff: `MODULO_PRONTO: <segmento> (N telas)` + rotas.
