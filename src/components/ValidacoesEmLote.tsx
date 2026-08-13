import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  DECISAO_LABEL,
  agruparValidacoes,
  lerDecisao,
  montarNota,
  proximoNumeroGrupo,
  type AchadoBase,
  type DecisaoAchado,
} from "@/lib/finding-review";

type Decisao = Exclude<DecisaoAchado, "pendente">;

const TOM: Record<Decisao, string> = {
  confirmado: "border-destructive/40 bg-destructive/10 text-destructive",
  relevado: "border-accent/50 bg-accent/10 text-accent-foreground",
  oposicao: "border-primary/40 bg-primary/10 text-foreground",
};

async function registrarAuditoria(
  action: string,
  comparisonId: string,
  metadata: Record<string, unknown>,
) {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("audit_logs").insert({
    actor_id: data.user.id,
    entity_type: "finding_validation",
    entity_id: comparisonId,
    action,
    metadata: metadata as never,
  });
}

/**
 * Validação humana em lote.
 *
 * No modo "divergencia" reúne achados divergentes sob uma única justificativa
 * numerada (relevar ou confirmar). No modo "oposicao" reúne trechos
 * compatíveis que o operador queira excepcionalmente contraditar por escrito.
 * Toda criação, edição ou desfazimento fica na trilha de auditoria.
 */
