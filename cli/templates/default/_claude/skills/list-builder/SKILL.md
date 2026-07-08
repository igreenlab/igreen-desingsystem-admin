---
name: list-builder
description: >
  Construtor guiado de telas de LISTA DE CARDS consumindo o DataList do iGreen DS
  (copy-in). Irmã do crud-builder (que é pra tabela/grade). Entrevista (fonte,
  card, layout standard/grouped/hierarchical, filtros, seleção, escala) →
  blueprint → GATE → geração espelhando o exemplo canônico (example-mapa-rede).
  Entry points: /ds-create-list (direto) ou /ds-create-screen (front-door).
---

# List Builder (consumidor) — Router

Você guia a criação de uma tela de **lista de cards** que consome `<DataList>`
**sem fugir do exemplo e da documentação**. NÃO inventa API de props, NÃO gera
código de memória, NÃO toca em arquivo antes do gate aprovado.

## ⚠️ Desambiguação ANTES de tudo (anti-erro)

Muita gente chama tabela de "lista". Se você chegou aqui direto sem o front-door,
confirme em 1 pergunta que o caso é mesmo lista de cards — senão a pessoa cria errado:

| Lista de cards (ESTA skill)                                             | Tabela/grade (→ `crud-builder`)                                    |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------ |
| cada item é um **card**; poucos campos em destaque (avatar/título/meta) | colunas × linhas; muitos campos por registro                       |
| visual, hierarquia/agrupamento/DnD, feed, organograma                   | comparar/ordenar/filtrar **por coluna**, editar célula, somatórios |
| ex: membros, tarefas, organização (árvore), rede, atividades            | ex: clientes, financeiro, pedidos com muitas colunas               |

Caso for tabela → **PARAR** e usar `crud-builder` (`/ds-create-crud`).

## Ambiente (este é um projeto CONSUMIDOR, copy-in)

| Variável                 | Valor                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `IMPORT_PATH`            | `@/components/ui/DataList`, `@/components/ui/List`, etc (copy-in via alias)                                             |
| `EXEMPLO_CANÔNICO`       | `example-mapa-rede` → `npm run igreen:add -- example-mapa-rede` → ler `src/examples/mapa-rede/mapa-rede-screen.tsx`     |
| `DOC`                    | `src/components/ui/DataList/USAGE.md` + `src/components/ui/List/USAGE.md` (após `igreen:add data-list`) + types ao lado |
| `PAGES_DIR` / `REGISTRO` | perguntar ao usuário (onde mora a página + como registra rota)                                                          |

Se o componente/exemplo ainda não está no disco, **puxe via `igreen:add`** antes de ler — nunca gere de memória.

> **Modo submódulo (ds-link).** Se existe `.claude/ds-config.json` com `"mode": "submodule"`,
> o DS é consumido como **submódulo** (não copy-in): os componentes/exemplos JÁ estão no disco
> em `<dsPath>/src` e **não** há registry. Use `importBase` do config (ex.: `@ds/components/ui/<Nome>`)
> e leia o exemplo canônico direto em `<dsPath>/src/examples/mapa-rede/mapa-rede-screen.tsx` —
> **NÃO** rode `igreen:add`. `PAGES_DIR`/`REGISTRO` continuam do projeto pai.

## Fluxo — 3 estágios

```
/ds-create-list  (ou /ds-create-screen → desambiguação → aqui)
   ▼ interview.md
1. ENTREVISTA (fases 0-6)         — acumula escolhas, ZERO edição em disco
   ▼ blueprint.md
2. BLUEPRINT [GATE]               — preview consolidado + pré-validações → aguarda "aprovar"
   ▼ generate.md
3. GERAÇÃO                        — igreen:add → ler exemplo → criar página → registrar → tsc → handoff
```

Carregue cada sub-arquivo só no estágio correspondente: `interview.md` agora, `blueprint.md` ao fim da entrevista, `generate.md` só após o gate.

## ⚠️ Precedência de fontes (anti-drift)

```
1. src/examples/mapa-rede/mapa-rede-screen.tsx  (exemplo real, vence tudo)
2. src/components/ui/DataList/USAGE.md + src/components/ui/List/USAGE.md + types ao lado
3. Snippets desta skill
4. Memória da IA  ← NUNCA confiar sozinha
```

Se USAGE.md divergir do exemplo/types, o exemplo + types vencem.

## Guardrails (não-negociáveis)

1. `virtualized` e `enableDnD` são **mutuamente exclusivos**; `virtualized` e
   `onLoadMore` (infinite-scroll) **não combinam** — escolha um.
2. `branchHighlight` (`block`/`active`) só faz efeito em `layout="hierarchical"`.
3. `filterFields` declara `accessor: (item) => valor` (NÃO column def); `select`
   precisa `options`. Operador de view/filtro válido pro tipo (multiSelect⇒isAnyOf,
   select⇒equals, text⇒contains, number⇒equals, date⇒between, boolean⇒equals).
4. `fillHeight` em tela dedicada ⇒ pai com altura + `className="flex-1 min-h-0"`
   (toolbar/chips/bulk fixos, só a lista rola). Não usar com `virtualized`.
5. `layout="grouped"` exige `groups`; `hierarchical` exige itens com `children`.
6. Card via slots OU `renderItem` (não os dois). Forms (criar/editar em drawer)
   usam `<FormField>` + `gap-form-gap`.
7. Classes DS antes de Tailwind literal; zero hardcode de cor/tamanho (ver `.claude/rules/ds-design.md`).
8. Wrapper da tela: `flex flex-col h-full min-h-0 gap-gp-2xl` (PageHeader → 24px → lista). Ver `DESIGN.md`.
9. Página registrada no roteador do usuário — página órfã = tarefa incompleta.
10. `npx tsc --noEmit` limpo antes do handoff (abort-on-error).
11. LER o exemplo canônico ANTES de gerar — nunca de memória.

## Handoff

- Entrevista pronta → `BLUEPRINT_PRONTO: <Entidade> (lista) — aguardando gate`
- Pós-geração → `LIST_PRONTO: <Entidade>` (+ onde foi registrada)
