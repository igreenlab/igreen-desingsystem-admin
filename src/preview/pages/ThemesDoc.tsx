import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";
import { Badge } from "../../components/shadcn/badge";
import { BRANDS } from "../../hooks/useBrand";

const TOC = [
  { id: "overview", label: "Como um tema funciona" },
  { id: "catalogo", label: "Temas disponíveis" },
  { id: "npm", label: "Trocar — via npm" },
  { id: "submodulo", label: "Trocar — via submódulo" },
  { id: "copy-in", label: "Trocar — via registry (copy-in)" },
  { id: "runtime", label: "Trocar em runtime" },
  { id: "criar", label: "Criar um tema novo" },
  { id: "armadilhas", label: "Armadilhas" },
];

function CodeBlock({ children }: { children: string }) {
  return (
    <div className="rounded-radius-base border border-border-subtle bg-bg-subtle p-pad-3xl font-mono text-code-sm text-fg-muted overflow-x-auto">
      <pre className="whitespace-pre leading-relaxed">{children}</pre>
    </div>
  );
}

function Canal({
  nome,
  quando,
  entrega,
  children,
}: {
  nome: string;
  quando: string;
  entrega: "sim" | "nao";
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-gp-lg">
      <div className="flex flex-wrap items-center gap-gp-md">
        <h3 className="text-title-md text-fg-default">{nome}</h3>
        <Badge color={entrega === "sim" ? "success" : "critical"} variant="soft" size="sm">
          {entrega === "sim" ? "entrega tema" : "não entrega tema"}
        </Badge>
      </div>
      <p className="text-body-md text-fg-muted">{quando}</p>
      {children}
    </div>
  );
}

/**
 * ThemesDoc — como o CONSUMIDOR troca ou adiciona um tema de marca.
 *
 * Existe porque a instrução morava só em doc de mantenedor (`DISTRIBUICAO.md`), que o
 * consumidor não abre. A capacidade estava pronta desde a v0.31.1 e ninguém sabia usar.
 *
 * O catálogo de marcas é lido do `BRANDS` (`src/hooks/useBrand.ts`) em vez de escrito à
 * mão: marca nova aparece aqui sozinha, e a lista não pode divergir do seletor do
 * showcase — que é a mesma fonte.
 */
