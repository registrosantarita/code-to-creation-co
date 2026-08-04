import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buscarNormas,
  criarNorma,
  excluirNorma,
  listarNormas,
} from "@/lib/normas.functions";

export const Route = createFileRoute("/_authenticated/normas")({
  head: () => ({
    meta: [
      { title: "Acervo normativo — GeoConfronto" },
      {
        name: "description",
        content:
          "Cadastre leis, provimentos, normas de serviço e decisões administrativas e consulte o acervo por busca semântica.",
      },
      { property: "og:title", content: "Acervo normativo — GeoConfronto" },
      {
        property: "og:description",
        content:
          "Base normativa curada com vigência, hierarquia e busca semântica para apoio à qualificação registral.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AcervoNormativo,
});

const TIPOS: Record<string, string> = {
  lei: "Lei",
  decreto: "Decreto",
  provimento: "Provimento",
  resolucao: "Resolução",
  normas_servico: "Normas de Serviço (NSCGJ)",
  parecer: "Parecer",
  decisao_administrativa: "Decisão administrativa",
  sumula: "Súmula",
  enunciado: "Enunciado",
  outro: "Outro",
};

const SITUACOES: Record<string, string> = {
  vigente: "Vigente",
  revogada: "Revogada",
  suspensa: "Suspensa",
  em_consulta: "Em consulta pública",
};

const HIERARQUIA: { valor: string; rotulo: string }[] = [
  { valor: "10", rotulo: "10 — Constituição / lei federal" },
  { valor: "20", rotulo: "20 — Provimento CNJ / Corregedoria Nacional" },
  { valor: "30", rotulo: "30 — Normas de Serviço da CGJ estadual" },
  { valor: "40", rotulo: "40 — Decisão administrativa / parecer" },
  { valor: "50", rotulo: "50 — Doutrina / material de apoio" },
];

const VAZIO = {
  title: "",
  issuer: "",
  norm_type: "provimento",
  number: "",
  year: "",
  hierarchy: "30",
  ementa: "",
  full_text: "",
  source_url: "",
  jurisdiction: "nacional",
  effective_from: "",
  effective_to: "",
  status: "vigente",
  tags: "",
};

function dataCurta(iso: string | null) {
  if (!iso) return "—";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("pt-BR");
}

function AcervoNormativo() {
  const queryClient = useQueryClient();
  const listar = useServerFn(listarNormas);
  const criar = useServerFn(criarNorma);
  const excluir = useServerFn(excluirNorma);
  const buscar = useServerFn(buscarNormas);

  const [form, setForm] = useState(VAZIO);
  const [consulta, setConsulta] = useState("");
  const [apenasVigentes, setApenasVigentes] = useState(true);

  const normas = useQuery({ queryKey: ["normas"], queryFn: () => listar() });

  const mCriar = useMutation({
    mutationFn: () =>
      criar({
        data: {
          title: form.title.trim(),
          issuer: form.issuer.trim(),
          norm_type: form.norm_type as never,
          ...(form.number.trim() ? { number: form.number.trim() } : {}),
          ...(form.year.trim() ? { year: Number(form.year) } : {}),
          hierarchy: Number(form.hierarchy),
          ementa: form.ementa.trim(),
          full_text: form.full_text.trim(),
          source_url: form.source_url.trim(),
          jurisdiction: form.jurisdiction.trim() || "nacional",
          effective_from: form.effective_from,
          effective_to: form.effective_to,
          status: form.status as never,
          tags: form.tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        },
      }),
    onSuccess: (r) => {
      toast.success(`Norma cadastrada e indexada em ${r.trechos} trecho(s).`);
      setForm(VAZIO);
      void queryClient.invalidateQueries({ queryKey: ["normas"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mExcluir = useMutation({
    mutationFn: (id: string) => excluir({ data: { id } }),
    onSuccess: () => {
      toast.success("Norma removida do acervo.");
      void queryClient.invalidateQueries({ queryKey: ["normas"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const mBuscar = useMutation({
    mutationFn: () => buscar({ data: { consulta: consulta.trim(), limite: 8, apenasVigentes } }),
    onError: (e: Error) => toast.error(e.message),
  });

  const lista = normas.data ?? [];
  const resultados = mBuscar.data ?? [];
  const podeSalvar =
    form.title.trim().length >= 3 && form.full_text.trim().length >= 20 && !mCriar.isPending;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <p className="eyebrow">Camada normativa</p>
      <h1 className="mt-2 font-display text-3xl text-foreground">Acervo normativo</h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Ingestão manual e curada de leis, provimentos, normas de serviço, pareceres e decisões
        administrativas, com vigência e hierarquia. A consulta semântica devolve os trechos mais
        próximos da dúvida registral — sempre como subsídio opinativo, jamais substituindo a
        qualificação jurídica do Oficial.
      </p>

      <Tabs defaultValue="consulta" className="mt-8">
        <TabsList>
          <TabsTrigger value="consulta">Consulta</TabsTrigger>
          <TabsTrigger value="cadastro">Cadastrar norma</TabsTrigger>
          <TabsTrigger value="acervo">Acervo ({lista.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="consulta" className="mt-6">
          <div className="panel p-6">
            <Label htmlFor="consulta">Dúvida ou tema a pesquisar</Label>
            <Textarea
              id="consulta"
              rows={3}
              className="mt-2"
              placeholder="Ex.: divergência de área entre memorial descritivo e matrícula em retificação administrativa"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <Button
                onClick={() => mBuscar.mutate()}
                disabled={consulta.trim().length < 3 || mBuscar.isPending}
              >
                {mBuscar.isPending ? "Consultando…" : "Consultar acervo"}
              </Button>
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={apenasVigentes}
                  onChange={(e) => setApenasVigentes(e.target.checked)}
                />
                Somente atos vigentes
              </label>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {mBuscar.isSuccess && resultados.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum trecho correspondente. Cadastre normas no acervo para ampliar a base.
              </p>
            )}
            {resultados.map((r) => (
              <article key={r.chunk_id} className="panel p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="font-display text-base text-foreground">{r.title}</h2>
                  <span className="text-xs text-muted-foreground">
                    similaridade {(Number(r.similarity) * 100).toFixed(1)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {TIPOS[r.norm_type] ?? r.norm_type}
                  {r.number ? ` nº ${r.number}` : ""}
                  {r.year ? `/${r.year}` : ""} · {r.issuer || "Órgão não informado"} ·{" "}
                  {SITUACOES[r.status] ?? r.status} · trecho {r.seq}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{r.content}</p>
                {r.source_url && (
                  <a
                    href={r.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs text-accent underline-offset-4 hover:underline"
                  >
                    Fonte oficial
                  </a>
                )}
              </article>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cadastro" className="mt-6">
          <form
            className="panel grid gap-4 p-6 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              mCriar.mutate();
            }}
          >
            <div className="sm:col-span-2">
              <Label htmlFor="title">Título do ato *</Label>
              <Input
                id="title"
                className="mt-2"
                placeholder="Provimento nº 89/2019 da Corregedoria Nacional de Justiça"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="issuer">Órgão emissor</Label>
              <Input
                id="issuer"
                className="mt-2"
                placeholder="CNJ / CGJ-SP / 1ª VRP-SP"
                value={form.issuer}
                onChange={(e) => setForm({ ...form, issuer: e.target.value })}
              />
            </div>

            <div>
              <Label>Tipo do ato</Label>
              <Select
                value={form.norm_type}
                onValueChange={(v) => setForm({ ...form, norm_type: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TIPOS).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                className="mt-2"
                value={form.number}
                onChange={(e) => setForm({ ...form, number: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                inputMode="numeric"
                className="mt-2"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>

            <div>
              <Label>Hierarquia</Label>
              <Select
                value={form.hierarchy}
                onValueChange={(v) => setForm({ ...form, hierarchy: v })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HIERARQUIA.map((h) => (
                    <SelectItem key={h.valor} value={h.valor}>
                      {h.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SITUACOES).map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="jurisdiction">Abrangência</Label>
              <Input
                id="jurisdiction"
                className="mt-2"
                placeholder="nacional / SP / comarca"
                value={form.jurisdiction}
                onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="from">Início de vigência</Label>
              <Input
                id="from"
                type="date"
                className="mt-2"
                value={form.effective_from}
                onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="to">Fim de vigência</Label>
              <Input
                id="to"
                type="date"
                className="mt-2"
                value={form.effective_to}
                onChange={(e) => setForm({ ...form, effective_to: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="source">Link da fonte oficial</Label>
              <Input
                id="source"
                className="mt-2"
                placeholder="https://atos.cnj.jus.br/atos/detalhar/3018"
                value={form.source_url}
                onChange={(e) => setForm({ ...form, source_url: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="ementa">Ementa / resumo oficial</Label>
              <Textarea
                id="ementa"
                rows={3}
                className="mt-2"
                value={form.ementa}
                onChange={(e) => setForm({ ...form, ementa: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="full">Inteiro teor *</Label>
              <Textarea
                id="full"
                rows={12}
                className="mt-2 font-mono text-xs"
                placeholder="Cole aqui o texto integral do ato, parecer ou decisão."
                value={form.full_text}
                onChange={(e) => setForm({ ...form, full_text: e.target.value })}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                O texto é segmentado por artigo/parágrafo e indexado semanticamente. Só a indexação
                consome créditos de IA (custo muito baixo, proporcional ao tamanho do texto); a
                comparação técnica de memoriais segue 100% determinística.
              </p>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="tags">Etiquetas (separadas por vírgula)</Label>
              <Input
                id="tags"
                className="mt-2"
                placeholder="retificação, georreferenciamento, dúvida registral"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={!podeSalvar}>
                {mCriar.isPending ? "Indexando…" : "Cadastrar e indexar"}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="acervo" className="mt-6">
          {normas.isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!normas.isLoading && lista.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Acervo vazio. Cadastre o primeiro ato normativo na aba de cadastro.
            </p>
          )}
          <div className="space-y-4">
            {lista.map((n) => (
              <article key={n.id} className="panel p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-base text-foreground">{n.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {TIPOS[n.norm_type] ?? n.norm_type}
                      {n.number ? ` nº ${n.number}` : ""}
                      {n.year ? `/${n.year}` : ""} · {n.issuer || "Órgão não informado"} ·{" "}
                      {SITUACOES[n.status] ?? n.status} · {n.jurisdiction}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Vigência: {dataCurta(n.effective_from)} — {dataCurta(n.effective_to)} ·{" "}
                      {n.chunk_count} trecho(s) indexado(s)
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={mExcluir.isPending}
                    onClick={() => mExcluir.mutate(n.id)}
                  >
                    Excluir
                  </Button>
                </div>
                {n.ementa && (
                  <p className="mt-3 text-sm text-muted-foreground">{n.ementa}</p>
                )}
                {n.tags.length > 0 && (
                  <p className="mt-3 flex flex-wrap gap-2">
                    {n.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded border border-border px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </p>
                )}
              </article>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
