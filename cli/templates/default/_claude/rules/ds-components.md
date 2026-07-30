---
description: Vocabulário de componentes do iGreen DS — QUAL usar pra cada tarefa, e por quê
globs: ["**/*.tsx", "**/*.styles.ts"]
alwaysApply: true
---

# Que componente usar (iGreen DS)

Os nomes abaixo são os **ids do registry**. Para trazer um: `npm run igreen:add -- <id>`
— exceto em **modo submódulo** (existe `.claude/ds-config.json` com `"mode": "submodule"`),
onde tudo já está no disco em `<dsPath>/src` e você só importa pelo `importBase`.

**Onde está a API** (não invente props — nenhuma das duas fontes é sua memória):

- **Compostos do iGreen** (`components/ui/<Nome>/`) vêm com **`USAGE.md` ao lado** — props,
  variants, gotchas. Leia antes de compor.
- **Primitivos** (`components/shadcn/`) **não** têm USAGE: a API é a padrão shadcn/Radix, e
  eles já chegam re-estilizados nos tokens do DS. Consulte o catálogo visual.

Catálogo visual: **https://igreen-desingsystem-admin.vercel.app**.

> Não existe "componente shadcn" vs "componente iGreen" pra você: todos chegam por
> `@igreen/<nome>` e todos já seguem os tokens do DS. Escolha pela tarefa, não pela origem.

> **Escopo desta regra: QUAL componente.** Como estilizar (tokens, spacing, foco, cor,
> tipografia) está em `ds-design.md` — deliberadamente não repetido aqui, pra as duas
> regras não divergirem.

## Formulário

`form-field` é wrapper **obrigatório** de todo campo — nunca `<label>` cru (ele cuida de
label, helper, erro e do `htmlFor`).

| Precisa de | Use |
|---|---|
| texto curto / longo | `input` · `textarea` |
| escolher de uma lista | `select` — muitas opções + busca → `combobox` |
| liga/desliga | `switch` (aplica na hora) · `checkbox` (confirma no submit) |
| escolha em bloco visual | `card-checkbox` (label nativo envolvendo o checkbox) |
| uma entre várias | `radio-group` |
| data | `date-picker` — `mode`: `single` (default) · `range` · `multiple` |
| só mês/ano | `month-year-picker` |
| arquivo | `file-upload-field` |
| código / OTP | `input-otp` |
| cor | `color-picker` |
| faixa numérica | `slider` |
| prefixo, sufixo, ícone ou botão **dentro** do campo | `input-group` — não componha na mão |

## Abas e alternância de visão

- `tabs` — navegar entre **seções de conteúdo**. `variant` no `<Tabs>` (propagada por
  contexto, não no List/Trigger): `"segmented"` (default, pill) · `"line"` (underline).
- `button-group` — ações relacionadas lado a lado; uma dispara, **não guarda estado**.
- `toggle-group` — modo ou filtro que **persiste** · `toggle` para um só, on/off.
- ⚠️ Alternar tabela ↔ cards dos **mesmos dados** não é nenhum dos três: é `viewMode`
  do `data-table` (com `listConfig`). Não monte duas telas paralelas.

## Feedback e estado

| Situação | Use |
|---|---|
| notificação rica (title, description, ação) | `toast` — **prefira este** |
| toaster cru | `sonner` — monte `<Toaster/>` 1× no root; o `toast` roda sobre ele |
| aviso fixo dentro da página | `alert` |
| confirmar ação destrutiva | `alert-modal` — **obrigatório** antes de excluir, nunca delete direto |
| sem dados / primeira vez | `empty-state` |
| carregando layout / ação | `skeleton` (silhueta) · `spinner` (pontual) |
| progresso conhecido | `progress` |

## Sobreposição (o que cobre a tela)

| Quando | Use |
|---|---|
| clique, ancorado, conteúdo curto | `popover` |
| lista de ações a partir de um gatilho | `dropdown-menu` |
| clique com o botão direito | `context-menu` |
| hover: dica de 1 linha / prévia rica | `tooltip` · `hover-card` |
| **bloqueia** a página, centralizado | `modal` (body já rola sozinho — não trate scroll no children) |
| **bloqueia**, lateral, mais espaço que o modal | `panel` (560px default) · `sheet` · `drawer` (mobile, gesto) |
| **não** bloqueia — coexiste com a lista atrás, resizável | `floating-panel` |
| diálogo cru, sem o chrome do DS | `dialog` · `alert-dialog` |

Todo flutuante já segue a mesma receita visual (superfície frosted, radius 12,
`shadow-sh-lg`). Não re-estilize.

## Dados em grade e lista

| Precisa de | Use |
|---|---|
| grade com colunas: filtros, visões, seleção, kanban, virtualização | `data-table` — o completo |
| tabela simples, sem inteligência | `table` |
| rodapé de paginação/page-size/contagem | `footer-table` — já embutido no `data-table` |
| lista de **cards** com filtros, visões, hierarquia/árvore | `data-list` |
| lista de cards simples | `list` |
| quadro por status/etapa | `kanban` — ou `viewMode: "kanban"` do `data-table` |
| paginar algo que não é tabela | `pagination` |

## Layout e chrome do app

- `app-shell` — a casca (rail de módulos + header + área de conteúdo).
- `header` — barra superior de 60px (breadcrumb, busca, tema, usuário) dentro do shell.
- `menu-sidebar` — menu lateral com rail + contextos · `single-menu-sidebar` — nível único.
- `page-header` — título + ações + breadcrumb **dentro** do body.
- `card` — container de conteúdo · `separator` · `scroll-area` (scroll estilizado) ·
  `aspect-ratio`.
- Esconder/mostrar conteúdo: `accordion` (várias seções abrindo) · `collapsible` (uma) ·
  `carousel` (deslizar horizontal).

## Métrica e gráfico

- `kpi` — `Kpi` / `KpiGroup` / `KpiDelta` para cards de métrica e faixas de indicadores.
- `chart` — wrapper do Recharts (barras, linha, área, pizza, radar, radial).
- `choropleth-map` — mapa por região colorido por valor (traz `d3-geo` como dependência).

## Identidade, status e navegação

- `avatar` — foto com fallback · `avatar-ig` — badge de iniciais com presets de cor do DS
  (escolhe preto/branco por contraste WCAG quando recebe hex).
- `badge` — rótulo estático · `chip` — pílula de status/tag/filtro, pode ser interativa.
- `icon` — ícones do DS, incluindo o set de marca `igreen-*`.
- `breadcrumb` · `menubar` (barra de menus estilo desktop) · `navigation-menu` (mega-menu).
- `label` — só fora de formulário; **dentro** de form quem cuida é o `form-field`.

## Comando e texto

- `command` — paleta de comandos / busca com teclado (⌘K).
- `markdown-text` — renderizar markdown (chat, descrições vindas de API).
- `calendar` — calendário inline; para **campo** de data use `date-picker`.
- `button` — ação. Variações (cor, tamanho, ícone, loading) na própria API; ver o USAGE.

---

**Não achou o que precisa?** Antes de compor na unha, confira o catálogo visual. E para
**telas inteiras** não escolha componente a componente: use `/ds-create-crud` (tabela),
`/ds-create-list` (cards) ou `/ds-create-dashboard` (painel) — eles entrevistam e montam a
tela no padrão, e existem `example-*` prontos pra adaptar. Adaptar sempre ganha de escrever
do zero.
