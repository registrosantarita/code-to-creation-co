import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fmtCreditos } from "@/lib/credit-estimator";

export const Route = createFileRoute("/_authenticated/creditos")({
  head: () => ({
    meta: [
      { title: "Consumo de créditos — GeoConfronto" },
      {
        name: "description",
        content:
          "Consumo de créditos de IA por análise, com indicação de OCR acionado e histórico por data.",
      },
      {
        property: "og:title",
        content: "Consumo de créditos — GeoConfronto",
      },
      {
        property: "og:description",
        content:
          "Acompanhe o custo de IA de cada análise registral e o histórico diário.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PainelCreditos,
});

type Evento = {
  id: string;
  analysis_id: string | null;
  file_name: string | null;
  file_extension: string | null;
  operation: string;
  model: string;
  ocr_used: boolean;
  pages_estimated: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  credits_estimated: number;
  created_at: string;
  analyses: { title: string } | null;
};

function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR");
}

function horaCurta(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PainelCreditos() {
  const eventos = useQuery({
    queryKey: ["ai-usage"],
    queryFn: async (): Promise<Evento[]> => {
      const { data, error } = await supabase
        .from("ai_usage_events")
        .select(
          "id, analysis_id, file_name, file_extension, operation, model, ocr_used, pages_estimated, prompt_tokens, completion_tokens, total_tokens, credits_estimated, created_at, analyses(title)",
        )
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []) as unknown as Evento[];
    },
  });

  const lista = eventos.data ?? [];
  const totalCreditos = lista.reduce((a, e) => a + Number(e.credits_estimated), 0);
  const comOcr = lista.filter((e) => e.ocr_used);
  const totalTokens = lista.reduce((a, e) => a + e.total_tokens, 0);

  const porAnalise = new Map<
    string,
    { titulo: string; id: string | null; docs: number; ocr: number; creditos: number; ultima: string }
  >();
  for (const e of lista) {
    const chave = e.analysis_id ?? "sem-analise";
    const atual = porAnalise.get(chave) ?? {
      titulo: e.analyses?.title ?? "Análise removida",
      id: e.analysis_id,
      docs: 0,
      ocr: 0,
      creditos: 0,
      ultima: e.created_at,
    };
    atual.docs += 1;
    if (e.ocr_used) atual.ocr += 1;
    atual.creditos += Number(e.credits_estimated);
    if (e.created_at > atual.ultima) atual.ultima = e.created_at;
    porAnalise.set(chave, atual);
  }
  const analises = [...porAnalise.values()].sort((a, b) =>
    a.ultima < b.ultima ? 1 : -1,
  );

  const porData = new Map<string, { docs: number; ocr: number; creditos: number }>();
  for (const e of lista) {
    const dia = dataCurta(e.created_at);
    const atual = porData.get(dia) ?? { docs: 0, ocr: 0, creditos: 0 };
    atual.docs += 1;
    if (e.ocr_used) atual.ocr += 1;
    atual.creditos += Number(e.credits_estimated);
    porData.set(dia, atual);
  }
  const dias = [...porData.entries()];

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="eyebrow">Governança de custos</p>
      <h1 className="mt-2 font-display text-3xl">Consumo de créditos de IA</h1>
      <p className="mt-3 max-w-3xl text-sm text-muted-foreground">
        Somente documentos digitalizados e imagens acionam o OCR assistido por
        IA. Demais formatos são processados por parsers locais, com custo zero.
        Os valores abaixo são estimativas derivadas dos tokens efetivamente
        consumidos em cada extração.
      </p>
      <div className="rule-gold mt-6 w-24" />

      <section className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          { rotulo: "Créditos estimados", valor: fmtCreditos(totalCreditos) },
          { rotulo: "Documentos processados", valor: String(lista.length) },
          { rotulo: "Com OCR", valor: String(comOcr.length) },
          { rotulo: "Tokens de IA", valor: totalTokens.toLocaleString("pt-BR") },
        ].map((c) => (
          <div key={c.rotulo} className="panel p-5">
            <p className="eyebrow">{c.rotulo}</p>
            <p className="mt-2 font-display text-2xl">{c.valor}</p>
          </div>
        ))}
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="text-xl">Por análise</h2>
        {eventos.isLoading && (
          <p className="mt-3 text-sm text-muted-foreground">Carregando...</p>
        )}
        {!eventos.isLoading && analises.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum processamento registrado até o momento.
          </p>
        )}
        {analises.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Análise</th>
                  <th className="py-2 pr-4">Documentos</th>
                  <th className="py-2 pr-4">OCR</th>
                  <th className="py-2 pr-4">Último processamento</th>
                  <th className="py-2 text-right">Créditos</th>
                </tr>
              </thead>
              <tbody>
                {analises.map((a) => (
                  <tr key={a.id ?? a.titulo} className="border-b border-border/60">
                    <td className="py-2 pr-4">
                      {a.id ? (
                        <Link
                          to="/analises/$id"
                          params={{ id: a.id }}
                          className="underline underline-offset-4"
                        >
                          {a.titulo}
                        </Link>
                      ) : (
                        a.titulo
                      )}
                    </td>
                    <td className="py-2 pr-4">{a.docs}</td>
                    <td className="py-2 pr-4">
                      {a.ocr > 0 ? (
                        <span className="rounded-sm border border-accent px-2 py-0.5 text-xs text-accent">
                          {a.ocr} acionado(s)
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Sem OCR
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-muted-foreground">
                      {horaCurta(a.ultima)}
                    </td>
                    <td className="py-2 text-right">{fmtCreditos(a.creditos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="text-xl">Histórico por data</h2>
        {dias.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Ainda não há histórico de consumo.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {dias.map(([dia, d]) => (
              <li
                key={dia}
                className="flex items-center justify-between gap-4 border-b border-border/60 py-2 text-sm"
              >
                <span className="w-24 shrink-0">{dia}</span>
                <span className="flex-1 text-xs text-muted-foreground">
                  {d.docs} documento(s) · {d.ocr} com OCR
                </span>
                <span>{fmtCreditos(d.creditos)} crédito(s)</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel mt-8 p-6">
        <h2 className="text-xl">Detalhamento por documento</h2>
        {lista.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Nenhum evento registrado.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="py-2 pr-4">Data</th>
                  <th className="py-2 pr-4">Documento</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Páginas</th>
                  <th className="py-2 pr-4">Tokens</th>
                  <th className="py-2 text-right">Créditos</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((e) => (
                  <tr key={e.id} className="border-b border-border/60">
                    <td className="py-2 pr-4 text-muted-foreground">
                      {horaCurta(e.created_at)}
                    </td>
                    <td className="py-2 pr-4">
                      {e.file_name ?? "Texto colado"}
                    </td>
                    <td className="py-2 pr-4">
                      {e.ocr_used ? (
                        <span className="rounded-sm border border-accent px-2 py-0.5 text-xs text-accent">
                          OCR acionado
                        </span>
                      ) : (
                        <span className="rounded-sm border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          Local · sem custo
                        </span>
                      )}
                    </td>
                    <td className="py-2 pr-4">{e.pages_estimated || "—"}</td>
                    <td className="py-2 pr-4">
                      {e.total_tokens ? e.total_tokens.toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className="py-2 text-right">
                      {fmtCreditos(Number(e.credits_estimated))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
