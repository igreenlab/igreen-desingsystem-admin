import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// DS vive na raiz do repo (../../) — esta demo mora em projeto/virtual-proposta
// DENTRO do próprio DS. Aliases:  @ -> design system (src)   ~ -> código deste app
const DS_ROOT = path.resolve(__dirname, "../..");

export default defineConfig({
  // Servido como sub-caminho /demo/ dentro do deploy do showcase do DS
  // (mesmo domínio, sem URL separada). Override com VP_BASE se precisar.
  base: process.env.VP_BASE ?? "/demo/",
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      "@": path.resolve(DS_ROOT, "src"),
      "@igreen/tokens": path.resolve(DS_ROOT, "tokens"),
      "~": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3200,
    open: true,
    // permite ao Vite servir arquivos fora da raiz do projeto (a fonte do DS).
    fs: { allow: [DS_ROOT] },
  },
});
