import { useState } from "react";
import { Eye, Trash2, AlertTriangle, FileText, Settings } from "lucide-react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button/button";
import { FormFieldInput } from "../../components/ui/FormField/form-field-input";
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
  { id: "ex-basic", label: "Default (2 actions)" },
  { id: "ex-tertiary", label: "3 actions (com danger à esquerda)" },
  { id: "ex-no-icon", label: "Sem icon" },
  { id: "ex-custom-footer", label: "Footer custom" },
  { id: "ex-sizes", label: "Sizes (sm / md / lg)" },
  { id: "ex-no-footer", label: "Sem footer (só conteúdo)" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "open", type: "boolean", defaultVal: "—" },
  { name: "onClose", type: "() => void", defaultVal: "—" },
  { name: "icon", type: "ReactNode", defaultVal: "—" },
  { name: "title", type: "ReactNode", defaultVal: "—" },
  { name: "description", type: "ReactNode", defaultVal: "—" },
  { name: "children", type: "ReactNode", defaultVal: "—" },
  { name: "primaryAction", type: "ModalAction", defaultVal: "—" },
  { name: "secondaryAction", type: "ModalAction", defaultVal: "—" },
  { name: "tertiaryAction", type: "ModalAction (vai pra esquerda)", defaultVal: "—" },
  { name: "footer", type: "ReactNode (override total das actions)", defaultVal: "—" },
  { name: "size", type: '"sm" | "md" | "lg"', defaultVal: '"md"' },
  { name: "hideClose", type: "boolean", defaultVal: "false" },
  { name: "closeOnOverlay", type: "boolean", defaultVal: "true" },
];

const ACTION_PROPS = [
  { name: "label", type: "ReactNode", defaultVal: "—" },
  { name: "onClick", type: "() => void", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "loading", type: "boolean", defaultVal: "false" },
  { name: "danger", type: "boolean (pinta como critical)", defaultVal: "false" },
];

