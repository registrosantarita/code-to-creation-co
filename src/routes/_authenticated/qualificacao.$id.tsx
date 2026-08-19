import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Trash2, Upload } from "lucide-react";
import {
  adicionarDocumento,
  classificarDocumento,
  complementarComIA,
  criarComparacao,
  excluirDocumento,
  listarComparacoes,
  obterComparacao,
  obterConjunto,
} from "@/lib/qualificacao.functions";
import { souAdmin } from "@/lib/admin.functions";
import { CRITERIOS, type LinhaConferencia } from "@/lib/qualificacao-compare";
import { camposFaltantes, qualificacaoVazia, type Qualificacao } from "@/lib/qualificacao-parser";
import { CLASSIFICACAO, docColor, docLetra, TONE_CLASS } from "@/lib/labels";
import {
  ValidacoesQualificacao,
  lerValidacoes,
  mapaValidacoes,
  DECISAO_LABEL,
  type ItemDivergente,
} from "@/components/ValidacoesQualificacao";
import {
  RelatoriosQualificacao,
  type ComparacaoResumoQualificacao,
} from "@/components/RelatoriosQualificacao";
import {
  exportarQualificacaoPdf,
  exportarQualificacaoXlsx,
  type DocRelatorio,
} from "@/lib/export-qualificacao";
import { ESPECIES, ESPECIE_LABEL, type EspecieDocumento } from "@/lib/qualificacao-especie";
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

type ResultadoComparacao = {
  linhas: LinhaConferencia[];
  resumo: { conformes: number; divergentes: number; invalidos: number; incompletos: number };
  classificacao: string;
  documentos: DocRelatorio[];
};

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

const chaveDe = (bloco: string, campo: string, idx: number) => `${bloco}||${campo}||${idx}`;

