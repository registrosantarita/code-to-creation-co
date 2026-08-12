import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import logoAsset from "@/assets/equalifica-logo.png.asset.json";
import geoLogo from "@/assets/geoconfronto-logo.png.asset.json";
import checkLogo from "@/assets/checktitulo-logo.png.asset.json";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setSignedIn(!!session));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center md:py-28">
          <img
            src={logoAsset.url}
            alt="e-Qualifica"
            className="h-40 w-40 object-contain md:h-56 md:w-56"
          />
          
          <div className="rule-gold mt-6 w-40" />
          <p className="mt-6 text-base tracking-wide text-ink-foreground/80 md:text-lg">
            Qualificação Registral Assistida
          </p>
          <p className="mt-2 text-xs italic text-ink-foreground/60">
            desenvolvido por Abrahão Jesus de Souza
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-10">
            <Link to={signedIn ? "/conta" : "/auth"}>
              {signedIn ? "Minha conta" : "Entrar"}
            </Link>
          </Button>

        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="eyebrow text-center">Módulos</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Link
            to="/geoconfronto"
            className="group flex flex-col items-center rounded-lg border border-border bg-card p-10 text-center transition hover:border-accent"
          >
            <img
              src={geoLogo.url}
              alt="GeoConfronto"
              className="h-32 w-auto object-contain md:h-40"
            />
            
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Memoriais descritivos, plantas e divisas: extração, normalização e comparação
              geométrica auditável.
            </p>
            <span className="mt-6 text-xs uppercase tracking-wide text-accent">Acessar módulo</span>
          </Link>

          <Link
            to="/checktitulo"
            className="group flex flex-col items-center rounded-lg border border-border bg-card p-10 text-center transition hover:border-accent"
          >
            <img
              src={checkLogo.url}
              alt="CheckTítulo"
              className="h-32 w-auto object-contain md:h-40"
            />
            
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Títulos e matrículas: conferência de partes, documentos, estado civil, cadastros do
              imóvel e cadeia registral.
            </p>
            <span className="mt-6 text-xs uppercase tracking-wide text-accent">Acessar módulo</span>
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
