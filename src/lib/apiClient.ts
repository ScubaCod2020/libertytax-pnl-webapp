// Simple typed API client for React app
// Uses proxy (/api) in dev; falls back to VITE_API_URL when set

export type Health = API.Health
export type Summary = API.Summary

const baseUrl = (import.meta.env.VITE_API_URL as string | undefined) ?? '' // proxy when empty

function buildUrl(path: string, query?: Record<string, string | number | undefined>) {
  const url = new URL(path, baseUrl || window.location.origin)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
  }
  return url.toString()
}

export async function getHealth(): Promise<Health> {
  const res = await fetch(buildUrl('/api/health'), { credentials: 'include' })
  if (!res.ok) throw new Error(`Health failed: ${res.status}`)
  return res.json()
}

export async function getSummary(params: { region?: 'US' | 'CA'; year?: number }): Promise<Summary> {
  const res = await fetch(buildUrl('/api/reports/summary', params), { credentials: 'include' })
  if (!res.ok) throw new Error(`Summary failed: ${res.status}`)
  return res.json()
}
