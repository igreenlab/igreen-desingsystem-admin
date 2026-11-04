# Pedidos do Sólis — plano de implementação (A + B)

> **Para executores:** SUB-SKILL OBRIGATÓRIA — use `superpowers:subagent-driven-development`
> (recomendada) ou `superpowers:executing-plans` para implementar tarefa a tarefa.
> Os passos usam checkbox (`- [ ]`) para rastreio.

**Goal:** Entregar as 14 correções e as adições de baixo risco dos pedidos do Sólis sem que
nenhum consumidor existente veja mudança de comportamento, visual ou API.

**Architecture:** Toda adição é opt-in com default que preserva o de hoje. Toda correção é
acompanhada de um teste que **trava o caminho antigo** — não só o novo. A ordem das tarefas é
ditada por duas coisas: arquivos que competem pelas mesmas linhas entram juntos, e correção
vem antes da adição que depende dela.

**Tech Stack:** React 19 · TypeScript · `tv()` de `@/utils/tv` · Vitest + Testing Library ·
Recharts 3 · `@dnd-kit/core`

**Spec:** [`solis-pedidos-2-analise.md`](./solis-pedidos-2-analise.md)

---

## Global Constraints

Valem para **toda** tarefa. Não repetidas nos passos.

- ⛔ **Nenhuma mudança de comportamento.** Se hoje o componente faz X sem prop nova, ele
  continua fazendo X depois da tarefa. Prop nova ausente = comportamento de hoje, sempre.
- ⛔ **Toda tarefa adiciona teste que trava o CAMINHO ANTIGO**, não só o novo. "Aditivo" é
  afirmação sobre quem já usa, e afirmação sem teste é esperança.
- ⛔ **L-064 — prove vermelho.** Depois de passar, quebre o código de propósito, rode o teste,
  veja reprovar, restaure com `git checkout --` e confirme `git diff --stat` vazio. Teste
  escrito do mesmo modelo mental que gerou o código concorda por construção.
- ⛔ **Mudança visual** (T3, T6, T7, T14) exige browser nos **dois temas**, claro e escuro.
- Classes DS antes de Tailwind literal (`gap-gp-md`, não `gap-4`). Visual muda só em
  `*.styles.ts`.
- `npx tsc --noEmit` + `npm test` verdes ao fim de cada tarefa. `npm run release:check` ao
  fim de cada rodada.
- Componente tocado → `USAGE.md` ao lado atualizado na MESMA tarefa. É o que vira
  `dist-lib/ai/componentes/<Nome>.md` no pacote de IA.
- Commit por tarefa, mensagem com o **porquê**. PR por rodada (Regra 8), nunca commit em `main`.

---

## Ritual de fim de rodada — OBRIGATÓRIO

Nenhuma rodada fecha sem isto. Não é a review de tarefa (que é por diff); é a varredura das
**superfícies** que só se enxergam com a rodada inteira na mão.

A L-042 lista 8 superfícies. **1 a 4, 6 e 8 entram no PR da rodada; 5 e 7 consolidam no
`/ds-release`.** Confundir as duas metades foi o que deixou a v0.70.0 com a API das raias
documentada em lugar nenhum.

> ⚠️ **A superfície 6 mudou de lado em 2026-11-03, por decisão do mantenedor.** A L-042 a
> coloca no release, junto da 5 e da 7, porque ela só **chega** em quem instala com o bump
> do CLI. Mas escrever o texto e publicá-lo são coisas diferentes: adiar o texto até o
> release concentra num só momento a redação de tudo que N rodadas produziram, sem o
> contexto fresco de cada uma. Medido ao fechar a Rodada 2: o payload tinha **0 menções** a
> `enableHeaderFilter`, `showTypeIcons`, `enableColumnMenu` e `MultiSelectFieldDropdown`, e
> a única menção a `valueFormatter` estava desatualizada. O **texto** passa a entrar no PR;
> só o **bump do CLI** fica no release.

### No PR da rodada

- [ ] **Código** — `npx tsc --noEmit` limpo · `npm test` sem falha nova · `npm run release:check`
      (embed defasado é esperado e some no release)
- [ ] **Estilo no lugar certo** — componente de `ui/` muda visual só em `*.styles.ts`.
      ⚠️ `shadcn/*` é exceção: segue o upstream com `cva`/`className` inline, e forçar
      `.styles.ts` ali quebraria o re-sync com o shadcn oficial.
- [ ] **Convenções** — classes DS antes de Tailwind literal · `tv` de `@/utils/tv` ·
      `disabled` como último `compoundVariant` · nenhum vocabulário da bridge shadcn
      (`bg-popover`, `ring-foreground`) nem paleta nativa (`bg-red-500`)
- [ ] **USAGE.md** de cada componente tocado, **incluindo o bloco `ds:regras`** — ele vira
      `regras-por-componente.json` no pacote de IA do npm
- [ ] **Showcase** — a `<Nome>Doc` **demonstra** o que mudou, não só menciona. Prop nova sem
      exemplo é prop que o consumidor não descobre
