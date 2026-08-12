import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "../../components/shadcn/alert-dialog";
import { Button } from "../../components/ui/Button/button";
import { Trash2, TriangleAlert } from "lucide-react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "quando", label: "Quando usar (vs Dialog e AlertModal)" },
  { id: "examples", label: "Examples" },
  { id: "ex-destrutivo", label: "Confirmação destrutiva" },
  { id: "ex-icone", label: "Com ícone de tom" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "open", type: "boolean", defaultVal: "—" },
  { name: "onOpenChange", type: "(open: boolean) => void", defaultVal: "—" },
  { name: "defaultOpen", type: "boolean", defaultVal: "false" },
  {
    name: "onEscapeKeyDown",
    type: "(e: KeyboardEvent) => void",
    defaultVal: "—",
    description:
      "ESC FECHA o AlertDialog por padrão — só o clique fora é que não fecha. Se a decisão tem que ser realmente inescapável, chame e.preventDefault() aqui. Medido no browser, não presumido: o comentário do componente dizia que ESC já não fechava, e não era verdade.",
  },
];

const PARTES = [
  { name: "AlertDialogContent", type: "420px, radius-2xl, shadow-sh-2xl, outline-float", defaultVal: "—" },
  {
    name: "AlertDialogHeader",
    type: "flex-col, items-center, text-center",
    defaultVal: "—",
    description:
      "Centralizado, ao contrário do DialogHeader (alinhado à esquerda). É o que dá a leitura de 'pare e decida' em vez de 'preencha isto'.",
  },
  {
    name: "AlertDialogFooter",
    type: "flex-col-reverse → sm:flex-row",
    defaultVal: "—",
    description:
      "No mobile empilha com a AÇÃO em cima e o Cancel embaixo (por isso `col-reverse`); a partir de sm fica lado a lado. Botões `items-stretch`: ocupam a largura no mobile.",
  },
  { name: "AlertDialogTitle", type: "text-body-xl font-bold", defaultVal: "—" },
  { name: "AlertDialogDescription", type: "text-body-sm text-fg-muted, max-w-[340px]", defaultVal: "—" },
  {
    name: "AlertDialogAction / AlertDialogCancel",
    type: "Radix Action / Cancel",
    defaultVal: "—",
    description:
      "Não trazem estilo próprio — envolva o Button do DS com `asChild`. O Cancel recebe o foco inicial, que é o default seguro.",
  },
];

