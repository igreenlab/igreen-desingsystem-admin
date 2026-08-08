---
description: Regras do iGreen DS — comportamento, anti-patterns, 67 lições, dark mode, Radix, multi-marca. Entra como project instruction em TODA sessão do repo, sem escopo por pasta.
---

# iGreen DS — Regras essenciais

> **Carregamento (verificado em 2026-08-08, não presumido).** Todo `.md` de
> `.claude/rules/` é entregue ao agente como **project instruction**, junto do
> `CLAUDE.md`, na sessão inteira — não há ação a tomar, e não há escopo por pasta.
>
> O frontmatter tinha um bloco `globs:` (`src/components/**`, `tokens/**`, `.ai/**`…)
> que é sintaxe do **Cursor** e era **inerte** aqui. Removido porque descrevia um
> mecanismo de escopo que não existe — e pior, um escopo que teria deixado de fora
> justamente `src/preview/**` (onde os builders escrevem) e as skills não-`ds-*`
> (`crud-builder`, `list-builder`, `dashboard-builder`, `brand-builder`, …). Quem
> lesse o frontmatter concluiria que estas regras não valem ao gerar uma tela.
>
> **Consequência prática:** este arquivo custa contexto em 100% das sessões. Ao
> acrescentar seção, prefira 1 linha + ponteiro pro `.ai/` a 30 linhas de detalhe.

Fonte única de regras para sessões DS. Resumo executivo + lições + anti-patterns + dark mode + Radix. Para referência longa do padrão tv() completo: `.ai/rules/coding-standards.md`.

---

## ⛔ Regras de comportamento (8)

1. **NUNCA** criar token sem verificar se já existe em `.ai/context/tokens/`
2. **NUNCA** criar componente sem verificar `.ai/context/components/inventory.md`
3. DS Dev **NUNCA** cria token inline → **PARAR** → sinalizar cascata ao Orchestrator
4. **Gate obrigatório** para tokens novos e componentes novos (sem exceção)
5. Classes DS sempre antes de Tailwind literal
6. Self-interrupt: "estou criando algo novo?" → verificar primeiro
7. **Gate de pre-commit obrigatório** antes de commit significativo (release, refactor amplo, token novo, componente novo, lição nova) → invocar `ds-reviewer/pre-commit-check.md`
8. **Handoff via PR sempre (L-041)** — TODO trabalho de componente (criar/alterar) ou mudança significativa termina, sem exceção, com: **branch própria** → **commit descritivo** (o quê + por quê, não deixar a diff falar sozinha) → **push no `empresa`** (remote canônico = `igreenlab/igreen-desingsystem-admin`; `origin` é fork pessoal parado) → **`gh pr create`** → **reportar o link do PR pro gate humano**. Nunca commitar direto em `main`. Distribuição (registry.json + embed + bump) **não** vai por-PR-de-componente — consolida no `/ds-release` ao fechar o conjunto (anotar no PR body que falta registrar).

   **⚠️ Onde a IA para — a linha é o MERGE, não o push:**

   | A IA faz sozinha | A IA NUNCA faz sozinha (exige autorização explícita na mesma sessão — L-020) |
   |---|---|
   | branch · commit · push da **branch** · abrir PR | merge · `npm publish` · bump de `package.json.version` · deploy · `git push` em `main` · force-push |

   Até 2026-08-08 o `CLAUDE.md` (também auto-carregado) dizia *"NUNCA dê `git push` … sozinho → pare e peça"*, contradizendo esta regra frontalmente. A intenção original era proteger **publicação**, não o push da branch de trabalho — que é justamente o que produz o PR onde o humano decide. Os dois arquivos agora dizem a mesma coisa, com a mesma numeração de 1 a 8.

---

## Mecanismos do pipeline

### Gate com perspectiva Strategist

Toda spec do DS Designer deve incluir:

- **Alternativas descartadas** — o que foi considerado e por que não serve
- **Assumption central** — o que precisa ser verdade pra decisão funcionar

Orchestrator usa esses campos no gate. Reviewer verifica assumption após implementação.

### Critique genuína (DS Reviewer)

Após checklist: _"Esta revisão encontrou algo que muda direção — ou apenas confirmou?"_
Se apenas confirmou → examinar assumption do gate antes de aprovar.

### Campo Assumption no pipeline-state.md

Toda entrada CONCLUÍDO, APROVADO e PAUSADO (gate) inclui `Assumption`. Torna decisões reversíveis — quando um problema aparecer, você sabe qual assumption quebrou.

### Cascata (token faltante)

Dev encontra token inexistente → PARAR → sinalizar Orchestrator → registrar PAUSADO em pipeline-state → Designer cria token (gate) → retomar implementação.

### Hooks automáticos (autonomia do pipeline)

Três hooks PostToolUse rodam sem intervenção quando Claude edita arquivos. Eles fecham os loops das lições mais comuns sem depender de invocação manual de DS Reviewer:

| Hook                    | Trigger                                            | O que faz                                                                                                                                                                                                                                                                                                                      |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `ds-lint-styles.sh`     | Edit/Write em `src/components/**/*styles.{ts,tsx}` | Delega pra `scripts/lib/ds-lint-patterns.mjs` (fonte única com o CI) — cobre L-001/L-002/L-003/L-005 + import de tv. L-004 e L-007 saíram (semânticas: exigem contexto cross-elemento ou julgamento de intenção — L-059). Warning em stderr — não bloqueia, mas Claude vê. No CI o mesmo módulo roda em modo ratchet e só reprova violação **nova** (linha adicionada pelo diff), nunca débito legado                                                                                                                                                  |
| `ds-inventory-check.sh` | Edit/Write em `src/components/ui/<Nome>/**`        | Alerta se USAGE.md ausente, se não consta no `inventory.md` (L-016), se não consta em `registry.json` (não será distribuído), se está no registry mas **fora do vocabulário do consumidor** (`cli/templates/default/_claude/rules/ds-components.md` ∪ o `CLAUDE.md` do template — a MESMA união que o `distribution-debt.mjs` mede), ou se a **DocPage existe mas não está roteada** no `App.tsx`/`DOC_PAGES`+nav (render em branco) — L-042. Exceção deliberada e "showcase registrado" vêm dos MESMOS módulos puros que o CI usa (`ds-exceptions.mjs` + `showcase-registration.mjs`, uma chamada `node -e`) — nunca reimplemente essas regras no shell; fail-open (probe caído → eixo pulado, `exit 0` sempre) |
| `ds-tokens-check.sh`    | Edit/Write em `tokens/**/*.ts`                     | Alerta pra rodar `tokens:tw4` + lembra que token novo só chega no consumidor via `registry:build` + bump (`/ds-release`). Tokens/theme versionados pelo stamp = `package.json.version`                                                                                                                                         |

Logs em `.ai/scratch/hook-log.txt`. Bloqueio só acontece em `block-rm-rf.sh` (Bash perigoso) e `block-sensitive-edit.sh` (.env, credentials, migrations) — os hooks DS são informativos por design.

⛔ **Não existe formatador automático, por decisão (2026-07-29).** `prettier` nunca esteve no
`package.json`, então o antigo `format-on-save.sh` (`npx --no-install prettier`) era no-op — mas
**ligaria sozinho** se alguém populasse o cache do npx, reformatando arquivo sem pedido (aconteceu
uma vez, mutilando pseudo-código de uma skill). Hook e script removidos. **Formate na mão**,
espelhando o código vizinho. Toda doc que dizia "o hook formata" foi corrigida — se você encontrar
alguma sobra afirmando isso, é bug de doc.

### Auto-review na release (`/ds-release`)

Passo 1.5 do skill `ds-dev/release.md` roda o auto-review do diff completo desde a última entry antes de propor bump. Violação encontrada → aparece no preview do gate; usuário decide se corrige antes, aceita débito ou cancela.

---

## Skills por tarefa

| Agente      | Tarefa                                                                        | Skill                                                |
| ----------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| DS Designer | cor / dark mode                                                               | `spec-token.md` (args `tipo=color`)                  |
| DS Designer | spacing / gap / pad                                                           | `spec-token.md` (args `tipo=spacing`)                |
| DS Designer | sizing / radius / shadow                                                      | `spec-token.md` (args `tipo=sizing\|radius\|shadow`) |
| DS Designer | tipografia                                                                    | `spec-token.md` (args `tipo=typography`)             |
| —           | **marca / tema de cor novo** (overlay `[data-theme]`)                         | `brand-builder/SKILL.md` via `/ds-create-brand`      |
| DS Designer | componente novo                                                               | `spec-component.md`                                  |
| DS Designer | extração Figma                                                                | `figma-extract.md`                                   |
| DS Dev      | implementar token                                                             | `impl-token.md`                                      |
| DS Dev      | componente Shadcn                                                             | `impl-shadcn.md`                                     |
| DS Dev      | componente iGreen (tv())                                                      | `impl-igreen.md`                                     |
| DS Dev      | componente composto                                                           | `impl-composite.md`                                  |
| DS Reviewer | revisar token                                                                 | `ds-reviewer/SKILL.md`                               |
| DS Reviewer | revisar componente                                                            | `review-component.md`                                |
| DS Reviewer | gate pre-commit amplo (antes de release / refactor / token / componente novo) | `pre-commit-check.md`                                |
| DS Dev      | atualizar Updates timeline                                                    | `update-changelog.md`                                |
| DS Dev      | release completa (changelog + bump + commit + PR)                             | `release.md`                                         |
| —           | tela CRUD/tabela consumindo DataTable (entrevista guiada)                     | `crud-builder/SKILL.md` via `/ds-create-crud`        |
| —           | tela lista de cards consumindo DataList (entrevista guiada)                   | `list-builder/SKILL.md` via `/ds-create-list`        |
| —           | tela dashboard/painel (KPIs + gráficos + rankings/resumos) — entrevista guiada | `dashboard-builder/SKILL.md` via `/ds-create-dashboard` |
| —           | tela de dados sem saber se é tabela, lista ou dashboard (desambigua + roteia) | front-door `/ds-create-screen`                       |

