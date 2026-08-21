/**
 * @snksergio/create-design-system — CLI bootstrap
 *
 * Fluxo:
 *   1. Parseia nome do projeto (arg) + ouve prompts pra campos faltantes
 *   2. Valida diretório destino (vazio ou inexistente)
 *   3. Copia templates/<choice>/ → destino
 *   4. Substitui name no package.json pelo nome do projeto
 *   5. Renomeia _gitignore → .gitignore
 *   6. Roda <packageManager> install (opcional)
 *   7. git init + commit inicial (opcional)
 *   8. Print next steps
 */

import { fileURLToPath } from "node:url";
import { dirname, join, resolve, basename } from "node:path";
import {
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  copyFileSync,
  renameSync,
  statSync,
  unlinkSync,
} from "node:fs";
import spawn from "cross-spawn";
import prompts from "prompts";
import pc from "picocolors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ROOT = resolve(__dirname, "..");
const TEMPLATES_DIR = join(CLI_ROOT, "templates");
/**
 * Versao do proprio CLI, lida do package.json ao lado. Impressa no banner.
 *
 * Nao e enfeite: em 2026-08-21 um scaffold quebrou na maquina do mantenedor (npm install
 * ENOENT no package.json, git commit virando pathspec) e levou ~20 min pra diagnosticar,
 * porque a saida nao dizia qual versao estava rodando. Era a 0.1.0, pega do cache do npx
 * por ter sido invocada pelo nome do BIN em vez do pacote. Com o numero impresso, quem le
 * o log ve na primeira linha que a versao esta errada.
 */
const CLI_VERSION = (() => {
  try {
    return JSON.parse(readFileSync(join(CLI_ROOT, "package.json"), "utf8")).version;
  } catch {
    return "?";
  }
})();

const DEFAULT_TEMPLATE = "default";

/* ──────────────────────────────────────────────────────────────────────────────
 * MODO --only-kit: instala SÓ o kit de IA num projeto que já existe
 *
 * ## O furo que isto fecha
 *
 * Medido em 2026-08-17: o payload do consumidor (`_claude/`: orquestrador `ds-kit`,
 * 13 skills de tela, 4 rules, hook de integridade) chegava em **2 dos 4 canais**:
 *
 *   scaffold   ✅  este CLI já gera o projeto com ele
 *   submódulo  ✅  `npm run ds:link` projeta no `.claude/` do pai
 *   copy-in    ❌  nenhum dos 91 itens do registry carrega o payload
 *   npm        ❌  e não pode: o Claude Code só descobre `.claude/` na RAIZ do cwd
 *                  (L-056), então pacote em node_modules não fornece um descobrível
 *
 * Consequência: quem puxava componentes com `igreen:add` num projeto que JÁ existia
 * recebia o código sem o vocabulário, sem os builders e sem o hook — exatamente a IA
 * que "cria botão errado mesmo com design system", que é o problema que o payload
 * existe pra resolver.
 *
 * Este modo fecha o canal copy-in (e serve qualquer projeto), reusando o payload que
 * este CLI já embarca. Não é canal novo: é o mesmo payload, sem o scaffold em volta.
 *
 * ## ⛔ Por que ele RECUSA em projeto com submódulo
 *
 * O `ds:link` faz mais que copiar: detecta o alias no tsconfig/vite e escreve
 * `ds-config.json` com `mode: "submodule"` + `importBase`. As skills leem isso e
 * **não** chamam `igreen:add` — leem os exemplos do disco.
 *
 * Copiar o payload aqui sem esse config deixaria as skills instruindo `igreen:add`
 * num projeto que consome por submódulo: comando errado, e o consumidor não tem como
 * saber que a instrução é inaplicável. Melhor recusar apontando o comando certo.
 *
 * E o submódulo é, disparado, o canal mais usado — errar nele é o pior caso.
 * ────────────────────────────────────────────────────────────────────────────── */

/** Payload do consumidor dentro do CLI publicado. */
const KIT_SRC = join(TEMPLATES_DIR, DEFAULT_TEMPLATE, "_claude");

