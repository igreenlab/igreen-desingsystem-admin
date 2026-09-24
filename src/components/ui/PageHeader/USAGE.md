# PageHeader — USAGE

Bloco de título reutilizável renderizado dentro do body do `<AppShell>`. Cobre o pattern comum de "header de página" do CRM iGreen: **título + descrição + badge + actions**, com slot opcional pra conteúdo extra abaixo (tabs, filtros).

## Quando usar
- Páginas listagem (CRUD, dashboards) que precisam de título + CTA principal
- Páginas com tabs/filtros abaixo do header
- Qualquer tela que reaproveite a estrutura "title/description/badge + actions"

Quando **não** usar:
- Telas chat-like (ChatV2/ChatShowcase) — o header global do AppShell já basta
- Detail pages onde o header é parte de um card/drawer (use composição direta)

## Import
```tsx
import { PageHeader } from "@/components/ui/PageHeader";
```

## Props essenciais

| Prop | Tipo | Default | Função |
|---|---|---|---|
| `title` | string | — | Título h1 (text-title-lg) |
| `description` | string | — | Sub-linha (text-body-md fg-subtle) |
| `badge` | ReactNode | — | Inline ao lado do title (geralmente `<Chip>`) |
| `actions` | ReactNode | — | Bloco de ações à direita (Buttons, dropdowns) |
| `children` | ReactNode | — | Conteúdo extra abaixo (tabs, filtros) |
| `hideTextOnMobile` | boolean | `true` | Em mobile (<md), esconde title/description/badge |
| `fluidPrimaryOnMobile` | boolean | `true` | Em mobile, último filho do `actions` vira fluid (full-width CTA) |
| `className` | string | — | className extra no `<header>` root |

## Exemplos

### Mínimo (só título)
```tsx
<PageHeader title="Configurações" />
```

### Pattern CRUD (replica o header da página de Clientes)
```tsx
<PageHeader
  title="Clientes"
  description="Gerencie sua base de clientes, acompanhe status e abra atendimentos pelo WhatsApp."
  badge={
    <Chip color="primary" variant="soft" size="sm" shape="rounded">
      87 registros
    </Chip>
  }
  actions={
    <>
      <Button variant="outline" color="secondary" size="icon-md" aria-label="Mais ações">
        <MoreHorizontal />
      </Button>
      <Button variant="filled" color="primary" iconLeft={<Plus />}>
        Novo cliente
      </Button>
    </>
  }
/>
```

### Com tabs abaixo do header
```tsx
<PageHeader
  title="Relatórios"
  description="Análise consolidada de vendas e leads."
  actions={<Button>Exportar</Button>}
>
  <Tabs value={tab} onValueChange={setTab}>
    <TabsList>
      <TabsTrigger value="day">Hoje</TabsTrigger>
      <TabsTrigger value="week">Semana</TabsTrigger>
      <TabsTrigger value="month">Mês</TabsTrigger>
    </TabsList>
  </Tabs>
</PageHeader>
```

### Mantendo título visível no mobile
```tsx
<PageHeader
  title="Termos de uso"
  description="Última atualização: jan/2026"
  hideTextOnMobile={false}
/>
```

### Sem actions, só conteúdo
```tsx
<PageHeader title="FAQ">
  <SearchBar />
</PageHeader>
```

## Cuidados / Gotchas

- **`title` é renderizado como `<h1>`** — use **apenas um** `<PageHeader>` com title por página (semântica HTML).
- **Mobile fluid** assume que o último filho do `actions` é o CTA primary. Se a ordem for diferente, desligue via `fluidPrimaryOnMobile={false}` e controle manualmente.
- **`description` truncate em 1 linha** (`whitespace-nowrap overflow-hidden text-ellipsis`) — pra descrições longas, considere usar o slot `children` em vez disso.
- **Body do AppShell** já aplica `gap-gp-4xl` entre filhos diretos. Não envolva o `<PageHeader>` num wrapper extra — coloque direto como filho do `<AppShell>`.

## Anatomia

```
<PageHeader> (header.flex-col.gap-gp-md)
├─ topRow (flex.justify-between.gap-gp-2xl)
│  ├─ textCol [optional]   (flex-col.gap-gp-xs.flex-1)
│  │  ├─ titleRow (flex.gap-gp-md)
│  │  │  ├─ <h1 title>
│  │  │  └─ {badge}
│  │  └─ <p description>
│  └─ actionsRow [optional]   (flex.gap-gp-sm)
│     └─ {actions}
└─ extraRow [optional — children]   (w-full)
```

## Composição manual

Pra layouts que fogem do pattern (ex: title centralizado, ações em coluna), use os slots de styles direto:

```tsx
import { pageHeaderStyles } from "@/components/ui/PageHeader";

const s = pageHeaderStyles();

<header className={s.root()}>
  {/* sua estrutura custom */}
</header>
```

## `titleWrap` e `descriptionLines` (2026-09-23)

Duas props que destravam o header sem mudar o default.

- **`titleWrap`** (default `true`) — o título quebra em várias linhas, que é como
  sempre foi. Passe `false` para truncar em uma linha, quando a altura do header for
  crítica e o título for previsível.
  ⚠️ Não use `false` em título que carrega identificação (nome de projeto, de
  cliente): truncar ali tira a informação que dá contexto à página inteira. Foi
  exatamente esse caso que levou um consumidor a recriar o header por fora.
- **`descriptionLines`** — `1` (default, uma linha com reticências, igual ao
  anterior), `2` ou `3`.

```tsx
<PageHeader
  title="Relatório de atendimento por operador e turno"
  description="Consolida os atendimentos do período, por operador, com SLA."
  descriptionLines={2}
/>
```

⚠️ O degrau `1` mantém as classes originais (`whitespace-nowrap` + ellipsis) em vez do
`line-clamp-1` equivalente: o line-clamp troca o `display` para `-webkit-box`, e
trocar o display de um filho de flex por uma equivalência "visualmente igual" é o
tipo de detalhe que só aparece numa tela específica.

- **`description` aceita `ReactNode`** (2026-09-24), não só texto: a linha secundária
  costuma ter link, `Chip` de status ou seletor de período. Com `string` apenas, o
  consumidor recriava o header por causa de um `<a>`.
- **`descriptionLines="none"`** solta a descrição sem corte — use quando ela for
  composta.
