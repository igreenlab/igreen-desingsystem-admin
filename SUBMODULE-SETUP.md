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

### Pré-requisito: o alias de import

As skills geram imports como `@ds/components/ui/DataTable`. Garanta que seu
`tsconfig.json` (e o `vite.config` / bundler) tenha o alias apontando pra `src` do
submódulo. Exemplo com o submódulo em `design-system/`:

```jsonc
// tsconfig.json
{ "compilerOptions": { "paths": { "@ds/*": ["design-system/src/*"] } } }
```

```ts
// vite.config.ts
resolve: { alias: { "@ds": path.resolve(__dirname, "design-system/src") } }
```

Se você já usa `@/` apontando pra outro lugar, escolha um alias livre (`@ds` é o default) e
rode com `--alias @ds`.

## Depois de atualizar o submódulo

Ao dar `git submodule update --remote` (ou `git pull --recurse-submodules`), **re-rode** o
link pra ressincronizar as skills com a versão nova:

```bash
node design-system/scripts/ds-link.mjs
```

É idempotente. Arquivos obsoletos (skills removidas upstream) são limpos automaticamente.

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
