import { useState } from "react";
import { Bell, Save, Star } from "lucide-react";
import { CardCheckbox } from "../../components/ui/CardCheckbox";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

/* ═══════════════════════════════════════════════════════════════════════════
   CardCheckbox Documentation Page
   ═══════════════════════════════════════════════════════════════════════════ */

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Controlado" },
  { id: "ex-icon", label: "Com ícone" },
  { id: "ex-label-only", label: "Sem description" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "gotcha-label", label: "Label nativo (L-025)" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "label", type: "ReactNode (obrigatório)", defaultVal: "—" },
  { name: "description", type: "ReactNode", defaultVal: "—" },
  { name: "icon", type: "ReactNode (decorativo, aria-hidden)", defaultVal: "—" },
  { name: "checked", type: 'boolean | "indeterminate"', defaultVal: "—" },
  { name: "onCheckedChange", type: '(checked: boolean | "indeterminate") => void', defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
  { name: "className", type: "string (aplicado ao card root, não ao checkbox)", defaultVal: "—" },
];

export function CardCheckboxDoc() {
  const [save, setSave] = useState(true);
  const [notify, setNotify] = useState(false);
  const [favorite, setFavorite] = useState(true);
  const [simple, setSimple] = useState(false);

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Form"
        title="CardCheckbox"
        description="Checkbox apresentado como card clicável — label + description visíveis, área de clique grande. Mesma estética dos radio cards (bg-success-muted + border-brand no selected)."
        dependency="@radix-ui/react-checkbox"
      />

      <DocSeparator />

      {/* Hero */}
      <ExampleSection id="ex-hero" title="" description="">
        <div className="w-full max-w-xs">
          <CardCheckbox
            label="Salvar essa conta pra usar depois"
            description="A conta aparecerá nas próximas vezes em 'Contas cadastradas'."
            checked={save}
            onCheckedChange={(v) => setSave(v === true)}
          />
        </div>
      </ExampleSection>

      <SectionH2 id="examples" title="Examples" />

      {/* Controlado */}
      <ExampleSection
        id="ex-default"
        title="Controlado"
        description="Uso padrão — estado controlado via checked + onCheckedChange. O callback recebe boolean | 'indeterminate'; normalize com v === true antes de gravar num setState<boolean>."
        code={`const [save, setSave] = useState(true);\n\n<CardCheckbox\n  label="Salvar essa conta pra usar depois"\n  description="A conta aparecerá nas próximas vezes em 'Contas cadastradas'."\n  checked={save}\n  onCheckedChange={(v) => setSave(v === true)}\n/>`}
      >
        <div className="w-full max-w-xs">
          <CardCheckbox
            label="Salvar essa conta pra usar depois"
            description="A conta aparecerá nas próximas vezes em 'Contas cadastradas'."
            checked={save}
            onCheckedChange={(v) => setSave(v === true)}
          />
        </div>
      </ExampleSection>

      {/* Com ícone */}
      <ExampleSection
        id="ex-icon"
        title="Com ícone"
        description="ReactNode opcional renderizado à esquerda do body (depois do checkbox). É decorativo — vai dentro de um <span aria-hidden>, não use como controle clicável."
        code={`<CardCheckbox\n  icon={<Save className="size-icon-md text-fg-muted" />}\n  label="Salvar como modelo"\n  description="Reutilize esse preenchimento em novas transferências."\n  checked={favorite}\n  onCheckedChange={(v) => setFavorite(v === true)}\n/>`}
      >
        <div className="flex w-full max-w-xs flex-col gap-form-gap">
          <CardCheckbox
            icon={<Save className="size-icon-md text-fg-muted" />}
            label="Salvar como modelo"
            description="Reutilize esse preenchimento em novas transferências."
            checked={favorite}
            onCheckedChange={(v) => setFavorite(v === true)}
          />
          <CardCheckbox
            icon={<Bell className="size-icon-md text-fg-muted" />}
            label="Ativar notificações"
            description="Receba um aviso quando o status mudar."
            checked={notify}
            onCheckedChange={(v) => setNotify(v === true)}
          />
        </div>
      </ExampleSection>

      {/* Sem description */}
      <ExampleSection
        id="ex-label-only"
        title="Sem description"
        description="description é opcional — só o label também funciona. Pra aceite legal compacto (terms & conditions) prefira FormFieldCheckbox."
        code={`<CardCheckbox\n  icon={<Star className="size-icon-md text-fg-muted" />}\n  label="Marcar como favorito"\n  checked={simple}\n  onCheckedChange={(v) => setSimple(v === true)}\n/>`}
      >
        <div className="w-full max-w-xs">
          <CardCheckbox
            icon={<Star className="size-icon-md text-fg-muted" />}
            label="Marcar como favorito"
            checked={simple}
            onCheckedChange={(v) => setSimple(v === true)}
          />
        </div>
      </ExampleSection>

      {/* Disabled */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Desativa o card inteiro — opacity 50% + pointer-events none. Funciona checked ou não."
        code={`<CardCheckbox label="..." description="..." checked disabled />\n<CardCheckbox label="..." description="..." checked={false} disabled />`}
      >
        <div className="flex w-full max-w-xs flex-col gap-form-gap">
          <CardCheckbox
            label="Opção selecionada e bloqueada"
            description="Incluída no plano atual — não pode ser removida."
            checked
            disabled
          />
          <CardCheckbox
            label="Opção indisponível"
            description="Disponível apenas no plano Pro."
            checked={false}
            disabled
          />
        </div>
      </ExampleSection>

      <SectionH2 id="gotcha-label" title="Label nativo (L-025)" />

      <div className="mb-14 flex flex-col gap-gp-lg text-body-md text-fg-muted">
        <p>
          O card root é um <code className="font-mono text-code-sm text-fg-default">&lt;label htmlFor&gt;</code> nativo
          envolvendo um checkbox Radix real — <strong className="text-fg-default">não</strong> um{" "}
          <code className="font-mono text-code-sm text-fg-default">&lt;button onClick&gt;</code>. Isso preserva:
        </p>
        <ul className="flex flex-col gap-gp-sm list-disc pl-sp-2xl">
          <li>
            <strong className="text-fg-default">Acessibilidade</strong> — screen reader anuncia
            &ldquo;checkbox&rdquo; (não &ldquo;button&rdquo;), com estado checked/unchecked correto.
          </li>
          <li>
            <strong className="text-fg-default">Form integration</strong> — <code className="font-mono text-code-sm">name</code>/
            <code className="font-mono text-code-sm">value</code>/<code className="font-mono text-code-sm">required</code> do
            Radix participam do submit nativo do form.
          </li>
          <li>
            <strong className="text-fg-default">Click target</strong> — o clique em qualquer ponto do card propaga
            pro checkbox real via <code className="font-mono text-code-sm">htmlFor</code>, sem hacks de
            stopPropagation.
          </li>
        </ul>
        <p>
          Por isso o <code className="font-mono text-code-sm text-fg-default">id</code> é gerado internamente via{" "}
          <code className="font-mono text-code-sm text-fg-default">useId()</code> e não pode ser passado por prop
          (excluído do tipo). Ao criar futuros variants de card-input (CardRadio, CardSwitch), aplicar o mesmo
          pattern.
        </p>
      </div>

      <SectionH2 id="api" title="API Reference" />

      <ExampleSection
        id="api-card-checkbox"
        title="CardCheckbox"
        description="Aceita também as demais props do CheckboxPrimitive.Root do Radix (name, required, etc) — exceto id (gerado via useId) e className, que é aplicado ao card root."
      >
        <PropsTable items={PROPS} />
      </ExampleSection>
    </DocLayout>
  );
}
