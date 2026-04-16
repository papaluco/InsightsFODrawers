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

      <h2>Informational KPIs</h2>
      <ul>
        <li><strong>Inventory Value:</strong> Inventory is currently valued at $0. This KPI serves as informational only.</li>
        <li><strong>Inventory Turnover Rate:</strong> The turnover rate is 0 (1 day). Benchmarks vary by site, so this KPI is for ongoing monitoring.</li>
      </ul>
      <p>Overall, the KPIs indicate room for growth in meal participation, revenue generation, and engagement of economically disadvantaged students. Continued monitoring and strategic interventions will be essential to closing performance gaps.</p>
    `
  },
  {
    id: 'mplh',
    name: 'MPLH',
    promptText: 'Analyze Meals Per Labor Hour (MPLH) based on {site_data}...',
    previewOutput: '<h2>MPLH Analysis</h2><p>Your labor efficiency is within the top 10% of the district.</p>'
  }
];