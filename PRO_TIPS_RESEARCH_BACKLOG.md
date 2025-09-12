# Pro-Tips Research Backlog
*Data-driven insights to research for the Pro-Tips feature*

## 📋 Questions Discovered During App Development

### 🚀 **TaxRush Performance & Adoption**
**Origin:** UX decision about TaxRush default selection  
**Questions:**
- What percentage of new Canadian franchises adopt TaxRush in Year 1 vs Year 2+?
- Average revenue impact of TaxRush implementation ($X per TaxRush return)?  
- Regional adoption patterns (urban vs suburban vs rural)?
- Performance benchmarks: TaxRush offices vs non-TaxRush offices?
- TaxRush royalty rate validation (currently 40% - is this accurate?)
- Typical TaxRush volume as % of total returns (for forecasting)?

**Potential Sources:** Liberty Tax Canada operations, franchise surveys, regional managers

---

### 💰 **KPI Thresholds & Business Performance**
**Origin:** KPI stoplight system and validation rules from spec analysis
**Questions:**
- Are the default KPI thresholds accurate for real franchise performance?
  - Cost per Return: Green ≤ $25, Yellow ≤ $35 (realistic?)
  - Net Margin: Green ≥ 20%, Yellow ≥ 10% (achievable?)
  - Net Income: Red if ≤ -$5000 (appropriate threshold?)
- What percentage of franchises achieve "all green" KPIs?
- Seasonal variations in KPI performance (tax season vs off-season)?
- How do KPI thresholds differ by store age (new vs established)?

**Potential Sources:** Corporate KPI reports, franchise performance data, seasonal analysis

---

### 📊 **KPI Education & Plain Language Explanations**
**Origin:** User confusion about KPI meanings and business implications
**Questions:**
- How do we explain "Cost per Return" in terms franchisees understand?
  - What does $35 per return actually mean for daily operations?
  - How does this compare to other service businesses?
  - What specific actions drive this number up or down?
- How to make "Net Margin %" meaningful beyond just a percentage?
  - What does 20% net margin mean in real dollars for different store sizes?
  - How does net margin translate to owner take-home pay?
  - What's a "good" margin compared to other franchise concepts?
- How to explain the relationship between the three KPIs?
  - Why might Net Income be green but Cost per Return be red?
  - How do seasonal patterns affect each KPI differently?
  - Which KPI should franchisees focus on first when struggling?
- What are the real-world implications of different stoplight colors?
  - Red: "Your business needs immediate attention because..."
  - Yellow: "You're at risk of... unless you..."
  - Green: "This indicates... and you should..."
- How to contextualize KPIs for different business situations?
  - New store expectations: "In your first year, expect..."
  - Existing store benchmarks: "After 2+ years, you should see..."
  - Seasonal variations: "During tax season vs off-season..."
  - Regional differences: "Canadian stores typically... while US stores..."

**Potential Sources:** Franchise training materials, owner feedback, business consulting best practices

---

### 🏗️ **Expense Category Benchmarks**
**Origin:** 17 expense categories with preset validation rules
**Questions:**
- Validation of expense percentages from presets:
  - Salaries: Good=26%, Better=24%, Best=22% (realistic progression?)
  - Rent: Good=18%, Better=17%, Best=16% (achievable reductions?)
  - Supplies: 3.5% standard (industry benchmark?)
  - Royalties: 14% TP, 5% advertising (correct franchise rates?)
- Which expense categories show highest variation between franchises?
- Common "expense creep" patterns (utilities rising, supplies growing)?
- What expense reductions have highest impact on profitability?

**Potential Sources:** Franchise financial reviews, industry benchmarks, cost optimization studies

---

### 🏪 **New Store vs Existing Store Patterns**  
**Origin:** Store type selection and performance expectations
**Questions:**
- Typical performance trajectory for new stores (Month 1-12)?
- When do new stores typically reach break-even?
- Common mistakes new franchisees make in their projections?
- Existing store growth patterns - what's realistic vs optimistic?
- Average Net Fee progression (new stores start at $X, grow to $Y)?
- Return volume growth curves (realistic Year 1 vs Year 2+)?

**Potential Sources:** Franchise development data, franchisee interviews, historical performance

---

