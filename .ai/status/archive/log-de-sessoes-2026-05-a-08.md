# Log de sessões — 2026-05-16 a 2026-08-03

> **Arquivado de `.ai/status/pipeline-state.md` em 2026-08-17.** Nada foi editado —
> a seção foi movida inteira, com o conteúdo original.
>
> Encerrado: a última entrada é de 2026-08-03. Registro de sessão por sessão; as
> decisões arquiteturais do mesmo período vivem no `Índice de decisões arquiteturais`
> do `pipeline-state.md` ativo, que continua recebendo entradas novas.
>
> Motivo: o arquivo ativo estava em **431 KB e 146 entradas**, contra a política de
> ~50 KB / ~100 entradas registrada no `orchestrator.md`.

---

## Log de sessões

> Entradas mais recentes no topo.

<!-- NOVA ENTRADA AQUI -->

### [2026-08-03] | DS DEV | Sistema multi-marca entra no pipeline de conhecimento (4 superfícies) | CONCLUÍDO

- Input: perguntei o que faltava pra ficar "redondo" e o mantenedor mandou fechar tudo que é
  pipeline e entendimento. O tema funcionava; o conhecimento sobre ele não existia nos lugares
  onde alguém iria procurar.
- Diagnóstico medido antes de escrever:
  | arquivo | menções ao sistema de marca |
  |---|---|
  | `cli/templates/default/CLAUDE.md` (consumidor humano) | **0** |
  | `CLAUDE.md` do DS — mapa "Onde cada tarefa começa" | **0 linhas** |
  | `.claude/rules/ds-standards.md` (auto-carregada) | **3**, e todas dentro da L-066 |
  | `.ai/context/tokens/color.md` | **0** |
  A regra auto-carregada sabia do **bug** do overlay e não sabia que o **sistema** existia.
  Consequência concreta: pedido de 6ª marca não tinha entry point — o agente improvisaria e
  repetiria os erros desta sessão (canvas um degrau escuro, hierarquia de texto comprimida,
  `exports` esquecido).
- Output:
  1. **`ds-standards.md`** ganhou a seção "Sistema multi-marca": anatomia dos 3 arquivos, as
     **6 superfícies** de registro, os 4 canais de entrega e as **7 armadilhas medidas** (cast
     sem checagem, handoff mapeia pra UI dele, "mais vibrante" não é saturação, teto de gamut
     não deriva estado, `fg` de status no dark, rampa neutra por modo, verificar no browser).
  2. **`CLAUDE.md` do DS**: 2 linhas novas no mapa de tarefas (marca nova / alterar marca) +
     seção curta com a regra "marca muda SOMENTE cor" e ponteiro pra rule.
  3. **`.ai/context/tokens/color.md`**: aviso de que a doc descreve a `default` e existem 5,
     com o que muda por marca — inclusive as 2 exceções que surpreendem (`grayDark` e
     `success` = cor da marca).
  4. **`CLAUDE.md` do template do CLI**: seção de troca de tema em 2 passos + os 2 erros que
     respondem por quase toda falha, apontando pra rule `ds-themes.md`.
- Decisão: repetir os 2 erros críticos (CSS sem `data-theme` = inerte; overlay antes do base =
  sem efeito) em TODAS as superfícies, de propósito. Ambos falham em silêncio, e quem lê só um
  documento não pode ficar sem o aviso.
- Correção pega na auto-verificação: eu havia escrito em `color.md` que "`success` é alias do
  `brand` na `vibrant` e na `pay`". Verifiquei e **é falso pra `pay`** — a `vibrant` faz
  `export const success = brand` (alias no primitivo), a `pay` declara `success = {500:"#3bc882"}`
  e só faz os valores **coincidirem no semantic** (`#00a859`). Quem lesse iria procurar o alias
  na `pay` e não acharia. Reescrito com os dois mecanismos separados. É a L-060: verificar a
  garantia antes de afirmá-la — checkei as 5 afirmações da seção, essa era a única errada.
- Assumption: o mapa de tarefas + a rule auto-carregada são suficientes como entry point pra
  marca nova. Se alguém ainda improvisar, o que falta é um **command/skill** dedicado
  (`/ds-create-brand`) em vez de mais texto — mas isso é criar superfície nova, e 4 lugares de
  doc já cobrem o caminho sem inflar o pipeline.
- Bump: `cli/package.json` 0.21.0 → **0.21.1** (o `cli/templates/**` mudou, então precisa
  republicar pro consumidor receber). Lib **não** bumpa: nada de código/token mudou, só doc.
- Lições novas: nenhuma L-NNN nova (contagem segue 66).

### [2026-08-03] | DS DEV | Publish v0.32.1 (lib) + v0.21.0 (CLI) — ciclo da marca vibrant FECHADO | CONCLUÍDO