- [ ] **`inventory.md`** — a entrada do componente descreve a capacidade nova
- [ ] **Barrel** (`src/components/index.ts`) se houve export novo — gate `barrel-completeness`
- [ ] **Payload do consumidor** (`cli/templates/default/_claude/`) — o TEXTO, não o bump.
      Prop ou export novo entra em `rules/ds-components.md`; regra que muda como a IA do
      consumidor compõe entra na skill que a ensina (`skills/crud-builder/generate.md` e
      irmãs). ⚠️ Duas armadilhas medidas: **(a)** prop vai em `****negrito****`, NUNCA em
      crase — o gate `vocab-surface` lê todo termo em crase como nome de componente e
      reprova prop como "componente inexistente"; **(b)** versão se cita como `vNEXT`, que
      o `version-claims-check` reprova no `release:check` — assim o placeholder morre no
      `/ds-release` por construção, em vez de virar número errado.
- [ ] **Prova vermelha: o check não pode ser mais frouxo que a alegação.** Rode `git diff --stat <arquivo>`
      e veja que não está vazio, ANTES de rodar o teste. Os arquivos deste repo são
      **CRLF**, e padrão multi-linha escrito com `
` não casa — a mutação não entra, em
      silêncio. Medido na Task 7c: 2 de 8 mutações não aplicaram na primeira rodada. É a
      L-064 virada contra o próprio instrumento — **uma mutação que não roda é
      indistinguível de uma mutação que sobreviveu**, e as duas se parecem com "o teste
      cobre isso".

      ⚠️ **E confirme que ela SAIU pela mesma régua.** O detector tem que casar a **linha
      inteira**, não um trecho: um `includes` acusa resíduo que não existe quando a mutação
      é substring da linha restaurada (aconteceu na Task 8). As duas falhas têm a mesma
      forma — **a verificação casando menos do que a afirmação que ela sustenta**. O erro
      não é aplicar mal a mutação; é acreditar num check mais frouxo que a alegação.

      **A regra, na forma mais curta que achamos:** *um verde só conta quando você sabe
      qual linha de código o produziu — prove apagando essa linha, não uma vizinha.*

      Quatro formas já apareceram nesta série, todas iguais por dentro — a verificação
      concordando com a alegação por um motivo diferente do que o leitor supõe:

      | forma | o que o instrumento fez |
      |---|---|
      | padrão `\n` em arquivo **CRLF** | não casa **nada** — a mutação não aplica, em silêncio |
      | detector com `includes()` | casa **demais** — acusa resíduo que não existe |
      | `git checkout -- <arq>` depois de `git checkout <commit> -- <arq>` | lê do **índice**, que o primeiro comando atualizou: não restaura. Use `git checkout HEAD -- <arq>` |
      | teste verde por **outro mecanismo** | o teste do `multiSelect` passava por uma promoção inerte, e por isso parecia cobrir o registry |
- [ ] **Alcance compartilhado** — o que foi tocado é usado por quem mais? `TableToolbar`,
      `columnTypeRegistry` e os `column-types` **não são do `DataTable`**: o `DataList`
      consome os mesmos, e o `ToolbarSimpleFilterDrawer` é renderizado pelos dois. Antes de
      fechar a rodada, rode o mapa de importadores (abaixo) e verifique **no browser** cada
      componente que consome o módulo tocado — não só aquele em que você trabalhou.

      ```bash
      # quem importa, de fora da própria pasta
      grep -rn "column-types" src --include=*.tsx -l | grep -v 'DataTable/'
      grep -rn 'columnTypeRegistry.get' src/components/ui --include=*.tsx
      ```

      ⚠️ O `Gantt` **reproduz** a gramática do `TableToolbar` sem importar (está escrito no
      topo do `gantt-toolbar.tsx`). Mudança de código não o alcança — mas ele **drifta**, e
      isso é um risco de outro tipo: conferir à vista, não por `grep`.
- [ ] **Doc que ficou obsoleta** — ao mudar comportamento, procure o texto que descrevia o
      antigo. Parágrafo que ainda afirma o anterior é pior que ausência: quem lê para de
      investigar (L-060). Foi assim que o `valueFormatter` ficou documentado como coisa de
      data depois de passar a valer para `number` e `currency`.

### Anotado para o `/ds-release`, não feito no PR

- [ ] `registry.json` + embed (`registry:build` + `copy-registry`)
- [ ] **Bump do CLI** — é o que faz o payload já escrito CHEGAR em quem instala (L-018)
- [ ] Entrada do changelog, com ⚠️ em cada mudança observável

### Por que o ritual existe

A review de tarefa olha um diff e pergunta "isto está certo?". Ela **não** pergunta "o
consumidor consegue descobrir isto?" — porque a resposta mora fora do diff. Na v0.70.0 cinco
reviews passaram limpas e a API das raias não existia em tabela nenhuma.

---

## Review Focus

Cinco modos de falha que as tarefas tocam e que nenhum teste de feature exercita. Cada um tem
teste atribuído à tarefa dona.

1. **Consumidor sem a prop nova** — todo default tem que render igual ao de hoje. Coberto em
   cada tarefa pelo teste do caminho antigo (constraint global).
2. **`ownsMulti` com valor único** — a correção do T1 não pode quebrar o grupo de 1 valor, que
   é o caso que *funcionava* antes. Teste no T1.
