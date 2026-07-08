import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "pieces", label: "As peças" },
  { id: "folders", label: "Organização das pastas" },
  { id: "register", label: "Como registrar um componente" },
  { id: "change", label: "Alterar / nova versão" },
  { id: "release", label: "Release & deploy" },
  { id: "versioning", label: "Versionamento" },
  { id: "consumer", label: "Kit do consumidor" },
  { id: "guardrails", label: "Guardrails do pipeline" },
];

function FileRow({ path, desc, tag }: { path: string; desc: string; tag?: string }) {
  return (
    <div className="flex items-start gap-gp-xl py-pad-md border-b border-border-subtle last:border-b-0">
      <code className="text-code-sm text-fg-brand font-mono shrink-0 min-w-[260px]">{path}</code>
      <span className="text-body-md text-fg-muted flex-1">{desc}</span>
      {tag && <Badge color="secondary" variant="outline" size="sm" className="shrink-0">{tag}</Badge>}
    </div>
  );
}

function Step({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-gp-xl">
      <span className="grid place-items-center size-icon-2xl rounded-radius-full bg-bg-brand text-fg-on-brand text-body-sm font-bold shrink-0">{n}</span>
      <div className="flex flex-col gap-gp-2xs min-w-0 pb-gp-2xl">
        <p className="text-body-md font-semibold text-fg-default">{title}</p>
        <div className="text-body-md text-fg-muted">{children}</div>
      </div>
    </div>
  );
}

const C = ({ children }: { children: React.ReactNode }) => (
  <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">{children}</code>
);

