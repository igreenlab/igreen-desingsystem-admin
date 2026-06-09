import { useState } from "react";
import { Settings2, X } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  PopoverClose,
} from "../../components/shadcn/popover";
import { Button } from "../../components/ui/Button/button";
import { Input } from "../../components/shadcn/input";
import { Label } from "../../components/shadcn/label";
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
  { id: "ex-form", label: "Form + Close" },
  { id: "ex-align", label: "Posicionamento" },
  { id: "ex-controlled", label: "Controlado" },
  { id: "ex-anchor", label: "Anchor" },
  { id: "api", label: "API Reference" },
  { id: "api-root", label: "<Popover>" },
  { id: "api-content", label: "<PopoverContent>" },
  { id: "api-parts", label: "Trigger / Anchor / Close" },
];

const ROOT_PROPS = [
  { name: "open", type: "boolean", defaultVal: "—" },
  { name: "defaultOpen", type: "boolean", defaultVal: "false" },
  { name: "onOpenChange", type: "(open: boolean) => void", defaultVal: "—" },
  { name: "modal", type: "boolean", defaultVal: "false" },
];

const CONTENT_PROPS = [
  { name: "align", type: '"start" | "center" | "end"', defaultVal: '"center"' },
  { name: "side", type: '"top" | "right" | "bottom" | "left"', defaultVal: '"bottom"' },
  { name: "sideOffset", type: "number", defaultVal: "6" },
  { name: "alignOffset", type: "number", defaultVal: "0" },
  { name: "avoidCollisions", type: "boolean", defaultVal: "true" },
  { name: "mobileSheet", type: "boolean", defaultVal: "true" },
  { name: "disablePortal", type: "boolean", defaultVal: "false" },
  { name: "className", type: "string", defaultVal: "—" },
];

const PARTS_PROPS = [
  { name: "PopoverTrigger", type: "elemento que abre o popover (use `asChild`)", defaultVal: "—" },
  { name: "PopoverAnchor", type: "posiciona o popover sem ser o trigger (use `asChild`)", defaultVal: "—" },
  { name: "PopoverClose", type: "fecha o popover ao clicar (use `asChild`)", defaultVal: "—" },
];

