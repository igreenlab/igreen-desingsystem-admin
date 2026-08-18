import { useEffect, useState } from "react";
import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "../../components/shadcn/input-otp";
import { Input } from "../../components/shadcn/input";
import { Button } from "../../components/ui/Button";
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
  { id: "ex-sizes", label: "Sizes" },
  { id: "ex-paridade", label: "Paridade com o Input" },
  { id: "ex-variants", label: "Variantes visuais" },
  { id: "ex-states", label: "States" },
  { id: "ex-separator", label: "Separador" },
  { id: "ex-pattern", label: "Dígitos e alfanumérico" },
  { id: "ex-resend", label: "Reenvio com timer" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  {
    name: "variant",
    type: "connected | outlined | filled | underline",
    defaultVal: "connected",
    description:
      "Aparência dos slots. `connected` mantém o look histórico (slots colados, radius só nas pontas).",
  },
  {
    name: "size",
    type: "xxs | xs | sm | md",
    defaultVal: "md",
    description:
      "Os MESMOS 4 do Input de texto: 28 / 32 / 36 / 40px, via tokens form-xs/sm/md/lg. Slot é quadrado.",
  },
  {
    name: "state",
    type: "default | error | warning | success",
    defaultVal: "default",
    description:
      "Mesmos pares de cor do Input. Em erro/aviso/sucesso a borda semântica permanece enquanto o usuário digita; só o anel de foco muda.",
  },
  { name: "maxLength", type: "number — total de dígitos", defaultVal: "—" },
  { name: "value / onChange", type: "string (controlado)", defaultVal: "—" },
  {
    name: "pattern",
    type: "RegExp — REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS",
    defaultVal: "livre",
    description: "Importe de `input-otp`. Sem pattern o campo aceita qualquer caractere.",
  },
  {
    name: "InputOTPSlot index",
    type: "number — posição do dígito",
    defaultVal: "—",
    description:
      "variant/size/state também aceitam override por slot, mas o normal é declarar no <InputOTP> e deixar herdar.",
  },
  {
    name: "InputOTPSeparator",
    type: "divisor entre grupos; aceita children",
    defaultVal: "<Dot />",
    description: "Passe children pra trocar o glifo (ex.: um traço, um ponto menor).",
  },
];

const SLOTS = (n: number) =>
  Array.from({ length: n }, (_, i) => <InputOTPSlot key={i} index={i} />);

function Basico() {
  const [value, setValue] = useState("");
  return (
    <div className="flex flex-col gap-gp-md">
      <InputOTP maxLength={6} value={value} onChange={setValue}>
        <InputOTPGroup>{SLOTS(6)}</InputOTPGroup>
      </InputOTP>
      <span className="text-caption-md text-fg-muted">Valor: {value || "—"}</span>
    </div>
  );
}

function Sizes() {
  return (
    <div className="flex flex-col gap-form-gap">
      {(["xxs", "xs", "sm", "md"] as const).map((size, i) => (
        <div key={size} className="flex items-center gap-gp-xl">
          <span className="w-[92px] text-caption-md text-fg-muted">
            {size} · {[28, 32, 36, 40][i]}px
          </span>
          <InputOTP maxLength={4} size={size}>
            <InputOTPGroup>{SLOTS(4)}</InputOTPGroup>
          </InputOTP>
        </div>
      ))}
    </div>
  );
}

/**
 * A prova visual do que a paridade significa: o OTP e o campo de texto no mesmo
 * `size` têm a MESMA altura, a mesma borda em repouso e o mesmo verde no foco.
 */
function ParidadeComInput() {
  return (
    <div className="flex flex-col gap-form-gap">
      {(["xs", "sm", "md"] as const).map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-gp-xl">
          <span className="w-[92px] text-caption-md text-fg-muted">size {size}</span>
          <InputOTP maxLength={4} size={size}>
            <InputOTPGroup>{SLOTS(4)}</InputOTPGroup>
          </InputOTP>
          <Input size={size} placeholder="campo de texto" className="w-[200px]" />
        </div>
      ))}
    </div>
  );
}