Path base: `.claude/skills/<agent>/<skill>`. Skills de pipeline sem agente
(`brand-builder`, `crud-builder`, `list-builder`, `dashboard-builder`, `igreen-frontend`, `igreen-page`) vivem direto em
`.claude/skills/<nome>/`.

### DoD — nova skill/command builder (L-047)

Criar os `.md` da skill NÃO basta. Uma skill builder nova toca **4 superfícies de
roteamento** — preveja todas (o smoke test do list-builder pegou o orchestrator faltando):

1. **Skill** em `.claude/skills/<nome>/` (+ sub-arquivos do fluxo).
2. **Command(s)** em `.claude/commands/` (`/ds-create-<x>`) — entry point.
3. **Orchestrator** (`.claude/agents/orchestrator.md`) — linha na tabela de roteamento.
4. **Consumer** (se distribuída): `cli/templates/default/_claude/` (skill + command adaptados
   p/ copy-in) + `ds-kit/SKILL.md` (tabela de intenção) + bump CLI.

Depois: **smoke test** (invocar de verdade + checar os 4 pontos) antes de considerar pronta.

---

## Contexto sob demanda

| Tipo                                                | Localização                                  |
| --------------------------------------------------- | -------------------------------------------- |
| Tokens (color, spacing, sizing, typography, motion) | `.ai/context/tokens/*.md`                    |
| Inventário componentes                              | `.ai/context/components/inventory.md`        |
| Guia componentes                                    | `.ai/context/components/guide.md`            |
| Mapa Shadcn → tokens                                | `.ai/context/components/shadcn-token-map.md` |
| Arquitetura completa                                | `.ai/context/architecture.md`                |
| Padrão tv() detalhado                               | `.ai/rules/coding-standards.md`              |
| Audit log                                           | `.ai/status/pipeline-state.md`               |
| Lições completas                                    | `.ai/status/lessons.md`                      |
| USAGE por componente                                | `src/components/ui/<Nome>/USAGE.md`          |

---

## ⛔ O tema gerado é a FONTE ÚNICA dos 4 canais — `globals.css` não redeclara

`src/styles/theme/tailwind-theme.css` (gerado por `tokens/transforms/to-tailwind-v4.ts`) é o
**único arquivo que os 4 canais leem**. O `globals.css` é do **showcase apenas** — nada que
mora só nele chega em npm, submódulo ou copy-in.

Até 2026-08-07 o `globals.css` continha CSS de que os componentes distribuídos dependiam.
Custou 6 defeitos ao mesmo tempo (v0.35.0/0.36.0): `outline-float` ausente em **14
componentes**, bottom-sheet mobile sem regra, fonte Geist caindo em system-ui, `dark:` preso
ao SO, card escuro sobre fundo branco, scrollbar invisível em **16 usos**. Nenhum quebrou
build, `tsc` ou teste — o showcase mostrava tudo certo.

**Mora no tema gerado (NÃO redeclare no `globals.css`):**

| O quê | Emitido por |
|---|---|
| `@font-face` Geist + Geist Mono · `--font-sans` · `--font-mono` | `buildRuntimeBase()` |
| `@custom-variant dark (&:where(.dark, .dark *))` | `buildRuntimeBase()` |
| `html { font-family }` · regras de `body` · `@layer base { button { cursor } }` | `buildRuntimeBase()` |
| `@utility outline-float` (halo 6px dos flutuantes) | `buildFloatingUtilities()` |
| `[data-radix-popper-content-wrapper]:has(> [data-mobile-sheet])` (bottom-sheet <768px, z-60) | `buildFloatingUtilities()` |
| `@utility scrollbar-thin` / `scrollbar-default` | `buildScrollbarUtilities()` |

**Por que duplicar é pior que faltar:** classe sem layer vence `@utility`, e a **segunda**
declaração de `@custom-variant` vence a primeira. Redeclarar faz o showcase mostrar o
comportamento certo enquanto o consumidor recebe o errado — o defeito fica invisível
justamente no lugar onde a gente olha.

**Regra prática:** precisa de regra CSS global, `@utility`, `@font-face` ou variante nova?
→ edite `tokens/transforms/to-tailwind-v4.ts` e rode `npm run tokens:tw4`. Nunca o
`globals.css`.

**Gates:** `scripts/lib/shadcn-vocab.mjs` reprova vocabulário da bridge e paleta nativa do Tailwind em componente/exemplo/showcase; `scripts/lib/orphan-utilities.mjs` reprova `@utility` usada por componente e
ausente do tema; `scripts/lib/runtime-base.test.mjs` valida as 7 peças de runtime no tema,
a cópia do CLI idêntica à fonte, e **proíbe** o `globals.css` de redeclarar qualquer uma.

### O CSS gerado é COMMITADO — e desde 2026-08-08 existe gate pra isso

`tailwind-theme.css` + os 4 `brand-*.css` são gerados **e** commitados (são o export
publicado). O passo que regenera é manual, e **nenhum workflow o rodava**: `grep tokens
.github/workflows/ci.yml` devolvia vazio. Editar token e esquecer `npm run tokens:tw4`
passava verde em tudo — e o efeito é pior que artefato defasado comum, porque **todos** os
gates de cor (`dead-theme-classes`, `shadcn-vocab`, `orphan-utilities`, `runtime-base`,
`audit:token-docs`) leem justamente esse CSS: eles confirmavam a si mesmos contra um
artefato que nada garantia estar atual.

`scripts/lib/generated-artifacts.mjs` (no `npm test`) regenera cada artefato pelo MESMO
transform do `package.json` e compara com o disco, apontando a **primeira linha**
divergente + o comando que conserta. Checa também **cobertura**: `.css` em
`src/styles/theme/` sem gerador conhecido reprova — senão uma 6ª marca entraria sem
conferência e o resumo diria "✓ N em sync" sobre conjunto incompleto.

### As duas listas de exceção NÃO são a mesma

| Lista | Significa | Hoje |
|---|---|---|
| `ds-exceptions.mjs` → `DS_EXCEPTIONS` | não vai pro **registry/showcase** | 8 (TabelaTeste, TableToolbar, 6 internos do example-chat) |
| `barrel-completeness.mjs` → `BARREL_EXCEPTIONS` | não vai pro **npm** (barrel) | 1 (TabelaTeste) |

Os 6 internos do example-chat são exceção de registry **e estão** no barrel — viajam pelo
npm junto do exemplo. Usar a lista errada isentaria 6 componentes hoje corretos, e o gate
pararia de proteger justamente eles. Ambas exigem **motivo** por entrada, e ambas reprovam
exceção morta (pasta que sumiu, ou que já entrou no barrel).

### Dep real inclui dep de TIPO (`scripts/lib/deps-declared.mjs`)

A L-037/L-058 ("declare as deps reais") não tinha gate. `deps-declared` varre os
diretórios publicados e exige que todo import externo esteja em
`dependencies`/`peerDependencies` — resolvendo `from "geojson"` por `@types/geojson`
(convenção DefinitelyTyped). Três armadilhas de parsing estão travadas por teste, todas
medidas aqui: import dentro de **JSDoc**, a chave `"line-file-import"` de `icons.ts` (que
um regex frouxo lê como pacote `:`), e tipo que só existe em `@types/X`.

### Classe de cor morta — o gate cobre CÓDIGO **e** DOC (2026-08-08)

`dead-theme-classes` reprova classe de cor cuja CSS var não existe no tema. Cobria só
`src/`; passou a cobrir também `CLAUDE.md`, `README.md`, `.claude/{rules,skills,commands,agents}`,
`.ai/{context,rules}` e **`cli/templates/default/`** (esta é distribuída: classe morta
prescrita ali chega em todo scaffold).

Motivo: **a doc é o que GERA o código.** 44 usos de vocabulário V2 sobreviveram meses nas
skills — inclusive no `impl-igreen.md`, que é o template canônico — porque o gate olhava
só o resultado. O `CLAUDE.md` do consumidor chegou a ensinar
`ring-ring-primary/30 → ring-ring-primary`: trocar classe morta **por outra classe morta**.

Dois mecanismos evitam falso positivo, ambos context-free:

