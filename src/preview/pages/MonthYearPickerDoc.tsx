import { useState } from "react";
import { MonthYearPicker } from "@/components/ui/MonthYearPicker";
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
  { id: "ex-basic", label: "Seleção básica" },
  { id: "ex-range", label: "Faixa min/max" },
  { id: "ex-placeholder", label: "Placeholder e disabled" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "value", type: `string ("YYYY-MM")`, defaultVal: "—" },
  { name: "onValueChange", type: "(value: string) => void", defaultVal: "—" },
  { name: "placeholder", type: "ReactNode", defaultVal: `"Selecione o mês"` },
  { name: "min", type: `string ("YYYY-MM")`, defaultVal: "—" },
  { name: "max", type: `string ("YYYY-MM")`, defaultVal: "—" },
  { name: "locale", type: "string", defaultVal: `"pt-BR"` },
  { name: "align", type: `"start" | "center" | "end"`, defaultVal: `"start"` },
  { name: "open / defaultOpen / onOpenChange", type: "controle de abertura (igual a um Select)", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "—" },
  { name: "className", type: "string — estiliza o trigger", defaultVal: "—" },
  { name: "contentClassName", type: "string — estiliza o dropdown", defaultVal: "—" },
  { name: "aria-label", type: "string", defaultVal: "—" },
];

function BasicExample() {
  const [periodo, setPeriodo] = useState("2026-07");
  return (
    <div className="flex flex-col gap-gp-sm max-w-[280px]">
      <MonthYearPicker
        value={periodo}
        onValueChange={setPeriodo}
        aria-label="Período"
      />
      <span className="text-caption-md text-fg-muted">
        value: {periodo}
      </span>
    </div>
  );
}

function RangeExample() {
  const [periodo, setPeriodo] = useState("2026-03");
  return (
    <div className="flex flex-col gap-gp-sm max-w-[280px]">
      <MonthYearPicker
        value={periodo}
        onValueChange={setPeriodo}
        min="2026-01"
        max="2026-06"
        aria-label="Competência"
      />
      <span className="text-caption-md text-fg-muted">
        selecionável apenas Jan…Jun de 2026
      </span>
    </div>
  );
}

function PlaceholderExample() {
  const [periodo, setPeriodo] = useState<string | undefined>(undefined);
  return (
    <div className="flex flex-col gap-gp-md max-w-[280px]">
      <MonthYearPicker
        value={periodo}
        onValueChange={setPeriodo}
        placeholder="Escolha a competência"
        aria-label="Competência"
      />
      <MonthYearPicker
        value="2026-07"
        disabled
        aria-label="Período (desabilitado)"
      />
    </div>
  );
}

export function MonthYearPickerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Forms"
        title="MonthYearPicker"
        description="Seletor de período mês+ano. Trigger espelha um Select (mostra 'Julho de 2026'); ao abrir, um popover traz navegação de ano (‹ 2026 ›) + grade 3×4 de meses. Valor sempre no formato 'YYYY-MM'."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Seleção básica"
        description="Controlado via value/onValueChange. Abre o popover, escolhe o mês e o trigger passa a mostrar 'Mês de Ano'."
        code={`const [periodo, setPeriodo] = useState("2026-07");

<MonthYearPicker
  value={periodo}
  onValueChange={setPeriodo}
  aria-label="Período"
/>`}
      >
        <BasicExample />
      </ExampleSection>

      <ExampleSection
        id="ex-range"
        title="Faixa min/max"
        description="min/max (inclusive) desabilitam meses fora do intervalo; a navegação de ano só trava quando o ano inteiro cai fora."
        code={`<MonthYearPicker
  value={periodo}
  onValueChange={setPeriodo}
  min="2026-01"
  max="2026-06"
  aria-label="Competência"
/>`}
      >
        <RangeExample />
      </ExampleSection>

      <ExampleSection
        id="ex-placeholder"
        title="Placeholder e disabled"
        description="Sem value, o trigger mostra o placeholder. disabled bloqueia a abertura."
        code={`<MonthYearPicker
  value={periodo}
  onValueChange={setPeriodo}
  placeholder="Escolha a competência"
/>

<MonthYearPicker value="2026-07" disabled />`}
      >
        <PlaceholderExample />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default MonthYearPickerDoc;
