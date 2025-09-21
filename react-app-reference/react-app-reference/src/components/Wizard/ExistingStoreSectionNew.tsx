// ExistingStoreSectionNew.tsx - Standardized layout (aligned with golden ticket logic)
// Uses sticky overrides, styled discounts, and shared NetIncomeSummary

import React from 'react';
import type { WizardSectionProps } from './types';
import FormSection from './FormSection';
import FormField, { CurrencyInput, NumberInput } from './FormField';
import NetIncomeSummary from './NetIncomeSummary';

export default function ExistingStoreSectionNew({
  answers,
  updateAnswers,
  region,
}: WizardSectionProps) {
  // Effective Gross = manual override OR Returns × ANF
  const effectiveGross =
    answers.lastYearGrossFees ??
    (answers.lastYearTaxPrepReturns && answers.manualAvgNetFee
      ? answers.lastYearTaxPrepReturns * answers.manualAvgNetFee
      : undefined);

  const lyTaxRushAnf = answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee;
  const lyTaxRushGrossAuto = React.useMemo(() => {
    if (answers.lastYearTaxRushReturns !== undefined && lyTaxRushAnf !== undefined) {
      return answers.lastYearTaxRushReturns * lyTaxRushAnf;
    }
    return undefined;
  }, [answers.lastYearTaxRushReturns, lyTaxRushAnf]);

  return (
    <>
      <FormSection
        title="Last Year Performance"
        icon="📊"
        description="Enter your historical data for accurate projections"
      >
        {/* 1. Tax Prep Returns */}
        <FormField label="Tax Prep Returns" required>
          <NumberInput
            value={answers.lastYearTaxPrepReturns}
            prefix="#"
            placeholder="e.g., 1,680"
            onChange={(value) => updateAnswers({ lastYearTaxPrepReturns: value })}
          />
        </FormField>

        {/* 2. Average Net Fee */}
        <FormField label="Average Net Fee" helpText="Auto: Gross ÷ Returns (you can override)">
          <CurrencyInput
            value={
              answers.manualAvgNetFee !== undefined
                ? answers.manualAvgNetFee
                : answers.lastYearGrossFees && answers.lastYearTaxPrepReturns
                  ? Math.round(answers.lastYearGrossFees / answers.lastYearTaxPrepReturns)
                  : undefined
            }
            placeholder="Auto"
            onChange={(value) => updateAnswers({ manualAvgNetFee: value })}
            backgroundColor={answers.manualAvgNetFee !== undefined ? 'white' : '#f0f9ff'}
          />
        </FormField>

        {/* 3. Gross Tax Prep Fees */}
        <FormField
          label="Gross Tax Prep Fees"
          helpText="Auto: Returns × Avg Net Fee (you can override)"
        >
          <CurrencyInput
            value={effectiveGross}
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ lastYearGrossFees: value })}
            backgroundColor={answers.lastYearGrossFees !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 4. TaxRush (Canada only, if enabled) */}
        {region === 'CA' && answers.handlesTaxRush && (
          <div
            style={{
              border: '2px solid #0ea5e9',
              borderRadius: '8px',
              backgroundColor: '#f0f9ff',
              margin: '0.5rem 0',
              padding: '0.75rem',
            }}
          >
            <FormField label="TaxRush Returns">
              <NumberInput
                value={answers.lastYearTaxRushReturns}
                prefix="#"
                placeholder="e.g., 240"
                onChange={(value) => updateAnswers({ lastYearTaxRushReturns: value })}
              />
            </FormField>
            <FormField label="TaxRush Avg Net Fee">
              <CurrencyInput
                value={answers.lastYearTaxRushAvgNetFee ?? answers.manualAvgNetFee}
                placeholder="e.g., 125"
                onChange={(value) => updateAnswers({ lastYearTaxRushAvgNetFee: value })}
              />
            </FormField>
            <FormField label="TaxRush Gross Fees">
              <CurrencyInput
                value={answers.lastYearTaxRushGrossFees ?? lyTaxRushGrossAuto}
                placeholder="Auto-calculated"
                onChange={(value) => updateAnswers({ lastYearTaxRushGrossFees: value })}
                backgroundColor="#f9fafb"
              />
            </FormField>
          </div>
        )}

        {/* 5. Customer Discounts */}
        <FormField
          label="Customer Discounts"
          helpText="Dollar amount or % of gross fees given as discounts. Enter either field; the other auto-calculates."
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Dollar Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder={
                  effectiveGross ? Math.round(effectiveGross * 0.03).toString() : '6,000'
                }
                value={answers.lastYearDiscountsAmt ?? ''}
                onChange={(e) => {
                  const amt = parseFloat(e.target.value) || undefined;
                  updateAnswers({ lastYearDiscountsAmt: amt });
                  if (amt && effectiveGross) {
                    const pct = (amt / effectiveGross) * 100;
                    updateAnswers({ lastYearDiscountsPct: Math.round(pct * 10) / 10 });
                  }
                }}
                style={{
                  width: '80px',
                  textAlign: 'right',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '0.5rem',
                }}
              />
            </div>

            <span>=</span>

            {/* Percentage Input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                placeholder="3.0"
                value={answers.lastYearDiscountsPct ?? ''}
                onChange={(e) => {
                  const pct = parseFloat(e.target.value) || undefined;
                  updateAnswers({ lastYearDiscountsPct: pct });
                  if (pct && effectiveGross) {
                    updateAnswers({
                      lastYearDiscountsAmt: Math.round(effectiveGross * (pct / 100)),
                    });
                  }
                }}
                style={{
                  width: '80px',
                  textAlign: 'right',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '0.5rem',
                }}
              />
              <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
            </div>
          </div>
          <div
            style={{
              marginTop: '0.25rem',
              fontSize: '0.75rem',
              color: '#6b7280',
              fontStyle: 'italic',
            }}
          >
            Default: 3% • Enter either dollar amount or percentage - the other will auto-calc
          </div>
        </FormField>

        {/* 6. Total Tax Prep Income */}
        <FormField label="Total Tax Prep Income" helpText="Gross − Discounts (you can override)">
          <CurrencyInput
            value={
              answers.manualTaxPrepIncome ??
              (effectiveGross !== undefined
                ? effectiveGross - (answers.lastYearDiscountsAmt ?? 0)
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ manualTaxPrepIncome: value })}
            backgroundColor={answers.manualTaxPrepIncome !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 7. Other Income */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income">
            <CurrencyInput
              value={answers.lastYearOtherIncome}
              placeholder="e.g., 2,500"
              onChange={(value) => updateAnswers({ lastYearOtherIncome: value })}
            />
          </FormField>
        )}

        {/* 8. Total Expenses */}
        <FormField
          label="Total Expenses"
          helpText="Auto: (Tax Prep Income + Other Income) × 76% (you can override)"
        >
          <CurrencyInput
            value={
              answers.lastYearExpenses ??
              (() => {
                const taxPrepIncome =
                  answers.manualTaxPrepIncome ??
                  (effectiveGross !== undefined
                    ? effectiveGross - (answers.lastYearDiscountsAmt ?? 0)
                    : 0);
                const other = answers.hasOtherIncome ? (answers.lastYearOtherIncome ?? 0) : 0;
                const base = taxPrepIncome + other;
                return base > 0 ? Math.round(base * 0.76) : undefined;
              })()
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ lastYearExpenses: value })}
            backgroundColor={answers.lastYearExpenses !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* 9. Last Year Net Income Summary */}
        <NetIncomeSummary
          label="Last Year"
          gross={effectiveGross ?? 0}
          discounts={answers.lastYearDiscountsAmt ?? 0}
          otherIncome={answers.hasOtherIncome ? (answers.lastYearOtherIncome ?? 0) : 0}
          expenses={answers.lastYearExpenses ?? 0}
          color="#15803d"
          background="#f0fdf4"
          border="2px solid #16a34a"
        />
      </FormSection>

      {/* Projected Performance */}
      <FormSection
        title="Projected Performance"
        icon="📈"
        description="Forecast this season based on targets"
      >
        {/* Returns & ANF */}
        <FormField label="Tax Prep Returns">
          <NumberInput
            value={answers.taxPrepReturns}
            prefix="#"
            placeholder="e.g., 1,750"
            onChange={(value) => updateAnswers({ taxPrepReturns: value })}
          />
        </FormField>

        <FormField label="Average Net Fee">
          <CurrencyInput
            value={answers.avgNetFee}
            placeholder="e.g., 130"
            onChange={(value) => updateAnswers({ avgNetFee: value })}
          />
        </FormField>

        {/* Gross (auto unless overridden) */}
        <FormField
          label="Gross Tax Prep Fees"
          helpText="Auto: Returns × Avg Net Fee (clear to re-auto)"
        >
          <CurrencyInput
            value={
              answers.projectedGrossFees ??
              (answers.taxPrepReturns && answers.avgNetFee
                ? answers.taxPrepReturns * answers.avgNetFee
                : undefined)
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedGrossFees: value })}
            backgroundColor={answers.projectedGrossFees !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* Discounts (projected) */}
        <FormField label="Customer Discounts" helpText="Enter $ or %, the other will auto-calc">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontWeight: 500, color: '#6b7280' }}>$</span>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="6,000"
                value={answers.discountsAmt ?? ''}
                onChange={(e) => {
                  const amt = parseFloat(e.target.value) || undefined;
                  updateAnswers({ discountsAmt: amt });
                  const projGross =
                    answers.projectedGrossFees ??
                    (answers.taxPrepReturns && answers.avgNetFee
                      ? answers.taxPrepReturns * answers.avgNetFee
                      : undefined);
                  if (amt && projGross) {
                    const pct = (amt / projGross) * 100;
                    updateAnswers({ discountsPct: Math.round(pct * 10) / 10 });
                  }
                }}
                style={{
                  width: '80px',
                  textAlign: 'right',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '0.5rem',
                }}
              />
            </div>

            <span style={{ color: '#6b7280' }}>=</span>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                placeholder="3.0"
                value={answers.discountsPct ?? ''}
                onChange={(e) => {
                  const pct = parseFloat(e.target.value) || undefined;
                  updateAnswers({ discountsPct: pct });
                  const projGross =
                    answers.projectedGrossFees ??
                    (answers.taxPrepReturns && answers.avgNetFee
                      ? answers.taxPrepReturns * answers.avgNetFee
                      : undefined);
                  if (pct && projGross) {
                    updateAnswers({ discountsAmt: Math.round(projGross * (pct / 100)) });
                  }
                }}
                style={{
                  width: '80px',
                  textAlign: 'right',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  padding: '0.5rem',
                }}
              />
              <span style={{ fontWeight: 500, color: '#6b7280' }}>%</span>
            </div>
          </div>
          <div
            style={{
              marginTop: '0.25rem',
              fontSize: '0.75rem',
              color: '#6b7280',
              fontStyle: 'italic',
            }}
          >
            Default: 3%
          </div>
        </FormField>

        {/* Tax Prep Income (auto unless override) */}
        <FormField label="Total Tax Prep Income" helpText="Gross − Discounts (clear to re-auto)">
          <CurrencyInput
            value={
              answers.projectedTaxPrepIncome ??
              (() => {
                const projGross =
                  answers.projectedGrossFees ??
                  (answers.taxPrepReturns && answers.avgNetFee
                    ? answers.taxPrepReturns * answers.avgNetFee
                    : undefined);
                return projGross !== undefined
                  ? projGross - (answers.discountsAmt ?? 0)
                  : undefined;
              })()
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedTaxPrepIncome: value })}
            backgroundColor={answers.projectedTaxPrepIncome !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* Other Income */}
        {answers.hasOtherIncome && (
          <FormField label="Other Income">
            <CurrencyInput
              value={answers.otherIncome}
              onChange={(value) => updateAnswers({ otherIncome: value })}
            />
          </FormField>
        )}

        {/* Expenses (auto unless override) */}
        <FormField label="Total Expenses" helpText="Auto: (Tax Prep Income + Other) × 76%">
          <CurrencyInput
            value={
              answers.projectedExpenses ??
              (() => {
                const tpi =
                  answers.projectedTaxPrepIncome ??
                  (() => {
                    const projGross =
                      answers.projectedGrossFees ??
                      (answers.taxPrepReturns && answers.avgNetFee
                        ? answers.taxPrepReturns * answers.avgNetFee
                        : undefined);
                    return projGross !== undefined ? projGross - (answers.discountsAmt ?? 0) : 0;
                  })();
                const other = answers.hasOtherIncome ? (answers.otherIncome ?? 0) : 0;
                const base = tpi + other;
                return base > 0 ? Math.round(base * 0.76) : undefined;
              })()
            }
            placeholder="Auto-calculated"
            onChange={(value) => updateAnswers({ projectedExpenses: value })}
            backgroundColor={answers.projectedExpenses !== undefined ? 'white' : '#f9fafb'}
          />
        </FormField>

        {/* Summary */}
        <NetIncomeSummary
          label="Projected"
          gross={
            answers.projectedGrossFees ??
            (answers.taxPrepReturns && answers.avgNetFee
              ? answers.taxPrepReturns * answers.avgNetFee
              : 0)
          }
          discounts={answers.discountsAmt ?? 0}
          otherIncome={answers.hasOtherIncome ? (answers.otherIncome ?? 0) : 0}
          expenses={answers.projectedExpenses ?? 0}
          color="#15803d"
          background="#f0fdf4"
          border="2px solid #16a34a"
        />
      </FormSection>
    </>
  );
}
