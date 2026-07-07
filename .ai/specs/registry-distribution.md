# iGreen DS como provedor — registry shadcn (copy-in) + MCP

Spec viva da iniciativa de distribuição. Não substitui `CLAUDE.md` nem
`.claude/rules/ds-standards.md` (regras de comportamento continuam valendo).
Define **o que** vamos construir e **por quê**.

> Objetivo: o DS deixa de ser consumido por submódulo e passa a ser **provedor
> via registry shadcn (copy-in) + MCP**, com versão por componente e um CLI que
> prepara o consumidor sem configuração manual.

---

## 1. Estado atual (verificado no repo — 2026-06-16)

- Pacote: `@snksergio/design-system` **0.9.0**.
- Stack: React 19 + Vite + TS + **Tailwind v4** + **Shadcn** + Radix. Acoplamento
  real (o "stack agnóstico" do CLAUDE.md está desatualizado — assumir acoplamento).
- Componentes: **23** em `src/components/ui/` (tv() + `*.styles.ts`), **27** em
  `src/components/shadcn/` (Shadcn adaptados aos tokens).
- Utils que TODO componente depende: `src/lib/utils.ts` (`cn`, importado em **81**
  lugares) e `src/utils/tv.ts` (`tv` + `twMergeConfig` da L-016, **25** lugares).
- Tokens: OKLCH em 3 tiers em `tokens/`. Transforms: `to-tailwind-v4`,
  `to-css-vars`, `to-dtcg`. `npm run tokens:tw4` gera o CSS de tema.
- `components.json`: tem aliases (`components=@/components`, `utils=@/lib/utils`,
  `ui=@/components/shadcn`, `lib=@/lib`, `hooks=@/hooks`), `tailwind.css=
  src/styles/globals.css`, `cssVariables=true`, `iconLibrary=lucide`.
  **NÃO tem `registries`** configurado.
- `build:lib` = `tokens:tw4 && vite build --config vite.lib.config.ts` → `dist-lib/`.
  Scripts `release:patch|minor|major` (semver).
- **Tags desatualizadas**: só `v0.4.0`, `v0.5.0`, `v0.5.1` (+ `cli-v0.1.3/4`).
  Não acompanham o `package.json` (0.9.0). O `/ds-release` parou de cravar tag.
- **Sem** `vercel.json`, `.vercel`, `public/r/`. `.mcp.json` só tem playwright.
- Consumo real hoje: **git submódulo** (npm existe mas não é o canal usado).

---

## 2. Necessidade

Provedor consumido por vários projetos e pods efêmeros (IA-first):
sem submódulo · sem runtime/servidor live · **versão por componente** (atualizar/
congelar/reverter de forma independente) · terceiros (inclusive não-técnicos via
agente) consomem sem montar config · governança viaja junto · manutenção leve
(1 mantenedor).

---

## 3. Decisões (Fase 0/1 fechadas)

1. **Endpoint — deploy dedicado pro registry (Next mínimo) na Vercel.** NÃO servir
   do projeto de preview Vite (estático, sem runtime pro Bearer). Usar o template
   oficial de registry do shadcn (Next) com **route handler + auth** validando
   `Authorization: Bearer ${IGREEN_TOKEN}`. `shadcn build` gera os JSON; o handler
   serve com auth. Mantém o preview simples e dá runtime pro token. GitHub raw
   descartado (auth privada capenga + cache do raw atrapalha versão).
2. **Namespace único — `@igreen`** (Fase 1). Os tipos de item (`registry:ui`,
   `registry:theme`, `registry:file`) organizam por dentro. Split em
   `-ui/-tokens/-ai` fica pra depois, só se surgir necessidade real.
