# Spec — Navegação do Virtual Proposta (SingleMenuSidebar + módulos)

> Primeiro item de reconstrução do Virtual Office no projeto `virtual-proposta`.
> Objetivo: substituir o menu atual (6 grupos / ~20 itens num scroll só, misturando
> info pessoal/rede com info de segmento + duplicando itens) por uma navegação
> **por contexto (módulo)**, usando o `SingleMenuSidebar` do iGreen DS.
> Tudo mockado. Contexto do produto: `projeto/CONTEXTO-VIRTUAL-OFFICE.md`.

## Problema

O menu legado (print do usuário) mistura:

- **Geral/pessoal/rede** (Painel do Líder, Rede, Pro Maker, Mapa de Rede, Líder PRO,
  Análise de Rede/Retenção, Estatísticas, Rotinas, CRM, iGreen Digital, Conexão Express)
- **Segmento** (Clientes Green=Energia, Telecom, Seguros)

…e ainda **duplica** "Mapa de Clientes" e "Extrato Bônus" (uma vez em Relatórios = Energia,
outra no grupo Telecom). Resultado: lista longa, overflow no mobile, conceitos colidindo
("Rede" × "Mapa de Rede" × "Análise de Rede"), e nenhuma fronteira clara entre "meu/da rede"
e "do segmento X".

## Decisão central

**Seletor de módulo = contexto de navegação.** O rótulo do módulo no topo da sidebar diz
sempre onde o usuário está. 4 módulos:

1. **Geral / Liderança** (padrão) — tudo do líder e da rede dele.
2. **Energia (Green)** — segmento.
3. **Telecom** — segmento.
4. **Seguros** — segmento.

Mecanismo nativo do DS: prop `modules: SingleMenuModuleConfig[]` — cada módulo traz suas
`categories`; trocar no seletor atualiza módulo ativo + menu exibido. Controlado via
`activeModuleId` + `onModuleChange`; item ativo via `activeItemId` + `onItemClick`.

### Premissas adotadas (aprovadas: "prosseguir")

- **Extrato de Bônus geral = consolidado** (ganhos da rede toda) → Geral › Financeiro.
  O extrato de Telecom é separado (específico do segmento).
- **Segmentos normalizados** com a mesma estrutura (Dashboard · Clientes · Financeiro),
  mesmo onde hoje não existe (ex.: Seguros sem mapa/extrato próprios). Como é mockado,
  consistência de navegação > fidelidade ao estado atual.

## Estrutura de navegação (data model)

### Módulo: Geral / Liderança · `id: geral` · ícone Crown

| Categoria (id)              | Tipo      | Itens (id)                                                                                                         |
| --------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| Painel do Líder (`painel`)  | link      | —                                                                                                                  |
| Minha Rede (`rede`)         | accordion | Visão da Rede (`rede-visao`) · Mapa de Rede (`mapa-rede`) · Pro Maker (`pro-maker`)                                |
| Performance (`performance`) | accordion | Ranking da Rede (`ranking`) · Líder PRO (`lider-pro`) · Retenção (`retencao`) · Estatísticas (`estatisticas`)      |
| Financeiro (`financeiro`)   | link      | Extrato de Bônus consolidado                                                                                       |
| Ferramentas (`ferramentas`) | accordion | Rotinas de CEO (`rotinas`) · CRM (`crm`) · iGreen Digital (`igreen-digital`) · Conexão Express (`conexao-express`) |

### Módulo: Energia · `id: energia` · ícone Leaf

| Categoria                         | Tipo      | Itens                                                                         |
| --------------------------------- | --------- | ----------------------------------------------------------------------------- |
| Dashboard (`energia-dashboard`)   | link      | overview de Energia                                                           |
| Clientes (`energia-clientes`)     | accordion | Clientes Green (`energia-clientes-lista`) · Mapa de Clientes (`energia-mapa`) |
| Financeiro (`energia-financeiro`) | link      | Extrato de Bônus (Energia)                                                    |

### Módulo: Telecom · `id: telecom` · ícone Antenna

| Categoria                         | Tipo | Itens                      |
| --------------------------------- | ---- | -------------------------- |
| Dashboard (`telecom-dashboard`)   | link | overview de Telecom        |
| Clientes (`telecom-clientes`)     | link | Mapa de Clientes (Telecom) |
| Financeiro (`telecom-financeiro`) | link | Extrato de Bônus (Telecom) |

### Módulo: Seguros · `id: seguros` · ícone ShieldCheck

| Categoria                         | Tipo | Itens               |
| --------------------------------- | ---- | ------------------- |
| Dashboard (`seguros-dashboard`)   | link | overview de Seguros |
| Clientes (`seguros-clientes`)     | link | Apólices / Clientes |
| Financeiro (`seguros-financeiro`) | link | Comissões           |

## Arquitetura de implementação

Projeto novo `projeto/virtual-proposta` (vazio hoje):

- **Stack:** Vite + React 19 + TS + Tailwind v4 (espelha o `ui/` do VO atual).
- **Consumo do DS (sem publish):** alias `@` → `../../src` (DS source deste repo) e
  `~` → `./src` (app). Importa o tema gerado (`src/styles/theme/tailwind-theme.css`)
  - deps do DS (Radix, lucide, tailwind-merge, tailwind-variants, etc.).
- **Roteamento:** mock — `activeModuleId` + `activeItemId` em estado; a área de conteúdo
  renderiza um placeholder por item ("<Item> — em construção"). Sem react-router nesta
  primeira fase (entra quando começarmos as telas).

Componentes/arquivos (app):

- `src/nav/nav-data.tsx` — os 4 `SingleMenuModuleConfig` (ícones lucide, categorias, itens).
- `src/layout/AppShell.tsx` — `<SingleMenuSidebar modules activeModuleId onModuleChange
activeItemId onItemClick user logo title />` + `<main>` com o placeholder de conteúdo.
- `src/App.tsx` — estado de módulo/item + AppShell.
- mock de `user` (nome/email/avatar + ações Perfil/Sair) e `logo`.

### Comportamento

- Trocar módulo → `onModuleChange` seta `activeModuleId` **e** reseta `activeItemId` pro
  1º item do novo módulo (evita item órfão de outro contexto).
- Clicar item → `onItemClick` seta `activeItemId`; conteúdo mostra o placeholder do item.
- Sidebar dá altura ao container: shell em `h-screen` + `flex`; `<main>` `flex-1 min-h-0 overflow-auto`.
- Mobile (<md): sidebar 100% largura → tratar drawer numa fase posterior (a sidebar é dumb).

## Fora de escopo (desta fase)

- Telas reais (só placeholders de conteúdo).
- react-router / deep-link.
- Drawer mobile / responsividade fina.
- Qualquer alteração no DS (só se faltar componente → fluxo DS com gate).

## Critério de sucesso

- App `virtual-proposta` roda (`npm run dev`) consumindo o DS por alias.
- Sidebar com seletor de 4 módulos; trocar módulo troca o menu; clicar item destaca e
  troca o placeholder. Fronteira Geral × Segmento óbvia pelo rótulo do módulo.
- Zero `tsc` errors. Zero hardcode fora dos tokens DS no código do app.
