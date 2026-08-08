# Usar o iGreen DS como submódulo — mesmas skills do CLI/npm

Se você consome o iGreen Design System como **git submódulo** (uma subpasta do seu
projeto, ex.: `design-system/`), o Claude Code **não enxerga** as skills/commands do DS
sozinho — ele só auto-descobre `.claude/` na **raiz** do seu projeto, não desce pra
`design-system/.claude/`. Isso é normal: submódulo é só um apontamento externo.

O `ds-link` resolve isso: projeta o kit de skills/commands/rules do DS pra dentro do
`.claude/` do **seu** projeto — o mesmo kit que o CLI npm instala. Depois disso você tem
`/ds-create-crud`, `/ds-create-list`, `/ds-create-dashboard` etc. descobríveis
nativamente, gerando telas no padrão do DS.

## Setup (uma vez)

Na **raiz do seu projeto** (a pasta que contém o submódulo):

```bash
# ajuste "design-system" pro caminho real do submódulo no seu repo
npm --prefix design-system run ds:link
# ou, equivalente:
node design-system/scripts/ds-link.mjs
```

O que ele faz:

- Copia `cli/templates/default/_claude` → `.claude/` do seu projeto (skills, commands,
  rules). **Não** sobrescreve arquivos seus que colidam (avisa; use `--force` se quiser).
- Escreve `.claude/ds-config.json` (`mode: "submodule"`) — as skills leem isso e passam a
  **ler componentes/exemplos direto do disco** (`<submódulo>/src`), sem `igreen:add`/registry.
- Detecta o **alias de import** no seu `tsconfig`/`vite.config` (o que aponta pra
  `<submódulo>/src`). Se não achar, usa `@ds` e avisa pra você confirmar.
- Adiciona um bloco gerenciado no seu `CLAUDE.md` (cria se não existir) com os pointers.

### Pré-requisito: DOIS aliases, não um

Este é o passo que mais quebra — e quebra **alto**, no primeiro componente que você importar.

**1. `@ds` — o alias que VOCÊ usa.** As skills geram imports como
`@ds/components/ui/DataTable`.

**2. `@` — o alias que o DS usa INTERNAMENTE.** Os arquivos do DS importam entre si por
`@/components/…`, `@/lib/utils`, `@/utils/tv`, `@/hooks/…` — **700 imports** no total. Esse
`@` significa "a `src` do DS". Nos outros canais isso se resolve sozinho (no copy-in os
arquivos viram seus e `@/` é o seu `src`; no npm o bundler resolve dentro do pacote), mas no
submódulo **ninguém mapeia esse alias por você**. Sem ele:

```
error TS2307: Cannot find module '@/utils/tv'
[vite]: Rollup failed to resolve import "@/lib/utils"
```