3. **`valueFormatter` que devolve `""` ou `null`** — T2 passa a chamar função do consumidor em
   dois tipos novos; retorno vazio não pode virar `undefined` na célula. Teste no T2.
4. **Coluna sem `headerName`** — T7 mexe no cálculo de `minWidth` do cabeçalho; largura não
   pode virar `NaN` quando não há texto para medir. Teste no T7.
5. **`loadingMode="keep"` na PRIMEIRA carga** — não há linha anterior para manter; tem que
   cair no skeleton, não em corpo vazio. Teste no T10.

---

## File Structure

| Arquivo | Responsabilidade | Tarefas que tocam |
|---|---|---|
| `DataTable/data-table.tsx` | orquestrador | T1, T7, T10, T11 |
| `DataTable/index.ts` | barrel do DataTable | T1 |
| `column-types/definitions/number-column-type.tsx` | tipo number | T2, T15 |
| `column-types/definitions/currency-column-type.tsx` | tipo currency | T2, T15, T16 |
| `column-types/_filter-field.tsx` | widget de filtro compartilhado | T6 |
| `shadcn/calendar.tsx` | calendário base | T3 |
| `shadcn/card.tsx` | card base | T5 |
| `TableToolbar/parts/toolbar-simple-filter-drawer.tsx` | drawer de filtros | T8, T9 |
| `DataTable/parts/data-table-column-menu.tsx` | menu do cabeçalho | T7 |
| `ui/Button/button.tsx` | botão | T13 |
| `ui/Chart/chart.tsx` | contêiner de gráfico | T17 |

⚠️ **`data-table.tsx` é tocado por 4 tarefas em regiões diferentes.** T7 (cabeçalho, ~1284) e
T10/T11 (render do corpo, ~2182) não se cruzam; T1 (~2060) é isolado. Executar fora de ordem
não gera conflito, mas **T8 antes de T16** é obrigatório (ver T16).

---

## RODADA 1 — correções isoladas

Nenhuma toca região compartilhada. Podem ir em paralelo se houver mais de um executor.

### Task 1: `ownsMulti` entrega a lista inteira (itens 1 + 13)

As duas metades são **uma tarefa**: o export sozinho não serve para nada, e a correção não é
testável sem um widget que receba o array.

**Files:**
- Modify: `src/components/ui/DataTable/data-table.tsx:2083` (`currentValue`)
- Modify: `src/components/ui/DataTable/index.ts` (export do `MultiSelectFieldDropdown`)
- Test: `src/components/ui/DataTable/owns-multi.test.tsx` (existe — estender)

**Interfaces:**
- Produces: `MultiSelectFieldDropdown` exportado do barrel do DataTable.

- [ ] **Step 1: Escrever os testes que falham**

Em `owns-multi.test.tsx`, dois casos novos:

```tsx
it("tipo que declara ownsMulti recebe a LISTA inteira, não o primeiro valor", ...)
// registra tipo com ownsMulti:true que guarda o `value` recebido;
// filterModel com 3 itens no mesmo field; assert: value === ["A","B","C"]

it("ownsMulti com UM valor continua recebendo array de um, não a string", ...)
// Review Focus #2 — o caso que funcionava antes não pode regredir
// assert: value === ["A"]
```

- [ ] **Step 2: Rodar e ver falhar**

`npx vitest run src/components/ui/DataTable/owns-multi.test.tsx`
Esperado: FAIL — recebe `"A"` em vez de `["A","B","C"]`.

- [ ] **Step 3: Corrigir o `currentValue`**

Trocar `useMulti ? aggregateValues : aggregateValues[0]` por
`useMulti || customOwnsMulti ? aggregateValues : aggregateValues[0]`.
Atualizar o JSDoc acima: hoje ele promete posse e a linha entregava um valor.

- [ ] **Step 4: Exportar o `MultiSelectFieldDropdown`** em `DataTable/index.ts`, ao lado do
  `MultiSelectDropdown` já exportado (linha 60).

- [ ] **Step 5: Rodar e ver passar** — `npx vitest run src/components/ui/DataTable/`

- [ ] **Step 6: Provar vermelho (L-064)** — reverter só o `currentValue`, rodar, ver os 2
  falharem, restaurar, `git diff --stat` vazio no arquivo.

- [ ] **Step 7: `USAGE.md` do DataTable** — seção do `columnTypeRegistry`: o que `ownsMulti`
  entrega (array sempre, mesmo com 1 valor) e que o `MultiSelectFieldDropdown` é a peça para
  montar o widget próprio.

- [ ] **Step 8: Commit**

```bash
git add src/components/ui/DataTable/data-table.tsx src/components/ui/DataTable/index.ts \
        src/components/ui/DataTable/owns-multi.test.tsx src/components/ui/DataTable/USAGE.md
git commit -m "fix(DataTable): ownsMulti entregava o primeiro valor, nao a lista"
```

---

### Task 2: `valueFormatter` em `number` e `currency` (item 6)

**Files:**
- Modify: `column-types/definitions/number-column-type.tsx` (`renderCell`)
- Modify: `column-types/definitions/currency-column-type.tsx` (`renderCell`)
- Test: `src/components/ui/DataTable/column-types/value-formatter.test.tsx` (criar)

