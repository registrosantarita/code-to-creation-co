import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trash2, Upload } from "lucide-react";
import {
  adicionarDocumento,
  complementarComIA,
  excluirDocumento,
  obterConjunto,
} from "@/lib/qualificacao.functions";
import { conferirQualificacao, type LinhaConferencia } from "@/lib/qualificacao-compare";
import { camposFaltantes, qualificacaoVazia, type Qualificacao } from "@/lib/qualificacao-parser";
import { docColor, docLetra, TONE_CLASS } from "@/lib/labels";

export const Route = createFileRoute("/_authenticated/qualificacao/$id")({
  head: () => ({
    meta: [
      { title: "Conferência de qualificação — GeoConfronto" },
      {
        name: "description",
        content:
          "Resultado do confronto de dados de qualificação das partes, cadastros do imóvel e cadeia registral.",
      },
      { property: "og:title", content: "Conferência de qualificação — GeoConfronto" },
      {
        property: "og:description",
        content: "Divergências cadastrais e pessoais entre os documentos conferidos.",
      },
    ],
  }),
  component: QualificacaoDetalhe,
});

const SITUACAO: Record<LinhaConferencia["situacao"], { label: string; tone: string }> = {
  conforme: { label: "Conforme", tone: "success" },
  divergente: { label: "Divergente", tone: "destructive" },
  incompleto: { label: "Não comparado", tone: "muted" },
  invalido: { label: "Inválido", tone: "destructive" },
};

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

