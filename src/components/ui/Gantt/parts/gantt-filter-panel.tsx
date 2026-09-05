import { useMemo, useState } from "react";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { Checkbox } from "@/components/shadcn/checkbox";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/shadcn/radio-group";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import { Button } from "@/components/ui/Button";
import {
  ganttFilterEmpty,
  ganttFilterInput,
  ganttFilterRange,
  ganttFilterRangeSep,
  ganttFilterGroup,
  ganttFilterGroupActions,
  ganttFilterGroupChevron,
  ganttFilterGroupHead,
  ganttFilterGroupTitle,
  ganttFilterOption,
  ganttFilterOptionBox,
  ganttFilterOptionCount,
  ganttFilterOptionLabel,
  ganttFilterSearch,
  ganttFilterSearchInput,
} from "../gantt.styles";
import type { GanttFilterField, GanttFilterModel } from "../gantt.types";

/**
 * Painel de filtro do `Gantt`.
 *
 * ## Painel e não dropdown
 *
 * Um cronograma real filtra por frente, responsável, status, prioridade e tag —
 * cinco grupos com muitas opções. Dropdown com 40 linhas rola dentro de uma
 * caixa de 240px e fecha ao clicar fora sem querer. `FloatingPanel side="right"`
 * é o mesmo veículo do filtro do `DataTable`.
 *
 * ## Cada campo é uma CATEGORIA colapsável
 *
 * Mesma anatomia do `SchedulerFilterPanel`: cabeçalho clicável com chevron e
 * contagem, conteúdo que recolhe. Abertos por default — colapsar tudo economiza
 * altura mas esconde justamente o que o painel existe pra mostrar; quem tem
 * muitos campos fecha os que não usa.
 *
 * ## Busca por grupo, a partir de 7 opções
 *
 * ⚠️ O limiar existe porque busca em lista de 4 itens é ruído: o campo ocupa a
 * altura de uma opção e meia pra filtrar algo que já cabe inteiro na tela. A
 * partir de 7 a lista começa a exigir rolagem dentro do grupo, e aí procurar
 * ganha da varredura visual.
 *
 * O consumidor pode forçar com `searchable` no campo, pro caso em que ele sabe
 * que a lista cresce em produção mesmo tendo poucas opções no mock.
 *
 * ## `Checkbox` do DS, não caixa desenhada
 *
 * A cor da opção entra na borda e no fundo do estado marcado via `className`,
 * mantendo o `Checkbox` real por baixo — com o anel de foco do DS, os
 * `data-state` do Radix e o indeterminate. É o mesmo recurso do
 * `schedulerOptionBox`, e a razão de o `Checkbox` aceitar `className`.
 *
 * ## Aplicação LIVE
 *
 * Não tem "Aplicar": cada marcação atualiza `filterModel` na hora, e a grade
 * filtra enquanto você edita. É o que justifica ser painel e não modal — dá pra
 * ver o resultado sem fechar.
 */

/** A partir de quantas opções o grupo ganha campo de busca. */
const LIMIAR_DE_BUSCA = 7;

export type GanttFilterPanelProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fields: GanttFilterField[];
  model: GanttFilterModel;
  onToggleValue: (fieldId: string, value: string) => void;
  /** Marca ou desmarca o grupo inteiro de uma vez. */
  onSetFieldValues: (fieldId: string, values: string[]) => void;
  onClearAll: () => void;
  appliedCount: number;
  /** Contagem por opção — vem das linhas ANTES do filtro daquele campo. */
  counts?: Record<string, Record<string, number>>;
};

