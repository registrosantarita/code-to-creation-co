import { Check, X } from "lucide-react";
import { fmtNum } from "@/lib/labels";
import type { TrechoConferido } from "@/lib/comparison-engine";

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

/** Conferência trecho a trecho: vértice inicial → final e conformidade. */
export function TrechosConferidos({ trechos, extensaoM, labelA, labelB }: Props) {
  if (trechos.length === 0) return null;

  const conformes = trechos.filter((t) => t.ok).length;
  const primeiro = trechos[0]!;
  const ultimo = trechos[trechos.length - 1]!;
  const inicio = primeiro.de_a ?? `seg. ${primeiro.seq_a}`;
  const fim = ultimo.ate_a ?? `seg. ${ultimo.seq_a}`;

  return (
    <section className="panel mt-8 p-6">
      <h2 className="text-lg">Conferência trecho a trecho</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Trecho total conferido: <span className="numeric">{inicio}</span> →{" "}
        <span className="numeric">{fim}</span> — {trechos.length} trecho(s),{" "}
        <span className="numeric">
          {fmtNum(
            extensaoM ??
              trechos.reduce((acc, t) => acc + (t.distancia_a ?? 0), 0),
            3,
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
              <th className="eyebrow py-2 pr-3 text-right">Azimute (°)</th>
              <th className="eyebrow py-2 pr-3 text-center">Situação</th>
            </tr>
          </thead>
          <tbody>
            {trechos.map((t) => (
              <tr key={`${t.seq_a}-${t.seq_b}`} className="border-b border-border/60 align-top">
                <td className="numeric py-2 pr-3 text-muted-foreground">{t.seq_a}</td>
                <td className="numeric py-2 pr-3">
                  {t.de_a ?? "?"} → {t.ate_a ?? "?"}
                </td>
                <td className="numeric py-2 pr-3 text-muted-foreground">
                  {t.de_b ?? "?"} → {t.ate_b ?? "?"}
                </td>
                <td className="numeric py-2 pr-3 text-right">
                  {fmtNum(t.distancia_a, 3)} / {fmtNum(t.distancia_b, 3)}
                </td>
                <td className="numeric py-2 pr-3 text-right">
                  {fmtNum(t.azimute_a, 4)} / {fmtNum(t.azimute_b, 4)}
                </td>
                <td className="py-2 pr-3">
                  <div className="flex flex-col items-center gap-1">
                    {t.ok ? (
                      <Check
                        className="h-5 w-5 text-success"
                        aria-label="Trecho correto"
                      />

                    ) : (
                      <X
                        className="h-5 w-5 text-destructive"
                        aria-label="Trecho incorreto"
                      />
                    )}
                    {t.problemas.length > 0 && (
                      <span className="max-w-[220px] text-center text-[11px] leading-snug text-muted-foreground">
                        {t.problemas.join("; ")}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
