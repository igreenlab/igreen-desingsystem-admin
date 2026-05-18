import { Alert, AlertTitle, AlertDescription } from "../../components/shadcn/alert";
import { Button } from "../../components/ui/Button/button";
import { AlertCircle, CheckCircle, AlertTriangle, Info, Rocket } from "lucide-react";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
  getDocNav,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-default", label: "Default" },
  { id: "ex-destructive", label: "Destructive" },
  { id: "ex-success", label: "Success" },
  { id: "ex-warning", label: "Warning" },
  { id: "ex-action", label: "With Action" },
  { id: "api", label: "API Reference" },
];
const PROPS = [
  { name: "variant", type: '"default" | "destructive"', defaultVal: '"default"' },
];

export function AlertDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Feedback"
        title="Alert"
        description="Inline message for important information."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      {/* Default */}
      <ExampleSection
        id="ex-default"
        title="Default"
        description="An informational alert for general notices."
        code={`<Alert>
  <Info className="size-4" />
  <AlertTitle>Software update available</AlertTitle>
  <AlertDescription>
    A new version of the application is ready to install.
    Review the release notes for details on improvements and fixes.
  </AlertDescription>
</Alert>`}
      >
        <div className="max-w-lg w-full">
          <Alert>
            <Info className="size-4" />
            <AlertTitle>Software update available</AlertTitle>
            <AlertDescription>
              A new version of the application is ready to install. Review the
              release notes for details on improvements and fixes.
            </AlertDescription>
          </Alert>
        </div>
      </ExampleSection>

      {/* Destructive */}
      <ExampleSection
        id="ex-destructive"
        title="Destructive"
        description="A critical alert for errors or destructive actions."
        code={`<Alert variant="destructive">
  <AlertCircle className="size-4" />
  <AlertTitle>Payment processing failed</AlertTitle>
  <AlertDescription>
    Your payment could not be processed. Please verify your billing
    information and try again. If the issue persists, contact support.
  </AlertDescription>
</Alert>`}
      >
        <div className="max-w-lg w-full">
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Payment processing failed</AlertTitle>
            <AlertDescription>
              Your payment could not be processed. Please verify your billing
              information and try again. If the issue persists, contact support.
            </AlertDescription>
          </Alert>
        </div>
      </ExampleSection>

      {/* Success */}
      <ExampleSection
        id="ex-success"
        title="Success"
        description="A success alert using custom border and text color overrides."
        code={`<Alert className="border-border-success/50 text-fg-success [&>svg]:text-fg-success">
  <CheckCircle className="size-4" />
  <AlertTitle>Changes saved successfully</AlertTitle>
  <AlertDescription>
    Your profile information has been updated. All changes are now
    reflected across your account.
  </AlertDescription>
</Alert>`}
      >
        <div className="max-w-lg w-full">
          <Alert className="border-border-success/50 text-fg-success [&>svg]:text-fg-success">
            <CheckCircle className="size-4" />
            <AlertTitle>Changes saved successfully</AlertTitle>
            <AlertDescription>
              Your profile information has been updated. All changes are now
              reflected across your account.
            </AlertDescription>
          </Alert>
        </div>
      </ExampleSection>

      {/* Warning */}
      <ExampleSection
        id="ex-warning"
        title="Warning"
        description="A warning alert using custom border and text color overrides."
        code={`<Alert className="border-border-warning/50 text-fg-warning [&>svg]:text-fg-warning">
  <AlertTriangle className="size-4" />
  <AlertTitle>Storage almost full</AlertTitle>
  <AlertDescription>
    You have used 90% of your available storage. Consider removing
    unused files or upgrading your plan to avoid disruptions.
  </AlertDescription>
</Alert>`}
      >
        <div className="max-w-lg w-full">
          <Alert className="border-border-warning/50 text-fg-warning [&>svg]:text-fg-warning">
            <AlertTriangle className="size-4" />
            <AlertTitle>Storage almost full</AlertTitle>
            <AlertDescription>
              You have used 90% of your available storage. Consider removing
              unused files or upgrading your plan to avoid disruptions.
            </AlertDescription>
          </Alert>
        </div>
      </ExampleSection>

      {/* With Action */}
      <ExampleSection
        id="ex-action"
        title="With Action"
        description="An alert that includes an actionable button alongside the message."
        code={`<Alert>
  <Rocket className="size-4" />
  <AlertTitle>New version available</AlertTitle>
  <AlertDescription>
    <div className="flex flex-col gap-gp-xl">
      <p>
        Version 2.4.0 includes performance improvements and new features.
      </p>
      <div>
        <Button color="primary" variant="outline" size="xs">
          Update now
        </Button>
      </div>
    </div>
  </AlertDescription>
</Alert>`}
      >
        <div className="max-w-lg w-full">
          <Alert>
            <Rocket className="size-4" />
            <AlertTitle>New version available</AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-gp-xl">
                <p>
                  Version 2.4.0 includes performance improvements and new
                  features.
                </p>
                <div>
                  <Button color="primary" variant="outline" size="xs">
                    Update now
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </ExampleSection>

      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}
