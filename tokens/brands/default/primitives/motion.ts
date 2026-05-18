/**
 * motion.ts — Motion primitive tokens
 * Tier 1 de 3: valores raw. API privada.
 *
 * Princípio: durações baseadas em complexidade da transição.
 * Easings: productive (precisão) vs expressive (fluidez).
 */

/** Durações em ms */
export const duration = {
  instant:    "0ms",
  "x-fast":   "100ms",  // hover states, focus rings
  fast:       "150ms",  // simples (opacity, color)
  moderate:   "200ms",  // entradas de elementos
  slow:       "300ms",  // modais, drawers, expansões
  "x-slow":   "400ms",  // page transitions
  deliberate: "500ms",  // animações complexas, onboarding
} as const;

/**
 * Easing curves.
 * Productive: movimentos precisos (UI transacional).
 * Expressive: movimentos fluidos (marketing, onboarding).
 */
export const easing = {
  // Productive
  "standard":           "cubic-bezier(0.2, 0, 0.38, 0.9)",  // entra e sai
  "entrance-productive": "cubic-bezier(0, 0, 0.38, 0.9)",   // entra
  "exit-productive":    "cubic-bezier(0.2, 0, 1, 0.9)",     // sai

  // Expressive
  "emphasized":         "cubic-bezier(0.2, 0, 0, 1)",        // enfatizado
  "emphasized-decelerate": "cubic-bezier(0.05, 0.7, 0.1, 1)",// entra (expressive)
  "emphasized-accelerate":  "cubic-bezier(0.3, 0, 0.8, 0.15)",// sai (expressive)

  // Utilitários
  "linear":  "linear",
  "spring":  "cubic-bezier(0.175, 0.885, 0.32, 1.275)", // ligeiro bounce
} as const;

/** Tokens compostos: duração + easing para padrões comuns */
export const motionPresets = {
  // Component transitions (button, badge, input, switch)
  "component":       `${duration.moderate} ease-out`,
  // Color shift (tabs item color)
  "color-shift":     `${duration.slow} ease-out`,
  // Spring (tabs indicator slide)
  "spring":          `${duration.slow} cubic-bezier(0.65, 0, 0.35, 1)`,
  // Existing presets
  "hover-color":     `${duration.fast} ${easing.standard}`,
  "hover-transform": `${duration["x-fast"]} ${easing["entrance-productive"]}`,
  "fade-in":         `${duration.moderate} ${easing["emphasized-decelerate"]}`,
  "fade-out":        `${duration.fast} ${easing["emphasized-accelerate"]}`,
  "slide-in":        `${duration.slow} ${easing["emphasized-decelerate"]}`,
  "slide-out":       `${duration.moderate} ${easing["emphasized-accelerate"]}`,
  "expand":          `${duration.slow} ${easing.emphasized}`,
  "collapse":        `${duration.moderate} ${easing["emphasized-accelerate"]}`,
} as const;
