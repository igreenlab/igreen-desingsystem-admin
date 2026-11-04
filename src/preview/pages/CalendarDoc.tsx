import { useState } from "react";
import { Calendar } from "../../components/shadcn/calendar";
import { Button } from "../../components/ui/Button/button";
import { Card, CardContent } from "../../components/shadcn/card";
import type { DateRange } from "react-day-picker";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-hoje", label: "Hoje × selecionado" },
  { id: "ex-range", label: "Range Selection" },
  { id: "ex-dropdown", label: "Month/Year Selector" },
  { id: "ex-disabled", label: "Disabled Dates" },
  { id: "ex-presets", label: "Presets" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "mode", type: '"single" | "multiple" | "range"', defaultVal: "—" },
  { name: "selected", type: "Date | Date[] | DateRange", defaultVal: "—" },
  { name: "onSelect", type: "(date: Date) => void", defaultVal: "—" },
  { name: "showOutsideDays", type: "boolean", defaultVal: "true" },
  { name: "captionLayout", type: '"label" | "dropdown"', defaultVal: '"label"' },
  { name: "disabled", type: "Matcher | Matcher[]", defaultVal: "—" },
  { name: "numberOfMonths", type: "number", defaultVal: "1" },
  { name: "locale", type: "date-fns Locale", defaultVal: "ptBR" },
];

function DefaultCalendarExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className="border border-border-subtle rounded-radius-base p-pad-4xl">
      <Calendar mode="single" selected={date} onSelect={setDate} className="w-full" />
    </div>
  );
}

/**
 * Os dois estados LADO A LADO, que é a única forma de mostrar que são dois.
 * A seleção começa num dia que NÃO é hoje de propósito: com hoje selecionado
 * (o caso do exemplo "Default") o preenchido vence e o anel nem aparece.
 */
function HojeVsSelecionadoExample() {
  const hoje = new Date();
  const outroDia = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    hoje.getDate() > 15 ? hoje.getDate() - 5 : hoje.getDate() + 5,
  );
  const [date, setDate] = useState<Date | undefined>(outroDia);
  return (
    <div className="flex flex-col gap-gp-xl border border-border-subtle rounded-radius-base p-pad-4xl">
      <Calendar mode="single" selected={date} onSelect={setDate} className="w-full" />
      <p className="text-body-xs text-fg-muted">
        Hoje é o <strong className="text-fg-default">anel</strong>; o dia
        selecionado é o <strong className="text-fg-default">preenchido</strong>.
        Clique em hoje e o anel some — o preenchido vence.
      </p>
    </div>
  );
}

function RangeCalendarExample() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
  });
  return (
    <div className="border border-border-subtle rounded-radius-base p-pad-4xl">
      <Calendar mode="range" selected={range} onSelect={setRange} numberOfMonths={2} className="w-full" />
    </div>
  );
}

function DropdownCalendarExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  return (
    <div className="border border-border-subtle rounded-radius-base p-pad-4xl">
      <Calendar mode="single" selected={date} onSelect={setDate} captionLayout="dropdown" className="w-full" />
    </div>
  );
}

function DisabledCalendarExample() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  return (
    <div className="border border-border-subtle rounded-radius-base p-pad-4xl">
      <Calendar mode="single" selected={date} onSelect={setDate} disabled={isWeekend} className="w-full" />
    </div>
  );
}

