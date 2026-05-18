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
      // copia o theme.css gerado pro dist-lib/ no final do build
      name: "copy-theme-css",
      closeBundle() {
        const themeSrc = path.resolve(__dirname, "src/styles/theme/tailwind-theme.css");
        const themeDst = path.resolve(__dirname, "dist-lib/theme.css");
        if (fs.existsSync(themeSrc)) {
          fs.copyFileSync(themeSrc, themeDst);
          console.log("✓ theme.css copiado para dist-lib/");
        } else {
          console.warn("⚠ theme.css não encontrado em src/styles/theme/ — rodar npm run tokens:tw4 antes");
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
