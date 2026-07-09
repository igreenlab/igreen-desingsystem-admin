import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { DatePicker } from "../../components/ui/DatePicker";
import { Calendar } from "../../components/shadcn/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/shadcn/popover";
import { Button } from "../../components/ui/Button";
import { FormField } from "../../components/ui/FormField";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-basic", label: "Básico" },
  { id: "ex-states", label: "Estados" },
  { id: "ex-align", label: "Alinhamento" },
  { id: "ex-form", label: "Em formulário" },
  { id: "ex-range", label: "Intervalo (range)" },
  { id: "ex-presets", label: "Com presets" },
  { id: "ex-dropdown", label: "Navegação mês/ano" },
  { id: "ex-restrict", label: "Datas restritas" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "value", type: "Date (controlado)", defaultVal: "—" },
  { name: "onValueChange", type: "(date: Date | undefined) => void", defaultVal: "—" },
  { name: "placeholder", type: "string", defaultVal: '"Selecione a data"' },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "align", type: '"start" | "center" | "end"', defaultVal: '"start"' },
  { name: "className", type: "string (estiliza o trigger)", defaultVal: "—" },
];

// Trigger no mesmo estilo do DatePicker — reaproveitado nos exemplos avançados
// que compõem Popover + Calendar diretamente (range, presets, dropdown, restrições).
const TRIGGER_CLS =
  "flex min-h-form-lg w-full items-center gap-gp-sm rounded-radius-md border border-border-default bg-bg-surface px-pad-lg text-body-sm text-fg-default transition-[color,box-shadow,background-color] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-fg-muted";

const fmt = (d: Date) =>
  d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

function BasicExample() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <div className="w-[280px]">
      <DatePicker value={date} onValueChange={setDate} />
    </div>
  );
}

function AlignExample() {
  const [date, setDate] = useState<Date | undefined>(new Date(2026, 5, 19));
  return (
    <div className="flex flex-col gap-gp-md w-[280px]">
      <DatePicker value={date} onValueChange={setDate} align="start" />
      <DatePicker value={date} onValueChange={setDate} align="center" />
      <DatePicker value={date} onValueChange={setDate} align="end" />
    </div>
  );
}

function FormExample() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <div className="w-[280px]">
      <FormField
        label="Data de vencimento"
        helperText="Selecione a data limite para o pagamento."
      >
        {() => (
          <DatePicker value={date} onValueChange={setDate} placeholder="dd/mm/aaaa" />
        )}
      </FormField>
    </div>
  );
}

function RangeExample() {
  const [range, setRange] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);
  const label = range?.from
    ? range.to
      ? `${fmt(range.from)} — ${fmt(range.to)}`
      : fmt(range.from)
    : "Selecione o período";
  return (
    <div className="w-[300px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-placeholder={range?.from ? undefined : ""}
            className={TRIGGER_CLS}
          >
            <CalendarIcon className="size-icon-sm shrink-0 text-fg-muted" strokeWidth={1.8} />
            <span className="truncate">{label}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-pad-xl">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={range}
            onSelect={setRange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

const PRESETS: { label: string; get: () => Date }[] = [
  { label: "Hoje", get: () => new Date() },
  {
    label: "Ontem",
    get: () => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    },
  },
  {
    label: "Em 1 semana",
    get: () => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d;
    },
  },
  {
    label: "Em 1 mês",
    get: () => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d;
    },
  },
];

