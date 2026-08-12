import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NavArrows } from "@/components/NavArrows";
import checkindexLogo from "@/assets/checkindex-logo.png";

export const Route = createFileRoute("/checkindex")({
  head: () => ({
    meta: [
      { title: "CheckIndex — Indexação de matrículas digitalizadas — e-Qualifica" },
      {
        name: "description",
        content:
          "Extraia dados estruturados de matrículas digitalizadas e exporte em CSV, XLSX ou JSON para importação no sistema interno do Cartório.",
      },
      { property: "og:title", content: "CheckIndex — Indexação de matrículas digitalizadas" },
      {
        property: "og:description",
        content: "Extração estruturada de matrículas e exportação para o sistema do Cartório.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckIndexFrontPage,
});

const CAPACIDADES: [string, string][] = [
  ["Leitura da matrícula", "PDF, DOCX, imagem ou texto colado; OCR opcional para digitalizações sem camada de texto."],
  ["Identificação registral", "Número da matrícula, livro, folha, cartório e data de abertura."],
  ["Imóvel", "Natureza (urbano/rural), endereço, município, UF, área e descrição tabular."],
  ["Cadastros", "Cadastro municipal, CIB (inclusive quando a matrícula traz NIRF), CCIR, CAR e inscrição estadual."],
  ["Partes e atos", "Proprietários com CPF/CNPJ, atos (R e AV) e ônus identificados na cadeia."],
  ["Exportação", "Arquivo CSV (ponto e vírgula, UTF-8), XLSX ou JSON com colunas fixas para importação."],
];

function CheckIndexFrontPage() {
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
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            e-Qualifica
          </Link>
        </div>
      </header>

      <section className="bg-ink text-ink-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-16 text-center md:py-20">
          <img
            src={checkindexLogo}
            alt="CheckIndex"
            width={1024}
            height={1024}
            className="h-40 w-auto object-contain md:h-52"
          />
          <div className="rule-gold mt-6 w-32" />
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-foreground/75 md:text-base">
            Módulo de indexação: extrai dados estruturados das matrículas digitalizadas e gera um
            arquivo padronizado para importação no sistema interno do Cartório.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-8">
            <Link to={signedIn ? "/indexacao" : "/auth"}>
              {signedIn ? "Abrir meus lotes de indexação" : "Entrar para começar"}
            </Link>
          </Button>
        </div>
      </section>

      <main className="mx-auto max-w-5xl px-6 py-16">
        <p className="eyebrow">O que o módulo extrai</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
          {CAPACIDADES.map(([titulo, texto]) => (
            <article key={titulo} className="bg-card p-6">
              <h2 className="font-display text-lg text-foreground">{titulo}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{texto}</p>
            </article>
          ))}
        </div>
        <p className="mt-10 text-xs text-muted-foreground">
          A extração é determinística e revisável: os dados devem ser conferidos antes da
          importação. O sistema apoia a decisão e não substitui a qualificação jurídica do Oficial.
        </p>
      </main>
    </div>
  );
}
