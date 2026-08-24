import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import logoAsset from "@/assets/equalifica-logo.png.asset.json";
import geoLogo from "@/assets/geoconfronto-logo.png.asset.json";
import checkLogo from "@/assets/checktitulo-logo.png.asset.json";
import checkindexLogoAsset from "@/assets/checkindex-logo.png.asset.json";
import questioncheckLogoAsset from "@/assets/questioncheck-logo-v3.png.asset.json";
const checkindexLogo = checkindexLogoAsset.url;
const questioncheckLogo = questioncheckLogoAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "e-Qualifica — Qualificação Registral Assistida" },
      {
        name: "description",
        content:
          "Plataforma com dois módulos: GeoConfronto, para memoriais e plantas, e CheckTítulo, para conferência de títulos e matrículas.",
      },
      { property: "og:title", content: "e-Qualifica — Qualificação Registral Assistida" },
      {
        property: "og:description",
        content: "GeoConfronto (memorial e planta) e CheckTítulo (títulos e matrículas).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-16 text-center md:py-24">
          <div className="border border-solid border-accent p-1">
            <img
              src={logoAsset.url}
              alt="e-Qualifica"
              className="h-32 w-32 object-contain md:h-40 md:w-40"
            />
          </div>

          <p className="mt-4 text-base tracking-wide text-ink-foreground/80 md:text-lg">
            Qualificação Registral Assistida
          </p>
          <p className="mt-2 text-xs italic text-ink-foreground/60">
            desenvolvido por Abrahão Jesus de Souza
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to={signedIn ? "/conta" : "/auth"}>
                {signedIn ? "Minha conta" : "Entrar"}
              </Link>
            </Button>
            {signedIn && (
              <Button
                size="lg"
                variant="outline"
                className="border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10"
                onClick={signOut}
              >
                Sair
              </Button>
            )}
          </div>

        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <p className="eyebrow text-center">Módulos</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/geoconfronto"
            className="group flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center transition hover:border-accent"
          >
            <img
              src={geoLogo.url}
              alt="GeoConfronto"
              className="h-24 w-auto object-contain lg:h-28"
            />

            <div className="rule-gold mt-3 w-16 opacity-80" />
            
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Memoriais descritivos, plantas e divisas: extração, normalização e comparação
              geométrica auditável.
            </p>
            <span className="mt-4 text-[11px] uppercase tracking-wide text-accent">Acessar módulo</span>
          </Link>

          <Link
            to="/checktitulo"
            className="group flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center transition hover:border-accent"
          >
            <img
              src={checkLogo.url}
              alt="CheckTítulo"
              className="h-24 w-auto object-contain lg:h-28"
            />

            <div className="rule-gold mt-3 w-16 opacity-80" />
            
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Títulos e matrículas: conferência de partes, documentos, estado civil, cadastros do
              imóvel e cadeia registral.
            </p>
            <span className="mt-4 text-[11px] uppercase tracking-wide text-accent">Acessar módulo</span>
          </Link>

          <Link
            to="/checkindex"
            className="group flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center transition hover:border-accent"
          >
            <img
              src={checkindexLogo}
              alt="CheckIndex"
              width={1024}
              height={1024}
              loading="lazy"
              className="h-24 w-auto object-contain lg:h-28"
            />

            <div className="rule-gold mt-3 w-16 opacity-80" />

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Matrículas digitalizadas: extração de dados estruturados e exportação para o sistema
              interno do Cartório.
            </p>
            <span className="mt-4 text-[11px] uppercase tracking-wide text-accent">Acessar módulo</span>
          </Link>

          <Link
            to="/questioncheck"
            className="group flex flex-col items-center rounded-lg border border-border bg-card p-6 text-center transition hover:border-accent"
          >
            <img
              src={questioncheckLogo}
              alt="QuestionCheck"
              loading="lazy"
              className="h-24 w-auto object-contain lg:h-28"
            />

            <div className="rule-gold mt-3 w-16 opacity-80" />

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Checklist condicional de qualificação: perguntas em sequência, alertas e exigências
              acumulados e nota de exigência editável.
            </p>
            <span className="mt-4 text-[11px] uppercase tracking-wide text-accent">Acessar módulo</span>
          </Link>
        </div>

      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-12">
        <p className="text-center text-xs text-muted-foreground">
          e-Qualifica — apoio à decisão, com trilha de auditoria integral. O sistema não substitui a
          qualificação jurídica do Oficial.
        </p>
      </footer>
    </div>
  );
}
