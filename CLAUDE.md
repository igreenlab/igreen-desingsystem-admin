# iGreen Design System — v2

Stack agnóstico. Tailwind e Shadcn são adapters opcionais, não a fundação.

---

## Checklist de início de sessão

Antes de qualquer tarefa, na ordem:

```
1. CLAUDE.md (este arquivo) e .claude/rules/ds-standards.md JÁ estão no seu contexto —
   os dois são carregados como project instructions, sem ação sua. Não "confirme"; use.
2. Verificar .ai/status/pipeline-state.md — há tarefa PAUSADA ou CASCATA aberta?
3. Perguntar: "Qual o foco desta sessão?"
```

> O passo 2 antigo mandava *"confirmar que ds-standards.md foi carregado
> automaticamente"* — impossível de verificar de dentro da sessão, então o agente
> respondia "sim" por construção. Verificado empiricamente em 2026-08-08: o arquivo
> **é** entregue como project instruction, junto do `CLAUDE.md`.

⛔ Não escanear src/, tokens/ ou node_modules/ sem solicitação.
⛔ Não rodar npm sem solicitação.

---

## Checklist de encerramento de sessão

Antes de encerrar uma sessão onde houve alterações:

```
1. pipeline-state.md atualizado? — se criou/modificou token ou componente, registrar
2. Há tarefa incompleta? — marcar como PAUSADO em pipeline-state.md com contexto para retomada
3. Houve lição nova? — se um padrão de erro se repetiu, registrar em lessons.md
```

⛔ Não consolidar sem confirmação do usuário.

---

## ⛔ REGRAS DE COMPORTAMENTO — LER ANTES DE QUALQUER AÇÃO

> **Numeração única, compartilhada com `.claude/rules/ds-standards.md`.** As duas listas
> são o MESMO conjunto de 8 regras, com os MESMOS números. Até 2026-08-08 não eram: este
> arquivo tinha 7 regras e a `ds-standards` tinha 8, com "Regra 7" significando coisas
> diferentes em cada um — e `orchestrator.md` citava "Regra 8", que só existia num deles.
> Referência por número com duas numerações ativas é armadilha; se você encontrar
> divergência entre os dois arquivos, é bug de doc, não escolha.

### Regra 1 — NUNCA criar token sem verificação prévia
```
1. Ler o arquivo semântico correspondente
2. Verificar se token existente já serve
3. Só criar se NENHUM existente atender
```

### Regra 2 — NUNCA criar componente sem verificar o inventário
```
1. Ler .ai/context/components/inventory.md
2. Verificar se existe em shadcn/ ou ui/
3. Só criar se COMPROVADAMENTE ausente
```

### Regra 3 — DS Dev NUNCA cria token durante implementação
```
Token faltante → PARAR → sinalizar cascata → aguardar token ser criado
```

### Regra 4 — Gate é OBRIGATÓRIO para tokens novos e componentes novos
```
DS Designer entrega spec → PARAR → apresentar ao usuário → aguardar "sim"
Aplica-se a: token novo, componente novo, extração Figma.
Não aplica-se a: edição de existente, adapters, tarefas técnicas.
```

### Regra 5 — Classes DS sempre antes de Tailwind literal
```
gap-4?    → gap-gp-md   |   p-4?      → p-sp-md
rounded?  → rounded-radius-*   |   shadow?  → shadow-sh-*
h-9?      → min-h-form-md (36px)  |   h-10? → min-h-form-lg (40px)
```

### Regra 6 — Self-interrupt obrigatório
```
"Estou prestes a criar algo novo?" → verificar se já existe antes de prosseguir
```

### Regra 7 — Gate de pre-commit antes de commit significativo
```
Release · refactor amplo · token novo · componente novo · lição nova
  → invocar .claude/skills/ds-reviewer/pre-commit-check.md ANTES de commitar
Critério de "significativo" em dúvida: ≥5 arquivos, ou qualquer toque em
tokens/, registry.json, cli/templates/ ou .claude/. Em dúvida, aplique.
```

