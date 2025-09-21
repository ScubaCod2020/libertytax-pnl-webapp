/* Auto-generated lightweight API client. Edit as needed. */
import './types.d';

export async function getHealth(baseUrl = ''): Promise<API.Health> {
  const res = await fetch(new URL('/api/health', baseUrl || window.location.origin));
  if (!res.ok) throw new Error('Health failed: ' + res.status);
  return res.json();
}

export async function getSummary(
  params: { region?: 'US' | 'CA'; year?: number },
  baseUrl = ''
): Promise<API.Summary> {
  const url = new URL('/api/reports/summary', baseUrl || window.location.origin);
  for (const [k, v] of Object.entries(params || {}))
    if (v != null) url.searchParams.set(k, String(v));
  const res = await fetch(url);
  if (!res.ok) throw new Error('Summary failed: ' + res.status);
  return res.json();
}
