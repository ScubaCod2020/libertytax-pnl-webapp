// Tiny stable hash for JSON-able objects (order-insensitive by key sort)
export function stableHash(obj: unknown): string {
  const seen = new WeakSet();
  const normalize = (o: any): any => {
    if (o && typeof o === 'object') {
      if (seen.has(o)) return null;
      seen.add(o);
      if (Array.isArray(o)) return o.map(normalize);
      return Object.keys(o)
        .sort()
        .reduce((acc, k) => {
          acc[k] = normalize(o[k]);
          return acc;
        }, {} as any);
    }
    return o;
  };
  const s = JSON.stringify(normalize(obj));
  let h = 2166136261 >>> 0; // FNV-1a
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ('0000000' + (h >>> 0).toString(16)).slice(-8);
}
