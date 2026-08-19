/**
 * Painel "Relatórios" do CheckTítulo: gera o PDF e o XLSX de qualquer
 * comparação da conferência, a qualquer momento, e permite ao administrador
 * excluir comparações selecionadas (com registro na trilha de auditoria).
 */
import { useState } from "react";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CLASSIFICACAO, TONE_CLASS } from "@/lib/labels";
import { excluirComparacaoQualificacao } from "@/lib/admin.functions";
import { FileDown, FileSpreadsheet, Trash2 } from "lucide-react";

export type ComparacaoResumoQualificacao = {
  id: string;
  title: string;
  classification: string;
  summary: string;
  created_at: string;
};

export function RelatoriosQualificacao({
  comparacoes,
  admin,
  gerarPdf,
  gerarXlsx,
  onExcluido,
}: {
  comparacoes: ComparacaoResumoQualificacao[];
  admin: boolean;
  gerarPdf: (id: string) => Promise<void> | void;
  gerarXlsx: (id: string) => Promise<void> | void;
  onExcluido?: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [gerando, setGerando] = useState<string | null>(null);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [excluindo, setExcluindo] = useState(false);
  const excluirFn = useServerFn(excluirComparacaoQualificacao);

  const alternar = (id: string) =>
    setSelecionados((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function excluirSelecionados() {
    setExcluindo(true);
    try {
      await excluirFn({ data: { ids: selecionados } });
      toast.success(
        selecionados.length === 1
          ? "Comparação excluída."
          : `${selecionados.length} comparações excluídas.`,
      );
      setSelecionados([]);
      onExcluido?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao excluir.");
    } finally {
      setExcluindo(false);
    }
  }

  async function gerar(id: string, tipo: "pdf" | "xlsx") {
    setGerando(`${id}-${tipo}`);
    try {
      if (tipo === "pdf") await gerarPdf(id);
      else await gerarXlsx(id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gerar o relatório.");
    } finally {
      setGerando(null);
    }
  }

  return (
    <Dialog open={aberto} onOpenChange={setAberto}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!comparacoes.length}>
          <FileDown className="mr-2 h-4 w-4" /> Relatórios ({comparacoes.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Relatórios da conferência</DialogTitle>
          <DialogDescription>
            Gere o relatório completo em PDF ou a planilha XLSX de cada comparação. Os documentos
            apoiam a decisão e não substituem a qualificação jurídica do Oficial.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          {comparacoes.map((c) => {
            const cls = CLASSIFICACAO[c.classification] ?? CLASSIFICACAO["inconclusive"]!;
            return (
              <div key={c.id} className="rounded-md border border-border bg-card p-4">
                <div className="flex flex-wrap items-start gap-3">
                  {admin && (
                    <Checkbox
                      className="mt-1"
                      checked={selecionados.includes(c.id)}
                      onCheckedChange={() => alternar(c.id)}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.created_at).toLocaleString("pt-BR")} · {c.summary}
                    </p>
                  </div>
                  <span className={`rounded-sm border px-2 py-0.5 text-[11px] ${TONE_CLASS[cls.tone]}`}>
                    {cls.label}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={gerando !== null}
                    onClick={() => gerar(c.id, "pdf")}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    {gerando === `${c.id}-pdf` ? "Gerando…" : "Relatório PDF"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={gerando !== null}
                    onClick={() => gerar(c.id, "xlsx")}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    {gerando === `${c.id}-xlsx` ? "Gerando…" : "Planilha XLSX"}
                  </Button>
                </div>
              </div>
            );
          })}
          {!comparacoes.length && (
            <p className="text-sm text-muted-foreground">Nenhuma comparação registrada ainda.</p>
          )}
        </div>

        {admin && selecionados.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={excluindo}>
                <Trash2 className="mr-2 h-4 w-4" /> Excluir {selecionados.length} selecionada(s)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir comparações?</AlertDialogTitle>
                <AlertDialogDescription>
                  A exclusão é definitiva e fica registrada na trilha de auditoria.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => void excluirSelecionados()}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
