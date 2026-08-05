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
  altitude_from_m: number | null;
  altitude_to_m: number | null;
  confrontante: string | null;
  raw_text: string;
};

/** Coordenada de vértice: geodésica (SIGEF) e/ou plana (UTM N/E). */
export type VertexCoord = {
  name: string;
  lon: number | null;
  lat: number | null;
  alt: number | null;
  north: number | null;
  east: number | null;
};

export type ParsedParcel = {
  label: string | null;
  area_m2: number | null;
  declared_perimeter_m: number | null;
  computed_perimeter_m: number | null;
  vertex_count: number;
  altitude_min_m: number | null;
  altitude_max_m: number | null;
  altitude_mean_m: number | null;
  confrontantes: string[];
  segments: ParsedSegment[];
  vertices: VertexCoord[];
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
const MATRICULA_RE = /matr[ií]cula\s*(?:n[ºo°.]*\s*)?([\d.\-/]*\d)/i;

/** Divide o corpo do memorial em trechos por vértice. */
function splitSegments(text: string): string[] {
  const normalized = text.replace(/\s+/g, " ");
  const parts = normalized.split(
    /(?<!at[ée]\s)(?<!at[ée]\s(?:o|a))(?<!at[ée]\s(?:o|a)\s)(?=(?:deste|desse|daí|dai|do|partindo\s+do|segue(?:-se)?\s+do)?\s*(?:v[ée]rtice|ponto|marco|estaca)\s+[A-Z0-9][\w\-.]{0,12}\s*(?:,|\s)\s*(?:segue|deflete|confront|com\s+azimute|azimute|rumo|ruma|até|deste|distância|de\s+coordenadas|coordenadas))/i,
  );
  return parts.map((p) => p.trim()).filter((p) => p.length > 15);
}

const VERTEX_PAIR_RE =
  /(?:v[ée]rtice|ponto|marco|estaca)\s+([A-Z0-9][\w\-.]{0,12})[\s\S]{0,400}?(?:até|ao?|at[ée]\s+o)\s+(?:o\s+)?(?:v[ée]rtice|ponto|marco|estaca)\s+([A-Z0-9][\w\-.]{0,12})/i;
const VERTEX_SINGLE_RE =
  /(?:v[ée]rtice|ponto|marco|estaca)\s+([A-Z0-9][\w\-.]{0,12})/i;
const DIST_RE = /(?:dist[âa]ncia|extens[ãa]o|medindo|mede|percorre)\s*(?:de|:)?\s*([\d.,]+)\s*(m|metros|km)\b/i;
const DIST_FALLBACK_RE = /\b([\d.,]+)\s*(?:m|metros)\b/i;
const ALT_RE =
  /altitude[^0-9\-]{0,20}(-?[\d.,]+)\s*(?:m|metros)?/gi;
const AZ_RE = /azimute[^0-9]{0,20}([^,;]{2,40})/i;
const RUMO_RE =
  /rumo[^0-9A-Z]{0,15}([\d]{1,3}\s*(?:°|º|graus)[^A-Z]{0,20})\s*(NE|SE|SW|SO|NW|NO)/i;
const CONFRONT_RE =
  /confront(?:ando|a|ante|antes|ação)?\s*(?:-se)?\s*(?:com|:)\s*([^,;.]{2,140})/i;

// --- Coordenadas de vértice -------------------------------------------------
const UTM_NE_RE =
  /\bN(?:orte)?\s*[:=]?\s*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}(?:[.,]\d+)?)\s*m?\b[\s,;]*(?:e\s*)?\bE(?:ste|Leste)?\s*[:=]?\s*(\d{3}[.\s]?\d{3}(?:[.,]\d+)?)/i;
const UTM_EN_RE =
  /\bE(?:ste|Leste)?\s*[:=]?\s*(\d{3}[.\s]?\d{3}(?:[.,]\d+)?)\s*m?\b[\s,;]*(?:e\s*)?\bN(?:orte)?\s*[:=]?\s*(\d{1,2}[.\s]?\d{3}[.\s]?\d{3}(?:[.,]\d+)?)/i;
