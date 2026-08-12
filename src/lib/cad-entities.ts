/**
 * Estrutura intermediária comum a DWG e DXF: polilinhas (perímetros) e
 * textos (rótulos de confrontantes, ruas, lotes) com posição no desenho.
 */

export type CadPoint = { x: number; y: number; z: number };

export type CadPolyline = {
  layer: string;
  closed: boolean;
  points: CadPoint[];
};

export type CadText = {
  layer: string;
  text: string;
  x: number;
  y: number;
};

export type CadDrawing = {
  polylines: CadPolyline[];
  texts: CadText[];
};

/** Área planimétrica (fórmula de Gauss) em unidades do desenho ao quadrado. */
export function shoelaceArea(points: CadPoint[]): number {
  if (points.length < 3) return 0;
  let acc = 0;
  for (let i = 0; i < points.length; i++) {
    const a = points[i]!;
    const b = points[(i + 1) % points.length]!;
    acc += a.x * b.y - b.x * a.y;
  }
  return Math.abs(acc / 2);
}

/** Remove o vértice final repetido (polígono já fechado no desenho). */
export function dedupeRing(points: CadPoint[]): CadPoint[] {
  const ring = points.filter(
    (p, i, arr) =>
      i === 0 ||
      Math.abs(p.x - arr[i - 1]!.x) > 1e-6 ||
      Math.abs(p.y - arr[i - 1]!.y) > 1e-6,
  );
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (
    ring.length > 2 &&
    first &&
    last &&
    Math.abs(first.x - last.x) < 1e-6 &&
    Math.abs(first.y - last.y) < 1e-6
  ) {
    ring.pop();
  }
  return ring;
}

/** Junta segmentos LINE soltos em anéis fechados (plantas desenhadas a linhas). */
export function linesToRings(
  segments: { layer: string; a: CadPoint; b: CadPoint }[],
  tolerance = 0.02,
): CadPolyline[] {
  const usados = new Set<number>();
  const rings: CadPolyline[] = [];
  const perto = (p: CadPoint, q: CadPoint) =>
    Math.abs(p.x - q.x) <= tolerance && Math.abs(p.y - q.y) <= tolerance;

  for (let i = 0; i < segments.length; i++) {
    if (usados.has(i)) continue;
    const inicial = segments[i]!;
    usados.add(i);
    const pontos: CadPoint[] = [inicial.a, inicial.b];
    let estendeu = true;
    while (estendeu) {
      estendeu = false;
      const fim = pontos[pontos.length - 1]!;
      for (let j = 0; j < segments.length; j++) {
        if (usados.has(j)) continue;
        const s = segments[j]!;
        if (perto(fim, s.a)) {
          pontos.push(s.b);
          usados.add(j);
          estendeu = true;
          break;
        }
        if (perto(fim, s.b)) {
          pontos.push(s.a);
          usados.add(j);
          estendeu = true;
          break;
        }
      }
    }
    const fechado = pontos.length > 3 && perto(pontos[0]!, pontos[pontos.length - 1]!);
    if (fechado) {
      rings.push({ layer: inicial.layer, closed: true, points: dedupeRing(pontos) });
    }
  }
  return rings;
}
