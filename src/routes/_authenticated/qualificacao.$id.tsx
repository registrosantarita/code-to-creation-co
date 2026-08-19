import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useMemo, useRef, useState } from "react";
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
import {
  ValidacoesQualificacao,
  lerValidacoes,
  mapaValidacoes,
  DECISAO_LABEL,
  type ItemDivergente,
} from "@/components/ValidacoesQualificacao";
import { extrairOnusMatricula } from "@/lib/matricula-index-parser";
import { TabelaOnus } from "@/components/TabelaOnus";
import checktituloLogo from "@/assets/checktitulo-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/qualificacao/$id")({
  head: () => ({
    meta: [
      { title: "CheckTítulo — Conferência de qualificação — e-Qualifica" },
      {
        name: "description",
        content:
          "Resultado do confronto de dados de qualificação das partes, cadastros do imóvel e cadeia registral.",
      },
      { property: "og:title", content: "CheckTítulo — Conferência de qualificação — e-Qualifica" },
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

type Papel = "titulo" | "matricula";

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
  const [visao, setVisao] = useState<"colunas" | "empilhado">("colunas");
  const [mostrarOposicoes, setMostrarOposicoes] = useState(false);



  const { data, isLoading } = useQuery({
    queryKey: ["qualificacao", id],
    queryFn: () => obter({ data: { id } }),
  });

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ["qualificacao", id] });

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

  const modo = (data?.conjunto.mode ?? "titulo_x_matricula") as
    | "titulo_x_matricula"
    | "titulo_x_titulo";

  const documentos = useMemo(() => data?.documentos ?? [], [data]);
  const titulos = useMemo(
    () => documentos.filter((d) => (d.doc_role ?? "titulo") === "titulo"),
    [documentos],
  );
  const matriculas = useMemo(
    () => documentos.filter((d) => d.doc_role === "matricula"),
    [documentos],
  );

  // A ordem das colunas segue os títulos e, depois, as matrículas.
  const ordenados = useMemo(
    () => (modo === "titulo_x_titulo" ? titulos : [...titulos, ...matriculas]),
    [modo, titulos, matriculas],
  );

  // Ônus e direitos reais: apenas para documentos que sejam matrícula
  // (papel "matrícula" ou texto com estrutura de matrícula).
  const onusPorDoc = useMemo(() => {
    const ehMatricula = (d: { doc_role?: string | null; raw_text?: string | null }) =>
      d.doc_role === "matricula" ||
      /matr[íi]cula\s*(?:n[.º°]*)?\s*[:\-]?\s*[\d.]{1,12}/i.test(d.raw_text ?? "");
    return ordenados
      .map((d, i) => ({ doc: d, indice: i }))
      .filter(({ doc }) => ehMatricula(doc as never))
      .map(({ doc, indice }) => ({
        id: doc.id,
        indice,
        label: doc.label,
        itens: extrairOnusMatricula(((doc as { raw_text?: string | null }).raw_text ?? "")),
      }));
  }, [ordenados]);


  const prontoParaConferir =
    modo === "titulo_x_titulo"
      ? titulos.length >= 2
      : titulos.length >= 1 && matriculas.length >= 1;

  const resultado = useMemo(() => {
    if (!prontoParaConferir || ordenados.length < 2) return null;
    return conferirQualificacao(
      ordenados.map((d, i) => ({
        rotulo: `Doc. ${docLetra(i)}`,
        dados: {
          ...qualificacaoVazia(),
          ...((d.extracted ?? {}) as unknown as Qualificacao),
        },
      })),
    );
  }, [ordenados, prontoParaConferir]);

  const blocos = useMemo(() => {
    const map = new Map<string, LinhaConferencia[]>();
    for (const l of resultado?.linhas ?? []) {
      const arr = map.get(l.bloco) ?? [];
      arr.push(l);
      map.set(l.bloco, arr);
    }
    return [...map.entries()];
  }, [resultado]);

  const validacoes = useMemo(
    () => lerValidacoes((data?.conjunto as { validations?: unknown } | undefined)?.validations),
    [data],
  );
  const porChave = useMemo(() => mapaValidacoes(validacoes), [validacoes]);

  const chaveDe = (bloco: string, campo: string, idx: number) => `${bloco}||${campo}||${idx}`;

  const itensDivergentes = useMemo<ItemDivergente[]>(() => {
    const out: ItemDivergente[] = [];
    for (const [bloco, linhas] of blocos) {
      linhas.forEach((l, idx) => {
        if (l.situacao !== "divergente" && l.situacao !== "invalido") return;
        out.push({
          chave: chaveDe(bloco, l.campo, idx),
          bloco,
          campo: l.campo,
          detalhe: l.valores.map((v, i) => `Doc. ${docLetra(i)}: ${v ?? "—"}`).join("  ·  "),
        });
      });
    }
    return out;
  }, [blocos]);

  const itensConformes = useMemo<ItemDivergente[]>(() => {
    const out: ItemDivergente[] = [];
    for (const [bloco, linhas] of blocos) {
      linhas.forEach((l, idx) => {
        if (l.situacao !== "conforme") return;
        out.push({
          chave: chaveDe(bloco, l.campo, idx),
          bloco,
          campo: l.campo,
          detalhe: l.valores.map((v, i) => `Doc. ${docLetra(i)}: ${v ?? "—"}`).join("  ·  "),
        });
      });
    }
    return out;
  }, [blocos]);

  if (isLoading) return <main className="mx-auto max-w-6xl px-6 py-10 text-sm">Carregando…</main>;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center gap-3">
        <img
          src={checktituloLogo.url}
          alt="CheckTítulo"
          className="h-10 w-auto object-contain"
        />
        <div>
          <p className="eyebrow">CheckTítulo — Conferência de dados de qualificação</p>
          <h1 className="font-display text-2xl text-foreground">{data?.conjunto.title}</h1>
        </div>
      </div>
      <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
        {modo === "titulo_x_titulo" ? "Título x Título" : "Título x Matrícula(s)"}
      </p>
      {data?.conjunto.note && (
        <p className="mt-1 text-sm text-muted-foreground">{data.conjunto.note}</p>
      )}

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <PainelEnvio
          papel="titulo"
          titulo="Títulos"
          descricao="Escritura, requerimento, instrumento particular, título judicial e afins."
          exemploRotulo="Ex.: Escritura pública de compra e venda"
          setId={id}
          adicionar={adicionar}
          onDone={invalidar}
        />
        {modo === "titulo_x_matricula" ? (
          <PainelEnvio
            papel="matricula"
            titulo="Matrículas"
            descricao="Uma ou mais matrículas do registro de imóveis, sem limite de quantidade."
            exemploRotulo="Ex.: Matrícula 12.345 — 1º RI"
            setId={id}
            adicionar={adicionar}
            onDone={invalidar}
          />
        ) : (
          <PainelEnvio
            papel="titulo"
            titulo="Títulos comparáveis"
            descricao="Demais títulos que serão confrontados com o primeiro."
            exemploRotulo="Ex.: Instrumento particular de cessão"
            setId={id}
            adicionar={adicionar}
            onDone={invalidar}
          />
        )}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <ListaDocumentos
          titulo="Títulos enviados"
          docs={titulos}
          offset={0}
          onRemover={(docId) => remover.mutate(docId)}
          onIA={(docId) => ia.mutate(docId)}
          iaPendente={ia.isPending}
        />
        {modo === "titulo_x_matricula" && (
          <ListaDocumentos
            titulo="Matrículas enviadas"
            docs={matriculas}
            offset={titulos.length}
            onRemover={(docId) => remover.mutate(docId)}
            onIA={(docId) => ia.mutate(docId)}
            iaPendente={ia.isPending}
          />
        )}
      </section>

      {onusPorDoc.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg text-foreground">
            Ônus e Direitos Reais registrados na Matrícula
          </h2>
          {onusPorDoc.map((o) => (
            <TabelaOnus
              key={o.id}
              itens={o.itens}
              titulo={`Doc. ${docLetra(o.indice)} — ${o.label}`}
            />
          ))}
        </section>
      )}


      {!prontoParaConferir && (
        <p className="mt-6 rounded-md border border-border bg-card p-5 text-sm text-muted-foreground">
          {modo === "titulo_x_titulo"
            ? "Envie ao menos dois títulos para gerar a conferência."
            : "Envie ao menos um título e uma matrícula para gerar a conferência."}
        </p>
      )}

      {resultado && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-lg text-foreground">Resultado da conferência</h2>
            <Badge variant="outline">{resultado.resumo.conformes} conformes</Badge>
            <Badge variant="outline">{resultado.resumo.divergentes} divergentes</Badge>
            <Badge variant="outline">{resultado.resumo.invalidos} inválidos</Badge>
            <Badge variant="outline">{resultado.resumo.incompletos} não comparados</Badge>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Exibição:</span>
            <Button
              size="sm"
              variant={visao === "colunas" ? "default" : "outline"}
              onClick={() => setVisao("colunas")}
            >
              Colunas lado a lado
            </Button>
            <Button
              size="sm"
              variant={visao === "empilhado" ? "default" : "outline"}
              onClick={() => setVisao("empilhado")}
            >
              Empilhado
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Resultado meramente instrumental: a qualificação jurídica permanece com o Oficial.
          </p>

          {blocos.map(([bloco, linhas]) => (
            <div key={bloco} className="mt-6 overflow-x-auto rounded-md border border-border bg-card">
              <p className="border-b border-border px-4 py-2 font-display text-sm text-foreground">
                {bloco}
              </p>
              {visao === "colunas" ? (
                <table className="w-full table-auto text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-3 py-2 font-normal">CAMPO</th>
                      {ordenados.map((d, i) => (
                        <th key={d.id} className={`px-3 py-2 font-normal ${docColor(i)}`}>
                          DOC. {docLetra(i)}
                          <span className="block text-[10px] uppercase tracking-wide">
                            {d.doc_role === "matricula" ? "Matrícula" : "Título"}
                          </span>
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
                          <SeloValidacao v={porChave.get(chaveDe(bloco, l.campo, idx))} />
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{l.observacao ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="w-full table-auto text-xs">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-3 py-2 font-normal">CAMPO</th>
                      <th className="px-3 py-2 font-normal">DOCUMENTO</th>
                      <th className="px-3 py-2 font-normal">VALOR</th>
                      <th className="px-3 py-2 font-normal">SITUAÇÃO</th>
                      <th className="px-3 py-2 font-normal">OBSERVAÇÃO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linhas.map((l, idx) => (
                      <Fragment key={`${l.campo}-${idx}`}>
                        {l.valores.map((v, i) => (
                          <tr
                            key={`${l.campo}-${idx}-${i}`}
                            className={`align-top ${i === l.valores.length - 1 ? "border-b border-border/60" : ""}`}
                          >
                            {i === 0 ? (
                              <td
                                rowSpan={l.valores.length}
                                className="px-3 py-2 text-foreground"
                              >
                                {l.campo}
                              </td>
                            ) : null}
                            <td className={`whitespace-nowrap px-3 py-2 ${docColor(i)}`}>
                              DOC. {docLetra(i)}
                              <span className="ml-1 text-[10px] uppercase tracking-wide">
                                {ordenados[i]?.doc_role === "matricula" ? "Matrícula" : "Título"}
                              </span>
                            </td>
                            <td className={`px-3 py-2 ${docColor(i)}`}>{v ?? "—"}</td>
                            {i === 0 ? (
                              <>
                                <td rowSpan={l.valores.length} className="px-3 py-2">
                                  <span
                                    className={`inline-block rounded border px-2 py-0.5 ${TONE_CLASS[SITUACAO[l.situacao].tone]}`}
                                  >
                                    {SITUACAO[l.situacao].label}
                                  </span>
                                  <SeloValidacao v={porChave.get(chaveDe(bloco, l.campo, idx))} />
                                </td>
                                <td
                                  rowSpan={l.valores.length}
                                  className="px-3 py-2 text-muted-foreground"
                                >
                                  {l.observacao ?? "—"}
                                </td>
                              </>
                            ) : null}
                          </tr>
                        ))}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}

          <ValidacoesQualificacao
            setId={id}
            itens={itensDivergentes}
            validacoes={validacoes}
            onSalvo={() => void invalidar()}
          />

          {itensConformes.length > 0 && (
            <div className="mt-8 print:hidden">
              {mostrarOposicoes ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setMostrarOposicoes(false)}>
                    Fechar oposições
                  </Button>
                  <ValidacoesQualificacao
                    setId={id}
                    itens={itensConformes}
                    validacoes={validacoes}
                    modo="oposicao"
                    onSalvo={() => void invalidar()}
                  />
                </>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-muted-foreground">
                    Itens conformes não exigem justificativa. Para contraditá-los
                    excepcionalmente, abra as oposições.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-auto"
                    onClick={() => setMostrarOposicoes(true)}
                  >
                    Oposições ({itensConformes.length})
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      )}

    </main>
  );
}

function SeloValidacao({
  v,
}: {
  v:
    | { numero: number; decisao: "relevado" | "confirmado" | "oposicao"; justificativa: string }
    | undefined;
}) {
  if (!v) return null;
  return (
    <span className="mt-1 block text-[10px] leading-tight text-muted-foreground">
      Validação nº {v.numero} — {DECISAO_LABEL[v.decisao]}
    </span>
  );
}

type DocLinha = {
  id: string;
  label: string;
  doc_role: string;
  extraction_source: string;
  extracted: unknown;
};

function ListaDocumentos({
  titulo,
  docs,
  offset,
  onRemover,
  onIA,
  iaPendente,
}: {
  titulo: string;
  docs: DocLinha[];
  offset: number;
  onRemover: (id: string) => void;
  onIA: (id: string) => void;
  iaPendente: boolean;
}) {
  return (
    <div>
      <h2 className="font-display text-sm text-foreground">{titulo}</h2>
      <div className="mt-3 space-y-2">
        {!docs.length && (
          <p className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
            Nenhum documento enviado aqui ainda.
          </p>
        )}
        {docs.map((d, i) => {
          const dados = {
            ...qualificacaoVazia(),
            ...((d.extracted ?? {}) as unknown as Qualificacao),
          };
          const faltas = camposFaltantes(dados);
          const indice = offset + i;
          return (
            <div
              key={d.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-4"
            >
              <div>
                <p className={`font-display text-sm ${docColor(indice)}`}>
                  Doc. {docLetra(indice)} — {d.label}
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
                  onClick={() => onIA(d.id)}
                  disabled={iaPendente || faltas.length === 0}
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
                  onClick={() => onRemover(d.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PainelEnvio({
  papel,
  titulo,
  descricao,
  exemploRotulo,
  setId,
  adicionar,
  onDone,
}: {
  papel: Papel;
  titulo: string;
  descricao: string;
  exemploRotulo: string;
  setId: string;
  adicionar: ReturnType<typeof useServerFn<typeof adicionarDocumento>>;
  onDone: () => Promise<unknown>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rotulo, setRotulo] = useState("");
  const [texto, setTexto] = useState("");

  const upload = useMutation({
    mutationFn: async (files: FileList) => {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "";
        await adicionar({
          data: {
            setId,
            docRole: papel,
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
      await onDone();
      toast.success("Documento processado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const colar = useMutation({
    mutationFn: async () => {
      if (texto.trim().length < 20) throw new Error("Cole o texto do documento.");
      return adicionar({
        data: {
          setId,
          docRole: papel,
          label: rotulo || (papel === "matricula" ? "Matrícula (texto)" : "Título (texto)"),
          texto,
        },
      });
    },
    onSuccess: async () => {
      setTexto("");
      setRotulo("");
      await onDone();
      toast.success("Texto processado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <h2 className="font-display text-sm text-foreground">{titulo}</h2>
      <p className="mt-1 text-xs text-muted-foreground">{descricao}</p>

      <div className="mt-4 space-y-3">
        <div className="space-y-2">
          <Label htmlFor={`rotulo-${papel}-${titulo}`}>Rótulo (opcional)</Label>
          <Input
            id={`rotulo-${papel}-${titulo}`}
            value={rotulo}
            onChange={(e) => setRotulo(e.target.value)}
            placeholder={exemploRotulo}
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

        <div className="space-y-2 pt-2">
          <Label htmlFor={`texto-${papel}-${titulo}`}>Ou cole o texto</Label>
          <Textarea
            id={`texto-${papel}-${titulo}`}
            rows={5}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Cole aqui a qualificação das partes, os cadastros do imóvel e a cadeia registral."
          />
          <Button variant="secondary" onClick={() => colar.mutate()} disabled={colar.isPending}>
            {colar.isPending ? "Processando…" : "Processar texto"}
          </Button>
        </div>
      </div>
    </div>
  );
}
