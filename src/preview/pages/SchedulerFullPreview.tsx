import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { addDays, format, startOfDay, startOfMonth } from "date-fns";
import { Plus } from "lucide-react";
import { Scheduler } from "@/components/ui/Scheduler";
import type {
  SchedulerEvent,
  SchedulerEventColor,
  SchedulerFilterField,
} from "@/components/ui/Scheduler";
import { Button } from "@/components/ui/Button";
import { ExamplePageLayout } from "../components/example-page-layout";
import { SchedulerEventDetail } from "./scheduler-event-detail";

/**
 * Exemplo de TELA CHEIA — o `Scheduler` como página do app, não como demo
 * dentro de um card de documentação.
 *
 * É a mesma diferença que separa `KanbanDoc` de `ClientsKanbanPreview`: aqui o
 * componente recebe a altura real da janela, e é isso que muda o comportamento
 * que interessa — **a célula do mês passa a caber mais eventos**.
 *
 * O corte do "+N mais" é DERIVADO da altura medida da linha, não de uma
 * constante. Num card de 720px a linha tem ~110px e cabem ~3 pills; aqui, com a
 * janela inteira, ela passa de 150px e cabem 6 ou mais. É o mesmo componente,
 * sem prop de densidade — quem decide é o espaço disponível, exatamente como a
 * tabela faz com as linhas dela.
 *
 * O dataset é MAIOR que o da doc page de propósito: com 3 eventos por dia não
 * dá pra ver a diferença entre 720px e tela cheia. Aqui há dias com 6 e 7.
 */

/* ── Dataset ───────────────────────────────────────────────────── */

const MONTH_START = startOfMonth(new Date());
const at = (offset: number, hour: number, minute = 0) => {
  const d = addDays(MONTH_START, offset);
  d.setHours(hour, minute, 0, 0);
  return d;
};

type Modelo = {
  titulo: string;
  cor: SchedulerEventColor;
  categoria: string;
  tags: string[];
  descricao?: string;
  local: string;
  responsavel: string;
};

const MODELOS: Modelo[] = [
  { titulo: "Daily do time", cor: "info", categoria: "interna", tags: ["time"], descricao: "Progresso e bloqueios.", local: "Meet", responsavel: "Aline Castro" },
  { titulo: "Demo pro cliente", cor: "brand", categoria: "cliente", tags: ["comercial", "importante"], descricao: "Painel de consumo.", local: "Zoom", responsavel: "Sérgio Vieira" },
  { titulo: "Revisão de design", cor: "warning", categoria: "interna", tags: ["design"], descricao: "Hierarquia dos KPIs.", local: "Sala Verde", responsavel: "Marina Duarte" },
  { titulo: "Fechamento financeiro", cor: "danger", categoria: "financeiro", tags: ["importante"], descricao: "Conciliação do mês.", local: "Remoto", responsavel: "Davi Nogueira" },
  { titulo: "1:1", cor: "neutral", categoria: "interna", tags: ["time"], local: "Sala pequena", responsavel: "Sérgio Vieira" },
  { titulo: "Onboarding", cor: "info", categoria: "cliente", tags: ["comercial"], local: "Meet", responsavel: "Marina Duarte" },
  { titulo: "Visita técnica", cor: "brand", categoria: "campo", tags: ["operacao"], descricao: "Inspeção dos inversores.", local: "Usina Norte", responsavel: "Davi Nogueira" },
  { titulo: "Treinamento comercial", cor: "success", categoria: "interna", tags: ["comercial"], local: "Auditório", responsavel: "Marina Duarte" },
];

/**
 * Distribuição determinística — **sem `Math.random()`**. Um dataset aleatório
 * mudaria a cada render, e "quantos eventos cabem na célula" é justamente o que
 * esta tela existe pra mostrar: precisa ser o mesmo número duas vezes seguidas.
 */
const EVENTS: SchedulerEvent[] = (() => {
  const out: SchedulerEvent[] = [];

  for (let dia = 0; dia < 28; dia++) {
    // 0 a 7 eventos por dia, num padrão que se repete e cria dias cheios.
    const quantos = [1, 3, 0, 2, 6, 1, 0, 7, 2, 4, 0, 1, 3, 5][dia % 14];
    for (let i = 0; i < quantos; i++) {
      const m = MODELOS[(dia + i) % MODELOS.length];
      const hora = 8 + ((i * 2 + dia) % 10);
      out.push({
        id: `e-${dia}-${i}`,
        title: m.titulo,
        start: at(dia, hora, 0),
        end: at(dia, hora + 1, 30),
        color: m.cor,
        categoryId: m.categoria,
        tagIds: m.tags,
        description: m.descricao,
        meta: {
          local: m.local,
          responsavel: m.responsavel,
          videochamada: m.local === "Meet" || m.local === "Zoom"
            ? "https://meet.google.com/abc-defg-hij"
            : undefined,
          recorrencia: m.titulo === "Daily do time" ? "Todo dia útil" : undefined,
          visibilidade: "Somente convidados",
          lembrete: "10 min antes",
        },
      });
    }
  }

  // Um multi-dia de dia inteiro, pra exercitar a banda da view de semana e o
  // truncamento das pontas na grade do mês.
  out.push({
    id: "offsite",
    title: "Offsite do time",
    start: startOfDay(addDays(MONTH_START, 8)),
    end: startOfDay(addDays(MONTH_START, 10)),
    allDay: true,
    color: "success",
    categoryId: "interna",
    tagIds: ["time"],
    description: "Três dias de planejamento fora do escritório.",
    meta: {
      local: "Itu / SP",
      responsavel: "Aline Castro",
      visibilidade: "Toda a empresa",
      lembrete: "1 dia antes",
    },
  });

  return out;
})();

