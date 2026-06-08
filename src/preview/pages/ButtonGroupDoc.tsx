import { Filter, MoreVertical, Save, Trash2 } from "lucide-react";
import { ButtonGroup } from "../../components/ui/ButtonGroup";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

/* ═══════════════════════════════════════════════════════════════════════════
   ButtonGroup Documentation Page
   ═══════════════════════════════════════════════════════════════════════════ */

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-variants", label: "Variants" },
  { id: "ex-colors", label: "Colors" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-loading", label: "Loading" },
  { id: "ex-custom-icon", label: "Custom Chevron Icon" },
  { id: "ex-override", label: "Override por slot" },
  { id: "api", label: "API Reference" },
];

const GROUP_PROPS = [
  { name: "color", type: '"primary" | "secondary" | "critical" | "success" | "warning"', defaultVal: '"primary"' },
  { name: "variant", type: '"filled" | "outline" | "soft" | "ghost"', defaultVal: '"filled"' },
  { name: "size", type: '"2xs" | "xs" | "sm" | "md" | "lg"', defaultVal: '"md"' },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "children", type: "ReactNode (Primary + Chevron)", defaultVal: "—" },
];

const PRIMARY_PROPS = [
  { name: "onClick", type: "(e) => void", defaultVal: "—" },
  { name: "iconLeft / iconRight", type: "ReactNode", defaultVal: "—" },
  { name: "loading", type: "boolean", defaultVal: "false" },
  { name: "color / variant / size / disabled", type: "—", defaultVal: "herda do group" },
];

const CHEVRON_PROPS = [
  { name: "onClick", type: "(e) => void", defaultVal: "—" },
  { name: "aria-label", type: "string (obrigatório)", defaultVal: "—" },
  { name: "icon", type: "ReactNode", defaultVal: "<ChevronDown />" },
  { name: "color / variant / size / disabled", type: "—", defaultVal: "herda do group" },
];