/** Lista recursiva de caminhos relativos sob `dir`. */
function walkRel(dir, base = dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...walkRel(full, base));
    else out.push(full.slice(base.length + 1).split("\\").join("/"));
  }
  return out;
}

/**
 * O projeto consome o DS por submódulo? Dois sinais, qualquer um basta:
 * um `ds-config.json` já escrito pelo `ds:link`, ou uma pasta que contenha o
 * `registry.json` do DS (o repo do DS aninhado).
 * @returns {string|null} o caminho detectado, ou null
 */
function detectaSubmodulo(cwd) {
  const cfg = join(cwd, ".claude", "ds-config.json");
  if (existsSync(cfg)) {
    try {
      const c = JSON.parse(readFileSync(cfg, "utf8"));
      if (c?.mode === "submodule") return c.dsPath || ".claude/ds-config.json";
    } catch {
      /* config ilegível não é evidência de submódulo — segue a detecção por disco */
    }
  }
  for (const cand of readdirSync(cwd)) {
    const full = join(cwd, cand);
    try {
      if (!statSync(full).isDirectory() || cand === "node_modules" || cand.startsWith(".")) continue;
      if (existsSync(join(full, "registry.json")) && existsSync(join(full, "tokens"))) return cand;
    } catch {
      /* pasta ilegível — ignora */
    }
  }
  return null;
}

/**
 * Instala o payload em `<cwd>/.claude/`, sem destruir o que já existe.
 * @param {{cwd:string, force:boolean}} opts
 */
function installKit({ cwd, force }) {
  console.log();
  console.log(pc.bold(pc.green("iGreen DS — kit de IA")));
  console.log(pc.dim("  Instala o orquestrador, as skills de tela, as rules e o hook de integridade"));
  console.log();

  if (!existsSync(KIT_SRC)) {
    console.log(pc.red(`✗ payload não encontrado em ${KIT_SRC}`));
    console.log(pc.dim("  Instalação do CLI incompleta — reinstale com `npm i -g @snksergio/create-design-system`."));
    process.exit(1);
  }

  const sub = detectaSubmodulo(cwd);
  if (sub) {
    console.log(pc.yellow(`⚠ Este projeto consome o DS por SUBMÓDULO (detectado: ${sub})`));
    console.log();
    console.log("  Use o comando do próprio submódulo — ele faz mais que copiar:");
    console.log(pc.cyan(`    npm --prefix ${sub} run ds:link`));
    console.log();
    console.log(pc.dim("  Ele detecta o alias do seu tsconfig/vite e escreve ds-config.json com"));
    console.log(pc.dim("  mode+importBase. Sem isso, as skills mandariam rodar `igreen:add`, que"));
    console.log(pc.dim("  não se aplica a submódulo — você receberia instrução errada."));
    console.log();
    process.exit(1);
  }

  const dest = join(cwd, ".claude");
  const arquivos = walkRel(KIT_SRC);
  const escritos = [];
  const pulados = [];

  for (const rel of arquivos) {
    const src = join(KIT_SRC, rel);
    const dst = join(dest, rel);
    if (existsSync(dst) && !force) {
      pulados.push(rel);
      continue;
    }
    mkdirSync(dirname(dst), { recursive: true });
    copyFileSync(src, dst);
    escritos.push(rel);
  }

  console.log(pc.green(`✓ ${escritos.length} arquivo(s) em .claude/`));
  if (pulados.length) {
    console.log();
    console.log(pc.yellow(`⚠ ${pulados.length} já existia(m) e foi(ram) PRESERVADO(s):`));
    for (const p of pulados.slice(0, 8)) console.log(pc.dim(`    ${p}`));
    if (pulados.length > 8) console.log(pc.dim(`    … e ${pulados.length - 8} outro(s)`));
    console.log();
    console.log(pc.dim("  Nunca sobrescrevo arquivo seu: seu settings.json e seus hooks podem ser"));
    console.log(pc.dim("  próprios. Pra forçar a versão do DS: `--only-kit --force`."));
  }

  console.log();
  console.log(pc.bold("Próximos passos"));
  console.log("  1. Reabra o Claude Code na raiz do projeto (as rules carregam no início da sessão)");
  console.log("  2. Peça uma tela: " + pc.cyan('"monte uma tela de clientes com tabela"'));
  console.log();
  console.log(pc.dim("  As skills assumem copy-in: elas rodam `npm run igreen:add -- <item>` pra"));
  console.log(pc.dim("  puxar componente e exemplo. Se o seu projeto consome o DS por npm, veja"));
  console.log(pc.dim("  .claude/rules/ds-channels.md — o alcance de cada canal está lá."));
  console.log();
}

