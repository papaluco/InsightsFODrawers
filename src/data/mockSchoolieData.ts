import { SchooliePrompt } from '../types/SchoolieTypes';

export type { SchooliePrompt as mockSchoolieDat };

export const initialSchooliePrompts: SchooliePrompt[] = [
  {
    id: 'workspace',
    name: 'Workspace',
    version: 4,
    updatedBy: 'John Smith',
    updatedAt: '2026-03-20',
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director of Child Nutrition Programs.
You are here to provide a short summary of KPI analysis to Child Nutrition data for the following KPIs.
The following are the KPIs with their value and benchmarks.
As of today, Friday, 20th March, 2026
Revenue is $0.00 and its benchmark is $4,173.00. Revenue is below the benchmark by $4,173.00, so it is not performing well.
Supper Average Daily Participation (ADP) % is 0% and its benchmark is 0%. Supper ADP is equal to the benchmark,so it is performing well.
Breakfast Average Daily Participation (ADP) % is 0% and its benchmark is 3%. Breakfast ADP is below the benchmark by 3 meals,so it is not performing well.
Lunch Average Daily Participation (ADP) % is 0% and its benchmark is 4%. Lunch ADP is below the benchmark by 4 meals,so it is not performing well.
Snack Average Daily Participation (ADP) % is 0% and its benchmark is 6%. Snack ADP is below the benchmark by 6 meals,so it is not performing well.
Waste is $0.00 and its benchmark is $562,581.00. Waste is below the benchmark by $562,581.00, so it is performing well.
Meals is 0 and its benchmark is 685. Meals is below the benchmark by 685, so it is not performing well.
Meal Equivalents (MEQs) is 0 and its benchmark is 683. Meal Equivalents (MEQs) is below the benchmark by 683, so it is not performing well.
Economically Disadvantaged (EcoDis) is 0% and its benchmark is 1%. Economically Disadvantaged (EcoDis) is below the benchmark by 1 %, so it is not performing well.
Inventory Value is 0. This is an informational KPI.
Inventory Turnover Rate is 0 (1 days). The benchmark varies by site and is not applicable at this level. 
Physical Inventory Discrepancy is 0% of total inventory and its benchmark is 10%. Physical Inventory Discrepancy is below the benchmark by 10%, so it is performing well.
Provide a short summary of K-12 analysis of the following data on what went well and what needs improvements.
Analyze the following data and provide a response that is clear, concise, and formatted professionally for display on a webpage using html.
Format the response using valid, well-structured HTML with all tags properly opened and closed.
Use <h2>, <p>, <ul>, <li>, and <strong> for formatting.`,
    previewOutput: `
      <h2>KPI Analysis Summary for Child Nutrition Programs</h2>
      <p>As of Friday, 20th March, 2026, the following is an analysis of the KPIs for the K-12 Child Nutrition Programs. This summary includes areas of success and opportunities for improvement.</p>
      
      <h2>What Went Well</h2>
      <ul>
        <li><strong>Supper Average Daily Participation (ADP):</strong> Performance is on target, meeting its benchmark at 0%.</li>
        <li><strong>Waste:</strong> Waste is significantly below the benchmark by $562,581.00, which is a positive outcome.</li>
        <li><strong>Physical Inventory Discrepancy:</strong> The discrepancy is 0%, which is 10% below the benchmark. This demonstrates a well-maintained inventory system.</li>
      </ul>

      <h2>Areas for Improvement</h2>
      <ul>
        <li><strong>Revenue:</strong> Current revenue is $0.00, falling short of the benchmark by $4,173.00.</li>
        <li><strong>Breakfast ADP:</strong> Daily participation is 0%, which is below the benchmark by 3 meals.</li>
        <li><strong>Lunch ADP:</strong> Daily participation is 0%, which is below the benchmark by 4 meals.</li>
        <li><strong>Snack ADP:</strong> Daily participation is 0%, which is below the benchmark by 6 meals.</li>
        <li><strong>Meals:</strong> The current count is 0 meals, which is 685 below the benchmark.</li>
        <li><strong>Meal Equivalents (MEQs):</strong> The current count is 0, falling short of the benchmark by 683.</li>
        <li><strong>Economically Disadvantaged (EcoDis):</strong> The current participation rate is 0%, which is below the target of 1%.</li>
      </ul>
    `
  },
  { 
    id: 'insights', 
    name: 'Insights', 
    version: 3,
    updatedBy: 'Bob Johnson',
    updatedAt: '2026-03-20',
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director of Child Nutrition Programs.
You are here to provide a short summary of KPI analysis to Child Nutrition data for the following KPIs.
The following are the KPIs with their value and benchmarks.
As of today, Friday, 20th March, 2026

Meals Per Labor Hour (MPLH) is 12.5 and its benchmark is 15.0. MPLH is below the benchmark, so it is not performing well.
Estimated National Participation (ENP) is 62% and its benchmark is 65%. ENP is slightly below the benchmark.
Participation-to-Non-Adjustment (PNA) Ratio is 0.95 and its benchmark is 1.0. PNA is performing within acceptable variance.
Revenue is $0.00 and its benchmark is $4,173.00. Revenue is below the benchmark by $4,173.00, so it is not performing well.
Supper Average Daily Participation (ADP) % is 0% and its benchmark is 0%. Supper ADP is equal to the benchmark, so it is performing well.
Breakfast Average Daily Participation (ADP) % is 0% and its benchmark is 3%. Breakfast ADP is below the benchmark.
Lunch Average Daily Participation (ADP) % is 0% and its benchmark is 4%. Lunch ADP is below the benchmark.
Waste is $0.00 and its benchmark is $562,581.00. Waste is below the benchmark, so it is performing well.
Meal Equivalents (MEQs) is 0 and its benchmark is 683. MEQs are below the benchmark.

Provide a short summary of K-12 analysis of the following data on what went well and what needs improvements.
Analyze the following data and provide a response that is clear, concise, and formatted professionally for display on a webpage using html.
Format the response using valid, well-structured HTML with all tags properly opened and closed.
Use <h2>, <p>, <ul>, <li>, and <strong> for formatting.`, 
    previewOutput: `<h2>Insights Overview</h2><p>Analysis of labor efficiency and participation metrics suggests a need for schedule optimization.</p><ul><li><strong>MPLH:</strong> Currently 12.5, trailing the 15.0 goal.</li><li><strong>ENP:</strong> Close to target at 62%.</li><li><strong>PNA:</strong> Healthy at 0.95.</li></ul>` 
  },
  { 
    id: 'eco_dis', 
    name: 'Eco Dis', 
    version: 1,
    updatedBy: 'Bill Williams',
    updatedAt: '2026-03-20',
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director of Child Nutrition Programs.
You are here to provide a short summary of KPI analysis to Child Nutrition data for the following KPIs.
The following are the KPIs with their value and benchmarks.
As of today, Friday, 20th March, 2026

Economically Disadvantaged (EcoDis) is 0% and its benchmark is 1%. Economically Disadvantaged (EcoDis) is below the benchmark by 1 %, so it is not performing well.

Provide a short summary of K-12 analysis of the following data on what went well and what needs improvements.
Analyze the following data and provide a response that is clear, concise, and formatted professionally for display on a webpage using html.
Format the response using valid, well-structured HTML with all tags properly opened and closed.
Use <h2>, <p>, <ul>, <li>, and <strong> for formatting.`, 
    previewOutput: `<h2>Eco Dis Analysis</h2><p>Participation among economically disadvantaged students is currently below the 1% benchmark at 0%.</p>` 
},
{ 
    id: 'schoolie_feedback', 
    name: 'Schoolie Feedback', 
    version: 1, 
    updatedBy: 'Leonardo DiCaprio', 
    updatedAt: '2026-02-01', 
    promptText: `You are an expert product analyst evaluating the performance of an AI system called Schoolie.

You are analyzing user feedback data about AI-generated responses. Your goal is to identify patterns, issues, and opportunities to improve the AI’s performance.

You will receive:
1. A summary of feedback metrics (aggregated counts and percentages)
2. A list of individual feedback records, which may include:
   - prompt type and prompt name
   - prompt version
   - user feedback (helpful or not helpful)
   - feedback reasons (e.g., incorrect data, too vague, not useful)
   - optional user comments
   - the AI response text
   - contextual data such as KPI, sites, and date ranges

Your responsibilities:

1. Analyze overall performance
   - What percentage of responses are helpful vs not helpful?
   - Are there any clear problem areas?

2. Identify underperforming areas
   - Which prompt types, prompt names, or KPIs are performing poorly?
   - Which prompt versions appear to perform worse than others?

3. Analyze feedback reasons
   - What are the most common reasons for negative feedback?
   - What do these reasons suggest about the quality of the AI output?

4. Detect patterns and trends
   - Are certain districts or users consistently reporting issues?
   - Are there recurring themes in comments or responses?

5. Provide actionable recommendations
   - Suggest specific improvements to prompts or data
   - Identify areas where the AI may need more context or better formatting
   - Recommend what should be prioritized for improvement

Guidelines:
- Be analytical, clear, and concise
- Be willing to form opinions based on the data
- Do not simply restate the data — interpret it
- Use plain language suitable for a product team
- Highlight the most important findings first

Output structure:
- Brief summary of overall performance
- What is working well
- What needs improvement
- Key patterns or insights
- Recommended actions

Focus on helping the product team improve the AI system.`, 
    previewOutput: `

## **Summary of Overall Performance**

Schoolie is receiving mixed feedback overall, with approximately **68% of responses marked as helpful and 32% as not helpful**. While the majority of responses are positive, there are clear areas where performance is inconsistent and impacting user trust.

The feedback indicates that Schoolie is generally effective for high-level summaries but struggles in more complex or comparative scenarios.

---

## **What is Working Well**

* **Dashboard Analysis and KPI Drawers (e.g., MPLH)** are performing strongly, with helpful rates above 75%.

* Users respond positively to:

  * Clear summaries
  * Straightforward KPI explanations
  * Structured outputs with identifiable “what’s working” vs “what needs improvement”

* Feedback suggests that Schoolie is most effective when:

  * The dataset is simple and focused
  * The prompt is well-scoped (single KPI, single context)

---

## **What Needs Improvement**

### 1. Compare Selected Sites

* This is the **lowest performing area**, with helpful rates near or below 50%.
* Feedback suggests:

  * Responses are too generalized
  * Lack of meaningful differentiation between sites
  * Limited actionable insight

👉 Likely issue: prompts are not guiding the model to make **explicit comparisons or highlight differences clearly**

---

### 2. Trend Analysis

* Trend analysis shows **low confidence and lower helpful scores**
* Common issues:

  * Weak or obvious observations
  * Lack of meaningful trend interpretation
  * Minimal explanation of “why” trends are happening

👉 Likely issue: insufficient time range or lack of deeper contextual data

---

### 3. Specific KPIs (e.g., Waste, Revenue)

* Some KPIs show inconsistent performance
* Feedback indicates:

  * Responses are sometimes too vague
  * Recommendations are missing or too generic

---

## **Key Feedback Patterns**

### Most Common Negative Feedback Reasons:

1. **Too vague**
2. **Not useful**
3. **Missing recommendations**

This suggests that:

* Schoolie is describing data, but not interpreting it deeply enough
* Users want **clear guidance, not just summaries**

---

### User Behavior Observations:

* A small number of users are responsible for a higher proportion of negative feedback
* However, even after accounting for this, certain prompts consistently underperform across multiple users

---

### Comment Insights:

Recurring themes in comments include:

* “This doesn’t tell me anything new”
* “I already know this from the data”
* “Needs clearer recommendations”

👉 This reinforces that **value = insight + action**, not just description

---

## **Prompt Version Observations**

* Newer prompt versions show **slight improvement in helpfulness**, particularly in KPI drawer contexts
* However, **Compare Sites and Trend Analysis have not significantly improved across versions**

👉 Suggests those prompts need **structural redesign**, not incremental tweaks

---

## **Recommendations**

### High Priority

1. **Improve Compare Sites Prompt**

   * Force explicit comparisons:

     * “Site A vs Site B”
     * highlight top/bottom performers
   * Require:

     * differences
     * ranking
     * actionable takeaways

---

2. **Enhance Trend Analysis Prompt**

   * Require:

     * explanation of trends (not just description)
     * identification of anomalies
     * possible causes

   * Consider:

     * enforcing minimum date ranges (e.g., 14–30 days)

---

3. **Increase Actionability Across All Prompts**

   * Add explicit requirement:

     * “Provide 2–3 actionable recommendations”
   * Avoid generic language

---

### Medium Priority

4. **Refine Underperforming KPIs**

   * Focus on KPIs with high “Too Vague” feedback
   * Improve prompt specificity per KPI

---

5. **Leverage Feedback Reasons in Prompt Design**

   * Address top issues directly:

     * “Avoid vague statements”
     * “Provide specific examples”

---

### Low Priority

6. **User-Level Follow-Up**

   * Reach out to users with repeated negative feedback
   * Validate whether issues are prompt-related or expectation-related


` 
},
  { id: 'breakfast', name: 'Breakfast', version: 1,updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Analyze Breakfast ADP against the 20% benchmark...', previewOutput: '<h2>Breakfast ADP</h2><p>Detailed breakfast participation analysis.</p>' },
  { id: 'lunch', name: 'Lunch', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Evaluate Lunch participation and service efficiency...', previewOutput: '<h2>Lunch Analysis</h2><p>Service efficiency report.</p>' },
  { id: 'snack', name: 'Snack', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Review Snack program performance and growth...', previewOutput: '<h2>Snack Program</h2><p>Performance and growth metrics.</p>' },
  { id: 'supper', name: 'Supper', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Assess Supper program reaching and meal counts...', previewOutput: '<h2>Supper Program</h2><p>Reach and count assessment.</p>' },
  { id: 'revenue', name: 'Revenue', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Perform a deep dive into revenue vs projected benchmarks...', previewOutput: '<h2>Revenue Deep Dive</h2><p>Projected vs Actual report.</p>' },
  { id: 'waste', name: 'Waste', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Identify areas of excessive food waste and cost recovery...', previewOutput: '<h2>Waste Analysis</h2><p>Cost recovery opportunities.</p>' },
  { id: 'meals', name: 'Meals', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Track total meal counts and service trends...', previewOutput: '<h2>Meal Counts</h2><p>Total service trends.</p>' },
  { id: 'meqs', name: 'MEQs', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Calculate and analyze Meal Equivalents (MEQs) efficiency...', previewOutput: '<h2>MEQ Efficiency</h2><p>Meal Equivalent calculations.</p>' },
  { id: 'inv_value', name: 'Inv. Value', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Report on current inventory value across all sites...', previewOutput: '<h2>Inventory Value</h2><p>Current site valuations.</p>' },
  { id: 'inv_turnover', name: 'Inv. Turnover', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Analyze how quickly inventory is moving through the system...', previewOutput: '<h2>Inventory Turnover</h2><p>Flow analysis report.</p>' },
  { id: 'inv_discrepancy', name: 'Inv. Discrepancy', version: 1, updatedBy: 'System', updatedAt: '2026-03-20', promptText: 'Identify gaps between physical and system inventory counts...', previewOutput: '<h2>Inventory Discrepancy</h2><p>Gap identification report.</p>' },
  { id: 'compare_sites', name: 'Compare Sites', version: 1, updatedBy: 'Bob Jones', updatedAt: '2026-02-21', promptText: 'Compare performance metrics across different sites...', previewOutput: '<h2>Site Comparison</h2><p>Performance metrics report.</p>' },
  { id: 'trend_analysis', name: 'Trend Analysis', version: 1, updatedBy: 'Jude Law', updatedAt: '2026-01-01', promptText: 'Analyze trends in performance metrics over time...', previewOutput: '<h2>Trend Analysis</h2><p>Performance trends report.</p>' },
  
  { 
    id: 'mplh', 
    name: 'MPLH', 
    version: 3,
    updatedBy: 'Joan Doe',
    updatedAt: '2026-03-20',
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director. Analyze the following:
Meals Per Labor Hour (MPLH) is 12.5 and its benchmark is 15.0. 
Provide a concise HTML summary of labor efficiency.`, 
    previewOutput: '<h2>MPLH Analysis</h2><p>Labor efficiency is currently 16% below target.</p>' 
  },
  { 
    id: 'pna', 
    name: 'PNA', 
    version: 1,
    updatedBy: 'Betty Brown',
    updatedAt: '2026-03-20',
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director. Analyze the following:
Participation-to-Non-Adjustment (PNA) Ratio is 0.95 and its benchmark is 1.0.
Provide a concise HTML summary of the adjustment ratio.`, 
    previewOutput: '<h2>PNA Ratios</h2><p>PNA ratio is performing within acceptable variance at 0.95.</p>' 
  },
  { 
    id: 'enp', 
    name: 'ENP', 
    version: 1,
    updatedBy: 'Bere Smith',
    updatedAt: '2026-03-20',
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director. Analyze the following:
Estimated National Participation (ENP) is 62% and its benchmark is 65%.
Provide a concise HTML summary of national participation trends.`, 
    previewOutput: '<h2>ENP Metrics</h2><p>National participation metrics are slightly below the district goal of 65%.</p>' 
  }
];