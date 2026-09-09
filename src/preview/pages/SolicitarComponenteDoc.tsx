import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  RefreshCw,
  Send,
  CircleAlert,
  Inbox,
  CalendarDays,
  FolderOpen,
  Link2,
  User,
  Package,
  Wrench,
  LayoutTemplate,
  CircleHelp,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  FormFieldInput,
  FormFieldSelect,
  FormFieldTextarea,
} from "@/components/ui/FormField";
import { Badge } from "@/components/shadcn/badge";
import { DocLayout, DocHeader, DocSeparator, SectionH2 } from "../components";

/**
 * SolicitarComponenteDoc — pedido de componente novo, com a fila à vista.
 *
 * ⚠️ ESTA PÁGINA É AUTOCONTIDA DE PROPÓSITO. Toda a lógica (endpoint, validação,
 * fetch, formatação) mora neste arquivo. Não há hook compartilhado, não há
 * componente novo em `ui/`, não há token novo, e nada aqui é importado por
 * outra página. A regra veio do mantenedor e existe por um motivo: o DS atual
 * funciona, e uma tela de recado não é razão pra encostar nele. Se você for
 * estender isto, estenda AQUI — resista a "extrair pra reaproveitar" enquanto
 * houver um consumidor só.
 *
 * ── Como funciona o armazenamento ──────────────────────────────────────────
 * Não há banco e não há backend nosso. Um Apps Script publicado como Web App
 * grava numa planilha do Google e devolve a lista:
 *
 *   POST  { nome, assunto, descricao, tipo?, projeto?, referencia? }  → grava
 *   GET                                                               → lista
 *
 * ⚠️ O POST vai com `Content-Type: text/plain`. NÃO troque por
 * `application/json`: esse valor não está na lista de tipos "safelisted" do
 * CORS, o navegador passa a mandar um preflight OPTIONS, e o Apps Script não
 * responde a OPTIONS — a requisição morre antes de sair. O corpo continua
 * sendo JSON; só o cabeçalho é que mente, e é de propósito.
 *
 * ── O que o mantenedor controla direto na planilha, sem mexer aqui ─────────
 *   coluna `status` → vira o Badge do card
 *   coluna `oculto` → qualquer conteúdo remove o item da lista, sem apagar
 *   coluna `notas`  → privada; o endpoint nunca a devolve
 */

/**
 * O endpoint é público por construção: qualquer valor daqui acaba no bundle,
 * que é servido em texto puro. Não é segredo e não deve ser tratado como um.
 * A variável de ambiente existe só pra permitir trocar a URL sem abrir PR — se
 * ela não estiver definida, o valor abaixo vale, e a página funciona sem
 * nenhum passo de configuração.
 */
const ENDPOINT =
  ((import.meta.env as Record<string, string | undefined>)
    .VITE_SOLICITACOES_URL ??
    "https://script.google.com/macros/s/AKfycbzs38D-g2w8tVfSkJw1Fx6UfOAluCaoeZTB6Dje_ca9rS5xIiFB98VjSw4t25gruzcI/exec") as string;

const TIPOS = [
  { value: "Componente novo", label: "Componente novo" },
  { value: "Ajuste em componente existente", label: "Ajuste em componente existente" },
  { value: "Exemplo de tela", label: "Exemplo de tela" },
  { value: "Dúvida", label: "Dúvida" },
];

type Solicitacao = {
  data: string;
  nome: string;
  assunto: string;
  descricao: string;
  tipo: string;
  projeto: string;
  referencia: string;
  status: string;
};

type EstadoEnvio = "parado" | "enviando" | "enviado" | "erro";
type EstadoLista = "carregando" | "pronta" | "erro";

const VAZIO = {
  nome: "",
  assunto: "",
  descricao: "",
  tipo: "",
  projeto: "",
  referencia: "",
};

/**
 * Mensagens por código do endpoint.
 *
 * A do `duplicado` é deliberadamente tranquilizadora: o caso mais comum não é
 * abuso, é a pessoa achando que o primeiro clique não pegou. Dizer "já está
 * aqui" resolve a dúvida dela; dizer "bloqueado" cria uma nova.
 */
const ERROS: Record<string, string> = {
  campo_obrigatorio: "Preencha os campos obrigatórios.",
  duplicado: "Esse pedido já entrou há pouco — está na lista abaixo.",
  muitos_envios: "Muitos envios agora há pouco. Tente de novo em um minuto.",
  ocupado: "O servidor está ocupado. Tente de novo em alguns segundos.",
  json_invalido: "Não consegui montar o envio. Recarregue a página e tente de novo.",
  falha_gravacao: "Não consegui gravar o pedido. Tente de novo em instantes.",
};

