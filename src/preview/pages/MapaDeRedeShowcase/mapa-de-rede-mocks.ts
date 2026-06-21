import type { FilterableField, DataListView } from "@/components/ui/DataList";
import type { Consultor, Graduacao, Regiao } from "./mapa-de-rede.types";

/** Meta de graduação → label + cor do Chip (tokens DS). */
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

export const REGIAO: Record<Regiao, string> = {
  sudeste: "Sudeste",
  sul: "Sul",
  nordeste: "Nordeste",
  "centro-oeste": "Centro-Oeste",
  norte: "Norte",
};

const CIDADES: Record<Regiao, string[]> = {
  sudeste: [
    "São Paulo, SP",
    "Campinas, SP",
    "Rio de Janeiro, RJ",
    "Belo Horizonte, MG",
  ],
  sul: [
    "Curitiba, PR",
    "Porto Alegre, RS",
    "Florianópolis, SC",
    "Londrina, PR",
  ],
  nordeste: ["Recife, PE", "Salvador, BA", "Fortaleza, CE", "Natal, RN"],
  "centro-oeste": [
    "Goiânia, GO",
    "Brasília, DF",
    "Cuiabá, MT",
    "Campo Grande, MS",
  ],
  norte: ["Manaus, AM", "Belém, PA", "Porto Velho, RO", "Palmas, TO"],
};

/** Paleta de cores de avatar (hex) — o Avatar calcula contraste do texto (L-027). */
const COLORS = [
  "#2E7D32",
  "#1565C0",
  "#6A1B9A",
  "#C62828",
  "#EF6C00",
  "#00838F",
  "#AD1457",
  "#4527A0",
  "#283593",
  "#558B0F",
  "#D84315",
  "#00695C",
];

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

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** Texto do agregado da subárvore (ex: "28 consult · 1.240 GP · 96 clientes"). */
export function subtreeLabel(c: Consultor): string {
  if (!c.subtree) return "folha · sem descendentes";
  const { consultores, gp, clientes } = c.subtree;
  return `${formatNum(consultores)} consult · ${formatNum(gp)} GP · ${formatNum(clientes)} clientes`;
}

/* ── builder conciso (deriva email/phone/cidade/since/cor) ────────── */

const D = (y: number, m: number, d: number) => new Date(y, m - 1, d).getTime();
type Raw = Omit<Consultor, "subtree" | "children"> & { children?: Raw[] };
let _seq = 0;

type Spec = {
  name: string;
  level: string;
  grad: Graduacao;
  regiao: Regiao;
  gp: number;
  clientes: number;
  pro: boolean;
  lastActive: string;
  since: [number, number, number];
  children?: Raw[];
};

function n(s: Spec): Raw {
  _seq += 1;
  const first = s.name.split(" ")[0].toLowerCase();
  const last = (s.name.split(" ")[1] ?? "ig").toLowerCase();
  return {
    id: `c${_seq}`,
    name: s.name,
    level: s.level,
    graduacao: s.grad,
    regiao: s.regiao,
    gpProprio: s.gp,
    clientes: s.clientes,
    pro: s.pro,
    avatarColor: COLORS[(_seq - 1) % COLORS.length],
    email: `${first}.${last}@igreen.com`,
    phone: `(${10 + (_seq % 89)}) 9${1000 + ((_seq * 37) % 9000)}-${1000 + ((_seq * 53) % 9000)}`,
    location: CIDADES[s.regiao][_seq % CIDADES[s.regiao].length],
    since: D(...s.since),
    lastActive: s.lastActive,
    children: s.children,
  };
}

/* ── rede (multi-raiz: linhas/líderes diretos, cada um com downline) ── */

