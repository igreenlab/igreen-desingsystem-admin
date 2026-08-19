import { describe, it, expect } from "vitest";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  INLINE_MAX,
  blocosDeActions,
  analisarBloco,
  checkActionsColumnCanon,
  formatar,
} from "./actions-column-canon.mjs";

/* ═══════════════════════════════════════════════════════════════════════════
   Leitura do estado REAL (só aqui — o módulo é puro)
   ═══════════════════════════════════════════════════════════════════════════ */

/** Todo .tsx de showcase e exemplos — é onde as skills mandam espelhar. */
function fontes() {
  const raizes = ["src/preview/pages", "src/examples"];
  const out = [];
  const anda = (d) => {
    if (!existsSync(d)) return;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = join(d, e.name).replace(/\\/g, "/");
      if (e.isDirectory()) anda(p);
      else if (/\.tsx$/.test(e.name) && !/\.test\./.test(e.name)) {
        out.push({ arquivo: p, fonte: readFileSync(p, "utf8") });
      }
    }
  };
  raizes.forEach(anda);
  return out;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Estado atual: tem de estar limpo
   ═══════════════════════════════════════════════════════════════════════════ */

describe("actions-column-canon — estado atual do repo", () => {
  const r = checkActionsColumnCanon(fontes());

  it("nenhuma coluna de ações do showcase/exemplos contraria o default", () => {
    expect(r.achados, `\n${formatar(r.achados).join("\n")}\n`).toEqual([]);
  });

  it("conferiu de fato (não passa por varredura vazia)", () => {
    // Medido em 2026-08-18: 6 blocos `type: "actions"` em preview/ + examples/.
    // Piso folgado — o objetivo é pegar o gate virando no-op (L-061).
    expect(r.blocosConferidos).toBeGreaterThanOrEqual(4);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Os defeitos REAIS de 2026-08-18 — fixtures do conteúdo que estava no repo
   ═══════════════════════════════════════════════════════════════════════════ */

/** `ClientesShowcase` antes do conserto: width 64 + comentário + 4× showInMenu. */
const CLIENTES_ANTES = `
const columns = [
  { field: "name", headerName: "Licenciado", width: 240 },
  {
    field: "_actions",
    headerName: "",
    type: "actions",
    // \`width\` fica: \`actions\` é tipo ESTRUTURAL e não está no registry, então não tem
    // \`defaultWidth\` — sem isto a largura depende do autoFit.
    width: 64,
    getActions: ({ row }) => [
      { id: "edit", label: "Editar", showInMenu: true, onClick: () => {} },
      { id: "whatsapp", label: "WhatsApp", showInMenu: true, onClick: () => {} },
      { id: "archive", label: "Arquivar", showInMenu: true, onClick: () => {} },
      { id: "delete", label: "Excluir", showInMenu: true, destructive: true, onClick: () => {} },
    ],
  },
];
`;

/** `finance` antes: width 40 — ABAIXO dos 44px de 1 slot, comprimia o botão. */
const FINANCE_ANTES = `
  {
    field: "_actions",
    headerName: "",
    type: "actions",
    width: 40,
    getActions: ({ row }) => [
      { id: "edit", label: "Editar", showInMenu: true, onClick: () => {} },
      { id: "dup", label: "Duplicar", showInMenu: true, onClick: () => {} },
      { id: "archive", label: "Arquivar", showInMenu: true, onClick: () => {} },
      { id: "delete", label: "Excluir", showInMenu: true, destructive: true, onClick: () => {} },
    ],
  },
`;

describe("actions-column-canon — reprova o que estava no repo", () => {
  it("pega os DOIS defeitos do ClientesShowcase de uma vez", () => {
    const r = checkActionsColumnCanon([{ arquivo: "ClientesShowcase.tsx", fonte: CLIENTES_ANTES }]);
    expect(r.achados.map((a) => a.tipo).sort()).toEqual([
      "showInMenu-redundante",
      "width-em-actions",
    ]);
    expect(formatar(r.achados).join("\n")).toContain("NÃO passe width");
  });

  it("pega o width: 40 do finance (que comprimia o botão de 28 → 24px)", () => {
    const r = checkActionsColumnCanon([{ arquivo: "finance-screen.tsx", fonte: FINANCE_ANTES }]);
    expect(r.achados.some((a) => a.tipo === "width-em-actions")).toBe(true);
  });

  it("a forma CORRIGIDA passa", () => {
    const corrigido = FINANCE_ANTES.replace(/^\s*width: 40,\r?\n/m, "").replace(
      /\s*showInMenu: true,/g,
      "",
    );
    expect(checkActionsColumnCanon([{ arquivo: "x.tsx", fonte: corrigido }]).achados).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   O que NÃO deve reprovar — override legítimo
   ═══════════════════════════════════════════════════════════════════════════ */

describe("actions-column-canon — override legítimo não é acusado", () => {
  it("split PARCIAL é deliberado (o ClientsCRUDServerPreview demonstra isso)", () => {
    const fonte = `
      { field: "_actions", headerName: "", type: "actions",
        getActions: () => [
          { id: "view", label: "Ver", onClick: () => {} },
          { id: "edit", label: "Editar", onClick: () => {} },
          { id: "dup", label: "Duplicar", showInMenu: true, onClick: () => {} },
          { id: "del", label: "Excluir", showInMenu: true, onClick: () => {} },
        ],
      },
    `;
    expect(checkActionsColumnCanon([{ arquivo: "x.tsx", fonte }]).achados).toEqual([]);
  });

  it("TODAS no menu com ≤3 ações é override legítimo — o default renderia inline", () => {
    const fonte = `
      { field: "_actions", headerName: "", type: "actions",
        getActions: () => [
          { id: "a", label: "A", showInMenu: true, onClick: () => {} },
          { id: "b", label: "B", showInMenu: true, onClick: () => {} },
        ],
      },
    `;
    expect(checkActionsColumnCanon([{ arquivo: "x.tsx", fonte }]).achados).toEqual([]);
  });

  it("coluna sem `type: actions` é ignorada", () => {
    const fonte = `{ field: "acoes", headerName: "Ações", width: 200, render: () => null },`;
    expect(checkActionsColumnCanon([{ arquivo: "x.tsx", fonte }]).blocosConferidos).toBe(0);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   O extrator — a parte que errei duas vezes antes de escrever o gate
   ═══════════════════════════════════════════════════════════════════════════ */

describe("blocosDeActions — brace-matching, não janela fixa", () => {
  it("não vaza pro código vizinho (o bug das '12 ações' onde havia 4)", () => {
    const fonte = `
      { field: "_actions", type: "actions",
        getActions: () => [
          { id: "a", label: "A", onClick: () => {} },
        ],
      },
      // código DEPOIS da coluna — não pode entrar na contagem
      const outraCoisa = [
        { id: "x1" }, { id: "x2" }, { id: "x3" }, { id: "x4" }, { id: "x5" },
      ];
    `;
    const b = blocosDeActions(fonte);
    expect(b).toHaveLength(1);
    expect(analisarBloco(b[0]).acoes).toBe(1);
  });

  it("acha múltiplos blocos no mesmo arquivo", () => {
    const um = `{ field: "a", type: "actions", getActions: () => [{ id: "x", onClick: () => {} }] },`;
    expect(blocosDeActions(um + "\n" + um)).toHaveLength(2);
  });

  it("arquivo sem coluna de ações devolve vazio", () => {
    expect(blocosDeActions('const x = { type: "text" };')).toEqual([]);
  });

  it("INLINE_MAX espelha o componente", () => {
    const src = readFileSync("src/components/ui/DataTable/utils/action-slots.ts", "utf8");
    const doComponente = Number(
      (src.match(/ACTIONS_INLINE_MAX\s*=\s*(\d+)/) || [])[1],
    );
    expect(INLINE_MAX).toBe(doComponente);
  });
});
