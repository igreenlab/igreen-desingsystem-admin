# Auditoria de Segurança — 2026-08-07 · revisão 2026-08-13

Design system iGreen: componentes React distribuídos via CLI (`igreen add`),
lib npm e um registry privado (Next.js na Vercel, `registry-app/`) protegido
por Bearer token. Autor: Dario C Oliveira.

## Histórico de correções

| Item | Auditoria | Status no `main` |
|---|---|---|
| Comparação non-constant-time do Bearer token no registry | 2026-08-07 | ⏳ Aguardando merge de `security` |
| `@playwright/mcp@latest` sem pin de versão em `.mcp.json` | 2026-08-07 | ⏳ Aguardando merge de `security` |
| Stack overflow do parser do `MarkdownText` (DoS por mensagem recebida) | 2026-08-13 | ⏳ Aguardando merge de `security` |
| XSS via `<style dangerouslySetInnerHTML>` no `Chart` | 2026-08-13 | ⏳ Aguardando merge de `security` |
| Chaves do `Object.prototype` na rota do registry (200/500 em vez de 404) | 2026-08-13 | ⏳ Aguardando merge de `security` |
| `shadcn@latest` sem pin nos scripts do consumidor | 2026-08-13 | ⏳ Aguardando merge de `security` |
| `.env.local` com o Bearer escrito em 0644 pelo CLI | 2026-08-13 | ⏳ Aguardando merge de `security` |
| `nanoid` vulnerável no lock do `registry-app` (travaria o `release:check`) | 2026-08-13 | ⏳ Aguardando merge de `security` |
| Actions em tag mutável + `GITHUB_TOKEN` sem `permissions:` no CI | 2026-08-13 | ⏳ Aguardando merge de `security` |
| `public/r/` podia vazar no showcase por deploy manual | 2026-08-13 | ⏳ Aguardando merge de `security` |
| Distribuição (npm CLI/lib, Vercel) sob conta pessoal `snksergio` | 2026-08-07 | 🟡 Decisão do time — ver Pendências |
| 6 advisories HIGH no lock da raiz (pacote publicado no npm) | 2026-08-13 | 🟡 Precisa refresh de lock — ver Pendências |

## Corrigido em 2026-08-07

### Baixo

- **Comparação non-constant-time do Bearer token**
  (`registry-app/app/r/[name]/route.ts`): `auth !== \`Bearer ${token}\`` compara
  string por string, vazando timing por caractere. Já era um item conhecido
  em `.ai/status/BACKLOG.md` (que deprioriza a feature maior de
  multi-token/rotação — "não vale o custo hoje" — mas não trata
  especificamente do endurecimento da comparação). Trocado por
  `crypto.timingSafeEqual`.
- **`@playwright/mcp@latest` sem pin** (`.mcp.json`): fixado em `0.0.79`
  (versão publicada verificada no registry do npm), removendo a superfície
  de supply-chain de rodar `npx` contra o que estiver publicado no momento.

## Corrigido em 2026-08-13 (revisão da própria branch `security`)

### Médio

- **DoS persistido no `MarkdownText`** (`src/components/ui/MarkdownText/markdown-text.tsx`):
  o parser era recursivo e gastava um frame de pilha **por marcador encontrado**
  (o `after` recursionava com o resto da string), então a profundidade era
  O(nº de marcadores). `"*a*".repeat(5000)` — **15 KB**, cabe folgado no limite
  de 65.536 chars de uma mensagem de WhatsApp — estourava com
  `RangeError: Maximum call stack size exceeded` **durante o render**. O
  componente renderiza conteúdo RECEBIDO (`MessageBubble`,
  `ConversationListItem`), e a mensagem fica persistida: derrubava a bolha e o
  item da lista, e reabrir a conversa derrubava de novo — a caixa de entrada
  inteira, a cada abertura. Reescrito como máquina de pilha em heap (O(n) de
  memória, zero de pilha de chamada); os `push(...array)` do mesmo arquivo
  viraram `pushAll` porque spread também estoura no limite de argumentos do V8.
  Coberto por `markdown-text.test.tsx` (5k, 20k, aninhamento profundo e o
  tamanho máximo de mensagem do WhatsApp).
- **XSS via `<style dangerouslySetInnerHTML>` no `Chart`**
  (`src/components/ui/Chart/chart.tsx`): o `ChartStyle` interpolava `id`, a
  chave da série e a cor **sem escape** dentro do `<style>`. Um `</style>` em
  qualquer um dos três fecha a tag e o resto é parseado como HTML. Não é
  hipotético: `config` costuma ser montado a partir das séries que vêm da API
  (`config[serie] = { label, color }`) e `id` é prop pública do
  `ChartContainer`. Código herdado do shadcn, mas distribuído por este registry
  pra painéis administrativos. Adicionado allowlist nos três pontos
  (`SAFE_CSS_IDENT` / `SAFE_CSS_VALUE`, este cobrindo hex, `var()`, `oklch()`
  com barra, `color-mix()` e `rgba()`); valor fora do contrato é descartado em
  silêncio e o gráfico degrada em vez de quebrar a página. Coberto por
  `chart.test.tsx`, incluindo o caminho do `useId` (id gerado).

