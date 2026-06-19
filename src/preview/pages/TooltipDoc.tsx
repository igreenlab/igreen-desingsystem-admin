import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../components/shadcn/tooltip";
import { Button } from "../../components/ui/Button";
import { Icon } from "../../components/ui/Icon";
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
  { id: "ex-sides", label: "Lados" },
  { id: "ex-icon", label: "Botão só-ícone" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "TooltipProvider", type: "wrapper (1× no root) — controla delay global", defaultVal: "—" },
  { name: "Tooltip", type: "raiz (open/defaultOpen/onOpenChange)", defaultVal: "—" },
  { name: "TooltipTrigger", type: "gatilho — use `asChild` pra herdar o elemento", defaultVal: "—" },
  { name: "TooltipContent", type: "conteúdo — `side` / `sideOffset` / `align`", defaultVal: 'side="top"' },
];

export function TooltipDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Tooltip"
        description="Dica contextual on-hover/focus (Radix). Tokenizada iGreen: surface + border + radius/shadow do DS, texto body-sm. Requer um TooltipProvider no root."
        dependency="@radix-ui/react-tooltip"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Envolva a app com TooltipProvider (1×). Trigger via asChild herda o elemento."
        code={`<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <Button>Passe o mouse</Button>
    </TooltipTrigger>
    <TooltipContent>Dica útil aqui</TooltipContent>
  </Tooltip>
</TooltipProvider>`}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button color="secondary" variant="outline">Passe o mouse</Button>
            </TooltipTrigger>
            <TooltipContent>Dica útil aqui</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </ExampleSection>

      <ExampleSection
        id="ex-sides"
        title="Lados"
        description="side = top | right | bottom | left."
        code={`<TooltipContent side="right">…</TooltipContent>`}
      >
        <TooltipProvider>
          <div className="flex items-center gap-gp-lg">
            {(["top", "right", "bottom", "left"] as const).map((side) => (
              <Tooltip key={side}>
                <TooltipTrigger asChild>
                  <Button color="secondary" variant="outline" size="sm">{side}</Button>
                </TooltipTrigger>
                <TooltipContent side={side}>Lado {side}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </ExampleSection>

      <ExampleSection
        id="ex-icon"
        title="Botão só-ícone"
        description="Caso canônico: dar rótulo acessível a um botão de ícone (ações da DataTable)."
        code={`<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon-sm" aria-label="Editar">
      <Icon name="line-edit" />
    </Button>
  </TooltipTrigger>
  <TooltipContent>Editar</TooltipContent>
</Tooltip>`}
      >
        <TooltipProvider>
          <div className="flex items-center gap-gp-md">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button color="secondary" variant="ghost" size="icon-sm" aria-label="Editar">
                  <Icon name="line-edit" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button color="critical" variant="ghost" size="icon-sm" aria-label="Excluir">
                  <Icon name="line-bin" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Excluir</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default TooltipDoc;
