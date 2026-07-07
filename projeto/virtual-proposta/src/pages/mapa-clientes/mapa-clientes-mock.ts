/* ═══════════════════════════════════════════════════════════════════
   Mock do Mapa de Clientes — espelha o V_MAPACLIENTES do projeto original
   (lista FLAT de clientes da rede do líder). Tabela densa + lista de cards.
   ═══════════════════════════════════════════════════════════════════ */

export type ClienteStatus = "Ativo" | "Pendente" | "Em análise" | "Cancelado";
export type StatusContrato = "Assinado" | "Pendente" | "Não enviado";
export type StatusFinanceiro = "Em dia" | "Inadimplente" | "—";

/** Campos base (escritos no mock). */
export type BaseCliente = {
  id: string;
  codigo: number;
  nome: string;
  celular: string;
  uf: string;
  distribuidora: string;
  consumoMedio: number;
  status: ClienteStatus;
  statusContrato: StatusContrato;
  statusFinanceiro: StatusFinanceiro;
  andamento: string;
  elegibilidade: boolean;
  cashback: boolean;
  origem: string;
  nomeLicenciado: string;
  nivelRede: number;
  dataCadastro: string;
  dataAtivo: string | null;
};

/** Row completo (base + campos derivados do V_MAPACLIENTES — 30 colunas). */
export type MapaClienteRow = BaseCliente & {
  validadoSucesso: boolean;
  codigoLicenciado: number;
  codigoPatrocinador: number;
  dataNascimento: string;
  instalacao: string;
  contratos: string;
  statusAssinaturaCliente: string;
  dataAssinaturaCliente: string | null;
  statusAssinaturaIgreen: string;
  dataAssinaturaIgreen: string | null;
  observacao: string;
  idconsultor: number;
  linkAssinatura: string;
};

export const num = (n: number) => n.toLocaleString("pt-BR");
export const kwh = (n: number) => `${num(n)} kWh`;

export const UFS = ["SP", "MG", "PR", "PB", "RS"];
export const DISTRIBUIDORAS = ["CEMIG", "Enel SP", "Copel", "Energisa", "RGE"];
export const ORIGENS = ["Indicação", "Orgânico", "Campanha", "Evento"];
export const STATUSES: ClienteStatus[] = ["Ativo", "Pendente", "Em análise", "Cancelado"];

