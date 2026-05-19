import { Mail, Search, User } from "lucide-react";
import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
  FormFieldCheckbox,
  FormFieldSwitch,
  FormField,
} from "../../components/ui/FormField";
import { Input } from "../../components/shadcn/input";
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
  { id: "ex-basic", label: "Basic" },
  { id: "ex-required", label: "Required" },
  { id: "ex-states", label: "States" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-adornments", label: "Adornments & Icons" },
  { id: "ex-select", label: "FormFieldSelect" },
  { id: "ex-textarea", label: "FormFieldTextarea" },
  { id: "ex-checkbox", label: "FormFieldCheckbox" },
  { id: "ex-switch", label: "FormFieldSwitch" },
  { id: "ex-field", label: "FormField (base)" },
  { id: "ex-mini-form", label: "Mini form" },
  { id: "api", label: "API Reference" },
];

const BASE_PROPS = [
  { name: "label", type: "string", defaultVal: "—" },
  { name: "required", type: "boolean", defaultVal: "false" },
  { name: "helperText", type: "ReactNode", defaultVal: "—" },
  {
    name: "state",
    type: '"default" | "error" | "warning" | "success"',
    defaultVal: '"default"',
  },
  { name: "errorMessage", type: "ReactNode", defaultVal: "—" },
  { name: "warningMessage", type: "ReactNode", defaultVal: "—" },
  { name: "successMessage", type: "ReactNode", defaultVal: "—" },
  { name: "id", type: "string", defaultVal: "auto" },
  { name: "className", type: "string", defaultVal: "—" },
];

const SELECT_PROPS = [
  ...BASE_PROPS,
  { name: "options", type: "FormFieldSelectOption[]", defaultVal: "[]" },
  { name: "placeholder", type: "string", defaultVal: "—" },
  { name: "value / defaultValue", type: "string", defaultVal: "—" },
  { name: "onValueChange", type: "(value: string) => void", defaultVal: "—" },
];

