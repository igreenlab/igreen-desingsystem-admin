#!/usr/bin/env node
/**
 * doctor.mjs — valida a integridade do cn (src/lib/utils.ts) e tv (src/utils/tv.ts)
 * do iGreen DS. Eles configuram tailwind-merge/tailwind-variants pros prefixos DS
 * (pad/sp/gp/radius/sh/form) + presets tipográficos (L-016). Se forem editados ou
 * sobrescritos pelo cn padrão do shadcn, a resolução de classe quebra EM SILÊNCIO.
 *
 * Hashes de referência = versão publicada do DS (baked no scaffold). Re-sincronize
 * com `npx shadcn@latest add @igreen/utils @igreen/tv --overwrite` e rode de novo.
 */
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

const EXPECTED = {
  "src/lib/utils.ts": "8989f08e57f669a0b34e1f78a800fc3a0fda6220e57dd16373daf3fc153b75c1",
  "src/utils/tv.ts": "d96200e0e00d273f2ae2ed6d62d297afe32af2f3230554caa6d89b6a6c305dd5",
};

let ok = true;
for (const [file, expected] of Object.entries(EXPECTED)) {
  let actual;
  try {
    actual = createHash("sha256").update(readFileSync(file)).digest("hex");
  } catch {
    console.error(`✗ ${file} AUSENTE — rode: npx shadcn@latest add @igreen/utils @igreen/tv --overwrite`);
    ok = false;
    continue;
  }
  if (actual === expected) {
    console.log(`✓ ${file} íntegro`);
  } else {
    console.error(`✗ ${file} DIVERGE da versão do DS (editado/sobrescrito?). A resolução de classe DS pode quebrar em silêncio (L-016).`);
    console.error(`  Restaure: npx shadcn@latest add @igreen/utils @igreen/tv --overwrite`);
    ok = false;
  }
}
process.exit(ok ? 0 : 1);
