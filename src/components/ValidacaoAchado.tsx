import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DECISAO_LABEL,
  ehDivergencia,
  lerDecisao,
  montarNota,
  type DecisaoAchado,
} from "@/lib/finding-review";

type Achado = {
  id: string;
  severity?: string;
  reviewed: boolean | null;
  reviewer_note: string | null;
};

const TOM: Record<DecisaoAchado, string> = {
  pendente: "border-border bg-muted text-muted-foreground",
  confirmado: "border-destructive/40 bg-destructive/10 text-destructive",
  relevado: "border-accent/50 bg-accent/10 text-accent-foreground",
  oposicao: "border-primary/40 bg-primary/10 text-foreground",
};

/**
 * Painel de validação humana de um achado.
 *
 * Divergências admitem relevação com justificativa ou confirmação; trechos
 * compatíveis (informativos) não precisam de justificativa e só podem ser
 * excepcionalmente contraditados por meio de uma oposição escrita.
 */
export function ValidacaoAchado({
  achado,
  onSalvo,
}: {
  achado: Achado;
  onSalvo: () => void;
}) {
  const atual = lerDecisao(achado);
  const divergencia = ehDivergencia(achado.severity ?? "critical");
  const [justificativa, setJustificativa] = useState(atual.justificativa);
  const [salvando, setSalvando] = useState(false);
  const [abrirOposicao, setAbrirOposicao] = useState(false);

  const salvar = async (decisao: Exclude<DecisaoAchado, "pendente">) => {
    if (!justificativa.trim()) {
      toast.error(
        decisao === "oposicao"
          ? "Escreva a oposição ao trecho compatível."
          : "Informe a justificativa da decisão.",
      );
      return;
    }
    setSalvando(true);
    const { error } = await supabase
      .from("findings")
      .update({ reviewed: true, reviewer_note: montarNota(decisao, justificativa) })
      .eq("id", achado.id);
    setSalvando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(
      decisao === "relevado"
        ? "Achado relevado."
        : decisao === "oposicao"
          ? "Oposição registrada."
          : "Divergência confirmada.",
    );
    onSalvo();
  };

  const reabrir = async () => {
    setSalvando(true);
    const { error } = await supabase
      .from("findings")
      .update({ reviewed: false, reviewer_note: null })
      .eq("id", achado.id);
    setSalvando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setJustificativa("");
    setAbrirOposicao(false);
    toast.success("Validação reaberta.");
    onSalvo();
  };

  return (
    <div className="mt-4 rounded-sm border border-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="eyebrow">
          {divergencia ? "Validação humana" : "Oposição do conferente"}
        </span>
        {(divergencia || atual.decisao !== "pendente") && (
          <span
            className={`rounded-sm border px-2 py-0.5 text-[11px] ${TOM[atual.decisao]}`}
          >
            {DECISAO_LABEL[atual.decisao]}
          </span>
        )}
        {atual.grupo && (
          <span className="text-[11px] text-muted-foreground">
            Vinculado à validação humana nº {atual.grupo}
          </span>
        )}
      </div>

      {atual.decisao !== "pendente" && (
        <p className="mt-3 text-sm leading-relaxed text-foreground">
          {atual.justificativa}
        </p>
      )}

      {atual.grupo ? (
        <p className="mt-3 text-xs text-muted-foreground print:hidden">
          Para alterar esta decisão, edite a validação nº {atual.grupo} no painel
          de validação humana em lote, ao final da página.
        </p>
      ) : divergencia ? (
        <div className="print:hidden">
          <Textarea
            className="mt-3"
            rows={2}
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Justificativa do Oficial/conferente (ex.: divergência de arredondamento aceita; erro material sanado por retificação...)"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" disabled={salvando} onClick={() => salvar("relevado")}>
              Relevar com justificativa
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={salvando}
              onClick={() => salvar("confirmado")}
            >
              Confirmar divergência
            </Button>
            {atual.decisao !== "pendente" && (
              <Button size="sm" variant="ghost" disabled={salvando} onClick={reabrir}>
                Reabrir
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="print:hidden">
          {abrirOposicao || atual.decisao !== "pendente" ? (
            <>
              <Textarea
                className="mt-3"
                rows={2}
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder="Oposição escrita ao trecho tido por compatível (ex.: apesar da coincidência métrica, o confrontante não corresponde ao registro)"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" disabled={salvando} onClick={() => salvar("oposicao")}>
                  Registrar oposição
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={salvando}
                  onClick={() =>
                    atual.decisao === "pendente" ? setAbrirOposicao(false) : reabrir()
                  }
                >
                  {atual.decisao === "pendente" ? "Cancelar" : "Retirar oposição"}
                </Button>
              </div>
            </>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-xs text-muted-foreground">
                Trecho compatível — não exige justificativa.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="ml-auto"
                onClick={() => setAbrirOposicao(true)}
              >
                Oposições
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