// Logo iGreen em ASCII — splash verde no fim do scaffold. Arte opcional: se o
// arquivo sumir do pacote, segue sem ela (não quebra o CLI).
let LOGO_ASCII = "";
try {
  LOGO_ASCII = readFileSync(join(__dirname, "logo-ascii.txt"), "utf8").replace(
    /\n+$/,
    "",
  );
} catch {
  /* arte ausente — ignora */
}

/* ── helpers ─────────────────────────────────────────────────────── */

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || "";
  if (ua.startsWith("pnpm")) return "pnpm";
  if (ua.startsWith("yarn")) return "yarn";
  if (ua.startsWith("bun")) return "bun";
  return "npm";
}

function validateProjectName(name) {
  if (!name) return "Project name is required";
  if (!/^[a-z0-9-_]+$/i.test(name))
    return "Use only letters, numbers, dashes and underscores";
  return true;
}

function isDirectoryEmpty(dir) {
  if (!existsSync(dir)) return true;
  const items = readdirSync(dir).filter((f) => f !== ".git");
  return items.length === 0;
}

/**
 * Spawn cross-platform via cross-spawn — resolve issue do Node.js no
 * Windows que rejeita .cmd/.bat com `spawn EINVAL` desde a mitigação
 * do CVE-2024-27980. cross-spawn lida com:
 *   - Resolução de .cmd/.bat no Windows
 *   - Escape correto de argumentos com espaços
 *   - Não precisa shell:true (que tem própria CVE)
 *
 * Args com espaços (ex: commit messages) são tratados corretamente sem
 * quebrar em multiple args.
 */
function run(cmd, args, cwd) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(cmd, args, { cwd, stdio: "inherit" });
    child.on("close", (code) => {
      if (code === 0) resolveRun();
      else
        rejectRun(
          new Error(`${cmd} ${args.join(" ")} exited with code ${code}`),
        );
    });
    child.on("error", (err) => rejectRun(err));
  });
}

/**
 * Recursive copy manual — robusto a paths com Unicode/espaços no Windows.
 * (fs.cpSync no Windows falha silenciosamente em paths como "Área de Trabalho/")
 */
function copyRecursive(src, dst) {
  const stat = statSync(src);
  if (stat.isDirectory()) {
    mkdirSync(dst, { recursive: true });
    for (const entry of readdirSync(src)) {
      copyRecursive(join(src, entry), join(dst, entry));
    }
  } else {
    copyFileSync(src, dst);
  }
}

function listTemplates() {
  if (!existsSync(TEMPLATES_DIR)) return [];
  return readdirSync(TEMPLATES_DIR).filter((f) => {
    const fullPath = join(TEMPLATES_DIR, f);
    return statSync(fullPath).isDirectory();
  });
}

/* ── temas de cor (marcas) ────────────────────────────────────────────────
 * Descobre os temas disponíveis escaneando os overlays
 * src/styles/theme/brand-<id>.css do template. "default" (verde iGreen, sem
 * overlay) é sempre a 1ª opção. Rótulos amigáveis; id desconhecido cai no id.
 */
const BRAND_LABELS = {
  pay: "iGreen Pay (verde vivo · dark near-black)",
  blue: "Azul",
  green: "Verde (grass)",
  vibrant: "iGreen Vibrant (verde fluorescente · texto escuro sobre a marca)",
};
function detectBrandThemes(templateDir) {
  const out = [{ id: "default", label: "iGreen (verde padrão)" }];
  const themeDir = join(templateDir, "src", "styles", "theme");
  if (!existsSync(themeDir)) return out;
  const ids = readdirSync(themeDir)
    .map((f) => /^brand-(.+)\.css$/.exec(f))
    .filter(Boolean)
    .map((m) => m[1])
    .sort();
  for (const id of ids) {
    out.push({
      id,
      label: BRAND_LABELS[id] || id.charAt(0).toUpperCase() + id.slice(1),
    });
  }
  return out;
}

