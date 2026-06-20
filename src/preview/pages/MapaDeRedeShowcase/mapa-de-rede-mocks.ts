import type { Consultor, Graduacao } from "./mapa-de-rede.types";

/** Meta de graduação → label + cor do Chip (tokens DS, não as cores do mock visual). */
export const GRADUACAO: Record<
  Graduacao,
  {
    label: string;
    color: "primary" | "info" | "success" | "warning" | "neutral";
  }
> = {
  presidente: { label: "Presidente", color: "primary" },
  diretor: { label: "Diretor", color: "warning" },
  gestor: { label: "Gestor", color: "info" },
  senior: { label: "Sênior", color: "success" },
  pleno: { label: "Pleno", color: "neutral" },
  junior: { label: "Júnior", color: "neutral" },
};

/** Formata GP/clientes com separador pt-BR (1.240). */
export function formatNum(n: number): string {
  return n.toLocaleString("pt-BR");
}

export function formatLongDate(ms: number): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Texto do agregado da subárvore pro card (ex: "28 consult. · 1.240 GP · 96 clientes"). */
export function subtreeLabel(c: Consultor): string {
  if (!c.subtree) return "folha · sem descendentes";
  const { consultores, gp, clientes } = c.subtree;
  return `${formatNum(consultores)} consult. · ${formatNum(gp)} GP · ${formatNum(clientes)} clientes`;
}

/* ── Árvore crua (subtree é preenchido por enrich()) ──────────────── */

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime();

type Raw = Omit<Consultor, "subtree" | "children"> & { children?: Raw[] };

const ROOT: Raw = {
  id: "voce",
  name: "Você",
  level: "Você",
  graduacao: "presidente",
  gpProprio: 431,
  clientes: 2,
  pro: true,
  email: "voce@igreen.com",
  location: "São Paulo, SP",
  since: D(2021, 3, 12),
  children: [
    {
      id: "n1-marina",
      name: "Marina Alves",
      level: "N1",
      graduacao: "gestor",
      gpProprio: 320,
      clientes: 14,
      pro: true,
      email: "marina.alves@igreen.com",
      location: "Campinas, SP",
      since: D(2021, 8, 4),
      children: [
        {
          id: "n2-rafael",
          name: "Rafael Souza",
          level: "N2",
          graduacao: "senior",
          gpProprio: 90,
          clientes: 6,
          pro: false,
          email: "rafael.souza@igreen.com",
          location: "Sorocaba, SP",
          since: D(2022, 1, 19),
          children: [
            {
              id: "n3-bia",
              name: "Bianca Lima",
              level: "N3",
              graduacao: "pleno",
              gpProprio: 60,
              clientes: 5,
              pro: false,
              email: "bianca.lima@igreen.com",
              location: "Jundiaí, SP",
              since: D(2022, 6, 2),
            },
            {
              id: "n3-caio",
              name: "Caio Moreira",
              level: "N3",
              graduacao: "junior",
              gpProprio: 30,
              clientes: 2,
              pro: false,
              email: "caio.moreira@igreen.com",
              location: "Limeira, SP",
              since: D(2023, 2, 14),
            },
          ],
        },
        {
          id: "n2-paula",
          name: "Paula Castro",
          level: "N2",
          graduacao: "senior",
          gpProprio: 40,
          clientes: 2,
          pro: false,
          email: "paula.castro@igreen.com",
          location: "Ribeirão Preto, SP",
          since: D(2022, 4, 30),
        },
      ],
    },
    {
      id: "n1-diego",
      name: "Diego Fernandes",
      level: "N1",
      graduacao: "diretor",
      gpProprio: 280,
      clientes: 9,
      pro: true,
      email: "diego.fernandes@igreen.com",
      location: "Belo Horizonte, MG",
      since: D(2021, 11, 22),
      children: [
        {
          id: "n2-leticia",
          name: "Letícia Rocha",
          level: "N2",
          graduacao: "gestor",
          gpProprio: 150,
          clientes: 11,
          pro: true,
          email: "leticia.rocha@igreen.com",
          location: "Contagem, MG",
          since: D(2022, 3, 8),
          children: [
            {
              id: "n3-tiago",
              name: "Tiago Nunes",
              level: "N3",
              graduacao: "pleno",
              gpProprio: 70,
              clientes: 4,
              pro: false,
              email: "tiago.nunes@igreen.com",
              location: "Betim, MG",
              since: D(2023, 5, 17),
            },
          ],
        },
        {
          id: "n2-sofia",
          name: "Sofia Martins",
          level: "N2",
          graduacao: "senior",
          gpProprio: 85,
          clientes: 7,
          pro: false,
          email: "sofia.martins@igreen.com",
          location: "Uberlândia, MG",
          since: D(2022, 9, 1),
        },
      ],
    },
  ],
};

/** Preenche `subtree` (agregado dos descendentes) recursivamente. */
function enrich(node: Raw): Consultor {
  if (!node.children?.length) {
    return { ...node, subtree: null } as Consultor;
  }
  const kids = node.children.map(enrich);
  const subtree = kids.reduce(
    (a, k) => ({
      consultores: a.consultores + 1 + (k.subtree?.consultores ?? 0),
      gp: a.gp + k.gpProprio + (k.subtree?.gp ?? 0),
      clientes: a.clientes + k.clientes + (k.subtree?.clientes ?? 0),
    }),
    { consultores: 0, gp: 0, clientes: 0 },
  );
  return { ...node, subtree, children: kids };
}

/** Árvore do Mapa de Rede (1 raiz = "Você"). */
export const NETWORK: Consultor[] = [enrich(ROOT)];

/** Lookup id → consultor (pro painel de detalhe). */
export function findConsultor(
  nodes: Consultor[],
  id: string,
): Consultor | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const r = findConsultor(n.children, id);
      if (r) return r;
    }
  }
  return null;
}

/** Conta total de consultores na rede (pro badge do header). */
export function countNetwork(nodes: Consultor[]): number {
  return nodes.reduce(
    (acc, n) => acc + 1 + (n.children ? countNetwork(n.children) : 0),
    0,
  );
}
