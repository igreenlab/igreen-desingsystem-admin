# Governança de contribuição — de convenção pra gate no servidor

Spec viva da iniciativa de governança de PR/distribuição. Não substitui `CLAUDE.md`
nem `.claude/rules/ds-standards.md` (regras de comportamento continuam valendo).
Define **o que** vamos construir e **por quê**.

> Objetivo: hoje o gate de qualidade do DS mora na cabeça de quem tem contexto
> completo (o mantenedor). Um contribuidor sem esse contexto — humano ou agente de
> IA "vibe coding" — consegue hoje abrir PR, alterar estrutura, criar componente/token
> fora do padrão, e nada trava automaticamente. O objetivo é mover o gate pro
> **servidor** (GitHub) e pro **momento da criação** (não na hora que o mantenedor lê
> a PR), sem depender de ferramenta paga de terceiro (restrição explícita: segurança +
> custo).

---

## 1. Estado atual (verificado no repo — 2026-07-29)

- **Branch protection em `main`: NÃO EXISTE.** `gh api repos/igreenlab/igreen-desingsystem-admin/branches/main/protection`
  retorna 404. Hoje qualquer colaborador com permissão `push` pode commitar direto em
  `main`, sem PR, sem review, sem CI rodando antes do merge. Isso é mais grave do que
  a suposição inicial — não é "falta reforçar", é "não existe nenhum gate".
- **`CODEOWNERS` não existe** (`.github/CODEOWNERS` ausente).
- **27 colaboradores** no repo `igreenlab/igreen-desingsystem-admin` (público). A
  identidade autenticada usada nesta sessão tem `push:true` mas `admin:false` —
  **não consigo configurar branch protection, CODEOWNERS enforcement, Environments
  ou secrets via API a partir daqui**; isso exige alguém com admin no repo (ver §5).
- **`.github/workflows/ci.yml`** hoje roda em PR+push pra `main`: `npm ci` → `tsc
  --noEmit` → `npm test` → `registry-check.mjs` → `check-foundationals.mjs` →
  `examples-drift-check.mjs --ci`. Nenhum desses checks é "required status check"
  (porque não há branch protection) — ou seja, mesmo o CI que já existe hoje é
  **decorativo**: roda, mas nada impede merge se falhar.
- **`distribution-debt.mjs` já suporta `--ci`** (`process.exit(isCi ? 1 : 0)`,
  linha 80) — já teria capacidade de falhar quando um componente não está no
  `registry.json`/catálogo do CLI, mas **não está chamado em `ci.yml`**. É a
  correção de menor esforço e maior valor do pacote inteiro: 1 linha nova em
  `ci.yml` já fecha boa parte do gap que deixou o `ChoroplethMap` sumir sem
  ninguém notar (L-058).
- **Os 3 hooks** (`ds-lint-styles.sh`, `ds-inventory-check.sh`,
  `ds-tokens-check.sh`) são scripts bash confirmados **puramente locais**: rodam
  só como `PostToolUse` do Claude Code, usam `set +e` e terminam com `exit 0`
  hard-coded independente do que encontrarem — nunca bloqueiam nada, nem local
  nem em CI (não existe invocação deles fora do hook). Logam em
  `.ai/scratch/hook-log.txt`.
- **npm**: `npm owner ls` confirma **1 único owner** (`snksergio`) em ambos os
  pacotes (`@snksergio/design-system` e `@snksergio/create-design-system`) — "só
  eu publico" já é verdade no nível do npm hoje. O gap não é permissão de
  publish, é (a) o processo até chegar lá exigir hoje colar um token bruto na
  sessão (feito manualmente nesta mesma conversa, mais cedo) e (b) não haver
  sinal automático de "isso aqui ficou pendente de publish".

---

## 1.1 Baseline medido — ⚠️ a assumption central era FALSA

> Medição executada em 2026-07-29 replicando exatamente os greps de
> `ds-lint-styles.sh` contra **todos** os `*.styles.ts` do repo, e a lógica de
> `ds-inventory-check.sh` contra todos os `src/components/ui/*`. Esta seção
> existe porque a versão anterior desta spec assumia "os hooks portam pra CI
> sem reescrever a detecção" — **a medição derrubou isso**.

### `ds-lint-styles.sh` — 14 de 40 arquivos (35%) falhariam hoje

| Regra | Hits | Triagem |
|---|---|---|
| L-002b pad/space literal | 31 | **31 falso-positivo (100%)** — todos são `p-0`/`py-0`/`px-0`/`pl-0` |
| L-002d `rounded-N` nativo | 9 | **ambíguo** — todos são `rounded-full` |
| L-004 `outline-none` sem `focus-visible` | 8 | **ambíguo** — todos em `TableToolbar`, padrão "reset no filho, ring no wrapper" |
| L-002a `gap-N` literal | 2 | **2 falso-positivo (100%)** — ambos `!gap-0` |
| L-002c height fixo | 1 | **violação real** — `w-9 h-9` em `sidebar.styles.ts:158` (devia ser `size-comp-*`) |
| **Total** | **51** | **33 falso-positivo (65%) · 17 ambíguo · 1 real** |

