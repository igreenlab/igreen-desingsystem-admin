# DatePicker — USAGE

**Categoria:** composto (Popover + Calendar). Seletor de data(s) com trigger no estilo input do DS.

## Quando usar
- Campo de formulário pra escolher **uma** data (nascimento, vencimento, data de referência).
- Selecionar um **intervalo** de datas (período de relatório, filtro por data inicial/final).
- Selecionar **várias datas soltas** (não contíguas).

## Import
```tsx
import { DatePicker } from "@/components/ui/DatePicker";
import type { DatePickerProps, DateRange } from "@/components/ui/DatePicker";
```

## Variants (`mode`) — muda o shape do `value`

`DatePickerProps` é uma discriminated union por `mode`. Trocar de modo troca o TIPO de
`value`/`onValueChange` junto — trate como union, não como prop solta.

| `mode` | Obrigatória? | `value` | `onValueChange` | Nº de meses (default) |
|---|---|---|---|---|
| `"single"` (default) | não (`mode?: "single"`) | `Date \| undefined` | `(value: Date \| undefined) => void` | 1 |
| `"range"` | sim (`mode: "range"`) | `DateRange \| undefined` (`{ from: Date \| undefined; to?: Date }`, reexportado de `react-day-picker`) | `(value: DateRange \| undefined) => void` | 2 |
| `"multiple"` | sim (`mode: "multiple"`) | `Date[] \| undefined` | `(value: Date[] \| undefined) => void` | 1 |

Comportamento de fechamento do popover por modo:
- `single`: fecha ao clicar numa data.
- `range`: só fecha quando `from` **e** `to` estão preenchidos (clique único no primeiro dia não fecha).
- `multiple`: **não fecha sozinho** — o usuário fecha clicando fora.

Label do trigger por modo (não é customizável — ver Gotchas). Formatos conferidos no
showcase, não inferidos do código:
- `single`: mês por extenso — `19 de junho de 2026` (`month: "long"`).
- `range`: mês abreviado nas duas pontas — `10 de jul. de 2026 – 18 de ago. de 2026`
  (`month: "short"`); com só o `from` preenchido, mostra apenas ele.
- `multiple`: contagem — `1 data selecionada` / `N datas selecionadas`.

## Props essenciais
| Prop | Tipo | Default | Descrição |
|---|---|---|---|
| `mode` | `"single" \| "range" \| "multiple"` | `"single"` | Modo de seleção — ver tabela acima pro shape de `value`. |
| `value` | `Date` \| `DateRange` \| `Date[]` (conforme `mode`) | — | Seleção controlada. |
| `onValueChange` | conforme `mode` (ver tabela acima) | — | Callback de mudança. |
| `placeholder` | `string` | `"Selecione a data"` (single/multiple) ou `"Selecione o período"` (range) | Texto do trigger quando nada está selecionado. |
| `disabled` | `boolean` | — | Desabilita o **trigger** (botão inteiro). |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alinhamento do `PopoverContent`. |
| `numberOfMonths` | `number` | `1` (single/multiple) / `2` (range) | Nº de meses exibidos no `Calendar` interno. |
| `className` | `string` | — | className do trigger (mesmos overrides de um input/`SelectTrigger`). |

## Exemplo mínimo
```tsx
// single (default)
const [date, setDate] = useState<Date>();
<DatePicker value={date} onValueChange={setDate} placeholder="Data de nascimento" />

// range
const [range, setRange] = useState<DateRange>();
<DatePicker mode="range" value={range} onValueChange={setRange} />

// multiple
const [dates, setDates] = useState<Date[]>();
<DatePicker mode="multiple" value={dates} onValueChange={setDates} />
```

## Cuidados / Gotchas
- **Composto sobre `Popover` + `Calendar` do DS** (`@/components/shadcn/popover` e
  `@/components/shadcn/calendar`, este último em cima de `react-day-picker`). Copiando via
  registry essas deps já vêm junto (`date-picker` declara `@igreen/calendar` +
  `@igreen/popover` como `registryDependencies`); copiando manual, garanta que os dois
  existem no consumidor antes.
- **`mode` muda o TIPO, não só o comportamento.** `single` é opcional (default), mas
  `range`/`multiple` exigem a prop explícita. Trocar o modo de um DatePicker controlado
  exige trocar o estado (`Date` → `DateRange`/`Date[]`) junto — o TS não deixa passar
  `value` do shape errado se a discriminated union for respeitada.
- Em `range`, o `Calendar` interno recebe `min={1}` — sem isso o react-day-picker fecharia
  o range já no primeiro clique (`from`/`to` iguais no mesmo dia).
- Em `multiple`, não há botão "Aplicar"/"Fechar" embutido — o popover some só no
  clique-fora.
- **Não há pass-through de restrição de datas** (desabilitar dias específicos / limitar o
  intervalo navegável) pro `Calendar` interno — a prop `disabled` do DatePicker desabilita
  o trigger inteiro, não datas específicas do calendário.
- O label do trigger é formatado em pt-BR fixo (`toLocaleDateString("pt-BR", ...)`); não
  existe prop de formato customizável.

## Limites e limpar (2026-09-23)

- **`minValue` / `maxValue`** desabilitam os dias fora da janela no próprio calendário.
  Vale nos 3 modes (`single`, `range`, `multiple`). Sem eles, "não deixar escolher data
  futura" ou "não passar do prazo" virava validação DEPOIS do clique — o usuário
  escolhia e só então recebia o erro.
  ⚠️ Entram como matcher de dia DESABILITADO, não como `fromDate`/`toDate`: aqueles só
  limitam a navegação de mês e continuam deixando clicar.
- **`clearable`** mostra um × no trigger quando há valor; limpar emite
  `onValueChange(undefined)`. `clearLabel` nomeia o botão.
  ⚠️ O × é `<span role="button">`, não `<button>`: o trigger do Popover já é um button,
  e button dentro de button é HTML inválido — o navegador desaninha e o × passa a abrir
  o calendário junto. Mesmo motivo da anatomia do `Chip` com `onRemove`.

```tsx
<DatePicker
  mode="range"
  value={periodo}
  onValueChange={setPeriodo}
  maxValue={new Date()}        // nada no futuro
  clearable
  clearLabel="Limpar período"
/>
```

## Locale e período de um dia (2026-09-24)

- **`locale`** — default **`ptBR`**. O calendário renderizava meses e dias em inglês
  enquanto o trigger já formatava pt-BR ("12 de março de 2026"); era o único texto em
  inglês do DS, e não era escolha — o `Calendar` nunca recebeu `locale`. Passe outro
  locale do `date-fns` se precisar.
- **Período de UM DIA agora é possível** no `mode="range"`: clique duas vezes no mesmo
  dia. Antes havia `min={1}` no Calendar e isso limpava a seleção.

⚠️ **O popover do range fecha no SEGUNDO clique, e quem controla isso é o componente.**
O `min={1}` existia por um motivo real — sem ele o react-day-picker completa o range já
no primeiro clique e o popover fechava antes de escolher o fim. A troca foi mover o
controle do fechamento pra um estado nosso. Se for mexer na seleção de range, os dois
caminhos (dia único e período normal) estão em `datepicker-range-locale.test.tsx`.
