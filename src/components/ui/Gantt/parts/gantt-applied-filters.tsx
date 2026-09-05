import { useState } from "react";
import { CircleX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  ganttAppliedChip,
  ganttAppliedChipName,
  ganttAppliedChipOp,
  ganttAppliedChipRemove,
  ganttAppliedChipValue,
  ganttAppliedRow,
  ganttClearLink,
  ganttFilterOption,
  ganttFilterOptionBox,
  ganttFilterOptionCount,
  ganttFilterOptionLabel,
} from "../gantt.styles";
import {
  campoVazio,
  operadorDoCampo,
  valoresDoChip,
} from "../hooks/filters";
import type { GanttFilterField, GanttFilterModel } from "../gantt.types";

/**
 * Chips dos filtros aplicados — a linha abaixo da toolbar.
 *
 * ## Isto é uma reprodução deliberada do `ToolbarApplied` do `TableToolbar`
 *
 * A anatomia do chip, os tokens e o comportamento vêm de lá, na ordem de lá:
 *
 *   [⊗ remover] [Nome do campo] [operador] [valor] [valor] …
 *
 * ⚠️ Três coisas que eu tinha escrito diferente e estavam ERRADAS, todas por eu
 * não ter lido o componente da tabela antes de inventar o meu:
 *
 * 1. **O `×` fica à ESQUERDA**, e é um `CircleX` — não um `X` nu à direita. À
 *    direita ele fica depois de um valor de largura variável, então o alvo
 *    "dança" de posição entre chips; à esquerda todos os alvos ficam alinhados
 *    numa coluna, que é o que permite limpar três filtros em três cliques sem
 *    reposicionar a mira.
 * 2. **A borda é TRACEJADA e neutra** (`border-dashed border-border-input`), não
 *    sólida em brand. Chip aplicado não precisa gritar: ele já é a prova de que
 *    algo está ligado. Sólido+brand fazia a linha competir com a grade, que é o
 *    conteúdo.
 * 3. **O operador aparece** ("é"). Sem ele o chip lê "Status Ativo", que é uma
 *    justaposição ambígua; com ele lê "Status é Ativo", que é a frase que o
 *    filtro de fato executa.
 *
 * ## Por que os valores são pílulas até 3 e contagem depois
 *
 * A tabela renderiza uma pílula por valor, sem limite. Aqui há limite de 3 —
 * porque o Gantt tem um eixo horizontal disputando a mesma largura, e um chip
 * com 8 nomes de pessoa empurra a grade pra baixo da dobra. Até 3 o usuário lê
 * exatamente O QUE está filtrado; acima disso a informação útil deixa de ser a
 * lista e passa a ser "quantos", com a lista a um clique no próprio chip.
 *
 * ⚠️ Minha primeira versão colapsava a partir de **2**, e era cedo demais: dois
 * valores é o caso mais comum de todos, e "2 selecionados" escondia justamente
 * a informação que caberia sem esforço.
 *
 * ## Clicar no chip abre as opções
 *
 * É o `renderChip` da tabela, que envolve o chip num `PopoverTrigger`. Aqui o
 * popover é embutido em vez de prop, porque o `Gantt` conhece os campos: um
 * `renderChip` externo obrigaria o consumidor a reimplementar a lista de opções
 * que o painel de filtro já sabe montar.
 *
 * ⛔ Nada é importado de `ui/TableToolbar/` — só a gramática. Cross-import entre
 * pastas de `ui/` gera `registryDependency` pendente e o `igreen:add` estreia
 * quebrado (L-049).
 */

/** Acima disso, os valores viram contagem. Ver a nota do topo. */
const MAX_VALORES_VISIVEIS = 3;

export type GanttAppliedFiltersProps = {
  fields: GanttFilterField[];
  model: GanttFilterModel;
  /** Todas as linhas — a contagem por opção é sobre elas, não sobre as filtradas. */
  counts: Record<string, Record<string, number>>;
  onToggleValue: (fieldId: string, value: string) => void;
  onClearField: (fieldId: string) => void;
  onClearAll: () => void;
  /**
   * Formata o ISO de um filtro `date` pro chip.
   *
   * Vem da raiz porque é lá que o `locale` mora — o chip não deve mostrar
   * "2026-09-01" a um usuário pt-BR, e formatar aqui na unha significaria uma
   * segunda decisão de formato de data no mesmo componente.
   */
  formatDate?: (iso: string) => string;
};