**Causa raiz do falso-positivo (bug real no hook, não no código do DS)**: as
alternações numéricas dos patterns incluem `0` —
`\b(px|py|pt|pb|pl|pr|p)-(0|1|2|...)` e `\bgap-(0|1|2|...)`. Mas **não existe
token DS para zero** (ninguém escreve `p-sp-none`); `p-0`/`gap-0` são resets
legítimos, frequentemente com `!` pra sobrescrever base de um shadcn. Tirar o
`0` das duas alternações elimina 33 dos 51 hits (65% do ruído) **sem perder
nenhuma detecção real**.

### As 2 questões de política — RESOLVIDAS com evidência

Na primeira versão desta seção eu devolvi as duas como "decisão sua". Investiguei
e **as duas se resolvem com dado objetivo** — não precisam de julgamento:

#### 1. `rounded-full` (9 hits) → **exceção legítima, o pattern está errado**

Comparei o valor nativo do Tailwind v4 com o token DS emitido em
`tailwind-theme.css:197-208`:

| chave | Tailwind nativo | DS `rounded-radius-*` | |
|---|---|---|---|
| `sm` | 0.25rem | 0.375rem | **DIFERENTE** |
| `md` | 0.375rem | 0.5rem | **DIFERENTE** |
| `lg` | 0.5rem | 0.625rem | **DIFERENTE** |
| `xl` | 0.75rem | 0.875rem | **DIFERENTE** |
| `2xl` | 1rem | 1.125rem | **DIFERENTE** |
| `3xl` | 1.5rem | 1.375rem | **DIFERENTE** |
| `none` | 0 | 0px | **IDÊNTICO** |
| `full` | 9999px | 9999px | **IDÊNTICO** |

Aí está a razão de existir da regra: usar `rounded-lg` nativo entrega **0.5rem
em vez de 0.625rem** — defeito visual silencioso, real. Mas `rounded-full` e
`rounded-none` são **numericamente idênticos** aos tokens DS: usar um ou outro
não pode causar defeito nenhum, nunca.

**Conclusão**: o `Button` nunca violou a regra — a regra era larga demais. O
pattern deve ser `rounded-(sm|md|lg|xl|2xl|3xl)`, sem `none` e sem `full`. Isso
elimina os 9 hits legitimamente (não é baixar a régua, é parar de sinalizar o
que provadamente não é defeito). Consistência estética entre `rounded-full` e
`rounded-radius-full` (55 vs 134 usos) segue sendo desejável, mas é cosmético —
não é trabalho de gate bloqueante.

#### 2. `outline-none` (8 hits) → **não pertence ao gate determinístico**

Inspecionei os 8 casos. O foco está visível em todos:
- **4 hits** têm `focus-visible:shadow-sh-ring` no próprio elemento
  (`table-toolbar.styles.ts:124,184,264,273`).
- **1 hit** (`toolbarSearchInput:84`) é o `<input>` interno cujo wrapper
  `toolbarSearch` carrega `focus-within:border-border-brand
  focus-within:shadow-sh-ring` (linha 69) — o padrão de composição correto.
- Os 3 restantes seguem o mesmo formato de wrapper.

O bug do check: L-004 assume que o único indicador de foco válido é
`focus-visible:outline-*`, mas o padrão canônico do próprio DS (documentado em
`ds-standards.md`) usa `focus-visible:ring-4 ring-ring-*` **ou**
`focus-visible:shadow-sh-ring` — e, em composição, `focus-within:` no wrapper,
que pode estar em **outro `tv()`, outro arquivo**.

**Conclusão**: L-004 é irredutivelmente semântico — exige raciocínio
cross-elemento que grep não faz. Sai do gate determinístico e vai pra **Camada
3** (revisor semântico), que consegue olhar o wrapper. Isso gera uma
classificação nova que vale pro design todo:

| Categoria | Regras | Por quê |
|---|---|---|
| **Gate determinístico** (Camada 2) | L-001 (`ring/N`), L-002 (heights/pad/gap/rounded/shadow), L-003 (`ring-3`), L-005 (`bg-input/N`), import de `tailwind-variants` | erradas **independente de contexto** — valor divergente ou classe inexistente |
| **Só semântico** (Camada 3) | L-004 (afordância de foco pode estar no wrapper), L-007 (escolha de preset tipográfico depende de intenção) | exigem contexto cross-elemento ou julgamento de intenção |

Ou seja: **nem toda lição cabe no gate mecânico** — e forçar as semânticas lá
gera exatamente o falso-positivo que faz o time desligar o check.

### `ds-inventory-check.sh` — 7 componentes falhariam hoje

```
ConversationListItem → fora do inventory      MessageBubble          → fora do inventory
DateSeparatorChip    → fora do inventory      MessageComposer        → fora do inventory
MessageAck           → fora do inventory      MessageVariablesPicker → fora do inventory
DatePicker           → sem USAGE.md
```