const FILTER_FIELDS: SchedulerFilterField[] = [
  {
    id: "categoryId",
    label: "Categoria",
    options: [
      { value: "interna", label: "Interna" },
      { value: "cliente", label: "Cliente" },
      { value: "financeiro", label: "Financeiro" },
      { value: "campo", label: "Campo" },
    ],
  },
  {
    id: "tagIds",
    label: "Tags",
    options: [
      { value: "time", label: "Time" },
      { value: "comercial", label: "Comercial" },
      { value: "design", label: "Design" },
      { value: "operacao", label: "Operação" },
      { value: "importante", label: "Importante" },
    ],
  },
  {
    id: "color",
    label: "Cor",
    options: [
      { value: "brand", label: "Marca", color: "brand" },
      { value: "info", label: "Info", color: "info" },
      { value: "success", label: "Sucesso", color: "success" },
      { value: "warning", label: "Atenção", color: "warning" },
      { value: "danger", label: "Crítico", color: "danger" },
      { value: "neutral", label: "Neutro", color: "neutral" },
    ],
  },
];

const CODE = `// Tela cheia: dê altura real ao pai e deixe o Scheduler em flex-1.
// O componente já é h-full — não há prop de "fullscreen" a ligar.
<div className="flex h-screen flex-col">
  <AppHeader />
  <main className="flex min-h-0 flex-1 flex-col p-sp-2xl">
    <Scheduler
      events={eventos}
      locale={ptBR}
      filterFields={FILTER_FIELDS}
      defaultFilterPanelOpen
      onEventClick={(ev) => setSelecionado(ev)}
      onSlotClick={(inicio) => abrirFormulario(inicio)}
      primaryAction={<Button variant="filled" size="sm" iconLeft={<Plus />} aria-label="Novo evento" className="max-lg:size-form-xl max-lg:p-0"><span className="hidden lg:inline">Novo evento</span></Button>}
    />
  </main>
</div>

// O "+N mais" da célula do mês é DERIVADO da altura medida da linha:
// container de 720px -> ~3 pills; tela cheia -> 6 ou mais.
// Pra travar num número fixo (altura de linha previsível), o month view
// aceita maxPerCell — mas o default adaptativo é o que aproveita a tela.`;

export function SchedulerFullPreview() {
  const [selected, setSelected] = useState<SchedulerEvent | null>(null);

  /**
   * `events` em estado, porque o dnd está LIGADO nesta tela e o componente é
   * dumb sobre mutação: ele emite `onEventMove`/`onEventResize` e quem aplica é
   * aqui. Sem este estado, arrastar não teria efeito nenhum — que é justamente
   * o que o `console.warn` de DEV do componente avisa.
   */
  const [eventos, setEventos] = useState<SchedulerEvent[]>(EVENTS);

  /** Aplica a mudança emitida. Um app real trocaria isto por um PATCH. */
  const aplicarMudanca = ({
    id,
    start,
    end,
  }: {
    id: string;
    start: Date;
    end: Date;
  }) =>
    setEventos((atual) =>
      atual.map((e) => (e.id === id ? { ...e, start, end } : e)),
    );

  return (
    <ExamplePageLayout
      /* Título IGUAL ao item do menu ("Scheduler Full Screen", na categoria
         Examples): clicar num nome e cair numa página com outro lê como se
         fosse outra coisa. */
      category="Examples"
      title="Scheduler Full Screen"
      description="O mesmo Scheduler ocupando a janela inteira, e com drag & drop LIGADO. Não há prop de fullscreen: o componente já é h-full, e é a altura do pai que manda. O que muda de verdade é a célula do mês — o corte do “+N mais” é derivado da altura medida da linha, então aqui cabem 6+ eventos onde num card de 720px cabiam 3, como as linhas da tabela. Arraste um evento pra outro dia (no mês) ou pra outra hora/coluna (na semana); arraste a BORDA do bloco em semana/dia pra mudar a duração. O componente não muta nada — ele emite onEventMove/onEventResize e esta página aplica no próprio estado."
      code={CODE}
    >
      <Scheduler
        events={eventos}
        locale={ptBR}
        weekStartsOn={0}
        filterFields={FILTER_FIELDS}
        defaultFilterPanelOpen
        /* dnd LIGADO — arraste um evento pra outro dia no mês, ou pra outra
           hora/coluna na semana; arraste a BORDA do bloco pra redimensionar. */
        draggable
        resizable
        onEventMove={aplicarMudanca}
        onEventResize={aplicarMudanca}
        onEventClick={(event) => setSelected(event)}
        onSlotClick={(start) =>
          window.alert(`onSlotClick → ${format(start, "PPP p", { locale: ptBR })}`)
        }
        primaryAction={
          <Button variant="filled" size="sm" iconLeft={<Plus />} aria-label="Novo evento" className="max-lg:size-form-xl max-lg:p-0">
            <span className="hidden lg:inline">Novo evento</span>
          </Button>
        }
      />

      <SchedulerEventDetail
        event={selected}
        onClose={() => setSelected(null)}
        storageKey="scheduler-full.detail.width"
      />
    </ExamplePageLayout>
  );
}
