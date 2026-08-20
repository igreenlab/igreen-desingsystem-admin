# Backlog de features — iGreen DS

> Atualizar sempre que criar, concluir ou descartar uma feature.
> Última revisão: 2026-08-19

---

## 🔇 Aviso de DEV não sobrevive ao pacote npm — exige build dev/prod (achado 2026-08-19)

> **Não é defeito de componente, e não é regressão.** É uma propriedade do canal npm que vale
> registrar porque decide o desenho de todo aviso futuro.

**Medido no tarball publicado da v0.43.1:** `src/components/` tem **26** `console.warn`;
**2** sobrevivem no bundle. Os que somem são os guardados por `import.meta.env?.DEV` —
**o nosso** build resolve isso pra `false` e o bloco inteiro é eliminado:

| aviso | guard | npm |
|---|---|---|
| `TableToolbarViews` — visão engolida por `maxTabs` | `import.meta.env?.DEV` | ❌ sumiu |
| `columnTypeRegistry` — type não registrado | `import.meta.env?.DEV` | ❌ sumiu |
| `DataList` — `virtualized` + `enableDnD` | `import.meta.env?.DEV` | ❌ sumiu |
| `columnTypeRegistry` — type duplicado | sem guard | ✅ |
| `DataTable` — saved-views mock em produção | `MODE === "production"` (avisa **em** prod) | ✅ |

**Por que os outros 3 canais não sofrem:** copy-in/registry, scaffold e submódulo entregam o
**`.tsx` fonte**, então quem resolve `import.meta.env.DEV` é o build do consumidor — o aviso
dispara no dev dele. O canal primário do DS é copy-in, e foi por submódulo que o dogfood
encontrou o defeito que gerou o aviso. Ou seja: **funciona onde importa.**

**Trocar o guard por `process.env.NODE_ENV` NÃO resolve** — o Vite substitui esse pattern no
build de lib do mesmo jeito (conferido: o bundle publicado não tem uma única ocorrência de
`process.env`). As saídas reais são duas, ambas com custo de infra:

  (a) **dois outputs** (`index.development.mjs` / `index.production.mjs` + `exports` condicional)
      — é o que o React faz; dobra o build e o tamanho do tarball, que já é um item deste backlog
  (b) **expressão que o bundler não reconhece** (`globalThis.process?.env?.NODE_ENV`) — 1 linha
      por site, mas o código do aviso passa a viajar no bundle de produção do consumidor, e
      precisa ser verificado empiricamente contra o nosso build antes de valer

**Enquanto não houver decisão:** aviso de DEV é ferramenta dos canais de fonte. Se um aviso
precisar alcançar o consumidor de npm, ele **não pode** ser dev-only — ou é erro de verdade
(throw / estado de erro no componente), ou não existe.

**O que já foi feito:** a página do showcase (única superfície pública que um consumidor de npm
leria) passou a qualificar em quais canais o aviso vale. Os `USAGE.md` **não** viajam no pacote
(`files` do `package.json` não os inclui), então lá a afirmação é lida só por quem compila a
fonte — e para esses ela é verdadeira.

---

## ✅ Clamp de viewport — FECHADO em 2026-08-19, e não como estava escrito

