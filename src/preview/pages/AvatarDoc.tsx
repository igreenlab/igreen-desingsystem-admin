import { Avatar, AvatarImage, AvatarFallback } from "../../components/shadcn/avatar";
import { Avatar as DSAvatar } from "../../components/ui/avatar-ig";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples (shadcn)" },
  { id: "ex-default", label: "Default" },
  { id: "ex-sizes", label: "Sizes" },
  { id: "ds-avatar", label: "Avatar iGreen (ui/)" },
  { id: "ex-ds-sizes", label: "DS Sizes" },
  { id: "ex-ds-colors", label: "DS Colors" },
  { id: "ex-ds-colorhex", label: "colorHex + auto contraste" },
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
        Componente próprio do DS em <code className="font-mono text-code-sm text-fg-default">src/components/ui/Avatar</code> —
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
