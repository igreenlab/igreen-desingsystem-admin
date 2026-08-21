import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { PROMPT_INSTALAR } from "../data/install-prompts";

/**
 * Installation — organizada por CASO DE USO, não por assunto técnico.
 *
 * Até 2026-08-21 esta página tinha 10 seções misturando três públicos: quem consome o DS,
 * quem desenvolve NO DS, e infra do pipeline. A 2ª seção que o leitor batia era
 * "Requirements (para desenvolver NO DS)" — ruído pra 90% de quem chega aqui querendo
 * instalar. Agora as 4 primeiras seções são os 4 canais de consumo, e tudo de contribuidor
 * mora no fim, sob um único cabeçalho que diz pra quem é.
 *
 * Todo comando de EXECUTÁVEL leva `@latest`. Sem isso o `npx`/`npm create` resolve contra o
 * cache e pode rodar qualquer versão — em 2026-08-21 rodou a 0.1.0 numa máquina, com a
 * 0.25.10 publicada, e quebrou por um bug que não existe mais no código.
 */

const TOC = [
  { id: "escolha", label: "Qual é o seu caso?" },
  { id: "prompt", label: "Atalho: cole um prompt" },
  { id: "novo", label: "1. Projeto novo" },
  { id: "existente", label: "2. Projeto existente" },
  { id: "submodulo", label: "3. Monorepo / submódulo" },
  { id: "npm", label: "4. Biblioteca npm" },
  { id: "validar", label: "Validar a instalação" },
  { id: "problemas", label: "Problemas comuns" },
  { id: "contribuir", label: "Desenvolver no DS" },
];

function Code({ children }: { children: string }) {
  return (
    <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">
      {children}
    </code>
  );
}

function CmdRow({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="flex flex-col sm:flex-row items-start gap-gp-sm sm:gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle last:border-b-0">
      <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-0 sm:min-w-[220px]">{cmd}</code>
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

/** Aviso de falha SILENCIOSA — o tipo que não dá erro e por isso precisa de destaque. */
function Silencioso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-radius-base border border-border-warning-muted bg-bg-warning-muted p-pad-3xl flex flex-col gap-gp-md">
      <p className="text-body-md font-medium text-fg-default">⚠ {titulo}</p>
      {children}
    </div>
  );
}

/**
 * Copiar o prompt. Deliberadamente simples: o CopyButton da Landing carrega animação de
 * pulso e o CSS dela, que não existe nesta página.
 */
function CopiarPrompt({ texto }: { texto: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <Button
      color="primary"
      size="md"
      onClick={() => {
        navigator.clipboard.writeText(texto).then(
          () => {
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
          },
          () => setCopiado(false),
        );
      }}
    >
      {copiado ? "Copiado!" : "Copiar prompt"}
    </Button>
  );
}