const ROOTS: Raw[] = [
  n({
    name: "Marina Alves",
    level: "Líder",
    grad: "presidente",
    regiao: "sudeste",
    gp: 431,
    clientes: 18,
    pro: true,
    lastActive: "agora há pouco",
    since: [2020, 2, 10],
    children: [
      n({
        name: "Rafael Souza",
        level: "N1",
        grad: "diretor",
        regiao: "sudeste",
        gp: 320,
        clientes: 14,
        pro: true,
        lastActive: "2 h",
        since: [2020, 9, 4],
        children: [
          n({
            name: "Bianca Lima",
            level: "N2",
            grad: "gestor",
            regiao: "sudeste",
            gp: 180,
            clientes: 11,
            pro: true,
            lastActive: "ontem",
            since: [2021, 5, 2],
            children: [
              n({
                name: "Caio Moreira",
                level: "N3",
                grad: "senior",
                regiao: "sudeste",
                gp: 90,
                clientes: 6,
                pro: false,
                lastActive: "3 dias",
                since: [2022, 1, 14],
              }),
              n({
                name: "Duda Prado",
                level: "N3",
                grad: "pleno",
                regiao: "sudeste",
                gp: 50,
                clientes: 4,
                pro: false,
                lastActive: "1 semana",
                since: [2022, 8, 9],
              }),
            ],
          }),
          n({
            name: "Felipe Aragão",
            level: "N2",
            grad: "senior",
            regiao: "sul",
            gp: 70,
            clientes: 5,
            pro: false,
            lastActive: "5 dias",
            since: [2022, 3, 20],
          }),
        ],
      }),
      n({
        name: "Paula Castro",
        level: "N1",
        grad: "gestor",
        regiao: "sudeste",
        gp: 210,
        clientes: 9,
        pro: true,
        lastActive: "4 h",
        since: [2021, 1, 30],
        children: [
          n({
            name: "Gustavo Reis",
            level: "N2",
            grad: "pleno",
            regiao: "sudeste",
            gp: 60,
            clientes: 3,
            pro: false,
            lastActive: "2 dias",
            since: [2022, 6, 1],
          }),
          n({
            name: "Helena Vega",
            level: "N2",
            grad: "junior",
            regiao: "sudeste",
            gp: 25,
            clientes: 1,
            pro: false,
            lastActive: "2 semanas",
            since: [2023, 2, 18],
          }),
        ],
      }),
    ],
  }),
  n({
    name: "Diego Fernandes",
    level: "Líder",
    grad: "presidente",
    regiao: "sul",
    gp: 388,
    clientes: 16,
    pro: true,
    lastActive: "1 h",
    since: [2020, 4, 22],
    children: [
      n({
        name: "Letícia Rocha",
        level: "N1",
        grad: "diretor",
        regiao: "sul",
        gp: 250,
        clientes: 12,
        pro: true,
        lastActive: "30 min",
        since: [2021, 2, 8],
        children: [
          n({
            name: "Tiago Nunes",
            level: "N2",
            grad: "gestor",
            regiao: "sul",
            gp: 120,
            clientes: 8,
            pro: true,
            lastActive: "ontem",
            since: [2021, 11, 17],
            children: [
              n({
                name: "Vera Antunes",
                level: "N3",
                grad: "senior",
                regiao: "sul",
                gp: 70,
                clientes: 5,
                pro: false,
                lastActive: "4 dias",
                since: [2022, 9, 3],
              }),
            ],
          }),
          n({
            name: "Sofia Martins",
            level: "N2",
            grad: "senior",
            regiao: "sul",
            gp: 85,
            clientes: 7,
            pro: false,
            lastActive: "6 dias",
            since: [2022, 5, 11],
          }),
        ],
      }),
      n({
        name: "Otávio Belo",
        level: "N1",
        grad: "gestor",
        regiao: "sul",
        gp: 140,
        clientes: 6,
        pro: false,
        lastActive: "3 dias",
        since: [2021, 7, 25],
        children: [
          n({
            name: "Iara Costa",
            level: "N2",
            grad: "pleno",
            regiao: "sul",
            gp: 55,
            clientes: 3,
            pro: false,
            lastActive: "1 semana",
            since: [2022, 10, 2],
          }),
        ],
      }),
    ],
  }),
  n({
    name: "Beatriz Nogueira",
    level: "Líder",
    grad: "diretor",
    regiao: "nordeste",
    gp: 296,
    clientes: 13,
    pro: true,
    lastActive: "20 min",
    since: [2020, 8, 14],
    children: [
      n({
        name: "André Maia",
        level: "N1",
        grad: "gestor",
        regiao: "nordeste",
        gp: 160,
        clientes: 10,
        pro: true,
        lastActive: "2 h",
        since: [2021, 4, 6],
        children: [
          n({
            name: "Júlia Pires",
            level: "N2",
            grad: "senior",
            regiao: "nordeste",
            gp: 80,
            clientes: 6,
            pro: false,
            lastActive: "2 dias",
            since: [2022, 2, 21],
          }),
          n({
            name: "Kevin Sá",
            level: "N2",
            grad: "pleno",
            regiao: "nordeste",
            gp: 45,
            clientes: 2,
            pro: false,
            lastActive: "5 dias",
            since: [2022, 12, 8],
          }),
        ],
      }),
      n({
        name: "Carla Dantas",
        level: "N1",
        grad: "senior",
        regiao: "nordeste",
        gp: 95,
        clientes: 5,
        pro: false,
        lastActive: "1 dia",
        since: [2021, 9, 19],
      }),
    ],
  }),
  n({
    name: "Eduardo Tavares",
    level: "Líder",
    grad: "diretor",
    regiao: "centro-oeste",
    gp: 248,
    clientes: 11,
    pro: true,
    lastActive: "1 h",
    since: [2020, 11, 3],
    children: [
      n({
        name: "Mariana Goia",
        level: "N1",
        grad: "gestor",
        regiao: "centro-oeste",
        gp: 130,
        clientes: 7,
        pro: true,
        lastActive: "3 h",
        since: [2021, 6, 12],
        children: [
          n({
            name: "Nina Brito",
            level: "N2",
            grad: "pleno",
            regiao: "centro-oeste",
            gp: 50,
            clientes: 3,
            pro: false,
            lastActive: "4 dias",
            since: [2022, 7, 28],
          }),
        ],
      }),
      n({
        name: "Paulo Henrique",
        level: "N1",
        grad: "senior",
        regiao: "centro-oeste",
        gp: 78,
        clientes: 4,
        pro: false,
        lastActive: "1 semana",
        since: [2021, 12, 1],
      }),
    ],
  }),
  n({
    name: "Camila Ribeiro",
    level: "Líder",
    grad: "gestor",
    regiao: "sudeste",
    gp: 184,
    clientes: 8,
    pro: false,
    lastActive: "2 dias",
    since: [2021, 3, 9],
    children: [
      n({
        name: "Renato Lopes",
        level: "N1",
        grad: "senior",
        regiao: "sudeste",
        gp: 90,
        clientes: 5,
        pro: false,
        lastActive: "3 dias",
        since: [2021, 10, 14],
        children: [
          n({
            name: "Sara Quintela",
            level: "N2",
            grad: "junior",
            regiao: "sudeste",
            gp: 20,
            clientes: 1,
            pro: false,
            lastActive: "2 semanas",
            since: [2023, 1, 30],
          }),
        ],
      }),
    ],
  }),
  n({
    name: "Lucas Amorim",
    level: "Líder",
    grad: "gestor",
    regiao: "norte",
    gp: 152,
    clientes: 7,
    pro: true,
    lastActive: "5 h",
    since: [2021, 5, 27],
    children: [
      n({
        name: "Tainá Albuquerque",
        level: "N1",
        grad: "pleno",
        regiao: "norte",
        gp: 60,
        clientes: 3,
        pro: false,
        lastActive: "6 dias",
        since: [2022, 4, 4],
      }),
      n({
        name: "Wesley Farias",
        level: "N1",
        grad: "junior",
        regiao: "norte",
        gp: 28,
        clientes: 2,
        pro: false,
        lastActive: "3 semanas",
        since: [2023, 3, 16],
      }),
    ],
  }),
];

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