function QualificacaoDetalhe() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const obter = useServerFn(obterConjunto);
  const adicionar = useServerFn(adicionarDocumento);
  const excluir = useServerFn(excluirDocumento);
  const complementar = useServerFn(complementarComIA);
  const classificar = useServerFn(classificarDocumento);
  const criarComp = useServerFn(criarComparacao);
  const listarComps = useServerFn(listarComparacoes);
  const obterComp = useServerFn(obterComparacao);
  const admin = useServerFn(souAdmin);

  const [visao, setVisao] = useState<"colunas" | "empilhado">("colunas");
  const [mostrarOposicoes, setMostrarOposicoes] = useState(false);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["qualificacao", id],
    queryFn: () => obter({ data: { id } }),
  });

  const { data: comparacoes } = useQuery({
    queryKey: ["qualificacao-comparacoes", id],
    queryFn: () => listarComps({ data: { setId: id } }),
  });

  const { data: ehAdmin } = useQuery({ queryKey: ["sou-admin"], queryFn: () => admin({}) });

  useEffect(() => {
    if (!comparacoes?.length) {
      setSelecionada(null);
      return;
    }
    setSelecionada((s) => (s && comparacoes.some((c) => c.id === s) ? s : comparacoes[0]!.id));
  }, [comparacoes]);

  const { data: comparacao } = useQuery({
    queryKey: ["qualificacao-comparacao", selecionada],
    queryFn: () => obterComp({ data: { id: selecionada! } }),
    enabled: Boolean(selecionada),
  });

  const invalidar = async () => {
    await queryClient.invalidateQueries({ queryKey: ["qualificacao", id] });
    await queryClient.invalidateQueries({ queryKey: ["qualificacao-comparacoes", id] });
    await queryClient.invalidateQueries({ queryKey: ["qualificacao-comparacao"] });
  };

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

  const classificacaoDoc = useMutation({
    mutationFn: (v: { id: string; especie?: string; docRole?: Papel }) => classificar({ data: v }),
    onSuccess: async () => {
      await invalidar();
      toast.success("Classificação atualizada.");
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

  const resultado = (comparacao?.result ?? null) as ResultadoComparacao | null;
  const docsComparados = resultado?.documentos ?? [];

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
    () => lerValidacoes((comparacao as { validations?: unknown } | undefined)?.validations),
    [comparacao],
  );
  const porChave = useMemo(() => mapaValidacoes(validacoes), [validacoes]);

  const itensPor = (alvo: (l: LinhaConferencia) => boolean): ItemDivergente[] => {
    const out: ItemDivergente[] = [];
    for (const [bloco, linhas] of blocos) {
      linhas.forEach((l, idx) => {
        if (!alvo(l)) return;
        out.push({
          chave: chaveDe(bloco, l.campo, idx),
          bloco,
          campo: l.campo,
          detalhe: l.valores.map((v, i) => `Doc. ${docLetra(i)}: ${v ?? "—"}`).join("  ·  "),
        });
      });
    }
    return out;
  };

  const itensDivergentes = useMemo(
    () => itensPor((l) => l.situacao === "divergente" || l.situacao === "invalido"),
    [blocos],
  );
  const itensConformes = useMemo(() => itensPor((l) => l.situacao === "conforme"), [blocos]);

  // Ônus e direitos reais: somente para documentos que sejam matrícula.
  const onusPorDoc = useMemo(() => {
    const base = docsComparados.length ? docsComparados : documentos;
    return base
      .map((d, i) => {
        const bruto = documentos.find((x) => x.id === d.id) as
          | { raw_text?: string | null }
          | undefined;
        const texto = bruto?.raw_text ?? "";
        const ehMatricula =
          d.doc_role === "matricula" ||
          /matr[íi]cula\s*(?:n[.º°]*)?\s*[:\-]?\s*[\d.]{1,12}/i.test(texto);
        return ehMatricula
          ? { id: d.id, indice: i, label: d.label, itens: extrairOnusMatricula(texto) }
          : null;
      })
      .filter((o): o is NonNullable<typeof o> => Boolean(o));
  }, [docsComparados, documentos]);

  async function relatorioInput(compId: string) {
    const comp =
      compId === selecionada && comparacao
        ? comparacao
        : await obterComp({ data: { id: compId } });
    const res = comp.result as unknown as ResultadoComparacao;
    const vals = lerValidacoes((comp as { validations?: unknown }).validations);
    const rotulos = (comp.criteria as string[]).map(
      (c) => CRITERIOS.find((x) => x.id === c)?.rotulo ?? c,
    );
    const onus = res.documentos
      .map((d) => {
        const bruto = documentos.find((x) => x.id === d.id) as
          | { raw_text?: string | null }
          | undefined;
        const itens = extrairOnusMatricula(bruto?.raw_text ?? "");
        return itens.length
          ? {
              documento: d.label,
              itens: itens.map((i) => ({
                ato: [i.tipo, i.numero].filter(Boolean).join(" ") || undefined,
                especie: i.gravame ?? undefined,
                data: i.data ?? undefined,
                situacao: i.vigente === false ? "Cancelado" : "Vigente",
                teor: i.descricao,
              })),
            }
          : null;
      })
      .filter((o): o is NonNullable<typeof o> => Boolean(o));

    return {
      conjunto: data?.conjunto.title ?? "Conferência",
      comparacao: comp.title,
      modo: modo === "titulo_x_titulo" ? "Título x Título" : "Título x Matrícula(s)",
      emitidoEm: new Date().toLocaleString("pt-BR"),
      classificacao: comp.classification ?? "inconclusive",
      resumo: comp.summary ?? "",
      criterios: rotulos,
      documentos: res.documentos,
      linhas: res.linhas,
      validacoes: vals,
      chaveDe: (l: LinhaConferencia, i: number) => chaveDe(l.bloco, l.campo, i),
      onus,
    };
  }

  const nomeBase = (t: string) => t.replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 60).toLowerCase();

  if (isLoading) return <main className="mx-auto max-w-6xl px-6 py-10 text-sm">Carregando…</main>;

  const painelRelatorios = (
    <RelatoriosQualificacao
      comparacoes={(comparacoes ?? []) as unknown as ComparacaoResumoQualificacao[]}
      admin={Boolean(ehAdmin)}
      gerarPdf={async (cid) => {
        const input = await relatorioInput(cid);
        exportarQualificacaoPdf(input, `checktitulo-${nomeBase(input.comparacao)}.pdf`);
      }}
      gerarXlsx={async (cid) => {
        const input = await relatorioInput(cid);
        exportarQualificacaoXlsx(input, `checktitulo-${nomeBase(input.comparacao)}.xlsx`);
      }}
      onExcluido={() => void invalidar()}
    />
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center gap-3">
        <img src={checktituloLogo.url} alt="CheckTítulo" className="h-10 w-auto object-contain" />
        <div>
          <p className="eyebrow">CheckTítulo — Conferência de dados de qualificação</p>
          <h1 className="font-display text-2xl text-foreground">{data?.conjunto.title}</h1>
        </div>
        <div className="ml-auto">{painelRelatorios}</div>
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
          docs={titulos as unknown as DocLinha[]}
          offset={0}
          onRemover={(docId) => remover.mutate(docId)}
          onIA={(docId) => ia.mutate(docId)}
          iaPendente={ia.isPending}
          onClassificar={(v) => classificacaoDoc.mutate(v)}
        />
        {modo === "titulo_x_matricula" && (
          <ListaDocumentos
            titulo="Matrículas enviadas"
            docs={matriculas as unknown as DocLinha[]}
            offset={titulos.length}
            onRemover={(docId) => remover.mutate(docId)}
            onIA={(docId) => ia.mutate(docId)}
            iaPendente={ia.isPending}
            onClassificar={(v) => classificacaoDoc.mutate(v)}
          />
        )}
      </section>

      <NovaComparacao
        documentos={documentos as unknown as DocLinha[]}
        criar={async (payload) => {
          const r = await criarComp({ data: { setId: id, ...payload } });
          await invalidar();
          setSelecionada(r.id);
          toast.success("Comparação registrada.");
        }}
      />

      {(comparacoes?.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-lg text-foreground">Comparações da conferência</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {comparacoes!.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={selecionada === c.id ? "default" : "outline"}
                onClick={() => setSelecionada(c.id)}
              >
                {c.title}
              </Button>
            ))}
          </div>
        </section>
      )}

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

      {!comparacoes?.length && (
        <p className="mt-6 rounded-md border border-border bg-card p-5 text-sm text-muted-foreground">
          Nenhuma comparação registrada. Envie os documentos, classifique-os e crie a primeira
          comparação escolhendo o paradigma e os critérios.
        </p>
      )}

      {resultado && comparacao && (
        <section className="mt-10">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-lg text-foreground">{comparacao.title}</h2>
            <span
              className={`rounded-sm border px-2 py-0.5 text-[11px] ${
                TONE_CLASS[(CLASSIFICACAO[comparacao.classification ?? "inconclusive"] ?? CLASSIFICACAO["inconclusive"]!).tone]
              }`}
            >
              {(CLASSIFICACAO[comparacao.classification ?? "inconclusive"] ?? CLASSIFICACAO["inconclusive"]!).label}
            </span>
            <Badge variant="outline">{resultado.resumo.conformes} conformes</Badge>
            <Badge variant="outline">{resultado.resumo.divergentes} divergentes</Badge>
            <Badge variant="outline">{resultado.resumo.invalidos} inválidos</Badge>
            <Badge variant="outline">{resultado.resumo.incompletos} não comparados</Badge>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Critérios:{" "}
            {(comparacao.criteria as string[])
              .map((c) => CRITERIOS.find((x) => x.id === c)?.rotulo ?? c)
              .join(" · ")}
          </p>
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
                      {docsComparados.map((d, i) => (
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
                              <td rowSpan={l.valores.length} className="px-3 py-2 text-foreground">
                                {l.campo}
                              </td>
                            ) : null}
                            <td className={`whitespace-nowrap px-3 py-2 ${docColor(i)}`}>
                              DOC. {docLetra(i)}
                              <span className="ml-1 text-[10px] uppercase tracking-wide">
                                {docsComparados[i]?.doc_role === "matricula"
                                  ? "Matrícula"
                                  : "Título"}
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
            comparacaoId={comparacao.id}
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
                    comparacaoId={comparacao.id}
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

          <div className="mt-10 flex justify-end print:hidden">{painelRelatorios}</div>
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
  doc_species?: string | null;
  extraction_source: string;
  extracted: unknown;
};

/** Criação de comparações: paradigma, comparáveis e critérios. */
function NovaComparacao({
  documentos,
  criar,
}: {
  documentos: DocLinha[];
  criar: (payload: {
    title: string;
    paradigmDocId: string;
    comparedDocIds: string[];
    criterios: string[];
  }) => Promise<void>;
}) {
  const [titulo, setTitulo] = useState("");
  const [paradigma, setParadigma] = useState<string>("");
  const [comparaveis, setComparaveis] = useState<string[]>([]);
  const [criterios, setCriterios] = useState<string[]>(CRITERIOS.map((c) => c.id));
  const [salvando, setSalvando] = useState(false);

  const alternar = (lista: string[], v: string) =>
    lista.includes(v) ? lista.filter((x) => x !== v) : [...lista, v];

  async function enviar() {
    if (!paradigma) return toast.error("Escolha o documento paradigma.");
    const alvos = comparaveis.filter((c) => c !== paradigma);
    if (!alvos.length) return toast.error("Escolha ao menos um documento comparável.");
    if (!criterios.length) return toast.error("Escolha ao menos um critério.");
    setSalvando(true);
    try {
      await criar({ title: titulo, paradigmDocId: paradigma, comparedDocIds: alvos, criterios });
      setTitulo("");
      setComparaveis([]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao criar a comparação.");
    } finally {
      setSalvando(false);
    }
  }

  if (documentos.length < 2) return null;

  return (
    <section className="mt-10 rounded-md border border-border bg-card p-5">
      <h2 className="font-display text-lg text-foreground">Nova comparação</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Escolha o documento paradigma, os documentos comparáveis e os critérios do confronto. Cada
        comparação fica registrada nesta conferência.
      </p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="titulo-comparacao">Título (opcional)</Label>
          <Input
            id="titulo-comparacao"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ex.: Escritura x Matrícula 12.345"
          />
        </div>
        <div className="space-y-2">
          <Label>Documento paradigma</Label>
          <Select value={paradigma} onValueChange={setParadigma}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o paradigma" />
            </SelectTrigger>
            <SelectContent>
              {documentos.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4">
        <Label>Documentos comparáveis</Label>
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {documentos
            .filter((d) => d.id !== paradigma)
            .map((d) => (
              <label key={d.id} className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox
                  checked={comparaveis.includes(d.id)}
                  onCheckedChange={() => setComparaveis((s) => alternar(s, d.id))}
                />
                {d.label}
                <span className="text-xs text-muted-foreground">
                  ({d.doc_role === "matricula" ? "Matrícula" : "Título"})
                </span>
              </label>
            ))}
        </div>
      </div>

      <div className="mt-4">
        <Label>Critérios do confronto</Label>
        <div className="mt-2 grid gap-2 md:grid-cols-3">
          {CRITERIOS.map((c) => (
            <label key={c.id} className="flex items-center gap-2 text-sm text-foreground">
              <Checkbox
                checked={criterios.includes(c.id)}
                onCheckedChange={() => setCriterios((s) => alternar(s, c.id))}
              />
              {c.rotulo}
            </label>
          ))}
        </div>
      </div>

      <Button className="mt-5" onClick={() => void enviar()} disabled={salvando}>
        {salvando ? "Conferindo…" : "Criar comparação"}
      </Button>
    </section>
  );
}

function ListaDocumentos({
  titulo,
  docs,
  offset,
  onRemover,
  onIA,
  iaPendente,
  onClassificar,
}: {
  titulo: string;
  docs: DocLinha[];
  offset: number;
  onRemover: (id: string) => void;
  onIA: (id: string) => void;
  iaPendente: boolean;
  onClassificar: (v: { id: string; especie?: string; docRole?: Papel }) => void;
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
            <div key={d.id} className="rounded-md border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className={`font-display text-sm ${docColor(indice)}`}>
                    Doc. {docLetra(indice)} — {d.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dados.pessoas.length} parte(s) identificada(s) · extração:{" "}
                    {d.extraction_source}
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

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Espécie do documento</Label>
                  <Select
                    value={(d.doc_species ?? "nao_classificado") as EspecieDocumento}
                    onValueChange={(v) => onClassificar({ id: d.id, especie: v })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESPECIES.map((e) => (
                        <SelectItem key={e} value={e}>
                          {ESPECIE_LABEL[e]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Papel na conferência</Label>
                  <Select
                    value={(d.doc_role ?? "titulo") as Papel}
                    onValueChange={(v) => onClassificar({ id: d.id, docRole: v as Papel })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="titulo">Título</SelectItem>
                      <SelectItem value="matricula">Matrícula</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