/* Aplica o tema de cor escolhido ao projeto scaffoldado:
 *  - remove os brand-*.css não escolhidos (footprint limpo);
 *  - se != default: injeta @import do overlay no index.css + data-theme no <html>.
 */
function applyBrandTheme(projectDir, theme) {
  const themeDir = join(projectDir, "src", "styles", "theme");
  if (!existsSync(themeDir)) return;
  // Poda os overlays não usados (inclui todos quando theme === "default").
  for (const f of readdirSync(themeDir)) {
    const m = /^brand-(.+)\.css$/.exec(f);
    if (m && m[1] !== theme) unlinkSync(join(themeDir, f));
  }
  if (!theme || theme === "default") return;

  // 1) @import do overlay logo após o import do tailwind-theme.
  const cssPath = join(projectDir, "src", "index.css");
  if (existsSync(cssPath)) {
    let css = readFileSync(cssPath, "utf8");
    if (!css.includes(`brand-${theme}.css`)) {
      const base = '@import "./styles/theme/tailwind-theme.css";';
      css = css.includes(base)
        ? css.replace(base, `${base}\n@import "./styles/theme/brand-${theme}.css";`)
        : `@import "./styles/theme/brand-${theme}.css";\n${css}`;
      writeFileSync(cssPath, css, "utf8");
    }
  }

  // 2) data-theme no <html> (ativa o overlay; combina com dark/light via .dark).
  const htmlPath = join(projectDir, "index.html");
  if (existsSync(htmlPath)) {
    let html = readFileSync(htmlPath, "utf8");
    if (!/\sdata-theme=/.test(html)) {
      html = html.replace(/<html(\s[^>]*)?>/, (mm, attrs) =>
        `<html${attrs || ""} data-theme="${theme}">`,
      );
      writeFileSync(htmlPath, html, "utf8");
    }
  }
}

/* ── starter: AppShell + tutorial + exemplos no menu ─────────────── */

const EXAMPLE_SCREENS = [
  {
    item: "example-clientes",
    comp: "ClientesScreen",
    path: "@/examples/clientes",
    label: "Clientes",
    icon: "Users",
    hash: "clientes",
  },
  {
    item: "example-finance",
    comp: "FinanceScreen",
    path: "@/examples/finance",
    label: "Financeiro",
    icon: "Wallet",
    hash: "finance",
  },
  {
    item: "example-dashboard",
    comp: "DashboardScreen",
    path: "@/examples/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    hash: "dashboard",
  },
  {
    item: "example-order-detail",
    comp: "OrderDetailScreen",
    path: "@/examples/order-detail",
    label: "Detalhe do pedido",
    icon: "FileText",
    hash: "order-detail",
  },
  {
    item: "example-edit-page",
    comp: "EditPageScreen",
    path: "@/examples/edit-page",
    label: "Edição",
    icon: "PencilLine",
    hash: "edit-page",
  },
  {
    item: "example-chat",
    comp: "ChatScreen",
    path: "@/examples/chat",
    label: "Chat",
    icon: "MessagesSquare",
    hash: "chat",
  },
  {
    item: "example-mapa-rede",
    comp: "MapaDeRedeScreen",
    path: "@/examples/mapa-rede",
    label: "Mapa de Rede",
    icon: "Network",
    hash: "mapa-rede",
  },
];

