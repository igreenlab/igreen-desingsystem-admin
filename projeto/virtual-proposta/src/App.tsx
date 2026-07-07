import { useEffect, useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { AppShell } from "~/layout/AppShell";
import { LoginPage } from "~/pages/login/LoginPage";

export function App() {
  // Tema dark por padrão (aplica `.dark` no <html> também na rota de login,
  // que renderiza fora do AppShell). Só força quando não há preferência salva.
  const { setTheme } = useTheme();
  useEffect(() => {
    if (!localStorage.getItem("igreen-ds-theme")) setTheme("dark");
  }, [setTheme]);

  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Login é pré-auth → renderiza fora do AppShell.
  if (hash.startsWith("#/login")) return <LoginPage />;
  return <AppShell />;
}