**Achado importante — os dois scripts discordam sobre o que é intencional**: os
6 primeiros são internos do `example-chat` e **já estão na lista `IGNORE` do
`distribution-debt.mjs`** (linhas 34-41: "distribuídos junto do exemplo, não
como itens avulsos"). Ou seja, `distribution-debt.mjs` sabe que são exceção
deliberada, mas `ds-inventory-check.sh` **não tem lista de exceção nenhuma**
(só um skip hard-coded de `TabelaTeste` pro check de registry). Promover o hook
a gate sem unificar essa lista = 6 falhas garantidas por design divergente
entre dois scripts do mesmo repo.

`DatePicker` sem `USAGE.md` é gap genuíno (componente distribuído, sem o atalho
de doc que a convenção exige).

### Consequência para o design (§3 Camada 2 revisada)

"Rodar os greps nos arquivos alterados e falhar" **não funciona** — 35% dos
arquivos de estilo têm hit pré-existente, e 2 de cada 3 hits são bogus. Uma PR
que só mexesse numa linha do `TableToolbar` falharia por 8 violações que já
estavam lá. O design precisa de:

1. **Corrigir os patterns**: tirar `0` das alternações de pad/gap; tirar `none`
   e `full` do rounded; **remover L-004 do gate** (vai pra Camada 3).
2. **Unificar a lista de exceção** do inventory-check com o `IGNORE` do
   `distribution-debt.mjs` (fonte única).
3. **Ratchet, não gate absoluto**: falhar só em violação introduzida **nas
   linhas adicionadas pelo diff**, nunca em linha pré-existente de arquivo
   tocado. Débito legado fica congelado onde está; o que se impede é a fila
   crescer.

### ✅ Ratchet validado por protótipo (não é mais assumption)

Construí e rodei um protótipo (`ratchet-proto.mjs`, scratchpad da sessão) que
faz `git diff -U0` → parse dos hunks (`@@ -a,b +c,d @@` → nº de linha real) →
aplica os patterns corrigidos só nas linhas `+`. Testado contra
`table-toolbar.styles.ts`, o arquivo mais sujo do repo (8 hits pré-existentes):

| Teste | Cenário | Esperado | Resultado |
|---|---|---|---|
| 1 | linha **limpa** adicionada em arquivo com 8 violações pré-existentes | exit 0 | ✅ exit 0 — pré-existentes ignoradas, só as 4 linhas novas varridas |
| 2 | linha **suja** (`gap-4 h-9 rounded-lg ring-3 ring-ring-brand/30`) | exit 1 | ✅ exit 1 — pegou todas as 5 (L-001, L-002×3, L-003) |
| 3 | os falso-positivos (`!gap-0 !p-0 py-0 px-0 rounded-full rounded-none outline-none`) | exit 0 | ✅ exit 0 — nenhum dispara com os patterns corrigidos |

Repo restaurado ao estado limpo após os testes (`git status` vazio). A mecânica
está provada: **é implementável e se comporta como o design exige**.

> Scripts de diagnóstico (não são o check final, ficam fora do repo no
> scratchpad da sessão): `measure-lint-baseline.mjs` (mediu o baseline) e
> `ratchet-proto.mjs` (validou a mecânica + carrega os patterns já corrigidos).
> A implementação da Fase 2a-ii deve partir do segundo.

---

## 2. Decisões

### 2.1 Sem ferramenta de terceiro (bot de IA pago)

Descartado explicitamente por você: custo recorrente por seat + duplicar as
regras do DS num formato de config de terceiro (`.coderabbit.yaml` etc.) cria uma
segunda fonte de verdade que diverge do `ds-standards.md` real com o tempo, e
levanta questão de segurança (diff do código passando por serviço externo).

### 2.2 Camada semântica = Claude Code Action, reaproveitando o `ds-reviewer` já escrito

Em vez de ensinar regras num bot terceiro, uma Action que roda uma sessão real de
Claude Code dentro do próprio repo — carrega `CLAUDE.md`/`ds-standards.md` do
jeito automático de sempre, aplica o skill `ds-reviewer/review-component.md`
contra o diff. Zero duplicação de regra; o "reviewer" é literalmente o mesmo que
já usamos.

### 2.3 Camada estrutural = promover o que já existe, não reescrever do zero

`distribution-debt.mjs --ci` já existe e só precisa ser chamado (Fase 1, risco
zero). Já os hooks **não** são um "promover e pronto" — a medição do §1.1
mostrou que os patterns têm bug de falso-positivo (65%) e que há débito
pré-existente e listas de exceção divergentes entre scripts. A reformulação:

- **`ds-lint-styles.sh`** → a *lógica de detecção* é reaproveitável, mas os
  patterns precisam de correção (tirar `0`) e o modo CI precisa ser **ratchet
  por linha adicionada**, não por arquivo. Na prática isso é um script novo em
  `scripts/` (JS, pra parsear hunk de diff com confiabilidade) que herda os
  patterns do hook — o hook local continua como está, os dois passam a
  compartilhar a mesma tabela de patterns como fonte única.
- **`ds-inventory-check.sh`** → mesma ideia, mas o bloqueio é diferente:
  precisa primeiro **unificar a lista de exceção** com o `IGNORE` do
  `distribution-debt.mjs` (hoje divergem, §1.1), senão falha em 6 componentes
  que já foram declarados exceção deliberada em outro script.
- **`ds-tokens-check.sh`** → não tem lógica de violação nenhuma hoje; nada a
  promover. Ver §3 Camada 2 e §6 Fase 2b.

O princípio de "não duplicar regra em formato de terceiro" se mantém — a
alternativa descartada segue sendo um linter genérico reaprendendo os mesmos
greps. O que muda é reconhecer que reaproveitar ≠ copiar o `exit code`.

### 2.4 "Checklist de não-publicado" = changeset-lite, não Bit.dev/registry versionado

Adotar o pacote `changesets` completo (ou um workspace Bit.dev) foi descartado —
troca de paradigma grande demais pro problema real, que é só "declarar no
momento do PR o que vai precisar de ação de distribuição depois". Uma convenção
de arquivo simples (`.changes/<slug>.md`) + 1 script de agregação resolve sem
adotar uma ferramenta inteira nova.

### 2.5 Segurança de publish = OIDC Trusted Publishing + Environment gate, não mais token manual

Elimina definitivamente o padrão "colar token no chat" que usamos nesta sessão
(funcionou, mas é exatamente o tipo de manuseio de credencial que queremos parar
de fazer). GitHub Environment com "required reviewer" = você fisicamente aprova
cada publish antes de rodar, independente de quem/o que abriu o PR que levou até
ali.

---

## 3. Design por camada

### Camada 1 — Base intransponível (GitHub nativo)

**Arquivos**: `.github/CODEOWNERS` (novo).
**Config externa (não é código)**: branch protection em `main` via
Settings → Branches (ou `gh api repos/.../branches/main/protection` **por
alguém com admin**).

- `CODEOWNERS` atribui aprovação obrigatória em `src/components/**`,
  `tokens/**`, `registry.json`, `cli/**`, `.github/**` a `@snksergio` (dono
  confirmado do npm) — **e possivelmente `@leandrosfreire`**, que consta na
  lista de colaboradores e é citado como mantenedor em `CLAUDE.md`. **Preciso
  que você confirme os handles exatos antes da implementação** — não vou
  adivinhar quem entra no CODEOWNERS.
- Branch protection: exige PR pra `main` (bloqueia push direto — fecha o 404
  encontrado em §1), exige aprovação de Code Owner, exige os status checks das
  Camadas 2/3 (uma vez existentes) como "required".

### Camada 2 — Gate determinístico em CI

**Arquivos tocados**: `.github/workflows/ci.yml`, os 3 scripts em
`.claude/hooks/*.sh` (ganham modo CI), possível script novo
`scripts/ci-lint-styles.mjs` se portar bash→node for mais robusto em runner
Ubuntu do que reusar os `.sh` diretamente (decisão de implementação, não de
design).

- Passo imediato e de baixíssimo risco: adicionar
  `node scripts/distribution-debt.mjs --ci` em `ci.yml` — já existe, já
  funciona, só falta a linha.
- **`ds-lint-styles.sh` / `ds-inventory-check.sh` → check de ratchet** (design
  revisado pela medição do §1.1 — a versão anterior desta spec dizia "ganham
  modo CI e falham se `$FOUND > 0`", o que a medição provou inviável):

  **Pré-requisitos** (as 2 questões de política já foram resolvidas com
  evidência no §1.1 — sobraram só correções mecânicas):
  1. Corrigir os patterns, aplicando **também no hook local** (ele avisa errado
     hoje): remover `0` das alternações de `pad/space` e `gap`; remover `none` e
     `full` do `rounded`; **remover L-004 do conjunto determinístico** (migra
     pra Camada 3, ver classificação no §1.1). Efeito medido: os 51 hits atuais
     caem pra **1** (o `w-9 h-9` real do sidebar).
  2. Unificar a lista de exceção do inventory-check com o `IGNORE` do
     `distribution-debt.mjs` (extrair pra um `.ds-exceptions.json` ou módulo
     compartilhado — fonte única, senão volta a divergir).

  **Mecânica do ratchet** — ✅ validada por protótipo, 3/3 testes (§1.1):
  `git diff -U0 origin/main...HEAD` nos `*.styles.ts` alterados → parse dos
  hunks → roda os patterns **só nas linhas com `+`**. Violação em linha
  adicionada → `exit 1`. Violação pré-existente em arquivo tocado → ignorada.
  Isso é o que permite ligar o gate com 35% dos arquivos "sujos" sem travar
  ninguém.

  **Onde mora**: script novo em `scripts/` (JS — parse de hunk em bash é
  frágil), compartilhando a tabela de patterns com o hook local como fonte
  única. O hook local permanece `exit 0` sempre (avisa, não bloqueia) — só o
  CI decide bloquear.
- **`ds-tokens-check.sh` é um caso à parte** — hoje ele **não tem nenhuma
  lógica de violação**: dispara incondicionalmente sempre que qualquer
  `tokens/**/*.ts` muda, só como lembrete de "rode `tokens:tw4`". Não existe
  hoje nenhum check (nem aqui, nem em `check-foundationals.mjs`) que valide se
  o CSS gerado (`tailwind-theme.css`) está de fato sincronizado com o
  token-fonte. Promover esse hook a gate obrigatório *como está* falharia
  100% das vezes que alguém tocar token (falso-positivo garantido) — pra virar
  check de verdade precisaria de lógica nova: rodar `tokens:tw4` em CI e
  diffar o output contra o que está commitado, falhando só se divergir. Essa
  lógica **não existe ainda e não está coberta por este design** — decisão:
  fica de fora da promoção a "obrigatório" até ser desenhada à parte (ver
  Fase 2b no rollout, §6).

### Camada 3 — Revisão semântica

**Correção pós-pesquisa (WebFetch na doc oficial, 2026-07-29)**: existem **2
produtos distintos** da Anthropic pra isso, com trade-offs diferentes —
detalhado abaixo. Escolha: **3b**, pelos motivos na comparação.

#### Opção 3a — "Code Review" gerenciado (claude.ai/admin-settings)

Serviço gerenciado, roda na infra da Anthropic (não consome minuto de GitHub
Actions). Confirmado por doc oficial:
- Lê `CLAUDE.md` automaticamente e sinaliza violação como finding `nit`. Tem um
  arquivo **`REVIEW.md`** dedicado (raiz do repo) — instruções só-de-review,
  injetadas como prioridade máxima no prompt de cada agente — é literalmente o
  mecanismo certo pra apontar pro checklist do `ds-reviewer` sem misturar com
  o `CLAUDE.md` geral.
- Trigger por repo: "Once after PR creation" / "After every push" / "Manual"
  (via `@claude review`).
- **Achado importante**: o check run desse serviço **sempre fecha com
  conclusão "neutral"** — "não bloqueia merge via branch protection" **por
  design**, mesmo se configurado required. Pra realmente bloquear, sua própria
  CI precisaria ler o resumo machine-readable do check run
  (`bughunter-severity` no output) e decidir. Ou seja, isso **não vira
  required check sozinho** — precisaria de um wrapper.
- **Custo real, não estimado**: **$15-25 por review**, escalando com
  tamanho/complexidade da PR e por push (se modo "After every push"). Cobrado
  via usage credits, separado do plano.
- **Requer plano Team ou Enterprise do Claude** (não funciona em plano
  inferior) + quem configura precisa ser **Owner/Primary Owner da organização
  Claude** (claude.ai/admin-settings) — é uma camada de aprovação **diferente**
  de admin do GitHub, adicional à lista do §5. **Preciso que você confirme se
  a organização tem esse plano** antes de considerar essa opção viável.

#### Opção 3b — Self-hosted via `anthropics/claude-code-action@v1` (recomendada)

Roda dentro do **nosso** `ci.yml`, consumindo minuto de GitHub Actions +
`ANTHROPIC_API_KEY` normal (mesmo mecanismo de billing que já usamos, sem
assinatura nova). Confirmado por doc oficial (`code.claude.com/docs/en/github-actions`):
- Suporta disparo automático em `pull_request: types: [opened, synchronize]`
  (não só menção `@claude`) — a doc mostra literalmente um exemplo desse
  formato pra rodar um skill review em toda PR nova.
- **Suporta invocar skill do próprio repo diretamente**: `actions/checkout`
  antes do passo + `prompt: "/review-component"` (ou o nome do skill) —
  documentado como o jeito de rodar um skill de `.claude/skills/` dentro da
  Action. É exatamente como reaproveitamos o `ds-reviewer/review-component.md`
  sem reescrever nada.
- **Setup manual (não o `/install-github-app` quickstart)**: o quickstart
  instala um GitHub App com permissão fixa de **Contents: Read & Write**
  (mais do que precisamos — não queremos que a Camada 3 tenha permissão de
  *escrever* código sozinha, só de ler o diff e comentar). A doc lista
  "Manual GitHub Actions: configuração direta de workflow, pra máxima
  flexibilidade" como alternativa — é essa que usamos, com um bloco
  `permissions:` mínimo no nosso próprio workflow (`contents: read,
  pull-requests: write` — sem `issues`, sem write em `contents`).
- **Controle total de bloqueio**: como o job é nosso, decidimos o exit code —
  pode ficar comentário-only (Fase 4) e só depois virar required check de
  verdade (Fase 6), sem precisar de wrapper pra ler output de terceiro.
- Custo: mesmo mecanismo de token da API, sem markup de serviço gerenciado —
  ainda não é grátis (§7), mas escalamos o gatilho (só PR aberta, não todo
  push) pra controlar volume desde o início.

**Por que 3b em vez de 3a**: 3a exige uma camada de aprovação nova (Owner do
Claude org) e um plano pago específico que não sei se existe hoje, e o custo
por review é fixo e alto ($15-25) independente de tamanho real do diff. 3b usa
exatamente o mesmo secret que já pedimos pra CODEOWNERS/Action, reaproveita o
skill do `ds-reviewer` literalmente (não via `REVIEW.md` reescrito), e não
adiciona dependência de assinatura. Guardo 3a documentado aqui como alternativa
caso vocês já tenham Team/Enterprise e prefiram a UX gerenciada (dashboard de
custo, severidade automática, auto-resolve de thread).

### Camada 4 — Checklist de distribuição + publish seguro

**Arquivos novos**: convenção `.changes/<slug>.md`, script
`scripts/changeset-check.mjs` (falha CI se PR tocar componente/token sem
changeset), script `scripts/aggregate-pending-distribution.mjs` (gera/atualiza
`PENDING-DISTRIBUTION.md` a partir dos changesets não resolvidos).
**Arquivo tocado**: `.claude/skills/ds-dev/release.md` (passo novo: consumir e
limpar changesets resolvidos ao rodar `/ds-release`).
**Config externa**: Trusted Publisher no npmjs.com (org `@snksergio`, manual,
sua conta) + GitHub Environment `npm-publish` com required reviewer + novo
workflow de publish via OIDC (substitui o `cd cli && npm publish` manual).

- Cada `.changes/<slug>.md` declara: item, tipo (novo/edição), se precisa
  `registry`, `catálogo CLI`, `npm publish`, descrição curta.
- CI falha se a PR tocar `src/components/ui/**`/`shadcn/**`/`tokens/**` sem
  arquivo novo em `.changes/`.
- Ao mergear, `PENDING-DISTRIBUTION.md` (raiz ou `.ai/status/`) se atualiza —
  literalmente o checklist que você descreveu: você olha esse arquivo antes de
  rodar `/ds-release`, os itens resolvidos saem da lista sozinhos.
- **Divisão de responsabilidade com `distribution-debt.mjs` (Camada 2)**: o
  sweep automático já detecta sozinho, sem exigir declaração de ninguém, que
  um componente ficou fora do registry/catálogo — isso **não muda**. O
  changeset não duplica essa detecção; ele cobre o que o sweep **não** pega:
  a intenção de "isso precisa de `npm publish`" (só relevante quando o item
  tocado é o `cli/` ou algo que afeta o pacote publicado), que não tem
  nenhum sinal automático hoje. Se o changeset e o sweep divergirem sobre
  registry/catálogo, o sweep é a fonte de verdade (é determinístico e não
  depende de ninguém lembrar de preencher nada).

---

## 4. Fluxo ponta a ponta

Dev (com ou sem contexto do DS) pede pra Claude Code "preciso de um componente
novo" / "preciso de uma variação nova":

1. Componente/variante é criado.
2. PR aberta → **Camada 1** já trava o merge até aprovação do Code Owner + checks
   verdes — não importa se veio de sessão com CLAUDE.md carregado, de submódulo,
   ou de git manual.
3. **Camada 2** aponta na hora, na aba de Checks, se quebrou padrão/estrutura/
   registro — sem o mantenedor precisar abrir o diff.
4. **Camada 4** exige o changeset — não dá pra "esquecer" de declarar que
   precisa ir pro registry/CLI/npm.
5. **Camada 3** comenta nuance semântica (token certo? `tv()` de espírito, não
   só sintaxe?).
6. Mantenedor abre a PR: já vê aprovação pendente (só dele), checks estruturais
   resolvidos, changeset declarado, review semântico feito. A revisão dele vira
   julgamento de mérito, não caça de convenção.
7. Merge → `PENDING-DISTRIBUTION.md` atualiza. `/ds-release` consome os
   changesets resolvidos. Publish do npm só roda com aprovação explícita no
   Environment.

---

## 5. Ações manuais suas (fora do meu alcance por permissão)

Confirmado nesta sessão: minha identidade autenticada tem `push` mas não
`admin` no repo. Estes itens **precisam ser feitos por alguém com admin**
(você ou quem tiver essa permissão no `igreenlab`):

1. Confirmar os handles exatos que entram no `CODEOWNERS` (candidatos
   levantados: `@snksergio`, possivelmente `@leandrosfreire`).
2. Ativar branch protection em `main` (posso preparar o comando `gh api` exato
   pra quem tiver admin rodar, ou o passo a passo da UI).
3. Criar o secret `ANTHROPIC_API_KEY` no repo (Settings → Secrets → Actions) —
   pra Camada 3, opção 3b (self-hosted).
4. Configurar Trusted Publisher no npmjs.com pros 2 pacotes (site do npm, conta
   `snksergio`).
5. Criar o GitHub Environment `npm-publish` com required reviewer.
6. **Só se optarem pela Opção 3a** (Code Review gerenciado, não é a
   recomendação): confirmar se a organização já tem plano Team/Enterprise do
   Claude, e alguém com papel Owner/Primary Owner em
   `claude.ai/admin-settings/claude-code` precisa instalar o GitHub App —
   aprovação adicional, separada de admin do GitHub.
7. ~~Decidir as 2 questões de política do §1.1~~ — **não é mais necessário**:
   ambas foram resolvidas com evidência objetiva (comparação de valor
   nativo-vs-token e inspeção dos 8 casos de foco). Só confirme se concorda
   com as conclusões do §1.1 quando revisar — não há decisão pendente
   bloqueando a implementação.

Eu construo todo o código/workflow (Camadas 2, 3b, 4 do lado do repo) via PR
normal; esses itens acima são pré-requisito de infraestrutura que só quem tem
a permissão certa executa.

---

## 6. Rollout (fases, mapeiam pro plano de implementação)

| Fase | O quê | Risco de bloquear trabalho legítimo |
|---|---|---|
| 0 | Você executa os 5 itens manuais do §5 (ou pelo menos CODEOWNERS + branch protection, item mais urgente dado o 404 do §1) | zero — é config, não código |
| 1 | `distribution-debt.mjs --ci` entra em `ci.yml` | zero — hoje não há débito, só passa a travar débito NOVO |
| 2a-i | **Corrigir patterns** no hook local (tirar `0` de pad/gap · tirar `none`/`full` do rounded · tirar L-004 do determinístico) + unificar listas de exceção | zero — só corrige aviso que o hook já dá errado hoje; leva os 51 hits atuais pra 1 |
| 2a-ii | Check de ratchet (só linhas adicionadas) entra em `ci.yml` como obrigatório — mecânica **já validada** por protótipo, 3/3 | baixo **depois de 2a-i**; sem 2a-i seria ~35% dos arquivos falhando com 65% de bogus (medido, §1.1) |
| 2b | `ds-tokens-check.sh` → **NÃO entra no rollout ainda**. Precisa de lógica nova (rodar `tokens:tw4` em CI + diffar contra CSS commitado) que este design não cobre — fica como follow-up separado, fora de escopo desta spec (§8) | promover como está = falso-positivo garantido em qualquer PR de token |
| 3 | Changeset-lite (arquivo + check + agregação) | médio — exige mudar hábito de quem abre PR; mensagem de erro deve ser clara e auto-explicativa |
| 4 | Camada 3, Opção 3b (self-hosted, `pull_request: opened` só — não `synchronize`, pra conter custo) — **modo comentário, não bloqueia** | zero nesse modo (custo de API existe mas é comentário-only, não trava nada) |
| 5 | OIDC + Environment pro publish do CLI/lib — **depende de 5.4 (Trusted Publisher no npmjs.com) existir primeiro**, porque o npm exige o nome exato do workflow/environment pra configurar o Trusted Publisher, e o workflow só é testável depois disso existir (ordem obrigatória, não paralela) | zero pro fluxo de PR — só muda como o publish final roda |
| 6 (depois de calibrar) | Promover a Action da Camada 3 a required check | avaliar taxa de falso-positivo antes |

---

## 7. Riscos / assumptions

- ~~**Assumption central**: os 3 hooks portam pra "modo CI" sem reescrever a
  lógica de detecção~~ → **FALSIFICADA pela medição do §1.1**, e era o maior
  risco da spec. Números: 35% dos `*.styles.ts` já falhariam, 65% dos hits são
  falso-positivo por bug de pattern (`0` na alternação), 2 questões de política
  em aberto, e as listas de exceção de `ds-inventory-check.sh` e
  `distribution-debt.mjs` divergem. Substituída pelo design de ratchet + 3
  pré-requisitos (§3 Camada 2). **Lição de processo**: a assumption dizia "vou
  validar na implementação" — se tivesse ficado assim, a Fase 2a teria sido
  ligada e revertida no mesmo dia. Medir custou ~10 minutos.
- ~~Assumption sobre o parse de hunk~~ → **validada por protótipo** (3/3
  testes, §1.1). Nota de comportamento conhecido que permanece: uma violação
  **movida de lugar** (linha deletada + readicionada idêntica) conta como
  "nova" e falha, mesmo sendo reordenamento puro. Erra pro lado seguro, mas a
  mensagem de erro precisa dizer isso explicitamente pra não parecer bug de
  quem só moveu código.
- ~~Assumption sobre a Action suportar disparo automático~~ — **resolvida**:
  confirmado por doc oficial que `anthropics/claude-code-action@v1` dispara em
  `pull_request: [opened, synchronize]` normalmente, sem depender de menção.
  Ver Camada 3, Opção 3b.
- **Risco**: mensagens de erro dos checks determinísticos (Camada 2/4) mal
  escritas viram atrito em vez de ajuda — cada falha precisa dizer exatamente o
  que fazer pra corrigir (mesmo padrão que os hooks locais já seguem bem hoje).
- **Risco de permissão**: CODEOWNERS só funciona se os handles designados
  tiverem de fato permissão de review/merge no repo — confirmar antes de
  ativar branch protection, senão pode travar até o próprio mantenedor.
- **PRs em andamento no momento da ativação**: branch protection/CODEOWNERS
  ligarem no meio de uma PR já aberta sem changeset/aprovação vai bloquear
  esse trabalho retroativamente. Não decidido neste design se isso exige um
  aviso prévio ou uma janela de carência — resolver na implementação (Fase 0),
  não é um problema de arquitetura.
- **Bypass/rollback — decisão explícita**: branch protection do GitHub tem uma
  opção "Do not allow bypassing the above settings" — **recomendo deixar
  desmarcada**. Por padrão (desmarcada), admins/owners do repo continuam
  conseguindo mergear mesmo com check vermelho em emergência, sem precisar
  desligar a proteção inteira. Isso também mitiga o bus factor do CODEOWNERS
  (só 2 handles candidatos hoje, `@snksergio`/`@leandrosfreire`, concentrando
  aprovação — se os dois ficarem indisponíveis, um admin ainda destrava na
  emergência). Decisão tomada aqui pra não deixar implícito; confirmar que a
  opção fica desmarcada ao ativar branch protection (§5, item 2).
- **Custo recorrente da Camada 3 não é zero — agora com número real**: doc
  oficial confirma a Opção 3a (gerenciada) em **$15-25 por review**. A Opção
  3b (self-hosted, a escolhida) usa billing de API pura — mais barato por
  execução, mas ainda assim não-zero e escala com volume de PR. Vale medir
  volume esperado de PRs/mês tocando componente/token antes de ativar a Fase
  4, e considerar rodar só em `opened` (não em todo `synchronize`/push) pra
  controlar custo desde o início.

---

## 8. Fora de escopo (YAGNI)

- Adotar `changesets` (pacote) ou Bit.dev completo — convenção leve própria
  resolve sem trocar de paradigma.
- Qualquer bot de terceiro pago (CodeRabbit/Cubic/Greptile/etc.) — descartado
  por decisão explícita (§2.1).
- Multi-token/rotação no registry, versão histórica por-componente — já
  adiados em `.ai/status/BACKLOG.md`, sem relação direta com este design.
- Promover a Camada 3 (IA) a required check já na primeira fase — só depois de
  medir falso-positivo em uso real (§6, fase 6).
- **Check de staleness do CSS de tokens** (validar se `tailwind-theme.css`
  está de fato sincronizado com o token-fonte) — é a lógica que faltaria pra
  promover `ds-tokens-check.sh` a gate obrigatório (Fase 2b). Fica como
  follow-up separado; este design só promove os 2 hooks que já têm detecção
  real (`ds-lint-styles.sh`, `ds-inventory-check.sh`).

---

## 9. Artefatos de referência (rascunho, pra acelerar a implementação)

Ilustrativo — não foi aplicado no repo ainda. Serve pra quem for implementar
não começar do zero.

### `.github/CODEOWNERS` (rascunho — falta confirmar handles, §5 item 1)

```
# Qualquer mudança em componente/token/registry/distribuição precisa de
# aprovação do mantenedor do DS.
/src/components/  @snksergio
/tokens/          @snksergio
/registry.json    @snksergio
/cli/             @snksergio
/.github/         @snksergio
```

### Branch protection via `gh api` (pra quem tiver admin rodar — §5 item 2)

```bash
gh api -X PUT repos/igreenlab/igreen-desingsystem-admin/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": true,
    "contexts": ["check"]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "require_code_owner_reviews": true,
    "required_approving_review_count": 1
  },
  "restrictions": null
}
EOF
```

`"enforce_admins": false` = "Do not allow bypassing" **desmarcada**, conforme
decisão do §7 (mantém válvula de escape pro admin). A lista em `contexts`
precisa ser atualizada com o nome real dos jobs depois que a Fase 1/2a
adicionar os novos steps em `ci.yml` — hoje só existe o job `check`.

### `ci.yml` — Fase 1 (adicionar 1 linha)

```yaml
      - name: Distribution debt (falha se PR introduzir gap novo)
        run: node scripts/distribution-debt.mjs --ci
```

### Correção dos patterns — Fase 2a-i (leva os 51 hits atuais pra 1)

Em `.claude/hooks/ds-lint-styles.sh`, 4 mudanças (todas justificadas no §1.1):

```diff
  # 1+2. Não existe token DS pra zero — p-0/gap-0 são resets legítimos (33 hits bogus)
- check '"[^"]*\bgap-(0|1|2|3|4|5|6|7|8|10|12|16|20|24)\b[^"]*"' "L-002 — gap-N literal..."
+ check '"[^"]*\bgap-(1|2|3|4|5|6|7|8|10|12|16|20|24)\b[^"]*"'   "L-002 — gap-N literal..."

- check '"[^"]*\b(px|py|pt|pb|pl|pr|p)-(0|1|2|3|4|5|6|7|8|10|12|16)\b[^"]*"' "L-002 — pad/space..."
+ check '"[^"]*\b(px|py|pt|pb|pl|pr|p)-(1|2|3|4|5|6|7|8|10|12|16)\b[^"]*"'   "L-002 — pad/space..."

  # 3. rounded-full e rounded-none são IDÊNTICOS ao token DS — impossível ser defeito (9 hits bogus)
- check '"[^"]*\brounded-(none|sm|md|lg|xl|2xl|3xl|full)\b[^"]*"' "L-002 — rounded-N nativo..."
+ check '"[^"]*\brounded-(sm|md|lg|xl|2xl|3xl)\b[^"]*"'           "L-002 — rounded-N nativo tem VALOR DIFERENTE do DS..."

  # 4. L-004 é semântico (ring pode estar no wrapper / vir de shadow-sh-ring) → Camada 3 (8 hits bogus)
- check '"[^"]*(^|[ "])outline-none[^"]*"' "L-004 — outline-none sem focus-visible..."
+ # (removido do gate determinístico — ver classificação no §1.1 da spec)
```

### Quick win independente (não precisa de gate nenhum)

`DatePicker` está distribuído no registry mas **não tem `USAGE.md`** — gap
genuíno encontrado na medição. Corrigir isso é 1 arquivo, sem relação com
governança, e tira o único hit real do inventory-check.

### `.changes/<slug>.md` — Camada 4 (formato do changeset-lite)

```markdown
---
item: choropleth-map
type: new
needsRegistry: true
needsCliCatalog: true
needsNpmPublish: false
---
Componente novo de mapa coroplético (d3-geo/topojson). Precisa entrar no
registry.json e no catálogo do CLI antes do próximo /ds-release.
```