### Baixo

- **Vazamento de tamanho do token na própria correção de timing**
  (`registry-app/app/r/[name]/route.ts`): comparar as strings cruas exige um
  `if (a.length !== b.length) return false` antes (senão o `timingSafeEqual` dá
  throw), e esse early-return é ele mesmo um oráculo de timing pro **tamanho**
  do token. Passou a comparar o SHA-256 dos dois lados: buffers de 32 bytes
  sempre, sem caminho curto e sem throw possível.
- **Chaves herdadas do `Object.prototype` na rota do registry**: o embed é um
  object literal, então `registry["__proto__"]` devolvia `Object.prototype`
  (**200** com `{}`) e `registry["constructor"]` devolvia a função `Object`, que
  o `NextResponse.json` não serializa → exceção não tratada = **500** num
  endpoint público. Trocado por `Object.hasOwn`. Verificado com `next start`:
  `__proto__`, `constructor` e `toString` agora dão **404**.
- **`shadcn@latest` sem pin** — pinado em `shadcn@4.17.0` só onde o comando
  **executa**: `cli/templates/default/scripts/igreen-add.mjs`,
  `igreen-update.mjs`, `cli/templates/default/_mcp.json`, `registry:build` no
  `package.json`, e o allowlist do `.claude/settings.json` (que pré-autorizava
  rodar `npx shadcn@latest` sem confirmação). Menção em prosa de documentação
  ficou fora de propósito: é churn de doc, não superfície de execução.
  Era a superfície de supply-chain **maior** que a do `@playwright/mcp` já
  pinado: roda em toda máquina de consumidor, a cada `igreen:add`/`igreen:update`,
  com `--yes --overwrite` — ou seja, **escrevendo arquivos na árvore de código** —
  e com o `IGREEN_TOKEN` acessível no cwd.
- **Bearer do registry gravado em 0644** (`cli/src/create.js`): o
  `writeFileSync` sem `mode` usa `0o666 & ~umask` → **0644**, token legível por
  qualquer usuário da máquina. Passou a `0o600`. (O `.gitignore` já cobria o
  arquivo: é renomeado no Step 5, antes do `git add .` do Step 7 — conferido.)
- **`nanoid@3.3.16` no lock do `registry-app`**: advisory HIGH para `<3.3.17`.
  O `release:check` roda `npm audit --audit-level=high --prefix registry-app` de
  forma **bloqueante**, então o próximo release travaria — no pior momento, com
  o token de publish do mantenedor já vivo. Subido pra `3.3.18` (só o lock, sem
  tocar no `next`; `npm audit` volta 0 vulnerabilidades).
- **Actions em tag mutável e `GITHUB_TOKEN` sem escopo** (`.github/workflows/ci.yml`):
  `actions/checkout@v4` e `setup-node@v4` pinadas por SHA (tag é mutável — quem
  controla o repo da action reaponta `v4` e passa a rodar código novo dentro do
  job, sem PR nenhum aqui), e adicionado `permissions: contents: read` (sem o
  bloco, o token herda o default do repo, que em repo antigo é read/write).
- **`public/r/` podia vazar no domínio público do showcase**: criado
  `.vercelignore` **com uma entrada só** (`public/r/`) — o resto do que caberia
  ali (`dist/`, `node_modules/`, `coverage/`) é higiene de deploy e ficou fora
  de propósito. O gate Bearer do registry só existe porque o `registry-app`
  não tem `public/`; na raiz, o `registry:build` gera `public/r/*.json` e o Vite
  copia `public/` → `dist/`, que é o `outputDirectory` do showcase. Pela
  integração git isso nunca acontece (`public/r/` é gitignored e o
  `build:showcase` não roda `registry:build`), mas num `vercel deploy` manual da
  máquina do mantenedor — onde o diretório existe — os itens do registry iriam
  pro deploy público **sem auth**. Bypass completo do gate por um deploy manual.

### Verificado e descartado (não é vulnerabilidade)

- **`href` dinâmico** (`UrlColumnType`, `MessageBubble`, `MenuSidebar`,
  `MarkdownText`): React 19 **bloqueia** URL `javascript:` (testado em 19.2.8 —
  o atributo renderizado vira `javascript:throw new Error('React has blocked…')`).
  Todos os `target="_blank"` do DS já têm `rel="noopener noreferrer"`.
- **`MarkdownText` contra injeção**: o `URL_RE` só casa `http(s)://` e `www.`, e
  o parser produz React nodes a partir de substrings — tag digitada vira texto
  literal. A alegação da doc procede; o problema era só o DoS acima.