3. **Carimbo — `igreen-ds · <nome> · v<version> · <short-hash> · AAAA-MM-DD`**.
   A versão = **`package.json.version`** (não tag — as tags estão furadas) +
   **short-hash do commit** + data do build. Gravado **SÓ no `meta.stamp`** do item
   (+ manifesto, Fase 3). **Ordem crítica:** o build do registry roda **depois do
   bump da version**, senão carimba a anterior.
   - ✅ **Decisão 2026-06-16 — header-stamp DROPADO** (era injetado no topo de cada
     arquivo-fonte; removido de fonte e cópia). A rev vive só no `meta.stamp` +
     manifesto. Motivos: (1) **churn falso** — o header mudava a cada build só pela
     data/hash, sem mudança de código → re-prompt de overwrite à toa no consumidor;
     (2) **drift check robusto** — o hash de referência passa a ser do **código
     puro**, sem ruído do carimbo, então o doctor acusa só edição real de `cn`/`tv`
     (fortalece a salvaguarda L-016 / prefixos); (3) **consistência** — os
     `registry:ui` já perdiam o header no transform do shadcn; agora **todos** os
     items têm a rev no mesmo lugar. O `scripts/registry-stamp.mjs` só seta
     `meta.stamp` e ainda **remove headers residuais** (limpeza idempotente).

### Decisões estruturais (do contexto, mantidas)
- Fachada única `@igreen/<nome>` — origem `ui/` vs `shadcn/` **não vaza**.
- `registryDependencies` **sempre com namespace** (`@igreen/input`), nunca nome
  solto nem `@shadcn/input`.
- Pastas `ui/` e `shadcn/` **intactas** (procedência interna).
- npm da lib **aposentado** como canal, mas `build:lib` **mantido** (reativar é
  barato).
- CLI `create-*` **mantido e evoluído** (bootstrap, não distribuição) — segue npm.
- Governança **passiva** (rules/USAGE) via registry; **ativa** (hooks) fica pro
  Workspace Orchestrator (fora desta iniciativa).

---

## 4. Refino de gotchas (corrigido)

- **`@source` NÃO se aplica no copy-in.** O gotcha existia no modelo npm (componentes
  em `node_modules`, que o Tailwind v4 ignora). No copy-in os arquivos caem em
  `src/` do consumidor, que o Tailwind **já escaneia por padrão**. → **Não** adicionar
  `@source` apontando pra `node_modules`/`dist-lib`.
- **Ordem continua valendo**: o **tema (tokens) entra antes** dos componentes,
  senão `gap-gp-md`, `rounded-radius-base` etc. ficam órfãs (sem as CSS vars do
  `@theme`).

---

## 5. Resoluções P1–P4 (decidido)

**P1 — Fonte do `rN`: `package.json.version` + short-hash do commit.** Não
dependemos de tag (furadas). **Ordem obrigatória:** o build do registry roda
**depois do bump da version**, senão carimba a anterior. A independência por
componente vem do **timing do copy-in** (o manifesto grava o `rN` vigente quando
cada componente foi adicionado).
- _Dívida (não bloqueia):_ reinstaurar o **crave de tag** no `/ds-release`, por
  higiene de release.

**P2 — `tv.ts` via `registry:file`; `utils.ts` via alias.** Opção (a):
- `tv.ts` → `registry:file` com `target: src/utils/tv.ts`; **cada componente
  declara a dependência** dele.
- `lib/utils.ts` (`cn`) → viaja pelo **alias `utils`** padrão do shadcn.
- **Pré-requisito do consumidor:** `@/*` → `src/*` no tsconfig (o scaffold garante).
- **Salvaguarda OBRIGATÓRIA:** o **drift check / doctor valida por hash** que
  `tv.ts` **e** `lib/utils.ts` (cn) estão presentes e íntegros no consumidor —
  e que a versão de **`tailwind-merge`** (a dep mais sensível: é ela que aplica o
  config) é compatível. Se faltar/adulterar/divergir → **alarme**, pra a L-016 e a
  resolução de prefixo DS nunca sumirem em silêncio. (Detalhe do overwrite do cn no
  consumo: ver item crítico da Fase 2.)
  - **Hash de referência = código PURO** (sem header-stamp — dropado, §3). O doctor
    compara o hash do `cn`/`tv` instalado no consumidor contra o hash do **conteúdo
    de fonte** (idêntico ao `content` do JSON do registry). Como o carimbo não entra
    mais no arquivo, o hash só muda quando o **código real** de `cn`/`tv` muda — o
    alarme dispara em edição genuína, não em troca de versão/data.

