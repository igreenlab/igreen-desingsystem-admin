# Fase 4 — Geração (só depois do gate aprovado)

10 superfícies. As 4 primeiras fazem a marca **existir**; as outras a fazem **chegar**
em quem consome. Ordem importa: 4.1→4.2 antes de qualquer coisa, porque o resto
depende do CSS gerado.

Referência viva: faça `git show --stat <commit da vibrant>` ou compare
`tokens/brands/vibrant/` com `tokens/brands/pay/` — são os dois exemplos completos.

## 4.1 — Tokens da marca

```
tokens/brands/<id>/
  primitives/color-palette.ts      ← rampas (API privada, nunca importada por componente)
  semantic/color-light.ts          ← papéis no light
  semantic/color-dark.ts           ← papéis no dark
```

Copie a **estrutura** de `tokens/brands/vibrant/` (ou `pay/`) e troque os valores. A
forma dos objetos semânticos tem que casar com a da `default` — o transform faz
`diffVars` campo a campo contra ela.

- `primitives/color-palette.ts` exporta `colorPalette = { brand, brandContrast, gray, success, warning, danger, info, white, black, alpha }` (+ `grayDark` se tiver).
- `semantic/color-dark.ts` importa a neutra do dark: `import { grayDark as gray } from "../primitives/color-palette"`.

⚠️ **Confira o export depois de editar.** Um replace por script meu não aplicou (arquivo
CRLF, padrão com `\n`, exit 0, zero erro) e `grayDark` ficou **fora** do
`colorPalette` — `tsc` não pegou porque o campo era opcional no tipo consumidor.
Confirme executando, não por inspeção visual:

```bash
node -e "import('./tokens/brands/<id>/primitives/color-palette.ts').then(m=>console.log(Object.keys(m.colorPalette).join(', ')))"
```

(a `vibrant` devolve `brand, brandContrast, gray, grayDark, success, warning, danger,
info, white, black, alpha`)

## 4.2 — Script + geração do overlay

`package.json` → `scripts`, junto dos irmãos:

```json
"tokens:brand:<id>": "tsx tokens/transforms/to-brand-overlay.ts <id> > src/styles/theme/brand-<id>.css"
```

```bash
npm run tokens:brand:<id>
```

Confira o cabeçalho do arquivo gerado e a **contagem de vars**:

```bash
grep -c "^\s*--" src/styles/theme/brand-<id>.css
```

Referência das marcas atuais: `blue` e `green` **87** (só a cor de marca), `vibrant`
**125** e `pay` **166** (marca + neutros). Uma contagem de um dígito significa que os
objetos semânticos saíram quase idênticos aos da default — quase sempre erro de import,
não uma marca discreta.

## 4.3 — `@import` no showcase

`src/styles/globals.css`, **depois** do `tailwind-theme.css`:

```css
@import "./theme/brand-<id>.css";
```

## 4.4 — Catálogo do hook

`src/hooks/useBrand.ts`: acrescente o id no type `Brand` **e** a entrada em `BRANDS`
(`{ id, label, swatch }` — o swatch é a cor exibida no seletor).

Isso é o suficiente pro showcase inteiro: `ThemesDoc` (`#/themes`), o seletor do header
e o botão do drawer mobile todos leem `BRANDS`.

## 4.5 — `exports` do `package.json` (o build FALHA sem isto)

```json
"./theme/brand-<id>.css": "./dist-lib/theme/brand-<id>.css"
```

`files` já cobre por glob (`dist-lib/theme/**`). O `exports` é enumerado **de
propósito**: um wildcard tiraria do `pack-contract` a capacidade de verificar cada
caminho prometido.

O plugin `copy-theme-css` do `vite.lib.config.ts` descobre os overlays sozinho e tem
gate **fail-closed**: overlay sem entrada em `exports` **lança** no build, porque
seria arquivo publicado que o consumidor não consegue importar (classe da L-017).

## 4.6 — Item no `registry.json`

Copie o item `theme-vibrant` e troque id/título/descrição. Tipo `registry:file`, um
`files[]` apontando pra `src/styles/theme/brand-<id>.css`.

A descrição precisa dizer as duas coisas que fazem o consumidor perder tempo: que
**complementa** o item `theme` (não substitui) e que **sem `data-theme` no `<html>` o
CSS fica inerte**.

## 4.7 — CLI: label + bake

`cli/src/create.js` → `BRAND_LABELS`, com rótulo descritivo (aparece no prompt "Tema de
cor?"). Sem entrada, o prompt cai no id cru.

```bash
npm run cli:rebake
```

O bake copia os overlays pro template. **Não é opcional e não é cosmético:** o
`detectBrandThemes()` escaneia `cli/templates/default/src/styles/theme/` pra montar o
prompt — marca não bakeada simplesmente **não aparece** na criação de projeto, e marca
editada sem re-bake faz projeto novo nascer com o overlay velho. Os overlays entram no
rebake por descoberta de diretório, então não há lista pra esquecer.

## 4.8 — `ColorsDoc` (senão a página mistura duas marcas)

`src/preview/pages/ColorsDoc.tsx`: `import { colorPalette as paleta<Id> }` + entrada em
`PALETAS`.

A rampa primitiva é **valor TS**, não CSS var — não reage a `data-theme` sozinha. Sem
esta edição, a seção Semantic troca de marca e a Primitives não: duas marcas na mesma
tela ("acaba misturando 2 themes").

`Record<Brand, Paleta>` **força** esta edição no `tsc`. Só duas das 10 superfícies têm
gate: esta (tipo) e o `exports` (build lança). As outras 8 falham em silêncio — por isso
a Definição de Pronto é lista, e não confiança.

## 4.9 — Vocabulário do consumidor

`cli/templates/default/_claude/rules/ds-themes.md`: acrescente a marca na tabela e, se
ela tiver algo peculiar (texto escuro sobre a marca, dark near-black), diga qual é.

É o arquivo que a IA do consumidor lê. Marca distribuída mas ausente dele é gap de
distribuição (L-042) — existe, e ninguém sabe usar.

## 4.10 — Doc do DS

- `.ai/context/tokens/color.md` — a marca na lista
- `.claude/rules/ds-standards.md` — seção "Sistema multi-marca", se houver
  aprendizado novo
- `.ai/status/pipeline-state.md` — entrada com **Assumption central** (obrigatório)

## 4.11 — Verificação mecânica

```bash
npx tsc --noEmit
npm test                      # NÃO trunque a saída — ver nota abaixo
npm run release:check
```

⛔ **Nunca leia o resultado do teste por `| tail -3`.** Corta a linha de veredito e
mostra só Start/Duration — eu reportei "159 testes passando" com a suíte
**vermelha** por causa disso, e o CI reprovou o PR. Filtre pelo veredito:

```bash
npm test 2>&1 | grep -E "Test Files|Tests "
```

## Fora deste PR

`registry:build`, bump de versão, `npm publish`, bump do CLI → `/ds-release`.
Anote no PR body que falta registrar.
