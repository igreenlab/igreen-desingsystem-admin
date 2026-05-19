import { useState } from "react";
import { Bell, CheckCircle2, X } from "lucide-react";
import {
  Chip,
  ChipGroup,
  ChipGroupItem,
} from "../../components/ui/Chip";
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
  { id: "ex-default", label: "Default" },
  { id: "ex-colors", label: "Colors" },
  { id: "ex-variants", label: "Variants" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-shape", label: "Shape (pill / rounded)" },
  { id: "ex-icons", label: "Com ícones" },
  { id: "ex-interactive", label: "Interativo (button)" },
  { id: "ex-single", label: "Group single" },
  { id: "ex-multiple", label: "Group multiple" },
  { id: "api", label: "API Reference" },
];

const CHIP_PROPS = [
  { name: "color", type: '"primary" | "neutral" | "danger" | "warning" | "success" | "info"', defaultVal: '"neutral"' },
  { name: "variant", type: '"solid" | "outline" | "soft" | "soft-outline"', defaultVal: '"soft"' },
  { name: "size", type: '"sm" | "md" | "lg" | "xl"', defaultVal: '"md"' },
  { name: "shape", type: '"pill" | "rounded"', defaultVal: '"pill"' },
  { name: "selected", type: "boolean", defaultVal: "false" },
  { name: "onClick", type: "() => void", defaultVal: "—" },
  { name: "asButton", type: "boolean", defaultVal: "false" },
];

const GROUP_PROPS = [
  { name: "type", type: '"single" | "multiple"', defaultVal: "—" },
  { name: "value", type: "string | string[]", defaultVal: "—" },
  { name: "onValueChange", type: "(v) => void", defaultVal: "—" },
  { name: "inactiveColor", type: "ChipColor", defaultVal: '"neutral"' },
  { name: "inactiveVariant", type: "ChipVariant", defaultVal: '"outline"' },
  { name: "activeColor", type: "ChipColor", defaultVal: '"primary"' },
  { name: "activeVariant", type: "ChipVariant", defaultVal: '"soft-outline"' },
  { name: "size", type: '"sm" | "md" | "lg" | "xl"', defaultVal: '"md"' },
  { name: "shape", type: '"pill" | "rounded"', defaultVal: '"pill"' },
  { name: "orientation", type: '"horizontal" | "vertical"', defaultVal: '"horizontal"' },
];

const COLORS = ["primary", "neutral", "danger", "warning", "success", "info"] as const;
const VARIANTS = ["solid", "outline", "soft", "soft-outline"] as const;
const SIZES = ["sm", "md", "lg", "xl"] as const;

