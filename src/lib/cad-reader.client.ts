/**
 * Leitura de arquivos CAD no navegador: DXF (texto) e DWG (WebAssembly
 * libredwg). Roda 100% no cliente, sem consumo de créditos de IA.
 */

import type { CadDrawing, CadPoint } from "./cad-entities";
import { dedupeRing, extremosCoincidem, linesToRings } from "./cad-entities";
import { isDxfText, limparMText, parseDxf } from "./dxf-reader";
import { cadParaMemorial, type CadConversao } from "./cad-to-memorial";

export const CAD_EXTENSIONS = ["dwg", "dxf"];

export function isCadExtension(ext: string | null | undefined): boolean {
  return CAD_EXTENSIONS.includes((ext ?? "").toLowerCase().replace(".", ""));
}

type AnyEntity = Record<string, unknown>;

const ponto = (v: unknown): CadPoint => {
  const p = (v ?? {}) as { x?: number; y?: number; z?: number };
  return { x: Number(p.x ?? 0), y: Number(p.y ?? 0), z: Number(p.z ?? 0) };
};

/** Converte o banco de dados do libredwg no formato interno do app. */
export function databaseParaDrawing(entities: AnyEntity[]): CadDrawing {
  const drawing: CadDrawing = { polylines: [], texts: [] };
  const linhas: { layer: string; a: CadPoint; b: CadPoint }[] = [];

  for (const e of entities) {
    const tipo = String(e["type"] ?? "").toUpperCase();
    const layer = String(e["layer"] ?? "0");
    const flag = Number(e["flag"] ?? 0);

    if (tipo === "LWPOLYLINE" || tipo === "POLYLINE2D" || tipo === "POLYLINE3D") {
      const brutos = (e["vertices"] ?? []) as AnyEntity[];
      const elev = Number(e["elevation"] ?? 0);
      const pts = brutos.map((v) => {
        const p = ponto(v["point"] ?? v);
        return { x: p.x, y: p.y, z: p.z || elev };
      });
      if (pts.length >= 2) {
        drawing.polylines.push({
          layer,
          closed: (flag & 1) === 1 || (flag & 32) === 32 || extremosCoincidem(pts),
          points: dedupeRing(pts),
        });
      }
    } else if (tipo === "LINE") {
      linhas.push({ layer, a: ponto(e["startPoint"]), b: ponto(e["endPoint"]) });
    } else if (tipo === "TEXT" || tipo === "MTEXT" || tipo === "ATTRIB") {
      const texto = limparMText(String(e["text"] ?? ""));
      const pos = ponto(e["startPoint"] ?? e["insertionPoint"]);
      if (texto) drawing.texts.push({ layer, text: texto, x: pos.x, y: pos.y });
    }
  }

  const fechadas = drawing.polylines.filter((p) => p.closed && p.points.length >= 3);
  if (fechadas.length === 0 && linhas.length >= 3) {
    drawing.polylines.push(...linesToRings(linhas));
  }
  return drawing;
}

async function lerDwg(bytes: ArrayBuffer): Promise<CadDrawing> {
  const { LibreDwg, createModule } = await import("@mlightcad/libredwg-web");
  // WebAssembly do libredwg servido estaticamente (baixado só ao abrir um DWG).
  const wasmInstance = await createModule({
    locateFile: () => "/cad/libredwg-web.wasm",
  });
  const libredwg = LibreDwg.createByWasmInstance(wasmInstance);
  const ptr = libredwg.dwg_read_data(bytes, 0);
  if (ptr == null) throw new Error("Não foi possível abrir o arquivo DWG.");
  const db = libredwg.convert(ptr);
  libredwg.dwg_free(ptr);
  return databaseParaDrawing((db.entities ?? []) as unknown as AnyEntity[]);
}

/** Lê DWG/DXF e devolve o memorial tabular equivalente. */
export async function lerArquivoCad(file: File): Promise<CadConversao> {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const bytes = await file.arrayBuffer();

  let drawing: CadDrawing;
  if (ext === "dxf") {
    const texto = new TextDecoder("utf-8").decode(new Uint8Array(bytes));
    if (!isDxfText(texto)) {
      throw new Error(
        "O DXF parece estar em formato binário. Salve-o como DXF ASCII (ou envie o DWG original).",
      );
    }
    drawing = parseDxf(texto);
  } else {
    drawing = await lerDwg(bytes);
  }

  return cadParaMemorial(drawing, file.name);
}
