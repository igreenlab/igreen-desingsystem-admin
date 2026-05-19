import { useState } from "react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";
import { Button } from "../../components/ui/Button/button";
import { FloatingPanel } from "../../components/ui/FloatingPanel";
import { Avatar, AvatarFallback } from "../../components/shadcn/avatar";
import { Chip } from "../../components/ui/Chip";
import {
  Info,
  Pencil,
  Trash2,
  UserCircle,
} from "lucide-react";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default — detail panel" },
  { id: "ex-resizable", label: "Resizable" },
  { id: "ex-maximizable", label: "Maximizable" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-sides", label: "Sides" },
  { id: "ex-title-slot", label: "Title slot custom" },
  { id: "ex-read-only", label: "Sem footer (read-only)" },
  { id: "api", label: "API Reference" },
  { id: "api-floating-panel", label: "<FloatingPanel>" },
];

const PROPS_FLOATING_PANEL = [
  { name: "open", type: "boolean", defaultVal: "—", required: true },
  { name: "onOpenChange", type: "(open: boolean) => void", defaultVal: "—", required: true },
  { name: "side", type: '"left" | "right"', defaultVal: '"right"' },
  { name: "size", type: '"sm" | "md" | "lg" | "xl" | number', defaultVal: '"md" (400px)' },
  { name: "title", type: "string", defaultVal: "—" },
  { name: "description", type: "string", defaultVal: "—" },
  { name: "titleIcon", type: "LucideIcon", defaultVal: "—" },
  { name: "titleSlot", type: "ReactNode", defaultVal: "—" },
  { name: "headerActions", type: "ReactNode", defaultVal: "—" },
  { name: "hideClose", type: "boolean", defaultVal: "false" },
  { name: "footer", type: "ReactNode", defaultVal: "—" },
  { name: "resizable", type: "boolean", defaultVal: "false" },
  { name: "resizableMinWidth", type: "number", defaultVal: "320" },
  { name: "resizableMaxWidth", type: "number", defaultVal: "800" },
  { name: "resizableStorageKey", type: "string", defaultVal: "—" },
  { name: "maximizable", type: "boolean", defaultVal: "false" },
  { name: "defaultMaximized", type: "boolean", defaultVal: "false" },
  { name: "closeOnEscape", type: "boolean", defaultVal: "true" },
  { name: "className", type: "string", defaultVal: "—" },
  { name: "children", type: "ReactNode (body)", defaultVal: "—", required: true },
];

