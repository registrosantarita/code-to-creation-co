/** Extração textual server-side (PDF e texto simples). */

export async function extractPdfText(bytes: ArrayBuffer): Promise<string> {
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(bytes));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n") : text;
}

export function decodeText(bytes: ArrayBuffer): string {
  return new TextDecoder("utf-8").decode(new Uint8Array(bytes));
}

const TEXT_EXTENSIONS = ["txt", "csv", "md", "json", "xml", "kml"];

export async function extractTextFromFile(
  bytes: ArrayBuffer,
  extension: string,
): Promise<{ text: string; note?: string }> {
  const ext = extension.toLowerCase().replace(".", "");
  if (ext === "pdf") {
    const text = await extractPdfText(bytes);
    if (text.trim().length < 40) {
      return {
        text,
        note: "O PDF parece ser digitalizado (sem camada de texto). Cole o texto do memorial manualmente para permitir a extração.",
      };
    }
    return { text };
  }
  if (TEXT_EXTENSIONS.includes(ext)) {
    return { text: decodeText(bytes) };
  }
  return {
    text: "",
    note: `Leitura automática de arquivos .${ext} ainda não está no escopo do MVP. O arquivo foi arquivado com rastreabilidade; cole o texto correspondente para extrair os dados técnicos.`,
  };
}
