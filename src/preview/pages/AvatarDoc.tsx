import { Avatar, AvatarImage, AvatarFallback } from "../../components/shadcn/avatar";
import { Avatar as DSAvatar, AvatarGroup } from "../../components/ui/avatar-ig";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples (shadcn)" },
  { id: "ex-default", label: "Default" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ds-avatar", label: "Avatar iGreen (ui/)" },
  { id: "ex-ds-sizes", label: "DS Sizes" },
  { id: "ex-ds-colors", label: "DS Colors" },
  { id: "ex-ds-colorhex", label: "colorHex + auto contraste" },
  { id: "grupo", label: "AvatarGroup" },
  { id: "ex-grupo", label: "Pilha e tamanhos" },
  { id: "ex-grupo-max", label: "max + total" },
  { id: "ex-grupo-surface", label: "surface (cor do anel)" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "className", type: "string", defaultVal: '"size-8"' },
  { name: "src (AvatarImage)", type: "string", defaultVal: "—" },
  { name: "children (AvatarFallback)", type: "ReactNode", defaultVal: "—" },
];
const DS_PROPS = [
  { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultVal: '"md"' },
  { name: "color", type: '"brand" | "success" | "warning" | "critical" | "info" | "muted"', defaultVal: '"muted"' },
  { name: "colorHex", type: 'string (hex iniciando com "#") — bg inline + texto auto via contraste WCAG', defaultVal: "—" },
  { name: "children", type: "ReactNode (iniciais)", defaultVal: "—" },
  { name: "aria-label", type: 'string — presente: role="img"; ausente: aria-hidden (decorativo)', defaultVal: "—" },
  { name: "className", type: "string", defaultVal: "—" },
];

