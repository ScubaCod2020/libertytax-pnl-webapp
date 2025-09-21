import { Injectable } from '@angular/core';
import { getHealth as genGetHealth, getSummary as genGetSummary } from '../lib/api-client/client';

export type Health = API.Health;
export type Summary = API.Summary;

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  async getHealth(): Promise<Health> {
    return genGetHealth('');
  }

  async getSummary(params: { region?: 'US' | 'CA'; year?: number }): Promise<Summary> {
    return genGetSummary(params, '');
  }
}
