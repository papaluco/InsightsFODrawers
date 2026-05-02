import { KPIKey, StructuredAIResponse, AIResponsePayload } from '../types/SchoolieTypes';

export type { KPIKey, StructuredAIResponse, AIResponsePayload };

export const mockAIResponses: Record<KPIKey, AIResponsePayload> = {
  MPLH: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Based on current labor hours and meal equivalents for the selected period, the district is performing 1.62 points below the benchmark of 15.0 MPLH, indicating an opportunity to improve labor efficiency across site types.',
      whatsWorking:
        'High School sites are exceeding benchmarks by +1.37 through efficient staggered service times and streamlined serving line operations.',
      needsAttention:
        'Middle Schools are the primary drag on efficiency, running 3.13 points below target, likely due to overstaffing during prep periods.',
      recommendation:
        'Consider conducting a labor scheduling audit at Middle School sites, focusing on alignment between prep staffing and actual service volume.',
    },
  },

  MEALS: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Total meal count for the district is trending 4.2% below the prior year for the same period, with the gap widening over the last six weeks.',
      whatsWorking:
        'Elementary sites have maintained steady participation rates, with breakfast meal counts up 2.1% year-over-year.',
      needsAttention:
        'High School meal counts are down 11.3%, which appears correlated with recent menu changes and the expansion of a la carte options.',
      recommendation:
        'Review high school menu offerings and consider piloting a student choice initiative to improve meal program appeal and reverse the participation decline.',
    },
  },

  MEAL_EQUIVALENTS: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'District meal equivalents are currently at 14,823 for the period, representing 97.2% of the prior year equivalent and 94.8% of the annual target.',
      whatsWorking:
        'A la carte sales are contributing positively, with meal equivalent conversions tracking 3.5% above projections.',
      needsAttention:
        'Snack sales are converting at a lower equivalent rate than expected, reducing the overall meal equivalent count by an estimated 340 units.',
      recommendation:
        'Revisit snack pricing and bundling strategies to improve meal equivalent capture rates, particularly during after-school service windows.',
    },
  },

  BREAKFAST: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'District breakfast participation is at 38.4% of enrolled students, which is 5.2 percentage points below the state average for comparable districts.',
      whatsWorking:
        'Sites with Breakfast After the Bell programs are showing 22% higher participation than traditional cafeteria-only breakfast service.',
      needsAttention:
        'Seven sites still do not offer Breakfast After the Bell, accounting for the majority of below-average participation numbers.',
      recommendation:
        'Prioritize expanding Breakfast After the Bell to the remaining seven sites, starting with the three highest-enrollment schools.',
    },
  },

  LUNCH: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Lunch participation is at 71.8% of enrolled students for the period, slightly above the district target of 70% but down 1.4 points from the same period last year.',
      whatsWorking:
        'The new rotating menu cycle introduced in January is showing positive impact, with participation up 3.1% in the weeks following rollout.',
      needsAttention:
        'Thursday participation consistently dips 6–8% below the weekly average, suggesting a menu-day preference issue.',
      recommendation:
        'Analyze Thursday menu offerings against student preference survey data and consider swapping out lower-performing items on that day.',
    },
  },

  SNACK: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Snack service is generating an average of 1,240 snacks per day across participating sites, with significant variation in uptake between elementary and middle school levels.',
      whatsWorking:
        'Elementary school snack participation is strong at 68% of eligible students, driven by well-timed service windows aligned with activity schedules.',
      needsAttention:
        'Middle school snack participation is at only 31%, well below the program target of 50%, indicating a timing or awareness gap.',
      recommendation:
        'Survey middle school students and staff on snack program timing and locations; consider repositioning service to higher-traffic areas.',
    },
  },

  SUPPER: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Supper program participation is at 42% capacity across the 8 sites currently offering afterschool meals, with district-wide coverage at 53% of enrolled sites.',
      whatsWorking:
        'Sites partnered with afterschool enrichment programs are averaging 78% supper participation, demonstrating the value of program integration.',
      needsAttention:
        'Standalone supper sites without enrichment partnerships are averaging only 28% participation, raising sustainability concerns.',
      recommendation:
        'Evaluate standalone supper sites for potential partnership with community organizations or afterschool programs to boost enrollment and long-term sustainability.',
    },
  },

  REVENUE: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'District food service revenue is at $2.14M for the period, tracking 3.8% below projections due to lower paid meal participation and reduced a la carte sales.',
      whatsWorking:
        'Catering revenue has exceeded targets by 18%, partially offsetting shortfalls in the main service programs.',
      needsAttention:
        'Paid meal revenue is down 7.2% year-over-year, driven primarily by a decline in paid lunch participation at the high school level.',
      recommendation:
        'Develop a targeted re-engagement plan for paid meal participants at high schools, focusing on value perception and menu quality improvements.',
    },
  },

  WASTE: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Estimated food waste across the district is averaging 8.4% of prepared meals for the period, which is 2.1 percentage points above the district target of 6.3%.',
      whatsWorking:
        'Three elementary sites have achieved waste rates below 5% through consistent tray waste tracking and daily production adjustments.',
      needsAttention:
        'Two middle school sites are recording waste rates above 14%, significantly above both the district target and comparable peer benchmarks.',
      recommendation:
        'Deploy tray waste observation studies at the two high-waste middle school sites to identify specific menu items driving waste and adjust production quantities accordingly.',
    },
  },

  ECON_DISADVANTAGED: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Economically disadvantaged student participation in meal programs is at 84.2% for the period, above the state benchmark of 82%, but 3.1 points below the district\'s own performance from the same period last year.',
      whatsWorking:
        'Direct certification enrollment outreach has successfully identified 340 additional eligible students this year, meaningfully expanding program access.',
      needsAttention:
        '12 schools have participation rates below 78%, suggesting barriers to access or awareness that may be limiting eligible student meal uptake.',
      recommendation:
        'Focus outreach efforts on the 12 underperforming schools, coordinating with counselors and family liaisons to identify and address specific access barriers.',
    },
  },

  PAID_NOT_APPLIED: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Currently 187 students across the district have submitted free or reduced meal applications but remain in a paid status pending processing, representing both a revenue recovery and a program access opportunity.',
      whatsWorking:
        'Application processing time has improved by 2 days since January, reducing the window students remain in a pending-paid status.',
      needsAttention:
        '42 of the pending applications are 10 or more days old, indicating a potential processing bottleneck or missing documentation issue.',
      recommendation:
        'Initiate outreach to families with applications pending 7 or more days to confirm documentation receipt and resolve any outstanding requirements.',
    },
  },

  ENP: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'An estimated 892 students who qualify for free or reduced meals are not currently participating in the meal program, representing a significant participation gap and untapped access opportunity.',
      whatsWorking:
        'The ENP count has decreased by 14% since the start of the direct outreach campaign launched in October, indicating the program is having a measurable impact.',
      needsAttention:
        'The highest ENP concentrations are at three high schools, where stigma and scheduling conflicts are frequently cited as barriers in student feedback.',
      recommendation:
        'Explore grab-and-go meal options and alternative meal pickup locations at the three highest-ENP high schools to reduce stigma and scheduling-related barriers.',
    },
  },

  PHYS_INV_DISCREPANCY: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'The district\'s current physical inventory variance is 4.7%, exceeding the acceptable threshold of 2.0% and indicating potential issues with receiving accuracy, stock tracking, or usage recording across sites.',
      whatsWorking:
        'Seven sites are maintaining variances under 1.5%, demonstrating that accurate inventory control is achievable with consistent processes.',
      needsAttention:
        'Four sites account for 78% of the total discrepancy value, with one site showing a 12.3% variance that warrants immediate investigation.',
      recommendation:
        'Conduct an on-site inventory audit at the four high-variance locations, focusing on receiving documentation accuracy and mid-month adjustment processes.',
    },
  },

  INV_VALUE: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'Current district inventory value is $186,400, which is 23% above the recommended holding target and may indicate over-purchasing or slow-moving product accumulation at several sites.',
      whatsWorking:
        'Non-perishable staple categories are well-stocked and aligned with projected usage, providing solid coverage through the remainder of the period.',
      needsAttention:
        'Dairy and produce inventory values are elevated relative to projected usage, increasing the risk of spoilage and waste in the next 10 days.',
      recommendation:
        'Issue a fresh product alert to site managers and adjust upcoming produce and dairy orders downward until current stock is drawn to appropriate levels.',
    },
  },

  INV_TURNOVER: {
    status: 'success',
    fromCache: false,
    isStructured: true,
    generatedAt: '2026-05-01T10:00:00.000Z',
    data: {
      summary:
        'The district\'s inventory turnover rate is 4.2 turns per period, below the recommended rate of 6.0, indicating that inventory is not moving as efficiently as expected relative to purchasing volume.',
      whatsWorking:
        'High-volume commodity items are turning at 7.8 times per period, reflecting strong usage alignment and minimal overstock in that category.',
      needsAttention:
        'Specialty and ethnic food items are showing a turnover rate of only 1.9, suggesting over-procurement relative to actual student demand.',
      recommendation:
        'Review purchasing quantities for specialty items and reduce order frequencies to better align with actual usage rates and improve overall program turnover.',
    },
  },
};