> **Governança no registry (escopo dos primeiros items):** só `USAGE.md` viaja
> junto do componente. As **rules GLOBAIS** (`ds-standards`) ficam pra um **item de
> governança separado**, depois — não entram nos primeiros items.

**P3 — Revert via git do consumidor** (sem histórico no registry por enquanto). O
revert tem que cobrir **o arquivo do componente E a linha dele no manifesto** —
senão o manifesto passa a mentir a rev. (Re-pull de rev antiga pelo registry =
escopo futuro, exigiria endpoints versionados.)

**P4 — Deploy dedicado (Next mínimo) na Vercel**, NÃO o preview Vite. Template
oficial de registry do shadcn + route handler + auth `Bearer`. Preview segue
simples; o registry ganha runtime pro token.
- 🔴 **Furo de auth real em prod (2026-06-16) — estático fura o Bearer.** `curl` sem
  token voltou **200** + JSON. Causa: arquivos servidos como **estático pelo CDN**
  (`X-Vercel-Cache: HIT`, `Content-Disposition: filename`), porque o projeto Vercel
  apontava pra **raiz do DS (Vite)** — `vite build` copia `public/r/*.json` pro
  `dist/` e o edge serve cru em `/r/*`, **antes/fora do route handler**. Regra de
  ouro: no Next, **nada em `public/` passa por middleware/handler**. **Correções
  aplicadas:** (1) Root Directory do projeto Vercel = **`registry-app`** (Next), não
  a raiz do DS; (2) `registry-app` **sem `public/`** — a entrega só via route handler
  lendo do embed `registry-data.ts`; (3) rota `force-dynamic` + `Cache-Control:
  no-store` (anti cache-poisoning: CDN não cacheia um 200 autorizado pra servir a
  request sem token); (4) token lido em **runtime** (`process.env` dentro do GET).
  **Validar SEMPRE em modo produção** (`next build && next start`, não `next dev` —
  o dev não replica o edge). Checagem de aceite: `GET /r/button.json` sem header →
  **401**.

---

## 6. Escopo faseado

**Fase 1 — Publicar o DS como registry (provedor)** ✅ **CONCLUÍDA (2026-06-16)**
- **Fechamento:** PR #1 (snksergio) mergeado na `main` — merge commit `ecdef94`.
  Endpoint privado autenticado `igreen-registry.vercel.app` validado em **produção**
  (next build/start, não dev): sem token → 401, token errado → 401, token certo →
  200 + `Cache-Control: no-store`, inexistente → 404. `shadcn add @igreen/button`
  remoto trouxe `button` + `tv`; sem/errado token → não autorizado, 0 arquivos.
- ✅ **Furo do estático RESOLVIDO (2026-06-17).** O projeto Vercel buildava a **raiz
  como Vite** (estático, sem `/r` → registry público). **Fix no dashboard:** **Root
  Directory = `registry-app`** + **Framework Preset = Next.js** + "Include files
  outside root" = Enabled → o build entra em `registry-app/` (com o `vercel.json`
  forçando `next build`) e serve a route handler autenticada.
- 🟡 **DEPLOY É MANUAL (git auto-deploy NÃO está firando).** Procedimento correto:
  ```
  npm run registry:build && (cd registry-app && node scripts/copy-registry.mjs)
  git add -A && git commit ... && git push mirror main      # versiona
  vercel --prod --yes                                        # da RAIZ do repo — publica
  ```
  ⚠️ O `vercel --prod` **tem que sair da raiz do repo** (com `.vercel/project.json`
  linkando o projeto) — a Vercel aplica `Root Directory=registry-app` e entra na
  subpasta. Rodar de **dentro** de `registry-app` falha (`registry-app/registry-app`
  não existe). **O push na main por si só NÃO publica** — confirmado: o push do
  embed do lote 1 não gerou deployment; quem publicou foi o `vercel --prod` da raiz.
  (Reconectar Git com root=registry-app pra auto-deploy real fica como melhoria.)
  Aceite pós-deploy: `curl …/r/<novo-item>.json` com token → 200.
