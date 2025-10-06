// Stabilization shim — safe to remove after domain refactor.

export type Primitive = string | number | boolean | null | undefined;

export function coerceJson<T = any>(v: unknown): T {
  if (v == null) return {} as T;
  if (Array.isArray(v)) return v.map(coerceJson) as any;
  if (typeof v === 'object') {
    const out: Record<string, any> = {};
    for (const k of Object.keys(v as any)) out[k] = coerceJson((v as any)[k]);
    return out as T;
  }
  if (typeof v === 'number') return (Number.isFinite(v) ? v : 0) as any;
  return v as any;
}

export function coerceNumber(n: unknown, fallback = 0): number {
  const x = typeof n === 'string' ? Number(n) : Number(n ?? fallback);
  return Number.isFinite(x) ? x : fallback;
}
