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

        const overlays = fs.existsSync(themeDir)
          ? fs.readdirSync(themeDir).filter((f) => /^brand-.+\.css$/.test(f))
          : [];
        if (overlays.length) {
          const dst = path.resolve(__dirname, "dist-lib/theme");
          fs.mkdirSync(dst, { recursive: true });
          for (const f of overlays) fs.copyFileSync(path.join(themeDir, f), path.join(dst, f));
          console.log(`✓ ${overlays.length} overlay(s) de marca copiado(s) para dist-lib/theme/`);
        }

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
      ],
      // 2 outputs separados — cada um com sua extensão correta nos entries E nos chunks
      output: [
        {
          format: "es",
          entryFileNames: "[name].mjs",
          chunkFileNames: "chunks/[name]-[hash].mjs",
          exports: "named",
        },
        {
          format: "cjs",
          entryFileNames: "[name].cjs",
          chunkFileNames: "chunks/[name]-[hash].cjs",
          exports: "named",
        },
      ],
    },
  },
});
