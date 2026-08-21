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
| **npm** | `npm i @snksergio/design-system@latest` | **41 dos 42** componentes `ui/` + **os 41** primitivos shadcn (subpath `/shadcn`) |
| **submódulo git** | `git submodule add` + **dois** aliases no tsconfig/vite | **tudo** — o repo inteiro está no disco (ver os 3 passos abaixo) |
| **scaffold** | `npm create @snksergio/design-system@latest` | gera projeto copy-in já configurado (+ prompt "Tema de cor?") |

### E o kit de IA — qual canal traz o `.claude/`

O que faz a IA montar tela no padrão é o payload em `.claude/` (orquestrador `ds-kit`,
skills de tela, rules auto-carregadas, hook de integridade). Ele **não** vem por todo canal:

| canal | kit | hook ativo | como obter |
|---|:---:|:---:|---|
| **scaffold** | ✅ | ✅ | já vem no projeto gerado (com `settings.json`) |
| **submódulo** | ✅ | ⚠️ 1 passo | `npm --prefix <submodulo> run ds:link` — projeta no `.claude/` do pai; o hook vem, mas **você registra** (o `ds:link` imprime o snippet) |
| **copy-in** | ⚠️ | ✅ | `npx @snksergio/create-design-system@latest --only-kit` na raiz do projeto |
| **npm** | ⚠️ | ✅ | mesmo comando acima, **mas leia a ressalva** |

⚠️ **Por que o submódulo tem coluna própria pro hook.** O `settings.json` — que é o que
*registra* um hook — é do **seu** projeto, e o `ds:link` não o sobrescreve: apagaria a sua
config. Então ele projeta `.claude/hooks/protect-ds.mjs` e **imprime o bloco pra você
colar**. Enquanto não colar, o arquivo está lá e não roda: nada avisa se o tema do DS for
editado dentro do submódulo, e o seu código não passa por lint de estilo.

> Até 2026-08-18 esta tabela marcava submódulo **✅** e o texto acima listava "hook de
> integridade" como parte do kit — mas o `ds:link` **excluía os hooks inteiros**. Quem lesse
> isto (IA inclusive) concluía que havia rede de segurança onde não havia nenhuma.

⚠️ **Ressalva do canal npm.** As skills assumem copy-in: elas rodam
`npm run igreen:add -- <item>` pra puxar componente e exemplo, e o método delas é *"puxe o
`example-*` e adapte"*. Se você consome só por npm, não tem `igreen:add` e não pode editar
o exemplo — ele vem buildado. O kit instala e as rules valem (tokens, anti-patterns,
vocabulário), mas os builders vão te pedir um comando que você não tem.

Por que o npm não pode receber o kit automaticamente: o Claude Code só descobre `.claude/`
na **raiz do cwd**. Pacote em `node_modules` não tem como fornecer um `.claude/`
descobrível — não é omissão no `files`, é restrição de mecanismo.

⛔ **Em projeto com submódulo, o `--only-kit` RECUSA** e aponta o `ds:link`. Não é
capricho: o `ds:link` detecta o alias do seu tsconfig/vite e escreve `ds-config.json` com
`mode` + `importBase`, e é isso que faz as skills lerem do disco em vez de chamar
`igreen:add`. Sem o config, você receberia instrução inaplicável.

## O alcance real do canal npm — medido, não estimado

Desde a **0.37.0** o pacote npm entrega **duas entradas**:

```ts
// raiz — 41 dos 42 componentes ui/ + os hooks
import { Button, DataTable, AppShell, Chart, DataList, List, toast, useBrand } from "@snksergio/design-system";

// subpath — os 41 primitivos shadcn adaptados
import { Dialog, Select, Tabs, Popover, Tooltip, Card, Calendar } from "@snksergio/design-system/shadcn";
```

Duas entradas e não uma porque os primitivos são 41 arquivos / 233 nomes, e o consumidor
típico usa 3 ou 4: no mesmo barrel, todo `import` do pacote arrastaria Radix + cmdk + vaul +
embla + input-otp + sonner antes de o bundler conseguir podar. Quem não importa `/shadcn`
não paga nada.

**O único componente `ui/` fora do npm é `TabelaTeste`** — demo interno do showcase,
excluído de propósito. `Chart`, `DataList`, `List` e `Toast` entraram na 0.37.0; antes disso
o barrel tinha 37 e a doc dizia 42.

