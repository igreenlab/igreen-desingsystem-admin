import { useEffect, useRef, useState } from "react";
import { Plus, Send, Sparkles, CheckCircle2, ArrowLeft, Paperclip, X, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/shadcn/tabs";
import { Input } from "@/components/shadcn/input";
import { Switch } from "@/components/shadcn/switch";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/avatar-ig";
import { FormFieldInput, FormFieldSelect, FormFieldTextarea } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { FERRAMENTAS_CATALOG, type ToolDef } from "~/nav/ferramentas-data";

/** Cor do badge por tag — "Novo" em destaque (brand), "Popular" em âmbar. */
const TAG_TONE: Record<string, string> = {
  Novo: "bg-bg-brand-subtle text-fg-brand",
  Popular: "bg-bg-warning-muted text-fg-warning",
};

const CATEGORIAS = [
  { value: "vendas", label: "Vendas & Prospecção" },
  { value: "gestao", label: "Gestão da rede" },
  { value: "comunicacao", label: "Comunicação" },
  { value: "financeiro", label: "Financeiro" },
  { value: "treinamento", label: "Treinamento" },
  { value: "outro", label: "Outro" },
];

/** Badge de contagem usado no label das abas. */
function CountBadge({ n }: { n: number }) {
  return (
    <span className="rounded-radius-full bg-bg-muted px-pad-sm py-[1px] text-caption-sm tabular-nums text-fg-muted">
      {n}
    </span>
  );
}

type View = "catalog" | "form" | "success";

export function FerramentasCatalogDialog({
  open,
  onOpenChange,
  enabledIds,
  onToggle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  enabledIds: string[];
  onToggle: (id: string) => void;
}) {
  const [view, setView] = useState<View>("catalog");
  const [tab, setTab] = useState("adicionados");
  const [query, setQuery] = useState("");
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [anexo, setAnexo] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Snapshot das "Disponíveis" congelado a cada abertura: ferramentas que NÃO
  // estavam ativas quando o modal abriu. Ativar uma durante a sessão não a tira
  // da lista (sem o efeito de "marcou e sumiu"); ela só sai na próxima abertura.
  const [availableSnapshot, setAvailableSnapshot] = useState<string[]>([]);
  useEffect(() => {
    if (open) {
      setAvailableSnapshot(
        FERRAMENTAS_CATALOG.filter((t) => !enabledIds.includes(t.id)).map((t) => t.id),
      );
    }
    // só recalcula na transição de abertura — não reativo a enabledIds
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetRequest = () => {
    setView("catalog");
    setNome("");
    setCategoria("");
    setDescricao("");
    setAnexo("");
  };

  // Fechar o modal sempre reseta a visão (não reabre no formulário/sucesso/busca).
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      resetRequest();
      setQuery("");
      setTab("adicionados");
    }
    onOpenChange(next);
  };

  const q = query.trim().toLowerCase();
  const matchesQuery = (t: ToolDef) =>
    !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);

  const added = FERRAMENTAS_CATALOG.filter((t) => enabledIds.includes(t.id));
  const addedShown = added.filter(matchesQuery);
  // Disponíveis = não-ativas no momento da abertura (snapshot congelado).
  const available = FERRAMENTAS_CATALOG.filter((t) => availableSnapshot.includes(t.id));
  const availableShown = available.filter(matchesQuery);

  const renderTool = (tool: ToolDef) => {
    const enabled = enabledIds.includes(tool.id);
    const Icon = tool.icon;
    return (
      <label
        key={tool.id}
        htmlFor={`tool-${tool.id}`}
        className={cn(
          "flex cursor-pointer items-start gap-gp-lg rounded-radius-lg border bg-bg-surface p-pad-2xl transition-colors",
          enabled
            ? "border-border-brand bg-bg-brand-subtle/30"
            : "border-border-subtle hover:bg-bg-muted",
        )}
      >
        <span
          className="flex size-comp-md shrink-0 items-center justify-center rounded-radius-md [&>svg]:size-icon-md [&>svg]:text-white"
          style={{ backgroundColor: tool.color }}
          aria-hidden
        >
          <Icon />
        </span>

        <div className="flex min-w-0 flex-1 flex-col gap-gp-2xs">
          <span className="flex items-center gap-gp-xs">
            <span className="truncate text-body-md font-semibold text-fg-default">{tool.name}</span>
            {tool.tag && (
              <span
                className={cn(
                  "shrink-0 rounded-radius-sm px-pad-sm py-[1px] text-caption-sm font-semibold",
                  TAG_TONE[tool.tag] ?? "bg-bg-muted text-fg-muted",
                )}
              >
                {tool.tag}
              </span>
            )}
          </span>
          <span className="text-body-sm text-fg-muted">{tool.description}</span>
        </div>

        <Switch
          id={`tool-${tool.id}`}
          checked={enabled}
          onCheckedChange={() => onToggle(tool.id)}
          className="mt-[2px] shrink-0"
        />
      </label>
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[760px]">
        {/* ───────── Catálogo ───────── */}
        {view === "catalog" && (
          <>
            <DialogHeader>
              <DialogTitle>Ferramentas</DialogTitle>
              <DialogDescription>
                Ative só as ferramentas que fazem sentido pra você — elas aparecem como atalhos no
                menu. {added.length} ativada{added.length === 1 ? "" : "s"}.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-gp-lg">
              {/* Busca */}
              <div className="relative">
                <Search className="pointer-events-none absolute left-pad-xl top-1/2 size-icon-sm -translate-y-1/2 text-fg-muted" aria-hidden />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar ferramenta por nome ou descrição…"
                  className="pl-[40px]"
                />
              </div>

              {/* Abas */}
              <Tabs value={tab} onValueChange={setTab} className="flex flex-col gap-gp-lg">
                <TabsList>
                  <TabsTrigger value="adicionados" className="flex items-center gap-gp-xs">
                    Adicionados <CountBadge n={added.length} />
                  </TabsTrigger>
                  <TabsTrigger value="disponiveis" className="flex items-center gap-gp-xs">
                    Disponíveis <CountBadge n={available.length} />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="adicionados" className="max-h-[48vh] overflow-y-auto pr-pad-xs">
                  {addedShown.length > 0 ? (
                    <div className="grid grid-cols-1 gap-gp-md sm:grid-cols-2">{addedShown.map(renderTool)}</div>
                  ) : (
                    <p className="rounded-radius-lg border border-dashed border-border-subtle px-pad-xl py-pad-2xl text-center text-body-sm text-fg-muted">
                      {q ? "Nenhuma ferramenta ativada com esse termo." : "Nenhuma ferramenta ativada ainda — ative na aba Disponíveis."}
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="disponiveis" className="max-h-[48vh] overflow-y-auto pr-pad-xs">
                  {availableShown.length > 0 ? (
                    <div className="grid grid-cols-1 gap-gp-md sm:grid-cols-2">{availableShown.map(renderTool)}</div>
                  ) : (
                    <p className="rounded-radius-lg border border-dashed border-border-subtle px-pad-xl py-pad-2xl text-center text-body-sm text-fg-muted">
                      Nenhuma ferramenta encontrada com esse termo.
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            <DialogFooter className="border-t border-border-subtle pt-pad-4xl">
              <div className="flex w-full flex-wrap items-center justify-between gap-gp-md">
                <span className="flex items-center gap-gp-sm text-body-sm text-fg-muted">
                  <Sparkles className="size-icon-sm shrink-0 text-fg-brand" aria-hidden />
                  Não encontrou a ferramenta que precisa?
                </span>
                <Button color="secondary" variant="outline" size="sm" iconLeft={<Plus />} onClick={() => setView("form")}>
                  Solicitar ferramenta
                </Button>
              </div>
            </DialogFooter>
          </>
        )}

        {/* ───────── Formulário de solicitação ───────── */}
        {view === "form" && (
          <>
            <DialogHeader>
              <button
                type="button"
                onClick={() => setView("catalog")}
                className="mb-gp-xs flex w-fit items-center gap-gp-2xs text-caption-md font-medium text-fg-muted transition-colors hover:text-fg-default focus-visible:outline-none"
              >
                <ArrowLeft className="size-icon-xs" aria-hidden /> Voltar ao catálogo
              </button>
              <DialogTitle>Solicitar ferramenta</DialogTitle>
              <DialogDescription>
                Conte o que você precisa — a equipe avalia e, fazendo sentido, adiciona ao catálogo.
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[58vh] flex-col gap-form-gap overflow-y-auto pr-pad-xs">
              {/* Solicitante */}
              <div className="flex flex-col gap-gp-xs">
                <span className="text-body-sm font-semibold tracking-[0.01em] text-fg-default dark:text-fg-muted">
                  Solicitante
                </span>
                <div className="flex items-center gap-gp-sm rounded-radius-md border border-border-subtle bg-bg-muted px-pad-xl py-pad-md">
                  <Avatar size="sm" color="brand">JM</Avatar>
                  <div className="flex flex-col leading-tight">
                    <span className="text-body-sm font-medium text-fg-default">João Mendes Rodrigues</span>
                    <span className="text-caption-sm text-fg-muted">Executivo Green · Uberlândia/MG · #10240</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-form-gap sm:grid-cols-2">
                <FormFieldInput
                  label="Ferramenta desejada"
                  placeholder="Ex.: Agenda de visitas"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
                <FormFieldSelect
                  label="Categoria"
                  placeholder="Selecione…"
                  options={CATEGORIAS}
                  value={categoria}
                  onValueChange={setCategoria}
                />
              </div>

              <FormFieldTextarea
                label="O que ela resolveria?"
                placeholder="Descreva a necessidade, o problema que resolve e como você usaria…"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="min-h-[96px]"
              />

              {/* Anexo */}
              <div className="flex flex-col gap-gp-xs">
                <span className="text-body-sm font-semibold tracking-[0.01em] text-fg-default dark:text-fg-muted">
                  Anexo de referência <span className="font-normal text-fg-muted">(opcional)</span>
                </span>
                <label
                  htmlFor="ferramenta-anexo"
                  className="flex min-h-form-lg cursor-pointer items-center gap-gp-sm rounded-radius-md border border-border-default bg-bg-surface px-pad-xl text-body-sm text-fg-muted transition-colors hover:bg-bg-muted"
                >
                  <Paperclip className="size-icon-sm shrink-0" aria-hidden />
                  <span className="truncate">{anexo || "Anexar imagem, print ou PDF…"}</span>
                  {anexo && (
                    <button
                      type="button"
                      aria-label="Remover anexo"
                      className="ml-auto shrink-0 text-fg-muted hover:text-fg-danger"
                      onClick={(e) => {
                        e.preventDefault();
                        setAnexo("");
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      <X className="size-icon-xs" />
                    </button>
                  )}
                </label>
                <input
                  ref={fileRef}
                  id="ferramenta-anexo"
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={(e) => setAnexo(e.target.files?.[0]?.name ?? "")}
                />
              </div>
            </div>

            <DialogFooter className="flex-row items-center justify-end gap-gp-md border-t border-border-subtle pt-pad-xl">
              <Button color="secondary" variant="ghost" size="sm" onClick={() => setView("catalog")}>
                Cancelar
              </Button>
              <Button
                color="primary"
                variant="filled"
                size="sm"
                iconLeft={<Send />}
                disabled={nome.trim().length === 0}
                onClick={() => setView("success")}
              >
                Enviar solicitação
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ───────── Sucesso ───────── */}
        {view === "success" && (
          <>
            <DialogHeader>
              <DialogTitle>Solicitação enviada</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-gp-lg py-pad-4xl text-center">
              <span className="grid size-comp-xl place-items-center rounded-radius-full bg-bg-success-muted text-fg-success">
                <CheckCircle2 className="size-icon-lg" aria-hidden />
              </span>
              <div className="flex flex-col gap-gp-2xs">
                <p className="text-title-md font-semibold text-fg-default">Recebemos sua sugestão! 💚</p>
                <p className="max-w-[420px] text-body-sm text-fg-muted">
                  {nome ? `"${nome}" foi enviada pra avaliação da equipe.` : "Enviado pra avaliação da equipe."}{" "}
                  Se entrar no catálogo, você é avisado.
                </p>
              </div>
              <Button color="primary" variant="filled" size="sm" onClick={resetRequest}>
                Voltar ao catálogo
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
