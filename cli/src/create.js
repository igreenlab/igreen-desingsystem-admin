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
const DEFAULT_TEMPLATE = "default";

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
      else rejectRun(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
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

/* ── main ────────────────────────────────────────────────────────── */

async function main() {
  console.log();
  console.log(pc.green(pc.bold("◇ @snksergio/create-design-system")));
  console.log(pc.dim("  Bootstrap a project consuming the iGreen Design System"));
  console.log();

  const argName = process.argv[2];
  const defaultPm = detectPackageManager();
  const availableTemplates = listTemplates();

  if (availableTemplates.length === 0) {
    console.log(pc.red("Error: no templates found in templates/ directory."));
    process.exit(1);
  }

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
        type: "password",
        name: "igreenToken",
        message: "IGREEN_TOKEN (Bearer do registry — Enter pra pular e colar depois)?",
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
    }
  );

  const projectName = argName || answers.projectName;
  const template = answers.template || DEFAULT_TEMPLATE;
  const { packageManager, installDeps, initGit, igreenToken } = answers;

  // Step 2: validate destination
  const projectDir = resolve(process.cwd(), projectName);
  if (existsSync(projectDir) && !isDirectoryEmpty(projectDir)) {
    console.log();
    console.log(pc.red(`✗ Directory "${projectName}" already exists and is not empty.`));
    process.exit(1);
  }

  // Step 3: copy template
  const templateDir = join(TEMPLATES_DIR, template);
  if (!existsSync(templateDir)) {
    console.log(pc.red(`✗ Template "${template}" not found in ${TEMPLATES_DIR}`));
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
  const token = (igreenToken || "").trim();
  if (token) {
    writeFileSync(join(projectDir, ".env.local"), `IGREEN_TOKEN=${token}\n`, "utf8");
  }

  // Step 5c: tela inicial AppShell (asset `_app-appshell.tsx`). Guarda o conteúdo
  // e remove o stray do projeto. Só vira `src/App.tsx` quando há token (precisa puxar
  // @igreen/app-shell do registry) — feito no Step 6b. Sem token, fica a tela de boas-vindas.
  const appShellAsset = join(projectDir, "_app-appshell.tsx");
  let appShellContent = null;
  if (existsSync(appShellAsset)) {
    appShellContent = readFileSync(appShellAsset, "utf8");
    unlinkSync(appShellAsset);
  }

  // Step 6: install deps
  if (installDeps) {
    console.log(pc.cyan(`→ Installing dependencies with ${packageManager}…`));
    try {
      await run(packageManager, ["install"], projectDir);
    } catch (err) {
      console.log();
      console.log(pc.yellow(`⚠ Failed to install dependencies: ${err.message}`));
      console.log(pc.dim(`  You can run "${packageManager} install" manually later.`));
    }
  }

  // Step 6b: monta a tela inicial com AppShell (só com token + deps instaladas).
  // Puxa o set inicial do registry e promove o asset AppShell a src/App.tsx.
  // Falhou (sem rede / token inválido)? Mantém a tela de boas-vindas padrão.
  if (token && installDeps && appShellContent) {
    console.log(pc.cyan("→ Montando a tela inicial com AppShell (puxando componentes do registry)…"));
    try {
      await run(packageManager, ["run", "igreen:add", "--", "app-shell", "button", "card", "badge"], projectDir);
      writeFileSync(join(projectDir, "src", "App.tsx"), appShellContent, "utf8");
      console.log(pc.green("  ✓ Tela AppShell pronta (sidebar + header + troca de tema)."));
    } catch (err) {
      console.log(pc.yellow(`  ⚠ Não consegui montar a tela AppShell (${err.message}). Mantida a tela inicial padrão.`));
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
        ["commit", "-m", "chore: initial commit from create-snksergio-design-system"],
        projectDir
      );
    } catch (err) {
      console.log();
      console.log(pc.yellow(`⚠ Failed to initialize git: ${err.message}`));
      console.log(pc.dim("  You can run \"git init\" manually later."));
    }
  }

  // Step 8: print next steps
  const runCmd =
    packageManager === "npm" ? "npm run dev" : `${packageManager} dev`;

  console.log();
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
    console.log(pc.cyan("  cp .env.local.example .env.local") + pc.dim("   # cole o IGREEN_TOKEN"));
  }
  console.log(pc.cyan("  npx shadcn@latest add @igreen/button") + pc.dim("   # puxe componentes do registry"));
  console.log(pc.cyan(`  ${runCmd}`));
  console.log();
  console.log(pc.dim("Tema/cn/tv do DS já vêm configurados. `npm run doctor` valida a integridade do cn/tv."));
  console.log(pc.dim("Preview will open at http://localhost:3200"));
  console.log();
}

main().catch((err) => {
  console.log();
  console.log(pc.red(`✗ Unexpected error: ${err.message}`));
  if (process.env.DEBUG) console.error(err);
  process.exit(1);
});
