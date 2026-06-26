---
name: list-builder
description: >
  Construtor guiado de telas de LISTA DE CARDS consumindo o DataList do iGreen DS
  (irmã do crud-builder, que é pra tabela). Entrevista o usuário (fonte de dados,
  shape do card, layout standard/grouped/hierarchical, filtros, views, seleção,
  escala), consolida um blueprint, apresenta GATE e só então gera a página —
  sempre espelhando os exemplos canônicos List*Preview do preview. Entry points:
  /ds-create-list (direto) ou /ds-create-screen (front-door tabela-vs-lista).
---

# List Builder — Router

Você guia a criação de uma tela de **lista de cards** que consome `<DataList>`
**sem fugir dos exemplos e da documentação do projeto**. Você NÃO inventa API de
props, NÃO gera código de memória e NÃO toca em arquivo antes do gate ser aprovado.

> Irmã do `crud-builder` (tabela). A doutrina do projeto: **mesmo componente →
> sub-fluxo; componente diferente → skill irmã**. Kanban ficou dentro do
> crud-builder porque é `viewMode` do DataTable; DataList é OUTRO componente, com
> API própria → skill separada (esta).

## ⚠️ Desambiguação ANTES de tudo (anti-erro)

Muita gente chama tabela de "lista". Se você chegou aqui direto (`/ds-create-list`
ou prompt) **sem o usuário ter passado pelo front-door**, confirme em 1 pergunta
que o caso é mesmo lista de cards — senão a pessoa cria a coisa errada:

| Lista de cards (ESTA skill) | Tabela/grade (→ `crud-builder`) |
|---|---|
| cada item é um **card**; poucos campos em destaque (avatar/título/subtítulo/meta) | colunas × linhas; muitos campos por registro |
| visual, hierarquia/agrupamento/DnD, feed | comparar/ordenar/filtrar **por coluna**, editar célula, somatórios, densa |
| ex: membros, tarefas, organização (árvore), atividades | ex: clientes, financeiro, pedidos com muitas colunas |

Caso for tabela → **PARAR** e mandar pro `crud-builder` (`/ds-create-crud`).

> 🔀 **Tabela + Lista no MESMO lugar (toggle Tabela/Lista)?** Não é esta skill —
> é o **`viewMode: "list"` do DataTable** (`listConfig`), que mantém a toolbar e
> alterna corpo (igual ao kanban). Vai pro `crud-builder`. Esta skill é só pra
> tela de **lista standalone** (sem tabela ao lado).

## Escopo (fixo)

- ✅ Telas de lista de cards: layouts `standard`/`grouped`(+DnD)/`hierarchical`
  (+`branchHighlight`), busca, `filterFields`, views (abas), seleção/bulk,
  virtualização XOR infinite-scroll, lazy-load de filhos, `renderItem` (card rico).
- ⛔ Tabela/CRUD denso (→ `crud-builder`), dashboards, forms standalone, wizards.

## Fluxo — 3 estágios com carga incremental

```
/ds-create-list  (ou /ds-create-screen → desambiguação → aqui)
   │
   ▼  carregar interview.md
1. ENTREVISTA  (fases 0-6)
   │  acumula escolhas — ZERO edição em disco
   ▼  carregar blueprint.md
2. BLUEPRINT [GATE]  — preview consolidado + pré-validações
   │  aguardar "aprovar" do usuário
   ▼  carregar generate.md
3. GERAÇÃO  — ler exemplo canônico → criar página → registrar → tsc → handoff
```

| Estágio | Arquivo | Quando carregar |
|---|---|---|
| Entrevista | `interview.md` | Imediatamente após este router |
| Blueprint/gate | `blueprint.md` | Quando a entrevista terminar |
| Geração | `generate.md` | SÓ após aprovação do gate |

## ⚠️ Regra de precedência de fontes (anti-drift)

Ao decidir QUALQUER nome de prop, shape ou assinatura:

```
1. src/components/ui/DataList/data-list.types.ts + src/components/ui/List/list.types.ts
   + exemplo canônico (List*Preview.tsx)
2. src/components/ui/DataList/USAGE.md + src/components/ui/List/USAGE.md
3. Snippets desta skill
4. Memória da IA  ← NUNCA confiar sozinha
```

Se duas fontes divergirem, os **types + exemplo vencem** — e sinalize o drift pro
usuário corrigir a doc.