function PresetsCalendarExample() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  };

  return (
    <div className="flex border border-border-subtle rounded-radius-base overflow-hidden">
      <div className="flex flex-col gap-gp-md border-r border-border-subtle p-pad-3xl">
        <p className="text-body-xs text-fg-muted">Quick pick</p>
        <Button color="secondary" variant="outline" size="2xs" fullWidth onClick={() => setDate(new Date())}>Today</Button>
        <Button color="secondary" variant="outline" size="2xs" fullWidth onClick={() => setDate(addDays(1))}>Tomorrow</Button>
        <Button color="secondary" variant="outline" size="2xs" fullWidth onClick={() => setDate(addDays(3))}>In 3 days</Button>
        <Button color="secondary" variant="outline" size="2xs" fullWidth onClick={() => setDate(addDays(7))}>In a week</Button>
      </div>
      <div className="flex flex-col gap-gp-md p-pad-3xl">
        <Calendar mode="single" selected={date} onSelect={setDate} />
        <p className="text-body-xs text-fg-muted text-center">
          {date ? date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "Pick a date"}
        </p>
      </div>
    </div>
  );
}

export function CalendarDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Data Display" title="Calendar" description="Date picker calendar built on react-day-picker." dependency="react-day-picker" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Single date selection. O exemplo abre com hoje JÁ selecionado — e é por isso que ele aparece preenchido aqui: quando os dois coincidem, o selecionado vence."
        code={`const [date, setDate] = useState<Date | undefined>(new Date());

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  className="w-full"
/>`}
      >
        <DefaultCalendarExample />
      </ExampleSection>

      {/* Hoje × selecionado */}
      <ExampleSection
        id="ex-hoje"
        title="Hoje × selecionado"
        description="Dois estados, duas peles: hoje é um anel de marca sobre fundo transparente, o selecionado é o disco preenchido. Até 2026-11-04 os dois saíam iguais (disco preenchido) e não dava pra distinguir um do outro."
        code={`// hoje = anel · selecionado = preenchido
// coincidindo, o preenchido vence (o anel nao entra)
<Calendar mode="single" selected={outroDia} onSelect={setDate} />`}
      >
        <HojeVsSelecionadoExample />
      </ExampleSection>

      {/* Range Selection */}
      <ExampleSection
        id="ex-range"
        title="Range Selection"
        description="Select a date range across two months."
        code={`const [range, setRange] = useState<DateRange | undefined>({
  from: new Date(),
  to: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
});

<Calendar
  mode="range"
  selected={range}
  onSelect={setRange}
  numberOfMonths={2}
/>`}
      >
        <RangeCalendarExample />
      </ExampleSection>

      {/* Month/Year Selector */}
      <ExampleSection
        id="ex-dropdown"
        title="Month/Year Selector"
        description="Dropdown navigation for quick month and year selection."
        code={`<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  captionLayout="dropdown"
/>`}
      >
        <DropdownCalendarExample />
      </ExampleSection>

      {/* Disabled Dates */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled Dates"
        description="Weekends are disabled using a matcher function."
        code={`const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;

<Calendar
  mode="single"
  selected={date}
  onSelect={setDate}
  disabled={isWeekend}
/>`}
      >
        <DisabledCalendarExample />
      </ExampleSection>

      {/* Presets */}
      <ExampleSection
        id="ex-presets"
        title="Presets"
        description="Preset buttons combined with a calendar for quick date selection."
        code={`const [date, setDate] = useState<Date | undefined>(new Date());
const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

<Card>
  <CardContent className="flex flex-col gap-gp-2xl p-pad-3xl">
    <div className="flex flex-wrap gap-gp-md">
      <Button color="secondary" variant="outline" size="2xs"
        onClick={() => setDate(new Date())}>Today</Button>
      <Button color="secondary" variant="outline" size="2xs"
        onClick={() => setDate(addDays(1))}>Tomorrow</Button>
      <Button color="secondary" variant="outline" size="2xs"
        onClick={() => setDate(addDays(3))}>In 3 days</Button>
      <Button color="secondary" variant="outline" size="2xs"
        onClick={() => setDate(addDays(7))}>In a week</Button>
    </div>
    <Calendar mode="single" selected={date} onSelect={setDate} />
    <p className="text-body-xs text-fg-muted text-center">
      {date ? date.toLocaleDateString(...) : "Pick a date"}
    </p>
  </CardContent>
</Card>`}
      >
        <PresetsCalendarExample />
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