- ⚠️ **`IGREEN_TOKEN` é sensível na Vercel:** `vercel env pull` devolve **vazio**
  (`""`) — o plaintext não sai no pull. Distribuir o valor aos consumidores
  **out-of-band** (quem seta o token guarda o valor), não via pull.

### Cobertura de componentes (2026-06-17) — 49 items publicados e validados
Distribuição **finalizada**. Foundational (3): `utils`, `tv`, `theme`.

**Primitivos shadcn (27):** `button` `input` `label` `textarea` `select` `card` `badge`
`separator` `checkbox` `accordion` `alert` `alert-dialog` `avatar` `breadcrumb`
`calendar` `command` `dialog` `dropdown-menu` `input-group` `pagination` `popover`
`progress` `radio-group` `sheet` `slider` `switch` `tabs`.

**Composites ui/ (14):** `form-field` `alert-modal` `button-group` `floating-panel`
`modal` `panel` `footer-table` `kanban` `combobox` `card-checkbox` `chip` `icon`
`page-header` `avatar-ig` (Avatar iGreen — nome distinto pra não colidir com o
primitivo `avatar`).

**App-level (5):** `chart` (Recharts) `table` `menu-sidebar` `header` `app-shell`.

Cada um validado via `shadcn add` no `consumer-demo` (resolve registryDeps + compila +
renderiza). e2e final: FormField (composite refatorado) + primitivos → build + render OK.

### Como composites/app-level ficaram distribuíveis (refactor aplicado)
shadcn **reescreve imports `import ... from "@/..."`** de registryDependencies pro
target do consumidor (ex.: `@/components/shadcn/dialog` → `@/components/ui/dialog`).
**NÃO reescreve:** (1) imports **relativos cross-dir** (`../../shadcn/x`); (2)
**`export ... from "@/..."`** (barrel re-export). Refactors feitos no DS (tsc + build:lib
verdes — DS intacto):
- **relativo cross-dir → alias `@/`**: FormField, AlertModal, ButtonGroup, FloatingPanel,
  Modal, Panel, FooterTable, Kanban, Header, MenuSidebar, AppShell.
- **`export...from` → `import` + `export` local**: Panel/index.ts (re-export de Sheet).
- **arquivos auxiliares não-item bundlados como `registry:file`** no(s) item(ns) que usam:
  `src/lib/lucide-types.ts` (FloatingPanel, Panel, MenuSidebar, Header, AppShell),
  `src/utils/color-contrast.ts` (avatar-ig), `MenuSidebar/use-media-query.ts` (table).

**Regra de distribuibilidade (canônica):** um `ui/` só é copy-in se seus imports forem
(a) same-dir relativo (`./x`, copiado junto), (b) alias `@/` de um registryDependency
(reescrito) ou (c) alias `@/` de arquivo auxiliar bundlado como `registry:file`. Import
relativo cross-dir e `export...from` cross-component **quebram** — refatorar antes.

### DataTable + TableToolbar — DISTRIBUÍDO (2026-06-17, lote 6) ✅
Item único **`@igreen/data-table`** (104 arquivos) bundla **DataTable + TableToolbar**
— resolve o acoplamento **circular** (DataTable ↔ TableToolbar) tratando os dois como
UMA unidade. **Técnica:** targets espelham a estrutura (`components/ui/DataTable/**` +
`components/ui/TableToolbar/**`) → imports intra-bundle E sibling-ui (`../Kanban`,
`../../Button/button`, etc.) resolvem **via mirror** sem reescrita; só os `shadcn/`
relativos viraram alias `@/` (reescritos pra `ui/` no copy-in). registryDeps: 21 folhas
já publicadas (table, kanban, chip, avatar-ig, footer-table, combobox, alert-modal,
floating-panel, form-field, button-group + 8 primitivos shadcn + utils/tv). npm:
`@dnd-kit/{core,sortable,utilities}` + lucide. `use-media-query` bundlado.
- **Validado em consumidor LIMPO (template do CLI):** `shadcn add @igreen/data-table` →
  184 arquivos (item + todas as deps), `vite build` exit 0, `tsc --noEmit` exit 0.
