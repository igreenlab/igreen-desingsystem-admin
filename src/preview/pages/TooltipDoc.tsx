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
  { id: "ex-sobre-card", label: "Sobre card em hover" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "TooltipProvider", type: "wrapper opcional — só pra agrupar delay de vários triggers; o <Tooltip> já traz o seu", defaultVal: "—" },
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
        description="Dica contextual on-hover/focus (Radix). Tokenizada iGreen: surface + border + radius/shadow do DS, texto caption-sm. Aparece na hora (delayDuration 0) e NÃO precisa de TooltipProvider no root — o <Tooltip> embrulha o seu."
        dependency="@radix-ui/react-tooltip"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="Não precisa de provider: o <Tooltip> já traz o seu. Trigger via asChild herda o elemento."
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

      <ExampleSection
        id="ex-sobre-card"
        title="Sobre card em hover"
        description="O caso que motivou a bolha INVERTIDA: passe o mouse no card e depois no “?”. A bolha é escura no tema claro e clara no escuro, e por isso se separa de canvas, card e card-em-hover — três superfícies vizinhas. Até 2026-11-04 ela era um cinza da mesma família (`bg-bg-emphasis`) e media 1,10:1 contra o card em hover no claro, onde a WCAG 1.4.11 pede 3:1. Hoje mede 17,9:1 no claro e 14,3:1 no escuro. ⚠️ Não sobrescreva o fundo por className — a bolha é o único token invertido do DS, e existe só pra isto."
        code={`<div className="rounded-radius-lg bg-bg-surface p-pad-3xl hover:bg-bg-subtle">
  …conteúdo do card…
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant="ghost" size="icon-xs" aria-label="Ajuda">?</Button>
    </TooltipTrigger>
    <TooltipContent>Explica o rótulo acima.</TooltipContent>
  </Tooltip>
</div>`}
      >
        <TooltipProvider>
          <div className="flex flex-wrap gap-gp-xl">
            {["Em repouso", "Passe o mouse aqui"].map((rotulo) => (
              <div
                key={rotulo}
                className="flex min-w-[220px] flex-col gap-gp-md rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-3xl transition-colors hover:bg-bg-subtle"
              >
                <span className="text-caption-md text-fg-muted">{rotulo}</span>
                <div className="flex items-center gap-gp-md">
                  <span className="text-stat-sm tabular-nums text-fg-default">1.284</span>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        color="secondary"
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Ajuda sobre ${rotulo}`}
                      >
                        <Icon name="line-help" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      A bolha precisa se separar do card — inclusive do card em hover.
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
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
