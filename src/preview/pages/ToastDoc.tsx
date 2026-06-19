import { Mail, Sparkles, Trash2, Wifi } from "lucide-react";
import { toast, ToastCard } from "../../components/ui/Toast";
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
  { id: "ex-actions", label: "Ações" },
  { id: "ex-rich", label: "Ícone, meta e fechar" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "toast(opts)", type: "toast neutro (status default)", defaultVal: "—" },
  { name: "toast.success / .error / .warning / .info", type: "muda só a cor do icon-chip + ícone padrão do status", defaultVal: "—" },
  { name: "title", type: "ReactNode — obrigatório", defaultVal: "—" },
  { name: "description", type: "ReactNode — subtexto", defaultVal: "—" },
  { name: "icon", type: "ReactNode — override do ícone do chip", defaultVal: "ícone do status" },
  { name: "meta", type: "ReactNode — texto curto à direita do título (ex.: 'agora')", defaultVal: "—" },
  { name: "action", type: "{ label, onClick, tone?, iconLeft?, iconRight? } — sozinho = inline à direita", defaultVal: "—" },
  { name: "cancel", type: "{ label, onClick } — com action vira rodapé (cancel ↔ action)", defaultVal: "—" },
  { name: "onClose", type: "() => void — mostra o X e dá dismiss", defaultVal: "—" },
  { name: "duration / position / id", type: "opções nativas do Sonner (passthrough)", defaultVal: "Sonner" },
  { name: "toast.promise / .dismiss / .custom / .loading", type: "passthrough nativo do Sonner", defaultVal: "—" },
];