- ✅ **Caveats RESOLVIDOS (2026-06-17):**
  - **Colisão de case `avatar` vs `avatar-ig`:** RESOLVIDA. Dir do DS renomeado
    `ui/Avatar/` → `ui/avatar-ig/` (+ barrel + todos os importers); o item targeta
    `components/ui/avatar-ig/` → não colide com `ui/avatar.tsx` (primitivo). **Validado
    em consumidor limpo: `avatar` + `avatar-ig` + `data-table` instalados JUNTOS →
    coexistem, vite build + tsc exit 0.** O export segue `Avatar` (API da lib intacta).
  - **Imports mortos no `data-table.tsx`:** RESOLVIDO. Removidos ~24 imports/locals não
    usados (TableCell, TableRow, ícones lucide, dropdown-menu, popovers, tipos, applyView,
    index). DS tsc 0 + build:lib 0. Não quebra mais sob `noUnusedLocals`.
  - **`import.meta.env`:** o DataTable usa → consumidor precisa de `vite/client` types.
    Já no template do CLI (`src/vite-env.d.ts`, v0.3.1).

`TabelaTeste`: demo interno, não-API — não distribuído.
- `registry.json` na raiz: componentes (`ui/` + `shadcn/`), tema/tokens, ≥1 item
  de governança passiva.
- `registryDependencies` com namespace explícito entre componentes (`form` →
  `@igreen/input`).
- `dependencies` (npm de terceiros: Radix, lucide) por item — extrair dos imports.
- Foundational: distribuir `tv.ts` + `lib/utils.ts` (ver P2).
- Passo de build que injeta o `rN` (`package.json.version` + short-hash) no
  `meta.stamp` — **rodando depois do bump da version** (P1). Header-stamp dropado (§3).
- `tv.ts` como `registry:file` (`target: src/utils/tv.ts`); cada componente declara
  a dependência (P2). `cn` via alias `utils`.
- `shadcn build` → JSON; servidos pelo **deploy Next dedicado** com route handler +
  auth `Bearer` (P4).
- **Nota de teste:** validar o `theme` na Fase 1 exige `@import` **manual** no CSS
  do projeto de teste (o wiring do `globals.css` é Fase 2). Sem isso o
  `tailwind-theme.css` cai no projeto mas **não aplica** (classes órfãs).
- **Pronto quando:** de um projeto de teste com `@igreen` configurado,
  `shadcn add @igreen/<componente>` traz código + deps corretas.

**Validação local — resultados (2026-06-16, projeto descartável + registry HTTP local):**
- `npx shadcn build` → 5 items + index; content embutido, stamp no `meta`, deps OK,
  fachada preservada (`input` → `components/ui/input.tsx`). Nenhum path/dep furado.
- `shadcn add @igreen/button` → trouxe `button` **+ `tv`** (registryDependency
  resolvida), instalou `tailwind-variants`, **tsc 0** (App renderizando `<Button>`).
