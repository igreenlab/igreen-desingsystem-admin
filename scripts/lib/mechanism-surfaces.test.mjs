import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { FATOS, checkMechanismSurfaces } from "./mechanism-surfaces.mjs";

/* ═══════════════════════════════════════════════════════════════════════════
   Leitura do estado REAL (só aqui — o módulo é puro)
   ═══════════════════════════════════════════════════════════════════════════ */

function ler(arquivo) {
  return existsSync(arquivo) ? readFileSync(arquivo, "utf8") : null;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Fixtures do HISTÓRICO — o conteúdo que de fato foi publicado errado
   ═══════════════════════════════════════════════════════════════════════════

   Gate escrito a partir do mesmo modelo mental que gerou o código concorda por
   construção (L-064). Estas duas fixtures são o conteúdo REAL das versões quebradas,
   extraído dos commits que as corrigiram:

   - `84515b4^` — `cli/templates/default/_claude/rules/ds-design.md`, que dizia
     "❌ **nenhuma**" na linha do submódulo. Reproduzido abaixo com o blockquote
     preservado, porque é justamente o `>` que expôs o bug da minha primeira
     implementação de `linhasDeTabela`.
   - `3fef6c7^` — `.claude/skills/app-builder/SKILL.md`, que tinha **zero** ocorrências
     de `single`: a skill roteava só a MenuSidebar. Verificado com
     `git show '3fef6c7^:.claude/skills/app-builder/SKILL.md' | grep -c single` → 0.
   ═══════════════════════════════════════════════════════════════════════════ */

/** Trecho literal de `ds-design.md` em 84515b4^ (tabela dentro de blockquote). */
const DS_DESIGN_QUEBRADO = `
  > **O que de fato te impede, por canal** — a frase antiga aqui era só "(Um hook bloqueia isso.)", sem ressalva, e no submódulo isso é **falso**:
  >
  > | canal | trava |
  > |---|---|
  > | copy-in / scaffold | ✅ hook \`protect-ds.mjs\` **bloqueia** (\`Edit\`/\`Write\`/\`MultiEdit\`) e **avisa** em \`Bash\` que escreve nesses paths |
  > | **submódulo** | ❌ **nenhuma** — o \`ds-link\` não projeta \`hooks/\` (eles miram \`src/components/**\`, layout que o submódulo não tem). Vale por **disciplina**: o que você editar lá some no próximo \`git pull\` do submódulo |
  > | npm install | ❌ nenhuma — o código vive em \`node_modules\` |
`;

/** `app-builder/SKILL.md` em 3fef6c7^ não citava a Single de forma alguma. */
const APP_BUILDER_QUEBRADO = `
# app-builder — Esqueleto de aplicação (repo DS)

## Fluxo
1. **Leia** \`src/examples/app-shell/\`: \`nav-data.ts\`, \`routes.tsx\`.
2. Adapte os contextos do rail (MenuSidebar) e o mapa de rotas.
`;

/** Leitor que substitui UM arquivo pelo conteúdo quebrado, mantendo o resto real. */
function lerCom(substituicoes) {
  return (arquivo) =>
    Object.prototype.hasOwnProperty.call(substituicoes, arquivo)
      ? substituicoes[arquivo]
      : ler(arquivo);
}

/* ═══════════════════════════════════════════════════════════════════════════
   Estado atual: tem de estar limpo
   ═══════════════════════════════════════════════════════════════════════════ */

describe("mechanism-surfaces — estado atual do repo", () => {
  it("toda superfície declarada afirma o mecanismo que descreve", () => {
    const { achados } = checkMechanismSurfaces(FATOS, ler);
    const msg = achados
      .map((a) => `[${a.tipo}] ${a.arquivo} — ${a.o_que}\n     → ${a.conserto}`)
      .join("\n");
    expect(achados, `\n${msg}\n`).toEqual([]);
  });

  it("verifica de fato as superfícies (não passa por lista vazia)", () => {
    const { verificados } = checkMechanismSurfaces(FATOS, ler);
    // 3 superfícies do fato do AppShell + 2 do fato do submódulo.
    expect(verificados).toBe(5);
  });

  it("todo arquivo de mecanismo e de superfície existe no disco", () => {
    const declarados = FATOS.flatMap((f) => [
      ...f.mecanismo.map((m) => m.arquivo),
      ...f.superficies.map((s) => s.arquivo),
    ]);
    expect(declarados.filter((a) => !existsSync(a))).toEqual([]);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   Reprodução dos defeitos reais — o gate só está pronto se reprovar estes
   ═══════════════════════════════════════════════════════════════════════════ */

describe("mechanism-surfaces — reprova o conteúdo que foi publicado errado", () => {
  it('pega o "❌ nenhuma" do submódulo na ds-design.md (CLI 0.25.0/0.25.1, commit 84515b4^)', () => {
    const alvo = "cli/templates/default/_claude/rules/ds-design.md";
    const { achados } = checkMechanismSurfaces(
      FATOS,
      lerCom({ [alvo]: DS_DESIGN_QUEBRADO }),
    );
    const meus = achados.filter((a) => a.arquivo === alvo);
    expect(meus).toHaveLength(1);
    expect(meus[0].tipo).toBe("afirmacao-ausente");
    expect(meus[0].o_que).toContain("submódulo");
  });

  it("pega a tabela em blockquote — o `>` não pode esconder a linha", () => {
    // Esta é a asserção que a MINHA primeira implementação falhava: ela exigia que a
    // linha começasse com `|` e ignorava a tabela inteira da ds-design.md.
    const semBlockquote = DS_DESIGN_QUEBRADO.replace(/^\s*>\s?/gm, "");
    const alvo = "cli/templates/default/_claude/rules/ds-design.md";
    const comBq = checkMechanismSurfaces(FATOS, lerCom({ [alvo]: DS_DESIGN_QUEBRADO }));
    const semBq = checkMechanismSurfaces(FATOS, lerCom({ [alvo]: semBlockquote }));
    expect(comBq.achados.filter((a) => a.arquivo === alvo)).toHaveLength(1);
    expect(semBq.achados.filter((a) => a.arquivo === alvo)).toHaveLength(1);
  });

  it("pega a app-builder/SKILL.md que não citava a Single (commit 3fef6c7^)", () => {
    const alvo = ".claude/skills/app-builder/SKILL.md";
    const { achados } = checkMechanismSurfaces(
      FATOS,
      lerCom({ [alvo]: APP_BUILDER_QUEBRADO }),
    );
    const meus = achados.filter((a) => a.arquivo === alvo);
    expect(meus).toHaveLength(1);
    expect(meus[0].tipo).toBe("afirmacao-ausente");
  });

  it("pega a MESMA falta nas 3 superfícies do fato de uma vez", () => {
    const vazio = "# vazio\n";
    const { achados } = checkMechanismSurfaces(
      FATOS,
      lerCom({
        ".claude/skills/app-builder/SKILL.md": vazio,
        "cli/templates/default/_claude/skills/app-builder/SKILL.md": vazio,
        "cli/templates/default/_claude/rules/ds-components.md": vazio,
      }),
    );
    expect(
      achados.filter((a) => a.fato === "appshell-monta-sidebar-single"),
    ).toHaveLength(3);
  });
});

/* ═══════════════════════════════════════════════════════════════════════════
   O fato não pode virar no-op em silêncio (L-061)
   ═══════════════════════════════════════════════════════════════════════════ */

describe("mechanism-surfaces — premissa do mecanismo", () => {
  it("acusa quando a sonda do mecanismo deixa de casar", () => {
    const alvo = "src/components/ui/AppShell/app-shell.types.ts";
    const { achados } = checkMechanismSurfaces(
      FATOS,
      lerCom({ [alvo]: "export type AppShellProps = { sidebar?: never };\n" }),
    );
    const premissa = achados.filter((a) => a.tipo === "premissa-sumiu");
    expect(premissa).toHaveLength(1);
    expect(premissa[0].arquivo).toBe(alvo);
  });

  it("premissa caída NÃO cobra asserção das superfícies (evitaria pedir mentira)", () => {
    const alvo = "src/components/ui/AppShell/app-shell.types.ts";
    const { achados } = checkMechanismSurfaces(
      FATOS,
      lerCom({
        [alvo]: "export type AppShellProps = { sidebar?: never };\n",
        ".claude/skills/app-builder/SKILL.md": "# vazio\n",
      }),
    );
    expect(
      achados.filter((a) => a.arquivo === ".claude/skills/app-builder/SKILL.md"),
    ).toEqual([]);
  });

  it("acusa arquivo de mecanismo inexistente em vez de passar calado", () => {
    const { achados } = checkMechanismSurfaces(
      [
        {
          nome: "fato-orfao",
          afirmacao: "x",
          mecanismo: [{ arquivo: "scripts/lib/nao-existe.mjs", presente: /x/, o_que: "x" }],
          superficies: [{ arquivo: "CLAUDE.md", exige: /x/, dica: "x" }],
        },
      ],
      ler,
    );
    expect(achados).toHaveLength(1);
    expect(achados[0].tipo).toBe("premissa-sumiu");
  });

  it("acusa superfície que sumiu do disco", () => {
    const { achados } = checkMechanismSurfaces(
      [
        {
          nome: "fato-com-superficie-morta",
          afirmacao: "x",
          mecanismo: [
            {
              arquivo: "src/components/ui/AppShell/app-shell.types.ts",
              presente: /sidebar:\s*"single";/,
              o_que: "x",
            },
          ],
          superficies: [{ arquivo: ".claude/skills/nao-existe/SKILL.md", exige: /x/, dica: "x" }],
        },
      ],
      ler,
    );
    expect(achados).toHaveLength(1);
    expect(achados[0].tipo).toBe("superficie-sumiu");
  });
});
