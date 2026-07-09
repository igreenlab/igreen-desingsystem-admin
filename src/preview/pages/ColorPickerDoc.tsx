import { useState } from "react";

import { ColorPicker } from "@/components/ui/ColorPicker";
import { FormField } from "@/components/ui/FormField";
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
  { id: "ex-basic", label: "Básico (controlado)" },
  { id: "ex-form", label: "Com FormField" },
  { id: "ex-presets", label: "Presets custom" },
  { id: "ex-states", label: "Sem input livre / states" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "value", type: "string", defaultVal: "— (obrigatório)" },
  { name: "onValueChange", type: "(hex: string) => void", defaultVal: "— (obrigatório)" },
  { name: "presets", type: "string[]", defaultVal: "DEFAULT_COLOR_PRESETS" },
  { name: "id", type: "string", defaultVal: "auto (useId)" },
  { name: "state", type: '"default" | "error" | "warning" | "success"', defaultVal: '"default"' },
  { name: "size", type: '"sm" | "md"', defaultVal: '"md"' },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "allowCustomHex", type: "boolean", defaultVal: "true" },
  { name: "placeholder", type: "string", defaultVal: '"#RRGGBB"' },
  { name: "open / onOpenChange", type: "boolean / (open: boolean) => void", defaultVal: "— (uncontrolled)" },
  { name: "className", type: "string", defaultVal: "—" },
];

/* ── Exemplos ao vivo (estado controlado) ──────────────────────────────── */

function BasicExample() {
  const [color, setColor] = useState("#16A34A");
  return (
    <div className="flex items-center gap-gp-lg">
      <ColorPicker value={color} onValueChange={setColor} />
      <span className="text-body-sm text-fg-muted">
        Selecionado: <span className="font-semibold text-fg-default">{color}</span>
      </span>
    </div>
  );
}

function FormFieldExample() {
  const [color, setColor] = useState("#2563EB");
  return (
    <div className="w-full max-w-[320px]">
      <FormField label="Cor da tag" id="tag-color" helperText="Escolha na paleta ou digite um hex.">
        {({ id }) => (
          <ColorPicker id={id} value={color} onValueChange={setColor} />
        )}
      </FormField>
    </div>
  );
}

const BRAND_PRESETS = [
  "#0E7C3A",
  "#16A34A",
  "#22C55E",
  "#4ADE80",
  "#0EA5E9",
  "#2563EB",
  "#7C3AED",
  "#DB2777",
  "#F97316",
  "#FACC15",
];

function PresetsExample() {
  const [color, setColor] = useState("#7C3AED");
  return (
    <div className="flex items-center gap-gp-lg">
      <ColorPicker value={color} onValueChange={setColor} presets={BRAND_PRESETS} />
      <span className="text-body-sm text-fg-muted">
        Grid reduzido a 10 cores de marca.
      </span>
    </div>
  );
}

function StatesExample() {
  const [a, setA] = useState("#DC2626");
  const [b, setB] = useState("#F59E0B");
  const [c, setC] = useState("#22C55E");
  return (
    <div className="flex flex-col gap-form-gap w-full max-w-[320px]">
      <FormField label="Sem input livre (só paleta)" id="cp-nocustom">
        {({ id }) => (
          <ColorPicker
            id={id}
            value={a}
            onValueChange={setA}
            allowCustomHex={false}
            state="error"
          />
        )}
      </FormField>
      <FormField label="Tamanho sm + warning" id="cp-sm">
        {({ id }) => (
          <ColorPicker id={id} value={b} onValueChange={setB} size="sm" state="warning" />
        )}
      </FormField>
      <FormField label="Desabilitado" id="cp-disabled">
        {({ id }) => (
          <ColorPicker id={id} value={c} onValueChange={setC} disabled />
        )}
      </FormField>
    </div>
  );
}

export function ColorPickerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Forms"
        title="ColorPicker"
        description="Seletor de cor hex (#RRGGBB) controlado para Tags e Filas. Compõe Popover + Input + FormField + Button: um swatch abre a paleta curada iGreen com grid de presets e input hex livre. Normaliza 3/6 dígitos com/sem # e emite sempre #RRGGBB maiúsculo."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico (controlado)"
        description="value + onValueChange obrigatórios. Clique no swatch para abrir a paleta; o hex também pode ser digitado no input inline."
        code={`const [color, setColor] = useState("#16A34A");

<ColorPicker value={color} onValueChange={setColor} />`}
      >
        <BasicExample />
      </ExampleSection>

      <ExampleSection
        id="ex-form"
        title="Com FormField"
        description="Envolva em FormField (render-prop) para parear com outros campos — o id liga o label ao input hex via htmlFor."
        code={`<FormField label="Cor da tag" id="tag-color" helperText="Escolha na paleta ou digite um hex.">
  {({ id }) => (
    <ColorPicker id={id} value={color} onValueChange={setColor} />
  )}
</FormField>`}
      >
        <FormFieldExample />
      </ExampleSection>

      <ExampleSection
        id="ex-presets"
        title="Presets custom"
        description="Passe presets para trocar a paleta do grid pelo conjunto de cores da sua entidade."
        code={`const BRAND_PRESETS = ["#0E7C3A", "#16A34A", "#22C55E", "#4ADE80",
  "#0EA5E9", "#2563EB", "#7C3AED", "#DB2777", "#F97316", "#FACC15"];

<ColorPicker value={color} onValueChange={setColor} presets={BRAND_PRESETS} />`}
      >
        <PresetsExample />
      </ExampleSection>

      <ExampleSection
        id="ex-states"
        title="Sem input livre / states"
        description="allowCustomHex={false} remove o input hex livre (só a paleta). state colore só a borda do swatch; size sm = 36px. disabled trava tudo."
        code={`<ColorPicker value={a} onValueChange={setA} allowCustomHex={false} state="error" />
<ColorPicker value={b} onValueChange={setB} size="sm" state="warning" />
<ColorPicker value={c} onValueChange={setC} disabled />`}
      >
        <StatesExample />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ColorPickerDoc;
