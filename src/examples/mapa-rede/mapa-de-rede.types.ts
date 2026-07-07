/** Graduação do consultor na rede (ranking). */
export type Graduacao =
  | "presidente"
  | "diretor"
  | "gestor"
  | "senior"
  | "pleno"
  | "junior";

/** Região comercial (filtro). */
export type Regiao = "sudeste" | "sul" | "nordeste" | "centro-oeste" | "norte";

/** Agregado da subárvore (descendentes) de um consultor. `null` = folha. */
export type Subtree = {
  /** Nº de consultores descendentes (toda a subárvore). */
  consultores: number;
  /** GP somado da subárvore. */
  gp: number;
  /** Clientes somados da subárvore. */
  clientes: number;
} | null;

/** Um consultor na árvore do Mapa de Rede (nó da hierarquia). */
export type Consultor = {
  id: string;
  name: string;
  /** Rótulo de nível relativo ("Líder", "N1", "N2"...). */
  level: string;
  graduacao: Graduacao;
  regiao: Regiao;
  /** GP gerado pelo próprio consultor. */
  gpProprio: number;
  /** Clientes diretos. */
  clientes: number;
  /** Plano PRO ativo. */
  pro: boolean;
  /** Cor do avatar (hex) — calibrada por contraste no Avatar. */
  avatarColor: string;
  /** Agregado dos descendentes (calculado); `null` em folhas. */
  subtree: Subtree;
  /** Email/contato (detalhe). */
  email: string;
  /** Telefone (detalhe). */
  phone: string;
  /** Cidade/UF (detalhe). */
  location: string;
  /** Consultor desde (ms epoch). */
  since: number;
  /** Última atividade (texto relativo). */
  lastActive: string;
  /** Descendentes diretos. */
  children?: Consultor[];
};