- 🔴 **`cn`-overwrite CONFIRMADO** (o risco P2/Fase 2): `shadcn add @igreen/input`
  **sem `--overwrite`** (mesmo com `--yes`) → o shadcn **pergunta** "utils.ts already
  exists, overwrite? (y/N)" (default N); em não-interativo **não escreve nada** (cn
  fica o padrão, `input.tsx` nem cai). **Com `--overwrite --yes`** → cn vira o do DS
  (`extendTailwindMerge` + prefixos), `input.tsx` cai, **tsc 0**.
  - **Add subsequente (cn do DS já instalado):** o shadcn **PULA o utils em silêncio**
    (`Skipped — files might be identical`) e instala o componente normal — **sem
    bloquear, sem re-perguntar**. Só re-pergunta se o conteúdo do utils **diferir**
    (cn real mudou OU o stamp do header bumpou de versão).
  → **Salvaguarda no SETUP, não `--overwrite` cego:** o scaffold resolve o cn UMA vez
    (`shadcn init` → **remove `lib/utils.ts`** → `add @igreen/utils`) + doctor valida o
    cn por hash. `--overwrite` cego em todo add apagaria customização local em app
    persistente — por isso a salvaguarda é no setup, não por-add.
  ✅ **Risco do stamp no header — RESOLVIDO (2026-06-16): header-stamp DROPADO.** Era:
    o header de `utils`/`tv` carregava `v<version>·hash·data` → a cada release o
    conteúdo dos `registry:file` MUDAVA → add subsequente via "difere" e
    re-perguntava/bloqueava em CI. **Aplicado:** removido o header de todos os
    arquivos (fonte + cópia); a rev vive só no `meta.stamp` + manifesto. Resultado:
    conteúdo dos `registry:file` **estável entre versões** (só muda em mudança de
    código real) → sem re-prompt falso; e o hash de referência do drift check fica
    livre do ruído do carimbo (§3, P2). Re-gerado e verificado: zero `@igreen-stamp`
    no `content` de qualquer JSON; `meta.stamp` presente nos 5 items.

**Fase 2 — CLI de scaffold (consumidor)** ✅ **CONCLUÍDA (2026-06-17)**
- **Entregue:** `cli/` (`@snksergio/create-design-system` v0.2.0) reescrito do modelo
  npm pro modelo registry. Template `cli/templates/default/` agora traz: `components.json`
  com registry `@igreen` + Bearer; `_env.local.example` (→ `.env.local`); `vite.config`
  com alias `@/`; `tsconfig` com paths; `index.css` (tailwindcss + tw-animate-css + theme
  na ordem certa); **`cn`/`tv`/`theme` BAKED** (`src/lib/utils.ts`, `src/utils/tv.ts`,
  `src/styles/theme/tailwind-theme.css`, + `lucide-types.ts`); `scripts/doctor.mjs`
  (hash do cn/tv); `App.tsx` starter (tokens-only) + próximos passos. `create.js` ganhou
  prompt opcional do `IGREEN_TOKEN` (grava `.env.local`), rename do `_env.local.example`,
  e next-steps do modelo registry.
- **Salvaguarda do cn — resolvida por BAKING (decisão).** Em vez de depender de
  `--overwrite` no add, o template **já nasce com o cn/tv do DS** → o `shadcn add` que
  traga `@igreen/utils`/`@igreen/tv` os vê **idênticos e PULA** (sem overwrite, sem o cn
  padrão do shadcn entrar). Validado: scaffold → install → build → `shadcn add @igreen/button`
  (utils **Skipped**, integridade mantida) → `add @igreen/form-field` (16 arquivos) →
  `doctor` ✓ (cn/tv íntegros) → build exit 0.
- **Validação:** simulei o scaffold do CLI (copy+renames) num projeto limpo, install +
  build + doctor + typecheck verdes, e os `add` reais contra o registry autenticado OK.
- **Drift do baked — RESOLVIDO (não morde calado).** O baking congela cn/tv/theme; se o
  DS atualizar os foundational, o baked diverge. Duas defesas:
  1. **`doctor.mjs` valida CONTRA O REGISTRY** (não hash congelado): faz `fetch` de
     `@igreen/utils`/`tv` com o token e compara hash (CRLF-agnóstico) do arquivo local
     vs `content` do registry. Pega **edição local E drift do DS**; sem token/offline
     sai 1 (nunca dá falso-OK). Validado: em-sincronia → ✓✓ exit 0; arquivo editado → ✗
     exit 1.
  2. **`npm run cli:rebake`** (`scripts/cli-rebake-foundationals.mjs`) re-copia os 4
     foundational do DS pro template. **Regra no pre-commit-check (2.2):** mexeu em
     cn/tv/lucide-types/theme → `cli:rebake` + bump `cli/package.json`. Evita que
     projetos NOVOS nasçam defasados.
