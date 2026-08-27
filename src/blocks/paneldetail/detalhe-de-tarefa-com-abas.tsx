import { useState } from "react";
import {
  Calendar,
  Check,
  CircleDot,
  Clock,
  Download,
  FileText,
  Flag,
  Link2,
  Paperclip,
  Pencil,
  Plus,
  SendHorizontal,
  Tag,
  Users,
} from "lucide-react";
import type { LucideIcon } from "@/lib/lucide-types";
// Import por ARQUIVO, não pelo barrel `@/components/shadcn` — o barrel não é distribuído por
// nenhum item do registry, então um bloco que o importasse chegaria no consumidor de copy-in
// com import que não resolve (L-037, gate `registry-imports`).
import { Input } from "@/components/shadcn/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { Avatar } from "@/components/ui/avatar-ig";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { FloatingPanel } from "@/components/ui/FloatingPanel";

export const BLOCK = {
  id: "dsgreen-paneldetail-2",
  nome: "Detalhe de tarefa com abas",
  descricao:
    "Painel de detalhe de uma TAREFA: contexto (projeto/coluna) no header, título grande no corpo, propriedades em lista plana com ícone à esquerda e valor à direita, descrição, e abas pros conteúdos que crescem — subtarefas, anexos, comentários e atividade.",
  usa: [
    "FloatingPanel (side=\"right\", size=\"lg\", titleSlot + headerActions + maximizable + resizable; body PADDED, sem Section)",
    "Tabs (fullWidth, variante default) + TabsContent",
    "Avatar (pilha com sobreposição) · Chip (soft) · Input · Button",
  ],
} as const;

