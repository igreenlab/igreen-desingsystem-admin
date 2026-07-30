import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "what", label: "What are Hooks" },
  { id: "lifecycle", label: "Lifecycle Events" },
  { id: "installed", label: "Hooks Installed" },
  { id: "ci-gates", label: "Gates de CI (o irmão bloqueante)" },
  { id: "no-formatter", label: "Sem formatador automático" },
  { id: "settings", label: "settings.json" },
  { id: "logs", label: "Hook Logs" },
  { id: "authoring", label: "Authoring a Hook" },
];

/** Gate de CI — informativo vs bloqueante, e o que cada um pega. */
function GateRow({
  script,
  mode,
  desc,
}: {
  script: string;
  mode: "bloqueante" | "informativo";
  desc: string;
}) {
  return (
    <div className="grid grid-cols-[280px_130px_1fr] gap-0 border-b border-border-subtle last:border-b-0">
      <div className="py-pad-md px-pad-xl">
        <code className="font-mono text-code-sm text-fg-brand">{script}</code>
      </div>
      <div className="py-pad-md px-pad-xl">
        <Badge color={mode === "bloqueante" ? "critical" : "secondary"} variant="soft" size="sm">
          {mode}
        </Badge>
      </div>
      <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">{desc}</div>
    </div>
  );
}

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
              A PostToolUse hook should always return exit 0 (efeito colateral informativo).
              A PreToolUse hook returns exit 2 to block — the message on stderr is shown to the agent (exit 1 não bloqueia).
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
            <div className="py-pad-md px-pad-xl text-body-md text-fg-default">Sim (exit 2 + msg stderr)</div>
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
          name=".claude/hooks/ds-lint-styles.sh"
          event="PostToolUse"
          matcher="Edit | Write"
          desc="Dispara em src/components/**/*.tsx e **/*.styles.{ts,tsx} — o .tsx entrou em 2026-07-29, porque antes Tailwind literal escrito direto no componente passava por todos os checks (medido: 3 violações reais no ui/, todas no user-menu). Delega pra scripts/lib/ds-lint-patterns.mjs (fonte única compartilhada com o CI) — cobre L-001 (ring com alpha), L-002 (Tailwind literal com equivalente DS), L-003 (ring-3), L-005 (bg-input) + import de tv via @/utils/tv. L-004 (outline-none) e L-007 (tipografia) saíram do conjunto — são semânticas, exigem contexto cross-elemento ou julgamento de intenção (L-059), e viraram trabalho do revisor. Warning em stderr — informativo, não bloqueia. No CI, o mesmo módulo roda em modo ratchet e só reprova violação nova (linha adicionada pelo diff), nunca débito legado."
          blocks={["L-001", "L-002", "L-003", "L-005", "import tv"]}
        />
        <HookCard
          name=".claude/hooks/ds-inventory-check.sh"
          event="PostToolUse"
          matcher="Edit | Write"
          desc="Dispara em src/components/ui/<Nome>/**. Alerta se USAGE.md está ausente, se o componente não consta no inventory.md (L-016), se não está em registry.json (não será distribuído), se está no registry mas fora do catálogo do CLI, ou se a DocPage existe sem rota no App.tsx/DOC_PAGES + nav — o render-em-branco da L-042. Desde 2026-07-29 as duas últimas perguntas vêm dos MESMOS módulos puros que o CI usa (ds-exceptions.mjs + showcase-registration.mjs, via uma chamada node -e), pra hook e CI não poderem divergir. Fail-open: probe caído → eixo pulado, exit 0 sempre. Informativo, não bloqueia."
          blocks={["USAGE.md ausente", "inventory.md", "registry.json", "catálogo CLI", "rota do showcase"]}
        />
        <HookCard
          name=".claude/hooks/ds-tokens-check.sh"
          event="PostToolUse"
          matcher="Edit | Write"
          desc="Dispara em tokens/**/*.ts. Lembra de rodar tokens:tw4 + avisa que token novo só chega no consumidor via registry:build + bump (/ds-release). Informativo, não bloqueia."
          blocks={["tokens/**/*.ts", "tokens:tw4", "registry:build", "/ds-release"]}
        />
        <HookCard
          name=".claude/hooks/block-rm-rf.sh"
          event="PreToolUse"
          matcher="Bash"
          desc="Bloqueia rm -rf perigoso (rm -rf /, rm -rf ., rm -rf ~) com exit 2. Permite rm -rf node_modules e dist."
          blocks={["rm -rf /", "rm -rf ~", "rm -rf .", "rm -rf *"]}
        />
        <HookCard
          name=".claude/hooks/block-sensitive-edit.sh"
          event="PreToolUse"
          matcher="Edit | Write"
          desc="Bloqueia edição em arquivos sensíveis: .env, credentials, secrets, migrations, .git/ — retorna exit 2 (exit 1 não bloquearia). Log para hook-log.txt."
          blocks={[".env", "credentials.json", "*.pem", "*.key", "migrations/", ".git/"]}
        />
      </div>

      {/* CI gates */}
      <SectionH2 id="ci-gates" title="Gates de CI (o irmão bloqueante)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Hook avisa; gate de CI reprova. Os dois formam o mesmo par: quando um hook e um gate
          cobrem a mesma regra, eles <strong className="text-fg-default">compartilham o módulo puro</strong> em{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">scripts/lib/</code>{" "}
          — nunca há duas implementações da mesma regra. Ligados em{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.github/workflows/ci.yml</code>.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[280px_130px_1fr] gap-0 border-b border-border-subtle bg-bg-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Script</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Modo</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">O que pega</div>
          </div>
          <GateRow
            script="lint-styles.mjs --ratchet"
            mode="bloqueante"
            desc="Tailwind literal com equivalente DS, mas só nas linhas que a PR ADICIONOU. O ratchet é o que torna o gate ligável: 14 dos 40 arquivos de estilo já tinham débito legado, e um gate whole-file reprovaria qualquer PR que os tocasse."
          />
          <GateRow
            script="showcase-check.mjs"
            mode="bloqueante"
            desc="Componente NOVO em ui/ sem registro no showcase (L-042 superfície 4): DocPage + rota no App.tsx (DOC_PAGES E o cascade de render, que falham independentemente) + nav. Sem isso a rota abre em branco em produção. Pasta é 'nova' só se não existia no base ref — senão adicionar 1 arquivo em pasta existente disparava falso-positivo."
          />
          <GateRow
            script="api-doc-check.mjs"
            mode="informativo"
            desc="Componente EXISTENTE que adiciona linha `export` sem tocar o USAGE.md. Fecha o ponto cego do check acima, que por design só olha pasta nova — e mudança em componente existente é o cenário mais provável de contribuidor de fora."
          />
          <GateRow
            script="registry-check.mjs"
            mode="bloqueante"
            desc="Integridade do registry: todo files[].path existe, sem backslash no path, e o embed servido está em sincronia com o registry.json — comparando o meta.stamp (versão + hash git) e o files[] de cada item, não só a presença do nome."
          />
          <GateRow
            script="distribution-debt.mjs"
            mode="informativo"
            desc="Componente fora do registry.json ou do catálogo do CLI. Informativo na PR de propósito: bloquear colidiria com a Regra 8 (distribuição consolida no /ds-release). A forma bloqueante vive no release:check."
          />
          <GateRow
            script="lib-verify.mjs"
            mode="bloqueante"
            desc="Integridade do pacote npm antes do publish (L-017, que custou 4 releases com types quebrados em silêncio). Roda só quando o diff toca src/components/, vite.lib.config.ts, tsconfig.lib.json ou package.json. A camada decisiva exige que o conjunto de .d.ts do tarball seja fechado sob imports relativos."
          />
          <GateRow
            script="examples-drift-check.mjs"
            mode="bloqueante"
            desc="Os src/examples/* são extração 1:1 dos showcases (L-034). Compara o hash da fonte e avisa quando o showcase mudou sem o exemplo ser re-extraído."
          />
        </div>
        <p className="text-body-md text-fg-muted">
          Uma regra só entra num gate mecânico se ela está errada{" "}
          <strong className="text-fg-default">independente de contexto</strong> — valor que diverge do
          token, classe que não existe. Regra que exige contexto cross-elemento (o foco pode estar no
          wrapper) ou julgamento de intenção (qual preset tipográfico é o certo) fica com o revisor
          semântico: forçá-la no grep produz a taxa de falso-positivo que faz o time desligar o check.
          Medido: os greps antigos davam 51 hits, 50 deles ruído (L-059).
        </p>
      </div>

      {/* No formatter */}
      <SectionH2 id="no-formatter" title="Sem formatador automático" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-danger-muted bg-bg-danger-muted p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-sm">
            Não existe hook de formatação, e é decisão — não lacuna (2026-07-29)
          </p>
          <p className="text-body-md text-fg-muted">
            Havia um <code className="font-mono text-code-sm">format-on-save.sh</code> chamando{" "}
            <code className="font-mono text-code-sm">npx --no-install prettier</code> num projeto onde{" "}
            <code className="font-mono text-code-sm">prettier</code> nunca esteve no{" "}
            <code className="font-mono text-code-sm">package.json</code>: no-op silencioso desde sempre.
            O problema não era o silêncio — era estar <strong className="text-fg-default">armado</strong>:
            um <code className="font-mono text-code-sm">npx prettier</code> rodado pra outra coisa populou o
            cache do npx e o hook ligou sozinho no Edit seguinte, reformatando um arquivo inteiro sem
            ninguém pedir. Hook e script removidos.{" "}
            <strong className="text-fg-default">Formate na mão</strong>, espelhando a indentação e as
            quebras do código vizinho. Detalhe em L-061.
          </p>
        </div>
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
          { "type": "command", "command": ".claude/hooks/ds-lint-styles.sh" },
          { "type": "command", "command": ".claude/hooks/ds-inventory-check.sh" },
          { "type": "command", "command": ".claude/hooks/ds-tokens-check.sh" }
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
          Os hooks DS escrevem em{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.ai/scratch/hook-log.txt</code>:{" "}
          <code className="font-mono text-code-sm">ds-lint-styles</code>,{" "}
          <code className="font-mono text-code-sm">ds-inventory-check</code>,{" "}
          <code className="font-mono text-code-sm">ds-tokens-check</code> e{" "}
          <code className="font-mono text-code-sm">block-sensitive-edit</code>.
          Útil pra depurar quando um hook falha ou pula um arquivo em silêncio.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`[2026-07-29 22:14:03] ds-lint-styles: 1 warning  src/components/ui/AppShell/user-menu.tsx
[2026-07-29 22:14:07] ds-inventory-check: ok  src/components/ui/DatePicker/datepicker.tsx
[2026-07-29 22:20:41] ds-inventory-check: PROBE FAIL showcase (fail-open)
[2026-07-29 22:31:55] block-sensitive: BLOCK env  /path/to/.env`}</pre>
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
          act, and returns an exit code. For PreToolUse, exit 2 blocks the call (exit 1 não bloqueia) — for PostToolUse, the exit code is ignored.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
          <pre className="whitespace-pre leading-relaxed">{`#!/usr/bin/env bash
set +e
FILE=$(jq -r '.tool_input.file_path // empty' 2>/dev/null)
[ -z "$FILE" ] && exit 0

case "$FILE" in
  *.env|*/.env)
    echo "BLOQUEADO: edição em .env não permitida." >&2
    exit 2
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
