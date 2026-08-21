---
description: Regras de design do iGreen DS — aplicar ao gerar/editar qualquer UI (.tsx)
globs: ["**/*.tsx", "**/*.styles.ts"]
alwaysApply: true
---

# Regras de design iGreen (auto-carregadas)

Ao gerar ou editar QUALQUER UI neste projeto, aplique sem ser pedido. Detalhe e
contexto em `DESIGN.md` (raiz). API de cada componente em
`src/components/ui/<Nome>/USAGE.md`.

> **Modo submódulo.** Se existe `.claude/ds-config.json` com `"mode": "submodule"`, três
> coisas mudam nesta regra: (1) `DESIGN.md` e os `USAGE.md` ficam em `<dsPath>/` e
> `<dsPath>/src/components/ui/<Nome>/`, não na sua raiz; (2) **não** existe `igreen:add`,
> manifesto nem hook de proteção — os componentes estão no disco e você importa pelo
> `importBase`; (3) a regra de **não editar o tema/fundação** continua valendo, só que por
> disciplina, não por bloqueio: o que você editar no submódulo some no próximo `git pull`.

## Composição de tela
- Wrapper de página: `flex flex-col h-full min-h-0 gap-gp-2xl`.
- **16px (`gap-gp-2xl`) entre o `PageHeader` e o próximo bloco** — nunca grudado.
- Conteúdo que precisa preencher (tabela): `className="flex-1 min-h-0"` + pai com altura.
- Forms: `<FormField>` (nunca `<label>` cru) + `gap-form-gap` (20px) entre campos.
- Card: densidade pela prop `size` do `<Card>` — `sm` 16 · **`md` 20 (default)** · `lg` 24 (tokens `p-pad-card-sm/md/lg`; `base` é alias depreciado de `md`); entre cards `gap-gp-md`/`gap-gp-lg`.

## Tokens (classe DS antes de Tailwind literal)
```
gap-4 → gap-gp-md      p-4 → p-sp-md/p-pad-2xl    rounded-lg → rounded-radius-lg
shadow-md → shadow-sh-md    h-9/h-10 → min-h-form-md/lg    size-5 → size-icon-md
```
- **Prefira o token de COMPONENTE ao genérico**: altura `min-h-form-*` (não `h-9/10`), gap de form `gap-form-gap`, ícone `size-icon-*` (não `size-5`), padding de card `p-pad-card-*`, gutter `px-pad-page-*`, chrome `h-layout-*`, largura `max-w-*`. Genérico (`gap-gp-*`/`p-sp-*`/`px-pad-*`) só como fallback. Cheat-sheet completo em `DESIGN.md` ("Tokens de componente").
- Foco: `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-{color}` (ring já tem alpha — nunca `/30`, nunca `ring-3`).
- Cor só por token semântico (`bg-bg-brand`, `text-fg-default`...). Zero hex em className. Destrutivo na API = `color="critical"`.

- ⚠️ **`max-w-container-*` NÃO existe** — `container` é o único namespace que não dobra o
  prefixo. `max-w-md` já é os **768px do DS** (não os 448px do Tailwind); use `max-w-lg`,
  `max-w-drawer-md`, `max-w-modal-sm`. A forma com `container` não emite CSS e some em silêncio.
- ⚠️ **`bg-bg-scrollbar-thumb` / `-hover` são de uso interno** dos `@utility scrollbar-*`
  (alpha neutro, pra barra ter contraste próprio). Não use como fundo de elemento.

## Tipografia
- Default interativo: `text-body-sm` (13/500). **7 papéis**: display/heading/title/body/caption/**stat**/code.
- **Número de KPI/métrica = `text-stat-{sm,md,lg,xl}`** (20/24/30/34px) + `tabular-nums`. Nunca `text-[Npx]` na unha, nunca `display-*`/`heading-*` pra valor de indicador.
- **Código / identificador / valor técnico = `text-code-{sm,md}`** (13/14px, Geist Mono) — chave de env, ID, hash, slug, path. Nunca `font-mono text-body-*` + `tracking-*` na unha: `code` é 1 dos 7 papéis e existe pra isto.
- Override de peso via `font-bold/semibold/medium/normal`. Nunca `text-xs font-semibold` avulso → use preset.

## ⛔ O tema já traz o runtime — não redeclare
O `tailwind-theme.css` importado no seu CSS de entrada **não é só CSS vars**. Ele traz
`@font-face` do Geist, `--font-sans`/`--font-mono`, `@custom-variant dark`, regras de
`html`/`body`/`button` e as utilities `outline-float` e `scrollbar-thin`/`scrollbar-default`.

