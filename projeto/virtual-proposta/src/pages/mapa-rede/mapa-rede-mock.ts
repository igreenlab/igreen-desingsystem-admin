/* ═══════════════════════════════════════════════════════════════════
   Mock do Mapa de Rede — espelha o NetworkMapNode do projeto original
   (GET /network-map/data). Array FLAT (com `parentId`/`nivel`) → vira
   árvore nos dois modos: tree-data (DataTable) e hierarchical (DataList).
   ═══════════════════════════════════════════════════════════════════ */

export type Graduacao =
  | "Executivo Green"
  | "Líder Green"
  | "Consultor"
  | "Licenciado";

export type TipoLicenca = "PJ" | "PF";
export type StatusLicenca = "Ativa" | "Pendente" | "Vencida";
export type PreQualificacao = "Apto" | "Pendente";

export type MapaRedeNode = {
  id: string;
  idconsultor: number;
  /** Patrocinador (id do pai) — null na raiz. */
  parentId: string | null;
  nivel: number;
  nome: string;
  celular: string;
  cidade: string;
  uf: string;
  graduacao: Graduacao;
  pro: boolean;
  /** GP/GI/GT qualificáveis (kWh). GT = GP + GI. */
  gp: number;
  gi: number;
  bonificavel: number;
  greenPoints: number;
  clientesAtivos: number;
  licenciadosDiretos: number;
  licenciadosDiretosAtivos: number;
  /** Diretos cadastrados no mês. */
  diretosMes: number;
  devolutivas: number;
  agValid: number;
  /** Ligações registradas no nível (novo — substitui "horário" na lista). */
  ligacoes: number;
  tipoLicenca: TipoLicenca;
  statusLicenca: StatusLicenca;
  preQualificacao: PreQualificacao;
  dataAtivo: string;
};

/** Inteiro pt-BR. */
export const formatNum = (n: number) => n.toLocaleString("pt-BR");
export const kwh = (n: number) => `${formatNum(n)} kWh`;

export const GRADUACOES: Graduacao[] = [
  "Executivo Green",
  "Líder Green",
  "Consultor",
  "Licenciado",
];
export const UFS = ["SP", "MG", "PR", "PB", "RS"];

/* helper pra montar nó: deriva bonificavel + campos da view real
   (green points, diretos mês, tipo/status de licença, pré-qualificação)
   de forma determinística — evita editar os 16 nós na mão. */
function node(
  n: Omit<
    MapaRedeNode,
    | "bonificavel"
    | "greenPoints"
    | "diretosMes"
    | "tipoLicenca"
    | "statusLicenca"
    | "preQualificacao"
  >,
): MapaRedeNode {
  const bonificavel = n.gp + n.gi;
  const tipoLicenca: TipoLicenca =
    n.graduacao === "Executivo Green" || n.graduacao === "Líder Green"
      ? "PJ"
      : "PF";
  const statusLicenca: StatusLicenca =
    n.devolutivas > 2 ? "Pendente" : n.clientesAtivos === 0 ? "Vencida" : "Ativa";
  const preQualificacao: PreQualificacao =
    n.pro || n.clientesAtivos >= 10 ? "Apto" : "Pendente";
  return {
    ...n,
    bonificavel,
    greenPoints: Math.round(bonificavel * 0.12),
    diretosMes: n.licenciadosDiretosAtivos > 0 ? n.idconsultor % 3 : 0,
    tipoLicenca,
    statusLicenca,
    preQualificacao,
  };
}

/** Nome do patrocinador (pai) — "Topo" na raiz. */
export function patrocinadorNome(n: MapaRedeNode): string {
  return n.parentId ? (byId[n.parentId]?.nome ?? "—") : "Topo";
}

