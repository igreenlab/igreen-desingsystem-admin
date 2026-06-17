---
name: cards
description: >
  Compõe cards, painéis e blocos de conteúdo soltos (KPI, info, lista, seção) com
  o iGreen DS. Use quando o usuário pedir "card", "cards", "bloco", "painel de
  conteúdo", "seções", "grid de cards" — fora do contexto de um exemplo de tela
  inteira. Guia de composição (sem exemplo de tela dedicado).
---

# cards — Composição de cards/painéis

Diferente das outras skills, esta é um **guia de composição** (não puxa um
example de tela). Cards são blocos; a tela ao redor segue `DESIGN.md`.

## Componentes-base
- `npm run igreen:add -- card` (shadcn Card: `Card`/`CardHeader`/`CardTitle`/`CardContent`/`CardFooter`) — bloco simples.
- `npm run igreen:add -- panel` (iGreen `Panel` + `CardHead`) — card com cabeçalho título+subtítulo+ação, usado em dashboards.
- Leia os respectivos `USAGE.md`. Para ver variações montadas, consulte o **showcase hospedado**: https://igreen-desingsystem-admin.vercel.app

## Padrão de composição
- Card: `bg-bg-surface border border-border-default rounded-radius-lg shadow-sh-md`, padding `p-pad-card-base` (24px).
- Grid de cards: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gp-md`.
- KPI card: label `caption-md`/`uppercase` em `fg-muted` + valor grande (`display-md`/`heading`) + opcional `Chip` de tendência. (Ver `example-dashboard`.)
- Card de seção (label/valor): título da seção `title`, linhas rótulo(`fg-muted`)+valor.
- Dark mode: sombra vira borda hairline (automático via token).

## Don't
- Não invente padding/gap avulso — `p-pad-card-base`, `gap-gp-md`.
- Não use hex; cor por token. Não empilhe cards "grudados" — `gap-gp-md` entre eles.

Aplique `DESIGN.md`. Para uma TELA inteira baseada em cards (dashboard), use a skill `dashboard`.