export function FloatingPanelDoc() {
  const [openDefault, setOpenDefault] = useState(false);
  const [openResize, setOpenResize] = useState(false);
  const [openMax, setOpenMax] = useState(false);
  const [openSm, setOpenSm] = useState(false);
  const [openLg, setOpenLg] = useState(false);
  const [openXl, setOpenXl] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const [openSlot, setOpenSlot] = useState(false);
  const [openReadOnly, setOpenReadOnly] = useState(false);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="FloatingPanel"
        description="Drawer card flutuante **non-modal** — convive com a interação atrás (sem backdrop, sem foco trap). Suporta resize horizontal, maximize toggle e adapta pra sheet bottom-up em mobile. Use pra detail panels, side info, configurações secundárias."
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Default — detail panel */}
      <ExampleSection
        id="ex-default"
        title="Default — detail panel"
        description="Pattern típico: detalhe de uma row da tabela. Sem backdrop, ESC fecha, side=right size=md (400px). A tela atrás continua interativa."
        code={`const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Ver detalhes</Button>

<FloatingPanel
  open={open}
  onOpenChange={setOpen}
  title="Detalhes do cliente"
  description="ID: CLI-2401"
  footer={<>
    <Button variant="outline" color="secondary" size="sm" onClick={() => setOpen(false)}>
      Cancelar
    </Button>
    <Button variant="filled" color="primary" size="sm">Salvar</Button>
  </>}
>
  {/* conteúdo */}
</FloatingPanel>`}
      >
        <Button
          color="primary"
          variant="filled"
          size="sm"
          iconLeft={<Info className="size-4" />}
          onClick={() => setOpenDefault(true)}
        >
          Ver detalhes
        </Button>
        <FloatingPanel
          open={openDefault}
          onOpenChange={setOpenDefault}
          title="Detalhes do cliente"
          description="ID: CLI-2401"
          footer={
            <>
              <Button variant="outline" color="secondary" size="sm" onClick={() => setOpenDefault(false)}>
                Cancelar
              </Button>
              <Button variant="filled" color="primary" size="sm">
                Salvar
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-gp-xl p-pad-3xl">
            <p className="text-body-md text-fg-muted">
              Conteúdo do detail panel. A tabela atrás <strong>continua interativa</strong>:
              você pode clicar em outras rows, scrollar, filtrar — tudo isso sem fechar o
              FloatingPanel.
            </p>
          </div>
        </FloatingPanel>
      </ExampleSection>

      {/* Resizable */}
      <ExampleSection
        id="ex-resizable"
        title="Resizable"
        description="Adicione `resizable` pra ativar o drag handle no edge oposto ao `side`. `resizableStorageKey` persiste o último valor entre sessões."
        code={`<FloatingPanel
  resizable
  resizableMinWidth={320}
  resizableMaxWidth={800}
  resizableStorageKey="my-panel.width"
  ...
>`}
      >
        <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenResize(true)}>
          Open resizable
        </Button>
        <FloatingPanel
          open={openResize}
          onOpenChange={setOpenResize}
          title="Resizable panel"
          description="Arraste o edge esquerdo (linha sutil) pra mudar a largura"
          resizable
          resizableStorageKey="doc.floating-panel.resizable-demo"
        >
          <div className="flex flex-col gap-gp-xl p-pad-3xl text-body-md text-fg-muted">
            <p>
              Posicione o cursor no <strong>edge esquerdo</strong> do panel — uma linha
              vertical sutil aparece. Clique e arraste pra ajustar.
            </p>
            <p>
              O valor é persistido em <code className="text-fg-default">localStorage</code> sob
              a chave passada em <code className="text-fg-default">resizableStorageKey</code>.
            </p>
          </div>
        </FloatingPanel>
      </ExampleSection>

      {/* Maximizable */}
      <ExampleSection
        id="ex-maximizable"
        title="Maximizable"
        description="Adicione `maximizable` pra mostrar o botão de maximize/restore no header. Quando maximizado, o resize handle some — o panel ocupa quase a tela inteira (16px gutter)."
        code={`<FloatingPanel maximizable resizable ...>`}
      >
        <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenMax(true)}>
          Open maximizable
        </Button>
        <FloatingPanel
          open={openMax}
          onOpenChange={setOpenMax}
          title="Panel com maximize"
          description="Clique no ícone de maximize no header"
          resizable
          maximizable
          resizableStorageKey="doc.floating-panel.max-demo"
          footer={
            <Button variant="filled" color="primary" size="sm" onClick={() => setOpenMax(false)}>
              Fechar
            </Button>
          }
        >
          <div className="flex flex-col gap-gp-xl p-pad-3xl text-body-md text-fg-muted">
            <p>
              Use o botão de <strong>maximize</strong> no header (próximo ao X) pra
              expandir o panel pra quase a tela inteira. Clique de novo no mesmo botão
              (agora <em>minimize</em>) pra restaurar a largura anterior.
            </p>
            <p>
              <em>Note:</em> em mobile (max-md) o botão de maximize fica escondido pq o
              panel já ocupa fullscreen via sheet bottom-up.
            </p>
          </div>
        </FloatingPanel>
      </ExampleSection>

      {/* Sizes */}
      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="`sm` (320px), `md` (400px, default), `lg` (560px), `xl` (720px). Aceita também `number` (px) pra valor arbitrário."
        code={`<FloatingPanel size="sm" ...>...
<FloatingPanel size="lg" ...>...
<FloatingPanel size={520} ...>...`}
      >
        <div className="flex flex-wrap gap-gp-md">
          <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenSm(true)}>
            SM (320)
          </Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenLg(true)}>
            LG (560)
          </Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenXl(true)}>
            XL (720)
          </Button>
        </div>
        <FloatingPanel
          open={openSm}
          onOpenChange={setOpenSm}
          size="sm"
          title="Panel SM"
          description="320px — info / preview"
        >
          <p className="text-body-md text-fg-muted p-pad-3xl">
            Tamanho mínimo confortável pra labels + valores curtos.
          </p>
        </FloatingPanel>
        <FloatingPanel
          open={openLg}
          onOpenChange={setOpenLg}
          size="lg"
          title="Panel LG"
          description="560px — forms ou conteúdo denso"
        >
          <p className="text-body-md text-fg-muted p-pad-3xl">
            Cabe forms com 2 colunas ou listas com mais informação por row.
          </p>
        </FloatingPanel>
        <FloatingPanel
          open={openXl}
          onOpenChange={setOpenXl}
          size="xl"
          title="Panel XL"
          description="720px — máximo recomendado pra panel non-modal"
        >
          <p className="text-body-md text-fg-muted p-pad-3xl">
            Pra conteúdo ainda maior, considere usar `&lt;Panel&gt;` (modal) ou uma tela
            dedicada — non-modal grande demais começa a competir com o conteúdo atrás.
          </p>
        </FloatingPanel>
      </ExampleSection>

      {/* Sides */}
      <ExampleSection
        id="ex-sides"
        title="Sides"
        description="Default `right`. Aceita também `left`. O resize handle fica no edge oposto ao `side`."
        code={`<FloatingPanel side="left" resizable ...>`}
      >
        <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenLeft(true)}>
          Side left
        </Button>
        <FloatingPanel
          open={openLeft}
          onOpenChange={setOpenLeft}
          side="left"
          title="Panel à esquerda"
          resizable
        >
          <p className="text-body-md text-fg-muted p-pad-3xl">
            Slide-in da esquerda. Resize handle no edge direito.
          </p>
        </FloatingPanel>
      </ExampleSection>

      {/* Title slot custom */}
      <ExampleSection
        id="ex-title-slot"
        title="Title slot custom"
        description="Use `titleSlot` pra substituir o bloco padrão de title/description por JSX custom — útil quando o header precisa de avatar, status dot, chips, etc. `headerActions`, close e maximize continuam à direita."
        code={`<FloatingPanel
  titleSlot={
    <div className="flex items-center gap-gp-md">
      <Avatar><AvatarFallback>MS</AvatarFallback></Avatar>
      <div>
        <div className="font-semibold">Maria Silva</div>
        <div className="text-fg-muted">CLI-2401 · Ativo</div>
      </div>
    </div>
  }
  headerActions={
    <>
      <Button variant="soft" size="icon-sm"><Pencil /></Button>
      <Button variant="soft" color="critical" size="icon-sm"><Trash2 /></Button>
    </>
  }
>`}
      >
        <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenSlot(true)}>
          Open com titleSlot
        </Button>
        <FloatingPanel
          open={openSlot}
          onOpenChange={setOpenSlot}
          titleSlot={
            <div className="flex items-center gap-gp-md min-w-0">
              <Avatar className="size-[40px] shrink-0" style={{ background: "#0fc589" }}>
                <AvatarFallback className="bg-transparent text-white text-body-md font-bold">
                  MS
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="text-body-md font-semibold text-fg-default truncate">
                  Maria Silva
                </div>
                <div className="flex items-center gap-[6px] mt-[2px] text-body-xs font-normal text-fg-muted">
                  <span>CLI-2401</span>
                  <span className="opacity-50">·</span>
                  <Chip color="success" variant="soft" size="sm" shape="pill">
                    Ativo
                  </Chip>
                </div>
              </div>
            </div>
          }
          headerActions={
            <>
              <Button variant="soft" color="secondary" size="icon-sm" aria-label="Editar">
                <Pencil />
              </Button>
              <Button variant="soft" color="critical" size="icon-sm" aria-label="Excluir">
                <Trash2 />
              </Button>
            </>
          }
          resizable
          maximizable
          footer={
            <>
              <Button variant="outline" color="secondary" size="sm" onClick={() => setOpenSlot(false)}>
                Cancelar
              </Button>
              <Button variant="filled" color="primary" size="sm">
                Salvar alterações
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-gp-xl p-pad-3xl text-body-md text-fg-muted">
            <p>
              Esse é o pattern usado no <strong>DetailDrawer</strong> da página de
              CRUD — header rico com avatar + nome + ID + status, mais botões de Edit e
              Delete como <code className="text-fg-default">headerActions</code>.
            </p>
          </div>
        </FloatingPanel>
      </ExampleSection>

      {/* Sem footer */}
      <ExampleSection
        id="ex-read-only"
        title="Sem footer (read-only)"
        description="Omita `footer` pra panels só de visualização. Combine com `titleIcon` pra reforçar a natureza informativa."
        code={`<FloatingPanel title="Informações" titleIcon={UserCircle}>
  {/* só conteúdo, sem ações */}
</FloatingPanel>`}
      >
        <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenReadOnly(true)}>
          Open read-only
        </Button>
        <FloatingPanel
          open={openReadOnly}
          onOpenChange={setOpenReadOnly}
          title="Informações do cliente"
          description="Visualização — sem ações"
          titleIcon={UserCircle}
        >
          <dl className="flex flex-col gap-gp-2xl p-pad-3xl">
            <div>
              <dt className="text-body-xs text-fg-subtle uppercase tracking-wider">Nome</dt>
              <dd className="text-body-lg text-fg-default mt-gp-xs">Maria Silva</dd>
            </div>
            <div>
              <dt className="text-body-xs text-fg-subtle uppercase tracking-wider">E-mail</dt>
              <dd className="text-body-lg text-fg-default mt-gp-xs">maria@example.com</dd>
            </div>
            <div>
              <dt className="text-body-xs text-fg-subtle uppercase tracking-wider">Status</dt>
              <dd className="mt-gp-xs">
                <Chip color="success" variant="soft" size="sm" shape="pill">Ativo</Chip>
              </dd>
            </div>
          </dl>
        </FloatingPanel>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div id="api-floating-panel" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">
          {"<FloatingPanel>"}
        </h3>
        <PropsTable items={PROPS_FLOATING_PANEL} />
      </div>
    </DocLayout>
  );
}
