#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Use ESM bundles built by esbuild (no loader required)
import * as angularBundle from '../dist-parity/angular-calc.mjs';
import * as reactBundle from '../dist-parity/react-calc.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const angularCalc = (angularBundle as any).calc || angularBundle.default || angularBundle;
const reactCalc = (reactBundle as any).calc || reactBundle.default || reactBundle;

type Scenario = Record<string, any>;

const scenarios: Record<string, Scenario> = {
    baseline_us: {
        region: 'US', scenario: 'Custom', avgNetFee: 130, taxPrepReturns: 1600, taxRushReturns: 0,
        discountsPct: 3, otherIncome: 0,
        salariesPct: 25, empDeductionsPct: 10, rentPct: 18, telephoneAmt: 200, utilitiesAmt: 300,
        localAdvAmt: 500, insuranceAmt: 150, postageAmt: 100, suppliesPct: 3.5, duesAmt: 200,
        bankFeesAmt: 100, maintenanceAmt: 150, travelEntAmt: 200, royaltiesPct: 14, advRoyaltiesPct: 5,
        taxRushRoyaltiesPct: 0, miscPct: 2.5,
        thresholds: { cprGreen: 95, cprYellow: 110, nimGreen: 22.5, nimYellow: 19.5, netIncomeWarn: -5000 },
    },
    baseline_ca: {
        region: 'CA', scenario: 'Custom', avgNetFee: 130, taxPrepReturns: 1600, taxRushReturns: 400,
        discountsPct: 3, otherIncome: 0,
        salariesPct: 25, empDeductionsPct: 10, rentPct: 18, telephoneAmt: 200, utilitiesAmt: 300,
        localAdvAmt: 500, insuranceAmt: 150, postageAmt: 100, suppliesPct: 3.5, duesAmt: 200,
        bankFeesAmt: 100, maintenanceAmt: 150, travelEntAmt: 200, royaltiesPct: 14, advRoyaltiesPct: 5,
        taxRushRoyaltiesPct: 6, miscPct: 2.5,
        thresholds: { cprGreen: 95, cprYellow: 110, nimGreen: 22.5, nimYellow: 19.5, netIncomeWarn: -5000 },
    },
};

function toRow(name: string, react: any, angular: any) {
    const cols = [
        name,
        react.totalRevenue ?? '', angular.totalRevenue ?? '',
        react.totalExpenses ?? '', angular.totalExpenses ?? '',
        react.netIncome ?? '', angular.netIncome ?? '',
        react.costPerReturn ?? '', angular.costPerReturn ?? '',
        react.netMarginPct ?? '', angular.netMarginPct ?? '',
    ];
    return cols.join(',');
}

function run() {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 12);
    const outDir = join(__dirname, 'run-reports', 'parity');
    mkdirSync(outDir, { recursive: true });
    const outCsv = join(outDir, `parity-diff-${timestamp}.csv`);
    const header = 'case,react_totalRevenue,angular_totalRevenue,react_totalExpenses,angular_totalExpenses,react_netIncome,angular_netIncome,react_cpr,angular_cpr,react_netMargin,angular_netMargin';
    const rows = [header];

    for (const [name, s] of Object.entries(scenarios)) {
        const reactResult = reactCalc(s);
        const angularResult = angularCalc(s as any);
        rows.push(toRow(name, reactResult, angularResult));
    }

    writeFileSync(outCsv, rows.join('\n'));
    console.log(`Parity report written: ${outCsv}`);
}

run();

