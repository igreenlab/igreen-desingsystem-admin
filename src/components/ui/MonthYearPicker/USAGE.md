# MonthYearPicker

**Categoria:** composto (Popover + grade de meses). Seletor de período **mês+ano**.

## Quando usar

- Filtro de período por competência mensal (ex.: "Ranking Verticais" por mês), relatórios mensais, faturas.
- Quando um `calendar` de dia é granular demais — você só quer `mês/ano`.

O valor é sempre `"YYYY-MM"` (ex.: `"2026-07"`).

## Props essenciais

| Prop | Tipo | Default | Descrição |
|------|------|---------|-----------|
| `value` | `string` (`"YYYY-MM"`) | — | Período selecionado (controlado). |
| `onValueChange` | `(value: string) => void` | — | Recebe `"YYYY-MM"` ao escolher um mês. |
| `placeholder` | `ReactNode` | `"Selecione o mês"` | Texto do trigger vazio. |
| `min` / `max` | `string` (`"YYYY-MM"`) | — | Faixa selecionável (inclusive). Fora dela, meses ficam desabilitados. |
| `locale` | `string` | `"pt-BR"` | Locale dos rótulos de mês (via `Intl`). |
| `align` | `"start" \| "center" \| "end"` | `"start"` | Alinhamento do dropdown. |
| `open` / `defaultOpen` / `onOpenChange` | — | — | Controle de abertura (igual a um Select). |
| `disabled` | `boolean` | — | Desabilita o trigger. |
| `className` | `string` | — | Estiliza o **trigger** (aceita os mesmos overrides de um `SelectTrigger`). |
| `contentClassName` | `string` | — | Estiliza o **dropdown**. |

## Exemplo mínimo

```tsx
import { MonthYearPicker } from "@snksergio/design-system";

const [periodo, setPeriodo] = useState("2026-07");

<MonthYearPicker
  value={periodo}
  onValueChange={setPeriodo}
  min="2023-01"
  max="2026-12"
  aria-label="Período do ranking"
/>
// trigger mostra "Julho de 2026"; abre grade Jan…Dez com ‹ 2026 ›
```

## Gotchas

- **Formato fixo `"YYYY-MM"`** — mês com zero à esquerda (`"2026-01"`, não `"2026-1"`). Valores fora desse formato são tratados como "nada selecionado".
- O trigger espelha o `SelectTrigger` (mesma altura/borda/foco). Para parear com Selects irmãos num form, passe o mesmo `className`.
- Rótulos vêm do `Intl` no `locale`: pt-BR gera "Jan", "Fev"… e "Julho de 2026" no trigger (primeira letra capitalizada pelo componente).
- Navegação de ano (`‹`/`›`) só desabilita quando o ano inteiro cai fora de `[min, max]`; dentro do ano, meses individuais é que desabilitam.
