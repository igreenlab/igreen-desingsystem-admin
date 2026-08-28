import { forwardRef, useContext, useState } from "react";
import { getContrastTextColor } from "@/utils/color-contrast";
import { AvatarGroupContext } from "./avatar-group-context";
import { avatarVariants } from "./avatar.styles";
import type { AvatarProps } from "./avatar.types";

/**
 * Avatar — circular badge with initials.
 *
 * Supports semantic `color` presets (brand, success, warning, critical, info, muted)
 * and a `colorHex` override for person-specific hex colors.
 *
 * Auto contrast (v0.7.1, L-027): quando `colorHex` é fornecido, calcula o
 * contraste WCAG entre branco/preto e o bg, escolhendo a cor de texto com
 * MAIOR ratio. Antes aplicava `text-white` cego — quebrava em cores claras
 * (ex: BB amarelo #FAE128 → ratio 1.29:1, falha WCAG AA). Agora respeita
 * o threshold dinâmico baseado em luminância (Y > 0.5 → preto, else branco).
 *
 * Override: pra forçar uma cor específica (caso de marca que exige X), passe
 * `className` com classe Tailwind `text-X` — ela sobrescreve a auto-pickada
 * pela ordem de cascade.
 *
 * Foto (vNEXT): passe `src` e mantenha as iniciais em `children` — elas são o
 * **fallback** quando a URL falha. A imagem interna é `alt=""`; o nome da pessoa mora no
 * `aria-label` do avatar, pra não ser anunciado duas vezes.
 *
 * ⚠️ Quando usar o `Avatar` compound do shadcn (`avatar`, com `AvatarImage`/`AvatarFallback`)
 * em vez deste: quando o fallback não é iniciais (ícone, skeleton) ou você precisa controlar
 * o estado de carregamento. Pra foto de pessoa dentro do DS — e sempre dentro de
 * `AvatarGroup`, que propaga `size` por contexto — o certo é este.
 *
 * Accessibility:
 * - With `aria-label` → role="img" (semantic avatar)
 * - Without `aria-label` → aria-hidden="true" (decorative, inside a card/cell)
 */
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(
    {
      size,
      color,
      colorHex,
      src,
      children,
      className,
      style,
      "aria-label": ariaLabel,
      ...rest
    },
    ref,
  ) {
    /**
     * Dentro de um `<AvatarGroup>`, o tamanho vem do grupo — mas o `size` passado aqui
     * VENCE. É escape hatch: sem ele não haveria como destacar um avatar do conjunto.
     * Fora do grupo o contexto é `undefined` e nada muda (o default `md` do tv() vale).
     */
    const grupo = useContext(AvatarGroupContext);
    const sizeEfetivo = size ?? grupo?.size;

    /**
     * Foto que falha volta pras iniciais — e é por isso que o estado existe: `onError` do
     * `<img>` não desmonta nada sozinho, ele só avisa. Sem o fallback, URL quebrada deixa
     * um buraco na pilha (o alt de uma imagem quebrada não se parece com um avatar).
     *
     * O estado guarda QUAL url falhou, não um booleano: com booleano, trocar a `src` por
     * uma boa manteria o avatar em modo iniciais pro resto da vida do componente (o React
     * reusa a instância) — e daria pra "consertar" isso só com um `useEffect` de reset,
     * que é uma renderização a mais pra guardar a mesma informação.
     */
    const [urlQueFalhou, setUrlQueFalhou] = useState<string | null>(null);
    const mostraFoto = typeof src === "string" && src !== "" && urlQueFalhou !== src;

    const isHex = typeof colorHex === "string" && colorHex.startsWith("#");

    // Cor de texto auto-calculada quando hex é fornecido — sempre o maior
    // contraste WCAG entre white/black. Fallback "white" pra hex inválido
    // (preserva comportamento legado).
    const autoTextClass = isHex
      ? getContrastTextColor(colorHex) === "black"
        ? "text-black"
        : "text-white"
      : null;

    const computedClassName = avatarVariants({
      size: sizeEfetivo,
      color: isHex ? "_custom" : color,
      className: isHex
        ? [autoTextClass, className].filter(Boolean).join(" ")
        : className,
    });

    const computedStyle = isHex
      ? { ...style, backgroundColor: colorHex }
      : style;

    return (
      <div
        ref={ref}
        className={computedClassName}
        style={computedStyle}
        {...(ariaLabel
          ? { role: "img", "aria-label": ariaLabel }
          : { "aria-hidden": true as const })}
        {...rest}
      >
        {mostraFoto ? (
          <img
            src={src}
            /* `alt=""`: o nome da pessoa está no `aria-label` do avatar. Repetir aqui faria
               o leitor de tela anunciar duas vezes. */
            alt=""
            className="size-full object-cover"
            draggable={false}
            onError={() => setUrlQueFalhou(src ?? null)}
          />
        ) : (
          children
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
