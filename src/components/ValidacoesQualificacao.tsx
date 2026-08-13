import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { salvarValidacoes } from "@/lib/qualificacao.functions";

export type DecisaoQualificacao = "relevado" | "confirmado" | "oposicao";

export type ValidacaoQualificacao = {
  numero: number;
  decisao: DecisaoQualificacao;
  justificativa: string;
  chaves: string[];
};

export type ItemDivergente = {
  chave: string;
  bloco: string;
  campo: string;
  detalhe: string;
};

export const DECISAO_LABEL: Record<DecisaoQualificacao, string> = {
  relevado: "Relevado / justificado",
  confirmado: "Divergência confirmada",
  oposicao: "Oposição registrada",
};

const TOM: Record<DecisaoQualificacao, string> = {
  confirmado: "border-destructive/40 bg-destructive/10 text-destructive",
  relevado: "border-accent/50 bg-accent/10 text-accent-foreground",
  oposicao: "border-primary/40 bg-primary/10 text-foreground",
};

/** Normaliza o que vier do banco (jsonb) para o formato tipado. */
export function lerValidacoes(raw: unknown): ValidacaoQualificacao[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((v): v is ValidacaoQualificacao => {
      const o = v as ValidacaoQualificacao;
      return !!o && typeof o.numero === "number" && Array.isArray(o.chaves);
    })
    .map((v) => ({
      numero: v.numero,
      decisao: (v.decisao === "confirmado"
        ? "confirmado"
        : v.decisao === "oposicao"
          ? "oposicao"
          : "relevado") as DecisaoQualificacao,
      justificativa: String(v.justificativa ?? ""),
      chaves: v.chaves.map(String),
    }))
    .sort((a, b) => a.numero - b.numero);
}

/** Mapa chave -> validação, para exibir o vínculo na tabela de resultado. */
export function mapaValidacoes(
  validacoes: ValidacaoQualificacao[],
): Map<string, ValidacaoQualificacao> {
  const m = new Map<string, ValidacaoQualificacao>();
  for (const v of validacoes) for (const c of v.chaves) m.set(c, v);
  return m;
}

/**
 * Validação humana em lote das divergências do CheckTítulo: vários pontos
 * divergentes recebem uma única justificativa numerada, editável, com
 * registro na trilha de auditoria.
 */
