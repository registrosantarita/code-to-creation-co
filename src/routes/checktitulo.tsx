import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { NavArrows } from "@/components/NavArrows";
import equalificaLogo from "@/assets/equalifica-logo.png.asset.json";
import checkLogo from "@/assets/checktitulo-logo.png.asset.json";

export const Route = createFileRoute("/checktitulo")({
  head: () => ({
    meta: [
      { title: "CheckTítulo — Conferência de títulos e matrículas — e-Qualifica" },
      {
        name: "description",
        content:
          "Confronte partes, CPF/CNPJ, RG, endereço, estado civil, regime de bens, cadastros do imóvel e cadeia registral entre títulos e matrículas.",
      },
      { property: "og:title", content: "CheckTítulo — Conferência de títulos e matrículas" },
      {
        property: "og:description",
        content: "Módulo de conferência cadastral e pessoal de documentos registrais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckTituloFrontPage,
});

const CAPACIDADES = [
  ["Partes", "Nome, CPF/CNPJ com validação, RG e órgão expedidor, endereço e nacionalidade."],
  [
    "Estado civil",
    "Estado civil, regime de bens, data do casamento e cônjuge, confrontados entre documentos.",
  ],
  [
    "Cadastros do imóvel",
    "Cadastro municipal, CCIR, CIB, CAR e ITR conferidos entre título e matrícula.",
  ],
  [
    "Cadeia registral",
    "Matrícula, transcrição, registro anterior, livro e folha, para validar a continuidade.",
  ],
  [
    "Modos de confronto",
    "Título x Matrícula(s), sem limite de matrículas, ou Título x Título quando não houver matrícula.",
  ],
  [
    "Extração determinística",
    "A leitura é feita por regras, sem consumo de créditos; a IA é opcional e só complementa lacunas.",
  ],
];

function CheckTituloFrontPage() {
  const [signedIn, setSignedIn] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
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
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <NavArrows showHome />
          <Link to="/" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <div className="border border-solid border-accent p-0.5">
              <img src={equalificaLogo.url} alt="e-Qualifica" className="h-7 w-7 object-contain" />
            </div>
            e-Qualifica
          </Link>
        </div>
      </header>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16 text-center md:py-20">
          <div className="border border-solid border-accent p-1.5">
            <img
              src={checkLogo.url}
              alt="CheckTítulo"
              className="h-36 w-auto object-contain md:h-48"
            />
          </div>
          <h1 className="mt-8 font-display text-3xl md:text-5xl">CheckTítulo</h1>
          <div className="rule-gold mt-6 w-32" />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-foreground/75 md:text-base">
            Módulo de conferência automática dos dados de qualificação: partes, documentos de
            identificação, estado civil e regime de bens, cadastros do imóvel e cadeia registral,
            confrontados entre títulos e matrículas.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary">
              <Link to={signedIn ? "/qualificacao" : "/auth"}>
                {signedIn ? "Abrir minhas conferências" : "Entrar para começar"}
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

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="eyebrow">O que o módulo confere</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {CAPACIDADES.map(([titulo, texto]) => (
            <article key={titulo} className="bg-card p-6">
              <h2 className="font-display text-lg text-foreground">{titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          O sistema apoia a decisão e não substitui a qualificação jurídica do Oficial.
        </p>
      </main>
    </div>
  );
}