- **Segredos no histórico**: pickaxe em `IGREEN_TOKEN=` e nos padrões usuais
  (`ghp_`, `github_pat_`, `npm_…`, `AKIA…`, `xox…`, `sk-…`) em todas as refs:
  nada. Nenhum `.env` jamais rastreado.
- **CI**: usa `pull_request` (não `pull_request_target`) e não expõe secret no
  job; o `${{ github.base_ref }}` interpolado em `run:` é constrangido pelo
  `branches: [main]`.

## Pendências antes de fechar

- [ ] **Médio — Distribuição sob conta pessoal `snksergio`** (npm CLI, npm
      lib, registro na Vercel): já existe um runbook de migração pronto em
      `MIGRATION.md`, mas não foi executado. **Não mexi nisso nesta
      auditoria** — a mesma classe de risco já apareceu no `design-system`
      (outro repo desta auditoria): trocar o apontador de distribuição sem
      confirmar que o destino novo tem o mesmo conteúdo/histórico/tags pode
      quebrar consumidores existentes silenciosamente. Migrar exige acesso
      real de admin ao npm/Vercel/GitHub da org e execução coordenada do
      runbook já escrito, não uma edição de arquivo.
- [ ] **Médio — 6 advisories HIGH no lock da RAIZ** (`vite`, `undici`, `sharp`,
      `postcss`): a raiz é o pacote publicado no npm (`@snksergio/design-system`)
      e **não tem gate de audit nenhum** — o `release:check` só audita o
      `registry-app`. Precisa de refresh de lock + um step de audit pra raiz.
      Não fiz aqui porque mexer no lock da raiz é um diff grande, com risco de
      regressão visual, que merece PR própria e olhada no showcase.
- [ ] **Baixo — sem rate limit no endpoint do registry**: a correção de timing
      fechou o oráculo, mas brute-force online do Bearer segue ilimitado, com
      token único e sem rotação (o `BACKLOG.md` deprioriza multi-token; rate
      limit é mais barato que isso e não está lá).
- [ ] **Baixo — `shadcn@4.17.0` precisa de dono**: pin sem processo de bump
      envelhece. Vale entrar no checklist do `/ds-release`: conferir o
      changelog do shadcn e subir o pin de propósito.
- [ ] **⚠️ A correção do `MarkdownText` e do `Chart` só chega no consumidor com
      release.** O consumidor recebe o código pelo embed
      (`registry-app/app/registry-data.ts`), não pelo `src/`. O
      `registry-check --ci` já aponta os dois arquivos como conteúdo defasado no
      embed — de propósito: esta PR **não** regenera (Regra 8, distribuição
      consolida no `/ds-release`, não por PR de componente). Enquanto o
      `registry:build` + `copy-registry` + deploy não rodarem, quem já instalou
      segue com a versão vulnerável. O `registry-check` sem `--ci` (o que o CI
      roda) passa; o `--ci` do `release:check` fica vermelho até o release, que
      é onde o embed é regenerado.
- [ ] **Verificar na infra (não deu pra checar do repo)**: confirmar que
      `https://<dominio-do-showcase>/r/button.json` responde 404. O
      `.vercelignore` fecha o caminho daqui pra frente, mas se algum deploy
      manual anterior subiu o `public/r`, os itens podem estar públicos agora.

Verificado nesta revisão, no worktree da `security` (já com a `main` mergeada):
`npm ci` + `npx tsc --noEmit` + `npx vitest run` + `registry-check` +
`brand-check` + `check-foundationals` + `examples-drift` + `lint-styles
--ratchet origin/main` + `showcase-check` + `api-doc-check` + `lib:verify
--build` (tarball de 965 arquivos, 452 `.d.ts`) na raiz; `npm ci` + `tsc
--noEmit` + `next build` + `npm audit` (0 vulnerabilidades) no `registry-app`,
mais 8 casos de request contra `next start` (401 sem token / token errado /
token de outro tamanho; 200 com o certo; 404 em `__proto__`, `constructor`,
`toString` e item inexistente). Tudo verde.

> Achado colateral, **não** causado por esta branch: `src/hooks/useBrand.test.tsx`
> (12 testes) falha com `localStorage is undefined` em Node 26 + jsdom 29 —
> reproduzido num worktree limpo da `origin/main`, mesmo node_modules. O CI roda
> Node 20 e passa, então é ambiente local, não regressão. Vale um `engines` ou
> um shim no `vitest.setup.ts` pra não morder quem desenvolve em Node novo.

> Nota: a revisão de 2026-08-07 registrou "verificado com `pnpm install`" no
> `registry-app`, que é um app **npm** (lock `package-lock.json`, `npm ci` no CI
> e no `vercel.json`) — o `pnpm` resolve outra árvore, então aquela verificação
> não foi feita contra o que a Vercel instala. Esta revisão usou `npm ci`.
