/**
 * Entregáveis do CheckTítulo:
 *  - PDF do relatório completo da comparação de qualificação;
 *  - XLSX com os dados conferidos, para conferência e arquivamento.
 * Tudo gerado no cliente, sem consumo de créditos de IA.
 */
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CLASSIFICACAO } from "./labels";
import { shrinkOnOverflow } from "./export-registral";
import type { LinhaConferencia } from "./qualificacao-compare";
import { ESPECIE_LABEL, type EspecieDocumento } from "./qualificacao-especie";
import type { ValidacaoQualificacao } from "@/components/ValidacoesQualificacao";
import { DECISAO_LABEL } from "@/components/ValidacoesQualificacao";

export type DocRelatorio = {
  id: string;
  label: string;
  doc_role?: string | null;
  doc_species?: string | null;
};

export type OnusRelatorio = {
  documento: string;
  itens: {
    ato?: string | undefined;
    especie?: string | undefined;
    data?: string | undefined;
    situacao?: string | undefined;
    teor?: string | undefined;
  }[];
};

export type RelatorioQualificacaoInput = {
  conjunto: string;
  comparacao: string;
  modo: string;
  emitidoEm: string;
  classificacao: string;
  resumo: string;
  criterios: string[];
  documentos: DocRelatorio[];
  linhas: LinhaConferencia[];
  validacoes: ValidacaoQualificacao[];
  chaveDe: (linha: LinhaConferencia, indice: number) => string;
  onus?: OnusRelatorio[];
};

const SITUACAO_LABEL: Record<LinhaConferencia["situacao"], string> = {
  conforme: "Conforme",
  divergente: "Divergente",
  incompleto: "Não comparado",
  invalido: "Inválido",
};

function especieLabel(v?: string | null): string {
  return ESPECIE_LABEL[(v ?? "nao_classificado") as EspecieDocumento] ?? "Não classificado";
}

function letra(i: number): string {
  return String.fromCharCode(65 + i);
}

function mapaChaves(input: RelatorioQualificacaoInput): Map<string, ValidacaoQualificacao> {
  const m = new Map<string, ValidacaoQualificacao>();
  for (const v of input.validacoes) for (const c of v.chaves) m.set(c, v);
  return m;
}

export function exportarQualificacaoPdf(
  input: RelatorioQualificacaoInput,
  nomeArquivo: string,
): void {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const M = 44;
  const W = doc.internal.pageSize.getWidth();
  const porChave = mapaChaves(input);
  let y = M;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("CheckTítulo — Relatório de conferência de qualificação", M, y, {
    maxWidth: W - 2 * M,
  });
  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(input.conjunto, M, y, { maxWidth: W - 2 * M });
  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(`${input.comparacao} • ${input.modo} • Emitido em ${input.emitidoEm}`, M, y, {
    maxWidth: W - 2 * M,
  });
  doc.setTextColor(0);
  y += 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(
    `Classificação: ${CLASSIFICACAO[input.classificacao]?.label ?? "Inconclusivo"}`,
    M,
    y,
  );
  doc.setFont("helvetica", "normal");
  y += 16;

  doc.setFontSize(10);
  const resumo = doc.splitTextToSize(input.resumo, W - 2 * M) as string[];
  doc.text(resumo, M, y);
  y += resumo.length * 13 + 6;

  const fim = () =>
    (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY;

  autoTable(doc, {
    startY: y,
    head: [["Doc.", "Rótulo", "Papel", "Espécie"]],
    body: input.documentos.map((d, i) => [
      letra(i),
      d.label,
      d.doc_role === "matricula" ? "Matrícula" : "Título",
      especieLabel(d.doc_species),
    ]),
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [24, 28, 38], textColor: 255 },
    margin: { left: M, right: M },
    didParseCell: shrinkOnOverflow(doc),
  });

  autoTable(doc, {
    startY: fim() + 14,
    head: [["Critérios conferidos"]],
    body: [[input.criterios.join(" · ")]],
    theme: "grid",
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [24, 28, 38], textColor: 255 },
    margin: { left: M, right: M },
    didParseCell: shrinkOnOverflow(doc),
  });

  // Resultado por bloco
  const blocos = new Map<string, LinhaConferencia[]>();
  input.linhas.forEach((l) => {
    const arr = blocos.get(l.bloco) ?? [];
    arr.push(l);
    blocos.set(l.bloco, arr);
  });

  for (const [bloco, linhas] of blocos) {
    autoTable(doc, {
      startY: fim() + 16,
      head: [
        [
          bloco,
          ...input.documentos.map((_, i) => `Doc. ${letra(i)}`),
          "Situação",
          "Observação",
        ],
      ],
      body: linhas.map((l, idx) => {
        const v = porChave.get(input.chaveDe(l, idx));
        return [
          l.campo,
          ...input.documentos.map((_, i) => l.valores[i] ?? "—"),
          v
            ? `${SITUACAO_LABEL[l.situacao]} (val. nº ${v.numero} — ${DECISAO_LABEL[v.decisao]})`
            : SITUACAO_LABEL[l.situacao],
          l.observacao ?? "—",
        ];
      }),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [24, 28, 38], textColor: 255, fontSize: 8 },
      margin: { left: M, right: M },
      didParseCell: shrinkOnOverflow(doc),
    });
  }

  for (const o of input.onus ?? []) {
    if (!o.itens.length) continue;
    autoTable(doc, {
      startY: fim() + 16,
      head: [[`Ônus e direitos reais — ${o.documento}`, "Espécie", "Data", "Situação", "Teor"]],
      body: o.itens.map((i) => [
        i.ato ?? "—",
        i.especie ?? "—",
        i.data ?? "—",
        i.situacao ?? "—",
        i.teor ?? "—",
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [24, 28, 38], textColor: 255, fontSize: 8 },
      margin: { left: M, right: M },
      didParseCell: shrinkOnOverflow(doc),
    });
  }

  if (input.validacoes.length) {
    autoTable(doc, {
      startY: fim() + 16,
      head: [["Nº", "Decisão do conferente", "Itens", "Justificativa"]],
      body: input.validacoes.map((v) => [
        String(v.numero),
        DECISAO_LABEL[v.decisao],
        String(v.chaves.length),
        v.justificativa,
      ]),
      theme: "grid",
      styles: { fontSize: 8, cellPadding: 4, overflow: "linebreak" },
      headStyles: { fillColor: [24, 28, 38], textColor: 255, fontSize: 8 },
      margin: { left: M, right: M },
      didParseCell: shrinkOnOverflow(doc),
    });
  }

  const rodape = fim() + 24;
  doc.setFontSize(8);
  doc.setTextColor(110);
  doc.text(
    doc.splitTextToSize(
      "Conferência instrumental produzida por regras determinísticas. O resultado apoia a decisão e não substitui a qualificação jurídica do Oficial de Registro.",
      W - 2 * M,
    ) as string[],
    M,
    rodape > doc.internal.pageSize.getHeight() - 60 ? (doc.addPage(), M) : rodape,
  );
  doc.setTextColor(0);

  doc.save(nomeArquivo);
}

