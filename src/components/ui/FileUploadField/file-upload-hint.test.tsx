import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { FileUploadField } from "./file-upload-field";

/**
 * R.11 do retorno do igreen-tickets: "a dica sai sempre do `accept` (vira a lista de
 * MIME)". Procede — a linha menor da dropzone era derivada de `accept` + `maxSizeMB`, sem
 * saída. Serve pra `accept=".pdf"`; na importação em lote deles o `accept` são 3 MIME
 * longos e a dica vira ruído ilegível.
 *
 * `texts.hint` sobrescreve a dica INTEIRA — o `máx. NMB` incluído. O componente não
 * concatena de propósito: quem escreveu a frase decide se o limite entra nela.
 */
describe("FileUploadField — texts.hint", () => {
  const MIME = "text/csv,application/vnd.ms-excel";

  it("sem texts.hint, a dica derivada continua sendo accept + máx (default preservado)", () => {
    render(<FileUploadField value={null} onChange={() => {}} accept=".csv" maxSizeMB={10} />);
    expect(screen.getByText(".csv · máx. 10MB")).toBeTruthy();
  });

  it("texts.hint substitui a lista de MIME crua", () => {
    render(
      <FileUploadField
        value={null}
        onChange={() => {}}
        accept={MIME}
        maxSizeMB={10}
        texts={{ hint: "CSV ou XLS · até 10MB" }}
      />,
    );
    expect(screen.getByText("CSV ou XLS · até 10MB")).toBeTruthy();
    // O controle da L-064: com o código antigo esta linha é o que aparecia na tela.
    expect(screen.queryByText(`${MIME} · máx. 10MB`)).toBeNull();
  });

  it("string vazia esconde a linha em vez de mostrar a derivada", () => {
    render(
      <FileUploadField
        value={null}
        onChange={() => {}}
        accept={MIME}
        maxSizeMB={10}
        texts={{ hint: "" }}
      />,
    );
    expect(screen.queryByText(`${MIME} · máx. 10MB`)).toBeNull();
  });

  it("texts.hint não interfere nos outros textos", () => {
    render(
      <FileUploadField
        value={null}
        onChange={() => {}}
        accept=".csv"
        texts={{ hint: "só CSV", drop: "Selecionar planilha" }}
      />,
    );
    expect(screen.getByText("Selecionar planilha")).toBeTruthy();
    expect(screen.getByText("só CSV")).toBeTruthy();
  });
});