export function AlertDialogDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Feedback"
        title="AlertDialog"
        description="Confirmação que interrompe o fluxo: o usuário precisa decidir antes de seguir."
        dependency="@radix-ui/react-alert-dialog"
      />
      <DocSeparator />

      <SectionH2 id="quando" title="Quando usar (vs Dialog e AlertModal)" />
      <div className="mb-14 flex flex-col gap-gp-2xl">
        <p className="text-body-md text-fg-muted">
          Três componentes abrem uma caixa no meio da tela, e escolher errado custa
          acessibilidade ou trabalho repetido. A pergunta que separa os três é{" "}
          <strong className="text-fg-default">o que o usuário precisa fazer ali</strong>.
        </p>
        <div className="overflow-hidden rounded-radius-base border border-border-subtle">
          <div className="grid grid-cols-[160px_1fr] gap-0 border-b border-border-subtle bg-bg-subtle">
            <div className="px-pad-xl py-pad-md text-body-xs font-medium text-fg-default">Use</div>
            <div className="px-pad-xl py-pad-md text-body-xs font-medium text-fg-default">Quando</div>
          </div>
          {[
            [
              "AlertModal",
              "Quase sempre. É o wrapper one-shot do DS: tom, ícone, título, descrição e os dois botões numa prop só. Não monte confirmação na mão se ela cabe aqui.",
            ],
            [
              "AlertDialog",
              "Quando o AlertModal não cobre o conteúdo — precisa de lista, campo de confirmação (\"digite o nome do projeto\"), 3 ações. É este primitivo, montado peça por peça.",
            ],
            [
              "Dialog",
              "Quando NÃO é confirmação: formulário, detalhe, wizard. O Dialog fecha ao clicar fora, o que é errado pra uma decisão destrutiva.",
            ],
          ].map(([q, quando]) => (
            <div key={q} className="grid grid-cols-[160px_1fr] gap-0 border-t border-border-subtle">
              <div className="px-pad-xl py-pad-md">
                <code className="font-mono text-code-sm text-fg-brand">{q}</code>
              </div>
              <div className="px-pad-xl py-pad-md text-body-md text-fg-muted">{quando}</div>
            </div>
          ))}
        </div>
        <div className="rounded-radius-base border border-border-warning-muted bg-bg-warning-muted p-pad-3xl">
          <p className="mb-gp-md text-body-md font-medium text-fg-default">
            ⚠ O que o AlertDialog garante — e o que ele NÃO garante
          </p>
          <ul className="flex list-disc flex-col gap-gp-sm pl-sp-md text-body-md text-fg-muted">
            <li>
              <strong className="text-fg-default">Garante:</strong>{" "}
              <code className="font-mono text-code-sm">role=&quot;alertdialog&quot;</code> (o leitor de
              tela anuncia como decisão, não como diálogo comum), foco inicial no{" "}
              <strong className="text-fg-default">Cancel</strong> e{" "}
              <strong className="text-fg-default">não fecha ao clicar fora</strong>.
            </li>
            <li>
              <strong className="text-fg-default">NÃO garante:</strong> imunidade ao{" "}
              <kbd className="rounded-radius-sm border border-border-default px-pad-sm font-mono text-code-sm">
                ESC
              </kbd>
              . O Radix fecha no ESC por padrão. Medido no browser: o comentário do próprio
              componente afirmava que já não fechava — e fechava. Pra travar de verdade,{" "}
              <code className="font-mono text-code-sm">
                onEscapeKeyDown={"{(e) => e.preventDefault()}"}
              </code>
              .
            </li>
          </ul>
        </div>
      </div>

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-destrutivo"
        title="Confirmação destrutiva"
        description="O caso canônico: ação irreversível, com a consequência dita na descrição — não no título."
        code={`<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button color="critical" variant="outline" size="sm" iconLeft={<Trash2 />}>
      Excluir contrato
    </Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Excluir contrato #4821?</AlertDialogTitle>
      <AlertDialogDescription>
        As 431 faturas vinculadas ficam sem contrato e o histórico de consumo
        não pode ser recuperado.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel asChild>
        <Button color="secondary" variant="outline">Cancelar</Button>
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button color="critical">Excluir contrato</Button>
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button color="critical" variant="outline" size="sm" iconLeft={<Trash2 />}>
              Excluir contrato
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir contrato #4821?</AlertDialogTitle>
              <AlertDialogDescription>
                As 431 faturas vinculadas ficam sem contrato e o histórico de consumo não
                pode ser recuperado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button color="secondary" variant="outline">
                  Cancelar
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button color="critical">Excluir contrato</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ExampleSection>

      <ExampleSection
        id="ex-icone"
        title="Com ícone de tom"
        description="O Header é centralizado, então um ícone acima do título entra sem layout extra. Círculo de 56px com bg do tom — o mesmo recipe que o AlertModal aplica sozinho."
        code={`<AlertDialogHeader>
  <span className="grid size-[56px] place-items-center rounded-radius-full
                   bg-bg-warning-muted text-fg-warning">
    <TriangleAlert className="size-icon-lg" />
  </span>
  <AlertDialogTitle>Encerrar a operação do mês?</AlertDialogTitle>
  <AlertDialogDescription>…</AlertDialogDescription>
</AlertDialogHeader>

{/* Se o seu caso é exatamente isto, use <AlertModal tone="warning"> — ele já
    monta ícone + tom + botões. Este exemplo existe pra mostrar o encaixe. */}`}
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button color="secondary" variant="outline" size="sm">
              Encerrar operação
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <span
                aria-hidden
                className="grid size-[56px] place-items-center rounded-radius-full bg-bg-warning-muted text-fg-warning"
              >
                <TriangleAlert className="size-icon-lg" />
              </span>
              <AlertDialogTitle>Encerrar a operação do mês?</AlertDialogTitle>
              <AlertDialogDescription>
                O fechamento trava novos lançamentos em março. Você ainda poderá emitir
                faturas, mas não corrigir consumo.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button color="secondary" variant="outline">
                  Revisar antes
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button color="primary">Encerrar</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <div className="mb-gp-4xl">
        <h3 className="mb-gp-xs text-title-lg font-semibold text-fg-default">AlertDialog</h3>
        <p className="mb-gp-3xl max-w-[760px] text-body-md text-fg-muted">
          Root controlado ou não-controlado, igual ao Radix.
        </p>
        <PropsTable items={PROPS} />
      </div>
      <div className="mb-14">
        <h3 className="mb-gp-xs text-title-lg font-semibold text-fg-default">
          Partes e o que cada uma já resolve
        </h3>
        <p className="mb-gp-3xl max-w-[760px] text-body-md text-fg-muted">
          As partes trazem o estilo do DS pronto — não passe classe de layout por cima sem
          motivo.
        </p>
        <PropsTable items={PARTES} />
      </div>
    </DocLayout>
  );
}

export default AlertDialogDoc;
