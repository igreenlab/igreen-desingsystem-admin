import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormFieldSelect } from "./form-field-select";

/**
 * O `Select` controlado não pode apagar, nem esconder, o que o consumidor pediu.
 *
 * Três sintomas, uma origem: o Radix usa `""` como sentinela de "nada
 * selecionado" e ECOA o valor controlado de volta pelo `<select>` nativo do
 * `SelectBubbleInput`. Ver o docblock do `form-field-select.tsx`.
 *
 * Medido no Hub em 2026-08-20: a tela de Conexões parou de salvar porque a fila
 * gravada era apagada na abertura da modal, e o select de persona aparecia
 * vazio embora a opção "Sem IA" existisse. Dezenove horas de access log sem um
 * único PUT.
 */

const FILAS = [
  { value: "", label: "Sem fila padrão" },
  { value: "9", label: "Atendimento" },
  { value: "24", label: "Onboarding" },
];

describe("FormFieldSelect — valor sem opção (o eco do Radix)", () => {
  it("NÃO avisa mudança quando a opção do valor ainda não chegou", async () => {
    const aoMudar = vi.fn();

    // A SEQUÊNCIA importa: o eco só existe quando o valor MUDA depois da
    // montagem (`prevValue !== selectValue` no efeito do SelectBubbleInput).
    // É exatamente o `reset` de um formulário hidratando com o dado que chegou
    // do servidor enquanto a lista de opções ainda não veio.
    //
    // Montar já com o valor órfão não reproduz nada — testado: passa com o
    // componente quebrado.
    // DENTRO DE UM <form>, e isso não é detalhe de teste. O `<select>` nativo
    // que ecoa só é montado quando o gatilho está num formulário:
    // `isFormControl = trigger ? form || !!trigger.closest("form") : true`.
    // Fora de form não há eco — e o defeito só existe onde select controlado
    // vive, que é justamente dentro de formulário.
    const tela = (valor: string) => (
      <form>
        <FormFieldSelect
          label="Fila"
          options={[{ value: "9", label: "Atendimento" }]}
          value={valor}
          onValueChange={aoMudar}
        />
      </form>
    );

    const { rerender } = render(tela(""));
    rerender(tela("24"));

    await waitFor(() => expect(screen.getByText("Fila")).toBeTruthy());

    expect(
      aoMudar,
      "o eco voltou vazio e o consumidor gravaria isso por cima do valor",
    ).not.toHaveBeenCalled();
  });

  it("com a opção presente, o valor controlado sobrevive calado", async () => {
    const aoMudar = vi.fn();

    render(
      <FormFieldSelect label="Fila" options={FILAS} value="24" onValueChange={aoMudar} />,
    );

    await waitFor(() => expect(screen.getByText("Onboarding")).toBeTruthy());
    expect(aoMudar).not.toHaveBeenCalled();
  });
});

describe("FormFieldSelect — a opção de valor vazio", () => {
  it("mostra o RÓTULO em vez do placeholder", async () => {
    render(
      <FormFieldSelect
        label="Fila"
        placeholder="Selecione"
        options={FILAS}
        value=""
        onValueChange={() => {}}
      />,
    );

    // Antes o Radix lia `""` como "nada selecionado" e exibia o placeholder,
    // escondendo uma opção que o consumidor declarou.
    await waitFor(() =>
      expect(
        screen.getByText("Sem fila padrão"),
        "a opção existe e foi escolhida — o rótulo dela tem de aparecer",
      ).toBeTruthy(),
    );
  });

  it("não estoura no Radix que proíbe item com valor vazio", () => {
    // No 2.2.6 um <SelectItem value=""> lança; no 2.3.1 o erro sumiu e virou
    // silêncio. A sentinela interna faz o componente atravessar as duas.
    expect(() =>
      render(
        <FormFieldSelect label="Fila" options={FILAS} value="9" onValueChange={() => {}} />,
      ),
    ).not.toThrow();
  });

  it("devolve `''` ao consumidor quando a pessoa escolhe a opção vazia", async () => {
    const aoMudar = vi.fn();
    const usuario = userEvent.setup();

    render(
      <FormFieldSelect label="Fila" options={FILAS} value="24" onValueChange={aoMudar} />,
    );

    await usuario.click(screen.getByRole("combobox"));
    await usuario.click(await screen.findByText("Sem fila padrão"));

    await waitFor(() =>
      expect(
        aoMudar,
        "a sentinela é interna — o consumidor continua recebendo '' como sempre",
      ).toHaveBeenCalledWith(""),
    );
  });

  it("escolha comum continua passando", async () => {
    const aoMudar = vi.fn();
    const usuario = userEvent.setup();

    render(
      <FormFieldSelect label="Fila" options={FILAS} value="" onValueChange={aoMudar} />,
    );

    await usuario.click(screen.getByRole("combobox"));
    await usuario.click(await screen.findByText("Onboarding"));

    await waitFor(() => expect(aoMudar).toHaveBeenCalledWith("24"));
  });
});
