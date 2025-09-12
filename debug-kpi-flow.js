// Quick debugging script to test KPI flow
console.log("=== DEBUGGING KPI FLOW ===")

// Test the new KPI threshold logic
function statusForMargin(v, thresholds) {
  const nimGreenMax = 100 - 74.5  // 25.5%
  const nimYellowMax = 100 - 71.5 // 28.5%
  
  console.log(`Testing margin ${v}% against thresholds:`, {
    nimGreen: thresholds.nimGreen,
    nimYellow: thresholds.nimYellow,
    nimGreenMax,
    nimYellowMax
  })
  
  if (v >= thresholds.nimGreen && v <= nimGreenMax) {
    console.log(`✅ GREEN: ${v}% is between ${thresholds.nimGreen}% and ${nimGreenMax}%`)
    return 'green'
  }
  if ((v >= thresholds.nimYellow && v < thresholds.nimGreen) || (v > nimGreenMax && v <= nimYellowMax)) {
    console.log(`🟡 YELLOW: ${v}% is in yellow range`)
    return 'yellow'
  }
  console.log(`🔴 RED: ${v}% is outside acceptable ranges`)
  return 'red'
}

// Test with strategic baseline values
const defaultThresholds = {
  nimGreen: 22.5,
  nimYellow: 19.5
}

// Test cases
console.log("\n=== TEST CASES ===")
statusForMargin(24, defaultThresholds)  // Should be GREEN (76% expenses)
statusForMargin(22.5, defaultThresholds) // Should be GREEN (edge case)
statusForMargin(25.5, defaultThresholds) // Should be GREEN (edge case)
statusForMargin(26, defaultThresholds)   // Should be YELLOW (too high margin)
statusForMargin(20, defaultThresholds)   // Should be YELLOW (low margin)
statusForMargin(18, defaultThresholds)   // Should be RED (too low)
