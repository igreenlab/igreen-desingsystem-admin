import { useState } from "react";
import { AlertModal } from "../../components/ui/AlertModal";
import { Button } from "../../components/ui/Button/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/shadcn/alert-dialog";
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
  { id: "ex-danger", label: "Danger (destrutivo)" },
  { id: "ex-tones", label: "Tones" },
  { id: "ex-no-icon", label: "Sem ícone" },
  { id: "ex-hide-cancel", label: "Sem botão cancelar" },
  { id: "ex-loading", label: "Loading async" },
  { id: "ex-primitive", label: "AlertDialog primitive" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "open", type: "boolean", defaultVal: "—" },
  { name: "onOpenChange", type: "(open: boolean) => void", defaultVal: "—" },
  {
    name: "tone",
    type: '"default" | "neutral" | "danger" | "warning" | "success"',
    defaultVal: '"default"',
  },
  { name: "title", type: "ReactNode", defaultVal: "—" },
  { name: "description", type: "ReactNode", defaultVal: "—" },
  { name: "confirmLabel", type: "ReactNode", defaultVal: '"Confirmar"' },
  { name: "cancelLabel", type: "ReactNode", defaultVal: '"Cancelar"' },
  { name: "hideCancel", type: "boolean", defaultVal: "false" },
  { name: "hideClose", type: "boolean", defaultVal: "false" },
  { name: "onConfirm", type: "() => void", defaultVal: "—" },
  { name: "icon", type: "ReactNode | null", defaultVal: "por tone" },
  { name: "loading", type: "boolean", defaultVal: "false" },
];

