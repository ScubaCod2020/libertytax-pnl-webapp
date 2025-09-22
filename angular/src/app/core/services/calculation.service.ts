import { Injectable } from '@angular/core';
import type { CalculationInputs, CalculationResults } from '../../domain/types/calculation.types';
import { calc } from '../../domain/calculations/calc';

@Injectable({ providedIn: 'root' })
export class CalculationService {
  calculate(inputs: CalculationInputs): CalculationResults {
    return calc(inputs);
  }
}
