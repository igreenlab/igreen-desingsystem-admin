import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "What are Output Styles" },
  { id: "terse", label: "terse.md (installed)" },
  { id: "settings", label: "Settings Wiring" },
  { id: "authoring", label: "Authoring a Style" },
  { id: "vs-prompt", label: "Output Style vs System Prompt" },
];

export function PipelineOutputStylesDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Pipeline Infra"
        title="Output Styles"
        description="Project-wide instructions that shape every agent reply — tone, density, structure. Loaded once per session."
      />
      <DocSeparator />

      {/* What */}
      <SectionH2 id="what" title="What are Output Styles" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          An <strong className="text-fg-default">Output Style</strong> is a Markdown file in{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/output-styles/</code> that
          the harness loads as a system message on every session. It defines how every reply should be
          formatted — tone, length, header style, code-fence density — without touching the agent's reasoning.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-sm">Cross-agent</p>
            <p className="text-body-md text-fg-muted">
              Applies to every agent in the project. Designer, Dev, Reviewer e Orchestrator falam com o mesmo formato.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-sm">One active at a time</p>
            <p className="text-body-md text-fg-muted">
              <code className="font-mono text-code-sm">settings.json</code> aponta para um único style.
              Pra mudar, edita o campo <code className="font-mono text-code-sm">outputStyle</code>.
            </p>
          </div>
        </div>
      </div>

      {/* terse */}
      <SectionH2 id="terse" title="terse.md — installed style" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O estilo ativo no projeto. Comprime respostas, mantém código direto, evita prefácios.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`# terse — output style

Respostas curtas, diretas. Sem TLDR. Sem prefácio.

## Regras
- Máximo 2 sentenças quando a pergunta é simples.
- Para tarefas técnicas: ir direto pro código ou comando.
- Sem listas decorativas (✨, 🎉) — emojis só quando o user usa primeiro.
- Sem repetir a pergunta do usuário no início.
- Sem fechar com "espero que ajude" / "qualquer dúvida".

## Exceções
- Quando o user pede explicação de arquitetura, expandir conforme necessário.
- Quando o user pede plano, listar passos numerados.

## Formato
- file_path:line_number ao referenciar código.
- Code fences com linguagem explícita.
- Headings só quando há 3+ tópicos distintos.`}</pre>
        </div>
        <div className="flex items-center gap-gp-md">
          <Badge color="success" variant="soft" size="md">Active</Badge>
          <span className="text-body-md text-fg-muted">Carregado por <code className="font-mono text-code-sm">settings.json</code> em toda sessão.</span>
        </div>
      </div>

      {/* Settings */}
      <SectionH2 id="settings" title="Settings Wiring" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O style é ativado pela chave <code className="font-mono text-code-sm">outputStyle</code> no <code className="font-mono text-code-sm">settings.json</code>.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`{
  "permissions": { ... },
  "hooks": { ... },
  "outputStyle": "terse"
}`}</pre>
        </div>
        <p className="text-body-md text-fg-muted">
          O valor é o nome do arquivo em <code className="font-mono text-code-sm">.claude/output-styles/</code> sem extensão.
        </p>
      </div>

      {/* Authoring */}
      <SectionH2 id="authoring" title="Authoring a Style" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Crie um arquivo Markdown novo em <code className="font-mono text-code-sm">.claude/output-styles/</code>.
          Mantenha o conteúdo curto (~500 chars) — é injetado em toda sessão.
        </p>
        <div className="grid grid-cols-2 gap-gp-3xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">Bons usos</p>
            <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
              <li>Padronizar densidade da resposta</li>
              <li>Forçar formato de citação de código</li>
              <li>Banir frases de fechamento</li>
              <li>Definir uso de emojis/headings</li>
            </ul>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">Maus usos</p>
            <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
              <li>Regras técnicas (use rules)</li>
              <li>Templates de código (use skills)</li>
              <li>Lógica condicional complexa</li>
              <li>Carregar arquivos por referência</li>
            </ul>
          </div>
        </div>
      </div>

      {/* vs prompt */}
      <SectionH2 id="vs-prompt" title="Output Style vs System Prompt" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Output style é uma camada acima do system prompt do agente. Cada agente tem seu próprio system
          prompt (definido no <code className="font-mono text-code-sm">.claude/agents/&lt;name&gt;.md</code>),
          mas todos compartilham o mesmo output style.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[180px_1fr] gap-0 border-b border-border-subtle bg-bg-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Layer</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Responsibility</div>
          </div>
          <div className="grid grid-cols-[180px_1fr] border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-md font-medium text-fg-default font-semibold">Output Style</div>
            <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">Como falar — tom, densidade, formato</div>
          </div>
          <div className="grid grid-cols-[180px_1fr] border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-md font-medium text-fg-default font-semibold">Agent System Prompt</div>
            <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">Quem é o agente — papel, escopo, signals</div>
          </div>
          <div className="grid grid-cols-[180px_1fr] border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-md font-medium text-fg-default font-semibold">Rules</div>
            <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">Constraints cross-cutting — anti-patterns, lessons</div>
          </div>
          <div className="grid grid-cols-[180px_1fr]">
            <div className="py-pad-md px-pad-xl text-body-md font-medium text-fg-default font-semibold">Skills</div>
            <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">Como executar uma tarefa específica</div>
          </div>
        </div>
      </div>
    </DocLayout>
  );
}