export function AlertModalDoc() {
  const [openDanger, setOpenDanger] = useState(false);
  const [openWarning, setOpenWarning] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);
  const [openDefault, setOpenDefault] = useState(false);
  const [openNeutral, setOpenNeutral] = useState(false);
  const [openNoIcon, setOpenNoIcon] = useState(false);
  const [openHideCancel, setOpenHideCancel] = useState(false);
  const [openLoading, setOpenLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAsyncConfirm = async () => {
    setLoading(true);
    await new Promise((res) => setTimeout(res, 1500));
    setLoading(false);
    setOpenLoading(false);
  };

  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Overlays"
        title="Alert Modal"
        description="Modal de confirmação com ícone + título + descrição + botões. Wrapper alto nível do AlertDialog (role='alertdialog') pra casos comuns. Tone controla cor do ícone e do botão de confirmação."
      />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-danger"
        title="Danger (destrutivo)"
        description='Padrão "Excluir item" — botão vermelho + ícone de alerta.'
        code={`const [open, setOpen] = useState(false);

<Button color="critical" variant="filled" onClick={() => setOpen(true)}>
  Excluir cliente
</Button>

<AlertModal
  open={open}
  onOpenChange={setOpen}
  tone="danger"
  title="Excluir cliente?"
  description='Esta ação não pode ser desfeita. O cliente "Maria Silva" será removido permanentemente do sistema.'
  confirmLabel="Excluir cliente"
  onConfirm={() => {
    // chamar API de delete
  }}
/>`}
      >
        <Button
          color="critical"
          variant="filled"
          size="sm"
          onClick={() => setOpenDanger(true)}
        >
          Excluir cliente
        </Button>
        <AlertModal
          open={openDanger}
          onOpenChange={setOpenDanger}
          tone="danger"
          title="Excluir cliente?"
          description='Esta ação não pode ser desfeita. O cliente "Maria Silva" será removido permanentemente do sistema.'
          confirmLabel="Excluir cliente"
          onConfirm={() => {
            setOpenDanger(false);
          }}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-tones"
        title="Tones"
        description="Cada tone tem seu ícone default e cor do botão. `default` = brand (sem ícone)."
        code={`<AlertModal tone="default"  title="..." />
<AlertModal tone="neutral"  title="..." />
<AlertModal tone="danger"   title="..." />
<AlertModal tone="warning"  title="..." />
<AlertModal tone="success"  title="..." />`}
      >
        <div className="flex flex-wrap gap-gp-md">
          <Button
            size="sm"
            color="primary"
            variant="outline"
            onClick={() => setOpenDefault(true)}
          >
            Default
          </Button>
          <Button
            size="sm"
            color="secondary"
            variant="outline"
            onClick={() => setOpenNeutral(true)}
          >
            Neutral
          </Button>
          <Button
            size="sm"
            color="warning"
            variant="outline"
            onClick={() => setOpenWarning(true)}
          >
            Warning
          </Button>
          <Button
            size="sm"
            color="success"
            variant="outline"
            onClick={() => setOpenSuccess(true)}
          >
            Success
          </Button>
        </div>

        <AlertModal
          open={openDefault}
          onOpenChange={setOpenDefault}
          tone="default"
          title="Confirmar ação?"
          description="Esta operação seguirá com os valores padrão configurados."
          onConfirm={() => setOpenDefault(false)}
        />
        <AlertModal
          open={openNeutral}
          onOpenChange={setOpenNeutral}
          tone="neutral"
          title="Atualização disponível"
          description="Uma nova versão do sistema está pronta. Deseja recarregar agora pra aplicar?"
          confirmLabel="Recarregar"
          onConfirm={() => setOpenNeutral(false)}
        />
        <AlertModal
          open={openWarning}
          onOpenChange={setOpenWarning}
          tone="warning"
          title="Alterações não salvas"
          description="Você tem alterações não salvas. Deseja descartá-las e continuar?"
          confirmLabel="Descartar"
          onConfirm={() => setOpenWarning(false)}
        />
        <AlertModal
          open={openSuccess}
          onOpenChange={setOpenSuccess}
          tone="success"
          title="Importação concluída"
          description="A importação foi finalizada com sucesso. 32 registros foram adicionados."
          confirmLabel="OK"
          hideCancel
          onConfirm={() => setOpenSuccess(false)}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-no-icon"
        title="Sem ícone"
        description="Passe `icon={null}` pra esconder o ícone (mesmo com tone definido)."
        code={`<AlertModal
  tone="danger"
  icon={null}
  title="Tem certeza?"
  description="Esta ação não pode ser desfeita."
  confirmLabel="Sim"
/>`}
      >
        <Button
          size="sm"
          color="critical"
          variant="outline"
          onClick={() => setOpenNoIcon(true)}
        >
          Abrir sem ícone
        </Button>
        <AlertModal
          open={openNoIcon}
          onOpenChange={setOpenNoIcon}
          tone="danger"
          icon={null}
          title="Tem certeza?"
          description="Esta ação não pode ser desfeita."
          confirmLabel="Sim"
          onConfirm={() => setOpenNoIcon(false)}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-hide-cancel"
        title="Sem botão cancelar"
        description="`hideCancel` esconde o botão Cancel — útil pra avisos informacionais que só têm OK."
        code={`<AlertModal
  tone="success"
  hideCancel
  title="Convite enviado"
  description="O convite foi enviado pro email do usuário."
  confirmLabel="Entendi"
/>`}
      >
        <Button
          size="sm"
          color="success"
          variant="outline"
          onClick={() => setOpenSuccess(true)}
        >
          Abrir (success)
        </Button>
      </ExampleSection>

      <ExampleSection
        id="ex-loading"
        title="Loading async"
        description="`loading` mostra spinner no botão de confirmação e desabilita o cancel. Quando vc controla o fechamento manualmente."
        code={`const [open, setOpen] = useState(false);
const [loading, setLoading] = useState(false);

async function handleConfirm() {
  setLoading(true);
  await api.delete(...);
  setLoading(false);
  setOpen(false);
}

<AlertModal
  open={open}
  onOpenChange={setOpen}
  tone="danger"
  loading={loading}
  title="Excluir conta?"
  description="Esta operação pode levar alguns segundos."
  confirmLabel="Excluir"
  onConfirm={handleConfirm}
/>`}
      >
        <Button
          size="sm"
          color="critical"
          variant="outline"
          onClick={() => setOpenLoading(true)}
        >
          Excluir (async)
        </Button>
        <AlertModal
          open={openLoading}
          onOpenChange={setOpenLoading}
          tone="danger"
          loading={loading}
          title="Excluir conta?"
          description="Esta operação pode levar alguns segundos."
          confirmLabel="Excluir"
          onConfirm={handleAsyncConfirm}
        />
      </ExampleSection>

      <ExampleSection
        id="ex-primitive"
        title="AlertDialog primitive"
        description="Pra layouts customizados (form dentro do modal, multi-step, etc), use as partes do <AlertDialog> direto. AlertModal só cobre o caso comum."
        code={`<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button color="primary" variant="outline">Abrir</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Título custom</AlertDialogTitle>
      <AlertDialogDescription>
        Conteúdo livre — sem ícone, sem props rígidas.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel asChild>
        <Button color="secondary" variant="outline" fullWidth>Voltar</Button>
      </AlertDialogCancel>
      <AlertDialogAction asChild>
        <Button color="primary" variant="filled" fullWidth>Continuar</Button>
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`}
      >
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" color="primary" variant="outline">
              Abrir primitive
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Título custom</AlertDialogTitle>
              <AlertDialogDescription>
                Conteúdo livre — sem ícone, sem props rígidas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button color="secondary" variant="outline" size="md" fullWidth>
                  Voltar
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button color="primary" variant="filled" size="md" fullWidth>
                  Continuar
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
