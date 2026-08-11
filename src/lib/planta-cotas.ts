/**
 * Plantas em CAD (arquivos "Model" exportados em PDF) costumam trazer apenas
 * números soltos: as cotas de cada lote e a área ("200,00m2"), sem o rótulo
 * "Quadra X / Lote Y" junto do desenho. Nesses casos o pareamento por rótulo
 * é impossível, mas a conferência ainda é viável: cada bloco cotado da planta
 * é casado com o lote do memorial de mesma área e as cotas representadas são
 * confrontadas com as distâncias descritas.
 */
import type {
  ComparisonResult,
  Finding,
  ParcelInput,
  Tolerances,
} from "./comparison-engine";

export type BlocoCotado = {
  /** Área cotada na planta, em m². */
  area_m2: number;
  /** Cotas (distâncias) representadas em torno da área. */
  cotas: number[];
  /** Número do lote quando aparece isolado junto ao bloco. */
  loteNum: number | null;
};

const numero = (bruto: string): number =>
  Number(bruto.replace(/\./g, "").replace(",", "."));

/** Extrai blocos cotados (área + cotas próximas) do texto bruto da planta. */
export function extrairBlocosCotados(texto: string): BlocoCotado[] {
  const tokens = texto.split(/\s+/).filter(Boolean);
  const reAreaSufixo = /m²|m2$/i;
  const limpar = (t: string) => t.replace(/[()]/g, "");

  /** Índices dos tokens que declaram uma área ("200,00m2" ou "543,81 m²"). */
  const ancoras: { i: number; area: number }[] = [];
  tokens.forEach((bruto, i) => {
    const token = limpar(bruto);
    const proximo = limpar(tokens[i + 1] ?? "");
    const sufixoNoToken = reAreaSufixo.test(token);
    const sufixoSeparado = /^(m²|m2)$/i.test(proximo);
    if (!sufixoNoToken && !sufixoSeparado) return;
    const so = token.replace(/(m²|m2)$/i, "").replace(/[:;]$/, "");
    if (!/^\d[\d.]*,\d+$/.test(so) && !/^\d+$/.test(so)) return;
    const area = numero(so);
    if (!Number.isFinite(area) || area <= 0) return;
    ancoras.push({ i, area });
  });

  return ancoras.map((ancora, idx) => {
    const inicio = idx === 0 ? 0 : ancoras[idx - 1]!.i + 1;
    const fimVizinho = idx === ancoras.length - 1 ? tokens.length : ancoras[idx + 1]!.i;
    const janela = [
      ...tokens.slice(Math.max(inicio, ancora.i - 10), ancora.i),
      ...tokens.slice(ancora.i + 1, Math.min(ancora.i + 5, fimVizinho)),
    ];

    const cotas: number[] = [];
    let loteNum: number | null = null;
    janela.forEach((t) => {
      const limpo = t.replace(/[():;]/g, "");
      if (/m²|m2/i.test(limpo)) return;
      if (/^\d{1,3},\d{1,2}$/.test(limpo)) {
        const v = numero(limpo);
        if (v >= 0.3 && v <= 400) cotas.push(v);
        return;
      }
      if (loteNum === null && /^\d{1,3}$/.test(limpo)) {
        const v = Number(limpo);
        if (v >= 1 && v <= 400) loteNum = v;
      }
    });

    return { area_m2: ancora.area, cotas, loteNum };
  });
}


const fmt = (v: number, casas = 2) =>
  v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/**
 * Confere um lote do memorial contra um bloco cotado da planta.
 * Ausência de cota na planta nunca gera divergência; cota existente que não
 * encontra correspondência no memorial gera erro crítico.
 */