export function ModalDoc() {
  const [openBasic, setOpenBasic] = useState(false);
  const [openTertiary, setOpenTertiary] = useState(false);
  const [openNoIcon, setOpenNoIcon] = useState(false);
  const [openCustom, setOpenCustom] = useState(false);
  const [openSm, setOpenSm] = useState(false);
  const [openMd, setOpenMd] = useState(false);
  const [openLg, setOpenLg] = useState(false);
  const [openNoFooter, setOpenNoFooter] = useState(false);

  const [name, setName] = useState("");

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Overlays"
        title="Modal"
        description="Composto sobre Dialog (shadcn) com header rico (icon + título + descrição), body livre via children e footer flexível: até 3 actions estruturadas OU footer custom. Visual alinhado com o TblViewsModal do sandbox (md = 540px). Para confirmação destrutiva rápida, prefira o AlertModal."
      />

      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* ── Default ─────────────────────────────────────────────────── */}
      <ExampleSection
        id="ex-basic"
        title="Default (2 actions)"
        description="Estrutura padrão: icon + title + description no header, body livre, e 2 botões no footer (secondary à esquerda, primary à direita). Replica o TblViewsModal do sandbox."
        code={`<Modal
  open={open}
  onClose={() => setOpen(false)}
  icon={<Eye className="size-icon-md" strokeWidth={1.7} />}
  title="Adicionar nova visão"
  description="Salve sua configuração atual de filtros e colunas"
  primaryAction={{ label: "Salvar", onClick: handleSave, disabled: !name }}
  secondaryAction={{ label: "Fechar" }}
>
  <FormFieldInput label="Nome" placeholder="Ex: Royals..." />
</Modal>`}
      >
        <Button onClick={() => setOpenBasic(true)}>Abrir modal default</Button>
        <Modal
          open={openBasic}
          onClose={() => setOpenBasic(false)}
          icon={<Eye className="size-icon-md" strokeWidth={1.7} />}
          title="Adicionar nova visão"
          description="Salve sua configuração atual de filtros e colunas"
          primaryAction={{
            label: "Salvar",
            onClick: () => {
              console.log("salvar", name);
              setOpenBasic(false);
              setName("");
            },
            disabled: !name.trim(),
          }}
          secondaryAction={{ label: "Fechar" }}
        >
          <FormFieldInput
            label="Nome da visão"
            placeholder="Ex: Royals em atendimento"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Modal>
      </ExampleSection>

      {/* ── 3 actions ───────────────────────────────────────────────── */}
      <ExampleSection
        id="ex-tertiary"
        title="3 actions (tertiary à esquerda)"
        description="Quando passa tertiaryAction, o footer vira justify-between — tertiary à esquerda, secondary+primary à direita. Use pra ações destrutivas (danger) ou neutras (Ajuda, Mais opções)."
        code={`<Modal
  ...
  tertiaryAction={{ label: "Apagar", danger: true, onClick: handleDelete }}
  secondaryAction={{ label: "Cancelar" }}
  primaryAction={{ label: "Salvar", onClick: handleSave }}
/>`}
      >
        <Button onClick={() => setOpenTertiary(true)}>Abrir modal 3 actions</Button>
        <Modal
          open={openTertiary}
          onClose={() => setOpenTertiary(false)}
          icon={<Settings className="size-icon-md" strokeWidth={1.7} />}
          title="Editar configuração"
          description="Ajuste os parâmetros desta visualização"
          tertiaryAction={{
            label: "Apagar visão",
            danger: true,
            onClick: () => {
              console.log("apagar");
              setOpenTertiary(false);
            },
          }}
          secondaryAction={{ label: "Cancelar" }}
          primaryAction={{
            label: "Salvar alterações",
            onClick: () => setOpenTertiary(false),
          }}
        >
          <p className="text-body-md text-fg-default">
            Conteúdo do modal aqui. O botão "Apagar" fica à esquerda porque é a
            ação terciária — destaca semântica destrutiva sem competir com o CTA
            primário.
          </p>
        </Modal>
      </ExampleSection>

      {/* ── Sem icon ────────────────────────────────────────────────── */}
      <ExampleSection
        id="ex-no-icon"
        title="Sem icon"
        description="Quando omite `icon`, o header não renderiza o container 40×40 — título e descrição começam direto à esquerda."
        code={`<Modal
  open={open}
  onClose={...}
  title="Tem certeza?"
  description="Esta ação não pode ser desfeita."
  primaryAction={{ label: "Continuar" }}
  secondaryAction={{ label: "Cancelar" }}
/>`}
      >
        <Button onClick={() => setOpenNoIcon(true)}>Abrir modal sem icon</Button>
        <Modal
          open={openNoIcon}
          onClose={() => setOpenNoIcon(false)}
          title="Tem certeza?"
          description="Esta ação não pode ser desfeita imediatamente."
          primaryAction={{
            label: "Continuar",
            onClick: () => setOpenNoIcon(false),
          }}
          secondaryAction={{ label: "Cancelar" }}
        >
          <p className="text-body-md text-fg-default">
            Quando você continua, o registro vai pra lixeira e fica disponível
            por 30 dias.
          </p>
        </Modal>
      </ExampleSection>

      {/* ── Footer custom ───────────────────────────────────────────── */}
      <ExampleSection
        id="ex-custom-footer"
        title="Footer custom (escape hatch)"
        description="Quando passa `footer`, o componente ignora as 3 actions estruturadas e renderiza o nó direto. Use pra layouts especiais (steps indicator, link à esquerda, multi-acoes empilhadas, etc)."
        code={`<Modal
  ...
  footer={
    <>
      <a className="text-fg-brand">Saiba mais</a>
      <div className="flex gap-gp-lg">
        <Button color="secondary" variant="outline">Cancelar</Button>
        <Button>Continuar</Button>
      </div>
    </>
  }
/>`}
      >
        <Button onClick={() => setOpenCustom(true)}>Abrir modal footer custom</Button>
        <Modal
          open={openCustom}
          onClose={() => setOpenCustom(false)}
          icon={<FileText className="size-icon-md" strokeWidth={1.7} />}
          title="Termos de uso"
          description="Leia e aceite pra continuar"
          footer={
            <>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="text-body-md text-fg-brand font-medium hover:underline"
              >
                Ler termos completos
              </a>
              <div className="flex items-center gap-gp-lg">
                <Button color="secondary" variant="outline" size="md" onClick={() => setOpenCustom(false)}>
                  Recusar
                </Button>
                <Button size="md" onClick={() => setOpenCustom(false)}>
                  Aceitar
                </Button>
              </div>
            </>
          }
        >
          <p className="text-body-md text-fg-default">
            Ao continuar, você concorda com nossos termos de uso e política de
            privacidade. O footer dessa modal é totalmente custom — o link à
            esquerda usa justify-between automático (Modal aplica quando o footer
            tem 2+ filhos diretos).
          </p>
        </Modal>
      </ExampleSection>

      {/* ── Sizes ───────────────────────────────────────────────────── */}
      <ExampleSection
        id="ex-sizes"
        title="Sizes (sm / md / lg)"
        description="3 tamanhos: sm = 440px (confirmações pequenas), md = 540px (default — match sandbox), lg = 720px (forms maiores ou conteúdo denso)."
        code={`<Modal size="sm" ... />   // 440px
<Modal size="md" ... />   // 540px (default)
<Modal size="lg" ... />   // 720px`}
      >
        <div className="flex flex-wrap gap-gp-md">
          <Button size="sm" onClick={() => setOpenSm(true)}>Abrir sm (440)</Button>
          <Button size="sm" onClick={() => setOpenMd(true)}>Abrir md (540)</Button>
          <Button size="sm" onClick={() => setOpenLg(true)}>Abrir lg (720)</Button>
        </div>
        <Modal
          open={openSm}
          onClose={() => setOpenSm(false)}
          size="sm"
          icon={<AlertTriangle className="size-icon-md" strokeWidth={1.7} />}
          title="Confirmar ação"
          description="Tamanho sm — ideal pra confirmações"
          primaryAction={{ label: "Sim", onClick: () => setOpenSm(false) }}
          secondaryAction={{ label: "Não" }}
        />
        <Modal
          open={openMd}
          onClose={() => setOpenMd(false)}
          size="md"
          icon={<Settings className="size-icon-md" strokeWidth={1.7} />}
          title="Configurações (md)"
          description="540px — o tamanho padrão pra forms médios"
          primaryAction={{ label: "Salvar", onClick: () => setOpenMd(false) }}
          secondaryAction={{ label: "Cancelar" }}
        >
          <p className="text-body-md text-fg-muted">Conteúdo de exemplo.</p>
        </Modal>
        <Modal
          open={openLg}
          onClose={() => setOpenLg(false)}
          size="lg"
          icon={<FileText className="size-icon-md" strokeWidth={1.7} />}
          title="Editor (lg)"
          description="720px — forms longos, conteúdo denso, ou multi-coluna"
          primaryAction={{ label: "Publicar", onClick: () => setOpenLg(false) }}
          secondaryAction={{ label: "Cancelar" }}
        >
          <div className="grid grid-cols-2 gap-gp-2xl">
            <FormFieldInput label="Título" placeholder="Digite o título" />
            <FormFieldInput label="Autor" placeholder="Nome do autor" />
            <FormFieldInput label="Categoria" placeholder="Selecione" />
            <FormFieldInput label="Data" placeholder="DD/MM/AAAA" />
          </div>
        </Modal>
      </ExampleSection>

      {/* ── Sem footer ──────────────────────────────────────────────── */}
      <ExampleSection
        id="ex-no-footer"
        title="Sem footer"
        description="Sem actions e sem `footer`, o componente não renderiza a div de footer — útil pra modais informativos onde o usuário fecha pelo X ou ESC."
        code={`<Modal open={...} onClose={...} icon={...} title="..." description="...">
  {/* conteúdo */}
</Modal>`}
      >
        <Button onClick={() => setOpenNoFooter(true)}>Abrir modal sem footer</Button>
        <Modal
          open={openNoFooter}
          onClose={() => setOpenNoFooter(false)}
          icon={<AlertTriangle className="size-icon-md" strokeWidth={1.7} />}
          title="Aviso"
          description="Conteúdo informativo — feche pelo X ou pressione ESC"
        >
          <p className="text-body-md text-fg-default">
            Este modal não tem footer. O usuário só consegue fechar pelo botão X
            no canto superior direito, clicando fora do modal (overlay), ou
            pressionando ESC.
          </p>
        </Modal>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Modal</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Composto sobre <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">Dialog</code> do shadcn (Radix Dialog).
          O X de fechar, lock de scroll, ESC handler e overlay vêm prontos.
        </p>
        <PropsTable items={PROPS} />
      </div>

      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">ModalAction</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Shape passado em <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">primaryAction</code>,
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">secondaryAction</code> e
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">tertiaryAction</code>.
        </p>
        <PropsTable items={ACTION_PROPS} />
      </div>
    </DocLayout>
  );
}

export default ModalDoc;