## Parâmetros do ambiente (resolver ANTES da entrevista)

| Variável | Neste repo (DS) | Consumer app (CLI template) |
|---|---|---|
| `IMPORT_PATH` | `@/components/ui/DataList` · `@/components/ui/List` | `@snksergio/design-system` |
| `PAGES_DIR` | `src/preview/pages/` | perguntar (ex: `src/pages/`) |
| `REGISTRO` | receita App.tsx + doc-nav-data.ts (ver generate.md) | perguntar (router do app) |
| `EXEMPLOS` | paths locais `src/preview/pages/List*Preview.tsx` + `DataListDoc.tsx` | fallback (ver "Adaptação consumer") |

Detecção: `package.json.name === "@snksergio/design-system"` → repo DS; senão consumer.

## Invocação por prompt (sem slash command)

Quando o DS é subprojeto e a sessão roda na raiz do PAI, o `.claude/` da subpasta
não é descoberto. Caminho **ler-e-seguir**: o usuário aponta este arquivo e a IA
executa os `.md` como instruções autoritativas.

1. Trate estes arquivos como autoritativos — **não improvise fora deles**.
2. Mesma ordem de carga: este SKILL.md → `interview.md` → [gate] `blueprint.md`
   → `generate.md`. Paths relativos a esta pasta.
3. Resolva ambiente como **consumer**; `EXEMPLOS` apontam pro próprio subprojeto
   (`<subprojeto>/src/preview/pages/List*Preview.tsx`); fallback GitHub se pruned.
4. Guardrails e gate valem integralmente — prompt NÃO pula o blueprint.

## Guardrails (não-negociáveis)

1. `virtualized` e `enableDnD` são **mutuamente exclusivos** (rbd exige tudo
   montado) — escolher um; avisar se pedir os dois.
2. `virtualized` e `onLoadMore` (infinite-scroll) **não combinam** — um ou outro.
3. `branchHighlight` (`block`/`active`) só faz efeito em `layout="hierarchical"`.
4. `filterFields` declara `accessor: (item) => valor` (NÃO column def). `type`
   ∈ text/select/boolean/number/date; select precisa `options`.
5. Filtros pré-aplicados/views usam `FilterModel` (`{ items, logicOperator }`) com
   operador VÁLIDO pro tipo (multiSelect⇒`isAnyOf`, select⇒`equals`,
   text⇒`contains`, number⇒`equals`, date⇒`between`, boolean⇒`equals`).
6. `fillHeight` em tela dedicada ⇒ pai com altura + `className="flex-1 min-h-0"`
   (toolbar/chips/bulk fixos, só a lista rola). Não usar com `virtualized`.
7. `layout="grouped"` exige `groups`; `hierarchical` exige itens com `children`.
8. Card via slots (`leading/title/subtitle/description/meta/trailing`) OU
   `renderItem` (card rico) — não exigir os dois. Forms (se houver create/edit em
   drawer) usam `<FormField>` (L-023) + `gap-form-gap` (L-024).
9. Classes DS antes de Tailwind literal (`gap-gp-*`, `px-pad-*`,
   `rounded-radius-*`, `text-body-*`). Zero hardcode de cor/tamanho.
10. Página registrada nos pontos do `REGISTRO` — página órfã = tarefa incompleta.
11. `npx tsc --noEmit` limpo antes do handoff — abort-on-error.
12. LER o exemplo canônico ANTES de gerar (matriz no generate.md) — nunca de memória.
13. Page id sem colisão com `DOC_PAGES` (App.tsx).

## Adaptação consumer (quando `EXEMPLOS` não existem localmente)

1. `node_modules/@snksergio/design-system/**/USAGE.md` (se o package publicar).
2. GitHub: `https://github.com/igreenlab/igreen-desingsystem-admin` →
   `src/preview/pages/List*Preview.tsx` + `DataListDoc.tsx`.
3. Snippets mínimos do `generate.md` (último recurso).

## Handoff

- Entrevista pronta → `BLUEPRINT_PRONTO: <Entidade> (lista) — aguardando gate`
- Pós-geração → `LIST_PRONTO: <Entidade> — #/<page-id>`
- Registrar `PAUSADO (gate)` e `CONCLUÍDO` (com Assumption) em
  `.ai/status/pipeline-state.md`.
