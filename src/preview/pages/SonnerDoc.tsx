import { toast } from "sonner";
import { Button } from "../../components/ui/Button";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "construcao", label: "Construção" },
  { id: "examples", label: "Examples" },
  { id: "ex-status", label: "Status" },
  { id: "ex-position", label: "Posição" },
  { id: "ex-action", label: "Com ação" },
  { id: "ex-promise", label: "Promise" },
  { id: "api", label: "API Reference" },
];

const POSITIONS = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
] as const;

const PROPS = [
  { name: "<Toaster />", type: "monte 1× no root da app (já segue o tema do DS)", defaultVal: "—" },
  { name: "position (Toaster)", type: '"top-left" … "bottom-right" — posição global', defaultVal: '"bottom-right"' },
  { name: "toast(msg)", type: "toast neutro", defaultVal: "—" },
  { name: "toast.success / .error / .info / .warning", type: "toast por status (ícone automático)", defaultVal: "—" },
  { name: "toast(msg, { position })", type: "override de posição por toast", defaultVal: "—" },
  { name: "toast.promise(p, { loading, success, error })", type: "estado assíncrono", defaultVal: "—" },
  { name: "{ description, action }", type: "opções: subtexto + botão de ação", defaultVal: "—" },
];

export function SonnerDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Sonner"
        description="Notificações empilháveis (toasts). Tokenizado iGreen e self-contained (segue o tema pela classe .dark, sem next-themes). Monte <Toaster /> uma vez no root e dispare com toast.* do pacote sonner."
        dependency="sonner"
      />
      <DocSeparator />

      <SectionH2 id="construcao" title="Construção" />
      <p className="mb-gp-lg text-body-md text-fg-muted">
        Monte o <code className="text-fg-default">{"<Toaster />"}</code> UMA vez na raiz da app
        (layout/App). Depois dispare de qualquer lugar com <code className="text-fg-default">toast</code>.
        No preview ele já está montado.
      </p>
      <ExampleSection
        id="ex-setup"
        title="Setup"
        description="Toaster no root + uso em qualquer componente."
        code={`// app root (uma vez)
import { Toaster } from "@/components/ui/sonner";

export function App() {
  return (
    <>
      {/* ...sua app... */}
      <Toaster />
    </>
  );
}

// em qualquer lugar
import { toast } from "sonner";
toast("Evento criado");`}
      >
        <Button color="primary" variant="filled" size="sm" onClick={() => toast("Evento criado")}>
          toast("Evento criado")
        </Button>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-status"
        title="Status"
        description="Cada status traz seu ícone. Use pra feedback de ações (salvar, excluir, erro)."
        code={`toast.success("Empresa salva");
toast.error("Falha ao salvar");
toast.info("Sincronizando…");
toast.warning("Sessão expira em 5 min");`}
      >
        <div className="flex flex-wrap items-center gap-gp-sm">
          <Button color="success" variant="soft" size="sm" onClick={() => toast.success("Empresa salva")}>success</Button>
          <Button color="critical" variant="soft" size="sm" onClick={() => toast.error("Falha ao salvar")}>error</Button>
          <Button color="secondary" variant="soft" size="sm" onClick={() => toast.info("Sincronizando…")}>info</Button>
          <Button color="warning" variant="soft" size="sm" onClick={() => toast.warning("Sessão expira em 5 min")}>warning</Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => toast("Notificação simples")}>neutro</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-position"
        title="Posição"
        description="position no Toaster define a posição global; toast(msg, { position }) faz override por toast. 6 posições."
        code={`// global
<Toaster position="top-right" />

// por toast
toast("Aqui em cima", { position: "top-center" });`}
      >
        <div className="flex flex-wrap items-center gap-gp-sm">
          {POSITIONS.map((position) => (
            <Button
              key={position}
              color="secondary"
              variant="outline"
              size="sm"
              onClick={() => toast(position, { position })}
            >
              {position}
            </Button>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-action"
        title="Com ação"
        description="description (subtexto) + action (botão, ex.: Desfazer)."
        code={`toast("Cliente removido", {
  description: "A linha foi excluída da tabela.",
  action: { label: "Desfazer", onClick: () => {} },
});`}
      >
        <Button
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() =>
            toast("Cliente removido", {
              description: "A linha foi excluída da tabela.",
              action: { label: "Desfazer", onClick: () => toast.success("Restaurado") },
            })
          }
        >
          Remover (com Desfazer)
        </Button>
      </ExampleSection>

      <ExampleSection
        id="ex-promise"
        title="Promise"
        description="Estado assíncrono: loading → success/error automático."
        code={`toast.promise(salvar(), {
  loading: "Salvando…",
  success: "Salvo!",
  error: "Erro ao salvar",
});`}
      >
        <Button
          color="primary"
          variant="filled"
          size="sm"
          onClick={() =>
            toast.promise(
              new Promise((res) => setTimeout(res, 1500)),
              { loading: "Salvando…", success: "Salvo!", error: "Erro ao salvar" },
            )
          }
        >
          Salvar (promise)
        </Button>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default SonnerDoc;
