import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { Brain, Mail, Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/dashboard" });
  },
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Entrar — Rastreador ABC" },
      { name: "description", content: "Acesse sua conta do Rastreador ABC & Simulador de Análise Funcional." },
    ],
  }),
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else toast.success("Bem-vindo de volta!");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) toast.error(error.message);
      else toast.success("Verifique seu e-mail para confirmar a conta.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) toast.error(result.error.message || "Erro ao entrar com Google");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="size-12 rounded-2xl bg-primary/10 grid place-items-center mb-4">
            <Brain className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Rastreador ABC</h1>
          <p className="text-sm text-muted-foreground mt-1">Registre observações e simule análises funcionais com segurança.</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setMode("signin")}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${mode === "signin" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground"}`}
            >Entrar</button>
            <button
              onClick={() => setMode("signup")}
              className={`py-2 rounded-lg text-sm font-semibold transition-all ${mode === "signup" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"}`}
            >Criar conta</button>
          </div>

          <form onSubmit={handleEmail} className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-3 py-2.5 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                className="w-full pl-10 pr-3 py-2.5 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {mode === "signin" ? "Entrar" : "Criar conta"} <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase text-muted-foreground"><span className="bg-card px-2">ou</span></div>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full inline-flex items-center justify-center gap-2 bg-background border border-input text-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
          >
            <svg className="size-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continuar com Google
          </button>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Ao usar, você concorda com os termos de uso clínico.
          <br />
          <Link to="/" className="text-primary hover:underline">Voltar ao início</Link>
        </p>
      </div>
    </div>
  );
}
