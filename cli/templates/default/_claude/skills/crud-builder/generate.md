> **Modo submódulo (`ds-link`).** Existe `.claude/ds-config.json` com `"mode": "submodule"`?
> Então **NÃO rode `igreen:add`** — esse script não existe no seu projeto. Os componentes e
> exemplos já estão no disco em `<dsPath>/src`: importe pelo `importBase` do config
> (compostos) e pelo `primitivesBase` (primitivos shadcn), e **leia** o exemplo direto de
> `<dsPath>/src/examples/`.

# CRUD Builder — Geração

Só entre aqui após o gate aprovado. Ordem obrigatória:

## 1. Puxar do registry (componentes + exemplo canônico)

```bash
npm run igreen:add -- data-table example-clientes
# + example-finance  (se houver drawers de criar/editar/detalhe)
# + outros componentes citados no blueprint (chip, avatar-ig, etc — o registry resolve deps)
```

## 2. LER antes de escrever (precedência de fontes)

1. `src/examples/clientes/clientes-screen.tsx` — o molde real (colunas via `textColumn/currencyColumn/dateColumn/statusColumn/actionColumn`, `useMemo`, toolbar, paginação, seleção).
2. `src/components/ui/DataTable/USAGE.md` + types ao lado — API exata.
3. Pra drawers: `src/examples/finance/components/NovoClienteDrawer` e `.../FinanceDetailPanel`.

Nunca gere props de memória — copie a forma do exemplo.

## 3. Criar a página

- Caminho/rota conforme o blueprint (`PAGES_DIR`/`REGISTRO`).
- Wrapper: `<div className="flex flex-col h-full min-h-0 gap-gp-2xl">` → `<PageHeader .../>` → `<DataTable className="flex-1 min-h-0" .../>`.
- `columns` em `useMemo`; server mode ⇒ `fetchData` em `useCallback`.

### Regras de coluna (OBRIGATÓRIO — pega bugs comuns)

1. **Filtro em TODAS as colunas de dados**: cada coluna ganha `enableColumnFilter: true` + `filterType` (text→`"text"`, number/currency/percentage→`"number"`, date→`"date"`, badge/status/select→`"select"`, multiSelect/tags→`"multiSelect"`). Só ficam de fora `actions` e render-custom sem valor. ⚠️ O funil/drawer de filtros só lista colunas com `enableColumnFilter` — marcar só 2 = bug "filtra só 2 colunas".
2. **Coluna `actions` por ÚLTIMO**, `type: "actions"` (via `actionColumn`/`getActions`). É o **`type`** que dá as 3 garantias — vai pro fim (mesmo declarada no meio), **ancora à direita** (`pinned: "right"` é redundante) e **não entra no rateio** do autoFit. Coluna de botões montada na unha (`render` sem `type`) não recebe nenhuma das três: fica no meio da tabela e cresce no rateio. ⚠️ **NÃO passe `width`** (lib 0.42.0+): a largura é **derivada do nº de ações** — 1→44px, 2→74px, 3→104px, **4+ colapsam no "…"** (44px). Até a 0.41.x esta linha mandava espelhar `width: 64`; era inútil, porque o cálculo **ignorava `col.width`** nesta coluna. Agora vale, e 64px cabe **1** ícone. Split manual: `showInMenu: true` nos itens que devem ir pro menu (desliga o automático, sem limite de inline).
3. **Prefira NÃO setar `width`** nas colunas de dados — `autoFit` (default ON) distribui pra preencher o container (sem 1ª coluna esticada, sem scroll). Nunca `autoFit: false` sem motivo. **(v0.22.0+)** `col.width` virou **base/piso** (não trava fixa): o autoFit usa como mínimo e ainda distribui a sobra proporcionalmente — setar `width` em várias colunas **não** deixa mais sobra à direita. Travar de fato = `width`+`maxWidth` iguais (ou `type` fixo). Título do header **nunca trunca** (a largura mínima já inclui o `headerName`).
4. **Copiar valor** (`copyable`) — **infira, não espere que peçam**; ícone de copiar no **hover/foco** da célula + feedback "Copiado!" (~2s, `navigator.clipboard`). Critério: **o valor é um identificador que a pessoa cola em outro lugar**. ✅ documento (CPF/CNPJ/RG/IE), e-mail, telefone/WhatsApp, conta/agência/chave PIX, código de rastreio/protocolo/contrato/NF/pedido, token/hash, ID **externo**. ❌ nome de pessoa/empresa, status, data, valor monetário, quantidade, percentual, endereço em prosa. ⚠️ `id` sequencial curto (1, 2, 3) **não**; UUID/protocolo/NF **sim** — decide servir fora da tela, não a coluna se chamar "id". **Limites (verificados no código):** inerte em `actions`, na coluna de árvore e na célula em edição — marcar lá não dá erro, só não aparece; **`readMore` vence `copyable`** na mesma coluna (escolha um); copia o texto **formatado**, então numa coluna `currency` sai `R$ 1.234,56` e não `1234.56` — pro valor cru use `copyable: { value: (row) => String(row.x) }`. Texto/rótulo diferentes: `copyable: { value: (row) => "...", label: "Copiar conta" }`. **Declare no gate** as colunas em que você inferiu, pra o usuário recusar em lote — inferência silenciosa de recurso que ele não sabe que existe é surpresa, não conveniência.
5. **Grab-to-scroll é NATIVO** (`grabToScroll` default `true`, v0.26.0+): toda tabela já rola lateral ao arrastar o corpo (mouse/pen, threshold ~6px, clique/seleção preservados). Não configure — só `grabToScroll={false}` pra desligar.
6. **Filtro visível na tabela** (`showEmptyFilterChips`, v0.6.0+): pros filtros que o usuário mais usa (status, categoria, tipo, graduação…), passe `showEmptyFilterChips={["status", "categoria"]}` no `<DataTable>` → os chips nascem **vazios e clicáveis** já no load, sem abrir o menu de filtros. É o que faz o filtro **aparecer** na tela — sem isso o usuário não vê a afordância e acaba pedindo select na unha (⛔ **proibido** montar form/select acima da tabela — ver `.claude/rules/ds-components.md`). Status/segmento como eixo de navegação (poucos valores) → alternativa: **uma visão por valor** em `defaultViews` (ver item de visões abaixo). Regra de ouro: se a informação está numa coluna, **chip nativo primeiro**.

