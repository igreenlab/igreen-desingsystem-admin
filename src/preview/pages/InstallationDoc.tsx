import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "quickstart", label: "Quick start (CLI)" },
  { id: "requirements", label: "Requirements" },
  { id: "clone", label: "Clone & Install" },
  { id: "scripts", label: "Scripts" },
  { id: "first-run", label: "First Run" },
  { id: "install-npm", label: "Install via NPM" },
  { id: "consume", label: "Consume in App" },
  { id: "pipeline", label: "AI Pipeline" },
  { id: "troubleshoot", label: "Troubleshooting" },
];

function CmdRow({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle last:border-b-0">
      <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-[220px]">{cmd}</code>
      <span className="text-body-md text-fg-muted flex-1">{desc}</span>
    </div>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
      <pre className="whitespace-pre leading-relaxed">{children}</pre>
    </div>
  );
}

export function InstallationDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Installation"
        description="Clone, install, run, and consume iGreen DS in your project."
      />
      <DocSeparator />

      {/* Quick start with CLI */}
      <SectionH2 id="quickstart" title="Quick start (CLI)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Pra criar um projeto novo do zero já consumindo o DS, use o CLI{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">
            @snksergio/create-design-system
          </code>
          . Vite + React 19 + Tailwind v4 + tema light/dark + exemplo funcional, tudo pré-configurado.
        </p>
        <CodeBlock>{`npm create @snksergio/design-system my-app
cd my-app
npm run dev
# → http://localhost:3200`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          O CLI pergunta o nome do projeto, package manager, se quer instalar deps e iniciar git.
          Em ~30 segundos você tem um app rodando com 4 componentes do DS demonstrados (Button, Chip,
          Avatar/Badge, AlertModal) e toggle dark/light funcionando. Sem precisar configurar nada
          manualmente, sem gotcha do <code className="font-mono text-code-sm">@source</code> do Tailwind v4.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Variações de uso</p>
          <CodeBlock>{`# Sem args (CLI faz prompts pra tudo)
npm create @snksergio/design-system

# Com pnpm ou yarn
pnpm create @snksergio/design-system my-app
yarn create @snksergio/design-system my-app

# Versão específica do CLI
npm create @snksergio/design-system@0.1.0 my-app`}</CodeBlock>
        </div>
        <p className="text-body-md text-fg-muted">
          Se você prefere adicionar o DS num projeto JÁ existente, veja{" "}
          <strong className="text-fg-default">Install via NPM</strong> mais abaixo.
        </p>
      </div>

      {/* Requirements */}
      <SectionH2 id="requirements" title="Requirements (para desenvolver NO DS)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Minimum versions for the DS to build, generate tokens and run the preview app.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle">
            <span className="text-body-md font-medium text-fg-default min-w-[140px]">Node.js</span>
            <Badge color="secondary" variant="outline" size="sm">≥ 20.x</Badge>
            <span className="text-body-md text-fg-muted">Required by Vite 6 and tsx</span>
          </div>
          <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle">
            <span className="text-body-md font-medium text-fg-default min-w-[140px]">npm</span>
            <Badge color="secondary" variant="outline" size="sm">≥ 10.x</Badge>
            <span className="text-body-md text-fg-muted">Or pnpm/yarn — package.json works with either</span>
          </div>
          <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle">
            <span className="text-body-md font-medium text-fg-default min-w-[140px]">TypeScript</span>
            <Badge color="secondary" variant="outline" size="sm">≥ 5.6</Badge>
            <span className="text-body-md text-fg-muted">Bundled as dev dependency — no global install needed</span>
          </div>
          <div className="flex items-start gap-gp-xl py-pad-xl px-pad-3xl">
            <span className="text-body-md font-medium text-fg-default min-w-[140px]">Tailwind CSS</span>
            <Badge color="primary" variant="soft" size="sm">v4</Badge>
            <span className="text-body-md text-fg-muted">v3 is not supported — anti-collision prefixes depend on @theme</span>
          </div>
        </div>
      </div>

      {/* Clone & Install */}
      <SectionH2 id="clone" title="Clone & Install" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The DS lives in a single Git repository. Clone, install dependencies, generate the theme CSS,
          and you're ready to run the preview app.
        </p>
        <CodeBlock>{`# 1. Clone the repo
git clone https://github.com/snksergio/igreen-desingsystem-admin.git
cd igreen-desingsystem-admin

# 2. Install dependencies
npm install

# 3. Generate the Tailwind v4 theme CSS
npm run tokens:tw4

# 4. Start the preview app
npm run dev
# → http://localhost:3100`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          The <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">npm run dev</code> script
          runs <code className="font-mono text-code-sm">tokens:tw4</code> automatically before starting Vite — so step 3 is
          optional after the first install. Run it manually only when you change a token file.
        </p>
      </div>

      {/* Scripts */}
      <SectionH2 id="scripts" title="Scripts" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">Available npm scripts:</p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <CmdRow cmd="npm run dev" desc="Generate tokens + start Vite dev server (port 3100)" />
          <CmdRow cmd="npm run build" desc="Generate tokens + tsc -b + vite production build" />
          <CmdRow cmd="npm run preview" desc="Serve the production build locally" />
          <CmdRow cmd="npm run tokens:tw4" desc="Regenerate Tailwind v4 theme CSS (primary transform)" />
          <CmdRow cmd="npm run tokens:css" desc="Generate vanilla CSS custom properties" />
          <CmdRow cmd="npm run tokens:dtcg" desc="Generate JSON tokens for Figma import" />
          <CmdRow cmd="npm run tokens:all" desc="Run all transforms in sequence" />
          <CmdRow cmd="npm run tokens:check" desc="tsc --noEmit over the tokens/ folder" />
          <CmdRow cmd="npm test" desc="Run the Vitest test suite once" />
          <CmdRow cmd="npm run test:watch" desc="Run Vitest in watch mode" />
          <CmdRow cmd="npm run test:ui" desc="Open the Vitest UI in the browser" />
          <CmdRow cmd="npm run sync:agents" desc="Mirror .claude/agents/ to .cursor/rules/" />
        </div>
      </div>

      {/* First Run */}
      <SectionH2 id="first-run" title="First Run" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          What happens the first time you run <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">npm run dev</code>:
        </p>
        <ol className="list-decimal pl-sp-md flex flex-col gap-gp-md text-body-md text-fg-muted">
          <li><strong className="text-fg-default">Transform</strong> — <code className="font-mono text-code-sm">tsx tokens/transforms/to-tailwind-v4.ts</code> reads every token file under <code className="font-mono text-code-sm">tokens/brands/default/</code>.</li>
          <li><strong className="text-fg-default">Output</strong> — writes a fresh <code className="font-mono text-code-sm">src/styles/theme/tailwind-theme.css</code> with the <code className="font-mono text-code-sm">@theme</code> block, <code className="font-mono text-code-sm">.dark</code> overrides and typography <code className="font-mono text-code-sm">@utility</code> presets.</li>
          <li><strong className="text-fg-default">Vite</strong> — starts the dev server, imports the generated CSS, and serves the preview app at <code className="font-mono text-code-sm">localhost:3100</code>.</li>
          <li><strong className="text-fg-default">Sidebar</strong> — navigate by section (Get Started, Agents, Foundations, Components, Templates, Examples).</li>
        </ol>
      </div>

      {/* Install via NPM */}
      <SectionH2 id="install-npm" title="Install via NPM" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O DS é publicado como pacote público no NPM. Apps externos consomem via{" "}
          <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">npm install</code> — modelo
          "evergreen": <code className="font-mono text-code-sm">npm update</code> sempre puxa a versão mais recente.
        </p>
        <p className="text-body-md text-fg-muted">
          <strong className="text-fg-default">Pre-requisitos no app consumidor:</strong>
        </p>
        <ul className="list-disc pl-sp-md flex flex-col gap-gp-md text-body-md text-fg-muted">
          <li>React 19+ (peer dep)</li>
          <li>Tailwind CSS v4 instalado e configurado</li>
          <li>Importar <code className="font-mono text-code-sm">@snksergio/design-system/theme.css</code> uma vez no entry CSS</li>
          <li>
            <strong className="text-fg-default">Adicionar <code className="font-mono text-code-sm">@source</code></strong>{" "}
            apontando pro <code className="font-mono text-code-sm">dist-lib/</code> do pacote — sem isso, os componentes
            ficam sem estilo (cores aparecem, mas spacing/radius/shadow somem)
          </li>
        </ul>
        <CodeBlock>{`# instala
npm install @snksergio/design-system

# atualiza pra última versão
npm update @snksergio/design-system`}</CodeBlock>

        <div className="rounded-radius-base border border-border-warning-muted bg-bg-warning-muted p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">⚠ Configuração obrigatória do CSS de entrada</p>
          <p className="text-body-md text-fg-muted mb-gp-md">
            Tailwind v4 ignora <code className="font-mono text-code-sm">node_modules</code> por default ao escanear classes.
            Como os componentes do DS estão lá, você precisa instruir o Tailwind a escaneá-los — caso contrário,
            classes como <code className="font-mono text-code-sm">gap-gp-md</code>,{" "}
            <code className="font-mono text-code-sm">rounded-radius-base</code>,{" "}
            <code className="font-mono text-code-sm">min-h-form-lg</code> ficam órfãs.
          </p>
          <CodeBlock>{`/* app/index.css ou globals.css */
@import "tailwindcss";

/* Obrigatório — escaneia os bundles do DS pra gerar utilities */
@source "../node_modules/@snksergio/design-system/dist-lib/**/*.{mjs,cjs,js}";

@import "@snksergio/design-system/theme.css";`}</CodeBlock>
        </div>
        <p className="text-body-md text-fg-muted">
          Importar componentes, theme, tokens e showcases:
        </p>
        <CodeBlock>{`// app.tsx — entry CSS
import "@snksergio/design-system/theme.css";

// componentes
import { Button, AppShell, Chip, DataTable } from "@snksergio/design-system";

// tokens (acesso programático)
import { colorLight, spacing } from "@snksergio/design-system/tokens";

// showcases prontas (com mocks)
import ChatV2 from "@snksergio/design-system/preview/chat";
import ClientesShowcase from "@snksergio/design-system/preview/clientes";

// mocks reutilizáveis
import {
  APP_SHELL_CONTEXTS,
  chatMocks,
  clientesMocks,
} from "@snksergio/design-system/preview/mocks";`}</CodeBlock>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[200px_1fr] gap-0 bg-bg-subtle border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">Sub-path</div>
            <div className="py-pad-md px-pad-xl text-body-xs text-fg-default font-medium">O que exporta</div>
          </div>
          {[
            { path: ".", desc: "Componentes iGreen + Shadcn adaptados (Button, AppShell, DataTable, etc)" },
            { path: "/theme.css", desc: "CSS gerado com @theme + dark mode + utility presets" },
            { path: "/tokens", desc: "Objetos de tokens semânticos (colorLight, spacing, sizing, etc)" },
            { path: "/preview/chat", desc: "ChatV2 showcase completa + types" },
            { path: "/preview/clientes", desc: "ClientesShowcase (CRUD com DataTable + Drawer)" },
            { path: "/preview/dashboard", desc: "DashboardShowcase com KPIs e charts" },
            { path: "/preview/mocks", desc: "Mocks reutilizáveis: APP_SHELL_*, chatMocks, clientesMocks" },
          ].map((row) => (
            <div key={row.path} className="grid grid-cols-[200px_1fr] gap-0 border-t border-border-subtle">
              <div className="py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">{row.path}</code></div>
              <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">{row.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Consume in App */}
      <SectionH2 id="consume" title="Alternative: Consume Directly from Source" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Caso queira referenciar o DS direto desta pasta (dev local, sem publish), importe o tema CSS direto e use o repo como dependência local.
        </p>
        <CodeBlock>{`/* app.css in your project */
@import "tailwindcss";
@import "../path/to/igreen-ds/src/styles/theme/tailwind-theme.css";`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          All DS utility classes are now available (anti-collision prefixes: <code className="font-mono text-code-sm">gap-gp-*</code>,{" "}
          <code className="font-mono text-code-sm">px-pad-*</code>, <code className="font-mono text-code-sm">rounded-radius-*</code>,{" "}
          <code className="font-mono text-code-sm">shadow-sh-*</code>, <code className="font-mono text-code-sm">min-h-form-*</code>).
        </p>
        <CodeBlock>{`<button class="min-h-form-lg px-pad-3xl rounded-radius-base bg-bg-brand text-fg-on-brand shadow-sh-sm">
  Primary CTA
</button>`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          For dark mode, toggle the <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.dark</code> class
          on the root element — CSS vars resolve to the correct values automatically.
        </p>
      </div>

      {/* AI Pipeline */}
      <SectionH2 id="pipeline" title="AI Pipeline (Optional)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          The repo ships a full Claude Code pipeline in <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">.claude/</code>.
          It activates automatically when you open the project with Claude Code. No setup needed beyond a recent CLI version.
        </p>
        <ul className="list-disc pl-sp-md flex flex-col gap-gp-md text-body-md text-fg-muted">
          <li><strong className="text-fg-default">CLAUDE.md</strong> — project-wide rules, loaded automatically on every session</li>
          <li><strong className="text-fg-default">.claude/rules/ds-standards.md</strong> — auto-loaded by glob for any DS-related work</li>
          <li><strong className="text-fg-default">.claude/agents/</strong> — 4 specialized agents (orchestrator, designer, dev, reviewer)</li>
          <li><strong className="text-fg-default">.claude/skills/</strong> — atomic skills triggered via SkillTool or slash commands</li>
          <li><strong className="text-fg-default">.claude/hooks/</strong> — format-on-save, block-rm-rf, block-sensitive-edit</li>
          <li><strong className="text-fg-default">.claude/output-styles/terse.md</strong> — keeps responses tight</li>
        </ul>
        <p className="text-body-md text-fg-muted">
          See the <strong className="text-fg-default">Agents</strong> section in the sidebar for the full pipeline diagram and per-agent docs.
        </p>
      </div>

      {/* Troubleshoot */}
      <SectionH2 id="troubleshoot" title="Troubleshooting" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Theme CSS shows up empty</p>
          <p className="text-body-md text-fg-muted">
            Re-run <code className="font-mono text-code-sm">npm run tokens:tw4</code>. The file is committed only because it's
            the published export — but it must be regenerated whenever you change a token.
          </p>
        </div>
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Classes like <code className="font-mono text-code-sm">gap-4</code> render but DS classes don't</p>
          <p className="text-body-md text-fg-muted">
            DS classes use anti-collision prefixes: <code className="font-mono text-code-sm">gap-gp-md</code>, not <code className="font-mono text-code-sm">gap-4</code>.
            See Foundations → Tokens Overview for the full mapping.
          </p>
        </div>
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Port 3100 already in use</p>
          <p className="text-body-md text-fg-muted">
            Edit <code className="font-mono text-code-sm">vite.config.ts</code> and change the <code className="font-mono text-code-sm">server.port</code> value, or pass <code className="font-mono text-code-sm">--port</code> on the CLI.
          </p>
        </div>
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Pre-existing TypeScript errors</p>
          <p className="text-body-md text-fg-muted">
            A handful of <code className="font-mono text-code-sm">GridRowId</code> and <code className="font-mono text-code-sm">sidebarRailUserDefault</code> errors
            are documented as pre-existing and do not block <code className="font-mono text-code-sm">npm run dev</code>. Confirm with <code className="font-mono text-code-sm">npx tsc --noEmit</code>.
          </p>
        </div>
      </div>
    </DocLayout>
  );
}
