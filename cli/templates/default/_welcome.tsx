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
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Chip } from "@/components/ui/Chip";

/** Frases que o usuário pode dizer pra IA → o que acontece. */
const PROMPTS = [
  { icon: Table2, say: "monte uma tabela de produtos", does: "CRUD guiado: a IA entrevista (colunas, filtros, ações) e gera a tabela." },
  { icon: PencilLine, say: "uma tela de edição de cliente", does: "Formulário com FormField (validação, máscara, seções)." },
  { icon: LayoutDashboard, say: "um dashboard de vendas", does: "KPIs + gráficos (barras, pizza) no padrão do DS." },
  { icon: FileText, say: "a página de detalhe do pedido", does: "Cabeçalho + abas + cards de seção." },
  { icon: Wallet, say: "um financeiro com extrato", does: "Tabela de transações + saldo + saque." },
  { icon: MessagesSquare, say: "uma inbox de chat", does: "Lista de conversas + thread + painel de detalhe." },
];

const STRUCTURE = [
  { icon: Boxes, path: "src/components/ui/", desc: "Os componentes do DS (Button, DataTable, FormField...). Cada um tem um USAGE.md ao lado explicando a API." },
  { icon: FolderTree, path: "src/examples/", desc: "Telas de referência (vêm sob demanda quando você roda igreen:add example-*). Copie e adapte — é seu código." },
  { icon: BookOpen, path: "DESIGN.md", desc: "O guia de design: espaçamento, cores, tokens e padrões de tela. Leia antes de montar." },
  { icon: Bot, path: ".claude/", desc: 'O "cérebro" da IA: orquestrador, skills e regras que mantêm tudo no padrão automaticamente.' },
];

const COMMANDS = [
  { cmd: "npm run dev", desc: "rodar o projeto" },
  { cmd: "npm run igreen:add -- button", desc: "puxar um componente do DS" },
  { cmd: "npm run igreen:drift", desc: "checar integridade (o que foi editado)" },
];

export function Welcome() {
  return (
    <div className="flex flex-col gap-gp-2xl p-pad-page-base max-w-container-xl">
      <PageHeader
        title="Bem-vindo ao iGreen DS 👋"
        description="Seu projeto já vem com o design system pronto. Você cria telas conversando com a IA — em português, sem comandos complexos."
      />

      {/* Como criar telas conversando */}
      <section className="flex flex-col gap-gp-md">
        <h2 className="text-title-md font-semibold text-fg-default">Crie telas conversando com a IA</h2>
        <p className="text-body-sm text-fg-muted">
          Abra o Claude Code (ou Cursor) neste projeto e diga o que quer. A IA identifica a intenção e monta a tela seguindo o padrão.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gp-md">
          {PROMPTS.map((p) => (
            <Card key={p.say}>
              <CardContent className="flex flex-col gap-gp-sm pt-pad-card-base">
                <div className="flex items-center justify-between gap-gp-sm">
                  <span className="grid place-items-center size-icon-2xl rounded-radius-lg bg-bg-brand-subtle text-fg-brand shrink-0">
                    <p.icon className="size-icon-md" strokeWidth={1.8} />
                  </span>
                  <Chip color="primary" variant="soft" size="sm" shape="rounded">você diz</Chip>
                </div>
                <p className="text-body-md font-medium text-fg-default">“{p.say}”</p>
                <p className="text-caption-md text-fg-muted">{p.does}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="flex flex-col gap-gp-md">
        <h2 className="text-title-md font-semibold text-fg-default">Como funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gp-md">
          {[
            { n: "1", t: "Você descreve", d: "Em português, o que a tela faz (\"uma lista de clientes com filtro\")." },
            { n: "2", t: "A IA roteia", d: "O orquestrador identifica o tipo e puxa o exemplo/componente certo do DS." },
            { n: "3", t: "Adapta no padrão", d: "Segue o DESIGN.md (espaçamento, cores, tokens). Tela pronta de produção." },
          ].map((s) => (
            <div key={s.n} className="flex flex-col gap-gp-xs p-pad-card-base bg-bg-surface border border-border-subtle rounded-radius-lg">
              <span className="grid place-items-center size-icon-2xl rounded-radius-full bg-bg-brand text-fg-on-brand text-body-md font-bold">{s.n}</span>
              <p className="text-body-md font-semibold text-fg-default">{s.t}</p>
              <p className="text-caption-md text-fg-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Estrutura do projeto */}
      <section className="flex flex-col gap-gp-md">
        <h2 className="text-title-md font-semibold text-fg-default">Estrutura do projeto</h2>
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
      </section>

      {/* Comandos */}
      <section className="flex flex-col gap-gp-md">
        <h2 className="text-title-md font-semibold text-fg-default">Comandos úteis</h2>
        <div className="flex flex-col gap-gp-xs">
          {COMMANDS.map((c) => (
            <div key={c.cmd} className="flex items-center gap-gp-md p-pad-card-sm bg-bg-canvas border border-border-subtle rounded-radius-lg">
              <Terminal className="size-icon-sm text-fg-muted shrink-0" />
              <code className="text-body-sm text-fg-default">{c.cmd}</code>
              <span className="text-caption-md text-fg-muted">— {c.desc}</span>
            </div>
          ))}
        </div>
        <p className="text-caption-md text-fg-subtle">
          Catálogo visual dos componentes: https://igreen-desingsystem-admin.vercel.app
        </p>
      </section>
    </div>
  );
}

export default Welcome;
