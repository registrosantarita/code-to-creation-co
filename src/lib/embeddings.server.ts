/**
 * Geração de vetores semânticos (embeddings) via Lovable AI Gateway.
 * Usado apenas na indexação e na busca da base normativa.
 */

export const EMBEDDING_MODEL = "openai/text-embedding-3-small";
export const EMBEDDING_DIMS = 1536;

export type EmbeddingResult = {
  vectors: number[][];
  model: string;
  promptTokens: number;
  totalTokens: number;
};

export async function embedTexts(inputs: string[]): Promise<EmbeddingResult> {
  if (inputs.length === 0) {
    return { vectors: [], model: EMBEDDING_MODEL, promptTokens: 0, totalTokens: 0 };
  }
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Indexação indisponível: chave de IA não configurada.");

  const vectors: number[][] = [];
  let promptTokens = 0;
  let totalTokens = 0;
  const LOTE = 32;

  for (let i = 0; i < inputs.length; i += LOTE) {
    const lote = inputs.slice(i, i + LOTE);
    const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: lote }),
    });

    if (response.status === 429) {
      throw new Error("Limite de requisições atingido. Tente novamente em instantes.");
    }
    if (response.status === 402) {
      throw new Error("Créditos de IA esgotados. Recarregue os créditos do workspace.");
    }
    if (!response.ok) {
      throw new Error(`Falha ao indexar a norma (HTTP ${response.status}).`);
    }

    const json = (await response.json()) as {
      data?: { embedding: number[]; index?: number }[];
      model?: string;
      usage?: { prompt_tokens?: number; total_tokens?: number };
    };
    const data = [...(json.data ?? [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    if (data.length !== lote.length) {
      throw new Error("Resposta de indexação incompleta.");
    }
    for (const d of data) vectors.push(d.embedding);
    promptTokens += json.usage?.prompt_tokens ?? 0;
    totalTokens += json.usage?.total_tokens ?? json.usage?.prompt_tokens ?? 0;
  }

  return { vectors, model: EMBEDDING_MODEL, promptTokens, totalTokens };
}
