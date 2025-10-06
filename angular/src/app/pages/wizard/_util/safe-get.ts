export function safeGet<T extends object, K extends keyof T>(
  obj: T | null | undefined,
  key: K,
  fallback: T[K]
): T[K] {
  return obj && obj[key] !== undefined && obj[key] !== null ? obj[key] : fallback;
}