export function compararLoteComBloco(
  memorial: ParcelInput,
  bloco: BlocoCotado,
  tol: Tolerances,
  labels: { a: string; b: string },
): ComparisonResult {
  const findings: Finding[] = [];
  const tolDist = Math.max(tol.distanceM, 0.011);
  const distanciasMemorial = memorial.segments
    .map((s) => s.distance_m)
    .filter((d): d is number => d !== null && d > 0);

  findings.push({
    severity: "informative",
    code: "MODO_COTAS_AVULSAS",
    title: "Conferência por cotas da planta (planta sem rótulo de lote)",
    description:
      "A planta não identifica os lotes por rótulo legível; o lote foi casado com o memorial pela área cotada e cada cota representada no desenho foi confrontada com as medidas descritas. Cotas ausentes na planta não são tratadas como divergência.",
    evidence: { area_planta: bloco.area_m2, cotas_planta: bloco.cotas, labels },
  });

  if (memorial.area_m2 !== null) {
    const diff = Math.abs(bloco.area_m2 - memorial.area_m2);
    const pct = (diff / (Math.max(bloco.area_m2, memorial.area_m2) || 1)) * 100;
    if (pct > tol.areaPct) {
      findings.push({
        severity: "critical",
        code: "AREA_DIVERGENTE",
        title: "Área da planta diverge do memorial",
        description: `Área no memorial: ${fmt(memorial.area_m2)} m²; na planta: ${fmt(bloco.area_m2)} m². Diferença de ${fmt(diff)} m² (${fmt(pct, 3)}%).`,
        evidence: { memorial: memorial.area_m2, planta: bloco.area_m2, diff, pct },
      });
    }
  }

  const naoConferidas: number[] = [];
  const disponiveis = [...distanciasMemorial];
  bloco.cotas.forEach((cota) => {
    const idx = disponiveis.findIndex((d) => Math.abs(d - cota) <= tolDist);
    if (idx === -1) naoConferidas.push(cota);
    else disponiveis.splice(idx, 1);
  });

  if (distanciasMemorial.length === 0) {
    findings.push({
      severity: "inconclusive",
      code: "MEMORIAL_SEM_DISTANCIAS",
      title: "Memorial sem distâncias extraídas",
      description:
        "Não foi possível confrontar as cotas da planta porque o memorial deste lote não trouxe distâncias legíveis.",
      evidence: { cotas_planta: bloco.cotas },
    });
  } else if (naoConferidas.length > 0) {
    findings.push({
      severity: "critical",
      code: "COTA_SEM_CORRESPONDENCIA",
      title: "Cota da planta sem correspondência no memorial",
      description: `Cota(s) representada(s) na planta e não encontrada(s) no memorial: ${naoConferidas
        .map((c) => `${fmt(c)} m`)
        .join(", ")}. Tolerância aplicada: ${fmt(tolDist, 3)} m.`,
      evidence: {
        cotas_nao_conferidas: naoConferidas,
        distancias_memorial: distanciasMemorial,
      },
    });
  }

  const critico = findings.some((f) => f.severity === "critical");
  const alerta = findings.some((f) => f.severity === "inconclusive");

  return {
    classification: critico ? "incompatible" : alerta ? "inconclusive" : "compatible",
    summary: critico
      ? `Divergência entre as cotas da planta e o memorial (${naoConferidas.length} cota(s)).`
      : alerta
        ? "Conferência inconclusiva: faltam medidas no memorial."
        : `Todas as ${bloco.cotas.length} cota(s) representadas na planta conferem com o memorial.`,
    metrics: {
      modo: "cotas_avulsas",
      area_planta: bloco.area_m2,
      cotas_planta: bloco.cotas.length,
      cotas_nao_conferidas: naoConferidas.length,
    },
    findings,
  };
}

/** Casa cada lote do memorial com o bloco cotado de mesma área. */
export function parearPorArea(
  memoriais: { id: string; label: string | null; parcel: ParcelInput }[],
  blocos: BlocoCotado[],
  areaPct: number,
): { memorial: (typeof memoriais)[number]; bloco: BlocoCotado }[] {
  const restantes = [...blocos];
  const pares: { memorial: (typeof memoriais)[number]; bloco: BlocoCotado }[] = [];
  const tolPct = Math.max(areaPct, 0.05);

  memoriais.forEach((m) => {
    const area = m.parcel.area_m2;
    if (area === null || area <= 0) return;
    let melhor = -1;
    let melhorDiff = Number.POSITIVE_INFINITY;
    restantes.forEach((b, i) => {
      const pct = (Math.abs(b.area_m2 - area) / Math.max(b.area_m2, area)) * 100;
      if (pct <= tolPct && pct < melhorDiff) {
        melhorDiff = pct;
        melhor = i;
      }
    });
    if (melhor >= 0) {
      pares.push({ memorial: m, bloco: restantes[melhor]! });
      restantes.splice(melhor, 1);
    }
  });

  return pares;
}