/* ── dados (flat) — 1 líder (N0) → N1 → N2 → N3 ──────────────────── */
export const mapaRede: MapaRedeNode[] = [
  node({ id: "L-001", idconsultor: 1001, parentId: null, nivel: 0, nome: "Sérgio Vieira", celular: "(31) 99999-0001", cidade: "Belo Horizonte", uf: "MG", graduacao: "Executivo Green", pro: true, gp: 18400, gi: 9200, clientesAtivos: 64, licenciadosDiretos: 8, licenciadosDiretosAtivos: 6, devolutivas: 2, agValid: 3, ligacoes: 142, dataAtivo: "2024-02-10" }),

  // N1
  node({ id: "L-010", idconsultor: 1010, parentId: "L-001", nivel: 1, nome: "Ana Beatriz Carvalho", celular: "(31) 99999-0010", cidade: "Belo Horizonte", uf: "MG", graduacao: "Líder Green", pro: true, gp: 9200, gi: 4100, clientesAtivos: 38, licenciadosDiretos: 5, licenciadosDiretosAtivos: 4, devolutivas: 1, agValid: 1, ligacoes: 88, dataAtivo: "2024-05-21" }),
  node({ id: "L-011", idconsultor: 1011, parentId: "L-001", nivel: 1, nome: "Bruno Henrique Vasconcelos", celular: "(31) 99999-0011", cidade: "Nova Lima", uf: "MG", graduacao: "Líder Green", pro: true, gp: 8600, gi: 3800, clientesAtivos: 31, licenciadosDiretos: 4, licenciadosDiretosAtivos: 3, devolutivas: 0, agValid: 2, ligacoes: 74, dataAtivo: "2024-06-03" }),
  node({ id: "L-012", idconsultor: 1012, parentId: "L-001", nivel: 1, nome: "Camila Fontes Andrade", celular: "(11) 99999-0012", cidade: "São Paulo", uf: "SP", graduacao: "Consultor", pro: false, gp: 5200, gi: 1900, clientesAtivos: 19, licenciadosDiretos: 2, licenciadosDiretosAtivos: 1, devolutivas: 3, agValid: 0, ligacoes: 51, dataAtivo: "2025-01-14" }),

  // N2 sob Ana (L-010)
  node({ id: "L-100", idconsultor: 1100, parentId: "L-010", nivel: 2, nome: "Daniela Souza Lima", celular: "(31) 99999-0100", cidade: "Betim", uf: "MG", graduacao: "Consultor", pro: false, gp: 3300, gi: 1200, clientesAtivos: 14, licenciadosDiretos: 2, licenciadosDiretosAtivos: 2, devolutivas: 1, agValid: 1, ligacoes: 33, dataAtivo: "2025-02-19" }),
  node({ id: "L-101", idconsultor: 1101, parentId: "L-010", nivel: 2, nome: "Eduardo Tavares Pinto", celular: "(31) 99999-0101", cidade: "Contagem", uf: "MG", graduacao: "Licenciado", pro: false, gp: 1800, gi: 600, clientesAtivos: 7, licenciadosDiretos: 1, licenciadosDiretosAtivos: 0, devolutivas: 0, agValid: 2, ligacoes: 18, dataAtivo: "2025-03-30" }),

  // N2 sob Bruno (L-011)
  node({ id: "L-110", idconsultor: 1110, parentId: "L-011", nivel: 2, nome: "Fernanda Rocha Alves", celular: "(31) 99999-0110", cidade: "Uberlândia", uf: "MG", graduacao: "Consultor", pro: true, gp: 4100, gi: 1500, clientesAtivos: 17, licenciadosDiretos: 3, licenciadosDiretosAtivos: 2, devolutivas: 2, agValid: 0, ligacoes: 40, dataAtivo: "2024-11-08" }),
  node({ id: "L-111", idconsultor: 1111, parentId: "L-011", nivel: 2, nome: "Gabriel Martins Reis", celular: "(31) 99999-0111", cidade: "Juiz de Fora", uf: "MG", graduacao: "Licenciado", pro: false, gp: 1200, gi: 300, clientesAtivos: 5, licenciadosDiretos: 0, licenciadosDiretosAtivos: 0, devolutivas: 1, agValid: 1, ligacoes: 11, dataAtivo: "2025-04-02" }),

  // N2 sob Camila (L-012)
  node({ id: "L-120", idconsultor: 1120, parentId: "L-012", nivel: 2, nome: "Helena Campos Dias", celular: "(11) 99999-0120", cidade: "Campinas", uf: "SP", graduacao: "Licenciado", pro: false, gp: 900, gi: 200, clientesAtivos: 3, licenciadosDiretos: 0, licenciadosDiretosAtivos: 0, devolutivas: 0, agValid: 0, ligacoes: 6, dataAtivo: "2025-05-12" }),

  // N3 sob Daniela (L-100)
  node({ id: "L-1000", idconsultor: 11000, parentId: "L-100", nivel: 3, nome: "Igor Almeida Fonseca", celular: "(31) 99999-1000", cidade: "Sete Lagoas", uf: "MG", graduacao: "Licenciado", pro: false, gp: 700, gi: 100, clientesAtivos: 2, licenciadosDiretos: 0, licenciadosDiretosAtivos: 0, devolutivas: 0, agValid: 1, ligacoes: 4, dataAtivo: "2025-05-28" }),
  node({ id: "L-1001", idconsultor: 11001, parentId: "L-100", nivel: 3, nome: "Juliana Ferreira Gomes", celular: "(31) 99999-1001", cidade: "Divinópolis", uf: "MG", graduacao: "Consultor", pro: false, gp: 1500, gi: 400, clientesAtivos: 6, licenciadosDiretos: 1, licenciadosDiretosAtivos: 1, devolutivas: 1, agValid: 0, ligacoes: 15, dataAtivo: "2025-02-02" }),

  // N3 sob Fernanda (L-110)
  node({ id: "L-1100", idconsultor: 11100, parentId: "L-110", nivel: 3, nome: "Lucas Pereira Moraes", celular: "(31) 99999-1100", cidade: "Poços de Caldas", uf: "MG", graduacao: "Consultor", pro: true, gp: 2100, gi: 700, clientesAtivos: 9, licenciadosDiretos: 1, licenciadosDiretosAtivos: 1, devolutivas: 0, agValid: 0, ligacoes: 22, dataAtivo: "2024-12-15" }),

  // outra raiz lateral (Paraná) sob o líder
  node({ id: "L-013", idconsultor: 1013, parentId: "L-001", nivel: 1, nome: "Mariana Castro Teixeira", celular: "(41) 99999-0013", cidade: "Curitiba", uf: "PR", graduacao: "Consultor", pro: false, gp: 4700, gi: 2100, clientesAtivos: 22, licenciadosDiretos: 3, licenciadosDiretosAtivos: 2, devolutivas: 1, agValid: 1, ligacoes: 57, dataAtivo: "2024-09-19" }),
  node({ id: "L-130", idconsultor: 1130, parentId: "L-013", nivel: 2, nome: "Nicolas Barbosa Cruz", celular: "(41) 99999-0130", cidade: "Londrina", uf: "PR", graduacao: "Licenciado", pro: false, gp: 1100, gi: 350, clientesAtivos: 4, licenciadosDiretos: 0, licenciadosDiretosAtivos: 0, devolutivas: 0, agValid: 0, ligacoes: 9, dataAtivo: "2025-03-11" }),
  node({ id: "L-131", idconsultor: 1131, parentId: "L-013", nivel: 2, nome: "Patrícia Mendes Lopes", celular: "(41) 99999-0131", cidade: "Maringá", uf: "PR", graduacao: "Consultor", pro: true, gp: 2600, gi: 900, clientesAtivos: 11, licenciadosDiretos: 2, licenciadosDiretosAtivos: 1, devolutivas: 2, agValid: 1, ligacoes: 28, dataAtivo: "2024-10-25" }),
];

