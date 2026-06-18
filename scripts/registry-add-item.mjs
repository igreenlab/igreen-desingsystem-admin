/**
 * registry-add-item.mjs — PROPÕE a entrada do registry.json pra um componente,
 * escaneando os imports (registryDependencies @igreen + dependencies npm) e
 * sinalizando imports cross-dir que precisam virar alias antes de distribuir.
 *
 * NÃO insere sozinho — imprime o JSON pra você revisar e colar no registry.json.
 *
 * Uso:
 *   node scripts/registry-add-item.mjs Button          # ui/ (dir)
 *   node scripts/registry-add-item.mjs card            # shadcn/ (arquivo)
 *   node scripts/registry-add-item.mjs src/components/ui/FormField
 *
 * Regras (ver .ai/specs/registry-distribution.md):
 *   - import alias @/components/(shadcn|ui)/X  → registryDependency @igreen/<kebab>
 *   - import RELATIVO cross-dir (../../shadcn/x) → FLAG: refatorar pra alias antes
 *   - npm (qualquer import bare cujo pacote esteja em dependencies/devDependencies
 *     da raiz) → dependencies (versão saída de package.json.dependencies)
 *   - @/lib/utils → @igreen/utils · @/utils/tv → @igreen/tv
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const rootPkg = JSON.parse(readFileSync("package.json", "utf8"));
// versão sai SÓ de dependencies (o que o consumidor instala); detecção considera
// também devDependencies pra não classificar erroneamente bare imports de tooling.
const pkg = rootPkg.dependencies || {};
const allDeps = { ...(rootPkg.devDependencies || {}), ...(rootPkg.dependencies || {}) };
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();

// Nome do pacote npm a partir de um import bare: 2 primeiros segmentos se escopo
// (@scope/pkg), senão o 1º. Subpaths (lucide-react/icons) colapsam pro pacote raiz.
const pkgName = (s) => (s.startsWith("@") ? s.split("/").slice(0, 2).join("/") : s.split("/")[0]);

// Bare = não é alias (@/...), nem relativo (./ ../), nem absoluto (/...).
// É npm SE o pacote constar em dependencies OU devDependencies da raiz.
const isBare = (s) => !s.startsWith("@/") && !s.startsWith(".") && !s.startsWith("/");
const isNpm = (s) => isBare(s) && Object.prototype.hasOwnProperty.call(allDeps, pkgName(s));

const arg = process.argv[2];
if (!arg) { console.error("uso: node scripts/registry-add-item.mjs <Componente|caminho>"); process.exit(1); }

// resolve base + tipo (ui dir, ui file, shadcn file)
let base, isDir, name;
if (arg.includes("/")) {
  base = arg.replace(/\/$/, "");
  isDir = existsSync(base) && statSync(base).isDirectory();
} else {
  const uiDir = `src/components/ui/${arg}`;
  const shadcnFile = `src/components/shadcn/${arg}.tsx`;
  if (existsSync(uiDir) && statSync(uiDir).isDirectory()) { base = uiDir; isDir = true; }
  else if (existsSync(shadcnFile)) { base = shadcnFile; isDir = false; }
  else { console.error(`✗ não achei ui/${arg}/ nem shadcn/${arg}.tsx`); process.exit(1); }
}
const dirName = base.split("/").pop().replace(/\.tsx?$/, "");
name = kebab(dirName);

function walk(d) { let o = []; for (const e of readdirSync(d, { withFileTypes: true })) { const p = join(d, e.name); if (e.isDirectory()) o = o.concat(walk(p)); else o.push(p); } return o; }
const files = (isDir ? walk(base) : [base]).filter((f) => /\.(tsx|ts|md)$/.test(f) && !/\.test\./.test(f)).map((f) => f.split(/[\\/]/).join("/")).sort();

const registryDeps = new Set();
const deps = new Map();
const warnings = [];
const selfDir = isDir ? base.split("/").pop() : null;

for (const f of files) {
  if (!/\.(tsx|ts)$/.test(f)) continue;
  const src = readFileSync(f, "utf8");
  const re = /from\s+"([^"]+)"/g; let m;
  while ((m = re.exec(src))) {
    const s = m[1];
    if (s === "@/lib/utils") registryDeps.add("@igreen/utils");
    else if (s === "@/utils/tv") registryDeps.add("@igreen/tv");
    else if (s === "@/lib/lucide-types") warnings.push(`bundle: ${f} usa @/lib/lucide-types → adicione src/lib/lucide-types.ts como registry:file no item`);
    else if (s === "@/utils/color-contrast") warnings.push(`bundle: ${f} usa @/utils/color-contrast → adicione src/utils/color-contrast.ts como registry:file`);
    else if (/^@\/components\/(shadcn|ui)\//.test(s)) {
      const seg = s.replace(/^@\/components\/(shadcn|ui)\//, "").split("/")[0];
      if (seg !== selfDir) registryDeps.add(`@igreen/${kebab(seg)}`);
    } else if (/^(\.\.\/)+shadcn\//.test(s)) {
      const seg = s.replace(/^(\.\.\/)+shadcn\//, "").split("/")[0];
      registryDeps.add(`@igreen/${kebab(seg)}`);
      warnings.push(`⚠ REFATORAR: ${f} importa "${s}" (relativo cross-dir) → vira "@/components/shadcn/${seg}" (quebra no copy-in)`);
    } else if (isNpm(s)) {
      const p = pkgName(s);
      if (pkg[p]) deps.set(p, `${p}@${pkg[p]}`); else { deps.set(p, p); warnings.push(`⚠ ${p} está só em devDependencies — confirme a versão no item`); }
    }
  }
}

const targetBase = isDir ? `components/ui/${dirName}` : `components/ui/${dirName}`;
const item = {
  name, type: "registry:ui", title: dirName, description: `Componente ${dirName} do iGreen DS.`,
  registryDependencies: [...registryDeps].sort(),
  dependencies: [...deps.values()].sort(),
  files: files.map((f) => ({
    path: f,
    type: f.endsWith("USAGE.md") ? "registry:file" : "registry:ui",
    target: isDir ? `${targetBase}/${f.slice(base.length + 1)}` : `components/ui/${dirName}.tsx`,
  })),
};

console.log("\n=== ENTRADA PROPOSTA pro registry.json (revise + cole) ===\n");
console.log(JSON.stringify(item, null, 2));
if (warnings.length) {
  console.log("\n=== ⚠ ATENÇÃO ===");
  for (const w of [...new Set(warnings)]) console.log("  " + w);
}
console.log("\nDepois: revisar description/target, refatorar os ⚠, e rodar npm run registry:build.");
