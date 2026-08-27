import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { PROMPT_ATUALIZAR } from "../data/install-prompts";

/**
 * Como atualizar — uma página por CANAL, porque atualizar significa coisa diferente em
 * cada um. Nasceu de um caso real (2026-08-21): o mantenedor rodou o scaffold e recebeu a
 * CLI **0.1.0** do cache do `npx`, com a 0.25.10 publicada. Nada na doc dizia como
 * atualizar — só como instalar.
 */

const TOC = [
  { id: "qual", label: "Qual canal você usa?" },
  { id: "prompt", label: "Atalho: prompt com auditoria" },
  { id: "cli", label: "1. CLI / scaffold" },
  { id: "copyin", label: "2. Componentes (copy-in)" },
  { id: "npm", label: "3. Biblioteca npm" },
  { id: "submodulo", label: "4. Submódulo" },
  { id: "kit", label: "5. O kit de IA" },
  { id: "checar", label: "Estou desatualizado?" },
];

function Code({ children }: { children: string }) {
  return (
    <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm rounded-radius-sm">
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
      <pre className="whitespace-pre leading-relaxed">{children}</pre>
    </div>
  );
}

/** Cartão de cenário: o comando primeiro, a explicação depois. */
function Cenario({
  titulo,
  quando,
  comando,
  children,
}: {
  titulo: string;
  quando: string;
  comando: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-gp-xl">
      <div className="flex flex-col gap-gp-2xs">
        <span className="text-title-md text-fg-default">{titulo}</span>
        <span className="text-caption-md text-fg-muted">{quando}</span>
      </div>
      <CodeBlock>{comando}</CodeBlock>
      {children}
    </div>
  );
}

/** Copiar o prompt — simples de propósito, sem o CSS de animação da Landing. */
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