export function GanttFilterPanel({
  open,
  onOpenChange,
  fields,
  model,
  onToggleValue,
  onSetFieldValues,
  onClearAll,
  appliedCount,
  counts,
}: GanttFilterPanelProps) {
  const [recolhidos, setRecolhidos] = useState<Set<string>>(() => new Set());
  const [buscas, setBuscas] = useState<Record<string, string>>({});

  const alternarGrupo = (id: string) =>
    setRecolhidos((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });

  return (
    <FloatingPanel
      open={open}
      onOpenChange={onOpenChange}
      side="right"
      /*
        `md` (400px) e não `sm` (320): os grupos aqui carregam rótulo + contagem
        por opção + checkbox + o cabeçalho colapsável com "Selecionar todas". Em
        320px um nome como "Fluxos e arquitetura de informação" truncava, e
        truncar a opção de um filtro derrota o filtro — o usuário não sabe o que
        está marcando.
      */
      size="md"
      title="Filtros"
      titleIcon={SlidersHorizontal}
      description={
        appliedCount === 1 ? "1 filtro ativo" : `${appliedCount} filtros ativos`
      }
      bodyPadded={false}
      footer={
        <Button
          variant="ghost"
          color="secondary"
          size="sm"
          onClick={onClearAll}
          disabled={appliedCount === 0}
        >
          Limpar tudo
        </Button>
      }
    >
      <div className="flex flex-col">
        {fields.map((campo) => (
          <GrupoDeFiltro
            key={campo.id}
            campo={campo}
            marcadas={model[campo.id] ?? []}
            aberto={!recolhidos.has(campo.id)}
            busca={buscas[campo.id] ?? ""}
            contagens={counts?.[campo.id]}
            onAlternarGrupo={() => alternarGrupo(campo.id)}
            onBuscaChange={(v) =>
              setBuscas((prev) => ({ ...prev, [campo.id]: v }))
            }
            onToggleValue={(v) => onToggleValue(campo.id, v)}
            onSetValues={(vs) => onSetFieldValues(campo.id, vs)}
          />
        ))}
      </div>
    </FloatingPanel>
  );
}

/* ══════════════════════════════════════════════════════ grupo ══ */

type GrupoProps = {
  campo: GanttFilterField;
  marcadas: string[];
  aberto: boolean;
  busca: string;
  contagens?: Record<string, number>;
  onAlternarGrupo: () => void;
  onBuscaChange: (v: string) => void;
  onToggleValue: (v: string) => void;
  onSetValues: (vs: string[]) => void;
};

