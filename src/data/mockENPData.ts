export interface MealTypeData {
  count: number;
  percentage: number;
}

export interface ProgramByEligibility {
  eligibility: 'Free' | 'Reduced' | 'Paid' | 'Total';
  breakfast: MealTypeData;
  lunch: MealTypeData;
  snack: MealTypeData;
  supper: MealTypeData;
  aLaCarte: MealTypeData;
  adultBreakfast: MealTypeData;
  adultLunch: MealTypeData;
  adultSnack: MealTypeData;
  adultSupper: MealTypeData;
  total: MealTypeData;
}

export interface SchoolENPData {
  schoolName: string;
  siteType: 'Elementary School' | 'Middle School' | 'High School';
  totalEnrollment: number; // Added to interface
  snp: { count: number; percentage: number };
  snpTarget: number;
  snpDelta: number;
  eligibilityBreakdown: ProgramByEligibility[];
}

export const districtENPActual = 11.98;
export const districtENPBenchmark = 5.00;
export const districtTotalEnrollment = 3998; // Total District Enrollment

export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'snack', label: 'Snack' },
  { key: 'supper', label: 'Supper' },
  { key: 'aLaCarte', label: 'A La Carte' },
  { key: 'adultBreakfast', label: 'Adult Breakfast' },
  { key: 'adultLunch', label: 'Adult Lunch' },
  { key: 'adultSnack', label: 'Adult Snack' },
  { key: 'adultSupper', label: 'Adult Supper' },
  { key: 'total', label: 'Grand Total' }
] as const;

/**
 * MAIN DASHBOARD DATA
 * District-wide totals for the main page grid.
 */
export const programByEligibilityData: ProgramByEligibility[] = [
  {
    eligibility: 'Free',
    breakfast: { count: 120, percentage: 3.0 }, lunch: { count: 80, percentage: 2.0 }, snack: { count: 45, percentage: 1.12 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 245, percentage: 6.12 }
  },
  {
    eligibility: 'Reduced',
    breakfast: { count: 30, percentage: 0.75 }, lunch: { count: 40, percentage: 1.0 }, snack: { count: 8, percentage: 0.2 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 78, percentage: 1.95 }
  },
  {
    eligibility: 'Paid',
    breakfast: { count: 50, percentage: 1.25 }, lunch: { count: 60, percentage: 1.5 }, snack: { count: 46, percentage: 1.16 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 156, percentage: 3.91 }
  },
  {
    eligibility: 'Total',
    breakfast: { count: 200, percentage: 5.0 }, lunch: { count: 180, percentage: 4.5 }, snack: { count: 99, percentage: 2.48 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 479, percentage: 11.98 }
  }
];

/**
 * INDIVIDUAL SCHOOL DATA
 */