### Regra 8 — Handoff via PR sempre (L-041)
```
Todo trabalho de componente (criar/alterar) e toda mudança significativa fecha assim:
  branch própria → commit descritivo → push no remote CANÔNICO → gh pr create → reportar o link

⚠️ ONDE A IA PARA — a linha é o MERGE, não o push:
  ✅ a IA faz sozinha: branch · commit · push da BRANCH · abrir PR
  ⛔ a IA NUNCA faz sozinha: merge · `npm publish` · bump de package.json.version
     · deploy · `git push` em `main` · force-push
  Essas 6 exigem autorização EXPLÍCITA do mantenedor na mesma sessão (L-020).

Remote canônico = o remote cuja URL é igreenlab/igreen-desingsystem-admin.
⚠️ Resolva por URL, NUNCA por nome (L-069) — o nome varia por clone:
   `origin`  em clone direto do repo da empresa e no CI
   `empresa` em clone onde `origin` é o fork pessoal (snksergio/…, parado)
Confira com `git remote -v` antes do push. Receita: `ds-dev/handoff-pr.md`.
```

> **Por que esta regra mudou de texto em 2026-08-08.** Ela dizia *"NUNCA dê `git push`
> … sozinho → pare e peça"*, enquanto a Regra 8 da `ds-standards`, o `orchestrator.md` e
> a skill `handoff-pr.md` mandavam a IA **executar** branch/commit/push/PR e parar no
> merge. Os dois arquivos são auto-carregados: o agente recebia as duas instruções e não
> tinha como saber qual valia. A intenção original era proteger **publicação** (`publish`,
> release, bump) — não o push de uma branch de trabalho, que é justamente o que produz o
> PR onde o humano decide. O texto acima separa as duas coisas.

---

## Trabalho multi-agente

```
UM agente por componente/área por vez. Antes de editar, cheque o pipeline-state.md
e avise se outro agente estiver na mesma área.
```

---

## Escopo: o que é "tela" neste repo

Não é uma proibição — é uma distinção de **onde a tela mora**:

| Pedido | Onde | Operacional? |
|---|---|---|
| Página de **showcase/exemplo** do DS (`src/preview/pages/<Nome>{Preview,Showcase}.tsx`) | **este repo** | ✅ sim — é o que os builders `/ds-create-crud`, `/ds-create-list`, `/ds-create-dashboard`, `/ds-create-screen`, `/ds-create-app`, `/ds-create-login`, `/ds-replicate-module` fazem |
| Tela de **produto do app iGreen** (feature real, rota de negócio) | repo do app | 🚧 os agentes `app-designer` e `app-dev-react` existem mas **não são roteados** (`orchestrator.md`) |
| Tela no projeto de **quem consome** o DS | repo do consumidor | ✅ pelo payload `cli/templates/default/_claude/` (skills equivalentes, adaptadas) |

> **Por que isto virou tabela em 2026-08-08.** A regra dizia *"Pedido de TELA/PÁGINA/fluxo
> é Domínio App (🚧 não operacional aqui) → vai no repo do app, não no DS"* — e o **próprio
> `CLAUDE.md`**, 120 linhas adiante, mapeava 4 tarefas de tela para `src/preview/pages/`,
> com o `orchestrator.md` roteando 9 delas. O arquivo se contradizia dentro de si mesmo
> (o defeito nº 4 catalogado na L-060). O que está 🚧 é o domínio de **produto**, não a
> construção de páginas de showcase.

> Prompt de início de sessão colável (use no começo de cada conversa, sobretudo
> com operador não-técnico): [`INICIO-DE-SESSAO.md`](INICIO-DE-SESSAO.md).

---

## Leitura automática no início de qualquer sessão

