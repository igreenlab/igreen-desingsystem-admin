import { ResumoGeralOperacao } from "./ResumoGeralOperacao";
import { ResumoMes } from "./ResumoMes";

/**
 * Exemplo/story dos dois blocos do Resumo com os dados da spec.
 * Esperado: validação 68,8% · em andamento 19,6% · perda 11,6%.
 */
export function ResumoBlocksExample() {
  return (
    <div className="flex flex-col gap-gp-2xl p-pad-3xl">
      <ResumoGeralOperacao
        totalCadastros={7240}
        mwhContratados={5120}
        status={{
          validados: 4980,
          aguardandoValidacao: 612,
          agAssinatura: 284,
          devolutivas: 521,
          reprovados: 388,
          cancelados: 455,
        }}
        licenciadosComCadastro={312}
        aguardandoInjecao={176}
      />

      <ResumoMes
        impacto={{ mwhValidados: 288, co2Toneladas: 23.5, arvores: 1070, placas: 5236 }}
        operacao={{
          comEnergiaAtiva: { valor: 388, percentual: 54 },
          licenciadosComCadastro: 96,
          aniversariantes: 4,
        }}
      />
    </div>
  );
}
