/// <reference types="node" />
/**
 * vite.lib.config.ts — Build de library NPM.
 *
 * Gera dist-lib/ com:
 *   - index.{mjs,cjs}    + types/index.d.ts  → componentes (root export)
 *   - tokens.{mjs,cjs}   + types              → tokens semânticos
 *   - preview/chat.*     + types              → ChatV2 showcase
 *   - preview/clientes.* + types              → ClientesShowcase
 *   - preview/dashboard.*+ types              → DashboardShowcase
 *   - preview/mocks.*    + types              → mocks reutilizáveis
 *   - theme.css                              → CSS Tailwind v4 gerado (copiado)
 *
 * Rodar via: npm run build:lib  (ou vite build --config vite.lib.config.ts)
 * NÃO substitui vite.config.ts, que serve o preview app no Vercel.
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import path from "path";
import fs from "fs";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.lib.json",
      outDir: "dist-lib/types",
      include: [
        "src/components/**/*",
        "src/utils/**/*",
        "src/hooks/**/*",
        "src/lib/**/*",
        "src/preview/pages/ChatV2/**/*",
        "src/preview/pages/ClientesShowcase/**/*",
        // Fixtures do ClientesShowcase. Precisa estar aqui porque o showcase é
        // incluído e importa daqui — sem isto, os `.d.ts` dele referenciam arquivo
        // fora do pacote e o import do consumidor vira `any` (L-017). Antes as
        // fixtures moravam no `TableDoc.tsx`, que o `exclude` abaixo tira.
        "src/preview/pages/_table-data.ts",
        "src/preview/pages/DashboardShowcase.tsx",
        "src/preview/mocks/**/*",
        "tokens/index.ts",
        "tokens/brands/**/*",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "src/preview/pages/*Doc.tsx",
        "src/preview/components/**",
        "src/App.tsx",
        "src/main.tsx",
        "tokens/transforms/**",
      ],
      insertTypesEntry: true,
    }),
    {
      /**
       * Copia o CSS de tema pro dist-lib:
       *   tailwind-theme.css  → dist-lib/theme.css          (tema-base)
       *   brand-<id>.css      → dist-lib/theme/brand-<id>.css  (overlays de marca)
       *
       * Os overlays passaram a ser copiados na v0.31.1. Antes o pacote npm só levava
       * o tema-base, então quem consumia por `npm install` **não tinha como usar
       * marca nenhuma** — nem `blue`/`green`/`pay`, que já existiam há versões. O
       * único canal que entregava tema era o scaffold do CLI. Medido no tarball da
       * v0.31.0: zero `brand-*.css`, e `tokens.mjs` só com os valores da default
       * (os `.d.ts` das marcas até traziam os literais, mas tipo não é valor —
       * ninguém consegue importar em runtime).
       */
      name: "copy-theme-css",
      closeBundle() {
        const themeDir = path.resolve(__dirname, "src/styles/theme");
        const base = path.join(themeDir, "tailwind-theme.css");
        if (fs.existsSync(base)) {
          fs.copyFileSync(base, path.resolve(__dirname, "dist-lib/theme.css"));
          console.log("✓ theme.css copiado para dist-lib/");
        } else {
          console.warn("⚠ theme.css não encontrado em src/styles/theme/ — rodar npm run tokens:tw4 antes");
        }

        // Fontes Geist. O `@font-face` do tema declara a família apontando pra
        // `/fonts/*.woff2` — caminho relativo à RAIZ DO SITE, não ao pacote.
        // Showcase e scaffold têm `public/fonts/`; o consumidor npm não, então ele
        // precisa copiar estes dois arquivos pro `public/` dele (documentado no
        // README). Publicamos pra que exista o que copiar — antes de 2026-08-07 os
        // .woff2 em dist-lib/fonts eram resquício de abril e `files` nem os incluía.
        const fontsSrc = path.resolve(__dirname, "public/fonts");
        if (fs.existsSync(fontsSrc)) {
          const woff = fs.readdirSync(fontsSrc).filter((f) => /\.woff2$/.test(f));
          if (woff.length) {
            const dst = path.resolve(__dirname, "dist-lib/fonts");
            fs.mkdirSync(dst, { recursive: true });
            for (const f of woff) fs.copyFileSync(path.join(fontsSrc, f), path.join(dst, f));
            console.log(`✓ ${woff.length} fonte(s) copiada(s) para dist-lib/fonts/`);
          }
        }

        const overlays = fs.existsSync(themeDir)
          ? fs.readdirSync(themeDir).filter((f) => /^brand-.+\.css$/.test(f))
          : [];
        if (overlays.length) {
          const dst = path.resolve(__dirname, "dist-lib/theme");
          fs.mkdirSync(dst, { recursive: true });
          for (const f of overlays) fs.copyFileSync(path.join(themeDir, f), path.join(dst, f));
          console.log(`✓ ${overlays.length} overlay(s) de marca copiado(s) para dist-lib/theme/`);
        }

        // Pacote de conteúdo para IA fora do Claude Code (roteiros, regras,
        // exemplos, guias, versão). Derivado 100% de fontes que já existem no
        // repo — ver o cabeçalho de `scripts/build-ai-bundle.mjs`.
        //
        // ⚠️ Roda AQUI, e não num script solto, porque `dist-lib/` é gitignored e
        // o `lib-verify` exige que todo dir declarado em `files` exista e não
        // esteja vazio. Gerado em outro passo, qualquer PR que toque o
        // package.json reprovaria no CI com erro que não aponta pra causa.
        //
        // Subprocesso em vez de import: mantém este hook síncrono (é o mesmo
        // padrão do `generated-artifacts`), e um exit != 0 do gerador — import
        // quebrado num exemplo, tabela de roteamento que mudou de forma —
        // derruba o build, que é o comportamento desejado.
        execFileSync(process.execPath, [path.resolve(__dirname, "scripts/build-ai-bundle.mjs")], {
          cwd: __dirname,
          stdio: "inherit",
        });

        // ⛔ Gate fail-closed: overlay que existe mas NÃO está no `exports` do
        // package.json é overlay que o consumidor npm não consegue importar — e
        // falha em silêncio, que é a classe de defeito da L-017. O `lib-verify` só
        // checa se o que foi PROMETIDO existe; não checa o inverso. Este é o inverso.
        const pkg = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, "package.json"), "utf8"),
        ) as { exports?: Record<string, unknown> };
        const semExport = overlays.filter((f) => !(`./theme/${f}` in (pkg.exports ?? {})));
        if (semExport.length) {
          throw new Error(
            `overlay(s) de marca sem entrada em package.json > exports: ${semExport.join(", ")}. ` +
              `Adicione "./theme/<arquivo>": "./dist-lib/theme/<arquivo>" — senão o pacote leva o ` +
              `arquivo mas o consumidor não tem como importá-lo (falha silenciosa, classe da L-017).`,
          );
        }
      },
    },
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@igreen/tokens": path.resolve(__dirname, "tokens"),
    },
  },

  build: {
    outDir: "dist-lib",
    emptyOutDir: true,
    sourcemap: true,
    target: "es2020",
    minify: false, // libraries não minificam — consumer minifica no build próprio
    cssCodeSplit: true,
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/components/index.ts"),
        /**
         * Subpath `./shadcn` — os primitivos adaptados, num entry SEPARADO.
         *
         * Por que não no barrel raiz: são 40 arquivos / 233 nomes exportados, e a
         * maioria dos consumidores usa 3 ou 4. No mesmo entry, todo `import` do pacote
         * puxa o grafo inteiro (Radix, cmdk, vaul, embla, input-otp, sonner) antes do
         * tree-shaking do bundler do consumidor ter chance. Em subpath próprio, quem
         * não importa `/shadcn` não paga nada.
         */
        shadcn: path.resolve(__dirname, "src/components/shadcn/index.ts"),
        tokens: path.resolve(__dirname, "tokens/index.ts"),
        "preview/chat": path.resolve(__dirname, "src/preview/pages/ChatV2/index.ts"),
        "preview/clientes": path.resolve(__dirname, "src/preview/pages/ClientesShowcase/index.ts"),
        "preview/dashboard": path.resolve(__dirname, "src/preview/pages/DashboardShowcase.tsx"),
        "preview/mocks": path.resolve(__dirname, "src/preview/mocks/index.ts"),
      },
      // formats não usado — definimos outputs explícitos no rollupOptions
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react-dom/client",
        /^@radix-ui\//,
        /^@dnd-kit\//,
        "@tanstack/react-virtual",
        "tailwindcss",
        "tailwind-merge",
        "tailwind-variants",
        "class-variance-authority",
        "clsx",
        "cmdk",
        "lucide-react",
        "geist",
        /^geist\//,
        "date-fns",
        "react-day-picker",
        "recharts",
        "tw-animate-css",
        /**
         * Deps dos primitivos e dos 4 componentes que entraram no barrel em 0.37.0.
         * Estavam em `dependencies` mas fora daqui — o que só não dava problema porque
         * nenhum deles era exportado. Ao abrir `./shadcn` e o barrel completo, sem esta
         * linha o Rollup os EMBUTIRIA no bundle: peso duplicado (o consumidor já os
         * instala como dep transitiva) e, no caso de `sonner`/`@hello-pangea/dnd`, duas
         * instâncias do mesmo módulo com contexto React próprio — o `<Toaster>` do
         * consumidor não veria o `toast()` disparado de dentro do pacote.
         */
        "vaul",
        "embla-carousel-react",
        "input-otp",
        "sonner",
        "@hello-pangea/dnd",
        /**
         * Deps do ChoroplethMap. Estavam em `dependencies` mas fora daqui, então o
         * Rollup as embutia no bundle único. Com `preserveModules` (abaixo) uma dep
         * embutida vira arquivo em `dist-lib/node_modules/…` — e o `npm pack` IGNORA
         * qualquer pasta `node_modules`, então o tarball sairia com import quebrado.
         */
        "d3-geo",
        "topojson-client",
      ],
      /**
       * `preserveModules` — um arquivo de saída por módulo-fonte, em vez de um
       * `index.mjs` único de ~4,9 MB.
       *
       * Por quê: o tree-shaking do bundler do CONSUMIDOR só descarta o que ele
       * consegue provar que não tem efeito colateral. Num arquivo único, todo
       * `forwardRef(...)`, `tv(...)` e `X.displayName = ...` de topo conta como
       * efeito — então importar só o `Button` arrastava a lib INTEIRA, incluindo o
       * mapa `Icon/icons.ts` (2.404 ícones, ~4,3 MB). Medido: consumidor Vite com
       * `import { Button }` gerava 5,6 MB de JS. Com um módulo por arquivo + o
       * `sideEffects` do package.json, o bundler descarta o MÓDULO inteiro que não
       * é alcançado — sem precisar provar nada statement a statement.
       *
       * Os módulos saem espelhando o fonte (`dist-lib/src/components/ui/<Nome>/…`),
       * ao lado dos `.d.ts` que o `vite-plugin-dts` já emitia ali — e que o `files`
       * já cobre (`dist-lib/src/**`, `dist-lib/tokens/**`). Os entries continuam com
       * o nome da chave em `lib.entry` (`index.mjs`, `shadcn.mjs`, `preview/chat.mjs`…),
       * então `exports`/`main`/`module` não mudam.
       */
      output: [
        {
          format: "es",
          preserveModules: true,
          preserveModulesRoot: __dirname,
          entryFileNames: "[name].mjs",
          exports: "named",
        },
        {
          format: "cjs",
          preserveModules: true,
          preserveModulesRoot: __dirname,
          entryFileNames: "[name].cjs",
          exports: "named",
        },
      ],
    },
  },
});