export function ThemesDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Get Started"
        title="Temas de marca"
        description="Uma marca é um overlay de cor escopado por data-theme. Este guia é pro consumidor: como trocar o tema de um projeto que já está em andamento, e como criar um novo."
      />

      <DocSeparator />

      <SectionH2 id="overview" title="Como um tema funciona" />
      <p className="text-body-md text-fg-muted">
        O tema-base (<code className="font-mono text-code-sm">tailwind-theme.css</code>) define
        todas as CSS vars em <code className="font-mono text-code-sm">@theme</code> e{" "}
        <code className="font-mono text-code-sm">.dark</code>. Cada marca não-default é um{" "}
        <strong>overlay</strong> que sobrescreve <strong>só o que difere</strong> — 60 a 80 vars,
        não as ~400. Por isso a troca é barata e as marcas coexistem no mesmo bundle.
      </p>
      <p className="text-body-md text-fg-muted">
        São dois eixos <strong>independentes</strong>: a marca vive em{" "}
        <code className="font-mono text-code-sm">data-theme</code> no{" "}
        <code className="font-mono text-code-sm">&lt;html&gt;</code>, e claro/escuro na classe{" "}
        <code className="font-mono text-code-sm">.dark</code>. Combinam livremente — 5 marcas × 2
        modos.
      </p>
      <CodeBlock>{`<html data-theme="vibrant" class="dark">   <!-- marca vibrant, modo escuro -->
<html data-theme="vibrant">              <!-- marca vibrant, modo claro  -->
<html>                                   <!-- iGreen default (sem atributo) -->`}</CodeBlock>
      <p className="text-body-md text-fg-muted">
        ⚠️ Importar o CSS <strong>não</strong> ativa nada. Sem o{" "}
        <code className="font-mono text-code-sm">data-theme</code> no{" "}
        <code className="font-mono text-code-sm">&lt;html&gt;</code> o overlay fica inerte, e é o
        erro nº 1 de quem tenta trocar tema pela primeira vez.
      </p>

      <DocSeparator />

      <SectionH2 id="catalogo" title="Temas disponíveis" />
      <p className="text-body-md text-fg-muted">
        Lista lida do <code className="font-mono text-code-sm">BRANDS</code> em{" "}
        <code className="font-mono text-code-sm">src/hooks/useBrand.ts</code> — a mesma fonte do
        seletor no rodapé desta sidebar, então não pode divergir.
      </p>
      <div className="flex flex-col">
        {BRANDS.map((b) => (
          <div
            key={b.id}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-gp-sm sm:gap-gp-xl py-pad-md border-b border-border-subtle last:border-b-0"
          >
            <span
              className="size-comp-sm rounded-radius-full border border-border-default shrink-0"
              style={{ background: b.swatch }}
              aria-hidden
            />
            <code className="font-mono text-code-sm text-fg-brand shrink-0 min-w-0 sm:min-w-[120px]">
              {b.id}
            </code>
            <span className="text-body-md text-fg-default flex-1">{b.label}</span>
            <code className="font-mono text-code-sm text-fg-subtle shrink-0">
              {b.id === "default" ? "sem overlay" : `brand-${b.id}.css`}
            </code>
          </div>
        ))}
      </div>
      <p className="text-body-md text-fg-muted">
        A <code className="font-mono text-code-sm">default</code> não tem overlay de propósito: ela{" "}
        <em>é</em> o tema-base. Ativar a default = remover o atributo{" "}
        <code className="font-mono text-code-sm">data-theme</code>.
      </p>

      <DocSeparator />

      <SectionH2 id="npm" title="Trocar — via npm" />
      <Canal
        nome="npm install @snksergio/design-system@latest"
        quando="Projeto que consome o DS como pacote. Disponível a partir da v0.31.1 — antes disso o pacote levava só o tema-base."
        entrega="sim"
      >
        <p className="text-body-md text-fg-muted">
          Duas linhas no seu CSS de entrada e um atributo no HTML. O overlay vem depois do
          tema-base:
        </p>
        <CodeBlock>{`/* src/index.css */
@import "tailwindcss";
@import "tw-animate-css";
@import "@snksergio/design-system/theme.css";                 /* tema-base — obrigatório */
@import "@snksergio/design-system/theme/brand-vibrant.css";    /* a marca — opcional */`}</CodeBlock>
        <CodeBlock>{`<!-- index.html -->
<html lang="pt-BR" data-theme="vibrant">`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          A ordem importa: o overlay tem que vir <strong>depois</strong> do{" "}
          <code className="font-mono text-code-sm">theme.css</code>. Antes, o tema-base sobrescreve
          o overlay e nada muda.
        </p>
      </Canal>

      <DocSeparator />

      <SectionH2 id="submodulo" title="Trocar — via submódulo" />
      <Canal
        nome="git submodule"
        quando="Projeto que tem o DS como submódulo (design-system/ com @/ apontando pra design-system/src). Ver SUBMODULE-SETUP.md."
        entrega="sim"
      >
        <p className="text-body-md text-fg-muted">
          O repo inteiro está no disco, então não há nada pra instalar — só importar o arquivo que
          já existe:
        </p>
        <CodeBlock>{`/* src/index.css — ajuste o caminho pro seu submódulo */
@import "tailwindcss";
@import "../design-system/src/styles/theme/tailwind-theme.css";
@import "../design-system/src/styles/theme/brand-vibrant.css";`}</CodeBlock>
        <CodeBlock>{`<html lang="pt-BR" data-theme="vibrant">`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          Tema novo chega com <code className="font-mono text-code-sm">git pull</code> no submódulo
          — nenhum passo extra.
        </p>
      </Canal>

      <DocSeparator />

      <SectionH2 id="copy-in" title="Trocar — via registry (copy-in)" />
      <Canal
        nome="npm run igreen:add"
        quando="Projeto criado pelo scaffold (npm create @snksergio/design-system@latest) que traz componentes por copy-in."
        entrega="sim"
      >
        <p className="text-body-md text-fg-muted">
          Cada tema é um item do registry, então entra pelo mesmo comando dos componentes. O
          arquivo é copiado pro seu <code className="font-mono text-code-sm">src/styles/theme/</code>{" "}
          e passa a ser seu:
        </p>
        <CodeBlock>{`npm run igreen:add -- theme-vibrant     # copia src/styles/theme/brand-vibrant.css`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          Depois é igual ao submódulo — importar no CSS de entrada e pôr o{" "}
          <code className="font-mono text-code-sm">data-theme</code>:
        </p>
        <CodeBlock>{`@import "./styles/theme/tailwind-theme.css";
@import "./styles/theme/brand-vibrant.css";`}</CodeBlock>
        <p className="text-body-md text-fg-muted">
          No scaffold, o prompt <strong>"Tema de cor?"</strong> já faz isso pra você e{" "}
          <strong>apaga</strong> os overlays não escolhidos. Se você escolheu um tema lá e quer
          outro depois, é este comando que traz de volta.
        </p>
      </Canal>

      <DocSeparator />

      <SectionH2 id="runtime" title="Trocar em runtime" />
      <p className="text-body-md text-fg-muted">
        Tudo acima é escolha de build: um tema por deploy. Pra trocar com o app rodando — um
        seletor de marca, como o do rodapé desta sidebar — basta escrever/remover o atributo:
      </p>
      <CodeBlock>{`// default remove o atributo; qualquer outra marca escreve o id
function aplicarMarca(id: string) {
  const root = document.documentElement;
  if (id === "default") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", id);
}`}</CodeBlock>
      <p className="text-body-md text-fg-muted">
        ⚠️ Só funciona pras marcas cujo CSS <strong>está no bundle</strong>. Escrever{" "}
        <code className="font-mono text-code-sm">data-theme="pay"</code> sem ter importado{" "}
        <code className="font-mono text-code-sm">brand-pay.css</code> não faz nada — e não dá erro,
        o que torna o sintoma confuso. Se o seu app oferece N marcas ao usuário, importe os N
        overlays.
      </p>
      <p className="text-body-md text-fg-muted">
        Se preferir não escrever isso na mão, o hook{" "}
        <code className="font-mono text-code-sm">useBrand</code> é <strong>exportado no pacote</strong>{" "}
        (desde a v0.33.0) e já traz persistência em{" "}
        <code className="font-mono text-code-sm">localStorage</code> e sincronia entre abas:
      </p>
      <CodeBlock>{`import { useBrand } from "@snksergio/design-system";

// Passe SÓ as marcas cujo overlay você importou no CSS — senão o seletor
// lista opções que não fazem nada (data-theme sem CSS é no-op silencioso).
const MINHAS = [
  { id: "default", label: "iGreen",         swatch: "oklch(0.5248 0.1415 150.9)" },
  { id: "vibrant", label: "iGreen Vibrant", swatch: "#0fff00" },
] as const;

function SeletorDeMarca() {
  const { brand, brands, current, setBrand } = useBrand({ brands: MINHAS });
  return (
    <select value={brand} onChange={(e) => setBrand(e.target.value as typeof brand)}>
      {brands.map((b) => <option key={b.id} value={b.id}>{b.label}</option>)}
    </select>
  );
}`}</CodeBlock>
      <p className="text-body-md text-fg-muted">
        Sem o argumento, o catálogo é o das 5 marcas do DS — use assim só se importou os 5
        overlays. Valor persistido fora do catálogo cai na primeira entrada, então um{" "}
        <code className="font-mono text-code-sm">data-theme</code> órfão nunca chega no{" "}
        <code className="font-mono text-code-sm">&lt;html&gt;</code>. O{" "}
        <code className="font-mono text-code-sm">useTheme</code> (claro/escuro) também é
        exportado.
      </p>

      <DocSeparator />

      <SectionH2 id="criar" title="Criar um tema novo" />
      <p className="text-body-md text-fg-muted">
        Uma marca muda <strong>somente cor</strong>. Spacing, sizing, radius, elevation e
        tipografia vêm sempre da <code className="font-mono text-code-sm">default</code> — não há
        como uma marca alterá-los, por design.
      </p>
      <p className="text-body-md text-fg-muted">
        São 3 arquivos, copiados de uma marca existente (a{" "}
        <code className="font-mono text-code-sm">blue</code> é a referência mais simples porque
        deriva tudo por <code className="font-mono text-code-sm">color-mix</code>):
      </p>
      <CodeBlock>{`tokens/brands/<id>/
  primitives/color-palette.ts   # rampas raw (brand, brandContrast, gray, 4 status)
  semantic/color-light.ts       # bg / fg / border / ring / overlay / chart
  semantic/color-dark.ts        # mesmo contrato de nomes, valores do dark

npm run tokens:brand:<id>       # gera src/styles/theme/brand-<id>.css`}</CodeBlock>
      <p className="text-body-md text-fg-muted">
        O contrato de nomes tem que ser <strong>idêntico</strong> ao da{" "}
        <code className="font-mono text-code-sm">default</code>. O gerador importa a marca com um
        cast, então chave faltando <strong>não dá erro de tsc</strong> — ela simplesmente herda o
        valor da default em silêncio. Compare as chaves antes de considerar pronto.
      </p>
      <p className="text-body-md text-fg-muted">
        Pra a marca ficar disponível nos canais, o mantenedor registra em 6 pontos: script{" "}
        <code className="font-mono text-code-sm">tokens:brand:&lt;id&gt;</code>,{" "}
        <code className="font-mono text-code-sm">@import</code> no{" "}
        <code className="font-mono text-code-sm">globals.css</code>, catálogo{" "}
        <code className="font-mono text-code-sm">BRANDS</code>, CSS no template do CLI,{" "}
        <code className="font-mono text-code-sm">BRAND_LABELS</code> do prompt, e item{" "}
        <code className="font-mono text-code-sm">theme-&lt;id&gt;</code> +{" "}
        <code className="font-mono text-code-sm">exports</code> do pacote. O{" "}
        <code className="font-mono text-code-sm">build:lib</code> <strong>falha</strong> se achar um
        overlay sem <code className="font-mono text-code-sm">exports</code> — porque o pacote levaria
        o arquivo e ninguém conseguiria importá-lo.
      </p>

      <DocSeparator />

      <SectionH2 id="armadilhas" title="Armadilhas" />
      <div className="flex flex-col">
        {[
          {
            t: "Importei o CSS e nada mudou",
            d: "Falta o data-theme no <html>. O overlay é escopado — sem o atributo, nenhuma regra casa.",
          },
          {
            t: "Mudou no claro mas não no escuro (ou vice-versa)",
            d: "Ordem de import. O overlay tem que vir DEPOIS do tema-base; antes, o tema-base ganha por ordem de fonte.",
          },
          {
            t: "O seletor troca mas alguns temas não aplicam",
            d: "Só as marcas cujo CSS está no bundle funcionam. data-theme com id não importado é no-op silencioso.",
          },
          {
            t: "Escolhi um tema no scaffold e agora quero outro",
            d: "O scaffold apaga os overlays não escolhidos. Traga de volta com npm run igreen:add -- theme-<id>.",
          },
          {
            t: "Criei marca nova e algumas cores ficaram iguais à default",
            d: "Chave faltando no contrato do semantic. O gerador usa cast, então tsc não acusa e o token herda a default em silêncio.",
          },
        ].map((a) => (
          <div
            key={a.t}
            className="flex flex-col gap-gp-2xs py-pad-lg border-b border-border-subtle last:border-b-0"
          >
            <span className="text-body-md font-semibold text-fg-default">{a.t}</span>
            <span className="text-body-md text-fg-muted">{a.d}</span>
          </div>
        ))}
      </div>
    </DocLayout>
  );
}
