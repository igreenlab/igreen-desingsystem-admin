import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/shadcn/card";
import { Button } from "../../components/ui/Button/button";
import { Input } from "../../components/shadcn/input";
import { Label } from "../../components/shadcn/label";
import { Badge } from "../../components/shadcn/badge";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-login-form", label: "Login Form" },
  { id: "ex-image-card", label: "Image Card" },
  { id: "ex-stats", label: "Stats Card" },
  { id: "ex-with-footer", label: "With Footer" },
  { id: "ex-sizes", label: "Sizes (densidade)" },
  { id: "ex-banded", label: "Header em faixa" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  {
    name: "size",
    type: '"sm" | "md" | "lg" — escala o padding interno de TODAS as partes (16 / 20 / 24px). Declare só no <Card>: chega em Header/Content/Footer por contexto',
    defaultVal: '"md" (20px)',
  },
  {
    name: "CardHeader variant",
    type: '"plain" | "banded" — "banded" põe o header em faixa (bg-subtle + borda embaixo, encostado nas bordas do card)',
    defaultVal: '"plain"',
  },
  { name: "className", type: "string", defaultVal: "—" },
  { name: "children", type: "ReactNode", defaultVal: "—" },
];

export function CardDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Layout" title="Card" description="Container with header, content, and footer. Composes with other DS components." />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Simple card with title, description, content and an action button."
        code={`<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here.</CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-body-md text-fg-muted">
      Content area for any layout.
    </p>
  </CardContent>
  <CardFooter>
    <Button color="primary" variant="filled" size="sm">Action</Button>
  </CardFooter>
</Card>`}
      >
        <div className="max-w-sm w-full">
          <Card>
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>Card description goes here.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-md text-fg-muted">Content area for any layout.</p>
            </CardContent>
            <CardFooter>
              <Button color="primary" variant="filled" size="sm">Action</Button>
            </CardFooter>
          </Card>
        </div>
      </ExampleSection>

      {/* Login Form */}
      <ExampleSection
        id="ex-login-form"
        title="Login Form"
        description="Card used as a login form container with inputs, links and social login."
        code={`<Card>
  <CardHeader>
    <CardTitle>Login</CardTitle>
    <CardDescription>Enter your credentials to access your account.</CardDescription>
  </CardHeader>
  <CardContent className="flex flex-col gap-gp-4xl">
    <div className="flex flex-col gap-gp-lg">
      <Label>Email</Label>
      <Input size="sm" type="email" placeholder="m@example.com" />
    </div>
    <div className="flex flex-col gap-gp-lg">
      <div className="flex items-center justify-between">
        <Label>Password</Label>
        <a href="#" className="text-body-xs text-fg-brand hover:underline">
          Forgot password?
        </a>
      </div>
      <Input size="sm" type="password" placeholder="••••••••" />
    </div>
    <Button color="primary" variant="filled" size="sm" className="w-full">
      Login
    </Button>
    <div className="relative flex items-center justify-center">
      <span className="bg-bg-surface px-pad-md text-body-xs text-fg-muted relative z-10">
        or continue with
      </span>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border-subtle" />
      </div>
    </div>
    <Button color="secondary" variant="outline" size="sm" className="w-full">
      Google
    </Button>
  </CardContent>
</Card>`}
      >
        <div className="max-w-sm w-full">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-gp-4xl">
              <div className="flex flex-col gap-gp-lg">
                <Label>Email</Label>
                <Input size="sm" type="email" placeholder="m@example.com" />
              </div>
              <div className="flex flex-col gap-gp-lg">
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  <a href="#" className="text-body-xs text-fg-brand hover:underline">Forgot password?</a>
                </div>
                <Input size="sm" type="password" placeholder="••••••••" />
              </div>
              <Button color="primary" variant="filled" size="sm" className="w-full">Login</Button>
              <div className="relative flex items-center justify-center">
                <span className="bg-bg-surface px-pad-md text-body-xs text-fg-muted relative z-10">or continue with</span>
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-subtle" />
                </div>
              </div>
              <Button color="secondary" variant="outline" size="sm" className="w-full">Google</Button>
            </CardContent>
          </Card>
        </div>
      </ExampleSection>

      {/* Image Card */}
      <ExampleSection
        id="ex-image-card"
        title="Image Card"
        description="Card with an image area, badge, title, description and call-to-action."
        code={`<Card className="overflow-hidden">
  <div className="bg-bg-muted h-48 flex items-center justify-center">
    <span className="text-body-md font-medium text-fg-subtle">Image placeholder</span>
  </div>
  <CardHeader>
    <div className="flex items-center gap-gp-md">
      <Badge color="success" variant="soft" size="sm">New</Badge>
    </div>
    <CardTitle>Solar Panel Kit</CardTitle>
    <CardDescription>
      High-efficiency monocrystalline panels for residential use.
    </CardDescription>
  </CardHeader>
  <CardFooter>
    <Button color="primary" variant="filled" size="sm">Learn more</Button>
  </CardFooter>
</Card>`}
      >
        <div className="max-w-sm w-full">
          <Card className="overflow-hidden">
            <div className="bg-bg-muted h-48 flex items-center justify-center">
              <span className="text-body-md font-medium text-fg-subtle">Image placeholder</span>
            </div>
            <CardHeader>
              <div className="flex items-center gap-gp-md">
                <Badge color="success" variant="soft" size="sm">New</Badge>
              </div>
              <CardTitle>Solar Panel Kit</CardTitle>
              <CardDescription>High-efficiency monocrystalline panels for residential use.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button color="primary" variant="filled" size="sm">Learn more</Button>
            </CardFooter>
          </Card>
        </div>
      </ExampleSection>

      {/* Stats Card */}
      <ExampleSection
        id="ex-stats"
        title="Stats Card"
        description="A compact card displaying a key metric with trend information."
        code={`<Card>
  <CardHeader>
    <CardDescription>Total Revenue</CardDescription>
    <CardTitle className="text-heading-lg">$45,231.89</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-body-xs text-fg-muted">
      <span className="text-fg-success">+20.1%</span> from last month
    </p>
  </CardContent>
</Card>`}
      >
        <div className="max-w-xs w-full">
          <Card>
            <CardHeader>
              <CardDescription>Total Revenue</CardDescription>
              <CardTitle className="text-heading-lg">$45,231.89</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-xs text-fg-muted">
                <span className="text-fg-success">+20.1%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>
      </ExampleSection>

      {/* With Footer */}
      <ExampleSection
        id="ex-with-footer"
        title="With Footer"
        description="Card with footer actions aligned to the right."
        code={`<Card>
  <CardHeader>
    <CardTitle>Confirm changes</CardTitle>
    <CardDescription>
      Review your updates before saving.
    </CardDescription>
  </CardHeader>
  <CardContent>
    <p className="text-body-md text-fg-muted">
      You are about to update your billing address and payment method.
      This action will take effect immediately.
    </p>
  </CardContent>
  <CardFooter className="justify-end gap-gp-md">
    <Button color="secondary" variant="outline" size="sm">Cancel</Button>
    <Button color="primary" variant="filled" size="sm">Save changes</Button>
  </CardFooter>
</Card>`}
      >
        <div className="max-w-md w-full">
          <Card>
            <CardHeader>
              <CardTitle>Confirm changes</CardTitle>
              <CardDescription>Review your updates before saving.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-md text-fg-muted">
                You are about to update your billing address and payment method. This action will take effect immediately.
              </p>
            </CardContent>
            <CardFooter className="justify-end gap-gp-md">
              <Button color="secondary" variant="outline" size="sm">Cancel</Button>
              <Button color="primary" variant="filled" size="sm">Save changes</Button>
            </CardFooter>
          </Card>
        </div>
      </ExampleSection>

      {/* Sizes */}
      <ExampleSection
        id="ex-sizes"
        title="Sizes (densidade)"
        description="`size` escala o padding interno de todas as partes de uma vez — declarado só no <Card> e propagado por contexto. `md` (20px) é o default; 24px virou o `lg`. Não existe 18px na escala de pad (vai 16 → 20 → 24), então `sm` é 16px. O token antigo `p-pad-card-base` virou alias de `md` — quem já o consumia recebe 20 em vez de 24, e nada quebra."
        code={`{/* Declare o size UMA vez, no Card. Repetir nas partes é o erro
    que deixa uma seção com densidade diferente do resto. */}
<Card size="sm">   {/* 16px */}
<Card size="md">   {/* 20px — default, pode omitir */}
<Card size="lg">   {/* 24px */}`}
      >
        <div className="flex flex-col gap-gp-2xl sm:flex-row">
          {(["sm", "md", "lg"] as const).map((size) => (
            <Card key={size} size={size} className="flex-1">
              <CardHeader>
                <CardTitle>size=&quot;{size}&quot;</CardTitle>
                <CardDescription>
                  {size === "sm" ? "16px" : size === "md" ? "20px (default)" : "24px"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-radius-sm bg-bg-muted p-pad-md text-caption-md text-fg-muted">
                  O bloco cinza encosta no padding — compare a distância até a borda
                  do card nos três.
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ExampleSection>

      {/* Header em faixa */}
      <ExampleSection
        id="ex-banded"
        title="Header em faixa"
        description="`variant=&quot;banded&quot;` no CardHeader: fundo bg-subtle, divisória border-subtle embaixo e encostado nas bordas do card. Nela o CardTitle vira semibold (no header plano segue medium). Aceita qualquer estrutura dentro (título + descrição, ícone, ação à direita) e acompanha o `size`. É o padrão das seções de #/order-detail e ?app=edit-page, que era composição local do showcase."
        code={`<Card size="md">
  <CardHeader variant="banded">
    <CardTitle>Endereço de entrega</CardTitle>
    <CardDescription>Usado no cálculo do frete.</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>

{/* Ação à direita: precisa do "flex", não só do "flex-row". O CardHeader é
    "grid" por padrão, e flex-row não troca o display — os filhos continuam
    empilhando. Com "flex", o tailwind-merge substitui o grid (mesmo grupo). */}
<CardHeader variant="banded" className="flex items-center justify-between">
  <CardTitle>Produtos</CardTitle>
  <Button size="sm" variant="outline" color="secondary">Adicionar</Button>
</CardHeader>`}
      >
        <div className="flex flex-col gap-gp-2xl sm:flex-row">
          <Card size="md" className="flex-1">
            <CardHeader variant="banded">
              <CardTitle>Endereço de entrega</CardTitle>
              <CardDescription>Usado no cálculo do frete.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-body-md text-fg-muted">
                A faixa cancela o padding de topo do card pra encostar na borda, e
                arredonda só as quinas de cima.
              </p>
            </CardContent>
          </Card>

          <Card size="md" className="flex-1">
            <CardHeader
              variant="banded"
              className="flex items-center justify-between"
            >
              <CardTitle>Produtos</CardTitle>
              <Button color="secondary" variant="outline" size="sm">
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-body-md text-fg-muted">
                O grid vira flex-row por className quando a faixa precisa de ação à
                direita.
              </p>
            </CardContent>
          </Card>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
