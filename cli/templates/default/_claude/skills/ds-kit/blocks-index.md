<!-- GERADO por `npm run blocks:build` a partir dos `export const BLOCK` em src/blocks/**.
     NÃO editar à mão: a próxima geração sobrescreve, e o gate `blocks-index` reprova divergência. -->

# Índice de blocos

**Bloco não é componente.** É uma composição de referência — feita só com componentes que você
já tem — que existe porque a IA sabe as peças e os tokens mas não sabe o **arranjo** que um
designer escolheu. Não tem props nem versão própria: você lê a estrutura e reconstrói com os
dados do usuário.

Este índice é lido pelo **Passo 0** da skill `ds-kit`, quando o usuário cita um código.

## chart

| Código | Composição | Quando serve | Usa | Arquivo |
|---|---|---|---|---|
| `dsgreen-chart-1` | Donut de distribuição com rateio | Donut com total no centro + lista das fatias abaixo, onde a cor liga linha e setor. Para distribuição de um total por 3–5 categorias nomeadas. | Card (size="md") · Tabs · Chip · ChartContainer · PieChart (recharts) | `src/blocks/chart/budget-breakdown.tsx` |

## paneldetail

| Código | Composição | Quando serve | Usa | Arquivo |
|---|---|---|---|---|
| `dsgreen-paneldetail-1` | Painel de detalhe do registro | Painel lateral aberto a partir de uma linha de tabela: header com avatar + nome + código e status, ações de ícone e maximizar; métricas em cards compactos; e os dados em seções colapsáveis — inclusive as que não são label:valor (conta bancária com marca, métodos em chips, e-mail e telefone acionáveis, gestor com avatar). Ação primária no footer. Mesmo padrão dos painéis de detalhe do Virtual Office e do CRUD de clientes. | FloatingPanel (side="right", size="lg", titleSlot + headerActions + maximizable + resizable + bodyPadded={false}) · FloatingPanelSection + FloatingPanelField · MetricaCartoes — cards compactos próprios (ícone + valor + rótulo); NÃO o Kpi · Avatar (colorHex, contraste WCAG automático) · Chip (soft) · Button (icon-sm no header, sm no footer) | `src/blocks/paneldetail/detalhe-do-registro.tsx` |

## Como pegar o código do bloco

| modo de consumo | onde o arquivo está |
|---|---|
| **submódulo** (`.claude/ds-config.json` com `"mode": "submodule"`) | já no disco: `<dsPath>/<arquivo>` da tabela acima. Leia direto |
| **copy-in / scaffold** | não vem instalado: `npm run igreen:add -- <código>` traz o arquivo |

Leia o arquivo **inteiro**, incluindo o JSDoc do topo — ele carrega as regras que a composição
embute (qual token de cor, por que `tabular-nums`, o que NÃO copiar) e uma seção **Cuidado ao
adaptar** que diz o que ligar a estado e o que remover. Medido num consumidor real em
2026-08-20: foi esse JSDoc que produziu o resultado bom, não só a resolução do ID.

Adapte dados e rótulos **preservando estrutura e espaçamento**. Não "melhore" o arranjo — ele é
o motivo pelo qual o código foi citado.

Se o código citado não estiver na tabela, **diga isso** em vez de montar algo parecido: o valor
do código é ser determinístico, e um palpite silencioso destrói exatamente isso.