export function exportarQualificacaoXlsx(
  input: RelatorioQualificacaoInput,
  nomeArquivo: string,
): void {
  const porChave = mapaChaves(input);
  const wb = utils.book_new();

  const cab = [
    "Bloco",
    "Campo",
    ...input.documentos.map((d, i) => `Doc. ${letra(i)} — ${d.label}`),
    "Situação",
    "Validação",
    "Observação",
  ];
  const corpo = input.linhas.map((l, idx) => {
    const v = porChave.get(input.chaveDe(l, idx));
    return [
      l.bloco,
      l.campo,
      ...input.documentos.map((_, i) => l.valores[i] ?? ""),
      SITUACAO_LABEL[l.situacao],
      v ? `nº ${v.numero} — ${DECISAO_LABEL[v.decisao]}` : "",
      l.observacao ?? "",
    ];
  });
  const ws = utils.aoa_to_sheet([cab, ...corpo]);
  ws["!cols"] = cab.map(() => ({ wch: 28 }));
  utils.book_append_sheet(wb, ws, "Conferência");

  const wsDocs = utils.aoa_to_sheet([
    ["Doc.", "Rótulo", "Papel", "Espécie"],
    ...input.documentos.map((d, i) => [
      letra(i),
      d.label,
      d.doc_role === "matricula" ? "Matrícula" : "Título",
      especieLabel(d.doc_species),
    ]),
  ]);
  wsDocs["!cols"] = [{ wch: 8 }, { wch: 40 }, { wch: 14 }, { wch: 26 }];
  utils.book_append_sheet(wb, wsDocs, "Documentos");

  if (input.validacoes.length) {
    const wsVal = utils.aoa_to_sheet([
      ["Nº", "Decisão", "Itens", "Justificativa"],
      ...input.validacoes.map((v) => [
        v.numero,
        DECISAO_LABEL[v.decisao],
        v.chaves.length,
        v.justificativa,
      ]),
    ]);
    wsVal["!cols"] = [{ wch: 6 }, { wch: 28 }, { wch: 8 }, { wch: 70 }];
    utils.book_append_sheet(wb, wsVal, "Validações");
  }

  const onusRows = (input.onus ?? []).flatMap((o) =>
    o.itens.map((i) => [
      o.documento,
      i.ato ?? "",
      i.especie ?? "",
      i.data ?? "",
      i.situacao ?? "",
      i.teor ?? "",
    ]),
  );
  if (onusRows.length) {
    const wsOnus = utils.aoa_to_sheet([
      ["Documento", "Ato", "Espécie", "Data", "Situação", "Teor"],
      ...onusRows,
    ]);
    wsOnus["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 60 }];
    utils.book_append_sheet(wb, wsOnus, "Ônus e direitos reais");
  }

  writeFile(wb, nomeArquivo);
}