### 🌍 **Regional Performance Differences**
**Origin:** Canada vs US feature differences in the app
**Questions:**  
- How do Canadian vs US franchise performance metrics compare?
- Seasonal variation patterns by region?
- Tax law impact on profitability differences?
- Regional marketing effectiveness variations?
- Canada TaxRush impact on overall business model?
- Currency/economic factors affecting cross-border comparisons?

**Potential Sources:** Corporate performance reports, regional comparisons

---

### 📊 **Revenue Forecasting & Growth Assumptions** 
**Origin:** Projection calculations and growth assumptions
**Questions:**
- How accurate are typical first-year revenue projections?
- What factors most commonly cause projections to be off?
- Seasonal adjustment best practices?
- Market saturation impact on individual franchise performance?
- Realistic growth rates: new stores vs existing stores?
- Average Net Fee sensitivity analysis ($1 increase = $X revenue impact)?

**Potential Sources:** Historical franchise data, forecasting accuracy studies

---

### ⚠️ **Common User Errors & Validation Issues**
**Origin:** QA analysis revealing critical validation gaps
**Questions:**
- Most common unrealistic input combinations users enter?
- What input validation errors cause the most user confusion?
- Business logic violations that indicate user misunderstanding?
  - Salaries >40% (when does this happen and why?)
  - Rent >25% (market conditions or poor planning?)
  - Discounts >5% (what drives excessive discounting?)
- Which calculations do users find most confusing?
- Common "garbage in, garbage out" scenarios?

**Potential Sources:** User support tickets, training feedback, usability testing

---

### 🎯 **Scenario Preset Validation**
**Origin:** Good/Better/Best preset analysis
**Questions:**
- Are the preset scenarios based on real franchise data?
- What percentile of franchises achieve "Good" vs "Better" vs "Best"?
- Do the preset progressions match real improvement patterns?
- Missing scenarios: "Struggling" or "Recovery" presets needed?
- Regional preset variations (CA vs US different benchmarks?)
- Seasonal preset adjustments (peak season vs off-season)?

**Potential Sources:** Franchise performance quartiles, benchmarking studies

---

### 🔍 **Edge Cases & Risk Scenarios**
**Origin:** Technical testing revealing business logic gaps  
**Questions:**
- What to do when projected expenses exceed revenue (turnaround advice)?
- Guidance for extreme growth scenarios (100%+ growth projections)?
- Red flag combinations (high rent + high salaries + low revenue)?
- Market entry advice (saturated markets vs greenfield)?
- Franchise agreement compliance (royalty rates, territorial restrictions)?
- Financial stress indicators (cash flow warnings, breakeven analysis)?

**Potential Sources:** Franchise support cases, turnaround consultants, market analysis

---

### 🤖 **AI-Driven Insights & Pattern Recognition**
**Origin:** System architecture and data structure analysis
**Questions:**
- Can we identify performance patterns from user input combinations?
- Predictive indicators for franchise success/failure?
- Seasonal adjustment algorithms based on historical data?
- Automated "sanity check" suggestions for unrealistic projections?
- Comparative benchmarking against similar franchises?
- Early warning system for performance decline?

**Potential Sources:** Machine learning on franchise database, predictive analytics

---

## 🎯 **Research Strategy**

### **Phase 1: Internal Data** 
- Liberty Tax corporate performance data
- Franchise development historical records  
- Regional manager insights

### **Phase 2: Franchisee Insights**
- Survey existing franchisees
- Interview high-performers vs strugglers
- Regional focus groups

### **Phase 3: Industry Benchmarking**
- Tax industry association data
- Competitor analysis (where legally available)
- Third-party industry reports

### **Phase 4: Pro-Tips Implementation**
- Convert insights into actionable tips
- Add confidence levels/data sources
- Create contextual triggers in the app

---

## 📝 **Content Framework**

Each Pro-Tip should include:
- **Data Source:** "Based on analysis of 500+ Liberty Tax franchises (2022-2024)"
- **Confidence Level:** High/Medium/Low based on sample size
- **Actionable Insight:** Specific, practical advice
- **Context:** When/why this tip is relevant
- **Success Metric:** How to measure if following the advice

---

## 🔄 **Adding New Questions**

As we continue developing the app, add new questions using this format:

### **Question Category**
**Origin:** [What part of app development sparked this question]
**Questions:** [Specific data-driven questions]
**Potential Sources:** [Where we might find answers]

---

*This document grows as we discover more user insights during development*
