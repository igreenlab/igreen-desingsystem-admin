import { useState } from "react";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import {
  Bell,
  CalendarDays,
  Clock,
  Download,
  FileText,
  Globe,
  Link2,
  MapPin,
  Paperclip,
  Pencil,
  Plus,
  Repeat,
  SendHorizontal,
  Tag,
  User,
  Video,
} from "lucide-react";
import type { LucideIcon } from "@/lib/lucide-types";
import { Input } from "@/components/shadcn/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FloatingPanel } from "@/components/ui/FloatingPanel";
import type { SchedulerEvent } from "@/components/ui/Scheduler";

/**
 * Painel de detalhe do evento — o que o `Scheduler` **não** faz.
 *
 * O componente só emite `onEventClick(event)` e devolve `event.meta` intacto.
 * Quem monta o painel é a tela, e este arquivo é essa tela: a demonstração
 * canônica, no padrão do bloco `dsgreen-paneldetail-2`.
 *
 * ## Por que ele mora aqui e não em cada página
 *
 * A doc page e o exemplo de tela cheia mostram o MESMO painel. Duplicar ~250
 * linhas nas duas é o caminho garantido pra elas divergirem — alguém enriquece
 * uma e a outra vira a versão velha do mesmo padrão. É código de showcase, não
 * API do DS: não entra no barrel nem no registry.
 *
 * ## O que veio do `dsgreen-paneldetail-2`, e o que mudou
 *
 * Igual: header com CONTEXTO (não identidade — o título de um evento é uma
 * frase), título grande no corpo, lista plana de propriedades em
 * `grid-cols-[132px_1fr]`, e abas pros conteúdos que crescem sem limite.
 *
 * Diferente: as abas aqui são **Convidados · Anexos · Comentários · Atividade**.
 * "Convidados" substitui "Subtarefas" porque é a natureza que um evento de
 * agenda tem e uma tarefa não — e é a que carrega decisão (quem confirmou).
 */

/* ────────────────────────────────────────────────────────────────────────
 * Fixture do detalhe
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * O `meta` do evento é `unknown` de propósito no `Scheduler` — é o payload cru
 * do domínio. Aqui a tela declara a forma que ELA usa, que é exatamente o
 * contrato que o componente se recusa a conhecer.
 */
export type EventoMeta = {
  local?: string;
  responsavel?: string;
  videochamada?: string;
  recorrencia?: string;
  visibilidade?: string;
  lembrete?: string;
};

type Convidado = {
  nome: string;
  iniciais: string;
  hex: string;
  papel?: string;
  rsvp: "sim" | "nao" | "talvez" | "pendente";
};

const CONVIDADOS: Convidado[] = [
  { nome: "Aline Castro", iniciais: "AC", hex: "#CC092F", papel: "Organizadora", rsvp: "sim" },
  { nome: "Sérgio Vieira", iniciais: "SV", hex: "#2563EB", rsvp: "sim" },
  { nome: "Marina Duarte", iniciais: "MD", hex: "#7C3AED", rsvp: "talvez" },
  { nome: "Davi Nogueira", iniciais: "DN", hex: "#0891B2", rsvp: "pendente" },
  { nome: "Talan Korsgaard", iniciais: "TK", hex: "#059669", rsvp: "nao" },
];

/** Rótulo e cor do RSVP. `pendente` é neutro: ausência de resposta não é falha. */
const RSVP: Record<
  Convidado["rsvp"],
  { label: string; color: "success" | "danger" | "warning" | "neutral" }
> = {
  sim: { label: "Confirmado", color: "success" },
  nao: { label: "Recusou", color: "danger" },
  talvez: { label: "Talvez", color: "warning" },
  pendente: { label: "Sem resposta", color: "neutral" },
};

const ANEXOS = [
  { nome: "Pauta da reunião.pdf", tamanho: "240 KB", quando: "ontem" },
  { nome: "Proposta v3.xlsx", tamanho: "1,1 MB", quando: "3 dias atrás" },
];

const COMENTARIOS = [
  {
    autor: "Marina Duarte",
    iniciais: "MD",
    hex: "#7C3AED",
    quando: "qui, 16:40",
    texto: "Consigo participar só a partir das 14h30 — podemos deixar a parte de números pro final?",
  },
  {
    autor: "Aline Castro",
    iniciais: "AC",
    hex: "#CC092F",
    quando: "qui, 17:02",
    texto: "Fechado. Reordenei a pauta, os números ficam no último bloco.",
  },
];