/**
 * dsgreen-paneldetail-2 — detalhe de TAREFA, com abas.
 *
 * ## Por que existe, tendo o `dsgreen-paneldetail-1`
 *
 * Os dois são painel de detalhe e param aí a semelhança. O que muda é **o que o registro é**:
 *
 * | | `-1` registro (cliente, pedido) | `-2` tarefa (esta) |
 * |---|---|---|
 * | identidade | nome curto → cabe no header | título é uma FRASE → vai no corpo, grande; o header leva o **contexto** (projeto / coluna) |
 * | dados | 20+ campos, agrupáveis por assunto | ~6 propriedades, e nenhuma agrupável |
 * | estrutura | `FloatingPanelSection` colapsável | **lista plana** com ícone à esquerda |
 * | abas | ⛔ não — o colapso já esconde | ✅ **sim** — ver abaixo |
 *
 * ## Aqui aba está certa, e no `-1` estava errada
 *
 * A regra não é "aba é ruim". É: **aba serve pra tipo de conteúdo, não pra mais campos.**
 *
 * No `-1` as abas escondiam seções de campos — e um corpo que já é pilha de seções
 * colapsáveis já tem mecanismo de esconder; os dois juntos fazem o usuário procurar o dado em
 * dois lugares.
 *
 * Aqui cada aba é uma **natureza diferente**: subtarefa é checklist, anexo é arquivo,
 * comentário é conversa, atividade é log. Nenhuma é campo, nenhuma cabe na lista de
 * propriedades, e todas **crescem sem limite** — 40 comentários não podem empurrar o próximo
 * dado 40 linhas pra baixo. É exatamente o caso pra aba.
 *
 * ## O body é PADDED aqui — o oposto do `-1`
 *
 * ⚠️ Não copie o `bodyPadded={false}` do `-1`. Lá ele é obrigatório porque as
 * `FloatingPanelSection` trazem padding próprio e divisória de ponta a ponta. **Aqui não há
 * Section nenhuma**, então o default (`bodyPadded` = true, gutter de 18px) é o certo, e some a
 * necessidade de qualquer margem negativa. Ligar `false` aqui colaria todo o conteúdo na borda.
 *
 * ## A lista de propriedades: por que grid e não `justify-between`
 *
 * `grid-cols-[132px_1fr]` alinha os valores numa **coluna única**, que é o que dá a leitura de
 * ficha. Com `justify-between` cada valor encostaria na borda direita numa distância diferente
 * (depende do tamanho do label), e a coluna desapareceria.
 *
 * Também não é `FloatingPanelField`: ele é `label ... valor` **sem ícone** e com o valor
 * alinhado à direita. Aqui o ícone à esquerda do label é parte do desenho — ele é o que
 * permite varrer a lista por tipo de propriedade sem ler.
 *
 * ## Regras do DS que este bloco carrega (e que copiar sem elas quebra)
 *
 * - **Aba dentro de painel vem `fullWidth`, na variante default (`segmented`).** Regra
 *   declarada no `USAGE.md` do `FloatingPanel`: em 560px o `line` vira um trilho curto que lê
 *   como fragmento. Com 4 abas o `fullWidth` dá ~130px cada — cabe.
 * - **Ação de ícone é `variant="soft"` + `aria-label`.** O maximize e o close que o
 *   componente renderiza são `soft`+`secondary`; `ghost` no meio da fileira fica sem container
 *   e lê como desabilitada. E botão de ícone sem `aria-label` é anunciado só como "button".
 * - **Status/prioridade/tag são `Chip`**, nunca `<span>` estilizado — o Chip já resolve tom,
 *   contraste e altura de linha.
 * - **Data com `tabular-nums`**, senão os dígitos dançam entre as linhas da lista.
 * - **Pilha de avatares:** `-ml-sp-sm` (6px, token) + `ring-2 ring-bg-surface` pra separar um
 *   do outro. O DS **não tem** `AvatarGroup` — se passar a ter, troque por ele.
 * - **Subtarefa concluída = disco CHEIO**, feito com `<span bg-bg-success>` + `<Check>`, não
 *   com o `CircleCheck` do lucide: ele desenha o círculo com `stroke="currentColor"`, e no
 *   dark o traço (preto, porque `fg-on-success` inverte) fica por cima do preenchimento e come
 *   ~2px de verde de cada lado. Medido no `-1`, mesma solução aqui.
 *
 * ## Cuidado ao adaptar
 *
 * - **O botão daqui é do EXEMPLO.** No board real quem abre o painel é o card clicado:
 *   `open={!!tarefaSelecionada}`.
 * - **Contagem na aba** (`Comentários 3`) só quando o número informa. "Atividade 47" não
 *   ajuda ninguém a decidir se clica.
 * - **O campo de mensagem aqui é `Input` + botão.** O DS tem um `MessageComposer` bem mais
 *   completo (anexo, menção, template), mas ele **não está no registry** — um bloco que o
 *   importasse não resolveria no consumidor de copy-in. Se ele entrar no registry, troque.
 * - **Não empilhe as 4 abas em telas estreitas.** Em mobile o `FloatingPanel` vira sheet e 4
 *   triggers de ~80px ficam ilegíveis: ali o certo é reduzir pra 2 (Comentários + resto num
 *   menu) ou virar tela própria.
 */

/** Fixture do bloco. Fica aqui de propósito: bloco é auto-contido, então quem copia vê a
 *  forma do dado esperado sem inferir do render. */
const TAREFA = {
  contexto: "Projeto UI/UX",
  coluna: "Em revisão",
  titulo: "Redesenhar o painel de analytics do dashboard",
  descricao:
    "Revisar a hierarquia dos KPIs e trocar os quatro cards do topo por uma faixa única. O gráfico de barras precisa caber ao lado do ranking sem quebrar em 1280px.",
};

const PROPRIEDADES: {
  icone: LucideIcon;
  label: string;
  valor: React.ReactNode;
}[] = [
  {
    icone: CircleDot,
    label: "Status",
    valor: (
      <Chip color="info" variant="soft" size="sm">
        Em revisão
      </Chip>
    ),
  },
  {
    icone: Flag,
    label: "Prioridade",
    valor: (
      <Chip color="warning" variant="soft" size="sm">
        Alta
      </Chip>
    ),
  },
  {
    icone: Calendar,
    label: "Prazo",
    valor: <span className="tabular-nums">3 out 2026 — 12 out 2026</span>,
  },
  {
    icone: Tag,
    label: "Tags",
    valor: (
      <span className="flex flex-wrap items-center gap-gp-sm">
        {["Dashboard", "Analytics", "Frontend"].map((t) => (
          <Chip key={t} color="neutral" variant="soft" size="sm">
            {t}
          </Chip>
        ))}
      </span>
    ),
  },
  {
    icone: Users,
    label: "Responsáveis",
    valor: (
      /* Pilha com sobreposição: `-ml-sp-sm` (6px, token) no 2º em diante + `ring` da cor da
         superfície, que é o que separa um avatar do outro. Sem AvatarGroup no DS. */
      <span className="flex items-center">
        {[
          { ini: "MD", hex: "#2563EB" },
          { ini: "AC", hex: "#CC092F" },
          { ini: "JS", hex: "#7C3AED" },
        ].map((p, i) => (
          <Avatar
            key={p.ini}
            size="sm"
            colorHex={p.hex}
            aria-label={p.ini}
            className={i > 0 ? "-ml-sp-sm ring-2 ring-bg-surface" : "ring-2 ring-bg-surface"}
          >
            {p.ini}
          </Avatar>
        ))}
      </span>
    ),
  },
  {
    icone: Clock,
    label: "Criada em",
    valor: <span className="tabular-nums">20 set 2026, 10:35</span>,
  },
];