- **Placeholder de template não é classe.** `bg-bg-{cor}`, `text-fg-on-{cor}` — o `{` logo
  depois é o sinal. Sem isso, a doc reprovava por escrever a REGRA certa.
- **Citação declarada por (arquivo, classe)**, no `CITACOES` do módulo, com motivo
  obrigatório. A doc que diz "`ring-ring-primary` NÃO existe" é a correção, não o defeito —
  mas separar citação de prescrição por regex seria julgamento de intenção (L-059). Um
  humano declara; no gate volta a ser mecânico. Escopo por PAR: `CLAUDE.md` pode citar
  `ring-ring-primary`, e ainda assim reprova se alguém escrever `bg-bg-primary` lá.

Escrever numa doc uma classe que não existe → o teste falha com arquivo:linha e diz o que
fazer se for citação. **Fora do escopo de propósito:** `lessons.md`, `pipeline-state.md`,
`audits/`, `archive/`, `specs/` — registro histórico, onde nomear a classe morta é o
conteúdo.

Complemento manual: `npm run audit:token-docs` compara o **valor** de cada token afirmado
na doc contra o CSS (spacing/radius/shadow), que é a outra metade do problema — o gate pega
classe que não existe, a auditoria pega classe que existe com valor errado na doc. Não é
CI: a saída é candidato, exige triagem (número de outro elemento na mesma linha é falso
positivo comum).

### Tokens de scrollbar — alpha neutro, uso interno

`bg.scrollbar-thumb` / `bg.scrollbar-thumb-hover` são a **única exceção** do grupo `bg.*`:
valem `alpha.black[24/32]` no light e `alpha.white[24/32]` no dark, **idênticos nas 5
marcas** (a barra precisa de contraste próprio, independente da cor de superfície da marca —
por isso não entram no diff de nenhum overlay). São consumidos **só** pelos `@utility
scrollbar-*`. Não use como fundo de elemento.

---

## ❌ Anti-patterns proibidos

### Tailwind literal com equivalente DS

```typescript
gap-4   → gap-gp-md       gap-2   → gap-gp-xs
p-4     → p-sp-md         px-3    → px-pad-lg
rounded-lg → rounded-radius-lg
shadow-md  → shadow-sh-md
```

### Form layout — usar `gap-form-gap` (L-024, v0.7.1+)

```typescript
// ❌ ERRADO — semântico genérico em form
<form className="flex flex-col gap-gp-lg">    // 12px — apertado
<form className="flex flex-col gap-gp-xl">    // 16px — ainda curto
<div className="grid grid-cols-2 gap-gp-md">  // grids dentro de form

// ✅ CORRETO — token DS específico
<form className="flex flex-col gap-form-gap">          // 20px DS
<div className="grid grid-cols-2 gap-form-gap">        // mesmo no grid

// Aplica-se a: drawers (NovoClienteDrawer), modais (SacarDialog),
// pages de formulário, sections com 2+ FormField units empilhados.
```

### Heights fixos proibidos

```typescript
h-7  → min-h-form-xs   (28px)
h-8  → min-h-form-sm   (32px)
h-9  → min-h-form-md   (36px)   ← h-9 = 36px = form-md, NÃO form-lg
h-10 → min-h-form-lg   (40px)
h-11 → min-h-form-xl   (44px)   ← target WCAG mobile
```

### Ring / focus

```typescript
ring-ring-brand/30 → ring-ring-brand   (token já tem alpha)
ring-3 → ring-4                            (ring-3 não existe no Tailwind)
outline-none → focus-visible:outline-none  (acessibilidade)
```

### Tipografia avulsa

```typescript
text-xs font-semibold → text-body-xs (12/500) ou caption-md font-semibold
text-sm font-medium  → text-body-md font-medium (14/500)
text-[14px] font-medium → text-body-md font-medium (preset + override de weight)
text-[13px]            → text-body-sm font-normal (preserva 13/400)
text-[Npx]             → preset DS sempre que houver tier equivalente
```

**Roles**: 27 presets em 7 roles —
display / heading / title / body / caption / **stat** / code. Detalhes em
`.ai/context/tokens/typography.md`. Body padrão do projeto = `body-sm` (13/500).
Valor de KPI/métrica = `stat-{sm|md|lg|xl}` (20/24/30/34px, estático, bold) +
`tabular-nums` — nunca `text-[Npx]` na unha (o VP tinha ~33 desses; `stat` mata).
Title default = weight 600. Override de weight via `font-bold/semibold/medium/normal`.

⚠️ **L-016**: ao adicionar novo preset, REGISTRAR em `src/utils/tv.ts`
(`twMergeConfig.extend.classGroups["font-size"][0].text`) — senão
`tailwind-merge` confunde com `text-fg-X` e remove a classe silenciosamente.

### Imports

```typescript
import { tv } from "tailwind-variants" → import { tv } from "@/utils/tv"
```

### Variants order

```typescript
// disabled DEVE ser o último compoundVariant
compoundVariants: [
  { color: "primary", class: "..." },
  { disabled: true, class: "..." }, // ← último wins
];
```

### Boundaries

- DS Dev cria token inline → **PARAR** → sinalizar cascata ao Orchestrator
- Componente novo sem verificar `inventory.md` primeiro → proibido

### Filtro em tabela/lista → nativo, NUNCA form acima (L-051)

Intenção de "adicionar filtro" numa tabela/lista (select de status em cima, campo de
período, "filtrar por X") → **proibido** gerar form/selects soltos acima da grade. Use o
motor reativo do componente (chips clicáveis/editáveis):

- **coluna/campo** → `enableColumnFilter`/`filterFields`; já filtrado → **pré-aplicar**
  (`defaultViews`/`presetView`/`filterModel` · DataList: `views`/`filterModel`) → chip aplicado.
- **toolbar.actions/toolbarActions SÓ pra caso pequeno/simples não-coluna** (ex.: data),
  label curta, **máx ~2**. Mexe com coluna, grande ou muitos → **não** use o toolbar.
- **muitos ou ligados a coluna** → sempre nativos **pré-aplicados (chips)**. As skills
  crud/list + ds-kit sugerem isso.

### DataTable autoFit — header-floor, fill proporcional, toggle (L-052b/v0.22.0)

`autoFit` do DataTable (v0.22.0): (1) a largura mínima de cada coluna inclui o **header
inteiro** (`headerName` + ícone/sort/menu) — título nunca trunca em "..."; (2) a sobra de
espaço é distribuída **proporcionalmente** e **`col.width` virou base/piso** (não trava
fixa) que entra no rateio — pra travar use `width`+`maxWidth` iguais; (3) toggle de view
re-mede via `recalcKey: viewMode`. Regra: prefira NÃO fixar `width`. Detalhe em
`lessons.md` L-053 + skills crud-builder.

### DataTable view Lista — paginação opt-in (L-052)

`DataTable` na view Lista (`viewMode="list"` + `listConfig`) **não pagina por padrão** —
mostra todas as rows processadas (igual kanban). Pra paginar a **lista flat** (mesma
paginação da tabela + footer) passe **`listConfig.paginated: true`** (v0.21.0+).
Opt-in/não-breaking; ignorado quando `hierarchical` (árvore desliga paginação). Documentado
em `crud-builder/generate.md` (repo + `cli/templates`). Use sempre que a lista flat puder
ter muitas linhas (senão rola "infinito" enquanto a tabela pagina).

### DataTable saved-views — viewMode sticky + `allowCreateView` (L-054/v0.23.0)

Dois ajustes de visões do `DataTable`: (1) **viewMode "sticky"** — aplicar uma visão (preset
ou "Default") só troca Tabela↔Lista↔Kanban se a visão **declarar `viewMode` explícito**;
presets sem `viewMode` (o caso comum) mantêm a view que o usuário está vendo (antes,
qualquer troca de visão voltava pra Tabela). (2) **`allowCreateView={false}`** — esconde o
botão "+" das visões (read-only: só `defaultViews` + Default, o usuário não salva visões
próprias). Default `true`, não-breaking. **Regra**: abas fixas → `allowCreateView={false}`;
só declare `viewMode` no `presetView` que DEVE forçar uma view. Detalhe em `lessons.md` L-054
+ skills crud-builder + USAGE DataTable/TableToolbar.

### DataTable — grab-to-scroll nativo + coluna `copyable` (v0.26.0)

Dois recursos: (1) **grab-to-scroll agora é NATIVO** — `grabToScroll` passou a **default
`true`**: toda tabela rola lateralmente ao arrastar o corpo (mouse/pen, threshold ~6px,
clique/seleção preservados, pulado em touch). Não precisa ligar; `grabToScroll={false}`
desabilita. (2) opção de coluna **`copyable`** (`true` ou `{ value?, label? }`) → ícone de
copiar revelado no **hover/foco** da célula + feedback "Copiado!" (~2s, `navigator.clipboard`,
sem dep nova). **Regra pra IA**: em colunas cujo valor o usuário copia (CNPJ/documento,
e-mail, ID, conta) marque `copyable: true`; NÃO reimplemente scroll-drag (já é nativo). Doc:
DataTableDoc + USAGE + skills crud-builder (repo + payload) + `example-finance`.