- Original (referência histórica): Vite + React + TS, Tailwind v4, `shadcn init`, grava
  `@igreen` + token no `components.json` e `.env.local`, puxa o tema antes dos componentes.
- **🔴 ITEM CRÍTICO — overwrite do `cn`.** O `shadcn init` planta um
  `src/lib/utils.ts` com o **cn padrão** (`twMerge(clsx())` sem config). Quando o
  consumidor puxar `@igreen/utils`, esse arquivo **PRECISA ser sobrescrito** —
  senão o consumidor fica com o cn errado e a **resolução de conflito dos prefixos
  DS quebra em silêncio** (mesmo desastre do Q1, agora no consumo). Comportamento
  conhecido do shadcn: ao achar o arquivo existente ele **pergunta** (interativo)
  ou **pula** (não-interativo) — ou seja, **não sobrescreve sozinho** em CI/pod.
  Salvaguarda obrigatória do scaffold: **(a)** não deixar o `init` plantar o cn
  padrão (remover/saltar) **ou (b)** rodar `shadcn add @igreen/utils --overwrite`
  (forçado) **antes** de qualquer componente. E o **doctor valida por hash** que o
  `cn` instalado é o do DS (não o do init). Mesma salvaguarda do `tv`.
- Opcional: `shadcn mcp init` + `CLAUDE.md` de onboarding consumer-facing.
- **Pronto quando:** `npm create @snksergio/design-system <app>` roda com tema
  aplicado, namespace, e o **cn do DS instalado (hash confere)**, zero config manual.

**Fase 3 — Versionamento + governança no consumidor** ✅ **CONCLUÍDA (2026-06-17)**
- **Entregue (CLI v0.3.0):** `scripts/igreen-add.mjs` (`npm run igreen:add -- <x>`) — wrapper
  do `shadcn add` que grava `.igreen-ds/manifest.json` `{ items: { <nome>: { rev (meta.stamp),
  hash (dos arquivos instalados), files, addedAt } } }`. `scripts/igreen-drift.mjs`
  (`npm run igreen:drift`, CI) — re-hasheia os arquivos vs baseline do manifesto (pega
  **edição local** → exit 1) + compara a rev vs registry (pega **defasagem** → aviso). O
  `doctor.mjs` cobre cn/tv contra o registry. Manifesto é commitável (rev por-componente).
- **Decisão (wrapper, não scan/hook):** manifesto cresce incrementalmente a cada `igreen:add`,
  registrando os `files[].target` do item + hash pós-transform → drift detecta edição sem
  precisar reverter o import-rewrite do shadcn (compara o instalado vs o instalado-no-add).
- **Caveat resolvido:** `process.exit()` com `fetch` keep-alive pendente crasha o libuv no
  Windows (assertion UV_HANDLE_CLOSING → exit 127). Fix: `process.exitCode` nos scripts.
- **Validado:** scaffold → `igreen:add button card` → manifesto com rev+files → `igreen:drift`
  exit 0; edição local → `✗ EDITADO` exit 1 (limpo, sem 127); re-`igreen:add` re-baseline → exit 0.
- Governança passiva (rules/USAGE) como `registry:file`: **diferido** (escopo futuro; USAGE.md
  já viaja junto de cada componente).
- _Histórico:_ **Manifesto = ESSENCIAL (não opcional).** O header de carimbo foi **dropado** (§3) —
  não existe mais em arquivo nenhum (e já sumia nos `registry:ui` pelo transform do
  shadcn). Logo o manifesto (`.igreen-ds/manifest.json`: componente → rev, atualizado
  a cada add, lendo o `meta.stamp` do JSON) é a **única rastreabilidade por-componente
  no consumidor**.
