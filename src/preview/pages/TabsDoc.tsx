import { Eye, Code, Settings, User, Bell, Shield, Palette } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/shadcn/tabs";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-icons", label: "With Icons" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-fullwidth", label: "Full Width" },
  { id: "ex-many", label: "Many Tabs" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "defaultValue", type: "string", defaultVal: "—" },
  { name: "value", type: "string", defaultVal: "—" },
  { name: "onValueChange", type: "(value: string) => void", defaultVal: "—" },
];

export function TabsDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Navigation" title="Tabs" description="Tab navigation built on Radix UI. Pill-shaped with smooth transitions." dependency="@radix-ui/react-tabs" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Basic tabs with content panels. Click a tab to reveal its content."
        code={`<Tabs defaultValue="account" className="w-full max-w-md">\n  <TabsList>\n    <TabsTrigger value="account">Account</TabsTrigger>\n    <TabsTrigger value="password">Password</TabsTrigger>\n    <TabsTrigger value="settings">Settings</TabsTrigger>\n  </TabsList>\n  <TabsContent value="account">\n    Account details here.\n  </TabsContent>\n  <TabsContent value="password">\n    Password settings here.\n  </TabsContent>\n  <TabsContent value="settings">\n    General settings here.\n  </TabsContent>\n</Tabs>`}
      >
        <Tabs defaultValue="account" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-default font-medium mb-gp-xs">Account</p>
              <p className="text-body-md text-fg-muted">Manage your account details, email address, and profile information.</p>
            </div>
          </TabsContent>
          <TabsContent value="password">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-default font-medium mb-gp-xs">Password</p>
              <p className="text-body-md text-fg-muted">Update your password. We recommend using a strong, unique password.</p>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-default font-medium mb-gp-xs">Settings</p>
              <p className="text-body-md text-fg-muted">Configure notifications, language preferences, and display options.</p>
            </div>
          </TabsContent>
        </Tabs>
      </ExampleSection>

      {/* With Icons */}
      <ExampleSection
        id="ex-icons"
        title="With Icons"
        description="Place an icon alongside the tab label for better scannability."
        code={`import { Eye, Code } from "lucide-react";\n\n<Tabs defaultValue="preview">\n  <TabsList>\n    <TabsTrigger value="preview">\n      <Eye className="size-4" />\n      Preview\n    </TabsTrigger>\n    <TabsTrigger value="code">\n      <Code className="size-4" />\n      Code\n    </TabsTrigger>\n  </TabsList>\n  <TabsContent value="preview">...</TabsContent>\n  <TabsContent value="code">...</TabsContent>\n</Tabs>`}
      >
        <Tabs defaultValue="preview" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="preview">
              <Eye className="size-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code">
              <Code className="size-4" />
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Live preview of the component rendered in the browser.</p>
            </div>
          </TabsContent>
          <TabsContent value="code">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted font-mono">{'<Button color="primary">Click me</Button>'}</p>
            </div>
          </TabsContent>
        </Tabs>
      </ExampleSection>

      {/* Disabled */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Disabled tabs are visually muted and non-interactive. Users cannot focus or click them."
        code={`<Tabs defaultValue="general">\n  <TabsList>\n    <TabsTrigger value="general">General</TabsTrigger>\n    <TabsTrigger value="security" disabled>Security</TabsTrigger>\n    <TabsTrigger value="notifications">Notifications</TabsTrigger>\n  </TabsList>\n  ...\n</Tabs>`}
      >
        <Tabs defaultValue="general" className="w-full max-w-md">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security" disabled>Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="general">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">General preferences and account overview.</p>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Choose which notifications you want to receive.</p>
            </div>
          </TabsContent>
        </Tabs>
      </ExampleSection>

      {/* Full Width */}
      <ExampleSection
        id="ex-fullwidth"
        title="Full Width"
        description="Make the tab list span the full width with each trigger taking equal space."
        code={`<Tabs defaultValue="overview" className="w-full">\n  <TabsList className="w-full">\n    <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>\n    <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>\n    <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>\n  </TabsList>\n  ...\n</Tabs>`}
      >
        <Tabs defaultValue="overview" className="w-full max-w-lg">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
            <TabsTrigger value="reports" className="flex-1">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Dashboard overview with key metrics and summaries.</p>
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Detailed analytics with charts and trends.</p>
            </div>
          </TabsContent>
          <TabsContent value="reports">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Generated reports available for download.</p>
            </div>
          </TabsContent>
        </Tabs>
      </ExampleSection>

      {/* Many Tabs */}
      <ExampleSection
        id="ex-many"
        title="Many Tabs"
        description="Five tabs to demonstrate overflow behavior. Horizontal scroll may activate on smaller viewports."
        code={`<Tabs defaultValue="profile">\n  <TabsList>\n    <TabsTrigger value="profile"><User /> Profile</TabsTrigger>\n    <TabsTrigger value="notifications"><Bell /> Alerts</TabsTrigger>\n    <TabsTrigger value="security"><Shield /> Security</TabsTrigger>\n    <TabsTrigger value="appearance"><Palette /> Theme</TabsTrigger>\n    <TabsTrigger value="settings"><Settings /> Settings</TabsTrigger>\n  </TabsList>\n  ...\n</Tabs>`}
      >
        <Tabs defaultValue="profile" className="w-full max-w-lg">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="size-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="size-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="security">
              <Shield className="size-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="appearance">
              <Palette className="size-4" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="size-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          <TabsContent value="profile">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Edit your display name, bio, and avatar.</p>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Configure email, push, and in-app alerts.</p>
            </div>
          </TabsContent>
          <TabsContent value="security">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Two-factor authentication and active sessions.</p>
            </div>
          </TabsContent>
          <TabsContent value="appearance">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Switch between light and dark themes.</p>
            </div>
          </TabsContent>
          <TabsContent value="settings">
            <div className="p-pad-3xl rounded-radius-base bg-bg-muted">
              <p className="text-body-md text-fg-muted">Language, timezone, and data export options.</p>
            </div>
          </TabsContent>
        </Tabs>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <div className="mb-gp-4xl">
        <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">Tabs</h3>
        <p className="text-body-md text-fg-muted mb-gp-3xl">
          Based on <code className="font-mono text-code-sm bg-bg-subtle px-pad-sm py-pad-2xs rounded-radius-md">@radix-ui/react-tabs</code>.
          Wraps TabsList, TabsTrigger, and TabsContent.
        </p>
        <PropsTable items={PROPS} />
      </div>
    </DocLayout>
  );
}