export function DistributionDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Distribuição & Registry"
        description="Como o DS é distribuído (registry copy-in + CLI), onde cada coisa mora, e como registrar/versionar componentes."
      />
      <DocSeparator />

      {/* Overview */}
      <SectionH2 id="overview" title="Overview" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O iGreen DS chega no consumidor por <strong className="text-fg-default">3 canais</strong>: (1) <strong className="text-fg-default">copy-in via registry shadcn</strong> — o consumidor roda <C>npm run igreen:add -- &lt;item&gt;</C> e o <strong className="text-fg-default">código do componente é copiado pro projeto dele</strong> (vira código dele, editável);
          (2) o <strong className="text-fg-default">CLI npm</strong> (<C>@snksergio/create-design-system</C>), que scaffolda um projeto novo já consumindo o registry + kit;
          e (3) <strong className="text-fg-default">git submódulo</strong> — o consumidor aponta o DS como submódulo e roda <C>ds-link</C> (<C>npm run ds:link</C>) pra projetar o kit de skills no <C>.claude/</C> dele (detalhe em <C>SUBMODULE-SETUP.md</C>).
          O número da versão e o conteúdo vêm do registry hospedado na Vercel.
        </p>
        <div className="rounded-radius-base border border-border-subtle p-pad-3xl">
          <p className="text-body-md text-fg-default font-medium mb-gp-md">Fluxo macro</p>
          <p className="text-body-md text-fg-muted leading-relaxed font-mono text-code-sm">
            você edita no DS → merge no main → Vercel redeploya o registry → consumidor recebe via <span className="text-fg-brand">igreen:add</span>/<span className="text-fg-brand">igreen:update</span>
          </p>
        </div>
      </div>

      {/* As 3 peças */}
      <SectionH2 id="pieces" title="As peças da distribuição" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <FileRow path="Registry (Vercel)" desc="igreen-registry.vercel.app — serve o JSON de cada item (Bearer). É de onde o código é copiado. PRIVADO." tag="código" />
        <FileRow path="Catálogo (Vercel)" desc="igreen-desingsystem-admin.vercel.app — este preview público. Mostra os componentes/telas rodando." tag="visão" />
        <FileRow path="CLI (npm)" desc="@snksergio/create-design-system — scaffolda projeto novo já consumindo o registry + kit." tag="scaffold" />
        <FileRow path="Submódulo (git)" desc="Consumidor aponta o DS como git submódulo e roda ds-link (npm run ds:link) pra projetar o kit de skills no .claude/ dele — paridade com o npm. Detalhe em SUBMODULE-SETUP.md." tag="submódulo" />
      </div>

      {/* Organização das pastas */}
      <SectionH2 id="folders" title="Organização das pastas (distribuição)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Pra a estrutura geral do projeto veja <strong className="text-fg-default">Get Started → Structure</strong>. Aqui só as pastas que tocam a distribuição:
        </p>
        <div className="rounded-radius-base border border-border-subtle p-pad-4xl font-mono text-code-sm text-fg-muted leading-loose">
          <p className="text-fg-default font-semibold">igreen-ds/</p>
          <p className="ml-sp-md">registry.json                      <span className="text-fg-subtle">← MANIFESTO canônico: lista os 78 itens + files + deps</span></p>
          <p className="ml-sp-md">public/r/                          <span className="text-fg-subtle">← JSON gerado por item (npx shadcn build) — gitignored</span></p>
          <p className="ml-sp-md">registry-app/                      <span className="text-fg-subtle">← app Next.js que SERVE o registry na Vercel</span></p>
          <p className="ml-sp-2xl">app/registry-data.ts            <span className="text-fg-subtle">← EMBED dos JSON (commitado — fonte do deploy)</span></p>
          <p className="ml-sp-2xl">scripts/copy-registry.mjs       <span className="text-fg-subtle">← regenera o embed a partir de public/r</span></p>
          <p className="ml-sp-md">src/components/ui/&lt;Nome&gt;/          <span className="text-fg-subtle">← componente iGreen (.tsx/.styles/.types/index/USAGE.md)</span></p>
          <p className="ml-sp-md">src/components/shadcn/&lt;nome&gt;       <span className="text-fg-subtle">← primitivo shadcn tematizado</span></p>
          <p className="ml-sp-md">src/examples/&lt;tela&gt;/              <span className="text-fg-subtle">← telas-exemplo (extração 1:1 dos showcases)</span></p>
          <p className="ml-sp-md">scripts/</p>
          <p className="ml-sp-2xl">registry-add-item.mjs           <span className="text-fg-subtle">← propõe entrada do registry pra um componente</span></p>
          <p className="ml-sp-2xl">registry-check.mjs              <span className="text-fg-subtle">← valida paths + embed (CI)</span></p>
          <p className="ml-sp-2xl">examples-drift-check.mjs        <span className="text-fg-subtle">← avisa examples↔showcase defasados</span></p>
          <p className="ml-sp-md">cli/                               <span className="text-fg-subtle">← o CLI npm (create-design-system)</span></p>
          <p className="ml-sp-2xl">templates/default/              <span className="text-fg-subtle">← o projeto que o scaffold gera (com .claude/ + DESIGN.md)</span></p>
        </div>
      </div>

      {/* Como registrar */}
      <SectionH2 id="register" title="Como registrar um componente NOVO" />
      <div className="flex flex-col gap-gp-md mb-14">
        <p className="text-body-md text-fg-muted mb-gp-md">
          Criar o componente em <C>src/components/ui/&lt;Nome&gt;/</C> NÃO o distribui. Precisa entrar no <C>registry.json</C>:
        </p>
        <Step n="1" title="Implemente o componente">
          <C>src/components/ui/&lt;Nome&gt;/</C> com <C>.tsx</C>, <C>.styles.ts</C>, <C>.types.ts</C>, <C>index.ts</C> e <C>USAGE.md</C>.
          (A skill <C>ds-dev/impl-igreen</C> guia isso.) O hook <C>ds-inventory-check</C> avisa se faltar USAGE/inventory/registry.
        </Step>
        <Step n="2" title="Gere a entrada do registry">
          <C>node scripts/registry-add-item.mjs &lt;Nome&gt;</C> — escaneia os imports e propõe a entrada (registryDeps <C>@igreen/*</C> + deps npm + alerta de import cross-dir). Revise e adicione ao <C>registry.json</C>.
        </Step>
        <Step n="3" title="Builde o registry">
          <C>npm run registry:build</C> (roda <C>tokens:tw4</C> → carimba a versão → <C>shadcn build</C> gera <C>public/r/</C>) e <C>cd registry-app && node scripts/copy-registry.mjs</C> (regenera o embed).
        </Step>
        <Step n="4" title="Documente">
          USAGE.md ao lado do componente + linha no <C>inventory.md</C> (L-016). Pra distribuir bem, capriche no USAGE — é o que a IA do consumidor lê.
        </Step>
        <Step n="5" title="Release">
          <C>/ds-release</C> — bump da versão + changelog + commit + PR. No merge, a Vercel redeploya o registry. (Detalhes em "Release & deploy".)
        </Step>
      </div>

      {/* Alterar */}
      <SectionH2 id="change" title="Alterar um componente / gerar nova versão" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Mudou o visual de um componente já distribuído (ex.: editou o <C>.styles.ts</C>)? O conteúdo do registry só muda
          quando você <strong className="text-fg-default">rebuilda + bumpa a versão</strong>. Sem isso, o consumidor continua com a versão antiga.
          O hook <C>ds-tokens-check</C> (pra tokens) e o <C>ds-inventory-check</C> (pra componentes) lembram disso; o gate
          <C> pre-commit-check §2.8</C> checa antes do commit. O caminho é sempre <strong className="text-fg-default">/ds-release</strong>.
        </p>
      </div>

      {/* Release & deploy */}
      <SectionH2 id="release" title="Release & deploy" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          <C>/ds-release</C> é o comando único que faz tudo:
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          {[
            ["changelog", "entrada nova em updates-data.ts (esta timeline de Updates)"],
            ["bump", "package.json.version (versão global do registry)"],
            ["registry:build", "re-carimba o stamp na versão nova + regenera public/r + embed"],
            ["commit + PR", "stage de registry.json + embed (+ CLI se mudou) → PR pra main"],
            ["deploy", "no merge: Vercel redeploya o registry-app (Git, Root=registry-app) — automático"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center gap-gp-xl py-pad-md px-pad-3xl border-b border-border-subtle last:border-b-0">
              <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-[140px]">{k}</code>
              <span className="text-body-md text-fg-muted">{v}</span>
            </div>
          ))}
        </div>
        <p className="text-body-md text-fg-muted">
          O <strong className="text-fg-default">CLI</strong> (pasta <C>cli/</C>) é publicado à parte no npm (manual: <C>npm publish</C>), só quando o template muda.
        </p>
      </div>

      {/* Versionamento */}
      <SectionH2 id="versioning" title="Versionamento (tokens & themes incluídos)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Há <strong className="text-fg-default">uma versão global</strong> (<C>package.json.version</C>). Todo item do registry carrega
          <C> meta.stamp = essa versão</C> — inclusive o <C>@igreen/theme</C> (o tema/tokens gerado). Ou seja, <strong className="text-fg-default">tokens
          e themes SÃO versionados</strong>, via o stamp. Não há versão por-componente (decisão de design).
        </p>
        <p className="text-body-md text-fg-muted">
          No consumidor, o <C>npm run igreen:drift</C> compara o que ele tem (manifesto <C>.igreen-ds/manifest.json</C>) com o registry e avisa defasagem/edição local;
          <C> npm run igreen:update</C> atualiza protegendo edições locais.
        </p>
      </div>

      {/* Kit do consumidor */}
      <SectionH2 id="consumer" title="Kit do consumidor (o que o CLI instala)" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <p className="text-body-md text-fg-muted mb-gp-md">
          Projeto scaffoldado nasce com um kit pra a IA do consumidor montar telas por intenção:
        </p>
        <FileRow path="DESIGN.md" desc="Guia de composição enxuto (anatomia de tela, espaçamento, tokens, do/don't). Aponta pros USAGE/exemplos." tag="guia" />
        <FileRow path=".claude/skills/ds-kit" desc="Orquestrador (front-door): identifica a intenção da tela e roteia." tag="router" />
        <FileRow path=".claude/skills/crud-builder…cards" desc="Skills focadas: crud, page-edit, page-detail, dashboard, charts, chat, drawers, cards." tag="skills" />
        <FileRow path=".claude/rules/ds-design.md" desc="Regras duras auto-carregadas (gap pós-PageHeader, FormField, tokens DS)." tag="rules" />
        <FileRow path=".claude/hooks/protect-ds.mjs" desc="Bloqueia edição de tema/tokens/fundação; avisa edição de componente." tag="proteção" />
        <FileRow path=".mcp.json" desc="MCP do shadcn — a IA lista/adiciona @igreen por conta própria." tag="mcp" />
      </div>

      {/* Guardrails */}
      <SectionH2 id="guardrails" title="Guardrails do pipeline (DS)" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <FileRow path="hook ds-inventory-check" desc="Componente sem USAGE.md / fora do inventory.md / fora do registry.json → avisa." tag="hook" />
        <FileRow path="hook ds-tokens-check" desc="Editou token → lembra tokens:tw4 + registry:build + bump (/ds-release)." tag="hook" />
        <FileRow path="examples-drift-check" desc="example-* defasado vs seu showcase-fonte → avisa (roda no registry:build)." tag="check" />
        <FileRow path="registry-check" desc="Paths do registry.json existem + embed em sync (sem token)." tag="CI" />
        <FileRow path="CI (.github/workflows)" desc="Em PR/push: tsc + vitest + registry-check + examples-drift." tag="CI" />
        <FileRow path="pre-commit-check §2.8" desc="Gate amplo antes de commit grande: registry/tokens/embed/cli atualizados." tag="gate" />
      </div>
    </DocLayout>
  );
}