const SUBTAREFAS = [
  { label: "Levantar os KPIs que o time realmente usa", feita: true },
  { label: "Definir a faixa única no lugar dos 4 cards", feita: true },
  { label: "Validar o gráfico ao lado do ranking em 1280px", feita: false },
  { label: "Revisar com o time de dados", feita: false },
];

const ANEXOS = [
  { nome: "Briefing do redesign.pdf", tamanho: "1,5 MB", quando: "24 set 2026" },
  { nome: "Medições de 1280px.png", tamanho: "820 KB", quando: "26 set 2026" },
];

const COMENTARIOS = [
  {
    autor: "Terry James",
    iniciais: "TJ",
    hex: "#2563EB",
    quando: "sex, 14:20",
    texto:
      "A faixa única resolve a hierarquia, mas o ranking fica sem respiro em 1280px. Consegue medir antes de fechar?",
    reacoes: "2",
  },
  {
    autor: "Aline Castro",
    iniciais: "AC",
    hex: "#CC092F",
    quando: "sex, 15:02",
    texto: "Medido: 148px pro ranking. Cabe, mas com o título em duas linhas.",
    reacoes: null,
  },
];

/** Log agrupado por DIA. O agrupamento é do dado, não do render: quem monta a lista já sabe
 *  a que dia cada evento pertence, e derivar isso no componente esconderia a regra de fuso. */
const ATIVIDADE = [
  {
    dia: "Hoje",
    eventos: [
      { autor: "Talan Korsgaard", iniciais: "TK", hex: "#7C3AED", texto: "mudou o status de Em progresso para Em revisão", quando: "10:45" },
      { autor: "Davis Donin", iniciais: "DD", hex: "#0891B2", texto: "anexou Medições de 1280px.png", quando: "10:20" },
      { autor: "Aline Castro", iniciais: "AC", hex: "#CC092F", texto: "concluiu a subtarefa Definir a faixa única", quando: "09:58" },
    ],
  },
  {
    dia: "Ontem",
    eventos: [
      { autor: "Terry James", iniciais: "TJ", hex: "#2563EB", texto: "comentou sobre o respiro do ranking em 1280px", quando: "14:20" },
      { autor: "Aline Castro", iniciais: "AC", hex: "#CC092F", texto: "adicionou a tag Analytics", quando: "11:07" },
    ],
  },
  {
    dia: "24 set 2026",
    eventos: [
      { autor: "Davis Donin", iniciais: "DD", hex: "#0891B2", texto: "anexou Briefing do redesign.pdf", quando: "16:32" },
      { autor: "Talan Korsgaard", iniciais: "TK", hex: "#7C3AED", texto: "definiu o prazo para 12 out 2026", quando: "16:10" },
      { autor: "Talan Korsgaard", iniciais: "TK", hex: "#7C3AED", texto: "criou a tarefa", quando: "16:04" },
    ],
  },
];

/** Linha da lista de propriedades: ícone à esquerda, label, e o valor na coluna da direita. */
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
      {/* `min-h-form-md` (36px) nas DUAS células. Sem isso a linha tem altura do conteúdo, e
          medido dá 30px na de texto puro contra 36px na que tem `Chip` — a lista fica com
          ritmo irregular. 36 é o piso natural: é a altura que o Chip já impõe, então nada
          cresce, só as menores igualam. */}
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