`.claude/rules/ds-standards.md` é carregado automaticamente (rules/).
Contém: regras de comportamento + mapa completo de skills + o resumo 1-linha de TODAS as
lições (L-NNN). ⚠️ A contagem mora **só** no título da seção de resumo de lá — é o único
lugar com gate (`lessons-index` confere contagem e última lição). Não a repita.

Para referência de código detalhada (padrão tv() completo, tabela de tokens, naming):
→ `.ai/rules/coding-standards.md`

---

## Hooks automáticos (pipeline autônomo)

Não precisam ser invocados. Rodam em todo Edit/Write:

| Hook | Quando dispara | O que faz |
|------|----------------|-----------|
| `ds-lint-styles.sh` | `src/components/**/*styles.{ts,tsx}` **e qualquer `src/components/**/*.tsx`** (o glob real do hook é mais largo que esta coluna dizia até 2026-08-08) | delega pra `scripts/lib/ds-lint-patterns.mjs` (fonte única com o CI) — cobre L-001/L-002/L-003/L-005 + import de tv; L-004 e L-007 saíram (são semânticas, exigem contexto cross-elemento ou julgamento de intenção — ver L-059) — warning em stderr quando encontra anti-pattern. No CI, o mesmo módulo roda em modo ratchet e só reprova violação **nova** (linha adicionada pelo diff), nunca débito legado |
| `ds-inventory-check.sh` | `src/components/ui/<Nome>/**` | alerta se USAGE.md ausente, inventory.md não menciona (L-016), não consta em `registry.json` (gap de distribuição), está no registry mas fora do **vocabulário do consumidor** (`_claude/rules/ds-components.md` ∪ `CLAUDE.md` do template — mesma união do `distribution-debt.mjs`), **ou a DocPage existe sem rota no `App.tsx`/`DOC_PAGES`+nav** (render em branco) — L-042. As duas últimas perguntas vêm dos MESMOS módulos do CI (`scripts/lib/ds-exceptions.mjs` + `showcase-registration.mjs`, via `node -e`) — hook e CI não podem divergir |
| `ds-tokens-check.sh` | `tokens/**/*.ts` — ⚠️ **exclui `tokens/transforms/`**, justamente o arquivo que a tabela "Onde cada tarefa começa" manda editar pra regra CSS global; ali o lembrete não dispara (o gate `generated-artifacts` cobre) | alerta pra rodar `tokens:tw4` + que token novo só chega no consumidor via `registry:build` + bump (`/ds-release`) |
| `ds-blocks-check.sh` | `src/blocks/**/*.tsx` (ignora `_shared/`, `_*` e `*.test.tsx`) | alerta pra rodar **`npm run blocks:build`**, que gera o índice do consumidor e o item `registry:block`. **Fica silencioso se o índice já estiver em sync** — não vira ruído a cada edição. Existe porque a galeria do showcase auto-descobre por `import.meta.glob`: o bloco **aparece na tela sem gerar**, e é isso que torna o esquecimento fácil de não notar |
| `block-rm-rf.sh` | Bash | bloqueia `rm -rf` perigoso |
| `block-sensitive-edit.sh` | Edit/Write | bloqueia .env, credentials, migrations |

Os 4 primeiros são informativos: **nenhum desfaz o Edit** — são PostToolUse, rodam depois.
Mas o canal deles não é igual, e isso foi **medido em 2026-08-17**:

| Hook | Sai com | Chega no agente? |
|---|---|---|
| `ds-inventory-check` · `ds-tokens-check` · `ds-blocks-check` | **2** quando tem pendência | ✅ sim — o harness mostra como *"blocking error"*, e o arquivo **continua escrito** |
| `ds-lint-styles` | sempre **0** | ❌ não — só no `hook-log.txt`. **Consulte o log após mexer em componente** |