export function ButtonGroupDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Actions"
        title="ButtonGroup"
        description="Split button — ação principal + chevron compacto lateral. Usa o <Button> próprio do DS com radius colapsado entre os 2 slots."
        dependency="tailwind-variants"
      />

      <DocSeparator />

      {/* Hero */}
      <ExampleSection id="ex-hero" title="" description="">
        <div className="flex items-center gap-gp-xl flex-wrap">
          <ButtonGroup color="primary" variant="filled" size="md">
            <ButtonGroup.Primary iconLeft={<Filter />}>Filtrar</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="Filtros avançados" />
          </ButtonGroup>
          <ButtonGroup color="secondary" variant="outline" size="md">
            <ButtonGroup.Primary iconLeft={<Save />}>Salvar</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="Opções de salvamento" />
          </ButtonGroup>
        </div>
      </ExampleSection>

      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Uso padrão — primary filled, size md."
        code={`<ButtonGroup>\n  <ButtonGroup.Primary onClick={save}>Salvar</ButtonGroup.Primary>\n  <ButtonGroup.Chevron onClick={menu} aria-label="Opções" />\n</ButtonGroup>`}
      >
        <ButtonGroup>
          <ButtonGroup.Primary>Salvar</ButtonGroup.Primary>
          <ButtonGroup.Chevron aria-label="Opções" />
        </ButtonGroup>
      </ExampleSection>

      {/* Variants */}
      <ExampleSection
        id="ex-variants"
        title="Variants"
        description="4 variants visuais — filled / outline / soft / ghost. Border interno colapsa entre os 2 slots."
        code={`<ButtonGroup variant="filled"> ... </ButtonGroup>\n<ButtonGroup variant="outline"> ... </ButtonGroup>\n<ButtonGroup variant="soft"> ... </ButtonGroup>\n<ButtonGroup variant="ghost"> ... </ButtonGroup>`}
      >
        <div className="flex flex-col gap-gp-md">
          <div className="flex items-center gap-gp-md">
            <span className="text-caption-sm text-fg-muted w-16">filled</span>
            <ButtonGroup variant="filled">
              <ButtonGroup.Primary>Salvar</ButtonGroup.Primary>
              <ButtonGroup.Chevron aria-label="Opções" />
            </ButtonGroup>
          </div>
          <div className="flex items-center gap-gp-md">
            <span className="text-caption-sm text-fg-muted w-16">outline</span>
            <ButtonGroup variant="outline">
              <ButtonGroup.Primary>Salvar</ButtonGroup.Primary>
              <ButtonGroup.Chevron aria-label="Opções" />
            </ButtonGroup>
          </div>
          <div className="flex items-center gap-gp-md">
            <span className="text-caption-sm text-fg-muted w-16">soft</span>
            <ButtonGroup variant="soft">
              <ButtonGroup.Primary>Salvar</ButtonGroup.Primary>
              <ButtonGroup.Chevron aria-label="Opções" />
            </ButtonGroup>
          </div>
          <div className="flex items-center gap-gp-md">
            <span className="text-caption-sm text-fg-muted w-16">ghost</span>
            <ButtonGroup variant="ghost">
              <ButtonGroup.Primary>Salvar</ButtonGroup.Primary>
              <ButtonGroup.Chevron aria-label="Opções" />
            </ButtonGroup>
          </div>
        </div>
      </ExampleSection>

      {/* Colors */}
      <ExampleSection
        id="ex-colors"
        title="Colors"
        description="5 colors semânticos — primary, secondary, critical, success, warning."
        code={`<ButtonGroup color="primary">...</ButtonGroup>\n<ButtonGroup color="secondary">...</ButtonGroup>\n<ButtonGroup color="critical">...</ButtonGroup>`}
      >
        <div className="flex flex-wrap gap-gp-md">
          <ButtonGroup color="primary">
            <ButtonGroup.Primary>Primary</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="Opções primary" />
          </ButtonGroup>
          <ButtonGroup color="secondary">
            <ButtonGroup.Primary>Secondary</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="Opções secondary" />
          </ButtonGroup>
          <ButtonGroup color="critical">
            <ButtonGroup.Primary iconLeft={<Trash2 />}>Deletar</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="Opções de deletar" />
          </ButtonGroup>
          <ButtonGroup color="success">
            <ButtonGroup.Primary>Aprovar</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="Opções de aprovação" />
          </ButtonGroup>
          <ButtonGroup color="warning">
            <ButtonGroup.Primary>Atenção</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="Opções de atenção" />
          </ButtonGroup>
        </div>
      </ExampleSection>

      {/* Sizes */}
      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="5 alturas — 2xs (28px) → lg (44px). Mesma escala do Button, sem icon-* (Chevron já é icon-only)."
        code={`<ButtonGroup size="lg">...</ButtonGroup>\n<ButtonGroup size="md">...</ButtonGroup>\n<ButtonGroup size="sm">...</ButtonGroup>\n<ButtonGroup size="xs">...</ButtonGroup>\n<ButtonGroup size="2xs">...</ButtonGroup>`}
      >
        <div className="flex flex-col items-start gap-gp-md">
          <ButtonGroup size="lg">
            <ButtonGroup.Primary>Large</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="lg" />
          </ButtonGroup>
          <ButtonGroup size="md">
            <ButtonGroup.Primary>Medium</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="md" />
          </ButtonGroup>
          <ButtonGroup size="sm">
            <ButtonGroup.Primary>Small</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="sm" />
          </ButtonGroup>
          <ButtonGroup size="xs">
            <ButtonGroup.Primary>Xsmall</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="xs" />
          </ButtonGroup>
          <ButtonGroup size="2xs">
            <ButtonGroup.Primary>2Xsmall</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="2xs" />
          </ButtonGroup>
        </div>
      </ExampleSection>

      {/* Disabled */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Group inteiro disabled, ou apenas um dos slots."
        code={`<ButtonGroup disabled> ... </ButtonGroup>\n\n<ButtonGroup>\n  <ButtonGroup.Primary disabled>...</ButtonGroup.Primary>\n  <ButtonGroup.Chevron aria-label="..." />\n</ButtonGroup>`}
      >
        <div className="flex flex-wrap gap-gp-xl">
          <ButtonGroup disabled>
            <ButtonGroup.Primary>Group disabled</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="..." />
          </ButtonGroup>
          <ButtonGroup>
            <ButtonGroup.Primary disabled>Primary disabled</ButtonGroup.Primary>
            <ButtonGroup.Chevron aria-label="Continua clicável" />
          </ButtonGroup>
          <ButtonGroup>
            <ButtonGroup.Primary>Continua clicável</ButtonGroup.Primary>
            <ButtonGroup.Chevron disabled aria-label="Chevron disabled" />
          </ButtonGroup>
        </div>
      </ExampleSection>

      {/* Loading */}
      <ExampleSection
        id="ex-loading"
        title="Loading"
        description="Spinner no Primary; Chevron normalmente fica disabled durante load."
        code={`<ButtonGroup>\n  <ButtonGroup.Primary loading>Salvando</ButtonGroup.Primary>\n  <ButtonGroup.Chevron disabled aria-label="..." />\n</ButtonGroup>`}
      >
        <ButtonGroup>
          <ButtonGroup.Primary loading>Salvando</ButtonGroup.Primary>
          <ButtonGroup.Chevron disabled aria-label="Opções" />
        </ButtonGroup>
      </ExampleSection>

      {/* Custom icon */}
      <ExampleSection
        id="ex-custom-icon"
        title="Custom Chevron Icon"
        description="Substitua o ChevronDown default pra cenários tipo menu kebab."
        code={`<ButtonGroup.Chevron icon={<MoreVertical />} aria-label="Menu" />`}
      >
        <ButtonGroup>
          <ButtonGroup.Primary>Item</ButtonGroup.Primary>
          <ButtonGroup.Chevron icon={<MoreVertical />} aria-label="Menu kebab" />
        </ButtonGroup>
      </ExampleSection>

      {/* Override */}
      <ExampleSection
        id="ex-override"
        title="Override por slot"
        description="Primary e Chevron podem dar override de color/variant/size individualmente."
        code={`<ButtonGroup variant="filled">\n  <ButtonGroup.Primary color="primary">Salvar</ButtonGroup.Primary>\n  <ButtonGroup.Chevron color="secondary" aria-label="..." />\n</ButtonGroup>`}
      >
        <ButtonGroup variant="filled">
          <ButtonGroup.Primary color="primary">Salvar</ButtonGroup.Primary>
          <ButtonGroup.Chevron color="secondary" aria-label="Mais opções" />
        </ButtonGroup>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <ExampleSection id="api-group" title="ButtonGroup (wrapper)" description="">
        <PropsTable items={GROUP_PROPS} />
      </ExampleSection>
      <ExampleSection id="api-primary" title="ButtonGroup.Primary" description="Aceita todas as props do <Button> exceto shape e fullWidth.">
        <PropsTable items={PRIMARY_PROPS} />
      </ExampleSection>
      <ExampleSection id="api-chevron" title="ButtonGroup.Chevron" description="Icon button compacto. aria-label obrigatório (icon-only).">
        <PropsTable items={CHEVRON_PROPS} />
      </ExampleSection>
    </DocLayout>
  );
}