function formatarData(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * "há 4 dias" em vez de "09 de set. de 2026".
 *
 * Numa fila, o que importa é **quanto tempo o pedido está parado**, não a data
 * absoluta — e ler isso de uma data exige o leitor fazer a conta de cabeça. É o
 * que o `#/list-rich` faz, e é o que torna a lista varrível. A data cheia
 * continua acessível no `title` do elemento, pra quem precisar do valor exato.
 */
function tempoRelativo(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const seg = Math.round((Date.now() - d.getTime()) / 1000);
  if (seg < 60) return "agora";
  const min = Math.round(seg / 60);
  if (min < 60) return `há ${min} min`;
  const horas = Math.round(min / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  if (dias === 1) return "ontem";
  if (dias < 7) return `há ${dias} dias`;
  if (dias < 30) {
    const semanas = Math.round(dias / 7);
    return semanas === 1 ? "há 1 semana" : `há ${semanas} semanas`;
  }
  const meses = Math.round(dias / 30);
  if (meses < 12) return meses === 1 ? "há 1 mês" : `há ${meses} meses`;
  const anos = Math.round(meses / 12);
  return anos === 1 ? "há 1 ano" : `há ${anos} anos`;
}

/**
 * Status exibido quando a planilha não diz nada.
 *
 * Todo card carrega badge, sempre. Com o badge condicional, pedido sem status
 * ficava sem nenhum — e a fila virava uma mistura de cards com e sem marcador,
 * que é justamente o que atrapalha a leitura em varredura. "Aberto" também é a
 * informação certa: ninguém olhou ainda.
 */
const STATUS_PADRAO = "Aberto";

/**
 * Cor do Badge por status.
 *
 * A planilha é texto livre — o mantenedor escreve o que quiser na coluna
 * `status`. O casamento é por trecho, não por valor exato, e o que não bate cai
 * no neutro: um valor novo escrito lá não pode quebrar a tela nem inventar
 * semântica de cor que ninguém pediu.
 */
function corDoStatus(
  status: string,
): "success" | "warning" | "critical" | "info" | "secondary" {
  const s = status.trim().toLowerCase();
  // "Aberto" é o estado que PEDE ação do mantenedor — ninguém triou ainda. Era
  // neutro e sumia no card; âmbar é a cor certa e resolve o "muito apagado".
  if (!s || s === STATUS_PADRAO.toLowerCase()) return "warning";
  if (s.includes("feito") || s.includes("pronto") || s.includes("entregue"))
    return "success";
  if (s.includes("recusad") || s.includes("cancelad")) return "critical";
  if (s.includes("andamento") || s.includes("fazendo")) return "info";
  if (s.includes("anális") || s.includes("analis") || s.includes("avaliando"))
    return "info";
  return "secondary";
}

/**
 * Cor do badge de tipo.
 *
 * Status e tipo podem coexistir coloridos porque as FORMAS os separam: status é
 * pílula, tipo é retângulo. Sem essa distinção, dois chips coloridos lado a lado
 * viram uma faixa só e o olho não sabe qual é qual.
 */
function corDoTipo(tipo: string): "primary" | "info" | "secondary" {
  const t = tipo.toLowerCase();
  if (t.includes("novo")) return "primary";
  if (t.includes("ajuste")) return "info";
  return "secondary";
}

/** Alias local, como no `ComponentsOverviewDoc`: o `LucideIcon` exportado pelo
 *  pacote é namespace, não tipo — usá-lo em anotação dá TS2709. */
type IconeLucide = ComponentType<{
  strokeWidth?: number;
  "aria-hidden"?: boolean;
}>;

/** Ícone por tipo. O tipo vem de um select fechado, mas a planilha é editável na
 *  mão — então qualquer valor fora da lista cai no ponto de interrogação. */
function iconeDoTipo(tipo: string): IconeLucide {
  const t = tipo.toLowerCase();
  if (t.includes("novo")) return Package;
  if (t.includes("ajuste")) return Wrench;
  if (t.includes("exemplo") || t.includes("tela")) return LayoutTemplate;
  return CircleHelp;
}

/** Item de metadado: ícone apagado + valor. Mesma receita do `renderOrderCard`
 *  dos exemplos de List, pra fila e catálogo lerem igual. */
function Meta({ icone, children }: { icone: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-gp-xs text-body-sm text-fg-muted [&>svg]:size-icon-sm [&>svg]:shrink-0 [&>svg]:text-fg-subtle">
      {icone}
      {children}
    </span>
  );
}

export function SolicitarComponenteDoc() {
  const [form, setForm] = useState(VAZIO);
  const [envio, setEnvio] = useState<EstadoEnvio>("parado");
  const [erroEnvio, setErroEnvio] = useState("");
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const [itens, setItens] = useState<Solicitacao[]>([]);
  const [lista, setLista] = useState<EstadoLista>("carregando");

  /** Armadilha de bot: fica fora do fluxo visual e do foco. Humano não
   *  preenche; robô que varre o HTML preenche. O endpoint responde "ok" e
   *  descarta em silêncio, pra não ensinar o robô a contornar. */
  const armadilha = useRef("");

  const carregar = useCallback(async () => {
    setLista("carregando");
    try {
      const resposta = await fetch(ENDPOINT);
      const dados = await resposta.json();
      if (!dados?.ok) throw new Error("resposta sem ok");
      setItens(Array.isArray(dados.itens) ? dados.itens : []);
      setLista("pronta");
    } catch {
      setLista("erro");
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const faltando = useMemo(
    () => ({
      nome: !form.nome.trim(),
      assunto: !form.assunto.trim(),
      descricao: !form.descricao.trim(),
    }),
    [form],
  );

  const incompleto = faltando.nome || faltando.assunto || faltando.descricao;

  function alterar(campo: keyof typeof VAZIO, valor: string) {
    setForm((atual) => ({ ...atual, [campo]: valor }));
    if (envio === "enviado" || envio === "erro") setEnvio("parado");
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setTentouEnviar(true);
    if (incompleto) return;

    setEnvio("enviando");
    setErroEnvio("");

    try {
      const resposta = await fetch(ENDPOINT, {
        method: "POST",
        // Ver o aviso no topo do arquivo antes de mudar este cabeçalho.
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ ...form, website: armadilha.current }),
      });
      const dados = await resposta.json();

      if (!dados?.ok) {
        setErroEnvio(ERROS[dados?.erro] ?? "Não consegui enviar. Tente de novo.");
        setEnvio("erro");
        return;
      }

      setForm(VAZIO);
      setTentouEnviar(false);
      setEnvio("enviado");

      // A confirmação de verdade é o item aparecer na lista. A planilha leva um
      // instante pra refletir a escrita, daí a espera antes de reler.
      window.setTimeout(() => void carregar(), 1200);
    } catch {
      setErroEnvio(
        "Não consegui falar com o servidor. Verifique sua conexão e tente de novo.",
      );
      setEnvio("erro");
    }
  }

  return (
    <DocLayout
      toc={[
        { id: "pedido", label: "Fazer um pedido" },
        { id: "fila", label: "Pedidos abertos" },
      ]}
    >
      <DocHeader
        category="Get Started"
        title="Solicitar componente"
        description="Precisa de algo que ainda não existe no DS? Descreve aqui em vez de mandar mensagem — o pedido fica registrado, visível pra todo mundo, e ninguém pede duas vezes a mesma coisa."
      />
      <DocSeparator />

      {/* Aviso de visibilidade. Com lista pública, avisar É a medida de
          proteção — não existe outra. Fica ANTES do formulário de propósito:
          depois dele, a pessoa já escreveu. */}
      <div
        role="note"
        className="mb-12 flex items-start gap-gp-md rounded-radius-lg border border-border-warning-muted bg-bg-warning-muted p-pad-2xl"
      >
        <CircleAlert
          className="mt-px size-icon-sm shrink-0 text-fg-warning"
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <div className="flex flex-col gap-gp-2xs">
          <span className="text-body-sm font-semibold text-fg-default">
            Tudo que você escrever aqui fica visível para qualquer pessoa que abrir
            o showcase.
          </span>
          <span className="text-body-sm text-fg-muted">
            Não coloque dado de cliente, credencial, link interno com token nem print
            com informação sensível. Se precisar mostrar algo assim, escreva o pedido
            sem o dado e mande o material pelo Teams.
          </span>
        </div>
      </div>

      <SectionH2 id="pedido" title="Fazer um pedido" />

      <form onSubmit={enviar} className="mb-16 flex flex-col gap-form-gap" noValidate>
        <div className="grid gap-form-gap md:grid-cols-2">
          <FormFieldInput
            label="Seu nome"
            required
            value={form.nome}
            onChange={(e) => alterar("nome", e.target.value)}
            placeholder="Como te achamos no Teams"
            maxLength={80}
            state={tentouEnviar && faltando.nome ? "error" : "default"}
            errorMessage="Diga quem está pedindo — é como voltamos pra você."
            disabled={envio === "enviando"}
          />
          <FormFieldSelect
            label="Tipo"
            placeholder="Selecione…"
            options={TIPOS}
            value={form.tipo}
            onValueChange={(v) => alterar("tipo", v)}
            disabled={envio === "enviando"}
          />
        </div>

        <FormFieldInput
          label="Assunto"
          required
          value={form.assunto}
          onChange={(e) => alterar("assunto", e.target.value)}
          placeholder="Resuma em uma linha, ex.: campo de busca com filtro por período"
          maxLength={120}
          state={tentouEnviar && faltando.assunto ? "error" : "default"}
          errorMessage="Um título curto ajuda a não duplicar pedido."
          disabled={envio === "enviando"}
        />

        <FormFieldTextarea
          label="Descrição"
          required
          rows={6}
          value={form.descricao}
          onChange={(e) => alterar("descricao", e.target.value)}
          placeholder={
            "O que você precisa, em que tela vai usar, e o que já tentou usar no lugar.\n\nQuanto mais concreto, menos ida e volta — se puder, descreva o comportamento (o que acontece ao clicar, o que muda)."
          }
          maxLength={4000}
          helperText="Aceita várias linhas. As quebras são preservadas."
          state={tentouEnviar && faltando.descricao ? "error" : "default"}
          errorMessage="Descreva o que você precisa."
          disabled={envio === "enviando"}
        />

        <div className="grid gap-form-gap md:grid-cols-2">
          <FormFieldInput
            label="Projeto"
            value={form.projeto}
            onChange={(e) => alterar("projeto", e.target.value)}
            placeholder="Onde isso vai ser usado"
            maxLength={80}
            disabled={envio === "enviando"}
          />
          <FormFieldInput
            label="Link de referência"
            type="url"
            value={form.referencia}
            onChange={(e) => alterar("referencia", e.target.value)}
            placeholder="https://…"
            maxLength={500}
            helperText="Print ou exemplo. Suba no Teams e cole o link — a página não recebe arquivo."
            disabled={envio === "enviando"}
          />
        </div>

        {/* Armadilha. `sr-only` em vez de `hidden` porque um campo com
            display:none é ignorado por parte dos robôs — e é justamente ele
            que a gente quer que seja preenchido. */}
        <div className="sr-only" aria-hidden="true">
          <label htmlFor="website-solicitacao">Não preencha este campo</label>
          <input
            id="website-solicitacao"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
            onChange={(e) => {
              armadilha.current = e.target.value;
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-gp-lg">
          <Button
            type="submit"
            loading={envio === "enviando"}
            iconLeft={<Send strokeWidth={1.8} aria-hidden="true" />}
          >
            Enviar pedido
          </Button>

          {envio === "enviado" && (
            <span
              role="status"
              className="text-body-sm font-medium text-fg-success"
            >
              Pedido registrado. Ele aparece na lista abaixo em instantes.
            </span>
          )}
          {envio === "erro" && (
            <span role="alert" className="text-body-sm font-medium text-fg-danger">
              {erroEnvio}
            </span>
          )}
        </div>
      </form>

      <SectionH2 id="fila" title="Pedidos abertos" />

      <div className="mb-gp-lg flex items-center justify-between gap-gp-md">
        <span className="text-body-sm text-fg-muted">
          {lista === "pronta"
            ? `${itens.length} ${itens.length === 1 ? "pedido" : "pedidos"} — do mais recente para o mais antigo.`
            : "Carregando os pedidos…"}
        </span>
        <Button
          type="button"
          variant="ghost"
          color="secondary"
          size="sm"
          onClick={() => void carregar()}
          loading={lista === "carregando"}
          iconLeft={<RefreshCw strokeWidth={1.8} aria-hidden="true" />}
        >
          Atualizar
        </Button>
      </div>

      {/* Falha de leitura não pode derrubar o formulário: quem veio pedir tem
          que conseguir pedir mesmo com a lista fora do ar. */}
      {lista === "erro" && (
        <div
          role="alert"
          className="flex flex-col items-center gap-gp-sm rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-3xl text-center"
        >
          <span className="text-body-md font-medium text-fg-default">
            Não consegui carregar a lista
          </span>
          <span className="text-body-sm text-fg-muted">
            O envio de pedidos continua funcionando normalmente. Tente atualizar em
            alguns instantes.
          </span>
        </div>
      )}

      {lista === "pronta" && itens.length === 0 && (
        <div className="flex flex-col items-center gap-gp-sm rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-3xl text-center">
          <Inbox
            className="size-icon-lg text-fg-subtle"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span className="text-body-md font-medium text-fg-default">
            Nenhum pedido ainda
          </span>
          <span className="text-body-sm text-fg-muted">
            O seu pode ser o primeiro.
          </span>
        </div>
      )}

      {lista === "pronta" && itens.length > 0 && (
        <ul className="flex flex-col gap-gp-md">
          {itens.map((item, i) => (
            <li
              key={`${item.data}-${i}`}
              // Receita do card do `#/list-rich`, medida no browser: sombra
              // própria, borda mais forte no escuro (L-009 — `subtle` some no
              // fundo escuro) e elevação no hover. Sem a sombra o card fica
              // chapado contra a página, que era a diferença visual maior.
              className="flex flex-col gap-gp-md rounded-radius-lg border border-border-subtle bg-bg-surface p-pad-xl shadow-sh-sm transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-border-default hover:shadow-sh-md dark:border-border-default dark:hover:bg-bg-canvas"
            >
              {/* Assunto e tipo à esquerda, status encostado na direita. O
                  status é a coluna que o olho percorre de cima a baixo pra
                  triar a fila — alinhado, ele vira uma coluna de verdade; solto
                  no meio do fluxo, muda de posição a cada card. */}
              <div className="flex items-start justify-between gap-gp-md">
                <div className="flex min-w-0 flex-wrap items-center gap-gp-sm">
                  <span className="text-body-md font-semibold text-fg-default">
                    {item.assunto}
                  </span>
                  {item.tipo &&
                    (() => {
                      const IconeTipo = iconeDoTipo(item.tipo);
                      return (
                        // `soft`, não `outline`: contorno fino com texto
                        // discreto tem contraste baixo demais pra um rótulo
                        // que a pessoa precisa ler de relance.
                        <Badge
                          color={corDoTipo(item.tipo)}
                          variant="soft"
                          size="sm"
                        >
                          <IconeTipo strokeWidth={1.8} aria-hidden={true} />
                          {item.tipo}
                        </Badge>
                      );
                    })()}
                </div>

                {/* `shape="pill"` no status e shape padrão no tipo é o que o
                    JSDoc do próprio Badge prescreve: pílula para status chip,
                    retângulo para tag inline. */}
                <Badge
                  color={corDoStatus(item.status)}
                  variant="soft"
                  size="sm"
                  shape="pill"
                  className="shrink-0"
                >
                  {item.status.trim() || STATUS_PADRAO}
                </Badge>
              </div>

              <p className="whitespace-pre-line text-body-sm leading-relaxed text-fg-muted">
                {item.descricao}
              </p>

              {/* Rodapé numa linha só, na ordem quem → quando → onde. O nome vem
                  primeiro porque é o que a pessoa procura quando quer conversar
                  sobre o pedido; o resto é contexto. */}
              <div className="mt-gp-xs flex flex-wrap items-center gap-x-gp-2xl gap-y-gp-xs border-t border-border-subtle pt-pad-xl">
                <Meta icone={<User />}>
                  <span className="font-medium text-fg-default">{item.nome}</span>
                </Meta>
                {/* Data de inserção por extenso. O relativo ("há 8 h") fica no
                    `title`: numa fila que anda devagar, saber QUANDO entrou vale
                    mais do que há quanto tempo — e o relativo perde resolução
                    assim que passa de algumas semanas. */}
                <Meta icone={<CalendarDays />}>
                  <span className="tabular-nums" title={tempoRelativo(item.data)}>
                    {formatarData(item.data)}
                  </span>
                </Meta>
                {item.projeto && <Meta icone={<FolderOpen />}>{item.projeto}</Meta>}
                {item.referencia && (
                  <Meta icone={<Link2 />}>
                    {/* `noopener` e `noreferrer` porque o link vem de terceiro:
                        sem eles a página de destino recebe `window.opener` e
                        pode navegar esta aba pra onde quiser. */}
                    <a
                      href={item.referencia}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="rounded-radius-sm text-fg-brand underline underline-offset-2 transition-colors hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
                    >
                      referência
                    </a>
                  </Meta>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </DocLayout>
  );
}

export default SolicitarComponenteDoc;
