/** Extensões CAD aceitas — módulo neutro (seguro para SSR). */
export const CAD_EXTENSIONS = ["dwg", "dxf"];

export function isCadExtension(ext: string | null | undefined): boolean {
  return CAD_EXTENSIONS.includes((ext ?? "").toLowerCase().replace(".", ""));
}
