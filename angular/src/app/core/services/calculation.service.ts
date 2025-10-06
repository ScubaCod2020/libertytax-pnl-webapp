import { Injectable } from '@angular/core';
import type { CalculationInputs, CalculationResults } from '../../domain/types/calculation.types';
import { calc } from '../../domain/calculations/calc';
import { startTrace } from '../../shared/debug/calc-trace';
import { coerceJson } from '../../domain/_util/sanity.guard';

@Injectable({ providedIn: 'root' })
export class CalculationService {
  calculate(inputs: CalculationInputs): CalculationResults {
    const __trace = startTrace('kpi');
    const __safe = coerceJson<CalculationInputs>(inputs as unknown);
    __trace.log('inputs', __safe);
    const __out = calc(__safe);
    __trace.log('outputs', __out);
    return __out;
  }
}
