import { forwardRef } from "react";
import { CirclePlus, CircleX } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  filterChip,
  filterChipName,
  filterChipOp,
  filterChipRemove,
  filterChipValue,
} from "./filter-chip.styles";
import type { FilterChipProps } from "./filter-chip.types";

/**
 * `<FilterChip>` — o chip de filtro APLICADO, em um lugar só.
 *
 * ## Anatomia (a ordem é a regra, não preferência)
 *
 * ```
 * [⊗ remover] [Nome do campo] [operador] [valor] [valor] …
 * ```
 *
 * O `⊗` fica à **esquerda** porque à direita ele vem depois de um valor de
 * largura variável e "dança" de posição entre chips; à esquerda todos os alvos
 * ficam numa coluna, e limpar três filtros são três cliques sem reposicionar a
 * mira. O operador aparece porque "Status Ativo" é justaposição ambígua e
 * "Status é Ativo" é a frase que o filtro executa.
 *
 * ## Por que o componente existe, e não só os `tv()`
 *
 * Compartilhar apenas os estilos deixaria a anatomia livre — e foi exatamente
 * aí que as três cópias divergiram: o `Scheduler` tinha o `×` à direita (com o
 * padding invertido pra acompanhar) e nenhum operador. Travar a ordem no
 * componente é o que impede a próxima divergência.
 *
 * ## `forwardRef` é obrigatório aqui (L-021)
 *
 * `DataTable`, `DataList` e `Gantt` envolvem o chip num `<PopoverTrigger asChild>`.
 * Sem `forwardRef` o Radix não obtém o nó DOM e o popover ancora fora do
 * viewport. O `...rest` precisa chegar ao `<span>` pelo mesmo motivo — é por
 * ele que vêm `onClick`, `aria-expanded` e `data-state` do trigger.
 */
export const FilterChip = forwardRef<HTMLSpanElement, FilterChipProps>(
  function FilterChip(
    {
      name,
      op,
      opClassName,
      values = [],
      active = false,
      interactive = false,
      removable = true,
      onRemove,
      removeLabel = "Remover filtro",
      className,
      ...rest
    },
    ref,
  ) {
    return (
      <span
        ref={ref}
        className={cn(filterChip({ interactive, active }), className)}
        {...rest}
      >
        {removable === false ? (
          <span
            aria-hidden="true"
            className={cn(filterChipRemove(), "cursor-[inherit]")}
          >
            <CirclePlus strokeWidth={2} />
          </span>
        ) : (
          <button
            type="button"
            aria-label={removeLabel}
            className={filterChipRemove()}
            onClick={(e) => {
              // Sem isto o clique no `⊗` também dispara o clique do chip — que
              // abriria o popover do filtro que ele acabou de remover.
              e.stopPropagation();
              onRemove?.();
            }}
            // O chip pode ter `onKeyDown` próprio (Enter/Espaço abre as opções).
            // `<span role="button">` não dispara click sozinho no teclado, então
            // quem escuta é o chip — e o Enter no `⊗` não pode chegar lá.
            onKeyDown={(e) => e.stopPropagation()}
          >
            <CircleX strokeWidth={2} aria-hidden="true" />
          </button>
        )}

        <span className={filterChipName()}>{name}</span>

        {op != null && (
          <span className={cn(filterChipOp(), opClassName)}>{op}</span>
        )}

        {/* Um valor sai sem wrapper; dois ou mais ganham a fileira com
            `gap-gp-2xs`. Wrapper pra um só não muda pixel e acrescenta nó. */}
        {values.length === 1 ? (
          <span className={filterChipValue({ active })}>{values[0]}</span>
        ) : values.length > 1 ? (
          <span className="inline-flex items-center gap-gp-2xs">
            {values.map((v) => (
              <span key={String(v)} className={filterChipValue({ active })}>
                {v}
              </span>
            ))}
          </span>
        ) : null}
      </span>
    );
  },
);