> ⚠️ Até 2026-08-17 os três saíam com `exit 0`, e esta linha afirmava que o aviso chegava
> "pelo stderr". **Não chegava** — testado com Write real: nem stderr nem stdout de um hook
> `exit 0` aparecem no resultado da tool. Os avisos existiam só no log, que ninguém abre sem
> motivo. O `ds-lint-styles` segue em `exit 0` **de propósito**: em modo `--file` ele varre o
> arquivo inteiro, e 10 dos 223 arquivos de `src/components/` têm débito legado que o ratchet
> do CI congela — avisar sobre ele em cada Edit seria aviso ignorado (L-059).

⛔ **Não há formatador automático — e é deliberado (decisão de 2026-07-29).** `prettier` não
está no `package.json`; havia um hook `format-on-save.sh` que o chamava via
`npx --no-install`, ou seja, **no-op** desde sempre — mas que ligaria sozinho se alguém
populasse o cache do npx, reformatando arquivo sem ninguém ter pedido (aconteceu uma vez).
Hook e script removidos. **Formate na mão**: espelhe a indentação e as quebras do código
vizinho. Não reintroduza prettier sem decisão do mantenedor.

Logs em `.ai/scratch/hook-log.txt`.

---

## Arquitetura de tokens (3 tiers)

```
# Base path real dos arquivos abaixo: tokens/brands/default/
#   primitives/* · semantic/* · components/*
TIER 1 — Primitives (API privada, nunca em componentes) — em primitives/
  color-palette.ts · scales.ts · fonts.ts · motion.ts

TIER 2 — Semantic (API pública via CSS vars) — em semantic/
  color-light.ts / color-dark.ts
  spacing.ts · sizing.ts · shape.ts · elevation.ts · typography.ts

TIER 2.5 — Component tokens — em components/
  components/sizing.ts  → form.* · layout.* · icon.* · container.*
  components/spacing.ts → padCard.* · padPage.*

  ↓ transforms/to-tailwind-v4.ts → src/styles/theme/tailwind-theme.css
  ↓ consumidos via classes: gap-gp-*, rounded-radius-*, shadow-sh-*, etc.
```

---

## Prefixos CSS — anti-colisão com Tailwind nativo

| Token | Classe DS | Nunca usar |
|-------|-----------|------------|
| gap | `gap-gp-md` | `gap-4` |
| space | `p-sp-md` | `p-4` |
| pad | `px-pad-lg` | `px-3` |
| radius | `rounded-radius-base` | `rounded-sm/md/lg` |
| shadow | `shadow-sh-md` | `shadow-sm/md/lg` |
| form height | `min-h-form-lg` (40px) | `h-10` |
| form height | `min-h-form-md` (36px) | `h-9` |
| icon | `size-icon-md` | `size-5` |
| container | `max-w-md` (escala do DS: 768px) | — **única exceção: não dobra prefixo** |

---

## Nomenclatura de cores

⚠️ Fonte de verdade = `tokens/brands/default/semantic/color-light.ts` e o CSS gerado
(`src/styles/theme/tailwind-theme.css`). Nome que não estiver lá **não emite CSS** — a
classe some em silêncio (não quebra build, `tsc` nem teste). Gate: `dead-theme-classes`
no `npm test`.

- `brand` = cor da marca. NÃO é "texto principal", e **não** se chama `primary`
- `fg.default` = texto padrão (neutral) — **não** `fg.foreground`
- `border.default` = borda padrão — **não** `border.main`
- `danger` = feedback destrutivo — **não** `critical` (primitivo, tokens e CSS usam `danger`; APIs antigas como `Button.color="critical"` mapeiam pra tokens `-danger` internamente)
- `on-*` = texto sobre cor de marca (`fg.on-brand`)
- `ring.*` = focus rings — NUNCA `border.*` para isso. Classe: `ring-ring-brand`
- Tom sutil **depende da família**: status (`success`/`warning`/`danger`/`info`) usa **`-muted`** (`bg-bg-success-muted`, `border-border-warning-muted`) · `brand` usa **`-subtle`** (`bg-bg-brand-subtle`) · papel neutro usa `-subtle` sem cor (`bg-bg-subtle`, `fg-subtle`, `border-subtle`). Não há `bg-bg-success-subtle` nem `border-border-warning` cru

