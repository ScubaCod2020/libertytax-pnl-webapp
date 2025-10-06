export function sanitizeKpi<T extends Record<string, any>>(obj: T | null | undefined): T {
  const src: Record<string, any> = obj ?? {};
  const out: Record<string, any> = {};
  for (const k of Object.keys(src)) {
    const v = src[k];
    out[k] =
      typeof v === 'number'
        ? Number.isFinite(v)
          ? v
          : 0
        : (v ?? (typeof v === 'string' ? '' : v));
  }
  return out as T;
}
