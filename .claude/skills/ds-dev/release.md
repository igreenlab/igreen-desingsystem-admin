---
name: release
description: >
  Release completa do DS: atualiza Updates timeline + bump de package.json +
  branch + commit + push + abre PR via gh. Engloba o update-changelog e
  adiciona os passos de publicação git. Use pra fechar versão sem trocar
  entre múltiplos comandos.
---

# DS Dev — Release completa

> **Leitura obrigatória.** Abra este arquivo com a tool **Read** (sub-arquivo da skill `ds-dev`, não uma skill própria) antes de
> processar `/ds-release` — não confie em memória de sessão anterior.

> ⚠️ **L-020 — Não burle este fluxo por urgência percebida.** TODA release
> que toca `package.json.version` OU envolve `npm publish` DEVE usar este
> skill — incluindo **patches** e **hotfixes urgentes**. Direct commits no
> `main` pra release quebram a convenção do projeto (releases v0.3-v0.5
> vieram via PR — `Merge pull request #1..#4 from <user>/release/vX.Y.Z`).
> O gate humano + auto-review + rastreabilidade via PR são parte do design,
> não obstáculo. Sessão 2026-06-05 burlou isso ao publicar v0.5.1 direto;
> a lição L-020 registra a exceção pra não repetir.

> 🔀 **REMOTE DE RELEASE — rode `git remote -v` ANTES de qualquer push.**
> O repo canônico é `igreenlab/igreen-desingsystem-admin`, mas o **nome** do remote varia
> por clone — resolva por **URL, nunca por nome** (L-069):
>
> ```bash
> git remote -v | grep 'igreenlab/igreen-desingsystem-admin'   # o nome é a 1ª coluna
> ```
>
> É **`origin`** em clone direto do repo da empresa (e no CI) e **`empresa`** em clone
> onde `origin` aponta pro fork pessoal (`snksergio/…`), parado. Publicar a branch de
> release no remote errado manda o trabalho pro fork — e o `gh pr create --repo
> igreenlab/…` não acha a head. Os passos abaixo escrevem **`empresa`** como exemplo:
> **troque pelo nome que o comando acima devolveu** no seu clone.

## Quando usar este skill

- Trabalho acumulado pronto pra release no remote
- Auto-pilot: timeline + bump + branch + commit + PR num único fluxo
- Mais simples que invocar `update-changelog` + git manual quando o objetivo final é PR
- **Releases de TODOS os tamanhos** — major, minor, patch, hotfix

Pra atualizar **apenas** a timeline (sem commit/PR), use [`update-changelog.md`](./update-changelog.md) direto.

## Heurística pré-skill

*"Tem `npm publish` ou bump em `package.json.version` no escopo?"*
- **SIM** → `/ds-release` obrigatório (este skill). Não importa o tamanho da mudança.
- **NÃO** → commit normal direto. Chores e infra (`.gitignore`, docs, skills, rules, hooks) podem ir direto.

---

## Visão geral do fluxo

```
1.  Verificações iniciais (workspace, branch, gh disponível, build limpo)
1.5 AUTO-REVIEW do diff (NOVO) — bloqueia release se houver violação L-001..L-007
2.  Coletar git log + estado desde a última entry
3.  Classificar commits + sugerir bump (delega lógica do update-changelog)
4.  Montar ReleaseEntry + plano de commit + PR body
5.  [GATE] preview consolidado pro usuário (inclui resumo do auto-review)
6.  Aplicar (após aprovação):
    a. Edit updates-data.ts (insert entry no topo)
    b. Edit package.json (bump version)
    b2. DISTRIBUIÇÃO (registry) — se tocou componente/token/foundational:
        registry:build (carimbo na versão nova) + embed; cli:rebake + bump CLI se
        foundational (cn/tv/lucide-types/theme) mudou
    c. Validar TS (npx tsc --noEmit) — abortar se falhar
    d. Stage arquivos do escopo (incluindo registry.json + embed + CLI se mudaram)
    e. Commit local
    f. Criar branch release/v<X.Y.Z>
    g. Reset main local pra empresa/main (se commit foi em main)
    h. Push empresa/release/v<X.Y.Z>
    i. Abrir PR via gh CLI
7.  Reportar RELEASE_PUSHED com link do PR
```

