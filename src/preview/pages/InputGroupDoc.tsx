import { Search, Copy, Mail, Eye, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
  InputGroupText,
  InputGroupButton,
} from "../../components/shadcn/input-group";
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
  { id: "ex-text-prefix", label: "Text prefix" },
  { id: "ex-icon", label: "Icon prefix" },
  { id: "ex-both", label: "Start + End" },
  { id: "ex-button-inside", label: "Button inside" },
  { id: "ex-textarea", label: "Textarea" },
  { id: "ex-states", label: "States" },
  { id: "api", label: "API Reference" },
];

const GROUP_PROPS = [
  { name: "size", type: '"xxs" | "xs" | "sm" | "md"', defaultVal: '"md"' },
  {
    name: "state",
    type: '"default" | "error" | "warning" | "success"',
    defaultVal: '"default"',
  },
];

const ADDON_PROPS = [
  {
    name: "align",
    type: '"inline-start" | "inline-end" | "block-start" | "block-end"',
    defaultVal: '"inline-start"',
  },
];

const BUTTON_PROPS = [
  {
    name: "size",
    type: '"xs" | "icon-xs" | "sm" | "icon-sm"',
    defaultVal: '"xs"',
  },
  {
    name: "variant",
    type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
    defaultVal: '"ghost"',
  },
];

export function InputGroupDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Form Controls"
        title="Input Group"
        description="Composição rica pra inputs com prefixo, sufixo, ícones ou botões inline. Use quando o Input puro não basta. FormInput compõe InputGroup por dentro quando recebe startAddon/endAddon."
      />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-text-prefix"
        title="Text prefix"
        description="Prefixo textual (`R$`, `@`, `https://`) via <InputGroupText>."
        code={`<InputGroup>
  <InputGroupAddon align="inline-start">
    <InputGroupText>R$</InputGroupText>
  </InputGroupAddon>
  <InputGroupInput placeholder="0,00" />
</InputGroup>`}
      >
        <div className="max-w-sm w-full">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <InputGroupText>R$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="0,00" />
          </InputGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-icon"
        title="Icon prefix"
        description="Ícone Lucide à esquerda — passa direto dentro de <InputGroupAddon>."
        code={`<InputGroup>
  <InputGroupAddon align="inline-start">
    <Search />
  </InputGroupAddon>
  <InputGroupInput placeholder="Buscar..." />
</InputGroup>`}
      >
        <div className="max-w-sm w-full">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Search />
            </InputGroupAddon>
            <InputGroupInput placeholder="Buscar..." />
          </InputGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-both"
        title="Start + End"
        description="Combina ícone à esquerda com sufixo textual à direita."
        code={`<InputGroup>
  <InputGroupAddon align="inline-start">
    <Mail />
  </InputGroupAddon>
  <InputGroupInput placeholder="usuário" />
  <InputGroupAddon align="inline-end">
    <InputGroupText>@igreen.com</InputGroupText>
  </InputGroupAddon>
</InputGroup>`}
      >
        <div className="max-w-sm w-full">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Mail />
            </InputGroupAddon>
            <InputGroupInput placeholder="usuário" />
            <InputGroupAddon align="inline-end">
              <InputGroupText>@igreen.com</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-button-inside"
        title="Button inside"
        description="<InputGroupButton> é otimizado pra encaixar dentro do addon (sizes xs / icon-xs / sm / icon-sm)."
        code={`<InputGroup>
  <InputGroupInput type="password" placeholder="Senha" defaultValue="secret123" />
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="icon-xs" aria-label="Mostrar senha">
      <Eye />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>

<InputGroup>
  <InputGroupInput readOnly defaultValue="https://igreen.com/abc-123" />
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="icon-xs" aria-label="Copiar">
      <Copy />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>

<InputGroup>
  <InputGroupAddon align="inline-start">
    <Search />
  </InputGroupAddon>
  <InputGroupInput defaultValue="termo de busca" />
  <InputGroupAddon align="inline-end">
    <InputGroupButton size="icon-xs" aria-label="Limpar">
      <X />
    </InputGroupButton>
  </InputGroupAddon>
</InputGroup>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <InputGroup>
            <InputGroupInput
              type="password"
              placeholder="Senha"
              defaultValue="secret123"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Mostrar senha">
                <Eye />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupInput
              readOnly
              defaultValue="https://igreen.com/abc-123"
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Copiar">
                <Copy />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <Search />
            </InputGroupAddon>
            <InputGroupInput defaultValue="termo de busca" />
            <InputGroupAddon align="inline-end">
              <InputGroupButton size="icon-xs" aria-label="Limpar">
                <X />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-textarea"
        title="Textarea"
        description="Mesmo padrão funciona com <InputGroupTextarea>."
        code={`<InputGroup>
  <InputGroupTextarea placeholder="Conte mais..." rows={4} />
</InputGroup>`}
      >
        <div className="max-w-sm w-full">
          <InputGroup>
            <InputGroupTextarea placeholder="Conte mais..." rows={4} />
          </InputGroup>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-states"
        title="States"
        description="Mesma prop `state` do Input — borda e ring do focus mudam por status."
        code={`<InputGroup state="default"> ... </InputGroup>
<InputGroup state="error">   ... </InputGroup>
<InputGroup state="warning"> ... </InputGroup>
<InputGroup state="success"> ... </InputGroup>`}
      >
        <div className="flex flex-col gap-gp-xl max-w-sm w-full">
          <InputGroup state="default">
            <InputGroupAddon align="inline-start">
              <InputGroupText>R$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput placeholder="default" />
          </InputGroup>
          <InputGroup state="error">
            <InputGroupAddon align="inline-start">
              <InputGroupText>R$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput defaultValue="erro" />
          </InputGroup>
          <InputGroup state="warning">
            <InputGroupAddon align="inline-start">
              <InputGroupText>R$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput defaultValue="warning" />
          </InputGroup>
          <InputGroup state="success">
            <InputGroupAddon align="inline-start">
              <InputGroupText>R$</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput defaultValue="ok" />
          </InputGroup>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <p className="text-body-md text-fg-muted mb-gp-lg">InputGroup</p>
      <PropsTable items={GROUP_PROPS} />

      <p className="text-body-md text-fg-muted mt-gp-2xl mb-gp-lg">
        InputGroupAddon
      </p>
      <PropsTable items={ADDON_PROPS} />

      <p className="text-body-md text-fg-muted mt-gp-2xl mb-gp-lg">
        InputGroupButton
      </p>
      <PropsTable items={BUTTON_PROPS} />
    </DocLayout>
  );
}
