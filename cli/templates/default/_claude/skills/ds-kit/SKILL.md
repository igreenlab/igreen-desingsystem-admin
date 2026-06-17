---
name: ds-kit
description: >
  Orquestrador de construção de telas com o iGreen DS. Use SEMPRE que o usuário
  pedir pra montar/criar uma tela, página, lista, tabela, CRUD, formulário, tela
  de edição/cadastro, detalhamento/ficha, dashboard, painel, gráfico, financeiro
  ou "uma tela igual ao exemplo X". Identifica a intenção e roteia pro fluxo
  certo (skill guiada ou exemplo pra copiar), aplicando os padrões de DESIGN.md.
---

# ds-kit — Orquestrador de telas (iGreen DS)

Você identifica **o que** o usuário quer montar e roteia pro caminho certo. Não
gera a tela inteira de memória: ou delega pra uma skill guiada, ou puxa o
**exemplo** canônico e adapta. Sempre seguindo `DESIGN.md` (raiz) +
`src/components/ui/<Nome>/USAGE.md`.

## Passo 1 — Classifique a intenção

| Sinais na fala do usuário | Rota |
|---|---|
| "tabela", "lista", "listagem", "crud", "grid de dados", "datatable" | → **CRUD** (skill `crud-builder` / `/ds-create-crud`) |
| "formulário", "cadastro", "tela de edição", "editar X", "novo X" | → **Edição** (exemplo `example-edit-page` + `FormField`) |
| "detalhe", "detalhamento", "ficha", "página de X com abas" | → **Detalhe** (exemplo `example-order-detail`) |
| "dashboard", "painel", "visão geral", "KPIs", "gráfico", "chart" | → **Dashboard** (exemplo `example-dashboard` + `USAGE` do `Chart`) |
| "financeiro", "extrato", "saldo", "transações" | → **Financeiro** (exemplo `example-finance`) |
| "drawer/painel de criar/editar/detalhe" | → **Drawers** (padrão do `example-finance`: NovoClienteDrawer / FinanceDetailPanel) |
| "igual ao exemplo de <X>", "estrutura do <X>" | → puxar `example-<X>` e adaptar |
| cabeçalho, shell, menu lateral, topbar | → componentes `page-header` / `app-shell` / `menu-sidebar` / `header` |

Em dúvida entre 2 rotas, **pergunte 1 coisa** ("é uma listagem de dados ou um formulário de cadastro?") antes de agir.

## Passo 2 — Execute a rota

**CRUD (o principal, fluxo guiado):** carregue `.claude/skills/crud-builder/SKILL.md` e siga a entrevista → blueprint (gate) → geração. É question-driven: pergunta colunas, filtros, views, kanban etc. NÃO pule o gate.

**Demais rotas (baseadas em exemplo):**
1. Puxe o exemplo: `npm run igreen:add -- example-<x>` (traz a tela + componentes).
2. **Leia** o arquivo puxado (`src/examples/<x>/...`) e o `USAGE.md` dos componentes que ele usa.
3. Adapte ao caso do usuário (campos, dados, textos) — preservando a estrutura/espaçamento do exemplo.
4. Renderize a tela no roteador/local que o usuário indicar, dentro de um wrapper com altura (ver DESIGN.md "Anatomia").
5. `npx tsc --noEmit` limpo antes de entregar.

## Passo 3 — Sempre aplique os padrões

- `DESIGN.md` (raiz): anatomia de tela, ritmo de espaçamento (24px pós-PageHeader, `gap-form-gap` em form), do/don't, responsividade.
- `.claude/rules/ds-design.md` já está auto-carregado (regras duras).
- API do componente = `USAGE.md` ao lado dele. Nunca inventar prop/variante.

## Princípio

Cada tipo de tela tem um **exemplo de produção** como referência viva (extração 1:1 dos showcases). O melhor código é o exemplo adaptado — não o escrito do zero. Sua função é levar o usuário ao exemplo/skill certo e garantir que o resultado siga o DESIGN.md.

> Crescível: novos tipos de tela entram como nova linha na tabela do Passo 1 + (se guiado) nova skill em `.claude/skills/`. Mantenha este roteador curto.