---

## Passo 1 — Verificações iniciais

```
✓ src/preview/pages/updates-data.ts existe e parseia
✓ package.json.version é semver válido
✓ Branch atual = main (se não, alertar e perguntar)
✓ Remote canônico alcançável (`git fetch --dry-run` não falha)
✓ gh --version retorna (CLI disponível pra abrir PR)
✓ Working tree status conhecido (porcelain output)
```

Se algo falha → reportar e PARAR (não tente recuperar silenciosamente).

**Working tree sujo:** OK desde que os arquivos modificados entrem na release. Listar pro usuário e perguntar se inclui no commit ou stash antes.

---

## Passo 1.5 — Pre-commit check (DS Reviewer)

Antes de classificar commits ou montar o plano, invocar a skill
`ds-reviewer/pre-commit-check.md`. Ela faz um gate amplo do diff completo —
mapeia escopo (tokens, componentes, DocPages, pipeline, memory), valida
sincronias técnicas (twMergeConfig L-016, dark mode mirrors), valida que
USAGE.md / DocPages do showcase / pipeline-state / lessons / memory
acompanharam a mudança, e roda os greps L-001..L-007 sobre arquivos
modificados.

### Como invocar

**Ler** `.claude/skills/ds-reviewer/pre-commit-check.md` com a tool **Read** (sub-arquivo da skill `ds-reviewer`) e
seguir o checklist completo dela:

1. Mapear escopo do diff (categorias)
2. Rodar checklist por categoria
3. Capturar output: `PRE_COMMIT_OK` ou `PRE_COMMIT_BLOCKED`

### Decisão

- **PRE_COMMIT_OK** → continuar pro Passo 2 silenciosamente
- **PRE_COMMIT_BLOCKED com pendências CRÍTICAS/ALTAS** → reportar ao usuário no preview do gate (Passo 5) como bloco "🔍 Pre-commit check" e perguntar:
  - "corrigir antes de prosseguir" (default sugerido) → PAUSAR pipeline, DS Dev resolve cada pendência (USAGE.md, DocPage, sync, etc) → re-invocar pre-commit
  - "aplicar mesmo assim e abrir ticket" → continuar, registrar pendências no PR body como débito conhecido (somente MÉDIAS/BAIXAS)
  - "cancelar release" → abortar
- **PRE_COMMIT_BLOCKED com apenas pendências MÉDIAS/BAIXAS** → reportar como aviso, deixar usuário decidir

Sinal intermediário: `RELEASE_REVIEW: <escopo> / <N>pendências`

---

## Passo 2 — Coletar dados

Aplicar os **passos 1–4** do [`update-changelog.md`](./update-changelog.md):

1. Identificar baseline: `entry[0].version` e `entry[0].date` em `updates-data.ts`
2. `git log --since=<lastDate> --pretty='%h %s' --no-merges`
3. `git diff --name-status` em `git log` desde lastDate
4. Versão atual de `package.json`

⛔ **Ao classificar, separe os dois eixos** — o que o **consumidor** recebe
(`src/components/`, `tokens/`, `registry.json`) e o que mudou no **pipeline**
(`.github/workflows/`, `scripts/`, `.claude/`, `.ai/`). Os dois entram na entry; ver
[`update-changelog.md`](./update-changelog.md) §"Mudança de INFRA também entra na timeline".
Foi ignorar isso que deixou 25 PRs de governança sem rastro na timeline (2026-07-30).

---

## Passo 3 — Classificar + bump

Aplicar **passo 3** (heurística por prefixo convencional) e **passo 4** (regra de bump) do `update-changelog.md`.

Atalho de bump em 0.x:

| Condição (cumulativa) | Bump | Exemplo |
|---|---|---|
| `breaking` presente | MAJOR | 0.3.0 → 1.0.0 |
| `added` presente, sem breaking | MINOR | 0.2.0 → 0.3.0 |
| Apenas fix/improve/change/remove | PATCH | 0.3.0 → 0.3.1 |

Tag default: `preview` (em 0.x). Override aceito como argumento.

---

## Passo 4 — Montar plano

Produzir 3 artefatos:

