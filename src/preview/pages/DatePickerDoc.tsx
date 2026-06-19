import { useState } from "react";
import { DatePicker } from "../../components/ui/DatePicker";
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

function BasicExample() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  return (
    <div className="w-[280px]">
      <DatePicker value={date} onValueChange={setDate} />
    </div>
  );
}

export function DatePickerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Date Picker"
        description="Seletor de data único — composto sobre Popover + Calendar, com trigger no estilo input do DS (ícone + data formatada). Controlado via value / onValueChange; fecha ao escolher."
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

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default DatePickerDoc;
