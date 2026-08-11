import { Check, Minus, X } from "lucide-react";
import { fmtMedida, degToDms, coordToDms, docColor, docLetra } from "@/lib/labels";
import type { TrechoConferido } from "@/lib/comparison-engine";
import { agruparConfrontantes } from "@/lib/confrontantes";
import type { VertexCoordRow } from "@/lib/export-registral";

export function lerTrechos(metrics: Record<string, unknown>): TrechoConferido[] {
  const t = metrics["trechos"];
  return Array.isArray(t) ? (t as TrechoConferido[]) : [];
}

type Props = {
  trechos: TrechoConferido[];
  extensaoM?: number | null;
  labelA?: string;
  labelB?: string;
  /** Coordenadas dos vértices do documento A, indexadas pelo nome em maiúsculas. */
  vertices?: Map<string, VertexCoordRow> | undefined;
  /** Posição do documento paradigma na ordem de upload: 0 → A, 1 → B... */
  indiceA?: number;
  /** Posição do documento comparado na ordem de upload: 1 → B, 2 → C... */
  indiceB?: number;
};

/** Valores empilhados: documento A acima, documento comparado abaixo. */
function Par({
  a,
  b,
  corA,
  corB,
  align = "right",
}: {
  a: string;
  b: string;
  corA: string;
  corB: string;
  align?: "right" | "left";
}) {
  const cls = align === "right" ? "text-right" : "text-left";
  return (
    <div className={`flex flex-col leading-tight ${cls}`}>
      <span className={corA}>{a}</span>
      <span className={corB}>{b}</span>
    </div>
  );
}



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


const vname = (v: string | null | undefined): string =>
  (v ?? "").trim().replace(/[.,;]+$/, "").toUpperCase();

/** Conferência trecho a trecho: vértice inicial → final e conformidade. */
export function TrechosConferidos({
  trechos,
  extensaoM,
  labelA,
  labelB,
  vertices,
  indiceA = 0,
  indiceB = 1,
}: Props) {
  if (trechos.length === 0) return null;
  const corA = docColor(indiceA);
  const corB = docColor(indiceB);
  const letraA = docLetra(indiceA);
  const letraB = docLetra(indiceB);


  const conformes = trechos.filter((t) => t.ok).length;
  const primeiro = trechos[0]!;
  const ultimo = trechos[trechos.length - 1]!;
  const inicio = primeiro.de_a ?? `seg. ${primeiro.seq_a}`;
  const fim = ultimo.ate_a ?? `seg. ${ultimo.seq_a}`;
  const confrontacoes = agruparConfrontantes(trechos);

  const coordDe = (t: TrechoConferido) => vertices?.get(vname(t.de_a));
  // Colunas geodésicas/planas só aparecem quando o documento traz o dado.
  const temGeo = trechos.some((t) => {
    const v = coordDe(t);
    return v?.lat != null || v?.lon != null;
  });
  const temPlana = trechos.some((t) => {
    const v = coordDe(t);
    return v?.north != null || v?.east != null;
  });

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
                <th
                  className="eyebrow py-2 pr-3"
                  title={`Doc. ${letraA}: ${labelA ?? ""} / Doc. ${letraB}: ${labelB ?? ""}`}
                >
                  TRECHO DE
                </th>
                <th
                  className="eyebrow py-2 pr-3"
                  title={`Doc. ${letraA}: ${labelA ?? ""} / Doc. ${letraB}: ${labelB ?? ""}`}
                >
                  TRECHO PARA
                </th>
                {temGeo && (
                  <>
                    <th className={`eyebrow py-2 pr-3 text-right ${corA}`}>LONGITUDE</th>
                    <th className={`eyebrow py-2 pr-3 text-right ${corA}`}>LATITUDE</th>
                  </>
                )}
                {temPlana && (
                  <>
                    <th className={`eyebrow py-2 pr-3 text-right ${corA}`}>COORD. N(Y)</th>
                    <th className={`eyebrow py-2 pr-3 text-right ${corA}`}>COORD. E(X)</th>
                  </>
                )}
                <th className="eyebrow py-2 pr-3 text-right">ALT. (m)</th>
                <th className="eyebrow py-2 pr-3 text-right">ÂNGULO</th>
                <th className="eyebrow py-2 pr-3 text-right">DIST. (m)</th>
                <th className="eyebrow py-2 pr-3 text-center" aria-label="Situação" />
              </tr>
            </thead>
            <tbody>
              {trechos.map((t) => {
                const v = coordDe(t);
                return (
                  <tr
                    key={`${t.seq_a}-${t.seq_b}`}
                    className="border-b border-border/60 align-top"
                  >
                    <td className="numeric py-2 pr-3 text-muted-foreground">{t.seq_a}</td>
                    <td className="numeric py-2 pr-3">
                      <Par
                        a={t.de_a ?? "?"}
                        b={t.de_b ?? "?"}
                        corA={corA}
                        corB={corB}
                        align="left"
                      />
                    </td>
                    <td className="numeric py-2 pr-3">
                      <Par
                        a={t.ate_a ?? "?"}
                        b={t.ate_b ?? "?"}
                        corA={corA}
                        corB={corB}
                        align="left"
                      />
                    </td>
                    {temGeo && (
                      <>
                        <td className={`numeric py-2 pr-3 text-right ${corA}`}>
                          {coordToDms(v?.lon ?? null, "lon")}
                        </td>
                        <td className={`numeric py-2 pr-3 text-right ${corA}`}>
                          {coordToDms(v?.lat ?? null, "lat")}
                        </td>
                      </>
                    )}
                    {temPlana && (
                      <>
                        <td className={`numeric py-2 pr-3 text-right ${corA}`}>
                          {fmtMedida(v?.north ?? null)}
                        </td>
                        <td className={`numeric py-2 pr-3 text-right ${corA}`}>
                          {fmtMedida(v?.east ?? null)}
                        </td>
                      </>
                    )}
                    <td className="numeric py-2 pr-3">
                      <Par
                        a={fmtMedida(t.cota_a)}
                        b={fmtMedida(t.cota_b)}
                        corA={corA}
                        corB={corB}
                      />
                    </td>
                    <td className="numeric py-2 pr-3">
                      <Par
                        a={degToDms(t.azimute_a)}
                        b={degToDms(t.azimute_b)}
                        corA={corA}
                        corB={corB}
                      />
                    </td>
                    <td className="numeric py-2 pr-3">
                      <Par
                        a={fmtMedida(t.distancia_a)}
                        b={fmtMedida(t.distancia_b)}
                        corA={corA}
                        corB={corB}
                      />
                    </td>

                    <td className="py-2 pr-3">
                      <Situacao ok={t.ok} problemas={t.problemas} comparado={t.comparado ?? true} />
                    </td>
                  </tr>
                );
              })}
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
