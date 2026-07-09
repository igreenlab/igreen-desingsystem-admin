import { useState } from "react";
import { FileUploadField } from "@/components/ui/FileUploadField";
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
  { id: "ex-basico", label: "Upload básico" },
  { id: "ex-accept", label: "Accept + tamanho máximo" },
  { id: "ex-url", label: "Editar (value como URL)" },
  { id: "ex-erro", label: "Estados (erro / disabled)" },
  { id: "api", label: "API Reference" },
];

const PROPS = [
  { name: "value", type: "File | string | null", defaultVal: "— (req)" },
  { name: "onChange", type: "(file: File | null) => void", defaultVal: "— (req)" },
  { name: "accept", type: "string — ex: \"image/*\", \".pdf,.png\"", defaultVal: "—" },
  { name: "maxSizeMB", type: "number", defaultVal: "—" },
  { name: "preview", type: "\"image\" | \"file\" | \"auto\"", defaultVal: "\"auto\"" },
  { name: "fileName", type: "string — nome quando value é URL", defaultVal: "—" },
  { name: "label", type: "string", defaultVal: "—" },
  { name: "required", type: "boolean", defaultVal: "—" },
  { name: "state", type: "\"default\" | \"error\" | \"warning\" | \"success\"", defaultVal: "\"default\"" },
  { name: "errorMessage", type: "string", defaultVal: "—" },
  { name: "helperText", type: "string", defaultVal: "—" },
  { name: "onError", type: "(reason: \"type\" | \"size\") => void", defaultVal: "—" },
  { name: "disabled", type: "boolean", defaultVal: "—" },
  { name: "id", type: "string", defaultVal: "—" },
  { name: "className", type: "string", defaultVal: "—" },
];

/** Upload básico — dropzone que abre o seletor nativo; onChange guarda o File local. */
function BasicUploadDemo() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="w-full max-w-[420px]">
      <FileUploadField
        label="Anexo"
        value={file}
        onChange={setFile}
        helperText="Selecione qualquer arquivo do seu dispositivo."
      />
    </div>
  );
}

/** Com accept + maxSizeMB — filtra tipo e tamanho; rejeição dispara onError (não vira value). */
function AcceptUploadDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [rejeicao, setRejeicao] = useState<string | null>(null);
  return (
    <div className="w-full max-w-[420px]">
      <FileUploadField
        label="Comprovante"
        required
        value={file}
        onChange={(f) => {
          setRejeicao(null);
          setFile(f);
        }}
        accept="image/*,.pdf"
        maxSizeMB={5}
        onError={(reason) =>
          setRejeicao(reason === "size" ? "Arquivo acima de 5MB." : "Tipo não permitido.")
        }
        state={rejeicao ? "error" : "default"}
        errorMessage={rejeicao ?? undefined}
        helperText={rejeicao ? undefined : "Imagens ou PDF, até 5MB."}
      />
    </div>
  );
}

/** value como URL (string) — cenário de editar registro; preview="image" força thumbnail. */
function UrlUploadDemo() {
  const [logo, setLogo] = useState<File | string | null>(
    "https://placehold.co/96x96/22c55e/ffffff?text=Logo",
  );
  return (
    <div className="w-full max-w-[420px]">
      <FileUploadField
        label="Logo"
        value={logo}
        fileName="logo.png"
        onChange={(f) => setLogo(f)}
        accept="image/*"
        preview="image"
        helperText="Remova pra limpar ou selecione outra imagem pra trocar."
      />
    </div>
  );
}

/** Estados semânticos — erro (borda/mensagem) e disabled (dropzone inerte). */
function StatesUploadDemo() {
  const [file, setFile] = useState<File | null>(null);
  return (
    <div className="flex flex-col gap-form-gap w-full max-w-[420px]">
      <FileUploadField
        label="Documento (erro)"
        required
        value={file}
        onChange={setFile}
        state="error"
        errorMessage="Anexo obrigatório."
      />
      <FileUploadField
        label="Contrato (desabilitado)"
        value={null}
        onChange={() => {}}
        accept=".pdf"
        disabled
        helperText="Disponível após aprovar a proposta."
      />
    </div>
  );
}

export function FileUploadFieldDoc() {
  return (
    <DocLayout toc={TOC}>
      <DocHeader
        category="Forms"
        title="FileUploadField"
        description="Captura de UM arquivo com preview. Componente dumb: só captura o File e mostra preview (thumbnail de imagem ou chip de arquivo) — o consumidor faz o upload. Composto de FormField + Button + Chip + Icon."
      />
      <DocSeparator />

      <SectionH2 id="examples" title="Examples" />

      <ExampleSection
        id="ex-basico"
        title="Upload básico"
        description="Estado vazio (value = null) renderiza a dropzone <button> full-width. Clicar (ou Enter/Space) abre o seletor nativo; o File selecionado vira value e mostra o preview."
        code={`const [file, setFile] = useState<File | null>(null);

<FileUploadField
  label="Anexo"
  value={file}
  onChange={setFile}
  helperText="Selecione qualquer arquivo do seu dispositivo."
/>`}
      >
        <BasicUploadDemo />
      </ExampleSection>

      <ExampleSection
        id="ex-accept"
        title="Accept + tamanho máximo"
        description="accept filtra o seletor e valida o tipo; maxSizeMB valida o tamanho. Arquivo rejeitado NÃO vira value — dispara onError('type' | 'size'). Aqui o consumer traduz em state='error' + errorMessage."
        code={`const [file, setFile] = useState<File | null>(null);
const [rejeicao, setRejeicao] = useState<string | null>(null);

<FileUploadField
  label="Comprovante"
  required
  value={file}
  onChange={(f) => { setRejeicao(null); setFile(f); }}
  accept="image/*,.pdf"
  maxSizeMB={5}
  onError={(reason) =>
    setRejeicao(reason === "size" ? "Arquivo acima de 5MB." : "Tipo não permitido.")
  }
  state={rejeicao ? "error" : "default"}
  errorMessage={rejeicao ?? undefined}
/>`}
      >
        <AcceptUploadDemo />
      </ExampleSection>

      <ExampleSection
        id="ex-url"
        title="Editar registro (value como URL)"
        description="Quando value é uma string (URL já hospedada), o campo abre já com o preview. preview='image' força thumbnail; onChange recebe null ao remover ou um novo File ao trocar."
        code={`const [logo, setLogo] = useState<File | string | null>(logoUrl);

<FileUploadField
  label="Logo"
  value={logo}
  fileName="logo.png"
  onChange={(f) => setLogo(f)}
  accept="image/*"
  preview="image"
/>`}
      >
        <UrlUploadDemo />
      </ExampleSection>

      <ExampleSection
        id="ex-erro"
        title="Estados (erro / disabled)"
        description="state='error' pinta borda e mensagem via FormField. disabled deixa a dropzone (e o remover) inertes."
        code={`<FileUploadField
  label="Documento (erro)"
  required
  value={file}
  onChange={setFile}
  state="error"
  errorMessage="Anexo obrigatório."
/>

<FileUploadField
  label="Contrato (desabilitado)"
  value={null}
  onChange={() => {}}
  accept=".pdf"
  disabled
/>`}
      >
        <StatesUploadDemo />
      </ExampleSection>

      <DocSeparator />
      <SectionH2 id="api" title="API Reference" />
      <PropsTable items={PROPS} />
    </DocLayout>
  );
}

export default FileUploadFieldDoc;
