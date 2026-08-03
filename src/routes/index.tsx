import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conferência Registral — Qualificação técnica assistida" },
      {
        name: "description",
        content:
          "Extração, normalização e comparação auditável de memoriais descritivos, divisas e confrontações para apoio à qualificação registral.",
      },
      {
        property: "og:title",
        content: "Conferência Registral — Qualificação técnica assistida",
      },
      {
        property: "og:description",
        content:
          "Compare memoriais, valide divisas e gere relatórios auditáveis sem substituir a decisão do Oficial.",
      },
    ],
  }),
  component: Index,
});

const CAPACIDADES = [
  {
    titulo: "Ingestão",
    texto:
      "Upload de PDF, TXT, CSV e demais formatos, além de texto colado diretamente pelo analista.",
  },
  {
    titulo: "Extração",
    texto:
      "Leitura de área, perímetro, vértices, rumos, azimutes, distâncias e confrontantes do memorial.",
  },
  {
    titulo: "Normalização",
    texto:
      "Conversão de rumo para azimute, padronização de unidades e organização de segmentos e vértices.",
  },
  {
    titulo: "Comparação",
    texto:
      "Memorial x memorial e divisa comum entre confrontantes, com tolerâncias técnicas configuráveis.",
  },
  {
    titulo: "Achados",
    texto:
      "Divergências classificadas em críticas, moderadas, informativas e inconclusivas.",
  },
  {
    titulo: "Auditoria",
    texto:
      "Toda conclusão é rastreável até a evidência de origem, com trilha completa de processamento.",
  },
];

const PRINCIPIOS = [
  ["Apoio à decisão", "O sistema não substitui a qualificação jurídica do Oficial."],
  ["Explicabilidade", "Cada achado demonstra como foi obtido e sobre qual trecho incide."],
  ["Equivalência técnica", "A comparação prioriza sentido geométrico, não literalidade textual."],
  ["Human-in-the-loop", "Toda automação relevante admite revisão humana registrada."],
];

function Index() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setSignedIn(!!session),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 border border-accent bg-ink" aria-hidden />
            <div className="leading-tight">
              <p className="font-display text-base text-foreground">
                Conferência Registral
              </p>
              <p className="eyebrow">Plataforma técnica e normativa</p>
            </div>
          </div>
          {signedIn ? (
            <Button asChild size="sm">
              <Link to="/painel">Abrir painel</Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </header>

      <main>
        <section className="border-b border-border bg-ink text-ink-foreground">
          <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
            <p className="eyebrow text-accent">Qualificação registral assistida</p>
            <h1 className="mt-5 max-w-3xl text-4xl leading-tight md:text-6xl">
              Leitura, normalização e comparação auditável de documentos
              técnicos e registrais.
            </h1>
            <div className="rule-gold mt-8 w-40" />
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-foreground/75">
              A plataforma extrai área, perímetro, vértices, azimutes,
              distâncias e confrontantes; aplica tolerâncias técnicas; e produz
              relatórios rastreáveis até a evidência de origem — sem substituir a
              decisão jurídica e técnica humana.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="secondary">
                <Link to={signedIn ? "/painel" : "/auth"}>
                  {signedIn ? "Ir para minhas análises" : "Começar uma análise"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <p className="eyebrow">Escopo do MVP</p>
          <h2 className="mt-3 text-3xl">Capacidades operacionais</h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-3">
            {CAPACIDADES.map((c) => (
              <article key={c.titulo} className="bg-card p-7">
                <h3 className="text-xl text-foreground">{c.titulo}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {c.texto}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-secondary">
          <div className="mx-auto max-w-6xl px-6 py-20">
            <p className="eyebrow">Princípios do sistema</p>
            <h2 className="mt-3 text-3xl">Como a plataforma se comporta</h2>
            <dl className="mt-10 grid gap-8 md:grid-cols-2">
              {PRINCIPIOS.map(([titulo, texto]) => (
                <div key={titulo} className="border-l-2 border-accent pl-5">
                  <dt className="font-display text-lg text-foreground">{titulo}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {texto}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-xs text-muted-foreground">
          Plataforma Inteligente de Conferência Registral, Geométrica e
          Normativa — apoio à decisão, com trilha de auditoria integral.
        </p>
      </footer>
    </div>
  );
}
