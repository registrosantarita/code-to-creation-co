/**
 * Pareamento de figuras (lote / quadra / área pública) entre dois documentos.
 *
 * O memorial e a planta descrevem as MESMAS figuras. Para conferir "lote 03 da
 * quadra A" do memorial contra o mesmo lote da planta, cada polígono extraído
 * recebe uma chave normalizada a partir do seu rótulo.
 */

function semAcento(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Chave canônica do rótulo: "Q:A|L:3", "AREA:INSTITUCIONAL" etc. */
export function chaveLote(label: string | null | undefined): string | null {
  if (!label) return null;
  const t = semAcento(label).toUpperCase().replace(/\s+/g, " ").trim();

  const quadra = /QUADRA\s*[“"']?\s*([A-Z0-9]{1,3})\b/.exec(t);
  const lote = /\bLOTES?\s*[.:ºN°]*\s*0*(\d{1,4})\s*([A-Z]?)\b/.exec(t);

  if (lote) {
    const sufixo = lote[2] ? lote[2] : "";
    return `${quadra ? `Q:${quadra[1]}|` : ""}L:${Number(lote[1])}${sufixo}`;
  }

  const areaPublica =
    /\b(AREA\s+(?:INSTITUCIONAL|VERDE|DE\s+LAZER|DE\s+PRESERVACAO|PUBLICA|REMANESCENTE)|SISTEMA\s+DE\s+LAZER)\b/.exec(
      t,
    );
  if (areaPublica) {
    const nome = areaPublica[1]!.replace(/\s+/g, "_");
    return `${quadra ? `Q:${quadra[1]}|` : ""}AREA:${nome}`;
  }

  if (quadra) return `Q:${quadra[1]}`;
  return null;
}

export type ParFigura<T> = { chave: string; a: T; b: T };

export type ResultadoPareamento<T> = {
  pares: ParFigura<T>[];
  soNoA: T[];
  soNoB: T[];
  semChaveA: number;
  semChaveB: number;
};

/** Casa as figuras dos dois documentos pelo rótulo (quadra + lote). */
export function parearFiguras<T extends { label: string | null }>(
  listaA: T[],
  listaB: T[],
): ResultadoPareamento<T> {
  const indexar = (lista: T[]) => {
    const mapa = new Map<string, T>();
    let semChave = 0;
    lista.forEach((item) => {
      const chave = chaveLote(item.label);
      if (!chave) {
        semChave += 1;
        return;
      }
      if (!mapa.has(chave)) mapa.set(chave, item);
    });
    return { mapa, semChave };
  };

  const a = indexar(listaA);
  const b = indexar(listaB);
  const pares: ParFigura<T>[] = [];

  a.mapa.forEach((itemA, chave) => {
    const itemB = b.mapa.get(chave);
    if (itemB) pares.push({ chave, a: itemA, b: itemB });
  });

  return {
    pares,
    soNoA: [...a.mapa.entries()].filter(([k]) => !b.mapa.has(k)).map(([, v]) => v),
    soNoB: [...b.mapa.entries()].filter(([k]) => !a.mapa.has(k)).map(([, v]) => v),
    semChaveA: a.semChave,
    semChaveB: b.semChave,
  };
}
