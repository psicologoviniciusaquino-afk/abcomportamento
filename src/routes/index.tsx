import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "@tanstack/react-router";
import { Brain, Shield, Lock, Smartphone, FileText } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: "Rastreador ABC & Simulador de Análise Funcional" },
      { name: "description", content: "Registre observações ABC e simule análises funcionais para prática e ensino em ABA." },
      { property: "og:title", content: "Rastreador ABC & Simulador de Análise Funcional" },
      { property: "og:description", content: "Registre observações ABC e simule análises funcionais para prática e ensino em ABA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/dashboard", replace: true });
    });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-xl bg-primary/10 grid place-items-center">
              <Brain className="size-5 text-primary" />
            </div>
            <span className="font-semibold tracking-tight">Rastreador ABC</span>
          </div>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-12 md:py-20 space-y-12">
        <section className="text-center space-y-5">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Registre comportamentos.<br />Simule análises funcionais.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Uma ferramenta clínica moderna para analistas do comportamento e terapeutas ABA registrarem observações ABC,
            executarem sessões experimentais e gerarem relatórios em PDF — com dados sincronizados na nuvem.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:opacity-90"
            >
              Começar agora
            </Link>
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="inline-flex items-center gap-2 bg-background border border-input text-foreground px-6 py-3 rounded-xl text-sm font-semibold hover:bg-accent"
            >
              Criar conta gratuita
            </Link>
          </div>
        </section>

        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature icon={Smartphone} title="Registro rápido" desc="Interface mobile-first para registrar ocorrências em segundos durante a sessão." />
          <Feature icon={Brain} title="Simulador AF" desc="Execute condições experimentais (Atenção, Demanda, Tangível, Brincar) e visualize taxas de resposta." />
          <Feature icon={FileText} title="Relatórios PDF" desc="Exporte relatórios clínicos com resumo, registros ABC, comparativo baseline/intervenção e sessões AF." />
          <Feature icon={Shield} title="Dados seguros" desc="Login com e-mail ou Google e armazenamento sincronizado na nuvem." />
        </section>

        <section className="rounded-2xl border border-border bg-card p-6 md:p-10 text-center">
          <Lock className="size-8 mx-auto text-primary mb-3" />
          <h2 className="text-xl font-semibold">Pronto para uso clínico e acadêmico</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
            Ideal para supervisores, terapeutas e estudantes de Análise do Comportamento. Acesse de qualquer dispositivo.
          </p>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Rastreador ABC. Ferramenta de apoio clínico-educacional.
      </footer>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
      <div className="size-10 rounded-xl bg-primary/10 grid place-items-center">
        <Icon className="size-5 text-primary" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
