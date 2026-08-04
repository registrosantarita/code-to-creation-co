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

/** DOCX: descompacta o pacote OOXML e extrai o texto dos parágrafos. */
export async function extractDocxText(bytes: ArrayBuffer): Promise<string> {
  const { unzipSync, strFromU8 } = await import("fflate");
  const files = unzipSync(new Uint8Array(bytes));
  const parts = ["word/document.xml", "word/footnotes.xml", "word/endnotes.xml"];
  const chunks: string[] = [];
  for (const part of parts) {
    const raw = files[part];
    if (!raw) continue;
    const xml = strFromU8(raw);
    const text = xml
      .replace(/<w:p[ >]/g, "\n<w:p ")
      .replace(/<w:tab\b[^>]*\/>/g, "\t")
      .replace(/<w:br\b[^>]*\/>/g, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&#x([0-9a-fA-F]+);/g, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n");
    chunks.push(text.trim());
  }
  return chunks.filter(Boolean).join("\n\n");
}

/** XLSX/XLS: converte cada planilha em texto tabular legível pelo parser. */
export async function extractSpreadsheetText(bytes: ArrayBuffer): Promise<string> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(new Uint8Array(bytes), { type: "array" });
  const chunks: string[] = [];
  for (const name of wb.SheetNames) {
    const sheet = wb.Sheets[name];
    if (!sheet) continue;
    const csv = XLSX.utils.sheet_to_csv(sheet, { FS: ";", blankrows: false });
    if (csv.trim()) chunks.push(`# Planilha: ${name}\n${csv.trim()}`);
  }
  return chunks.join("\n\n");
}

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
  if (ext === "docx") {
    const text = await extractDocxText(bytes);
    if (text.trim().length < 20) {
      return {
        text,
        note: "Não foi possível localizar texto no DOCX. Cole o conteúdo manualmente para extrair os dados técnicos.",
      };
    }
    return { text };
  }
  if (ext === "xlsx" || ext === "xlsm" || ext === "xls") {
    const text = await extractSpreadsheetText(bytes);
    if (text.trim().length < 20) {
      return {
        text,
        note: "A planilha não apresentou conteúdo textual legível. Cole os dados manualmente para extrair as informações técnicas.",
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
