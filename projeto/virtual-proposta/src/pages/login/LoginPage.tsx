import { useState } from "react";
import { Eye, EyeOff, LifeBuoy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormFieldInput, FormFieldCheckbox } from "@/components/ui/FormField";
import { SidebarBrandIcon } from "@/components/ui/MenuSidebar";

/**
 * Login do Portal do Licenciado — layout split (form à esquerda, imagem à
 * direita). Email + senha + manter conectado + esqueci a senha. Sem cadastro
 * (acesso é provisionado); só um atalho de ajuda. Mockado: "Entrar" → painel.
 *
 * Imagem do lado direito: coloque o arquivo em `public/login-bg.jpg`.
 */
export function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [manter, setManter] = useState(true);

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.hash = "#/geral/painel-v3";
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-gp-2xl overflow-hidden bg-bg-canvas p-pad-2xl">
      {/* Fundo ambiente: a própria imagem borrada e escurecida — a imagem nítida
          do container "sobressai" por cima. */}
      <img
        src={`${import.meta.env.BASE_URL}login-bg.png`}
        aria-hidden
        alt=""
        className="pointer-events-none absolute inset-0 size-full scale-110 object-cover opacity-20 blur-[60px] saturate-150"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-bg-canvas/85"
      />

      <div className="relative z-10 grid w-full max-w-[1000px] overflow-hidden rounded-radius-2xl border border-border-subtle shadow-sh-lg lg:min-h-[620px] lg:grid-cols-2">
        {/* Esquerda — formulário */}
        <div className="flex flex-col justify-center gap-gp-3xl bg-bg-surface p-pad-4xl lg:px-[40px] lg:py-pad-6xl">
          {/* Marca centralizada — quadrado arredondado com o "G" (igual ao menu) */}
          <div className="mb-gp-md flex flex-col items-center gap-gp-lg text-center">
            <span className="grid size-[48px] place-items-center rounded-radius-2xl bg-bg-brand text-fg-on-brand shadow-sh-sm">
              <SidebarBrandIcon size={24} />
            </span>
            <div className="flex flex-col gap-gp-2xs">
              <h1 className="text-heading-xs font-bold text-fg-default">
                Bem-vindo de volta
              </h1>
              <p className="mx-auto max-w-[300px] text-body-md text-fg-muted">
                Adicione suas credenciais abaixo para acessar o portal do
                licenciado.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-form-gap" onSubmit={entrar}>
            <FormFieldInput
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              helperText="Use o email cadastrado na sua licença."
              className="min-h-form-xl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <FormFieldInput
              label="Senha"
              type={showSenha ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Sua senha"
              className="min-h-form-xl"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              endAddon={
                <button
                  type="button"
                  aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
                  onClick={() => setShowSenha((s) => !s)}
                  className="grid place-items-center rounded-radius-sm text-fg-muted transition-colors hover:text-fg-default focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand [&>svg]:size-icon-sm"
                >
                  {showSenha ? <EyeOff /> : <Eye />}
                </button>
              }
            />

            <div className="flex items-center justify-between gap-gp-md">
              <FormFieldCheckbox
                label="Manter conectado"
                checked={manter}
                onCheckedChange={(v) => setManter(v === true)}
              />
              <button
                type="button"
                className="shrink-0 whitespace-nowrap rounded-radius-sm text-body-sm font-medium text-fg-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button
              type="submit"
              color="primary"
              variant="filled"
              size="lg"
              className="w-full min-h-form-xl"
            >
              Entrar
            </Button>
          </form>

          <p className="mt-gp-md flex flex-wrap items-center justify-center gap-gp-xs text-body-sm text-fg-muted [&>svg]:size-icon-sm [&>svg]:text-fg-subtle">
            <LifeBuoy />
            Precisa de ajuda para acessar?{" "}
            <a
              href="https://wa.me/"
              target="_blank"
              rel="noreferrer"
              className="rounded-radius-sm font-medium text-fg-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
            >
              Fale com o suporte
            </a>
          </p>
        </div>

        {/* Direita — imagem (some no mobile) */}
        <div className="relative hidden bg-bg-brand-subtle lg:block">
          <img
            src={`${import.meta.env.BASE_URL}login-bg.png`}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>

      <p className="relative z-10 mt-gp-md text-center text-caption-sm text-fg-subtle">
        Ao continuar, você concorda com os Termos de Uso e a Política de
        Privacidade.
      </p>
    </div>
  );
}

export default LoginPage;
