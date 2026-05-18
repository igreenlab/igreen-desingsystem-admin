/**
 * index.ts — Barrel export do Design System
 *
 * Importar daqui nas aplicações consumidoras.
 * Não expõe primitivos (API privada).
 *
 * Tier 3 (component tokens como objetos .ts) foi removido.
 * Componentes agora usam classes semânticas via tv() em *.styles.ts.
 * A fonte de verdade visual de cada componente é seu *.styles.ts.
 */

// ── Semantic tokens (tier 2) ─────────────────────────────────────────────────
export { colorLight }    from "./brands/default/semantic/color-light";
export { colorDark }     from "./brands/default/semantic/color-dark";
export { spacing }       from "./brands/default/semantic/spacing";
export { sizing }        from "./brands/default/semantic/sizing";
export { shape }         from "./brands/default/semantic/shape";
export { elevation }     from "./brands/default/semantic/elevation";
export { typography }    from "./brands/default/semantic/typography";

// ── Motion (tier 1 exportado — agnóstico a plataforma) ───────────────────────
export { motionPresets, duration, easing } from "./brands/default/primitives/motion";

// ── Types ─────────────────────────────────────────────────────────────────────
export type { ShapeToken }     from "./brands/default/semantic/shape";
export type { SizingToken }    from "./brands/default/semantic/sizing";
export type { ElevationToken } from "./brands/default/semantic/elevation";
