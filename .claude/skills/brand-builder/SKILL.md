---
name: brand-builder
description: >
  Criar uma MARCA (brand/tema de cor) nova no iGreen DS — overlay escopado em
  [data-theme="<id>"] que coexiste com o tema-base e é trocado em runtime.
  Entrevista → derivação de cor medida → GATE → geração → verificação no browser.
  NÃO usar pra editar cor do tema-base (isso é /ds-add-token).
---

# Brand builder — marca nova no iGreen DS

Uma marca no DS **não** é "trocar a cor primária". É um overlay que pode tingir
neutros, superfícies, sidebar, tabela e status — tema encorpado. O transform emite
só o **diff** contra a marca `default`, então o custo em CSS é proporcional ao que
a marca realmente muda.

## Quando usar

| Pedido | Aqui? |
|---|---|
| "criar tema/marca X", "quero uma brand nova", "tema com a cor #XXXXXX" | ✅ |
| "adicionar tema do cliente Y" | ✅ |
| "mudar a cor brand do DS" (a default) | ❌ → `/ds-add-token` |
| "trocar de marca em runtime no meu app" | ❌ → `useBrand` (ver `#/themes`) |
| "ajustar uma cor de marca que já existe" | ❌ → editar `tokens/brands/<id>/semantic/*.ts` + regerar (Fase 4.1–4.2) |

## As 5 fases

```
1. ENTREVISTA        → interview.md          o que a marca é, e o que ela pode tingir
2. DERIVAÇÃO         → color-derivation.md   rampa + neutros + status, com CONTRASTE MEDIDO
3. [GATE]            → apresentar ao usuário e AGUARDAR "sim"     (Regra 4 do CLAUDE.md)
4. GERAÇÃO           → generate.md           10 superfícies, comandos exatos
5. VERIFICAÇÃO       → verify.md             browser, os 2 modos, valor RESOLVIDO
```

⛔ **Fase 5 não é opcional e não pode ser substituída por checar os `.ts`.** Toda a
cor desta área falha em **silêncio**: `tsc` passa, teste passa, `dead-theme-classes`
passa, e a tela fica errada. Foi assim que a `vibrant` chegou ao mantenedor com 13
tokens claros aplicados no dark (L-066) — eu tinha "verificado" lendo os valores nos
arquivos TS, que estavam certos; o que estava errado era o que o **cascade resolvia**.

## Estado inicial (obrigatório antes da Fase 1)

```
1. Ler .ai/context/tokens/color.md          — nomenclatura semântica (brand ≠ primary)
2. Ler a seção "Sistema multi-marca" em .claude/rules/ds-standards.md
3. Listar tokens/brands/            — a marca já existe? (Regra 1: verificar antes de criar)
4. Escolher o id: kebab-case, curto, sem "brand"/"theme" no nome
   (`vibrant`, `pay` — não `brand-vibrant`, não `tema-cliente-x`)
```

## Se o usuário trouxe um handoff (briefing/tokens.json/THEME.md)

Trate como **referência, não como spec**: quase sempre vem de outro projeto, com
outra nomenclatura e outra arquitetura semântica.

- Extraia a **intenção** e os **valores primitivos** (a rampa, os neutros).
- **Não** copie mapeamento semântico de nome-por-nome: os papéis do iGreen DS
  (`bg.canvas`/`surface`/`subtle`/`muted`, `fg.default`/`strong`/`muted`/`subtle`)
  raramente casam 1:1 com os de fora.
- Se o handoff tiver um `semanticExample` (ou equivalente), **leia como ground
  truth de aparência**, mesmo que diga "não implementar" — esse aviso quase sempre
  significa "não crie nomes de token paralelos", não "ignore o mapeamento". Na
  `vibrant` eu li como "ignore" e errei canvas, surface e 3 papéis de `fg`.
- Arquive o handoff em `.ai/specs/brand-<id>-handoff/` com um README dizendo de
  onde veio e **onde a implementação divergiu de propósito**.

## Definição de Pronto

Nenhuma marca está pronta com menos que isto (a lista completa, com comandos, está
em `generate.md`):

- [ ] `tokens/brands/<id>/` com `primitives/color-palette.ts` + `semantic/color-{light,dark}.ts`
- [ ] script `tokens:brand:<id>` no `package.json` + `src/styles/theme/brand-<id>.css` gerado
- [ ] `@import` no `src/styles/globals.css`
- [ ] `Brand` type + `BRANDS` em `src/hooks/useBrand.ts`
- [ ] `exports` do `package.json` → `./theme/brand-<id>.css` (o build **falha** sem isto)
- [ ] item `theme-<id>` no `registry.json`
- [ ] `BRAND_LABELS` em `cli/src/create.js`
- [ ] `npm run cli:rebake` (baka o overlay no template — o prompt do CLI lê essa pasta)
- [ ] `PALETAS` em `src/preview/pages/ColorsDoc.tsx`
- [ ] `cli/templates/default/_claude/rules/ds-themes.md` (vocabulário do consumidor)
- [ ] **verificação no browser nos 2 modos** (Fase 5) — com valores resolvidos, não os do TS
- [ ] `pipeline-state.md` com a Assumption central da marca

Distribuição (`registry:build`, bump, publish) **não** vai neste PR — consolida no
`/ds-release`. Anote no PR body que falta registrar.

## Handoff

Termina como todo trabalho de componente/token: branch → commit descritivo → push →
`gh pr create` → **reportar o link e parar** (Regra 8 / L-041). Merge e publish são
do mantenedor.
