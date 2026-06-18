import {
  MessagesSquare,
  Table2,
  PencilLine,
  LayoutDashboard,
  FileText,
  Wallet,
  Boxes,
  FolderTree,
  BookOpen,
  Bot,
  Terminal,
  Sparkles,
  Palette,
  Compass,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Chip } from "@/components/ui/Chip";
import { Badge } from "@/components/ui/badge";

/** Frases que o usuário pode dizer pra IA → o que acontece. */
const PROMPTS = [
  { icon: Table2, say: "monte uma tabela de produtos", does: "CRUD guiado: a IA entrevista (colunas, filtros, ações) e gera a tabela." },
  { icon: PencilLine, say: "uma tela de edição de cliente", does: "Formulário com FormField (validação, máscara, seções)." },
  { icon: LayoutDashboard, say: "um dashboard de vendas", does: "KPIs + gráficos (barras, pizza) no padrão do DS." },
  { icon: FileText, say: "a página de detalhe do pedido", does: "Cabeçalho + abas + cards de seção." },
  { icon: Wallet, say: "um financeiro com extrato", does: "Tabela de transações + saldo + saque." },
  { icon: MessagesSquare, say: "uma inbox de chat", does: "Lista de conversas + thread + painel de detalhe." },
];

/** Tokens de cor (adaptam ao tema light/dark automaticamente). */
const SWATCHES = [
  { cls: "bg-bg-brand", name: "brand" },
  { cls: "bg-bg-brand-subtle", name: "brand-subtle" },
  { cls: "bg-bg-success", name: "success" },
  { cls: "bg-bg-warning", name: "warning" },
  { cls: "bg-bg-danger", name: "danger" },
  { cls: "bg-bg-info", name: "info" },
  { cls: "bg-bg-surface border border-border-default", name: "surface" },
  { cls: "bg-bg-muted", name: "muted" },
];

/** O kit de IA que vem no projeto. */
const KIT = [
  { icon: Compass, title: "ds-kit (orquestrador)", desc: "Identifica a intenção da tela e roteia pra skill/exemplo certo. É a porta de entrada." },
  { icon: Table2, title: "crud-builder · /ds-create-crud", desc: "Entrevista guiada → blueprint → gera a tabela/CRUD espelhando o exemplo." },
  { icon: Sparkles, title: "Skills por tela", desc: "page-edit · page-detail · dashboard · charts · chat · drawers · cards." },
  { icon: ShieldCheck, title: "protect-ds (hook)", desc: "Bloqueia editar tema/tokens; mantém o visual íntegro. Customize na composição." },
];

const STEPS = [
  { t: "Você descreve", d: "Em português, o que a tela faz (\"uma lista de clientes com filtro\")." },
  { t: "A IA roteia", d: "O orquestrador identifica o tipo e puxa o exemplo/componente certo." },
  { t: "Adapta no padrão", d: "Segue o DESIGN.md (espaçamento, cores, tokens). Tela pronta de produção." },
];

const STRUCTURE = [
  { icon: Boxes, path: "src/components/ui/", desc: "Componentes do DS (Button, DataTable, FormField…). Cada um traz seu USAGE.md." },
  { icon: FolderTree, path: "src/examples/", desc: "Telas de referência (vêm via igreen:add example-*). Copie e adapte — é seu código." },
  { icon: BookOpen, path: "DESIGN.md", desc: "Guia de design: espaçamento, cores, tokens e padrões de tela." },
  { icon: Bot, path: ".claude/", desc: "Orquestrador, skills e regras que mantêm tudo no padrão automaticamente." },
];

const COMMANDS = [
  { cmd: "npm run dev", desc: "rodar o projeto" },
  { cmd: "npm run igreen:add -- button", desc: "puxar um componente do DS" },
  { cmd: "npm run igreen:update -- --all", desc: "atualizar (protege suas edições)" },
  { cmd: "npm run igreen:drift", desc: "checar integridade / defasagem" },
];

/** Prompt de bootstrap pra colar na IA no início da sessão. */
const BOOTSTRAP = `Este projeto consome o iGreen Design System (copy-in via registry).
Leia o CLAUDE.md e o DESIGN.md (raiz) e as regras em .claude/rules/ pra entender
os padrões. Pra montar telas, use o orquestrador .claude/skills/ds-kit (ou os
comandos /ds-build-page e /ds-create-crud): identifique a intenção, puxe o
example-* mais próximo com "npm run igreen:add", adapte seguindo o DESIGN.md e
rode "npx tsc --noEmit". Não edite tokens/tema (o hook protect-ds bloqueia) —
customize na composição da tela.`;

function SectionHead({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col gap-gp-xs">
      <h2 className="text-title-md font-semibold text-fg-default inline-flex items-center gap-gp-sm">
        {Icon && <Icon className="size-icon-sm text-fg-brand" />}
        {title}
      </h2>
      {subtitle && <p className="text-body-sm text-fg-muted">{subtitle}</p>}
    </div>
  );
}