- Drift check (CI): hash do **código puro** local vs hash do `content` do registry →
  acusa edição fora do DS. Valida `lib/utils.ts` (cn) e `tv.ts` por hash (salvaguarda
  L-016 + prefixo). Como o carimbo não está no arquivo, o hash de referência não tem
  ruído de versão/data — o alarme só dispara em **edição real** do código (§5 P2).
- Governança passiva (rules/USAGE) como `registry:file` nos caminhos do consumidor.
- **Pronto quando:** manifesto mostra a rev de cada componente e o drift check
  acusa uma edição local proposital.

**Fase 4 — Validação ponta a ponta**
- Projeto do zero só com o CLI · puxar `form` (traz `input`), `button`, tema ·
  renderizar tela e conferir tokens · conferir manifesto + drift check · reverter
  um componente (via git do consumidor, P3) e confirmar isolamento.

---

## Integração com o pipeline (release) — 2026-06-17

A distribuição está **plugada no `/ds-release`** (Track A), não é mais passo manual solto:
- **`release.md` Passo 6.2b (Distribuição):** se a release tocou componente/token/foundational,
  roda `registry:build` (carimbo na versão **nova**, já que roda depois do bump) + embed
  (`copy-registry`); se foundational (cn/tv/lucide-types/theme) mudou → `cli:rebake` + bump
  `cli/package.json`. Esses artefatos entram no commit do release.
- **Deploy = automático:** Git do projeto Vercel conectado (`snksergio/igreen-admin-desingsystem`,
  Root Directory=`registry-app`, Framework=Next) → merge do PR na `main` re-deploya o registry.
  **Sem `vercel --prod` manual.** O `npm publish` do CLI continua **manual** (2FA) — só quando `cli/**` muda.
- **Versão:** o carimbo do registry segue `package.json.version` → o bump do `/ds-release`
  (patch/minor/major que ele já pergunta) **já gera a versão nova** do registry. Sem prompt extra.
  (Semver *por-componente* segue fora de escopo — opcional futuro.)
- **`pre-commit-check.md` 2.8:** gate acusa componente novo sem entrada no `registry.json`,
  registry não-rebuildado, e import cross-dir (`../../shadcn/x`) que quebra no copy-in.

### Helper de criação: `scripts/registry-add-item.mjs`
Pra **criar componente** novo distribuível sem montar a entrada na mão:
`node scripts/registry-add-item.mjs <Componente>` escaneia os imports → propõe a entrada do
`registry.json` (registryDependencies `@igreen/*` + dependencies npm com versão do package.json)
e **sinaliza imports relativos cross-dir** que precisam virar alias `@/`. Não insere sozinho
(humano revisa + cola). Fecha a lacuna "criei componente mas ele não vira distribuível".

---

## 7. Fora de escopo
- Tornar o DS stack-agnóstico (casamento Shadcn + Tailwind v4 mantido de propósito).
- Servidor de runtime pro DS (registry/MCP só em build/generation-time).
- Reorganizar estrutura interna (`ui/`, `shadcn/`, `tokens/`, `.claude/`, `.ai/`).
- Governança ativa no pod (pertence ao Workspace Orchestrator).

---

## 8. Glossário
- **Registry (shadcn):** distribui código-fonte como JSON estático (texto). Não é
  compilação nem dependência de runtime.
- **Copy-in:** componente copiado pro consumidor, vira código dele, congelado até
  novo `add`.
- **`shadcn build`:** lê `registry.json` e gera os JSON dos items. Não versiona —
  o `rN` é camada nossa por cima.
- **Namespace `@igreen`:** alias do registry no `components.json` do consumidor.
  Diferente de `@shadcn` (registry oficial — nunca nas deps internas).
- **Carimbo `rN`:** indicador de versão por componente, gravado só no `meta.stamp`
  do item + manifesto (header-stamp dropado em 2026-06-16 — §3).
- **Manifesto:** arquivo no consumidor que lista a rev de cada componente.