**Formato de data.** `type: "date"` renderiza `14/03/2023` e `type: "datetime"` renderiza `14/03/2023 09:30` — **com ano** (lib 0.43.0+). Precisa de outro formato (mês escrito, relativo, ISO)? Passe **`valueFormatter`** na coluna: ele vence o formato do tipo e vale na célula, no export e no clipboard. **NÃO** escreva `render` próprio só pra formatar data. ⚠️ Até a 0.42.1 esses tipos mostravam a data **sem ano** e o `valueFormatter` não chegava na célula — se você viu `render` de data em código antigo, era contorno disso.


### Padrões de CÉLULA (consistência finance — OBRIGATÓRIO)

Espelhar `finance-screen.tsx` (puxe `example-finance`). **Componente do DS sempre antes de markup manual**:

- **Coluna primária (nome)**: `isPrimary` + `render` com `<Avatar size="md">` + nome `text-body-sm font-medium` + secundária `text-caption-md text-fg-muted` (email/ID/doc) + ícone "abrir detalhe" (`<SquareArrowOutUpRight>` num `size-[24px] rounded-radius-sm border bg-bg-canvas shadow-sh-sm`) quando o row click abre painel.
- **Status / badge**: `type: "badge"` + `render` com `<Chip variant="soft" size="sm" shape="pill">` (cor semântica). Nunca pill na unha com `<span>` estilizado.
- **Avatar**: use **`avatar-ig`** (`@/components/ui/avatar-ig`), não o `avatar` (Radix puro, sem `colorHex`/`size`). `size="md"` na tabela (não `sm`). **Números/moeda/%**: `tabular-nums` + `type` (`currency`/`percentage`) + `align: "right"`. **Tags**: `type: "tags"` + `<Chip soft sm rounded>`. **Código/identificador/valor técnico** (chave de env, ID, hash, slug, path): preset **`text-code-sm`** — nunca `font-mono text-body-sm` + `tracking-*` na unha.

### Detail panel (row click → painel)

**Cite o bloco `dsgreen-paneldetail-1`** — a estrutura inteira já está resolvida e
referenciável por ID (`npm run igreen:add -- dsgreen-paneldetail-1`, ou peça
*"use a referência dsgreen-paneldetail-1"*). A referência anterior era "espelhe o
`FinanceDetailPanel`", e ela não servia aqui: aquele arquivo vive no showcase do DS e **não
existe no seu projeto** — não havia o que espelhar.

**Sempre** `<FloatingPanel>`, nunca markup solto. O que o bloco carrega:

