import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Lock, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Redefinir senha — Rastreador ABC" },
      { name: "description", content: "Redefina sua senha de acesso ao Rastreador ABC." },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hashChecked, setHashChecked] = useState(false);
  const [validLink, setValidLink] = useState(false);

  useEffect(() => {
    const check = () => {
      const hash = window.location.hash;
      const ok = hash.includes("type=recovery");
      setValidLink(ok);
      if (!ok) toast.error("Link de recuperação inválido ou expirado.");
      setHashChecked(true);
    };
    check();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidLink(true);
        setHashChecked(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Senha atualizada com sucesso!");
      navigate({ to: "/dashboard", replace: true });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h1 className="text-xl font-semibold tracking-tight">Redefinir senha</h1>
        <p className="text-sm text-muted-foreground">Digite sua nova senha de acesso.</p>
        {hashChecked && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nova senha"
                className="w-full pl-10 pr-3 py-2.5 bg-background border border-input rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60"
            >
              Salvar senha <ArrowRight className="size-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
