import { useState } from "react";
import { Button } from "../../components/ui/Button/button";
import { EyeIcon, CodeIcon, CopyIcon } from "./doc-icons";

export function ExampleSection({ id, title, description, code, children }: {
  id: string;
  title: string;
  description?: string;
  code?: string;
  children: React.ReactNode;
}) {
  const [tab, setTab] = useState<"preview" | "code">("preview");

  return (
    <div className="mb-14" id={id}>
      <h3 className="text-title-lg font-semibold text-fg-default mb-gp-xs">{title}</h3>
      {description && <p className="text-body-md text-fg-muted mb-gp-2xl">{description}</p>}

      {/* Tab bar */}
      <div className="flex items-center justify-between mb-gp-xl">
        <div className="flex items-center gap-gp-xs">
          <Button color="secondary" variant={tab === "preview" ? "outline" : "ghost"} size="2xs" onClick={() => setTab("preview")} iconLeft={<EyeIcon />}>Preview</Button>
          <Button color="secondary" variant={tab === "code" ? "outline" : "ghost"} size="2xs" onClick={() => setTab("code")} iconLeft={<CodeIcon />}>Code</Button>
        </div>
        <Button color="secondary" variant="soft" size="2xs" iconLeft={<CopyIcon />}>Copy</Button>
      </div>

      {/* Card */}
      <div className="rounded-radius-base ring-1 ring-border-subtle shadow-sh-lg overflow-hidden">
        {tab === "preview" ? (
          <div className="flex items-center justify-center min-h-[256px] p-pad-4xl bg-bg-surface">
            {children}
          </div>
        ) : (
          <div className="p-pad-3xl bg-bg-subtle font-mono text-code-sm text-fg-muted overflow-x-auto">
            <pre className="whitespace-pre-wrap leading-relaxed">
              {code || `// Example code\n<Component />`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
