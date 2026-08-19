import { rotuloAto, type IndexAto } from "@/lib/matricula-index-parser";

/**
 * Tabela "Ônus e Direitos Reais registrados na Matrícula".
 * Montada a partir dos atos identificados na leitura (OCR/texto) da matrícula.
 */
export function TabelaOnus({
  itens,
  titulo = "Ônus e Direitos Reais registrados na Matrícula",
  origem,
}: {
  itens: IndexAto[];
  titulo?: string;
  origem?: string;
}) {
  const vigentes = itens.filter((o) => o.vigente !== false).length;
  const cancelados = itens.length - vigentes;

  return (
    <div className="mt-4 overflow-x-auto rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
        <p className="font-display text-sm text-foreground">{titulo}</p>
        {origem && <span className="text-[11px] text-muted-foreground">{origem}</span>}
        <span className="ml-auto text-[11px] text-muted-foreground">
          {vigentes} vigente(s) · {cancelados} cancelado(s)
        </span>
      </div>

      {itens.length === 0 ? (
        <p className="px-4 py-3 text-xs text-muted-foreground">
          Nenhum ônus ou direito real registrado foi identificado na leitura.
        </p>
      ) : (
        <table className="w-full table-auto text-xs">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-3 py-2 font-normal">ATO</th>
              <th className="px-3 py-2 font-normal">ESPÉCIE</th>
              <th className="px-3 py-2 font-normal">DATA</th>
              <th className="px-3 py-2 font-normal">SITUAÇÃO</th>
              <th className="px-3 py-2 font-normal">TEOR (RESUMO)</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((o, i) => {
              const cancelado = o.vigente === false;
              return (
                <tr
                  key={`${rotuloAto(o.tipo, o.numero)}-${i}`}
                  className="border-b border-border/60 align-top"
                >
                  <td className="whitespace-nowrap px-3 py-2 text-foreground">
                    {rotuloAto(o.tipo, o.numero)}
                  </td>
                  <td className="px-3 py-2 text-foreground">
                    {o.gravame ? o.gravame.toUpperCase() : "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                    {o.data ?? "—"}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2">
                    <span
                      className={`inline-block rounded border px-2 py-0.5 ${
                        cancelado
                          ? "border-border text-muted-foreground"
                          : "border-destructive/40 text-destructive"
                      }`}
                    >
                      {cancelado
                        ? `Cancelado${o.cancelado_por ? ` por ${o.cancelado_por}` : ""}`
                        : "Vigente"}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-2 ${cancelado ? "text-muted-foreground line-through" : "text-muted-foreground"}`}
                  >
                    {o.descricao ? `${o.descricao.slice(0, 260)}${o.descricao.length > 260 ? "…" : ""}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <p className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
        Levantamento instrumental a partir da leitura do documento: confira sempre o inteiro teor.
        O sistema apoia a decisão e não substitui a qualificação jurídica do Oficial.
      </p>
    </div>
  );
}