/** Log agrupado por dia — o agrupamento é do dado, não derivado no render. */
const ATIVIDADE = [
  {
    dia: "Hoje",
    eventos: [
      { autor: "Aline Castro", iniciais: "AC", hex: "#CC092F", texto: "moveu o evento para 14:00", quando: "09:12" },
      { autor: "Sérgio Vieira", iniciais: "SV", hex: "#2563EB", texto: "confirmou presença", quando: "08:47" },
    ],
  },
  {
    dia: "Ontem",
    eventos: [
      { autor: "Marina Duarte", iniciais: "MD", hex: "#7C3AED", texto: "anexou Pauta da reunião.pdf", quando: "16:38" },
      { autor: "Aline Castro", iniciais: "AC", hex: "#CC092F", texto: "criou o evento e convidou 5 pessoas", quando: "15:02" },
    ],
  },
];

/* ────────────────────────────────────────────────────────────────────────
 * Linha da lista de propriedades
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * `min-h-form-md` nas DUAS células. Sem isso a linha tem a altura do conteúdo,
 * e uma linha de texto puro (30px) fica menor que uma com `Chip` (36px) — a
 * lista ganha ritmo irregular. 36 é o piso natural, então nada cresce: só as
 * menores igualam. É a mesma medição do `dsgreen-paneldetail-2`.
 */
