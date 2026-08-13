/**
 * brand-contrast.mjs — mede contraste WCAG entre cores em OKLCH ou hex.
 *
 * Existe porque a Fase 2 do `brand-builder` manda "medir o contraste" e, sem
 * instrumento, medir vira estimar de olho. Os tokens de marca são escritos em
 * OKLCH; o `src/utils/color-contrast.ts` (usado em runtime pelo Avatar) só aceita
 * hex e não exporta o ratio — daí este script, que faz a volta OKLCH→sRGB e
 * devolve o número.
 *
 * ⚠️ ESCOPO: isto mede os valores que você ESCOLHEU nos arquivos `.ts`. Não
 * responde "o que a tela mostra" — quem responde é a Fase 5 (browser, valor
 * resolvido pelo cascade). Essa distinção não é preciosismo: na marca `vibrant` a
 * medição aqui passou 10/10 enquanto 13 tokens renderizavam o valor do modo
 * ERRADO no browser (L-066). Instrumento certo pra pergunta certa.
 *
 * Uso:
 *   node scripts/brand-contrast.mjs "oklch(0.866993 0.294055 142.3546)" "#000000"
 *   node scripts/brand-contrast.mjs "oklch(0.5 0.15 150)" white large
 *
 * Último argumento opcional: "large" (limiar AA 3:1) | "ui" (SC 1.4.11, 3:1 pra
 * borda/ícone) | "raw" (só o número, sem veredito) | default "normal" (4.5:1).
 *
 * Use "raw" pra comparar dois níveis de TEXTO entre si (fg.default vs fg.muted —
 * a separação título/subtítulo). A WCAG não define limiar pra isso, então imprimir
 * PASSA/FALHA ali seria inventar garantia. A referência é a marca `default`: meça
 * a separação dela e não fique muito abaixo. Hoje, no dark, ela é ~2.50:1.
 */

/* ── OKLCH → sRGB ─────────────────────────────────────────────────────────── */

/** OKLab → LMS linear → sRGB linear (matrizes de Björn Ottosson). */
function oklabToLinearSrgb(L, a, b) {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;
  return {
    r: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    g: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    b: -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  };
}

function linearToSrgb(c) {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.min(1, Math.max(0, v));
}

/** Devolve {r,g,b} 0-1 em sRGB + flag de clamp (fora do gamut). */
function parseColor(input) {
  const s = String(input).trim();
  if (s === "white") return { r: 1, g: 1, b: 1, clamped: false };
  if (s === "black") return { r: 0, g: 0, b: 0, clamped: false };

  const ok = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i.exec(s);
  if (ok) {
    let L = ok[1].endsWith("%") ? parseFloat(ok[1]) / 100 : parseFloat(ok[1]);
    const C = parseFloat(ok[2]);
    const hDeg = parseFloat(ok[3]);
    const h = (hDeg * Math.PI) / 180;
    const lin = oklabToLinearSrgb(L, C * Math.cos(h), C * Math.sin(h));
    // Fora do gamut sRGB = o canal estoura [0,1] antes do clamp. Vale avisar:
    // é o teto que faz uma cor "não poder ficar mais saturada" (caso #0fff00).
    const clamped = [lin.r, lin.g, lin.b].some((c) => c < -0.0001 || c > 1.0001);
    return { r: linearToSrgb(lin.r), g: linearToSrgb(lin.g), b: linearToSrgb(lin.b), clamped };
  }

  const hex = /^#?([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(s);
  if (hex) {
    let h = hex[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    return {
      r: parseInt(h.slice(0, 2), 16) / 255,
      g: parseInt(h.slice(2, 4), 16) / 255,
      b: parseInt(h.slice(4, 6), 16) / 255,
      clamped: false,
    };
  }
  throw new Error(`cor não reconhecida: "${input}" (use oklch(...), #hex, white ou black)`);
}

/* ── WCAG 2.x ─────────────────────────────────────────────────────────────── */

function relLuminance({ r, g, b }) {
  const f = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrastRatio(colorA, colorB) {
  const a = relLuminance(parseColor(colorA));
  const b = relLuminance(parseColor(colorB));
  const [hi, lo] = a > b ? [a, b] : [b, a];
  return (hi + 0.05) / (lo + 0.05);
}

export function toHex(input) {
  const { r, g, b } = parseColor(input);
  const h = (c) => Math.round(c * 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/* ── CLI ──────────────────────────────────────────────────────────────────── */

/** `raw` = sem limiar: a WCAG não define um pra texto-vs-texto (ver header). */
const THRESHOLDS = { normal: 4.5, large: 3, ui: 3, raw: null };

function main(argv) {
  const args = [...argv];
  let mode = "normal";
  if (args.length > 2 && args[args.length - 1] in THRESHOLDS) mode = args.pop();
  const [fg, bg] = args;
  if (!fg || !bg) {
    console.error('uso: node scripts/brand-contrast.mjs <cor> <cor> [normal|large|ui|raw]');
    process.exit(2);
  }

  const ratio = contrastRatio(fg, bg);
  const min = THRESHOLDS[mode];
  const pass = min === null ? true : ratio >= min;
  const a = parseColor(fg);
  const b = parseColor(bg);

  console.log(`${toHex(fg)}  sobre  ${toHex(bg)}`);
  if (min === null) {
    console.log(
      `ratio ${ratio.toFixed(2)}:1   (sem veredito — modo raw; ` +
        `referência de separação título/subtítulo da marca default no dark: ~2.50:1)`,
    );
  } else {
    console.log(`ratio ${ratio.toFixed(2)}:1   limiar ${mode} ${min}:1   ${pass ? "PASSA" : "FALHA"}`);
  }
  if (a.clamped || b.clamped) {
    console.log(
      `nota: ${a.clamped && b.clamped ? "ambas as cores" : a.clamped ? "a 1ª cor" : "a 2ª cor"} ` +
        `está FORA do gamut sRGB — foi clampada. O hex acima é o que o browser mostra, ` +
        `não o OKLCH pedido; mais chroma nesse hue não muda mais nada na tela.`,
    );
  }
  process.exit(pass ? 0 : 1);
}

// Só roda como CLI quando invocado direto (importável pelos testes).
if (process.argv[1] && /brand-contrast\.mjs$/.test(process.argv[1])) {
  main(process.argv.slice(2));
}
