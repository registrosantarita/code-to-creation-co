import { parseMemorial, type ParsedParcel } from "./memorial-parser";
import { parseGeometryPolygons, parseGeometryText } from "./geo-parser";
import { pareceLoteamento, parseLoteamento } from "./loteamento-parser";

/**
 * Plantas exportadas de CAD em PDF produzem texto solto (rótulos de grade,
 * cotas isoladas, legendas), sem descrição perimétrica. Interpretar esse
 * conteúdo como memorial gera polígonos inexistentes e dezenas de
 * divergências falsas — por isso o texto é recusado antes do parsing.
 */
export function semDescricaoPerimetrica(texto: string): boolean {
  const linhas = texto.split("\n").filter((l) => l.trim().length > 0);
  if (linhas.length === 0) return true;
  const mediaPalavras =
    linhas.reduce((acc, l) => acc + l.trim().split(/\s+/).length, 0) / linhas.length;
  const marcadores =
    (texto.match(/confront/gi) ?? []).length +
    (texto.match(/at[ée]\s+o\s+(?:v[ée]rtice|ponto)/gi) ?? []).length +
    (texto.match(/azimute/gi) ?? []).length +
    (texto.match(/mem(?:orial)?\s+descritiv/gi) ?? []).length;
  return marcadores < 3 && mediaPalavras < 4;
}


/**
 * Cabeçalhos que costumam iniciar a descrição de um novo polígono dentro do
 * MESMO documento (memorial de vários imóveis, planta com várias glebas,
 * desmembramento com área remanescente etc.).
 */
const CABECALHO_RE =
  /^[^\S\n]*(?:mem(?:orial)?\s*descritiv[oa]|descri[çc][ãa]o\s+do\s+per[íi]metro|im[óo]vel|lote|gleba|quadra|parcela|pol[íi]gono|[áa]rea\s*(?:\d|[ivx]+\b|remanescente|desmembrada|total\s+do\s+lote))\b[^\n]{0,140}$/gim;

function blocosDeTexto(texto: string): { titulo: string | null; corpo: string }[] {
  const marcas: { index: number; titulo: string }[] = [];
  CABECALHO_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = CABECALHO_RE.exec(texto)) !== null) {
    marcas.push({ index: m.index, titulo: m[0]!.trim() });
    if (m.index === CABECALHO_RE.lastIndex) CABECALHO_RE.lastIndex += 1;
  }
  if (marcas.length < 2) return [{ titulo: null, corpo: texto }];
  return marcas.map((marca, i) => ({
    titulo: marca.titulo.slice(0, 120),
    corpo: texto.slice(marca.index, marcas[i + 1]?.index ?? texto.length),
  }));
}

function assinatura(p: ParsedParcel): string {
  return p.segments
    .map((s) => `${s.distance_m ?? ""}|${s.azimuth_deg ?? ""}`)
    .join(";");
}

/**
 * Extrai TODAS as parcelas (polígonos) descritas em um documento. Quando o
 * documento traz um único imóvel, devolve uma só parcela — comportamento
 * idêntico ao anterior.
 */
export function parseParcelas(text: string, ehGeometria: boolean): ParsedParcel[] {
  if (ehGeometria) {
    const poligonos = parseGeometryPolygons(text);
    if (poligonos.length > 1) {
      return poligonos.map((p, i) => ({
        ...p,
        label: p.label ?? `Polígono ${i + 1}`,
        warnings: [
          `Arquivo com ${poligonos.length} polígonos: cada um foi registrado como um imóvel independente.`,
          ...p.warnings,
        ],
      }));
    }
    const unico = parseGeometryText(text);
    return unico ? [unico] : [];
  }

  if (semDescricaoPerimetrica(text)) return [];

  if (pareceLoteamento(text)) {
    const lotes = parseLoteamento(text);
    if (lotes.length > 1) {
      return lotes.map((p) => ({
        ...p,
        warnings: [
          `Memorial de loteamento com ${lotes.length} descrições perimétricas (lotes e áreas públicas): cada uma foi registrada como um imóvel independente.`,
          ...p.warnings,
        ],
      }));
    }
  }

  const blocos = blocosDeTexto(text);

  if (blocos.length > 1) {
    const parcelas: ParsedParcel[] = [];
    const vistos = new Set<string>();
    blocos.forEach((bloco) => {
      const parsed = parseMemorial(bloco.corpo);
      if (parsed.segments.length < 3) return;
      const chave = assinatura(parsed);
      if (vistos.has(chave)) return;
      vistos.add(chave);
      parcelas.push({
        ...parsed,
        label: parsed.label ?? bloco.titulo,
      });
    });
    if (parcelas.length > 1) {
      return parcelas.map((p, i) => ({
        ...p,
        label: p.label ?? `Polígono ${i + 1}`,
        warnings: [
          `Documento com ${parcelas.length} descrições perimétricas: cada uma foi registrada como um imóvel independente, permitindo conferir a divisa comum dentro do próprio documento.`,
          ...p.warnings,
        ],
      }));
    }
  }
  return [parseMemorial(text)];
}
