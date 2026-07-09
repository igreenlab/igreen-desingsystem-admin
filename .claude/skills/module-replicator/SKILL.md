---
name: module-replicator
description: >
  Replica uma FAMÍLIA de telas (um módulo/segmento) para um novo segmento,
  trocando dataset + rótulos e mantendo a estrutura. Use quando o app tem
  segmentos espelhados — "cria o módulo Telecom igual ao Energia", "replica essas
  telas pro segmento X". Evita copy-paste manual e sinaliza quando parametrizar.
---

# module-replicator — Replicar família de telas (segmento, repo DS)

Para apps com **módulos espelhados** (Energia / Telecom / Seguros = mesma estrutura).
Replica a família trocando só o que varia.

## ⚠️ Antes de copiar: copiar OU parametrizar?

N cópias = N pra manter. **Se as telas são idênticas em estrutura e só mudam
dados/rótulos**, prefira **parametrizar** (1 componente dirigido por config de
segmento). Ofereça: **(a) parametrizar** (recomendado se ≥3 clones) ou **(b)
replicar arquivos** (1-2 clones / vão divergir depois). Só copie se (b).

> Insight da análise do Virtual Proposta: Telecom e Seguros eram **clones
> estruturais** de Energia (6 telas ×3 por copy-paste) — débito de manutenção.
> É exatamente o caso onde parametrizar teria evitado a tripla manutenção.

## Fluxo (replicar arquivos — opção b)

1. **Módulo-fonte**: telas/arquivos + contexto de nav + rotas.
2. **Separe** o que VARIA (mock/dataset, rótulos, id/ícone/cor do contexto, hrefs)
   do ESTRUTURAL (layout, colunas, componentes) — estrutural fica idêntico.
3. **Copie** → novo segmento; troque só o que varia (1 mock por segmento, mesma shape).
4. **Registre** contexto em `nav-data` + entradas no mapa de rotas (skill `app-builder`).
5. `npx tsc --noEmit` limpo.

## Gotchas do tipo

- **Nunca altere a ESTRUTURA na cópia** (senão vira manutenção ×N).
- **Mock**: 1 arquivo por segmento, MESMA shape (reuse tipos, não duplique).
- **Nav/rotas**: contexto único (id/label/icon/color); hrefs `#/<segmento>/<tela>`;
  mapa de rotas declarativo (não if-chain).
- Divergência só quando um segmento precisar de tela exclusiva — aí só aquela.

Handoff: `MODULO_PRONTO: <segmento> (N telas)` + rotas. Registrar CONCLUÍDO em `.ai/status/pipeline-state.md`.
