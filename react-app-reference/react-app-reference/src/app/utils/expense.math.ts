export interface ExpenseLine {
  id: string;
  amount: number;
  isFixed: boolean;
}

export function computeBaselineToTarget(totalRevenue: number, targetPct: number, lines: ExpenseLine[]): ExpenseLine[] {
  if (totalRevenue <= 0) return lines.map(l => ({ ...l, amount: 0 }));
  const targetTotal = totalRevenue * targetPct;
  const fixedTotal = lines.filter(l => l.isFixed).reduce((s, l) => s + (l.amount || 0), 0);
  const variableLines = lines.filter(l => !l.isFixed);
  const variableCount = variableLines.length;
  const variableTarget = Math.max(0, targetTotal - fixedTotal);
  const perLine = variableCount > 0 ? variableTarget / variableCount : 0;
  return lines.map(l => l.isFixed ? l : { ...l, amount: perLine });
}

export function anchoredResetMaintainTarget(totalRevenue: number, targetPct: number, lines: ExpenseLine[], anchorId: string): ExpenseLine[] {
  if (totalRevenue <= 0) return lines;
  const targetTotal = totalRevenue * targetPct;
  const anchor = lines.find(l => l.id === anchorId);
  if (!anchor) return lines;
  const others = lines.filter(l => l.id !== anchorId);
  const fixedTotal = others.filter(l => l.isFixed).reduce((s, l) => s + (l.amount || 0), 0) + (anchor.isFixed ? anchor.amount : 0);
  const variableOthers = others.filter(l => !l.isFixed);
  const remaining = Math.max(0, targetTotal - fixedTotal);
  const perLine = variableOthers.length > 0 ? remaining / variableOthers.length : 0;
  return lines.map(l => (l.id === anchorId || l.isFixed) ? l : { ...l, amount: perLine });
}
