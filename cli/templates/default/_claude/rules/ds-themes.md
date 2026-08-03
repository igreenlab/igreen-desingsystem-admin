---
description: Temas de marca do iGreen DS — como trocar ou adicionar um tema neste projeto (npm, submódulo ou copy-in)
globs: ["**/*.css", "**/index.html", "**/*.tsx"]
alwaysApply: true
---

# Temas de marca (iGreen DS)

O DS tem 5 marcas. Cada marca não-default é um **overlay de cor** escopado em
`[data-theme="<id>"]` que sobrescreve **só o que difere** do tema-base (~60–80 vars, não
as ~400).

| id | marca | arquivo |
|---|---|---|
| `default` | iGreen (verde padrão) | — **é** o tema-base, não tem overlay |
| `blue` | Azul | `brand-blue.css` |
| `green` | Verde (grass) | `brand-green.css` |
| `pay` | iGreen Pay | `brand-pay.css` |
| `vibrant` | iGreen Vibrant (verde fluorescente) | `brand-vibrant.css` |

## ⛔ Antes de mexer: 2 fatos que causam 90% dos erros

1. **Importar o CSS não ativa nada.** O overlay é escopado — sem
   `data-theme="<id>"` no `<html>`, nenhuma regra casa e nada muda. Não existe erro:
   falha em silêncio.
2. **Ordem de import importa.** O overlay tem que vir **depois** do `tailwind-theme.css`.
   Antes, o tema-base ganha por ordem de fonte.

Marca e claro/escuro são **eixos independentes**: `data-theme` no `<html>` + classe
`.dark`. Combinam livremente.

```html
<html data-theme="vibrant" class="dark">   <!-- vibrant, escuro -->
<html data-theme="vibrant">                <!-- vibrant, claro  -->
<html>                                     <!-- default (sem atributo) -->
```

## Trocar o tema — identifique o modo PRIMEIRO

Existe `.claude/ds-config.json` com `"mode": "submodule"`?

### Modo SUBMÓDULO

Tudo já está no disco. Só importe o arquivo que existe (ajuste o caminho pro `dsPath` do
`ds-config.json`):

```css
@import "tailwindcss";
@import "../design-system/src/styles/theme/tailwind-theme.css";
@import "../design-system/src/styles/theme/brand-vibrant.css";
```

Não rode `igreen:add` — em modo submódulo ele não se aplica. Tema novo chega com
`git pull` no submódulo.

### Modo COPY-IN (scaffold do CLI)

Cada tema é item do registry. Traga com o mesmo comando dos componentes:

```bash
npm run igreen:add -- theme-vibrant     # copia src/styles/theme/brand-vibrant.css
```

Depois importe:

```css
@import "./styles/theme/tailwind-theme.css";
@import "./styles/theme/brand-vibrant.css";
```

⚠️ O scaffold **apaga** os overlays não escolhidos no prompt "Tema de cor?". Se o arquivo
não está em `src/styles/theme/`, é porque outro tema foi escolhido na criação — traga com
o `igreen:add` acima.

### Consumindo o DS por `npm install`

```css
@import "tailwindcss";
@import "@snksergio/design-system/theme.css";                 /* obrigatório */
@import "@snksergio/design-system/theme/brand-vibrant.css";    /* a marca */
```

Requer `@snksergio/design-system` **≥ 0.31.1** — antes disso o pacote levava só o
tema-base.

## Trocar em runtime (seletor de marca)

Escreve/remove o atributo. `default` remove:

```ts
function aplicarMarca(id: string) {
  const root = document.documentElement;
  if (id === "default") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", id);
}
```

⚠️ Só funciona pras marcas cujo CSS **está no bundle**. `data-theme` com id não importado
é no-op silencioso. Se o app oferece N marcas ao usuário, importe os N overlays.

O hook `useBrand` do showcase do DS **não** é exportado no pacote — o catálogo dele é fixo
nas 5 marcas e listaria temas que este projeto não instalou. Copie a ideia, não o hook.

## Criar um tema novo

Marca muda **somente cor**. Spacing, sizing, radius, elevation e tipografia vêm sempre da
`default` — não há como uma marca alterá-los, por design. Se o pedido envolve mudar
espaçamento ou fonte "só nesta marca", **não é tema** — é outra coisa, pergunte.

Criar marca é trabalho no **repo do DS**, não aqui: 3 arquivos em `tokens/brands/<id>/`
(palette + color-light + color-dark, mesmo contrato de nomes da default) e
`npm run tokens:brand:<id>`. Neste projeto você **consome** o resultado. Se o usuário
quer uma marca que não existe, o caminho é abrir a demanda no DS — não improvisar CSS
sobrescrevendo tokens aqui (isso quebra o `protect-ds` e sai do sistema).

## Nunca faça

- Sobrescrever CSS var de tema na unha (`--color-bg-brand: ...`) pra "simular" uma marca.
  Use overlay; var solta divergem do dark, dos status e do resto do sistema.
- Duplicar o overlay dentro do projeto pra editar cor. Ele é gerado; edição some no
  próximo update.
- Aplicar `data-theme` num wrapper interno em vez do `<html>`. Os dois blocos do overlay
  (`[data-theme="x"]:not(.dark)` e `.dark[data-theme="x"]`) assumem marca e modo no MESMO
  elemento — em elementos diferentes o light vaza pro dark.