export function ValidacoesQualificacao({
  setId,
  itens,
  validacoes,
  modo = "divergencia",
  onSalvo,
}: {
  setId: string;
  itens: ItemDivergente[];
  validacoes: ValidacaoQualificacao[];
  modo?: "divergencia" | "oposicao";
  onSalvo: () => void;
}) {
  const oposicoes = modo === "oposicao";
  const rotulo = oposicoes ? "Oposição" : "Validação";
  const salvarFn = useServerFn(salvarValidacoes);
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const [texto, setTexto] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState<number | null>(null);
  const [editSel, setEditSel] = useState<Record<string, boolean>>({});
  const [editTexto, setEditTexto] = useState("");

  const porChave = useMemo(() => mapaValidacoes(validacoes), [validacoes]);
  const disponiveis = useMemo(
    () => itens.filter((i) => !porChave.has(i.chave)),
    [itens, porChave],
  );
  const proximoNumero = useMemo(
    () => (validacoes.length ? Math.max(...validacoes.map((v) => v.numero)) + 1 : 1),
    [validacoes],
  );

  const itemDe = (chave: string) => itens.find((i) => i.chave === chave);
  const marcados = Object.keys(sel).filter((k) => sel[k]);

  const persistir = async (
    lista: ValidacaoQualificacao[],
    acao: string,
    detalhe: Record<string, unknown>,
    sucesso: string,
  ) => {
    setSalvando(true);
    try {
      await salvarFn({ data: { setId, validacoes: lista, acao, detalhe } });
      toast.success(sucesso);
      onSalvo();
      return true;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao gravar a validação.");
      return false;
    } finally {
      setSalvando(false);
    }
  };

  const criar = async (decisao: DecisaoQualificacao) => {
    if (!marcados.length) {
      toast.error("Selecione ao menos uma divergência.");
      return;
    }
    if (!texto.trim()) {
      toast.error("Informe a justificativa da validação.");
      return;
    }
    const nova: ValidacaoQualificacao = {
      numero: proximoNumero,
      decisao,
      justificativa: texto.trim(),
      chaves: marcados,
    };
    const ok = await persistir(
      [...validacoes, nova],
      "validacao_lote_criada",
      { numero: nova.numero, decisao, justificativa: nova.justificativa, chaves: marcados },
      `Validação nº ${nova.numero} registrada para ${marcados.length} divergência(s).`,
    );
    if (ok) {
      setSel({});
      setTexto("");
    }
  };

  const abrirEdicao = (numero: number) => {
    const g = validacoes.find((v) => v.numero === numero);
    if (!g) return;
    const s: Record<string, boolean> = {};
    for (const c of g.chaves) s[c] = true;
    setEditSel(s);
    setEditTexto(g.justificativa);
    setEditando(numero);
  };

  const salvarEdicao = async (numero: number, decisao: DecisaoQualificacao) => {
    const g = validacoes.find((v) => v.numero === numero);
    if (!g) return;
    const agora = Object.keys(editSel).filter((k) => editSel[k]);
    if (!agora.length) {
      toast.error("Selecione ao menos uma divergência ou desfaça a validação.");
      return;
    }
    if (!editTexto.trim()) {
      toast.error("Informe a justificativa da validação.");
      return;
    }
    const lista = validacoes.map((v) =>
      v.numero === numero
        ? { ...v, decisao, justificativa: editTexto.trim(), chaves: agora }
        : v,
    );
    const ok = await persistir(
      lista,
      "validacao_lote_editada",
      {
        numero,
        decisao,
        justificativa_anterior: g.justificativa,
        justificativa: editTexto.trim(),
        chaves_anterior: g.chaves,
        chaves: agora,
      },
      `Validação nº ${numero} atualizada.`,
    );
    if (ok) setEditando(null);
  };

  const desfazer = async (numero: number) => {
    const g = validacoes.find((v) => v.numero === numero);
    if (!g) return;
    const ok = await persistir(
      validacoes.filter((v) => v.numero !== numero),
      "validacao_lote_desfeita",
      { numero, justificativa: g.justificativa, chaves: g.chaves },
      `Validação nº ${numero} desfeita.`,
    );
    if (ok) setEditando(null);
  };

  const linha = (
    item: ItemDivergente,
    checked: boolean,
    onToggle: (v: boolean) => void,
  ) => (
    <label
      key={item.chave}
      className="flex items-start gap-3 rounded-sm border border-border px-3 py-2 text-sm"
    >
      <Checkbox
        checked={checked}
        disabled={salvando}
        onCheckedChange={(v) => onToggle(v === true)}
        className="mt-0.5"
      />
      <span className="leading-snug">
        <span className="eyebrow mr-2">{item.bloco}</span>
        {item.campo}
        <span className="block text-xs text-muted-foreground">{item.detalhe}</span>
      </span>
    </label>
  );

  if (!itens.length) return null;

  return (
    <section className="mt-10 print:hidden">
      <h3 className="font-display text-lg text-foreground">
        {oposicoes ? "Oposições a itens conformes" : "Validação humana em lote"}
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">
        {oposicoes
          ? "Itens conformes não exigem justificativa. Excepcionalmente, o conferente pode contraditá-los por escrito; a oposição fica registrada na trilha de auditoria."
          : "Reúna divergências com o mesmo motivo sob uma única justificativa numerada. Uma divergência só pode pertencer a uma validação por vez; toda edição fica registrada na trilha de auditoria. A qualificação jurídica permanece com o Oficial."}
      </p>

      {validacoes
        .filter((g) => (oposicoes ? g.decisao === "oposicao" : g.decisao !== "oposicao"))
        .map((g) => (
        <div key={g.numero} className="mt-4 rounded-md border border-border bg-card p-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">{rotulo} nº {g.numero}</span>
            <span className={`rounded-sm border px-2 py-0.5 text-[11px] ${TOM[g.decisao]}`}>
              {DECISAO_LABEL[g.decisao]}
            </span>
            <span className="text-xs text-muted-foreground">
              {g.chaves.length} item(ns)
            </span>
            <div className="ml-auto flex gap-2">
              {editando === g.numero ? (
                <Button size="sm" variant="ghost" disabled={salvando} onClick={() => setEditando(null)}>
                  Cancelar
                </Button>
              ) : (
                <Button size="sm" variant="outline" disabled={salvando} onClick={() => abrirEdicao(g.numero)}>
                  Editar
                </Button>
              )}
              <Button size="sm" variant="ghost" disabled={salvando} onClick={() => desfazer(g.numero)}>
                Desfazer
              </Button>
            </div>
          </div>

          {editando === g.numero ? (
            <div className="mt-4 space-y-2">
              {[
                ...g.chaves.map(itemDe).filter((i): i is ItemDivergente => !!i),
                ...disponiveis,
              ].map((i) =>
                linha(i, editSel[i.chave] === true, (v) =>
                  setEditSel((s) => ({ ...s, [i.chave]: v })),
                ),
              )}
              <Textarea
                rows={2}
                value={editTexto}
                onChange={(e) => setEditTexto(e.target.value)}
                placeholder="Justificativa comum às divergências selecionadas"
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
                    <Button size="sm" disabled={salvando} onClick={() => salvarEdicao(g.numero, "relevado")}>
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
              <p className="mt-3 text-sm leading-relaxed text-foreground">{g.justificativa}</p>
              <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                {g.chaves.map((c) => {
                  const i = itemDe(c);
                  return (
                    <li key={c}>
                      <span className="eyebrow mr-2">{i?.bloco ?? "—"}</span>
                      {i?.campo ?? c}
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>
      ))}

      <div className="mt-4 rounded-md border border-border bg-card p-5">
        <span className="eyebrow">
          {oposicoes ? "Nova oposição" : "Nova validação"} nº {proximoNumero}
        </span>
        {disponiveis.length ? (
          <div className="mt-3 space-y-2">
            {disponiveis.map((i) =>
              linha(i, sel[i.chave] === true, (v) => setSel((s) => ({ ...s, [i.chave]: v }))),
            )}
            <Textarea
              rows={2}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={
                oposicoes
                  ? "Oposição escrita aos itens conformes selecionados"
                  : "Justificativa comum às divergências selecionadas"
              }
            />
            <div className="flex flex-wrap gap-2">
              {oposicoes ? (
                <Button size="sm" disabled={salvando} onClick={() => criar("oposicao")}>
                  Registrar oposição
                </Button>
              ) : (
                <>
                  <Button size="sm" disabled={salvando} onClick={() => criar("relevado")}>
                    Relevar selecionadas
                  </Button>
                  <Button size="sm" variant="outline" disabled={salvando} onClick={() => criar("confirmado")}>
                    Confirmar divergência
                  </Button>
                </>
              )}
            </div>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            {oposicoes
              ? "Todos os itens conformes já possuem oposição registrada."
              : "Todas as divergências já estão vinculadas a uma validação."}
          </p>
        )}
      </div>
    </section>
  );
}