function Variantes() {
  const variants = [
    ["connected", "slots colados, radius nas pontas — o default"],
    ["outlined", "separados, borda e radius completos"],
    ["filled", "fundo preenchido, borda transparente"],
    ["underline", "só a linha de baixo"],
  ] as const;

  return (
    <div className="flex flex-col gap-form-gap">
      {variants.map(([variant, desc]) => (
        <div key={variant} className="flex flex-col gap-gp-sm">
          <span className="text-caption-md text-fg-muted">
            <code className="text-fg-default">{variant}</code> — {desc}
          </span>
          <InputOTP maxLength={4} variant={variant}>
            <InputOTPGroup>{SLOTS(4)}</InputOTPGroup>
          </InputOTP>
        </div>
      ))}
    </div>
  );
}

/**
 * ⚠️ Controlado com `value`/`onChange`, NÃO `defaultValue`.
 *
 * O `OTPInput` já é controlado internamente — ele sempre passa `value` pro `<input>`. Um
 * `defaultValue` ao lado disso dispara o aviso do React *"input of type with both value and
 * defaultValue"* e o campo fica sem reagir à digitação. Peguei isso no console durante a
 * verificação visual: a medição de estilo passou, o console é que acusou.
 */
function States() {
  const [valores, setValores] = useState<Record<string, string>>({
    default: "",
    error: "12",
    warning: "12",
    success: "1234",
  });

  return (
    <div className="flex flex-col gap-form-gap">
      {(["default", "error", "warning", "success"] as const).map((state) => (
        <div key={state} className="flex items-center gap-gp-xl">
          <span className="w-[92px] text-caption-md text-fg-muted">{state}</span>
          <InputOTP
            maxLength={4}
            state={state}
            value={valores[state]}
            onChange={(v) => setValores((prev) => ({ ...prev, [state]: v }))}
          >
            <InputOTPGroup>{SLOTS(4)}</InputOTPGroup>
          </InputOTP>
        </div>
      ))}
    </div>
  );
}

function Separadores() {
  return (
    <div className="flex flex-col gap-form-gap">
      <InputOTP maxLength={6}>
        <InputOTPGroup>{SLOTS(3)}</InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      <InputOTP maxLength={6} variant="outlined">
        <InputOTPGroup>{SLOTS(3)}</InputOTPGroup>
        <InputOTPSeparator>
          <span className="block h-px w-3 bg-bg-emphasis" />
        </InputOTPSeparator>
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );
}

function Patterns() {
  return (
    <div className="flex flex-col gap-form-gap">
      <div className="flex flex-col gap-gp-sm">
        <span className="text-caption-md text-fg-muted">
          <code className="text-fg-default">REGEXP_ONLY_DIGITS</code> — teclado numérico no mobile
        </span>
        <InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS} variant="outlined">
          <InputOTPGroup>{SLOTS(4)}</InputOTPGroup>
        </InputOTP>
      </div>
      <div className="flex flex-col gap-gp-sm">
        <span className="text-caption-md text-fg-muted">
          <code className="text-fg-default">REGEXP_ONLY_DIGITS_AND_CHARS</code> — alfanumérico
        </span>
        <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS} variant="outlined">
          <InputOTPGroup>{SLOTS(6)}</InputOTPGroup>
        </InputOTP>
      </div>
    </div>
  );
}

