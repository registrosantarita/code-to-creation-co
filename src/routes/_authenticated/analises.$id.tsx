import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { processDocument, runComparison } from "@/lib/registral.functions";
import { DEFAULT_TOLERANCES } from "@/lib/comparison-engine";
import {
  CATEGORIA_DOCUMENTO,
  CLASSIFICACAO,
  STATUS_ANALISE,
  STATUS_DOCUMENTO,
  TIPO_COMPARACAO,
  TONE_CLASS,
  degToDms,
  fmtNum,
} from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { exportarDescricaoXlsx } from "@/lib/export-registral";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EstimativaCreditosArquivo } from "@/components/EstimativaCreditos";

export const Route = createFileRoute("/_authenticated/analises/$id")({
  head: () => ({
    meta: [
      { title: "Análise — GeoConfronto" },
      {
        name: "description",
        content:
          "Documentos, extrações técnicas, comparações e trilha de auditoria da análise registral.",
      },
      { property: "og:title", content: "Análise — GeoConfronto" },
      {
        property: "og:description",
        content: "Detalhe do caso de conferência registral e geométrica.",
      },
    ],
  }),
  component: AnaliseDetalhe,
});

type DocRow = {
  id: string;
  file_name: string | null;
  file_extension: string | null;
  source_type: string;
  document_category: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

function AnaliseDetalhe() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const extrair = useServerFn(processDocument);
  const comparar = useServerFn(runComparison);

  const [texto, setTexto] = useState("");
  const [arquivoPendente, setArquivoPendente] = useState<File | null>(null);
  const [nomeTexto, setNomeTexto] = useState("");
  const [categoria, setCategoria] = useState("memorial");
  const [docA, setDocA] = useState("");
  const [docB, setDocB] = useState("");
  const [tipo, setTipo] = useState("memorial_to_memorial");
  const [tol, setTol] = useState(DEFAULT_TOLERANCES);

  const analysis = useQuery({
    queryKey: ["analysis", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const documents = useQuery({
    queryKey: ["documents", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select(
          "id, file_name, file_extension, source_type, document_category, status, error_message, created_at",
        )
        .eq("analysis_id", id)
        .order("created_at");
      if (error) throw error;
      return data as DocRow[];
    },
  });

  const parcels = useQuery({
    queryKey: ["parcels", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parcels")
        .select("*, segments(*)")
        .eq("analysis_id", id);
      if (error) throw error;
      return data;
    },
  });

  const comparisons = useQuery({
    queryKey: ["comparisons", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comparisons")
        .select("id, comparison_type, classification, summary, created_at")
        .eq("analysis_id", id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const auditoria = useQuery({
    queryKey: ["audit", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  function refreshDocs() {
    queryClient.invalidateQueries({ queryKey: ["documents", id] });
    queryClient.invalidateQueries({ queryKey: ["parcels", id] });
  }

  const enviarTexto = useMutation({
    mutationFn: async () => {
      if (texto.trim().length < 40)
        throw new Error("Cole ao menos 40 caracteres do memorial.");
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Sessão expirada.");
      const { data, error } = await supabase
        .from("documents")
        .insert({
          analysis_id: id,
          source_type: "pasted_text",
          file_name: nomeTexto.trim() || "Texto colado",
          document_category: categoria as never,
          original_text: texto.slice(0, 200000),
          created_by: uid,
        })
        .select("id")
        .single();
      if (error) throw error;
      return extrair({ data: { documentId: data.id } });
    },
    onSuccess: (res) => {
      setTexto("");
      setNomeTexto("");
      refreshDocs();
      if (res.ok) {
        toast.success(`Extração concluída: ${res.segments} segmento(s).`);
        res.warnings.forEach((w) => toast.warning(w));
      } else {
        toast.error(res.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enviarArquivo = useMutation({
    mutationFn: async (file: File) => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error("Sessão expirada.");
      if (file.size > 25 * 1024 * 1024)
        throw new Error("Arquivo acima de 25 MB.");
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const path = `${uid}/${id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("documentos")
        .upload(path, file, { contentType: file.type || "application/octet-stream" });
      if (upErr) throw new Error("Falha no envio do arquivo.");
      const { data, error } = await supabase
        .from("documents")
        .insert({
          analysis_id: id,
          source_type: "upload",
          file_name: file.name.slice(0, 255),
          file_extension: ext,
          mime_type: file.type || null,
          file_size_bytes: file.size,
          storage_path: path,
          document_category: categoria as never,
          created_by: uid,
        })
        .select("id")
        .single();
      if (error) throw error;
      return extrair({ data: { documentId: data.id } });
    },
    onSuccess: (res) => {
      setArquivoPendente(null);
      refreshDocs();
      if (res.ok) {
        toast.success(`Extração concluída: ${res.segments} segmento(s).`);
        res.warnings.forEach((w) => toast.warning(w));
        if (res.note) toast.warning(res.note);
      } else {
        toast.warning(res.message);
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const reprocessar = useMutation({
    mutationFn: (documentId: string) => extrair({ data: { documentId } }),
    onSuccess: () => {
      refreshDocs();
      toast.success("Documento reprocessado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const executarComparacao = useMutation({
    mutationFn: async () => {
      if (!docA || !docB) throw new Error("Selecione dois documentos.");
      if (docA === docB) throw new Error("Selecione documentos distintos.");
      return comparar({
        data: {
          analysisId: id,
          documentAId: docA,
          documentBId: docB,
          comparisonType: tipo as never,
          tolerances: tol,
        },
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["comparisons", id] });
      navigate({ to: "/comparacoes/$id", params: { id: res.comparisonId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const extraidos = (documents.data ?? []).filter((d) => d.status === "parsed");

  const tipoSugerido = (() => {
    const cat = (id: string) =>
      extraidos.find((d) => d.id === id)?.document_category ?? "";
    const a = cat(docA);
    const b = cat(docB);
    if (!a || !b) return null;
    const par = [a, b].sort().join("|");
    if (par === "memorial|memorial") return "memorial_to_memorial";
    if (par === "memorial|planta") return "memorial_to_plan";
    if (par === "planta|planta") return "plan_to_plan";
    if (par === "matricula|memorial") return "memorial_to_registry";
    if (par === "escritura|memorial") return "memorial_to_title";
    return null;
  })();

  useEffect(() => {
    if (tipoSugerido) setTipo(tipoSugerido);
  }, [tipoSugerido]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link to="/painel" className="eyebrow hover:text-accent-foreground">
        ← Voltar ao painel
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="max-w-3xl text-4xl leading-tight">
            {analysis.data?.title ?? "Carregando..."}
          </h1>
          {analysis.data?.objective && (
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {analysis.data.objective}
            </p>
          )}
        </div>
        {analysis.data && (
          <span className="rounded-sm border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            {STATUS_ANALISE[analysis.data.status]}
          </span>
        )}
      </div>
      <div className="rule-gold mt-6 w-24" />

      <Tabs defaultValue="documentos" className="mt-8">
        <TabsList>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="comparacoes">Comparações</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>

        {/* ---------------- DOCUMENTOS ---------------- */}
        <TabsContent value="documentos" className="mt-6 space-y-8">
          <section className="panel p-6">
            <h2 className="text-xl">Ingerir documento</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Envie um arquivo (PDF e texto simples têm leitura automática) ou
              cole o texto do memorial descritivo.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Categoria documental</Label>
                  <Select value={categoria} onValueChange={setCategoria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIA_DOCUMENTO).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arquivo">Arquivo</Label>
                  <Input
                    id="arquivo"
                    type="file"
                    accept=".pdf,.txt,.csv,.md,.docx,.xlsx,.png,.jpg,.jpeg,.tif,.tiff,.webp,.kml,.kmz,.geojson,.json,.dwg"
                    disabled={enviarArquivo.isPending}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) setArquivoPendente(f);
                      e.target.value = "";
                    }}
                  />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    PDFs digitalizados e imagens passam por OCR assistido por IA.
                    Arquivos KML, KMZ e GeoJSON têm o perímetro, os azimutes e a
                    área calculados diretamente da geometria (WGS-84).
                  </p>
                </div>
                {arquivoPendente && (
                  <EstimativaCreditosArquivo
                    arquivo={arquivoPendente}
                    processando={enviarArquivo.isPending}
                    onCancelar={() => setArquivoPendente(null)}
                    onConfirmar={() => enviarArquivo.mutate(arquivoPendente)}
                  />
                )}

              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome-texto">Identificação do texto</Label>
                  <Input
                    id="nome-texto"
                    value={nomeTexto}
                    onChange={(e) => setNomeTexto(e.target.value)}
                    placeholder="Ex.: Memorial do requerente"
                    maxLength={255}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="texto">Texto do memorial</Label>
                  <Textarea
                    id="texto"
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    rows={6}
                    placeholder="Cole aqui o memorial descritivo..."
                  />
                </div>
                <Button
                  onClick={() => enviarTexto.mutate()}
                  disabled={enviarTexto.isPending}
                >
                  {enviarTexto.isPending ? "Extraindo..." : "Extrair do texto"}
                </Button>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl">Documentos da análise</h2>
            {documents.isLoading ? (
              <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
            ) : (documents.data ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhum documento ingerido até o momento.
              </p>
            ) : (
              <Accordion type="multiple" className="mt-4">
                {documents.data!.map((d) => {
                  const parcel = (parcels.data ?? []).find(
                    (p) => p.document_id === d.id,
                  );
                  return (
                    <AccordionItem key={d.id} value={d.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex w-full flex-wrap items-center gap-3 pr-3">
                          <span className="font-display text-base">
                            {d.file_name ?? "Texto colado"}
                          </span>
                          <span className="eyebrow">
                            {CATEGORIA_DOCUMENTO[d.document_category]}
                          </span>
                          <span
                            className={`ml-auto rounded-sm border px-2 py-0.5 text-[11px] ${
                              d.status === "parsed"
                                ? TONE_CLASS["success"]
                                : d.status === "failed"
                                  ? TONE_CLASS["destructive"]
                                  : TONE_CLASS["muted"]
                            }`}
                          >
                            {STATUS_DOCUMENTO[d.status]}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {d.error_message && (
                          <p className="mb-4 rounded-sm border border-warning/50 bg-warning/10 p-3 text-xs text-foreground">
                            {d.error_message}
                          </p>
                        )}
                        {parcel ? (
                          <>
                            <dl className="grid grid-cols-2 gap-4 md:grid-cols-4">
                              {[
                                ["Área", `${fmtNum(parcel.area_m2)} m²`],
                                [
                                  "Perímetro declarado",
                                  `${fmtNum(parcel.declared_perimeter_m)} m`,
                                ],
                                [
                                  "Perímetro calculado",
                                  `${fmtNum(parcel.computed_perimeter_m)} m`,
                                ],
                                ["Vértices", String(parcel.vertex_count)],
                                [
                                  "Altitude (mín–máx)",
                                  parcel.altitude_min_m === null
                                    ? "—"
                                    : `${fmtNum(parcel.altitude_min_m, 2)} – ${fmtNum(parcel.altitude_max_m, 2)} m`,
                                ],
                                [
                                  "Altitude média",
                                  parcel.altitude_mean_m === null
                                    ? "—"
                                    : `${fmtNum(parcel.altitude_mean_m, 2)} m`,
                                ],
                              ].map(([k, v]) => (
                                <div key={k}>
                                  <dt className="eyebrow">{k}</dt>
                                  <dd className="numeric mt-1 text-sm text-foreground">
                                    {v}
                                  </dd>
                                </div>
                              ))}
                            </dl>

                            {parcel.segments && parcel.segments.length > 0 && (
                              <div className="mt-6 overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-border">
                                      {[
                                        "#",
                                        "De",
                                        "Para",
                                        "Azimute",
                                        "Distância (m)",
                                        "Cota do vértice De (m)",
                                        "Confrontante",
                                      ].map((h) => (
                                        <th
                                          key={h}
                                          className="eyebrow py-2 pr-4 font-normal"
                                        >
                                          {h}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {[...parcel.segments]
                                      .sort((x, y) => x.seq - y.seq)
                                      .map((s) => (
                                        <tr
                                          key={s.id}
                                          className="border-b border-border/60"
                                        >
                                          <td className="numeric py-2 pr-4">
                                            {s.seq}
                                          </td>
                                          <td className="py-2 pr-4">
                                            {s.from_vertex ?? "—"}
                                          </td>
                                          <td className="py-2 pr-4">
                                            {s.to_vertex ?? "—"}
                                          </td>
                                          <td className="numeric py-2 pr-4">
                                            {degToDms(s.azimuth_deg)}
                                          </td>
                                          <td className="numeric py-2 pr-4">
                                            {fmtNum(s.distance_m, 3)}
                                          </td>
                                          <td className="numeric py-2 pr-4">
                                            {fmtNum(s.altitude_from_m, 2)}
                                          </td>
                                          <td className="py-2 pr-4 text-muted-foreground">
                                            {s.confrontante ?? "—"}
                                          </td>
                                        </tr>
                                      ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Nenhum dado técnico extraído deste documento.
                          </p>
                        )}
                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={reprocessar.isPending}
                            onClick={() => reprocessar.mutate(d.id)}
                          >
                            Reprocessar extração
                          </Button>
                          {parcel && (parcel.segments ?? []).length > 0 && (
                            <Button
                              size="sm"
                              onClick={() => {
                                const base = (d.file_name ?? "descricao").replace(
                                  /\.[^.]+$/,
                                  "",
                                );
                                const r = exportarDescricaoXlsx(
                                  {
                                    label: parcel.label,
                                    area_m2: parcel.area_m2,
                                    declared_perimeter_m: parcel.declared_perimeter_m,
                                    computed_perimeter_m: parcel.computed_perimeter_m,
                                    vertex_count: parcel.vertex_count,
                                    raw_extraction: parcel.raw_extraction,
                                    segments: (parcel.segments ?? []) as never,
                                  },
                                  `descricao-conferida-${base}.xlsx`,
                                );
                                toast.success(
                                  r.sigef
                                    ? `Planilha SIGEF gerada (${r.linhas} linhas): perímetro + confrontação.`
                                    : `Planilha gerada (${r.linhas} linhas) no layout de coordenadas planas.`,
                                );
                              }}
                            >
                              Baixar descrição (XLSX)
                            </Button>
                          )}
                        </div>

                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </section>
        </TabsContent>

        {/* ---------------- COMPARAÇÕES ---------------- */}
        <TabsContent value="comparacoes" className="mt-6 space-y-8">
          <section className="panel p-6">
            <h2 className="text-xl">Nova comparação</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Somente documentos com extração concluída podem ser comparados.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Documento A</Label>
                <Select value={docA} onValueChange={setDocA}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {extraidos.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.file_name ?? "Texto colado"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Documento B</Label>
                <Select value={docB} onValueChange={setDocB}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {extraidos.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.file_name ?? "Texto colado"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de comparação</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TIPO_COMPARACAO).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tipo === "boundary_to_boundary" ? (
                  <p className="text-xs text-muted-foreground">
                    Modo vizinhos: confere apenas o trecho de divisa compartilhado
                    (distâncias, azimutes e cotas), ignorando nomes de vértices,
                    área, perímetro total e reciprocidade de confrontantes.
                  </p>
                ) : null}
              </div>
            </div>

            <h3 className="mt-8 text-base">Tolerâncias técnicas</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {(
                [
                  ["areaPct", "Área (%)", 0.01],
                  ["perimeterPct", "Perímetro (%)", 0.01],
                  ["distanceM", "Distância (m)", 0.001],
                  ["azimuthDeg", "Azimute (°)", 0.0001],
                  ["altitudeM", "Altitude (m)", 0.01],
                ] as const
              ).map(([key, label, step]) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="number"
                    step={step}
                    min={0}
                    value={tol[key]}
                    onChange={(e) =>
                      setTol({ ...tol, [key]: Number(e.target.value) })
                    }
                  />
                </div>
              ))}
            </div>

            <Button
              className="mt-6"
              disabled={executarComparacao.isPending}
              onClick={() => executarComparacao.mutate()}
            >
              {executarComparacao.isPending
                ? "Comparando..."
                : "Executar comparação"}
            </Button>
          </section>

          <section>
            <h2 className="text-xl">Comparações realizadas</h2>
            {(comparisons.data ?? []).length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Nenhuma comparação registrada.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {comparisons.data!.map((c) => {
                  const cls = CLASSIFICACAO[c.classification ?? "inconclusive"]!;
                  return (
                    <li key={c.id}>
                      <Link
                        to="/comparacoes/$id"
                        params={{ id: c.id }}
                        className="panel block p-5 transition-colors hover:border-accent"
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="font-display text-base">
                            {TIPO_COMPARACAO[c.comparison_type]}
                          </span>
                          <span
                            className={`rounded-sm border px-2 py-0.5 text-[11px] ${TONE_CLASS[cls.tone]}`}
                          >
                            {cls.label}
                          </span>
                          <span className="numeric ml-auto text-[11px] text-muted-foreground">
                            {new Date(c.created_at).toLocaleString("pt-BR")}
                          </span>
                        </div>
                        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                          {c.summary}
                        </p>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </TabsContent>

        {/* ---------------- AUDITORIA ---------------- */}
        <TabsContent value="auditoria" className="mt-6">
          <h2 className="text-xl">Trilha de processamento</h2>
          <ul className="mt-4 space-y-2">
            {(auditoria.data ?? []).map((log) => (
              <li
                key={log.id}
                className="flex flex-wrap items-center gap-3 border-b border-border py-3 text-sm"
              >
                <span className="numeric text-xs text-muted-foreground">
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </span>
                <span className="eyebrow">{log.entity_type}</span>
                <span className="text-foreground">{log.action}</span>
              </li>
            ))}
            {(auditoria.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum evento registrado ainda.
              </p>
            )}
          </ul>
        </TabsContent>
      </Tabs>
    </main>
  );
}
