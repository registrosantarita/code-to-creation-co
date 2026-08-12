import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { criarConjunto, excluirConjunto, listarConjuntos } from "@/lib/qualificacao.functions";
import checktituloLogo from "@/assets/checktitulo-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/qualificacao/")({
  head: () => ({
    meta: [
      { title: "CheckTítulo — Conferência de Dados de Qualificação — e-Qualifica" },
      {
        name: "description",
        content:
          "Confronte nomes, CPF, RG, endereço, estado civil, regime de bens, cadastros do imóvel (CCIR, CIB, CAR) e registro anterior entre documentos.",
      },
      {
        property: "og:title",
        content: "CheckTítulo — Conferência de Dados de Qualificação — e-Qualifica",
      },
      {
        property: "og:description",
        content: "Módulo de conferência cadastral e pessoal de documentos registrais.",
      },
    ],
  }),
  component: QualificacaoLista,
});

function QualificacaoLista() {
  const queryClient = useQueryClient();
  const listar = useServerFn(listarConjuntos);
  const criar = useServerFn(criarConjunto);
  const excluir = useServerFn(excluirConjunto);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [mode, setMode] = useState<"titulo_x_matricula" | "titulo_x_titulo">(
    "titulo_x_matricula",
  );

  const { data, isLoading } = useQuery({
    queryKey: ["qualificacao-sets"],
    queryFn: () => listar({ data: {} }),
  });

  const create = useMutation({
    mutationFn: async () => {
      if (title.trim().length < 3) throw new Error("Informe um título com ao menos 3 caracteres.");
      return criar({ data: { title: title.trim(), note: note.trim(), mode } });
    },
    onSuccess: async () => {
      setOpen(false);
      setTitle("");
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["qualificacao-sets"] });
      toast.success("Conferência criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => excluir({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["qualificacao-sets"] });
      toast.success("Conferência excluída.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <img
              src={checktituloLogo.url}
              alt="CheckTítulo"
              className="h-10 w-auto object-contain"
            />
            <div>
              <p className="eyebrow">Módulo cadastral</p>
              <h1 className="font-display text-2xl text-foreground">
                CheckTítulo — Conferência de dados de qualificação
              </h1>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Confronta partes (nome, CPF/CNPJ, RG, endereço, estado civil, regime de bens e data do
            casamento), cadastros do imóvel (cadastro municipal, CCIR, CIB, CAR, ITR/NIRF) e a cadeia
            registral (matrícula, transcrição, registro anterior, livro e folha) entre dois ou mais
            documentos. A extração é determinística; a IA é opcional e só complementa lacunas.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Nova conferência
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova conferência de qualificação</DialogTitle>
              <DialogDescription>
                Depois de criar, envie ou cole os documentos a serem confrontados.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex.: Escritura x Matrícula 12.345 — João e Maria"
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de confronto</Label>
                <div className="grid gap-2">
                  {(
                    [
                      [
                        "titulo_x_matricula",
                        "Título x Matrícula(s)",
                        "Escritura, requerimento, instrumento particular ou título judicial confrontado com uma ou mais matrículas.",
                      ],
                      [
                        "titulo_x_titulo",
                        "Título x Título",
                        "Confronto entre dois ou mais títulos, sem matrícula.",
                      ],
                    ] as const
                  ).map(([valor, rotulo, desc]) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => setMode(valor)}
                      className={`rounded-md border p-3 text-left text-xs transition ${
                        mode === valor
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground hover:border-primary/40"
                      }`}
                    >
                      <span className="block font-display text-sm text-foreground">{rotulo}</span>
                      {desc}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs">Observação</Label>
                <Textarea id="obs" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? "Criando…" : "Criar"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <section className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {!isLoading && !data?.length && (
          <p className="rounded-md border border-border bg-card p-6 text-sm text-muted-foreground">
            Nenhuma conferência de qualificação criada ainda.
          </p>
        )}
        {data?.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-4 rounded-md border border-border bg-card p-4"
          >
            <Link
              to="/qualificacao/$id"
              params={{ id: c.id }}
              className="flex flex-1 items-start gap-3"
            >
              <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-display text-sm text-foreground">{c.title}</p>
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {c.mode === "titulo_x_titulo" ? "Título x Título" : "Título x Matrícula(s)"}
                </p>
                {c.note && <p className="text-xs text-muted-foreground">{c.note}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Atualizada em {new Date(c.updated_at).toLocaleString("pt-BR")}
                </p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Excluir conferência"
              onClick={() => remove.mutate(c.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </section>
    </main>
  );
}
