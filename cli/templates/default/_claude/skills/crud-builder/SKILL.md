---
name: crud-builder
description: >
  Construtor guiado de telas CRUD/tabela consumindo o DataTable do iGreen DS
  (copy-in). Entrevista o usuário (fonte de dados, colunas, filtros, views,
  kanban, paginação...), consolida um blueprint, apresenta GATE e só então gera a
  página — sempre espelhando o exemplo canônico (example-clientes). Entry point:
  /ds-create-crud.
---

# CRUD Builder (consumidor) — Router

Você guia a criação de uma tela de tabela que consome `<DataTable>` **sem fugir
do exemplo e da documentação do projeto**. NÃO inventa API de props, NÃO gera
código de memória, NÃO toca em arquivo antes do gate aprovado.

> **Kanban / board / funil / pipeline de vendas** caem AQUI: kanban é uma `viewMode`
> do DataTable (mesmos dados/colunas/filtros, só muda a exibição). "Quero um kanban/
> funil" → esta skill; a Fase 5 do interview configura as lanes pela coluna de
> status/etapa. Funil = board agrupado por etapa. Ref. visual: `example-finance`.

## Ambiente (este é um projeto CONSUMIDOR, copy-in)

| Variável                 | Valor                                                                                                           |
| ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `IMPORT_PATH`            | `@/components/ui/DataTable`, `@/components/ui/Button`, etc (copy-in via alias)                                  |
| `EXEMPLO_CANÔNICO`       | `example-clientes` → `npm run igreen:add -- example-clientes` → ler `src/examples/clientes/clientes-screen.tsx` |
| `DOC`                    | `src/components/ui/DataTable/USAGE.md` (após `igreen:add data-table`) + types ao lado                           |
| `PAGES_DIR` / `REGISTRO` | perguntar ao usuário (onde mora a página + como registra rota)                                                  |

Se o componente/exemplo ainda não está no disco, **puxe via `igreen:add`** antes de ler — nunca gere de memória.

> **Modo submódulo (ds-link).** Se existe `.claude/ds-config.json` com `"mode": "submodule"`,
> o DS é consumido como **submódulo** (não copy-in): os componentes/exemplos JÁ estão no disco
> em `<dsPath>/src` e **não** há registry. Use `importBase` do config (ex.: `@ds/components/ui/<Nome>`)
> e leia o exemplo canônico direto em `<dsPath>/src/examples/clientes/clientes-screen.tsx` —
> **NÃO** rode `igreen:add`. `PAGES_DIR`/`REGISTRO` continuam do projeto pai.

## Fluxo — 3 estágios

```
/ds-create-crud
   ▼ interview.md
1. ENTREVISTA (fases 0-5)         — acumula escolhas, ZERO edição em disco
   ▼ blueprint.md
2. BLUEPRINT [GATE]               — preview consolidado + pré-validações → aguarda "aprovar"
   ▼ generate.md
3. GERAÇÃO                        — igreen:add → ler exemplo → criar página → registrar → tsc → handoff
```

Carregue cada sub-arquivo só no estágio correspondente: `interview.md` agora, `blueprint.md` ao fim da entrevista, `generate.md` só após o gate.

## ⚠️ Precedência de fontes (anti-drift)

```
1. src/examples/clientes/clientes-screen.tsx  (exemplo real, vence tudo)
2. src/components/ui/DataTable/USAGE.md + types ao lado
3. Snippets desta skill
4. Memória da IA  ← NUNCA confiar sozinha
```

Se USAGE.md divergir do exemplo/types, o exemplo + types vencem.

## Guardrails (não-negociáveis)

1. `columns` SEMPRE em `useMemo`; `fetchData` (server mode) SEMPRE em `useCallback` (senão loop de refetch).
2. Operador de filtro válido pro filterType (multiSelect⇒`isAnyOf`, text⇒`contains`, date⇒`between`...).
3. `virtualize: true` ⇒ paginação desligada + container com altura (`flex-1 min-h-0` num pai `h-full`).
4. `groupBy`/kanban ativo ⇒ paginação desligada (avisar).
5. Forms em drawers/modais usam `<FormField>` (nunca `<label>` cru) + `gap-form-gap`.
6. Classes DS antes de Tailwind literal; zero hardcode de cor/tamanho (ver `.claude/rules/ds-design.md`).
7. Wrapper da tela: `flex flex-col h-full min-h-0 gap-gp-2xl` (PageHeader → 24px → tabela). Ver `DESIGN.md`.
8. Página registrada no roteador do usuário — página órfã = tarefa incompleta.
9. `npx tsc --noEmit` limpo antes do handoff (abort-on-error).
10. LER o exemplo canônico ANTES de gerar — nunca de memória.
11. Ação destrutiva (excluir) ⇒ **confirmação via `AlertModal`** — nunca deletar direto.
12. Sempre wire os 3 estados: `loading`/`renderLoading` (skeleton), `renderEmpty` (sem
    registros + CTA _Adicionar_), `renderNoResults` (filtro sem match). Faltou = incompleto.

## Drawers (criar/editar/detalhe) — ligado ao CRUD

Se o CRUD precisa de criar/editar/ver-detalhe, espelhe o padrão do `example-finance`:
`NovoClienteDrawer` (criar/editar via `Panel` + `FormField`) e `FinanceDetailPanel`
(detalhe via `FloatingPanel`). Puxe `example-finance`, leia esses componentes e
reuse a estrutura — mesmo design de drawer do DS.

## Handoff

- Entrevista pronta → `BLUEPRINT_PRONTO: <Entidade> — aguardando gate`
- Pós-geração → `CRUD_PRONTO: <Entidade>` (+ onde foi registrada)