export function ToastDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Toast"
        description="Card de notificação consistente sobre o Sonner. Props ergonômicas (title, description, icon, action, cancel, onClose, meta) e status que muda SÓ o icon-chip (bg fraco + ícone forte) — a superfície fica neutra. Mantém o nativo do Sonner: agrupamento, empilhamento, slide, swipe e posições."
        dependency="sonner"
      />
      <DocSeparator />

      <SectionH2 id="construcao" title="Construção" />
      <p className="mb-gp-lg text-body-md text-fg-muted">
        Monte o <code className="text-fg-default">{"<Toaster />"}</code> UMA vez na raiz da app
        (já vem do DS via <code className="text-fg-default">@/components/shadcn/sonner</code>).
        Depois dispare com o helper <code className="text-fg-default">toast</code> do Toast.
        No preview ele já está montado.
      </p>
      <ExampleSection
        id="ex-setup"
        title="Setup"
        description="Toaster no root + helper toast em qualquer lugar."
        code={`// app root (uma vez)
import { Toaster } from "@/components/shadcn/sonner";
// ...<Toaster />

// em qualquer lugar
import { toast } from "@/components/ui/Toast";
toast.success({
  title: "Alterações salvas",
  description: "Seu perfil foi atualizado com sucesso.",
  onClose: () => {},
});`}
      >
        <Button
          color="primary"
          variant="filled"
          size="sm"
          onClick={() =>
            toast.success({
              title: "Alterações salvas",
              description: "Seu perfil foi atualizado com sucesso.",
              onClose: () => {},
            })
          }
        >
          Disparar toast
        </Button>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-preview"
        title="Anatomia (preview estático)"
        description="O card renderizado direto (sem disparar). icon-chip por status à esquerda, conteúdo no meio, ações inline ou em rodapé."
        code={`<ToastCard status="success" title="Conexão restabelecida" meta="agora" icon={<Wifi />} />`}
      >
        <div className="flex w-full max-w-[380px] flex-col gap-gp-md">
          <ToastCard status="success" title="Conexão restabelecida" meta="agora" icon={<Wifi />} />
          <ToastCard status="warning" title="Armazenamento quase cheio" description="Você usou 90% do espaço." action={{ label: "Fazer upgrade", tone: "neutral" }} />
          <ToastCard status="danger" title="Falha no upload" description="Não foi possível enviar invoice.pdf." cancel={{ label: "Dispensar" }} action={{ label: "Tentar de novo", tone: "danger" }} />
          <ToastCard title="3 mensagens novas" description="De Kai, Priya e Nina em #design-system" icon={<Mail />} action={{ label: "Ver mensagens", iconRight: <span>→</span> }} />
          <ToastCard status="info" title="Manutenção agendada" description="Indisponível dia 3, das 2 às 4h." onClose={() => {}} />
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-status"
        title="Status"
        description="O status muda só o icon-chip (bg -muted fraco + ícone fg forte). O card continua neutro."
        code={`toast.success({ title: "Conexão restabelecida", meta: "agora" });
toast.warning({ title: "Armazenamento quase cheio", action: { label: "Fazer upgrade", tone: "neutral" } });
toast.error({ title: "Falha no upload", description: "Não foi possível enviar invoice.pdf." });
toast.info({ title: "Manutenção agendada", description: "Indisponível dia 3, 2–4h." });
toast({ title: "Projeto excluído", icon: <Trash2 />, action: { label: "Desfazer", tone: "neutral" } });`}
      >
        <div className="flex flex-wrap items-center gap-gp-sm">
          <Button color="success" variant="soft" size="sm" onClick={() => toast.success({ title: "Conexão restabelecida", meta: "agora" })}>success</Button>
          <Button color="critical" variant="soft" size="sm" onClick={() => toast.error({ title: "Falha no upload", description: "Não foi possível enviar invoice.pdf." })}>error</Button>
          <Button color="warning" variant="soft" size="sm" onClick={() => toast.warning({ title: "Armazenamento quase cheio", description: "Você usou 90% do espaço." })}>warning</Button>
          <Button color="secondary" variant="soft" size="sm" onClick={() => toast.info({ title: "Manutenção agendada", description: "Indisponível dia 3, das 2 às 4h." })}>info</Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => toast({ title: "Projeto excluído", icon: <Trash2 />, action: { label: "Desfazer", tone: "neutral" } })}>neutro</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-actions"
        title="Ações"
        description="action sozinho = botão inline à direita. action + cancel = rodapé (cancel à esquerda, action à direita)."
        code={`// inline
toast.success({ title: "Lena convidou você", description: "Para colaborar no Design System v3", action: { label: "Aceitar" } });

// rodapé (2 botões)
toast.error({
  title: "Falha no upload",
  description: "Não foi possível enviar invoice.pdf.",
  cancel: { label: "Dispensar" },
  action: { label: "Tentar de novo", tone: "danger" },
});`}
      >
        <div className="flex flex-wrap items-center gap-gp-sm">
          <Button color="primary" variant="filled" size="sm" onClick={() => toast.success({ title: "Lena convidou você", description: "Para colaborar no Design System v3", action: { label: "Aceitar" } })}>action inline</Button>
          <Button color="critical" variant="soft" size="sm" onClick={() => toast.error({ title: "Falha no upload", description: "Não foi possível enviar invoice.pdf.", cancel: { label: "Dispensar" }, action: { label: "Tentar de novo", tone: "danger" } })}>cancel + action (rodapé)</Button>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-rich"
        title="Ícone, meta e fechar"
        description="icon faz override do ícone padrão; meta é texto curto à direita do título; onClose mostra o X."
        code={`toast({ title: "3 mensagens novas", description: "De Kai, Priya e Nina em #design-system", icon: <Mail />, action: { label: "Ver mensagens", iconRight: <span>→</span> } });
toast.success({ title: "Conexão restabelecida", icon: <Wifi />, meta: "agora" });
toast.info({ title: "Manutenção agendada", description: "Indisponível dia 3, das 2 às 4h.", onClose: () => {} });`}
      >
        <div className="flex flex-wrap items-center gap-gp-sm">
          <Button color="secondary" variant="outline" size="sm" onClick={() => toast({ title: "3 mensagens novas", description: "De Kai, Priya e Nina em #design-system", icon: <Mail />, action: { label: "Ver mensagens", iconRight: <span>→</span> } })}>ícone custom</Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => toast.success({ title: "Conexão restabelecida", icon: <Wifi />, meta: "agora" })}>com meta</Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => toast.info({ title: "Manutenção agendada", description: "Indisponível dia 3, das 2 às 4h.", onClose: () => {} })}>com X (fechar)</Button>
          <Button color="secondary" variant="outline" size="sm" onClick={() => toast({ title: "Novo: AI Copilot", description: "Gere texto, alt e layouts com um prompt", icon: <Sparkles />, cancel: { label: "Depois" }, action: { label: "Testar agora" } })}>destaque</Button>
        </div>
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default ToastDoc;