- [ ] **Step 1: Escrever os testes que falham**

```tsx
it("number usa column.valueFormatter quando ha", ...)          // "1.234" → "1,2 mil"
it("currency usa column.valueFormatter quando ha", ...)
it("sem valueFormatter, o formato do TIPO continua valendo", ...) // caminho antigo
it("valueFormatter que devolve string vazia renderiza vazio, nao o valor cru", ...)
// Review Focus #3
```

- [ ] **Step 2: Rodar e ver falhar** — `npx vitest run .../value-formatter.test.tsx`

- [ ] **Step 3: Aplicar o mesmo escape hatch do `datetime`**

Espelhar `datetime-column-type.tsx:172` — `column?.valueFormatter ? column.valueFormatter(value) : <formato do tipo>`.
Copiar o comentário de lá, que já explica a precedência.

- [ ] **Step 4: Rodar e ver passar**

- [ ] **Step 5: Provar vermelho (L-064)**

- [ ] **Step 6: Commit** — `fix(DataTable): number e currency ignoravam o valueFormatter da coluna`

---

### Task 3: pt-BR como default do `Calendar` (item 3)

Default no componente, **não** `locale` nos 5 call-sites — o sexto call-site esqueceria.

**Files:**
- Modify: `src/components/shadcn/calendar.tsx`
- Test: `src/components/shadcn/calendar-locale.test.tsx` (criar)

- [ ] **Step 1: Escrever os testes que falham**

```tsx
it("sem prop, os dias da semana saem em pt-BR", ...)        // "dom" não "Su"
it("locale explicito ainda vence o default", ...)            // enUS → "Su"
```

- [ ] **Step 2: Rodar e ver falhar**

- [ ] **Step 3: `locale = ptBR` como default do parâmetro** em `calendar.tsx`, importando de
  `date-fns/locale`. Não tocar em nenhum call-site.

- [ ] **Step 4: Rodar e ver passar** + `npm test` inteiro (o `Calendar` é usado por
  `DatePicker`, `date-column-type`, `datetime-column-type`, `Scheduler`).

- [ ] **Step 5: Browser nos dois temas** — `#/date-picker` e `#/data-table` (filtro de data):
  dias da semana em pt-BR, nenhuma quebra de largura de célula.

- [ ] **Step 6: Provar vermelho (L-064)**

- [ ] **Step 7: Commit** — `fix(Calendar): filtros de data saiam em ingles`

---

### Task 4: Texto de contagem configurável (item 27) — ⚠️ PROVAVELMENTE JÁ EXISTE

**Não implementar antes de confirmar com o Sólis qual tela eles querem dizer.**

`selectionConfig.countLabel?: (count: number) => ReactNode` **já existe** desde a v0.69.0
(`data-table.types.ts:573`), ligado em `data-table.tsx:1945` e consumido em
`bulk-actions-bar.tsx:54`. Varredura por `selecionad[oa]s?` em `src/components/ui/`: as únicas
contagens fixas estão no `chip-group.tsx`; o resto já é configurável.

Duas leituras possíveis do pedido:

1. **Eles não acharam a prop** → devolver com o ponteiro. Zero código.
2. **É outra contagem** (dentro do popover de filtro, ou o resumo do chip) → aí é tarefa real,
   mas no componente que eles apontarem.

- [ ] **Step 1:** Pedir ao Sólis o print ou a rota da tela com o texto fixo
- [ ] **Step 2:** Se for o `bulk-actions-bar` → responder com `selectionConfig.countLabel` e
  **fechar o item**; acrescentar 1 linha no `USAGE.md` do DataTable se a prop estiver pouco
  visível na doc
- [ ] **Step 3:** Se for outro ponto → abrir tarefa no componente certo, com o mesmo formato
  de prop (`(n: number) => ReactNode`, default = texto de hoje)

---

### Task 5: Exportar `CardAction` (item 29)

**Files:**
- Modify: `src/components/shadcn/card.tsx` · `src/components/shadcn/index.ts` ·
  `src/components/index.ts` (barrel npm — L-042 superfície 8)
- Test: `barrel-completeness` já cobre; adicionar caso só se o gate não pegar

- [ ] **Step 1:** Adaptar o `CardAction` do shadcn oficial ao vocabulário DS (sem
  `bg-popover`/`text-card-foreground` — L-039; gate `shadcn-vocab` reprova)
- [ ] **Step 2:** Exportar nos três barrels
- [ ] **Step 3:** `npm test` — `barrel-completeness` e `shadcn-vocab` verdes
- [ ] **Step 4:** 1 linha em `shadcn/USAGE.md` **só se houver gotcha**; sem gotcha, nada
- [ ] **Step 5: Commit**

---

### Task 6: Coerência do `MultiSelectDropdown` (itens 17v-b, 18v, 19v)

Três defeitos no mesmo componente. Separar geraria três PRs no mesmo arquivo.

⚠️ **Entra só a parte A.** O spinner centralizado (17v) é **C** e fica fora.

