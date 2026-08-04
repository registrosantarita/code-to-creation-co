/**
 * OCR de documentos digitalizados (PDF sem camada de texto e imagens),
 * via Lovable AI Gateway com modelo multimodal.
 */

function toBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes);
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < view.length; i += chunk) {
    binary += String.fromCharCode(...view.subarray(i, i + chunk));
  }
  return btoa(binary);
}

const IMAGE_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  tif: "image/tiff",
  tiff: "image/tiff",
};

const PROMPT =
  "Transcreva integralmente o texto deste documento técnico registral em português. " +
  "Preserve a ordem de leitura, quebras de linha, tabelas (em linhas separadas por ponto e vírgula) " +
  "e todos os números, azimutes (graus, minutos, segundos), distâncias, áreas e nomes de confrontantes " +
  "exatamente como aparecem. Não resuma, não comente e não traduza. Responda apenas com a transcrição.";

export type OcrResult = { text: string; note?: string };

export async function ocrDocument(
  bytes: ArrayBuffer,
  extension: string,
  fileName = "documento",
): Promise<OcrResult> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) {
    return { text: "", note: "OCR indisponível: chave de IA não configurada." };
  }

  const ext = extension.toLowerCase().replace(".", "");
  const isImage = ext in IMAGE_MIME;
  const mime = isImage ? IMAGE_MIME[ext]! : "application/pdf";
  const data = `data:${mime};base64,${toBase64(bytes)}`;

  const content = isImage
    ? [
        { type: "text", text: PROMPT },
        { type: "image_url", image_url: { url: data } },
      ]
    : [
        { type: "text", text: PROMPT },
        { type: "file", file: { filename: `${fileName}.pdf`, file_data: data } },
      ];

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
    body: JSON.stringify({
      model: "google/gemini-3.6-flash",
      messages: [{ role: "user", content }],
    }),
  });

  if (response.status === 429) {
    return { text: "", note: "Limite de requisições de OCR atingido. Tente novamente em instantes." };
  }
  if (response.status === 402) {
    return { text: "", note: "Créditos de IA esgotados. Recarregue os créditos do workspace para usar o OCR." };
  }
  if (!response.ok) {
    return {
      text: "",
      note: `Falha no OCR (HTTP ${response.status}). Cole o texto do documento manualmente.`,
    };
  }

  const json = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = json.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) {
    return { text: "", note: "O OCR não identificou texto legível neste documento." };
  }
  return {
    text,
    note: "Texto obtido por OCR assistido por IA. Confira a transcrição antes da qualificação.",
  };
}
