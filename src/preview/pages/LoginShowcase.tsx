import { LoginScreen } from "../../examples/login";

/**
 * LoginShowcase — wrapper de preview do example-login. Login é fullscreen SEM
 * chrome de app (sem AppShell), então o showcase apenas renderiza o exemplo
 * direto — fonte única em `src/examples/login/`, sem cópia paralela (nada a
 * derivar → sem drift). Servido via `?app=login`.
 */
export default function LoginShowcase() {
  return <LoginScreen />;
}
