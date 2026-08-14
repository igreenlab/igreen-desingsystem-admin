/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@igreen/tokens": path.resolve(__dirname, "tokens"),
    },
  },
  server: {
    port: 3100,
    open: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    css: false, // CSS não precisa ser processado nos testes
    // Escopo EXPLÍCITO, não o default do vitest (`**/*.test.*` menos node_modules/dist).
    // Medido em 2026-08-14: uma cópia do próprio DS numa subpasta não-versionada da
    // árvore (sandbox de instalação) fez o `npm test` coletar 30 arquivos a MAIS — e os
    // gates de governança resolvem path relativo ao próprio módulo, então essa cópia
    // auditava a OUTRA árvore. O resultado é verde (ou vermelho) sobre arquivos que não
    // são os que você editou: L-069 na forma de escopo de teste, e o mesmo risco vale
    // pra qualquer scaffold de dogfood deixado na raiz (ver BACKLOG "347 MB").
    // Os dois globs cobrem os 35 testes reais do repo.
    include: ["src/**/*.test.{ts,tsx}", "scripts/**/*.test.mjs"],
  },
});
