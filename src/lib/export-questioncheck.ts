/**
 * Relatório em PDF do QuestionCheck: identificação da conferência, perguntas
 * respondidas por seção/subseção, exigências, alertas e perfil responsável.
 * Gerado no cliente, sem consumo de créditos de IA.
 */
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { shrinkOnOverflow } from "./export-registral";

export type LinhaQuestionCheck = {
  numero: string;
  pergunta: string;
  resposta: string;
};

export type BlocoQuestionCheck = {
  secao: string;
  titulo: string;
  subsecao: string;
  linhas: LinhaQuestionCheck[];
};

export type ItemAcumulado = { texto: string; detalhe?: string | undefined; secao: string };

export type RelatorioQuestionCheckInput = {
  titulo: string;
  protocolo: string;
  tipoTitulo: string;
  secoes: string[];
  observacao: string;
  emitidoEm: string;
  progresso: { feitos: number; total: number; pct: number };
  blocos: BlocoQuestionCheck[];
  exigencias: ItemAcumulado[];
  alertas: ItemAcumulado[];
  perfil: string;
};

const M = 44;
const HEAD: [number, number, number] = [24, 28, 38];

export function exportarQuestionCheckPdf(
  input: RelatorioQuestionCheckInput,
  nomeArquivo: string,
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  let y = M;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("QuestionCheck — Relatório de conferência do título", M, y, { maxWidth: W - 2 * M });
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(input.titulo, M, y, { maxWidth: W - 2 * M });
  y += 16;
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`Emitido em ${input.emitidoEm} • Conferente: ${input.perfil}`, M, y, {
    maxWidth: W - 2 * M,
  });
  doc.setTextColor(0);
  y += 18;

  const fim = () => (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: y,
    head: [["Identificação da conferência", ""]],
    body: [
      ["Título", input.titulo || "—"],
      ["Prenotação", input.protocolo || "—"],
      ["Natureza do título", input.tipoTitulo || "—"],
      ["Seções aplicáveis", input.secoes.join(", ") || "—"],
      [
        "Progresso",
        `${input.progresso.feitos} de ${input.progresso.total} perguntas respondidas (${input.progresso.pct}%)`,
      ],
      ["Observações", input.observacao || "—"],
    ],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5, overflow: "linebreak" },
    headStyles: { fillColor: HEAD, textColor: 255 },
    columnStyles: { 0: { cellWidth: 150, fontStyle: "bold" } },
    margin: { left: M, right: M },
    didParseCell: shrinkOnOverflow(doc),
  });

  for (const bloco of input.blocos) {
    const rotulo = bloco.subsecao
      ? `Seção ${bloco.secao} — ${bloco.titulo} · ${bloco.subsecao}`
      : `Seção ${bloco.secao} — ${bloco.titulo}`;
    autoTable(doc, {
      startY: fim() + 16,
      head: [[{ content: rotulo, colSpan: 3 }], ["ID", "PERGUNTA", "RESPOSTA"]],
      body: bloco.linhas.map((l) => [l.numero, l.pergunta, l.resposta]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: HEAD, textColor: 255, fontSize: 8 },
      columnStyles: { 0: { cellWidth: 62 }, 2: { cellWidth: 150 } },
      margin: { left: M, right: M },
      didParseCell: shrinkOnOverflow(doc),
    });
  }

  autoTable(doc, {
    startY: fim() + 18,
    head: [["#", "Exigências apuradas", "Seção"]],
    body: input.exigencias.length
      ? input.exigencias.map((e, i) => [
          String(i + 1),
          `${e.texto}${e.detalhe ? ` (${e.detalhe})` : ""}`,
          e.secao,
        ])
      : [["—", "Nenhuma exigência acumulada.", "—"]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [140, 30, 30], textColor: 255, fontSize: 8 },
    columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 50 } },
    margin: { left: M, right: M },
    didParseCell: shrinkOnOverflow(doc),
  });

  autoTable(doc, {
    startY: fim() + 14,
    head: [["#", "Alertas acumulados", "Seção"]],
    body: input.alertas.length
      ? input.alertas.map((a, i) => [
          String(i + 1),
          `${a.texto}${a.detalhe ? ` (${a.detalhe})` : ""}`,
          a.secao,
        ])
      : [["—", "Nenhum alerta acumulado.", "—"]],
    theme: "grid",
    styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
    headStyles: { fillColor: [150, 110, 20], textColor: 255, fontSize: 8 },
    columnStyles: { 0: { cellWidth: 30 }, 2: { cellWidth: 50 } },
    margin: { left: M, right: M },
    didParseCell: shrinkOnOverflow(doc),
  });

  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(
    doc.splitTextToSize(
      `Relatório gerado pelo e-Qualifica a partir das respostas do checklist. Conferente: ${input.perfil}. O sistema apoia a decisão e não substitui a qualificação jurídica do Oficial.`,
      W - 2 * M,
    ) as string[],
    M,
    fim() + 22,
  );
  doc.setTextColor(0);

  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p += 1) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.text(`Página ${p} de ${total}`, W - M, doc.internal.pageSize.getHeight() - 20, {
      align: "right",
    });
    doc.setTextColor(0);
  }

  doc.save(nomeArquivo);
}
