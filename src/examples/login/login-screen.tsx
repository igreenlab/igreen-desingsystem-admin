import { useState } from "react";
import { Eye, EyeOff, LifeBuoy, Hexagon, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormFieldInput, FormFieldCheckbox } from "@/components/ui/FormField";

/**
 * LoginScreen — tela de login split (form à esquerda, painel de marca à direita).
 * **Self-contained e sem asset externo**: o painel direito é composto 100% por
 * tokens do DS (gradiente de marca + camadas decorativas + selling points), então
 * funciona igual em qualquer app — sem risco de imagem quebrada.
 *
 * Layout: split ≥lg, coluna única (só form) no mobile. Email + senha (com toggle
 * de visibilidade) + manter conectado + esqueci a senha + ajuda. Mockado:
 * `onSubmit` só previne o default — o consumidor pluga a auth real.
 *
 * Trocar por caso próprio: rótulos/marca no painel, campos do form, e o handler
 * `entrar`. Mantém FormField (L-023) + gap-form-gap (L-024) + tokens.
 */
const SELLING_POINTS = [
  { icon: Zap, label: "Acompanhe seus resultados em tempo real" },
  { icon: ShieldCheck, label: "Acesso seguro à sua conta" },
];

export function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [manter, setManter] = useState(true);

  const entrar = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock: plugue a autenticação real do seu app aqui.
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-gp-2xl bg-bg-canvas p-pad-2xl">
      <div className="grid w-full max-w-[1000px] overflow-hidden rounded-radius-2xl border border-border-subtle shadow-sh-lg lg:min-h-[620px] lg:grid-cols-2">
        {/* ── Esquerda: formulário ── */}
        <div className="flex flex-col justify-center gap-gp-3xl bg-bg-surface p-pad-4xl lg:px-[40px] lg:py-pad-6xl">
          <div className="mb-gp-md flex flex-col items-center gap-gp-lg text-center">
            <span className="grid size-[48px] place-items-center rounded-radius-2xl bg-bg-brand text-fg-on-brand shadow-sh-sm [&>svg]:size-icon-lg">
              <Hexagon strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-gp-2xs">
              <h1 className="text-heading-xs font-bold text-fg-default">
                Bem-vindo de volta
              </h1>
              <p className="mx-auto max-w-[300px] text-body-md text-fg-muted">
                Adicione suas credenciais abaixo para acessar sua conta.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-form-gap" onSubmit={entrar}>
            <FormFieldInput
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="voce@email.com"
              helperText="Use o email cadastrado na sua conta."
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
              href="#"
              className="rounded-radius-sm font-medium text-fg-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring-brand"
            >
              Fale com o suporte
            </a>
          </p>
        </div>

        {/* ── Direita: painel de marca (100% tokens, sem imagem) ── */}
        <div className="relative hidden overflow-hidden bg-bg-brand lg:flex lg:flex-col lg:justify-between">
          {/* Camadas decorativas — radiais suaves na cor do texto sobre marca */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.14] [background:radial-gradient(circle_at_18%_18%,var(--color-fg-on-brand)_0,transparent_42%),radial-gradient(circle_at_88%_8%,var(--color-fg-on-brand)_0,transparent_32%)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-fg-default/25"
          />

          <div className="relative z-10 flex flex-col gap-gp-lg p-pad-6xl text-fg-on-brand">
            <span className="grid size-[44px] place-items-center rounded-radius-xl bg-fg-on-brand/15 [&>svg]:size-icon-md">
              <Hexagon strokeWidth={1.8} />
            </span>
            <div className="flex flex-col gap-gp-md">
              <h2 className="text-heading-sm font-semibold leading-tight">
                Tudo o que você precisa, num só lugar.
              </h2>
              <p className="max-w-[340px] text-body-md text-fg-on-brand/80">
                Gerencie seus dados, acompanhe resultados e cresça com a sua
                equipe.
              </p>
            </div>
          </div>

          <ul className="relative z-10 flex flex-col gap-gp-lg p-pad-6xl text-fg-on-brand">
            {SELLING_POINTS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-gp-md">
                <span className="grid size-comp-lg shrink-0 place-items-center rounded-radius-full bg-fg-on-brand/15 [&>svg]:size-icon-sm">
                  <Icon strokeWidth={1.8} />
                </span>
                <span className="text-body-md text-fg-on-brand/90">{label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="text-center text-caption-sm text-fg-subtle">
        Ao continuar, você concorda com os Termos de Uso e a Política de
        Privacidade.
      </p>
    </div>
  );
}

export default LoginScreen;
