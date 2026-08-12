import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { souAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta — e-Qualifica" },
      {
        name: "description",
        content:
          "Área geral da conta: dados do usuário, acesso aos módulos, consumo de créditos e administração.",
      },
      { property: "og:title", content: "Minha conta — e-Qualifica" },
      {
        property: "og:description",
        content: "Configurações gerais, créditos e administração da conta e-Qualifica.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Conta,
});

function Conta() {
  const { user } = useRouteContext({ from: "/_authenticated" });
  const souAdminFn = useServerFn(souAdmin);
  const admin = useQuery({
    queryKey: ["sou-admin"],
    queryFn: () => souAdminFn({}),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <header>
        <p className="eyebrow">Conta</p>
        <h1 className="mt-2 font-display text-3xl text-foreground">Configurações gerais</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sessão ativa como <span className="text-foreground">{user.email}</span>.
        </p>
      </header>

      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          to="/creditos"
          className="rounded-lg border border-border bg-card p-6 transition hover:border-accent"
        >
          <p className="font-display text-lg text-foreground">Créditos e consumo</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Histórico de uso de IA (OCR) e estimativas por análise.
          </p>
        </Link>

        <Link
          to="/normas"
          className="rounded-lg border border-border bg-card p-6 transition hover:border-accent"
        >
          <p className="font-display text-lg text-foreground">Acervo normativo</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Base normativa com busca semântica de apoio à qualificação.
          </p>
        </Link>

        {admin.data?.admin && (
          <Link
            to="/admin"
            className="rounded-lg border border-border bg-card p-6 transition hover:border-accent"
          >
            <p className="font-display text-lg text-foreground">Administração</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Usuários, papéis de acesso e auditoria das tarefas executadas.
            </p>
          </Link>
        )}

        <Link
          to="/"
          className="rounded-lg border border-border bg-card p-6 transition hover:border-accent"
        >
          <p className="font-display text-lg text-foreground">Módulos</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Voltar à capa e acessar GeoConfronto ou CheckTítulo.
          </p>
        </Link>
      </section>

      <p className="mt-10 text-xs text-muted-foreground">
        O sistema apoia a decisão — não substitui a qualificação jurídica do Oficial.
      </p>
    </main>
  );
}