export function GanttAppliedFilters({
  fields,
  model,
  counts,
  onToggleValue,
  onClearField,
  onClearAll,
  formatDate,
}: GanttAppliedFiltersProps) {
  /**
   * Qual chip está com o popover aberto.
   *
   * Um id só, e não um `open` por chip: dois popovers de filtro abertos ao mesmo
   * tempo se sobrepõem e o segundo rouba o dismiss do primeiro.
   */
  const [aberto, setAberto] = useState<string | null>(null);

  const aplicados = fields.filter(
    (campo) => !campoVazio(campo.kind ?? "multi", model[campo.id]),
  );

  if (aplicados.length === 0) return null;

  return (
    <div className={ganttAppliedRow()}>
      {aplicados.map((campo) => {
        const kind = campo.kind ?? "multi";
        const marcados = model[campo.id] ?? [];
        /**
         * Operador e valores vêm do núcleo — os 6 tipos formatam diferente.
         *
         * "Duração entre 3 e 10" e "Início a partir de 01/09/26" não sairiam
         * de um `.filter(options)`: em `number`/`date` o par de limites não é
         * uma lista de opções marcadas, e o operador muda com QUAIS limites
         * estão preenchidos.
         */
        const operador = operadorDoCampo(kind, marcados);
        const rotulos = valoresDoChip(campo, marcados, formatDate);
        const colapsa = rotulos.length > MAX_VALORES_VISIVEIS;
        /** Só campo de opções tem lista pra ajustar no popover. */
        const editavel = kind === "multi" || kind === "single" || kind === "boolean";

        /*
          O chip é o MESMO nos 6 tipos; o que muda é ele abrir popover ou não.

          Em `text`/`number`/`date` não há lista pra ajustar — a edição é um
          input, e input dentro de popover ancorado num chip que muda de
          largura a cada tecla digitada reposiciona o próprio popover. Ali o
          chip é só leitura + `⊗`, e quem edita é o painel.
        */
        const conteudoDoChip = (
          <span
            role={editavel ? "button" : undefined}
            tabIndex={editavel ? 0 : undefined}
            aria-label={editavel ? `Editar filtro ${campo.label}` : undefined}
            className={ganttAppliedChip({ interactive: editavel })}
            onKeyDown={(e) => {
              // `<span role="button">` não dispara click no Enter/Space
              // sozinho — é o preço de o chip conter outro botão dentro
              // (`<button>` aninhado é HTML inválido e o React avisa).
              if (editavel && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                setAberto((a) => (a === campo.id ? null : campo.id));
              }
            }}
          >
            <button
              type="button"
              aria-label={`Remover filtro ${campo.label}`}
              className={ganttAppliedChipRemove()}
              onClick={(e) => {
                // `stopPropagation` senão o clique no `×` também abre o
                // popover do chip que ele acabou de remover.
                e.stopPropagation();
                onClearField(campo.id);
              }}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <CircleX strokeWidth={2} aria-hidden />
            </button>

            <span className={ganttAppliedChipName()}>{campo.label}</span>
            <span className={ganttAppliedChipOp()}>{operador}</span>

            {colapsa ? (
              <span className={ganttAppliedChipValue()}>
                {`${rotulos.length} selecionados`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-gp-2xs">
                {rotulos.map((r) => (
                  <span key={r} className={ganttAppliedChipValue()}>
                    {r}
                  </span>
                ))}
              </span>
            )}
          </span>
        );

        if (!editavel) {
          return <span key={campo.id}>{conteudoDoChip}</span>;
        }

        return (
          <Popover
            key={campo.id}
            open={aberto === campo.id}
            onOpenChange={(v) => setAberto(v ? campo.id : null)}
          >
            <PopoverTrigger asChild>{conteudoDoChip}</PopoverTrigger>

            {/*
              A lista completa do campo, com o que está marcado — não só os
              aplicados. Mostrar apenas os marcados faria o popover servir só
              pra desmarcar, e o gesto natural ao clicar num chip é AJUSTAR.
            */}
            <PopoverContent align="start" className="w-[260px] p-0">
              <div className="flex max-h-[320px] flex-col overflow-y-auto py-pad-sm">
                {(campo.options ?? []).map((opcao) => {
                  const id = `gantt-chip-${campo.id}-${opcao.value}`;
                  const n = counts[campo.id]?.[opcao.value] ?? 0;
                  return (
                    <label key={opcao.value} htmlFor={id} className={ganttFilterOption()}>
                      <Checkbox
                        id={id}
                        checked={marcados.includes(opcao.value)}
                        onCheckedChange={() => onToggleValue(campo.id, opcao.value)}
                        className={ganttFilterOptionBox({
                          colorKey: opcao.colorKey ?? "neutral",
                        })}
                      />
                      <span className={ganttFilterOptionLabel()}>{opcao.label}</span>
                      <span className={ganttFilterOptionCount()}>{n}</span>
                    </label>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}

      <button type="button" onClick={onClearAll} className={ganttClearLink()}>
        Limpar todos
      </button>
    </div>
  );
}