Com o submódulo em `design-system/`:

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@ds/*": ["design-system/src/*"],
      "@/*":   ["design-system/src/*"]   // ← o alias INTERNO do DS
    }
  }
}
```

```ts
// vite.config.ts
resolve: {
  alias: {
    "@ds": path.resolve(__dirname, "design-system/src"),
    "@":   path.resolve(__dirname, "design-system/src"),   // ← idem
  },
}
```

⚠️ **E se o seu projeto já usa `@/` pro próprio código?** Aí há colisão real, e você escolhe:

- **Renomeie o seu** (`@app/*` → `./src/*`) e deixe `@/*` pro DS. É o caminho mais simples e
  o que menos surpresa gera depois.
- **Ou mapeie só os 5 prefixos que o DS usa** — `@/components/*`, `@/lib/*`, `@/utils/*`,
  `@/hooks/*`, `@/config/*` → `design-system/src/*`, mantendo `@/*` no seu `src`. Funciona,
  mas se você tiver o seu próprio `@/components` ou `@/lib`, a colisão volta.

Não existe terceira opção: o DS não pode abrir mão do `@/` interno sem reescrever 700
imports, e é o mesmo alias que faz os outros 3 canais funcionarem.

## Dependências — o passo que faltava aqui

O submódulo entrega **código-fonte**, não um pacote: as dependências dele **não vêm junto**.
Sem elas o build quebra em `failed to resolve "tailwind-variants"` — medido num smoke test de
submódulo real em 2026-08-08, quando esta seção não existia.

O mínimo pra um `Button` + `Modal`:

```bash
npm i tailwind-variants tailwind-merge clsx lucide-react \
      @radix-ui/react-dialog @radix-ui/react-slot
```

Componente novo pode pedir mais (`@tanstack/react-virtual` no DataTable, `recharts` no Chart,
`@dnd-kit/*` no Kanban, `cmdk` no Combobox). A lista completa está em `dependencies` do
`package.json` do DS — **49 pacotes**, mas você só precisa dos que os componentes que usar
importarem. O erro do bundler diz exatamente qual falta.

## Fonte Geist — copie os arquivos

O `@font-face` viaja no `tailwind-theme.css`, mas ele aponta pra `/fonts/*.woff2` — caminho
relativo à **raiz do site**, não ao submódulo. Os arquivos precisam estar no seu `public/`:

```bash
mkdir -p public/fonts
cp design-system/public/fonts/*.woff2 public/fonts/
```

⚠️ **Sem isso a falha é silenciosa**: o `font-family` continua dizendo `Geist`, o navegador
tenta buscar o arquivo, recebe o `index.html` do dev server e a fonte cai em system-ui — sem
erro no console, sem build quebrado. Medido: a `FontFace` fica com `status: "error"` e todos
os 27 presets tipográficos do DS renderizam na fonte errada.

Pra conferir, no console do navegador:

```js
document.fonts.check("16px Geist")   // tem que ser true
```

## `@source` — você NÃO precisa

Ao contrário do canal npm, submódulo **não** precisa da diretiva `@source`. O Tailwind v4
escaneia a raiz do projeto, e o submódulo fica **dentro** dela — então as classes do DS são
encontradas sozinhas. (No npm é diferente: `node_modules` é excluído do scan de propósito.)

## Windows — path longo

`git submodule add` pode falhar com `Filename too long` se o projeto estiver num caminho
fundo: o arquivo mais longo do DS tem 101 caracteres, e o limite do Windows é 260 no total.
Se acontecer:

```bash
git -c core.longpaths=true submodule add <url> design-system
```

## Depois de atualizar o submódulo

Ao dar `git submodule update --remote` (ou `git pull --recurse-submodules`), **re-rode** o
link pra ressincronizar as skills com a versão nova:

```bash
node design-system/scripts/ds-link.mjs
```

É idempotente. Arquivos obsoletos (skills removidas upstream) são limpos automaticamente.

## Tema de marca

Em modo submódulo **não há nada pra instalar** — o repo inteiro está no disco, então o
overlay de cada marca já existe. Só importar e ativar:

```css
/* seu src/index.css — ajuste o caminho pro submódulo */
@import "tailwindcss";
@import "../design-system/src/styles/theme/tailwind-theme.css";   /* base, obrigatório */
@import "../design-system/src/styles/theme/brand-vibrant.css";     /* a marca */
```
```html
<html lang="pt-BR" data-theme="vibrant">
```

Marcas disponíveis: `default` (é o tema-base, sem overlay — ativa removendo o atributo) ·
`blue` · `green` · `pay` · `vibrant`.

⚠️ **Dois fatos que causam quase todo erro aqui:** (1) importar o CSS **não** ativa nada —
sem `data-theme` no `<html>` o overlay fica inerte e não há erro; (2) o overlay tem que vir
**depois** do `tailwind-theme.css`, senão o base ganha por ordem de fonte.

Tema novo chega junto com `git pull` no submódulo — nenhum passo extra. O `ds-link` projeta
a rule `ds-themes` pro seu `.claude/`, então a IA do seu projeto sabe fazer essa troca sem
você explicar. Guia completo na página **Temas de marca** do catálogo.

## Opções

```bash
node design-system/scripts/ds-link.mjs --alias @ds     # força o alias
node design-system/scripts/ds-link.mjs --target ../app # raiz do pai (default: cwd/INIT_CWD)
node design-system/scripts/ds-link.mjs --force         # sobrescreve colisões
node design-system/scripts/ds-link.mjs --dry           # mostra sem escrever
node design-system/scripts/ds-link.mjs --unlink        # desfaz tudo que o ds-link instalou
```

## Fallback (sem rodar o script)

Se não puder rodar o `ds-link`, cole no início da sessão do Claude Code, na raiz do
projeto:

```
Este projeto consome o iGreen DS como submódulo em design-system/. Antes de qualquer
tarefa de UI, leia design-system/CLAUDE.md e design-system/.claude/rules/ds-standards.md.
Para criar telas, siga as skills em design-system/.claude/skills/ (crud-builder,
list-builder, dashboard-builder) como instruções autoritativas — não improvise fora
delas. Componentes ficam em design-system/src; importe via o alias que aponta pra essa
pasta. NÃO rode igreen:add (não é copy-in; leia os componentes/exemplos direto do disco).
```

Funciona, mas é manual por sessão e as skills não ficam descobríveis por slash command —
por isso o `ds-link` é o caminho recomendado.
