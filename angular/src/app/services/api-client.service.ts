import { Injectable } from '@angular/core';

export type Health = API.Health;
export type Summary = API.Summary;

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly baseUrl = '';

  private buildUrl(path: string, query?: Record<string, string | number | undefined>): string {
    const url = new URL(path, this.baseUrl || window.location.origin);
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      }
    }
    return url.toString();
  }

  async getHealth(): Promise<Health> {
    const res = await fetch(this.buildUrl('/api/health'), { credentials: 'include' });
    if (!res.ok) throw new Error(`Health failed: ${res.status}`);
    return res.json();
  }

  async getSummary(params: { region?: 'US' | 'CA'; year?: number }): Promise<Summary> {
    const res = await fetch(this.buildUrl('/api/reports/summary', params), { credentials: 'include' });
    if (!res.ok) throw new Error(`Summary failed: ${res.status}`);
    return res.json();
  }
}
