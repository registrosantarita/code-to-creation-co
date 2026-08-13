import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DECISAO_LABEL,
  lerDecisao,
  montarNota,
  type DecisaoAchado,
} from "@/lib/finding-review";

type Achado = {
  id: string;
  reviewed: boolean | null;
  reviewer_note: string | null;
};

const TOM: Record<DecisaoAchado, string> = {
  pendente: "border-border bg-muted text-muted-foreground",
  confirmado: "border-destructive/40 bg-destructive/10 text-destructive",
  relevado: "border-accent/50 bg-accent/10 text-accent-foreground",
};

/**
 * Painel de validação humana de um achado: o conferente confirma a
 * divergência ou a releva mediante justificativa registrada no relatório.
 */
export function ValidacaoAchado({
  achado,
  onSalvo,
}: {
  achado: Achado;
  onSalvo: () => void;
}) {
  const atual = lerDecisao(achado);
  const [justificativa, setJustificativa] = useState(atual.justificativa);
  const [salvando, setSalvando] = useState(false);

  const salvar = async (decisao: Exclude<DecisaoAchado, "pendente">) => {
    if (!justificativa.trim()) {
      toast.error("Informe a justificativa da decisão.");
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
      decisao === "relevado" ? "Achado relevado." : "Divergência confirmada.",
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
    toast.success("Validação reaberta.");
    onSalvo();
  };

  return (
    <div className="mt-4 rounded-sm border border-border p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="eyebrow">Validação humana</span>
        <span
          className={`rounded-sm border px-2 py-0.5 text-[11px] ${TOM[atual.decisao]}`}
        >
          {DECISAO_LABEL[atual.decisao]}
        </span>
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
      ) : (
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
      )}
    </div>
  );
}