export function FormFieldDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Form Composition"
        title="FormField"
        description="Wrappers one-shot que combinam label + field + helper/error em um único componente. Compõem os componentes shadcn existentes (Input, Select, Textarea, Checkbox, Switch) sem reimplementação."
      />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Basic"
        description="Substitui o padrão Label + Input + helper text por uma única tag."
        code={`<FormFieldInput
  label="Email"
  placeholder="you@example.com"
  helperText="Usamos pra te enviar updates."
/>`}
      >
        <div className="max-w-sm w-full">
          <FormFieldInput
            label="Email"
            placeholder="you@example.com"
            helperText="Usamos pra te enviar updates."
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-required"
        title="Required"
        description="A flag `required` adiciona um asterisco vermelho ao lado do label."
        code={`<FormFieldInput
  label="Nome"
  required
  placeholder="Seu nome"
/>`}
      >
        <div className="max-w-sm w-full">
          <FormFieldInput label="Nome" required placeholder="Seu nome" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-states"
        title="States"
        description="A prop `state` controla cor da borda + cor da mensagem. Priority: error → warning → success → helperText."
        code={`<FormFieldInput state="default"  label="Default"  helperText="Texto auxiliar" />
<FormFieldInput state="error"    label="Error"    errorMessage="Email inválido" />
<FormFieldInput state="warning"  label="Warning"  warningMessage="Verifique se está correto" />
<FormFieldInput state="success"  label="Success"  successMessage="Email confirmado" />`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <FormFieldInput
            state="default"
            label="Default"
            placeholder="Digite..."
            helperText="Texto auxiliar"
          />
          <FormFieldInput
            state="error"
            label="Error"
            defaultValue="email-invalido"
            errorMessage="Email inválido"
          />
          <FormFieldInput
            state="warning"
            label="Warning"
            defaultValue="warning@x"
            warningMessage="Verifique se está correto"
          />
          <FormFieldInput
            state="success"
            label="Success"
            defaultValue="ok@email.com"
            successMessage="Email confirmado"
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="Mesmas alturas do Input/Button (xxs 28px, xs 32px, sm 36px, md 40px). Repassa pro field interno."
        code={`<FormFieldInput size="xxs" label="Size XXS" placeholder="28px" />
<FormFieldInput size="xs"  label="Size XS"  placeholder="32px" />
<FormFieldInput size="sm"  label="Size SM"  placeholder="36px" />
<FormFieldInput size="md"  label="Size MD"  placeholder="40px (default)" />`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <FormFieldInput size="xxs" label="Size XXS" placeholder="28px" />
          <FormFieldInput size="xs" label="Size XS" placeholder="32px" />
          <FormFieldInput size="sm" label="Size SM" placeholder="36px" />
          <FormFieldInput size="md" label="Size MD" placeholder="40px (default)" />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-adornments"
        title="Addons (prefix / suffix / ícone)"
        description="Use `startAddon` e `endAddon`. String vira texto formatado (ex `R$`), ReactNode (ícone/botão) passa direto. Internamente FormFieldInput renderiza um <InputGroup>."
        code={`<FormFieldInput
  label="Busca"
  placeholder="Pesquisar..."
  startAddon={<Search />}
/>

<FormFieldInput
  label="Preço"
  startAddon="R$"
  endAddon=",00"
  placeholder="0"
/>

<FormFieldInput
  label="Usuário"
  startAddon={<User />}
  endAddon="@igreen.com"
/>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <FormFieldInput
            label="Busca"
            placeholder="Pesquisar..."
            startAddon={<Search />}
          />
          <FormFieldInput
            label="Preço"
            startAddon="R$"
            endAddon=",00"
            placeholder="0"
          />
          <FormFieldInput
            label="Usuário"
            startAddon={<User />}
            endAddon="@igreen.com"
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-select"
        title="FormFieldSelect"
        description="API one-shot via `options`. Pra casos avançados (grupos/separadores), use o Select primitive direto."
        code={`<FormFieldSelect
  label="País"
  required
  placeholder="Selecione um país"
  options={[
    { value: "br", label: "Brasil" },
    { value: "us", label: "Estados Unidos" },
    { value: "pt", label: "Portugal" },
  ]}
/>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <FormFieldSelect
            label="País"
            required
            placeholder="Selecione um país"
            options={[
              { value: "br", label: "Brasil" },
              { value: "us", label: "Estados Unidos" },
              { value: "pt", label: "Portugal" },
            ]}
          />
          <FormFieldSelect
            label="Plano"
            state="error"
            placeholder="Selecione um plano"
            errorMessage="Selecione um plano antes de continuar"
            options={[
              { value: "free", label: "Grátis" },
              { value: "pro", label: "Pro" },
              { value: "ent", label: "Enterprise" },
            ]}
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-textarea"
        title="FormFieldTextarea"
        description="Mesma API, com Textarea ao invés de Input."
        code={`<FormFieldTextarea
  label="Observações"
  helperText="Máximo 500 caracteres"
  placeholder="Conte mais sobre seu projeto..."
/>`}
      >
        <div className="max-w-sm w-full">
          <FormFieldTextarea
            label="Observações"
            helperText="Máximo 500 caracteres"
            placeholder="Conte mais sobre seu projeto..."
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-checkbox"
        title="FormFieldCheckbox"
        description="Layout inline: checkbox + label ao lado. Helper/error vai abaixo, alinhado com o texto."
        code={`<FormFieldCheckbox
  label="Aceito os termos de uso"
  helperText="Você pode revogar a qualquer momento"
/>

<FormFieldCheckbox
  label="Receber newsletter"
  state="error"
  errorMessage="Confirmação obrigatória"
/>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <FormFieldCheckbox
            label="Aceito os termos de uso"
            helperText="Você pode revogar a qualquer momento"
          />
          <FormFieldCheckbox
            label="Receber newsletter"
            state="error"
            errorMessage="Confirmação obrigatória"
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-switch"
        title="FormFieldSwitch"
        description="Toggle com label. Por padrão o switch fica à direita; use `switchPosition='start'` pra inverter."
        code={`<FormFieldSwitch
  label="Modo escuro"
  helperText="Mude o tema do dashboard"
/>

<FormFieldSwitch
  switchPosition="start"
  label="Notificações"
  defaultChecked
/>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <FormFieldSwitch
            label="Modo escuro"
            helperText="Mude o tema do dashboard"
          />
          <FormFieldSwitch
            switchPosition="start"
            label="Notificações"
            defaultChecked
          />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-field"
        title="FormField (base)"
        description="Quando nenhum wrapper especializado serve (ex: combobox custom, color picker), use o FormField base. O child recebe `{ id, state }` via render-prop."
        code={`<FormField
  label="Campo custom"
  helperText="Use FormField pra fields não cobertos"
>
  {({ id, state }) => (
    <Input id={id} state={state} placeholder="Qualquer field aqui" />
  )}
</FormField>`}
      >
        <div className="max-w-sm w-full">
          <FormField
            label="Campo custom"
            helperText="Use FormField pra fields não cobertos"
          >
            {({ id, state }) => (
              <Input id={id} state={state} placeholder="Qualquer field aqui" />
            )}
          </FormField>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-mini-form"
        title="Mini form"
        description="Combinando vários Form* num formulário real. Note a verbosidade reduzida vs. Label + Input + helper manual."
        code={`<form className="flex flex-col gap-gp-xl">
  <FormFieldInput
    label="Nome completo"
    required
    placeholder="João da Silva"
    startAddon={<User />}
  />
  <FormFieldInput
    label="Email"
    required
    type="email"
    placeholder="voce@empresa.com"
    startAddon={<Mail />}
  />
  <FormFieldSelect
    label="Cargo"
    required
    placeholder="Selecione..."
    options={[
      { value: "dev", label: "Desenvolvedor" },
      { value: "design", label: "Designer" },
      { value: "pm", label: "Product Manager" },
    ]}
  />
  <FormFieldTextarea
    label="Bio"
    helperText="Conte um pouco sobre você"
    placeholder="..."
  />
  <FormFieldCheckbox label="Aceito os termos" required />
</form>`}
      >
        <form
          className="flex flex-col gap-gp-xl max-w-sm w-full"
          onSubmit={(e) => e.preventDefault()}
        >
          <FormFieldInput
            label="Nome completo"
            required
            placeholder="João da Silva"
            startAddon={<User />}
          />
          <FormFieldInput
            label="Email"
            required
            type="email"
            placeholder="voce@empresa.com"
            startAddon={<Mail />}
          />
          <FormFieldSelect
            label="Cargo"
            required
            placeholder="Selecione..."
            options={[
              { value: "dev", label: "Desenvolvedor" },
              { value: "design", label: "Designer" },
              { value: "pm", label: "Product Manager" },
            ]}
          />
          <FormFieldTextarea
            label="Bio"
            helperText="Conte um pouco sobre você"
            placeholder="..."
          />
          <FormFieldCheckbox label="Aceito os termos" required />
        </form>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <p className="text-body-md text-fg-muted mb-gp-lg">
        Props comuns (FormFieldInput / FormFieldTextarea / FormFieldCheckbox / FormFieldSwitch / FormField):
      </p>
      <PropsTable items={BASE_PROPS} />

      <p className="text-body-md text-fg-muted mt-gp-2xl mb-gp-lg">
        FormFieldSelect adiciona:
      </p>
      <PropsTable items={SELECT_PROPS.slice(BASE_PROPS.length)} />
    </DocLayout>
  );
}