/** Gera o src/App.tsx: AppShell + nav (Início→tutorial + exemplos instalados) com hash-routing. */
function buildAppShellApp(examples) {
  const iconSet = [
    "Rocket",
    "Monitor",
    "Sun",
    "Moon",
    ...new Set(examples.map((e) => e.icon)),
  ].join(", ");
  const exImports = examples
    .map((e) => `import { ${e.comp} } from "${e.path}";`)
    .join("\n");
  const navItems = [
    `{ name: "Início", icon: Rocket, href: "#inicio" }`,
    ...examples.map(
      (e) => `{ name: "${e.label}", icon: ${e.icon}, href: "#${e.hash}" }`,
    ),
  ].join(",\n      ");
  const screenMap = [
    `inicio: <Welcome />`,
    ...examples.map((e) => `"${e.hash}": <${e.comp} />`),
  ].join(",\n    ");
  return `import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ${iconSet} } from "lucide-react";
import { AppShell } from "@/components/ui/AppShell";
import { Welcome } from "@/welcome";
${exImports}

type Theme = "light" | "dark" | "system";

const CONTEXTS = [
  {
    id: "app",
    label: "Telas",
    icon: Rocket,
    items: [
      ${navItems},
    ],
  },
];

const THEME_OPTIONS = [
  { id: "system", label: "Sistema", icon: Monitor },
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Escuro", icon: Moon },
];

function useHashRoute() {
  const [hash, setHash] = useState(() =>
    typeof window === "undefined" ? "inicio" : window.location.hash.replace("#", "") || "inicio",
  );
  useEffect(() => {
    const fn = () => setHash(window.location.hash.replace("#", "") || "inicio");
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return hash;
}

export default function App() {
  const [theme, setTheme] = useState<Theme>("system");
  const route = useHashRoute();

  useEffect(() => {
    const root = document.documentElement;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && mq.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    if (theme !== "system") return;
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const SCREENS: Record<string, ReactNode> = {
    ${screenMap},
  };

  return (
    <AppShell
      contexts={CONTEXTS}
      defaultActiveContextId="app"
      defaultActiveItemHref="#inicio"
      breadcrumb={[{ label: "iGreen DS" }]}
      theme={theme}
      onThemeChange={(id) => setTheme(id as Theme)}
      themeOptions={THEME_OPTIONS}
      user={{ name: "Você", email: "voce@empresa.com", initials: "VC" }}
    >
      {SCREENS[route] ?? <Welcome />}
    </AppShell>
  );
}
`;
}

/* ── main ────────────────────────────────────────────────────────── */