---

## ✅ Obrigatório sempre

```typescript
import { tv, type VariantProps } from "@/utils/tv"
"min-h-form-xl"             // 44px WCAG mobile
"min-h-form-lg"             // 40px desktop default
"border border-transparent" // transição suave na base
<button type="button">

// Padrão 1 — estático (botões, selects, chips)
base:  "focus-visible:outline-none"
color: "focus-visible:ring-4 focus-visible:ring-ring-{color}"

// Padrão 2 — animado (inputs, textareas)
base:  "ring-0 ring-ring-brand"
       "transition-[color,box-shadow,background-color] focus-visible:outline-none"
focus: "focus-visible:ring-4"
```

---

## Dark mode (L-008 a L-011)

```
bg: canvas < surface < subtle < muted     (hierarquia crescente OBRIGATÓRIA)
border dark: L% ≥ surface + 6%             (senão some no fundo escuro)
shadows dark: ≥ 2× opacidade do light      (amplificar)
rings dark: ≥ 1.5× alpha do light          (amplificar)
--input/--border no .dark {}: diferentes do :root (light)
```

---

## Radix patterns

```typescript
"has-[[data-state=checked]]"  // L-012 — Radix usa data attributes
Array.from({ length: values.length }, (_, i) => <Thumb key={i} />)  // L-013
```

### Exceções de hardcode válidas

```typescript
className = "bg-white"; // Switch/Slider thumb (L-014)
```

- Avatar text sizes (10/11/13/14px) — calibrados pelo diâmetro do círculo, sem preset DS
- Pseudo-elements posicionais finos (`before:w-[3px]`, `top-[10px]`) — decisões visuais específicas
- Tier órfãos sem preset (15px, 17px, 22px, 26px) — manter literal ou criar preset DS via cascata

---

## 67 Lições (L-001 a L-067) — resumo

Formato completo em `.ai/status/lessons.md`; as absorvidas em gate automático (L-001/002/003/005 no lint, L-017 no `lib-verify`) vivem em `.ai/status/lessons-archive.md` — continuam valendo, o pipeline só já as aplica sozinho. Aqui é o atalho 1-linha de TODAS, ativas e arquivadas — e **isso agora é verificado**:
`scripts/lib/lessons-index.mjs` (no `npm test`) reprova lição que existe na fonte e não é
citada aqui, e confere a contagem do próprio título acima. Em 2026-08-08 faltavam 6
(L-044/045/046/048/049/050) atrás desta mesma frase.

### Focus rings / Tailwind

- **L-001** `ring-ring-*` já tem alpha embutido. **NUNCA** `/30`, `/20`, etc.
- **L-002** Tailwind literal proibido se houver token DS (heights, gap, pad, shadow).
- **L-003** `ring-3` não existe. Usar `ring-4`.
- **L-004** `outline-none` sozinho viola acessibilidade. Sempre `focus-visible:outline-none`.
- **L-005** Shadcn `bg-input/50` → `bg-bg-surface` (token DS).

### Variants & tipografia

- **L-006** `disabled` SEMPRE último em `compoundVariants`. Senão é sobrescrito.
- **L-007** `text-xs font-semibold` avulso → usar preset `text-body-xs` (ou equivalente).

### Dark mode (4 regras combinadas)

- **L-008** Hierarquia bg crescente: `canvas < surface < subtle < muted`.
- **L-009** Border no dark: L% (lightness) ≥ surface + 6%.
- **L-010** `--input` e `--border` no `.dark{}` devem ser **diferentes** dos do `:root`.
- **L-011** Shadows ≥ 2× opacidade do light, rings ≥ 1.5× alpha do light.

### Radix

- **L-012** Radix usa data attributes: `has-[[data-state=checked]]` (não `has-[:checked]`).
- **L-013** Slider Radix: renderizar N `<SliderPrimitive.Thumb>` pra N valores.
- **L-014** Switch/Slider thumb `bg-white` literal é exceção válida.

### Tokens / Infra

- **L-015** `scrollbar-width` CSS só aceita `auto/thin/none` — tamanhos px iguais no Firefox.
- **L-016** Novo preset tipográfico em `typography.ts` → registrar em `src/utils/tv.ts` `twMergeConfig` senão `tailwind-merge` remove silenciosamente.

### Release / npm (lições 2026-06-05)

- **L-017** `files` do `package.json` DEVE incluir `dist-lib/src/**` e `dist-lib/tokens/**` quando usar `vite-plugin-dts` sem `rollupTypes`. Bug afetou v0.1.0-v0.5.0 (types quebrados silenciosamente). Validar via `npm pack --dry-run` antes de publish.
- **L-018** Release minor/major da lib → bump pin no `cli/templates/default/package.json` + auditoria do template + bump CLI na mesma rodada.
- **L-019** Remover/renomear token → grep TODOS os scopes (`src/`, `cli/templates/**`, `.claude/**`, `.ai/context/**`, `.ai/rules/**`, `lessons.md`). Preservar `audits/`, `specs/`, `archive/`, `pipeline-state.md`.
- **L-020** Patches/hotfixes também usam `/ds-release` — branch + PR obrigatórios. **TODO `npm publish` ou bump em `package.json.version` exige o fluxo completo**, incluindo pre-commit-check e gate humano. Direct push no `main` pra release quebra a convenção do projeto (releases v0.3-v0.5 vieram via PR; sessão 2026-06-05 burlou isso por urgência percebida — não justifica).

### Compound components + Radix (lições 2026-06-08, v0.7.0)

- **L-021** Compound component wrapper que serve de **anchor pra Radix Popover/Tooltip/etc** PRECISA usar `forwardRef`. Sem isso, `asChild` não consegue obter o DOM node ref e o popover ancora em `top=-506` (fora do viewport). Caso real: `ButtonGroupRoot` sem forwardRef → popover advanced do DataTable simpleFilter quebrou posicionamento. Fix: refatorar pra `forwardRef<HTMLDivElement, Props>`.
- **L-022** Split button com Radix Popover: usar `<PopoverAnchor asChild>` (NÃO `<PopoverTrigger asChild>`) quando o wrapper tem 2+ onClick handlers separados (ex: ButtonGroup Primary + Chevron). PopoverTrigger asChild faz merge do onClick com o wrapper → qualquer click bubble dispara o toggle interno do Radix, conflitando com handlers de filho específicos (race condition mesmo com `e.stopPropagation()` + `e.preventDefault()`). Anchor só posiciona; consumer controla `open`/`onOpenChange` externamente via state. Pattern aplicado em `<FilterPopover>` v0.7.0 — nova prop `anchor?: ReactNode` substitui `trigger` quando consumer quer split button externo.
- **L-023** **Forms PRECISAM usar `<FormField>` (ou `<FormFieldInput/Select/Textarea>`) do DS**. Nunca `<label>` raw com classes manuais — divergência visual silenciosa do padrão (font-weight diferente, cor errada no dark mode). FormField encapsula `formFieldLabel()` (`text-body-sm font-semibold tracking-[0.01em] text-fg-default dark:text-fg-muted`) + spacing + id htmlFor + helper text + error/warning/success states. Pra widget custom (vindo de registry, slot, etc), use `<FormField label="..."><{() => myWidget}></FormField>` (children é render-prop). Caso real: `<ToolbarSimpleFilterDrawer>` v0.7.0 inicial usava `<label class="text-body-sm font-medium text-fg-default">` raw — peso 500 (DS é 600) e sem dark-mode-aware → labels ficaram MAIS FORTES no dark que o padrão NovoClienteDrawer (FormField). Fix: trocar pra `<FormField>` wrap. **Regra pra IA**: ao implementar qualquer form/drawer com label+input, IMPORTAR `FormField` antes de escrever `<label>` na unha.

### Form spacing + Card inputs (lições 2026-06-09, v0.7.1)