/* ── índices / helpers de árvore ─────────────────────────────────── */
export const byId: Record<string, MapaRedeNode> = Object.fromEntries(
  mapaRede.map((n) => [n.id, n]),
);

/** Caminho raiz→self (pro tree-data do DataTable). */
export function getTreeDataPath(row: MapaRedeNode): string[] {
  const path: string[] = [];
  let cur: MapaRedeNode | undefined = row;
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    path.unshift(cur.id);
    cur = cur.parentId ? byId[cur.parentId] : undefined;
  }
  return path;
}

const childrenIndex: Record<string, MapaRedeNode[]> = {};
for (const n of mapaRede) {
  const key = n.parentId ?? "__root__";
  (childrenIndex[key] ??= []).push(n);
}

/** Nº de descendentes (subárvore inteira). */
export function descendantsCount(id: string): number {
  const kids = childrenIndex[id] ?? [];
  return kids.reduce((acc, k) => acc + 1 + descendantsCount(k.id), 0);
}

/** Rótulo do agregado da subárvore ("N na rede"); "" em folha. */
export function subtreeLabel(node: MapaRedeNode): string {
  const n = descendantsCount(node.id);
  return n > 0 ? `${formatNum(n)} na rede` : "";
}

/** Filhos diretos de um nó. */
export function childrenOf(id: string): MapaRedeNode[] {
  return childrenIndex[id] ?? [];
}

/** Nós raiz (sem patrocinador). */
export const roots: MapaRedeNode[] = childrenIndex["__root__"] ?? [];

/** Total de nós da rede. */
export const totalRede = mapaRede.length;
