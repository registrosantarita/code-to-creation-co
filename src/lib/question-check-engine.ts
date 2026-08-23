import { SECOES } from "./question-check-secoes";
import type { Acumulado, Efeito, No, Respostas, Secao } from "./question-check-types";

export function secaoPorId(id: string): Secao | undefined {
  return SECOES.find((s) => s.id === id);
}

function respostaBooleana(v: unknown): boolean | null {
  if (v === true || v === "sim") return true;
  if (v === false || v === "nao") return false;
  return null;
}

/** Avalia se um efeito está ativo diante da resposta dada ao nó. */
export function efeitoAtivo(no: No, efeito: Efeito, resposta: unknown): boolean {
  const quando = efeito.quando;
  if (no.tipo === "sim_nao") {
    const b = respostaBooleana(resposta);
    if (b === null) return false;
    return (quando === "sim" && b) || (quando === "nao" && !b);
  }
  if (no.tipo === "opcoes") {
    if (typeof resposta !== "string" || !resposta) return false;
    if (quando.startsWith("opcao:")) return quando.slice(6) === resposta;
    if (quando === "alguma") return true;
    return false;
  }
  if (no.tipo === "multipla") {
    const sel = Array.isArray(resposta) ? (resposta as string[]) : [];
    if (quando.startsWith("opcao:")) return sel.includes(quando.slice(6));
    if (quando === "alguma") return sel.length > 0;
    if (quando === "nenhuma") return sel.length === 0;
    if (quando === "faltando") {
      const obrig = (no.opcoes ?? []).filter((o) => o.obrigatorio !== false);
      return obrig.some((o) => !sel.includes(o.id));
    }
    return false;
  }
  if (no.tipo === "numero" || no.tipo === "texto") {
    const preenchido = resposta !== null && resposta !== undefined && String(resposta).trim() !== "";
    if (quando === "sim" || quando === "alguma") return preenchido;
    if (quando === "nao" || quando === "nenhuma") return !preenchido;
    return false;
  }
  return quando === "sim" || quando === "alguma";
}

/** Opções obrigatórias não marcadas — usado nas exigências de "faltando". */
export function opcoesFaltantes(no: No, resposta: unknown): string[] {
  const sel = Array.isArray(resposta) ? (resposta as string[]) : [];
  return (no.opcoes ?? [])
    .filter((o) => o.obrigatorio !== false && !sel.includes(o.id))
    .map((o) => o.rotulo);
}

export function respondido(no: No, resposta: unknown): boolean {
  if (no.tipo === "info") return true;
  if (no.tipo === "multipla") return Array.isArray(resposta);
  return resposta !== undefined && resposta !== null && String(resposta) !== "";
}

/** Nós atualmente visíveis de uma seção, na ordem em que devem ser respondidos. */
export function nosVisiveis(secao: Secao, respostas: Respostas): No[] {
  const out: No[] = [];
  const visita = (nos: No[]) => {
    for (const no of nos) {
      out.push(no);
      const r = respostas[no.id];
      if (!respondido(no, r)) continue;
      for (const ef of no.efeitos ?? []) {
        if (ef.filhos?.length && efeitoAtivo(no, ef, r)) visita(ef.filhos);
      }
    }
  };
  visita(secao.itens);
  return out;
}

export type Acumulo = { alertas: Acumulado[]; exigencias: Acumulado[] };

/** Percorre as seções na ordem e acumula alertas (⚠) e exigências (⛔). */
export function acumular(secoesIds: string[], respostas: Respostas): Acumulo {
  const alertas: Acumulado[] = [];
  const exigencias: Acumulado[] = [];

  for (const sid of secoesIds) {
    const secao = secaoPorId(sid);
    if (!secao) continue;
    const visita = (nos: No[]) => {
      for (const no of nos) {
        const r = respostas[no.id];
        if (!respondido(no, r)) continue;
        for (const ef of no.efeitos ?? []) {
          if (!efeitoAtivo(no, ef, r)) continue;
          const detalhe = ef.quando === "faltando" ? opcoesFaltantes(no, r).join("; ") : "";
          const base = { no: no.id, secao: secao.id, pergunta: no.texto, detalhe };
          if (ef.alerta) alertas.push({ ...base, texto: ef.alerta });
          if (ef.exigencia) exigencias.push({ ...base, texto: ef.exigencia });
          if (ef.filhos?.length) visita(ef.filhos);
        }
      }
    };
    visita(secao.itens);
  }
  return { alertas, exigencias };
}

export function progresso(secoesIds: string[], respostas: Respostas) {
  let total = 0;
  let feitos = 0;
  for (const sid of secoesIds) {
    const secao = secaoPorId(sid);
    if (!secao) continue;
    for (const no of nosVisiveis(secao, respostas)) {
      if (no.tipo === "info") continue;
      total += 1;
      if (respondido(no, respostas[no.id])) feitos += 1;
    }
  }
  return { total, feitos, pct: total ? Math.round((feitos / total) * 100) : 0 };
}

function linhas(itens: Acumulado[]) {
  return itens
    .map((i, n) => `${n + 1}. ${i.texto}${i.detalhe ? ` (${i.detalhe})` : ""}`)
    .join("\n");
}

export function esbocoNotaExigencia(
  exigencias: Acumulado[],
  cabecalho: { titulo: string; protocolo: string },
): string {
  if (!exigencias.length) {
    return `NOTA DE EXIGÊNCIA — ${cabecalho.titulo}${cabecalho.protocolo ? ` (prenotação ${cabecalho.protocolo})` : ""}\n\nNão foram apuradas exigências no checklist.`;
  }
  return (
    `NOTA DE EXIGÊNCIA\n` +
    `Título: ${cabecalho.titulo}\n` +
    (cabecalho.protocolo ? `Prenotação: ${cabecalho.protocolo}\n` : "") +
    `\nDa qualificação registral do título resultaram as seguintes exigências:\n\n` +
    linhas(exigencias) +
    `\n\nO conteúdo acima é esboço gerado a partir das respostas do checklist e não substitui a qualificação jurídica do Oficial.`
  );
}

export function esbocoListaAlertas(alertas: Acumulado[]): string {
  if (!alertas.length) return "LISTA DE ALERTAS\n\nNenhum alerta acumulado.";
  return `LISTA DE ALERTAS\n\n${linhas(alertas)}`;
}
