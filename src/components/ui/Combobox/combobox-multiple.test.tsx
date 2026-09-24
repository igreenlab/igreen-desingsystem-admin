import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { Combobox } from "./combobox";

const OPCOES = [
  { value: "aberto", label: "Aberto" },
  { value: "pendente", label: "Pendente" },
  { value: "resolvido", label: "Resolvido" },
  { value: "fechado", label: "Fechado" },
];

/** Casca controlada — multi-seleção só faz sentido com o estado subindo. */
function Multi({ maxChips }: { maxChips?: number }) {
  const [v, setV] = useState<string[]>([]);
  return (
    <Combobox
      multiple
      options={OPCOES}
      value={v}
      onValueChange={setV}
      maxChips={maxChips}
      aria-label="Status"
    />
  );
}

/**
 * O texto da opção aparece DUAS vezes depois de selecionada: na lista e como chip no
 * trigger. Toda query de opção precisa ser escopada, senão o teste quebra sozinho no
 * segundo clique — foi o que aconteceu na primeira versão.
 */
/** O CommandInput do cmdk também tem role="combobox" — por isso todo getByRole de
 * trigger vai pelo aria-label. */
const opcao = (nome: string) =>
  screen.getAllByRole("option").find((o) => o.textContent?.includes(nome))!;

describe("Combobox — escolha única não muda", () => {
  it("seleciona e FECHA", async () => {
    const aoMudar = vi.fn();
    render(<Combobox options={OPCOES} onValueChange={aoMudar} aria-label="Status" />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await userEvent.click(screen.getByText("Pendente"));
    expect(aoMudar).toHaveBeenCalledWith("pendente");
    expect(screen.queryByPlaceholderText("Buscar…")).toBeNull();
  });
});

describe("Combobox — multiple", () => {
  it("seleciona várias sem fechar o dropdown", async () => {
    render(<Multi />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await userEvent.click(opcao("Aberto"));
    // o popover continua aberto — escolher 4 de uma lista longa não pode custar
    // 4 reaberturas
    expect(screen.getByPlaceholderText("Buscar…")).toBeTruthy();
    await userEvent.click(opcao("Pendente"));
    expect(screen.getByPlaceholderText("Buscar…")).toBeTruthy();
  });

  it("clicar de novo desmarca", async () => {
    render(<Multi />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await userEvent.click(opcao("Aberto"));
    expect(opcao("Aberto").getAttribute("aria-checked")).toBe("true");
    await userEvent.click(opcao("Aberto"));
    expect(opcao("Aberto").getAttribute("aria-checked")).toBe("false");
  });

  it("o trigger resume em +N a partir de maxChips", async () => {
    render(<Multi maxChips={2} />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    for (const nome of ["Aberto", "Pendente", "Resolvido"]) {
      await userEvent.click(opcao(nome));
    }
    const trigger = screen.getByRole("combobox", { name: "Status" });
    expect(trigger.textContent).toContain("+1");
  });

  it("a busca continua filtrando", async () => {
    render(<Multi />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await userEvent.type(screen.getByPlaceholderText("Buscar…"), "resol");
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(opcao("Resolvido")).toBeTruthy();
  });

  it("os chips do trigger NÃO têm × — seria botão dentro de botão", async () => {
    render(<Multi />);
    await userEvent.click(screen.getByRole("combobox", { name: "Status" }));
    await userEvent.click(opcao("Aberto"));
    await userEvent.keyboard("{Escape}");
    const trigger = screen.getByRole("combobox", { name: "Status" });
    expect(trigger.querySelectorAll("button")).toHaveLength(0);
  });
});