**Não redeclare nenhuma delas** no seu CSS: classe comum vence `@utility`, e a **segunda**
declaração de `@custom-variant` vence a primeira — você acaba com um comportamento no seu
projeto e outro no resto do sistema, sem erro nenhum. Os `.woff2` do Geist, sim, são seus
(o `@font-face` aponta pra `/fonts/`, raiz do site).

## 🖼️ Trabalhando a partir de print / Figma / tela existente
A referência decide **conteúdo**; o DS decide **pele e comportamento**.
- **Dela**: copy, labels, nomenclatura, ordem dos campos. Copie e não "melhore" sem pedir — o jargão é do domínio do usuário.
- **Do DS, sempre**: fonte/família, tamanho, peso, tracking, cor, espaçamento, radius, sombra, foco e **comportamento de componente**. Preset existe → use o preset; compor na unha porque "ficou igual ao print" é drift.
- **Cor**: a referência escolhe o CONJUNTO (print escuro → `dark`; outra marca → `data-theme`), **nunca** o valor. Não derive hex do pixel.
- **Chrome (rail/menu/header) na referência = shell no escopo.** Print de app + pedido de "uma tela" é `shell + tela`. Não vai entregar o shell? Avise em linha destacada **antes** de gerar.

## Antes de criar
- Existe exemplo/skill pra isso? (tabela→`/ds-create-crud`; ver `DESIGN.md` mapa de intenção). Puxe e adapte em vez de escrever do zero.
- Leu o `USAGE.md` do componente? Não invente prop/variante.
- `npx tsc --noEmit` limpo antes de entregar.

## ⛔ Arquivos protegidos — NÃO editar (integridade do DS)
- **NUNCA edite** o tema/tokens (`src/styles/theme/**`) nem a fundação (`src/lib/utils.ts` = cn, `src/utils/tv.ts` = tv, `src/lib/lucide-types.ts`). São a base visual gerada pelo DS — editar quebra o sistema todo e some no próximo update.

  > **O que de fato te impede, por canal:**
  >
  > | canal | trava |
  > |---|---|
  > | copy-in / scaffold | ✅ hook `protect-ds.mjs` **bloqueia** (`Edit`/`Write`/`MultiEdit`) e **avisa** em `Bash` que escreve nesses paths |
  > | **submódulo** | ✅ **desde o CLI 0.24.0** — o `ds-link` projeta o hook, e ele reconhece o layout de submódulo (bloqueia `<dsPath>/src/styles/theme/**` e `<dsPath>/tokens/**`, sem confundir com o **seu** `src/`). ⚠️ **1 passo manual:** hook só roda se estiver no seu `.claude/settings.json`, e o `ds-link` não escreve nesse arquivo (é seu) — ele **imprime o bloco pronto** e repete o aviso até você colar |
  > | npm install | ❌ nenhuma — o código vive em `node_modules` |
  >
  > ⚠️ **Até o CLI 0.25.1 esta tabela dizia "❌ nenhuma" no submódulo**, justificando com *"o
  > `ds-link` não projeta `hooks/`"*. Era verdade até a 0.23.x e **deixou de ser na 0.24.0** —
  > eu mudei o mecanismo e atualizei a `ds-channels.md`, mas não procurei as outras superfícies
  > que descreviam a mesma coisa. Se você leu a versão anterior e concluiu que no submódulo não
  > há rede de segurança: há, e vale colar o bloco.
- **Não edite o `.styles.ts`/internals de um componente do DS** pra "ajustar visual" de uma tela. Isso vira edição local (drift) e diverge do padrão. **Customize na COMPOSIÇÃO**: escolha variantes/props do componente + classes DS na SUA tela.
- Quer outra cor/tom? Use o **token/variante semântico** que já existe (`color="..."`, `bg-bg-*`). Não invente hex nem reescreva o token.
- Pra evoluir o tema de fato → re-sincronize com o DS (`npm run igreen:add -- theme`), não edite à mão.

## Puxar componentes/exemplos (manifesto)
- **SEMPRE** `npm run igreen:add -- <item> [<item> ...]` — o wrapper instala E registra no `.igreen-ds/manifest.json` (baseline pro `igreen:drift`/`igreen:update`).
- **NUNCA** `npx shadcn add @igreen/...` cru: o componente instala mas fica **fora do manifesto** (o `igreen:drift` acusa "não gerenciado"). Se acontecer, recupere rodando `npm run igreen:add -- <os mesmos itens>` (idempotente; re-baseline sem sobrescrever edição).
- Commite o `.igreen-ds/manifest.json`.
