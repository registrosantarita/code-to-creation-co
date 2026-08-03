import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import { z } from "zod";
import { parseMemorial } from "./memorial-parser";
import {
  DEFAULT_TOLERANCES,
  compareParcels,
  type ParcelInput,
  type Tolerances,
} from "./comparison-engine";

const ProcessInput = z.object({ documentId: z.string().uuid() });

export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => ProcessInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: doc, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", data.documentId)
      .single();
    if (error || !doc) throw new Error("Documento não encontrado.");

    let text = doc.original_text ?? "";
    let note: string | undefined;

    if (!text && doc.storage_path) {
      const { data: file, error: dlError } = await supabase.storage
        .from("documentos")
        .download(doc.storage_path);
      if (dlError || !file) throw new Error("Falha ao ler o arquivo armazenado.");
      const { extractTextFromFile } = await import("./extraction.server");
      const result = await extractTextFromFile(
        await file.arrayBuffer(),
        doc.file_extension ?? "",
      );
      text = result.text;
      note = result.note;
    }

    if (!text.trim()) {
      await supabase
        .from("documents")
        .update({
          status: "failed",
          error_message: note ?? "Nenhum texto pôde ser extraído.",
        })
        .eq("id", doc.id);
      return { ok: false as const, message: note ?? "Nenhum texto pôde ser extraído." };
    }

    const parsed = parseMemorial(text);

    await supabase.from("parcels").delete().eq("document_id", doc.id);

    const { data: parcel, error: parcelError } = await supabase
      .from("parcels")
      .insert({
        document_id: doc.id,
        analysis_id: doc.analysis_id,
        label: parsed.label,
        area_m2: parsed.area_m2,
        declared_perimeter_m: parsed.declared_perimeter_m,
        computed_perimeter_m: parsed.computed_perimeter_m,
        vertex_count: parsed.vertex_count,
        confrontantes: parsed.confrontantes,
        raw_extraction: { warnings: parsed.warnings },
      })
      .select("id")
      .single();
    if (parcelError || !parcel) throw new Error("Falha ao registrar a extração.");

    if (parsed.segments.length > 0) {
      const { error: segError } = await supabase.from("segments").insert(
        parsed.segments.map((s) => ({
          parcel_id: parcel.id,
          analysis_id: doc.analysis_id,
          seq: s.seq,
          from_vertex: s.from_vertex,
          to_vertex: s.to_vertex,
          bearing_text: s.bearing_text,
          azimuth_deg: s.azimuth_deg,
          distance_m: s.distance_m,
          confrontante: s.confrontante,
          raw_text: s.raw_text,
        })),
      );
      if (segError) throw new Error("Falha ao registrar os segmentos.");
    }

    await supabase
      .from("documents")
      .update({
        status: "parsed",
        extracted_text: text.slice(0, 200000),
        error_message: note ?? null,
      })
      .eq("id", doc.id);

    await supabase.from("audit_logs").insert({
      actor_id: userId,
      entity_type: "document",
      entity_id: doc.id,
      action: "extract",
      metadata: {
        segmentos: parsed.segments.length,
        area_m2: parsed.area_m2,
        avisos: parsed.warnings,
      },
    });

    return {
      ok: true as const,
      segments: parsed.segments.length,
      warnings: parsed.warnings,
      note,
    };
  });

const CompareInput = z.object({
  analysisId: z.string().uuid(),
  documentAId: z.string().uuid(),
  documentBId: z.string().uuid(),
  comparisonType: z.enum([
    "memorial_to_memorial",
    "boundary_to_boundary",
    "memorial_to_registry",
    "custom",
  ]),
  tolerances: z
    .object({
      areaPct: z.number().min(0).max(100),
      perimeterPct: z.number().min(0).max(100),
      distanceM: z.number().min(0).max(1000),
      azimuthDeg: z.number().min(0).max(180),
    })
    .optional(),
});

export const runComparison = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CompareInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const tol: Tolerances = data.tolerances ?? DEFAULT_TOLERANCES;

    async function loadParcel(documentId: string): Promise<{
      parcel: ParcelInput;
      label: string;
    } | null> {
      const { data: doc } = await supabase
        .from("documents")
        .select("id, file_name, source_type")
        .eq("id", documentId)
        .single();
      const { data: parcel } = await supabase
        .from("parcels")
        .select("*")
        .eq("document_id", documentId)
        .maybeSingle();
      if (!parcel) return null;
      const { data: segments } = await supabase
        .from("segments")
        .select("*")
        .eq("parcel_id", parcel.id)
        .order("seq");
      return {
        label: doc?.file_name ?? "Texto colado",
        parcel: {
          label: parcel.label,
          area_m2: parcel.area_m2 === null ? null : Number(parcel.area_m2),
          declared_perimeter_m:
            parcel.declared_perimeter_m === null
              ? null
              : Number(parcel.declared_perimeter_m),
          computed_perimeter_m:
            parcel.computed_perimeter_m === null
              ? null
              : Number(parcel.computed_perimeter_m),
          vertex_count: parcel.vertex_count,
          confrontantes: parcel.confrontantes ?? [],
          segments: (segments ?? []).map((s) => ({
            seq: s.seq,
            from_vertex: s.from_vertex,
            to_vertex: s.to_vertex,
            azimuth_deg: s.azimuth_deg === null ? null : Number(s.azimuth_deg),
            distance_m: s.distance_m === null ? null : Number(s.distance_m),
            confrontante: s.confrontante,
          })),
        },
      };
    }

    const a = await loadParcel(data.documentAId);
    const b = await loadParcel(data.documentBId);
    if (!a || !b) {
      throw new Error(
        "Ambos os documentos precisam ter extração concluída antes da comparação.",
      );
    }

    const result = compareParcels(a.parcel, b.parcel, tol, {
      a: a.label,
      b: b.label,
    });

    const { data: comparison, error } = await supabase
      .from("comparisons")
      .insert({
        analysis_id: data.analysisId,
        comparison_type: data.comparisonType,
        status: "completed",
        classification: result.classification,
        document_a_id: data.documentAId,
        document_b_id: data.documentBId,
        tolerances: tol,
        summary: result.summary,
        metrics: result.metrics as unknown as Json,
        created_by: userId,
      })
      .select("id")
      .single();
    if (error || !comparison) throw new Error("Falha ao registrar a comparação.");

    if (result.findings.length > 0) {
      await supabase.from("findings").insert(
        result.findings.map((f) => ({
          comparison_id: comparison.id,
          analysis_id: data.analysisId,
          severity: f.severity,
          code: f.code,
          title: f.title,
          description: f.description,
          evidence: f.evidence as unknown as Json,
        })),
      );
    }

    await supabase.from("audit_logs").insert({
      actor_id: userId,
      entity_type: "comparison",
      entity_id: comparison.id,
      action: "run",
      metadata: { classificacao: result.classification, tolerancias: tol },
    });

    return { comparisonId: comparison.id, classification: result.classification };
  });