function GrupoDeFiltro({
  campo,
  marcadas,
  aberto,
  busca,
  contagens,
  onAlternarGrupo,
  onBuscaChange,
  onToggleValue,
  onSetValues,
}: GrupoProps) {
  const kind = campo.kind ?? "multi";
  /** Só campo de opções tem lista, busca e "selecionar todas". */
  const temLista = kind === "multi" || kind === "single";
  const opcoes = campo.options ?? [];
  const temBusca =
    temLista && (campo.searchable ?? opcoes.length >= LIMIAR_DE_BUSCA);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return opcoes;
    return opcoes.filter((o) => o.label.toLowerCase().includes(termo));
  }, [opcoes, busca]);

  /**
   * "Todas" opera sobre as opções VISÍVEIS, não sobre todas do campo.
   *
   * Com busca ativa, marcar tudo tem que significar "tudo que estou vendo" — se
   * marcasse as 40 do campo, o usuário que filtrou por "Bru" acabaria com 40
   * marcadas e nenhuma pista do porquê.
   */
  const idsVisiveis = visiveis.map((o) => o.value);
  const todasVisiveisMarcadas =
    idsVisiveis.length > 0 && idsVisiveis.every((v) => marcadas.includes(v));

  return (
    <div className={ganttFilterGroup()}>
      <button
        type="button"
        aria-expanded={aberto}
        onClick={onAlternarGrupo}
        className={ganttFilterGroupHead()}
      >
        <span className={ganttFilterGroupTitle()}>
          <span className="truncate">{campo.label}</span>
          {/*
            "Todas" quando nada está marcado — deixa explícito que o estado é
            "sem filtro", e não "perdi a seleção". Mesma convenção do painel do
            `Scheduler`, e a razão é a mesma: campo sem opção marcada significa
            SEM restrição, não "esconde tudo".
          */}
          {/*
            O resumo do cabeçalho depende do tipo. "Todas" só faz sentido onde
            há opções: num campo de texto, "Todas" descreveria um estado que
            não existe (não há um conjunto do qual todas estejam incluídas).
          */}
          <span className={ganttFilterOptionCount()}>
            {temLista
              ? marcadas.length === 0
                ? "Todas"
                : marcadas.length
              : marcadas.some((v) => v.trim() !== "")
                ? "1"
                : "—"}
          </span>
        </span>
        <ChevronDown
          className={ganttFilterGroupChevron({ open: aberto })}
          aria-hidden
        />
      </button>

      {aberto ? (
        <>
          {/*
            ── Campos de VALOR: text · number · date ────────────────────────

            Não têm lista, busca nem "selecionar todas" — têm 1 ou 2 inputs.
            O valor vive no MESMO `string[]` do modelo (ver `hooks/filters.ts`),
            então "Limpar" e o chip continuam funcionando sem caso especial.
          */}
          {kind === "text" ? (
            <div className={ganttFilterRange()}>
              <input
                type="text"
                value={marcadas[0] ?? ""}
                onChange={(e) => onSetValues(e.target.value ? [e.target.value] : [])}
                placeholder={campo.placeholder ?? `Contém…`}
                aria-label={campo.label}
                className={ganttFilterInput()}
              />
            </div>
          ) : null}

          {kind === "number" || kind === "date" ? (
            <div className={ganttFilterRange()}>
              {/*
                Os dois limites são independentes e um pode ficar vazio — daí
                o par sempre ser escrito por inteiro (`[novo, atual]`) em vez
                de um `push`: um array de tamanho 1 significaria "só min" e o
                núcleo leria a posição errada.
              */}
              <input
                type={kind === "date" ? "date" : "number"}
                value={marcadas[0] ?? ""}
                onChange={(e) => onSetValues([e.target.value, marcadas[1] ?? ""])}
                placeholder={kind === "date" ? undefined : "mín"}
                aria-label={`${campo.label} — de`}
                className={ganttFilterInput()}
              />
              <span className={ganttFilterRangeSep()}>e</span>
              <input
                type={kind === "date" ? "date" : "number"}
                value={marcadas[1] ?? ""}
                onChange={(e) => onSetValues([marcadas[0] ?? "", e.target.value])}
                placeholder={kind === "date" ? undefined : "máx"}
                aria-label={`${campo.label} — até`}
                className={ganttFilterInput()}
              />
            </div>
          ) : null}

          {/*
            ── boolean ─────────────────────────────────────────────────────

            Radio e não checkbox: os dois estados são MUTUAMENTE exclusivos, e
            dois checkboxes marcados significariam "sim e não", que não filtra
            nada. Sem opção marcada = sem filtro, como nos outros tipos.
          */}
          {kind === "boolean" ? (
            <RadioGroup
              value={marcadas[0] ?? ""}
              onValueChange={(v) => onSetValues(v ? [v] : [])}
              className="flex flex-col gap-0"
            >
              {(campo.options ?? [
                { value: "true", label: "Sim" },
                { value: "false", label: "Não" },
              ]).map((opt) => {
                const id = `gantt-filtro-${campo.id}-${opt.value}`;
                return (
                  <label key={opt.value} htmlFor={id} className={ganttFilterOption()}>
                    <RadioGroupItem id={id} value={opt.value} className="shrink-0" />
                    <span className={ganttFilterOptionLabel()}>{opt.label}</span>
                    {contagens?.[opt.value] !== undefined ? (
                      <span className={ganttFilterOptionCount()}>
                        {contagens[opt.value]}
                      </span>
                    ) : null}
                  </label>
                );
              })}
            </RadioGroup>
          ) : null}

          {temBusca ? (
            <label className={ganttFilterSearch()}>
              <Search aria-hidden />
              <input
                type="search"
                value={busca}
                onChange={(e) => onBuscaChange(e.target.value)}
                placeholder={`Buscar em ${campo.label.toLowerCase()}…`}
                aria-label={`Buscar em ${campo.label}`}
                className={ganttFilterSearchInput()}
              />
            </label>
          ) : null}

          {/*
            "Selecionar todas" só em `multi`. Em `single` marcar todas é
            contraditório; nos campos de valor não há conjunto.
          */}
          {kind === "multi" ? (
          <div className={ganttFilterGroupActions()}>
            <button
              type="button"
              onClick={() =>
                onSetValues(
                  todasVisiveisMarcadas
                    ? marcadas.filter((v) => !idsVisiveis.includes(v))
                    : [...new Set([...marcadas, ...idsVisiveis])],
                )
              }
              disabled={idsVisiveis.length === 0}
            >
              {todasVisiveisMarcadas ? "Desmarcar todas" : "Selecionar todas"}
            </button>
            {marcadas.length > 0 ? (
              <button type="button" onClick={() => onSetValues([])}>
                Limpar
              </button>
            ) : null}
          </div>
          ) : null}

          {/*
            `single` também precisa de saída, e ela não pode ser "Selecionar
            todas": é só o "Limpar".
          */}
          {kind !== "multi" && marcadas.some((v) => v.trim() !== "") ? (
            <div className={ganttFilterGroupActions()}>
              <button type="button" onClick={() => onSetValues([])}>
                Limpar
              </button>
            </div>
          ) : null}

          {!temLista ? null : visiveis.length === 0 ? (
            <p className={ganttFilterEmpty()}>Nada encontrado.</p>
          ) : (
            <div className="flex flex-col">
              {kind === "single" ? (
                /*
                  `single` = radio. Mesma anatomia de linha do `multi` (label
                  nativo embrulhando o controle real — L-025), com o controle
                  que expressa exclusividade.
                */
                <RadioGroup
                  value={marcadas[0] ?? ""}
                  onValueChange={(v) => onSetValues(v ? [v] : [])}
                  className="flex flex-col gap-0"
                >
                  {visiveis.map((opt) => {
                    const id = `gantt-filtro-${campo.id}-${opt.value}`;
                    const n = contagens?.[opt.value];
                    return (
                      <label key={opt.value} htmlFor={id} className={ganttFilterOption()}>
                        <RadioGroupItem id={id} value={opt.value} className="shrink-0" />
                        <span className={ganttFilterOptionLabel()}>{opt.label}</span>
                        {n !== undefined ? (
                          <span className={ganttFilterOptionCount()}>{n}</span>
                        ) : null}
                      </label>
                    );
                  })}
                </RadioGroup>
              ) : null}
              {kind === "multi" ? visiveis.map((opt) => {
                const id = `gantt-filtro-${campo.id}-${opt.value}`;
                const marcada = marcadas.includes(opt.value);
                const n = contagens?.[opt.value];

                return (
                  /*
                    `<label htmlFor>` nativo embrulhando o `Checkbox` — L-025.
                    Com `<button onClick>` o leitor de tela anuncia "button" em
                    vez de "checkbox", e o clique no rótulo não propaga pro
                    controle real.
                  */
                  <label key={opt.value} htmlFor={id} className={ganttFilterOption()}>
                    <Checkbox
                      id={id}
                      checked={marcada}
                      onCheckedChange={() => onToggleValue(opt.value)}
                      className={ganttFilterOptionBox({
                        colorKey: opt.colorKey ?? "neutral",
                      })}
                    />
                    <span className={ganttFilterOptionLabel()}>{opt.label}</span>
                    {n !== undefined ? (
                      <span className={ganttFilterOptionCount()}>{n}</span>
                    ) : null}
                  </label>
                );
              }) : null}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
