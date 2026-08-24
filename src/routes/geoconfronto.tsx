import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NavArrows } from "@/components/NavArrows";
import equalificaLogo from "@/assets/equalifica-logo.png.asset.json";
import geoLogo from "@/assets/geoconfronto-logo.png.asset.json";

export const Route = createFileRoute("/geoconfronto")({
  head: () => ({
    meta: [
      { title: "GeoConfronto — Memoriais, plantas e divisas — e-Qualifica" },
      {
        name: "description",
        content:
          "Extração, normalização e comparação auditável de memoriais descritivos, plantas, divisas e confrontações.",
      },
      { property: "og:title", content: "GeoConfronto — Memoriais, plantas e divisas" },
      {
        property: "og:description",
        content: "Compare memoriais e plantas, valide divisas e gere relatórios auditáveis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GeoFrontPage,
});

const CAPACIDADES = [
  ["Ingestão", "Upload de PDF, DOCX, XLSX, TXT, CSV, KML/KMZ, GeoJSON e CAD (DWG/DXF), além de texto colado."],
  ["Extração", "Área, perímetro, vértices, coordenadas, altitude, rumos, azimutes e confrontantes."],
  ["Normalização", "Rumo para azimute, padronização de unidades e ordenação de segmentos."],
  [
    "Comparação",
    "Memorial x memorial, memorial x planta, planta x planta, memorial x título, divisa comum e comparação múltipla.",
  ],
  ["Achados", "Divergências críticas, moderadas, informativas e inconclusivas."],
  ["Exportação", "Relatório em PDF e planilha XLSX da descrição conferida para a matrícula."],
];

function GeoFrontPage() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <NavArrows showHome />
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <img src={equalificaLogo.url} alt="e-Qualifica" className="h-7 w-7 object-contain" />
            e-Qualifica
          </Link>
        </div>
      </header>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16 text-center md:py-20">
          <div className="border border-solid border-accent p-1.5">
            <img
              src={geoLogo.url}
              alt="GeoConfronto"
              className="h-36 w-auto object-contain md:h-48"
            />
          </div>
          <h1 className="mt-8 font-display text-3xl md:text-5xl">GeoConfronto</h1>
          <div className="rule-gold mt-6 w-32" />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-foreground/75 md:text-base">
            Módulo de conferência geométrica: leitura, normalização e comparação auditável de
            memoriais descritivos, plantas, divisas e confrontações, com tolerâncias técnicas
            configuráveis.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to={signedIn ? "/painel" : "/auth"}>
                {signedIn ? "Abrir minhas análises" : "Entrar para começar"}
              </Link>
            </Button>
            {signedIn && (
              <Button
                size="lg"
                variant="outline"
                className="border-ink-foreground/30 bg-transparent text-ink-foreground hover:bg-ink-foreground/10"
                onClick={async () => {
                  await supabase.auth.signOut();
                }}
              >
                Sair
              </Button>
            )}
          </div>

        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="eyebrow">O que o módulo faz</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {CAPACIDADES.map(([titulo, texto]) => (
            <article key={titulo} className="bg-card p-6">
              <h2 className="font-display text-lg text-foreground">{titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