> Os nomes `primary` / `foreground` / `critical` / `main` são a nomenclatura **V2, extinta**.
> Em 2026-07-30 havia 25 usos delas em `src/` — 9 de `ring-ring-primary` em 4 componentes
> distribuídos, com o anel de foco caindo em `currentColor`. Vinham desta seção, que
> ensinava V2.

---

## Onde cada tarefa começa

| Tarefa | Arquivo a editar | Skill do agente |
|--------|------------------|----------------|
| Nova cor semântica | `color-light.ts` + `color-dark.ts` | `ds-designer/spec-token.md` (tipo=color) |
| Novo spacing | `spacing.ts` | `ds-designer/spec-token.md` (tipo=spacing) |
| Novo sizing/height | `components/sizing.ts` | `ds-designer/spec-token.md` (tipo=sizing) |
| Novo radius/border | `shape.ts` | `ds-designer/spec-token.md` (tipo=radius) |
| Nova shadow | `elevation.ts` | `ds-designer/spec-token.md` (tipo=shadow) |
| Novo preset tipográfico | `typography.ts` | `ds-designer/spec-token.md` (tipo=typography) |
| **Marca / tema de cor novo** (overlay `[data-theme]`) | `tokens/brands/<id>/` + 10 outras superfícies | `brand-builder/SKILL.md` via `/ds-create-brand` |
| Spec de componente novo | — | `ds-designer/spec-component.md` |
| Extração do Figma | — | `ds-designer/figma-extract.md` |
| Implementar token | arquivo semântico | `ds-dev/impl-token.md` |
| Componente iGreen (tv()) | `ui/[Nome]/` | `ds-dev/impl-igreen.md` |
| Componente Shadcn | `shadcn/[nome].tsx` | `ds-dev/impl-shadcn.md` |
| Componente composto | `ui/[Nome]/` | `ds-dev/impl-composite.md` |
| Editar visual existente | `[nome].styles.ts` APENAS | `ds-dev/impl-igreen.md` |
| Revisar token | — | `ds-reviewer/SKILL.md` |
| Revisar componente | — | `ds-reviewer/review-component.md` |
| Atualizar Updates timeline | `src/preview/pages/updates-data.ts` | `ds-dev/update-changelog.md` |
| Release completa (changelog + bump + commit + PR) | `updates-data.ts` + `package.json` + git | `ds-dev/release.md` |
| Tela CRUD/tabela (DataTable) | `src/preview/pages/<Nome>Preview.tsx` + registro `App.tsx` + `doc-nav-data.ts` | `crud-builder/SKILL.md` via `/ds-create-crud` |
| Tela lista de cards (DataList) | `src/preview/pages/<Nome>Preview.tsx` + registro `App.tsx` + `doc-nav-data.ts` | `list-builder/SKILL.md` via `/ds-create-list` |
| Tela dashboard/painel (KPIs + gráficos + rankings/resumos) | `src/preview/pages/<Nome>Showcase.tsx` + registro `App.tsx` + `doc-nav-data.ts` | `dashboard-builder/SKILL.md` via `/ds-create-dashboard` (ancora em `.ai/context/components/dashboard-patterns.md`) |
| Tela de dados (não sabe se tabela, lista ou dashboard) | — | front-door `/ds-create-screen` (desambigua e roteia) |
| Gráfico isolado (sem o resto do painel) | `src/components/ui/Chart` (wrapper) + página em `src/preview/pages/*ChartDoc.tsx` | Padrões: `.ai/context/components/chart-patterns.md` + `Chart/USAGE.md` (L-032) |
| **Bloco novo** (composição referenciável por ID) | `src/blocks/<categoria>/<nome>.tsx` com `export const BLOCK = { id, nome, descricao, usa }` → **`npm run blocks:build`** | Spec: [`.ai/specs/blocks-catalogo-de-composicoes.md`](.ai/specs/blocks-catalogo-de-composicoes.md). Regras do arquivo: **só API pública do DS** (§4.1) · id `dsgreen-<categoria>-<n>`, e o segmento é a **pasta** (§9.1) · o JSDoc do topo é **instrução executável**, não comentário — foi ele que produziu o bom resultado no consumidor, com uma seção "Cuidado ao adaptar" dizendo o que ligar a estado e o que remover |
| **Categoria nova de bloco** (kpi, listas…) | pasta em `src/blocks/<nova>/` + página `src/preview/pages/Blocks<Nova>Doc.tsx` (copie a de Gráficos: ela auto-descobre por `import.meta.glob`) + registro no `App.tsx` e `doc-nav-data.ts` | Raro de propósito — bloco novo dentro de categoria existente **não** pede nada disso |
| **Marca/tema NOVO** (5ª, 6ª…) | `tokens/brands/<id>/` (3 arquivos) + **10 superfícies** | `.claude/rules/ds-standards.md` §"Sistema multi-marca" |
| **Alterar cor de marca existente** | `tokens/brands/<id>/semantic/color-{light,dark}.ts` APENAS | idem — nunca editar `brand-*.css`, é gerado |
| **Regra CSS global, `@utility`, `@font-face`, `@custom-variant`** | `tokens/transforms/to-tailwind-v4.ts` + `npm run tokens:tw4` — **nunca `globals.css`** | `.claude/rules/ds-standards.md` §"O tema gerado é a fonte única" |