export function PopoverDoc() {
  const [controlledOpen, setControlledOpen] = useState(false);
  const [anchorOpen, setAnchorOpen] = useState(false);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Popover"
        description="Container flutuante de baixo nível pra menus de configuração, forms curtos e conteúdo contextual. Visual unificado com DropdownMenu/Select — `bg-bg-dropdown` (frosted-glass no dark), border, radius 12px, shadow + halo `outline-float`. **Não tem `Item` próprio**: o consumer monta o conteúdo livremente. Pra menus de ação com itens semânticos + navegação por teclado, prefira `DropdownMenu`."
        dependency="@radix-ui/react-popover"
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Trigger + conteúdo livre. Por padrão abre abaixo (`side=bottom`), centralizado (`align=center`), com `sideOffset=6`. Fecha ao clicar fora ou pressionar Esc."
        code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" color="secondary">Abrir popover</Button>
  </PopoverTrigger>
  <PopoverContent className="w-[260px] p-pad-xl">
    <p className="text-body-sm font-semibold text-fg-default">Sobre este item</p>
    <p className="text-body-sm text-fg-muted mt-gp-xs">
      Conteúdo contextual qualquer — texto, ações, mídia.
    </p>
  </PopoverContent>
</Popover>`}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" color="secondary" size="sm">
              Abrir popover
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-pad-xl">
            <p className="text-body-sm font-semibold text-fg-default">Sobre este item</p>
            <p className="text-body-sm text-fg-muted mt-gp-xs">
              Conteúdo contextual qualquer — texto, ações, mídia. O Popover só dá o container
              + posicionamento; o resto é com você.
            </p>
          </PopoverContent>
        </Popover>
      </ExampleSection>

      {/* Form + Close */}
      <ExampleSection
        id="ex-form"
        title="Form curto + PopoverClose"
        description="O Popover comporta inputs e selects (diferente do DropdownMenu). Use `PopoverClose` pra fechar via um botão interno (X no header, Cancelar, etc)."
        code={`<Popover>
  <PopoverTrigger asChild>
    <Button variant="outline" iconLeft={<Settings2 />}>Dimensões</Button>
  </PopoverTrigger>
  <PopoverContent className="w-[280px] p-pad-xl flex flex-col gap-form-gap">
    <div className="flex items-center justify-between">
      <span className="text-caption-sm font-semibold uppercase tracking-wide text-fg-muted">Dimensões</span>
      <PopoverClose asChild>
        <Button variant="ghost" color="secondary" size="icon-xs" aria-label="Fechar"><X /></Button>
      </PopoverClose>
    </div>
    <div className="flex flex-col gap-gp-xs">
      <Label htmlFor="w">Largura</Label>
      <Input id="w" defaultValue="320" />
    </div>
    <div className="flex flex-col gap-gp-xs">
      <Label htmlFor="h">Altura</Label>
      <Input id="h" defaultValue="240" />
    </div>
  </PopoverContent>
</Popover>`}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" color="secondary" size="sm" iconLeft={<Settings2 className="size-4" />}>
              Dimensões
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-pad-xl flex flex-col gap-form-gap">
            <div className="flex items-center justify-between">
              <span className="text-caption-sm font-semibold uppercase tracking-wide text-fg-muted">
                Dimensões
              </span>
              <PopoverClose asChild>
                <Button variant="ghost" color="secondary" size="icon-xs" aria-label="Fechar">
                  <X />
                </Button>
              </PopoverClose>
            </div>
            <div className="flex flex-col gap-gp-xs">
              <Label htmlFor="w">Largura</Label>
              <Input id="w" defaultValue="320" />
            </div>
            <div className="flex flex-col gap-gp-xs">
              <Label htmlFor="h">Altura</Label>
              <Input id="h" defaultValue="240" />
            </div>
          </PopoverContent>
        </Popover>
      </ExampleSection>

      {/* Posicionamento */}
      <ExampleSection
        id="ex-align"
        title="Posicionamento (side + align)"
        description="`side` controla o lado (top/right/bottom/left) e `align` o alinhamento no eixo cruzado (start/center/end). `avoidCollisions` (default true) reposiciona automaticamente perto da borda da viewport."
        code={`<PopoverContent side="right" align="start">…</PopoverContent>
<PopoverContent side="top" align="end">…</PopoverContent>`}
      >
        <div className="flex flex-wrap gap-gp-md">
          {([
            { side: "bottom", align: "start" },
            { side: "top", align: "center" },
            { side: "right", align: "start" },
          ] as const).map(({ side, align }) => (
            <Popover key={`${side}-${align}`}>
              <PopoverTrigger asChild>
                <Button variant="outline" color="secondary" size="sm">
                  {side} · {align}
                </Button>
              </PopoverTrigger>
              <PopoverContent side={side} align={align} className="w-[200px] p-pad-lg">
                <p className="text-body-sm text-fg-muted">
                  side=<code className="text-fg-default">{side}</code> align=
                  <code className="text-fg-default">{align}</code>
                </p>
              </PopoverContent>
            </Popover>
          ))}
        </div>
      </ExampleSection>

      {/* Controlado */}
      <ExampleSection
        id="ex-controlled"
        title="Controlado (open / onOpenChange)"
        description="Controle a abertura externamente via `open` + `onOpenChange` — útil pra abrir programaticamente (atalho de teclado, query param, fluxo guiado)."
        code={`const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Abrir externamente</Button>

<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger asChild>
    <Button variant="outline">Trigger</Button>
  </PopoverTrigger>
  <PopoverContent>{/* … */}</PopoverContent>
</Popover>`}
      >
        <div className="flex items-center gap-gp-md">
          <Button color="primary" variant="filled" size="sm" onClick={() => setControlledOpen(true)}>
            Abrir externamente
          </Button>
          <Popover open={controlledOpen} onOpenChange={setControlledOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" color="secondary" size="sm">
                Trigger {controlledOpen ? "(aberto)" : ""}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[240px] p-pad-xl">
              <p className="text-body-sm text-fg-muted">
                Estado controlado — `open` vem do consumer. Fechar daqui chama `onOpenChange(false)`.
              </p>
            </PopoverContent>
          </Popover>
        </div>
      </ExampleSection>

      {/* Anchor */}
      <ExampleSection
        id="ex-anchor"
        title="Anchor (posicionar sem ser o trigger)"
        description="`PopoverAnchor` ancora o popover num elemento que NÃO é o gatilho de abertura. Útil quando outro controle (ou um wrapper) deve posicionar o popover enquanto a abertura é controlada externamente — pattern usado no split button do `ToolbarFilterControl`."
        code={`<Popover open={open} onOpenChange={setOpen}>
  <PopoverAnchor asChild>
    <div className="inline-flex">{/* wrapper âncora */}</div>
  </PopoverAnchor>
  <PopoverContent>{/* posiciona relativo ao anchor */}</PopoverContent>
</Popover>`}
      >
        <Popover open={anchorOpen} onOpenChange={setAnchorOpen}>
          <PopoverAnchor asChild>
            <div className="inline-flex items-center gap-gp-md rounded-radius-lg border border-border-default px-pad-xl py-pad-md">
              <span className="text-body-sm text-fg-muted">Elemento âncora</span>
              <Button variant="soft" color="secondary" size="xs" onClick={() => setAnchorOpen((o) => !o)}>
                {anchorOpen ? "Fechar" : "Abrir"}
              </Button>
            </div>
          </PopoverAnchor>
          <PopoverContent align="start" className="w-[240px] p-pad-xl">
            <p className="text-body-sm text-fg-muted">
              Posicionado relativo ao <strong className="text-fg-default">anchor</strong>, não ao botão.
              Abertura controlada via state.
            </p>
          </PopoverContent>
        </Popover>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div id="api-root" className="mb-10 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">{"<Popover>"} (Root)</h3>
        <PropsTable items={ROOT_PROPS} />
      </div>

      <div id="api-content" className="mb-10 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">{"<PopoverContent>"}</h3>
        <PropsTable items={CONTENT_PROPS} />
        <p className="text-body-sm text-fg-muted mt-gp-lg">
          <code className="text-fg-default">mobileSheet</code> (default <code>true</code>): em telas
          &lt;md o popover vira <strong className="text-fg-default">sheet bottom-up</strong> colado
          nas bordas, com backdrop suave (toque fora fecha) + respiro no rodapé (pad-3xl, 20px) — imita
          Panel/Drawer no mobile. No desktop não muda nada. Passe <code>false</code> pra manter
          ancorado no trigger também em mobile. Mesmo nome/comportamento do <code>DropdownMenu</code>
          (regra compartilhada no globals.css que reposiciona o wrapper do Radix Popper).
        </p>
        <p className="text-body-sm text-fg-muted mt-gp-md">
          Use <code className="text-fg-default">disablePortal</code> quando o conteúdo usar libs
          (ex: dnd-kit) que conflitam com o <code>transform</code> do Floating UI no portal — é o
          que o <code>ColsPopover</code> faz pro drag de colunas.
        </p>
      </div>

      <div id="api-parts" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">Trigger / Anchor / Close</h3>
        <PropsTable items={PARTS_PROPS} />
      </div>
    </DocLayout>
  );
}
