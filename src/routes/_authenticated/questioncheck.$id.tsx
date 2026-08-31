import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Ban, Check, FileText, ListTree, OctagonAlert, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { obterConferencia, salvarConferencia } from "@/lib/question-check.functions";
import { chaveSubsecao, type No, type Respostas } from "@/lib/question-check-types";
import {
  ESPECIALIDADES,
  ESPECIALIDADE_PADRAO,
  especialidadePorId,
  secoesAplicaveisNaEspecialidade,
  tiposDaEspecialidade,
} from "@/lib/question-check-especialidades";
import {
  acumular,
  efeitoAtivo,
  gruposDaSecao,
  secaoAtiva,
  esbocoListaAlertas,
  esbocoNotaExigencia,
  nosVisiveis,
  numerosDaSecao,
  progresso,
  respondido,
  secaoPorId,
} from "@/lib/question-check-engine";
import {
  exportarQuestionCheckPdf,
  type BlocoQuestionCheck,
} from "@/lib/export-questioncheck";

export const Route = createFileRoute("/_authenticated/questioncheck/$id")({
  head: () => ({
    meta: [
      { title: "QuestionCheck — Conferência do título — e-Qualifica" },
      {
        name: "description",
        content:
          "Responda o checklist em sequência e acompanhe os alertas e as exigências acumulados para a nota de exigência.",
      },
      { property: "og:title", content: "QuestionCheck — Conferência do título" },
      {
        property: "og:description",
        content: "Checklist condicional com nota de exigência e lista de alertas editáveis.",
      },
    ],
  }),
  component: QuestionCheckDetalhe,
});



/**
 * Marcador de "nenhuma subseção marcada". A seleção vazia significa, no motor,
 * "todas ativas" (sessões antigas); por isso a tela nunca deixa o array vazio.
 */
const NENHUMA = "__nenhuma__";
const normalizar = (chaves: string[]) => (chaves.length ? chaves : [NENHUMA]);


/** Âncora estável para cada subseção (seção + título do grupo). */
function ancora(secaoId: string, grupo: string) {
  const slug = grupo
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `sub-${secaoId}-${slug}`;
}