---

## Sistema multi-marca (temas)

5 marcas coexistem: `default` · `blue` · `green` · `pay` · `vibrant`. Cada não-default é um
**overlay de cor** escopado em `[data-theme="<id>"]`, gerado por `npm run tokens:brand:<id>`.

⚠️ **Marca muda SOMENTE cor.** Spacing, sizing, radius, elevation e tipografia vêm sempre de
`brands/default/` — o `to-tailwind-v4.ts` os importa fixos de lá. Pedido de "mudar o
espaçamento/fonte só nesta marca" **não é tema**; pare e pergunte.

Detalhe completo (contrato dos 3 arquivos, as 10 superfícies, os 4 canais de entrega e as
armadilhas medidas) em `.claude/rules/ds-standards.md` §"Sistema multi-marca" — que é
auto-carregada. Doc humana: página **Temas de marca** do showcase (`#/themes`).

---

## Regra de ouro

Componente NUNCA importa primitivos ou tokens semânticos diretamente.
Componente SEMPRE usa classes CSS geradas via `*.styles.ts` com `tv()`.

**Dependency flow:** primitives → semantic → to-tailwind-v4 → CSS vars → tv() classes → componente

## ⛔ Segunda regra de ouro — `globals.css` é do showcase, não do sistema

`src/styles/theme/tailwind-theme.css` (gerado) é o **único arquivo que os 4 canais leem**.
Além das CSS vars, ele carrega hoje: `@font-face` Geist, `--font-sans`/`--font-mono`,
`@custom-variant dark`, regras de `html`/`body`/`button`, `@utility outline-float`,
`@utility scrollbar-*` e a regra do bottom-sheet mobile.

Nada disso pode ser **redeclarado** no `globals.css`. Duplicar é pior que faltar: classe sem
layer vence `@utility` e a segunda declaração de `@custom-variant` vence a primeira — o
showcase passa a mostrar o comportamento certo enquanto o consumidor recebe o errado.
Foi assim que 6 defeitos ficaram invisíveis por meses. Detalhe + os gates que cobrem isso
(`orphan-utilities`, `runtime-base.test`): `.claude/rules/ds-standards.md`.

---

## Regras críticas de código

