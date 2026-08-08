---
description: Os 4 canais de consumo do iGreen DS e o que cada um alcança — nenhum é depreciado
globs: ["**/*.tsx", "**/*.ts", "**/package.json", "**/*.css"]
alwaysApply: true
---

# Canais de consumo do iGreen DS

**Os 4 canais são suportados. Nenhum é depreciado.** Se você leu em algum lugar que npm ou
submódulo estão descontinuados, está errado — e vale corrigir a fonte.

| canal | como | alcance |
|---|---|---|
| **copy-in** (registry shadcn) | `npm run igreen:add -- <nome>` | **tudo** — o código vira seu |
| **npm** | `npm i @snksergio/design-system` | os 42 componentes `ui/` + **3** dos 41 primitivos shadcn (ver limitação abaixo) |
| **submódulo git** | `git submodule add` + alias no tsconfig | **tudo** — o repo inteiro está no disco |
| **scaffold** | `npm create @snksergio/design-system` | gera projeto copy-in já configurado (+ prompt "Tema de cor?") |

## ⚠️ A limitação real do canal npm — medida, não estimada

O pacote npm entrega **os 42 componentes `ui/`** (Button, DataTable, FormField, AppShell,
Modal, Panel, Kpi, Chart…) e os hooks (`useBrand`, `useTheme`), mas **apenas 3 dos 41
primitivos shadcn**: `Badge`, `Input`, `InputGroup`.

Os outros 38 — `Dialog`, `Select`, `Tabs`, `Popover`, `Tooltip`, `Card`, `Checkbox`,
`Switch`, `Slider`, `Accordion`, `Command`, `Calendar`, `Sheet`, `Drawer`, `Skeleton` etc. —
**viajam no tarball mas não são importáveis**: não estão no barrel e o `exports` do
`package.json` não expõe subpath pra eles. Deep import falha com
`ERR_PACKAGE_PATH_NOT_EXPORTED`.

**Na prática, consumindo por npm:** pegue os primitivos que faltam direto do shadcn oficial
(`npx shadcn add dialog`) — o `index.css` tem o bridge shadcn→iGreen, então eles nascem
tematizados. Ou consuma por copy-in/submódulo, que alcançam tudo.

## Submódulo — o canal com pipeline de IA

O submódulo é o único que traz o **kit de IA do DS** pro projeto pai. O Claude Code só
descobre `.claude/` na raiz do cwd, então o DS projeta o payload pra lá:

```bash
cd <repo-do-DS>
npm run ds:link            # projeta .claude/ no repo pai + gera ds-config.json
npm run ds:link -- --unlink   # desfaz
```

Idempotente — re-rode depois de `git pull` no submódulo. As skills do kit leem
`.claude/ds-config.json` (`"mode": "submodule"`), resolvem o `importBase` e **não** chamam
`igreen:add`: leem componentes e exemplos direto de `<dsPath>/src`.

## Nunca faça

- Afirmar que um canal é depreciado sem conferir. O `package.json` do DS tem um campo
  `"//distribuicao"` que diz qual é primário e qual é secundário — **secundário ≠ depreciado**.
- Concluir "o DS não suporta npm" a partir de doc de projeto **copy-in**. O `CLAUDE.md` de um
  projeto scaffold descreve **aquele projeto**, não o Design System.
- Misturar canais no mesmo projeto sem necessidade: copy-in + npm dá dois `Button` diferentes
  em árvores diferentes.
