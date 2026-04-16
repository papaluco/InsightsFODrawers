export interface mockSchoolieData {
  id: string;
  name: string;
  promptText: string;
  previewOutput: string;
}

export const initialSchooliePrompts: mockSchoolieData[] = [
  {
    id: 'workspace',
    name: 'Workspace',
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
  { id: 'breakfast', name: 'Breakfast', promptText: 'Analyze Breakfast ADP against the 20% benchmark...', previewOutput: '<h2>Breakfast ADP</h2><p>Detailed breakfast participation analysis.</p>' },
  { id: 'lunch', name: 'Lunch', promptText: 'Evaluate Lunch participation and service efficiency...', previewOutput: '<h2>Lunch Analysis</h2><p>Service efficiency report.</p>' },
  { id: 'snack', name: 'Snack', promptText: 'Review Snack program performance and growth...', previewOutput: '<h2>Snack Program</h2><p>Performance and growth metrics.</p>' },
  { id: 'supper', name: 'Supper', promptText: 'Assess Supper program reaching and meal counts...', previewOutput: '<h2>Supper Program</h2><p>Reach and count assessment.</p>' },
  { id: 'revenue', name: 'Revenue', promptText: 'Perform a deep dive into revenue vs projected benchmarks...', previewOutput: '<h2>Revenue Deep Dive</h2><p>Projected vs Actual report.</p>' },
  { id: 'waste', name: 'Waste', promptText: 'Identify areas of excessive food waste and cost recovery...', previewOutput: '<h2>Waste Analysis</h2><p>Cost recovery opportunities.</p>' },
  { id: 'meals', name: 'Meals', promptText: 'Track total meal counts and service trends...', previewOutput: '<h2>Meal Counts</h2><p>Total service trends.</p>' },
  { id: 'meqs', name: 'MEQs', promptText: 'Calculate and analyze Meal Equivalents (MEQs) efficiency...', previewOutput: '<h2>MEQ Efficiency</h2><p>Meal Equivalent calculations.</p>' },
  { id: 'inv_value', name: 'Inv. Value', promptText: 'Report on current inventory value across all sites...', previewOutput: '<h2>Inventory Value</h2><p>Current site valuations.</p>' },
  { id: 'inv_turnover', name: 'Inv. Turnover', promptText: 'Analyze how quickly inventory is moving through the system...', previewOutput: '<h2>Inventory Turnover</h2><p>Flow analysis report.</p>' },
  { id: 'inv_discrepancy', name: 'Inv. Discrepancy', promptText: 'Identify gaps between physical and system inventory counts...', previewOutput: '<h2>Inventory Discrepancy</h2><p>Gap identification report.</p>' },
  { 
    id: 'mplh', 
    name: 'MPLH', 
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director. Analyze the following:
Meals Per Labor Hour (MPLH) is 12.5 and its benchmark is 15.0. 
Provide a concise HTML summary of labor efficiency.`, 
    previewOutput: '<h2>MPLH Analysis</h2><p>Labor efficiency is currently 16% below target.</p>' 
  },
  { 
    id: 'pna', 
    name: 'PNA', 
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director. Analyze the following:
Participation-to-Non-Adjustment (PNA) Ratio is 0.95 and its benchmark is 1.0.
Provide a concise HTML summary of the adjustment ratio.`, 
    previewOutput: '<h2>PNA Ratios</h2><p>PNA ratio is performing within acceptable variance at 0.95.</p>' 
  },
  { 
    id: 'enp', 
    name: 'ENP', 
    promptText: `You are an AI Assistant to the K-12 School Nutrition Director. Analyze the following:
Estimated National Participation (ENP) is 62% and its benchmark is 65%.
Provide a concise HTML summary of national participation trends.`, 
    previewOutput: '<h2>ENP Metrics</h2><p>National participation metrics are slightly below the district goal of 65%.</p>' 
  }
];