- **L-024** **Forms usam `gap-form-gap` (20px) entre fields — token DS dedicado**. Antes (v0.7.0-): cada drawer/modal escolhia `gap-gp-lg` (10px) ou `gap-gp-xl` (12px) ad-hoc → inconsistência visual e correção repetida em PRs. Solução v0.7.1: token `formGap = scale[5]` em `tokens/.../components/spacing.ts` → CSS var `--spacing-form-gap` → classe `gap-form-gap`. **Regra pra IA**: ao implementar qualquer formulário (vertical ou grid 2-col interno), usar `className="flex flex-col gap-form-gap"` ou `"grid grid-cols-2 gap-form-gap"`. Não usar `gap-gp-*` semânticos pra spacing entre FormField units — eles permanecem pra cards, icon-to-text, section spacing. Padrão validado em SacarDialog "Outra conta" + NovoClienteDrawer.
- **L-025** **Componente "card variant" de input precisa de `<label htmlFor>` nativo wrap**, não `<button onClick>`. Caso: `CardCheckbox` v0.7.1. Usar `<button>` quebra acessibilidade (screen reader anuncia "button" em vez de "checkbox"), form integration (sem name/value pra submit nativo) e click target (stopPropagation no checkbox interno faz clique no card mas não no checkbox). Pattern correto: `<label htmlFor={id}><Checkbox id={id} ... /><div>...</div></label>` — label nativo propaga clique pro checkbox real, semântica preservada. Aplicar ao criar futuros `CardRadio`, `CardSwitch`, etc.
- **L-026** **TableHeadCell right-aligned reserva `pr-[60px]` SOMENTE quando sort ativo**, não pra hover-only icons. Bug pré-fix: o `pr-[60px]` era aplicado sempre que `sortable || headMenu` → reservava 60px de "vazio" no header mesmo sem sort/hover. Headers `align="right"` (ex: coluna `Saldo disponível`) ficavam com texto artificialmente deslocado da borda. **Solução:** condicionar a `isSorted` apenas. Hover-only icons (sort hint + headMenu) usam `headRightStack` absolute com `bg-bg-table-head` → mascaram texto durante hover (UX padrão). Regra pra IA: ao revisar layout de table header com align right, NÃO reservar padding fixo pra ícones hover-only.
- **L-027** **Avatar (e qualquer componente com bg arbitrário) escolhe cor de texto via WCAG contrast — não aplica `text-white` cego.** Utility: `getContrastTextColor(hex)` em `src/utils/color-contrast.ts` (luminância WCAG 2.x + contrast ratio). Avatar v0.7.1 refatorado: branch `colorHex` calcula `white` vs `black` automaticamente. Caso real: BB #FAE128 + branco = ratio 1.29:1 (fail AA) → agora preto 16.3:1 (AAA). **Regra pra IA**: ao criar novo componente que aceita bg dinâmico/externo (lookup de marca, persona, status custom), usar `getContrastTextColor()` em vez de hard-code. NÃO aplicar a pares semânticos DS pré-validados (`bg-bg-brand-subtle` + `text-fg-brand` etc — esses já foram casados em `color-light/dark.ts`).
- **L-028** **Componente memoizado (`React.memo`) com handlers do pai → latest-ref pattern, não `useCallback` em massa.** Handlers num `useRef` reatribuído todo render (ref estável não invalida o memo; `.current` lido NO CALL-TIME dentro da closure evita stale). ❌ `const h = ref.current` no topo do render captura snapshot stale quando o memo bloqueia re-render (bug pego no gate do PR4). Dados de RENDER (columns/widths/selected/editState) vão como props comparadas; estado reativo por-linha (edit) bundled num objeto passado só à linha afetada. Caso: `DataTableRow` v0.8.0.

### Fast-filter + mobile overlays (lições v0.8.x)

- **L-029** **Fast-filter de chip renderiza lista DIRETA, nunca `<Select open>` aninhado.** Um `<Select open>` dentro do PopoverContent do chip ancora o listbox no próprio trigger sr-only (~0px) → popover deslocado + "dot" residual + dismiss travado. Usar `FastSingleSelectList` (`column-types/_filter-field.tsx`) pra single (boolean/select) e `MultiSelectDropdown` pra multi. Selecionar fecha via `onClose`; clique-fora fecha (sem layer aninhado). Caso: `boolean/select-column-type` v0.8.x.
- **L-030** **Mobile-sheet acionado de dentro de overlay z-50 precisa ficar ACIMA.** App usa z-50 como camada-topo; o drawer mobile do MenuSidebar também é z-50 → sheet empatava e renderizava atrás ("aparece por trás"). Wrapper do mobile-sheet vai a **z-60** + backdrop **z-[55]** (dropdown-menu/popover). Não confiar em empate por ordem de DOM. Combina com L-031. ⚠️ A regra do wrapper **mudou-se pro tema gerado** em 2026-08-07 (`to-tailwind-v4.ts` → `buildFloatingUtilities`), porque no `globals.css` ela não chegava em canal nenhum — não a procure (nem a redeclare) lá.
- **L-031** **`DropdownMenu` dentro de drawer/overlay → `modal={false}` + backdrop `pointer-events-none`.** Modo modal do Radix injeta dismiss/scroll-lock que corre com o gesto → abre no pointerdown e fecha no click do mesmo toque ("some", precisa 2-3 toques). Backdrop `pointer-events-auto` do dropdown intercepta o pointerup. Fix: `modal={false}` no consumer + backdrop do dropdown `pointer-events-none` (dismiss segue via DismissableLayer a nível de document). Popover não sofre (abre no click). Caso: `AppShell/user-menu.tsx` v0.8.x.

### Charts / Recharts 3 (lições v0.9.x)

- **L-032** **Recharts 3 tem caveats que quebram mudo.** (1) `text-display-sm`/`text-display-xs` **não existem** (renderizam 14px) → KPI usa `heading-sm`/`heading-xs`/`display-md`. (2) Pizza: sem `activeIndex`/`activeShape` → prop `shape={(props,index)=><Sector/>}`. (3) Radial empilhado/gauge parcial → `<PolarAngleAxis type="number" domain={[0,total]} />`. (4) Eixo Y omite tick de borda (ex: `0`) → `interval={0}`; e `domain` máximo **= maior tick** (senão linha-guia duplicada no topo). (5) Grid via token `chart-grid` (`--color-chart-grid`), reescrito no `ChartContainer` — não passar `stroke`. Padrões completos: `.ai/context/components/chart-patterns.md` + `Chart/USAGE.md`.

### Distribuição / consumidor (lições v0.10.0)

