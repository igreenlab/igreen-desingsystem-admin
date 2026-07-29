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

`distribution-debt.mjs --ci` já existe e só precisa ser chamado. Dos 3 hooks,
**2** (`ds-lint-styles.sh`, `ds-inventory-check.sh`) já têm lógica real de
violação e só precisam de um modo novo (`DS_HOOK_MODE=ci` ou flag equivalente)
que troque o `exit 0` final por `exit 1` — mesma detecção, sem duplicar em
formato de terceiro (era a alternativa descartada: um linter genérico
reaprendendo os mesmos greps). O terceiro (`ds-tokens-check.sh`) não tem lógica
de violação hoje — não dá pra "promover" o que não existe; ver detalhe e
decisão em §3 Camada 2 e §6 Fase 2b.

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
- **`ds-lint-styles.sh` e `ds-inventory-check.sh`** ganham modo "CI": em vez de
  rodar via protocolo de stdin JSON do Claude Code (`tool_input.file_path`),
  rodam contra a lista de arquivos alterados na PR
  (`git diff --name-only origin/main...HEAD`), e falham (`exit 1`) se
  `$FOUND`/`$MISSING` > 0 quando `CI=true` estiver setado — mantendo o
  comportamento local (sempre `exit 0`, só avisa) intacto por padrão. Ambos têm
  lógica real de violação (`$FOUND`/`$MISSING` computados por grep/existência
  de arquivo) — portáveis sem redesenhar a detecção.
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

Eu construo todo o código/workflow (Camadas 2, 3b, 4 do lado do repo) via PR
normal; esses itens acima são pré-requisito de infraestrutura que só quem tem
a permissão certa executa.

---

## 6. Rollout (fases, mapeiam pro plano de implementação)

| Fase | O quê | Risco de bloquear trabalho legítimo |
|---|---|---|
| 0 | Você executa os 5 itens manuais do §5 (ou pelo menos CODEOWNERS + branch protection, item mais urgente dado o 404 do §1) | zero — é config, não código |
| 1 | `distribution-debt.mjs --ci` entra em `ci.yml` | zero — hoje não há débito, só passa a travar débito NOVO |
| 2a | `ds-lint-styles.sh`/`ds-inventory-check.sh` ganham modo CI, viram check obrigatório | baixo — mesma detecção que já roda local há tempo, sem surpresa |
| 2b | `ds-tokens-check.sh` → **NÃO entra no rollout ainda**. Precisa de lógica nova (rodar `tokens:tw4` em CI + diffar contra CSS commitado) que este design não cobre — fica como follow-up separado, fora de escopo desta spec (§8) | promover como está = falso-positivo garantido em qualquer PR de token |
| 3 | Changeset-lite (arquivo + check + agregação) | médio — exige mudar hábito de quem abre PR; mensagem de erro deve ser clara e auto-explicativa |
| 4 | Camada 3, Opção 3b (self-hosted, `pull_request: opened` só — não `synchronize`, pra conter custo) — **modo comentário, não bloqueia** | zero nesse modo (custo de API existe mas é comentário-only, não trava nada) |
| 5 | OIDC + Environment pro publish do CLI/lib — **depende de 5.4 (Trusted Publisher no npmjs.com) existir primeiro**, porque o npm exige o nome exato do workflow/environment pra configurar o Trusted Publisher, e o workflow só é testável depois disso existir (ordem obrigatória, não paralela) | zero pro fluxo de PR — só muda como o publish final roda |
| 6 (depois de calibrar) | Promover a Action da Camada 3 a required check | avaliar taxa de falso-positivo antes |

---

## 7. Riscos / assumptions

- **Assumption central**: os 3 hooks bash portam pra "modo CI" sem reescrever a
  lógica de detecção — se o runner Ubuntu não tiver as mesmas ferramentas (jq/
  node) que o ambiente local, pode precisar de ajuste. Vou validar isso na
  implementação, não aqui.
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
