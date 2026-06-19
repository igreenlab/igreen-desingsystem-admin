import { useState } from "react";
import { Combobox, type ComboboxOption } from "../../components/ui/Combobox";
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
  { id: "ex-keywords", label: "Keywords" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "options", type: "ComboboxOption[] — { value, label, keywords? }", defaultVal: "—" },
  { name: "value", type: "string (controlado)", defaultVal: "—" },
  { name: "onValueChange", type: "(value: string) => void", defaultVal: "—" },
  { name: "placeholder", type: "ReactNode", defaultVal: '"Selecione…"' },
  { name: "searchPlaceholder", type: "string (input de busca)", defaultVal: '"Buscar…"' },
  { name: "emptyMessage", type: "ReactNode (sem resultado)", defaultVal: "—" },
  { name: "align", type: '"start" | "center" | "end"', defaultVal: '"start"' },
  { name: "className / contentClassName", type: "estiliza trigger / dropdown", defaultVal: "—" },
];

const FRUITS: ComboboxOption[] = [
  { value: "next", label: "Next.js" },
  { value: "vite", label: "Vite" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt" },
];

const COLS: ComboboxOption[] = [
  { value: "name", label: "Nome", keywords: ["razão social", "empresa"] },
  { value: "cnpj", label: "CNPJ", keywords: ["documento", "cpf"] },
  { value: "city", label: "Cidade", keywords: ["município", "uf"] },
  { value: "status", label: "Situação", keywords: ["ativo", "status"] },
];

function BasicExample() {
  const [value, setValue] = useState("");
  return (
    <Combobox
      options={FRUITS}
      value={value}
      onValueChange={setValue}
      placeholder="Escolha o framework"
      searchPlaceholder="Buscar framework…"
      emptyMessage="Nenhum framework"
      className="w-[260px]"
    />
  );
}

function KeywordsExample() {
  const [value, setValue] = useState("");
  return (
    <Combobox
      options={COLS}
      value={value}
      onValueChange={setValue}
      placeholder="Escolha a coluna"
      searchPlaceholder="Buscar (tenta 'documento')…"
      className="w-[260px]"
    />
  );
}

export function ComboboxDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Combobox"
        description="Select de escolha única com busca (autocomplete) e lista rolável. Composto sobre Popover + Command (cmdk). Pra listas curtas sem busca, prefira Select."
        dependency="cmdk"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="options { value, label } + value/onValueChange (controlado)."
        code={`const [value, setValue] = useState("");
<Combobox
  options={FRAMEWORKS}
  value={value}
  onValueChange={setValue}
  placeholder="Escolha o framework"
  searchPlaceholder="Buscar framework…"
  emptyMessage="Nenhum framework"
/>`}
      >
        <BasicExample />
      </ExampleSection>

      <ExampleSection
        id="ex-keywords"
        title="Keywords"
        description="keywords adiciona termos extras de match (sinônimos). Busque por 'documento' → acha CNPJ."
        code={`{ value: "cnpj", label: "CNPJ", keywords: ["documento", "cpf"] }`}
      >
        <KeywordsExample />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ComboboxDoc;
