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
  { id: "api", label: "API Reference" },
];
const PROPS = [
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

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
