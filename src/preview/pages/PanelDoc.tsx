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
import { Panel } from "../../components/ui/Panel";
import { Input } from "../../components/shadcn/input";
import { Label } from "../../components/shadcn/label";
import { Textarea } from "../../components/shadcn/textarea";
import { UserPlus, Trash2, AlertTriangle } from "lucide-react";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default — form drawer" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-sides", label: "Sides" },
  { id: "ex-no-footer", label: "Sem footer (read-only)" },
  { id: "ex-no-close", label: "Sem botão X (close)" },
  { id: "ex-destructive", label: "Destructive flow" },
  { id: "api", label: "API Reference" },
  { id: "api-panel", label: "<Panel>" },
];

const PROPS_PANEL = [
  { name: "open", type: "boolean", defaultVal: "—" },
  { name: "defaultOpen", type: "boolean", defaultVal: "false" },
  { name: "onOpenChange", type: "(open: boolean) => void", defaultVal: "—" },
  { name: "trigger", type: "ReactNode", defaultVal: "—" },
  { name: "side", type: '"left" | "right" | "top" | "bottom"', defaultVal: '"right"' },
  { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full" | string', defaultVal: '"md" (560px)' },
  { name: "title", type: "string", defaultVal: "—" },
  { name: "description", type: "string", defaultVal: "—" },
  { name: "titleIcon", type: "LucideIcon", defaultVal: "—" },
  { name: "hideClose", type: "boolean", defaultVal: "false" },
  { name: "footer", type: "ReactNode", defaultVal: "—" },
  { name: "children", type: "ReactNode (body)", defaultVal: "—", required: true },
];

export function PanelDoc() {
  const [openDefault, setOpenDefault] = useState(false);
  const [openSm, setOpenSm] = useState(false);
  const [openLg, setOpenLg] = useState(false);
  const [openLeft, setOpenLeft] = useState(false);
  const [openBottom, setOpenBottom] = useState(false);
  const [openReadOnly, setOpenReadOnly] = useState(false);
  const [openLocked, setOpenLocked] = useState(false);
  const [openDanger, setOpenDanger] = useState(false);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Panel"
        description="Drawer card flutuante (slide-in lateral) — header com título/close + body scrollável + footer com ações. Alinhado com o pattern `.tbl-form-drawer` do design-and-table-v2. Mobile-ready out of the box."
        dependency="@radix-ui/react-dialog"
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Default — form drawer */}
      <ExampleSection
        id="ex-default"
        title="Default — form drawer (Novo cliente)"
        description="Pattern típico: trigger externo, header com title + descrição + ícone, body com form fields, footer com Cancelar + Salvar."
        code={`const [open, setOpen] = useState(false);

<Button onClick={() => setOpen(true)}>Novo cliente</Button>

<Panel
  open={open}
  onOpenChange={setOpen}
  title="Novo cliente"
  description="Preencha os dados abaixo"
  titleIcon={UserPlus}
  footer={<>
    <Button color="secondary" variant="outline" onClick={() => setOpen(false)}>
      Cancelar
    </Button>
    <Button color="primary" onClick={() => setOpen(false)}>
      Salvar
    </Button>
  </>}
>
  {/* form fields */}
</Panel>`}
      >
        <Button
          color="primary"
          variant="filled"
          size="sm"
          iconLeft={<UserPlus className="size-4" />}
          onClick={() => setOpenDefault(true)}
        >
          Novo cliente
        </Button>
        <Panel
          open={openDefault}
          onOpenChange={setOpenDefault}
          title="Novo cliente"
          description="Preencha os dados abaixo pra cadastrar."
          titleIcon={UserPlus}
          footer={
            <>
              <Button color="secondary" variant="outline" size="md" onClick={() => setOpenDefault(false)}>
                Cancelar
              </Button>
              <Button color="primary" variant="filled" size="md" onClick={() => setOpenDefault(false)}>
                Salvar
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-gp-md">
            <Label htmlFor="name">Nome completo</Label>
            <Input id="name" placeholder="João Silva" />
          </div>
          <div className="flex flex-col gap-gp-md">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="joao@empresa.com" />
          </div>
          <div className="flex flex-col gap-gp-md">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" placeholder="+55 11 99999-9999" />
          </div>
          <div className="flex flex-col gap-gp-md">
            <Label htmlFor="notes">Observações</Label>
            <Textarea id="notes" placeholder="Notas internas..." rows={4} />
          </div>
        </Panel>
      </ExampleSection>

      {/* Sizes */}
      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="`sm` (320px), `md` (560px, default), `lg` (720px), `xl` (920px), `full` (viewport menos gutter). Aceita também string CSS arbitrária."
        code={`<Panel size="sm" ...>...</Panel>
<Panel size="lg" ...>...</Panel>
<Panel size="full" ...>...</Panel>`}
      >
        <div className="flex flex-wrap gap-gp-md">
          <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenSm(true)}>
            Open SM (320px)
          </Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenLg(true)}>
            Open LG (720px)
          </Button>
        </div>
        <Panel
          open={openSm}
          onOpenChange={setOpenSm}
          size="sm"
          title="Panel pequeno"
          description="Width 320px — útil pra filters ou inspectors."
        >
          <p className="text-body-md text-fg-muted">
            Conteúdo do panel pequeno. Útil pra mostrar detalhes rápidos sem
            ocupar muito espaço.
          </p>
        </Panel>
        <Panel
          open={openLg}
          onOpenChange={setOpenLg}
          size="lg"
          title="Panel grande"
          description="Width 720px — pra forms com 2 colunas ou conteúdo denso."
          footer={
            <Button color="primary" variant="filled" size="md" onClick={() => setOpenLg(false)}>
              Fechar
            </Button>
          }
        >
          <p className="text-body-md text-fg-muted">
            Conteúdo amplo aqui. 720px de largura cabe forms com 2 colunas, tabelas
            inline, etc.
          </p>
        </Panel>
      </ExampleSection>

      {/* Sides */}
      <ExampleSection
        id="ex-sides"
        title="Sides"
        description='Default `right`. Aceita também `left`, `top`, `bottom`. Mobile encolhe o gutter automaticamente.'
        code={`<Panel side="left" ...>...</Panel>
<Panel side="bottom" ...>...</Panel>`}
      >
        <div className="flex flex-wrap gap-gp-md">
          <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenLeft(true)}>
            Side left
          </Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenBottom(true)}>
            Side bottom
          </Button>
        </div>
        <Panel
          open={openLeft}
          onOpenChange={setOpenLeft}
          side="left"
          title="Panel à esquerda"
        >
          <p className="text-body-md text-fg-muted">Slide-in da esquerda.</p>
        </Panel>
        <Panel
          open={openBottom}
          onOpenChange={setOpenBottom}
          side="bottom"
          title="Panel inferior"
        >
          <p className="text-body-md text-fg-muted">Slide-in de baixo.</p>
        </Panel>
      </ExampleSection>

      {/* Sem footer */}
      <ExampleSection
        id="ex-no-footer"
        title="Sem footer (read-only / inspector)"
        description="Omita o prop `footer` quando o panel é só leitura — detalhes, preview, info."
        code={`<Panel title="Detalhes do cliente" {...}>
  {/* só conteúdo, sem ações */}
</Panel>`}
      >
        <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenReadOnly(true)}>
          Open read-only
        </Button>
        <Panel
          open={openReadOnly}
          onOpenChange={setOpenReadOnly}
          title="Detalhes do cliente"
          description="Visualização — sem ações de edição"
        >
          <dl className="flex flex-col gap-gp-2xl">
            <div>
              <dt className="text-body-xs text-fg-subtle uppercase tracking-wider">Nome</dt>
              <dd className="text-body-lg text-fg-default mt-gp-xs">João Silva</dd>
            </div>
            <div>
              <dt className="text-body-xs text-fg-subtle uppercase tracking-wider">E-mail</dt>
              <dd className="text-body-lg text-fg-default mt-gp-xs">joao@empresa.com</dd>
            </div>
            <div>
              <dt className="text-body-xs text-fg-subtle uppercase tracking-wider">Telefone</dt>
              <dd className="text-body-lg text-fg-default mt-gp-xs">+55 11 99999-9999</dd>
            </div>
          </dl>
        </Panel>
      </ExampleSection>

      {/* Sem close X */}
      <ExampleSection
        id="ex-no-close"
        title="Sem botão X (fluxo obrigatório)"
        description="`hideClose` esconde o X do header. Use quando o usuário PRECISA tomar uma decisão (ex: aceitar termos). Esc/click-outside continuam fechando — pra trancar 100%, controle via `open` sem onOpenChange."
        code={`<Panel hideClose title="Termos de uso" footer={
  <Button onClick={() => setOpen(false)}>Aceito</Button>
}>...</Panel>`}
      >
        <Button color="secondary" variant="outline" size="sm" onClick={() => setOpenLocked(true)}>
          Open sem X
        </Button>
        <Panel
          open={openLocked}
          onOpenChange={setOpenLocked}
          hideClose
          title="Termos de uso"
          description="Você precisa aceitar pra continuar"
          footer={
            <Button color="primary" variant="filled" size="md" onClick={() => setOpenLocked(false)}>
              Aceito
            </Button>
          }
        >
          <p className="text-body-md text-fg-muted">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vou repetir
            esse texto pra simular um documento longo...
          </p>
        </Panel>
      </ExampleSection>

      {/* Destructive */}
      <ExampleSection
        id="ex-destructive"
        title="Destructive flow"
        description="Footer aceita qualquer composição — botões destrutivos, links, etc."
        code={`footer={<>
  <Button color="secondary" variant="outline">Cancelar</Button>
  <Button color="critical" variant="filled">Excluir</Button>
</>}`}
      >
        <Button color="critical" variant="filled" size="sm" iconLeft={<Trash2 className="size-4" />} onClick={() => setOpenDanger(true)}>
          Excluir cliente
        </Button>
        <Panel
          open={openDanger}
          onOpenChange={setOpenDanger}
          title="Excluir cliente"
          description="Esta ação é permanente"
          titleIcon={AlertTriangle}
          footer={
            <>
              <Button color="secondary" variant="outline" size="md" onClick={() => setOpenDanger(false)}>
                Cancelar
              </Button>
              <Button color="critical" variant="filled" size="md" iconLeft={<Trash2 className="size-4" />} onClick={() => setOpenDanger(false)}>
                Sim, excluir
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-gp-xl">
            <p className="text-body-lg text-fg-default">
              Tem certeza que deseja excluir <strong>João Silva</strong>?
            </p>
            <p className="text-body-md text-fg-muted">
              Todos os tickets associados serão arquivados. Esta ação não pode
              ser desfeita.
            </p>
          </div>
        </Panel>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div id="api-panel" className="mb-14 scroll-mt-6">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-2xl">
          {"<Panel>"}
        </h3>
        <PropsTable items={PROPS_PANEL} />
      </div>
    </DocLayout>
  );
}
