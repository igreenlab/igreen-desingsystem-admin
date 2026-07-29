/**
 * showcase-registration — verifica a **superfície 4 da L-042** de um componente:
 * Doc page + rota no App.tsx + entrada na nav. Puro, zero I/O.
 *
 * Por que existe: componente com `<Nome>Doc.tsx` criada mas não roteada faz a
 * rota abrir **em branco** em produção. Já aconteceu (L-042).
 *
 * ⚠️ O id kebab aparece em DOIS lugares no App.tsx, com formatos diferentes:
 *     DOC_PAGES →   "spinner",                                  (string sozinha)
 *     render    →   {activePage === "spinner" && <SpinnerDoc />}
 * Um grep genérico pelo id passa se estiver só no DOC_PAGES — e a rota AINDA
 * abre em branco. Por isso os dois são checados separadamente.
 *
 * ⚠️ ASSIMETRIA DELIBERADA — 3 edições no App.tsx, 4 checks aqui, e o import
 * não é nenhum deles. A superfície 4 da L-042 exige **três** edições no
 * `App.tsx` (o `import { <Nome>Doc } from "./preview/pages/<Nome>Doc"`, o
 * `DOC_PAGES` e o render) — é isso que as skills, o template de PR e o
 * CONTRIBUTING mandam. Este módulo emite **quatro** checks (`doc-page`,
 * `app-doc-pages`, `app-render`, `nav`) e o import fica de fora **de
 * propósito**: `<NomeDoc />` sem import não compila, então o `tsc` já reprova
 * alto e claro, e o gate mecânico só cobre o que falha em **silêncio**.
 * Não "conserte" uma contagem pela outra: checar import aqui duplicaria o
 * Typecheck; baixar a doc pra duas edições produziria arquivo que não compila.
 *
 * NÃO checa `ComponentsOverviewDoc`: não consta na L-042 como superfície
 * obrigatória e o arquivo tem ~13 lacunas pré-existentes. Fica advisory, no
 * checklist do revisor.
 *
 * ⚠️ PREMISSA: `name` chega em PascalCase (nome da pasta em `src/components/ui/`).
 * `toKebab` só insere hífen em transição minúscula/dígito→maiúscula — um nome
 * que já é kebab (ou misto) passa por ele inalterado, o que pode não ser o id
 * real do componente. Hoje existe exatamente **um** violador no repo:
 * `avatar-ig` (pasta não-PascalCase), cujo id real é `"avatar"` — não
 * `"avatar-ig"`. Isso não é alcançado em produção porque a Task 4 só roda o
 * check em pasta NOVA (diff), e `avatar-ig` já existe; a Task 4 pula e avisa
 * (não reprova errado) quando a pasta não é PascalCase. Reportar isso em
 * silêncio é como o `ChoroplethMap` sumiu da main por meses sem nenhum sinal
 * disparar (L-058) — por isso a premissa fica documentada aqui, e não
 * corrigida com um parâmetro de override não usado por ninguém hoje (YAGNI).
 */
import { isException } from "./ds-exceptions.mjs";

/** PascalCase → kebab (DataList → data-list). Assume `pascalName` em PascalCase —
 * ver premissa acima; nome já-kebab (ex.: `avatar-ig`) volta inalterado. */
export function toKebab(pascalName) {
  return pascalName.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * `toKebab` assume que `folderName` chega em PascalCase (ver premissa no topo
 * do arquivo) — uma pasta fora desse padrão (ex.: `avatar-ig`, já kebab) gera
 * um id ERRADO, então checar essa pasta com `checkRegistration` produziria
 * uma reprovação bogus. Quem consome isto (Task 4/`showcase-check.mjs`) usa
 * o retorno pra decidir PULAR a checagem — nunca pra falhar.
 */
export function isPascalCase(folderName) {
  return /^[A-Z]/.test(folderName);
}

/** Escapa o id pra uso literal em RegExp. */
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * @param {object} p
 * @param {string} p.name       nome PascalCase da pasta do componente
 * @param {boolean} p.docExists se src/preview/pages/<Nome>Doc.tsx existe
 * @param {string} p.appTsx     conteúdo de src/App.tsx
 * @param {string} p.navData    conteúdo de doc-nav-data.ts
 * @returns {Array<{id: string, what: string, fix: string}>} vazio = ok
 */
export function checkRegistration({ name, docExists, appTsx, navData }) {
  const id = toKebab(name);
  if (isException(id)) return [];

  const faltas = [];
  const eid = esc(id);

  if (!docExists) {
    faltas.push({
      id: "doc-page",
      what: `src/preview/pages/${name}Doc.tsx não existe`,
      fix: `criar src/preview/pages/${name}Doc.tsx`,
    });
  }

  // DOC_PAGES: string sozinha na linha (`  "empty-state",`). Ancorado em ^/$ pra
  // não casar com a linha do render, que contém o mesmo id.
  if (!new RegExp(`^\\s*"${eid}",?\\s*$`, "m").test(appTsx)) {
    faltas.push({
      id: "app-doc-pages",
      what: `id "${id}" ausente do array DOC_PAGES em src/App.tsx`,
      fix: `adicionar "${id}", ao DOC_PAGES`,
    });
  }

  // render: a cascata de activePage.
  if (!new RegExp(`activePage === "${eid}"`).test(appTsx)) {
    faltas.push({
      id: "app-render",
      what: `id "${id}" sem branch de render em src/App.tsx — a rota #/${id} abre EM BRANCO`,
      fix: `adicionar {activePage === "${id}" && <${name}Doc />}`,
    });
  }

  if (!new RegExp(`href:\\s*"${eid}"`).test(navData)) {
    faltas.push({
      id: "nav",
      what: `sem entrada em doc-nav-data.ts`,
      fix: `adicionar { label: "...", href: "${id}" }`,
    });
  }

  return faltas;
}
