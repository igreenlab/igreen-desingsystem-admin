import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../components/shadcn/input-otp";
import {
  DocLayout,
  DocHeader,
  DocSeparator,
  SectionH2,
  ExampleSection,
  PropsTable,
} from "../components";

const TOC = [
  { id: "examples", label: "Examples" },
  { id: "ex-basic", label: "Básico" },
  { id: "ex-separator", label: "Com separador" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "maxLength", type: "number — total de dígitos", defaultVal: "—" },
  { name: "value / onChange", type: "string (controlado)", defaultVal: "—" },
  { name: "InputOTPGroup", type: "agrupa slots (cantos arredondados nas pontas)", defaultVal: "—" },
  { name: "InputOTPSlot index", type: "number — posição do dígito", defaultVal: "—" },
  { name: "InputOTPSeparator", type: "divisor visual entre grupos", defaultVal: "—" },
];

function BasicExample() {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-gp-md">
      <InputOTP maxLength={6} value={value} onChange={setValue}>
        <InputOTPGroup>
          {Array.from({ length: 6 }, (_, i) => (
            <InputOTPSlot key={i} index={i} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      <span className="text-caption-md text-fg-muted">Valor: {value || "—"}</span>
    </div>
  );
}

function SeparatorExample() {
  const [value, setValue] = useState("");
  return (
    <InputOTP maxLength={6} value={value} onChange={setValue}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}

export function InputOTPDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Input OTP"
        description="Entrada de código (OTP / 2FA / verificação) com slots individuais. Tokenizado iGreen: slots size-form-lg, borda DS, foco ring-4. Cole o código completo de uma vez também funciona."
        dependency="input-otp"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="6 dígitos num grupo único. Controlado via value/onChange."
        code={`<InputOTP maxLength={6} value={v} onChange={setV}>
  <InputOTPGroup>
    {Array.from({ length: 6 }, (_, i) => <InputOTPSlot key={i} index={i} />)}
  </InputOTPGroup>
</InputOTP>`}
      >
        <BasicExample />
      </ExampleSection>

      <ExampleSection
        id="ex-separator"
        title="Com separador"
        description="Dois grupos de 3 com um separador no meio."
        code={`<InputOTP maxLength={6}>
  <InputOTPGroup>…3 slots…</InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>…3 slots…</InputOTPGroup>
</InputOTP>`}
      >
        <SeparatorExample />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default InputOTPDoc;
