import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel, SelectSeparator } from "../../components/shadcn/select";
import { Label } from "../../components/shadcn/label";
import { Input } from "../../components/shadcn/input";
import { Button } from "../../components/ui/Button/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/shadcn/card";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-with-label", label: "With Label" },
  { id: "ex-groups", label: "Groups" },
  { id: "ex-scrollable", label: "Scrollable" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-form", label: "Form" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "defaultValue", type: "string", defaultVal: "—" },
  { name: "value", type: "string", defaultVal: "—" },
  { name: "onValueChange", type: "(value: string) => void", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
];

export function SelectDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Form Controls" title="Select" description="Dropdown selector built on Radix UI primitives." dependency="@radix-ui/react-select" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-default"
        title="Default"
        description="Basic select with a placeholder and options."
        code={`<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a framework" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="react">React</SelectItem>
    <SelectItem value="vue">Vue</SelectItem>
    <SelectItem value="svelte">Svelte</SelectItem>
    <SelectItem value="angular">Angular</SelectItem>
  </SelectContent>
</Select>`}
      >
        <div className="max-w-sm w-full">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="vue">Vue</SelectItem>
              <SelectItem value="svelte">Svelte</SelectItem>
              <SelectItem value="angular">Angular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-with-label"
        title="With Label"
        description="Pair with Label for accessible forms."
        code={`<div className="grid gap-gp-md">
  <Label htmlFor="framework">Framework</Label>
  <Select>
    <SelectTrigger id="framework">
      <SelectValue placeholder="Select a framework" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="react">React</SelectItem>
      <SelectItem value="vue">Vue</SelectItem>
      <SelectItem value="svelte">Svelte</SelectItem>
    </SelectContent>
  </Select>
</div>`}
      >
        <div className="grid gap-gp-md max-w-sm w-full">
          <Label htmlFor="framework-demo">Framework</Label>
          <Select>
            <SelectTrigger id="framework-demo">
              <SelectValue placeholder="Select a framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="vue">Vue</SelectItem>
              <SelectItem value="svelte">Svelte</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-groups"
        title="Groups"
        description="Use SelectGroup, SelectLabel, and SelectSeparator to organize options into categories."
        code={`<Select>
  <SelectTrigger>
    <SelectValue placeholder="Pick a fruit" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Citrus</SelectLabel>
      <SelectItem value="orange">Orange</SelectItem>
      <SelectItem value="lemon">Lemon</SelectItem>
      <SelectItem value="lime">Lime</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Berries</SelectLabel>
      <SelectItem value="strawberry">Strawberry</SelectItem>
      <SelectItem value="blueberry">Blueberry</SelectItem>
      <SelectItem value="raspberry">Raspberry</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Other</SelectLabel>
      <SelectItem value="apple">Apple</SelectItem>
      <SelectItem value="banana">Banana</SelectItem>
      <SelectItem value="mango">Mango</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
      >
        <div className="max-w-sm w-full">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Pick a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Citrus</SelectLabel>
                <SelectItem value="orange">Orange</SelectItem>
                <SelectItem value="lemon">Lemon</SelectItem>
                <SelectItem value="lime">Lime</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Berries</SelectLabel>
                <SelectItem value="strawberry">Strawberry</SelectItem>
                <SelectItem value="blueberry">Blueberry</SelectItem>
                <SelectItem value="raspberry">Raspberry</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Other</SelectLabel>
                <SelectItem value="apple">Apple</SelectItem>
                <SelectItem value="banana">Banana</SelectItem>
                <SelectItem value="mango">Mango</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-scrollable"
        title="Scrollable"
        description="Select with many items displays a scrollable dropdown."
        code={`<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select a timezone" />
  </SelectTrigger>
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Americas</SelectLabel>
      <SelectItem value="est">Eastern (UTC-5)</SelectItem>
      <SelectItem value="cst">Central (UTC-6)</SelectItem>
      <SelectItem value="mst">Mountain (UTC-7)</SelectItem>
      <SelectItem value="pst">Pacific (UTC-8)</SelectItem>
      <SelectItem value="akst">Alaska (UTC-9)</SelectItem>
      <SelectItem value="hst">Hawaii (UTC-10)</SelectItem>
      <SelectItem value="brt">Brasilia (UTC-3)</SelectItem>
      <SelectItem value="art">Argentina (UTC-3)</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Europe & Africa</SelectLabel>
      <SelectItem value="gmt">GMT (UTC+0)</SelectItem>
      <SelectItem value="cet">CET (UTC+1)</SelectItem>
      <SelectItem value="eet">EET (UTC+2)</SelectItem>
      <SelectItem value="msk">Moscow (UTC+3)</SelectItem>
      <SelectItem value="cat">CAT (UTC+2)</SelectItem>
      <SelectItem value="wat">WAT (UTC+1)</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <SelectLabel>Asia & Pacific</SelectLabel>
      <SelectItem value="ist">India (UTC+5:30)</SelectItem>
      <SelectItem value="cst_cn">China (UTC+8)</SelectItem>
      <SelectItem value="jst">Japan (UTC+9)</SelectItem>
      <SelectItem value="kst">Korea (UTC+9)</SelectItem>
      <SelectItem value="aest">Australia Eastern (UTC+10)</SelectItem>
      <SelectItem value="nzst">New Zealand (UTC+12)</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`}
      >
        <div className="max-w-sm w-full">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select a timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Americas</SelectLabel>
                <SelectItem value="est">Eastern (UTC-5)</SelectItem>
                <SelectItem value="cst">Central (UTC-6)</SelectItem>
                <SelectItem value="mst">Mountain (UTC-7)</SelectItem>
                <SelectItem value="pst">Pacific (UTC-8)</SelectItem>
                <SelectItem value="akst">Alaska (UTC-9)</SelectItem>
                <SelectItem value="hst">Hawaii (UTC-10)</SelectItem>
                <SelectItem value="brt">Brasilia (UTC-3)</SelectItem>
                <SelectItem value="art">Argentina (UTC-3)</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Europe & Africa</SelectLabel>
                <SelectItem value="gmt">GMT (UTC+0)</SelectItem>
                <SelectItem value="cet">CET (UTC+1)</SelectItem>
                <SelectItem value="eet">EET (UTC+2)</SelectItem>
                <SelectItem value="msk">Moscow (UTC+3)</SelectItem>
                <SelectItem value="cat">CAT (UTC+2)</SelectItem>
                <SelectItem value="wat">WAT (UTC+1)</SelectItem>
              </SelectGroup>
              <SelectSeparator />
              <SelectGroup>
                <SelectLabel>Asia & Pacific</SelectLabel>
                <SelectItem value="ist">India (UTC+5:30)</SelectItem>
                <SelectItem value="cst_cn">China (UTC+8)</SelectItem>
                <SelectItem value="jst">Japan (UTC+9)</SelectItem>
                <SelectItem value="kst">Korea (UTC+9)</SelectItem>
                <SelectItem value="aest">Australia Eastern (UTC+10)</SelectItem>
                <SelectItem value="nzst">New Zealand (UTC+12)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Disabled select prevents user interaction."
        code={`<Select disabled>
  <SelectTrigger>
    <SelectValue placeholder="Select a framework" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="react">React</SelectItem>
    <SelectItem value="vue">Vue</SelectItem>
  </SelectContent>
</Select>`}
      >
        <div className="max-w-sm w-full">
          <Select disabled>
            <SelectTrigger>
              <SelectValue placeholder="Select a framework" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="react">React</SelectItem>
              <SelectItem value="vue">Vue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ExampleSection>

      <ExampleSection
        id="ex-form"
        title="Form"
        description="Select as part of a mini form with other inputs and a submit button."
        code={`<Card className="max-w-sm w-full">
  <CardHeader>
    <CardTitle>Team member</CardTitle>
    <CardDescription>Add a new member to your team.</CardDescription>
  </CardHeader>
  <CardContent>
    <div className="grid gap-gp-3xl">
      <div className="grid gap-gp-md">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="John Doe" />
      </div>
      <div className="grid gap-gp-md">
        <Label htmlFor="role">Role</Label>
        <Select>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="viewer">Viewer</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="owner">Owner</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </CardContent>
  <CardFooter>
    <Button color="primary" variant="filled" size="sm" className="w-full">
      Add member
    </Button>
  </CardFooter>
</Card>`}
      >
        <Card className="max-w-sm w-full">
          <CardHeader>
            <CardTitle>Team member</CardTitle>
            <CardDescription>Add a new member to your team.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-gp-3xl">
              <div className="grid gap-gp-md">
                <Label htmlFor="form-member-name">Name</Label>
                <Input id="form-member-name" placeholder="John Doe" />
              </div>
              <div className="grid gap-gp-md">
                <Label htmlFor="form-member-role">Role</Label>
                <Select>
                  <SelectTrigger id="form-member-role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="button" color="primary" variant="filled" size="sm" className="w-full">Add member</Button>
          </CardFooter>
        </Card>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