> **O item nomeava os dois arquivos errados, e o defeito real estava num terceiro.** Ele dizia
> "FloatingPanel e DropdownMenu"; a varredura mostrou que os remendos manuais do mesmo clamp
> estão em **3 usos de `Popover`** (`header-messages`, `header-notifications`,
> `toolbar-settings-menu`) + o `hdDropdown` do Header, que é um dropdown na unha, não Radix.
> O `dropdown-menu.tsx` não tinha remendo nenhum.
>
> **E os remendos são INERTES — medido, não deduzido.** Eles são `max-w-[calc(100vw-32px)]` em
> painéis de 380px e 320px, então só passariam a valer abaixo de 412px e 352px de viewport. Isso
> é abaixo do `md`, onde o `max-md:max-w-none` do próprio popover ganha o cascade — conferido no
> browser com a combinação real de classes: a `max-width` resolvida é `none`. Acima do `md`,
> `100vw-32` em 768 dá 736px, que nunca limita 320/380. **Nem ajudam nem atrapalham.**
> Sozinhos, seriam candidatos a remoção; ficaram porque documentam a intenção e custam zero.
>
> Conclusão: **não** levar o clamp pro `popover.tsx` nem pro `dropdown-menu.tsx`. Radix já resolve
> o caso comum (colisão de borda) reposicionando, e abaixo do `md` os dois viram sheet full-width.
>
> **O defeito real estava no `FloatingPanel`, com props DEFAULT.** `side="right"` ancora a 24px da
> borda e `resizableMaxWidth` default é **800** → 824px de necessidade. Em qualquer janela entre
> 768 e 824 (≥md, então sem sheet mobile) a borda esquerda saía da tela. O `min`/`max` do hook de
> resize é em pixel e cego à viewport. Reproduzido e consertado, medido a 800px de viewport:
>
>     sem clamp:  largura 800 · esquerda **-24** · estoura ✗
>     com clamp:  largura 752 · esquerda  24 · direita 776 · simétrico ✓
>
> Conserto: `md:max-w-[calc(100vw-48px)]` no root — 48 = os mesmos 24px de gutter dos dois lados,
> igual ao que o `Panel` irmão já usava. Não regride: `max-width` só age quando já estouraria.
>
> **Isto FECHA a pergunta que o registro original deixou aberta, e não a contradiz.** Ele mediu
> viewport 800 com o preset **XL de 720px** — que cabe exato (720+24+56=800) — e disse com todas as
> letras que o caso a demonstrar era o **redimensionado**, com largura vinda de `style={{ width }}`
> inline, e que não conseguiu exercitar esse estado. É exatamente esse estado que a medição de 19/08
> exercita: largura inline de **800px**, o `resizableMaxWidth` default. Duas medições corretas em
> larguras diferentes, não uma contradição.
>
> ⚠️ **E o meu -24px NÃO é o vazamento fantasma que aquele registro avisa.** Lá o artefato vinha da
> animação de entrada presa no `translateX(48px)` inicial, porque `document.timeline.currentTime`
> fica em 0 no browser automatizado. A sonda de 19/08 **não tem classe de animação nenhuma** — é um
> `div` construído só com posicionamento e largura, sem `animate-in`. E o valor medido bate com a
> aritmética exata: `right: 24px` + `width: 800px` numa viewport de 800 põe a borda esquerda em
> `800 − 24 − 800 = −24`. Número previsto antes de medir, e confirmado pela medição.

**Registro original (2026-08-18), mantido pelo que ele preserva da branch apagada:**

### 🪟 (registro original) Clamp de viewport em FloatingPanel e DropdownMenu — branch apagada, 2026-08-18

