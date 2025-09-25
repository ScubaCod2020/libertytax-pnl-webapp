// angular/src/app/domain/calculations/calc.ts
function calc(inputs) {
  try {
    const handlesTaxRush = inputs.handlesTaxRush ?? inputs.region === "CA";
    const taxRush = inputs.region === "CA" && handlesTaxRush ? inputs.taxRushReturns : 0;
    const grossFees = inputs.avgNetFee * inputs.taxPrepReturns;
    const discounts = grossFees * (inputs.discountsPct / 100);
    const taxPrepIncome = grossFees - discounts;
    const taxRushIncome = inputs.region === "CA" && handlesTaxRush ? inputs.avgNetFee * taxRush : 0;
    const otherIncome = inputs.otherIncome || 0;
    const totalRevenue = taxPrepIncome + taxRushIncome + otherIncome;
    console.log("\u{1F9EE} CALC DEBUG (Angular):", {
      region: inputs.region,
      avgNetFee: inputs.avgNetFee,
      taxPrepReturns: inputs.taxPrepReturns,
      taxRushReturns: taxRush,
      otherIncome: inputs.otherIncome || 0,
      grossFees,
      discountsPct: inputs.discountsPct,
      discounts,
      taxPrepIncome,
      taxRushIncome,
      totalRevenue
    });
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
    const taxRushRoyalties = inputs.region === "CA" && handlesTaxRush ? taxPrepIncome * (inputs.taxRushRoyaltiesPct / 100) : 0;
    const misc = grossFees * (inputs.miscPct / 100);
    const fieldBasedTotal = salaries + empDeductions + rent + telephone + utilities + localAdv + insurance + postage + supplies + dues + bankFees + maintenance + travelEnt + royalties + advRoyalties + taxRushRoyalties + misc;
    console.log("\u{1F9EE} EXPENSE CALCULATION COMPARISON:", {
      preCalculatedFromPage2: inputs.calculatedTotalExpenses || "NOT_SET",
      fieldBasedCalculation: Math.round(fieldBasedTotal),
      usingPreCalculated: !!inputs.calculatedTotalExpenses,
      difference: inputs.calculatedTotalExpenses ? Math.round(inputs.calculatedTotalExpenses - fieldBasedTotal) : "N/A"
    });
    const totalExpenses = inputs.calculatedTotalExpenses ?? fieldBasedTotal;
    const netIncome = totalRevenue - totalExpenses;
    const totalReturns = inputs.taxPrepReturns + taxRush;
    const costPerReturn = totalReturns > 0 ? totalExpenses / totalReturns : 0;
    const netMarginPct = totalRevenue > 0 ? netIncome / totalRevenue * 100 : 0;
    if (isNaN(costPerReturn) || !isFinite(costPerReturn)) {
      throw new Error("Invalid cost per return calculation");
    }
    if (isNaN(netMarginPct) || !isFinite(netMarginPct)) {
      throw new Error("Invalid net margin calculation");
    }
    console.log("\u{1F9EE} FINAL RESULTS:", {
      totalRevenue,
      totalExpenses,
      netIncome,
      netMarginPct: `${netMarginPct.toFixed(1)}%`
    });
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
      netMarginPct
    };
  } catch (error) {
    console.error("\u{1F6A8} CALCULATION ERROR - Using safe fallback values:", error);
    return {
      grossFees: 0,
      discounts: 0,
      taxPrepIncome: 0,
      taxRushIncome: 0,
      otherIncome: 0,
      totalRevenue: 0,
      salaries: 0,
      empDeductions: 0,
      rent: 0,
      telephone: 0,
      utilities: 0,
      localAdv: 0,
      insurance: 0,
      postage: 0,
      supplies: 0,
      dues: 0,
      bankFees: 0,
      maintenance: 0,
      travelEnt: 0,
      royalties: 0,
      advRoyalties: 0,
      taxRushRoyalties: 0,
      misc: 0,
      totalExpenses: 0,
      netIncome: 0,
      totalReturns: 0,
      costPerReturn: 0,
      netMarginPct: 0
    };
  }
}
export {
  calc
};
