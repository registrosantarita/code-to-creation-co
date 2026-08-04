import {
  estimarCreditos,
  fmtCreditos,
  fmtTamanho,
  type EstimativaCreditos as Estimativa,
} from "@/lib/credit-estimator";

const ROTULO_OCR: Record<Estimativa["probabilidadeOcr"], string> = {
  nenhuma: "Sem OCR",
  possivel: "OCR possível",
  certa: "OCR certo",
};

export function EstimativaCreditosArquivo({
  arquivo,
  onConfirmar,
  onCancelar,
  processando,
}: {
  arquivo: File;
  onConfirmar: () => void;
  onCancelar: () => void;
  processando: boolean;
}) {
  const e = estimarCreditos(arquivo.name, arquivo.size);
  const faixa =
    e.creditosMax === 0
      ? "0 crédito"
      : `${fmtCreditos(e.creditosMin)} – ${fmtCreditos(e.creditosMax)} crédito(s)`;

  return (
    <div className="rounded-sm border border-border bg-muted/40 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{arquivo.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {fmtTamanho(e.tamanhoBytes)}
            {e.paginasEstimadas > 0
              ? ` · ~${e.paginasEstimadas} página(s) estimada(s)`
              : ""}
            {` · ${ROTULO_OCR[e.probabilidadeOcr]}`}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="eyebrow">Estimativa</p>
          <p className="text-lg">{faixa}</p>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {e.observacao} Base de cálculo: ~0,058 crédito por página digitalizada
        (medição real no gateway de IA). Valor indicativo, não vinculante.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          type="button"
          className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-60"
          onClick={onConfirmar}
          disabled={processando}
        >
          {processando ? "Enviando e extraindo..." : "Confirmar e processar"}
        </button>
        <button
          type="button"
          className="rounded-sm border border-border px-4 py-2 text-sm disabled:opacity-60"
          onClick={onCancelar}
          disabled={processando}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
