import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Combobox } from "./combobox";

/**
 * R.7 do retorno do igreen-tickets: o `CommandItem` recebia `value={option.label}`, e o
 * cmdk indexa pelo `value` — rótulos repetidos (duas "Matriz", em unidades diferentes)
 * compartilhavam a mesma chave.
 *
 * ⚠️ NÃO consegui reproduzir o sintoma que eles descreveram ("uma some da lista filtrada
 * e a outra recebe o clique das duas"): com `value={option.label}` estes 7 casos passam
 * IGUAL. O motivo é que o nosso `onSelect` fecha sobre a opção (`escolher(option)`) e
 * nunca lê o value que o cmdk devolve — está dito no cabeçalho do componente. Então o
 * clique acerta o item certo mesmo com value duplicado.
 *
 * A troca pra `value={option.value}` fica porque valor único é o que o cmdk espera e o
 * label segue pesquisável por `keywords`. Mas estes testes cobrem o COMPORTAMENTO
 * desejado, não a regressão — se o sintoma voltar a aparecer no Tickets, precisamos do
 * caso concreto (qual interação, teclado ou mouse) pra virar gate de verdade.
 */

const REPETIDAS = [
  { value: "u1", label: "Matriz", hint: "São Paulo" },
  { value: "u2", label: "Matriz", hint: "Recife" },
  { value: "u3", label: "Filial", hint: "Curitiba" },
];

const abrir = async () => userEvent.click(screen.getByRole("combobox", { name: "Unidade" }));

describe("Combobox — rótulos repetidos", () => {
  it("as duas 'Matriz' aparecem e são alvos DISTINTOS", async () => {
    const aoMudar = vi.fn();
    render(<Combobox options={REPETIDAS} onValueChange={aoMudar} aria-label="Unidade" />);
    await abrir();

    const itens = screen.getAllByRole("option");
    expect(itens).toHaveLength(3);

    // clicar na SEGUNDA Matriz precisa devolver u2, não u1
    const segunda = itens.find((i) => i.textContent?.includes("Recife"))!;
    await userEvent.click(segunda);
    expect(aoMudar).toHaveBeenCalledWith("u2");
  });

  it("a busca continua casando pelo LABEL (que virou keyword)", async () => {
    render(<Combobox options={REPETIDAS} aria-label="Unidade" />);
    await abrir();
    await userEvent.type(screen.getByPlaceholderText("Buscar…"), "matriz");
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("e também pelo hint", async () => {
    render(<Combobox options={REPETIDAS} aria-label="Unidade" />);
    await abrir();
    await userEvent.type(screen.getByPlaceholderText("Buscar…"), "recife");
    expect(screen.getAllByRole("option")).toHaveLength(1);
  });
});

describe("Combobox — grupos e hint", () => {
  it("opções com `group` ganham cabeçalho; as sem group vêm antes", async () => {
    render(
      <Combobox
        aria-label="Coluna"
        options={[
          { value: "todas", label: "Todas" },
          { value: "a", label: "Nome", group: "Cliente" },
          { value: "b", label: "CNPJ", group: "Cliente" },
          { value: "c", label: "Status", group: "Contrato" },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("combobox", { name: "Coluna" }));
    expect(screen.getByText("Cliente")).toBeTruthy();
    expect(screen.getByText("Contrato")).toBeTruthy();
    // a sem grupo continua na lista, e primeiro
    const textos = screen.getAllByRole("option").map((o) => o.textContent);
    expect(textos[0]).toContain("Todas");
  });

  it("o hint aparece como linha secundária", async () => {
    render(<Combobox options={REPETIDAS} aria-label="Unidade" />);
    await abrir();
    expect(screen.getByText("São Paulo")).toBeTruthy();
  });
});

describe("Combobox — closeOnSelect", () => {
  it("default fecha ao escolher", async () => {
    render(<Combobox options={REPETIDAS} aria-label="Unidade" />);
    await abrir();
    await userEvent.click(screen.getAllByRole("option")[0]);
    expect(screen.queryByPlaceholderText("Buscar…")).toBeNull();
  });

  it("closeOnSelect={false} mantém aberto", async () => {
    render(<Combobox options={REPETIDAS} closeOnSelect={false} aria-label="Unidade" />);
    await abrir();
    await userEvent.click(screen.getAllByRole("option")[0]);
    expect(screen.getByPlaceholderText("Buscar…")).toBeTruthy();
  });
});
