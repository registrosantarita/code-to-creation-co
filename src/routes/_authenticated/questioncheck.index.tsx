import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  criarConferencia,
  excluirConferencia,
  listarConferencias,
} from "@/lib/question-check.functions";
import { TIPOS_TITULO, secoesAplicaveis } from "@/lib/question-check-types";
import logoAsset from "@/assets/questioncheck-logo.png.asset.json";

export const Route = createFileRoute("/_authenticated/questioncheck/")({
  head: () => ({
    meta: [
      { title: "QuestionCheck — Checklist de qualificação registral — e-Qualifica" },
      {
        name: "description",
        content:
          "Checklist condicional de qualificação de títulos: seções A a R, alertas e exigências acumulados e esboço da nota de exigência.",
      },
      { property: "og:title", content: "QuestionCheck — Checklist de qualificação registral" },
      {
        property: "og:description",
        content: "Perguntas em sequência, alertas e exigências acumulados e nota de exigência editável.",
      },
    ],
  }),
  component: QuestionCheckLista,
});

function QuestionCheckLista() {
  const queryClient = useQueryClient();
  const listar = useServerFn(listarConferencias);
  const criar = useServerFn(criarConferencia);
  const excluir = useServerFn(excluirConferencia);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [protocolo, setProtocolo] = useState("");
  const [note, setNote] = useState("");
  const [tipo, setTipo] = useState("compra_venda");

  const { data, isLoading } = useQuery({
    queryKey: ["questioncheck-lista"],
    queryFn: () => listar({ data: {} }),
  });

  const create = useMutation({
    mutationFn: async () => {
      if (title.trim().length < 3) throw new Error("Informe um título com ao menos 3 caracteres.");
      return criar({
        data: {
          title: title.trim(),
          protocolo: protocolo.trim(),
          note: note.trim(),
          tipoTitulo: tipo,
          secoes: secoesAplicaveis(tipo),
        },
      });
    },
    onSuccess: async () => {
      setOpen(false);
      setTitle("");
      setProtocolo("");
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["questioncheck-lista"] });
      toast.success("Conferência criada.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => excluir({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["questioncheck-lista"] });
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
              src={logoAsset.url}
              alt="QuestionCheck"
              className="h-12 w-auto object-contain"
            />
            <div>
              <p className="eyebrow">Módulo de checklist</p>
              <h1 className="font-display text-2xl text-foreground">
                QuestionCheck — Qualificação por perguntas
              </h1>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            As perguntas são apresentadas em sequência — Seção A, seções variáveis conforme a
            natureza do título e, ao final, Seções Q e R. Alertas (⚠) e exigências (⛔) são
            acumulados automaticamente, na ordem em que as perguntas forem respondidas.
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
              <DialogTitle>Nova conferência</DialogTitle>
              <DialogDescription>
                Vincule o checklist a um título ou processo para poder salvar e retomar.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qc-titulo">Título / processo</Label>
                <Input
                  id="qc-titulo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Escritura de compra e venda — Matrícula 12.345"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="qc-prenotacao">Prenotação / protocolo</Label>
                <Input
                  id="qc-prenotacao"
                  value={protocolo}
                  onChange={(e) => setProtocolo(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label>Natureza do título</Label>
                <Select value={tipo} onValueChange={setTipo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPOS_TITULO.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.rotulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Seções aplicáveis: {secoesAplicaveis(tipo).join(" · ")}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="qc-obs">Observação</Label>
                <Textarea
                  id="qc-obs"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? "Criando…" : "Criar conferência"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhuma conferência ainda. Crie a primeira para iniciar o checklist.
          </p>
        )}
        {data?.map((s) => (
          <article
            key={s.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5"
          >
            <div>
              <Link
                to="/questioncheck/$id"
                params={{ id: s.id }}
                className="font-display text-lg text-foreground underline-offset-4 hover:underline"
              >
                {s.title}
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                {TIPOS_TITULO.find((t) => t.id === s.tipo_titulo)?.rotulo ?? "Título não classificado"}
                {s.protocolo ? ` · Prenotação ${s.protocolo}` : ""} · Seções{" "}
                {(s.secoes ?? []).join(", ")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {s.status === "concluida" ? "Concluída" : "Em andamento"} · atualizada em{" "}
                {new Date(s.updated_at).toLocaleString("pt-BR")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove.mutate(s.id)}
              disabled={remove.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
          </article>
        ))}
      </div>
    </main>
  );
}