**Files:**
- Modify: `column-types/_filter-field.tsx` (`MultiSelectDropdown`, `LISTA_MAX_H`)
- Test: `src/components/ui/DataTable/column-types/multi-dropdown-coerencia.test.tsx` (criar)

- [ ] **Step 1: Escrever os 3 testes que falham**

```tsx
it("'Limpar' nao aparece enquanto nao ha opcoes", ...)   // paridade com "Selecionar todos"
it("lista de 3 opcoes nao reserva altura de 8", ...)     // altura por conteúdo
it("popover nao muda de largura ao filtrar a lista", ...) // largura travada na abertura
```

- [ ] **Step 2: Rodar e ver falhar**
- [ ] **Step 3: Implementar os três** — altura por conteúdo com `LISTA_MAX_H` como **teto**
  (hoje é piso); largura mínima calculada na abertura e mantida
- [ ] **Step 4: Rodar e ver passar**
- [ ] **Step 5: Browser nos dois temas** em `#/filter-chips-lab`
- [ ] **Step 6: Provar vermelho (L-064)**
- [ ] **Step 7: Commit**

---

- [ ] **Fechar Rodada 1:** `npm run release:check` · PR único · reportar link

---

## RODADA 2 — a região do cabeçalho

### Task 7: Cabeçalho — menu, funil, ícone e largura (itens 17, 15, 14, 7)

**Uma tarefa de propósito.** Os quatro itens editam as mesmas ~20 linhas
(`data-table.tsx:1270–1300`). Quatro PRs separados conflitariam entre si.

**Files:**
- Modify: `src/components/ui/DataTable/data-table.tsx:1270–1300`
- Modify: `src/components/ui/DataTable/parts/data-table-column-menu.tsx` (aceitar `sortable`)
- Modify: `src/components/ui/DataTable/data-table.types.ts` (props novas)
- Modify: `src/components/ui/DataTable/utils/calculate-column-widths.ts` (minWidth)
- Test: `src/components/ui/DataTable/header-acoes.test.tsx` (criar)

**Interfaces:**
- Produces: `DataTableColumnMenuProps.sortable: boolean` · `DataTableProps.showTypeIcons?: boolean`
  · `DataTableColumnDef.enableHeaderFilter?: boolean`

- [ ] **Step 1: Escrever os testes que falham**

```tsx
// item 17
it("coluna sortable:false nao oferece 'Ordenar' no menu", ...)
it("coluna sortavel CONTINUA oferecendo as duas ordenacoes", ...)   // caminho antigo
it("sem itens de ordenacao, o separador tambem some", ...)
// item 15
it("enableHeaderFilter:false esconde o funil e MANTEM o menu", ...) // o que o contorno deles perdia
// item 14
it("showTypeIcons:false esconde o icone do tipo", ...)
it("sem a prop, o icone continua aparecendo", ...)                  // caminho antigo
// item 7 + Review Focus #4
it("largura minima do cabecalho inclui as acoes visiveis", ...)
it("coluna sem headerName nao produz largura NaN", ...)
```

- [ ] **Step 2: Rodar e ver falhar** — os 8

- [ ] **Step 3: Passar `sortable` ao `DataTableColumnMenu`** e condicionar os dois itens +
  separador. O menu já recebe `sortDirection`; falta o booleano.

- [ ] **Step 4: `enableHeaderFilter` e `showTypeIcons`**, ambos default `true`

- [ ] **Step 5: `minWidth` do cabeçalho soma a largura das ações VISÍVEIS**
  (funil e/ou menu, conforme as props acima). Guardar contra `headerName` ausente.
  ⚠️ **Não** juntar as ações num botão só — mudaria o cabeçalho de todo projeto (é C).

- [ ] **Step 6: Rodar e ver passar** + `npm test` inteiro (o cálculo de largura é usado por
  `autoFit`, que é default `true` — regressão aqui afeta toda tabela)

- [ ] **Step 7: Browser nos dois temas** — coluna de ~64px com funil+menu: nada transborda;
  tabela normal: larguras inalteradas vs. `main`

- [ ] **Step 8: Provar vermelho (L-064)** — nos 4 itens, um de cada vez

- [ ] **Step 9: `USAGE.md`** — as duas props novas na tabela de props

- [ ] **Step 10: Commit**

---

- [ ] **Fechar Rodada 2:** `release:check` · PR · link

---

## RODADA 3 — o motor de filtro (ordem obrigatória)

### Task 7b: Paridade do `ownsMulti` no `DataList` (achado de auditoria, não é pedido)

**Não veio do Sólis.** Saiu da auditoria de alcance compartilhado que o mantenedor pediu ao
fechar a Rodada 2 — a pergunta *"o que mais consome o que vocês mexeram?"*.

**O defeito.** Três caminhos resolvem o tipo do widget de filtro, e um deles diverge:

