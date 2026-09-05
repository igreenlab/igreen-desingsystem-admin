/**
 * Cronograma de projeto — a tela completa, extraída do showcase do DS (L-034).
 *
 * ## Cuidado ao adaptar
 *
 * **O que ligar ao seu estado:** `rows` e `links` são estado DESTA tela, e é
 * de propósito. O `Gantt` é *dumb* sobre mutação: arrastar emite `onBarMove`,
 * vínculo violado emite `onLinkViolations` — **nada se move sozinho**. Troque
 * os `useState` por dados do servidor e mantenha os handlers aplicando; se
 * você ligar `draggable`/`resizable` sem handler que aplique, o usuário
 * arrasta e vê a barra **voltar**.
 *
 * **O que trocar primeiro:** `_gantt-data.tsx` — linhas, vínculos, colunas e
 * filtros. O resto da tela não muda.
 *
 * **O que remover se não servir:** o `FloatingPanel` de detalhe e o drawer de
 * nova tarefa são **da tela**, não do componente. O `Gantt` só emite
 * `onBarClick` e `onDayAdd` e devolve o payload intacto — quem decide que
 * campos existem é você.
 *
 * **O que NÃO mexer:** a divisão entre `colorKey` (categoria — qual frente) e
 * `row.trailing` (status, como `Chip`). Cor por status quebra a leitura que o
 * componente foi desenhado pra dar.
 *
 * ⚠️ **O pai precisa ter ALTURA.** O componente é `h-full`; sem altura no pai
 * você vê só a toolbar.
 *
 * ⚠️ Se os dados vêm do servidor, passe **`loading`**. Sem ele, `rows={[]}`
 * durante o fetch afirma "Nenhuma tarefa neste período" — o componente não tem
 * como saber que isso é verdade.
 */

import { useMemo, useState } from "react";
import { ptBR } from "date-fns/locale";
import { addDays, format, startOfDay } from "date-fns";
import { Plus } from "lucide-react";
import { Gantt, ganttDaySegment } from "@/components/ui/Gantt";
import type {
  GanttBarChange,
  GanttColorKey,
  GanttColumn,
  GanttFilterField,
  GanttLink,
  GanttLinkViolation,
  GanttRow,
} from "@/components/ui/Gantt";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Avatar } from "@/components/ui/avatar-ig";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
} from "@/components/ui/FormField";
import {
  COLUNAS,
  CORES_DISPONIVEIS,
  FILTROS,
  LINKS_SEMENTE,
  PESSOAS,
  ROWS_SEMENTE,
  hoje,
  iniciais,
  type Meta,
} from "./_gantt-data";

