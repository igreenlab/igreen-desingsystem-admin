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
    <div className="flex flex-col sm:flex-row items-start gap-gp-sm sm:gap-gp-xl py-pad-md border-b border-border-subtle last:border-b-0">
      <code className="text-code-sm text-fg-brand font-mono shrink-0 min-w-0 sm:min-w-[260px]">{path}</code>
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
          O iGreen DS chega no consumidor por <strong className="text-fg-default">4 canais</strong>: (1) <strong className="text-fg-default">copy-in via registry shadcn</strong> — o consumidor roda <C>npm run igreen:add -- &lt;item&gt;</C> e o <strong className="text-fg-default">código do componente é copiado pro projeto dele</strong> (vira código dele, editável). É o canal <strong className="text-fg-default">primário</strong>;
          (2) o <strong className="text-fg-default">CLI npm</strong> (<C>@snksergio/create-design-system</C>), que scaffolda um projeto novo já consumindo o registry + kit;
          (3) <strong className="text-fg-default">git submódulo</strong> — o consumidor aponta o DS como submódulo e roda <C>ds-link</C> (<C>npm run ds:link</C>) pra projetar o kit de skills no <C>.claude/</C> dele (detalhe em <C>SUBMODULE-SETUP.md</C>);
          e (4) o <strong className="text-fg-default">pacote npm</strong> <C>@snksergio/design-system</C> — lib buildada (ESM + CJS + types + <C>theme.css</C>), canal <strong className="text-fg-default">secundário</strong>: funciona, mas o publish é passo manual do mantenedor, então costuma ficar atrás do registry. Use só quando precisar consumir como dependência em vez de copy-in.
        </p>
        <div className="rounded-radius-base border border-border-warning-muted bg-bg-warning-muted p-pad-3xl">
          <p className="text-body-md text-fg-default font-medium mb-gp-md">Fluxo macro — o passo do meio é MANUAL</p>
          <p className="text-body-md text-fg-muted leading-relaxed font-mono text-code-sm mb-gp-md">
            edita no DS → <span className="text-fg-warning">registry:build</span> → <span className="text-fg-warning">copy-registry.mjs</span> → commit do embed → merge no main → Vercel redeploya → consumidor recebe via <span className="text-fg-brand">igreen:add</span>/<span className="text-fg-brand">igreen:update</span>
          </p>
          <p className="text-body-md text-fg-muted">
            <strong className="text-fg-default">Merge no main NÃO regenera o embed.</strong> O{" "}
            <C>vercel.json</C> roda <C>next build</C>, que não dispara o lifecycle <C>prebuild</C> do npm —
            e mesmo se disparasse, o <C>copy-registry.mjs</C> sai cedo quando <C>../public/r</C> não existe
            (é gitignored e fica fora do root dir da Vercel). Ou seja: <strong className="text-fg-default">a
            Vercel serve exatamente o <C>registry-data.ts</C> que está commitado</strong>. Regenerar é passo
            humano do <C>/ds-release</C>. O <C>registry-check</C> reprova se o embed ficar defasado, comparando
            o <C>meta.stamp</C> (versão + hash git) e o <C>files[]</C> de cada item.
          </p>
        </div>
      </div>

      {/* As 3 peças */}
      <SectionH2 id="pieces" title="As peças da distribuição" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <FileRow path="Registry (Vercel)" desc="igreen-registry.vercel.app — serve o JSON de cada item (Bearer). É de onde o código é copiado. PRIVADO." tag="código" />
        <FileRow path="Catálogo (Vercel)" desc="igreen-desingsystem-admin.vercel.app — este preview público. Mostra os componentes/telas rodando." tag="visão" />
        <FileRow path="CLI (npm)" desc="@snksergio/create-design-system — scaffolda projeto novo já consumindo o registry + kit." tag="scaffold" />
        <FileRow path="Pacote npm (lib)" desc="@snksergio/design-system — lib buildada por npm run build:lib. Canal SECUNDÁRIO: publish manual do mantenedor (gate de token no passo 7 do /ds-release), validado antes por npm run lib:verify." tag="secundário" />
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
          <p className="ml-sp-md">registry.json                      <span className="text-fg-subtle">← MANIFESTO canônico: lista os 99 itens + files + deps</span></p>
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
              <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-0 sm:min-w-[140px]">{k}</code>
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
        <FileRow path=".claude/skills/ (13 + ds-kit)" desc="Skills focadas: crud-builder, list-builder, dashboard-builder, app-builder, auth-builder, screen-composer, module-replicator, page-edit, page-detail, charts, chat, drawers, cards." tag="skills" />
        <FileRow path=".claude/rules/ (4)" desc="ds-design.md (gap pós-PageHeader, FormField, tokens DS) · ds-components.md (vocabulário: qual componente pra cada tarefa) · ds-themes.md (as 5 marcas) · ds-channels.md (npm / submódulo / copy-in). Entram como project instruction em toda sessão." tag="rules" />
        <FileRow path=".claude/hooks/protect-ds.mjs" desc="Bloqueia edição de tema/tokens/fundação; avisa edição de componente." tag="proteção" />
        <FileRow path=".mcp.json" desc="MCP do shadcn — a IA lista/adiciona @igreen por conta própria." tag="mcp" />
      </div>

      {/* Guardrails */}
      <SectionH2 id="guardrails" title="Guardrails do pipeline (DS)" />
      <div className="flex flex-col gap-gp-xs mb-14">
        <FileRow path="hook ds-inventory-check" desc="Componente sem USAGE.md / fora do inventory.md / fora do registry.json → avisa." tag="hook" />
        <FileRow path="hook ds-tokens-check" desc="Editou token → lembra tokens:tw4 + registry:build + bump (/ds-release)." tag="hook" />
        <FileRow path="examples-drift-check" desc="example-* defasado vs seu showcase-fonte → avisa (roda no registry:build)." tag="check" />
        <FileRow path="registry-check" desc="Paths do registry.json existem, sem backslash, e o embed está em sync — comparado por meta.stamp (versão + hash git) e files[] de cada item, não só pela presença do nome. Nome não muda entre releases, então o check antigo era verde-permanente com conteúdo velho." tag="CI" />
        <FileRow path="copy-registry (guard)" desc="Recusa escrever o embed quando o public/r está defasado (itens faltando ou carimbo de versão anterior) — gerar dali REGRIDE o consumidor em silêncio." tag="guard" />
        <FileRow path="distribution-debt" desc="Componente fora do registry.json ou do catálogo do CLI. Informativo na PR (Regra 8: distribuição consolida no /ds-release), bloqueante no release:check." tag="CI" />
        <FileRow path="lib-verify" desc="Integridade do pacote npm antes do publish: exige que o conjunto de .d.ts do tarball seja fechado sob imports relativos (L-017 — 4 releases publicadas com types quebrados em silêncio)." tag="CI" />
        <FileRow path="showcase-check + api-doc-check" desc="Componente novo sem rota no showcase (bloqueia) e componente existente que amplia API sem tocar o USAGE (avisa)." tag="CI" />
        <FileRow path="CI (.github/workflows)" desc="Em PR/push: tsc + vitest (que é onde a maioria dos gates acima roda) + registry-check + foundationals + examples-drift + lint ratchet + débito + showcase + api-doc + lib-verify." tag="CI" />
        <FileRow path="generated-artifacts" desc="Regenera tailwind-theme.css + os 4 brand-*.css pelo MESMO transform do package.json e compara com o disco. O passo era manual e NENHUM workflow o rodava: editar token e esquecer tokens:tw4 passava verde — e todos os gates de cor leem justamente esse CSS, ou seja, se confirmavam contra um artefato que nada garantia estar atual. Checa cobertura também: .css em styles/theme/ sem gerador conhecido reprova." tag="CI" />
        <FileRow path="dead-theme-classes" desc="Classe de cor cuja CSS var não existe no tema — some em silêncio, sem quebrar build/tsc/teste. Cobre src/ E a DOC (CLAUDE.md, .claude/, .ai/, cli/templates/), porque a doc é o que GERA o código: 44 usos de vocabulário extinto sobreviveram meses nas skills, inclusive no template canônico." tag="CI" />
        <FileRow path="barrel-completeness" desc="Componente do registry ausente do src/components/index.ts — o barrel É o canal npm. Era a única das 8 superfícies sem vigilância: Chart/DataList/List/Toast passaram meses com 6 de 7 fechadas e import { ChartContainer } estourando 'not exported' no consumidor." tag="CI" />
        <FileRow path="deps-declared" desc="Import externo nos diretórios publicados que não está em dependencies/peerDependencies — incluindo dep de TIPO (resolve from 'geojson' por @types/geojson). Sem isso, compila só porque o consumidor declarava (L-037/L-058)." tag="CI" />
        <FileRow path="orphan-utilities + runtime-base" desc="@utility usada por componente e ausente do tema; e as 7 peças de runtime no tema, com a cópia do CLI idêntica à fonte. O runtime-base PROÍBE o globals.css de redeclarar qualquer uma — duplicar é pior que faltar, porque o showcase mostra o certo e o consumidor recebe o errado." tag="CI" />
        <FileRow path="shadcn-vocab" desc="Vocabulário da bridge (bg-popover, text-foreground…) e paleta nativa do Tailwind em componente/exemplo/showcase. As 19 chaves da bridge só existem no globals.css: não viajam pros canais, e a cor cai em currentColor (L-039)." tag="CI" />
        <FileRow path="brand-check" desc="As 10 superfícies de uma marca. Só 2 falham visivelmente (tsc e build:lib); as outras 8 falham em silêncio — a marca existe, o showcase funciona, e ela não chega em algum canal." tag="CI" />
        <FileRow path="skills-routing + lessons-index" desc="Skill/command novo ausente de uma das 4 superfícies de roteamento (L-047), e lição que existe na fonte mas não no resumo auto-carregado — 6 lições ficaram invisíveis atrás da frase 'o atalho de TODAS'." tag="CI" />
        <FileRow path="canonical-base-ref" desc="Resolve a base do diff pela URL do remote, não pelo nome. origin aqui é um fork parado (3 meses de atraso, medido): contra ele os gates de ratchet acusavam 17 violações e um componente 'novo sem showcase' — 0 contra a base canônica. Toda saída imprime a base resolvida (L-069)." tag="CI" />
        <FileRow path="pre-commit-check §2.8" desc="Gate amplo antes de commit grande: registry/tokens/embed/cli atualizados." tag="gate" />
      </div>
    </DocLayout>
  );
}