export function Welcome() {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto px-pad-page-base py-pad-page-base gap-gp-6xl">
      <PageHeader
        title="Bem-vindo ao iGreen DS 👋"
        description="Seu projeto já vem com o design system pronto. Você cria telas conversando com a IA — em português, sem comandos complexos."
        badge={<Badge color="success" variant="soft">design system pronto</Badge>}
      />

      {/* Crie telas conversando — lista */}
      <section className="flex flex-col gap-gp-2xl">
        <SectionHead
          title="Crie telas conversando com a IA"
          subtitle="Abra o Claude Code (ou Cursor) neste projeto e diga o que quer — a IA monta a tela no padrão."
        />
        <ul className="flex flex-col gap-gp-md">
          {PROMPTS.map((p) => (
            <li
              key={p.say}
              className="flex items-center gap-gp-lg p-pad-card-base bg-bg-surface border border-border-subtle rounded-radius-lg transition-colors hover:border-border-brand-subtle"
            >
              <span className="grid place-items-center size-icon-2xl rounded-radius-lg bg-bg-brand-subtle text-fg-brand shrink-0">
                <p.icon className="size-icon-md" strokeWidth={1.8} />
              </span>
              <div className="flex flex-col gap-gp-2xs min-w-0 flex-1">
                <p className="text-body-md font-medium text-fg-default">“{p.say}”</p>
                <p className="text-caption-md text-fg-muted">{p.does}</p>
              </div>
              <Chip color="primary" variant="soft" size="sm" shape="rounded" className="shrink-0">você diz</Chip>
            </li>
          ))}
        </ul>
      </section>

      {/* Prompt de bootstrap */}
      <section className="flex flex-col gap-gp-2xl">
        <SectionHead
          title="Comece: dê o contexto pra IA"
          subtitle="Na primeira mensagem da sessão, cole isto pra IA entender o projeto e o pipeline:"
        />
        <div className="rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-card-base">
          <pre className="whitespace-pre-wrap text-code-sm text-fg-default font-mono leading-relaxed">{BOOTSTRAP}</pre>
        </div>
      </section>

      {/* Cores do sistema */}
      <section className="flex flex-col gap-gp-2xl">
        <SectionHead
          title="Cores do sistema"
          subtitle="Tokens semânticos — trocam sozinhos entre claro/escuro. Use pelos nomes, nunca hex."
          icon={Palette}
        />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-gp-md">
          {SWATCHES.map((s) => (
            <div key={s.name} className="flex flex-col gap-gp-xs">
              <div className={`h-14 rounded-radius-lg shadow-sh-sm ${s.cls}`} />
              <code className="text-caption-sm text-fg-muted">{s.name}</code>
            </div>
          ))}
        </div>
      </section>

      {/* O kit de IA */}
      <section className="flex flex-col gap-gp-2xl">
        <SectionHead title="A IA já vem com um kit de construção" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gp-md">
          {KIT.map((k) => (
            <div key={k.title} className="flex items-start gap-gp-md p-pad-card-base bg-bg-surface border border-border-subtle rounded-radius-lg">
              <span className="grid place-items-center size-icon-2xl rounded-radius-lg bg-bg-brand-subtle text-fg-brand shrink-0">
                <k.icon className="size-icon-md" strokeWidth={1.8} />
              </span>
              <div className="flex flex-col gap-gp-2xs min-w-0">
                <p className="text-body-md font-semibold text-fg-default">{k.title}</p>
                <p className="text-caption-md text-fg-muted">{k.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona — timeline */}
      <section className="flex flex-col gap-gp-2xl">
        <SectionHead title="Como funciona" />
        <ol className="flex flex-col">
          {STEPS.map((s, i) => (
            <li key={s.t} className="flex gap-gp-lg">
              <div className="flex flex-col items-center">
                <span className="grid place-items-center size-icon-xl rounded-radius-full bg-bg-brand text-fg-on-brand text-caption-md font-bold shrink-0">
                  {i + 1}
                </span>
                {i < STEPS.length - 1 && <span className="w-px flex-1 bg-border-default" />}
              </div>
              <div className={`flex flex-col gap-gp-2xs min-w-0 ${i < STEPS.length - 1 ? "pb-gp-2xl" : ""}`}>
                <p className="text-body-md font-semibold text-fg-default">{s.t}</p>
                <p className="text-caption-md text-fg-muted">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Estrutura + comandos */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-gp-6xl">
        <div className="flex flex-col gap-gp-2xl">
          <SectionHead title="Estrutura do projeto" />
          <div className="flex flex-col gap-gp-xs">
            {STRUCTURE.map((s) => (
              <div key={s.path} className="flex items-start gap-gp-md p-pad-card-sm bg-bg-surface border border-border-subtle rounded-radius-lg">
                <span className="grid place-items-center size-icon-xl rounded-radius-base bg-bg-muted text-fg-muted shrink-0">
                  <s.icon className="size-icon-sm" strokeWidth={1.8} />
                </span>
                <div className="flex flex-col gap-gp-2xs min-w-0">
                  <code className="text-body-sm font-semibold text-fg-default">{s.path}</code>
                  <p className="text-caption-md text-fg-muted">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-gp-2xl">
          <SectionHead title="Comandos úteis" />
          <div className="flex flex-col gap-gp-xs">
            {COMMANDS.map((c) => (
              <div key={c.cmd} className="flex items-center gap-gp-md p-pad-card-sm bg-bg-canvas border border-border-subtle rounded-radius-lg">
                <Terminal className="size-icon-sm text-fg-muted shrink-0" />
                <code className="text-body-sm text-fg-default">{c.cmd}</code>
                <span className="text-caption-md text-fg-muted truncate">— {c.desc}</span>
              </div>
            ))}
          </div>
          <p className="text-caption-md text-fg-subtle">
            Catálogo visual: https://igreen-desingsystem-admin.vercel.app
          </p>
        </div>
      </section>
    </div>
  );
}

export default Welcome;