function PresetsExample() {
  const [date, setDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  return (
    <div className="w-[280px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-placeholder={date ? undefined : ""}
            className={TRIGGER_CLS}
          >
            <CalendarIcon className="size-icon-sm shrink-0 text-fg-muted" strokeWidth={1.8} />
            <span className="truncate">{date ? fmt(date) : "Selecione a data"}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex w-auto gap-gp-lg p-pad-xl">
          <div className="flex flex-col gap-gp-2xs border-r border-border-subtle pr-pad-lg">
            {PRESETS.map((p) => (
              <Button
                key={p.label}
                variant="ghost"
                size="sm"
                className="justify-start"
                onClick={() => {
                  setDate(p.get());
                  setOpen(false);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function DropdownExample() {
  const [date, setDate] = useState<Date | undefined>(new Date(1998, 3, 12));
  const [open, setOpen] = useState(false);
  return (
    <div className="w-[280px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-placeholder={date ? undefined : ""}
            className={TRIGGER_CLS}
          >
            <CalendarIcon className="size-icon-sm shrink-0 text-fg-muted" strokeWidth={1.8} />
            <span className="truncate">{date ? fmt(date) : "Data de nascimento"}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-pad-xl">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date(1960, 0)}
            endMonth={new Date(2030, 11)}
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function RestrictExample() {
  const [date, setDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return (
    <div className="w-[280px]">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            data-placeholder={date ? undefined : ""}
            className={TRIGGER_CLS}
          >
            <CalendarIcon className="size-icon-sm shrink-0 text-fg-muted" strokeWidth={1.8} />
            <span className="truncate">
              {date ? fmt(date) : "Agendar (dias úteis futuros)"}
            </span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-pad-xl">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              setDate(d);
              setOpen(false);
            }}
            disabled={[
              { before: today },
              (d) => d.getDay() === 0 || d.getDay() === 6,
            ]}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DatePickerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Date Picker"
        description="Seletor de data — o wrapper DatePicker cobre o caso single (trigger estilo input + Popover + Calendar, controlado via value / onValueChange). Para intervalo, presets, navegação por mês/ano e restrições, componha Popover + Calendar direto (mesmos blocos do DS)."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Controlado: value (Date) + onValueChange. Abre o calendário no clique; fecha ao selecionar."
        code={`const [date, setDate] = useState<Date | undefined>();
<DatePicker value={date} onValueChange={setDate} />`}
      >
        <BasicExample />
      </ExampleSection>

      <ExampleSection
        id="ex-states"
        title="Estados"
        description="Pré-preenchido e desabilitado."
        code={`<DatePicker value={new Date()} onValueChange={() => {}} />
<DatePicker disabled placeholder="Indisponível" />`}
      >
        <div className="flex flex-col gap-gp-md w-[280px]">
          <DatePicker value={new Date(2026, 5, 19)} onValueChange={() => {}} />
          <DatePicker disabled placeholder="Indisponível" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-align"
        title="Alinhamento"
        description="O popover ancora pelo prop align (start / center / end) relativo ao trigger."
        code={`<DatePicker value={date} onValueChange={setDate} align="start" />
<DatePicker value={date} onValueChange={setDate} align="center" />
<DatePicker value={date} onValueChange={setDate} align="end" />`}
      >
        <AlignExample />
      </ExampleSection>

      <ExampleSection
        id="ex-form"
        title="Em formulário"
        description="Dentro de <FormField> — label, helper e estados de erro do DS (L-023) envolvem o DatePicker como qualquer input. children é render-prop."
        code={`<FormField label="Data de vencimento" helperText="...">
  {() => <DatePicker value={date} onValueChange={setDate} placeholder="dd/mm/aaaa" />}
</FormField>`}
      >
        <FormExample />
      </ExampleSection>

      <ExampleSection
        id="ex-range"
        title="Intervalo (range)"
        description={'Seleção de período: Popover + Calendar mode="range" com numberOfMonths={2}. O trigger mostra início — fim.'}
        code={`const [range, setRange] = useState<DateRange | undefined>();
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild><button className={TRIGGER_CLS}>…</button></PopoverTrigger>
  <PopoverContent className="w-auto p-pad-xl">
    <Calendar mode="range" numberOfMonths={2} selected={range} onSelect={setRange} />
  </PopoverContent>
</Popover>`}
      >
        <RangeExample />
      </ExampleSection>

      <ExampleSection
        id="ex-presets"
        title="Com presets"
        description="Atalhos rápidos (Hoje, Ontem, Em 1 semana…) ao lado do calendário, selecionando a data e fechando o popover."
        code={`<PopoverContent className="flex w-auto gap-gp-lg p-pad-xl">
  <div className="flex flex-col gap-gp-2xs border-r border-border-subtle pr-pad-lg">
    {PRESETS.map((p) => (
      <Button variant="ghost" size="sm" onClick={() => { setDate(p.get()); setOpen(false); }}>
        {p.label}
      </Button>
    ))}
  </div>
  <Calendar mode="single" selected={date} onSelect={…} />
</PopoverContent>`}
      >
        <PresetsExample />
      </ExampleSection>

      <ExampleSection
        id="ex-dropdown"
        title="Navegação mês/ano"
        description={'captionLayout="dropdown" troca os títulos por selects de mês e ano — ideal para datas distantes (nascimento). Limite o range com startMonth / endMonth.'}
        code={`<Calendar
  mode="single"
  captionLayout="dropdown"
  startMonth={new Date(1960, 0)}
  endMonth={new Date(2030, 11)}
  selected={date}
  onSelect={…}
/>`}
      >
        <DropdownExample />
      </ExampleSection>

      <ExampleSection
        id="ex-restrict"
        title="Datas restritas"
        description="A prop disabled aceita matchers do react-day-picker — aqui: nada no passado + fins de semana bloqueados."
        code={`<Calendar
  mode="single"
  selected={date}
  onSelect={…}
  disabled={[
    { before: today },
    (d) => d.getDay() === 0 || d.getDay() === 6,
  ]}
/>`}
      >
        <RestrictExample />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default DatePickerDoc;
