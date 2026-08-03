/**
 * Motor de comparação técnica entre memoriais / divisas.
 * Cada achado é rastreável até a evidência de origem.
 */
import { normalizeName } from "./memorial-parser";

export type Severity = "critical" | "moderate" | "informative" | "inconclusive";
export type Classification =
  | "compatible"
  | "compatible_with_remarks"
  | "incompatible"
  | "inconclusive";

export type Tolerances = {
  areaPct: number;
  perimeterPct: number;
  distanceM: number;
  azimuthDeg: number;
};

export const DEFAULT_TOLERANCES: Tolerances = {
  areaPct: 0.5,
  perimeterPct: 1,
  distanceM: 0.05,
  azimuthDeg: 0.0834, // ~5'
};

export type SegmentInput = {
  seq: number;
  from_vertex: string | null;
  to_vertex: string | null;
  azimuth_deg: number | null;
  distance_m: number | null;
  confrontante: string | null;
};

export type ParcelInput = {
  label: string | null;
  area_m2: number | null;
  declared_perimeter_m: number | null;
  computed_perimeter_m: number | null;
  vertex_count: number;
  confrontantes: string[];
  segments: SegmentInput[];
};

export type Finding = {
  severity: Severity;
  code: string;
  title: string;
  description: string;
  evidence: Record<string, unknown>;
};

export type ComparisonResult = {
  classification: Classification;
  summary: string;
  metrics: Record<string, unknown>;
  findings: Finding[];
};

const fmt = (n: number, d = 2) =>
  n.toLocaleString("pt-BR", { minimumFractionDigits: d, maximumFractionDigits: d });

function angleDiff(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360 + 540) % 360 - 180);
  return 180 - d;
}

