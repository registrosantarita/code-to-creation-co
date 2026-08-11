import { Check, X } from "lucide-react";
import { fmtMedida, degToDms } from "@/lib/labels";
import type { TrechoConferido } from "@/lib/comparison-engine";
import { agruparConfrontantes } from "@/lib/confrontantes";

export function lerTrechos(metrics: Record<string, unknown>): TrechoConferido[] {
  const t = metrics["trechos"];
  return Array.isArray(t) ? (t as TrechoConferido[]) : [];
}

type Props = {
  trechos: TrechoConferido[];
  extensaoM?: number | null;
  labelA?: string;
  labelB?: string;
};

function Situacao({
  ok,
  problemas,
  comparado = true,
}: {
  ok: boolean;
  problemas: string[];
  comparado?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      {!comparado ? (
        <Minus className="h-5 w-5 text-muted-foreground" aria-label="Não conferido" />
      ) : ok ? (
        <Check className="h-5 w-5 text-success" aria-label="Correto" />
      ) : (
        <X className="h-5 w-5 text-destructive" aria-label="Incorreto" />
      )}
      <span className="max-w-[220px] text-center text-[11px] leading-snug text-muted-foreground">
        {problemas.length > 0
          ? problemas.join("; ")
          : comparado
            ? ""
            : "sem dado comum para conferir"}
      </span>
    </div>
  );
}


/** Conferência trecho a trecho: vértice inicial → final e conformidade. */
export function TrechosConferidos({ trechos, extensaoM, labelA, labelB }: Props) {
  if (trechos.length === 0) return null;

  const conformes = trechos.filter((t) => t.ok).length;
  const primeiro = trechos[0]!;
  const ultimo = trechos[trechos.length - 1]!;
  const inicio = primeiro.de_a ?? `seg. ${primeiro.seq_a}`;
  const fim = ultimo.ate_a ?? `seg. ${ultimo.seq_a}`;
  const confrontacoes = agruparConfrontantes(trechos);

  return (
    <>
      <section className="panel mt-8 p-6">
        <h2 className="text-lg">Conferência trecho a trecho</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Trecho total conferido: <span className="numeric">{inicio}</span> →{" "}
          <span className="numeric">{fim}</span> — {trechos.length} trecho(s),{" "}
          <span className="numeric">
            {fmtMedida(
              extensaoM ??
                trechos.reduce((acc, t) => acc + (t.distancia_a ?? 0), 0),
            )}{" "}
            m
          </span>
          . {conformes} de {trechos.length} conformes.
          {primeiro.invertido
            ? " Caminhamentos em sentidos opostos, conferidos por contra-azimute."
            : ""}
        </p>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="eyebrow py-2 pr-3">#</th>
                <th className="eyebrow py-2 pr-3">
                  Trecho {labelA ? `— ${labelA}` : "— documento A"}
                </th>
                <th className="eyebrow py-2 pr-3">
                  Correspondente {labelB ? `— ${labelB}` : "— documento B"}
                </th>
                <th className="eyebrow py-2 pr-3 text-right">Distância (m)</th>
                <th className="eyebrow py-2 pr-3 text-right">Azimute</th>
                <th className="eyebrow py-2 pr-3 text-center">Situação</th>
              </tr>
            </thead>
            <tbody>
              {trechos.map((t) => (
                <tr
                  key={`${t.seq_a}-${t.seq_b}`}
                  className="border-b border-border/60 align-top"
                >
                  <td className="numeric py-2 pr-3 text-muted-foreground">{t.seq_a}</td>
                  <td className="numeric py-2 pr-3">
                    {t.de_a ?? "?"} → {t.ate_a ?? "?"}
                  </td>
                  <td className="numeric py-2 pr-3 text-muted-foreground">
                    {t.de_b ?? "?"} → {t.ate_b ?? "?"}
                  </td>
                  <td className="numeric py-2 pr-3 text-right">
                    {fmtMedida(t.distancia_a)} / {fmtMedida(t.distancia_b)}
                  </td>
                  <td className="numeric py-2 pr-3 text-right">
                    {degToDms(t.azimute_a)} / {degToDms(t.azimute_b)}
                  </td>
                  <td className="py-2 pr-3">
                    <Situacao ok={t.ok} problemas={t.problemas} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {confrontacoes.length > 0 && (
        <section className="panel mt-8 p-6">
          <h2 className="text-lg">Imóveis confrontantes</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Caminhamento resumido por confrontação: do vértice inicial ao final
            de cada divisa comum.
          </p>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="eyebrow py-2 pr-3">Confrontação</th>
                  <th className="eyebrow py-2 pr-3">Caminhamento</th>
                  <th className="eyebrow py-2 pr-3 text-right">Trechos</th>
                  <th className="eyebrow py-2 pr-3 text-right">Extensão (m)</th>
                  <th className="eyebrow py-2 pr-3 text-center">Situação</th>
                </tr>
              </thead>
              <tbody>
                {confrontacoes.map((g, i) => (
                  <tr
                    key={`${g.confrontante}-${i}`}
                    className="border-b border-border/60 align-top"
                  >
                    <td className="py-2 pr-3">{g.confrontante}</td>
                    <td className="numeric py-2 pr-3">
                      {g.de} → {g.ate}
                    </td>
                    <td className="numeric py-2 pr-3 text-right">{g.trechos}</td>
                    <td className="numeric py-2 pr-3 text-right">
                      {fmtMedida(g.extensao_m)}
                    </td>
                    <td className="py-2 pr-3">
                      <Situacao ok={g.ok} problemas={g.problemas} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
