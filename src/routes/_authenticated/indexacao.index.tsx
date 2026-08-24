import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { criarLote, excluirLote, listarLotes } from "@/lib/checkindex.functions";
import checkindexLogoAsset from "@/assets/checkindex-logo.png.asset.json";
const checkindexLogo = checkindexLogoAsset.url;

export const Route = createFileRoute("/_authenticated/indexacao/")({
  head: () => ({
    meta: [
      { title: "CheckIndex — Lotes de indexação — e-Qualifica" },
      {
        name: "description",
        content:
          "Organize lotes de matrículas digitalizadas, extraia os dados estruturados e exporte para o sistema do Cartório.",
      },
      { property: "og:title", content: "CheckIndex — Lotes de indexação — e-Qualifica" },
      {
        property: "og:description",
        content: "Indexação de matrículas digitalizadas com exportação padronizada.",
      },
    ],
  }),
  component: IndexacaoLista,
});

function IndexacaoLista() {
  const queryClient = useQueryClient();
  const listar = useServerFn(listarLotes);
  const criar = useServerFn(criarLote);
  const excluir = useServerFn(excluirLote);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["checkindex-lotes"],
    queryFn: () => listar({ data: {} }),
  });

  const create = useMutation({
    mutationFn: async () => {
      if (title.trim().length < 3) throw new Error("Informe um título com ao menos 3 caracteres.");
      return criar({ data: { title: title.trim(), note: note.trim() } });
    },
    onSuccess: async () => {
      setOpen(false);
      setTitle("");
      setNote("");
      await queryClient.invalidateQueries({ queryKey: ["checkindex-lotes"] });
      toast.success("Lote criado.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => excluir({ data: { id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["checkindex-lotes"] });
      toast.success("Lote excluído.");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="border border-solid border-accent p-0.5">
              <img
                src={checkindexLogo}
                alt="CheckIndex"
                width={1024}
                height={1024}
                className="h-12 w-auto object-contain"
              />
            </div>

            <div>
              <p className="eyebrow">Módulo de indexação</p>
              <h1 className="font-display text-2xl text-foreground">
                CheckIndex — Indexação de matrículas
              </h1>
            </div>
          </div>
          <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
            Cada lote reúne as matrículas digitalizadas de um mesmo trabalho. Os dados são
            extraídos de forma determinística, ficam disponíveis para revisão e podem ser
            exportados em CSV, XLSX ou JSON para importação no sistema interno do Cartório.
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo lote
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo lote de indexação</DialogTitle>
              <DialogDescription>
                Dê um nome ao lote (ex.: “Matrículas 1 a 200 — Livro 2-A”).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Matrículas do Livro 2-A"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="obs">Observação</Label>
                <Textarea
                  id="obs"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                {create.isPending ? "Criando…" : "Criar lote"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <p className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Nenhum lote ainda. Crie o primeiro para começar a indexar matrículas.
          </p>
        )}
        {data?.map((lote) => (
          <article
            key={lote.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-5"
          >
            <div>
              <Link
                to="/indexacao/$id"
                params={{ id: lote.id }}
                className="font-display text-lg text-foreground underline-offset-4 hover:underline"
              >
                {lote.title}
              </Link>
              {lote.note && (
                <p className="mt-1 text-sm text-muted-foreground">{lote.note}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                Atualizado em {new Date(lote.updated_at).toLocaleString("pt-BR")}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => remove.mutate(lote.id)}
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