export function compareParcels(
  a: ParcelInput,
  b: ParcelInput,
  tol: Tolerances = DEFAULT_TOLERANCES,
  labels: { a: string; b: string } = { a: "Documento A", b: "Documento B" },
): ComparisonResult {
  const findings: Finding[] = [];
  const metrics: Record<string, unknown> = {};

  // --- Área ---
  if (a.area_m2 !== null && b.area_m2 !== null) {
    const diff = Math.abs(a.area_m2 - b.area_m2);
    const base = Math.max(a.area_m2, b.area_m2) || 1;
    const pct = (diff / base) * 100;
    metrics["area_diff_m2"] = diff;
    metrics["area_diff_pct"] = pct;
    if (pct > tol.areaPct) {
      findings.push({
        severity: pct > tol.areaPct * 4 ? "critical" : "moderate",
        code: "AREA_DIVERGENTE",
        title: "Divergência de área",
        description: `A área de ${labels.a} (${fmt(a.area_m2)} m²) diverge da de ${labels.b} (${fmt(b.area_m2)} m²) em ${fmt(diff)} m² (${fmt(pct, 3)}%), acima da tolerância de ${tol.areaPct}%.`,
        evidence: { a: a.area_m2, b: b.area_m2, diff, pct, tolerance: tol.areaPct },
      });
    } else {
      findings.push({
        severity: "informative",
        code: "AREA_COMPATIVEL",
        title: "Área compatível",
        description: `Diferença de área de ${fmt(diff)} m² (${fmt(pct, 3)}%), dentro da tolerância de ${tol.areaPct}%.`,
        evidence: { a: a.area_m2, b: b.area_m2, diff, pct },
      });
    }
  } else {
    findings.push({
      severity: "inconclusive",
      code: "AREA_AUSENTE",
      title: "Área não extraída",
      description: "A área não pôde ser identificada em ao menos um dos documentos; a comparação de área ficou inconclusiva.",
      evidence: { a: a.area_m2, b: b.area_m2 },
    });
  }

  // --- Perímetro declarado x calculado (consistência interna) ---
  [
    { p: a, name: labels.a },
    { p: b, name: labels.b },
  ].forEach(({ p, name }) => {
    if (p.declared_perimeter_m !== null && p.computed_perimeter_m !== null) {
      const diff = Math.abs(p.declared_perimeter_m - p.computed_perimeter_m);
      const pct = (diff / (p.declared_perimeter_m || 1)) * 100;
      if (pct > tol.perimeterPct) {
        findings.push({
          severity: "moderate",
          code: "PERIMETRO_INCONSISTENTE",
          title: `Perímetro inconsistente em ${name}`,
          description: `O perímetro declarado (${fmt(p.declared_perimeter_m)} m) diverge da soma das distâncias descritas (${fmt(p.computed_perimeter_m)} m) em ${fmt(diff)} m (${fmt(pct, 3)}%).`,
          evidence: {
            declarado: p.declared_perimeter_m,
            calculado: p.computed_perimeter_m,
            diff,
            pct,
          },
        });
      }
    }
  });

  // --- Perímetro entre documentos ---
  const pa = a.declared_perimeter_m ?? a.computed_perimeter_m;
  const pb = b.declared_perimeter_m ?? b.computed_perimeter_m;
  if (pa !== null && pb !== null) {
    const diff = Math.abs(pa - pb);
    const pct = (diff / (Math.max(pa, pb) || 1)) * 100;
    metrics["perimeter_diff_m"] = diff;
    metrics["perimeter_diff_pct"] = pct;
    if (pct > tol.perimeterPct) {
      findings.push({
        severity: "moderate",
        code: "PERIMETRO_DIVERGENTE",
        title: "Divergência de perímetro",
        description: `Perímetro de ${labels.a}: ${fmt(pa)} m; de ${labels.b}: ${fmt(pb)} m. Diferença de ${fmt(diff)} m (${fmt(pct, 3)}%).`,
        evidence: { a: pa, b: pb, diff, pct },
      });
    }
  }

  // --- Quantidade de segmentos / vértices ---
  metrics["segments_a"] = a.segments.length;
  metrics["segments_b"] = b.segments.length;
  if (a.segments.length !== b.segments.length) {
    findings.push({
      severity: "critical",
      code: "SEGMENTOS_QUANTIDADE",
      title: "Quantidade de segmentos divergente",
      description: `${labels.a} descreve ${a.segments.length} segmento(s) e ${labels.b} descreve ${b.segments.length}. A geometria descrita não é equivalente.`,
      evidence: { a: a.segments.length, b: b.segments.length },
    });
  }

  // --- Segmento a segmento ---
  const n = Math.min(a.segments.length, b.segments.length);
  let divergentSegments = 0;
  for (let i = 0; i < n; i += 1) {
    const sa = a.segments[i]!;
    const sb = b.segments[i]!;
    const problems: string[] = [];

    if (sa.distance_m !== null && sb.distance_m !== null) {
      const d = Math.abs(sa.distance_m - sb.distance_m);
      if (d > tol.distanceM) {
        problems.push(
          `distância ${fmt(sa.distance_m, 3)} m x ${fmt(sb.distance_m, 3)} m (Δ ${fmt(d, 3)} m)`,
        );
      }
    }
    if (sa.azimuth_deg !== null && sb.azimuth_deg !== null) {
      const d = angleDiff(sa.azimuth_deg, sb.azimuth_deg);
      if (d > tol.azimuthDeg) {
        problems.push(
          `azimute ${fmt(sa.azimuth_deg, 4)}° x ${fmt(sb.azimuth_deg, 4)}° (Δ ${fmt(d, 4)}°)`,
        );
      }
    }
    if (sa.confrontante && sb.confrontante) {
      if (normalizeName(sa.confrontante) !== normalizeName(sb.confrontante)) {
        problems.push(`confrontante "${sa.confrontante}" x "${sb.confrontante}"`);
      }
    }

    if (problems.length > 0) {
      divergentSegments += 1;
      findings.push({
        severity: "critical",
        code: "SEGMENTO_DIVERGENTE",
        title: `Segmento ${i + 1} divergente`,
        description: `Trecho ${sa.from_vertex ?? "?"}→${sa.to_vertex ?? "?"}: ${problems.join("; ")}.`,
        evidence: { seq: i + 1, a: sa, b: sb, problems },
      });
    }
  }
  metrics["divergent_segments"] = divergentSegments;
  if (n > 0 && divergentSegments === 0) {
    findings.push({
      severity: "informative",
      code: "SEGMENTOS_COMPATIVEIS",
      title: "Segmentos compatíveis",
      description: `Os ${n} segmentos comparados estão dentro das tolerâncias (${tol.distanceM} m / ${tol.azimuthDeg}°).`,
      evidence: { comparados: n },
    });
  }

  // --- Confrontantes (reciprocidade) ---
  const setA = new Map(a.confrontantes.map((c) => [normalizeName(c), c]));
  const setB = new Map(b.confrontantes.map((c) => [normalizeName(c), c]));
  const onlyA = [...setA].filter(([k]) => !setB.has(k)).map(([, v]) => v);
  const onlyB = [...setB].filter(([k]) => !setA.has(k)).map(([, v]) => v);
  metrics["confrontantes_only_a"] = onlyA;
  metrics["confrontantes_only_b"] = onlyB;
  if (onlyA.length > 0 || onlyB.length > 0) {
    findings.push({
      severity: "moderate",
      code: "CONFRONTANTES_DIVERGENTES",
      title: "Confrontantes divergentes",
      description: [
        onlyA.length ? `Somente em ${labels.a}: ${onlyA.join(", ")}.` : "",
        onlyB.length ? `Somente em ${labels.b}: ${onlyB.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
      evidence: { onlyA, onlyB },
    });
  } else if (setA.size > 0) {
    findings.push({
      severity: "informative",
      code: "CONFRONTANTES_COMPATIVEIS",
      title: "Confrontantes compatíveis",
      description: `Os ${setA.size} confrontantes identificados coincidem tecnicamente entre os documentos.`,
      evidence: { confrontantes: [...setA.values()] },
    });
  }

  // --- Classificação final ---
  const hasCritical = findings.some((f) => f.severity === "critical");
  const hasModerate = findings.some((f) => f.severity === "moderate");
  const onlyInconclusive =
    findings.length > 0 &&
    findings.every((f) => f.severity === "inconclusive") ;
  const noData = a.segments.length === 0 && b.segments.length === 0;

  let classification: Classification;
  if (noData || onlyInconclusive) classification = "inconclusive";
  else if (hasCritical) classification = "incompatible";
  else if (hasModerate) classification = "compatible_with_remarks";
  else classification = "compatible";

  const counts = {
    critical: findings.filter((f) => f.severity === "critical").length,
    moderate: findings.filter((f) => f.severity === "moderate").length,
    informative: findings.filter((f) => f.severity === "informative").length,
    inconclusive: findings.filter((f) => f.severity === "inconclusive").length,
  };
  metrics["counts"] = counts;

  const summaryByClass: Record<Classification, string> = {
    compatible:
      "Os documentos são tecnicamente compatíveis dentro das tolerâncias adotadas. Não foram identificadas divergências relevantes.",
    compatible_with_remarks:
      "Os documentos são compatíveis com ressalvas. Há divergências moderadas que exigem verificação humana antes da qualificação.",
    incompatible:
      "Foram identificadas divergências críticas entre os documentos. A equivalência técnica não se sustenta sem retificação ou esclarecimento.",
    inconclusive:
      "Não foi possível concluir: os dados técnicos extraídos são insuficientes. Revise os documentos ou informe o texto do memorial manualmente.",
  };

  const summary = `${summaryByClass[classification]} Achados: ${counts.critical} crítico(s), ${counts.moderate} moderado(s), ${counts.informative} informativo(s).`;

  return { classification, summary, metrics, findings };
}
