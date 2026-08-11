import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  listarUsuarios,
  listarAtividade,
  definirPapel,
  removerPapel,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Administração — GeoConfronto" },
      {
        name: "description",
        content:
          "Painel do administrador: usuários cadastrados, papéis de acesso e histórico de análises executadas por cada operador.",
      },
      { property: "og:title", content: "Administração — GeoConfronto" },
      {
        property: "og:description",
        content: "Gestão de usuários, papéis e auditoria das análises registrais.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="eyebrow">Acesso</p>
      <h1 className="mt-3 text-2xl text-foreground">Administração indisponível</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </main>
  ),
});

const PAPEIS = ["admin", "official", "operator", "reviewer", "read_only"] as const;

const PAPEL_LABEL: Record<string, string> = {
  admin: "Administrador",
  official: "Oficial",
  operator: "Operador",
  reviewer: "Revisor",
  read_only: "Somente leitura",
};

function data(v: string | null) {
  if (!v) return "—";
  return new Date(v).toLocaleString("pt-BR");
}

function Admin() {
  const usuariosFn = useServerFn(listarUsuarios);
  const atividadeFn = useServerFn(listarAtividade);
  const definirFn = useServerFn(definirPapel);
  const removerFn = useServerFn(removerPapel);
  const qc = useQueryClient();

  const usuarios = useQuery({ queryKey: ["admin", "usuarios"], queryFn: () => usuariosFn({}) });
  const atividade = useQuery({ queryKey: ["admin", "atividade"], queryFn: () => atividadeFn({}) });

  const mutar = useMutation({
    mutationFn: async (v: { userId: string; role: string; add: boolean }) =>
      v.add
        ? definirFn({ data: { userId: v.userId, role: v.role as never } })
        : removerFn({ data: { userId: v.userId, role: v.role as never } }),
    onSuccess: () => {
      toast.success("Papel atualizado.");
      qc.invalidateQueries({ queryKey: ["admin", "usuarios"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header>
        <p className="eyebrow">Administração</p>
        <h1 className="mt-2 font-display text-3xl text-foreground">
          Usuários e auditoria de tarefas
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Gerencie os papéis de acesso dos cadastrados e acompanhe todas as análises
          executadas na plataforma, com autor e data.
        </p>
      </header>

      <section className="mt-10">
        <h2 className="font-display text-xl text-foreground">Cadastros</h2>
        {usuarios.isLoading && (
          <p className="mt-3 text-sm text-muted-foreground">Carregando usuários…</p>
        )}
        {usuarios.error && (
          <p className="mt-3 text-sm text-destructive">{(usuarios.error as Error).message}</p>
        )}
        <div className="mt-4 space-y-3">
          {(usuarios.data ?? []).map((u) => (
            <article
              key={u.id}
              className="rounded-lg border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {u.full_name || "(sem nome)"}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {u.total_analises} análise(s) · última atividade em{" "}
                    {data(u.ultima_atividade)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {PAPEIS.map((p) => {
                    const ativo = u.roles.includes(p);
                    return (
                      <Button
                        key={p}
                        size="sm"
                        variant={ativo ? "default" : "outline"}
                        disabled={mutar.isPending}
                        onClick={() =>
                          mutar.mutate({ userId: u.id, role: p, add: !ativo })
                        }
                      >
                        {PAPEL_LABEL[p]}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-xl text-foreground">Tarefas executadas</h2>
        {atividade.isLoading && (
          <p className="mt-3 text-sm text-muted-foreground">Carregando histórico…</p>
        )}
        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Análise</th>
                <th className="px-3 py-2">Autor</th>
                <th className="px-3 py-2">Situação</th>
                <th className="px-3 py-2">Comparações</th>
                <th className="px-3 py-2">Incompatíveis</th>
                <th className="px-3 py-2">Criada em</th>
              </tr>
            </thead>
            <tbody>
              {(atividade.data ?? []).map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-3 py-2 text-foreground">{a.title}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.autor_email}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.status}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.comparacoes}</td>
                  <td className="px-3 py-2 text-muted-foreground">{a.incompativeis}</td>
                  <td className="px-3 py-2 text-muted-foreground">{data(a.created_at)}</td>
                </tr>
              ))}
              {atividade.data?.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-muted-foreground" colSpan={6}>
                    Nenhuma análise registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
