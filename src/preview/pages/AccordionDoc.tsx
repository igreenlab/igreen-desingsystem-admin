import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../../components/shadcn/accordion";
import { DocLayout, DocHeader, DocSeparator, SectionH2, ExampleSection, PropsTable } from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-multiple", label: "Multiple" },
  { id: "ex-disabled", label: "Disabled" },
  { id: "ex-bordered", label: "With Border" },
  { id: "ex-nested", label: "Nested Content" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "type", type: '"single" | "multiple"', defaultVal: '"single"' },
  { name: "collapsible", type: "boolean", defaultVal: "false" },
  { name: "defaultValue", type: "string | string[]", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "false" },
];

export function AccordionDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader category="Feedback" title="Accordion" description="Vertically collapsing content panels." dependency="@radix-ui/react-accordion" />
      <DocSeparator />
      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="Single collapsible accordion with FAQ-style items."
        code={`<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>
      Yes. It adheres to the WAI-ARIA design pattern.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Is it styled?</AccordionTrigger>
    <AccordionContent>
      Yes. It uses iGreen DS tokens for consistent theming.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Is it animated?</AccordionTrigger>
    <AccordionContent>
      Yes. Smooth CSS keyframe animations out of the box.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-4">
    <AccordionTrigger>Can I customize it?</AccordionTrigger>
    <AccordionContent>
      Absolutely. Override styles via className or extend with tokens.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
      >
        <div className="max-w-lg w-full">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is it accessible?</AccordionTrigger>
              <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Is it styled?</AccordionTrigger>
              <AccordionContent>Yes. It uses iGreen DS tokens for consistent theming.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is it animated?</AccordionTrigger>
              <AccordionContent>Yes. Smooth CSS keyframe animations out of the box.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Can I customize it?</AccordionTrigger>
              <AccordionContent>Absolutely. Override styles via className or extend with tokens.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ExampleSection>

      {/* Multiple */}
      <ExampleSection
        id="ex-multiple"
        title="Multiple"
        description="Multiple panels can be open simultaneously."
        code={`<Accordion type="multiple" defaultValue={["item-1", "item-2"]}>
  <AccordionItem value="item-1">
    <AccordionTrigger>First section</AccordionTrigger>
    <AccordionContent>
      This panel is open by default along with the second one.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Second section</AccordionTrigger>
    <AccordionContent>
      Both panels can stay open at the same time.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Third section</AccordionTrigger>
    <AccordionContent>
      Open this without closing the others.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
      >
        <div className="max-w-lg w-full">
          <Accordion type="multiple" defaultValue={["item-1", "item-2"]}>
            <AccordionItem value="item-1">
              <AccordionTrigger>First section</AccordionTrigger>
              <AccordionContent>This panel is open by default along with the second one.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Second section</AccordionTrigger>
              <AccordionContent>Both panels can stay open at the same time.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Third section</AccordionTrigger>
              <AccordionContent>Open this without closing the others.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ExampleSection>

      {/* Disabled */}
      <ExampleSection
        id="ex-disabled"
        title="Disabled"
        description="Individual items can be disabled to prevent interaction."
        code={`<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Available section</AccordionTrigger>
    <AccordionContent>
      This section is interactive.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2" disabled>
    <AccordionTrigger>Disabled section</AccordionTrigger>
    <AccordionContent>
      You should not be able to see this.
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-3">
    <AccordionTrigger>Another available section</AccordionTrigger>
    <AccordionContent>
      This one is also interactive.
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
      >
        <div className="max-w-lg w-full">
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Available section</AccordionTrigger>
              <AccordionContent>This section is interactive.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" disabled>
              <AccordionTrigger>Disabled section</AccordionTrigger>
              <AccordionContent>You should not be able to see this.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Another available section</AccordionTrigger>
              <AccordionContent>This one is also interactive.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ExampleSection>

      {/* With Border */}
      <ExampleSection
        id="ex-bordered"
        title="With Border"
        description="Accordion wrapped in a bordered container for a card-like appearance."
        code={`<div className="rounded-radius-base border border-border-subtle overflow-hidden">
  <Accordion type="single" collapsible defaultValue="item-1">
    <AccordionItem value="item-1" className="px-pad-3xl">
      <AccordionTrigger>Account settings</AccordionTrigger>
      <AccordionContent>...</AccordionContent>
    </AccordionItem>
    <AccordionItem value="item-2" className="px-pad-3xl">
      ...
    </AccordionItem>
  </Accordion>
</div>`}
      >
        <div className="max-w-lg w-full">
          <div className="rounded-radius-base border border-border-subtle overflow-hidden">
            <Accordion type="single" collapsible defaultValue="item-1">
              <AccordionItem value="item-1" className="border-b border-border-subtle px-pad-3xl">
                <AccordionTrigger>Account settings</AccordionTrigger>
                <AccordionContent>Manage your name, email and profile picture.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-b border-border-subtle px-pad-3xl">
                <AccordionTrigger>Notifications</AccordionTrigger>
                <AccordionContent>Choose which notifications you want to receive.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-b-0 px-pad-3xl">
                <AccordionTrigger>Privacy</AccordionTrigger>
                <AccordionContent>Control your data sharing and visibility preferences.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </ExampleSection>

      {/* Nested Content */}
      <ExampleSection
        id="ex-nested"
        title="Nested Content"
        description="Accordion items can contain rich content like lists, links and tables."
        code={`<Accordion type="single" collapsible defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Supported energy plans</AccordionTrigger>
    <AccordionContent>
      <ul className="list-disc pl-sp-md flex flex-col gap-gp-xs">
        <li>Solar shared subscription</li>
        <li>Own generation via accredited plants</li>
        <li>Free market (large consumers)</li>
      </ul>
    </AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Billing schedule</AccordionTrigger>
    <AccordionContent>
      <table className="w-full text-body-md font-medium">
        <thead>
          <tr className="border-b border-border-subtle">
            <th className="text-left pb-pad-sm ...">Month</th>
            <th className="text-right pb-pad-sm ...">Due date</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-border-subtle">
            <td className="py-pad-sm">January</td>
            <td className="text-right py-pad-sm">15th</td>
          </tr>
          ...
        </tbody>
      </table>
    </AccordionContent>
  </AccordionItem>
</Accordion>`}
      >
        <div className="max-w-lg w-full">
          <Accordion type="single" collapsible defaultValue="item-1">
            <AccordionItem value="item-1">
              <AccordionTrigger>Supported energy plans</AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-sp-md flex flex-col gap-gp-xs">
                  <li className="text-body-md text-fg-muted">Solar shared subscription</li>
                  <li className="text-body-md text-fg-muted">Own generation via accredited plants</li>
                  <li className="text-body-md text-fg-muted">Free market (large consumers)</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Billing schedule</AccordionTrigger>
              <AccordionContent>
                <table className="w-full text-body-md font-medium">
                  <thead>
                    <tr className="border-b border-border-subtle">
                      <th className="text-left pb-pad-sm text-fg-default">Month</th>
                      <th className="text-right pb-pad-sm text-fg-default">Due date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border-subtle">
                      <td className="py-pad-sm text-fg-muted">January</td>
                      <td className="text-right py-pad-sm text-fg-muted">15th</td>
                    </tr>
                    <tr className="border-b border-border-subtle">
                      <td className="py-pad-sm text-fg-muted">February</td>
                      <td className="text-right py-pad-sm text-fg-muted">15th</td>
                    </tr>
                    <tr>
                      <td className="py-pad-sm text-fg-muted">March</td>
                      <td className="text-right py-pad-sm text-fg-muted">15th</td>
                    </tr>
                  </tbody>
                </table>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Useful links</AccordionTrigger>
              <AccordionContent>
                <div className="flex flex-col gap-gp-xs">
                  <a href="#" className="text-body-md font-medium text-fg-brand hover:underline">Documentation</a>
                  <a href="#" className="text-body-md font-medium text-fg-brand hover:underline">API Reference</a>
                  <a href="#" className="text-body-md font-medium text-fg-brand hover:underline">Support Center</a>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
