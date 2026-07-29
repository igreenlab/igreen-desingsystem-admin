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
