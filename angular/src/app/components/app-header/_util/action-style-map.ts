export type Variant = string;
export function buildActionStyleMap(variants: Variant[]) {
  const map: Record<string, { [k: string]: string | number }> = {};
  for (const v of variants || []) {
    switch (v) {
      case 'primary':
        map[v] = { fontWeight: 600 };
        break;
      case 'danger':
        map[v] = { color: '#b00020' };
        break;
      default:
        map[v] = {};
    }
  }
  return map;
}