export function HowToUpdateDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Como atualizar"
        description="Atualizar significa uma coisa diferente em cada canal. Ache o seu na tabela e rode um comando."
      />
      <DocSeparator />

      <SectionH2 id="qual" title="Qual canal você usa?" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Se você não sabe, olhe o seu projeto: existe <Code>.igreen-ds/manifest.json</Code>?
          É copy-in. Existe uma pasta do DS como submódulo? É submódulo. O DS está em{" "}
          <Code>node_modules</Code>? É npm. Dá pra ter mais de um ao mesmo tempo.
        </p>

        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[140px_1fr_300px] gap-0 bg-bg-subtle border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Você tem</div>
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Como sei</div>
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Atualiza com</div>
          </div>
          {[
            {
              canal: "CLI / scaffold",
              sinal: "você cria projetos novos com npm create",
              cmd: "npx @snksergio/create-design-system@latest",
            },
            {
              canal: "Copy-in",
              sinal: ".igreen-ds/manifest.json na raiz",
              cmd: "npm run igreen:update -- --all",
            },
            {
              canal: "Biblioteca npm",
              sinal: "@snksergio/design-system no package.json",
              cmd: "npm i @snksergio/design-system@latest",
            },
            {
              canal: "Submódulo",
              sinal: ".gitmodules aponta pro DS",
              cmd: "git submodule update --remote --merge && npm --prefix design-system run ds:link",
            },
          ].map((r) => (
            <div
              key={r.canal}
              className="grid grid-cols-[140px_1fr_300px] gap-0 border-t border-border-subtle"
            >
              <div className="py-pad-md px-pad-xl text-body-md font-medium text-fg-default">{r.canal}</div>
              <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">{r.sinal}</div>
              <div className="py-pad-md px-pad-xl">
                <code className="font-mono text-code-sm text-fg-brand break-words">{r.cmd}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionH2 id="prompt" title="Atalho: deixe a IA atualizar, com auditoria" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Atualizar é o que quebra projeto — você troca código que já está em uso. Este prompt
          faz na ordem certa: <strong className="text-fg-default">mede antes</strong>, lê o
          changelog da página <strong className="text-fg-default">Updates</strong>, atualiza,
          e só então compara — reportando apenas o que quebrou <em>de novo</em>. Sem a medição
          inicial, um erro que já existia no seu projeto parece ter vindo da atualização, e você
          reverte um update que estava certo.
        </p>
        <div className="flex flex-col gap-gp-xl rounded-radius-base border border-border-brand-subtle bg-bg-brand-subtle p-pad-3xl">
          <div className="flex flex-wrap items-center justify-between gap-gp-md">
            <div className="flex flex-col gap-gp-2xs">
              <span className="text-title-md text-fg-default">Atualizar com auditoria</span>
              <span className="text-caption-md text-fg-muted">
                Descobre seus canais, mede o antes, lê o changelog e valida no fim.
              </span>
            </div>
            <CopiarPrompt texto={PROMPT_ATUALIZAR} />
          </div>
          <div className="rounded-radius-base border border-border-subtle bg-bg-canvas p-pad-3xl max-h-[340px] overflow-y-auto">
            <pre className="whitespace-pre-wrap font-mono text-code-sm text-fg-muted leading-relaxed">
              {PROMPT_ATUALIZAR}
            </pre>
          </div>
        </div>
        <p className="text-body-md text-fg-muted">
          Duas coisas que ele NÃO faz, de propósito: não usa <Code>--force</Code> sem perguntar
          (isso sobrescreveria o que <strong className="text-fg-default">você</strong>{" "}
          editou), e não adapta o seu código quando o changelog diz BREAKING — para e mostra,
          porque essa decisão é sua. As seções abaixo são a mesma coisa, na mão.
        </p>
      </div>

      {/* ── 1. CLI ─────────────────────────────────────────────────────── */}
      <SectionH2 id="cli" title="1. CLI / scaffold" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <Cenario
          titulo="Sempre nomeie o pacote, sempre com @latest"
          quando="ao criar um projeto novo"
          comando={`npx @snksergio/create-design-system@latest my-app`}
        />

        <div className="rounded-radius-base border border-border-danger-muted bg-bg-danger-muted p-pad-3xl flex flex-col gap-gp-md">
          <p className="text-body-md font-medium text-fg-default">
            ⛔ Não invoque pelo nome do binário
          </p>
          <CodeBlock>{`# ERRADO — o npx resolve contra o CACHE e pode pegar qualquer versão
npx create-snksergio-design-system my-app

# CERTO
npx @snksergio/create-design-system@latest my-app`}</CodeBlock>
          <p className="text-body-md text-fg-muted">
            Aconteceu de verdade em 2026-08-21: a forma errada rodou a{" "}
            <strong className="text-fg-default">0.1.0</strong> — a primeira release de todas —
            enquanto a 0.25.10 estava publicada. O scaffold quebrou em três lugares
            (<Code>npm install</Code> com ENOENT, <Code>git commit</Code> virando pathspec) por
            causa de um bug que já não existe no código há muitas versões.
          </p>
        </div>

        <div className="rounded-radius-base border border-border-subtle p-pad-3xl flex flex-col gap-gp-md">
          <p className="text-body-md font-medium text-fg-default">
            Como conferir qual versão rodou
          </p>
          <p className="text-body-md text-fg-muted">
            O banner imprime o número na segunda linha. Se não imprimir, você está numa versão
            anterior à 0.25.11 — e provavelmente é isso que está te dando problema.
          </p>
          <CodeBlock>{`  iGreen Design System  ·  create-design-system v0.25.11`}</CodeBlock>
        </div>

        <div className="rounded-radius-base border border-border-subtle p-pad-3xl flex flex-col gap-gp-md">
          <p className="text-body-md font-medium text-fg-default">Cache já envenenado?</p>
          <p className="text-body-md text-fg-muted">
            Nomear o pacote com <Code>@latest</Code> já resolve. Se quiser limpar de vez, apague
            a pasta do cache do npx:
          </p>
          <CodeBlock>{`# Windows
%LOCALAPPDATA%\\npm-cache\\_npx

# macOS / Linux
~/.npm/_npx`}</CodeBlock>
        </div>
      </div>

      {/* ── 2. copy-in ─────────────────────────────────────────────────── */}
      <SectionH2 id="copyin" title="2. Componentes (copy-in)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          No copy-in os componentes são <strong className="text-fg-default">código seu</strong>,
          no seu repo. Atualizar é reescrever esses arquivos — então o comando protege o que você
          editou em vez de sobrescrever calado.
        </p>

        <Cenario
          titulo="Atualizar"
          quando="o DS lançou versão nova de algo que você instalou"
          comando={`# vê o que está defasado, sem escrever nada
npm run igreen:drift

# atualiza tudo que está defasado (pula o que VOCÊ editou)
npm run igreen:update -- --all

# só alguns
npm run igreen:update -- button card`}
        />

        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[220px_1fr] gap-0 bg-bg-subtle border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Situação do arquivo</div>
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">O que o update faz</div>
          </div>
          {[
            {
              caso: "você editou localmente",
              acao: "PULA e avisa — atualizar apagaria a sua edição. Use --force pra incluir mesmo assim",
            },
            {
              caso: "defasado, sem edição sua",
              acao: "reescreve com a versão nova e re-baseline no manifesto",
            },
            { caso: "já atualizado", acao: "não faz nada" },
          ].map((r) => (
            <div key={r.caso} className="grid grid-cols-[220px_1fr] gap-0 border-t border-border-subtle">
              <div className="py-pad-md px-pad-xl text-body-md font-medium text-fg-default">{r.caso}</div>
              <div className="py-pad-md px-pad-xl text-body-md text-fg-muted">{r.acao}</div>
            </div>
          ))}
        </div>

        <div className="rounded-radius-base border border-border-warning-muted bg-bg-warning-muted p-pad-3xl flex flex-col gap-gp-md">
          <p className="text-body-md font-medium text-fg-default">
            ⚠ Rode o <Code>doctor</Code> depois — ele pega o drift que não dá erro
          </p>
          <p className="text-body-md text-fg-muted">
            O <Code>cn()</Code> e o <Code>tv()</Code> do seu projeto configuram o{" "}
            <Code>tailwind-merge</Code> pros prefixos e presets do DS. Se ficarem defasados,
            a resolução de classe quebra <strong className="text-fg-default">em silêncio</strong>:
            nada de erro, só a classe errada ganhando.
          </p>
          <CodeBlock>{`npm run doctor

# se acusar defasagem:
npm run igreen:update -- utils tv --force`}</CodeBlock>
        </div>
      </div>

      {/* ── 3. npm ─────────────────────────────────────────────────────── */}
      <SectionH2 id="npm" title="3. Biblioteca npm" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <Cenario
          titulo="Atualizar o pacote"
          quando="o DS está em node_modules"
          comando={`# qual versão eu tenho, e qual é a última
npm ls @snksergio/design-system
npm view @snksergio/design-system version

# atualiza dentro do range do package.json
npm update @snksergio/design-system

# pula pra última, ignorando o range
npm i @snksergio/design-system@latest`}
        />
        <p className="text-body-md text-fg-muted">
          Depois de subir de <strong className="text-fg-default">minor</strong>, confira duas
          coisas que costumam mudar junto: a diretiva <Code>@source</Code> continua apontando pro{" "}
          <Code>dist-lib/</Code> do pacote, e o <Code>theme.css</Code> segue importado{" "}
          <strong className="text-fg-default">uma vez</strong> no CSS de entrada. As duas falham
          sem erro — o componente só renderiza cru.
        </p>
      </div>

      {/* ── 4. submódulo ───────────────────────────────────────────────── */}
      <SectionH2 id="submodulo" title="4. Submódulo" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <Cenario
          titulo="Puxar e re-projetar o kit"
          quando="o DS é uma pasta do seu projeto (.gitmodules)"
          comando={`git submodule update --remote --merge
git add . && git commit -m "chore: atualiza o design system"
npm --prefix design-system run ds:link`}
        />
        <p className="text-body-md text-fg-muted">
          ⚠️ <strong className="text-fg-default">É <Code>--remote</Code>, não <Code>git pull --recurse-submodules</Code>.</strong>{" "}
          Esta página prescrevia o <Code>pull</Code> até 27/08/2026, e estava errado: o{" "}
          <Code>--recurse-submodules</Code> refaz o checkout do commit que o repositório{" "}
          <strong className="text-fg-default">pai já registra</strong> — quem quer a versão nova
          do DS não recebe nada. Medido com superprojeto de teste: com o ponteiro numa versão
          antiga, o <Code>--recursive</Code> a manteve e só o <Code>--remote</Code> foi pro topo
          do branch. O <Code>commit</Code> da segunda linha também é necessário — o{" "}
          <Code>--remote</Code> deixa o ponteiro do pai modificado, e sem commitar ele volta
          atrás no próximo checkout.
        </p>
        <p className="text-body-md text-fg-muted">
          O <Code>ds:link</Code> é <strong className="text-fg-default">idempotente</strong> e
          limpa o que foi removido upstream — rode sempre depois de atualizar. Sem ele o código
          novo entra mas o kit de IA fica na versão anterior:{" "}
          <strong className="text-fg-default">as skills continuam ensinando o padrão antigo</strong>.
        </p>
        <p className="text-body-md text-fg-muted">
          <strong className="text-fg-default">Leia a saída do <Code>ds:link</Code>.</strong> Ele{" "}
          <strong className="text-fg-default">pula</strong> arquivo do seu projeto que colide com
          o do kit, avisando <Code>colisão (arquivo do consumidor) — pulado</Code>. Se o pulado
          não foi você que escreveu, re-rode com <Code>--force</Code>. Linkou de verdade quando
          existem <Code>.claude/.ds-linked.json</Code> e <Code>.claude/ds-config.json</Code>.
        </p>
        <p className="text-body-md text-fg-muted">
          Este canal <strong className="text-fg-default">não</strong> depende de publish do npm:
          o que você recebe é o commit do submódulo. Se precisar de uma versão específica, é{" "}
          <Code>git checkout</Code> dentro da pasta do submódulo, como em qualquer repo.
        </p>
      </div>

      {/* ── 5. kit de IA ───────────────────────────────────────────────── */}
      <SectionH2 id="kit" title="5. O kit de IA (skills, rules, commands)" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          O kit é o que faz a IA do seu projeto conhecer os componentes, os blocos e as regras de
          design. Ele viaja junto do canal — mas <strong className="text-fg-default">não</strong>{" "}
          se atualiza sozinho.
        </p>
        <div className="rounded-radius-base border border-border-subtle overflow-hidden">
          <div className="grid grid-cols-[150px_1fr] gap-0 bg-bg-subtle border-b border-border-subtle">
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Canal</div>
            <div className="py-pad-md px-pad-xl text-body-xs font-medium text-fg-default">Como o kit atualiza</div>
          </div>
          {[
            { c: "Submódulo", a: "git submodule update --remote --merge + commit do ponteiro + npm --prefix design-system run ds:link" },
            { c: "Copy-in", a: "npx @snksergio/create-design-system@latest --only-kit --force na raiz" },
            { c: "Scaffold", a: "projeto novo já nasce com o kit da versão que você rodou" },
          ].map((r) => (
            <div key={r.c} className="grid grid-cols-[150px_1fr] gap-0 border-t border-border-subtle">
              <div className="py-pad-md px-pad-xl text-body-md font-medium text-fg-default">{r.c}</div>
              <div className="py-pad-md px-pad-xl">
                <code className="font-mono text-code-sm text-fg-muted">{r.a}</code>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-radius-base border border-border-brand-subtle bg-bg-brand-subtle p-pad-3xl">
          <p className="text-body-md font-medium text-fg-default mb-gp-md">
            ⚡ Reinicie o Claude Code depois
          </p>
          <p className="text-body-md text-fg-muted">
            Slash command só é registrado no <strong className="text-fg-default">início</strong> da
            sessão. Sem reiniciar, <Code>/ds-create-crud</Code> e companhia não aparecem — mesmo
            com os arquivos no lugar.
          </p>
        </div>
      </div>

      {/* ── conferir ───────────────────────────────────────────────────── */}
      <SectionH2 id="checar" title="Estou desatualizado?" />
      <div className="flex flex-col gap-gp-2xl mb-14">
        <p className="text-body-md text-fg-muted">
          Quatro comandos, um por canal. Nenhum escreve nada.
        </p>
        <CodeBlock>{`npm run igreen:drift      # copy-in: componente defasado ou editado por você
npm run doctor            # copy-in: cn/tv fora de sync (falha silenciosa)
npm outdated              # npm: pacote atrás do range
git submodule status      # submódulo: em que commit você está`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          Pra saber <strong className="text-fg-default">o que</strong> mudou entre a sua versão e a
          atual, a página <strong className="text-fg-default">Updates</strong> (
          <Code>#/updates</Code>) tem a timeline por release — o que entrou, o que quebrou e o que
          exige ação sua.
        </p>
      </div>
    </DocLayout>
  );
}