- Zero hardcoded (`#fff`, `16px`, `0.875rem` → proibido)
- Tipografia via presets, rem/clamp — nunca px
- `tv` de `@/utils/tv` (nunca `tailwind-variants`)
- `disabled` sempre como último `compoundVariant`
- Mudar visual = mudar só `[nome].styles.ts`
- Dark mode = só `color-dark.ts`
- Após tokens: `npm run tokens:tw4`

---

## Hierarquia de fonte única — onde buscar cada coisa

⚠️ **Cada tipo de informação tem 1 fonte canônica.** Sem duplicação entre `.claude/` e `.ai/`. Quando ambos teriam, o pipeline aponta de um pro outro.

### `.claude/` — Pipeline organizacional (Claude Code)

| Pasta | Função | Carregamento |
|---|---|---|
| `agents/` | IDENTIDADE dos 6 agents (papel + workflow) | Sob demanda via subagent |
| `commands/` | SLASH commands (entry points) | Quando user digita `/<nome>` |
| `skills/<agent>/` | COMO fazer (templates + checklists) | Sob demanda via SkillTool |
| `rules/` | REGRAS — todo `.md` daqui entra como project instruction | **Sempre**, a sessão inteira (o `globs:` do frontmatter é sintaxe do Cursor e é INERTE aqui — não há escopo por glob) |
| `hooks/` | AUTOMAÇÕES shell (sempre disparam) | Auto via settings.json |
| `output-styles/` | SHAPE da resposta | Auto via settings.json |
| `settings.json` | Control panel (permissions + hooks + outputStyle) | Auto |

### `.ai/` — Contexto técnico do projeto

| Pasta | Função | Carregamento |
|---|---|---|
| `context/` | CONTEXTO técnico (architecture, tokens, components, doc-guide) | Sob demanda |
| `rules/coding-standards.md` | REFERÊNCIA longa do padrão tv() | Sob demanda |
| `status/pipeline-state.md` | AUDIT log (append-only) | Sempre verificar no início |
| `status/lessons.md` | LIÇÕES completas L-NNN | Sob demanda |
| `status/BACKLOG.md` | Backlog de features | Sob demanda |
| `specs/` | SPECS de design com **status declarado** — a maioria é `IMPLEMENTADA` e fica como referência de decisão, não como frente aberta. Índice em [`.ai/specs/README.md`](.ai/specs/README.md) | Sob demanda |

### Co-localizado com o código

| Arquivo | Função |
|---|---|
| `src/components/ui/<Nome>/USAGE.md` | ATALHO IA por componente (consumir sem ler source) |
| `src/components/ui/<Nome>/<nome>.styles.ts` | Fonte de verdade visual (tv()) |

### Fontes únicas críticas

| Tipo de informação | Fonte canônica única |
|---|---|
| Regras DS + lições (L-NNN) + anti-patterns | `.claude/rules/ds-standards.md` |
| Identidade do orchestrator + roteamento | `.claude/agents/orchestrator.md` |
| Templates de implementação iGreen (tv()) | `.claude/skills/ds-dev/impl-igreen.md` |
| Padrão tv() completo (referência longa) | `.ai/rules/coding-standards.md` |
| Arquitetura completa | `.ai/context/architecture.md` |
| Inventário de componentes | `.ai/context/components/inventory.md` |
| Tokens por tipo | `.ai/context/tokens/<tipo>.md` |
| Audit log de decisões | `.ai/status/pipeline-state.md` |
| Lições completas (L-NNN formato canônico) | `.ai/status/lessons.md` |
| Doc humana do pipeline | `README-PIPELINE-WORKFLOW.md` (raiz) |

---

## Preview app

`npm run dev` → porta 3100
Componentes iGreen: `src/components/ui/`
Componentes Shadcn: `src/components/shadcn/`

## Stack / arquitetura detalhada

Ler `.ai/context/architecture.md`