export function GanttScreen() {

  /**
   * ⚠️ As linhas e os vínculos são ESTADO DA TELA, e isso é o ponto do exemplo.
   *
   * O `Gantt` é dumb sobre mutação: arrastar emite `onBarMove`, e quem reescreve
   * as datas é o consumidor. Um exemplo com `rows` constante ligaria
   * `draggable` e o usuário arrastaria pra ver a barra **voltar** — que é
   * exatamente o que o JSDoc de `draggable` avisa que acontece sem handler.
   *
   * Aqui a tela aplica de verdade, e é por isso que o gesto pode ser verificado.
   */
  const [rows, setRows] = useState<GanttRow[]>(ROWS_SEMENTE);

  /**
   * O drawer de "nova tarefa" — e ele é DA TELA, não do componente.
   *
   * O `Gantt` emite `onDayAdd(dia)` e para aí. Quem decide que campos existem,
   * que cores são oferecidas e o que acontece no salvar é o consumidor — mesma
   * divisão do painel de detalhe (`onBarClick` devolve o payload e a tela
   * desenha a ficha).
   *
   * ⚠️ A versão anterior criava a tarefa DIRETO no clique do "+", com nome e
   * cor chutados. Estava errado por dois motivos: o usuário não escolhia nada, e
   * o exemplo ensinava que `onDayAdd` é "adicione isto" quando ele é "o usuário
   * pediu pra adicionar aqui".
   */
  const [novo, setNovo] = useState<{
    dia: Date;
    nome: string;
    dias: string;
    cor: string;
    responsavel: string;
    frente: string;
    descricao: string;
  } | null>(null);

  /**
   * Abre o drawer num dia — DUAS portas, um formulário só.
   *
   * O "+" da célula sabe o dia (o usuário apontou pra ele); o "Nova tarefa" da
   * toolbar não sabe, e abre em `hoje`. Por isso a data virou CAMPO em vez de
   * ficar só no subtítulo: sem ela, a porta da toolbar criaria tudo no mesmo dia
   * sem o usuário poder corrigir.
   */
  const abrirNovaTarefa = (dia: Date) =>
    setNovo({
      dia,
      nome: "",
      dias: "3",
      cor: "chart-2",
      responsavel: "ana",
      frente: "integração",
      descricao: "",
    });
  const [links, setLinks] = useState<GanttLink[]>(LINKS_SEMENTE);

  /**
   * Duração, fim e estilo da prévia — derivados do formulário.
   *
   * `fim` usa `duracao - 1` porque `end` é INCLUSIVO no `Gantt`: 3 dias a
   * partir do dia 10 terminam no 12, não no 13. É a mesma conta do salvar, e
   * está aqui pra ser UMA — se o subtítulo dissesse um fim e o salvar gravasse
   * outro, o usuário só descobriria depois de criar (L-038).
   */
  const duracaoNova = Math.max(1, Number(novo?.dias) || 1);
  const fimNovo = novo ? addDays(novo.dia, duracaoNova - 1) : null;
  const previaDoSegmento = ganttDaySegment({
    colorKey: (novo?.cor ?? "chart-1") as GanttColorKey,
  });

  /** Reescreve as datas de UMA barra, preservando o resto da linha. */
  const aplicarMudanca = ({ bar, start, end }: GanttBarChange) =>
    setRows((atuais) =>
      atuais.map((r) =>
        r.bars.some((b) => b.id === bar.id)
          ? {
              ...r,
              bars: r.bars.map((b) =>
                b.id === bar.id ? { ...b, start, end } : b,
              ),
            }
          : r,
      ),
    );
  const [detalhe, setDetalhe] = useState<{
    titulo: string;
    meta: Meta;
    inicio: Date;
    fim: Date;
  } | null>(null);
  const [violacoes, setViolacoes] = useState<GanttLinkViolation[]>([]);

  const rodape = useMemo(() => {
    if (violacoes.length === 0) return null;
    const total = violacoes.reduce((s, v) => s + v.deficitDays, 0);
    return `${violacoes.length} vínculo(s) em conflito · ${total} dia(s) de déficit`;
  }, [violacoes]);

  return (
    <div className="flex h-full min-h-0 flex-col gap-gp-2xl">
      {/*
        `PageHeader` e não um `<h1>` na unha — é o que `mapa-rede`, `finance` e
        `order-detail` usam, e título de tela é decisão do DS, não de cada
        exemplo. O contador de conflito entra como `badge` porque ele qualifica
        a tela inteira; `Recolher`/`Expandir` são `actions` porque operam nela.
      */}
      <PageHeader
        title="Implantação do portal de operação"
        description="20 linhas · 4 níveis · 16 vínculos dos 4 tipos · 2 conflitos de prazo. Arraste uma barra pra ver o conflito e o caminho crítico recalcularem no mesmo gesto."
        badge={
          rodape ? (
            <Chip size="sm" variant="soft" color="danger" shape="rounded">
              {rodape}
            </Chip>
          ) : undefined
        }
      />

      {/*
        `min-h-0` no wrapper é o que faz o Gantt receber a altura restante em vez
        de estourar a página. Sem isso, `h-full` num filho de flex-col resolve
        contra `auto` e o componente cresce indefinidamente.
      */}
      <div className="flex min-h-0 flex-1 flex-col">
        <Gantt
          rows={rows}
          links={links}
          draggable
          resizable
          linkable
          onBarMove={aplicarMudanca}
          onBarResize={aplicarMudanca}
          onLinkCreate={(novo) =>
            setLinks((atuais) => [
              ...atuais,
              // O id é do CONSUMIDOR — o componente emite a intenção sem id
              // justamente porque não sabe como você os gera.
              { ...novo, id: `l-${novo.source}-${novo.target}-${atuais.length}` },
            ])
          }
          /*
            O "+" da célula do calendário ABRE O DRAWER — não cria nada.

            Sem handler o "+" nem renderiza; com ele, o componente diz "o
            usuário pediu pra adicionar no dia X" e a tela decide o resto.
          */
          onDayAdd={abrirNovaTarefa}
          onLinkDelete={(alvo) =>
            setLinks((atuais) => atuais.filter((l) => l.id !== alvo.id))
          }
          columns={COLUNAS}
          filterFields={FILTROS}
          searchable
          criticalPath
          criticalPathToggle={false}
          locale={ptBR}
          now={hoje}
          gridWidth={460}
          onLinkViolations={setViolacoes}
          onGraphError={({ barIds }) =>
            window.alert(`Ciclo no grafo: ${barIds.join(", ")}`)
          }
          onBarClick={(bar, row) => {
            const meta = bar.meta as Meta | undefined;
            if (!meta) return;
            setDetalhe({
              titulo: typeof row.label === "string" ? row.label : bar.id,
              meta,
              inicio: bar.start,
              fim: bar.end,
            });
          }}
          /*
            A ação primária abre o MESMO drawer do "+" da grade de mês.

            Duas portas pra criar tarefa com dois formulários diferentes é o
            defeito clássico de tela de cadastro: o usuário aprende um e
            encontra o outro. A única diferença entre as portas é o dia em que
            o formulário abre — e o dia é campo, então dá pra mudar nas duas.
          */
          primaryAction={
            <Button
              variant="filled"
              size="md"
              iconLeft={<Plus />}
              onClick={() => abrirNovaTarefa(hoje)}
            >
              Nova tarefa
            </Button>
          }
        />
      </div>

      {/*
        O painel de detalhe é da TELA, não do componente — o `Gantt` só emite
        `onBarClick` e devolve `bar.meta` intacto. Mesma divisão do `Scheduler`.
      */}
      <FloatingPanel
        open={detalhe !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setDetalhe(null);
        }}
        side="right"
        size="md"
        title={detalhe?.titulo ?? ""}
        description={
          detalhe
            ? `${format(detalhe.inicio, "dd/MM/yyyy", { locale: ptBR })} → ${format(detalhe.fim, "dd/MM/yyyy", { locale: ptBR })}`
            : undefined
        }
      >
        {detalhe ? (
          <div className="flex flex-col gap-gp-2xl">
            <div className="flex flex-col gap-gp-sm">
              <span className="text-caption-md font-semibold uppercase text-fg-subtle">
                Responsável
              </span>
              <div className="flex items-center gap-gp-md">
                <Avatar
                  size="sm"
                  color="brand"
                  aria-label={PESSOAS[detalhe.meta.responsavel]}
                >
                  {iniciais(PESSOAS[detalhe.meta.responsavel])}
                </Avatar>
                <span className="text-body-sm text-fg-default">
                  {PESSOAS[detalhe.meta.responsavel]}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-gp-sm">
              <span className="text-caption-md font-semibold uppercase text-fg-subtle">
                Frente
              </span>
              <span className="text-body-sm text-fg-default">
                {detalhe.meta.frente}
              </span>
            </div>

            <div className="flex flex-col gap-gp-sm">
              <span className="text-caption-md font-semibold uppercase text-fg-subtle">
                Descrição
              </span>
              <p className="text-body-sm leading-relaxed text-fg-muted">
                {detalhe.meta.descricao}
              </p>
            </div>
          </div>
        ) : null}
      </FloatingPanel>

      {/*
        Drawer de nova tarefa. `FormFieldInput`/`FormFieldSelect` do DS e não
        `<label>` + `<input>` na unha — L-023: label solta divergia em peso e em
        cor no dark, silenciosamente.
      */}
      <FloatingPanel
        open={novo !== null}
        onOpenChange={(aberto) => {
          if (!aberto) setNovo(null);
        }}
        side="right"
        size="md"
        title="Nova tarefa"
        /*
          O subtítulo diz o PERÍODO, não só o começo: o campo de duração está
          logo abaixo e o usuário mexe nele: ver o fim se mover é o retorno
          imediato de que a conta é inclusiva.
        */
        description={
          novo && fimNovo
            ? `${format(novo.dia, "dd 'de' MMM", { locale: ptBR })} → ${format(
                fimNovo,
                "dd 'de' MMM 'de' yyyy",
                { locale: ptBR },
              )} · ${duracaoNova} ${duracaoNova === 1 ? "dia" : "dias"}`
            : undefined
        }
        footer={
          <div className="flex w-full items-center justify-end gap-gp-md">
            <Button variant="ghost" color="secondary" size="md" onClick={() => setNovo(null)}>
              Cancelar
            </Button>
            <Button
              variant="filled"
              size="md"
              // Nome vazio não cria: o rótulo é a única coisa que a linha
              // mostra na grade, e uma tarefa sem nome é uma linha em branco.
              disabled={!novo?.nome.trim()}
              onClick={() => {
                if (!novo?.nome.trim() || !fimNovo) return;
                const id = `nova-${novo.dia.getTime()}`;
                setRows((atuais) => [
                  ...atuais,
                  {
                    id,
                    label: novo.nome.trim(),
                    sublabel: PESSOAS[novo.responsavel],
                    parent: "f3",
                    bars: [
                      {
                        id: `${id}-b`,
                        label: novo.nome.trim(),
                        start: novo.dia,
                        end: fimNovo,
                        colorKey: novo.cor as GanttRow["bars"][number]["colorKey"],
                        meta: {
                          responsavel: novo.responsavel,
                          frente: novo.frente,
                          // A descrição digitada alimenta o painel de detalhe,
                          // que já a renderiza — sem ela o campo seria enfeite.
                          descricao:
                            novo.descricao.trim() ||
                            `Sem descrição · ${duracaoNova} dia(s).`,
                        } satisfies Meta,
                      },
                    ],
                  },
                ]);
                setNovo(null);
              }}
            >
              Criar tarefa
            </Button>
          </div>
        }
      >
        {novo ? (
          <div className="flex flex-col gap-form-gap">
            <FormFieldInput
              label="Nome da tarefa"
              placeholder="Ex.: Revisar contrato de integração"
              value={novo.nome}
              onChange={(e) => setNovo({ ...novo, nome: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-form-gap">
              {/*
                A data é CAMPO porque o drawer tem duas portas: o "+" da grade
                sabe o dia, o "Nova tarefa" da toolbar não.

                ⚠️ `value` e `onChange` passam por `yyyy-MM-dd`, e o parse é na
                mão: `new Date("2026-09-30")` é lido como UTC e volta um dia em
                UTC−3 — o mesmo defeito que o filtro de período já teve aqui.
                `new Date(a, m - 1, d)` é meia-noite LOCAL.
              */}
              <FormFieldInput
                label="Início"
                type="date"
                value={format(novo.dia, "yyyy-MM-dd")}
                onChange={(e) => {
                  const [a, m, d] = e.target.value.split("-").map(Number);
                  if (!a || !m || !d) return;
                  setNovo({ ...novo, dia: new Date(a, m - 1, d) });
                }}
              />
              <FormFieldInput
                label="Duração (dias)"
                type="number"
                min={1}
                value={novo.dias}
                onChange={(e) => setNovo({ ...novo, dias: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-form-gap">
              <FormFieldSelect
                label="Frente (cor)"
                options={CORES_DISPONIVEIS.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
                value={novo.cor}
                onValueChange={(v) =>
                  setNovo({
                    ...novo,
                    cor: v,
                    // A frente do filtro acompanha a cor escolhida: as duas
                    // dizem a mesma coisa, e deixá-las divergir faria a tarefa
                    // nova sumir ao filtrar pela frente que ela aparenta ser.
                    frente:
                      CORES_DISPONIVEIS.find((c) => c.value === v)?.label.toLowerCase() ??
                      novo.frente,
                  })
                }
              />
              <FormFieldSelect
                label="Responsável"
                options={Object.entries(PESSOAS).map(([value, label]) => ({
                  value,
                  label,
                }))}
                value={novo.responsavel}
                onValueChange={(v) => setNovo({ ...novo, responsavel: v })}
              />
            </div>

            <FormFieldTextarea
              label="Descrição"
              placeholder="O que precisa acontecer, e o que trava se não acontecer"
              rows={3}
              helperText="Aparece no painel de detalhe, ao clicar na tarefa."
              value={novo.descricao}
              onChange={(e) => setNovo({ ...novo, descricao: e.target.value })}
            />

            {/*
              A prévia é o SEGMENTO REAL da grade de mês.

              `ganttDaySegment` é o mesmo `tv()` que a visão `calendar` usa pra
              desenhar a pílula — mesmo ponto de cor, mesmo tingimento do
              `colorKey`, mesma altura de 18px. Antes aqui havia um `Chip`
              neutro com o NOME da frente escrito dentro: não tinha a cor que a
              escolha produz e não tinha a forma que a grade mostra, então
              prometia uma coisa e entregava outra.

              Desenhar a pílula na mão daria o mesmo defeito com um passo a
              mais: duas definições da mesma coisa, divergindo na primeira vez
              que uma das duas mudasse.

              O `relative w-full` neutraliza o `absolute` do slot — na grade ele
              é posicionado por `left`/`top` dentro da semana; aqui, não.
            */}
            <div className="flex flex-col gap-gp-md">
              <span className="text-caption-md font-semibold uppercase text-fg-subtle">
                Prévia na grade de mês
              </span>
              <div className="rounded-radius-lg border border-border-default bg-bg-surface p-pad-xl">
                <div className={previaDoSegmento.root({ class: "relative w-full" })}>
                  <span className={previaDoSegmento.dot()} aria-hidden />
                  <span className={previaDoSegmento.label()}>
                    {novo.nome.trim() || "Nova tarefa"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </FloatingPanel>
    </div>
  );
}
