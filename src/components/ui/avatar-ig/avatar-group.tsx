import { Children, forwardRef, isValidElement } from "react";
import { Avatar } from "./avatar";
import { AvatarGroupContext } from "./avatar-group-context";
import { avatarGroupItem, avatarGroupRoot } from "./avatar.styles";
import type { AvatarGroupProps } from "./avatar.types";

/**
 * `AvatarGroup` — pilha de avatares sobrepostos, com `size` propagado e excedente resumido.
 *
 * ## Por que existe
 *
 * A pilha era feita na mão em cada tela (`-ml-…` + `ring` escolhidos no olho), e três coisas
 * saíam diferentes toda vez: quanto sobrepor, qual cor de anel, e o que fazer quando são 12
 * pessoas. As três viram decisão do componente aqui.
 *
 * ## As quatro decisões, e por quê
 *
 * **1. A sobreposição escala com o tamanho.** Não é constante: 6px num avatar de 20px é 30% de
 * sobreposição, e no de 40px é 15% — visualmente são arranjos diferentes. O mapa em
 * `avatar.styles.ts` mantém ~25% em toda a escala.
 *
 * **2. O anel é da cor da SUPERFÍCIE DE TRÁS**, e é aqui que se erra. O anel separa um avatar
 * do outro pintando o que está atrás; com o token errado ele deixa de separar e vira um halo.
 * Por isso `surface` é **prop**, não constante.
 *
 * ⚠️ `table` e `surface` resolvem pro MESMO valor hoje (medido: `oklch(1 0 0)` no claro,
 * `oklch(0.225 0 0)` no escuro). Dentro de tabela a escolha é **semântica**, não visual —
 * declare `table` assim mesmo, pra a pilha seguir certa se um dia divergirem. Onde a diferença
 * é visível hoje é em `canvas`, `subtle` e `muted`.
 *
 * **3. O primeiro fica por cima.** O empilhamento natural do DOM põe o último por cima; aqui o
 * z-index é decrescente, porque a leitura é da esquerda pra direita e o primeiro avatar é o
 * principal. É a convenção de Material e Ant, e é o que faz a pilha parecer uma fila.
 *
 * **4. O grupo fala, os avatares calam.** Três avatares soltos fazem o leitor de tela ler três
 * nomes sem dizer que são um conjunto. O container leva `role="group"` + `aria-label`, e o
 * `+N` é `aria-hidden` — o número já está no rótulo do grupo.
 *
 * ## Gotchas
 *
 * - **`size` no filho vence o do grupo.** É escape hatch pro caso de um avatar destacado; sem
 *   ele, não haveria como quebrar a uniformidade quando o desenho pede.
 * - **`total` existe pra contagem do SERVIDOR.** Sem ele o `+N` conta só o que foi renderizado
 *   — e uma lista paginada em 5 mostraria `+0` tendo 40 pessoas.
 * - **Não use pra 2 avatares sem sobreposição.** Aí é um `flex gap-gp-sm` comum: a pilha
 *   comunica "muitos, e o conjunto importa mais que cada um".
 *
 * @example
 * <AvatarGroup size="sm" max={3} total={12} aria-label="12 responsáveis">
 *   <Avatar colorHex="#2563EB">MD</Avatar>
 *   <Avatar colorHex="#CC092F">AC</Avatar>
 *   <Avatar colorHex="#7C3AED">JS</Avatar>
 *   <Avatar colorHex="#0891B2">TK</Avatar>
 * </AvatarGroup>
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  function AvatarGroup(
    {
      size = "md",
      max,
      total,
      surface = "surface",
      children,
      className,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    const itens = Children.toArray(children).filter(isValidElement);
    const visiveis = typeof max === "number" ? itens.slice(0, max) : itens;
    const escondidos = (total ?? itens.length) - visiveis.length;

    return (
      <AvatarGroupContext.Provider value={{ size, surface }}>
        <div
          ref={ref}
          className={avatarGroupRoot({ className })}
          role="group"
          aria-label={ariaLabel}
          {...rest}
        >
          {visiveis.map((filho, i) => (
            <span
              key={i}
              /* z-index decrescente: o primeiro por cima (decisão 3). O wrapper existe pra
                 não depender de o filho aceitar `style` — `Avatar` aceita, mas um consumidor
                 pode passar outro elemento aqui. */
              className={avatarGroupItem({ size, surface, primeiro: i === 0 })}
              style={{ zIndex: visiveis.length - i }}
            >
              {filho}
            </span>
          ))}

          {escondidos > 0 && (
            /* O `+N` é `aria-hidden`: a contagem real já está no `aria-label` do grupo, e
               anunciar "mais 9" solto não diz de quê. */
            <span
              className={avatarGroupItem({ size, surface, primeiro: false })}
              style={{ zIndex: 0 }}
            >
              <Avatar size={size} color="muted" aria-hidden>
                +{escondidos}
              </Avatar>
            </span>
          )}
        </div>
      </AvatarGroupContext.Provider>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";