const BASE: BaseCliente[] = [
  { id: "C-3001", codigo: 3001, nome: "Mariana Alves Costa", celular: "(31) 98888-3001", uf: "MG", distribuidora: "CEMIG", consumoMedio: 540, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Indicação", nomeLicenciado: "Ana Beatriz Carvalho", nivelRede: 1, dataCadastro: "2025-02-10", dataAtivo: "2025-03-01" },
  { id: "C-3002", codigo: 3002, nome: "Pedro Henrique Souza", celular: "(31) 98888-3002", uf: "MG", distribuidora: "CEMIG", consumoMedio: 320, status: "Pendente", statusContrato: "Pendente", statusFinanceiro: "—", andamento: "Aguardando troca de titularidade", elegibilidade: true, cashback: false, origem: "Orgânico", nomeLicenciado: "Ana Beatriz Carvalho", nivelRede: 1, dataCadastro: "2025-05-18", dataAtivo: null },
  { id: "C-3003", codigo: 3003, nome: "Juliana Ferreira Lima", celular: "(11) 98888-3003", uf: "SP", distribuidora: "Enel SP", consumoMedio: 880, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Inadimplente", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Campanha", nomeLicenciado: "Camila Fontes Andrade", nivelRede: 2, dataCadastro: "2024-11-22", dataAtivo: "2024-12-15" },
  { id: "C-3004", codigo: 3004, nome: "Carlos Eduardo Pinto", celular: "(41) 98888-3004", uf: "PR", distribuidora: "Copel", consumoMedio: 410, status: "Em análise", statusContrato: "Não enviado", statusFinanceiro: "—", andamento: "Análise de elegibilidade", elegibilidade: false, cashback: false, origem: "Indicação", nomeLicenciado: "Mariana Castro Teixeira", nivelRede: 2, dataCadastro: "2025-06-02", dataAtivo: null },
  { id: "C-3005", codigo: 3005, nome: "Fernanda Rocha Dias", celular: "(31) 98888-3005", uf: "MG", distribuidora: "CEMIG", consumoMedio: 1240, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Evento", nomeLicenciado: "Bruno Henrique Vasconcelos", nivelRede: 1, dataCadastro: "2024-09-05", dataAtivo: "2024-09-28" },
  { id: "C-3006", codigo: 3006, nome: "Rafael Moura Santos", celular: "(11) 98888-3006", uf: "SP", distribuidora: "Enel SP", consumoMedio: 270, status: "Cancelado", statusContrato: "Assinado", statusFinanceiro: "—", andamento: "Cancelado pelo cliente", elegibilidade: true, cashback: false, origem: "Orgânico", nomeLicenciado: "Camila Fontes Andrade", nivelRede: 2, dataCadastro: "2024-10-19", dataAtivo: "2024-11-10" },
  { id: "C-3007", codigo: 3007, nome: "Patrícia Mendes Gomes", celular: "(41) 98888-3007", uf: "PR", distribuidora: "Copel", consumoMedio: 620, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Indicação", nomeLicenciado: "Mariana Castro Teixeira", nivelRede: 2, dataCadastro: "2025-01-14", dataAtivo: "2025-02-08" },
  { id: "C-3008", codigo: 3008, nome: "Lucas Pereira Cruz", celular: "(31) 98888-3008", uf: "MG", distribuidora: "Energisa", consumoMedio: 350, status: "Pendente", statusContrato: "Pendente", statusFinanceiro: "—", andamento: "Aguardando assinatura", elegibilidade: true, cashback: false, origem: "Campanha", nomeLicenciado: "Fernanda Rocha Alves", nivelRede: 2, dataCadastro: "2025-05-29", dataAtivo: null },
  { id: "C-3009", codigo: 3009, nome: "Beatriz Cardoso Melo", celular: "(51) 98888-3009", uf: "RS", distribuidora: "RGE", consumoMedio: 760, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Indicação", nomeLicenciado: "Ana Beatriz Carvalho", nivelRede: 1, dataCadastro: "2024-12-03", dataAtivo: "2024-12-27" },
  { id: "C-3010", codigo: 3010, nome: "Gabriel Nunes Barros", celular: "(11) 98888-3010", uf: "SP", distribuidora: "Enel SP", consumoMedio: 990, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Inadimplente", andamento: "Concluído", elegibilidade: true, cashback: false, origem: "Evento", nomeLicenciado: "Camila Fontes Andrade", nivelRede: 2, dataCadastro: "2024-08-21", dataAtivo: "2024-09-12" },
  { id: "C-3011", codigo: 3011, nome: "Helena Castro Reis", celular: "(31) 98888-3011", uf: "MG", distribuidora: "CEMIG", consumoMedio: 480, status: "Em análise", statusContrato: "Não enviado", statusFinanceiro: "—", andamento: "Validação de documentos", elegibilidade: false, cashback: false, origem: "Orgânico", nomeLicenciado: "Bruno Henrique Vasconcelos", nivelRede: 1, dataCadastro: "2025-06-10", dataAtivo: null },
  { id: "C-3012", codigo: 3012, nome: "Igor Almeida Teixeira", celular: "(41) 98888-3012", uf: "PR", distribuidora: "Copel", consumoMedio: 530, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Indicação", nomeLicenciado: "Mariana Castro Teixeira", nivelRede: 2, dataCadastro: "2025-03-07", dataAtivo: "2025-04-01" },
  { id: "C-3013", codigo: 3013, nome: "Camila Duarte Pires", celular: "(31) 98888-3013", uf: "MG", distribuidora: "CEMIG", consumoMedio: 410, status: "Pendente", statusContrato: "Pendente", statusFinanceiro: "—", andamento: "Aguardando distribuidora", elegibilidade: true, cashback: false, origem: "Campanha", nomeLicenciado: "Fernanda Rocha Alves", nivelRede: 2, dataCadastro: "2025-05-12", dataAtivo: null },
  { id: "C-3014", codigo: 3014, nome: "Thiago Ramos Lopes", celular: "(11) 98888-3014", uf: "SP", distribuidora: "Enel SP", consumoMedio: 1480, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Evento", nomeLicenciado: "Camila Fontes Andrade", nivelRede: 2, dataCadastro: "2024-07-30", dataAtivo: "2024-08-22" },
  { id: "C-3015", codigo: 3015, nome: "Vanessa Lima Fonseca", celular: "(83) 98888-3015", uf: "PB", distribuidora: "Energisa", consumoMedio: 300, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: false, origem: "Indicação", nomeLicenciado: "Ana Beatriz Carvalho", nivelRede: 1, dataCadastro: "2025-04-18", dataAtivo: "2025-05-10" },
  { id: "C-3016", codigo: 3016, nome: "Bruno Azevedo Cunha", celular: "(51) 98888-3016", uf: "RS", distribuidora: "RGE", consumoMedio: 670, status: "Cancelado", statusContrato: "Não enviado", statusFinanceiro: "—", andamento: "Desistência", elegibilidade: false, cashback: false, origem: "Orgânico", nomeLicenciado: "Mariana Castro Teixeira", nivelRede: 2, dataCadastro: "2025-02-25", dataAtivo: null },
  { id: "C-3017", codigo: 3017, nome: "Larissa Gomes Martins", celular: "(31) 98888-3017", uf: "MG", distribuidora: "CEMIG", consumoMedio: 820, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Campanha", nomeLicenciado: "Bruno Henrique Vasconcelos", nivelRede: 1, dataCadastro: "2024-11-09", dataAtivo: "2024-12-02" },
  { id: "C-3018", codigo: 3018, nome: "Diego Barbosa Nunes", celular: "(11) 98888-3018", uf: "SP", distribuidora: "Enel SP", consumoMedio: 450, status: "Pendente", statusContrato: "Pendente", statusFinanceiro: "—", andamento: "Aguardando assinatura", elegibilidade: true, cashback: false, origem: "Indicação", nomeLicenciado: "Camila Fontes Andrade", nivelRede: 2, dataCadastro: "2025-06-05", dataAtivo: null },
  { id: "C-3019", codigo: 3019, nome: "Aline Ribeiro Castro", celular: "(41) 98888-3019", uf: "PR", distribuidora: "Copel", consumoMedio: 590, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Inadimplente", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Evento", nomeLicenciado: "Mariana Castro Teixeira", nivelRede: 2, dataCadastro: "2024-10-14", dataAtivo: "2024-11-06" },
  { id: "C-3020", codigo: 3020, nome: "Marcelo Tavares Reis", celular: "(31) 98888-3020", uf: "MG", distribuidora: "CEMIG", consumoMedio: 1120, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Indicação", nomeLicenciado: "Ana Beatriz Carvalho", nivelRede: 1, dataCadastro: "2024-09-19", dataAtivo: "2024-10-11" },
  { id: "C-3021", codigo: 3021, nome: "Sofia Cardoso Pinto", celular: "(11) 98888-3021", uf: "SP", distribuidora: "Enel SP", consumoMedio: 360, status: "Em análise", statusContrato: "Não enviado", statusFinanceiro: "—", andamento: "Análise de elegibilidade", elegibilidade: false, cashback: false, origem: "Orgânico", nomeLicenciado: "Camila Fontes Andrade", nivelRede: 2, dataCadastro: "2025-06-12", dataAtivo: null },
  { id: "C-3022", codigo: 3022, nome: "Rodrigo Mendes Alves", celular: "(83) 98888-3022", uf: "PB", distribuidora: "Energisa", consumoMedio: 700, status: "Ativo", statusContrato: "Assinado", statusFinanceiro: "Em dia", andamento: "Concluído", elegibilidade: true, cashback: true, origem: "Campanha", nomeLicenciado: "Fernanda Rocha Alves", nivelRede: 2, dataCadastro: "2025-01-28", dataAtivo: "2025-02-20" },
];

/* Deriva os campos extras do V_MAPACLIENTES de forma determinística (sem editar
   os 22 registros na mão). */
function enrich(b: BaseCliente): MapaClienteRow {
  const assinado = b.statusContrato === "Assinado";
  const nasc = `19${80 + (b.codigo % 20)}-0${(b.codigo % 9) + 1}-${10 + (b.codigo % 18)}`;
  return {
    ...b,
    validadoSucesso: b.status === "Ativo",
    codigoLicenciado: 119000 + (b.codigo % 900),
    codigoPatrocinador: 100000 + (b.codigo % 500),
    dataNascimento: nasc,
    instalacao: String(89000000 + b.codigo * 137),
    contratos: assinado ? "1 contrato assinado" : "1 contrato p/ assinar",
    statusAssinaturaCliente: assinado ? "ASSINADO" : "AGUARDANDO ASSINATURA",
    dataAssinaturaCliente: assinado ? b.dataAtivo : null,
    statusAssinaturaIgreen: assinado ? "ASSINADO" : "AGUARDANDO ASSINATURA",
    dataAssinaturaIgreen: assinado ? b.dataAtivo : null,
    observacao:
      b.statusFinanceiro === "Inadimplente"
        ? "Contato pendente sobre fatura"
        : "",
    idconsultor: b.codigo,
    linkAssinatura: `https://assinatura.igreen.com.br/${b.id}`,
  };
}

export const mapaClientes: MapaClienteRow[] = BASE.map(enrich);

export const clienteById: Record<string, MapaClienteRow> = Object.fromEntries(
  mapaClientes.map((c) => [c.id, c]),
);

export const totalClientes = mapaClientes.length;

/** KPIs simples (totais sobre o dataset). */
export function clientesKpis() {
  const ativos = mapaClientes.filter((c) => c.status === "Ativo").length;
  const inadimplentes = mapaClientes.filter(
    (c) => c.statusFinanceiro === "Inadimplente",
  ).length;
  const consumoTotal = mapaClientes.reduce((a, c) => a + c.consumoMedio, 0);
  return { total: mapaClientes.length, ativos, inadimplentes, consumoTotal };
}