function QualificacaoDetalhe() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const obter = useServerFn(obterConjunto);
  const adicionar = useServerFn(adicionarDocumento);
  const excluir = useServerFn(excluirDocumento);
  const complementar = useServerFn(complementarComIA);

  const fileRef = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [rotulo, setRotulo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["qualificacao", id],
    queryFn: () => obter({ data: { id } }),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["qualificacao", id] });

  const upload = useMutation({
    mutationFn: async (files: FileList) => {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "";
        await adicionar({
          data: {
            setId: id,
            label: rotulo || file.name,
            fileName: file.name,
            extension: ext,
            base64: toBase64(await file.arrayBuffer()),
          },
        });
      }
    },
    onSuccess: async () => {
      setRotulo("");
      if (fileRef.current) fileRef.current.value = "";
      await invalidar();
      toast.success("Documento processado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const colar = useMutation({
    mutationFn: async () => {
      if (texto.trim().length < 20) throw new Error("Cole o texto do documento.");
      return adicionar({ data: { setId: id, label: rotulo || "Texto colado", texto } });
    },
    onSuccess: async () => {
      setTexto("");
      setRotulo("");
      await invalidar();
      toast.success("Texto processado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: (docId: string) => excluir({ data: { id: docId } }),
    onSuccess: async () => {
      await invalidar();
      toast.success("Documento removido.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const ia = useMutation({
    mutationFn: (docId: string) => complementar({ data: { docId } }),
    onSuccess: async (r) => {
      await invalidar();
      if (r.ok) toast.success("Campos complementados pela IA.");
      else toast.error(r.note ?? "A IA não retornou dados.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const documentos = data?.documentos ?? [];

  const resultado = useMemo(() => {
    if (documentos.length < 2) return null;
    return conferirQualificacao(
      documentos.map((d, i) => ({
        rotulo: `Doc. ${docLetra(i)}`,
        dados: {
          ...qualificacaoVazia(),
          ...((d.extracted ?? {}) as unknown as Qualificacao),
        },
      })),
    );
  }, [documentos]);

  const blocos = useMemo(() => {
    const map = new Map<string, LinhaConferencia[]>();
    for (const l of resultado?.linhas ?? []) {
      const arr = map.get(l.bloco) ?? [];
      arr.push(l);
      map.set(l.bloco, arr);
    }
    return [...map.entries()];
  }, [resultado]);

  if (isLoading) return <main className="mx-auto max-w-6xl px-6 py-10 text-sm">Carregando…</main>;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="eyebrow">Conferência Automática de Dados de Qualificação</p>
      <h1 className="font-display text-2xl text-foreground">{data?.conjunto.title}</h1>
      {data?.conjunto.note && (
        <p className="mt-1 text-sm text-muted-foreground">{data.conjunto.note}</p>
      )}

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="font-display text-sm text-foreground">Enviar documento</h2>
          <div className="mt-3 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rotulo">Rótulo (opcional)</Label>
              <Input
                id="rotulo"
                value={rotulo}
                onChange={(e) => setRotulo(e.target.value)}
                placeholder="Ex.: Escritura pública"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,.docx,.doc,.txt,.rtf,.xlsx,.xls,.csv"
                onChange={(e) => e.target.files?.length && upload.mutate(e.target.files)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={upload.isPending}
              >
                <Upload className="mr-2 h-4 w-4" /> Procurar…
              </Button>
            </div>
            {upload.isPending && <p className="text-xs text-muted-foreground">Processando arquivo…</p>}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <h2 className="font-display text-sm text-foreground">Colar texto do documento</h2>
          <Textarea
            className="mt-3"
            rows={6}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Cole aqui a qualificação das partes, os cadastros do imóvel e a cadeia registral."
          />
          <Button className="mt-3" onClick={() => colar.mutate()} disabled={colar.isPending}>
            {colar.isPending ? "Processando…" : "Processar texto"}
          </Button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-sm text-foreground">Documentos conferidos</h2>
        <div className="mt-3 space-y-2">
          {!documentos.length && (
            <p className="rounded-md border border-border bg-card p-5 text-sm text-muted-foreground">
              Envie ao menos dois documentos para gerar a conferência.
            </p>
          )}
          {documentos.map((d, i) => {
            const dados = {
              ...qualificacaoVazia(),
              ...((d.extracted ?? {}) as unknown as Qualificacao),
            };
            const faltas = camposFaltantes(dados);
            return (
              <div
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4"
              >
                <div>
                  <p className={`font-display text-sm ${docColor(i)}`}>
                    Doc. {docLetra(i)} — {d.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dados.pessoas.length} parte(s) identificada(s) · extração: {d.extraction_source}
                    {faltas.length > 0 && ` · ${faltas.length} campo(s) não localizado(s)`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => ia.mutate(d.id)}
                    disabled={ia.isPending || faltas.length === 0}
                    title={
                      faltas.length === 0
                        ? "Nenhum campo pendente — IA desnecessária"
                        : "Complementar apenas os campos não localizados (consome créditos)"
                    }
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Complementar com IA
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remover documento"
                    onClick={() => remover.mutate(d.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {resultado && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-lg text-foreground">Resultado da conferência</h2>
            <Badge variant="outline">{resultado.resumo.conformes} conformes</Badge>
            <Badge variant="outline">{resultado.resumo.divergentes} divergentes</Badge>
            <Badge variant="outline">{resultado.resumo.invalidos} inválidos</Badge>
            <Badge variant="outline">{resultado.resumo.incompletos} não comparados</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Resultado meramente instrumental: a qualificação jurídica permanece com o Oficial.
          </p>

          {blocos.map(([bloco, linhas]) => (
            <div key={bloco} className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
              <p className="border-b border-border px-4 py-2 font-display text-sm text-foreground">
                {bloco}
              </p>
              <table className="w-full table-auto text-xs">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="px-3 py-2 font-normal">CAMPO</th>
                    {documentos.map((d, i) => (
                      <th key={d.id} className={`px-3 py-2 font-normal ${docColor(i)}`}>
                        DOC. {docLetra(i)}
                      </th>
                    ))}
                    <th className="px-3 py-2 font-normal">SITUAÇÃO</th>
                    <th className="px-3 py-2 font-normal">OBSERVAÇÃO</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((l, idx) => (
                    <tr key={`${l.campo}-${idx}`} className="border-b border-border/60 align-top">
                      <td className="px-3 py-2 text-foreground">{l.campo}</td>
                      {l.valores.map((v, i) => (
                        <td key={i} className={`px-3 py-2 ${docColor(i)}`}>
                          {v ?? "—"}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 ${TONE_CLASS[SITUACAO[l.situacao].tone]}`}
                        >
                          {SITUACAO[l.situacao].label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{l.observacao ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
