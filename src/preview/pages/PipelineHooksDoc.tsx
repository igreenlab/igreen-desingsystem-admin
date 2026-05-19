import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "What are Hooks" },
  { id: "lifecycle", label: "Lifecycle Events" },
  { id: "installed", label: "Hooks Installed" },
  { id: "settings", label: "settings.json" },
  { id: "logs", label: "Hook Logs" },
  { id: "authoring", label: "Authoring a Hook" },
];

function HookCard({
  name,
  event,
  matcher,
  desc,
  blocks,
}: {
  name: string;
  event: string;
  matcher: string;
  desc: string;
  blocks?: string[];
}) {
  return (
    <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
      <div className="flex items-center justify-between gap-gp-md mb-gp-md">
        <code className="font-mono text-code-sm text-fg-brand">{name}</code>
        <div className="flex gap-gp-sm">
          <Badge color="primary" variant="soft" size="sm">{event}</Badge>
          <Badge color="secondary" variant="outline" size="sm">{matcher}</Badge>
        </div>
      </div>
      <p className="text-body-md text-fg-muted mb-gp-md">{desc}</p>
      {blocks && (
        <div className="border-t border-border-subtle pt-pad-md">
          <p className="text-caption-sm text-fg-subtle mb-gp-sm">Blocks / handles:</p>
          <div className="flex flex-wrap gap-gp-xs">
            {blocks.map((b) => (
              <code key={b} className="text-caption-sm font-mono bg-bg-subtle px-pad-sm py-pad-xs rounded-radius-sm text-fg-muted">{b}</code>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PipelineHooksDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Pipeline Infra"
        title="Hooks"
        description="Shell scripts that intercept the agent's tool calls at key lifecycle moments — PreToolUse to block, PostToolUse to react."
      />
      <DocSeparator />

      {/* What */}
      <SectionH2 id="what" title="What are Hooks" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          A <strong className="text-fg-default">Hook</strong> is a shell script that the harness runs around the
          agent's tool calls. It receives the tool input on <code className="font-mono text-code-sm">stdin</code> as JSON
          and can either let the call proceed, block it, or run a side-effect afterwards. Hooks live in{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/hooks/</code> and are
          registered in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/settings.json</code>.
        </p>
        <div className="grid grid-cols-2 gap-gp-2xl">
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-sm">Run by the harness, not the agent</p>
            <p className="text-body-md text-fg-muted">
              The agent doesn't decide when a hook fires. The Claude Code harness fires it based on the matcher.
              This is what makes hooks reliable for security.
            </p>
          </div>
          <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-sm">Idempotent on success</p>
            <p className="text-body-md text-fg-muted">
              A PostToolUse hook should always return exit 0 unless something is wrong.
              A PreToolUse hook returns exit 1 to block — the message on stderr is shown to the agent.
            </p>
          </div>
        </div>
      </div>

      {/* Lifecycle */}
      <SectionH2 id="lifecycle" title="Lifecycle Events" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[180px_1fr_180px] gap-0 border-b border-border-subtle bg-bg-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Event</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">When it fires</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Can block?</div>
          </div>
          <div className="grid grid-cols-[180px_1fr_180px] gap-0 border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl"><Badge color="primary" variant="soft" size="sm">PreToolUse</Badge></div>
            <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">Antes do agente executar a tool</div>
            <div className="py-pad-md px-pad-xl text-body-md text-fg-default">Sim (exit 1 + msg stderr)</div>
          </div>
          <div className="grid grid-cols-[180px_1fr_180px] gap-0">
            <div className="py-pad-md px-pad-xl"><Badge color="success" variant="soft" size="sm">PostToolUse</Badge></div>
            <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">Depois da tool retornar com sucesso</div>
            <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">Não — efeito colateral</div>
          </div>
        </div>
      </div>

      {/* Installed */}
      <SectionH2 id="installed" title="Hooks Installed" />
      <div className="grid grid-cols-1 gap-gp-2xl mb-14">
        <HookCard
          name=".claude/hooks/format-on-save.sh"
          event="PostToolUse"
          matcher="Edit | Write"
          desc="Roda Prettier no arquivo editado. Suporta .ts, .tsx, .js, .jsx, .json, .md. Idempotente — sempre retorna exit 0."
          blocks={[".ts", ".tsx", ".js", ".jsx", ".json", ".md"]}
        />
        <HookCard
          name=".claude/hooks/block-rm-rf.sh"
          event="PreToolUse"
          matcher="Bash"
          desc="Bloqueia rm -rf perigoso (rm -rf /, rm -rf ., rm -rf ~). Permite rm -rf node_modules e dist."
          blocks={["rm -rf /", "rm -rf ~", "rm -rf .", "rm -rf *"]}
        />
        <HookCard
          name=".claude/hooks/block-sensitive-edit.sh"
          event="PreToolUse"
          matcher="Edit | Write"
          desc="Bloqueia edição em arquivos sensíveis: .env, credentials, secrets, migrations, .git/. Log para hook-log.txt."
          blocks={[".env", "credentials.json", "*.pem", "*.key", "migrations/", ".git/"]}
        />
      </div>

      {/* settings.json */}
      <SectionH2 id="settings" title="settings.json" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Hooks are registered in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/settings.json</code>.
          Each hook gets a matcher (which tool name) and a command (the script path).
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/format-on-save.sh" }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/block-rm-rf.sh" }
        ]
      },
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/block-sensitive-edit.sh" }
        ]
      }
    ]
  },
  "outputStyle": "terse"
}`}</pre>
        </div>
      </div>

      {/* Logs */}
      <SectionH2 id="logs" title="Hook Logs" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Both <code className="font-mono text-code-sm">format-on-save.sh</code> and{" "}
          <code className="font-mono text-code-sm">block-sensitive-edit.sh</code> log entries to{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.ai/scratch/hook-log.txt</code>.
          Useful for debugging when a hook silently fails or skips a file.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`[2026-05-18 14:39:21] format-on-save: OK  src/components/ui/Button/button.styles.ts
[2026-05-18 14:39:25] format-on-save: skip (ext not handled) .ai/status/lessons.md
[2026-05-18 14:54:03] block-sensitive: BLOCK env  /path/to/.env
[2026-05-18 14:55:11] format-on-save: FAIL src/foo.tsx (prettier exit non-zero)`}</pre>
        </div>
        <p className="text-body-md text-fg-muted">
          The directory <code className="font-mono text-code-sm">.ai/scratch/</code> is gitignored. Hook logs never leave the local machine.
        </p>
      </div>

      {/* Authoring */}
      <SectionH2 id="authoring" title="Authoring a Hook" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          A hook reads <code className="font-mono text-code-sm">stdin</code> as JSON with the tool input, decides whether to
          act, and returns an exit code. For PreToolUse, exit 1 blocks the call — for PostToolUse, the exit code is ignored.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`#!/usr/bin/env bash
set +e
FILE=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$FILE" ] && exit 0

case "$FILE" in
  *.env|*/.env)
    echo "BLOQUEADO: edição em .env não permitida." >&2
    exit 1
    ;;
esac

exit 0`}</pre>
        </div>
        <p className="text-body-md text-fg-muted">
          Tornar executável: <code className="font-mono text-code-sm">chmod +x .claude/hooks/seu-hook.sh</code>.
          Registrar em <code className="font-mono text-code-sm">settings.json</code> e reiniciar a sessão Claude.
        </p>
      </div>
    </DocLayout>
  );
}