⚠️ Em versões **< 0.37.0**, `import { ChartContainer } from "@snksergio/design-system"`
falha e não há subpath `/shadcn`. Se o import não existir, confira a versão instalada antes
de procurar outra causa.

## Submódulo — o canal com pipeline de IA

O submódulo é o único que traz o **kit de IA do DS** pro projeto pai. O Claude Code só
descobre `.claude/` na raiz do cwd, então o DS projeta o payload pra lá:

```bash
# rode da RAIZ DO REPO PAI (a pasta que contém o submódulo), não de dentro do DS —
# o script aborta se o alvo for a própria raiz do DS.
npm --prefix design-system run ds:link       # ajuste "design-system" pro caminho real
# ou, equivalente:
node design-system/scripts/ds-link.mjs
node design-system/scripts/ds-link.mjs --unlink   # desfaz
```

Idempotente — re-rode depois de `git pull` no submódulo. As skills do kit leem
`.claude/ds-config.json` (`"mode": "submodule"`), resolvem o `importBase` e **não** chamam
`igreen:add`: leem componentes e exemplos direto de `<dsPath>/src`.

### ⚠️ Os 3 passos que o submódulo NÃO faz por você

Nenhum é opcional. O 1º e o 2º quebram o build alto; o 3º falha em **silêncio**.

1. **O alias INTERNO do DS (`@`).** Os arquivos do DS se importam por `@/components/…`,
   `@/lib/utils`, `@/utils/tv` — **700 imports**. Esse `@` significa "a `src` do DS". Além do
   `@ds` que você usa, mapeie também:
   ```jsonc
   // tsconfig.json — paths RELATIVOS e SEM baseUrl (removido no TypeScript 7)
   "paths": { "@ds/*": ["./design-system/src/*"], "@/*": ["./design-system/src/*"] }
   ```
   Sem isso: `Cannot find module '@/utils/tv'` no 1º componente. Já usa `@/` pro seu código?
   Renomeie o seu (`@app/*`).

2. **As dependências.** O submódulo entrega código-fonte, não pacote — as 49 `dependencies`
   do DS não vêm junto. Instale de uma vez, em vez de descobrir uma por build:
   ```bash
   npm i $(node -p "Object.entries(require('./design-system/package.json').dependencies).map(([k,v])=>k+'@'+v).join(' ')")
   ```
   ⛔ **Na RAIZ.** `npm install` dentro de `design-system/` cria um segundo `node_modules`
   com outra cópia de React e de `@types/react` → `Invalid hook call` em runtime e
   `Two different types with this name exist` no `tsc`. Já rodou? Apague a pasta
   `design-system/node_modules`, restaure o lockfile dele
   (`git -C design-system checkout -- package-lock.json`) e mantenha
   `resolve.dedupe: ["react", "react-dom"]` no vite.

3. **Os arquivos da fonte Geist.** O `@font-face` viaja no tema, mas aponta pra
   `/fonts/*.woff2` — raiz do **site**:
   ```bash
   mkdir -p public/fonts && cp design-system/public/fonts/*.woff2 public/fonts/
   ```
   Sem isso não há erro: cai em system-ui. Confira com `document.fonts.check("16px Geist")`.

### Onde cada componente mora (submódulo ≠ copy-in)

O submódulo lê o **repo** do DS, cujo layout é diferente do copy-in:

| | caminho | exemplo |
|---|---|---|
| compostos (42) | `<alias>/components/ui/<Nome>` | `@ds/components/ui/DataTable` |
| primitivos shadcn (41) | `<alias>/components/shadcn/<nome>` | `@ds/components/shadcn/tabs` |
| exemplos | `<alias>/examples/<nome>` | `@ds/examples/finance` |

O `ds-config.json` traz os dois primeiros como `importBase` e `primitivesBase`.

## Nunca faça

- Afirmar que um canal é depreciado sem conferir. O `package.json` do DS tem um campo
  `"//distribuicao"` que diz qual é primário e qual é secundário — **secundário ≠ depreciado**.
- Concluir "o DS não suporta npm" a partir de doc de projeto **copy-in**. O `CLAUDE.md` de um
  projeto scaffold descreve **aquele projeto**, não o Design System.
- Misturar canais no mesmo projeto sem necessidade: copy-in + npm dá dois `Button` diferentes
  em árvores diferentes.