async function main() {
  const BANNER = [
    "",
    "   _  ____                     ",
    "  (_)/ ___|_ __ ___  ___ _ __  ",
    "  | | |  _| '__/ _ \\/ _ \\ '_ \\ ",
    "  | | |_| | | |  __/  __/ | | |",
    "  |_|\\____|_|  \\___|\\___|_| |_|",
    "",
  ];
  console.log(pc.green(pc.bold(BANNER.join("\n"))));
  console.log(
    pc.green(pc.bold("  iGreen Design System")) +
      pc.dim(`  ·  create-design-system v${CLI_VERSION}`),
  );
  console.log(
    pc.dim(
      "  Bootstrap de um projeto que consome o iGreen DS (registry + kit de telas)",
    ),
  );
  console.log();

  const argv = process.argv.slice(2);

  // `--only-kit` instala só o payload num projeto existente e SAI — não cai no
  // fluxo de scaffold abaixo, que criaria projeto novo. Ver o bloco de comentário
  // no topo deste arquivo pra por que ele recusa em projeto com submódulo.
  if (argv.includes("--only-kit")) {
    installKit({ cwd: process.cwd(), force: argv.includes("--force") });
    return;
  }

  // Nome do projeto = primeiro argumento que não seja flag.
  const argName = argv.find((a) => !a.startsWith("-"));
  const defaultPm = detectPackageManager();
  const availableTemplates = listTemplates();

  if (availableTemplates.length === 0) {
    console.log(pc.red("Error: no templates found in templates/ directory."));
    process.exit(1);
  }

  // Temas de cor disponíveis (marcas). "default" = verde iGreen (sem overlay).
  // As demais aplicam um overlay src/styles/theme/brand-<id>.css + data-theme.
  const BRAND_THEMES = detectBrandThemes(join(TEMPLATES_DIR, availableTemplates[0]));

  // Step 1: collect answers
  const answers = await prompts(
    [
      {
        type: argName ? null : "text",
        name: "projectName",
        message: "Project name?",
        initial: "my-app",
        validate: validateProjectName,
      },
      {
        type: availableTemplates.length > 1 ? "select" : null,
        name: "template",
        message: "Template?",
        choices: availableTemplates.map((t) => ({ title: t, value: t })),
        initial: 0,
      },
      {
        type: BRAND_THEMES.length > 1 ? "select" : null,
        name: "theme",
        message: "Tema de cor?",
        choices: BRAND_THEMES.map((t) => ({ title: t.label, value: t.id })),
        initial: 0,
      },
      {
        type: "password",
        name: "igreenToken",
        message:
          "IGREEN_TOKEN (Bearer do registry — Enter pra pular e colar depois)?",
      },
      {
        type: "select",
        name: "packageManager",
        message: "Package manager?",
        choices: [
          { title: "npm", value: "npm" },
          { title: "pnpm", value: "pnpm" },
          { title: "yarn", value: "yarn" },
          { title: "bun", value: "bun" },
        ],
        initial: ["npm", "pnpm", "yarn", "bun"].indexOf(defaultPm),
      },
      {
        type: "confirm",
        name: "installDeps",
        message: "Install dependencies now?",
        initial: true,
      },
      {
        type: "confirm",
        name: "installExamples",
        message:
          "Instalar as páginas de exemplo (clientes, finance, dashboard, detalhe, edição, chat) já no menu?",
        initial: true,
      },
      {
        type: "confirm",
        name: "initGit",
        message: "Initialize a git repository?",
        initial: true,
      },
    ],
    {
      onCancel: () => {
        console.log();
        console.log(pc.yellow("✗ Cancelled."));
        process.exit(0);
      },
    },
  );

  const projectName = argName || answers.projectName;
  // argName pula o prompt → o `validate` do prompts não roda nele. Valida aqui
  // pra não gerar pkg.name/pasta inválidos quando vier por argumento.
  if (argName) {
    const valid = validateProjectName(projectName);
    if (valid !== true) {
      console.log();
      console.log(pc.red(`✗ ${valid}`));
      process.exit(1);
    }
  }
  const template = answers.template || DEFAULT_TEMPLATE;
  const { packageManager, installDeps, initGit, igreenToken, installExamples } =
    answers;

  // Step 2: validate destination
  const projectDir = resolve(process.cwd(), projectName);
  if (existsSync(projectDir) && !isDirectoryEmpty(projectDir)) {
    console.log();
    console.log(
      pc.red(`✗ Directory "${projectName}" already exists and is not empty.`),
    );
    process.exit(1);
  }

  // Step 3: copy template
  const templateDir = join(TEMPLATES_DIR, template);
  if (!existsSync(templateDir)) {
    console.log(
      pc.red(`✗ Template "${template}" not found in ${TEMPLATES_DIR}`),
    );
    process.exit(1);
  }

  mkdirSync(projectDir, { recursive: true });
  console.log();
  console.log(pc.cyan(`→ Copying template "${template}"…`));
  copyRecursive(templateDir, projectDir);

  // Step 4: substitute project name in package.json
  const pkgPath = join(projectDir, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    pkg.name = projectName;
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  }

  // Step 4b: título do browser = "iGreen - <projeto>" (antes era fixo "Exemplo —
  // iGreen Design System"). Favicon já é a logo iGreen (public/favicon.svg).
  const indexHtmlPath = join(projectDir, "index.html");
  if (existsSync(indexHtmlPath)) {
    const html = readFileSync(indexHtmlPath, "utf8").replace(
      /<title>.*?<\/title>/,
      `<title>iGreen - ${projectName}</title>`,
    );
    writeFileSync(indexHtmlPath, html, "utf8");
  }

  // Step 4c: aplica o tema de cor escolhido (overlay + data-theme) e poda o resto.
  const selectedTheme = answers.theme || "default";
  applyBrandTheme(projectDir, selectedTheme);
  if (selectedTheme !== "default") {
    console.log(pc.dim(`  Tema de cor: ${selectedTheme} (data-theme aplicado)`));
  }

  // Step 5: rename _gitignore → .gitignore
  const gitignoreSrc = join(projectDir, "_gitignore");
  const gitignoreDst = join(projectDir, ".gitignore");
  if (existsSync(gitignoreSrc)) {
    renameSync(gitignoreSrc, gitignoreDst);
  }

  // Step 5b: env do registry — rename _env.local.example → .env.local.example
  // e, se o token foi informado, grava .env.local (gitignored) já pronto.
  const envExSrc = join(projectDir, "_env.local.example");
  const envExDst = join(projectDir, ".env.local.example");
  if (existsSync(envExSrc)) {
    renameSync(envExSrc, envExDst);
  }

  // Step 5b2: MCP — rename _mcp.json → .mcp.json (projeto nasce MCP-ready p/ Claude Code;
  // a IA do consumidor descobre/adiciona @igreen via o servidor `shadcn mcp`).
  const mcpSrc = join(projectDir, "_mcp.json");
  const mcpDst = join(projectDir, ".mcp.json");
  if (existsSync(mcpSrc)) {
    renameSync(mcpSrc, mcpDst);
  }

  // Step 5b3: kit de construção — rename _claude → .claude (rules auto-carregadas,
  // skills crud-builder/ds-kit, commands). É o que faz o projeto nascer com o
  // orquestrador + skill de CRUD + DESIGN.md sabendo dos padrões do DS.
  const claudeSrc = join(projectDir, "_claude");
  const claudeDst = join(projectDir, ".claude");
  if (existsSync(claudeSrc)) {
    renameSync(claudeSrc, claudeDst);
  }
  const token = (igreenToken || "").trim();
  if (token) {
    // mode 0600: sem isso o writeFileSync usa 0o666 & ~umask → 0644, e o Bearer
    // do registry fica legível por qualquer usuário da máquina. O .gitignore já
    // cobre o arquivo (renomeado no Step 5, antes do `git add .` do Step 7).
    writeFileSync(join(projectDir, ".env.local"), `IGREEN_TOKEN=${token}\n`, {
      encoding: "utf8",
      mode: 0o600,
    });
  }

  // Step 5c: tela inicial AppShell (asset `_app-appshell.tsx`). Guarda o conteúdo
  // e remove o stray do projeto. Só vira `src/App.tsx` quando há token (precisa puxar
  // @igreen/app-shell do registry) — feito no Step 6b. Sem token, fica a tela de boas-vindas.
  // Tela de boas-vindas/tutorial (asset → src/welcome.tsx só quando há componentes).
  const welcomeAsset = join(projectDir, "_welcome.tsx");
  let welcomeContent = null;
  if (existsSync(welcomeAsset)) {
    welcomeContent = readFileSync(welcomeAsset, "utf8");
    unlinkSync(welcomeAsset);
  }

  // Step 6: install deps
  if (installDeps) {
    console.log(pc.cyan(`→ Installing dependencies with ${packageManager}…`));
    try {
      await run(packageManager, ["install"], projectDir);
    } catch (err) {
      console.log();
      console.log(
        pc.yellow(`⚠ Failed to install dependencies: ${err.message}`),
      );
      console.log(
        pc.dim(`  You can run "${packageManager} install" manually later.`),
      );
    }
  }

  // Step 6b: monta a tela inicial com AppShell (só com token + deps instaladas).
  // Puxa o set inicial do registry e promove o asset AppShell a src/App.tsx.
  // Falhou (sem rede / token inválido)? Mantém a tela de boas-vindas padrão —
  // NÃO escreve o App rico, que importaria componentes que não vieram (quebra em runtime).
  let examplesInstalled = false;
  if (token && installDeps && welcomeContent) {
    const exList = installExamples ? EXAMPLE_SCREENS : [];
    const addArgs = [
      "app-shell",
      "button",
      "card",
      "badge",
      "chip",
      "page-header",
      ...exList.map((e) => e.item),
    ];
    console.log(
      pc.cyan(
        `→ Montando a tela inicial (AppShell + tutorial${exList.length ? " + " + exList.length + " exemplos no menu" : ""})…`,
      ),
    );
    try {
      await run(
        packageManager,
        ["run", "igreen:add", "--", ...addArgs],
        projectDir,
      );
      // Só promove o App rico + welcome DEPOIS do igreen:add ter sucesso — senão
      // o App importaria componentes ausentes. No catch, mantém o App estático padrão.
      writeFileSync(
        join(projectDir, "src", "welcome.tsx"),
        welcomeContent,
        "utf8",
      );
      writeFileSync(
        join(projectDir, "src", "App.tsx"),
        buildAppShellApp(exList),
        "utf8",
      );
      examplesInstalled = installExamples;
      console.log(
        pc.green(
          `  ✓ Tela inicial pronta (tutorial${exList.length ? " + " + exList.length + " exemplos navegáveis no menu" : ""}).`,
        ),
      );
    } catch (err) {
      console.log(
        pc.yellow(
          `  ⚠ Não consegui montar a tela inicial (${err.message}). Mantida a tela de boas-vindas padrão.`,
        ),
      );
    }
  }

  // Step 7: git init + initial commit
  if (initGit) {
    console.log(pc.cyan("→ Initializing git repository…"));
    try {
      await run("git", ["init"], projectDir);
      await run("git", ["add", "."], projectDir);
      await run(
        "git",
        [
          "commit",
          "-m",
          "chore: initial commit from create-snksergio-design-system",
        ],
        projectDir,
      );
    } catch (err) {
      console.log();
      console.log(pc.yellow(`⚠ Failed to initialize git: ${err.message}`));
      console.log(pc.dim('  You can run "git init" manually later.'));
    }
  }

  // Step 8: print next steps
  const runCmd =
    packageManager === "npm" ? "npm run dev" : `${packageManager} dev`;

  console.log();
  // Logo iGreen (~50 cols). Só imprime se o terminal comporta — senão a arte
  // quebra na borda e fica pior que ausente (o banner inicial já mostrou a marca).
  if (LOGO_ASCII && (process.stdout.columns ?? 80) >= 50) {
    console.log(pc.green(LOGO_ASCII));
    console.log();
  }
  console.log(pc.green(pc.bold("✨ Done!")));
  console.log();
  console.log(pc.bold("Next steps:"));
  console.log();
  if (resolve(process.cwd()) !== projectDir) {
    console.log(pc.cyan(`  cd ${basename(projectDir)}`));
  }
  if (!installDeps) {
    console.log(pc.cyan(`  ${packageManager} install`));
  }
  if (!token) {
    console.log(
      pc.cyan("  cp .env.local.example .env.local") +
        pc.dim("   # cole o IGREEN_TOKEN"),
    );
  }
  console.log(
    pc.cyan("  npm run igreen:add -- button") +
      pc.dim("   # puxe componentes do registry"),
  );
  console.log(pc.cyan(`  ${runCmd}`));
  // O usuário pediu exemplos, mas eles não foram instalados (sem token e/ou sem deps,
  // ou o igreen:add inicial falhou). Avisa como puxá-los depois — em vez de silêncio.
  if (installExamples && !examplesInstalled) {
    console.log();
    console.log(
      pc.yellow("⚠ Exemplos não instalados (faltou token/deps).") +
        pc.dim(" Depois:"),
    );
    console.log(
      pc.cyan(
        `  npm run igreen:add -- ${EXAMPLE_SCREENS.map((e) => e.item).join(" ")}`,
      ),
    );
  }
  console.log();
  console.log();
  console.log(
    pc.dim(
      'Kit de telas incluso: peça à IA "monte uma tabela de X" ou use /ds-create-crud.',
    ),
  );
  console.log(
    pc.dim(
      "Padrões de design em DESIGN.md (raiz) + regras auto-carregadas em .claude/.",
    ),
  );
  console.log(
    pc.dim(
      "Tema/cn/tv do DS já vêm configurados. `npm run doctor` valida a integridade do cn/tv.",
    ),
  );
  console.log(pc.dim("Preview will open at http://localhost:3200"));
  console.log();
}

main().catch((err) => {
  console.log();
  console.log(pc.red(`✗ Unexpected error: ${err.message}`));
  if (process.env.DEBUG) console.error(err);
  process.exit(1);
});