function Propriedade({
  icone: Icone,
  label,
  valor,
}: {
  icone: LucideIcon;
  label: string;
  valor: React.ReactNode;
}) {
  return (
    <>
      <div className="flex min-h-form-md items-center gap-gp-md text-body-sm text-fg-muted">
        <Icone className="size-icon-sm shrink-0 text-fg-subtle" aria-hidden="true" />
        <span className="truncate">{label}</span>
      </div>
      <div className="flex min-h-form-md min-w-0 items-center text-body-sm text-fg-default">
        {valor}
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────────────────────
 * O painel
 * ──────────────────────────────────────────────────────────────────────── */

export type SchedulerEventDetailProps = {
  /** `null` fecha. O `open` do painel deriva daqui — uma fonte só. */
  event: SchedulerEvent | null;
  onClose: () => void;
  /** Chave de persistência da largura; distinta por página pra não colidir. */
  storageKey: string;
};

export function SchedulerEventDetail({
  event,
  onClose,
  storageKey,
}: SchedulerEventDetailProps) {
  const [aba, setAba] = useState("convidados");
  const meta = (event?.meta ?? {}) as EventoMeta;

  const fmt = (d: Date, p: string) => format(d, p, { locale: ptBR });

  const quando = event
    ? event.allDay
      ? `${fmt(event.start, "d MMM")} — ${fmt(event.end, "d MMM yyyy")}`
      : event.start.toDateString() === event.end.toDateString()
        ? `${fmt(event.start, "EEEE, d MMM yyyy")} · ${fmt(event.start, "HH:mm")}–${fmt(event.end, "HH:mm")}`
        : `${fmt(event.start, "d MMM, HH:mm")} → ${fmt(event.end, "d MMM, HH:mm")}`
    : "";

  const duracao = event
    ? event.allDay
      ? "Dia inteiro"
      : `${Math.round((event.end.getTime() - event.start.getTime()) / 60000)} min`
    : "";

  const confirmados = CONVIDADOS.filter((c) => c.rsvp === "sim").length;
  const pendentes = CONVIDADOS.filter((c) => c.rsvp === "pendente").length;

  return (
    <FloatingPanel
      open={event !== null}
      onOpenChange={(aberto) => {
        if (!aberto) onClose();
      }}
      side="right"
      size="lg"
      resizable
      maximizable
      resizableStorageKey={storageKey}
      /* Header leva o CONTEXTO, não a identidade: título de evento é uma frase e
         não cabe numa linha de header. Quem identifica aqui é "onde o evento
         está" — a agenda e o dia. */
      titleSlot={
        <div className="flex min-w-0 items-center gap-gp-sm text-body-sm text-fg-muted">
          <span className="truncate">Agenda</span>
          <span className="opacity-50">/</span>
          <span className="truncate font-medium text-fg-default">
            {event ? fmt(event.start, "d 'de' MMMM") : ""}
          </span>
        </div>
      }
      headerActions={
        <>
          <Button variant="soft" color="secondary" size="icon-sm" aria-label="Editar evento">
            <Pencil />
          </Button>
          <Button variant="soft" color="secondary" size="icon-sm" aria-label="Copiar link do evento">
            <Link2 />
          </Button>
        </>
      }
      footer={
        <>
          <Button variant="outline" color="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
          <Button variant="filled" size="sm" iconLeft={<Video />}>
            Entrar na chamada
          </Button>
        </>
      }
    >
      {/* ⚠️ Wrapper de gap OBRIGATÓRIO: o body do `FloatingPanel` não tem gap
          entre filhos (`row-gap: normal`, medido) — só padding. Sem ele, título,
          lista, descrição e abas ficam com 0px entre si. Não confunda com o
          `PanelBody` do `Panel`, que traz `gap-gp-3xl` embutido: é a diferença
          que fez a 1ª versão do `dsgreen-paneldetail-2` sair grudada. */}
      <div className="flex flex-col gap-gp-2xl">
        <div className="flex flex-col gap-gp-md">
          <h2 className="text-title-lg text-balance text-fg-default">
            {event?.title}
          </h2>
          <span className="flex flex-wrap items-center gap-gp-sm">
            <Chip color="success" variant="soft" size="sm">
              {confirmados} de {CONVIDADOS.length} confirmados
            </Chip>
            {pendentes > 0 ? (
              <Chip color="neutral" variant="soft" size="sm">
                {pendentes} sem resposta
              </Chip>
            ) : null}
          </span>
        </div>

        {/* Grid alinha todos os valores numa coluna só — é isso que dá leitura
            de ficha. `justify-between` desalinharia por tamanho de label. */}
        <div className="grid grid-cols-[132px_1fr] items-center gap-x-gp-md">
          <Propriedade
            icone={CalendarDays}
            label="Quando"
            valor={<span className="tabular-nums first-letter:uppercase">{quando}</span>}
          />
          <Propriedade icone={Clock} label="Duração" valor={duracao} />
          {meta.recorrencia ? (
            <Propriedade icone={Repeat} label="Repete" valor={meta.recorrencia} />
          ) : null}
          <Propriedade icone={MapPin} label="Local" valor={meta.local ?? "—"} />
          {meta.videochamada ? (
            <Propriedade
              icone={Video}
              label="Videochamada"
              valor={
                /* `<a>` de verdade, não texto: link de reunião é a coisa que o
                   usuário mais precisa acionar deste painel. */
                <a
                  href={meta.videochamada}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-fg-brand underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
                >
                  {meta.videochamada.replace(/^https?:\/\//, "")}
                </a>
              }
            />
          ) : null}
          <Propriedade
            icone={User}
            label="Organizador"
            valor={
              <span className="flex items-center gap-gp-md">
                <Avatar size="sm" colorHex="#CC092F" aria-label={meta.responsavel ?? ""}>
                  {(meta.responsavel ?? "?")
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")}
                </Avatar>
                <span className="truncate">{meta.responsavel ?? "—"}</span>
              </span>
            }
          />
          <Propriedade
            icone={Tag}
            label="Tags"
            valor={
              <span className="flex flex-wrap items-center gap-gp-sm">
                {(event?.tagIds ?? []).map((t) => (
                  <Chip key={t} color="neutral" variant="soft" size="sm">
                    {t}
                  </Chip>
                ))}
              </span>
            }
          />
          {meta.visibilidade ? (
            <Propriedade icone={Globe} label="Visibilidade" valor={meta.visibilidade} />
          ) : null}
          {meta.lembrete ? (
            <Propriedade icone={Bell} label="Lembrete" valor={meta.lembrete} />
          ) : null}
        </div>

        {event?.description ? (
          /* `bg-bg-surface`, não `bg-bg-subtle`: medido no dark, o subtle dá 1%
             de branco sobre o painel — invisível. O surface destaca o bloco de
             texto do resto da ficha. */
          <div className="flex flex-col gap-gp-md rounded-radius-lg border border-border-default bg-bg-surface p-pad-2xl">
            <span className="text-body-xs font-semibold text-fg-muted">Descrição</span>
            <p className="text-body-sm text-fg-default">{event.description}</p>
          </div>
        ) : null}
      </div>

      {/* Abas: cada uma é uma NATUREZA de conteúdo que cresce sem limite — não
          são campos. É a diferença que justifica aba aqui e a proíbe no
          `dsgreen-paneldetail-1`, onde elas só esconderiam mais campos.

          `fullWidth` na variante default: regra do `USAGE.md` do FloatingPanel —
          em 560px o `line` vira um trilho curto que lê como fragmento. */}
      <Tabs value={aba} onValueChange={setAba} fullWidth className="mt-gp-2xl">
        <TabsList>
          <TabsTrigger value="convidados">Convidados</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
          <TabsTrigger value="comentarios">Comentários</TabsTrigger>
          <TabsTrigger value="atividade">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="convidados" className="flex flex-col gap-gp-md pt-pad-xl">
          <ul className="flex flex-col">
            {CONVIDADOS.map((c) => (
              <li
                key={c.nome}
                className="flex items-center gap-gp-md border-b border-border-subtle py-pad-lg first:pt-0 last:border-b-0 last:pb-0"
              >
                <Avatar size="md" colorHex={c.hex} className="shrink-0" aria-label={c.nome}>
                  {c.iniciais}
                </Avatar>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-body-sm text-fg-default">{c.nome}</span>
                  {c.papel ? (
                    <span className="text-caption-sm text-fg-muted">{c.papel}</span>
                  ) : null}
                </span>
                {/* O RSVP é `Chip`, nunca `<span>` estilizado: ele já resolve
                    tom, contraste e altura de linha. */}
                <Chip color={RSVP[c.rsvp].color} variant="soft" size="sm">
                  {RSVP[c.rsvp].label}
                </Chip>
              </li>
            ))}
          </ul>
          <Button variant="outline" color="secondary" size="sm" iconLeft={<Plus />}>
            Convidar pessoas
          </Button>
        </TabsContent>

        <TabsContent value="anexos" className="flex flex-col gap-gp-md pt-pad-xl">
          {ANEXOS.map((a) => (
            <div
              key={a.nome}
              className="flex items-center gap-gp-md rounded-radius-lg border border-border-default bg-bg-surface p-pad-xl"
            >
              <FileText className="size-icon-md shrink-0 text-fg-subtle" aria-hidden="true" />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-body-sm text-fg-default">{a.nome}</span>
                {/* Tamanho e data na MESMA linha secundária: são metadado do
                    mesmo arquivo, e duas linhas esticariam a altura sem ganho. */}
                <span className="text-caption-sm tabular-nums text-fg-muted">
                  {a.tamanho} · {a.quando}
                </span>
              </div>
              <Button
                variant="ghost"
                color="secondary"
                size="icon-sm"
                aria-label={`Baixar ${a.nome}`}
              >
                <Download />
              </Button>
            </div>
          ))}
          <Button variant="outline" color="secondary" size="sm" iconLeft={<Plus />}>
            Anexar arquivo
          </Button>
        </TabsContent>

        <TabsContent value="comentarios" className="flex flex-col gap-gp-2xl pt-pad-xl">
          <ul className="flex flex-col gap-gp-2xl">
            {COMENTARIOS.map((c) => (
              <li key={c.quando} className="flex gap-gp-md">
                <Avatar size="md" colorHex={c.hex} className="shrink-0" aria-label={c.autor}>
                  {c.iniciais}
                </Avatar>
                <div className="flex min-w-0 flex-col gap-gp-2xs">
                  <span className="flex flex-wrap items-baseline gap-gp-sm">
                    <span className="text-body-sm font-semibold text-fg-default">
                      {c.autor}
                    </span>
                    <span className="text-caption-sm tabular-nums text-fg-muted">
                      {c.quando}
                    </span>
                  </span>
                  <p className="text-body-sm text-fg-default">{c.texto}</p>
                </div>
              </li>
            ))}
          </ul>
          {/* `Input` + botão. O DS tem `MessageComposer`, bem mais completo, mas
              ele não está no registry — um bloco que o importasse não resolveria
              no consumidor de copy-in. Se entrar, troque. */}
          <div className="flex items-center gap-gp-md">
            <Input placeholder="Escreva um comentário…" aria-label="Novo comentário" />
            <Button variant="soft" color="secondary" size="icon-sm" aria-label="Anexar ao comentário">
              <Paperclip />
            </Button>
            <Button variant="filled" size="icon-sm" aria-label="Enviar comentário">
              <SendHorizontal />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="atividade" className="flex flex-col gap-gp-2xl pt-pad-xl">
          {ATIVIDADE.map((grupo) => (
            <div key={grupo.dia} className="flex flex-col gap-gp-md">
              {/* Separador de dia: fio · badge · fio, centralizado porque ele
                  divide o fluxo — encostado à esquerda leria como título do
                  primeiro evento. ⚠️ Os FIOS são `aria-hidden`, o Chip NÃO: é
                  ele que agrupa o log, e escondê-lo transformaria os eventos
                  numa lista corrida sem dia no leitor de tela. */}
              <div className="flex items-center gap-gp-md">
                <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
                <Chip color="neutral" variant="soft" size="sm">
                  {grupo.dia}
                </Chip>
                <span className="h-px flex-1 bg-border-subtle" aria-hidden="true" />
              </div>

              <ul className="flex flex-col">
                {grupo.eventos.map((a) => (
                  <li
                    key={a.autor + a.quando}
                    className="flex items-start gap-gp-md border-b border-border-subtle py-pad-lg first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <Avatar size="sm" colorHex={a.hex} className="shrink-0" aria-label={a.autor}>
                      {a.iniciais}
                    </Avatar>
                    <p className="min-w-0 flex-1 text-body-sm text-fg-muted">
                      <span className="font-semibold text-fg-default">{a.autor}</span>{" "}
                      {a.texto}
                    </p>
                    <span className="shrink-0 text-caption-sm tabular-nums text-fg-muted">
                      {a.quando}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </FloatingPanel>
  );
}
