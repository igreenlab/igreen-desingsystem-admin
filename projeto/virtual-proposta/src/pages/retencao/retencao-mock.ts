// Análise de Retenção PRO — espelha a view/endpoint `/analise-retencao` do
// legado (server mode). Schema real: idconsultor · nome · celular · graduacao ·
// uf · periodo_pro · ultima_graduacao. Tudo mockado, client-side.

export type Graduacao =
  | "CONSULTOR SENIOR"
  | "GESTOR GREEN"
  | "EXECUTIVO GREEN"
  | "DIRETOR GREEN"
  | "PRESIDENTE GREEN";

// Ordem ascendente (menor → maior) — threshold "retirar inferiores à".
export const GRADUACOES: Graduacao[] = [
  "CONSULTOR SENIOR",
  "GESTOR GREEN",
  "EXECUTIVO GREEN",
  "DIRETOR GREEN",
  "PRESIDENTE GREEN",
];

export const UFS = [
  "SP", "RJ", "MG", "ES", "PR", "SC", "RS", "BA", "PE", "CE",
  "GO", "DF", "MT", "MS", "PA", "AM",
] as const;

export type StatusRetencao = "Retido" | "Atenção" | "Em risco";

export interface RetencaoRow {
  id: string;
  idconsultor: number;
  nome: string;
  celular: string;
  graduacao: Graduacao;
  uf: string;
  periodoPro: number; // meses consecutivos como PRO
  ultimaGraduacao: Graduacao;
  status: StatusRetencao;
}

const FIRST = [
  "Ana", "Carlos", "Mariana", "Rafael", "Juliana", "Bruno", "Camila", "Felipe",
  "Larissa", "Gustavo", "Patrícia", "André", "Fernanda", "Thiago", "Beatriz",
  "Rodrigo", "Aline", "Marcelo", "Vanessa", "Diego", "Letícia", "Vinícius",
  "Tatiane", "Eduardo", "Sabrina", "Leonardo", "Priscila", "Henrique",
  "Natália", "Gabriel", "Renata", "Lucas", "Carolina", "Fábio", "Bruna",
  "Ricardo", "Daniela", "Otávio", "Sandra", "Igor",
];
const LAST = [
  "Souza", "Lima", "Ferreira", "Pereira", "Costa", "Alves", "Rodrigues",
  "Santos", "Oliveira", "Nunes", "Gomes", "Martins", "Dias", "Barbosa",
  "Melo", "Carvalho", "Ribeiro", "Teixeira", "Cardoso", "Fernandes",
  "Araújo", "Rocha", "Moreira", "Pinto", "Castro", "Azevedo", "Ramos",
];

const GRAD_POOL: Graduacao[] = [
  ...Array(9).fill("CONSULTOR SENIOR"),
  ...Array(7).fill("GESTOR GREEN"),
  ...Array(5).fill("EXECUTIVO GREEN"),
  ...Array(3).fill("DIRETOR GREEN"),
  ...Array(2).fill("PRESIDENTE GREEN"),
];

const N = 72;

function statusOf(meses: number): StatusRetencao {
  if (meses >= 6) return "Retido";
  if (meses >= 3) return "Atenção";
  return "Em risco";
}

export const retencaoRows: RetencaoRow[] = Array.from({ length: N }, (_, i) => {
  const gradIdx = (i * 11) % GRAD_POOL.length;
  const graduacao = GRAD_POOL[gradIdx];
  const periodoPro = 1 + ((i * 5) % 12); // 1..12 meses, variado
  // última graduação ≥ atual (maior já atingida)
  const atualIdx = GRADUACOES.indexOf(graduacao);
  const ultimaIdx = Math.min(atualIdx + (i % 2), GRADUACOES.length - 1);
  return {
    id: `rt-${String(i + 1).padStart(3, "0")}`,
    idconsultor: 50000 + i * 113,
    nome: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
    celular: `(11) 9${String(6000 + i).padStart(4, "0")}-${String(
      1000 + ((i * 41) % 9000),
    ).padStart(4, "0")}`,
    graduacao,
    uf: UFS[(i * 13) % UFS.length],
    periodoPro,
    ultimaGraduacao: GRADUACOES[ultimaIdx],
    status: statusOf(periodoPro),
  };
});

export const totalRetencao = retencaoRows.length;

export function countBy(
  rows: RetencaoRow[],
  key: (r: RetencaoRow) => string,
): { key: string; total: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) map.set(key(r), (map.get(key(r)) ?? 0) + 1);
  return [...map.entries()]
    .map(([k, total]) => ({ key: k, total }))
    .sort((a, b) => b.total - a.total);
}

export function num(v: number): string {
  return v.toLocaleString("pt-BR");
}
