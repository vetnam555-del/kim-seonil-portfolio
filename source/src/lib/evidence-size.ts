import sizes from "@/data/evidence-sizes.json";

export function evidenceSize(file: string): { width: number; height: number } {
  const size = (sizes as Record<string, { width: number; height: number }>)[file];
  if (!size) throw new Error(`Missing evidence dimensions: ${file}. Run scripts/measure_evidence.py.`);
  return size;
}