export const mockSchoolENPData: SchoolENPData[] = [
  {
    schoolName: 'Lincoln Elementary',
    siteType: 'Elementary School',
    totalEnrollment: 535,
    snp: { count: 42, percentage: 7.85 },
    snpTarget: 5.00,
    snpDelta: 2.85,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 12, percentage: 2.24 }, lunch: { count: 10, percentage: 1.87 }, snack: { count: 6, percentage: 1.12 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 28, percentage: 5.23 } },
      { eligibility: 'Reduced', breakfast: { count: 3, percentage: 0.56 }, lunch: { count: 4, percentage: 0.75 }, snack: { count: 1, percentage: 0.19 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 8, percentage: 1.50 } },
      { eligibility: 'Paid', breakfast: { count: 2, percentage: 0.37 }, lunch: { count: 3, percentage: 0.56 }, snack: { count: 1, percentage: 0.19 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 6, percentage: 1.12 } },
      { eligibility: 'Total', breakfast: { count: 17, percentage: 3.17 }, lunch: { count: 17, percentage: 3.18 }, snack: { count: 8, percentage: 1.50 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 42, percentage: 7.85 } }
    ]
  },
  {
    schoolName: 'Washington Middle',
    siteType: 'Middle School',
    totalEnrollment: 735,
    snp: { count: 67, percentage: 9.12 },
    snpTarget: 5.00,
    snpDelta: 4.12,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 20, percentage: 2.72 }, lunch: { count: 25, percentage: 3.40 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 45, percentage: 6.12 } },
      { eligibility: 'Reduced', breakfast: { count: 6, percentage: 0.82 }, lunch: { count: 6, percentage: 0.81 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 12, percentage: 1.63 } },
      { eligibility: 'Paid', breakfast: { count: 5, percentage: 0.68 }, lunch: { count: 5, percentage: 0.69 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 1.37 } },
      { eligibility: 'Total', breakfast: { count: 31, percentage: 4.22 }, lunch: { count: 36, percentage: 4.90 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 67, percentage: 9.12 } }
    ]
  },
  {
    schoolName: 'Roosevelt High',
    siteType: 'High School',
    totalEnrollment: 1054,
    snp: { count: 47, percentage: 4.46 },
    snpTarget: 5.00,
    snpDelta: -0.54,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 10, percentage: 0.95 }, lunch: { count: 15, percentage: 1.42 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 25, percentage: 2.37 } },
      { eligibility: 'Reduced', breakfast: { count: 6, percentage: 0.57 }, lunch: { count: 6, percentage: 0.57 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 12, percentage: 1.14 } },
      { eligibility: 'Paid', breakfast: { count: 5, percentage: 0.47 }, lunch: { count: 5, percentage: 0.48 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 0.95 } },
      { eligibility: 'Total', breakfast: { count: 21, percentage: 1.99 }, lunch: { count: 26, percentage: 2.47 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 47, percentage: 4.46 } }
    ]
  },
  {
    schoolName: 'Jefferson Elementary',
    siteType: 'Elementary School',
    totalEnrollment: 544,
    snp: { count: 38, percentage: 6.98 },
    snpTarget: 5.00,
    snpDelta: 1.98,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 11, percentage: 2.02 }, lunch: { count: 11, percentage: 2.02 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 22, percentage: 4.04 } },
      { eligibility: 'Reduced', breakfast: { count: 5, percentage: 0.92 }, lunch: { count: 5, percentage: 0.92 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 1.84 } },
      { eligibility: 'Paid', breakfast: { count: 3, percentage: 0.55 }, lunch: { count: 3, percentage: 0.55 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 6, percentage: 1.10 } },
      { eligibility: 'Total', breakfast: { count: 19, percentage: 3.49 }, lunch: { count: 19, percentage: 3.49 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 38, percentage: 6.98 } }
    ]
  },
  {
    schoolName: 'Adams Middle',
    siteType: 'Middle School',
    totalEnrollment: 588,
    snp: { count: 51, percentage: 8.67 },
    snpTarget: 5.00,
    snpDelta: 3.67,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 17, percentage: 2.89 }, lunch: { count: 18, percentage: 3.06 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 35, percentage: 5.95 } },
      { eligibility: 'Reduced', breakfast: { count: 5, percentage: 0.85 }, lunch: { count: 5, percentage: 0.85 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 1.70 } },
      { eligibility: 'Paid', breakfast: { count: 3, percentage: 0.51 }, lunch: { count: 3, percentage: 0.51 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 6, percentage: 1.02 } },
      { eligibility: 'Total', breakfast: { count: 25, percentage: 4.25 }, lunch: { count: 26, percentage: 4.42 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 51, percentage: 8.67 } }
    ]
  },
  {
    schoolName: 'Madison High',
    siteType: 'High School',
    totalEnrollment: 850,
    snp: { count: 85, percentage: 10.00 },
    snpTarget: 5.00,
    snpDelta: 5.00,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 30, percentage: 3.53 }, lunch: { count: 30, percentage: 3.53 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 60, percentage: 7.06 } },
      { eligibility: 'Reduced', breakfast: { count: 8, percentage: 0.94 }, lunch: { count: 7, percentage: 0.82 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 15, percentage: 1.76 } },
      { eligibility: 'Paid', breakfast: { count: 5, percentage: 0.59 }, lunch: { count: 5, percentage: 0.59 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 1.18 } },
      { eligibility: 'Total', breakfast: { count: 43, percentage: 5.06 }, lunch: { count: 42, percentage: 4.94 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 85, percentage: 10.00 } }
    ]
  },
  {
    schoolName: 'Monroe Elementary',
    siteType: 'Elementary School',
    totalEnrollment: 410,
    snp: { count: 49, percentage: 11.95 },
    snpTarget: 5.00,
    snpDelta: 6.95,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 17, percentage: 4.15 }, lunch: { count: 18, percentage: 4.39 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 35, percentage: 8.54 } },
      { eligibility: 'Reduced', breakfast: { count: 5, percentage: 1.22 }, lunch: { count: 4, percentage: 0.98 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 9, percentage: 2.20 } },
      { eligibility: 'Paid', breakfast: { count: 2, percentage: 0.49 }, lunch: { count: 3, percentage: 0.72 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 5, percentage: 1.21 } },
      { eligibility: 'Total', breakfast: { count: 24, percentage: 5.86 }, lunch: { count: 25, percentage: 6.09 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 49, percentage: 11.95 } }
    ]
  },
  {
    schoolName: 'Jackson Middle',
    siteType: 'Middle School',
    totalEnrollment: 490,
    snp: { count: 61, percentage: 12.45 },
    snpTarget: 5.00,
    snpDelta: 7.45,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 22, percentage: 4.49 }, lunch: { count: 23, percentage: 4.69 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 45, percentage: 9.18 } },
      { eligibility: 'Reduced', breakfast: { count: 5, percentage: 1.02 }, lunch: { count: 5, percentage: 1.02 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 2.04 } },
      { eligibility: 'Paid', breakfast: { count: 3, percentage: 0.61 }, lunch: { count: 3, percentage: 0.62 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 6, percentage: 1.23 } },
      { eligibility: 'Total', breakfast: { count: 30, percentage: 6.12 }, lunch: { count: 31, percentage: 6.33 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 61, percentage: 12.45 } }
    ]
  }
];