import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevTraceService {
    trace(label: string, payload?: unknown): void {
        // Keep logs lightweight; can later gate by environment/feature flag
        // DEV_TRACE: unified breadcrumb format
        try {
            // eslint-disable-next-line no-console
            console.log(`[DEV_TRACE] ${label}`, payload ?? '');
        } catch {
            // no-op
        }
    }
}

