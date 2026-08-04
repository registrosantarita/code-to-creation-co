import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  CLASSIFICACAO,
  SEVERIDADE,
  TIPO_COMPARACAO,
  TONE_CLASS,
  fmtNum,
} from "@/lib/labels";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/comparacoes/$id")({
  head: () => ({
    meta: [
      { title: "Relatório de comparação — Conferência Registral" },
      {
        name: "description",
        content:
          "Relatório auditável com achados classificados por severidade e evidências de origem.",
      },
      {
        property: "og:title",
        content: "Relatório de comparação — Conferência Registral",
      },
      {
        property: "og:description",
        content: "Achados técnicos rastreáveis da conferência registral.",
      },
    ],
  }),
  component: Relatorio,
});

const ORDEM: string[] = ["critical", "moderate", "inconclusive", "informative"];

function Relatorio() {
  const { id } = Route.useParams();

  const comparison = useQuery({
    queryKey: ["comparison", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comparisons")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const findings = useQuery({
    queryKey: ["findings", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("findings")
        .select("*")
        .eq("comparison_id", id);
      if (error) throw error;
      return data;
    },
  });

  const docs = useQuery({
    enabled: !!comparison.data,
    queryKey: ["comparison-docs", id],
    queryFn: async () => {
      const ids = [
        comparison.data!.document_a_id,
        comparison.data!.document_b_id,
      ].filter(Boolean) as string[];
      const { data, error } = await supabase
        .from("documents")
        .select("id, file_name, document_category")
        .in("id", ids);
      if (error) throw error;
      return data;
    },
  });

  if (comparison.isLoading || !comparison.data) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm text-muted-foreground">Carregando relatório...</p>
      </main>
    );
  }

  const c = comparison.data;
  const cls = CLASSIFICACAO[c.classification ?? "inconclusive"]!;
  const tol = (c.tolerances ?? {}) as Record<string, number>;
  const metrics = (c.metrics ?? {}) as Record<string, unknown>;
  const counts = (metrics["counts"] ?? {}) as Record<string, number>;
  const nomeDoc = (docId: string | null) =>
    (docs.data ?? []).find((d) => d.id === docId)?.file_name ?? "Documento";

  const ordenados = [...(findings.data ?? [])].sort(
    (a, b) => ORDEM.indexOf(a.severity) - ORDEM.indexOf(b.severity),
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-10 print:py-0">
      <div className="flex items-center justify-between gap-4 print:hidden">
        <Link
          to="/analises/$id"
          params={{ id: c.analysis_id }}
          className="eyebrow hover:text-accent-foreground"
        >
          ← Voltar à análise
        </Link>
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          Imprimir / PDF
        </Button>
      </div>

      <header className="mt-6">
        <p className="eyebrow">Relatório auditável de conferência</p>
        <h1 className="mt-2 text-4xl leading-tight">
          {TIPO_COMPARACAO[c.comparison_type]}
        </h1>
        <div className="rule-gold mt-5 w-24" />
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span
            className={`rounded-sm border px-3 py-1 text-xs ${TONE_CLASS[cls.tone]}`}
          >
            {cls.label}
          </span>
          <span className="numeric text-xs text-muted-foreground">
            Emitido em {new Date(c.created_at).toLocaleString("pt-BR")}
          </span>
        </div>
        <p className="mt-6 text-sm leading-relaxed text-foreground">{c.summary}</p>
      </header>

      <section className="panel mt-8 p-6">
        <h2 className="text-lg">Documentos comparados</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="eyebrow">Documento A</dt>
            <dd className="mt-1 text-sm">{nomeDoc(c.document_a_id)}</dd>
          </div>
          <div>
            <dt className="eyebrow">Documento B</dt>
            <dd className="mt-1 text-sm">{nomeDoc(c.document_b_id)}</dd>
          </div>
        </dl>

        <h3 className="mt-6 text-base">Tolerâncias adotadas</h3>
        <dl className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-5">
          {[
            ["Área", `${fmtNum(tol["areaPct"] ?? null, 2)} %`],
            ["Perímetro", `${fmtNum(tol["perimeterPct"] ?? null, 2)} %`],
            ["Distância", `${fmtNum(tol["distanceM"] ?? null, 3)} m`],
            ["Azimute", `${fmtNum(tol["azimuthDeg"] ?? null, 4)} °`],
            ["Altitude", `${fmtNum(tol["altitudeM"] ?? null, 2)} m`],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="eyebrow">{k}</dt>
              <dd className="numeric mt-1 text-sm">{v}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-6 text-base">Resumo quantitativo</h3>
        <dl className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            ["Críticos", counts["critical"] ?? 0],
            ["Moderados", counts["moderate"] ?? 0],
            ["Informativos", counts["informative"] ?? 0],
            ["Inconclusivos", counts["inconclusive"] ?? 0],
          ].map(([k, v]) => (
            <div key={String(k)}>
              <dt className="eyebrow">{k}</dt>
              <dd className="numeric mt-1 text-2xl">{String(v)}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl">Achados</h2>
        <ul className="mt-5 space-y-4">
          {ordenados.map((f) => {
            const sev = SEVERIDADE[f.severity]!;
            return (
              <li key={f.id} className="panel p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-sm border px-2 py-0.5 text-[11px] ${TONE_CLASS[sev.tone]}`}
                  >
                    {sev.label}
                  </span>
                  <h3 className="text-lg">{f.title}</h3>
                  <span className="eyebrow ml-auto">{f.code}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-foreground">
                  {f.description}
                </p>
                <details className="mt-4">
                  <summary className="eyebrow cursor-pointer hover:text-accent-foreground">
                    Evidência técnica
                  </summary>
                  <pre className="numeric mt-3 overflow-x-auto rounded-sm bg-muted p-4 text-[11px] leading-relaxed text-muted-foreground">
                    {JSON.stringify(f.evidence, null, 2)}
                  </pre>
                </details>
              </li>
            );
          })}
          {ordenados.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Nenhum achado registrado nesta comparação.
            </p>
          )}
        </ul>
      </section>

      <footer className="mt-12 border-t border-border pt-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Este relatório é instrumento de apoio à decisão. Não substitui a
          qualificação jurídica e técnica do Oficial. Todos os achados são
          rastreáveis até a evidência textual de origem registrada na análise.
        </p>
      </footer>
    </main>
  );
}
