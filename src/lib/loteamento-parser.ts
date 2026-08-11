/**
 * Memoriais descritivos de LOTEAMENTO (lotes, quadras e áreas públicas).
 *
 * Diferem do memorial rural/SIGEF: cada lote é descrito em prosa, com muitos
 * lados sem azimute ("segue com 20,01 metros"), trechos em desenvolvimento de
 * curva e a área encerrada ao final do parágrafo. O parser genérico só
 * reconhecia os lados com azimute, produzindo polígonos incompletos e, por
 * consequência, divergências falsas na comparação.
 */

import type { ParsedParcel, ParsedSegment, VertexCoord } from "./memorial-parser";
import { parseAzimuthText, parseNumber, normalizeAzimuth } from "./memorial-parser";

const BLOCO_RE =
  /^[^\S\n]*(lote\s+\d+[-A-Z]*|[áa]rea\s+(?:institucional|verde|de\s+lazer|de\s+preserva[çc][ãa]o|p[úu]blica|remanescente|do\s+sistema[^:\n]{0,40})[^:\n]{0,40}|sistema\s+de\s+lazer[^:\n]{0,40})\s*[:\-–]/gim;

const QUADRA_RE = /quadra\s*[“"']?\s*([A-Z0-9]{1,3})\s*[”"']?/i;

const DIST_RE = /([\d]{1,3}(?:\.\d{3})*(?:,\d+)?|\d+(?:[.,]\d+)?)\s*metros?\b/gi;
const AZ_RE =
  /azimute[^0-9]{0,20}(\d{1,3}\s*[°º]\s*\d{1,2}\s*['′]\s*(?:[\d.,]+\s*["″]?)?)/gi;
const CONFRONT_RE =
  /confront(?:ando|a|ante)?\s*(?:-se)?\s*(?:com|:)\s*([^,;.]{3,140})/gi;
const AREA_ENCERRA_RE =
  /(?:encerrando|perfazendo|totalizando)[^.]{0,40}?[áa]rea\s+(?:de\s+)?([\d.,]+)\s*m[²2]/i;
const AREA_POSSUI_RE = /[áa]rea\s+(?:total\s+)?de\s+([\d.,]+)\s*m[²2]/i;
const UTM_RE =
  /v[ée]rtice\s+([\w-]{1,10})[^.;]{0,60}?E\s*\(?X\)?\s*:?\s*([\d.]+(?:,\d+)?)[^.;]{0,30}?N\s*\(?Y\)?\s*:?\s*([\d.]+(?:,\d+)?)/gi;

/** Reconhece memorial de loteamento urbano (vários lotes/quadras). */
export function pareceLoteamento(text: string): boolean {
  const lotes = (text.match(/^\s*lote\s+\d+/gim) ?? []).length;
  const quadras = (text.match(/quadra\s*[“"']?\s*[A-Z0-9]{1,3}/gi) ?? []).length;
  return lotes >= 2 && quadras >= 1;
}

function limparConfrontante(raw: string): string | null {
  const s = raw
    .replace(/\s+/g, " ")
    .replace(/^(o|a|os|as|parte\s+do|parte\s+da)\s+/i, "")
    .replace(/[;.]+$/, "")
    .trim();
  return s.length >= 3 ? s.slice(0, 200) : null;
}

type Medida = { pos: number; fim: number; distancia: number; curva: boolean };

/** Todas as medidas lineares do trecho, descartando raios de curva. */
function medidas(bloco: string): Medida[] {
  const out: Medida[] = [];
  DIST_RE.lastIndex = 0;
  for (const m of bloco.matchAll(DIST_RE)) {
    const pos = m.index ?? 0;
    const antes = bloco.slice(Math.max(0, pos - 40), pos).toLowerCase();
    if (/raio\s+(?:de\s+)?$|raio[^.]{0,10}$/.test(antes)) continue;
    const valor = parseNumber(m[1]!);
    if (valor === null || valor <= 0) continue;
    out.push({
      pos,
      fim: pos + m[0]!.length,
      distancia: valor,
      curva: /desenvolvimento|curva/.test(
        bloco.slice(pos, Math.min(bloco.length, pos + 80)).toLowerCase(),
      ),
    });
  }
  return out;
}

function ultimaOcorrencia(
  re: RegExp,
  texto: string,
  inicio: number,
  fim: number,
): RegExpMatchArray | null {
  re.lastIndex = 0;
  let achado: RegExpMatchArray | null = null;
  for (const m of texto.slice(inicio, fim).matchAll(re)) achado = m;
  return achado;
}

function parseLote(bloco: string, titulo: string, quadra: string | null): ParsedParcel | null {
  const texto = bloco.replace(/\s+/g, " ");
  const lados = medidas(texto);
  if (lados.length < 3) return null;

  const vertices: VertexCoord[] = [];
  UTM_RE.lastIndex = 0;
  for (const m of texto.matchAll(UTM_RE)) {
    vertices.push({
      name: `V${m[1]!}`,
      lon: null,
      lat: null,
      alt: null,
      east: parseNumber(m[2]!),
      north: parseNumber(m[3]!),
    });
  }

  let curvas = 0;
  let semAzimute = 0;
  const segments: ParsedSegment[] = lados.map((lado, i) => {
    const inicio = i === 0 ? 0 : lados[i - 1]!.fim;
    const az = ultimaOcorrencia(AZ_RE, texto, inicio, lado.fim);
    const conf = ultimaOcorrencia(CONFRONT_RE, texto, inicio, lado.fim);
    const graus = az ? parseAzimuthText(az[1]!) : null;
    if (graus === null) semAzimute += 1;
    if (lado.curva) curvas += 1;
    return {
      seq: i + 1,
      from_vertex: `V${i + 1}`,
      to_vertex: `V${i + 2 > lados.length ? 1 : i + 2}`,
      bearing_text: az ? az[1]!.trim() : lado.curva ? "curva (desenvolvimento)" : null,
      azimuth_deg: graus === null ? null : normalizeAzimuth(graus),
      distance_m: lado.distancia,
      altitude_from_m: null,
      altitude_to_m: null,
      confrontante: conf ? limparConfrontante(conf[1]!) : null,
      raw_text: texto.slice(inicio, lado.fim).trim().slice(0, 600),
    };
  });

  const areaM = AREA_ENCERRA_RE.exec(texto) ?? AREA_POSSUI_RE.exec(texto);
  const perimetro = Number(
    segments.reduce((acc, s) => acc + (s.distance_m ?? 0), 0).toFixed(3),
  );

  const warnings: string[] = [];
  if (semAzimute > 0) {
    warnings.push(
      `Memorial de loteamento: ${semAzimute} de ${segments.length} lado(s) descritos apenas por distância (sem azimute). Esses lados são conferidos somente pela medida linear.`,
    );
  }
  if (curvas > 0) {
    warnings.push(
      `${curvas} trecho(s) em desenvolvimento de curva: a extensão foi considerada pelo desenvolvimento declarado, não pela corda.`,
    );
  }

  const confrontantes = [
    ...new Set(segments.map((s) => s.confrontante).filter((c): c is string => !!c)),
  ];

  return {
    label: quadra ? `Quadra ${quadra} — ${titulo}` : titulo,
    area_m2: areaM ? parseNumber(areaM[1]!) : null,
    declared_perimeter_m: null,
    computed_perimeter_m: perimetro,
    vertex_count: segments.length,
    altitude_min_m: null,
    altitude_max_m: null,
    altitude_mean_m: null,
    confrontantes,
    segments,
    vertices,
    warnings,
  };
}

/** Extrai um polígono por lote/área pública descrita no memorial. */
export function parseLoteamento(text: string): ParsedParcel[] {
  const marcas: { index: number; titulo: string }[] = [];
  BLOCO_RE.lastIndex = 0;
  for (const m of text.matchAll(BLOCO_RE)) {
    marcas.push({ index: m.index ?? 0, titulo: m[1]!.trim().replace(/\s+/g, " ") });
  }
  if (marcas.length < 2) return [];

  const parcelas: ParsedParcel[] = [];
  let quadra: string | null = null;
  let cursor = 0;
  marcas.forEach((marca, i) => {
    const fim = marcas[i + 1]?.index ?? text.length;
    // A quadra é declarada uma vez e vale para os lotes seguintes.
    const entre = [...text.slice(cursor, marca.index).matchAll(new RegExp(QUADRA_RE.source, "gi"))];
    if (entre.length > 0) quadra = entre[entre.length - 1]![1]!.toUpperCase();
    cursor = marca.index;
    const parcela = parseLote(text.slice(marca.index, fim), marca.titulo, quadra);
    if (parcela) parcelas.push(parcela);
  });


  return parcelas;
}