/** Padrão de reenvio com contagem — composição, não API do componente. */
function ReenvioComTimer() {
  const [restante, setRestante] = useState(30);

  useEffect(() => {
    if (restante <= 0) return;
    const t = setTimeout(() => setRestante((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [restante]);

  return (
    <div className="flex flex-col gap-gp-xl">
      <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} variant="outlined">
        <InputOTPGroup>{SLOTS(6)}</InputOTPGroup>
      </InputOTP>
      <div className="flex items-center gap-gp-md">
        <Button size="xs" variant="ghost" disabled={restante > 0} onClick={() => setRestante(30)}>
          Reenviar código
        </Button>
        <span className="text-caption-md text-fg-muted" aria-live="polite">
          {restante > 0 ? `disponível em ${restante}s` : "pode reenviar"}
        </span>
      </div>
    </div>
  );
}

export function InputOTPDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Components"
        title="Input OTP"
        description="Entrada de código (OTP / 2FA / verificação) com slots individuais. Irmão do campo de texto: mesmos 4 sizes via tokens form-*, mesma superfície, mesma borda verde no foco e os mesmos 4 states. Colar o código completo de uma vez funciona."
        dependency="input-otp"
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basic"
        title="Básico"
        description="6 dígitos num grupo único, controlado via value/onChange."
        code={`<InputOTP maxLength={6} value={v} onChange={setV}>
  <InputOTPGroup>
    {Array.from({ length: 6 }, (_, i) => <InputOTPSlot key={i} index={i} />)}
  </InputOTPGroup>
</InputOTP>`}
      >
        <Basico />
      </ExampleSection>

      <ExampleSection
        id="ex-sizes"
        title="Sizes"
        description="Os mesmos 4 degraus do Input de texto, nos tokens form-xs/sm/md/lg. O slot é quadrado, então a largura acompanha a altura."
        code={`<InputOTP maxLength={4} size="xxs">…</InputOTP>   {/* 28px */}
<InputOTP maxLength={4} size="xs">…</InputOTP>    {/* 32px */}
<InputOTP maxLength={4} size="sm">…</InputOTP>    {/* 36px */}
<InputOTP maxLength={4} size="md">…</InputOTP>    {/* 40px — default */}`}
      >
        <Sizes />
      </ExampleSection>

      <ExampleSection
        id="ex-paridade"
        title="Paridade com o Input"
        description="Lado a lado no mesmo size: mesma altura, mesma borda em repouso, mesmo verde no foco. Clique em um e no outro pra comparar o estado focado."
        code={`<InputOTP size="sm">…</InputOTP>
<Input size="sm" placeholder="campo de texto" />`}
      >
        <ParidadeComInput />
      </ExampleSection>

      <ExampleSection
        id="ex-variants"
        title="Variantes visuais"
        description="Quatro aparências. connected é o default e preserva o visual histórico do DS."
        code={`<InputOTP variant="outlined">…</InputOTP>
<InputOTP variant="filled">…</InputOTP>
<InputOTP variant="underline">…</InputOTP>`}
      >
        <Variantes />
      </ExampleSection>

      <ExampleSection
        id="ex-states"
        title="States"
        description="Mesmos pares de cor do Input. Em erro/aviso/sucesso a borda semântica permanece enquanto o usuário digita — só o anel de foco troca de cor."
        code={`<InputOTP state="error">…</InputOTP>
<InputOTP state="warning">…</InputOTP>
<InputOTP state="success">…</InputOTP>`}
      >
        <States />
      </ExampleSection>

      <ExampleSection
        id="ex-separator"
        title="Separador"
        description="Dois grupos com divisor no meio. O separador aceita children pra trocar o glifo."
        code={`<InputOTP maxLength={6}>
  <InputOTPGroup>…3 slots…</InputOTPGroup>
  <InputOTPSeparator />
  <InputOTPGroup>…3 slots…</InputOTPGroup>
</InputOTP>

{/* glifo custom */}
<InputOTPSeparator>
  <span className="block h-px w-3 bg-bg-emphasis" />
</InputOTPSeparator>`}
      >
        <Separadores />
      </ExampleSection>

      <ExampleSection
        id="ex-pattern"
        title="Dígitos e alfanumérico"
        description="pattern vem do pacote input-otp. Só-dígitos aciona o teclado numérico no mobile, que é a diferença que o usuário sente."
        code={`import { REGEXP_ONLY_DIGITS, REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";

<InputOTP maxLength={4} pattern={REGEXP_ONLY_DIGITS}>…</InputOTP>
<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>…</InputOTP>`}
      >
        <Patterns />
      </ExampleSection>

      <ExampleSection
        id="ex-resend"
        title="Reenvio com timer"
        description="Composição, não API: o componente não traz timer nem botão. Este é o padrão a copiar — contagem em aria-live pra leitor de tela anunciar."
        code={`const [restante, setRestante] = useState(30);
useEffect(() => {
  if (restante <= 0) return;
  const t = setTimeout(() => setRestante(s => s - 1), 1000);
  return () => clearTimeout(t);
}, [restante]);

<Button size="xs" variant="ghost" disabled={restante > 0} onClick={() => setRestante(30)}>
  Reenviar código
</Button>
<span aria-live="polite">{restante > 0 ? \`disponível em \${restante}s\` : "pode reenviar"}</span>`}
      >
        <ReenvioComTimer />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default InputOTPDoc;