### 4.1 `ReleaseEntry` (mesmo template do `update-changelog`)

```typescript
{
  version: "X.Y.Z",
  date: "<hoje YYYY-MM-DD>",
  tag: "<preview|release|patch|milestone>",
  title: "<resumo curto>",
  summary: "<1-2 frases>",
  changes: [{ type, items }, ...],  // ordenado: added → changed → improved → fixed → removed → deprecated → breaking
}
```

### 4.2 Commit message

Formato convencional, multiline:

```
release: v<X.Y.Z> — <título da release>

<grupo por type, com bullets dos items principais>

Bump package.json X.Y.Z (motivo, se sincroniza com baseline desalinhada).

Co-Authored-By: Claude Opus <noreply@anthropic.com>
```

### 4.3 PR body

```markdown
## Summary

<parágrafo do summary da release>

### <Grupo>

- <bullet 1>
- <bullet 2>

## Bump

- `package.json`: <old> → <new>

## Test plan

- [ ] `npx tsc --noEmit` passa limpo
- [ ] <smoke tests específicos da release>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

---

## Passo 5 — [GATE] Preview consolidado

Apresentar TUDO de uma vez em markdown:

```markdown
📋 Release v<X.Y.Z> proposta

**Baseline:** v<lastVersion> (<lastDate>)
**Bump:** <MAJOR|MINOR|PATCH> → v<X.Y.Z> (tag <tag>)

### 🔍 Pre-commit check (Passo 1.5)
  <relatório do pre-commit-check — PRE_COMMIT_OK OU lista de pendências por severidade>

### Commits considerados
  <hash>  <subject>
  ...

### Working tree status (se sujo)
  M src/...
  M src/...

### Entry a aplicar em updates-data.ts
  <preview da entry agrupada>

### Bump package.json
  <old> → <new>

### Distribuição (registry) — se aplicável
  - registry:build → carimbo v<new> nos N items afetados + embed regenerado
  - Componentes novos sem entrada no registry.json: <nenhum | lista> ⚠️
  - CLI: <sem mudança | cli:rebake + bump cli X.Y.Z → publicar manual no npm>
  - Deploy: automático no merge (Vercel/Git)

### Branch + PR
  - Branch: release/v<X.Y.Z>
  - Title: "release: v<X.Y.Z> — <título>"
  - Body: <preview do PR body em ~10 linhas>

### Comando de commit (será executado após aprovação)
  git commit -m "<subject>" ...