- `titleSlot`: `<Avatar size="lg">` + nome (`text-body-md font-semibold`) + linha
  `código · <Chip status>`. ⚠️ Se você usar `Panel` em vez de `FloatingPanel`, esse header é
  impossível: lá `title`/`description` são **string**.
- `headerActions`: 1–2 ações de ícone, **todas `variant="soft"`** (`secondary` neutro,
  `success` contato, `critical` destrutivo). `ghost` no meio da fileira fica sem container e lê
  como desabilitada ao lado do maximize/close, que o componente renderiza como `soft`.
  `aria-label` obrigatório — botão de ícone não tem texto.
- `bodyPadded={false}` + **agrupar por assunto** em `<FloatingPanelSection title>`.
- 1ª seção = **métricas do registro**, em cards compactos (ícone + valor 18px + rótulo), 2 por
  linha. ⛔ **Não use `Kpi`**: ele é card de dashboard (144px de altura por célula) e come a
  primeira dobra do painel antes de qualquer campo.
- Cada dado simples = **uma linha** `<FloatingPanelField label value/>`.
- Dado que **não é** `label: valor` sai do Field: entidade com marca (banco, gestor) vira linha
  de largura cheia com `Avatar`; vários valores viram `<Chip>`; e-mail/telefone viram
  `mailto:`/`tel:` com cor de link.
- `footer`: Fechar + ação primária.
- ⛔ **Sem aba.** Se o corpo já é pilha de seções colapsáveis, o colapso **é** o mecanismo de
  esconder — ter os dois faz o usuário procurar o dado em dois lugares.

- **Tabela + Lista (toggle)**: se o usuário quer alternar entre tabela e uma **lista de cards** (não kanban), use `viewMode` + `listConfig={{ renderItem(row), paginated?, hierarchical?, getPath?, getMenuItems? }}` no próprio `<DataTable>` — mesma toolbar, toggle Tabela/Lista automático. NÃO monte um `<DataList>` paralelo + toggle na mão.
  - **Lista flat paginada**: `listConfig.paginated: true` — a lista usa a MESMA paginação da tabela + mostra o footer. Default `false` (mostra todas, sem footer); ignorado em `hierarchical`. Use quando a lista flat puder ter muitas linhas.
- ⛔ **No MÁXIMO 2 presets, e NUNCA um preset "Todos"/"Todas"**: `maxTabs` default é 3 e a aba **Default** (nativa, que já É a visão sem filtro) consome 1 slot — sobram 2. O excedente é cortado por `.slice(0, maxTabs - 1)` — em DEV o componente avisa no console qual visão foi engolida (v0.43.1), em produção não. Precisa de mais? `maxViewTabs={N + 1}` no `<DataTable>` (o `+1` é a Default) — mas 2 é o default por um motivo: barra de visões não é menu. Um preset "Todos" duplica a Default e gasta um slot com nada.
- **Visões pré-definidas read-only (`allowCreateView={false}`, v0.23.0+)**: passe `defaultViews={[presetView({ id, name, filters?, sort?, viewMode? })]}` + `persistId` pras abas nativas da tela. `allowCreateView={false}` esconde o botão "+" (o usuário não salva visões próprias — só usa as suas). Default `true`. **viewMode "sticky"**: trocar de visão só muda Tabela↔Lista↔Kanban se o preset declarar `viewMode` explícito; sem isso, mantém a view que o usuário está vendo (só declare `viewMode` no preset que DEVE forçar uma view).
  - Lista árvore **+ tabela árvore**: `hierarchical` + `getTreeDataPath` (tabela não pagina).
  - **Tabela FLAT paginada + lista em ÁRVORE**: `hierarchical` + **`listConfig.getPath`** e NÃO passe `getTreeDataPath` (senão a tabela vira tree-data e perde paginação).
- Drawers de criar/editar: espelhe `NovoClienteDrawer` (Panel + FormField + `gap-form-gap`), ligados via estado da página (igual ao `finance-screen.tsx`).
- Tokens/spacing/typography conforme `.claude/rules/ds-design.md` + `DESIGN.md`.

## 4. Registrar a rota

No ponto que o usuário indicou (router / App). Página órfã = incompleto.

## 5. Validar

```bash
npx tsc --noEmit   # abort se falhar — corrija antes do handoff
```

## 6. Handoff

`CRUD_PRONTO: <Entidade>` + onde foi registrada + como rodar (`npm run dev`).
Sugira ao usuário abrir a tela e conferir; ofereça ajustes finos (larguras de coluna, filtros).
