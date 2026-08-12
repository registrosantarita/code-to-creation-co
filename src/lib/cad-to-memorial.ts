/**
 * Converte um desenho CAD (DWG/DXF) em texto de memorial descritivo
 * tabular — o mesmo formato já interpretado pelo motor do GeoConfronto.
 * Toda a conversão é geométrica e determinística: nenhum crédito de IA.
 */

import type { CadDrawing, CadPoint, CadPolyline } from "./cad-entities";
import { shoelaceArea } from "./cad-entities";

const fmt = (v: number, casas: number) =>
  v.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

/** Azimute plano (a partir do Norte da grade, sentido horário). */
function azimutePlano(a: CadPoint, b: CadPoint): number {
  const az = (Math.atan2(b.x - a.x, b.y - a.y) * 180) / Math.PI;
  return (az + 360) % 360;
}

function distanciaPlana(a: CadPoint, b: CadPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** Graus decimais em GMS literal (sem arredondar para além do centésimo). */
function grausParaDms(valor: number): string {
  const g = Math.floor(valor);
  const restoMin = (valor - g) * 60;
  const m = Math.floor(restoMin);
  const s = (restoMin - m) * 60;
  const seg = fmt(s, 2);
  return `${g}°${String(m).padStart(2, "0")}'${seg.length < 5 ? `0${seg}` : seg}"`;
}

/** Coordenadas em faixa UTM plausível (E 100k–999k, N 1M–10M). */
function pareceUtm(pontos: CadPoint[]): boolean {
  return pontos.every(
    (p) =>
      Math.abs(p.x) >= 100_000 &&
      Math.abs(p.x) <= 999_999 &&
      Math.abs(p.y) >= 1_000_000 &&
      Math.abs(p.y) <= 10_500_000,
  );
}

const RUIDO_RE =
  /^(?:[\d.,°'"\-\/\s]+|esc(?:ala)?|folha|prancha|data|desenho|projeto|legenda|planta|norte|n|s|e|w|o)$/i;

/** Rótulo textual mais próximo do meio do segmento (confrontante/rua). */
function confrontanteDoSegmento(
  drawing: CadDrawing,
  a: CadPoint,
  b: CadPoint,
  raioMax: number,
): string | null {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  let melhor: { texto: string; d: number } | null = null;
  for (const t of drawing.texts) {
    const limpo = t.text.trim();
    if (limpo.length < 3 || RUIDO_RE.test(limpo)) continue;
    const d = Math.hypot(t.x - mx, t.y - my);
    if (d > raioMax) continue;
    if (!melhor || d < melhor.d) melhor = { texto: limpo, d };
  }
  return melhor ? melhor.texto.slice(0, 140) : null;
}

/** Rótulo do polígono: texto mais próximo do centroide (lote, quadra, gleba). */
function rotuloDoPoligono(drawing: CadDrawing, ring: CadPoint[]): string | null {
  const cx = ring.reduce((s, p) => s + p.x, 0) / ring.length;
  const cy = ring.reduce((s, p) => s + p.y, 0) / ring.length;
  let melhor: { texto: string; d: number } | null = null;
  for (const t of drawing.texts) {
    const limpo = t.text.trim();
    if (limpo.length < 2) continue;
    if (!/lote|quadra|gleba|[áa]rea|parcela|pol[íi]gono|matr[íi]cula/i.test(limpo)) continue;
    const d = Math.hypot(t.x - cx, t.y - cy);
    if (!melhor || d < melhor.d) melhor = { texto: limpo, d };
  }
  return melhor ? melhor.texto.slice(0, 120) : null;
}

function blocoPoligono(
  drawing: CadDrawing,
  poly: CadPolyline,
  indice: number,
  utm: boolean,
): string | null {
  const ring = poly.points;
  if (ring.length < 3) return null;

  const perimetro = ring.reduce(
    (s, p, i) => s + distanciaPlana(p, ring[(i + 1) % ring.length]!),
    0,
  );
  const area = shoelaceArea(ring);
  if (area < 1) return null;

  const rotulo = rotuloDoPoligono(drawing, ring) ?? `Polígono ${indice}`;
  const raioMax = Math.max(20, Math.sqrt(area) / 3);

  const cabecalho = utm
    ? "VERTICE | VANTE | NORTE (m) | ESTE (m) | ALTITUDE (m) | AZIMUTE | DISTANCIA (m) | CONFRONTANTE"
    : "VERTICE | VANTE | ALTITUDE (m) | AZIMUTE | DISTANCIA (m) | CONFRONTANTE";

  const linhas = ring.map((p, i) => {
    const q = ring[(i + 1) % ring.length]!;
    const de = `V${i + 1}`;
    const para = `V${((i + 1) % ring.length) + 1}`;
    const az = grausParaDms(azimutePlano(p, q));
    const dist = fmt(distanciaPlana(p, q), 3);
    const alt = p.z ? fmt(p.z, 2) : "";
    const conf = confrontanteDoSegmento(drawing, p, q, raioMax) ?? "";
    return utm
      ? `${de} | ${para} | ${fmt(p.y, 3)} | ${fmt(p.x, 3)} | ${alt} | ${az} | ${dist} | ${conf}`
      : `${de} | ${para} | ${alt} | ${az} | ${dist} | ${conf}`;
  });

  return [
    `${/^(lote|quadra|gleba|[áa]rea|parcela|pol[íi]gono)/i.test(rotulo) ? rotulo : `Polígono ${indice} — ${rotulo}`} (camada CAD: ${poly.layer})`,
    "Descrição do perímetro extraída da geometria vetorial do arquivo CAD.",
    `Área: ${fmt(area, 2)} m²`,
    `Perímetro: ${fmt(perimetro, 2)} m`,
    cabecalho,
    ...linhas,
  ].join("\n");
}

export type CadConversao = {
  text: string;
  poligonos: number;
  georreferenciado: boolean;
  aviso?: string;
};

/**
 * Escolhe os polígonos relevantes do desenho e devolve o texto tabular.
 * Descarta ruído (molduras, carimbos e figuras minúsculas).
 */
export function cadParaMemorial(drawing: CadDrawing, fileName: string): CadConversao {
  const fechados = drawing.polylines
    .filter((p) => p.closed && p.points.length >= 3)
    .map((p) => ({ p, area: shoelaceArea(p.points) }))
    .filter((x) => x.area >= 1)
    .sort((a, b) => b.area - a.area);

  if (fechados.length === 0) {
    return {
      text: "",
      poligonos: 0,
      georreferenciado: false,
      aviso:
        "Nenhuma polilinha fechada foi encontrada no arquivo CAD. Verifique se o perímetro do imóvel está desenhado como polilinha fechada (LWPOLYLINE/POLYLINE) no espaço do modelo.",
    };
  }

  const maior = fechados[0]!.area;
  // mantém a figura principal e as demais com pelo menos 0,5% da maior área
  const relevantes = fechados.filter((x) => x.area >= maior * 0.005).slice(0, 60);
  const utm = relevantes.every((x) => pareceUtm(x.p.points));

  const blocos = relevantes
    .map((x, i) => blocoPoligono(drawing, x.p, i + 1, utm))
    .filter((b): b is string => Boolean(b));

  const cabecalho = [
    `Arquivo CAD: ${fileName}`,
    utm
      ? "Coordenadas planas UTM lidas diretamente do desenho (unidade do desenho tratada como metro)."
      : "Desenho sem coordenadas UTM: azimutes e distâncias foram calculados no sistema local do arquivo (unidade tratada como metro).",
    `Figuras fechadas consideradas: ${blocos.length}.`,
    "",
  ].join("\n");

  return {
    text: cabecalho + blocos.join("\n\n"),
    poligonos: blocos.length,
    georreferenciado: utm,
    ...(utm
      ? {}
      : {
          aviso:
            "O desenho não traz coordenadas UTM: a conferência usará apenas ângulos, distâncias e área. Se o arquivo for georreferenciado, verifique se está no espaço do modelo, em coordenadas reais.",
        }),
  };
}
