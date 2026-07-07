// Líder PRO — espelha a view real `LEADERPRO` (server mode no legado).
// Schema: nivel · consultor(id) · nome · celular · graduacao · trabalho_pessoal ·
// linhas_de_pro · meta_campanha (idconsultor + dtref ocultos). Tudo mockado.

export type Graduacao =
  | "CONSULTOR SENIOR"
  | "GESTOR GREEN"
  | "EXECUTIVO GREEN"
  | "DIRETOR GREEN"
  | "PRESIDENTE GREEN";

export const GRADUACOES: Graduacao[] = [
  "CONSULTOR SENIOR",
  "GESTOR GREEN",
  "EXECUTIVO GREEN",
  "DIRETOR GREEN",
  "PRESIDENTE GREEN",
];

export interface LiderProRow {
  id: string;
  nivel: number;
  consultor: number;
  nome: string;
  celular: string;
  graduacao: Graduacao;
  trabalhoPessoal: "Sim" | "Não";
  linhasDePro: number;
  metaCampanha: number;
  atingimento: number; // % da meta (linhasDePro / metaCampanha)
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

const METAS = [10, 12, 15, 18, 20, 25];

const N = 64;

export const lideresPro: LiderProRow[] = Array.from({ length: N }, (_, i) => {
  const meta = METAS[i % METAS.length];
  // atingimento variado: alguns batem/superam, outros ficam abaixo
  const fator = [0.4, 0.7, 1.0, 1.3, 0.55, 0.9, 1.1, 0.25][i % 8];
  const linhas = Math.round(meta * fator);
  return {
    id: `lp-${String(i + 1).padStart(3, "0")}`,
    nivel: 1 + (i % 6),
    consultor: 70000 + i * 91,
    nome: `${FIRST[i % FIRST.length]} ${LAST[(i * 7) % LAST.length]}`,
    celular: `(11) 9${String(7000 + i).padStart(4, "0")}-${String(
      1000 + ((i * 37) % 9000),
    ).padStart(4, "0")}`,
    graduacao: GRAD_POOL[(i * 11) % GRAD_POOL.length],
    trabalhoPessoal: i % 3 === 0 ? "Não" : "Sim",
    linhasDePro: linhas,
    metaCampanha: meta,
    atingimento: Math.round((linhas / meta) * 100),
  };
});

export const totalLideres = lideresPro.length;

export function liderProKpis() {
  const linhas = lideresPro.reduce((a, r) => a + r.linhasDePro, 0);
  const meta = lideresPro.reduce((a, r) => a + r.metaCampanha, 0);
  const bateram = lideresPro.filter((r) => r.linhasDePro >= r.metaCampanha).length;
  return { linhas, meta, bateram, total: lideresPro.length };
}

export function num(v: number): string {
  return v.toLocaleString("pt-BR");
}