| caminho | resolve o tipo como | respeita `ownsMulti`? |
|---|---|---|
| chip do `DataTable` (`data-table.tsx:2059`) | `col.filterType` | ✅ desde a Rodada 1 |
| drawer compartilhado (`toolbar-simple-filter-drawer.tsx:225`) | `col.filterType ?? col.type ?? "text"` | ✅ no efeito — ⚠️ **ele nunca lê o flag**: simplesmente não tem promoção ao `multiSelect`, então sempre renderiza o tipo declarado. Quem acrescentar uma promoção ali no futuro recria a divergência sem tocar em nada que mencione `ownsMulti` |
| **chip do `DataList`** (`data-list-toolbar.tsx:212`) | **`isMulti ? "multiSelect" : fieldDef.type`** | ❌ **nunca** |

O `DataList` renderiza **os dois**: o drawer na linha 372 e o chip na 236. Então, dentro do
mesmo componente, abrir o funil entrega o widget do consumidor e clicar no chip que ele
acabou de gerar entrega o built-in. Um clique de distância, dois widgets.

**Por que é correção e não mudança de comportamento (categoria A).** O `ownsMulti` existe
desde a v0.69.0 e **nunca funcionou em versão publicada** — a correção está neste lote, não
lançada. Corrigir agora faz o `ownsMulti`
**estrear coerente**; corrigir depois seria mudança observável.

> ⚠️ **Precisão sobre essa justificativa, apontada na review.** Não é verdade que *"ninguém
> tem tipo custom funcionando em lugar nenhum"* — o chip do `DataList` com operador
> **escalar** já entregava o widget do consumidor, porque sem operador multi não há
> promoção. O que muda para esse caso é o valor: passa de `"ativo"` para `["ativo"]`.
> Medido na review: nenhum built-in declara `ownsMulti` (há teste prendendo os 15), a única
> declaração no repo é uma demo de `DataTable`, e o `MultiSelectDropdown` normaliza com
> `toArray` — então os dois são indistinguíveis para widget montado do jeito documentado.
> O alcance é mínimo, mas não é zero, e o changelog precisa dizer isso.

