/**
 * Complemento opcional por IA: preenche apenas os campos de qualificação que
 * a extração determinística não localizou. Consome créditos de IA.
 */
import { qualificacaoVazia, type Qualificacao } from "./qualificacao-parser";

export type IaUsage = {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
};

export type IaResultado = { dados: Qualificacao | null; note?: string; usage?: IaUsage };

const SISTEMA =
  "Você é assistente de qualificação registral brasileira. Extraia literalmente os dados do documento, " +
  "sem inventar, corrigir ou completar informação ausente. Use exatamente a grafia e os números do documento. " +
  "Campos não encontrados devem ser null.";

const ESQUEMA = `Responda APENAS com JSON no formato:
{
 "pessoas": [{"nome":null,"cpf":null,"cnpj":null,"rg":null,"orgao_rg":null,"nacionalidade":null,"profissao":null,"endereco":null,"estado_civil":null,"regime_bens":null,"data_casamento":null,"conjuge":null}],
 "imovel": {"cadastro_municipal":null,"ccir":null,"cib":null,"car":null,"itr_nirf":null,"inscricao_estadual":null},
 "cadeia": {"matricula":null,"transcricao":null,"cartorio":null,"livro":null,"folha":null,"registro_anterior":null}
}`;

function normalizar(bruto: unknown): Qualificacao {
  const base = qualificacaoVazia();
  const o = (bruto ?? {}) as Record<string, unknown>;
  const pessoas = Array.isArray(o["pessoas"]) ? (o["pessoas"] as Record<string, unknown>[]) : [];
  base.pessoas = pessoas.map((p) => ({
    nome: (p["nome"] as string) ?? null,
    cpf: (p["cpf"] as string) ?? null,
    cnpj: (p["cnpj"] as string) ?? null,
    rg: (p["rg"] as string) ?? null,
    orgao_rg: (p["orgao_rg"] as string) ?? null,
    nacionalidade: (p["nacionalidade"] as string) ?? null,
    profissao: (p["profissao"] as string) ?? null,
    endereco: (p["endereco"] as string) ?? null,
    estado_civil: (p["estado_civil"] as string) ?? null,
    regime_bens: (p["regime_bens"] as string) ?? null,
    data_casamento: (p["data_casamento"] as string) ?? null,
    conjuge: (p["conjuge"] as string) ?? null,
  }));
  const im = (o["imovel"] ?? {}) as Record<string, string | null>;
  for (const k of Object.keys(base.imovel) as (keyof Qualificacao["imovel"])[])
    base.imovel[k] = im[k] ?? null;
  const cd = (o["cadeia"] ?? {}) as Record<string, string | null>;
  for (const k of Object.keys(base.cadeia) as (keyof Qualificacao["cadeia"])[])
    base.cadeia[k] = cd[k] ?? null;
  return base;
}

export async function extrairQualificacaoIA(texto: string): Promise<IaResultado> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) return { dados: null, note: "IA indisponível: chave não configurada." };
  if (!texto.trim()) return { dados: null, note: "Documento sem texto para análise." };

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `${SISTEMA}\n${ESQUEMA}` },
        { role: "user", content: texto.slice(0, 120000) },
      ],
    }),
  });

  if (response.status === 429)
    return { dados: null, note: "Limite de requisições de IA atingido. Tente novamente em instantes." };
  if (response.status === 402)
    return { dados: null, note: "Créditos de IA esgotados. Recarregue os créditos do workspace." };
  if (!response.ok) return { dados: null, note: `Falha na IA (HTTP ${response.status}).` };

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    model?: string;
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
  };
  const prompt = json.usage?.prompt_tokens ?? 0;
  const completion = json.usage?.completion_tokens ?? 0;
  const usage: IaUsage = {
    model: json.model ?? "google/gemini-3.6-flash",
    promptTokens: prompt,
    completionTokens: completion,
    totalTokens: json.usage?.total_tokens ?? prompt + completion,
  };
  const conteudo = json.choices?.[0]?.message?.content ?? "";
  try {
    const limpo = conteudo.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return { dados: normalizar(JSON.parse(limpo)), usage };
  } catch {
    return { dados: null, note: "A IA não retornou um resultado interpretável.", usage };
  }
}

/** Mescla: o determinístico prevalece; a IA só preenche o que estava vazio. */
export function mesclar(base: Qualificacao, ia: Qualificacao): Qualificacao {
  const out: Qualificacao = {
    pessoas: [...base.pessoas],
    imovel: { ...base.imovel },
    cadeia: { ...base.cadeia },
  };
  for (const k of Object.keys(out.imovel) as (keyof Qualificacao["imovel"])[])
    if (!out.imovel[k]) out.imovel[k] = ia.imovel[k];
  for (const k of Object.keys(out.cadeia) as (keyof Qualificacao["cadeia"])[])
    if (!out.cadeia[k]) out.cadeia[k] = ia.cadeia[k];

  const chave = (p: Qualificacao["pessoas"][number]) =>
    (p.cpf ?? p.cnpj ?? p.nome ?? "").replace(/\D/g, "") || (p.nome ?? "").toUpperCase();

  for (const pIa of ia.pessoas) {
    const alvo = out.pessoas.find((p) => chave(p) && chave(p) === chave(pIa));
    if (alvo) {
      for (const k of Object.keys(alvo) as (keyof typeof alvo)[])
        if (!alvo[k]) alvo[k] = pIa[k];
    } else {
      out.pessoas.push(pIa);
    }
  }
  return out;
}
