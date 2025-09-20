import { Injectable } from '@angular/core';

export interface PrintableReportModel { ready: boolean; }

@Injectable({ providedIn: 'root' })
export class ReportAssemblerService {
  assemblePrintable(state: unknown): PrintableReportModel {
    return { ready: true };
  }
  toCsv(state: unknown): string {
    return "col1,col2\nv1,v2\n";
  }
}