⚠️ **Isto também torna verdadeira uma doc que já está escrita.** O vocabulário do consumidor
(fechado no PR #356) diz *"o chip multi inteiro passa a ser seu"*, sem ressalva de
componente. Hoje a frase é falsa no `DataList`.

**Files:**
- Modify: `src/components/ui/DataList/parts/data-list-toolbar.tsx:208-227`
- Test: `src/components/ui/DataList/ownsmulti-paridade.test.tsx` (criar)

- [ ] **Step 1: Escrever os testes que falham**

```tsx
it("tipo custom com ownsMulti renderiza o widget DELE no chip do DataList", ...)
it("o widget recebe ARRAY, não o primeiro valor", ...)        // o defeito da Rodada 1
it("tipo custom SEM o flag continua caindo no multiSelect", ...)  // caminho antigo
it("campo sem filterType custom segue idêntico", ...)             // caminho antigo
it("drawer e chip do MESMO DataList resolvem o mesmo tipo", ...)  // a paridade em si
```

- [ ] **Step 2: Rodar e ver falhar** — os 5

- [ ] **Step 3: Espelhar a resolução do `DataTable`**, não inventar uma terceira. O
  `customOwnsMulti` de `data-table.tsx:2061` já tem as três guardas que importam:
  `filterType !== "multiSelect"`, `typeDef.type === filterType` (senão um typo herda o flag
  de quem o registry devolveu por fallback) e `ownsMulti === true`. **Reaproveite a
  condição** — se ela for extraída para um util compartilhado, melhor; duas cópias divergem.

- [ ] **Step 4: Rodar e ver passar** + `npm test` inteiro

- [ ] **Step 5: Provar vermelho (L-064)** — uma mutação por teste novo

- [ ] **Step 6: Browser** — `#/data-list`: abrir o funil, aplicar um multi, clicar no chip
  gerado e confirmar que os dois mostram o MESMO widget. ⚠️ A Rodada 1 nunca verificou o
  `DataList` no browser (o `#/filter-chips-lab` não o usa — medido: 0 menções), então
  aproveite e confira ali as três correções do `MultiSelectDropdown`, que chegam neste chip
  pelo mesmo `renderFastFilterInput`.

- [ ] **Step 7: Commit**

---

### Task 8: Drawer preserva o operador (item 2)

⚠️ **Tem que vir antes de T16.** Enquanto o drawer recalcula o operador a cada mudança de
valor, qualquer trabalho de operador fica invisível — o drawer sobrescreve.

**Files:**
- Modify: `TableToolbar/parts/toolbar-simple-filter-drawer.tsx:123` (`updateFieldValue`)
- Test: `src/components/ui/TableToolbar/drawer-operador.test.tsx` (criar)

- [ ] **Step 1: Escrever os testes que falham**

```tsx
it("filtro em 'Excluindo' continua Excluindo depois de editar o valor no drawer", ...)
it("filtro NOVO no drawer continua nascendo com o operador default do tipo", ...)
// caminho antigo — a correção não pode mudar o nascimento, só a edição
```

- [ ] **Step 2: Rodar e ver falhar**

- [ ] **Step 3: `updateFieldValue` passa a RECEBER o operador vigente** em vez de derivá-lo.
  Derivar só quando não há operador anterior (filtro novo).
  ⚠️ **Não** mexer em `defaultOperatorForFilterType` — ela é lida por 4 call-sites
  (`data-table.tsx:664`, `:848`, o drawer, e a ordem do dropdown do builder avançado).

- [ ] **Step 4: Rodar e ver passar**

- [ ] **Step 5: Browser** — `#/filter-chips-lab`: pôr um filtro em "Excluindo" pelo chip,
  editar no drawer, confirmar que continua "Excluindo"

- [ ] **Step 6: Provar vermelho (L-064)**

- [ ] **Step 7: Commit** — `fix(TableToolbar): drawer reescrevia o operador ao editar o valor`

---

### Task 9: `simpleFilter.open` / `onOpenChange` (item 18)

Escolhido em vez do `closeOnOutsideClick` que eles pediram: é o padrão de todo overlay do DS
e resolve o clique-fora como caso particular, sem a complicação de ignorar cliques nos
popovers abertos **a partir do** drawer.

**Files:**
- Modify: `data-table.tsx` (estado `v2FilterOpen` passa a aceitar controle externo)
- Modify: `data-table.types.ts` (`simpleFilter?: { open?: boolean; onOpenChange?: (o: boolean) => void }`)
- Test: `src/components/ui/DataTable/simple-filter-controlado.test.tsx` (criar)

- [ ] **Step 1: Testes**

```tsx
it("sem a prop, o drawer abre e fecha sozinho como hoje", ...)   // caminho antigo
it("com `open`, quem manda e a prop", ...)
it("o callback avisa da intencao nos DOIS modos", ...)           // padrão do DS
```

- [ ] **Step 2: Rodar e ver falhar**
- [ ] **Step 3: Par valor+callback** no mesmo formato do `showHistory` do Gantt
  (`gantt.tsx:748`) — é o precedente mais recente
- [ ] **Step 4: Rodar e ver passar**
- [ ] **Step 5: Provar vermelho (L-064)**
- [ ] **Step 6: `USAGE.md` + commit**

---

- [ ] **Fechar Rodada 3:** `release:check` · PR · link

---

## RODADA 4 — estados de carregamento

### Task 10: `loadingMode` + o comentário falso (itens 5a, 5b)

**Files:**
- Modify: `DataTable/hooks/use-data-table-query.ts:58` (comentário)
- Modify: `data-table.tsx:2182` e `:2283` (render)
- Modify: `data-table.types.ts`
- Test: `src/components/ui/DataTable/loading-mode.test.tsx` (criar)

**Interfaces:**
- Produces: `DataTableProps.loadingMode?: "skeleton" | "keep"` — default `"skeleton"`

- [ ] **Step 1: Escrever os testes que falham**

```tsx
it("default 'skeleton' troca o corpo pelo esqueleto, como hoje", ...)   // caminho antigo
it("'keep' mantem as linhas anteriores durante o refetch", ...)
it("'keep' marca aria-busy no corpo mantido", ...)
it("'keep' na PRIMEIRA carga cai no esqueleto, nao em corpo vazio", ...) // Review Focus #5
```

- [ ] **Step 2: Rodar e ver falhar**

- [ ] **Step 3: Implementar.** O dado já existe — `setIsLoading(true)` em
  `use-data-table-query.ts:125` **não limpa as rows**. É só o render que descarta.

- [ ] **Step 4: Corrigir o comentário da linha 58.** Ele afirma *"Resultado anterior continua
  visível"*, o que é verdade no hook e falso no componente. Reescrever dizendo o que o hook
  garante (preserva o dado) e o que decide a tela (`loadingMode`).

- [ ] **Step 5: Rodar e ver passar**

- [ ] **Step 6: Browser** — tabela em server mode, `loadingMode="keep"`, trocar de página:
  linhas não piscam, rodapé mantém contexto. Depois sem a prop: esqueleto como hoje.

- [ ] **Step 7: Provar vermelho (L-064)**

- [ ] **Step 8: `USAGE.md` + commit**

---

### Task 11: `paginationMode: "server"` (item 11)

Menor do que o pedido sugere: `rowCount`, `paginationModel`, `onPaginationModelChange`,
`onSortModelChange` e `onFilterModelChange` **já existem** (`data-table.types.ts:598, 650,
653, 654, 662`). Falta a flag que desliga o fatiamento local com `rows`.

**Files:**
- Modify: `data-table.types.ts` · `hooks/use-data-table-processor.ts` ·
  `hooks/use-data-table-pagination.ts`
- Test: `src/components/ui/DataTable/pagination-mode.test.tsx` (criar)

**Interfaces:**
- Produces: `DataTableProps.paginationMode?: "client" | "server"` — default `"client"`

- [ ] **Step 1: Testes**

```tsx
it("default 'client' fatia as rows localmente, como hoje", ...)      // caminho antigo
it("'server' renderiza as rows recebidas SEM fatiar", ...)
it("'server' usa rowCount para o total do rodape", ...)
it("'server' nao filtra nem ordena localmente — so emite", ...)
```

- [ ] **Step 2: Rodar e ver falhar**
- [ ] **Step 3: Implementar** — a flag pula `slice`/filtro/sort locais; `rowCount` passa a
  valer sem `fetchData`. Atualizar o JSDoc do `rowCount`, que hoje diz *"server mode
  opcional"* e passa a valer nos dois modos.
- [ ] **Step 4: Rodar e ver passar** + `npm test` inteiro
- [ ] **Step 5: Provar vermelho (L-064)**
- [ ] **Step 6: `USAGE.md`** — tabela de recursos: o terceiro modo, ao lado de `fetchData`
- [ ] **Step 7: Commit**

---

- [ ] **Fechar Rodada 4:** `release:check` · PR · link

---

## RODADA 5 — avulsos de baixo risco

Independentes entre si. Podem ir num PR só.

### Task 12: `isRowExpandable` (item 19)
- Modify: `data-table.types.ts` · `data-table.tsx` (render do chevron)
- Testes: `it("sem a prop, toda linha expande como hoje")` ·
  `it("linha que o predicado recusa nao mostra chevron NEM responde ao clique")`

### Task 13: `Button.disabledReason` (item 33)
- Modify: `ui/Button/button.tsx` · `button.types.ts` · `button.styles.ts`
- Troca `pointer-events-none` por `aria-disabled` **quando houver `disabledReason`**;
  sem a prop, `disabled` segue idêntico
- Testes: `it("sem disabledReason, disabled continua pointer-events-none")` ·
  `it("com disabledReason, hover e foco funcionam e o tooltip aparece")` ·
  `it("com aria-disabled, o onClick NAO dispara")` ← a armadilha do `aria-disabled`
- Mesmo modo de falha da **L-070**: estado que apaga a própria saída

### Task 14: Contraste do tooltip sobre superfície com hover (item 32)
- Modify: tokens do tooltip (NÃO o `Kpi` — vale para qualquer tooltip)
- Browser nos dois temas, sobre card com e sem hover
- Teste: `dead-theme-classes` já cobre classe inexistente; o contraste é verificação visual

### Task 15: `prefix`/`suffix` em `number` e `currency` (item 9a)
- Modify: os dois `*-column-type.tsx` · no campo **e** no chip
- Testes: `it("sem prefix/suffix, o formato de hoje continua")` · campo · chip

### Task 16: `between` do `currency` no chip (item 9b)
⚠️ **Depende do T8.** Sem ele, o drawer reescreve o operador e o teste passa por acidente.
- Paridade com o `number`, que já tem
- Testes: `it("currency com between abre em between no chip")` ·
  `it("currency sem between continua em equals")`

### Task 17: `empty` no `ChartContainer` + legenda (itens 28, 24)
- Modify: `ui/Chart/chart.tsx`
- `empty?: ReactNode` — ausente = comportamento de hoje
- Legenda reserva altura quando quebra em linhas (hoje achata as barras com altura fixa)
- Testes: `it("sem empty, grafico sem dado renderiza como hoje")` ·
  `it("legenda em 2 linhas nao reduz a area do grafico")`

### Task 18: Botão de ajuda avulso (item 30)
- Extrair o botão do `helperText` do `Kpi` para peça reutilizável
- ⚠️ O `Kpi` tem que continuar idêntico: teste de que o render dele não mudou

- [ ] **Fechar Rodada 5:** `release:check` · PR · link · `/ds-release`

---

## Fora deste plano

Quatro frentes precisam de spec própria antes de virar tarefa. Planejá-las aqui seria inventar
desenho que ninguém decidiu.

| Frente | Itens | Por que espera |
|---|---|---|
| **`FilterBar` fora do DataTable** | 25, 26 | extrair o motor é decisão de arquitetura: muda onde mora `columnTypeRegistry`, `ToolbarApplied` e o estado de filtro. O item 26 é prop dela — planejar antes seria remendo no drawer |
| **Gráficos prontos** | 22, 23 | é a decisão de o DS passar a encapsular Recharts com API de props. Os 5 defeitos das receitas estão levantados na análise; falta decidir se entra |
| **Campos de data novos** | 20, 21 | `mode="range"` no `MonthYearPicker` e `withTime` no `DatePicker` são componentes, não props. Fazer depois do T3, que revisa o `Calendar` |
| **Donut e linha prontos** | 30, 31 | esperam um segundo consumidor pedindo — é o teste de "serve mais de um projeto" |

### Reclassificações durante o planejamento

Planejar com o código aberto mudou dois veredictos da análise. Ambos na direção segura —
menos trabalho, não mais.

**O item 27 provavelmente já está pronto.** `selectionConfig.countLabel` existe desde a
v0.69.0. Ver T4: vira pergunta ao Sólis, não tarefa.


**O item 2b ("`number` deveria abrir em `between`") é C, não B** — classificado errado na
análise. `defaultOperatorForFilterType` (`utils/filter-ops.ts:88`) devolve
`def.operators?.[0]`, o **primeiro operador declarado pelo tipo**. Mudar o default do `number`
significa reordenar esse array, o que muda:

- o operador inicial do chip (`data-table.tsx:848`)
- o operador do atalho do cabeçalho (`data-table.tsx:664`)
- o operador do drawer (`toolbar-simple-filter-drawer.tsx:126`)
- **a ordem do dropdown de operadores do builder avançado**

Quatro comportamentos visíveis em todo projeto, a partir de uma linha. Vai para o escanteio
junto dos outros C.