- **L-033** Copy-in: integridade se protege por **hook** (`protect-ds.mjs` bloqueia tema/tokens/`cn`/`tv`; avisa em componente) + regra, não travando arquivo. IA do consumidor customiza na **composição**, nunca nos tokens/internals.
- **L-034** `example-*` = **extração 1:1 do showcase real**, nunca toy. Strip `AppShell` → `<div flex flex-col h-full min-h-0 gap-gp-2xl>`, `TableDoc`→`_table-data.ts`, rewrite imports, validar render no consumidor.
- **L-035** examples↔preview são cópias paralelas → **drift-check** (`examples-drift-check.mjs`, hash da fonte) avisa quando o showcase muda; re-sync `--baseline`.
- **L-036** Roteamento de intenção no consumidor = **skill** (nativo/barato pela description), não agente. `ds-kit` é o front-door; subagente só pra trabalho pesado.
- **L-037** Item de registry declara **todas** as deps reais (`data-table` precisa `@tanstack/react-virtual`; quem usa `@/lib/lucide-types` embute o arquivo). Validar com render em consumidor, não só tsc.
- **L-038** Default vindo do column-type (`defaultAlign`/`defaultEllipsis`) deve ser resolvido na **fonte única** (`effectiveColumns` em `use-data-table-columns.ts`), nunca por render-site. Header/footer liam só `col.align` cru e divergiam do body em `type:"currency"/"number"` sem `align` explícito (não reproduz no showcase, só no consumidor). Validar no cenário SEM o override.
- **L-039** Tailwind v4: `border`/`border-{x,y,l,r,t,b}` cru = **só largura**; sem classe de cor a borda usa `currentColor` (branca no dark / preta no light). SEMPRE acompanhar de `border-border-default` (ou `-subtle`/`-brand`/`-danger-muted`...). Bridge cobre `bg-*`/`text-*`, **não** a borda crua. Exceção: base `cva` com `border` cru só se TODAS as variantes setarem cor (ex.: `alert`). Ao adaptar shadcn, trocar `border` → `border border-border-default` e **PROIBIDO** usar `bg-popover`/`text-popover-foreground` — ou qualquer das 19 chaves da bridge (`background` `foreground` `card` `popover` `primary` `secondary` `muted` `accent` `destructive` `border` `input` `ring` + `-foreground`). Elas só existem no `globals.css`/`index.css`, não viajam pros canais npm e submódulo, e a cor cai em `currentColor`. Gate: `scripts/lib/shadcn-vocab.mjs` no `npm test`; a tabela `EQUIVALENTE` dele dá o token DS de cada chave.
- **L-040** Componente **flutuante** (menu/popover/painel) segue a **receita única** do DS — espelhar `dropdown-menu.tsx`/`popover.tsx`, nunca os defaults shadcn. Superfície: `relative bg-bg-dropdown border border-border-default rounded-[12px] shadow-sh-lg outline-float` + frosted `before:backdrop-blur-2xl ...` + `text-fg-default/-muted`. Item: `px-pad-lg py-pad-md rounded-radius-sm text-fg-muted focus:bg-bg-muted focus:text-fg-default` (ativo `bg-bg-brand-subtle/fg-brand`, destructive danger). Separator/Label/Shortcut por token. Tooltip é exceção (menor). Delay default: Tooltip 200 / HoverCard openDelay 200 (Radix 700 é lento).
- **L-042** Componente novo toca **8 superfícies** — prever TODAS (não só código+USAGE): (1) código · (2) USAGE · (3) inventory · (4) showcase (`<Nome>Doc` + `App.tsx` import/render/**`DOC_PAGES`** + `doc-nav-data`) · (5) `registry.json` · (6) **vocabulário do consumidor** (`cli/templates/default/_claude/rules/ds-components.md`, no grupo de tarefa + critério de escolha, + bump + republicar) · (7) changelog · (8) **barrel** (`src/components/index.ts` — define o canal npm). 1–4 e 8 no PR; 5/6/7 no `/ds-release`. Checklist = `handoff-pr.md` "Definição de Pronto". Distribuído no registry mas fora do vocabulário = gap (caso Toast). Hook `ds-inventory-check` acusa 2/3/5/6 + showcase; o barrel é gate (`barrel-completeness`). **A 8ª entrou em 2026-08-08**: era a única superfície sem nenhuma vigilância, e por isso `Chart`/`DataList`/`List`/`Toast` passaram meses com 6 de 7 fechadas e `import { ChartContainer }` estourando "not exported" no consumidor npm.
- **L-043** Tailwind v4 **inlina** valores de `shadow`/`drop-shadow`/`text-shadow` da `@theme` na utility → `.dark { --shadow-* }` é **código morto** (no dark a sombra fica com o valor light; `md` light usa cinza-claro → "halo"). Fix: `@theme inline { --shadow-sh-*: var(--ds-sh-*) }` + `:root`/`.dark { --ds-sh-* }` (indireção que o cascade flipa). Cor usa `var()` e é dark-aware; shadow não — nunca confiar em `.dark{--shadow}` direto. Foundational (rebake no release).
- **L-041** Trabalho de componente **fecha por PR + link pro gate humano** (Regra 8) — branch + commit descritivo + push no `empresa` + `gh pr create --repo igreenlab/igreen-desingsystem-admin` + reportar link; IA faz o mecânico e **para no merge** (humano aprova; merge/publish/deploy só autorizado — L-020). Skill: `ds-dev/handoff-pr.md`. Distribuição (registry/embed/bump) consolida no `/ds-release`, não por-PR; vários componentes = batches (1 PR cada) + 1 release. Nunca encerrar sem PR; nunca commit órfão em `main`.

### Infra, componentes e registry (L-044 a L-050)

> ⚠️ Estas 6 estavam **ausentes** deste resumo até 2026-08-08, apesar de a linha de
> abertura prometer *"o atalho 1-linha de TODAS"*. Só existiam no `lessons.md`, que é
> sob demanda — ou seja, na prática não chegavam à sessão. A **L-044 é a mais grave a
> ter ficado invisível**: o repo roda em Windows.

- **L-044** Hooks bash dependiam de `jq` (**ausente no Git Bash/Windows**) e casavam path com `/` enquanto o harness manda `\` → **skip silencioso, rede de segurança inteira no-op por uma sessão**. Hoje todos têm fallback `node` + `tr '\\' '/'` antes de qualquer matching. Ao escrever hook novo: **nunca** dependa de binário fora do `package.json`, e normalize o path primeiro (ver também L-061).
- **L-045** Bug que "só aparece no último/primeiro item" é quase sempre **off-by-one mascarado** por um valor que coincide nos demais (caso real: conector hierárquico usando `ancestorHasNext[i]` em vez de `[i+1]` — invisível exceto no último root). Teste sempre a borda: último root, lista vazia, 1 item.
- **L-046** `DataList` — 4 padrões de tela: (1) `fillHeight` faz só a lista rolar (pai com altura + `flex-1 min-h-0`); **não** combinar com `virtualized`. (2) Virtualizado exige `measureElement`, senão o `estimateItemSize` reserva a mais e o excedente vira "gap" falso. (3) Nó-folha no `hierarchical` **não** recebe placeholder de chevron. (4) `branchHighlight` só em `layout="hierarchical"`.
- **L-048** `block-rm-rf.sh` casa o padrão em **qualquer ponto** do comando — inclusive dentro de uma commit message (bloqueou um `git commit` cuja mensagem citava `rm -rf src/`). Não escreva `rm -rf <path>` literal em mensagem/echo.
- **L-049** `registryDependency` pode ficar **dangling** pra componente **bundlado** em outro item: `data-list` importa `TableToolbar`, que não tem item próprio (vive dentro de `data-table`) → `@igreen/table-toolbar` não resolve e o `igreen:add` quebra. Ao editar o registry, valide que cada `registryDependency` existe como item.
- **L-050** Showcase: `PropsTable` vai **direto** sob `SectionH2`, nunca dentro de `ExampleSection` — as duas têm superfície própria (ring) e vira card-dentro-de-card. E `SectionH2` tem `mb` sem `margin-top`: tabela seguida de heading cola.

### `container` não dobra prefixo — `max-w-md`, nunca `max-w-container-md` (L-057)

Exceção única do sistema: o transform emite `--container-md`, que **sobrescreve** a escala
nativa do Tailwind. Classe correta = **`max-w-md`** (768px do DS) / `max-w-tooltip-lg` /
`max-w-modal-sm`. **`max-w-container-*` não existe** e não emite CSS — falha silenciosa
(não quebra build nem tsc). Detalhe + por que não mudamos o transform: `lessons.md` L-057.

### As 8 superfícies são DETECÇÃO, não burocracia (L-058)

`ChoroplethMap` tinha só código + USAGE + barrel (1 de 7). Um merge de reorganização o
tirou da `main` e **nenhum sinal disparou** — não havia inventory pra ficar órfã, doc page
pra renderizar em branco, nem item de registry pra quebrar. Quem descobriu foi um app em
produção, meses depois. Além disso, ele usava `d3-geo`/`topojson-client` **sem declarar no
`package.json` do DS** — compilava só porque o consumidor declarava (L-037). Regra: feche
as superfícies ANTES de considerar pronto, e confira as deps reais do arquivo contra o
`package.json` do DS. Detalhe: `lessons.md` L-058.

### Composições de dashboard/lista = receita, não componente (L-055)

Telas convergindo num padrão (dashboard, **KPI-group "Painel do Líder"**, **fusão
KPI+evolução**, **chart-card**, **card dividido em 2**, distribuição de **tabela/lista**)
→ padronizar = **capturar a receita** com os primitivos existentes
(`Kpi`/`KpiGroup`/`Chart`/`Panel`/`DataTable`/`DataList`) na fonte única
`.ai/context/components/dashboard-patterns.md` (referenciada por showcase + exemplos +
builders), **não** criar mega-componente de página. Componentiza-se só o gap de átomo —
ex.: `KpiDelta` ganhou `signed` (tom verde/vermelho + seta pelo sinal do value; opt-in,
`tone`/`direction` explícitos vencem). Dois recipes de ícone: KPI-group = **círculo**
`size-form-lg rounded-radius-full`; mini-stat/legenda/status = **quadrado** `size-comp-lg
rounded-radius-base`; rank = círculo pequeno `size-comp-sm`.

### Consumidor via submódulo = 4º canal; `ds-link` dá paridade (L-056)

Claude Code só auto-descobre `.claude/` na **raiz do cwd** — não desce pra
`<submodulo>/.claude/`. Consumidor por **git submódulo** fica sem o kit de IA (ao contrário do
npm, que recebe o payload no scaffold). `scripts/ds-link.mjs` (`npm run ds:link`) projeta o
**mesmo payload consumidor** (`cli/templates/default/_claude`) pro `.claude/` do pai —
idempotente, re-rodar pós-`git pull`; `--unlink` desfaz. Três regras: (1) o "modo submódulo"
mora no **payload** (`cli/templates/default/_claude/skills/*` — crud/list/dashboard + ds-kit),
que lê `.claude/ds-config.json` gerado pelo ds-link → resolve `importBase` e **não** roda
`igreen:add` (lê componentes/exemplos direto de `<dsPath>/src`); (2) ds-link **exclui**
`hooks/`+`settings.json` (copy-in-specific, miram `src/components/**`); (3) detecta o alias no
tsconfig/vite (fallback `@ds`). Regra pra IA: ao mexer no kit do consumidor, lembrar que
submódulo é um dos 4 canais e consome o MESMO payload. Doc: `SUBMODULE-SETUP.md` + L-056.

### Gate mecânico só pra regra errada independente de contexto — L-004/L-007 saem do grep (L-059)

Medição dos greps antigos de `ds-lint-styles.sh` contra os 40 `*.styles.ts` do repo: **51
hits, 50 ruído, 1 real**. 33 eram `p-0`/`gap-0` (não existe token DS pra zero, resets
legítimos); 9 eram `rounded-full` (numericamente **idêntico** ao token DS — nunca pode ser
defeito, ao contrário de `rounded-sm..3xl`, que divergem de verdade); 8 eram `outline-none`
no `TableToolbar` com foco visível em **todos** — metade via `focus-visible:shadow-sh-ring`
no próprio elemento, o resto via `focus-within:` no **wrapper** (outro bloco `tv()`) — grep
não vê nenhum dos dois. Regra: gate mecânico (grep/CI) só pra regra errada
**independente de contexto** (valor divergente do token, classe inexistente — L-001/L-002/
L-003/L-005); regra que exige contexto cross-elemento (L-004) ou julgamento de intenção
(L-007) fica só pro revisor semântico, nunca no grep. O **ratchet** (só linha que o diff
adicionou) é o que torna o gate viável de ligar — 14/40 arquivos já tinham débito legado.
Detalhe: `lessons.md` L-059.

### Texto que descreve o mecanismo errado é pior que texto nenhum (L-060)

Comentário, doc e mensagem de erro são load-bearing: quem lê **para de investigar**. 4 instâncias
numa sessão, nenhuma pega por build/tsc/teste/lint — texto é o único artefato que ninguém executa.
(1) comentário do `ci.yml` jurava que rascunho não escapava do check — escapava, e permanentemente;
(2) 7 docs anunciavam um formatador que nunca rodou, 2 delas mudando **comportamento de agente**
("o hook formata automaticamente" → o agente não formatava); (3) mensagem de erro mandava
"inclua no IGNORE deste script" **depois** de a lista virar módulo único — obedecer recriava a
duplicação; (4) doc se contradizia dentro do mesmo arquivo. Regra: ao escrever frase que **afirma
garantia** de um mecanismo, verifique a garantia — sem poder verificar, descreva o que o código faz,
não o que ele garante; ao **mover** fonte de verdade, grep nas mensagens/docs que apontam pro lugar
antigo (viram instrução pra desfazer a mudança); ao revisar, trate frase de garantia como afirmação
testável. Detalhe: `lessons.md` L-060.

### No-op por dependência ausente ≠ desligado — está ARMADO (L-061)

`format-on-save.sh` chamava `npx --no-install prettier` num projeto onde `prettier` nunca esteve no
`package.json`: no-op mudo desde sempre. O problema não é o silêncio — é que **a dependência que
falta pode aparecer**. Um `npx prettier` de validação de YAML populou o cache do npx e o hook ligou
sozinho no Edit seguinte, reformatando um arquivo inteiro e mutilando pseudo-código. Mecanismo
desativado por **decisão** não volta; mecanismo inerte por **dependência ausente** volta — e como
nunca rodou, ninguém sabe o que faz quando roda. Regra: hook/check que depende de binário externo
**declara a dependência** no `package.json` ou **falha visível** (no-op mudo é o pior dos três);
decidir não usar = **remover**, não deixar inerte; ao achar mecanismo que "não faz nada", pergunte
se está desligado ou **armado sem munição**. Decisão 2026-07-29: sem formatador automático no
projeto, formatação **na mão** espelhando o vizinho. Detalhe: `lessons.md` L-061.

### `--diff-filter=A` é cego a rename; "novo" = não existia no base (L-062)

Rename de pasta vem como status **`R`**, não `A` → `git mv Foo Bar` passava pelo gate de showcase
sem check nenhum, o buraco da L-058 (foi assim que o `ChoroplethMap` saiu da `main`). A cegueira
ainda mascarou um teste que parecia falhar por outro motivo. Fix em **duas** camadas, porque cada
uma sozinha erra pra um lado: `--no-renames` (decompõe rename em `D`+`A`) **mais** "pasta é nova só
se não existia no base ref" (`git cat-file -e <merge-base>:<path>`) — sem a segunda, qualquer
arquivo adicionado em pasta existente disparava o check (medido: acusava `Chart`, documentado em 8
páginas, e `Icon`, com instrução errada). Regra: check que detecta "coisa nova" por diff nunca
confia em `--diff-filter=A` sozinho; prefira **"não existia antes"** a "tem arquivo adicionado"; e
valide com **commit real de rename** do histórico, não só com arquivo novo. Detalhe: `lessons.md`
L-062.

### Id derivado por convenção valida a convenção (L-063)

`toKebab()` derivava id de rota assumindo PascalCase; das 42 pastas de `ui/`, **uma** não segue
(`avatar-ig`, id real `avatar`) e seria reprovada estando correta. Decisão: **sem** API de override
(YAGNI pra 1 em 42) — o CLI **pula** o que não passa por `isPascalCase()` e emite `::warning`
(não `console.log`: aviso fora da UI de Checks é aviso que não existe). Regra: ao derivar
identificador de um nome (pasta→rota, arquivo→chave), **meça** quantos casos reais seguem a
convenção antes de assumir; valide e **pule + avise** em vez de derivar errado em silêncio; resista
a override configurável pra 1 exceção. Detalhe: `lessons.md` L-063.

### Gate novo só vale depois de reproduzir o defeito que ele existe pra pegar (L-064)

Duas vezes no mesmo dia eu escrevi um check, validei pelo sinal que EU supunha ser o
certo, e o check era **cego ao bug que motivou sua existência**: o `lib-verify` disse "ok"
com o tarball caindo de 959 pra 123 arquivos, e o `api-doc-check` devolveu 0 finding no
commit real que ele existe pra pegar (assumi `{arquivo:[string]}`; o parser devolve `Map`
de `{n,text}`). O padrão não é descuido, é **ordem de trabalho**: teste escrito a partir
do mesmo modelo mental que gerou o código concorda por construção — não é evidência
independente. Regra: gate novo só está pronto depois de **reproduzir o defeito real** e
ver reprovar; use **dado real** (commit do histórico) e monte a entrada do teste **pela
função de produção** que a gera. E **propriedade computada não é evidência de
comportamento** — `items-center` virou `center` no computed e o pixel não saiu do lugar
(shadow DOM); onde o render é do UA, só medição visual vale. Detalhe: `lessons.md` L-064.

### Dogfood pega o que a simulação não pega — só o consumidor real exercita os artefatos (L-065)

Validei o "filtro nativo" (v0.30.3) por dois caminhos. A **simulação** (agentes cegos com a
orientação do consumidor + o pedido) disse **passou**. Mas um **sandbox de consumidor real**
(scaffold da CLI + `igreen:add`, Claude limpo pedindo a tela) achou **2 bugs** que a simulação
não pegou: (1) `Modal` importava `"../../shadcn/dialog"` **relativo** — o rewrite do copy-in só
reescreve **alias**; relativo é preservado → aponta pra `shadcn/` inexistente no consumidor →
**crash do app** (mesmo padrão no `MessageVariablesPicker`); fix = alias + **gate standing** no
`registry-check` (o warning do `registry-add-item` é propose-time, não pega legado). (2)
`defaultViews` (`owner:"preset"`) não viravam aba porque o `TableToolbarViews` só auto-pinava
`owner:"me"` → com `allowCreateView={false}` os presets ficavam **inalcançáveis**, ao contrário
do que USAGE/L-054/skill prometiam; fix = preset auto-pina como aba fixa. **Regra:** simulação
valida a **orientação** (steer); **dogfood** valida os **artefatos distribuídos** (copy-in,
componente real) — só o consumidor real exercita isso. Detalhe: `lessons.md` L-065.

### Override escopado gerado como DIFF precisa de seletor mutuamente exclusivo (L-066)

`brand-<x>.css` emite só o **diff** vs. default em 2 blocos: `[data-theme="x"]` (light) e
`.dark[data-theme="x"]`. Mas `[data-theme]` e `.dark` têm a **mesma especificidade** (0,1,0) e o
overlay é importado **depois** do tema-base → o bloco light vencia o `.dark` por ordem de fonte.
Todo token que a marca muda no light **mas cujo dark é idêntico ao da default** (logo ausente do
diff dark) recebia o valor **claro** no dark. Medido: `vibrant` vazava **13** (`bg-subtle`/`bg-muted`
= `#fafafa` no dark), `blue` e `green` **1 cada** (`fg-strong` — título escuro em fundo escuro,
bug vivo em marca publicada), `pay` 0 só porque diverge nos 2 modos em tudo que toca. Assimetria
perversa: **quanto mais a marca se parece com a default no dark, mais vaza**. Fix de 1 linha:
`[data-theme="x"]:not(.dark)` → blocos mutuamente exclusivos; regenerar as 4 marcas mudou só o
seletor, nenhum valor. **Regra:** diff escopado **aposta na omissão**, e omissão herda de quem
vencer o empate de especificidade — ao gerar override por diff, garanta exclusão mútua com o
outro eixo e verifique de qual regra o token omitido herda em CADA combinação. **Nenhum gate
pegou** (tsc 0, 159 testes, `dead-theme-classes` OK, contraste 10/10 — eu media os valores dos
arquivos TS, não o que o cascade resolvia); quem achou foi o mantenedor num print. L-064 de novo:
ao mexer em tema, **medir no browser com cada combinação de eixos ativa**. Detalhe: `lessons.md` L-066.

### `@keyframes` com nome do framework é no-op mudo — e parece funcionando (L-067)

O `globals.css` tinha 5 `@keyframes`, e a leitura do código dizia "divergência
showcase↔consumidor": `pulse` redefinia `50% { opacity: 0.3 }` contra o `0.5` nativo, em **10
usos distribuídos**. O **build** mostrou o contrário — `dist/assets/*.css` emitia
`@keyframes pulse{50%{opacity:.5}}` já na `main`, e continuava emitindo depois de mover o
bloco pro tema. A declaração perdia nos dois lugares: **`@keyframes` cujo nome o Tailwind ou
o `tw-animate-css` já possui não sobrescreve**, independente da ordem no fonte.

Só há dois desfechos, ambos ruins: nome do framework → **no-op silencioso** (e quem lê o
código acredita num comportamento que nunca existiu); nome próprio → funciona no showcase e
**não chega** nos outros 3 canais. Animação do DS pertence ao tema gerado, com **nome
próprio** (`ds-pulse`, não `pulse`).

**Regra prática:** antes de mover ou duplicar regra CSS entre arquivos, **grep no artefato
BUILDADO** pra ver qual declaração sobrevive. Ler CSS-fonte e afirmar comportamento é o mesmo
erro de ler token e afirmar pixel (L-066). Gate: `runtime-base.test.mjs` proíbe `@keyframes`
e `--animate-*` no `globals.css`.

---

## Sistema multi-marca (temas)

5 marcas: `default` · `blue` · `green` · `pay` · `vibrant`. Cada não-default é um **overlay
de cor** escopado em `[data-theme="<id>"]`, gerado por `npm run tokens:brand:<id>` a partir de
`tokens/brands/<id>/`.

⚠️ **Marca muda SOMENTE cor.** Spacing, sizing, radius, elevation e tipografia vêm sempre de
`brands/default/` — o `to-tailwind-v4.ts` os importa fixos de lá, e um overlay é só variável
de cor num escopo. Pedido de "mudar o espaçamento/a fonte só nesta marca" **não é tema**:
pare e pergunte. (Pra `font-weight` ser brand-aware, os presets teriam que passar a
referenciar var — mudança no transform, afeta as 5 marcas.)

### Anatomia — 3 arquivos, contrato idêntico à default

```
tokens/brands/<id>/
  primitives/color-palette.ts   brand · brandContrast · gray · success/warning/danger/info · white/black/alpha
  semantic/color-light.ts       { bg, fg, border, ring, overlay, chart } — MESMAS chaves da default
  semantic/color-dark.ts        idem
```

`brandContrast` existe porque no dark a família brand troca pra `brandContrast[400]` — verde
escuro não contrasta com near-black. Se a marca já é clara (caso `vibrant`, no teto do gamut),
`brandContrast` pode ser alias do próprio `brand`.

### As 10 superfícies que uma marca nova toca

⚠️ Fonte canônica do passo-a-passo (com comandos) = `.claude/skills/brand-builder/generate.md`,
via `/ds-create-brand`. A tabela abaixo é o resumo; **gate mecânico** = `npm run brand:check`.

| # | Onde | O quê |
|---|---|---|
| 1 | `tokens/brands/<id>/` | os 3 arquivos (palette + color-light + color-dark) |
| 2 | `package.json` | script `tokens:brand:<id>` |
| 3 | `src/styles/theme/brand-<id>.css` | gerado por `npm run tokens:brand:<id>` |
| 4 | `src/styles/globals.css` | `@import "./theme/brand-<id>.css"` (**depois** do tema-base) |
| 5 | `src/hooks/useBrand.ts` | type `Brand` + catálogo `BRANDS` — **só os 2**. `isBrand()` **não** se edita mais: desde a v0.33.0 valida contra o catálogo ativo |
| 6 | `package.json > exports` | subpath `./theme/brand-<id>.css` |
| 7 | `registry.json` | item `theme-<id>` (`registry:file`) |
| 8 | `cli/src/create.js` + template | `BRAND_LABELS` + **`npm run cli:rebake`**. O rebake bakeia os overlays por **descoberta de diretório** — não copie à mão, e não há lista pra atualizar |
| 9 | `src/preview/pages/ColorsDoc.tsx` | `PALETAS` — senão a página mostra a rampa de UMA marca e os semantics de outra |
| 10 | `cli/templates/default/_claude/rules/ds-themes.md` | vocabulário do consumidor. Ausente aqui = a marca existe e ninguém sabe usar (L-042) |

**Só 2 das 10 falham visivelmente**: a 9 quebra o `tsc` (`Record<Brand, Paleta>`) e a 6 faz o
`build:lib` **lançar** (gate fail-closed — o pacote levaria o arquivo e o consumidor não
conseguiria importá-lo). As outras 8 falham em silêncio: a marca existe, o showcase funciona,
e ela não chega em algum canal. Por isso existe o `brand:check` (roda no CI e no
`release:check`), validado contra marca-fantasma e contra cada omissão individual.

### Os 4 canais de entrega (todos funcionam desde v0.32.0)

`npm create` (prompt "Tema de cor?") · `npm install` (subpath `theme/brand-*.css`, ≥ 0.31.1) ·
submódulo (importa do disco) · `igreen:add -- theme-<id>` (item de registry).

⚠️ **No canal `npm install`, importar o CSS não basta.** O Tailwind v4 não escaneia
`node_modules` — sem a diretiva `@source` apontando pro pacote, **nenhuma** classe do DS é
gerada e o componente renderiza sem estilo, **sem erro**. A linha tem que cobrir
`dist-lib/**` (as classes dos flutuantes vivem nos *chunks*, não no `index.mjs`). Receita
completa no `README.md` §"Consumindo por npm install". Submódulo **não** precisa: fica
dentro da raiz do projeto, então o scan já o alcança.

### ⛔ Armadilhas MEDIDAS — todas custaram retrabalho real

1. **`to-brand-overlay.ts` importa a marca com `as` (cast, não checagem).** Chave faltando ou
   com typo **não dá erro de `tsc`** — o token herda o valor da default em silêncio. Compare
   os key-sets contra a default antes de considerar pronto.
2. **Handoff externo mapeia papel→shade pra UI DELE, não pra nossa.** Seguir `semanticExample`
   ao pé da letra já (a) mapeou `bg.canvas` um degrau escuro demais e (b) comprimiu a
   separação título↔subtítulo de célula pra **1.34:1** contra 2.49:1 da default — o subtítulo
   virou o título. Showcase de cards não tem par título/subtítulo; a nossa UI é tabela densa.
   **Nosso mapeamento manda**; use o do handoff só como referência de valor.
3. **"Mais vibrante" não é operação de saturação.** Os status da default já vivem a 84–100% do
   teto de croma do próprio hue. O teto do sRGB depende de hue **e** de L: verde/amarelo picam
   claros, vermelho no meio, roxo escuro. Não existe roxo claro e saturado em sRGB. Meça o
   teto por hue **antes** de prometer vibração.
4. **Cor no teto do gamut não deriva estado por saturação.** Croma acima do teto clipa e o
   hover fica idêntico ao repouso — desça a luminosidade pelo ramp.
5. **`fg` de status no dark precisa de shade mais claro que o `[500]`.** Funciona como fundo
   sólido e reprova AA como texto sobre surface escura (medido: 3.42:1 e 2.88:1 no badge).
6. **Neutro pode precisar de rampa por MODO.** A `vibrant` tem `gray` (light, fria) +
   `grayDark` (dark, acromática) porque o light foi fechado antes de o dark mudar. É a única
   marca assim — e o `color-dark.ts` importa `grayDark as gray`.
7. **Verifique no BROWSER, com cada combinação de eixos ativa.** `tsc`, testes e
   `dead-theme-classes` passaram verdes com 13 tokens resolvendo errado no dark (L-066). Valor
   de arquivo de token não é evidência de pixel.

Doc humana pro consumidor: página **Temas de marca** (`#/themes`) + rule `ds-themes.md` do kit.
Contexto técnico: `.ai/context/tokens/color.md`.

### Padrão de chart (resumo)

```
Gráfico SEMPRE em <ChartContainer config={...}>; cor SÓ por token (chart-1..5 / config keys).
2 séries = verde(chart-1)+âmbar(chart-4) · pizza = rampa monocromática da brand.
Grid: <CartesianGrid vertical={false} strokeDasharray="4 4" /> (token chart-grid, sem stroke).
Card: Panel + CardHead (título+subtítulo) ou KPI_LABEL/KPI_VALUE (label caption-md + valor 30px).
Estreito = max-w fixo + coluna única (nunca lado-a-lado). 1 card por linha; categorias via SectionLabel.
Catálogo vivo: #/chart-showcase (ChartShowcaseDoc.tsx).
```

---

## USAGE.md por componente

**Compostos iGreen (`ui/<Nome>/`)** → `USAGE.md` por componente (API custom, vale o atalho).
**Primitivos shadcn (`shadcn/*.tsx`)** → **NÃO** criar USAGE por arquivo (API shadcn/Radix é
padrão). Existe um **índice único** `src/components/shadcn/USAGE.md` que lista **só gotchas**
(setup no root, dep extra, receita flutuante L-040, z-index L-030, ring fora do padrão).
Ao adicionar/editar um shadcn: cria/edita 1 linha **só se houver gotcha**; sem gotcha →
nada (não inflar / não estourar tokens). Doc viva do primitivo = showcase `#/<nome>`.
Checklist em `impl-shadcn.md`; o `pre-commit-check.md` valida.

Cada componente em `src/components/ui/<Nome>/` tem `USAGE.md` ao lado — atalho rápido pra IA consumir o componente sem ler source. Formato canônico:

- O que é + categoria
- Quando usar
- Props essenciais (tabela)
- Variants (tabela)
- Exemplo mínimo
- Gotchas / cuidados

---

## Auto-update protocol

Nova lição descoberta → Reviewer adiciona como L-NNN em `.ai/status/lessons.md` → atualiza resumo aqui → próxima sessão já tem a regra. Loop fechado.