- Input: mantenedor aprovou o dark acromático e o `ColorsDoc` brand-aware (PR #109), e pediu
  o publish pra fechar os temas.
- Output publicado e confirmado por `npm view`:
  - `@snksergio/design-system@0.32.1` — 965 arquivos, 6.4 MB packed
  - `@snksergio/create-design-system@0.21.0` — 71 arquivos
- Verificação de ponta a ponta, **instalando do npm real** (não do tarball local):
  1. `import.meta.resolve` resolve os **5 subpaths** de tema num projeto limpo.
  2. O CSS baixado tem o dark **acromático de verdade**: `bg-canvas oklch(0.2050 0 0)`,
     `bg-surface oklch(0.2603 0 0)` (#242424), `border-default oklch(0.3400 0 0)` — e **zero**
     neutro com croma > 0 no bloco dark. Não é "a versão subiu": é o valor certo no artefato.
  3. Baixei o tarball do CLI 0.21.0 e confirmei que ele leva `brand-vibrant.css` **e**
     `_claude/rules/ds-themes.md` (124 linhas, não arquivo vazio), com a `vibrant` no
     `BRAND_LABELS` do prompt "Tema de cor?".
- Manuseio do token: `.npmrc` temporário no scratchpad da sessão, fora da árvore do repo,
  apagado após cada publish. Nunca em arquivo versionado, log ou aqui.
- Estado final dos 4 canais de entrega de tema: `npm create` (prompt com as 5 marcas) ·
  `npm install` (subpath `theme/brand-*.css`, desde 0.31.1) · submódulo (importa do disco) ·
  `igreen:add -- theme-<id>` (item de registry, desde 0.32.0). Todos ✅.
- Assumption: o ciclo está fechado pra CONSUMO. Duas coisas seguem fora: (a) troca de marca
  em **runtime** não tem hook exportado — documentada como 4 linhas de `setAttribute`, porque
  o `BRANDS` do `useBrand` é fixo nas 5 marcas e listaria temas que o projeto do consumidor
  não instalou; (b) das 3 ressalvas pré-existentes do pre-commit, a do `ColorsDoc` foi
  resolvida nesta leva e resta `.ai/context/tokens/color.md` não documentar o multi-marca.
- Lições novas: nenhuma L-NNN nova. O padrão que se repetiu a sessão inteira e que já está
  coberto por L-064/L-066 ficou explícito no método: **artefato de distribuição só está
  verificado quando alguém instala e usa** — versão bumpada, arquivo no tarball e `.d.ts` com
  valor literal não provam nada disso.

### [2026-08-03] | DS DEV | vibrant — dark acromático ancorado em #242424 + ColorsDoc brand-aware | CONCLUÍDO

- Input: 2 pedidos. (1) O dark devia ficar "mais cinza mesmo", no estilo da iGreen default,
  com `#242424` como âncora — o mantenedor restaurou a pasta `theme/` com o handoff
  atualizado no meio da tarefa, e ela documenta a escala. (2) Em `#/colors`, as rampas de
  cima não reagiam à marca selecionada: "acaba misturando 2 themes".
- Output 1 — **`grayDark`**: rampa acromática nova nos primitives, croma EXATAMENTE 0,
  valores verbatim do §1.1 do handoff, âncora `#242424` no 800. A marca passa a ser a única
  com rampa neutra por modo: `gray` (light, fria hue 250, **fechada e intocada**) e
  `grayDark` (dark). Uma rampa só não atendia os dois.
  - ⚠️ Segui o aviso do **§4.1** do handoff, que descreve exatamente a armadilha em que eu
    caí na 1ª leva: o `semanticExample.dark` mapeia `bgCanvas → 950`, mas o `--background`
    do DS equivale ao **900** — seguir o exemplo deixa a UI um degrau mais escura que o
    resto do DS, "regressão silenciosa". Agora canvas → 900 (#171717), surface → 800
    (#242424), e o 950 fica **disponível sem consumidor**, como o §4.1 recomenda.
  - 4 valores ficaram FORA da rampa, como literal: `surface-elevated`/`table-head` e as 3
    bordas. É a opção (b) do §4.1 ("valores semânticos fora da escala, zero risco"),
    escolhida porque o que importa neles é a FORÇA (distância de L até a surface) que o
    mantenedor calibrou em 3 rodadas — arredondar pro degrau desfaria a calibração. As
    forças 0.027 / 0.0487 / 0.0797 / 0.1147 foram preservadas exatas sobre a surface nova.
- Output 2 — **`ColorsDoc` brand-aware**: importa as 5 paletas e escolhe pela marca do
  `useBrand`. Antes importava só a `default` estaticamente, então a seção Primitives mostrava
  as rampas dela mesmo com outra marca ativa, enquanto a Semantic (que lê CSS var) trocava —
  daí a sensação de dois temas na tela. Valia pras 4 não-default, não só pra vibrant.
  Ganhou também um aviso no topo dizendo QUAL marca está sendo exibida (sem ele não havia
  como saber se as rampas acompanharam) e a seção `Gray Dark` condicional.
- Verificação:
  - dark 100% acromático: **0 valores com croma > 0.001** entre os neutros do bloco dark
    (todo hex é par repetido — o autoteste que o próprio handoff sugere).
  - **light INTACTO**, provado por hunk do diff: 0 hunks no bloco light, 6 no dark.
  - contrastes: 10/10 pares `on-*`, `fg.muted` 6.08:1 na surface #242424, neon 11.33:1,
    L-008 (0.2050 < 0.2603) e L-009 (força 0.0797) OK.
  - `#/colors` no browser: alternando default↔vibrant a rampa Brand troca de hue 151 → 141,
    o aviso muda, e a seção Gray Dark aparece só na vibrant.
  - suite 13/13, **161 testes**; `release:check` + os 4 gates extras do CI
    (check-foundationals, lint-styles ratchet, showcase-check, api-doc-check) todos exit 0.
- Assumption: `#242424` é a âncora do **shade 800**, e o papel dele é `bg.surface` (o card).
  Vem do handoff (§1.1: "ancorada em #242424 no shade 800") combinado com o §4.1 (canvas →
  900). Se a intenção era ver #242424 no **canvas**, a assumption quebrou e o conserto é
  trocar 2 linhas do `bg` — não a rampa.
- Bug meu, pego na verificação: o `grayDark` não estava no export `colorPalette` porque um
  replace por script falhou em silêncio (o arquivo é CRLF e o padrão tinha `\n`). O `tsc`
  não acusou porque tipei `grayDark` como opcional no `ColorsDoc`. Só apareceu quando fui
  olhar a seção no browser e ela não existia. Auditei os outros 4 replaces do dia: todos
  aplicaram. **Regra**: replace por script em arquivo CRLF precisa de verificação pós-fato,
  não de confiança no exit 0.
- Lições novas: nenhuma L-NNN nova.

### [2026-08-03] | DS DEV | v0.32.0 — trocar tema em projeto existente: registry + rule do consumidor + guia | CONCLUÍDO

- Input: o mantenedor apontou que a capacidade de trocar tema não servia de nada se o
  consumidor não soubesse fazer — e pediu doc própria no showcase, cobrindo npm e submódulo,
  incluindo como ADICIONAR um tema (existente ou novo).
- Diagnóstico (medido antes de escrever): o kit do consumidor tinha **0 arquivos** citando
  tema; `SUBMODULE-SETUP.md` **0** menções; `registry.json` **0** itens de marca. A instrução
  existia só na `DISTRIBUICAO.md` §2.1 — doc de mantenedor. Ou seja a capacidade da v0.31.1
  estava inalcançável na prática, e a IA do projeto do consumidor improvisaria se pedissem.
- Output:
  1. **4 itens `theme-<marca>` no registry**, `registry:file`, forma idêntica ao item `theme`
     que já existia. Fecha o único canal sem mecanismo (copy-in): `igreen:add -- theme-vibrant`.
  2. **Página `ThemesDoc`** no catálogo (Get Started), com os 3 registros do L-042
     (`App.tsx` import + `DOC_PAGES` + render, e `doc-nav-data`). O catálogo de marcas é lido
     do `BRANDS` em vez de escrito à mão — marca nova aparece sozinha e não pode divergir do
     seletor da sidebar, que é a mesma fonte.
  3. **Rule `ds-themes.md`** no kit do consumidor, auto-carregada. É a peça de maior valor:
     é o que a IA do projeto dele lê.
  4. README + SUBMODULE-SETUP + o resumo que o `ds-link` escreve no `CLAUDE.md` do consumidor.
- Decisões:
  - **Item de registry em vez de subcomando de CLI.** O `theme` já era `registry:file`; imitar
     o precedente custou 4 objetos JSON e zero máquina nova. Um `create-design-system theme <id>`
     seria superfície nova pra manter, com o mesmo resultado.
  - **`useBrand` NÃO foi exportado.** Troca em runtime ficou documentada como 4 linhas de
     `setAttribute`. O `BRANDS` do hook é fixo nas 5 marcas e listaria temas que o projeto do
     consumidor não instalou — seletor que mente. Exportar exigiria catálogo injetável, o que
     muda a assinatura de um hook que o showcase usa: risco de regressão no preview num PR que
     deveria ser aditivo. Fica pra quando alguém pedir.
  - Os 2 fatos que causam quase todo erro (CSS sem `data-theme` = inerte; overlay antes do
     tema-base = sem efeito) foram **repetidos em todos os 5 lugares** de propósito. Ambos
     falham em silêncio, e quem lê um só dos documentos não pode ficar sem o aviso.
- Smoke tests (5, todos verdes):
  1. Os 4 JSON do registry carregam o CSS real — 4 blocos `data-theme` cada, seletor
     `:not(.dark)` presente, 6.1–9.7 KB de conteúdo; o `theme` base coexiste.
  2. `ds-link`: rodei o predicado `EXCLUDE` real sobre o payload — 34 de 36 arquivos
     projetados, e `rules/ds-themes.md` está entre eles. (O script recusa rodar com target =
     raiz do DS, então testei a condição que decide, não o wrapper.)
  3. Rota `#/themes` renderiza de verdade no browser: 6457 chars, 8 seções, TOC completo, item
     de nav ativo, 9 blocos de código, 5 swatches lidos do `BRANDS`. É o defeito da L-042 e só
     medição no browser prova que não renderiza em branco.
  4. `release:check` completo: 91 itens com paths existentes, embed em sync (carimbo v0.32.0),
     débito de distribuição zero, examples em sync, 0 vulnerabilidade.
  5. `lib:verify`: 23 entries, 965 arquivos, 452 `.d.ts` fechados no tarball.
  + `tsc` 0 e 159 testes.
- Assumption: o consumidor de copy-in usa `npm run igreen:add -- theme-<id>` e o wrapper
  resolve o item pelo registry autenticado. **Não testei o `igreen:add` de ponta a ponta** —
  exigiria projeto scaffoldado com o `IGREEN_TOKEN`. O que validei é que o item existe, tem
  forma idêntica ao `theme` (que já funciona por esse caminho) e que o JSON servido carrega o
  CSS. Se o `igreen:add` tiver tratamento especial pra `registry:ui` que não vale pra
  `registry:file`, esta assumption quebra — e o sintoma seria o comando falhar só nos temas.
- Lições novas: nenhuma L-NNN nova. Reforça o padrão da L-064/L-066 pela 4ª vez nesta sessão:
  capacidade shipada não é capacidade usável — o que faltava aqui não era código, era a
  instrução no lugar onde o consumidor (e a IA dele) lê.

### [2026-08-03] | NOTA | PR #107 incorporada nesta branch | —

O commit `edb735b` (registro do publish v0.31.1) foi cherry-picked pra cá porque as duas
branches inseriam no mesmo marcador `<!-- NOVA ENTRADA AQUI -->` e conflitariam. A PR #107
pode ser fechada como superseded.

### [2026-08-03] | DS DEV | Publish v0.31.1 — npm passa a entregar os temas de marca | CONCLUÍDO

- Input: PR #106 mergeado. O gap tinha sido descoberto respondendo uma pergunta do
  mantenedor ("é possível acessar o theme via npm ou submódulo?") — a resposta honesta
  exigiu medir o tarball publicado, e a medição mostrou que **não era possível por npm**.
- Output: `@snksergio/design-system@0.31.1` publicado (965 arquivos, 6.4 MB packed).
- O que estava quebrado: até a v0.31.0 o pacote levava só `dist-lib/theme.css` (tema-base,
  0 ocorrência de `data-theme`). Zero `brand-*.css`, e `tokens.mjs` só com valores da
  `default`. Os `.d.ts` das marcas traziam os valores como **tipo literal** (efeito do
  `as const`), o que engana na leitura — mas tipo não é valor, e nada era importável em
  runtime. Valia pras 4 marcas: `blue`/`green`/`pay` nunca chegaram por npm.
- Verificação de ponta a ponta, **instalando do npm real** (não do tarball local): projeto
  limpo + `npm install @snksergio/design-system@0.31.1`, e `import.meta.resolve` resolve os
  **5 subpaths** de tema; os 4 CSS baixados têm **4 blocos `data-theme` cada**. Subpath
  inexistente devolve `ERR_PACKAGE_PATH_NOT_EXPORTED`. `lib:verify`: 23 entries (era 19).
- Decisões:
  1. **Subpaths enumerados um por um, não wildcard `./theme/*`.** O `pack-contract` extrai
     cada path prometido no `exports` e o `lib-verify` confere no disco — wildcard prometeria
     nada e passaria sem verificação, que é o próprio modo de falha da L-017.
  2. **Gate fail-closed no `build:lib`**: o build FALHA se achar `brand-*.css` sem entrada
     em `exports`. O `lib-verify` checa se o prometido existe; este checa o inverso (arquivo
     que vai no pacote mas ninguém consegue importar). Validado **reproduzindo o defeito**
     (L-064) antes de confiar nele.
  3. O plugin descobre os overlays por leitura de diretório, então marca nova não exige
     mexer no build — só no `exports`, que é justamente onde o gate cobra.
- Assumption: o consumidor npm importa o overlay **manualmente** (`@import` + `data-theme`
  no `<html>`). Não há hook nem componente que faça isso por ele — o `useBrand` mora em
  `src/hooks` e não é exportado no barrel da lib. Se alguém esperar troca de marca em
  runtime via npm, esta assumption quebrou e o conserto é exportar o `useBrand`.
- Débito que segue aberto e documentado (DISTRIBUICAO.md §2.1 nova): **registry/copy-in não
  entrega overlay** (0 referências a `brand-*.css`). Vale pras 4 marcas. Exige decidir o
  mecanismo antes — item próprio? parte do `theme`? opt-in? — então é tarefa própria.
- Lições novas: nenhuma L-NNN nova. O padrão que se repetiu 3× nesta sessão e já está
  coberto pela L-064 e pela L-066: **artefato de build/distribuição só está verificado
  quando alguém instala e usa** — `.d.ts` com valor literal, versão bumpada e arquivo
  presente no tarball, nenhum dos três prova que o consumidor consegue consumir.

### [2026-08-03] | DS DEV | Publish v0.31.0 (lib) + v0.20.0 (CLI) no npm | CONCLUÍDO

- Input: PRs #103 (marca) e #104 (release) mergeados na `main` pelo mantenedor, que
  autorizou o publish e forneceu o token na sessão.
- Output publicado no npm:
  - `@snksergio/design-system@0.31.0` — 961 arquivos, 6.4 MB packed / 27.8 MB unpacked
  - `@snksergio/create-design-system@0.20.0` — 70 arquivos, 224.6 kB
  Confirmado por `npm view <pkg> version` nos dois.
- Gate do publish: `lib:verify` rodado **duas vezes** — antes do gate humano (em 0.30.4,
  pra não pedir aprovação de pacote quebrado) e de novo em 0.31.0 depois do merge. 19
  entries cobertos por `files`, 452 `.d.ts` com todas as referências relativas resolvendo
  dentro do tarball (a 5ª camada, que é o modo de falha da L-017).
- Verificação que importa mais que a versão: baixei o tarball publicado do CLI e confirmei
  que ele **contém de fato** `templates/default/src/styles/theme/brand-vibrant.css` e a
  entrada `vibrant` no `BRAND_LABELS` do `create.js`. Bump de versão não é evidência de
  que o artefato chegou — isso é.
- Manuseio do token: `.npmrc` temporário escrito no **scratchpad da sessão, fora da árvore
  do repo**, apagado imediatamente após cada publish (verificado: nenhum `.npmrc` no repo).
  O token não foi escrito em arquivo versionado, nem em log, nem aqui.
- Decisões: os 2 pacotes foram publicados na mesma rodada porque `cli/**` mudou (overlay no
  template + `BRAND_LABELS`), e o CLI é o **único** canal que entrega tema ao usuário.
- Assumption: **o npm NÃO entrega o tema, e isso foi decisão explícita de fechar assim.**
  `@snksergio/design-system` publica só `dist-lib/theme.css` (tema-base, 0 ocorrência de
  `data-theme`); o registry não referencia `brand-*.css`. Vale pras 4 marcas —
  `blue`/`green`/`pay` também nunca chegaram por npm ou copy-in. Se algum consumidor de
  `npm install` (não de `npm create`) pedir tema, esta assumption quebrou: o conserto é
  o `build:lib` copiar os overlays pra `dist-lib/theme/` + entradas em `files`/`exports`.
- Lições novas: nenhuma. A L-066 já entrou no PR #103.

### [2026-08-03] | DS REVIEWER | Marca "vibrant" — pre-commit-check da branch feat/brand-vibrant | APROVADO com 3 ressalvas

- Escopo do diff (branch vs `main`, 9 commits, 20 arquivos): token primitivo 1 ·
  token semântico 2 · transform 1 · CSS gerado 4 (+4 cópias no template do CLI) ·
  pipeline/governance 2 · rule 1 · registro de marca 4 (`package.json`,
  `globals.css`, `useBrand.ts`, `cli/src/create.js`) · CLAUDE.md 1.
  **Zero** componente, zero `src/components/`, zero token da `default`.
- Checklist: CSS regenerado ✓ · light/dark mirror ✓ · L-008 ✓ · L-009 ✓ (0.0797,
  piso 0.06) · `fg.on-*` para todo `bg.*` de marca/status ✓ · variantes
  subtle/muted ✓ · `ring.*` para foco, nunca `border.*` ✓ · sem hex hardcoded em
  componente ✓ · resumo da L-066 no `ds-standards.md` + contador 65→66 ✓ ·
  L-016 (twMergeConfig) N/A — `typography.ts` intocado · CLI rebake N/A —
  `tv.ts`/`utils.ts`/`lucide-types.ts`/`tailwind-theme.css` intocados.
- Corrigido DURANTE o review (achados meus, do próprio trabalho):
  1. **L-066 estava fora da sequência** — appendada com `>>` no fim do arquivo, ou
     seja depois de "Como adicionar nova lição" e "Política de arquivamento". A
     sequência de lições terminava em L-065 e a 066 ficava órfã atrás das seções
     meta. Movida pro lugar (entre L-065 e a seção meta).
  2. **6 dos 9 commits sem entry no audit log** — só os 3 primeiros tinham. Entry
     consolidada da fase de calibração adicionada abaixo.
- Critique genuína — o que examinei além do checklist: **a assumption central do
  gate era "esta marca muda só cor, escopada em `[data-theme]`, sem tocar o resto do
  projeto". Ela QUEBROU no meio do caminho**, e de forma que valeu a pena: o fix do
  vazamento light→dark (L-066) obrigou a mexer no `to-brand-overlay.ts`, que é
  compartilhado pelas 4 marcas. Isso é ampliação de escopo real — mas o alternativo
  era shipar uma marca com 13 tokens resolvendo errado no dark, sobre um bug que já
  afetava `blue` e `green` em produção (`fg-strong` escuro sobre fundo escuro). A
  regeneração das outras 3 marcas mudou **só o seletor**, nenhum valor, verificado
  por diff. Assumption revisada: "muda só cor, mais o transform quando o próprio
  mecanismo de overlay estiver defeituoso".
- Ressalvas — NÃO bloqueiam, são pré-existentes e fora do escopo desta branch:
  1. **[MÉDIO] `ColorsDoc.tsx` mostra os primitivos da `default` sob qualquer marca.**
     `import { colorPalette } from ".../brands/default/primitives/color-palette"` é
     estático; a seção "Primitives" da doc de cor exibe hue 151 mesmo com
     `data-theme="vibrant"` (hue 142). A seção "Semantic" é brand-aware (lê CSS var) e
     está correta. Vale pra `blue`/`green`/`pay` também — doc que mente (classe L-060).
  2. **[MÉDIO] `.ai/context/tokens/color.md` não documenta o sistema multi-marca.**
     O único ponto que cita `brands/` diz "a fonte de verdade é `brands/default/`" — um
     agente que carregue esse contexto não descobre que existem 5 marcas nem como um
     overlay funciona. As 6 superfícies que uma marca nova toca só existem hoje em
     mensagem de commit.
  3. **[INFO] `registry.json` não distribui overlay de marca nenhum** (0 referências a
     `brand-*.css`, medido). Marca chega ao consumidor só pelo template do CLI, então
     consumidor de copy-in/registry não recebe tema — inclusive `blue`/`green`/`pay`.
     Gap arquitetural pré-existente; decisão de distribuição é do `/ds-release` (L-041).
- Regressões L-xxx encontradas: nenhuma nova. Duas CORRIGIDAS no caminho: L-066
  (vazamento, novo) e o `fg-strong` de `blue`/`green` que ela causava.
- Lições novas: L-066 (registrada nas 2 superfícies canônicas).

### [2026-08-03] | DS DEV | Marca "vibrant" — fase de calibração visual (6 commits) | CONCLUÍDO

- Input: 6 rodadas de ajuste do mantenedor olhando o app `?app=finance` nos 2 modos,
  cada uma medida no browser por `getComputedStyle` antes de mexer.
- Output, em ordem:
  1. **Bordas suavizadas ~7%** nos 2 modos (força = distância de L até a surface);
     `border-input` deixado de fora por ser fronteira de campo, não separador.
  2. **Track das abas de visão** de branco 3% → 5%, só no dark.
  3. **Light: um único verde de marca** — `bg.brand` = `fg.brand` = `border.brand` =
     `brand[800]`, `fg.on-brand` volta a branco (6.56:1). Antes o botão neon destoava
     do texto de marca ao lado. Dark segue neon.
  4. **2ª e 3ª rodada de borda** (dark `border.default` 0.1347 → 0.1097 → 0.0797 de
     força). Uma parte do pedido NÃO foi aplicada: "deixar a default na intensidade
     dos inputs" contradizia a medição (input 2.56:1 vs default 1.38:1 — o input já
     era 85% mais forte), então só o enfraquecimento entrou.
  5. **Hierarquia título/subtítulo** — o `semanticExample` do handoff comprimia
     `default↔muted` em 1.34:1 (dark) contra 2.49:1 da iGreen. Revertido pros shades
     do DS: 2.33:1 dark, 3.99:1 light.
  6. **Neutra "graphite"** — sai da Zinc. Croma redistribuído por ÁREA de tela (canvas
     −68%, surface −60%, texto quase intacto) + hue 286 → 250. Escada de L intocada.
  7. **`fg.on-brand` do dark = `black`** (15.32:1) — irradiação sobre o neon faz o
     texto escuro parecer mais fino; peso de fonte não é brand-scoped (marca é eixo de
     cor), então peso aparente se compra na cor. É o que a iGreen default já usa.
  8. **Auditoria das primitivas** — rampa `gray` passa a refletir o uso real: valor com
     2+ consumidores virou degrau (`gray[150]` repurposado, `250` e `850` novos), 1
     consumidor fica literal, `300` marcado HEADROOM. CSS **byte-idêntico** antes/depois.
- Decisões: toda mudança de valor foi medida, não estimada; 2 pedidos do mantenedor
  foram parcialmente recusados com a medição na mão (a intensidade da borda de input e
  o peso de fonte por marca) em vez de aplicados no escuro.
- Assumption: as calibrações refletem julgamento visual do mantenedor em UMA tela
  (`?app=finance`, tabela densa). Se uma tela com composição muito diferente (dashboard
  de cards espaçados, formulário longo) discordar do peso das bordas, o número a mexer é
  a força — dark `border.default` está em 0.0797 e o piso da L-009 é 0.0600, então
  ainda há margem sem quebrar regra.
- Lições novas: nenhuma nova além da L-066.

### [2026-08-03] | DS DEV | Vazamento light→dark no overlay de marca (L-066) + mapeamento de neutros medido da referência | CONCLUÍDO

- Input: o mantenedor mandou um print e a URL da referência: "as neutras estão diferentes, o
  bg deles é #0E0E11 e o nosso está #18181B, e no dark algumas cores quebradas, tudo ficou
  extremamente ruim". Pediu pra medir com o MCP do Chrome DevTools em vez de supor.
- Output: 2 correções independentes — 1 bug arquitetural do transform (afeta as 4 marcas) e
  1 erro de mapeamento meu (só vibrant). Lição **L-066** registrada.
- BUG 1 — **vazamento light→dark no `to-brand-overlay.ts`**: `[data-theme="x"]` e `.dark` têm
  a MESMA especificidade (0,1,0), e o overlay é importado DEPOIS do tema-base → o bloco light
  vencia o `.dark` por ordem de fonte. Todo token que a marca muda no light mas cujo dark é
  idêntico ao da default (logo ausente do diff dark) recebia o valor CLARO no dark. Medido:
  `vibrant` 13 tokens (`bg-subtle`/`bg-muted` = `#fafafa` no dark, `fg-default` `#0e0e11`,
  `border-input` `#d4d4d8`), **`blue` e `green` 1 cada** (`fg-strong` — título escuro sobre
  fundo escuro, **bug vivo em marca já publicada**), `pay` 0 (diverge nos 2 modos em tudo que
  toca). Fix de 1 linha: `[data-theme="x"]:not(.dark)`. Regenerar as 4 mudou SÓ o seletor.
- BUG 2 — **eu troquei a rampa mas mantive as atribuições de shade da default.** O
  `tokens.json` traz `semanticExample.light/dark` com o mapeamento por papel; eu li o "NÃO
  IMPLEMENTAR" como "ignore o mapeamento" quando significava "não crie tokens paralelos com
  esses nomes". Extraí o ground truth do site com DevTools (`getComputedStyle` em todos os
  elementos, contando frequência) e ele confirma o `semanticExample`:
  `html #0e0e11` (zinc-950) · `card ×60 #18181b` (zinc-900) · `texto ×319 #f4f4f5` (zinc-100) ·
  `#d4d4d8 ×49` (300) · `#a1a1aa ×167` (400) · `borda ×30 #3f3f46` (**zinc-700**) · `#27272a ×14`.
  Corrigido dark: canvas 900→**950**, surface custom→**900**, elevated→**800**, table-head→800,
  fg.default→100, fg.muted 400→**300**, fg.subtle→400, border.default→**700**, subtle→800.
  Light idem (`elevated`→50, `muted`→100, `fg.muted` 500→**700**, `fg.subtle`→600,
  `border.default` 200→**300**, `subtle`→200, `input`→400).
- Correção de uma decisão da 2ª leva: eu tinha ESCURECIDO `border.default` do dark pra
  `oklch(0.29)` "pra satisfazer a L-009". Direção errada — a referência deixa a borda bem mais
  CLARA que a surface (zinc-700, ΔL 0.16). Cards ficavam sem contorno visível. Agora ΔL 0.16.
- Verificação: **8/8 tokens estruturais batem exatamente** com o hex medido na referência
  (`getComputedStyle` no browser, dark+vibrant); os 13 que vazavam agora resolvem pros valores
  dark corretos; 10/10 pares `on-*`; 6/6 texto sobre surface (fg.muted subiu de 4.83 pra
  10.44:1 no light); L-008 e L-009 OK com folga; screenshots de `#/table`, `#/colors` e
  `#/alert` nos 2 modos; `tsc` 0, 159 testes.
- Assumption: `data-theme` e a classe `.dark` vivem SEMPRE no mesmo elemento (`<html>`, via
  `useBrand` + `useTheme`). O fix `:not(.dark)` depende disso — se algum dia houver dark
  escopado num wrapper interno com a marca no html, o bloco light volta a se aplicar dentro
  dele. Vale pro seletor antigo também (`.dark[data-theme]` também exige mesmo elemento), então
  não é regressão nova, mas é o ponto a checar se aparecer dark seccionado.
- Lições novas: **L-066** — override escopado gerado como DIFF precisa de seletor mutuamente
  exclusivo com o outro eixo, porque **o diff aposta na omissão** e omissão herda de quem
  vencer o empate de especificidade. Assimetria perversa: quanto mais a marca se parece com a
  default no dark, mais ela vaza. E o meta-ponto (L-064 de novo, mais duro): **nenhum gate
  pegou** — tsc 0, 159 testes, `dead-theme-classes` OK e minha própria checagem de contraste
  10/10, porque eu media os valores dos **arquivos TS** e não o que o **cascade resolvia no
  browser**. Quem achou foi o mantenedor, de olho. Ao mexer em tema: medir no browser com cada
  combinação de eixos ativa.

### [2026-08-03] | DS DEV | Marca "vibrant" — 2ª leva: neutra Zinc + status re-medidos por gamut | CONCLUÍDO

- Input: o mantenedor apontou que (a) a neutra do handoff é diferente da nossa e queria
  usá-la, e (b) os status deviam ficar "no mesmo estilo do verde, respeitando a cor de cada
  um — o roxo mais vibrante mas continuando roxo; o success igual à brand".
- Output: `gray` → Zinc do handoff (+ shade 150 interpolado, que a Zinc não tem e o nosso
  contrato usa); `success` → alias do `brand`; `danger`/`warning`/`info` re-medidos; ~10
  valores acromáticos/minerais cravados retunados pro hue frio ~286. Overlay: **14 → 66 vars
  light / 58 dark**.
- Correção de uma afirmação minha da 1ª leva: eu tinha recusado a neutra citando o §4.1 do
  BRIEF ("muda a temperatura da UI inteira, em todas as brands"). **O argumento não se aplica
  aqui** — o §4.1 assume DS de marca única; nesta arquitetura `gray` é POR MARCA, então a Zinc
  entra escopada no `[data-theme="vibrant"]` e as outras 4 seguem em croma zero (verificado:
  blue/green/pay byte-idênticos após regenerar).
- Decisões:
  1. **A alavanca de "mais vibrante" é LUMINOSIDADE, não saturação.** Medido: a default já
     vive a 84% (danger), 92% (success), 96% (warning) e **100%** (info) do teto de croma do
     próprio hue. Subir croma rende +4% a +20% — e ZERO no roxo. O teto do sRGB depende de
     hue E de L: verde pica em L 0.865, amarelo em 0.825, vermelho em 0.630, roxo em 0.490.
     Consequência que é física e não escolha: **não existe roxo claro e saturado em sRGB**.
  2. **info: hue 280 → 300.** Em 280 o roxo já estava no teto (C 0.210). Deslocando o hue o
     teto sobe pra **C 0.293** — praticamente o 0.294 do brand, mesma energia — e passa a ler
     roxo (#9202fd) em vez do azul-periwinkle #736eff. +39% de croma.
  3. **danger em L 0.58 (C 0.235), não no pico L 0.630 (C 0.255)** — pra preservar texto
     BRANCO: no pico o branco cai a 3.96:1. Em 0.58 dá 4.82:1. De quebra corrige um defeito
     que a default tem: `#ef4444` + branco = **3.76:1**, reprova AA (pré-existente, não
     corrigido aqui — afeta todas as marcas, é outra tarefa).
  4. **success = alias do ramp do brand**, espelhando shade por shade (bg=400, hover=500,
     fg=800, on=950). Precedente: a marca `pay` também usa o próprio verde como success.
     `fg.on-success` teve de sair de white (1.37:1) pra success[950].
  5. **`border.default` do dark = `oklch(0.29 0.0055 286)`, não `gray[800]`.** Com surface em
     0.225 o zinc-800 (L 0.2739) dá ΔL 0.0489 e a **L-009 pede ≥ 0.06** — a borda começa a
     desaparecer. L 0.29 dá 0.065. Nota: a default do DS dá 0.0395 na mesma conta, ou seja
     viola mais; vibrant é a 1ª marca que satisfaz a L-009.
  6. **Rampas geradas com clamp no teto por shade.** A curva de croma da default foi
     preservada em forma e escalada pelo ratio do 500, clampando cada shade no próprio teto —
     por isso vários ficam exatamente no limite. 72 shades verificados, nenhum fora do gamut.
- Verificação (todos contra os valores REAIS dos arquivos, não os planejados): 72 shades
  in-gamut; `success === brand` confirmado por igualdade estrutural; **10/10 pares `on-*`**
  ≥ 4.5:1 nos 2 modos; **6/6** pares de texto sobre surface; L-008 e L-009 OK; round-trip
  OKLCH→sRGB 11/11; contrato de chaves idêntico à default; blue/green/pay byte-idênticos.
  `tsc` 0, 159 testes.
- Assumption: os 4 status seguem sendo consumidos SÓ no shade `[500]` (medido nos 5 arquivos
  semantic × 5 marcas). Se algum componente passar a ler `danger[600]` etc., os 11 shades
  restantes de cada rampa nunca foram olhados no olho — só validados em gamut e forma de
  curva. E: croma no teto do gamut é frágil a mudança de color space — se o DS algum dia
  emitir P3 ou Rec2020, estes valores deixam de ser "o máximo" e as rampas merecem re-medição.
- Lições novas: nenhuma L-NNN nova. Fato de arquitetura que vale registrar: **"deixar mais
  vibrante" não é uma operação de saturação** — em paletas que já vivem perto do teto do sRGB,
  o único grau de liberdade é L (e, se o hue puder mover, o hue). Medir o teto por hue ANTES
  de prometer vibração evita prometer o que o color space não entrega (o roxo rendia 0%).

### [2026-08-03] | DS DEV | Marca "vibrant" (iGreen Vibrant, verde fluorescente #0fff00) — 5ª brand | CONCLUÍDO

- Input: handoff externo em `theme/` (BRIEF.md normativo + tokens.json fonte de verdade +
  THEME.md de procedência + demo visual), gerado de `uicolors.app/generate/0fff00`. Pedido:
  criar a marca "no mesmo estilo das nossas brands, sem alterar o projeto — só a brand".
- Output: `tokens/brands/vibrant/` (palette + color-light + color-dark), overlay
  `brand-vibrant.css` (14 vars light / 14 dark), registro nas 6 superfícies de marca
  (script `tokens:brand:vibrant`, `globals.css`, `useBrand.ts` type+BRANDS+isBrand,
  CSS no template do CLI, `BRAND_LABELS` em `create.js`).
- Decisões:
  1. **Escopo = só a família brand.** `gray` e os 4 status são cópia verbatim da default
     → diff ZERO. Os 14 tokens que divergem são todos brand / table-row-selected / chart-1.
     Recusada a escala neutra do handoff (croma 0.004–0.015 em hue ~286 vs. croma zero
     nossa) — mudaria a temperatura de TODAS as marcas. BRIEF §4.1, confirmado no gate.
  2. **`fg.on-brand` = brand[950] (#003403), não white.** brand[400] tem 1.37:1 contra
     branco. Vale nos dois modos (a default usa `black` no dark; aqui o handoff fixa
     brand-950 como texto de marca em qualquer superfície de marca).
  3. **Estados descem no ramp, não sobem croma.** `bg.brand-hover` = brand[500] em vez de
     `color-mix(brand, black)`: o 400 está no TETO do gamut sRGB (croma 0.32+ clipa pra
     #00ff00), então hover derivado por saturação ficaria idêntico ao default.
  4. **`border.brand` light = brand[700], desvio MEDIDO do §3.3 do handoff.** A regra do
     handoff ("borda = um shade acima do fundo") daria 500 — que reprova nos DOIS papéis
     que o token tem no DS: 1.70:1 contra branco (abaixo do 3:1 de SC 1.4.11) e só 1.24:1
     contra o próprio preenchimento neon. O papel dominante de `border-border-brand` aqui
     não é delinear superfície de marca, é ser a ÚNICA fronteira sobre fundo claro —
     sublinhado da aba ativa (`tabs.tsx`), borda de foco de input/select/combobox/datepicker,
     contorno de badge/chip outline. O 700 é o shade mais claro que passa nos dois
     (4.47:1 e 3.26:1). No dark segue 500 (8.31:1 na surface escura).
  5. **chart-1 only.** chart-2..5 verbatim da default (teal/azul/âmbar/violeta) em vez da
     rampa monocromática que o handoff propõe — 5 tons do mesmo verde não se separam em
     linha/barra. Light ancora no 600 (#04b800, traço fino legível no branco), dark no 400.
  6. **`brandContrast` = alias do próprio `brand`.** Não existe variante mais clara pra
     derivar (teto de gamut). O objeto existe só pra manter o contrato dos primitives
     idêntico ao das outras 4 marcas.
- Verificação: round-trip OKLCH→sRGB **11/11 exatos** (BRIEF §6.1, reimplementado em Node
  com as matrizes OKLab — pega erro de dígito na transcrição dos valores de alta precisão);
  contraste WCAG **7/7 pares passam** (§6.2); contrato de chaves **idêntico à default** nos
  2 modos × 6 namespaces; blue/green/pay/tema-base **byte-idênticos** após regenerar (§6.4).
  `tsc` 0, 159 testes passam (inclui o gate `dead-theme-classes`).
- Assumption: `border-border-brand` no light é usado predominantemente como fronteira
  sobre fundo CLARO (aba ativa, foco de input, contorno de chip), não como delineamento
  de superfície de marca — medido em 20 usos em `src/components/`. Se algum componente
  novo passar a usar `border-border-brand` **sobre** `bg-bg-brand` como detalhe estético
  fino, o 700 vai parecer escuro demais contra o neon e a decisão 4 precisa ser revisitada
  (aí o caminho é separar em 2 tokens, não trocar este).
- Lições novas: nenhuma L-NNN nova, mas 2 fatos de arquitetura ficaram registrados nos
  comentários dos arquivos: (a) `to-brand-overlay.ts` importa a marca com `as`
  (cast, não checagem) — chave faltando ou com typo **herda a default em silêncio**, sem
  erro de tsc; (b) regra de contraste vinda de handoff externo é lida dos componentes DAQUELE
  projeto — precisa ser re-medida contra os NOSSOS papéis de token antes de virar valor.

### [2026-07-29] | ORCHESTRATOR | npm do DS NÃO é depreciado — canal secundário com gate de token + L-017 finalmente mecânica | CONCLUÍDO

- Input: o mantenedor corrigiu uma afirmação minha. Eu disse que o canal npm estava
  morto; ele explicou que **só ele tem o token e o acesso** — cola na sessão, a IA
  publica, ele revoga. É passo manual dele, não canal abandonado. Pediu que a
  distribuição aconteça de forma que, na hora de publicar, ele **não precise verificar
  nada** (registry, etc.).

- Por que eu errei, e onde: **4 fontes do próprio repo** afirmavam depreciação —
  `README.md`, `DISTRIBUICAO.md` ("vestigial/depreciado"), os scripts
  `lib:publish:patch|minor|major` (que ecoavam "⚠ Canal npm DEPRECIADO") e o campo
  `//distribuicao` do `package.json`. Confiei no texto em vez de testar. Testado agora:
  `build:lib` roda em **7,4s** e gera ESM + CJS + types + `theme.css`; `npm pack` dá
  **959 arquivos / 6,4 MB**; todos os entry points resolvem. As 4 fontes foram
  corrigidas. É instância da **L-060** na escala mais custosa: texto errado me fez
  afirmar coisa errada pro mantenedor.

- Decisões do mantenedor (gate):
  1. **Regra 8 mantida** — registro no `registry.json` continua consolidando no
     `/ds-release`, não por-PR. O release já detecta componente fora do registry
     (`distribution-debt` + `registry-add-item.mjs`) e o `release:check` bloqueia, então
     o requisito "não verificar nada na hora de publicar" já está atendido sem afrouxar
     os checks que endurecemos hoje.
  2. **Publish termina pedindo o token** — o fluxo prepara tudo, valida, e PARA. Ele
     cola, a IA publica, ele revoga.

- Output:
  1. **Passo 7 novo no `release.md`** — gate de publish do DS no npm, que **não
     existia** (a skill só tratava o publish do CLI). Valida → apresenta → pede o token
     → publica com `.npmrc` temporário **fora da árvore do repo** → apaga na hora →
     lembra de revogar. Token jamais em arquivo versionado nem no audit log.
  2. **`npm run lib:verify`** (`scripts/lib-verify.mjs` + `lib/pack-contract.mjs` puro,
     19 testes) — automatiza a **L-017**, cuja regra derivada termina com *"Validar via
     `npm pack --dry-run` antes de publish"* e nunca havia sido automatizada: dependia de
     alguém lembrar, e não lembrar custou **4 releases publicadas quebradas em silêncio**
     (v0.1.0→v0.5.0). 5 camadas: contrato puro (entry × `files`), existência em disco,
     diretórios de `files` populados, o que o **npm de fato empacota**, e o fechamento
     dos `.d.ts`.
  3. **`lib:publish:*` viraram guard-rail** — antes bumpavam e publicavam direto
     (burlando o gate); agora saem 1 apontando pro `/ds-release`.

- **Falha minha, pega por teste negativo:** a 1ª versão do `lib-verify` olhava só os
  *entry points* e **passou batido no bug que existe pra pegar** — removi
  `dist-lib/src/**` do `files` (a L-017 exata), o tarball caiu de **959 pra 123**
  arquivos e o check disse "ok". Causa: `dist-lib/index.d.ts` é só
  `export * from './src/components/index'` — toda a superfície de tipos está no
  diretório que saiu, e nenhum *entry* ficou descoberto. Reformulado: o conjunto de
  `.d.ts` do tarball tem que ser **fechado sob imports relativos**. Reprova o cenário
  agora (5 refs quebradas, começando pelo `index.d.ts`). Lição de método: gate novo só
  vale depois de reproduzir o defeito que ele existe pra pegar.

- **Débito descoberto pelo gate, NÃO corrigido (decisão do mantenedor):** o pacote
  atual publicaria com **4 referências de tipo quebradas** —
  `ui/Toast/index.d.ts → './toast'` (o `toast.d.ts` não é emitido, embora `toast-card` e
  `toast.styles` sejam; provável quirk do `vite-plugin-dts` com o `ExternalToast` do
  `sonner`) e 3× `→ '../TableDoc'` do `ClientesShowcase` (o `vite.lib.config.ts`
  **exclui** `src/preview/pages/*Doc.tsx`, mas o ClientesShowcase, que é incluído,
  importa tipos dele — inconsistência de config). Por isso o `lib:verify` **não** entrou
  no `release:check`: bloquearia a v0.30.1 inteira por um defeito que só afeta o canal
  npm. Ele é gate do Passo 7, onde importa. Decidir antes do próximo publish npm:
  corrigir a emissão ou publicar ciente (já está quebrado na 0.19.1).

- Assumption: o requisito "não verificar nada na hora de publicar" é atendido pelo
  `release:check` + `lib:verify` juntos. **Se quebrar:** aparece como algo faltando
  descoberto DEPOIS do publish — o sinal é ele precisar conferir algo à mão.

### [2026-07-29] | ORCHESTRATOR | Registry/distribuição — `next` vulnerável no endpoint público, embed defasado indetectável, `registry-app` fora do CI | CONCLUÍDO

- Input: o mantenedor apontou que registry/distribuição tinham ficado de fora, e a
  memória do projeto tinha o item aberto ("reavaliar o Bearer; **olhar onde o endpoint
  mora**"). Eu havia achado o endpoint na triagem de vulnerabilidades e não voltei nele.
  Autorização explícita pra aplicar fix + melhorias.

- Diagnóstico — a cadeia tem um passo **manual e não verificado** no meio:
  `registry:build` → `public/r/*.json` (gitignored) → **`copy-registry.mjs` (manual)** →
  `registry-app/app/registry-data.ts` (commitado, 6,8 MB) → Vercel → consumidor.

- Output — 1 fix de segurança e 3 melhorias:
  1. **`next` estava genuinamente vulnerável no endpoint público.** O lock do
     `registry-app` pinava **15.5.19** e os 8 advisories (DoS em App Router, SSRF em
     Server Actions e rewrites, cache confusion, disclosure de Server Function) valem
     para `<15.5.21`. Piso subiu pra `^15.5.22` — resolve todos **sem sair do 15.x**.
     `postcss` (8.4.31→8.5.25) e `sharp` (0.34.5→0.35.3) por `overrides`, pois são
     transitivas do next. Audit do `registry-app`: 3 HIGH → **0**. `next build` passa.
     **Armadilha registrada:** `npm audit fix --force` ali instala **`next@9.3.3`** —
     downgrade de 6 majors, num serviço público, e é o que o próprio `npm audit`
     recomenda. O npm agrega os ranges em `9.3.4-canary.0 - 16.3.0-preview.7`.
     Correção de rota minha: durante a triagem eu classifiquei o `next` como falso
     positivo porque o `npm ls` mostrava 15.5.22 em disco — mas o **lock commitado**
     (que é o que importa) dizia 15.5.19. Ler `node_modules` em vez do lock foi o erro.
  2. **`installCommand` da Vercel era `npm install`, não `npm ci`** → o deploy resolvia
     versões diferentes das auditadas; a versão de `next` em produção era indeterminada.
     Corrigido.
  3. **`registry-check` validava o embed por NOME.** Nome não muda entre releases, então
     era verde-permanente com o conteúdo velho: bump pra 0.30.1 → `registry:build`
     carimba o `registry.json` → esquece o `copy-registry.mjs` → consumidor recebe o
     código de 0.30.0 rotulado 0.30.1, todo check verde. Agora compara `meta.stamp`
     (versão + hash git) dos dois artefatos commitados — funciona no CI, que não tem
     `public/r`. Lógica pura em `scripts/lib/embed-staleness.mjs` (12 testes; suíte 91 →
     103). Validado com o cenário real simulado: reprova com a instrução de conserto.
     A checagem por nome **continua** — ela cobre "item sumiu do embed", a nova cobre
     "nomes lá, conteúdo velho". São complementares.
  4. **`registry-app` estava fora do CI** — **nenhum** workflow o tocava, e foi por isso
     que o lock ficou pinando um `next` vulnerável sem ninguém ver. Ganhou install do
     lockfile próprio + typecheck + `next build` (o que a Vercel roda) + audit
     **informativo**. Audit ficou informativo no CI e **bloqueante** no `release:check`
     (novo `registry-app:audit`), mesmo critério do débito de distribuição: o resultado
     depende do banco de advisories, que muda sem ninguém tocar no código — bloquear PR
     por isso reprovaria diff alheio (L-059).
  5. Duas correções de doc que são instâncias da **L-060**: o `release.md` mandava rodar
     `node registry-app/scripts/copy-registry.mjs` da raiz — o script resolve
     `../public/r` pelo cwd, então da raiz aponta pro **pai do repo**, não acha nada e
     **sai 0 em silêncio sem regenerar** (comprovado). Virou `(cd registry-app && …)`. E
     o `prebuild` do `registry-app` dava a impressão de que o embed se regenera no
     deploy: não regenera, porque o `vercel.json` usa `buildCommand: "next build"`, que
     não dispara lifecycle npm. Documentado em `DISTRIBUICAO.md` §3.

- **6. O `copy-registry.mjs` passou a se recusar a escrever embed regredido** — pedido do
  mantenedor pra "fechar o choropleth-map sem quebrar as coisas". Investigado antes de
  mexer: **nada estava quebrado no repo.** O `choropleth-map` está completo no embed
  commitado (5 arquivos, 19.031 bytes, stamp e deps corretos), no `registry.json`, no
  catálogo do CLI. O problema era só o `public/r` **local** (gitignored).
  E era pior do que a medição inicial sugeria: o `public/r` desta máquina era de
  **v0.29.0** (`48354fd · 2026-07-09`), não só faltando 1 item. Regenerar o embed dele
  teria (a) revertido 86 itens pra v0.29.0, (b) **re-injetado os headers `@igreen-stamp`
  que a v0.30.0 removeu de propósito** (todos os 5 arquivos do Button divergiam, os do
  disco maiores exatamente por isso), e (c) dropado o `choropleth-map`. Silenciosamente.
  **Descartado** rodar `registry:build` como "conserto": o `registry:stamp` re-carimbaria
  os 87 itens com hash e data de hoje, produzindo um stamp `v0.30.0` cujo hash **não é** o
  commit da v0.30.0. O fix foi na fonte — o script compara, **antes de escrever**, o
  conjunto de itens e a versão do carimbo contra o `registry.json`; divergência →
  `exit 1` sem tocar no embed. Verificado nos dois caminhos com dados reais: recusou o
  estado v0.29.0 (apontando os 2 problemas) e liberou depois que o `public/r` foi
  reconstruído a partir do próprio embed — e o **round-trip saiu byte-idêntico**, o que
  prova de lambuja que o embed é reproduzível. `public/r` local agora com os 87 itens em
  v0.30.0, sem churn de stamp.
  **Sem teste unitário, por decisão:** o guard é auto-contido em
  `registry-app/scripts/copy-registry.mjs` de propósito — importar de `scripts/lib/` seria
  um import cross-package que quebraria se a Vercel algum dia rodasse o `prebuild` (o root
  dir dela é `registry-app/`). Verificação foi end-to-end nos dois caminhos com o estado
  real, mais forte que fixture sintética; e o `registry-check` (12 testes) é a segunda
  camada, que pega a mesma classe depois do fato.

- Assumption: comparar `meta.stamp` é suficiente pra detectar embed defasado. **Se
  quebrar:** alguém regenera o embed E o `registry.json` juntos a partir de uma fonte
  velha — os dois carimbos batem e o check passa. Mitigação existente: o `stamp` carrega
  o **hash do git**, então fonte velha = hash velho, visível no output do check.

### [2026-07-29] | ORCHESTRATOR | Validação read-only do ChoroplethMap + headers de `lessons.md` normalizados | CONCLUÍDO

- Input: pedido do mantenedor — validar que **nada** do trabalho de hoje quebrou o DS, já
  que há gente consumindo, com foco no `ChoroplethMap`; **sem alterar nada** na validação.
  Mais: fechar o débito de formato dos headers pra encerrar o dia redondo.

- Validação do ChoroplethMap (read-only, 6 eixos, todos ✓):
  1. **Zero toques hoje** — `git diff bbeea4b..HEAD -- src/components/ui/ChoroplethMap/`
     volta vazio. Os 5 arquivos estão íntegros.
  2. **Deps declaradas** — as 4 diretas (`d3-geo` ^3.1.1, `topojson-client` ^3.1.0 +
     os 2 `@types`) no `package.json` **e** no `package-lock.json`. Mais: o `.tsx` importa
     tipos de `geojson` e `topojson-specification`, **ambos também declarados** e
     transitivamente disponíveis. A lacuna da L-058 está fechada de verdade.
  3. **Os 7 `TS2307` locais são `node_modules` defasado, não defeito** — os 4 pacotes
     estão ausentes em disco e presentes no lock; CI (`npm ci`) passa.
  4. **Registry** — item `choropleth-map` presente, `type: registry:ui`, deps corretas,
     `registryDependencies: [@igreen/tooltip, @igreen/tv]`, os 5 `files[].path` existem.
  5. **Catálogo do CLI** — presente. `registry-check` → 87 itens ok, embed com os 87.
  6. **CI verde** nos 4 merges de hoje (#72 a #75).

- Conclusão que importa pro consumidor: **o embed** (`registry-app/app/registry-data.ts`,
  6.8 MB, guarda o **conteúdo** dos arquivos) foi gerado por último no **release v0.30.0**.
  Ele **não** contém o fix do Modal (`100dvh` → 0 ocorrências) nem as 3 substituições de
  classe (`size-9` ainda aparece 3×). Ou seja: **nada de hoje chegou ao consumidor** — o
  payload está congelado em v0.30.0 e só se move no `/ds-release`. É a Regra 8 funcionando,
  e é por isso que o trabalho de hoje não pode ter quebrado ninguém.
- **Limite conhecido do check** (não corrigido, read-only): `registry-check.mjs` valida que
  o embed contém os **nomes** dos 87 itens, não que o **conteúdo** está atual — logo ele diz
  "embed em sync" com o conteúdo arbitrariamente defasado. Mesma classe da "Fase 2b —
  staleness do CSS de tokens", marcada fora de escopo em `pipeline-governance-ci.md` §8.
  Hoje é inofensivo porque a defasagem é intencional entre releases; passa a importar se
  algum dia alguém publicar sem `registry:build`.
- **Mudança de comportamento real no DS hoje: uma, e não foi nossa.** `f7d3838`
  (`iGreenEnergia`) — `Modal`: conteúdo alto estourava a tela sem barra de rolagem. Adiciona
  `max-h-[calc(100dvh-32px)]` no painel e `min-h-0 flex-1 overflow-y-auto` no body. Entra no
  próximo release. Do nosso lado, as 3 substituições são **pixel-idênticas**, verificado no
  CSS gerado: `--spacing-comp-lg: 36px` = `size-9` (2.25rem) e
  `--spacing-layout-navbar: 64px` = `h-16` (4rem).

- Output — débito de formato fechado: os **11** headers de L-033 a L-043 em
  `**[L-NNN] ...**` viraram `## [L-NNN] ...`. Verificado: 63 headers `##`, 0 em negrito,
  nenhum número ausente entre 1 e 63, nenhum duplicado, diff de 11 linhas entrando e 11
  saindo (só os headers), e nada no repo dependia do formato antigo. A instrução "Como
  adicionar nova lição" passou a **declarar o formato exato** e a pedir conferência da
  contagem no título da seção — senão a inconsistência volta.

- Assumption: a defasagem do embed entre releases é intencional e o `/ds-release` sempre
  roda `registry:build`. **Se quebrar:** consumidor recebe componente antigo com número de
  versão novo, e nenhum check acusa (ver limite acima). O sinal seria bug reportado em
  componente "já corrigido".

### [2026-07-29] | ORCHESTRATOR | L-060 a L-063 formalizadas — fecha o follow-up que a task 6 deixou aberto | CONCLUÍDO

- Input: a entrada do conformance-showcase registrou 4 achados como "candidatos genuínos a
  L-NNN, mas formalizar está fora do escopo deste registro (Step restrito a
  `pipeline-state.md`) — considerar follow-up numa sessão que edite `lessons.md`". Somados
  a 2 achados do review final da branch, dão 4 lições depois de agrupar as relacionadas.
  Gate do `CLAUDE.md` ("não consolidar sem confirmação") cumprido — usuário aprovou.

- Output — `.ai/status/lessons.md` + resumo 1-linha em `.claude/rules/ds-standards.md`:
  1. **L-060 — texto que descreve o mecanismo errado é pior que texto nenhum.** A lição de
     maior alcance da sessão, porque o padrão **se repetiu 4×** e nenhuma instância foi pega
     por build/tsc/teste/lint: comentário do `ci.yml` jurando que rascunho não escapava
     (escapava, permanentemente), 7 docs anunciando formatador que nunca rodou (2 delas
     mudando comportamento de agente), mensagem de erro mandando recriar a duplicação que a
     extração acabou de matar, e doc se contradizendo no mesmo arquivo. Texto é o único
     artefato que ninguém executa.
  2. **L-061 — no-op por dependência ausente ≠ desligado, está ARMADO.** Generaliza o caso
     do `format-on-save` (entrada anterior): a dependência que falta pode aparecer.
  3. **L-062 — `--diff-filter=A` é cego a rename; "novo" = não existia no base.** Registra
     as **duas** camadas do fix (`--no-renames` + `cat-file -e` no merge-base), porque cada
     uma sozinha erra pra um lado — e que a cegueira mascarou um teste que eu tinha lido
     como falha do guard de PascalCase.
  4. **L-063 — id derivado por convenção valida a convenção.** O caso `avatar-ig` (1 em 42)
     com a decisão de pular+avisar em vez de criar API de override, e o porquê de
     `::warning` em vez de `console.log`.
  Mais: 3 contagens defasadas corrigidas (`ds-standards.md` dizia "44 Lições",
  `CLAUDE.md` dizia "L-001 a L-016" e "14 lições"; o real é **63**, L-001 a L-063, nenhum
  número faltando — 52 com header `##` + 11 em negrito). Ironia registrada: eram 3
  instâncias de L-060 no arquivo que descreve a L-060.

- Assumption: as 4 lições são generalizáveis, não anedota da sessão. **Se quebrar:** uma
  delas nunca é citada em revisão futura e vira ruído no arquivo auto-carregado — o sinal é
  a lição não aparecer em nenhum PR/review em ~3 meses. A L-060 é a mais exposta a isso
  (é a mais abstrata); as outras 3 têm regra mecânica clara.

- ~~Débito conhecido, não tocado: o formato dos headers em `lessons.md` é **inconsistente**~~
  → **FECHADO na entrada seguinte** (mesma data): os 11 headers de L-033 a L-043 foram
  normalizados de `**[L-NNN] ...**` pra `## [L-NNN] ...`, e a instrução "Como adicionar nova
  lição" passou a declarar o formato exato pra não recorrer.

### [2026-07-29] | ORCHESTRATOR | Prettier descartado por decisão — hook `format-on-save` removido (era no-op armado) | CONCLUÍDO

- Input: a entrada anterior registrou como pendência que `prettier` não está no
  `package.json`, logo `format-on-save.sh` (que chamava `npx --no-install prettier`)
  era **no-op** nesta máquina e em qualquer clone novo — um dos 4 hooks que o
  `CLAUDE.md` anunciava como ativos. Levado ao mantenedor como decisão.

- Decisão do mantenedor: **não adotar prettier.** Motivo dele: o ganho não é real
  quando é IA que digita o código, e formatação automática no save pode mexer no que
  foi escrito de propósito. Não vale o detalhe.

- Output — a decisão foi *aplicada*, não só documentada:
  1. **Hook desarmado.** Entrada removida de `.claude/settings.json` (PostToolUse
     `Edit|Write` agora tem 3: `ds-lint-styles`, `ds-inventory-check`, `ds-tokens-check`)
     e `.claude/hooks/format-on-save.sh` deletado. **Por que remover em vez de deixar
     inerte:** o hook não estava desligado, estava **armado e sem munição** — bastava
     alguém rodar `npx prettier` uma vez pra popular o cache do npx e ele passava a
     reformatar todo arquivo editado, sem ninguém ter pedido. Isso aconteceu de verdade
     na onda de correção do review final: um `npx prettier` de validação de YAML ligou
     o hook, que reformatou `impl-igreen.md` inteiro no Edit seguinte e mutilou
     pseudo-código (revertido na hora). Deixar armado contradiz a razão da decisão.
  2. **7 docs corrigidas** — anunciavam um hook que não roda: tabelas de hooks do
     `CLAUDE.md` e `.claude/rules/ds-standards.md`, árvore em `.ai/context/architecture.md`,
     listas em `README.md` e `DISTRIBUICAO.md`. As duas que mais importam mudavam
     comportamento de agente: `.claude/commands/ds-update.md` e
     `.claude/skills/ds-dev/update-changelog.md` diziam "o hook formata automaticamente"
     → agora dizem pra formatar na mão espelhando o código vizinho.
  3. **Anti-reintrodução.** `CLAUDE.md` e `ds-standards.md` ganharam nota ⛔ dizendo que
     a ausência de formatador é deliberada, com o motivo — pra ninguém "consertar" isso
     numa sessão futura achando que é lacuna.
  Referências históricas preservadas (L-019): `lessons.md` L-044 e a pendência da
  entrada anterior continuam citando o hook — são registro de quando existia.

- Assumption: formatação manual espelhando o vizinho é suficiente pra manter os
  arquivos legíveis sem formatador. **Se quebrar:** aparece como diff ruidoso em PR
  (indentação inconsistente no mesmo arquivo). O caminho de volta é `npm i -D prettier`
  + `.prettierrc` + rodar uma vez no repo inteiro numa rodada própria — nunca no meio
  de outra tarefa, porque a primeira passada reformata tudo.

### [2026-07-29] | ORCHESTRATOR | Conformance showcase — gate cobre `.tsx` + check bloqueante de registro de showcase + exceções unificadas | CONCLUÍDO

- Input: continuação de `.ai/specs/pipeline-conformance-showcase.md` (2ª rodada de
  governança, depois de `pipeline-governance-ci.md` ter fechado proteção da `main` +
  gate determinístico de token). Branch `feat/conformance-showcase`, **16 commits**
  (10 da implementação + 6 da onda de correção do review final de branch),
  executada via SDD (5 tasks de implementação, cada uma com review em par — ver
  `.superpowers/sdd/2026-07-29-conformance-showcase/progress.md`).

- Output:
  1. **Furo fechado — o lint de estilos era cego a `.tsx`.** `scripts/lint-styles.mjs`
     tinha `GLOB` só pra `src/components/**/*styles.ts`; Tailwind literal escrito
     direto no `.tsx` do componente passava limpo por todos os checks. Medido com o
     módulo real (`scanLines` de `ds-lint-patterns.mjs`, não grep aproximado — o grep
     tinha dado número errado antes de trocar pro módulo): **3 violações genuínas**
     em `src/components/ui/**/*.tsx`, todas em `AppShell/user-menu.tsx` (linhas 92,
     102, 123 — `w-9 h-9 rounded-full` / `<Avatar className="size-9">` / `size-9
     shrink-0`), corrigidas nesta branch pra `size-comp-lg` (36px→36px, zero mudança
     visual). Eram a **3ª, 4ª e 5ª instância** do mesmo container quadrado de 36px já
     corrigido 2× no mesmo dia em `MenuSidebar` e `SingleMenuSidebar` — prova de que
     o furo deixava passar violação real e **repetida**, não hipotética.
     `src/components/shadcn/*.tsx` tinha **27 hits em 10 arquivos**, congelados pelo
     ratchet (débito pré-existente; só linha nova reprova daqui pra frente). Reverifiquei
     nesta sessão: `node scripts/lint-styles.mjs --ratchet origin/main` →
     "1 arquivo(s), 3 linha(s) adicionada(s), 0 violação nova" — exit 0, números batem
     com a spec.
  2. **Check de showcase bloqueante** (`scripts/lib/showcase-registration.mjs` +
     `scripts/showcase-check.mjs`, fiado no `ci.yml`). Cobre exatamente a superfície 4
     da L-042 pra pasta de componente **nova**: `<Nome>Doc.tsx` existe, id kebab
     roteado em `src/App.tsx` (checa as **duas** ocorrências separadamente —
     `DOC_PAGES` e a cascata de render `activePage === "<id>"`; um grep genérico
     passaria com só metade registrada e a rota abriria em branco) e entrada em
     `doc-nav-data.ts`. **Detecta pelo diff**, não por sweep total — assim não
     precisa semear lista de exceção com o passivo atual, só pega o que a PR cria.
     (O critério de "pasta nova" foi refinado na onda de correção abaixo: `A` por
     arquivo → pasta ausente no base ref.) Não reprova PR em rascunho
     (`pull_request.draft`, com `ready_for_review` no `types:` — ver onda de
     correção). Reverifiquei nesta sessão:
     `node scripts/showcase-check.mjs origin/main` → "nenhum componente novo nesta
     PR" — exit 0.
  3. **Lista de exceção unificada** (`scripts/lib/ds-exceptions.mjs`, **8
     componentes** com motivo obrigatório: `tabela-teste`, `table-toolbar` + os 6
     internos do `example-chat`). Antes, só `distribution-debt.mjs` tinha essa lista
     (`IGNORE`, mesmas 8 entradas) e `ds-inventory-check.sh` não tinha lista nenhuma —
     já divergiam sobre o que era exceção deliberada, o mesmo defeito que a fonte
     única de patterns (`ds-lint-patterns.mjs`) já tinha resolvido pro lint. Agora
     `distribution-debt.mjs`, `showcase-check.mjs` **e o hook** consomem a mesma
     fonte — os três, como a spec §4 exigia (o hook entrou na onda de correção).
  4. **Prevenção alinhada com a detecção** — `impl-igreen.md`, `impl-composite.md`,
     `impl-shadcn.md`, `.github/pull_request_template.md` e `CONTRIBUTING.md`
     passaram a citar os **mesmos 3 itens** (Doc page, as edições em `App.tsx`,
     entrada em `doc-nav-data.ts`) com os mesmos caminhos — quem cria componente
     pelo fluxo de implementação nunca vê o check disparar. (Eram "2 edições" no
     `App.tsx`; a onda de correção acertou pra **3**, incluindo o `import`.)
     `review-component.md` ganhou o checklist arquitetural (view burra / organização
     de tipos / hooks extraídos / `ComponentsOverview`) como **julgamento do
     revisor**, não regra mecânica.

- Achados que os reviews de par pegaram (o valor da sessão, além do código em si):
  1. A mensagem de erro do `distribution-debt.mjs` **mentia** depois da extração da
     lista: mandava "inclua no `IGNORE` deste script", lista que já tinha saído do
     arquivo. Quem seguisse ao pé da letra teria **recriado** a duplicação que a
     extração veio eliminar. Corrigido no mesmo round de fix da Task 1.
  2. `toKebab` assume pasta em PascalCase, e `avatar-ig` é a **única** pasta fora
     desse padrão em 42 — o id real dela é `avatar`, não `avatar-ig`. Documentado
     explicitamente no docstring (nomeando o caso) + fixado por teste; o check
     **pula e avisa** em pasta fora do padrão, errando pro lado seguro (deixa
     passar, não reprova errado).
  3. O check era **cego a rename de pasta**: `--diff-filter=A` exclui linhas `R`.
     Reproduzido contra o commit real `54eee58` (`Avatar` → `avatar-ig`): com
     `--diff-filter=A` o diff vinha **vazio** (o diff real mostra `R100` em 5
     arquivos). Uma PR que renomeasse pasta de componente sem re-registrar a rota
     reportaria "nenhum componente novo" e **passaria** — silent-pass exato que o
     gate existe pra impedir (L-042), por rename em vez de mkdir, numa operação que
     este repo faz de rotina (`Avatar`→`avatar-ig`, `TableToolbarV2`→
     `TableToolbarDeprecated`). Fix: `--no-renames`.
  4. `review-component.md` se contradizia: um checkbox exigia `.types.ts` sem
     qualificação, e ~40 linhas abaixo o texto dizia pra não exigir sempre (7 de 42
     componentes têm tipos inline, legítimo). Reconciliado — checkbox virou
     condicional com cross-ref pra seção que explica a exceção.

- Decisões:
  - **`ComponentsOverviewDoc` ficou fora do bloqueio, de propósito.** Não consta na
    L-042 como superfície obrigatória (a lição lista só Doc page + `App.tsx` +
    `doc-nav-data`) e o arquivo tem **~13 lacunas pré-existentes** (`DatePicker` e
    `EmptyState` entre elas, ambos distribuídos e com Doc page própria). Exigi-lo
    seria inventar requisito além do padrão documentado e reprovaria débito antigo
    que não é desta sessão. Fica **advisory** no checklist do revisor.
  - **Changelog por-PR ficou fora** — contraria a Regra 8 do `CLAUDE.md`: changelog
    consolida no `/ds-release`, não por componente.
  - **Distribuição (registry/catálogo/npm) ficou fora** — já coberta pelo
    `distribution-debt.mjs` em toda PR, decisão testada e validada nesta mesma data.
  - **Análise de AST pra "view burra" ficou fora** — a variação legítima medida
    (7 de 42 componentes com tipos inline; `hooks/` em só 6 de 42) garantiria
    falso-positivo em escala maior que os alarmes que o grep aproximado já tinha
    gerado antes de trocar pro módulo real.
  - **Skill prescreve default forte, revisor aplica julgamento** — por isso
    `impl-igreen.md`/`impl-composite.md`/`impl-shadcn.md` seguem listando a
    estrutura de 5 arquivos (agora rotulada "Estrutura padrão (componente novo)", não
    mais "obrigatória"), enquanto `review-component.md` aceita o desvio legítimo sem
    reprovar.

- Assumption: detectar componente novo por pasta adicionada no diff é confiável;
  quebra se o componente e a Doc page vierem em PRs separadas — a primeira reprova,
  e isso é o comportamento desejado, não bug.

- Onda de correção do review final de branch (mesma data, 6 commits) — 5
  importantes + 9 minors, cada um verificado empiricamente antes da correção:
  1. **O guard de rascunho era bypass permanente, não adiamento.**
     `ready_for_review` não está no conjunto default de atividades do
     `pull_request` (`opened`/`synchronize`/`reopened`): PR aberta como rascunho
     rodava com o step de showcase pulado, passava, e clicar "Ready for review"
     **não** disparava run nova — a run verde do rascunho satisfazia o required
     status check `check` (`strict: false`) e o merge saía sem o showcase nunca ter
     sido avaliado (step pulado dentro de job que passou não deixa sinal na UI).
     Fix: `types: [opened, synchronize, reopened, ready_for_review]` + os 3
     comentários que afirmavam o contrário reescritos (ci.yml, showcase-check.mjs,
     spec §4).
  2. **"Componente novo" virou "pasta que não existia no base ref".** O `A` do
     `--name-status` é por arquivo: `Chart` e `Icon` reprovavam com instrução
     errada ao receber **um** arquivo (2 de 42, medidos; e a escapatória que a
     mensagem sugeria — declarar em `ds-exceptions.mjs` — seria afirmação falsa e
     tiraria `Chart` do `distribution-debt.mjs`, que compartilha o `Map`). Lógica
     em módulo puro novo (`scripts/lib/new-component-folders.mjs`) com o predicado
     `existsAtBase` **injetado** (git fica no CLI; `scripts/lib/` segue zero I/O),
     resolvido contra o merge-base. O ganho do `--no-renames` é preservado (pasta
     renomeada não existe sob o nome novo) — verificado end-to-end com
     `Spinner`→`SpinnerRenamed`. 12 testes novos.
  3. **O hook virou o TERCEIRO consumidor** (`isException` + `checkRegistration`,
     uma invocação `node -e`), fechando a divergência que a branch citava como
     justificativa: o `TabelaTeste` hardcoded (1 de 8 exceções) e o
     `grep -q "\"$KEBAB\"" App.tsx` que aprovava id presente só no `DOC_PAGES` —
     caso em que a rota abre em branco e o CI reprova. Fail-open preservado
     (`exit 0` sempre; probe caído → eixo pulado + `PROBE FAIL` no hook-log).
  4. **`impl-shadcn.md` prometia rede de segurança inexistente** ("o CI reprova"):
     o check detecta *pasta* em `src/components/ui`, e primitivo shadcn é arquivo
     único — agora está escrito que ali é disciplina, não máquina.
  5. **"duas edições" no `App.tsx` era três** — falta o `import` da Doc page (a
     L-042 lista import + render + `DOC_PAGES`). Corrigido nos 5 documentos com o
     mesmo texto; a assimetria (3 edições na doc, 4 checks no módulo, e o import
     fica pro `tsc` porque o gate mecânico só cobre falha **silenciosa**) está
     registrada no docstring de `showcase-registration.mjs`.
  - Minors: `::warning` no skip de pasta não-PascalCase (era invisível na UI);
    `if: !cancelled()` nos 3 steps de conformidade (lint saindo 1 escondia o
    showcase → 2 idas-e-voltas); comentário JSX `{/* */}` deixa de reprovar o
    ratchet; política de re-sync upstream do shadcn escrita no `GLOB`; 4 contagens
    erradas (8 exceções, 27 hits no shadcn, 4+1 arquivos no review-component,
    consumidor real do `ds-exceptions`).

- Pendências conhecidas (nenhuma bloqueante):
  - O check de showcase **nunca reprovou uma PR de verdade** — foi provado em probe
    (commit real numa branch descartável: arquivo em pasta existente → exit 0,
    pasta nova → exit 1, rename de pasta → exit 1) e contra commits históricos
    (ex.: `54eee58`, `31ddfcd~1`).
  - Falso-negativo por convenção de nome segue aceito: `Chart` (documentado em 8
    páginas `chart-*`) e `Icon` (rota `icon` → `IconLibraryDoc.tsx`) só passariam
    se fossem criados hoje — o critério de "pasta nova" os tira do caminho, mas
    quem fugir do padrão `<Nome>Doc.tsx` passa batido. Erra pro lado seguro.
  - `node_modules` local do mantenedor segue desatualizado — 7 falsos `TS2307` em
    `src/components/ui/ChoroplethMap/` ao rodar `tsc` local (deps declaradas no
    `package.json`/lock, ausentes em disco); CI (`npm ci`) não é afetado.
  - `prettier` não está no `package.json` nem em `node_modules`, então
    `format-on-save.sh` (que usa `npx --no-install prettier`) é **no-op** nesta
    máquina. Não é desta onda, mas explica por que arquivos editados pelo pipeline
    não saem formatados.

- Lições novas: nenhuma registrada nesta entrada. Os 4 achados acima (mensagem
  obsoleta pós-extração, premissa PascalCase de `toKebab`, cegueira a rename via
  `--diff-filter=A`, contradição interna de doc) são candidatos genuínos a L-NNN,
  mas formalizar em `.ai/status/lessons.md` está fora do escopo deste registro
  (Step restrito a `pipeline-state.md`) — considerar follow-up numa sessão que edite
  `lessons.md`.

### [2026-07-29] | ORCHESTRATOR | Governança fechada — proteção da `main`, 2º aprovador, CONTRIBUTING, visibilidade do gate | CONCLUÍDO

- Input: com o gate de estilos já mergeado (PR #66), faltavam as camadas que fazem
  ele **valer** e as que fazem um contribuidor **descobrir** o fluxo. Também
  faltava registrar as decisões de configuração do GitHub, que não vivem em
  arquivo nenhum do repo.

- Output — **PRs #67, #68 e a do 2º aprovador**, todas mergeadas:
  1. `#67` — anotações do GitHub Actions (`::error file=,line=::`) no
     `lint-styles.mjs` e no `distribution-debt.mjs`: a violação passa a aparecer
     marcada **na linha do diff**, na aba *Files changed*, em vez de só num log de
     step (que o GitHub entrega colapsado). Mais `.github/pull_request_template.md`
     — checklist que aparece preenchido ao abrir PR, organizado por caso, cada item
     citando a lição que o justifica. Fecha 2 minors do review final: o step
     "informativo" que não informava ninguém, e o `catch` que engolia `err.message`
     e culpava `fetch-depth` por qualquer falha do git.
  2. `#68` — `CONTRIBUTING.md`. Era o furo central da estratégia "trabalhar dentro
     do fluxo": o fluxo existia e funcionava, mas dependia de alguém contar pro dev
     novo que existia (o roteiro estava só no `INICIO-DE-SESSAO.md`, bloco pra colar
     manualmente, escrito pra operador não-programador). `CONTRIBUTING.md` é o
     arquivo que o **GitHub oferece sozinho** na tela de abrir PR. Junto: corrigido
     o `INICIO-DE-SESSAO.md` (dizia que push/release "é com o Leandro" —
     desatualizado) e o `README` (mandava quem quer desenvolver direto pro
     `CLAUDE.md`, que é arquivo de regras pra IA, não onboarding humano).
  3. `@jlnetto` adicionado ao `CODEOWNERS` nas 5 áreas.

- Output — **configuração do GitHub** (não vive em arquivo; registrada aqui por
  isso). Estado anterior: `main` protegida pelo @jlnetto, mas com 3 problemas.
  Aplicado via API após decisão do mantenedor, com backup da config anterior:
  | Setting (API / UI) | Antes | Depois | Por quê |
  |---|---|---|---|
  | `lock_branch` / *"Lock branch"* | ligado | **desligado** | ligado, o branch fica **read-only e nenhuma PR mergeia**. Foi marcado entendendo que significava "impedir push direto" — mas isso já é garantido por *Require a pull request*. Era a causa real do bloqueio de merge |
  | `enforce_admins` / *"Do not allow bypassing the above settings"* | ligado | **desligado** | com 1 aprovador só, e o GitHub nunca permitindo auto-aprovação, o mantenedor travava a si mesmo em toda PR própria. Desligado = válvula de escape de admin sem precisar derrubar a proteção inteira |
  | `required_status_checks.contexts` | `[]` | **`["check"]`** | a caixinha *"Require status checks"* estava marcada mas a **lista estava vazia** — são dois passos na UI e é fácil parar no primeiro. Sem isso o gate rodava e podia ser ignorado |
  Preservados: PR obrigatória, 1 aprovação, *Require review from Code Owners*,
  `strict: false` (não exigir branch atualizada — evitaria reesperar CI a cada
  mudança na `main`), force-push e deleção de branch bloqueados.

- Decisões:
  - **Camada 3 (revisão por IA em cada PR) NÃO foi construída — decisão medida, não
    esquecimento.** Hoje o mantenedor é autor de praticamente toda PR, e nessas o
    revisor já roda em sessão, coberto pela assinatura, sem custo por PR. Ligar a
    Camada 3 agora seria pagar por PR pra re-revisar trabalho já revisado — e o
    volume alto de PRs piora a conta, não melhora. **Gatilho pra revisitar: 2-3 PRs
    por mês abertas por outra pessoa.** Aí a revisão gratuita em sessão deixa de
    cobrir a população.
  - Antes da Camada 3, o caminho mais barato é o dev novo **trabalhar dentro do
    fluxo** (Claude Code no repo, que carrega `CLAUDE.md` sozinho) — custo marginal
    zero e resultado melhor que uma Action isolada. É o que o `CONTRIBUTING.md`
    ensina.
  - `@jlnetto` no CODEOWNERS **mesmo já sendo admin**: aprovar é melhor que
    bypassar. Aprovação mantém o check obrigatório valendo; bypass pula o CI junto.
    Antes, na ausência do mantenedor, a única saída era a que desliga o gate.
  - Anotações emitidas **só** quando `GITHUB_ACTIONS=true` — localmente o hook segue
    com a saída humana de sempre.

- Assumption: **`enforce_admins` desligado é aceitável porque os 9 admins são de
  confiança e o CODEOWNERS + check obrigatório cobrem o caso normal.** Se um dia
  houver merge indevido via bypass, esta é a decisão a revisar — e a correção é
  ligar `enforce_admins` **e** garantir ≥2 aprovadores ativos antes, senão o
  mantenedor volta a travar a si mesmo. As duas coisas andam juntas.

- Pendências conhecidas (nenhuma bloqueante):
  - O gate **nunca reprovou uma PR de verdade** — todas passaram verdes porque
    nenhuma tocou `*.styles.ts` com violação. O primeiro teste real ainda vem.
  - `node_modules` local do mantenedor está stale (deps do ChoroplethMap declaradas
    no `package.json` e no lock, ausentes no disco) → `tsc` local dá 7 falsos
    `TS2307`. CI não é afetado (`npm ci`). Resolve com `npm install`.
  - A org permite membro deletar/transferir repo (`members_can_delete_repositories:
    true`) — agora relevante porque o mantenedor virou admin. Mitigável em
    Organization settings → Member privileges, por um dono da org.
  - PR #11 segue aberta com "NÃO MERGEAR" no título.

- Lições novas: nenhuma nova. **L-059** (registrada nesta mesma data) cobre o
  achado técnico central; as decisões de configuração acima são específicas deste
  repo, não lição generalizável.

### [2026-07-29] | ORCHESTRATOR | Fix wave pós Task 6 — corrige claim "nenhum código tocado" + registra 2 swaps de token e USAGE.md do DatePicker | CONCLUÍDO

- Input: revisão de branch completa (`feat/gate-deterministico-estilos`, review final antes do
  merge) apontou que a entrada "Task 6" logo abaixo (mesma data) afirma "Nenhum
  código/script/workflow foi tocado nesta sessão — só as 4 superfícies de doc". Mas 3 commits
  landaram na branch DEPOIS dela: `c5db76e`, `19e5205`, `7372a04`. O checklist de encerramento
  do `CLAUDE.md` exige registrar criação/modificação de token ou componente; a entrada Task 6
  não cobria esses 3 commits porque foram feitos depois dela ter sido escrita.
- Output: este registro nomeia o que ficou de fora da entrada Task 6:
  1. `c5db76e` — os 2 únicos hits reais do baseline medido em §1.1 da spec, corrigidos:
     `w-9 h-9` → `size-comp-lg` em `src/components/ui/MenuSidebar` (sidebar.styles.ts:158) e
     `h-16` → `h-layout-navbar` em `src/components/ui/SingleMenuSidebar`
     (single-menu-sidebar.styles.ts:98). Mesmo valor em px nos dois casos — zero mudança
     visual, só troca de literal Tailwind por token DS.
  2. `19e5205` + `7372a04` — `src/components/ui/DatePicker/USAGE.md` criado (componente já
     distribuído no registry, mas sem o atalho de doc — gap genuíno encontrado na medição do
     `ds-inventory-check.sh`, §1.1 da spec) + fix de shape do `DateRange` no exemplo do arquivo.
- Decisões: a entrada Task 6 original permanece como está — log é append-only, não se reescreve
  texto já registrado; este registro novo corrige a lacuna em vez de editar o histórico.
- Assumption: os 2 swaps de token são correção pura de literal→token (mesmo valor numérico nos
  dois casos), não mudança de design — não exigem gate de token novo (Regra 4 não se aplica a
  edição de existente).
- Lições novas: nenhuma (a lição do achado em si é L-059, já registrada abaixo).

### [2026-07-29] | ORCHESTRATOR | Task 6 — fecha as superfícies de documentação do gate de lint (hooks, L-059, audit) | CONCLUÍDO

- Input: branch `feat/gate-deterministico-estilos` já tinha 5 tasks implementadas e revisadas
  (commits `b1a00fb` tabela única de anti-patterns `scripts/lib/ds-lint-patterns.mjs`,
  `c95f646` parser de diff `scripts/lib/diff-added-lines.mjs`, `e28e32e` CLI
  `scripts/lint-styles.mjs` com modo `--file` (hook local, sempre exit 0) e `--ratchet`
  (CI, só falha em linha **nova**), `f76a4f3` fix de exit code do `--file`, `2cb2261`
  `.claude/hooks/ds-lint-styles.sh` reescrito pra delegar ao módulo node, `0acb81c`
  `.github/workflows/ci.yml` + `package.json` ligando o ratchet como step bloqueante e
  `distribution-debt.mjs` informativo em PR / bloqueante em `release:check`). Essa mudança
  de detecção tornou falsas 2 afirmações na doc: as tabelas de hooks em `CLAUDE.md`
  (~linha 110) e `.claude/rules/ds-standards.md` (~linha 61) diziam que o
  `ds-lint-styles.sh` grepa "L-001 a L-007" — L-004 e L-007 saíram do conjunto (ver
  `.ai/specs/pipeline-governance-ci.md` §1.1, medição de 2026-07-29).
- Output:
  1. `CLAUDE.md` — linha da tabela de hooks corrigida: lista agora L-001/L-002/L-003/L-005
     + import de tv, menciona `scripts/lib/ds-lint-patterns.mjs` como fonte única
     compartilhada com o CI, e que o ratchet de CI só reprova violação **nova**.
  2. `.claude/rules/ds-standards.md` — mesma correção na tabela de hooks + resumo de
     **L-059** adicionado na seção "Lições — resumo" (mini-bloco `###`, no formato que o
     arquivo já usa pras últimas 4 lições — L-055 a L-058 — em vez do bullet de 1 linha
     usado por L-001..L-043).
  3. `.ai/status/lessons.md` — nova lição **L-059**: classificação determinístico vs
     semântico de quando uma regra pode virar gate mecânico. Registra os números medidos
     (51 hits do grep antigo contra os 40 `*.styles.ts` do repo, 50 ruído / 1 real: 33 de
     `p-0`/`gap-0` sem token DS pra zero, 9 de `rounded-full` numericamente idêntico ao
     token DS, 8 de `outline-none` com foco visível via `focus-within` no wrapper — outro
     bloco `tv()`) e o corolário do ratchet (14 dos 40 arquivos já carregavam débito legado
     — um gate whole-file teria reprovado qualquer PR que só tocasse esses arquivos).
  4. Esta entrada de audit log.
- Decisões: L-004 e L-007 permanecem registradas como lições válidas — não foram apagadas
  nem renumeradas, só tiradas do conjunto que o grep/CI cobre (continuam sendo trabalho de
  revisão semântica). Nenhum código/script/workflow foi tocado nesta sessão — só as 4
  superfícies de doc listadas acima.
- Nota (estado real do gate): os commits desta branch ligam o ratchet como step do
  `ci.yml` e tornam `distribution-debt.mjs` bloqueante em `release:check`, mas a **Camada
  1** (branch protection / required status checks em `main`) continua sendo **ação manual
  do mantenedor** (Leandro) — sem ela, um push direto em `main` ainda ignora esses checks
  por completo. Os checks existem e rodam, mas ainda não bloqueiam merge de fato.
- Assumption: o ratchet por linha adicionada é suficiente — débito legado congelado não
  volta a crescer por outro caminho (arquivo novo inteiro conta como adicionado, então
  componente novo nasce limpo).
- Lições novas: L-059 — gate mecânico só pra regra errada independente de contexto
  (detalhe completo em `.ai/status/lessons.md`).

### [2026-07-29] | INFRA RELEASE | Publish pendente do CLI — @snksergio/create-design-system 0.18.1 | CONCLUÍDO

- Input: sessão de auditoria de distribuição. Rodei os 3 checks automatizados (`node scripts/registry-check.mjs`, `node scripts/check-foundationals.mjs`, `node scripts/distribution-debt.mjs`) — todos ✓ (87 itens no registry, embed em sync, 4 foundationals sincronizados, 34 componentes sem débito). Comparei `npm view @snksergio/create-design-system version` (0.18.0) vs `cli/package.json` local (0.18.1) — gap encontrado: a release v0.30.0 (commit `96dd7d8`) já tinha bumpado o `cli/package.json`, mas o `npm publish` manual (que o skill `release.md` exige, normalmente com OTP) nunca rodou.
- Output: `npm pack --dry-run` conferido (68 arquivos, 219.8kB, sem surpresa) → `@snksergio/create-design-system@0.18.1` publicado no npm. Verificado pós-publish via `npm view` (retornou `0.18.1`). Diff real entre 0.18.0 e 0.18.1 era só bump de versão + fix de encoding na `description` (`—` em vez de em-dash literal) — nenhuma mudança funcional no CLI.
- Decisões: usuário forneceu um npm token (granular access token) diretamente no chat e autorizou "pode publicar". Token usado **só** como `.npmrc` temporário no diretório de scratchpad da sessão (fora do repo), passado via `npm publish --userconfig <path>`, e apagado (`rm`) imediatamente após o publish — nunca escrito em arquivo versionado, nunca ecoado em output, nunca persistido em memória.
- Assumption: autorização do operador da sessão (Sergio, git user local) é suficiente para este publish específico, apesar da Regra 7 do `CLAUDE.md` nomear Leandro como aprovador padrão de release/publish. Sinalizei isso explicitamente antes de agir (perguntei via AskUserQuestion, o usuário preferiu responder direto "pode publicar" em vez de escolher entre as opções apresentadas). Se isso for inaceitável — i.e., se Sergio não tiver autoridade delegada para decidir publish sozinho — revisar quem de fato pode autorizar essa ação nesta sessão, e considerar ajustar a Regra 7 ou documentar a delegação.
- Lições novas: nenhuma.

### [2026-07-29] | ORCHESTRATOR (retroativo) | Consolidação de releases v0.11.0 → v0.30.0 (2026-06-19 a 2026-07-28) | CONCLUÍDO

- Input: gap de auditoria identificado numa sessão de mapeamento do projeto — a última entrada de sessão real neste log era `[2026-06-13] DataTable tree-data: expand-all/collapse-all`, mas `git log --grep="^release:"` mostra **20 releases publicadas depois disso** (v0.11.0 até v0.30.0), sem nenhuma entry correspondente. Confirmado que boa parte dessas sessões rodou em colaboração direta com o usuário sem invocação formal das skills do pipeline (designer→gate→dev→reviewer) nem registro em tempo real — mesmo padrão já reconhecido na seção "Auditoria retroativa v0.3.0" abaixo. Este registro consolida por tema (fonte: mensagens `release:` + PRs mergeados), não reconstrói 20 entradas individuais fabricando `Assumption`/`Critique genuína` que não foram escritas de fato.
- Output — marcos por tema:
  - **DataTable (v0.13.0–v0.23.0)**: componente `List`; view Lista (toggle Tabela↔Lista); `listConfig.getPath` (árvore paginada); paginação opt-in na Lista; autoFit (header-floor + fill proporcional + toggle consistente via `recalcKey`); visões read-only (`allowCreateView`) + `viewMode` sticky; footer compacto; fix de autoFit congelado pelo persist; grab-to-scroll nativo (virou default) + coluna `copyable`.
  - **Componentes novos distribuídos (v0.11.0–v0.27.0)**: 16 componentes registrados de uma vez (v0.11.0) + changelog/catálogo consumer; `Toast` (card sobre `Sonner`) + política de USAGE.md só-com-gotcha pros primitivos shadcn; `SingleMenuSidebar`; `Tabs` variant `line`; +6 componentes (Spinner/EmptyState/etc.); `MenuSidebar` ícone opcional em bookmark section.
  - **Padrões dashboard/lista (v0.24.0)**: receita de composição (`dashboard-patterns.md`) + skills `dashboard-builder` e `list-builder` + versão inicial do `ChoroplethMap` + distribuição via CLI.
  - **Kit de telas do app — lado DS, não Domínio App (v0.26.0–v0.29.0)**: `ds-link` (consumo via submódulo git); `module-replicator` (`/ds-replicate-module`); `screen-composer` (páginas master-detail/cross-filter); `app-builder-shell` (`/ds-create-app` + `example-app-shell`, rota declarativa); variantes de painel de login (`auth-builder`, texto/imagem/imagem+texto). **Nota de escopo**: isso é infraestrutura de exemplos/skills reutilizáveis do lado DS — não é o Domínio App (`app-designer`/`app-dev-react`), que continua 🚧 aguardando conforme `CLAUDE.md`.
  - **Multi-tema por marca (v0.18.0 CLI + feature)**: atributo `data-theme` + temas `blue`/`green`/`pay` via transform de overlay (`to-brand-overlay.ts`, emite só o diff de cor contra `default`); seletor "Tema de cor?" no `create`.
  - **DatePicker**: suporte a `mode` single/range/multiple, exposto no barrel.
  - **ChoroplethMap — incidente e fechamento (2026-07-27/28)**: componente tinha sumido da `main` num merge de reorganização anterior sem nenhum sinal disparar (só descoberto meses depois por um app consumidor — registrado como **L-058**); restaurado + deps (`d3-geo`/`topojson-client`) declaradas no `package.json` do DS + as 7 superfícies fechadas + distribuído no registry (débito zerado, ver `ea1ef0d`).
  - **Fix de doc drift (2026-07-27)**: `max-w-container-*` não existe (classe morta, falha silenciosa) corrigido em 7 usos + 11 docs que ensinavam o padrão errado — registrado como **L-057**.
  - **v0.30.0 (2026-07-28)**: release consolidando multi-tema + ChoroplethMap + fixes de token — versão em produção até esta entrada.
- Decisões: consolidar por tema em vez de reconstruir 20 entradas retroativas individuais — forçar o formato CONCLUÍDO/Assumption/Critique por PR criaria falsa sensação de rigor que não existiu nessas sessões (elas não passaram pelo pipeline formal em tempo real).
- Assumption: `git log` + as lições já registradas (L-057, L-058 — já presentes em `.ai/status/lessons.md` e no resumo de `.claude/rules/ds-standards.md` antes desta entrada) são fonte suficiente pra reconstruir o "o quê" e o "por quê" de alto nível deste período. Detalhe fino (alternativas descartadas, critique genuína por PR) que não foi escrito em tempo real está perdido e não será reconstruído artificialmente.
- Lições novas: nenhuma nova (L-057/L-058 já cobriam os 2 achados mais relevantes do período — container prefix e detecção de componente órfão).

### 2026-06-18 | ORCHESTRATOR | Arquivamento do pipeline-state.md | CONCLUÍDO

- Input: arquivo ativo passou de ~296KB / 2229 linhas — muito além do gatilho (~100 entradas / ~50KB).
- Output: 62 entradas CONCLUÍDO/APROVADO/REPROVADO do bloco 2026-05-12 a 2026-05-16 (DataTable Fases A–G, Table primitivo, Saved Views, hooks, column-type system) movidas para `.ai/status/archive/2026-06.md`.
- Decisões: mantidas no ativo as entradas de junho/2026, o cluster 2026-05-16 (contém PAUSADO/CASCATA/RETOMADO), a entrada-marco 2026-06-17 (milestone v0.10.0), a sessão de setup 2026-04 e as seções de referência (Índice de componentes, Auditoria retroativa v0.3.0, Índice de decisões). Nenhuma entrada PAUSADO/CASCATA aberta foi movida.
- Assumption: o bloco arquivado é histórico estável (trabalho concluído e mergeado) — consultá-lo é raro e o link em archive/2026-06.md basta. Se precisar reabrir, o conteúdo está íntegro lá.
- Lições novas: nenhuma.

### [2026-06-13] | DS DEV | DataTable tree-data: expand-all / collapse-all programático no DataTableRef | CONCLUÍDO

- Input: follow-up do tree-data (commit `658f50e`). O agente anterior deixou `collectExpandableTreeIds` (utils/tree-rows.ts) pronto mas NÃO expôs expand-all/collapse-all no imperative handle — exigia threadar tree-state no controller. Branch `feat/datatable-tree-expand-all` a partir de `main`. Sem push.
- Output:
  1. **`DataTableRef`** (`data-table.types.ts`) ganhou 2 métodos: `expandAllTree: () => void` e `collapseAllTree: () => void`. No-op fora de tree-data (sem `getTreeDataPath`).
  2. **Controller** (`use-data-table-controller.ts`): import de `collectExpandableTreeIds`; 2 `useCallback` (`expandAllTree`/`collapseAllTree`) montados sobre `allPagesProcessed` (todas as rows pós-filtro/sort — tree-data desliga paginação) + `getRowId` + `props.getTreeDataPath`, respeitando `treeData.defaultExpanded`. Wired no `useImperativeHandle`. Também expostos no return do controller (`expandAllTree`/`collapseAllTree`/`useTreeData`) pra um eventual botão de toolbar.
  3. **Semântica de divergência**: `expandedRowIds` guarda ids que DIFEREM do default. Logo `defaultExpanded=true` → expandAll=`[]`, collapseAll=todos os ids expansíveis; `defaultExpanded=false` → invertido. Reusa `setExpandedRowIds` (preserva controlled/uncontrolled + persistência).
  4. **data-table.tsx**: removido o NOTE de follow-up; substituído por comentário apontando os métodos do controller/ref.
  5. **Docs**: USAGE.md (seção Imperative ref + recipe Tree-data) com as 2 novas linhas + exemplo de botões fiados pelo consumer.
- Decisões: NÃO embutir botões na toolbar do DS (sem slot natural óbvio; prompt deixou opcional e o app fará os botões) — só os métodos do ref. Toggle por-nó (`toggleTreeNode`) permanece intocado.
- Tokens novos: NENHUM. Zero hardcode; nenhuma cascata necessária (a feature é puramente lógica/state — não toca styles).
- Validação: `npm run build` verde (tokens:tw4 + `tsc -b` 0 erros + vite, 3817 módulos). `npm run dev` (3100) não testado — defeito pré-existente do optimizeDeps do lucide-react (documentado na entry anterior) afeta só o dev server; build prod basta.
- Assumption: a semântica "Set = divergência do default" do `buildTreeRows` é a mesma que expand-all/collapse-all precisa inverter por `defaultExpanded` — verificado contra `isNodeExpanded` em tree-rows.ts (`expandedIds.has(id) ? !defaultExpanded : defaultExpanded`). `allPagesProcessed` cobre toda a árvore (paginação desligada em tree-data).
- Lições novas: nenhuma.

---

### [2026-06-09] | DS REVIEWER | PR3 auditoria-datatable — extensibilidade (operador default, filterType, warn, types) | PRE_COMMIT_OK

- Assumption verificada: sim — "derivar default do registry é correto pra todos os tipos (teste tsx 13/13, incl. date→between + currency→equals); any→unknown não quebra consumers (eles já castam value)" — verificada:
  1. **#2 ciclo filter-ops → column-types**: `column-types/` não importa de `utils/filter-ops.ts` (grep retornou vazio). Único sentido de dependência é `utils/filter-ops → ../column-types` (e `utils/calculate-column-widths → ../column-types`). Sem ciclo.
  2. **#2 date reorder operators[0]=between**: `DateColumnType.operators[0]` = `between` confirmado (linha 32 do date-column-type.tsx). `defaultOperatorForFilterType("date")` retorna `between`. `FilterRowEditor` lê `operators` da definição → "entre" aparece primeiro na lista do dropdown. `renderFilterInput` do date já usa `operator === "between"` → range mode (isRange=true). Sem regressão no widget.
  3. **#10 any→unknown**: `as FilterValue` em data-table.tsx l.1546 e l.1783 (anteriormente `as never`). `FilterValue` é o tipo correto pra esses sites — `value` vem do FilterItem que é `FilterValue`. Cast mais preciso, não mais amplo. Previews com `.foo` direto não existem (tsc 0 confirma). `filterOptions.value: string|number` — nenhum preview passa boolean: todos os STATUSES/CATEGORIES/AGENTS usam string keys. `DashboardShowcase.tsx` usa `positive: boolean` mas em estrutura diferente (não filterOptions). Sem regressão.
  4. **#9 import.meta.env?.DEV**: optional chaining cobre `undefined` em SSR/Node/vitest. Build de lib Vite substitui por `false` em produção (tree-shake). `vitest.setup.ts` não define `import.meta.env.DEV`, portanto o warn não dispara em teste. Seguro nos 3 contextos (browser dev, build lib, SSR).
  5. **Imports órfãos pós-remoção**: `FilterItem` e `FilterOperator` em toolbar-simple-filter-drawer.tsx ainda ativamente usados (Map<string, FilterItem[]>, effectiveOperator: FilterOperator, newItems: FilterItem[], etc.). Sem imports mortos.
- Critique genuína aplicada: Além do checklist mecânico examinei: (1) o único ponto com potencial de regressão real era o operators[0] reorder em date/datetime — o widget renderFastFilterInput deriva `isRange` de `Array.isArray(value)`, não do operator, portanto não depende de qual operator está em [0] para decidir o modo do calendário. O modo é determinado pelo valor existente. Ao criar um NOVO filtro de data sem valor, o operator `between` levará ao widget range mode (isRange vai ser false porque value é undefined, mas `renderFilterInput` usa `operator==="between"` → isRange=true). Comportamento correto e mais útil que o operador `equals` anterior. (2) O `defaultOperatorForFilterType("text")` chama `registry.get("text")` com fallback para "text" — portanto nunca lança erro (registry sempre tem "text" registrado). A última linha `?? "contains"` é dead code mas inofensiva. (3) A referência a `inferOperatorFromFilterType` em `src/preview/pages/updates-data.ts` l.137 é em plain-text de changelog histórico — não é código executável; não afeta runtime. [BAIXO] Poderia ser atualizado para nomear `defaultOperatorForFilterType`, mas não é bloqueante.
- Escopo do diff: 8 arquivos modificados (column-type-registry.ts, date-column-type.tsx, datetime-column-type.tsx, data-table.tsx, data-table.types.ts, toolbar-simple-filter-drawer.tsx, filter-ops.ts, pipeline-state.md). Zero toque em tokens, CSS, typography, tv.ts, USAGE.md.
- Regressões L-001..L-027: nenhuma — todos os arquivos novos/modificados são lógica TypeScript pura (sem CSS classes, sem tv(), sem tokens).
- Pendências: nenhuma bloqueante. [BAIXO] `updates-data.ts` l.137 menciona nome antigo `inferOperatorFromFilterType` em texto de changelog histórico — cosmético, não afeta runtime.
- Lições novas: nenhuma.

### [2026-06-09] | DS REVIEWER | PR1 auditoria-datatable — consolidação filter-ops/aggregate/constants | PRE_COMMIT_OK

- Assumption verificada: sim — "unificação é behavior-preserving; promotion sem array-check é equivalente pq widget multiSelect sempre emite array; totalizer respeitar valueGetter não afeta previews (colunas agregadas atuais não têm valueGetter)" — verificada nos 5 pontos de atenção abaixo.
- Critique genuína aplicada: (1) **promoteOperator sem array-check**: revisado o path completo — array-check só existia no adapter para decidir o _spread_ (N itens vs 1), nunca para decidir a _promoção_. `promoteOperatorForFilterType` olha apenas `filterType`, que é o gate semântico correto. multiSelect widget (`multi-select-column-type.tsx` l.43) sempre emite `Array.from(set)` — path escalar não existe. Sem regressão. (2) **totalizer agora respeita valueGetter**: original `resolveTotalizerContent` usava local `getFieldValue(r, field)` (dot-path puro, sem `valueGetter`). Novo `computeAggregate` usa `applyValueGetter(r, col)` — colunas sem `valueGetter` seguem o dot-path (comportamento idêntico); colunas com `valueGetter` agora somam o valor transformado (consistência com group-header, que já fazia isso). Melhoria confirmada. (3) **renderAggregate ordem**: idêntica a ambas as originais — override → custom fn → built-in keyword switch → null (default). Formatter: `aggregateFormatter ?? valueFormatter` — idêntico. `computeAggregate` retorna `null` para keyword não-built-in (default do switch). (4) **genFilterId**: `crypto.randomUUID()` + fallback timestamp+random. IDs são identidade in-memory de FilterItem (não persistem entre sessions — filterModel é estado React). Nenhuma estabilidade exigida além do ciclo de vida do render. (5) **imports órfãos**: `export type { FilterValue }` em `filter-ops.ts` l.83 re-exporta tipo que nenhum consumer importa dali. Dead re-export inerte (não é bug).
- Escopo do diff: 3 arquivos novos (utils/filter-ops.ts, utils/aggregate.ts, data-table.constants.ts) + 7 arquivos modificados (use-filter-popover-adapter, use-data-table-controller, use-data-table-export, toolbar-simple-filter-drawer, data-table-totalizer-row, data-table-group-header-row, data-table.tsx) + 1 comment-only (table.styles.ts cross-ref) + pipeline-state.md. Zero toque em tokens, CSS, typography, tv.ts.
- Regressões L-001..L-027: nenhuma — novos utils são lógica pura (sem CSS classes, sem tv(), sem tokens).
- Pendências: nenhuma bloqueante. [BAIXO] `export type { FilterValue }` em `utils/filter-ops.ts` l.83 é dead re-export — remover a qualquer momento.
- Lições novas: nenhuma.

### [2026-06-09] | DS REVIEWER | refactor/column-types-shared — Pre-commit gate | PRE_COMMIT_OK

- Assumption verificada: sim — "helpers extraídos são behavior-equivalentes, exceto toNumber rejeitar Infinity (não ocorre nos dados)" confirmada. Nenhum caminho de matchesFilter/formatValue/renderCell produz Infinity como valor de entrada real: o filterInput é `<Input type="number">` que só emite valores finitos ou null; dados de célula financeiros (R$) são sempre finitos. `Number.isNaN(Number(Infinity))` = false na `toCurrency`/`toPercent` formatter — essas funções usam `Number.isNaN` apenas no formatter de exibição (não no filter), portanto a mudança de `!Number.isNaN` → `Number.isFinite` em matchesFilter é segura e correta.
- Critique genuína aplicada: Além do checklist mecânico examinei: (1) o único ponto suspeito — `Number.isNaN(Number(value)) ? null : n` (antigo currency/percentage) vs `Number.isFinite(n) ? n : null` (novo): o único delta são valores `Infinity`/`-Infinity`, que o `<Input type="number">` nunca produz e dados de BD não contêm — a mudança é correta, não uma regressão; (2) `findOption(value: unknown, ...)` em \_shared vs `findOption(value: string, ...)` no tags antigo: a assinatura mais larga (`unknown`) é backwards-compatible — tags sempre passa strings (`v` extraído de `toStringArray`), a comparação é `String(o.value) === String(value)` em ambos, resultado idêntico; (3) `multi-select` ainda tem seu próprio `toArray` local — não é uma cópia esquecida, é um array tipado diferente (`Array<string | number>` vs `string[]`) com lógica de hidratação específica (comentário explica), portanto corretamente fora do `_shared`; (4) os `Number.isNaN` remanescentes em currency/percentage são nos formatters de _exibição_ (`toCurrency`/`toPercent`) — completamente corretos e fora do escopo do \_shared (são funções locais, não foram migradas).
- Escopo do diff: 1 arquivo novo (\_shared.ts) + 7 arquivos modificados (6 definitions + pipeline-state.md). Zero toque em tokens, CSS, typography, tv.ts — categorias de sincronia crítica (L-016) estão fora do escopo.
- Regressões L-001..L-027: nenhuma — \_shared.ts é helpers puros (sem classes CSS, sem tv(), sem tokens). Definitions tocadas não introduziram anti-patterns.
- Pendências encontradas: nenhuma.
- Lições novas: nenhuma.

### [2026-06-09] | DS REVIEWER | refactor/filter-operators — Pre-commit gate | PRE_COMMIT_BLOCKED

- Assumption verificada: A assumption central ("eliminar dual-namespace eliminando operator-mapping.ts e usando ids longos ponta a ponta") é válida e o refactor a cumpre corretamente no fluxo principal. Porém dois problemas residuais foram encontrados que a comprometem parcialmente.
- Critique genuína aplicada: Além do checklist mecânico, examinei: (1) o round-trip completo SQL-parser → FilterRowEditor → matchesFilter → chip para os 5 tipos numéricos; (2) o fallback `?? "eq"` em `addRow` no filterPopover canônico — que sobreviveu ao refactor e introduz um "eq" curto no estado quando `getOperatorsForColumn` retorna undefined; (3) a paridade entre `operators[]` e `matchesFilter` nos 5 tipos com gte/lte; (4) os operadores `between/isAnyOf/isNoneOf` que não faziam parte do OPERATOR_PAIRS — confirmado que passam direto sem remap e continuam corretos; (5) o Deprecated drawer com `gap-gp-2xl` em vez de `gap-form-gap` (L-024).
- Escopo revisado: 16 arquivos (15 modificados + operator-mapping.ts deletado). Sem toque em tokens, componentes de estilo, ou typography — categorias token/CSS/twMergeConfig estão fora do escopo e não requerem verificação.
- Pendências encontradas: 2 ALTO + 1 MÉDIO + 1 BAIXO (ver saída no output do agente).
- Lições novas: nenhuma — achados cobertos por lições existentes (L-002/L-024).

### [2026-06-05] | INFRA RELEASE | Pipeline drift fix pós v0.5.1 publish | CONCLUÍDO

- Input: após publicar @snksergio/design-system@0.5.1 + @snksergio/create-design-system@0.1.4 (fix de types + URLs igreenlab + license + template), simulação teórica de consumer revelou drift do pipeline interno em relação ao estado real do CSS gerado.
- Output: 3 frentes aplicadas em 17 arquivos.
  - **Frente 1 (consumer-facing):** repo URLs `snksergio` → `igreenlab` no README.md + src/preview/pages/InstallationDoc.tsx.
  - **Frente 2 (pipeline interno):** typography presets removidos no rewrite 2026-05-19 ainda eram exibidos como pattern canônico em 14 arquivos. Substituições aplicadas (`text-label-sm` → `text-body-sm font-semibold`, `text-label-xs` → `text-caption-sm font-semibold`, `text-paragraph-sm` → `text-body-sm`, `text-subheading-2xs` → `text-title-sm`):
    - `.ai/rules/coding-standards.md`, `.claude/skills/ds-dev/impl-{igreen,shadcn,composite}.md`, `.claude/skills/ds-designer/{spec-token,figma-extract}.md`, `.claude/skills/frontend-design/SKILL.md`, `.claude/commands/ds-extract-figma.md`, `.claude/hooks/ds-lint-styles.sh`, `.ai/context/components/{guide,inventory,shadcn-token-map}.md`, `.ai/context/doc-guide.md`, `README-PIPELINE-WORKFLOW.md` (adicionado bloco "Nota histórica" preservando exemplos didáticos como snapshot).
  - **Frente 3 (audit logs):** L-007 atualizada (recomendação apontava preset removido), L-017 (npm types broken), L-018 (CLI template desync), L-019 (grep all scopes ao remover token) adicionadas em `.ai/status/lessons.md`. Resumo correspondente em `.claude/rules/ds-standards.md` atualizado. Entry v0.5.1 em `src/preview/pages/updates-data.ts`.
- Decisões:
  - Audits/specs/archives intocados (preservar snapshots históricos)
  - `pipeline-state.md` mantido com refs históricas a presets removidos (log append-only — preservar contexto)
  - README-PIPELINE-WORKFLOW.md exemplos didáticos mantidos com nota histórica explicando
- Assumption: substituições `text-label-sm` → `text-body-sm font-semibold` preservam intent visual (13px + peso 600 em ambos). Verificar manualmente próximo uso real em componente novo.
- Lições novas: L-017 (files + .d.ts), L-018 (CLI template sync), L-019 (grep all scopes). L-007 atualizada.
- Validação: `grep` final em arquivos vivos confirmou zero drift remanescente fora dos snapshots históricos esperados.

- Spec verificada: sim — entrada PAUSADO (gate) confirmada no pipeline-state.md com alternativas descartadas e assumption central
- Gate verificado: sim
- Assumption verificada: agora valida — `scrollbar-width: auto` em scrollbar-default entrega scrollbar do sistema no Firefox (~16px nativo), enquanto `scrollbar-thin` permanece `thin`. No webkit (Chrome/Safari/Edge) a distincao e 8px vs 6px via `--scrollbar-width-default` / `--scrollbar-width-thin`. Distincao real existe em todos os browsers-alvo.
- Critique genuina: examinado se `scrollbar-color` com track `transparent` e valido com `scrollbar-width: auto` no Firefox — confirmado valido (a spec CSS aceita `transparent` independente do valor de width). Examinado se algum elemento foi alterado alem do scrollbar-width — negativo: scrollbar-color, ::-webkit-scrollbar-track, ::-webkit-scrollbar-thumb e ::-webkit-scrollbar-thumb:hover intactos em ambas as utilities. Examinado se a distincao semantica "thin = compacto, default = tamanho do sistema" e coerente com o naming — confirmado coerente.
- Fix do RETOMADO: confirmado aplicado corretamente (linha 663 do tailwind-theme.css: `scrollbar-width: auto`). scrollbar-thin linha 640 permanece `scrollbar-width: thin`.
- Lições novas: nenhuma (L-015 ja registrada no ciclo anterior)

### [2026-05-16] | DS DEV | Token de scrollbar | RETOMADO (fix da reprovacao)

- Input: REPROVADO pelo ds-reviewer; correcao aplicada conforme Opcao A
- Output: scrollbar-default agora usa `scrollbar-width: auto` (era thin)
- Decisoes: optei pela Opcao A em vez de B (manter thin + documentar) porque Opcao A entrega diferenca visual real em todos os browsers; semanticamente mais alinhado com naming "default"
- Licoes reforcadas: L-015 documentou a limitacao antes da correcao
- Validacao: npm run tokens:tw4 exit 0; tsc --noEmit exit 0
- Assumption: `scrollbar-width: auto` no Firefox ativa a scrollbar padrao do sistema (~16px); no Chrome/Safari/Edge o `::-webkit-scrollbar` com `--scrollbar-width-default` (8px) tem precedencia. Resultado: distincao real entre `scrollbar-thin` e `scrollbar-default` em todos os browsers.

### [2026-05-16] | DS REVIEWER | Token de scrollbar + utility variant | REPROVADO

- Spec verificada: sim — entrada "ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)" confirmada no pipeline-state.md
- Gate verificado: sim — entrada PAUSADO (gate) presente com spec completa, alternativas descartadas e assumption central documentada
- Assumption verificada: **parcialmente válida** — a assumption "scrollbar-width CSS standard + ::-webkit-scrollbar cobrem browsers-alvo" é correta. Porém a assumption implícita de que `scrollbar-default` (8px) se comporta diferente de `scrollbar-thin` (6px) no Firefox é **falsa**: `scrollbar-width` CSS aceita apenas `auto`/`thin`/`none` — não aceita px. Ambas as utilities entregam `scrollbar-width: thin` no Firefox, tornando-as visualmente idênticas nesse browser. A distinção de 6px vs 8px só existe no Chrome/Safari/Edge via `::webkit-scrollbar`. Isso não quebra a assumption do gate (que não faz promessa sobre Firefox pixel-width), mas é uma limitação de design não documentada.
- Critique genuína aplicada: A revisão encontrou 1 item que muda a direção — não é aprovação automática. O problema não está nos tokens, no transform, nem nas migrations. Está na semântica do naming: `scrollbar-default` promete comportamento "default" (implicitamente diferente de thin), mas no Firefox ambas as utilities são idênticas. Isso não é bug implementado incorretamente — é uma limitação inerente do CSS que a spec aprovou sem documentar. O checklist mecânico passou. A regressão de cor no TabelaTeste (`bg-muted` → `bg-muted-hover`) foi registrada pelo DS Dev como "conforme spec aprovada" — spec aprovada pela gate mencionou `bg-muted-hover` como thumb-color padrão, então a uniformização é intencional e aceita. O overflow-x-hidden foi preservado (linha 83 de kanban.styles.ts). `--radius-radius-full` existe no @theme (linha 198 do CSS) — a correção do DS Dev está correta. Vars consumidas pelas utilities (`--color-bg-muted-hover`, `--color-fg-muted`) têm override no .dark. Estrutura nested `&::-webkit-scrollbar` dentro de `@utility` é o formato suportado pelo Tailwind v4. Paridade visual do Kanban `board`/`columnBody`: todas as 6 propriedades do hardcode anterior estão cobertas pela utility.
- Itens reprovados:
  1. `tokens/transforms/to-tailwind-v4.ts` linha 212 + 234: `scrollbar-default` usa `scrollbar-width: thin` — igual ao `scrollbar-thin`. No Firefox, as duas utilities são visualmente idênticas. A utility deve ou (a) usar `scrollbar-width: auto` para `scrollbar-default` (scroll bar mais larga, default do browser), ou (b) adicionar comentário explícito documentando que a distinção 6px/8px é Chrome/Safari/Edge-only. Sem essa correção, o naming `scrollbar-default` é semanticamente enganoso para contexts de teste/documentação.
- Lições novas: L-015 — `@utility scrollbar-*` com duas larguras distintas: `scrollbar-width` CSS aceita apenas `auto`/`thin`/`none`. Distinção px entre utilities só existe em Chrome/Safari/Edge via `::webkit-scrollbar`. No Firefox, toda utility custom com `scrollbar-width: thin` é visualmente idêntica. Se houver 2 utilities com tamanhos distintos, documentar esse comportamento ou usar `auto` para a "maior" (que ativa scroll bar default do browser).

### [2026-05-16] | DS DEV | Token de scrollbar + utility variant | CONCLUÍDO

- Input: spec aprovada em [2026-05-16] — gate "ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)"
- Output: IMPL_PRONTA sinalizado — tokens + utilities + transform fn + 3 migrations executadas
  - 2 tokens: `scrollbar.width.thin` (6px) + `scrollbar.width.default` (8px) em `tokens/brands/default/components/sizing.ts`
  - 1 função `buildScrollbarVars()` no transform `tokens/transforms/to-tailwind-v4.ts` — emite `--scrollbar-width-thin` + `--scrollbar-width-default` no `@theme {}`
  - 1 função `buildScrollbarUtilities()` no transform — emite `@utility scrollbar-thin` + `@utility scrollbar-default` no output
  - 3 migrations: Kanban `board` + `columnBody` → `scrollbar-thin`, TabelaTeste `wrap` → `scrollbar-default`
  - `npm run tokens:tw4` executado sem erros — CSS regenerado com vars + utilities
  - `npx tsc --noEmit` exit 0
- Decisões:
  - `buildScrollbarVars()` emite vars com prefixo `--scrollbar-width-*` (sem `--spacing-`) — scrollbar width não é spacing semanticamente
  - Scrollbar vars posicionadas no final do bloco `themeVars` (após z-index), mantendo a ordem lógica (dimensões no fim)
  - Scrollbar utilities emitidas após bloco de typography utilities — mesma seção de "@utility blocks" do output
  - TabelaTeste migrado de `bg-bg-muted` → `scrollbar-default` (que usa `bg-muted-hover`) conforme spec aprovada — mudança sutil de cor do thumb rest state
- Assumption: scrollbar utilities aplicam corretamente em Chrome/Safari/Firefox/Edge — validar manualmente na próxima fase
- Lições novas: nenhuma — padrão de @utility token-driven é análogo ao já estabelecido para text-\* presets. Nota: spec original usava `var(--radius-full)` nos utilities, corrigido para `var(--radius-radius-full)` durante implementação — dentro de `@utility` o CSS var precisa do nome completo conforme declarado no `@theme {}`, não do sufixo de classe Tailwind

### [2026-05-16] | ORCHESTRATOR | Token de scrollbar + utility variant | PAUSADO (gate)

- Spec entregue por: ds-designer
- Cascata origem: [2026-05-16] DS DEV Kanban Fase C — Cascata 2
- Escopo:
  - 2 tokens em `tokens/brands/default/components/sizing.ts`: `scrollbar.width.thin` (6px) + `scrollbar.width.default` (8px)
  - 2 utilities em `src/styles/theme/tailwind-theme.css`: `@utility scrollbar-thin` + `@utility scrollbar-default`
  - 1 função `buildScrollbarVars()` adicionada ao transform `tokens/transforms/to-tailwind-v4.ts` (emite `--scrollbar-width-thin` + `--scrollbar-width-default` no `@theme {}`)
  - Migrações: Kanban `board` + `columnBody` (2 slots, drop-in) e TabelaTeste (1 slot, drop-in)
  - Não migrar: table-toolbar (hidden scrollbar, fora do escopo) + 4 popovers (thumb color diferente)
- Alternativas descartadas:
  1. Status quo (hardcoded em cada consumer) — descartado: duplicação cresce linearmente, popovers já mostram divergência sem governance
  2. Token `scrollbar-thumb-color` dedicado — descartado: `bg-muted-hover` já é o token semântico correto; indireção não adiciona flexibilidade real
  3. Variant `scrollbar` via `tv()` puro (sem @utility) — descartado: tv() não resolve pseudo-elements; a verbosidade hardcoded se manteria dentro do tv()
  4. Arquivo CSS separado (`scrollbar.css`) — descartado: fragmentação sem ganho; @utility de scrollbar é da mesma natureza dos @utility text-\* já existentes no mesmo arquivo
- Assumption central: scrollbar-width CSS standard (Firefox) + ::-webkit-scrollbar (Chrome/Safari/Edge) cobrem os browsers-alvo do produto CRM. Safari mobile não exibe scrollbar (overlaid) por padrão — utility não causa regressão, apenas sem efeito visível no iOS. Assumption quebra se produto tiver target de browser legacy (Firefox <64) ou requisito de scrollbar sempre visível em mobile.
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill `impl-token.md` para: (1) adicionar `scrollbar` em `components/sizing.ts`, (2) adicionar `buildScrollbarVars()` no transform + incluir no `themeVars`, (3) adicionar `@utility scrollbar-thin` + `@utility scrollbar-default` no template string do transform, (4) rodar `npm run tokens:tw4`, (5) migrar Kanban `board`+`columnBody` + TabelaTeste → `"scrollbar-thin"` / `"scrollbar-default"`, (6) rodar `npx tsc --noEmit`

### [2026-05-16] | DS REVIEWER | Avatar iGreen (ui/) | APROVADO

- Spec verificada: sim — entrada "ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)" em pipeline-state.md (linha 78–91)
- Assumption verificada: sim — `text-white` sobre colorHex mantém legibilidade decorativa aceitável. A implementação não adicionou warning/check de contraste (correto — assumption transfere risco ao consumer). Cor `#f9a47a` (peach, Lúcia Almeida) no KanbanDoc é a mais próxima do limite de contraste (~1.4:1 com branco), mas o DS Dev usou essa cor deliberadamente em contexto decorativo dentro de um card que já apresenta o nome textualmente. Assumption não quebrou — cabe ao consumer evitar cores muito claras se contraste for requisito. Caso patológico (`#ffeb3b`) é silenciosamente quebrado, como documentado na assumption do gate.
- Critique genuína: (1) API Opção B (`color` + `colorHex?` separados): na prática KanbanDoc e user-column-type usam exclusivamente `colorHex` — prop `color` semântico é usado zero vezes nas migrations. Isso confirma que o uso dominante do Avatar no produto é pessoa-específico (hex). A prop `color` ainda tem valor para avatars genéricos (status/categoria), mas não é o caminho principal. Decisão de API ainda correta — não muda direção, mas é um sinal de onde o DS pode evoluir (preset de paleta pra pessoas, ou `colorHex` com fallback automático de contraste). (2) `_custom` interno: solução é elegante — não é um hack. O tv() não suporta `color: undefined` desativando o defaultVariant de forma limpa; `_custom: ""` é o padrão correto para "sem classe, sem override do default". A variante não vaza: types.ts faz `Omit<AvatarVariantProps, "color">` e redefine `color` como union explícita sem `_custom` — TypeScript bloqueia em compile time. (3) `text-caption-sm` (11px) em `xs` (20px): DS Dev manteve o preset em vez de usar `text-[9px]`. Avaliação: aceitável. O literal `text-[9px]` anterior (PersonAvatar) era não-documentado e inconsistente. `caption-sm` (11px) em 20px de container resulta em uma letra que ocupa ~55% do diâmetro — um pouco maior que o ideal, mas dentro do tolerável para uso decorativo. Não há token menor que `caption-sm` no DS, e criar `caption-2xs` foi explicitamente descartado na spec. (4) `h-[640px]` encontrado no KanbanDoc: pertence ao container de preview do Kanban (layout da página de doc), não ao Avatar — fora do escopo desta revisão.
- Regressões: nenhuma — todos os greps L-001 a L-014 sem match. `size-comp-*` resolvido via Tailwind v4 auto-mapping de `--spacing-comp-*`. TSC exit 0 conforme pipeline-state.
- Lições novas: nenhuma

### [2026-05-16] | DS DEV | Avatar iGreen (ui/) | CONCLUIDO

- Input: gate aprovado em [2026-05-16] — spec "ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)"
- Output: 4 arquivos criados (`avatar.styles.ts`, `avatar.types.ts`, `avatar.tsx`, `index.ts`, `USAGE.md`) + 2 migrations executadas (KanbanDoc.tsx, user-column-type.tsx)
- Decisoes:
  - Usou variante interna `_custom` no `color` para o caso `colorHex`: quando `colorHex` esta ativo, `color` e definido como `"_custom"` (string vazia, sem bg/fg), e `text-white` e adicionado via className merge. Isso evita lutar contra o `defaultVariants` do tv() que aplicaria `muted` caso `color` fosse `undefined`.
  - Sizes usam `size-comp-*` (nao `size-form-*` nem `size-icon-*`) por ser o token correto para sizing generico de componentes (comp.2xs=20, comp.xs=24, comp.sm=28, comp.md=32, comp.xl=40).
  - Migration KanbanDoc: head do card usa `size="sm"` (24px, era `size-icon-lg`), footer usa `size="xs"` (20px, era `size-icon-md`). Funcao `PersonAvatar` removida, import de Avatar shadcn removido.
  - Migration user-column-type: `UserAvatar` inline (22px hardcoded) substituido por `<Avatar size="sm">` (24px). Diferenca de 2px e aceitavel — 22px nao tinha token DS; 24px (`comp.xs`) e o token mais proximo e correto.
  - `aria-hidden="true"` default (decorativo); `role="img"` + `aria-label` quando label e fornecido.
- Assumption: `text-white` sobre qualquer `colorHex` mantém legibilidade decorativa aceitável. Validar na próxima fase com DS Reviewer.
- Licoes novas: nenhuma
- Validacao: `npx tsc --noEmit` exit 0

### [2026-05-16] | ORCHESTRATOR | Avatar iGreen (ui/) | PAUSADO (gate)

- Spec entregue por: ds-designer
- Cascata origem: [2026-05-16] DS DEV Kanban Fase C — Cascata 1
- Escopo: componente iGreen puro em `ui/Avatar/` (sem Radix, sem AvatarImage, sem AvatarStack). Children = ReactNode (initials fornecidas pelo consumer).
- Variants: `size` (xs/sm/md/lg/xl → tokens comp.2xs–comp.xl) + `color` (brand/success/warning/critical/info/muted) + `colorHex?: string` (override hex literal pra cor de pessoa — exceção L-014)
- Tokens consumidos: todos existentes (comp._, radius.full, bg._, fg.on-\*, text-caption-sm/md, text-label-xs). Zero tokens novos. Zero cascatas abertas.
- Alternativas descartadas:
  1. Estender Avatar shadcn com className externo — não resolve hardcode no consumer.
  2. Usar AvatarFallback Radix como base — overengineering sem AvatarImage no escopo.
  3. API `color: union | string` (Opcao A) — descartada por imprecisão de tipo; Opcao B (`color` semântico + `colorHex?` livre) escolhida.
  4. Criar preset `caption-2xs` (9px) para xs/sm — descartado; `caption-sm` (11px) é proporcional e adequado sem cascata.
- Assumption central: `text-white` sobre qualquer `colorHex` mantém legibilidade para uso decorativo em CRM. Se o produto usar cores claras via `colorHex`, contraste cai abaixo de WCAG AA — responsabilidade do consumer. Assumption quebra se o produto exigir garantia de contraste automático para hex livres.
- Aguardando: aprovação do usuário
- Retomar: após "sim" → acionar ds-dev com skill `impl-igreen.md` para criar `src/components/ui/Avatar/` (4 arquivos) + migrar PersonAvatar em KanbanDoc.tsx + migrar UserAvatar em user-column-type.tsx

### [2026-05-16] | DS DEV | Kanban Refinement V1 — Fase A (DS conformance) + Fase B (features) | CONCLUÍDO

- Input: usuário pediu auditoria completa do `<Kanban>` existente após decisão arquitetural (caminho D — primitive dumb, igual `<Table>`/`<TableToolbar>`). Achados: bug checkbox focus-within, 3 botões raw, ~10 hardcoded tokens, 0 DnD, sem `renderCard`, menus só via callback.
- Output Fase A — Bugs + DS conformance:
  - **Fix checkbox visibility bug**: `cardCheck` styles trocou `group-focus-within` → `group-focus-visible`. Resolve: checkbox antes permanecia visível ao desmarcar (focus retido no input). Agora some corretamente. Mesmo fix aplicado em `cardMenuSlot` e na variante hover/focus do `card`.
  - **3 botões raw → `<Button>` DS** (kanban.tsx): `columnAction` (Plus header) + `columnAction` (More header) + `cardMenu` (More card) → `<Button variant="ghost" color="secondary" size="icon-2xs">`. Slot `cardMenuSlot` mantido apenas pra positioning absolute + opacity. `columnAdd` (footer dashed) mantido raw — variant dashed-ghost não existe no Button DS, mas migrou pra `min-h-form-sm` + `text-caption-md` + `focus-visible:ring-4 ring-ring-brand`.
  - **~10 hardcoded → tokens DS** (kanban.styles.ts): `gap-[2px]` → `gap-gp-2xs`, `gap-[4px]` → `gap-gp-xs`, `px-[6px]` → `px-pad-sm`, `pt-[4px]` → `pt-sp-xs`, `mt-[2px]` → `mt-sp-2xs`, `text-[11px]` → `text-caption-sm`, `text-[12px]` → `text-caption-md`, `text-[12.5px]` → `text-caption-md`, `text-[13px]` → `text-label-sm`, `text-[13.5px]` → `text-label-sm`, `text-[11.5px]` → `text-caption-sm`. Mantidos como literal: offsets absolutos (`top-[18px] left-[12px]`, `top-[6px] right-[6px]`, `pl-[36px]`), width fixo da coluna (`w-[296px]`), dot decorativo (`size-[8px]`) — sem token equivalente.
  - **Preview ajustado** (KanbanDoc.tsx): `PersonAvatar` agora usa `size-icon-md text-caption-sm` (footer) e `size-icon-lg text-caption-md` (head); literais inline migrados pra tokens. Bug "letra do avatar grande quase saindo fora" resolvido.
- Output Fase B — Features novas (API expansion, backward-compatible):
  - **`renderCard?: (params) => ReactNode`** na `KanbanProps`: substitui o miolo do card mantendo wrapper externo (border/shadow/focus/checkbox/menu positioning) sob controle do primitive. Garante consistência mesmo em boards customizados.
  - **`getCardMenuItems?` + `getColumnMenuItems?`** na `KanbanProps`: items padronizados (`KanbanMenuItem[]`) — primitive renderiza `<DropdownMenu>` DS automático com suporte a `icon`, `destructive`, `disabled`, `separator`. Coexistem com `onCardMenu`/`onColumnMenu` (callbacks manuais) como escape hatch — se ambos forem fornecidos, `get*MenuItems` ganha.
  - **DnD entre colunas** (`enableDnD` + `onCardMove`): hook novo `hooks/use-kanban-dnd.ts` encapsula `@dnd-kit/core` (PointerSensor com `distance: 5` preserva click-to-open, KeyboardSensor pra acessibilidade). `<DndContext>` + `<DragOverlay>` wrap o board. Cada card é `useDraggable`; cada column body é `useDroppable`. Constraints por coluna: `canReceiveDrop: false` (terminal) + `canDragFrom: false` (locked). Visual feedback built-in: card sendo arrastado com `opacity-40 cursor-grabbing`, coluna candidata com `outline-2 outline-border-brand bg-bg-brand-subtle/30`, coluna inválida com `cursor-not-allowed opacity-60`. Primitive **não faz revert** — consumer comita via `cards` props (optimistic ou async).
  - **`KanbanMenuItem` + `KanbanRenderCardParams` exportados** no barrel (`index.ts`).
  - **Preview ampliada** (KanbanDoc.tsx): 3 novas seções demonstram `getCardMenuItems`/`getColumnMenuItems` (Ver/Editar/Arquivar/Excluir com separator + destructive), DnD com coluna "Inativo" bloqueada (`canReceiveDrop: false`), e `renderCard` compacto com layout custom.
- Decisões:
  - **Wrapper do card permanece sob controle do primitive** mesmo com `renderCard`. Consumer não customiza border/shadow/focus/checkbox/menu positioning — garante consistência visual e a11y.
  - **Coexistência callbacks manuais + auto-menus**: não deprecar callbacks. `getCardMenuItems` é a recomendação pra 80% dos casos; `onCardMenu` continua disponível pra menus complexos (submenu, search, etc).
  - **Primitive não faz revert de DnD**: consumer é responsável. Justificativa: Kanban é dumb, não tem state de cards. Reverter exigiria espelhar `cards` em state interno, quebrando o contrato.
  - **`canReceiveDrop` testado por coluna destino apenas** (não por origem-destino combo). YAGNI — se algum dia precisar de regras `from→to` granulares, vira `canReceiveCardFrom: (fromColumnId) => boolean`. Por enquanto boolean simples cobre 95%.
- Assumption: usuários não precisam de revert visual automático em DnD (consumer commita optimistic e reverte updating cards prop se backend rejeitar). Se isso quebrar, primitive precisará tracking interno de pending moves.
- Validação: `npx tsc --noEmit` exit 0 após Fase A e após Fase B.
- Lições novas: nenhuma.

### [2026-05-16] | DS DEV | Kanban Fase C — Cascatas DS sinalizadas (não executadas) | CASCATA

- Cascata 1 — **`<Avatar>` iGreen** (componente novo):
  - **Necessidade**: Avatar shadcn não tem variants `size` — consumer fica fazendo `className="size-[22px] text-[10px]"` hardcoded. Quebra hierarquia tipográfica (fallback default é `text-label-sm`, sobrescrito por literal arbitrário).
  - **Uso esperado**: `<Avatar size="xs|sm|md|lg|xl" color="brand|warning|success|info|critical|muted">MS</Avatar>` + suporte a `color={hex literal}` pra cores de pessoa (avatars coloridos por entidade no Kanban).
  - **Pipeline aberto**: ds-designer especifica → [GATE] → ds-dev cria → ds-reviewer aprova.
  - **Retomar**: após REVIEW_OK do `<Avatar>` iGreen → migrar `PersonAvatar` em KanbanDoc.tsx pra `<Avatar size="sm">`/`<Avatar size="md">` + migrar previews do DataTable.
- Cascata 2 — **Token de scrollbar** (token novo):
  - **Necessidade**: Kanban e DataTable virtualized fazem scrollbar styles hardcoded (`[scrollbar-width:thin] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar]:w-[6px]`). Cores conformes (`bg-bg-muted`, `bg-bg-muted-hover`) mas dimensões não.
  - **Uso esperado**: tokens `--scrollbar-width-thin: 6px`, `--scrollbar-width-default: 8px`, `--scrollbar-thumb-color: var(--color-bg-muted-hover)` em `tokens/components/sizing.ts`, e variant `scrollbar` no `tv()` que aplique automaticamente. Consumer faz `scrollbar="thin"` em vez do hack `[&::-webkit-scrollbar]:...`.
  - **Pipeline aberto**: ds-designer especifica → [GATE] → ds-dev cria token + variant utility → ds-reviewer aprova.
  - **Retomar**: após REVIEW_OK → migrar Kanban + DataTable virtualized + outros consumers em batch.
- Decisão: Fase C **não bloqueia V1 do Kanban**. V1 fica entregável com Fase A+B (bug fix + DS conformance + features novas); cascatas C são melhorias futuras agendadas pra backlog.
- Assumption: usuário concorda em manter os 2 literals workaround em produção (avatar size+text hardcoded em consumer, scrollbar styles hardcoded em primitive) até as cascatas saírem. Se isso for inaceitável, Fase C precisa rodar antes do release.
- Aguardando: priorização do usuário pra abrir as 2 cascatas (provavelmente em sessões dedicadas — Avatar iGreen é tarefa de spec rica, scrollbar é simples).

---