export function ChipDoc() {
  const [singleValue, setSingleValue] = useState("all");
  const [multipleValue, setMultipleValue] = useState<string[]>(["all"]);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Chip"
        description="Pílula compacta pra status, tags, filtros e abas. Pode ser estático (span) ou interativo (button). Combine com ChipGroup pra seleção single/multiple."
      />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-default"
        title="Default"
        description="Chip neutro estático com defaults (color='neutral', variant='soft', size='md')."
        code={`<Chip>Label</Chip>`}
      >
        <Chip>Label</Chip>
      </ExampleSection>

      <ExampleSection
        id="ex-colors"
        title="Colors"
        description="6 cores semânticas. Variant `soft` é o default — usado pra status/tags discretos."
        code={`<Chip color="primary">Primary</Chip>
<Chip color="neutral">Neutral</Chip>
<Chip color="danger">Danger</Chip>
<Chip color="warning">Warning</Chip>
<Chip color="success">Success</Chip>
<Chip color="info">Info</Chip>`}
      >
        <div className="flex flex-wrap gap-gp-md">
          {COLORS.map((c) => (
            <Chip key={c} color={c}>
              {c}
            </Chip>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-variants"
        title="Variants"
        description="Quatro variantes: solid (ênfase máxima) / outline (com borda) / soft (background sutil) / soft-outline (soft + borda definida)."
        code={`<Chip variant="solid"        color="primary">Solid</Chip>
<Chip variant="outline"      color="primary">Outline</Chip>
<Chip variant="soft"         color="primary">Soft</Chip>
<Chip variant="soft-outline" color="primary">Soft + Outline</Chip>`}
      >
        <div className="flex flex-col gap-gp-md">
          {COLORS.map((c) => (
            <div key={c} className="flex flex-wrap items-center gap-gp-md">
              <span className="text-body-xs font-normal font-mono text-fg-muted w-[60px]">
                {c}
              </span>
              {VARIANTS.map((v) => (
                <Chip key={v} color={c} variant={v}>
                  {v}
                </Chip>
              ))}
            </div>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="4 tamanhos: sm (24px) / md (28px = form-xs) / lg (32px = form-sm) / xl (36px = form-md, mesma altura do Button md)."
        code={`<Chip size="sm">Small</Chip>
<Chip size="md">Medium</Chip>
<Chip size="lg">Large</Chip>
<Chip size="xl">Extra large</Chip>`}
      >
        <div className="flex flex-wrap items-center gap-gp-md">
          {SIZES.map((s) => (
            <Chip key={s} size={s} color="primary">
              {s}
            </Chip>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-shape"
        title="Shape (pill / rounded)"
        description="`pill` (default) = `rounded-full`. `rounded` = canto arredondado igual ao Button (radius-md em sm/md, radius-lg em lg/xl). Mesma forma do `<Button>` quando usado lado a lado."
        code={`<Chip shape="pill"    size="md">Pill (default)</Chip>
<Chip shape="rounded" size="md">Rounded</Chip>

// ChipGroup também aceita shape:
<ChipGroup type="single" shape="rounded" ...>
  <ChipGroupItem value="a">A</ChipGroupItem>
</ChipGroup>`}
      >
        <div className="flex flex-col gap-gp-lg">
          {SIZES.map((s) => (
            <div key={s} className="flex items-center gap-gp-md">
              <span className="text-caption-sm font-mono text-fg-muted w-[40px]">
                {s}
              </span>
              <Chip size={s} shape="pill" color="primary">
                pill
              </Chip>
              <Chip size={s} shape="rounded" color="primary">
                rounded
              </Chip>
            </div>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-icons"
        title="Com ícones"
        description="Aceita qualquer ReactNode como children (ícone, contador, etc)."
        code={`<Chip color="success" variant="soft">
  <CheckCircle2 /> Aprovado
</Chip>

<Chip color="primary" variant="soft">
  <Bell /> 3
</Chip>

<Chip variant="outline" onClick={() => alert("X")}>
  Remover <X />
</Chip>`}
      >
        <div className="flex flex-wrap items-center gap-gp-md">
          <Chip color="success" variant="soft">
            <CheckCircle2 /> Aprovado
          </Chip>
          <Chip color="primary" variant="soft">
            <Bell /> 3
          </Chip>
          <Chip variant="outline" onClick={() => {}}>
            Remover <X />
          </Chip>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-interactive"
        title="Interativo (button)"
        description="Quando recebe `onClick`, vira `<button>` automaticamente — com focus ring + cursor pointer. Hover ajusta cor."
        code={`<Chip color="primary" variant="soft" onClick={() => alert("click")}>
  Clicável
</Chip>`}
      >
        <div className="flex flex-wrap items-center gap-gp-md">
          {VARIANTS.map((v) => (
            <Chip key={v} color="primary" variant={v} onClick={() => {}}>
              Click {v}
            </Chip>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-single"
        title="Group single (radio-like)"
        description="Escolha única. Estilo inativo e ativo configurados independentemente via `inactiveColor`/`inactiveVariant` e `activeColor`/`activeVariant`. Defaults: inativo `neutral outline`, ativo `primary soft-outline`."
        code={`const [value, setValue] = useState("all");

// Default — neutral outline (off) → primary soft-outline (on)
<ChipGroup type="single" value={value} onValueChange={setValue}>
  <ChipGroupItem value="all">Todas</ChipGroupItem>
  <ChipGroupItem value="unread">Não lidas</ChipGroupItem>
</ChipGroup>

// Customizado — off soft cinza, on solid success
<ChipGroup type="single" value={value} onValueChange={setValue}
           inactiveVariant="soft"
           activeColor="success"
           activeVariant="solid">
  ...
</ChipGroup>`}
      >
        <div className="flex flex-col gap-gp-2xl">
          <div className="flex flex-col gap-gp-xs">
            <span className="text-caption-sm font-mono text-fg-muted">
              default (inactive: neutral outline / active: primary soft-outline)
            </span>
            <ChipGroup
              type="single"
              value={singleValue}
              onValueChange={(val) => val && setSingleValue(val)}
              ariaLabel="Filtrar (default)"
            >
              <ChipGroupItem value="all">Todas</ChipGroupItem>
              <ChipGroupItem value="unread">Não lidas</ChipGroupItem>
              <ChipGroupItem value="mentions">Menções</ChipGroupItem>
            </ChipGroup>
          </div>

          <div className="flex flex-col gap-gp-xs">
            <span className="text-caption-sm font-mono text-fg-muted">
              inactive: soft / active: success solid
            </span>
            <ChipGroup
              type="single"
              value={singleValue}
              onValueChange={(val) => val && setSingleValue(val)}
              inactiveVariant="soft"
              activeColor="success"
              activeVariant="solid"
              ariaLabel="Filtrar (custom)"
            >
              <ChipGroupItem value="all">Todas</ChipGroupItem>
              <ChipGroupItem value="unread">Não lidas</ChipGroupItem>
              <ChipGroupItem value="mentions">Menções</ChipGroupItem>
            </ChipGroup>
          </div>

          <div className="flex flex-col gap-gp-xs">
            <span className="text-caption-sm font-mono text-fg-muted">
              inactive: outline / active: danger outline
            </span>
            <ChipGroup
              type="single"
              value={singleValue}
              onValueChange={(val) => val && setSingleValue(val)}
              activeColor="danger"
              activeVariant="outline"
              ariaLabel="Filtrar (danger outline)"
            >
              <ChipGroupItem value="all">Todas</ChipGroupItem>
              <ChipGroupItem value="unread">Não lidas</ChipGroupItem>
              <ChipGroupItem value="mentions">Menções</ChipGroupItem>
            </ChipGroup>
          </div>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-multiple"
        title="Group multiple (checkbox-like)"
        description="Escolha múltipla — cada chip alterna independentemente. Mesma API de estilo do single."
        code={`const [value, setValue] = useState<string[]>(["all"]);

<ChipGroup type="multiple" value={value} onValueChange={setValue}
           activeColor="success" activeVariant="soft-outline">
  <ChipGroupItem value="all">Todas</ChipGroupItem>
  <ChipGroupItem value="mentions">Menções</ChipGroupItem>
  <ChipGroupItem value="invites">Convites</ChipGroupItem>
</ChipGroup>`}
      >
        <ChipGroup
          type="multiple"
          value={multipleValue}
          onValueChange={setMultipleValue}
          activeColor="success"
          activeVariant="soft-outline"
          ariaLabel="Filtrar tags"
        >
          <ChipGroupItem value="all">Todas</ChipGroupItem>
          <ChipGroupItem value="mentions">Menções</ChipGroupItem>
          <ChipGroupItem value="invites">Convites</ChipGroupItem>
          <ChipGroupItem value="alerts">Alertas</ChipGroupItem>
        </ChipGroup>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <p className="text-body-md text-fg-muted mb-gp-lg">
        <strong className="text-fg-default">Chip</strong>:
      </p>
      <PropsTable items={CHIP_PROPS} />

      <p className="text-body-md text-fg-muted mt-gp-2xl mb-gp-lg">
        <strong className="text-fg-default">ChipGroup</strong>:
      </p>
      <PropsTable items={GROUP_PROPS} />
    </DocLayout>
  );
}
