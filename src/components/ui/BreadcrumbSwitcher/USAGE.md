# BreadcrumbSwitcher

<!-- ds:regras
- página de DETALHE (ficha de cliente, UC, contrato, chamado) → o item do registro no breadcrumb é `<BreadcrumbSwitcher>`, não texto: quem está numa ficha quer pular pra outra, não voltar à lista
- é controlado e **não navega**: `onValueChange` devolve o `value` e quem decide rota/fetch é você
- no `Header`, o item vira seletor com os TRÊS juntos — `switcher` + `value` + `onValueChange`; faltando um, fica texto
- escolher valor de FORMULÁRIO não é isto: é `combobox` (o trigger dele tem cara de campo de propósito)
-->

O item do caminho que **troca o registro aberto**: o nome do que está aberto vira gatilho e
abre uma lista com busca. É o seletor de repositório do GitHub aplicado a cliente, UC,
contrato — qualquer coisa de que existam muitos.

## Quando usar

| Situação | Componente |
|---|---|
| Página de detalhe de UM registro entre muitos parecidos | **`BreadcrumbSwitcher`** |
| Navegar entre seções fixas do caminho | `BreadcrumbLink` (o breadcrumb normal) |
| Escolher um valor num formulário | `combobox` |
| Trocar entre sessões abertas ao mesmo tempo | `tabs-navigation` |

## Import

```tsx
import { BreadcrumbSwitcher } from "@/components/ui/BreadcrumbSwitcher";
```

## Exemplo mínimo

```tsx
<BreadcrumbItem>
  <BreadcrumbSwitcher
    value={clienteId}
    onValueChange={abrirCliente}
    options={clientes}            // { value, label, leading?, description?, keywords?, group? }
    title="Trocar cliente"
    searchPlaceholder="Buscar por nome ou documento…"
    aria-label="Trocar cliente"
  />
</BreadcrumbItem>
```

## No `Header`

O item do breadcrumb do `Header` vira seletor sozinho:

```tsx
<Header
  breadcrumb={[
    { label: "Clientes", href: "/clientes" },
    {
      label: cliente.nome,
      switcher: clientes,
      value: cliente.id,
      onValueChange: abrirCliente,
      switcherTitle: "Trocar cliente",
    },
  ]}
/>
```

Precisa dos **três** (`switcher` + `value` + `onValueChange`). Faltando um, o item renderiza
como texto normal. No celular, onde a cadeia colapsa e sobra só o último item, o seletor
continua ali.

## Props

| Prop | Tipo | Default |
|---|---|---|
| `value` / `onValueChange` | `string` / `(v: string) => void` | — (controlado) |
| `options` | `BreadcrumbSwitcherOption[]` | — |
| `placeholder` | `ReactNode` — quando o `value` não está na lista | o próprio `value` |
| `title` | `ReactNode` — cabeçalho do dropdown | — |
| `searchPlaceholder` | `string` | `"Buscar…"` |
| `emptyMessage` | `ReactNode` | `"Nada encontrado."` |
| `footer` | `ReactNode` — fora da área que rola | — |
| `open` / `onOpenChange` | abertura controlada | — |
| `align` | `start \| center \| end` | `"start"` |
| `aria-label` | `string` | `"Trocar registro aberto"` |

`BreadcrumbSwitcherOption`: `{ value, label, leading?, description?, keywords?, group? }`.

## Gotchas / cuidados

- **Ele não navega.** `onValueChange` devolve o valor; rota, fetch e estado são seus. É o que
  faz o mesmo componente servir pro app com router e pro painel que só troca estado local.
- **`keywords` é pra o que o usuário sabe de cor e a tela não mostra** — CPF/CNPJ, código
  interno, apelido. A busca filtra por `label` + `keywords`, e o `value` já entra
  automaticamente.
- **A busca é local E fuzzy.** O `Command` filtra por subsequência com score, não por prefixo:
  procurar um CPF pode trazer junto um CNPJ que compartilha dígitos, com score menor. O certo
  vem em primeiro; não prometa "resultado único" na sua tela. E acima de ~1.000 registros,
  pagine ou busque no servidor antes de montar `options`.
- **A opção do registro aberto sai com `data-atual`** no DOM — use isso pra estilizar ou
  testar. O `data-selected` do cmdk é outra coisa (o item ativo do teclado), e "tem svg" não
  serve de sinal porque `leading` também é svg.
- **Grupos saem na ordem de `options`**, não alfabética — “Recentes” antes de “Todos” é
  informação, não acaso.
- **Passe `aria-label` com o nome do domínio** (“Trocar cliente”). O default genérico funciona,
  mas quem ouve a tela merece o termo certo.
- **Use `placeholder` quando a lista chega assíncrona**: sem ele, enquanto as opções não
  carregam, o caminho mostra o `value` cru (um id), que lê como bug.
- **Não empilhe com um link no mesmo item.** Se o item tem `switcher`, o clique abre a lista —
  um `href` ali seria uma segunda intenção que nunca dispara.