export function InstallationDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Installation"
        description="Quatro caminhos, um por tipo de projeto. Ache o seu na tabela e siga só aquela seção."
      />
      <DocSeparator />

      {/* ── escolha ────────────────────────────────────────────────────── */}
      <SectionH2 id="escolha" title="Qual é o seu caso?" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[190px_1fr] gap-0 bg-bg-subtle border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Seu projeto</div>
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Comando</div>
          </div>
          {[
            {
              caso: "Não existe ainda",
              cmd: "npx @snksergio/create-design-system@latest my-app",
              secao: "1",
            },
            {
              caso: "Já existe",
              cmd: "npx @snksergio/create-design-system@latest --only-kit",
              secao: "2",
            },
            {
              caso: "Monorepo / submódulo",
              cmd: "git submodule add … && npm --prefix design-system run ds:link",
              secao: "3",
            },
            {
              caso: "Só quero a lib",
              cmd: "npm install @snksergio/design-system@latest",
              secao: "4",
            },
          ].map((r) => (
            <div key={r.caso} className="grid grid-cols-[190px_1fr] gap-0 border-t border-border-subtle">
              <div className="py-pad-xl px-pad-xl flex items-center gap-gp-sm">
                <Badge color="secondary" variant="outline" size="sm">{r.secao}</Badge>
                <span className="text-body-md font-medium text-fg-default">{r.caso}</span>
              </div>
              <div className="py-pad-xl px-pad-xl">
                <code className="font-mono text-code-sm text-fg-brand">{r.cmd}</code>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-radius-base border border-border-danger-muted bg-bg-danger-muted p-pad-3xl flex flex-col gap-gp-md">
          <p className="text-body-md font-medium text-fg-default">
            ⛔ Sempre <Code>@latest</Code>, e sempre pelo nome do PACOTE
          </p>
          <p className="text-body-md text-fg-muted">
            <Code>npx create-snksergio-design-system</Code> (o nome do binário) resolve contra o
            cache do npx e pode rodar qualquer versão que já passou pela sua máquina. Em
            2026-08-21 rodou a <strong className="text-fg-default">0.1.0</strong> com a 0.25.10
            publicada, e o scaffold quebrou por um bug que já não existe. O banner imprime a
            versão na 2ª linha — confira.
          </p>
        </div>

        <p className="text-body-md text-fg-muted">
          Já instalado e quer subir de versão? →{" "}
          <strong className="text-fg-default">Como atualizar</strong> (<Code>#/how-to-update</Code>).
        </p>
      </div>

      {/* ── atalho: o prompt ──────────────────────────────────────────── */}
      <SectionH2 id="prompt" title="Atalho: cole um prompt no Claude Code" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Se você usa Claude Code, não precisa seguir os passos na mão. Este prompt instala o DS
          como submódulo, configura os <strong className="text-fg-default">dois</strong> aliases,
          importa o tema, copia as fontes, roda o <Code>ds:link</Code> e
          <strong className="text-fg-default"> valida</strong> com os 4 checks antes de dizer
          que acabou. É o mesmo da página <strong className="text-fg-default">Início</strong> —
          as duas leem o mesmo arquivo, então não divergem.
        </p>
        <div className="flex flex-col gap-gp-xl rounded-radius-base border border-border-brand-subtle bg-bg-brand-subtle p-pad-3xl">
          <div className="flex flex-wrap items-center justify-between gap-gp-md">
            <div className="flex flex-col gap-gp-2xs">
              <span className="text-title-md text-fg-default">Instalar o DS</span>
              <span className="text-caption-md text-fg-muted">
                Cole uma vez, na raiz do projeto — vazio ou já existente.
              </span>
            </div>
            <CopiarPrompt texto={PROMPT_INSTALAR} />
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-canvas p-pad-3xl max-h-[320px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-code-sm text-fg-muted leading-relaxed">
              {PROMPT_INSTALAR}
            </pre>
          </div>
        </div>
        <p className="text-body-md text-fg-muted">
          O prompt de <strong className="text-fg-default">construir</strong> a primeira tela
          fica na Início, na aba ao lado deste.
        </p>
      </div>

      {/* ── 1. projeto novo ────────────────────────────────────────────── */}
      <SectionH2 id="novo" title="1. Projeto novo (scaffold)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <CodeBlock>{`npx @snksergio/create-design-system@latest my-app
cd my-app
npm run dev
# → http://localhost:3200`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          Vite + React 19 + Tailwind v4, tema light/dark, as 5 marcas, o kit de IA e uma tela de
          exemplo — já configurados. O CLI pergunta nome, marca, package manager, token do
          registry e se instala deps/git.
        </p>
        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">Variações</p>
          <CodeBlock>{`# sem args (o CLI pergunta tudo, inclusive o nome)
npx @snksergio/create-design-system@latest

# pnpm / yarn
pnpm create @snksergio/design-system@latest my-app
yarn create @snksergio/design-system@latest my-app

# versão específica (placeholder — troque pelo número que você quer)
npm create @snksergio/design-system@<x.y.z> my-app`}</CodeBlock>
        </div>
      </div>

      {/* ── 2. projeto existente ───────────────────────────────────────── */}
      <SectionH2 id="existente" title="2. Projeto existente (copy-in)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          No copy-in cada componente entra como <strong className="text-fg-default">código seu</strong>,
          no seu repo — do jeito shadcn. Nada em <Code>node_modules</Code>, nada de versão de
          pacote pra casar.
        </p>
        <CodeBlock>{`# 1. o kit de IA + os scripts, na raiz do seu projeto
npx @snksergio/create-design-system@latest --only-kit

# 2. o token do registry
cp .env.local.example .env.local     # cole o IGREEN_TOKEN

# 3. puxe o que precisar
npm run igreen:add -- button data-table form-field`}</CodeBlock>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <CmdRow cmd="npm run igreen:add -- <nome>" desc="Traz o componente e registra no manifesto (.igreen-ds/manifest.json)" />
          <CmdRow cmd="npm run igreen:drift" desc="O que está defasado, e o que VOCÊ editou desde que instalou" />
          <CmdRow cmd="npm run igreen:update -- --all" desc="Atualiza o defasado, pulando o que você editou" />
          <CmdRow cmd="npm run doctor" desc="Valida cn/tv contra o registry — o drift que não dá erro nenhum" />
        </div>
        <p className="text-body-md text-fg-muted">
          O <Code>--only-kit</Code> não sobrescreve arquivo seu que colida. Detalhe de atualização
          em <strong className="text-fg-default">Como atualizar</strong>.
        </p>
      </div>

      {/* ── 3. submódulo ───────────────────────────────────────────────── */}
      <SectionH2 id="submodulo" title="3. Monorepo / submódulo" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O DS inteiro como pasta do seu projeto. Você lê o código-fonte direto — sem registry,
          sem pacote. O <Code>ds:link</Code> projeta o kit de IA no seu <Code>.claude/</Code>,
          que o Claude Code não alcança dentro de submódulo.
        </p>
        <CodeBlock>{`git submodule add https://github.com/igreenlab/igreen-desingsystem-admin design-system
git submodule update --init --recursive

# deps de runtime vão na RAIZ (o submódulo entrega fonte, não pacote)
npm i tailwind-variants tailwind-merge clsx lucide-react

# o kit de IA
npm --prefix design-system run ds:link`}</CodeBlock>

        <Silencioso titulo="Pré-requisito: DOIS aliases, não um">
          <p className="text-body-md text-fg-muted">
            As skills geram imports <Code>@ds/components/ui/DataTable</Code>, mas os arquivos do
            DS importam entre si por <Code>@/</Code> — <strong className="text-fg-default">700 imports</strong> —
            e no submódulo ninguém mapeia esse alias por você. Sem o segundo, o build morre no
            primeiro componente: <Code>Cannot find module '@/utils/tv'</Code>.
          </p>
          <CodeBlock>{`// tsconfig.json — paths RELATIVOS, sem baseUrl (removido no TypeScript 7)
{ "compilerOptions": { "paths": {
  "@ds/*": ["./design-system/src/*"],
  "@/*":   ["./design-system/src/*"]
} } }

// vite.config.ts — import.meta.dirname (não __dirname, que não existe em ESM)
resolve: {
  dedupe: ["react", "react-dom"],
  alias: {
    "@ds": path.resolve(import.meta.dirname, "design-system/src"),
    "@":   path.resolve(import.meta.dirname, "design-system/src"),
  },
}`}</CodeBlock>
        </Silencioso>

        <Silencioso titulo="⛔ NÃO rode npm install dentro do submódulo">
          <p className="text-body-md text-fg-muted">
            Um segundo <Code>node_modules</Code> cria uma cópia extra do React —{" "}
            <Code>Invalid hook call</Code> em qualquer componente com hook, mais erro de tipo por
            dois <Code>@types/react</Code> no mesmo programa. As deps vão na raiz.
          </p>
        </Silencioso>

        <CodeBlock>{`/* src/index.css — o tema, UMA vez, depois do tailwindcss */
@import "tailwindcss";
@import "../design-system/src/styles/theme/tailwind-theme.css";`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          Não precisa de <Code>@source</Code>: o submódulo fica dentro da raiz, então o scan do
          Tailwind já o alcança. Copie as fontes uma vez —{" "}
          <Code>cp design-system/public/fonts/*.woff2 public/fonts/</Code> — senão os 27 presets
          caem em <Code>system-ui</Code> sem nenhum erro. Guia completo em{" "}
          <Code>SUBMODULE-SETUP.md</Code>.
        </p>
        <div className="rounded-radius-base border border-border-brand-subtle bg-bg-brand-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">⚡ Atalho</p>
          <p className="text-body-md text-fg-muted">
            A página <strong className="text-fg-default">Início</strong> tem um prompt pronto pra
            colar no Claude Code (aba <strong className="text-fg-default">Instalar o DS</strong>):
            ele faz os passos acima e <strong className="text-fg-default">valida</strong> antes de
            dizer que acabou.
          </p>
        </div>
      </div>

      {/* ── 4. npm ─────────────────────────────────────────────────────── */}
      <SectionH2 id="npm" title="4. Biblioteca npm" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <CodeBlock>{`npm install @snksergio/design-system@latest`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          Pré-requisitos: React 19+, Tailwind v4 configurado, e o <Code>theme.css</Code> importado
          uma vez no CSS de entrada.
        </p>

        <Silencioso titulo="A diretiva @source é OBRIGATÓRIA">
          <p className="text-body-md text-fg-muted">
            O Tailwind v4 não escaneia <Code>node_modules</Code>. Sem o <Code>@source</Code>,{" "}
            <strong className="text-fg-default">nenhuma</strong> classe do DS é gerada — e não há
            erro: o componente renderiza cru (a cor aparece, spacing/radius/shadow somem).
          </p>
          <CodeBlock>{`/* src/index.css */
@import "tailwindcss";

@source "../node_modules/@snksergio/design-system/dist-lib/**/*.{mjs,cjs,js}";

@import "@snksergio/design-system/theme.css";`}</CodeBlock>
        </Silencioso>

        <CodeBlock>{`import { Button, AppShell, DataTable } from "@snksergio/design-system";
import { colorLight, spacing } from "@snksergio/design-system/tokens";
import ClientesShowcase from "@snksergio/design-system/preview/clientes";`}</CodeBlock>

        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[210px_1fr] gap-0 bg-bg-subtle border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Sub-path</div>
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">O que exporta</div>
          </div>
          {[
            { path: ".", desc: "Componentes iGreen + Shadcn adaptados" },
            { path: "/theme.css", desc: "Tema gerado: @theme, dark mode, 27 presets, fonte Geist, @custom-variant, regras de html/body, outline-float, scrollbar-*" },
            { path: "/theme/brand-<id>.css", desc: "Overlay de uma marca (blue, green, pay, vibrant) — importe DEPOIS do theme.css e aplique data-theme no <html>" },
            { path: "/tokens", desc: "Tokens semânticos como objeto (colorLight, spacing, sizing…)" },
            { path: "/preview/<nome>", desc: "Showcases prontas: chat, clientes, dashboard" },
            { path: "/preview/mocks", desc: "Mocks reutilizáveis (APP_SHELL_*, chatMocks, clientesMocks)" },
          ].map((row) => (
            <div key={row.path} className="grid grid-cols-[210px_1fr] gap-0 border-t border-border-subtle">
              <div className="py-pad-md px-pad-xl"><code className="font-mono text-code-sm text-fg-brand">{row.path}</code></div>
              <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">{row.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── validar ────────────────────────────────────────────────────── */}
      <SectionH2 id="validar" title="Validar a instalação" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Quatro checagens, nesta ordem. O <Code>Button</Code> sozinho{" "}
          <strong className="text-fg-default">não basta</strong>: ele não usa hook nenhum, então
          renderiza certo mesmo com React duplicado no bundle.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          {[
            {
              n: "1",
              o: "Button: cor E spacing/radius",
              p: "só a cor certa = tema não importado (as CSS vars de cor caem em currentColor, mas o spacing simplesmente não existe)",
            },
            {
              n: "2",
              o: "Um componente com hook/context",
              p: "AppShell, FloatingPanel ou DataTable renderizando sem Invalid hook call — é este check que prova que não há React duplicado",
            },
            {
              n: "3",
              o: 'document.fonts.check("16px Geist") === true',
              p: "status HTTP não serve: o dev server devolve 200 com o index.html pra arquivo inexistente",
            },
            { n: "4", o: "npx tsc --noEmit", p: "limpo na raiz" },
          ].map((c) => (
            <div key={c.n} className="flex flex-col sm:flex-row items-start gap-gp-sm sm:gap-gp-xl py-pad-xl px-pad-3xl border-b border-border-subtle last:border-b-0">
              <div className="flex items-center gap-gp-sm shrink-0 sm:min-w-[280px]">
                <Badge color="secondary" variant="outline" size="sm">{c.n}</Badge>
                <span className="text-body-md font-medium text-fg-default">{c.o}</span>
              </div>
              <span className="text-body-md text-fg-muted flex-1">{c.p}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── problemas ──────────────────────────────────────────────────── */}
      <SectionH2 id="problemas" title="Problemas comuns" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        {[
          {
            t: "Componentes sem estilo depois do npm install",
            d: "Falta a diretiva @source apontando pro dist-lib/** do pacote. O Tailwind v4 não escaneia node_modules, então nenhuma classe do DS é gerada — e não há erro. Receita na seção 4. Submódulo não sofre: fica dentro da raiz.",
          },
          {
            t: "Invalid hook call",
            d: "Duas cópias do React. No submódulo, é npm install rodado DENTRO da pasta do DS — apague o node_modules dele e deixe as deps na raiz, com resolve.dedupe: [\"react\", \"react-dom\"] no vite.",
          },
          {
            t: "Cannot find module '@/utils/tv'",
            d: "Falta o SEGUNDO alias. Os arquivos do DS importam entre si por @/ — mapeie @/ e @ds/ pra <submódulo>/src, no tsconfig E no bundler.",
          },
          {
            t: "A fonte parece errada, sem erro no console",
            d: "As .woff2 do Geist não estão em public/fonts/. O dev server devolve o index.html no lugar do arquivo e os 27 presets caem em system-ui. Confira com document.fonts.check(\"16px Geist\").",
          },
          {
            t: "gap-4 funciona mas gap-gp-md não",
            d: "As classes do DS usam prefixo anti-colisão. gap-gp-md, px-pad-lg, rounded-radius-base, shadow-sh-md, min-h-form-lg. Mapa completo em Foundations → Tokens.",
          },
          {
            t: "O overlay de marca não faz nada",
            d: "Importar o brand-<id>.css sem pôr data-theme=\"<id>\" no <html> é no-op silencioso. E o overlay entra DEPOIS do theme.css.",
          },
          {
            t: "/ds-create-crud não aparece",
            d: "Slash command só é registrado no início da sessão. Reinicie o Claude Code depois de instalar ou re-projetar o kit.",
          },
        ].map((p) => (
          <div key={p.t} className="rounded-radius-base border border-border-subtle p-pad-3xl">
            <p className="text-body-md font-medium text-fg-default mb-gp-md">{p.t}</p>
            <p className="text-body-md text-fg-muted">{p.d}</p>
          </div>
        ))}
      </div>

      {/* ── contribuir ─────────────────────────────────────────────────── */}
      <SectionH2 id="contribuir" title="Desenvolver no DS (contribuir)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Daqui pra baixo é pra quem vai <strong className="text-fg-default">mexer no DS</strong>,
          não pra quem consome. Se você só quer usar os componentes, as seções acima já bastam.
        </p>

        <CodeBlock>{`git clone https://github.com/igreenlab/igreen-desingsystem-admin.git
cd igreen-desingsystem-admin
npm install
npm run dev
# → http://localhost:3100`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          O <Code>dev</Code> roda <Code>tokens:tw4</Code> antes de subir o Vite — o tema é
          regenerado a cada start. Requisitos: Node ≥ 20, npm ≥ 10, Tailwind{" "}
          <strong className="text-fg-default">v4</strong> (v3 não é suportado: os prefixos
          anti-colisão dependem do <Code>@theme</Code>).
        </p>

        <p className="text-body-md font-medium text-fg-default">Scripts do dia a dia</p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <CmdRow cmd="npm run dev" desc="Tokens + Vite na 3100" />
          <CmdRow cmd="npm test" desc="A suíte inteira, incluindo os gates mecânicos" />
          <CmdRow cmd="npm run tokens:tw4" desc="Regenera o tema (rode após mexer em token)" />
          <CmdRow cmd="npm run release:check" desc="Gate de release: registry, marcas, débito de distribuição, blocos" />
          <CmdRow cmd="npm run lint:styles" desc="Anti-patterns de estilo em modo ratchet — reprova só violação NOVA" />
        </div>

        <p className="text-body-md font-medium text-fg-default">Marcas e distribuição</p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <CmdRow cmd="npm run tokens:brand:<id>" desc="Regenera o overlay de uma marca (blue, green, pay, vibrant)" />
          <CmdRow cmd="npm run brand:check" desc="As 10 superfícies de cada marca — 8 falham em silêncio sem ele" />
          <CmdRow cmd="npm run registry:build" desc="Drift dos examples + tokens + stamp + shadcn build" />
          <CmdRow cmd="npm run blocks:build" desc="Índice de blocos do consumidor + itens registry:block" />
          <CmdRow cmd="npm run cli:rebake" desc="Rebakeia os foundationals do template do CLI" />
          <CmdRow cmd="npm run ds:link" desc="Projeta o kit de IA no .claude/ do projeto pai (canal submódulo)" />
        </div>

        <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl">
          <p className="text-body-md text-fg-muted">
            <Code>npm run lib:publish:*</Code> existe e{" "}
            <strong className="text-fg-default">recusa rodar</strong> de propósito: publicar passa
            pelo <Code>/ds-release</Code>, que bumpa, valida com <Code>lib:verify</Code> e PARA
            pedindo o mantenedor.
          </p>
        </div>

        <p className="text-body-md text-fg-muted">
          O pipeline de IA (<Code>.claude/</Code>) ativa sozinho ao abrir o repo no Claude Code:
          4 agentes, as skills por tarefa, 6 hooks e as rules auto-carregadas. Diagrama e doc por
          agente na seção <strong className="text-fg-default">Agents</strong> da sidebar.
        </p>
        <p className="text-body-md text-fg-muted">
          <Code>npx tsc --noEmit</Code> deve retornar <strong className="text-fg-default">zero</strong>{" "}
          — o CI bloqueia nisso. Se você vê erro de tipo, é regressão: conserte, não contorne.
        </p>
      </div>
    </DocLayout>
  );
}
