import type { CalculationInputs, CalculationResults } from '../types/calculation.types';

export function calc(inputs: CalculationInputs): CalculationResults {
  const handlesTaxRush = inputs.region === 'CA' ? true : false;
  const taxRush = inputs.region === 'CA' && handlesTaxRush ? inputs.taxRushReturns : 0;

  const grossFees = inputs.avgNetFee * inputs.taxPrepReturns;
  const discounts = grossFees * (inputs.discountsPct / 100);
  const taxPrepIncome = grossFees - discounts;

  const taxRushIncome = inputs.region === 'CA' && handlesTaxRush ? inputs.avgNetFee * taxRush : 0;
  const otherIncome = inputs.otherIncome || 0;
  const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome;

  const salaries = grossFees * (inputs.salariesPct / 100);
  const empDeductions = salaries * (inputs.empDeductionsPct / 100);

  const rent = grossFees * (inputs.rentPct / 100);
  const telephone = inputs.telephoneAmt;
  const utilities = inputs.utilitiesAmt;

  const localAdv = inputs.localAdvAmt;
  const insurance = inputs.insuranceAmt;
  const postage = inputs.postageAmt;
  const supplies = grossFees * (inputs.suppliesPct / 100);
  const dues = inputs.duesAmt;
  const bankFees = inputs.bankFeesAmt;
  const maintenance = inputs.maintenanceAmt;
  const travelEnt = inputs.travelEntAmt;

  const royalties = taxPrepIncome * (inputs.royaltiesPct / 100);
  const advRoyalties = taxPrepIncome * (inputs.advRoyaltiesPct / 100);
  const taxRushRoyalties =
    inputs.region === 'CA' && handlesTaxRush
      ? taxPrepIncome * (inputs.taxRushRoyaltiesPct / 100)
      : 0;

  const misc = grossFees * (inputs.miscPct / 100);

  const fieldBasedTotal =
    salaries +
    empDeductions +
    rent +
    telephone +
    utilities +
    localAdv +
    insurance +
    postage +
    supplies +
    dues +
    bankFees +
    maintenance +
    travelEnt +
    royalties +
    advRoyalties +
    taxRushRoyalties +
    misc;

  const totalExpenses = inputs.calculatedTotalExpenses ?? fieldBasedTotal;
  const netIncome = totalRevenue - totalExpenses;
  const totalReturns = inputs.taxPrepReturns + taxRush;
  const costPerReturn = totalReturns > 0 ? totalExpenses / totalReturns : 0;
  const netMarginPct = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

  return {
    grossFees,
    discounts,
    taxPrepIncome,
    taxRushIncome,
    otherIncome,
    totalRevenue,
    salaries,
    empDeductions,
    rent,
    telephone,
    utilities,
    localAdv,
    insurance,
    postage,
    supplies,
    dues,
    bankFees,
    maintenance,
    travelEnt,
    royalties,
    advRoyalties,
    taxRushRoyalties,
    misc,
    totalExpenses,
    netIncome,
    totalReturns,
    costPerReturn,
    netMarginPct,
  };
}
