// Monthly distribution data based on tax industry seasonality patterns
// These percentages represent the typical distribution of tax returns throughout the year

export interface MonthlyDistribution {
  month: string;
  monthNumber: number;
  returnsPercentage: number; // % of annual returns processed in this month
  description: string;
}

export const MONTHLY_RETURN_DISTRIBUTION: MonthlyDistribution[] = [
  {
    month: 'January',
    monthNumber: 1,
    returnsPercentage: 15.5,
    description: 'Tax season begins - early filers and business returns',
  },
  {
    month: 'February',
    monthNumber: 2,
    returnsPercentage: 22.8,
    description: 'Peak season - W-2s available, heavy volume',
  },
  {
    month: 'March',
    monthNumber: 3,
    returnsPercentage: 28.2,
    description: 'Busiest month - deadline approaching, maximum capacity',
  },
  {
    month: 'April',
    monthNumber: 4,
    returnsPercentage: 18.7,
    description: 'Final rush to deadline, extensions filed',
  },
  {
    month: 'May',
    monthNumber: 5,
    returnsPercentage: 3.8,
    description: 'Post-deadline cleanup, amended returns',
  },
  {
    month: 'June',
    monthNumber: 6,
    returnsPercentage: 2.1,
    description: 'Slow season - extensions, business quarterly',
  },
  {
    month: 'July',
    monthNumber: 7,
    returnsPercentage: 1.4,
    description: 'Slowest month - minimal activity',
  },
  {
    month: 'August',
    monthNumber: 8,
    returnsPercentage: 1.6,
    description: 'Preparation for next season, training',
  },
  {
    month: 'September',
    monthNumber: 9,
    returnsPercentage: 2.3,
    description: 'Extension deadline approaches, business returns',
  },
  {
    month: 'October',
    monthNumber: 10,
    returnsPercentage: 1.9,
    description: 'Extension deadline, year-end planning begins',
  },
  {
    month: 'November',
    monthNumber: 11,
    returnsPercentage: 1.2,
    description: 'Year-end tax planning, business prep',
  },
  {
    month: 'December',
    monthNumber: 12,
    returnsPercentage: 0.5,
    description: 'Minimal activity - holiday season, prep for next year',
  },
];

// Validate that percentages add up to 100%
const totalPercentage = MONTHLY_RETURN_DISTRIBUTION.reduce(
  (sum, month) => sum + month.returnsPercentage,
  0
);
if (Math.abs(totalPercentage - 100) > 0.1) {
  console.warn(`Monthly distribution percentages total ${totalPercentage}%, should be 100%`);
}

export interface MonthlyFinancials {
  month: string;
  monthNumber: number;
  returns: number;
  returnsPercentage: number;
  grossFees: number;
  discounts: number;
  netRevenue: number;
  expenses: number;
  netIncome: number;
  netMarginPct: number;
  cumulativeReturns: number;
  cumulativeRevenue: number;
  cumulativeExpenses: number;
  cumulativeNetIncome: number;
}

export function calculateMonthlyBreakdown(
  annualReturns: number,
  annualGrossFees: number,
  annualDiscounts: number,
  annualExpenses: number
): MonthlyFinancials[] {
  console.log('📅🔧 [MONTHLY BREAKDOWN] Calculating monthly distribution...');
  console.log('📅🔧 [MONTHLY BREAKDOWN] Annual totals:', {
    annualReturns,
    annualGrossFees,
    annualDiscounts,
    annualExpenses,
  });

  let cumulativeReturns = 0;
  let cumulativeRevenue = 0;
  let cumulativeExpenses = 0;
  let cumulativeNetIncome = 0;

  const monthlyData = MONTHLY_RETURN_DISTRIBUTION.map((month) => {
    // Calculate monthly values based on return distribution
    const monthlyReturns = Math.round(annualReturns * (month.returnsPercentage / 100));
    const monthlyGrossFees = Math.round(annualGrossFees * (month.returnsPercentage / 100));
    const monthlyDiscounts = Math.round(annualDiscounts * (month.returnsPercentage / 100));
    const monthlyNetRevenue = monthlyGrossFees - monthlyDiscounts;

    // Expenses are more evenly distributed (rent, salaries, etc.) but still scale with activity
    // Use a blend: 60% based on activity, 40% evenly distributed
    const activityBasedExpenses = annualExpenses * (month.returnsPercentage / 100) * 0.6;
    const fixedExpenses = (annualExpenses / 12) * 0.4;
    const monthlyExpenses = Math.round(activityBasedExpenses + fixedExpenses);

    const monthlyNetIncome = monthlyNetRevenue - monthlyExpenses;
    const monthlyMarginPct =
      monthlyNetRevenue > 0 ? (monthlyNetIncome / monthlyNetRevenue) * 100 : 0;

    // Update cumulatives
    cumulativeReturns += monthlyReturns;
    cumulativeRevenue += monthlyNetRevenue;
    cumulativeExpenses += monthlyExpenses;
    cumulativeNetIncome += monthlyNetIncome;

    const monthlyFinancials: MonthlyFinancials = {
      month: month.month,
      monthNumber: month.monthNumber,
      returns: monthlyReturns,
      returnsPercentage: month.returnsPercentage,
      grossFees: monthlyGrossFees,
      discounts: monthlyDiscounts,
      netRevenue: monthlyNetRevenue,
      expenses: monthlyExpenses,
      netIncome: monthlyNetIncome,
      netMarginPct: monthlyMarginPct,
      cumulativeReturns,
      cumulativeRevenue,
      cumulativeExpenses,
      cumulativeNetIncome,
    };

    console.log(`📅🔧 [MONTHLY BREAKDOWN] ${month.month}:`, monthlyFinancials);
    return monthlyFinancials;
  });

  console.log('📅🔧 [MONTHLY BREAKDOWN] Monthly breakdown completed');
  return monthlyData;
}

// Peak season months (Jan-Apr)
export const PEAK_SEASON_MONTHS = [1, 2, 3, 4];
export const SLOW_SEASON_MONTHS = [5, 6, 7, 8, 9, 10, 11, 12];

export function getSeasonType(monthNumber: number): 'peak' | 'slow' {
  return PEAK_SEASON_MONTHS.includes(monthNumber) ? 'peak' : 'slow';
}