/** Árvore do Mapa de Rede (multi-raiz — suas linhas diretas). */
export const NETWORK: Consultor[] = ROOTS.map(enrich);

/** Lookup id → consultor (pro painel de detalhe). */
export function findConsultor(
  nodes: Consultor[],
  id: string,
): Consultor | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const r = findConsultor(node.children, id);
      if (r) return r;
    }
  }
  return null;
}

/** Conta total de consultores na rede (badge do header). */
export function countNetwork(nodes: Consultor[]): number {
  return nodes.reduce(
    (acc, node) => acc + 1 + (node.children ? countNetwork(node.children) : 0),
    0,
  );
}

/* ── toolbar: filtros + visões ────────────────────────────────────── */

export const FILTER_FIELDS: FilterableField[] = [
  {
    id: "graduacao",
    label: "Graduação",
    type: "select",
    accessor: (i) => (i.data as Consultor).graduacao,
    options: (Object.keys(GRADUACAO) as Graduacao[]).map((g) => ({
      value: g,
      label: GRADUACAO[g].label,
    })),
  },
  {
    id: "regiao",
    label: "Região",
    type: "select",
    accessor: (i) => (i.data as Consultor).regiao,
    options: (Object.keys(REGIAO) as Regiao[]).map((r) => ({
      value: r,
      label: REGIAO[r],
    })),
  },
  {
    id: "pro",
    label: "Plano PRO",
    type: "boolean",
    accessor: (i) => (i.data as Consultor).pro,
  },
];

export const VIEWS: DataListView[] = [
  {
    id: "pro",
    label: "PRO",
    query: {
      search: "",
      filterModel: {
        logicOperator: "AND",
        items: [
          { id: "vpro", field: "pro", operator: "equals", value: "true" },
        ],
      },
    },
  },
  {
    id: "diretoria",
    label: "Diretoria",
    query: {
      search: "",
      filterModel: {
        logicOperator: "AND",
        items: [
          {
            id: "vd1",
            field: "graduacao",
            operator: "isAnyOf",
            value: "presidente",
          },
          {
            id: "vd2",
            field: "graduacao",
            operator: "isAnyOf",
            value: "diretor",
          },
        ],
      },
    },
  },
  {
    id: "sudeste",
    label: "Sudeste",
    query: {
      search: "",
      filterModel: {
        logicOperator: "AND",
        items: [
          { id: "vse", field: "regiao", operator: "equals", value: "sudeste" },
        ],
      },
    },
  },
];