Aprovar e aplicar tudo? Ou ajustar antes?
```

**Sinal:** `RELEASE_PROPOSED: v<X.Y.Z> — aguardando gate`

Aguardar:
- `ok` / `pode aplicar` → Passo 6
- `ajustar <X>` → re-montar e re-apresentar
- `cancelar` → abortar (zero edição no disco)

---

## Passo 6 — Aplicar

Executar **em sequência**, abortando ao primeiro erro:

### 6.1 Edit `src/preview/pages/updates-data.ts`
Insere novo objeto no TOPO do array `RELEASES`.

### 6.2 Edit `package.json`
`"version": "<old>"` → `"version": "<new>"`.

### 6.2b Distribuição (registry shadcn) — condicional

Só roda se o diff da release tocou **componente** (`src/components/**`), **token**
(`tokens/**`, `tailwind-theme.css`) ou **foundational** (`src/lib/utils.ts`,
`src/utils/tv.ts`, `src/lib/lucide-types.ts`). Chore/docs/skill puro → pular.

O carimbo do registry é `package.json.version` + short-hash — por isso roda
**DEPOIS do bump (6.2)**, pra carimbar a versão nova.

```bash
# 1. regenera os JSON do registry + carimbo na versão nova + embed do deploy
npm run registry:build

# O copy-registry TEM que rodar com cwd=registry-app: ele resolve `../public/r`
# relativo ao cwd, então da raiz do repo ele aponta pro PAI do repo, não acha nada,
# sai 0 em silêncio e o embed NÃO é regenerado. Sempre com o `cd`:
(cd registry-app && node scripts/copy-registry.mjs)

# 2. CLI: SÓ se foundational (cn/tv/lucide-types/theme) ou cli/templates/** mudaram
npm run cli:rebake          # re-copia os foundational pro template do CLI
# + bump manual de cli/package.json (patch/minor) — entra no mesmo commit
```

**Novo componente no diff?** Se a release adicionou `src/components/ui/<Novo>/` ou
`src/components/shadcn/<novo>.tsx` que **não está em `registry.json`**, ele NÃO será
distribuído. Use `node scripts/registry-add-item.mjs <Componente>` pra gerar a entrada
(escaneia imports → registryDeps + deps + sinaliza imports cross-dir que precisam virar
alias `@/`), revise e adicione ao `registry.json` ANTES do `registry:build`. (O
pre-commit-check acusa essa lacuna.)

**Vocabulário do consumidor (L-042) — OBRIGATÓRIO pra componente novo distribuído.** Todo
componente que entra no `registry.json` TEM que entrar também em
`cli/templates/default/_claude/rules/ds-components.md` — no grupo de tarefa a que ele serve,
com o **critério de escolha** (quando usar ELE e não o vizinho), pelo nome kebab do registry.
Senão a IA do consumidor não sabe que ele existe e compõe na unha. Isso **muda `cli/templates/**` → exige
bump de `cli/package.json` + `npm publish` manual** (mesmo sem mudança foundational). O hook
`ds-inventory-check` acusa "no registry mas fora do catálogo". Caso real: Toast (v0.12.0 no
registry, só catalogado na CLI 0.13.7).

**Arquivos que entram no stage (6.4):** `registry.json`, `registry-app/app/registry-data.ts`,
`src/styles/theme/tailwind-theme.css`, e — **se rebake OU se o vocabulário do consumidor mudou** —
`cli/package.json` + `cli/templates/default/**` (qualquer toque em `cli/**` → bump + publish manual).

**Deploy:** automático. O merge do PR → `main` → Vercel re-deploya o registry-app
(Git conectado, Root Directory=`registry-app`). **Sem `vercel --prod` manual.**

**Publish do CLI no npm:** **manual** (precisa OTP/token) — fica fora do fluxo do PR.
Sinalizar no handoff se o CLI mudou (ver Passo final).

### 6.3 Validar — TS + suíte + gates agregados
```bash
npx tsc --noEmit
npm test              # inclui dead-theme-classes, shadcn-vocab, orphan-utilities,
                      # runtime-base e vocab-surface
npm run release:check # registry-check --ci + brand-check + distribution-debt --ci
                      # + examples-drift + npm audit (high)
```
Se qualquer um sair ≠ 0 → reportar erro + abortar. Deixar edits no working tree pra debug humano.

⚠️ `release:check` roda **depois** do `registry:build` (6.2b) de propósito: ele compara o
embed **por conteúdo** contra a fonte, então rodá-lo antes acusa defasagem que o próprio
passo 6.2b acabou de resolver.

### 6.4 Stage arquivos
`git add` apenas dos arquivos do escopo. **Nunca** `git add -A` (evita secrets/audits acidentais).

### 6.5 Commit (em `main` local)
```bash
git commit -m "$(cat <<'EOF'
<commit message multiline do Passo 4.2>
EOF
)"
```

### 6.6 Criar branch apontando pro commit
```bash
git branch release/v<X.Y.Z>
```

### 6.7 Reset main local pro remote canônico
```bash
git fetch empresa
git reset --hard empresa/main
```
**Por que:** `main` local fica == `empresa/main` (igreenlab). O commit fica preservado apenas na branch `release/v<X.Y.Z>`.

> ⚠️ `reset --hard` é destrutivo. Como o commit foi preservado na branch lateral, não há perda. Mas confirmar com usuário antes se houver arquivos não-staged que deseja manter.

### 6.8 Switch + push da branch
```bash
git checkout release/v<X.Y.Z>
git push -u empresa release/v<X.Y.Z>
```

Se push for bloqueado (policy main-only ou similar) → reportar + parar (branch local preservada).

### 6.9 Abrir PR
```bash
gh pr create --repo igreenlab/igreen-desingsystem-admin --base main --head release/v<X.Y.Z> \
  --title "<title>" --body-file <arquivo com body do Passo 4.3>
```
(`--repo` explícito = igreenlab. `--body-file` evita PR template auto-injetado — L da tabela de erros.)

Capturar URL do PR retornada.

---

## Handoff final

```
RELEASE_PUSHED: v<X.Y.Z>
- Branch: release/v<X.Y.Z>
- PR: <URL retornada pelo gh>
- Commit local: <hash>
- main local resetado pra empresa/main (limpo)

Próximos passos (humanos):
1. Revisar o PR
2. Merge → trigger auto-deploy do registry (Vercel detecta push em main, Root=registry-app)
3. Após merge, deletar branch release/v<X.Y.Z> (local + remote)
4. CLI mudou? (rebake/bump) → publicar manual: cd cli && npm publish (OTP/token)
5. Publish do DS no npm → **Passo 7** abaixo (gate de token)
```

> **Registry vs CLI no deploy:** o **registry** sobe sozinho no merge (Git+Vercel). O
> **CLI** (`@snksergio/create-design-system`) é pacote npm separado — `npm publish` é
> manual (2FA). Só republique o CLI quando `cli/**` mudou (rebake de foundational ou
> feature de template).

---

## Passo 7 — [GATE] Publish do DS no npm

**Só DEPOIS do merge da PR de release.** O npm publica **depois** porque é passo manual com
token — o registry/copy-in já subiu sozinho no merge. **"Depois" não é "menos suportado"**:
os 4 canais (npm · copy-in/registry · scaffold · submódulo) são de primeira classe e nenhum
é depreciado. Chamar o npm de "secundário" foi a redação que fez um usuário concluir que o
canal estava morto (corrigido em 2026-08-08); descreva a **ordem de publicação**, não uma
hierarquia de suporte.

### ⛔ 7.0 — Esta conta exige 2FA. Leia ANTES de pedir qualquer credencial.

**Token clássico NÃO publica aqui.** O `npm publish` sai com:

```
E403 — Two-factor authentication or granular access token with bypass 2fa
       enabled is required to publish packages.
```

⚠️ O `lib:verify` **não prevê essa falha**: ele valida o pacote, e a recusa acontece no `PUT`
ao registro. Gate verde + tarball montado + 403 é o estado normal aqui.

Isto já aconteceu **duas vezes** (v0.39.0 e v0.39.1). Na v0.39.0 o `pipeline-state.md` chegou
a registrar, textualmente, *"VAI se repetir — na próxima release peça o token granular direto"*
— e repetiu, porque o aviso morava no log append-only e não aqui, que é o arquivo carregado
pra conduzir a release. Por isso ele agora abre o Passo 7.

**Os dois caminhos que funcionam** (o segundo é o recomendado):

| | Como | Quando |
|---|---|---|
| **`--otp`** | mantenedor roda `npm publish --otp=123456` **no terminal dele**, com código do autenticador | destrava agora; exige ele presente, e um código NOVO por pacote (OTP é de uso único) |
| **Granular access token com _bypass 2FA_** | npmjs.com → Access Tokens → Granular → escopo `@snksergio`, permissão read/write, bypass 2FA ligado | configura uma vez; publica sem código |

⛔ **A IA não manipula credencial em texto claro** — nem token clássico, nem granular, nem OTP.
Se o mantenedor colar um token na conversa: **recuse o uso**, avise que ele deve ser tratado
como exposto **a partir da colagem** (não do uso) e revogado, e ofereça o caminho limpo:

```bash
npm login          # interativo, no terminal DELE — a credencial fica no ~/.npmrc pessoal
npm whoami         # confirma a conta
```

Autenticada a máquina, a IA **pode** rodar o `npm publish`: ele lê a sessão do usuário, e
nenhum segredo passa pela IA. Foi assim que a v0.39.1 subiu.

Nunca escreva token (nem mascarado) em `pipeline-state.md`, `.npmrc` versionado ou qualquer
arquivo do repo. Registre apenas **que** publicou e a versão. **Sempre** lembre o mantenedor
de revogar o que passou pelo chat — a pendência da v0.39.0 seguia aberta na v0.39.1.

### 7.1 Validar o pacote ANTES de pedir o token

```bash
npm run lib:verify      # = build:lib + as 5 camadas do scripts/lib-verify.mjs
```

Reprovou → **PARE e reporte**; não peça o token pra publicar pacote quebrado. O gate
cobre o modo de falha da **L-017** (4 releases, v0.1.0→v0.5.0, publicadas com os `.d.ts`
apontando pra arquivos que não entraram no tarball → todo `import` do consumidor virava
`any`, e ninguém percebeu). A camada decisiva é a 5ª: o conjunto de `.d.ts` do tarball
tem que ser **fechado sob imports relativos**.

### 7.2 Apresentar ao humano e conferir a autenticação

Mostre: `name@version`, nº de arquivos e tamanho do tarball, e o que muda em relação à
versão publicada (`npm view <pkg> version`).

**Não peça token.** Confira se a máquina já está autenticada:

```bash
npm whoami          # esperado: snksergio
```

- **Responde o usuário** → siga pro 7.3.
- **`ENEEDAUTH`** → peça pro mantenedor rodar `npm login` **no terminal dele** (é
  interativo — abre o navegador, e o shell da IA tem stdin fechado, então não roda por
  aqui). Depois `npm whoami` pra confirmar.

### 7.3 Publicar

Com a máquina autenticada, a IA pode rodar o publish: o `npm` lê a sessão do **usuário**
no `~/.npmrc` pessoal dele, e nenhum segredo passa pela IA.

```bash
npm publish                 # raiz — o prepublishOnly roda o build:lib
cd cli && npm publish       # só se cli/** mudou (rebake, template, vocabulário)
```

**Se sair E403 de 2FA** (ver 7.0): o publish tem que ser do mantenedor, no terminal dele,
com código do autenticador — e um código **novo por pacote**, porque OTP é de uso único:

```bash
npm publish --otp=123456
cd cli && npm publish --otp=654321
```

Alternativa permanente, recomendada: granular token com bypass de 2FA, instalado por ele
com `npm config set //registry.npmjs.org/:_authToken <token>` — **no terminal dele**, nunca
colado na conversa.

⛔ Não monte `.npmrc` com token, nem temporário: a IA não manipula credencial em texto
claro. Nunca `echo` de token, nunca `.npmrc` commitado, nunca token em `pipeline-state.md`
(nem mascarado).

### 7.4 Confirmar e lembrar da revogação

```bash
npm view @snksergio/design-system version    # tem que bater com o bump
```

Reporte e **lembre explicitamente o mantenedor de revogar o token**. Registre no
`pipeline-state.md` apenas *que* foi publicado e a versão — jamais o token.

---

## Out of scope deste skill

- Merge automático do PR (decisão humana, gate de review)
- Deploy automático (responsabilidade do CI/Vercel)
- Edits em entries antigas do `RELEASES` (array é append-on-top)
- Bump de `package.json` sem release (use `npm version` direto)
- Delete da branch pós-merge (manual ou via gh PR auto-delete-branch setting)
- Rollback (caso de fail no Vercel build) — fazer manualmente revert do merge

---

## Erros comuns

| Sintoma | Causa provável | Ação |
|---|---|---|
| `git push` bloqueado em main | Policy do repo (branch protection) | Skill já cria branch lateral; se ainda assim falha, verificar permissions remotas |
| `gh: command not found` | CLI não instalada | Pedir pro usuário instalar (`brew install gh` / `winget install GitHub.cli`) ou abrir PR manualmente |
| TS build falha | `tsc -b` mais estrito que `tsc --noEmit` | Rodar `tsc -b` antes do passo 6.3 (CI replica `npm run build`) |
| `git reset --hard` perde mudanças | Working tree sujo não-coberto pelo commit | Stash antes ou incluir no commit do passo 6.5 |
| PR template auto-injected difere do body | Repo tem `.github/PULL_REQUEST_TEMPLATE.md` | `gh pr create --body-file` em vez de `--body` literal |

---

## Checklist final (skill aprovada se TODOS true)

- [ ] `RELEASE_PUSHED` sinal emitido com URL do PR válida
- [ ] `main` local == `empresa/main` (sem commits órfãos)
- [ ] Branch `release/v<X.Y.Z>` existe local + remote
- [ ] `package.json.version` na branch == version da entry
- [ ] TS build limpo
- [ ] Working tree limpo (ou apenas `.ai/` / scratch fora do escopo)