function irPara(anc: string) {
  document.getElementById(anc)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Resposta em texto legível para o relatório em PDF. */
function textoResposta(no: No, valor: unknown): string {
  if (no.tipo === "sim_nao") {
    if (valor === "sim" || valor === true) return "SIM";
    if (valor === "nao" || valor === false) return "NÃO";
    return "NÃO SE APLICA";
  }
  if (no.tipo === "opcoes") {
    const o = (no.opcoes ?? []).find((x) => x.id === valor);
    return o ? `(x) ${o.id}) ${o.rotulo}` : "NÃO SE APLICA";
  }
  if (no.tipo === "multipla") {
    const sel = Array.isArray(valor) ? (valor as string[]) : [];
    const marcadas = (no.opcoes ?? []).filter((o) => sel.includes(o.id));
    if (!marcadas.length) return "Nenhum item marcado";
    return marcadas.map((o) => `[v] ${o.id}) ${o.rotulo}`).join("\n");
  }
  if (valor === null || valor === undefined || String(valor).trim() === "") return "NÃO SE APLICA";
  return String(valor);
}



function QuestionCheckDetalhe() {
  const { id } = Route.useParams();
  const { user } = Route.useRouteContext();
  const nomePerfil =
    (user?.user_metadata?.['full_name'] as string | undefined) ?? user?.email ?? "—";
  const queryClient = useQueryClient();
  const obter = useServerFn(obterConferencia);
  const salvar = useServerFn(salvarConferencia);

  const { data, isLoading } = useQuery({
    queryKey: ["questioncheck", id],
    queryFn: () => obter({ data: { id } }),
  });

  const [respostas, setRespostas] = useState<Respostas>({});
  const [tipo, setTipo] = useState("");
  const [especialidade, setEspecialidade] = useState(ESPECIALIDADE_PADRAO);
  const [extras, setExtras] = useState<string[]>([]);
  const [subsecoes, setSubsecoes] = useState<string[]>([]);
  const [nota, setNota] = useState("");
  const [lista, setLista] = useState("");
  const [notaTocada, setNotaTocada] = useState(false);

  const vistas = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!data) return;
    setRespostas((data.respostas ?? {}) as Respostas);
    setTipo(data.tipo_titulo ?? "");
    const esp = data.especialidade ?? ESPECIALIDADE_PADRAO;
    setEspecialidade(esp);
    const base =
      tiposDaEspecialidade(esp).find((t) => t.id === data.tipo_titulo)?.secoes ?? [];
    setExtras((data.secoes ?? []).filter((s) => !["A", "Q", "R", ...base].includes(s)));
    const salvas = (data.subsecoes ?? []) as string[];
    setSubsecoes(salvas);
    // Sessões já salvas conservam a seleção do conferente; novas começam com
    // todas as subseções marcadas (ver efeito abaixo).
    vistas.current = salvas.length
      ? new Set(
          (data.secoes ?? []).flatMap((sid) => {
            const s = secaoPorId(sid, data.especialidade);
            return s ? gruposDaSecao(s).map((g) => chaveSubsecao(sid, g)) : [];
          }),
        )
      : new Set();
    setNota(data.nota_exigencia ?? "");
    setLista(data.lista_alertas ?? "");
    setNotaTocada(Boolean(data.nota_exigencia));
  }, [data]);


  const secoesIds = useMemo(
    () => secoesAplicaveisNaEspecialidade(especialidade, tipo, extras),
    [especialidade, tipo, extras],
  );
  const secoesVariaveis = useMemo(
    () => especialidadePorId(especialidade).secoes.filter((s) => !["A", "Q", "R"].includes(s.id)),
    [especialidade],
  );
  const tiposDisponiveis = useMemo(() => tiposDaEspecialidade(especialidade), [especialidade]);
  const { alertas, exigencias } = useMemo(
    () => acumular(secoesIds, respostas, subsecoes, especialidade),
    [secoesIds, respostas, subsecoes, especialidade],
  );
  const nosComAlerta = useMemo(() => new Set(alertas.map((a) => a.no)), [alertas]);
  const nosComExigencia = useMemo(() => new Set(exigencias.map((e) => e.no)), [exigencias]);

  const prog = useMemo(
    () => progresso(secoesIds, respostas, subsecoes, especialidade),
    [secoesIds, respostas, subsecoes, especialidade],
  );

  /** Subseções disponíveis em cada seção aplicável. */
  const subsecoesDisponiveis = useMemo(
    () =>
      secoesIds.flatMap((sid) => {
        const secao = secaoPorId(sid, especialidade);
        if (!secao) return [];
        const grupos = gruposDaSecao(secao);
        if (!grupos.length) return [];
        return [{ id: secao.id, titulo: secao.titulo, grupos }];
      }),
    [secoesIds, especialidade],
  );

  const todasChaves = useMemo(
    () => subsecoesDisponiveis.flatMap((s) => s.grupos.map((g) => chaveSubsecao(s.id, g))),
    [subsecoesDisponiveis],
  );

  /** Subseções recém-disponíveis entram já marcadas. */
  useEffect(() => {
    const novas = todasChaves.filter((k) => !vistas.current.has(k));
    if (!novas.length) return;
    for (const k of novas) vistas.current.add(k);
    setSubsecoes((prev) => [...new Set([...prev, ...novas])]);
  }, [todasChaves]);


  function alternarSub(chave: string, ligado: boolean) {
    setSubsecoes((prev) =>
      ligado
        ? [...new Set([...prev.filter((x) => x !== NENHUMA), chave])]
        : normalizar(prev.filter((x) => x !== chave)),
    );
  }

  /** Marca/desmarca todas as subseções de uma seção. */
  function alternarSecaoToda(secaoId: string, grupos: string[], ligado: boolean) {
    const chaves = grupos.map((g) => chaveSubsecao(secaoId, g));
    setSubsecoes((prev) =>
      ligado
        ? [...new Set([...prev.filter((x) => x !== NENHUMA), ...chaves])]
        : normalizar(prev.filter((x) => !chaves.includes(x))),
    );
  }


  const sumario = useMemo(
    () =>
      secoesIds.flatMap((sid) => {
        const secao = secaoAtiva(sid, subsecoes, especialidade);
        if (!secao) return [];
        const grupos: string[] = [];
        for (const no of nosVisiveis(secao, respostas)) {
          if (no.grupo && !grupos.includes(no.grupo)) grupos.push(no.grupo);
        }
        return [{ id: secao.id, titulo: secao.titulo, grupos }];
      }),
    [secoesIds, respostas, subsecoes, especialidade],
  );

  /** Monta os blocos do relatório (somente perguntas respondidas). */
  function blocosRelatorio(): BlocoQuestionCheck[] {
    const out: BlocoQuestionCheck[] = [];
    for (const sid of secoesIds) {
      const secao = secaoAtiva(sid, subsecoes, especialidade);
      if (!secao) continue;
      const numeros = numerosDaSecao(secaoPorId(sid, especialidade) ?? secao);
      for (const no of nosVisiveis(secao, respostas)) {
        if (no.tipo === "info") continue;
        const r = respostas[no.id];
        if (!respondido(no, r)) continue;
        // Seções COAF: perguntas respondidas com "NÃO" ficam fora do relatório.
        if (secao.coaf && no.tipo === "sim_nao" && (r === "nao" || r === false)) continue;
        const sub = no.grupo ?? "";
        let bloco = out.find((b) => b.secao === secao.id && b.subsecao === sub);
        if (!bloco) {
          bloco = { secao: secao.id, titulo: secao.titulo, subsecao: sub, linhas: [] };
          out.push(bloco);
        }
        bloco.linhas.push({
          numero: numeros[no.id] ?? no.id,
          pergunta: no.texto,
          resposta: textoResposta(no, r),
        });
      }
    }
    return out;
  }

  function gerarPdf() {
    const blocos = blocosRelatorio();
    if (!blocos.length) {
      toast.error("Responda ao menos uma pergunta para gerar o relatório.");
      return;
    }
    exportarQuestionCheckPdf(
      {
        titulo: data?.title ?? "",
        protocolo: data?.protocolo ?? "",
        tipoTitulo: tiposDaEspecialidade(especialidade).find((t) => t.id === tipo)?.rotulo ?? "",
        especialidade: especialidadePorId(especialidade).rotulo,
        secoes: secoesIds,
        observacao: data?.note ?? "",
        emitidoEm: new Date().toLocaleString("pt-BR"),
        progresso: prog,
        blocos,
        exigencias: exigencias.map((e) => ({
          texto: e.texto,
          detalhe: e.detalhe,
          secao: e.secao,
        })),
        alertas: alertas.map((a) => ({ texto: a.texto, detalhe: a.detalhe, secao: a.secao })),
        perfil: nomePerfil,
      },
      `questioncheck-${(data?.protocolo || data?.title || "conferencia")
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .toLowerCase()}.pdf`,
    );
    toast.success("Relatório gerado.");
  }


  const cabecalho = { titulo: data?.title ?? "", protocolo: data?.protocolo ?? "" };
  const notaSugerida = esbocoNotaExigencia(exigencias, cabecalho);
  const listaSugerida = esbocoListaAlertas(alertas);

  const persistir = useMutation({
    mutationFn: (status?: "em_andamento" | "concluida") =>
      salvar({
        data: {
          id,
          tipoTitulo: tipo,
          especialidade,
          secoes: secoesIds,
          subsecoes,
          respostas: respostas as Record<string, unknown>,
          alertas: alertas as unknown as Record<string, unknown>[],
          exigencias: exigencias as unknown as Record<string, unknown>[],
          notaExigencia: notaTocada && nota ? nota : notaSugerida,
          listaAlertas: lista || listaSugerida,
          ...(status ? { status } : {}),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["questioncheck", id] });
      toast.success("Conferência salva.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function responder(no: No, valor: Respostas[string]) {
    setRespostas((prev) => {
      const next = { ...prev, [no.id]: valor };
      // limpa respostas de perguntas encadeadas que deixaram de ser exibidas
      const ativos = new Set<string>();
      const marcar = (nos: No[]) => {
        for (const n of nos) {
          ativos.add(n.id);
          const r = next[n.id];
          if (!respondido(n, r)) continue;
          for (const ef of n.efeitos ?? []) {
            if (ef.filhos?.length && efeitoAtivo(n, ef, r)) marcar(ef.filhos);
          }
        }
      };
      for (const sid of secoesIds) {
        const s = secaoAtiva(sid, subsecoes, especialidade);
        if (s) marcar(s.itens);
      }
      const limpo: Respostas = {};
      for (const [k, v] of Object.entries(next)) if (ativos.has(k)) limpo[k] = v;
      return limpo;
    });
  }

  if (isLoading) return <main className="mx-auto max-w-6xl px-6 py-10 text-sm text-muted-foreground">Carregando…</main>;
  if (!data) return <main className="mx-auto max-w-6xl px-6 py-10 text-sm">Conferência não encontrada.</main>;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">QuestionCheck</p>
          <h1 className="font-display text-2xl text-foreground">{data.title}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {data.protocolo ? `Prenotação ${data.protocolo} · ` : ""}
            Seções {secoesIds.join(", ")} · {prog.feitos} de {prog.total} perguntas respondidas (
            {prog.pct}%)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/questioncheck"
            className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Voltar às conferências
          </Link>
          <Button variant="outline" size="sm" onClick={gerarPdf}>
            <FileText className="mr-2 h-4 w-4" /> Relatório PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => persistir.mutate(undefined)} disabled={persistir.isPending}>
            <Save className="mr-2 h-4 w-4" /> Salvar
          </Button>
          <Button
            size="sm"
            onClick={() => persistir.mutate(data.status === "concluida" ? "em_andamento" : "concluida")}
            disabled={persistir.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            {data.status === "concluida" ? "Reabrir" : "Concluir"}
          </Button>
        </div>
      </div>

      <section className="mt-8 grid gap-4 rounded-lg border border-border bg-card p-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Especialidade</Label>
          <Select
            value={especialidade}
            onValueChange={(v) => {
              setEspecialidade(v);
              setTipo(tiposDaEspecialidade(v)[0]?.id ?? "");
              setExtras([]);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {ESPECIALIDADES.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Natureza do título</Label>
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {tiposDisponiveis.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.rotulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Seções adicionais</Label>
          <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border border-border p-3 sm:grid-cols-2">
            {secoesVariaveis.map((s) => {
              const base = tiposDisponiveis.find((t) => t.id === tipo)?.secoes ?? [];
              const fixa = base.includes(s.id);
              return (
                <label key={s.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Checkbox
                    checked={fixa || extras.includes(s.id)}
                    disabled={fixa}
                    onCheckedChange={(v) =>
                      setExtras((prev) =>
                        v === true ? [...new Set([...prev, s.id])] : prev.filter((x) => x !== s.id),
                      )
                    }
                  />
                  <span>
                    <strong className="text-foreground">{s.id}</strong> — {s.titulo}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      {subsecoesDisponiveis.length > 0 && (
        <section className="mt-4 rounded-lg border border-border bg-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Label>Subseções do checklist</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Todas as subseções começam marcadas. Desmarque as que não deseja responder — elas
                deixam de ser exibidas no checklist.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setSubsecoes(todasChaves)}>
                Marcar tudo
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSubsecoes(normalizar([]))}>
                Desmarcar tudo
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {subsecoesDisponiveis.map((s) => (
              <div key={s.id} className="rounded-md border border-border/70 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="text-sm text-foreground">
                    Seção {s.id} — {s.titulo}
                  </p>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      onClick={() => alternarSecaoToda(s.id, s.grupos, true)}
                    >
                      Marcar todas
                    </button>
                    <button
                      type="button"
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      onClick={() => alternarSecaoToda(s.id, s.grupos, false)}
                    >
                      Desmarcar todas
                    </button>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {s.grupos.map((g) => {
                    const chave = chaveSubsecao(s.id, g);
                    return (
                      <label
                        key={chave}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <Checkbox
                          checked={subsecoes.includes(chave)}
                          onCheckedChange={(v) => alternarSub(chave, v === true)}
                        />
                        <span>{g}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}


      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-8">
          {secoesIds.map((sid) => {
            const secao = secaoAtiva(sid, subsecoes, especialidade);
            if (!secao) return null;
            const nos = nosVisiveis(secao, respostas);
            const numeros = numerosDaSecao(secaoPorId(sid, especialidade) ?? secao);
            let grupoAtual = "";
            return (
              <section
                key={sid}
                id={`sec-${sid}`}
                className="scroll-mt-24 rounded-lg border border-border bg-card p-6"
              >
                <h2 className="font-display text-xl text-foreground">
                  Seção {secao.id} — {secao.titulo}
                </h2>
                <Separator className="my-4" />
                <div className="space-y-6">
                  {nos.map((no) => {
                    const cabecalhoGrupo = no.grupo && no.grupo !== grupoAtual ? no.grupo : "";
                    if (no.grupo) grupoAtual = no.grupo;
                    return (
                      <div key={no.id} className="space-y-2">
                        {cabecalhoGrupo && (
                          <h3
                            id={ancora(sid, cabecalhoGrupo)}
                            className="eyebrow scroll-mt-24 border-t border-border/60 pt-4 text-foreground"
                          >
                            {cabecalhoGrupo}
                          </h3>
                        )}
                        <Pergunta
                          no={no}
                          numero={numeros[no.id]}
                          valor={respostas[no.id]}
                          temAlerta={nosComAlerta.has(no.id)}
                          temExigencia={nosComExigencia.has(no.id)}
                          onChange={(v) => responder(no, v)}
                        />

                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <nav className="rounded-lg border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-display text-lg text-foreground">
              <ListTree className="h-4 w-4 text-accent" /> Seções e subseções
            </h3>
            <div className="mt-3 max-h-[420px] space-y-4 overflow-y-auto pr-1">
              {sumario.map((s) => (
                <div key={s.id}>
                  <button
                    type="button"
                    onClick={() => irPara(`sec-${s.id}`)}
                    className="text-left text-sm text-foreground underline-offset-4 hover:underline"
                  >
                    Seção {s.id} — {s.titulo}
                  </button>
                  {s.grupos.length > 0 && (
                    <ul className="mt-1 space-y-1 border-l border-border/60 pl-3">
                      {s.grupos.map((g) => (
                        <li key={g}>
                          <button
                            type="button"
                            onClick={() => irPara(ancora(s.id, g))}
                            className="text-left text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                          >
                            {g}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              {!sumario.length && (
                <p className="text-xs text-muted-foreground">
                  Selecione a natureza do título para listar as seções.
                </p>
              )}
            </div>
          </nav>


          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-display text-lg text-foreground">
              <Ban className="h-4 w-4 text-destructive" /> Exigências ({exigencias.length})
            </h3>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              {exigencias.map((e, i) => (
                <li key={`${e.no}-${i}`}>
                  <span className="text-foreground">{i + 1}.</span> {e.texto}
                  {e.detalhe ? ` (${e.detalhe})` : ""}
                  <span className="ml-1 text-xs">[Seção {e.secao}]</span>
                </li>
              ))}
              {!exigencias.length && <li>Nenhuma exigência acumulada.</li>}
            </ol>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="flex items-center gap-2 font-display text-lg text-foreground">
              <AlertTriangle className="h-4 w-4 text-accent" /> Alertas ({alertas.length})
            </h3>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
              {alertas.map((a, i) => (
                <li key={`${a.no}-${i}`}>
                  <span className="text-foreground">{i + 1}.</span> {a.texto}
                  <span className="ml-1 text-xs">[Seção {a.secao}]</span>
                </li>
              ))}
              {!alertas.length && <li>Nenhum alerta acumulado.</li>}
            </ol>
          </div>
        </aside>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg text-foreground">Esboço da nota de exigência</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setNota(notaSugerida);
                setNotaTocada(true);
              }}
            >
              Regerar
            </Button>
          </div>
          <Textarea
            className="mt-3 min-h-[320px] font-mono text-xs"
            value={notaTocada ? nota : notaSugerida}
            onChange={(e) => {
              setNota(e.target.value);
              setNotaTocada(true);
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              void navigator.clipboard.writeText(notaTocada ? nota : notaSugerida);
              toast.success("Nota copiada.");
            }}
          >
            Copiar
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-display text-lg text-foreground">Lista de alertas</h3>
            <Button variant="outline" size="sm" onClick={() => setLista(listaSugerida)}>
              Regerar
            </Button>
          </div>
          <Textarea
            className="mt-3 min-h-[320px] font-mono text-xs"
            value={lista || listaSugerida}
            onChange={(e) => setLista(e.target.value)}
          />
          <Button
            variant="ghost"
            size="sm"
            className="mt-2"
            onClick={() => {
              void navigator.clipboard.writeText(lista || listaSugerida);
              toast.success("Lista copiada.");
            }}
          >
            Copiar
          </Button>
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <Button variant="outline" size="sm" onClick={gerarPdf}>
          <FileText className="mr-2 h-4 w-4" /> Gerar relatório em PDF
        </Button>
      </div>



      <p className="mt-8 text-xs text-muted-foreground">
        Os textos acima são esboços gerados a partir das respostas do checklist. O sistema apoia a
        decisão e não substitui a qualificação jurídica do Oficial.
      </p>
    </main>
  );
}

function Pergunta({
  no,
  numero,
  valor,
  temAlerta,
  temExigencia,
  onChange,
}: {
  no: No;
  numero?: string | undefined;
  valor: unknown;
  temAlerta?: boolean;
  temExigencia?: boolean;
  onChange: (v: string | string[] | number | null) => void;
}) {
  if (no.tipo === "info") {
    return <p className="rounded-md bg-muted/40 p-3 text-sm text-muted-foreground">{no.texto}</p>;
  }

  return (
    <div className="relative rounded-md border border-border/70 p-4 pb-10">
      <p className="text-sm text-foreground">
        {numero && <span className="mr-2 font-semibold text-accent">{numero}</span>}
        {no.texto}
      </p>
      {no.ajuda && <p className="mt-1 text-xs text-muted-foreground">{no.ajuda}</p>}
      {(temAlerta || temExigencia) && (
        <div className="absolute bottom-2 right-3 flex items-center gap-2">
          {temAlerta && (
            <AlertTriangle
              className="h-5 w-5 text-yellow-500"
              aria-label="Alerta gerado por esta pergunta"
            />
          )}
          {temExigencia && (
            <OctagonAlert
              className="h-5 w-5 text-red-600"
              aria-label="Exigência gerada por esta pergunta"
            />
          )}
        </div>
      )}


      {no.tipo === "sim_nao" && (
        <div className="mt-3 flex gap-2">
          {(["sim", "nao"] as const).map((v) => (
            <Button
              key={v}
              type="button"
              size="sm"
              variant={valor === v ? "default" : "outline"}
              onClick={() => onChange(valor === v ? null : v)}
            >
              {v === "sim" ? "Sim" : "Não"}
            </Button>
          ))}
        </div>
      )}

      {no.tipo === "opcoes" && (
        <div className="mt-3 space-y-2">
          {(no.opcoes ?? []).map((o) => {
            const marcado = valor === o.id;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={marcado}
                onClick={() => onChange(marcado ? null : o.id)}
                className={`flex w-full items-start gap-2 rounded-md border px-2 py-1.5 text-left text-sm transition-colors ${
                  marcado
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/40"
                }`}
              >
                <span
                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    marcado ? "border-accent" : "border-muted-foreground/60"
                  }`}
                >
                  {marcado && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                <span>
                  <span className="mr-1 font-medium text-foreground">{o.id})</span>
                  {o.rotulo}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {no.tipo === "multipla" && (
        <div className="mt-3 space-y-2">
          {(no.opcoes ?? []).map((o) => {
            const sel = Array.isArray(valor) ? (valor as string[]) : [];
            return (
              <label key={o.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Checkbox
                  checked={sel.includes(o.id)}
                  onCheckedChange={(v) =>
                    onChange(v === true ? [...sel, o.id] : sel.filter((x) => x !== o.id))
                  }
                />
                <span>
                  <span className="mr-1 font-medium text-foreground">{o.id})</span>
                  {o.rotulo}
                </span>
              </label>
            );
          })}

          {!Array.isArray(valor) && (
            <Button type="button" size="sm" variant="outline" onClick={() => onChange([])}>
              Confirmar seleção
            </Button>
          )}
        </div>
      )}

      {(no.tipo === "numero" || no.tipo === "texto") && (
        <Input
          className="mt-3"
          type={no.tipo === "numero" && !ehMoeda(no) ? "number" : "text"}
          inputMode={ehMoeda(no) ? "numeric" : undefined}
          value={valor === null || valor === undefined ? "" : String(valor)}
          onChange={(e) => {
            const v = ehMoeda(no) ? formatarMoeda(e.target.value) : e.target.value;
            onChange(v === "" ? null : v);
          }}
        />
      )}
    </div>
  );
}
