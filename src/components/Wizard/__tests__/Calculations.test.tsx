import { describe, test, expect } from 'vitest'

function calcGross(anf: number, returns: number): number {
  return anf * returns
}

function calcDiscounts(gross: number, pct = 3): number {
  return gross * (pct / 100)
}

function calcNetTaxPrepIncome(gross: number, discounts: number): number {
  return gross - discounts
}

describe('Core Calculations', () => {
  test('Gross, Discounts, Net Tax Prep Income', () => {
    const gross = calcGross(125, 1600)
    const discounts = calcDiscounts(gross, 3)
    const net = calcNetTaxPrepIncome(gross, discounts)

    expect(gross).toBe(200000)
    expect(Math.round(discounts)).toBe(6000)
    expect(net).toBe(194000)
  })

  test('Net Margin calculation example', () => {
    const gross = 200000
    const discounts = 6000
    const netRevenue = gross - discounts
    const expenses = 150000
    const netIncome = netRevenue - expenses
    const netMargin = (netIncome / netRevenue) * 100

    expect(Math.round(netMargin)).toBe(23)
  })

  test('Zero returns avoids divide-by-zero', () => {
    const gross = calcGross(200, 0)
    const discounts = calcDiscounts(gross, 3)
    const net = calcNetTaxPrepIncome(gross, discounts)

    expect(gross).toBe(0)
    expect(discounts).toBe(0)
    expect(net).toBe(0)
  })
})
