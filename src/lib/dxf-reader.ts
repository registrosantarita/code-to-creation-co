/**
 * Leitor de DXF ASCII (pares código/valor). Extrai apenas o que interessa à
 * conferência registral: polilinhas (perímetros), linhas soltas e textos
 * (rótulos de confrontantes, ruas, lotes e quadras).
 */

import type { CadDrawing, CadPoint, CadPolyline, CadText } from "./cad-entities";
import { dedupeRing, linesToRings } from "./cad-entities";

type Pair = { code: number; value: string };

function readPairs(raw: string): Pair[] {
  const linhas = raw.split(/\r\n|\r|\n/);
  const pares: Pair[] = [];
  for (let i = 0; i + 1 < linhas.length; i += 2) {
    const code = Number(linhas[i]!.trim());
    if (!Number.isFinite(code)) continue;
    pares.push({ code, value: linhas[i + 1] ?? "" });
  }
  return pares;
}

const num = (v: string | undefined): number => {
  const n = Number((v ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

/** Limpa códigos de formatação do MTEXT ( \P, \fArial|..; , chaves ). */
export function limparMText(texto: string): string {
  return texto
    .replace(/\\P/g, " ")
    .replace(/\\[A-Za-z][^;\\]*;/g, "")
    .replace(/[{}]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isDxfText(raw: string): boolean {
  const head = raw.slice(0, 4000).toUpperCase();
  return head.includes("SECTION") && (head.includes("HEADER") || head.includes("ENTITIES"));
}

export function parseDxf(raw: string): CadDrawing {
  const pares = readPairs(raw);
  const polylines: CadPolyline[] = [];
  const texts: CadText[] = [];
  const lines: { layer: string; a: CadPoint; b: CadPoint }[] = [];

  let i = 0;
  // posiciona na seção ENTITIES quando existir
  const inicio = pares.findIndex(
    (p, idx) =>
      p.code === 2 && p.value.trim().toUpperCase() === "ENTITIES" && idx > 0,
  );
  if (inicio >= 0) i = inicio + 1;

  const lerEntidade = (): { tipo: string; campos: Pair[] } | null => {
    while (i < pares.length && pares[i]!.code !== 0) i++;
    if (i >= pares.length) return null;
    const tipo = pares[i]!.value.trim().toUpperCase();
    i++;
    const campos: Pair[] = [];
    while (i < pares.length && pares[i]!.code !== 0) {
      campos.push(pares[i]!);
      i++;
    }
    return { tipo, campos };
  };

  const layerDe = (campos: Pair[]) =>
    campos.find((c) => c.code === 8)?.value.trim() ?? "0";

  let entidade = lerEntidade();
  while (entidade) {
    const { tipo, campos } = entidade;

    if (tipo === "LWPOLYLINE") {
      const flag = num(campos.find((c) => c.code === 70)?.value);
      const elev = num(campos.find((c) => c.code === 38)?.value);
      const pts: CadPoint[] = [];
      for (const campo of campos) {
        if (campo.code === 10) pts.push({ x: num(campo.value), y: 0, z: elev });
        else if (campo.code === 20 && pts.length > 0) pts[pts.length - 1]!.y = num(campo.value);
      }
      if (pts.length >= 2) {
        polylines.push({
          layer: layerDe(campos),
          closed: (flag & 1) === 1,
          points: dedupeRing(pts),
        });
      }
    } else if (tipo === "POLYLINE") {
      const flag = num(campos.find((c) => c.code === 70)?.value);
      const layer = layerDe(campos);
      const pts: CadPoint[] = [];
      let seguinte = lerEntidade();
      while (seguinte && seguinte.tipo === "VERTEX") {
        pts.push({
          x: num(seguinte.campos.find((c) => c.code === 10)?.value),
          y: num(seguinte.campos.find((c) => c.code === 20)?.value),
          z: num(seguinte.campos.find((c) => c.code === 30)?.value),
        });
        seguinte = lerEntidade();
      }
      if (pts.length >= 2) {
        polylines.push({ layer, closed: (flag & 1) === 1, points: dedupeRing(pts) });
      }
      entidade = seguinte && seguinte.tipo !== "SEQEND" ? seguinte : lerEntidade();
      continue;
    } else if (tipo === "LINE") {
      lines.push({
        layer: layerDe(campos),
        a: {
          x: num(campos.find((c) => c.code === 10)?.value),
          y: num(campos.find((c) => c.code === 20)?.value),
          z: num(campos.find((c) => c.code === 30)?.value),
        },
        b: {
          x: num(campos.find((c) => c.code === 11)?.value),
          y: num(campos.find((c) => c.code === 21)?.value),
          z: num(campos.find((c) => c.code === 31)?.value),
        },
      });
    } else if (tipo === "TEXT" || tipo === "MTEXT" || tipo === "ATTRIB") {
      const partes = campos
        .filter((c) => c.code === 3 || c.code === 1)
        .map((c) => c.value)
        .join("");
      const texto = limparMText(partes);
      if (texto) {
        texts.push({
          layer: layerDe(campos),
          text: texto,
          x: num(campos.find((c) => c.code === 10)?.value),
          y: num(campos.find((c) => c.code === 20)?.value),
        });
      }
    }

    entidade = lerEntidade();
  }

  const fechadas = polylines.filter((p) => p.closed && p.points.length >= 3);
  if (fechadas.length === 0 && lines.length >= 3) {
    polylines.push(...linesToRings(lines));
  }

  return { polylines, texts };
}
