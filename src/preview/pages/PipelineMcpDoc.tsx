import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "What is MCP" },
  { id: "installed", label: "Servers Available" },
  { id: "figma", label: "Figma Integration" },
  { id: "workspace", label: "Workspace Server" },
  { id: "permissions", label: "Permission Allowlist" },
  { id: "vs-bash", label: "MCP vs Bash" },
];

function McpCard({
  name,
  purpose,
  examples,
}: {
  name: string;
  purpose: string;
  examples: string[];
}) {
  return (
    <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
      <p className="text-body-md font-medium text-fg-default mb-gp-sm">{name}</p>
      <p className="text-body-md text-fg-muted mb-gp-md">{purpose}</p>
      <div className="border-t border-border-subtle pt-pad-md">
        <p className="text-caption-sm text-fg-subtle mb-gp-sm">Example tools:</p>
        <div className="flex flex-wrap gap-gp-xs">
          {examples.map((ex) => (
            <code key={ex} className="text-caption-sm font-mono bg-bg-subtle px-pad-sm py-pad-xs rounded-radius-sm text-fg-muted">{ex}</code>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PipelineMcpDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Pipeline Infra"
        title="MCP Servers"
        description="Model Context Protocol servers expose external systems to the agents — Figma, file system, browser, design tools."
      />
      <DocSeparator />

      {/* What */}
      <SectionH2 id="what" title="What is MCP" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          <strong className="text-fg-default">Model Context Protocol</strong> (MCP) is an open standard for connecting
          Claude to external systems. Each MCP server exposes a set of tools the agent can call —{" "}
          <code className="font-mono text-code-sm">read_file</code>, <code className="font-mono text-code-sm">take_screenshot</code>,{" "}
          <code className="font-mono text-code-sm">get_design_context</code> — through a typed protocol.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-sm">Decoupled from the agent</p>
            <p className="text-body-md text-fg-muted">
              O agente não sabe como o MCP server funciona — só conhece os nomes das tools e os schemas dos
              parâmetros. Trocar o backend não exige mudar o agente.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-sm">Permission-gated</p>
            <p className="text-body-md text-fg-muted">
              Cada tool MCP só pode ser usada se estiver listada em{" "}
              <code className="font-mono text-code-sm">.claude/settings.json</code> {" → "}{" "}
              <code className="font-mono text-code-sm">permissions.allow</code>.
            </p>
          </div>
        </div>
      </div>

      {/* Installed */}
      <SectionH2 id="installed" title="Servers Available" />
      <div className="grid grid-cols-2 gap-gp-3xl mb-14">
        <McpCard
          name="claude.ai Figma"
          purpose="Bridge oficial Figma ↔ código. Lê design context, screenshots, variables. Escreve nodes/styles."
          examples={["get_design_context", "get_screenshot", "get_variable_defs", "use_figma"]}
        />
        <McpCard
          name="figma-console"
          purpose="Plugin de console no Figma para automação avançada — auditoria de design system, batch edits, componentização."
          examples={["figma_execute", "figma_audit_design_system", "figma_batch_create_variables"]}
        />
        <McpCard
          name="igreen-workspace"
          purpose="Servidor local de filesystem com escopo restrito ao workspace. Read/write/search dentro do projeto."
          examples={["read_text_file", "write_file", "search_files", "list_directory"]}
        />
        <McpCard
          name="chrome-devtools"
          purpose="Controla o Chrome para testar UI, capturar screenshots, ler console, analisar performance."
          examples={["navigate_page", "take_screenshot", "list_console_messages", "evaluate_script"]}
        />
        <McpCard
          name="pencil"
          purpose="Editor de arquivos .pen (designs criptografados). Apenas via MCP — não usar Read/Grep direto."
          examples={["open_document", "batch_design", "snapshot_layout", "get_variables"]}
        />
        <McpCard
          name="claude.ai ClickUp / Gamma / Google Calendar"
          purpose="Integrações de produtividade. Autenticação OAuth via tools dedicadas. Opcionais."
          examples={["authenticate", "complete_authentication"]}
        />
      </div>

      {/* Figma */}
      <SectionH2 id="figma" title="Figma Integration" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O servidor Figma é o mais usado pelo DS Designer. Fluxo típico de extração:
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-surface shadow-sh-sm p-pad-4xl">
          <div className="grid gap-gp-3xl">
            {[
              { step: "1", title: "URL do Figma", desc: "Usuário cola um link figma.com/design/.../?node-id=..." },
              { step: "2", title: "get_design_context", desc: "Agente lê estrutura, variables, code-connect mappings" },
              { step: "3", title: "get_screenshot", desc: "Captura imagem para anexar à spec" },
              { step: "4", title: "Skill figma-extract", desc: "Designer produz spec com Strategist perspective" },
              { step: "5", title: "[GATE]", desc: "Usuário aprova spec antes de Dev começar" },
            ].map((item) => (
              <div key={item.step} className="flex gap-gp-2xl">
                <div className="flex shrink-0 items-center justify-center w-8 h-8 rounded-full text-body-md font-medium font-semibold bg-bg-brand text-fg-on-brand">
                  {item.step}
                </div>
                <div>
                  <p className="text-body-md font-medium text-fg-default mb-gp-xs">{item.title}</p>
                  <p className="text-body-md text-fg-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workspace */}
      <SectionH2 id="workspace" title="igreen-workspace Server" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Servidor de filesystem com escopo restrito. Útil quando você quer permissões granulares — tools
          MCP são mais auditáveis que <code className="font-mono text-code-sm">Bash(cat ...)</code>.
        </p>
        <div className="grid grid-cols-2 gap-gp-3xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">Tools permitidas (allowlist)</p>
            <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
              <li><code className="font-mono text-code-sm">read_text_file</code></li>
              <li><code className="font-mono text-code-sm">list_directory</code></li>
              <li><code className="font-mono text-code-sm">write_file</code></li>
            </ul>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">Quando preferir Bash</p>
            <p className="text-body-md text-fg-muted">
              Comandos compostos com pipes, scripts complexos, comandos que precisam de variáveis de ambiente.
              MCP é mais ergonômico para operações simples e auditáveis.
            </p>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <SectionH2 id="permissions" title="Permission Allowlist" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          MCP tools só rodam se estiverem listadas. Sem allow, cada chamada solicita permissão ao usuário.
          Trecho do <code className="font-mono text-code-sm">settings.json</code>:
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`{
  "permissions": {
    "allow": [
      "mcp__igreen-workspace__read_text_file",
      "mcp__igreen-workspace__list_directory",
      "mcp__igreen-workspace__write_file",
      "mcp__claude_ai_Figma__get_variable_defs",
      "mcp__figma-console__figma_get_variables",
      "mcp__plugin_chrome-devtools-mcp_chrome-devtools__take_screenshot",
      "mcp__plugin_chrome-devtools-mcp_chrome-devtools__navigate_page"
    ]
  }
}`}</pre>
        </div>
      </div>

      {/* vs Bash */}
      <SectionH2 id="vs-bash" title="MCP vs Bash" />
      <div className="grid grid-cols-2 gap-gp-3xl mb-14">
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Use MCP quando…</p>
          <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
            <li>Você quer permissões granulares por tool</li>
            <li>O sistema externo é stateful (Figma, browser)</li>
            <li>Você precisa de tipagem estruturada</li>
            <li>Quer auditar exatamente o que foi feito</li>
          </ul>
        </div>
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Use Bash quando…</p>
          <ul className="list-disc pl-sp-md flex flex-col gap-gp-sm text-body-md text-fg-muted">
            <li>Comando composto com pipes</li>
            <li>Sem MCP server pro caso de uso</li>
            <li>Operação one-shot com variáveis</li>
            <li>Scripts npm/git/etc do projeto</li>
          </ul>
        </div>
      </div>
    </DocLayout>
  );
}
