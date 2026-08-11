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
import { exportarRelatorioPdf } from "@/lib/export-registral";
import { TrechosConferidos, lerTrechos } from "@/components/TrechosConferidos";
import { getVertices, type VertexCoordRow } from "@/lib/export-registral";



export const Route = createFileRoute("/_authenticated/comparacoes/$id")({
  head: () => ({
    meta: [
      { title: "Relatório de comparação — GeoConfronto" },
      {
        name: "description",
        content:
          "Relatório auditável com achados classificados por severidade e evidências de origem.",
      },
      {
        property: "og:title",
        content: "Relatório de comparação — GeoConfronto",
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

  // Coordenadas dos vértices do documento A, para as colunas geodésicas/planas.
  const vertices = useQuery({
    enabled: !!comparison.data?.document_a_id,
    queryKey: ["comparison-vertices", id, comparison.data?.document_a_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select("raw_extraction")
        .eq("document_id", comparison.data!.document_a_id!);
      if (error) throw error;
      const map = new Map<string, VertexCoordRow>();
      (data ?? []).forEach((p) => {
        getVertices({ raw_extraction: p.raw_extraction } as never).forEach((v) => {
          const key = String(v.name ?? "").trim().replace(/[.,;]+$/, "").toUpperCase();
          if (key && !map.has(key)) map.set(key, v);
        });
      });
      return map;
    },
  });

  // Posição do documento comparado (B, C, D...) dentro da análise, usada para
  // colorir as informações de cada documento de forma consistente.
  const irmas = useQuery({
    enabled: !!comparison.data?.analysis_id,
    queryKey: ["comparison-siblings", comparison.data?.analysis_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comparisons")
        .select("id, document_b_id, created_at")
        .eq("analysis_id", comparison.data!.analysis_id)
        .order("created_at", { ascending: true });
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
  const trechos = lerTrechos(metrics);
  const extensaoConferida =
    typeof metrics["extensao_conferida_m"] === "number"
      ? (metrics["extensao_conferida_m"] as number)
      : null;
  const nomeDoc = (docId: string | null) =>
    (docs.data ?? []).find((d) => d.id === docId)?.file_name ?? "Documento";

  const idx = (irmas.data ?? []).findIndex((s) => s.id === c.id);
  const indiceB = idx >= 0 ? idx + 1 : 1;


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
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() =>
              exportarRelatorioPdf(
                {
                  titulo: `${nomeDoc(c.document_a_id)} × ${nomeDoc(c.document_b_id)}`,
                  tipo: TIPO_COMPARACAO[c.comparison_type] ?? c.comparison_type,
                  classificacao: c.classification,
                  resumo: c.summary,
                  emitidoEm: new Date(c.created_at).toLocaleString("pt-BR"),
                  documentoA: nomeDoc(c.document_a_id),
                  documentoB: nomeDoc(c.document_b_id),
                  tolerancias: tol,
                  contagens: counts,
                  trechos,
                  extensaoConferidaM: extensaoConferida,
                  achados: ordenados.map((f) => ({
                    severity: f.severity,
                    code: f.code,
                    title: f.title,
                    description: f.description,
                    evidence: f.evidence,
                  })),
                },
                `relatorio-conferencia-${c.id.slice(0, 8)}.pdf`,
              )
            }
          >
            Baixar relatório (PDF)
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Imprimir
          </Button>
        </div>

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

      <TrechosConferidos
        trechos={trechos}
        extensaoM={extensaoConferida}
        labelA={nomeDoc(c.document_a_id)}
        labelB={nomeDoc(c.document_b_id)}
        vertices={vertices.data}
        indiceB={indiceB}
      />




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
