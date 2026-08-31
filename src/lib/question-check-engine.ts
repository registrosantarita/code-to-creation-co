import { secoesDaEspecialidade } from "./question-check-especialidades";
import { chaveSubsecao } from "./question-check-types";
import type { Acumulado, Efeito, No, Respostas, Secao } from "./question-check-types";

export function secaoPorId(id: string, especialidade?: string | null): Secao | undefined {
  return secoesDaEspecialidade(especialidade).find((s) => s.id === id);
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

/** Rótulos das opções efetivamente marcadas — enumerados nos alertas/exigências. */
export function opcoesSelecionadas(no: No, resposta: unknown): string[] {
  const sel = Array.isArray(resposta) ? (resposta as string[]) : [];
  return (no.opcoes ?? []).filter((o) => sel.includes(o.id)).map((o) => o.rotulo);
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
export function acumular(
  secoesIds: string[],
  respostas: Respostas,
  subsecoes?: string[] | null,
  especialidade?: string | null,
): Acumulo {
  const alertas: Acumulado[] = [];
  const exigencias: Acumulado[] = [];

  for (const sid of secoesIds) {
    const secao = secaoAtiva(sid, subsecoes, especialidade);
    if (!secao) continue;
    const visita = (nos: No[]) => {
      for (const no of nos) {
        const r = respostas[no.id];
        if (!respondido(no, r)) continue;
        for (const ef of no.efeitos ?? []) {
          if (!efeitoAtivo(no, ef, r)) continue;
          const selecionados = no.tipo === "multipla" ? opcoesSelecionadas(no, r) : [];
          const detalhe =
            ef.quando === "faltando"
              ? opcoesFaltantes(no, r).join("; ")
              : selecionados.length
                ? `itens selecionados: ${selecionados.join("; ")}`
                : "";


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

export function progresso(
  secoesIds: string[],
  respostas: Respostas,
  subsecoes?: string[] | null,
  especialidade?: string | null,
) {
  let total = 0;
  let feitos = 0;
  for (const sid of secoesIds) {
    const secao = secaoAtiva(sid, subsecoes, especialidade);
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

/** Títulos das subseções (grupos) de uma seção, na ordem em que aparecem. */
export function gruposDaSecao(secao: Secao): string[] {
  const out: string[] = [];
  const visita = (nos: No[]) => {
    for (const no of nos) {
      if (no.grupo && !out.includes(no.grupo)) out.push(no.grupo);
      for (const ef of no.efeitos ?? []) if (ef.filhos?.length) visita(ef.filhos);
    }
  };
  visita(secao.itens);
  return out;
}

/**
 * Restringe uma seção às subseções selecionadas. Quando a seleção global está
 * vazia (sessões antigas), a seção é mantida integralmente. Quando há seleção
 * mas nenhuma subseção desta seção está marcada, as perguntas agrupadas são
 * removidas.
 */
export function secaoFiltrada(secao: Secao, subsecoes?: string[] | null): Secao {
  if (!subsecoes?.length) return secao;
  const grupos = gruposDaSecao(secao);
  const ativos = grupos.filter((g) => subsecoes.includes(chaveSubsecao(secao.id, g)));

  const filtra = (nos: No[]): No[] =>
    nos
      .filter((no) => !no.grupo || ativos.includes(no.grupo))
      .map((no) => ({
        ...no,
        efeitos: (no.efeitos ?? []).map((ef) =>
          ef.filhos?.length ? { ...ef, filhos: filtra(ef.filhos) } : ef,
        ),
      }));
  return { ...secao, itens: filtra(secao.itens) };
}

/** Seção aplicável já restrita às subseções selecionadas. */
export function secaoAtiva(
  id: string,
  subsecoes?: string[] | null,
  especialidade?: string | null,
): Secao | undefined {
  const s = secaoPorId(id, especialidade);
  return s ? secaoFiltrada(s, subsecoes) : undefined;
}

/**
 * Numeração Seção–Subseção–Pergunta, espelhando a renumeração por subseção do
 * documento original: `A-1-1` (seção A, 1ª subseção, 1ª pergunta), `A-2-4`, e
 * perguntas condicionais com sufixo por ponto (`A-2-4.1`, `A-2-4.1.1`).
 * Perguntas sem subseção usam `Seção-Pergunta` (`Q-1`). Nós informativos não
 * recebem número, mas seus filhos herdam o prefixo do pai.
 */
export function numerosDaSecao(secao: Secao): Record<string, string> {
  const out: Record<string, string> = {};

  const visitaFilhos = (nos: No[], prefixo: string) => {
    let n = 0;
    for (const no of nos) {
      let atual = prefixo;
      if (no.codigo) {
        atual = `Código ${no.codigo}`;
        out[no.id] = atual;
      } else if (no.tipo !== "info") {
        n += 1;
        atual = `${prefixo}.${n}`;
        out[no.id] = atual;
      }
      for (const ef of no.efeitos ?? []) if (ef.filhos?.length) visitaFilhos(ef.filhos, atual);
    }
  };

  const grupos = gruposDaSecao(secao);
  const contador: Record<string, number> = {};

  for (const no of secao.itens) {
    const idxGrupo = no.grupo ? grupos.indexOf(no.grupo) + 1 : 0;
    const chave = String(idxGrupo);
    const base = idxGrupo ? `${secao.id}-${idxGrupo}` : secao.id;
    let atual = base;
    if (no.tipo !== "info") {
      contador[chave] = (contador[chave] ?? 0) + 1;
      atual = `${base}-${contador[chave]}`;
      out[no.id] = atual;
    }
    for (const ef of no.efeitos ?? []) if (ef.filhos?.length) visitaFilhos(ef.filhos, atual);
  }
  return out;
}