export function DetalheDeTarefaComAbas() {
  const [aberto, setAberto] = useState(false);
  const [aba, setAba] = useState("subtarefas");
  const feitas = SUBTAREFAS.filter((s) => s.feita).length;

  return (
    <>
      {/* No board real este botão não existe: quem abre o painel é o card clicado. */}
      <Button variant="outline" color="secondary" onClick={() => setAberto(true)}>
        Abrir detalhe da tarefa
      </Button>

      <FloatingPanel
        open={aberto}
        onOpenChange={setAberto}
        side="right"
        size="lg"
        resizable
        maximizable
        resizableStorageKey="dsgreen-paneldetail-2.width"
        /* Header leva o CONTEXTO, não a identidade: título de tarefa é uma frase e não cabe
           numa linha de header. Quem identifica aqui é "onde a tarefa está". */
        titleSlot={
          <div className="flex min-w-0 items-center gap-gp-sm text-body-sm text-fg-muted">
            <span className="truncate">{TAREFA.contexto}</span>
            <span className="opacity-50">/</span>
            <span className="truncate font-medium text-fg-default">{TAREFA.coluna}</span>
          </div>
        }
        headerActions={
          <>
            <Button variant="soft" color="secondary" size="icon-sm" aria-label="Editar tarefa">
              <Pencil />
            </Button>
            <Button variant="soft" color="secondary" size="icon-sm" aria-label="Copiar link">
              <Link2 />
            </Button>
          </>
        }
        footer={
          <>
            <Button
              variant="outline"
              color="secondary"
              size="sm"
              onClick={() => setAberto(false)}
            >
              Fechar
            </Button>
            <Button variant="filled" size="sm" iconLeft={<Check />}>
              Concluir tarefa
            </Button>
          </>
        }
      >
        {/* ⚠️ Este wrapper de gap é OBRIGATÓRIO, e não é preferência: o body do
            `FloatingPanel` **não tem gap entre filhos** (`row-gap: normal`, medido) — só
            padding. Sem ele, título, lista, descrição e abas ficam com **0px** entre si, todos
            colados. Não confunda com o `PanelBody` do `Panel`, que tem `gap-gp-3xl` embutido:
            é a diferença que fez a 1ª versão deste bloco sair grudada. */}
        <div className="flex flex-col gap-gp-2xl">
          {/* Título no CORPO, grande. `text-balance` evita a última linha órfã de uma palavra. */}
          <h2 className="text-title-lg text-balance text-fg-default">{TAREFA.titulo}</h2>

          {/* Lista plana de propriedades. O grid alinha todos os valores numa coluna só — é
              isso que dá leitura de ficha; `justify-between` desalinharia por tamanho de
              label. */}
          <div className="grid grid-cols-[132px_1fr] items-center gap-x-gp-md">
            {PROPRIEDADES.map((p) => (
              <Propriedade key={p.label} {...p} />
            ))}
          </div>

          {/* `bg-bg-surface`, não `bg-bg-subtle`: medido no dark, o subtle dá
              `oklch(1 0 0 / 0.01)` — 1% de branco sobre o painel, invisível. O surface é
              superfície de verdade e destaca o bloco de texto do resto da ficha. */}
          <div className="flex flex-col gap-gp-md rounded-radius-lg border border-border-default bg-bg-surface p-pad-2xl">
            <span className="text-body-xs font-semibold text-fg-muted">Descrição</span>
            <p className="text-body-sm text-fg-default">{TAREFA.descricao}</p>
          </div>
        </div>

        {/* Abas: cada uma é uma NATUREZA de conteúdo que cresce sem limite — não são campos.
            É a diferença que justifica aba aqui e a proíbe no `dsgreen-paneldetail-1`. */}
        <Tabs value={aba} onValueChange={setAba} fullWidth className="mt-gp-2xl">
          <TabsList>
            <TabsTrigger value="subtarefas">Subtarefas</TabsTrigger>
            <TabsTrigger value="anexos">Anexos</TabsTrigger>
            <TabsTrigger value="comentarios">Comentários</TabsTrigger>
            <TabsTrigger value="atividade">Atividade</TabsTrigger>
          </TabsList>

          <TabsContent value="subtarefas" className="flex flex-col gap-gp-lg pt-pad-xl">
            <div className="flex items-center justify-between text-body-xs text-fg-muted">
              <span className="font-semibold text-fg-default">Progresso</span>
              <span className="tabular-nums">
                {feitas}/{SUBTAREFAS.length}
              </span>
            </div>
            {/* Timeline: a linha vertical liga um marcador ao próximo. Ela é um `<span>` que
                cresce (`flex-1`) numa coluna ao lado do marcador — NÃO um `before:` com
                `left-[7px]`, que seria valor na unha e desalinharia se o marcador mudar de
                tamanho. O `gap-0` no `<ul>` é o que mantém a linha contínua; o respiro entre
                itens vem do `pb` do texto. */}
            <ul className="flex flex-col gap-0">
              {SUBTAREFAS.map((s, i) => {
                const ultima = i === SUBTAREFAS.length - 1;
                return (
                  <li key={s.label} className="flex gap-gp-md text-body-sm">
                    <div className="flex flex-col items-center">
                      {s.feita ? (
                        /* Disco CHEIO: `<span>` + `<Check>`, não o `CircleCheck` do lucide — o
                           stroke dele fica por cima do fill e come o disco no dark. */
                        <span
                          className="grid size-icon-sm shrink-0 place-items-center rounded-radius-full bg-bg-success text-fg-on-success"
                          aria-hidden="true"
                        >
                          <Check className="size-icon-2xs" strokeWidth={3} />
                        </span>
                      ) : (
                        <span
                          className="size-icon-sm shrink-0 rounded-radius-full border border-border-input"
                          aria-hidden="true"
                        />
                      )}
                      {!ultima && (
                        <span
                          className="mt-gp-2xs w-px flex-1 bg-border-default"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <span
                      className={`${ultima ? "" : "pb-pad-xl"} ${
                        s.feita ? "text-fg-muted line-through" : "text-fg-default"
                      }`}
                    >
                      {s.label}
                    </span>
                  </li>
                );
              })}
            </ul>
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
                  {/* Tamanho e data na MESMA linha secundária, separados por `·`. Duas linhas
                      aqui esticariam a altura do anexo sem ganhar leitura — os dois são
                      metadado do mesmo arquivo. */}
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
                  <Avatar
                    size="md"
                    colorHex={c.hex}
                    className="shrink-0"
                    aria-label={c.autor}
                  >
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
                    {c.reacoes && (
                      <span className="mt-gp-2xs w-fit">
                        <Chip color="neutral" variant="soft" size="sm">
                          👍 {c.reacoes}
                        </Chip>
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {/* Campo de mensagem: `Input` + botão de enviar. O `MessageComposer` do DS é mais
                completo mas NÃO está no registry — ver "Cuidado ao adaptar". */}
            <div className="flex items-center gap-gp-md">
              <Input placeholder="Escreva um comentário…" aria-label="Novo comentário" />
              <Button
                variant="soft"
                color="secondary"
                size="icon-sm"
                aria-label="Anexar ao comentário"
              >
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
                {/* Separador de dia no padrão de conversa: fio · badge · fio. Centralizado
                    porque ele divide o fluxo, não rotula o item de baixo — encostado à
                    esquerda ele leria como título do primeiro evento.

                    O dia é um `Chip`, não texto solto: com 3 grupos na mesma rolagem, texto
                    fino do mesmo tamanho do resto some no meio do log. O badge dá o degrau
                    visual que separa bloco de bloco.

                    ⚠️ Os fios são `aria-hidden`, o Chip NÃO. A 1ª versão tinha `aria-hidden`
                    no container inteiro e escondia a data — e é ela que agrupa o log: sem
                    ela, no leitor de tela os 8 eventos viram uma lista corrida sem dia. */}
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
                      /* Divisória por evento: log é lista de linhas parecidas, e sem
                         separação elas viram parágrafo corrido. A última do grupo não leva,
                         porque o separador de dia já fecha o bloco. */
                      className="flex items-start gap-gp-md border-b border-border-subtle py-pad-lg first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <Avatar
                        size="sm"
                        colorHex={a.hex}
                        className="shrink-0"
                        aria-label={a.autor}
                      >
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
    </>
  );
}
