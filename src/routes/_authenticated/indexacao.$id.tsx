import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Download, FileUp, Trash2 } from "lucide-react";
import {
  atualizarRegistro,
  excluirRegistro,
  indexarMatricula,
  obterLote,
} from "@/lib/checkindex.functions";
import { exportarCsv, exportarJson, exportarXlsx, type RegistroIndexado } from "@/lib/export-index";

export const Route = createFileRoute("/_authenticated/indexacao/$id")({
  head: () => ({
    meta: [
      { title: "CheckIndex — Lote de indexação — e-Qualifica" },
      {
        name: "description",
        content:
          "Revise os dados extraídos das matrículas digitalizadas e exporte o arquivo para o sistema do Cartório.",
      },
      { property: "og:title", content: "CheckIndex — Lote de indexação — e-Qualifica" },
      {
        property: "og:description",
        content: "Revisão e exportação dos dados indexados das matrículas.",
      },
    ],
  }),
  component: LoteDetalhe,
});

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

const NATUREZA_LABEL: Record<string, string> = {
  urbano: "Urbano",
  rural: "Rural",
  nao_identificado: "Não identificado",
};

function LoteDetalhe() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const obter = useServerFn(obterLote);
  const indexar = useServerFn(indexarMatricula);
  const atualizar = useServerFn(atualizarRegistro);
  const excluir = useServerFn(excluirRegistro);
  const fileRef = useRef<HTMLInputElement>(null);
  const [texto, setTexto] = useState("");
  const [rotulo, setRotulo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["checkindex-lote", id],
    queryFn: () => obter({ data: { id } }),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["checkindex-lote", id] });

  const enviarArquivos = useMutation({
    mutationFn: async (files: FileList) => {
      const notas: string[] = [];
      for (const file of Array.from(files)) {
        const base64 = await fileToBase64(file);
        const ext = file.name.split(".").pop() ?? "";
        const r = await indexar({
          data: { batchId: id, label: file.name, fileName: file.name, extension: ext, base64 },
        });
        if (r.note) notas.push(`${file.name}: ${r.note}`);
      }
      return notas;
    },
    onSuccess: async (notas) => {
      await invalidar();
      toast.success("Matrícula(s) indexada(s).");
      notas.forEach((n) => toast.info(n));
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const enviarTexto = useMutation({
    mutationFn: async () => {
      if (texto.trim().length < 40) throw new Error("Cole o texto completo da matrícula.");
      return indexar({ data: { batchId: id, label: rotulo.trim(), texto } });
    },
    onSuccess: async () => {
      setTexto("");
      setRotulo("");
      await invalidar();
      toast.success("Matrícula indexada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revisar = useMutation({
    mutationFn: (registroId: string) =>
      atualizar({ data: { id: registroId, campos: { review_status: "revisado" } } }),
    onSuccess: async () => {
      await invalidar();
      toast.success("Registro marcado como revisado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remover = useMutation({
    mutationFn: (registroId: string) => excluir({ data: { id: registroId } }),
    onSuccess: async () => {
      await invalidar();
      toast.success("Registro excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const registros = (data?.registros ?? []) as unknown as RegistroIndexado[];
  const baseNome = (data?.lote.title ?? "checkindex").replace(/[^\w\-]+/g, "_").toLowerCase();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        to="/indexacao"
        className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Voltar aos lotes
      </Link>

      <header className="mt-4">
        <p className="eyebrow">CheckIndex</p>
        <h1 className="font-display text-2xl text-foreground">
          {isLoading ? "Carregando…" : data?.lote.title}
        </h1>
        {data?.lote.note && (
          <p className="mt-1 text-sm text-muted-foreground">{data.lote.note}</p>
        )}
      </header>

      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg text-foreground">Enviar matrículas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            PDF, DOCX, imagem ou planilha. PDFs sem camada de texto passam por OCR (consome
            créditos).
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Input
              ref={fileRef}
              type="file"
              multiple
              className="max-w-xs"
              onChange={(e) => {
                if (e.target.files?.length) enviarArquivos.mutate(e.target.files);
              }}
            />
            <Button
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={enviarArquivos.isPending}
            >
              <FileUp className="mr-2 h-4 w-4" />
              {enviarArquivos.isPending ? "Processando…" : "Procurar…"}
            </Button>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <h2 className="font-display text-lg text-foreground">Colar texto da matrícula</h2>
          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="rotulo">Rótulo</Label>
              <Input
                id="rotulo"
                value={rotulo}
                onChange={(e) => setRotulo(e.target.value)}
                placeholder="Matrícula 12.345"
              />
            </div>
            <Textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={5}
              placeholder="Cole aqui o inteiro teor da matrícula…"
            />
            <Button onClick={() => enviarTexto.mutate()} disabled={enviarTexto.isPending}>
              {enviarTexto.isPending ? "Indexando…" : "Indexar texto"}
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg text-foreground">
            Registros indexados ({registros.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!registros.length}
              onClick={() => exportarCsv(registros, `${baseNome}.csv`)}
            >
              <Download className="mr-2 h-4 w-4" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!registros.length}
              onClick={() => void exportarXlsx(registros, `${baseNome}.xlsx`)}
            >
              <Download className="mr-2 h-4 w-4" /> XLSX
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!registros.length}
              onClick={() => exportarJson(registros, `${baseNome}.json`)}
            >
              <Download className="mr-2 h-4 w-4" /> JSON
            </Button>
          </div>
        </div>

        {!registros.length && (
          <p className="mt-6 rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhuma matrícula indexada neste lote.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {registros.map((r) => {
            const cad = (r.cadastros ?? {}) as Record<string, string | null>;
            const props = Array.isArray(r.proprietarios) ? r.proprietarios : [];
            const onus = Array.isArray(r.onus) ? r.onus : [];
            const atos = Array.isArray(r.atos) ? r.atos : [];
            return (
              <article key={r.id} className="rounded-lg border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base text-foreground">
                      {r.matricula_numero ? `Matrícula ${r.matricula_numero}` : r.label}
                    </h3>
                    <p className="text-xs text-muted-foreground">{r.label}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.review_status === "revisado" ? "default" : "secondary"}>
                      {r.review_status === "revisado" ? "Revisado" : "Pendente de revisão"}
                    </Badge>
                    {r.review_status !== "revisado" && (
                      <Button size="sm" variant="ghost" onClick={() => revisar.mutate(r.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Revisar
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remover.mutate(r.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3 lg:grid-cols-4">
                  {[
                    ["Livro", r.livro],
                    ["Folha", r.folha],
                    ["Cartório", r.cartorio],
                    ["Abertura", r.data_abertura],
                    ["Natureza", NATUREZA_LABEL[r.natureza] ?? r.natureza],
                    ["Município", r.municipio],
                    ["UF", r.uf],
                    ["Área (m²)", r.area_m2],
                    ["Cadastro municipal", cad['cadastro_municipal']],
                    ["CIB", cad['cib']],
                    ["CCIR", cad['ccir']],
                    ["CAR", cad['car']],
                  ].map(([rotulo, valor]) => (
                    <div key={String(rotulo)}>
                      <dt className="eyebrow">{rotulo}</dt>
                      <dd className="text-foreground">
                        {valor === null || valor === undefined || valor === "" ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          String(valor)
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>

                {r.endereco && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    <span className="eyebrow mr-2">Endereço</span>
                    {r.endereco}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded border border-border px-2 py-1 text-muted-foreground">
                    {props.length} proprietário(s)
                  </span>
                  <span className="rounded border border-border px-2 py-1 text-muted-foreground">
                    {atos.length} ato(s)
                  </span>
                  <span className="rounded border border-border px-2 py-1 text-muted-foreground">
                    {onus.length} ônus
                  </span>
                </div>

                {props.length > 0 && (
                  <p className="mt-3 text-sm text-foreground">
                    {props
                      .map((p) => `${p.nome ?? "—"}${p.cpf_cnpj ? ` (${p.cpf_cnpj})` : ""}`)
                      .join(" · ")}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        Os dados extraídos são um apoio à indexação e devem ser conferidos antes da importação no
        sistema do Cartório.
      </p>
    </main>
  );
}