> **Não é defeito confirmado.** É uma defesa que existia numa branch não-mergeada
> (`feat/finance-experiments`, PR #11 fechada em jun/2026) e que se perderia com ela. Registrado
> aqui pra que a informação sobreviva à limpeza das branches, não pra ser aplicado às cegas.

**O que a branch tinha** — 2 linhas, uma em cada arquivo:

```
src/components/ui/FloatingPanel/floating-panel.styles.ts
src/components/shadcn/dropdown-menu.tsx
    "max-w-[calc(100vw-32px)]"      // 16px de gutter simétrico em qualquer largura
```

**O raciocínio original** (do comentário da branch): acima do breakpoint `md` não há clamp
nenhum, então um painel de 720px numa viewport de 800px vazaria. A main cobre **abaixo** de
768px com o tratamento de bottom-sheet (`max-md:!w-auto` + `inset-x-0`), e a faixa acima fica
descoberta.

**O que eu MEDI, e por que não apliquei** (browser, viewport 800px, painel XL de 720px):

```
cssLeft 56px  +  width 720px  +  cssRight 24px  =  800px   → cabe EXATO, não vaza
max-width computado: none                                   → confirmado que não há clamp
```

Não consegui reproduzir vazamento. O caso onde o clamp importaria é o **redimensionado** — o
`FloatingPanel` é resizable e a largura vem de `style={{ width }}` inline, então uma largura
arrastada (ou um `initialWidth` grande vindo do consumidor) pode exceder `viewport - 80px`. Não
consegui exercitar esse estado: o override de largura não pegou no browser automatizado.

⚠️ **Limite do ambiente, que vale registrar pra próxima medição:** o
`document.timeline.currentTime` fica **em 0 e não avança** no browser automatizado — a animação
de entrada (`enter`, 220ms) nunca progride e o painel fica preso no `translateX(48px)` inicial.
Isso produz um "vazamento" de 24px que é **artefato, não defeito**: eu quase o reportei como
bug antes de conferir o timeline. Medição de posição animada precisa de browser real (L-064).

**Se algum dia for aplicar:** o clamp é **inerte** quando `width ≤ viewport − 32px`, então não
pode alterar nenhum caso que funciona hoje — é `max-width` sobre uma largura menor. O que falta
é demonstrar o caso que ele conserta, em browser real, com o painel redimensionado.

---

## 📦 Peso do pacote npm — o barrel raiz não tree-shake (adiado em 2026-08-08)

> Adiado **por decisão do mantenedor** na sessão da v0.37.2: primeiro garantir que os
> componentes estão sendo **usados corretamente**, melhoria depois — pra que qualquer
> melhoria escale naturalmente. Não é defeito de correção: nada quebra, nada muda de
> aparência. É custo de download.

**Medido em 2026-08-08** contra o pacote **publicado** `@snksergio/design-system@0.37.2`
(app Vite mínimo, `npm run build` com minificação e gzip do próprio Vite):

| o que o app importa | raw | **gzip** | sobre o baseline |
|---|---|---|---|
| nada (só React) — baseline | 190 kB | **59,9 kB** | — |
| `import { Button }` do barrel raiz | 5.556 kB | **1.427 kB** | **+1.367 kB** |
| `import { Icon }` do barrel raiz | 5.556 kB | **1.427 kB** | +1.367 kB |
| `import { Badge }` do subpath `/shadcn` | 605 kB | **180 kB** | +120 kB |

Dois fatos que essa tabela mostra:

1. **O barrel raiz custa o mesmo pra qualquer componente** — `Button` e `Icon` dão
   exatamente o mesmo byte count. O bundler do consumidor não consegue podar nada: quem
   importa 1 componente paga os 34.
2. **O subpath `/shadcn` (aberto na v0.37.0) funciona** — 180 kB contra 1.427 kB. Ou seja,
   a separação por entry **é** o mecanismo que resolve; o problema está concentrado no
   entry raiz.

**Hipóteses a testar** (nenhuma verificada — não implementei nem medi o "depois"):
`@__PURE__` nas chamadas de fábrica (`tv()`, `cva()`, `forwardRef`), atribuição de
`displayName` fora do módulo (é efeito colateral e ancora o módulo inteiro), e um subpath
`./icons` — o `lucide-react` já é `external`, então o custo dos ícones aqui é do mapa de
nomes do `Icon`, não do pacote de ícones.

**Reabrir quando:** algum consumidor reclamar de tempo de carregamento, ou antes de o DS
ser usado numa tela pública/landing (num admin autenticado 1,4 MB gzip cacheado dói bem
menos). **Ao reabrir:** medir o "antes" com este mesmo método — app mínimo contra o pacote
**publicado**, nunca contra o `dist-lib` local (L-065).

## 🗑️ Consistência dos scrims — DESCARTADO em 2026-08-19

> **Decisão do mantenedor:** *"já que é só overlay e hoje já funciona, pode ser ignorado — não é
> algo estrutural ou de grande importância."*
>
> A razão fecha com o que o próprio item já dizia: reabrir exige gate com print antes/depois **de
> cada** overlay afetado, porque 0.30 → 0.55 escurece e 0.80 → 0.55 clareia. Custo de revisão
> visual alto, entrega estética. Fica registrado — se alguém for uniformizar scrim algum dia, os
> três valores e a razão do descarte estão aqui.

**Registro original:**

### 🎨 (registro original) Consistência dos scrims — adiado em 2026-08-08

Os fundos escurecidos de overlay (`bg-black/30`, `bg-black/80`) estão na unha em alguns
flutuantes, enquanto existe o token `overlay.scrim` (0.55). São **três** valores diferentes
pro mesmo papel. Adiado junto com o item acima e pela mesma razão — é melhoria visual, e a
regra da sessão foi **não mexer no visual** enquanto o showcase é a referência aprovada.

**Ao reabrir:** é mudança visual real (0.30 → 0.55 escurece; 0.80 → 0.55 clareia), então
passa por gate com print antes/depois de cada overlay afetado, não por "alinhamento de
token" silencioso.

---

## ✅ `alert-dialog` sem DocPage — FECHADO em 2026-08-19

> **Estava vencido e ninguém riscou.** O `AlertDialogDoc.tsx` nasceu em **2026-08-12** (4 dias
> depois deste registro), com rota no `App.tsx`, `DOC_PAGES` e `doc-nav-data.ts` — o gate
> `showcase-registration` já passava verde. Mas **a 4ª peça listada no "Ao fazer" abaixo tinha
> mesmo ficado atrás**: não havia card no `ComponentsOverviewDoc`. Adicionado agora, então o
> item fecha de verdade, não por errata.
>
> **O que a revisita achou de novo, e não estava aqui:** o exemplo canônico da própria DocPage
> renderizava os botões na largura do texto, encostados à esquerda — o oposto do desenho. Não
> era o exemplo: o `AlertDialogFooter` não esticava os filhos no `sm+` (`items-stretch` age no
> eixo cruzado, não no principal), e o `AlertModal` compensava passando `fullWidth` em cada
> Button. A opinião passou pro primitivo (`sm:[&>*]:flex-1`), então montar um alert dialog na
> mão sai certo sem ninguém lembrar do `fullWidth`. Mesma família do defeito da coluna de
> ações: **o exemplo canônico ensinava o contrário da regra.**

**Registro original (2026-08-08), mantido pelo que ele documenta sobre o congelamento visual:**

Medido na auditoria: dos **75** componentes do `registry.json`, 74 têm rota de showcase.
`alert-dialog` tem **zero** — `grep '"alert-dialog"' src/App.tsx src/preview/components/doc-nav-data.ts`
devolve 0 nos dois.

**Não é órfão de verdade**, e por isso não virou correção nesta rodada:

- está no **vocabulário do consumidor** (`_claude/rules/ds-components.md:89` — "diálogo cru,
  sem o chrome do DS: `dialog` · `alert-dialog`"), que é o que a IA do consumidor lê;
- é **dependência declarada** do `alert-modal` (`registryDependencies: ["@igreen/tv",
  "@igreen/button", "@igreen/alert-dialog"]`), então chega junto por `igreen:add alert-modal`;
- ninguém mais depende dele.

**Por que não fiz agora:** criar DocPage é **conteúdo visual novo**, e a rodada de 2026-08-08
está sob congelamento visual explícito do mantenedor. Também não adicionei card no
`ComponentsOverviewDoc` — card apontando pra rota inexistente é pior que ausência.

**Reabrir quando:** alguém for consumir `alert-dialog` direto (sem o `AlertModal`), ou na
próxima rodada em que mudança visual estiver liberada. **Ao fazer:** `AlertDialogDoc.tsx` +
`App.tsx` (import + `DOC_PAGES` + render) + `doc-nav-data.ts` + card no
`ComponentsOverviewDoc` — as 4 peças da superfície 4.

---

## 🔭 Roadmap de escala da distribuição (auditoria 2026-06-18)

> NÃO são pendências/defeitos — são decisões de escala conscientemente adiadas.
> Hoje (1 mantenedor, poucos consumidores) não valem o custo. Reabrir nos gatilhos.

- **Multi-token / rotação no registry** (`registry-app/app/r/[name]/route.ts`): hoje 1
  Bearer único compartilhado. Suportar `IGREEN_TOKENS` (lista CSV) permite revogar/rotacionar
  **por consumidor** sem quebrar os outros.
  ✅ **A metade `crypto.timingSafeEqual` JÁ FOI FEITA** (conferido em 19/08: `route.ts:12`, com
  hash antes da comparação porque `timingSafeEqual` dá throw em tamanhos diferentes e o
  early-return seria ele mesmo um oráculo). Falta só a lista CSV.
  **Reabrir quando:** houver ≥2–3 consumidores externos com o token, ou exigência de auditoria/rotação.
- **Versão histórica por-componente** no registry (endpoints `/r/v0.10/<item>.json` +
  `components.json` pinado): hoje versão é global e rollback é via Git do consumidor.
  **Reabrir quando:** ≥3 consumidores com cadências divergentes E necessidade de re-puxar
  rev antiga direto do registry (não só via Git).
- **`example-showcase`** (extrair `ShowcasePageV2`): galeria de cards/blocos avulsos.
  Decisão atual: **coberto pela skill `cards`** (guia de composição) — não vira example
  de tela (é galeria, não tela de produto). **Reabrir se:** quiserem o gallery navegável
  no menu do scaffold como referência.

---

## 🔧 Refinamentos identificados (sessão 2026-07-09)

> Itens que já funcionam de forma inicial/robusta mas precisam de mais uma rodada
> antes de considerar "fechados". Levantados ao revisar o artigo público sobre o DS
> — não são bugs, são lacunas conscientes a fechar quando houver tempo.

- ✅ **FECHADO (verificado em 2026-08-19): o gate de CI bloqueante existe.** O "próximo passo"
  descrito abaixo — *transformar os greps L-001..L-007 num check de CI que bloqueia* — é hoje o
  `scripts/lint-styles.mjs --ratchet` no `ci.yml`, rodando contra a base ref e reprovando
  violação **nova** (linha adicionada pelo diff). É step falhado de verdade, não
  `continue-on-error` — o único `continue-on-error` do workflow está em outro step. Além dele
  entraram **34 módulos de gate** no `npm test`, que roda em toda PR contra qualquer base. Duas
  ressalvas que continuam valendo: L-004 e L-007 ficaram **de fora de propósito** (exigem
  contexto cross-elemento ou julgamento de intenção — medido, davam 51 hits com 50 de ruído,
  L-059), e débito **legado** é congelado pelo ratchet em vez de reprovado. Texto original abaixo,
  pelo que ele registra do estado de julho:

- **Review de terceiros / enforcement de PR não é 100% fechado.** O pipeline de
  agentes (designer → gate → dev → reviewer) é robusto pro fluxo guiado por IA
  (usado nesta sessão pra token `stat`, builders, etc.), mas os hooks automáticos
  (`ds-lint-styles.sh`, `ds-inventory-check.sh`, `ds-tokens-check.sh`) são **só
  informativos** — sinalizam em stderr, não bloqueiam o Edit nem o merge. Um
  dev externo abrindo PR sem passar pela sessão de IA orquestrada não tem hoje
  um gate de CI que impeça automaticamente um merge fora do padrão — depende de
  humano/IA revisando de fato antes de aprovar. **Próximo passo:** avaliar
  transformar os greps L-001..L-007 num check de CI que bloqueia (não só avisa),
  pelo menos pros arquivos mais sensíveis (`*.styles.ts`, tokens).

- **Blocks com código de referência (`DSGREEN-B-###`/`DSGREEN-U-###`) — arquitetura
  desenhada, nada implementado.** Toda a arquitetura foi projetada em sessão de
  plan mode (esquema do código, catálogo `blocks-catalog.json` derivado do
  `registry.json`, resolução determinística via skill `ds-kit` Passo 0, adoção de
  `registry:block` sem renomear os `example-*`, rollout em 5 fases). Só ficou como
  plano, num arquivo local **fora do repo**.

  ⛔ **O plano NÃO EXISTE MAIS — verificado em 2026-08-19.** O caminho que este item citava
  (`~/.claude/plans/mossy-wishing-sunset.md`) não está lá; a pasta tem um único plano, de outro
  assunto. E `DSGREEN` não aparece em nenhum arquivo do repo além desta linha. Ou seja: **o que
  sobreviveu do desenho são as 8 linhas acima**, não o esquema, não o `blocks-catalog.json`, não
  as 5 fases. O "próximo passo" que estava escrito aqui — *"revisitar esse plano"* — era
  inexecutável, e apontar pra ele fazia o item parecer mais pronto do que está.

  ✅ **REDESENHADO em 2026-08-19 → [`.ai/specs/blocks-catalogo-de-composicoes.md`](../specs/blocks-catalogo-de-composicoes.md)**,
  status `PROPOSTA`, aguardando avaliação do mantenedor. O redesenho não resgatou o plano perdido —
  partiu do problema (a IA conhece componente e token, não conhece **composição**) e da medição do
  que já existe: os 34 cards do `#/chart-showcase` já são blocos quase auto-contidos, e o `type` do
  registry é etiqueta que ninguém lê. **Lição que fica:** decisão de arquitetura guardada só em
  `~/.claude/plans/` não sobrevive — ou entra em `.ai/specs/`, ou não existe.

---

## ✅ Padronização DataTable + TableToolbar ("AMPLO") — CONCLUÍDA (2026-06-09)

> Origem: auditoria pré-PR de 2026-06-09 (5 revisores). Executada nas Frentes A/B/D/E
> (PRs #15–#18) + auditoria profunda (PRs #19–#22). Todas mergeadas.

**Filtros / operadores (débito de fundo do bug "É"):** ✅ FEITO (PR1 #19 + PR3 #21)
- ✅ Vocabulário de operador único (ids longos) ponta a ponta — `utils/operator-mapping.ts` DELETADO.
- ✅ Label de operador pelo registry (`opLabel`), DEFAULT_OP_LABELS só fallback.
- ✅ `promoteOperatorForColumn` extraído pra `utils/filter-ops.ts` (era triplicado).
- ✅ `gte`/`lte` implementados em number/currency/percentage/date/datetime + parser.
- ✅ `utils/filter-ops.ts`: `genFilterId` + `filterValueIsEmpty` consolidados (eram 4×/3×).

**column-types:** ✅ PARCIAL
- ✅ `_shared.ts` com `toNumber`/date helpers/`resolveChipColor` (PR B) — dedup feito.
- ⏭️ Factories `makeTextColumnType`/`makeSelectColumnType`: NÃO feitas (premature abstraction —
  text/email/phone/url têm diferenças reais de normalize/operators/renderCell; o dedup real
  eram os helpers idênticos, já capturados pelo `_shared`).

**data-table.tsx (slim — Frente C):** ⏭️ AVALIADA E NÃO FEITA. Pós-Frente D o
arquivo caiu pra ~1.400 LOC e o resto é complexidade essencial de orquestrador.
`useExportMenuItems` virou moot (triplicação era das cópias deprecadas, removidas
na D). Extrair `DataTableBody`/toolbar JSX exigiria prop-drilling de 25+ deps (ou
expor 25+ valores no Provider) — net-negativo (relocaliza complexidade + indireção).
`enhancedAppliedFilters` poderia ir pro adapter mas acopla state de UI; ganho modesto.
**Conclusão:** não splitar mecanicamente. Reabrir só se a complexidade essencial crescer.

**Hooks (naming/consistência — Frente E):** ✅ FEITO — `*Return`→`*Result`,
`exportHook`→`exporter`, return types explícitos + fronteira standalone documentada
nos `useToolbar*`. `useCallback`/rename `handle*` dos adapters NÃO feito (BAIXA no
audit — popovers não são hot path; churn alto, valor marginal).

**Toolbar Deprecated:** ✅ FEITO (Frente D) — `TableToolbarDeprecated/` + branch
`deprecatedToolbar` + DocPage removidos. ~1.700 LOC dup eliminadas.

**Infra (repo-wide, separado):**
- Line endings: repo é CRLF-wide (412 arquivos); `core.autocrlf=true` normaliza no commit,
  então NÃO é problema de PR — mas considerar `.gitattributes` (`* text=auto eol=lf`) +
  renormalização repo-wide num PR de infra próprio.

**Menores:** `group-rows.ts` key colide valores não-primitivos; `viewNameToString` helper (coerção
`String(name)` em 4 lugares); tokens de altura na Table (`h-[40px/56px/64px/42px]` → cascata DS Designer);
`owner`/`ownerName` no tipo `SavedView` (hoje injetado fora do tipo).

---

## ✅ Implementado

### 3 cenários de criação de componente
- `add-shadcn-component.md`, `create-component.md`, `create-composite.md`
- Entry points finos que delegam para skills

### Pipeline com gate de aprovação
- Gate obrigatório para tokens novos e componentes novos
- `orchestrator.md` gerencia gate, cascata e rollback

### `.claude/rules/` carregada automaticamente
- `ds-standards.md` com regras + lições + dark mode + Radix

### Skills segregadas por agente (~70% redução de contexto por tarefa)
- `ds-designer/` — 7 arquivos: color/spacing/sizing/typography/component-spec/figma + SKILL.md router
- `ds-dev/` — 5 arquivos: token/shadcn/igreen/composite + SKILL.md router
- `ds-reviewer/` — 2 arquivos: SKILL.md (checklist token) + component.md (grep)
- `app-designer/` — 🚧 estruturado (aguardando app)
- `app-dev-react/` — 🚧 estruturado (aguardando app)
- Skills deprecated: igreen-component, igreen-token, igreen-reviewer-guard

### lessons.md — auto-aprendizado
- 14 lições (L-001 a L-014) cobrindo ring, Tailwind literal, dark mode, Radix

### Shadcn instalado — 21 componentes
- 20 Shadcn + Button iGreen · `component-inventory.md` atualizado

### Domínio App estruturado
- `app-designer.md`, `app-dev-react.md` como 🚧 aguardando
- `shared-app-context.md` com estrutura e cascata cross-domínio

### Observabilidade — pipeline-state.md funcional
- Formato de audit log append-only com 3 tipos de entrada
- CONCLUÍDO · PAUSADO (gate) · CASCATA com campo "Retomar"
- Agentes DS Dev e DS Reviewer com instrução obrigatória de escrita

### Sync script agentes → Cursor ✅
- `.claude/scripts/sync-agents-to-cursor.js`
- `package.json` com `"sync:agents"` script
- Mirrors Cursor sincronizados (4 agentes DS)

### Teste em produção real — primeira tela funcional ✅ (superada, v0.24–v0.29)
- Não veio como 1 tela isolada do app desktop — veio como **conjunto de exemplos
  canônicos** (`src/examples/*`: clientes, finance, mapa-rede, login, app-shell,
  edit-page, order-detail, dashboard, chat) extraídos 1:1 dos showcases e validados
  via `tools/consumer-demo/` + distribuídos no registry. Critério original (aprovado
  sem lição nova) não foi rastreado formalmente, mas nenhuma lição L-0xx recente
  aponta pra gap estrutural de token/componente vindo desses exemplos.

### FormField — composto prioritário ✅
- Entregue em `ui/FormField/` (`FormField` + `FormFieldInput`/`Select`/`Textarea`),
  registrado no inventory e distribuído no registry.

### pipeline-state.md — validado em uso real ✅
- Centenas de entradas CONCLUÍDO/APROVADO/PAUSADO/CASCATA desde 2026-04. Único ponto
  fraco: sessões de 2026-06-19 a 2026-07-28 rodaram sem registro em tempo real —
  consolidadas retroativamente em 2026-07-29 (ver `pipeline-state.md`, entrada
  "Consolidação de releases v0.11.0 → v0.30.0").

### DataTable ✅ (muito além do escopo original)
- Não foi só sorting/pagination/row-selection — evoluiu pra view Lista/Kanban/árvore,
  autoFit, saved views read-only, grab-to-scroll nativo, coluna `copyable`, export,
  filtros por column-type. Ver `✅ Padronização DataTable + TableToolbar` acima.

### Templates de arquitetura ✅ — os 3 builders saíram
- `/ds-create-crud` (2026-06-10), `/ds-create-list` e `/ds-create-dashboard` (v0.24.0,
  receita `dashboard-patterns.md`) + front-door `/ds-create-screen` (desambigua
  tabela/lista/dashboard). Pendência antiga de "copiar pro `cli/templates/default/.claude/`"
  **resolvida** — o template já embute os 3 builders + `ds-kit` em
  `cli/templates/default/_claude/skills/`.
- `/create-page`, `/create-feature`, `/create-hook` — ainda não abertos; não bloqueantes.

### Toast / Sonner · Tooltip · Popover · Command/Combobox ✅
- Todos os 41 componentes shadcn do inventory (incl. os 4 acima) estão `✅ implementado`
  e distribuídos.

### Kit de telas do app — lado DS (v0.26.0–v0.29.0) ✅
- `ds-link` (consumo via submódulo git, projeta `.claude/` pro repo pai) · `module-replicator`
  (`/ds-replicate-module`) · `screen-composer` (master-detail/cross-filter) · `app-builder-shell`
  (`/ds-create-app` + `example-app-shell`) · `auth-builder` (variantes de painel de login).
  **Escopo**: infra de exemplos/skills reutilizáveis do lado DS — não é o Domínio App
  (`app-designer`/`app-dev-react`), que segue 🚧 aguardando.

### Multi-tema por marca (v0.18.0) ✅
- Atributo `data-theme` + temas `blue`/`green`/`pay` via overlay de cor (`to-brand-overlay.ts`,
  só o diff contra `default`) + seletor no `create` do CLI.

### ChoroplethMap ✅ (com incidente fechado)
- Sumiu da `main` num merge de reorganização anterior sem nenhum sinal disparar (L-058);
  restaurado, deps (`d3-geo`/`topojson-client`) declaradas, 7 superfícies fechadas,
  distribuído no registry.

---

## 🟢 Modelo estável em produção

### Pixel Agents
- Extensão VS Code para monitorar sessões Claude Code em tempo real
- github.com/pablodelucca/pixel-agents — gratuita no marketplace

### Claude Code agent-memory nativo
- O campo `memory: user` nos frontmatters já está configurado
- Explorar agent-memory nativo para complementar o `lessons.md` manual

### Builder visual com ReactFlow
- iGreen DS como produto replicável para outros times

---

## 🗑️ Descartadas

| Feature | Motivo |
|---------|--------|
| claw-code | Problema diferente |
| opensquad como framework | Squads dinâmicos vs fixos |
| Responsive tokens | Responsividade no componente, não no token |
| Fluid typography universal | clamp() só ≥ 32px tem ganho real |
| Diretórios não-versionados na árvore (347 MB → 140 MB) | Nunca foi débito de código — é disco local, tudo gitignorado. O `design-tabela/` (207 MB) o mantenedor já apagou; o `my-app/` (140 MB, sandbox do dogfood) ele apaga na mão quando fechar os serviços abertos. Sobram 856 KB de PNG em `.ai/scratch/`, irrelevantes. Saiu do backlog em 2026-08-19 por decisão dele: rastrear limpeza de disco aqui só produz item que ninguém fecha. ⚠️ Se for reusar o `my-app/` pra validar algo, **regere** — em 19/08 estava 31 arquivos defasado do payload |
