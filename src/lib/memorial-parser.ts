/**
 * Extração e normalização de memoriais descritivos (pt-BR).
 * Puro, sem dependências — usado no servidor e no cliente.
 */

import { normalizeMemorialText } from "./lexicon";

export type ParsedSegment = {
  seq: number;
  from_vertex: string | null;
  to_vertex: string | null;
  bearing_text: string | null;
  azimuth_deg: number | null;
  distance_m: number | null;
  confrontante: string | null;
  raw_text: string;
};

export type ParsedParcel = {
  label: string | null;
  area_m2: number | null;
  declared_perimeter_m: number | null;
  computed_perimeter_m: number | null;
  vertex_count: number;
  confrontantes: string[];
  segments: ParsedSegment[];
  warnings: string[];
};

/** Converte "1.234,56" ou "1234.56" em número. */
export function parseNumber(raw: string): number | null {
  if (!raw) return null;
  let s = raw.trim().replace(/\s/g, "");
  if (s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if ((s.match(/\./g) ?? []).length > 1) {
    s = s.replace(/\./g, "");
  }
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Graus/minutos/segundos -> graus decimais. */
export function dmsToDegrees(
  deg: number,
  min = 0,
  sec = 0,
): number {
  return deg + min / 60 + sec / 3600;
}

const DMS_RE =
  /(\d{1,3})\s*(?:°|º|graus|g)\s*(?:(\d{1,2})\s*(?:'|′|min|m)\s*(?:(\d{1,2}(?:[.,]\d+)?)\s*(?:"|″|”|seg|s)?)?)?/i;

/** Lê um azimute textual: "123°45'30\"" */
export function parseAzimuthText(text: string): number | null {
  const m = DMS_RE.exec(text);
  if (!m) {
    const dec = /(\d{1,3}(?:[.,]\d+)?)\s*(?:°|º|graus)/i.exec(text);
    return dec ? parseNumber(dec[1]!) : null;
  }
  const d = Number(m[1]);
  const mi = m[2] ? Number(m[2]) : 0;
  const se = m[3] ? (parseNumber(m[3]) ?? 0) : 0;
  const value = dmsToDegrees(d, mi, se);
  return Number.isFinite(value) ? value : null;
}

/** Converte rumo (NE/SE/SW/NW) em azimute. */
export function bearingToAzimuth(
  angleDeg: number,
  quadrant: string,
): number | null {
  const q = quadrant.toUpperCase().replace(/[^NSEWO]/g, "").replace(/O/g, "W");
  switch (q) {
    case "NE":
      return angleDeg;
    case "SE":
      return 180 - angleDeg;
    case "SW":
      return 180 + angleDeg;
    case "NW":
      return 360 - angleDeg;
    default:
      return null;
  }
}

export function normalizeAzimuth(a: number): number {
  const v = a % 360;
  return v < 0 ? v + 360 : v;
}

export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(sr|sra|srta|dr|dra|espolio|espólio|de|da|do|dos|das|e)\b/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanConfrontante(raw: string): string | null {
  const s = raw
    .replace(/^\s*(com|as?|os?)\s+/i, "")
    .replace(/\b(a\s+)?(propriedade|imóvel|imovel|terreno|lote|gleba)\s+(de|da|do)\s+/i, "")
    .replace(/[;.]+\s*$/, "")
    .trim();
  if (!s || s.length < 2) return null;
  return s.slice(0, 200);
}

const AREA_RE =
  /área\s*(?:total|superficial|do\s+(?:imóvel|imovel|lote|terreno))?\s*(?:é|de|:|igual a)?\s*([\d.,]+)\s*(m²|m2|metros\s+quadrados|ha|hectares?|alqueires?)/i;
const PERIM_RE =
  /per[ií]metro\s*(?:total)?\s*(?:é|de|:|igual a)?\s*([\d.,]+)\s*(m|metros)\b/i;
const MATRICULA_RE = /matr[ií]cula\s*(?:n[ºo°.]*\s*)?([\d.\-/]+)/i;

/** Divide o corpo do memorial em trechos por vértice. */
function splitSegments(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ");
  const parts = normalized.split(
    /(?=(?:deste|desse|daí|dai|do|partindo\s+do|segue(?:-se)?\s+do)?\s*(?:v[ée]rtice|ponto|marco|estaca)\s+[A-Z0-9][\w\-.]{0,12}\s*(?:,|\s)\s*(?:segue|deflete|confront|com\s+azimute|azimute|rumo|ruma|até|deste|distância))/i,
  );
  return parts.map((p) => p.trim()).filter((p) => p.length > 15);
}

const VERTEX_PAIR_RE =
  /(?:v[ée]rtice|ponto|marco|estaca)\s+([A-Z0-9][\w\-.]{0,12})[^.]{0,220}?(?:até|ao?|at[ée]\s+o)\s+(?:o\s+)?(?:v[ée]rtice|ponto|marco|estaca)\s+([A-Z0-9][\w\-.]{0,12})/i;
const VERTEX_SINGLE_RE =
  /(?:v[ée]rtice|ponto|marco|estaca)\s+([A-Z0-9][\w\-.]{0,12})/i;
const DIST_RE = /(?:dist[âa]ncia|extens[ãa]o|medindo|mede|percorre)\s*(?:de|:)?\s*([\d.,]+)\s*(m|metros|km)\b/i;
const DIST_FALLBACK_RE = /\b([\d.,]+)\s*(?:m|metros)\b/i;
const AZ_RE = /azimute[^0-9]{0,20}([^,;]{2,40})/i;
const RUMO_RE =
  /rumo[^0-9A-Z]{0,15}([\d]{1,3}\s*(?:°|º|graus)[^A-Z]{0,20})\s*(NE|SE|SW|SO|NW|NO)/i;
const CONFRONT_RE =
  /confront(?:ando|a|ante|antes|ação)?\s*(?:-se)?\s*(?:com|:)\s*([^,;.]{2,140})/i;

export function parseMemorial(text: string): ParsedParcel {
  const warnings: string[] = [];
  const { text: flat, aplicadas } = normalizeMemorialText(text);
  if (aplicadas.length > 0) {
    warnings.push(
      `Padronização léxica aplicada antes da extração (${aplicadas.length}): ${aplicadas.join("; ")}.`,
    );
  }

  let area: number | null = null;
  const areaMatch = AREA_RE.exec(flat);
  if (areaMatch) {
    const value = parseNumber(areaMatch[1]!);
    const unit = areaMatch[2]!.toLowerCase();
    if (value !== null) {
      if (unit.startsWith("ha")) area = value * 10000;
      else if (unit.startsWith("alqueire")) area = value * 24200;
      else area = value;
    }
  } else {
    warnings.push("Área não localizada no texto.");
  }

  const perimMatch = PERIM_RE.exec(flat);
  const declaredPerimeter = perimMatch ? parseNumber(perimMatch[1]!) : null;
  if (!perimMatch) warnings.push("Perímetro declarado não localizado.");

  const matricula = MATRICULA_RE.exec(flat);

  const chunks = splitSegments(flat);
  const segments: ParsedSegment[] = [];

  chunks.forEach((chunk) => {
    const pair = VERTEX_PAIR_RE.exec(chunk);
    let from: string | null = null;
    let to: string | null = null;
    if (pair) {
      from = pair[1]!;
      to = pair[2]!;
    } else {
      const single = VERTEX_SINGLE_RE.exec(chunk);
      if (single) from = single[1]!;
    }

    let distance: number | null = null;
    const dm = DIST_RE.exec(chunk);
    if (dm) {
      const v = parseNumber(dm[1]!);
      distance = v === null ? null : dm[2]!.toLowerCase() === "km" ? v * 1000 : v;
    } else {
      const fb = DIST_FALLBACK_RE.exec(chunk);
      if (fb) distance = parseNumber(fb[1]!);
    }

    let azimuth: number | null = null;
    let bearingText: string | null = null;
    const rumo = RUMO_RE.exec(chunk);
    if (rumo) {
      bearingText = `${rumo[1]!.trim()} ${rumo[2]!}`;
      const angle = parseAzimuthText(rumo[1]!);
      if (angle !== null) azimuth = bearingToAzimuth(angle, rumo[2]!);
    } else {
      const az = AZ_RE.exec(chunk);
      if (az) {
        bearingText = az[1]!.trim();
        azimuth = parseAzimuthText(az[1]!);
      }
    }
    if (azimuth !== null) azimuth = normalizeAzimuth(azimuth);

    const conf = CONFRONT_RE.exec(chunk);
    const confrontante = conf ? cleanConfrontante(conf[1]!) : null;

    if (from === null && distance === null && azimuth === null) return;

    segments.push({
      seq: segments.length + 1,
      from_vertex: from,
      to_vertex: to,
      bearing_text: bearingText,
      azimuth_deg: azimuth,
      distance_m: distance,
      confrontante,
      raw_text: chunk.slice(0, 600),
    });
  });

  if (segments.length === 0) {
    warnings.push(
      "Nenhum segmento (vértice/azimute/distância) foi identificado. Verifique se o texto é um memorial descritivo.",
    );
  }

  const computedPerimeter = segments.reduce(
    (acc, s) => acc + (s.distance_m ?? 0),
    0,
  );

  const vertices = new Set<string>();
  segments.forEach((s) => {
    if (s.from_vertex) vertices.add(s.from_vertex.toUpperCase());
    if (s.to_vertex) vertices.add(s.to_vertex.toUpperCase());
  });

  const confrontantes: string[] = [];
  const seen = new Set<string>();
  segments.forEach((s) => {
    if (!s.confrontante) return;
    const key = normalizeName(s.confrontante);
    if (key && !seen.has(key)) {
      seen.add(key);
      confrontantes.push(s.confrontante);
    }
  });

  const missingAz = segments.filter((s) => s.azimuth_deg === null).length;
  if (segments.length > 0 && missingAz > 0) {
    warnings.push(
      `${missingAz} de ${segments.length} segmentos sem azimute/rumo identificado.`,
    );
  }

  return {
    label: matricula ? `Matrícula ${matricula[1]}` : null,
    area_m2: area,
    declared_perimeter_m: declaredPerimeter,
    computed_perimeter_m: computedPerimeter > 0 ? computedPerimeter : null,
    vertex_count: vertices.size,
    confrontantes,
    segments,
    warnings,
  };
}