const LAT_RE =
  /\blat(?:itude)?\s*[:=]?\s*(-?\d{1,3}\s*(?:[°ºo]\s*\d{1,2}\s*['′]\s*[\d.,]+\s*["″]?\s*[NSns]?|[.,]\d+)\s*[NSns]?)/i;
const LON_RE =
  /\blong?(?:itude)?\s*[:=]?\s*(-?\d{1,3}\s*(?:[°ºo]\s*\d{1,2}\s*['′]\s*[\d.,]+\s*["″]?\s*[EWOewo]?|[.,]\d+)\s*[EWOewo]?)/i;

/** Converte "23°45'12,3\" S" ou "-23,7534" em grau decimal com sinal. */
export function parseGeoCoord(raw: string): number | null {
  const s = raw.trim();
  const hemi = /([NSEWOnsewo])\s*$/.exec(s)?.[1]?.toUpperCase() ?? null;
  const dms = /(-?\d{1,3})\s*[°ºo]\s*(\d{1,2})\s*['′]\s*([\d.,]+)/.exec(s);
  let value: number | null = null;
  if (dms) {
    const d = Number(dms[1]);
    const m = Number(dms[2]);
    const sec = parseNumber(dms[3]!) ?? 0;
    value = Math.abs(d) + m / 60 + sec / 3600;
    if (d < 0) value = -value;
  } else {
    value = parseNumber(s.replace(/[^\d.,-]/g, ""));
  }
  if (value === null || !Number.isFinite(value)) return null;
  if (hemi === "S" || hemi === "W" || hemi === "O") value = -Math.abs(value);
  return Number(value.toFixed(8));
}

function extractCoords(chunk: string): {
  lon: number | null;
  lat: number | null;
  north: number | null;
  east: number | null;
} {
  let north: number | null = null;
  let east: number | null = null;
  const ne = UTM_NE_RE.exec(chunk);
  if (ne) {
    north = parseNumber(ne[1]!.replace(/\s/g, ""));
    east = parseNumber(ne[2]!.replace(/\s/g, ""));
  } else {
    const en = UTM_EN_RE.exec(chunk);
    if (en) {
      east = parseNumber(en[1]!.replace(/\s/g, ""));
      north = parseNumber(en[2]!.replace(/\s/g, ""));
    }
  }
  const latM = LAT_RE.exec(chunk);
  const lonM = LON_RE.exec(chunk);
  return {
    lat: latM ? parseGeoCoord(latM[1]!) : null,
    lon: lonM ? parseGeoCoord(lonM[1]!) : null,
    north,
    east,
  };
}

/** Reconstitui hifenizações e sinais quebrados por fim de linha do PDF. */
function repairLineBreaks(text: string): string {
  return text
    .replace(/\s+/g, " ")
    .replace(/([A-Za-z0-9])-\s+(?=[A-Za-z0-9])/g, "$1-")
    .replace(/([(:,]\s*)-\s+(?=\d)/g, "$1-");
}

const AREA_LABEL_RE =
  /[áa]rea[^\n:]{0,80}?:\s*([\d.,]+)\s*(m²|m2|metros\s+quadrados|ha|hectares?|alqueires?)?/i;
const PERIM_LABEL_RE =
  /per[ií]metro[^\n:]{0,60}?:\s*([\d.,]+)\s*(km|m|metros)?/i;

/** Área em m², aceitando unidade no rótulo — "Área Total (hectare): 20,1409". */
function extractArea(flat: string): number | null {
  const direct = AREA_RE.exec(flat);
  let value: number | null = null;
  let unit = "";
  if (direct) {
    value = parseNumber(direct[1]!);
    unit = direct[2]!.toLowerCase();
  } else {
    const labeled = AREA_LABEL_RE.exec(flat);
    if (!labeled) return null;
    value = parseNumber(labeled[1]!);
    unit = (labeled[2] ?? "").toLowerCase();
    if (!unit) {
      // unidade declarada no próprio rótulo, ex.: "Área Total (hectare):"
      const label = flat.slice(Math.max(0, labeled.index), labeled.index + 90).toLowerCase();
      if (/\b(ha|hectares?)\b/.test(label)) unit = "ha";
      else if (/alqueire/.test(label)) unit = "alqueire";
      else unit = "m2";
    }
  }
  if (value === null) return null;
  if (unit.startsWith("ha") || unit.startsWith("hectare")) return value * 10000;
  if (unit.startsWith("alqueire")) return value * 24200;
  return value;
}

/** Perímetro declarado em metros, aceitando unidade no rótulo. */
function extractPerimeter(flat: string): number | null {
  const direct = PERIM_RE.exec(flat);
  if (direct) return parseNumber(direct[1]!);
  const labeled = PERIM_LABEL_RE.exec(flat);
  if (!labeled) return null;
  const value = parseNumber(labeled[1]!);
  if (value === null) return null;
  return (labeled[2] ?? "").toLowerCase() === "km" ? value * 1000 : value;
}

type StructuredParse = {
  segments: ParsedSegment[];
  coords: Map<string, VertexCoord>;
};

const COORD_DMS = String.raw`-?\d{1,3}\s*[°ºo]\s*\d{1,2}\s*['′]\s*[\d.,]+\s*["″]?`;

/** Memorial SIGEF/INCRA em tabela: código, long, lat, altitude, vante, azimute, distância. */
const SIGEF_ROW_RE = new RegExp(
  String.raw`^\s*([A-Z0-9][\w\-.]{2,20})\s+(${COORD_DMS})\s+(${COORD_DMS})\s+(-?[\d.,]+)\s+([A-Z0-9][\w\-.]{2,20})\s+(\d{1,3}\s*[°ºo]\s*\d{1,2}\s*['′]?(?:\s*[\d.,]+\s*["″])?)\s+([\d.,]+)\s*(.*)$`,
  "i",
);

function parseSigefTable(rawText: string): StructuredParse | null {
  const segments: ParsedSegment[] = [];
  const coords = new Map<string, VertexCoord>();
  const altByVertex = new Map<string, number | null>();

  for (const line of rawText.split(/\r?\n/)) {
    const m = SIGEF_ROW_RE.exec(line.trim());
    if (!m) continue;
    const [, from, lonRaw, latRaw, altRaw, to, azRaw, distRaw, tail] = m;
    const key = from!.toUpperCase();
    const alt = parseNumber(altRaw!);
    altByVertex.set(key, alt);
    coords.set(key, {
      name: key,
      lon: parseGeoCoord(lonRaw!),
      lat: parseGeoCoord(latRaw!),
      alt,
      north: null,
      east: null,
    });
    const az = parseAzimuthText(azRaw!);
    const confrontante = tail
      ? cleanConfrontante(tail.split("|").pop()!.trim())
      : null;
    segments.push({
      seq: segments.length + 1,
      from_vertex: from!,
      to_vertex: to!,
      bearing_text: azRaw!.trim(),
      azimuth_deg: az === null ? null : normalizeAzimuth(az),
      distance_m: parseNumber(distRaw!),
      altitude_from_m: alt,
      altitude_to_m: null,
      confrontante,
      raw_text: line.trim().slice(0, 600),
    });
  }

  if (segments.length < 3) return null;
  segments.forEach((s) => {
    if (s.to_vertex) s.altitude_to_m = altByVertex.get(s.to_vertex.toUpperCase()) ?? null;
  });
  return { segments, coords };
}

/** Memorial em prosa: "108°57' e 18,57 m até o vértice X, (Longitude: ..., Latitude: ... e Altitude: ...)". */
const PROSE_SEG_RE = new RegExp(
  String.raw`(\d{1,3}\s*[°ºo]\s*\d{1,2}\s*['′]?(?:\s*[\d.,]+\s*["″])?)\s*(?:e|,)\s*([\d.,]+)\s*(?:m|metros)\s*at[ée]\s+(?:o\s+)?(?:v[ée]rtice|ponto|marco|estaca)\s+([A-Z0-9][\w\-.]{1,20})\s*,?\s*\(\s*Longitude\s*:?\s*(${COORD_DMS})\s*,?\s*Latitude\s*:?\s*(${COORD_DMS})(?:\s*(?:e|,)\s*Altitude\s*:?\s*(-?[\d.,]+))?`,
  "gi",
);
const PROSE_START_RE = new RegExp(
  String.raw`(?:v[ée]rtice|ponto|marco|estaca)\s+([A-Z0-9][\w\-.]{1,20})\s*,?\s*(?:de\s+coordenadas\s*)?\(\s*Longitude\s*:?\s*(${COORD_DMS})\s*,?\s*Latitude\s*:?\s*(${COORD_DMS})(?:\s*(?:e|,)\s*Altitude\s*:?\s*(-?[\d.,]+))?`,
  "i",
);
const PROSE_CONFRONT_RE = /confront(?:ando|a|ante|antes|ação)?\s*(?:-se)?\s*(?:com|:)\s*([^:;]{2,140}?)(?:,\s*com\s+os\s+seguintes|;|\.|:)/gi;

function parseProseSegments(flat: string): StructuredParse | null {
  const start = PROSE_START_RE.exec(flat);
  if (!start) return null;

  const confrontos: { pos: number; nome: string | null }[] = [];
  PROSE_CONFRONT_RE.lastIndex = 0;
  for (const c of flat.matchAll(PROSE_CONFRONT_RE)) {
    confrontos.push({ pos: c.index ?? 0, nome: cleanConfrontante(c[1]!) });
  }
  const confrontanteEm = (pos: number): string | null => {
    let atual: string | null = null;
    for (const c of confrontos) {
      if (c.pos <= pos) atual = c.nome;
      else break;
    }
    return atual;
  };

  const coords = new Map<string, VertexCoord>();
  const registrar = (
    name: string,
    lonRaw: string,
    latRaw: string,
    altRaw: string | undefined,
  ): number | null => {
    const key = name.toUpperCase();
    const alt = altRaw ? parseNumber(altRaw) : null;
    coords.set(key, {
      name: key,
      lon: parseGeoCoord(lonRaw),
      lat: parseGeoCoord(latRaw),
      alt,
      north: null,
      east: null,
    });
    return alt;
  };

  let prevName = start[1]!;
  let prevAlt = registrar(prevName, start[2]!, start[3]!, start[4]);

  const segments: ParsedSegment[] = [];
  PROSE_SEG_RE.lastIndex = 0;
  for (const m of flat.matchAll(PROSE_SEG_RE)) {
    const [, azRaw, distRaw, to, lonRaw, latRaw, altRaw] = m;
    const alt = registrar(to!, lonRaw!, latRaw!, altRaw);
    const az = parseAzimuthText(azRaw!);
    segments.push({
      seq: segments.length + 1,
      from_vertex: prevName,
      to_vertex: to!,
      bearing_text: azRaw!.trim(),
      azimuth_deg: az === null ? null : normalizeAzimuth(az),
      distance_m: parseNumber(distRaw!),
      altitude_from_m: prevAlt,
      altitude_to_m: alt,
      confrontante: confrontanteEm(m.index ?? 0),
      raw_text: m[0]!.slice(0, 600),
    });
    prevName = to!;
    prevAlt = alt;
  }

  return segments.length >= 3 ? { segments, coords } : null;
}

export function parseMemorial(text: string): ParsedParcel {
  const warnings: string[] = [];
  const { text: normalizado, aplicadas } = normalizeMemorialText(text);
  if (aplicadas.length > 0) {
    warnings.push(
      `Padronização léxica aplicada antes da extração (${aplicadas.length}): ${aplicadas.join("; ")}.`,
    );
  }
  const flat = repairLineBreaks(normalizado);

  const area = extractArea(flat);
  if (area === null) warnings.push("Área não localizada no texto.");

  const declaredPerimeter = extractPerimeter(flat);
  if (declaredPerimeter === null) warnings.push("Perímetro declarado não localizado.");

  const matricula = MATRICULA_RE.exec(flat);

  const structured = parseSigefTable(normalizado) ?? parseProseSegments(flat);
  const segments: ParsedSegment[] = structured?.segments ?? [];
  const coordMap = structured?.coords ?? new Map<string, VertexCoord>();
  const chunks = structured ? [] : splitSegments(flat);



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

    ALT_RE.lastIndex = 0;
    const altitudes: { valor: number; pos: number }[] = [];
    for (const m of chunk.matchAll(ALT_RE)) {
      const v = parseNumber(m[1]!);
      if (v !== null && Math.abs(v) < 9000)
        altitudes.push({ valor: v, pos: m.index ?? 0 });
    }
    // Uma única cota depois do conector "até" pertence ao vértice de chegada.
    const ateIdx = /(?:^|\s)at[ée](?=\s)/i.exec(chunk)?.index ?? -1;
    let altitudeFrom: number | null = null;
    let altitudeTo: number | null = null;
    if (altitudes.length === 1) {
      const only = altitudes[0]!;
      if (ateIdx >= 0 && only.pos > ateIdx) altitudeTo = only.valor;
      else altitudeFrom = only.valor;
    } else if (altitudes.length > 1) {
      altitudeFrom = altitudes[0]!.valor;
      altitudeTo = altitudes[altitudes.length - 1]!.valor;
    }

    const conf = CONFRONT_RE.exec(chunk);
    const confrontante = conf ? cleanConfrontante(conf[1]!) : null;

    if (from === null && distance === null && azimuth === null) return;

    const coords = extractCoords(chunk);
    if (
      from &&
      (coords.lat !== null ||
        coords.lon !== null ||
        coords.north !== null ||
        coords.east !== null)
    ) {
      const key = from.toUpperCase();
      const prev = coordMap.get(key);
      coordMap.set(key, {
        name: key,
        lat: coords.lat ?? prev?.lat ?? null,
        lon: coords.lon ?? prev?.lon ?? null,
        north: coords.north ?? prev?.north ?? null,
        east: coords.east ?? prev?.east ?? null,
        alt: altitudeFrom ?? prev?.alt ?? null,
      });
    } else if (from && altitudeFrom !== null && !coordMap.has(from.toUpperCase())) {
      coordMap.set(from.toUpperCase(), {
        name: from.toUpperCase(),
        lat: null,
        lon: null,
        north: null,
        east: null,
        alt: altitudeFrom,
      });
    }

    segments.push({
      seq: segments.length + 1,
      from_vertex: from,
      to_vertex: to,
      bearing_text: bearingText,
      azimuth_deg: azimuth,
      distance_m: distance,
      altitude_from_m: altitudeFrom,
      altitude_to_m: altitudeTo,
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

  // Altimetria: consolida as cotas identificadas nos vértices.
  const altitudes = segments
    .flatMap((s) => [s.altitude_from_m, s.altitude_to_m])
    .filter((v): v is number => v !== null);
  const altitudeMin = altitudes.length > 0 ? Math.min(...altitudes) : null;
  const altitudeMax = altitudes.length > 0 ? Math.max(...altitudes) : null;
  const altitudeMean =
    altitudes.length > 0
      ? Number((altitudes.reduce((a, v) => a + v, 0) / altitudes.length).toFixed(3))
      : null;
  if (segments.length > 0 && altitudes.length === 0) {
    warnings.push(
      "Nenhuma altitude (cota) foi identificada nos vértices; a comparação altimétrica ficará inconclusiva.",
    );
  }

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
    altitude_min_m: altitudeMin,
    altitude_max_m: altitudeMax,
    altitude_mean_m: altitudeMean,
    confrontantes,
    segments,
    vertices: [...coordMap.values()],
    warnings,

  };
}