export function AvatarDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Data Display" title="Avatar" description="User profile image with fallback initials." dependency="@radix-ui/react-avatar" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples (shadcn)" />
      <ExampleSection id="ex-default" title="Default" description="With image and fallback.">
        <div className="flex items-center gap-gp-xl">
          <Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>CN</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>JD</AvatarFallback></Avatar>
        </div>
      </ExampleSection>
      <ExampleSection id="ex-sizes" title="Sizes" description="Override size via className.">
        <div className="flex items-center gap-gp-xl">
          <Avatar className="size-6"><AvatarFallback>XS</AvatarFallback></Avatar>
          <Avatar className="size-8"><AvatarFallback>SM</AvatarFallback></Avatar>
          <Avatar className="size-10"><AvatarFallback>MD</AvatarFallback></Avatar>
          <Avatar className="size-12"><AvatarFallback>LG</AvatarFallback></Avatar>
          <Avatar className="size-14"><AvatarFallback>XL</AvatarFallback></Avatar>
        </div>
      </ExampleSection>

      <SectionH2 id="ds-avatar" title="Avatar iGreen (ui/)" />
      <p className="mb-gp-2xl text-body-md text-fg-muted">
        Componente próprio do DS em <code className="font-mono text-code-sm text-fg-default">src/components/ui/avatar-ig</code> —
        badge circular com iniciais (sem imagem). Diferente do primitivo shadcn acima: sizes tokenizados
        (<code className="font-mono text-code-sm">size-comp-*</code>), pares semânticos bg+fg pré-validados e{" "}
        <code className="font-mono text-code-sm text-fg-default">colorHex</code> com cor de texto automática por
        contraste WCAG (L-027, via <code className="font-mono text-code-sm">getContrastTextColor()</code>).
      </p>
      <ExampleSection
        id="ex-ds-sizes"
        title="DS Sizes"
        description="5 sizes tokenizados — xs 20px, sm 24px, md 28px (default), lg 32px, xl 40px. Tipografia escala junto (caption-sm → body-md)."
        code={`import { Avatar } from "@/components/ui/avatar-ig";\n\n<Avatar size="xs">XS</Avatar>\n<Avatar size="sm">SM</Avatar>\n<Avatar size="md">MD</Avatar>\n<Avatar size="lg">LG</Avatar>\n<Avatar size="xl">XL</Avatar>`}
      >
        <div className="flex items-center gap-gp-xl">
          <DSAvatar size="xs">XS</DSAvatar>
          <DSAvatar size="sm">SM</DSAvatar>
          <DSAvatar size="md">MD</DSAvatar>
          <DSAvatar size="lg">LG</DSAvatar>
          <DSAvatar size="xl">XL</DSAvatar>
        </div>
      </ExampleSection>
      <ExampleSection
        id="ex-ds-colors"
        title="DS Colors"
        description="6 presets semânticos com par bg + fg dos tokens (brand, success, warning, critical, info, muted). Default: muted. Ignorado quando colorHex é passado."
        code={`<Avatar color="brand">MS</Avatar>\n<Avatar color="success">OK</Avatar>\n<Avatar color="warning">AT</Avatar>\n<Avatar color="critical">ER</Avatar>\n<Avatar color="info">IN</Avatar>\n<Avatar color="muted">JD</Avatar>`}
      >
        <div className="flex items-center gap-gp-xl">
          <DSAvatar size="lg" color="brand">MS</DSAvatar>
          <DSAvatar size="lg" color="success">OK</DSAvatar>
          <DSAvatar size="lg" color="warning">AT</DSAvatar>
          <DSAvatar size="lg" color="critical">ER</DSAvatar>
          <DSAvatar size="lg" color="info">IN</DSAvatar>
          <DSAvatar size="lg" color="muted">JD</DSAvatar>
        </div>
      </ExampleSection>
      <ExampleSection
        id="ex-ds-colorhex"
        title="colorHex + auto contraste (WCAG)"
        description="Hex arbitrário (ex: cor de marca por pessoa/banco) vira bg inline e o texto é escolhido automaticamente entre branco/preto pelo MAIOR ratio de contraste WCAG — getContrastTextColor() em @/utils/color-contrast.ts (L-027). Ex: BB #FAE128 → preto (16.3:1); Nubank #820AD1 → branco (6.2:1)."
        code={`<Avatar colorHex="#FAE128">BB</Avatar>  {/* texto preto auto */}\n<Avatar colorHex="#820AD1">NU</Avatar>  {/* texto branco auto */}\n<Avatar colorHex="#EC7000">IT</Avatar>  {/* texto preto auto */}\n<Avatar colorHex="#CC092F">BR</Avatar>  {/* texto branco auto */}`}
      >
        <div className="flex items-center gap-gp-xl">
          <DSAvatar size="lg" colorHex="#FAE128">BB</DSAvatar>
          <DSAvatar size="lg" colorHex="#820AD1">NU</DSAvatar>
          <DSAvatar size="lg" colorHex="#EC7000">IT</DSAvatar>
          <DSAvatar size="lg" colorHex="#CC092F">BR</DSAvatar>
        </div>
      </ExampleSection>

      <SectionH2 id="grupo" title="AvatarGroup" />

      <ExampleSection
        id="ex-grupo"
        title="Pilha e tamanhos"
        description="O size vai no CONTAINER e é propagado por contexto — não se repete em cada filho. A sobreposição escala junto: xs desloca 4px e xl desloca 10px, mantendo ~25% do diâmetro em toda a escala (6px fixo daria 30% no xs e 15% no xl, que são arranjos diferentes). O primeiro fica por cima, invertendo o empilhamento natural do DOM: a leitura é da esquerda pra direita."
        code={`<AvatarGroup size="sm" aria-label="4 responsáveis">
  <Avatar colorHex="#2563EB">MD</Avatar>
  <Avatar colorHex="#CC092F">AC</Avatar>
  <Avatar colorHex="#7C3AED">JS</Avatar>
  <Avatar colorHex="#0891B2">TK</Avatar>
</AvatarGroup>`}
      >
        <div className="flex flex-col gap-gp-2xl">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
            <div key={s} className="flex items-center gap-gp-2xl">
              <code className="w-[32px] shrink-0 text-code-sm text-fg-muted">{s}</code>
              <AvatarGroup size={s} aria-label={`4 pessoas, tamanho ${s}`}>
                <DSAvatar colorHex="#2563EB">MD</DSAvatar>
                <DSAvatar colorHex="#CC092F">AC</DSAvatar>
                <DSAvatar colorHex="#7C3AED">JS</DSAvatar>
                <DSAvatar colorHex="#0891B2">TK</DSAvatar>
              </AvatarGroup>
            </div>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-grupo-max"
        title="max + total"
        description="max corta a pilha; total é a contagem REAL. Sem total, o +N conta só o que foi renderizado — uma lista paginada em 4 mostraria +1 tendo 40 pessoas. O +N é aria-hidden porque a contagem já está no aria-label do grupo."
        code={`{/* sem total: conta os filhos renderizados */}
<AvatarGroup max={3} aria-label="5 responsáveis">…5 filhos…</AvatarGroup>

{/* com total: reflete o servidor */}
<AvatarGroup max={3} total={40} aria-label="40 responsáveis">…5 filhos…</AvatarGroup>`}
      >
        <div className="flex flex-col gap-gp-2xl">
          {[
            { rotulo: "max={3}", total: undefined },
            { rotulo: "max={3} total={40}", total: 40 },
          ].map(({ rotulo, total }) => (
            <div key={rotulo} className="flex items-center gap-gp-2xl">
              <code className="w-[160px] shrink-0 text-code-sm text-fg-muted">{rotulo}</code>
              <AvatarGroup max={3} total={total} aria-label={`${total ?? 5} responsáveis`}>
                <DSAvatar colorHex="#2563EB">MD</DSAvatar>
                <DSAvatar colorHex="#CC092F">AC</DSAvatar>
                <DSAvatar colorHex="#7C3AED">JS</DSAvatar>
                <DSAvatar colorHex="#0891B2">TK</DSAvatar>
                <DSAvatar colorHex="#EA580C">LP</DSAvatar>
              </AvatarGroup>
            </div>
          ))}
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-grupo-surface"
        title="surface — o anel é da cor do que está ATRÁS"
        description="É o erro clássico da pilha. O anel separa um avatar do outro pintando a cor da superfície de trás — com o token errado ele deixa de separar e vira um halo. Os dois grupos abaixo estão sobre bg-bg-muted: o de cima usa o default (surface), o de baixo declara o token certo."
        code={`{/* o token acompanha o fundo de trás */}
<AvatarGroup surface="muted" aria-label="3 responsáveis">…</AvatarGroup>`}
      >
        <div className="flex flex-col gap-gp-xl">
          {[
            { rotulo: 'surface="surface" (errado aqui)', surface: "surface" as const },
            { rotulo: 'surface="muted" (certo)', surface: "muted" as const },
          ].map(({ rotulo, surface }) => (
            <div
              key={rotulo}
              className="flex items-center gap-gp-2xl rounded-radius-lg bg-bg-muted p-pad-2xl"
            >
              <code className="w-[220px] shrink-0 text-code-sm text-fg-muted">{rotulo}</code>
              <AvatarGroup surface={surface} aria-label="3 responsáveis">
                <DSAvatar colorHex="#2563EB">MD</DSAvatar>
                <DSAvatar colorHex="#CC092F">AC</DSAvatar>
                <DSAvatar colorHex="#7C3AED">JS</DSAvatar>
              </AvatarGroup>
            </div>
          ))}
          <p className="text-body-sm text-fg-muted">
            ⚠️ <code className="text-code-sm">table</code> e{" "}
            <code className="text-code-sm">surface</code> resolvem pro{" "}
            <strong>mesmo valor hoje</strong> (
            <code className="text-code-sm">oklch(1 0 0)</code> no claro,{" "}
            <code className="text-code-sm">oklch(0.225 0 0)</code> no escuro) — dentro de tabela
            a escolha é <strong>semântica</strong>, não visual. Declare{" "}
            <code className="text-code-sm">table</code> mesmo assim: se um dia os dois
            divergirem, a pilha continua certa sem ninguém precisar caçar o call site.
          </p>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <ExampleSection id="api-shadcn" title="Avatar (shadcn primitive)" description="Avatar + AvatarImage + AvatarFallback — composição Radix com imagem.">
        <PropsTable items={PROPS} />
      </ExampleSection>
      <ExampleSection id="api-ds" title="Avatar (iGreen ui/)" description="Badge de iniciais sem imagem. Demais atributos de div (exceto color nativo) são repassados ao root.">
        <PropsTable items={DS_PROPS} />
      </ExampleSection>
    </DocLayout>
  );
}
