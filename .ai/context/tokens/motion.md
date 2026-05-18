# Tokens de Motion — Referência para agentes

> Carregar quando a tarefa envolver: transições, animações, hover/focus timing,
> modais, drawers, ou qualquer elemento com movimento.
>
> Source: `tokens/brands/default/primitives/motion.ts`
> Tier: Primitivo (API privada) — NÃO usar valores raw em componentes.
> Consumidos via `transition-all duration-200 ease-out` ou presets compostos.

---

## Durações

| Token | Valor | Quando usar |
|-------|-------|-------------|
| `instant` | 0ms | Sem transição |
| `x-fast` | 100ms | Hover states, focus rings |
| `fast` | 150ms | Simples (opacity, color) |
| `moderate` | 200ms | Entradas de elementos |
| `slow` | 300ms | Modais, drawers, expansões |
| `x-slow` | 400ms | Page transitions |
| `deliberate` | 500ms | Animações complexas, onboarding |

---

## Easings

### Productive (UI transacional)
| Token | Curva | Uso |
|-------|-------|-----|
| `standard` | `cubic-bezier(0.2, 0, 0.38, 0.9)` | Entra e sai |
| `entrance-productive` | `cubic-bezier(0, 0, 0.38, 0.9)` | Entra |
| `exit-productive` | `cubic-bezier(0.2, 0, 1, 0.9)` | Sai |

### Expressive (marketing, onboarding)
| Token | Curva | Uso |
|-------|-------|-----|
| `emphasized` | `cubic-bezier(0.2, 0, 0, 1)` | Enfatizado |
| `emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Entra (expressive) |
| `emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Sai (expressive) |

### Utilitários
| Token | Curva | Uso |
|-------|-------|-----|
| `linear` | `linear` | Progresso contínuo |
| `spring` | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Ligeiro bounce |

---

## Presets compostos (duração + easing)

| Preset | Valor | Quando usar |
|--------|-------|-------------|
| `component` | 200ms ease-out | Transições de botão, badge, input, switch |
| `color-shift` | 300ms ease-out | Tabs item color |
| `spring` | 300ms cubic-bezier(0.65,0,0.35,1) | Tabs indicator slide |
| `hover-color` | 150ms standard | Hover de cor |
| `hover-transform` | 100ms entrance-productive | Hover de transform |
| `fade-in` | 200ms emphasized-decelerate | Fade in |
| `fade-out` | 150ms emphasized-accelerate | Fade out |
| `slide-in` | 300ms emphasized-decelerate | Slide in |
| `slide-out` | 200ms emphasized-accelerate | Slide out |
| `expand` | 300ms emphasized | Expandir |
| `collapse` | 200ms emphasized-accelerate | Colapsar |

---

## Regra para agentes

Motion tokens são **primitivos** — nunca referenciar diretamente em componentes.
O componente usa classes Tailwind como `transition-all duration-200 ease-out`.
Se precisar de um preset novo, solicitar ao DS Designer via gate.