export function ValidacoesEmLote({
  comparisonId,
  achados,
  todos,
  modo = "divergencia",
  onSalvo,
}: {
  comparisonId: string;
  achados: AchadoBase[];
  todos?: AchadoBase[];
  modo?: "divergencia" | "oposicao";
  onSalvo: () => void;
}) {
  const oposicoes = modo === "oposicao";
  const universo = todos ?? achados;

  const grupos = useMemo(
    () =>
      agruparValidacoes(achados).filter((g) =>
        oposicoes ? g.decisao === "oposicao" : g.decisao !== "oposicao",
      ),
    [achados, oposicoes],
  );
  const pendentes = useMemo(
    () => achados.filter((a) => lerDecisao(a).decisao === "pendente"),
    [achados],
  );
  const avulsos = useMemo(
    () =>
      achados.filter((a) => {
        const d = lerDecisao(a);
        return d.decisao !== "pendente" && !d.grupo;
      }),
    [achados],
  );

  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [editSel, setEditSel] = useState<Record<string, boolean>>({});
  const [editTexto, setEditTexto] = useState("");

  const marcados = Object.keys(sel).filter((k) => sel[k]);
  const rotuloItem = oposicoes ? "trecho compatível" : "achado";

  const criar = async (decisao: Decisao) => {
    if (!marcados.length) {
      toast.error(`Selecione ao menos um ${rotuloItem}.`);
      return;
    }
    if (!texto.trim()) {
      toast.error(
        oposicoes ? "Escreva a oposição." : "Informe a justificativa da validação.",
      );
      return;
    }
    const numero = proximoNumeroGrupo(universo);
    setSalvando(true);
    const { error } = await supabase
      .from("findings")
      .update({ reviewed: true, reviewer_note: montarNota(decisao, texto, numero) })
      .in("id", marcados);
    if (error) {
      setSalvando(false);
      toast.error(error.message);
      return;
    }
    await registrarAuditoria(
      oposicoes ? "oposicao_lote_criada" : "validacao_lote_criada",
      comparisonId,
      { numero, decisao, justificativa: texto.trim(), finding_ids: marcados },
    );
    setSalvando(false);
    setSel({});
    setTexto("");
    toast.success(
      `${oposicoes ? "Oposição" : "Validação"} nº ${numero} registrada para ${marcados.length} item(ns).`,
    );
    onSalvo();
  };

  const abrirEdicao = (numero: number) => {
    const g = grupos.find((x) => x.numero === numero)!;
    const s: Record<string, boolean> = {};
    for (const a of g.achados) s[a.id] = true;
    setEditSel(s);
    setEditTexto(g.justificativa);
    setEditando(numero);
  };

  const salvarEdicao = async (numero: number, decisao: Decisao) => {
    const g = grupos.find((x) => x.numero === numero)!;
    const antes = g.achados.map((a) => a.id);
    const agora = Object.keys(editSel).filter((k) => editSel[k]);
    if (!agora.length) {
      toast.error(`Selecione ao menos um ${rotuloItem} ou desfaça o registro.`);
      return;
    }
    if (!editTexto.trim()) {
      toast.error(
        oposicoes ? "Escreva a oposição." : "Informe a justificativa da validação.",
      );
      return;
    }
    const removidos = antes.filter((id) => !agora.includes(id));
    setSalvando(true);
    if (removidos.length) {
      const { error } = await supabase
        .from("findings")
        .update({ reviewed: false, reviewer_note: null })
        .in("id", removidos);
      if (error) {
        setSalvando(false);
        toast.error(error.message);
        return;
      }
    }
    const { error } = await supabase
      .from("findings")
      .update({
        reviewed: true,
        reviewer_note: montarNota(decisao, editTexto, numero),
      })
      .in("id", agora);
    if (error) {
      setSalvando(false);
      toast.error(error.message);
      return;
    }
    await registrarAuditoria(
      oposicoes ? "oposicao_lote_editada" : "validacao_lote_editada",
      comparisonId,
      {
        numero,
        decisao,
        justificativa_anterior: g.justificativa,
        justificativa: editTexto.trim(),
        finding_ids_anterior: antes,
        finding_ids: agora,
        removidos,
      },
    );
    setSalvando(false);
    setEditando(null);
    toast.success(`Registro nº ${numero} atualizado.`);
    onSalvo();
  };

  const desfazer = async (numero: number) => {
    const g = grupos.find((x) => x.numero === numero)!;
    const ids = g.achados.map((a) => a.id);
    setSalvando(true);
    const { error } = await supabase
      .from("findings")
      .update({ reviewed: false, reviewer_note: null })
      .in("id", ids);
    if (error) {
      setSalvando(false);
      toast.error(error.message);
      return;
    }
    await registrarAuditoria(
      oposicoes ? "oposicao_lote_desfeita" : "validacao_lote_desfeita",
      comparisonId,
      { numero, justificativa: g.justificativa, finding_ids: ids },
    );
    setSalvando(false);
    setEditando(null);
    toast.success(`Registro nº ${numero} desfeito.`);
    onSalvo();
  };

  const linhaAchado = (
    a: AchadoBase,
    checked: boolean,
    onToggle: (v: boolean) => void,
    disabled?: boolean,
  ) => (
    <label
      key={a.id}
      className="flex items-start gap-3 rounded-sm border border-border px-3 py-2 text-sm"
    >
      <Checkbox
        checked={checked}
        disabled={disabled || salvando}
        onCheckedChange={(v) => onToggle(v === true)}
        className="mt-0.5"
      />
      <span className="leading-snug">
        <span className="eyebrow mr-2">{a.code}</span>
        {a.title}
      </span>
    </label>
  );

  if (!achados.length) return null;

  return (
    <section className="mt-8 print:hidden">
      <h3 className="text-lg">
        {oposicoes ? "Oposições a trechos compatíveis" : "Validação humana em lote"}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {oposicoes
          ? "Trechos tidos por compatíveis não exigem justificativa. Excepcionalmente, o conferente pode contraditá-los por escrito: selecione os trechos e registre a oposição, que fica na trilha de auditoria e no relatório."
          : "Reúna divergências com o mesmo motivo sob uma única justificativa numerada. Um achado só pode pertencer a uma validação por vez; a edição fica registrada na trilha de auditoria."}
      </p>

      {grupos.map((g) => (
        <div key={g.numero} className="panel mt-4 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">
              {oposicoes ? "Oposição" : "Validação"} nº {g.numero}
            </span>
            <span
              className={`rounded-sm border px-2 py-0.5 text-[11px] ${TOM[g.decisao]}`}
            >
              {DECISAO_LABEL[g.decisao]}
            </span>
            <span className="text-xs text-muted-foreground">
              {g.achados.length} item(ns)
            </span>
            <div className="ml-auto flex gap-2">
              {editando === g.numero ? (
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={salvando}
                  onClick={() => setEditando(null)}
                >
                  Cancelar
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={salvando}
                  onClick={() => abrirEdicao(g.numero)}
                >
                  Editar
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                disabled={salvando}
                onClick={() => desfazer(g.numero)}
              >
                Desfazer
              </Button>
            </div>
          </div>

          {editando === g.numero ? (
            <div className="mt-4 space-y-2">
              {[...g.achados, ...pendentes].map((a) =>
                linhaAchado(a, editSel[a.id] === true, (v) =>
                  setEditSel((s) => ({ ...s, [a.id]: v })),
                ),
              )}
              <Textarea
                rows={2}
                value={editTexto}
                onChange={(e) => setEditTexto(e.target.value)}
                placeholder={
                  oposicoes
                    ? "Oposição comum aos trechos selecionados"
                    : "Justificativa comum aos achados selecionados"
                }
              />
              <div className="flex flex-wrap gap-2">
                {oposicoes ? (
                  <Button
                    size="sm"
                    disabled={salvando}
                    onClick={() => salvarEdicao(g.numero, "oposicao")}
                  >
                    Salvar oposição
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      disabled={salvando}
                      onClick={() => salvarEdicao(g.numero, "relevado")}
                    >
                      Salvar como relevado
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={salvando}
                      onClick={() => salvarEdicao(g.numero, "confirmado")}
                    >
                      Salvar como divergência confirmada
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {g.justificativa}
              </p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {g.achados.map((a) => (
                  <li key={a.id}>
                    <span className="eyebrow mr-2">{a.code}</span>
                    {a.title}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      ))}

      <div className="panel mt-4 p-5">
        <span className="eyebrow">
          {oposicoes ? "Nova oposição" : "Nova validação"} nº{" "}
          {proximoNumeroGrupo(universo)}
        </span>
        {pendentes.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">
            {oposicoes
              ? "Nenhum trecho compatível disponível para oposição."
              : "Nenhum achado disponível: todos já estão vinculados a uma validação."}
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {pendentes.map((a) =>
              linhaAchado(a, sel[a.id] === true, (v) =>
                setSel((s) => ({ ...s, [a.id]: v })),
              ),
            )}
            <Textarea
              rows={2}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={
                oposicoes
                  ? "Oposição escrita aos trechos selecionados (ex.: apesar da coincidência métrica, o confrontante não corresponde ao registro)"
                  : "Justificativa comum aos achados selecionados (ex.: divergências de arredondamento dentro da tolerância adotada)"
              }
            />
            <div className="flex flex-wrap gap-2">
              {oposicoes ? (
                <Button
                  size="sm"
                  disabled={salvando}
                  onClick={() => criar("oposicao")}
                >
                  Registrar oposição ({marcados.length})
                </Button>
              ) : (
                <>
                  <Button size="sm" disabled={salvando} onClick={() => criar("relevado")}>
                    Relevar selecionados ({marcados.length})
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={salvando}
                    onClick={() => criar("confirmado")}
                  >
                    Confirmar divergência dos selecionados
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
        {avulsos.length > 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            {avulsos.length} item(ns) registrados individualmente não pertencem a
            nenhum lote.
          </p>
        )}
      </div>
    </section>
  );
}
