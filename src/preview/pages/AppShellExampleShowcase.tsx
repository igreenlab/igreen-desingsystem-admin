import { AppShellExample } from "../../examples/app-shell";

/**
 * AppShellExampleShowcase — wrapper de preview do example-app-shell (esqueleto de
 * app completo). Fullscreen via `?app=app-shell`; fonte única em
 * `src/examples/app-shell/` (sem cópia paralela → sem drift).
 */
export default function AppShellExampleShowcase() {
  return <AppShellExample />;
}
