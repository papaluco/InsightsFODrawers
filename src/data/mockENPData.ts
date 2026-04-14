export interface MealTypeData {
  count: number;
  percentage: number;
}

export interface ProgramByEligibility {
  eligibility: 'Free' | 'Reduced' | 'Total' | 'Eligible' | 'Opportunity';
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
  totalEnrollment: number;
  snp: { count: number; percentage: number };
  snpTarget: number;
  snpDelta: number;
  eligibilityBreakdown: ProgramByEligibility[];
}

export const districtENPActual = 8.07; // Recalculated for Free + Reduced only
export const districtENPBenchmark = 5.00;
export const districtTotalEnrollment = 3998;

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
    eligibility: 'Total',
    breakfast: { count: 150, percentage: 3.75 }, lunch: { count: 120, percentage: 3.0 }, snack: { count: 53, percentage: 1.32 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 323, percentage: 8.07 }
  },
  {
    eligibility: 'Eligible',
    breakfast: { count: 200, percentage: 5.0 }, lunch: { count: 180, percentage: 4.5 }, snack: { count: 99, percentage: 2.48 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 479, percentage: 11.98 }
  },
  {
    eligibility: 'Opportunity',
    breakfast: { count: 50, percentage: 1.25 }, lunch: { count: 60, percentage: 1.50 }, snack: { count: 46, percentage: 1.15 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 156, percentage: 3.90 }
  }
];

export const mockSchoolENPData: SchoolENPData[] = [
  {
    schoolName: 'Lincoln Elementary',
    siteType: 'Elementary School',
    totalEnrollment: 535,
    snp: { count: 36, percentage: 6.73 },
    snpTarget: 5.00,
    snpDelta: 1.73,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 12, percentage: 2.24 }, lunch: { count: 10, percentage: 1.87 }, snack: { count: 6, percentage: 1.12 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 28, percentage: 5.23 } },
      { eligibility: 'Reduced', breakfast: { count: 3, percentage: 0.56 }, lunch: { count: 4, percentage: 0.75 }, snack: { count: 1, percentage: 0.19 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 8, percentage: 1.50 } },
      { eligibility: 'Total', breakfast: { count: 15, percentage: 2.80 }, lunch: { count: 14, percentage: 2.62 }, snack: { count: 7, percentage: 1.31 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 36, percentage: 6.73 } },
      { eligibility: 'Eligible', breakfast: { count: 25, percentage: 4.67 }, lunch: { count: 28, percentage: 5.23 }, snack: { count: 15, percentage: 2.80 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 68, percentage: 12.71 } },
      { eligibility: 'Opportunity', breakfast: { count: 10, percentage: 1.87 }, lunch: { count: 14, percentage: 2.62 }, snack: { count: 8, percentage: 1.50 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 32, percentage: 5.98 } }
    ]
  },
  {
    schoolName: 'Washington Middle',
    siteType: 'Middle School',
    totalEnrollment: 735,
    snp: { count: 57, percentage: 7.75 },
    snpTarget: 5.00,
    snpDelta: 2.75,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 20, percentage: 2.72 }, lunch: { count: 25, percentage: 3.40 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 45, percentage: 6.12 } },
      { eligibility: 'Reduced', breakfast: { count: 6, percentage: 0.82 }, lunch: { count: 6, percentage: 0.81 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 12, percentage: 1.63 } },
      { eligibility: 'Total', breakfast: { count: 26, percentage: 3.54 }, lunch: { count: 31, percentage: 4.22 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 57, percentage: 7.75 } },
      { eligibility: 'Eligible', breakfast: { count: 40, percentage: 5.44 }, lunch: { count: 45, percentage: 6.12 }, snack: { count: 10, percentage: 1.36 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 95, percentage: 12.92 } },
      { eligibility: 'Opportunity', breakfast: { count: 14, percentage: 1.90 }, lunch: { count: 14, percentage: 1.90 }, snack: { count: 10, percentage: 1.36 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 38, percentage: 5.17 } }
    ]
  },
  {
    schoolName: 'Roosevelt High',
    siteType: 'High School',
    totalEnrollment: 1054,
    snp: { count: 37, percentage: 3.51 },
    snpTarget: 5.00,
    snpDelta: -1.49,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 10, percentage: 0.95 }, lunch: { count: 15, percentage: 1.42 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 25, percentage: 2.37 } },
      { eligibility: 'Reduced', breakfast: { count: 6, percentage: 0.57 }, lunch: { count: 6, percentage: 0.57 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 12, percentage: 1.14 } },
      { eligibility: 'Total', breakfast: { count: 16, percentage: 1.52 }, lunch: { count: 21, percentage: 1.99 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 37, percentage: 3.51 } },
      { eligibility: 'Eligible', breakfast: { count: 30, percentage: 2.85 }, lunch: { count: 35, percentage: 3.32 }, snack: { count: 10, percentage: 0.95 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 75, percentage: 7.12 } },
      { eligibility: 'Opportunity', breakfast: { count: 14, percentage: 1.33 }, lunch: { count: 14, percentage: 1.33 }, snack: { count: 10, percentage: 0.95 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 38, percentage: 3.61 } }
    ]
  },
  {
    schoolName: 'Jefferson Elementary',
    siteType: 'Elementary School',
    totalEnrollment: 544,
    snp: { count: 32, percentage: 5.88 },
    snpTarget: 5.00,
    snpDelta: 0.88,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 11, percentage: 2.02 }, lunch: { count: 11, percentage: 2.02 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 22, percentage: 4.04 } },
      { eligibility: 'Reduced', breakfast: { count: 5, percentage: 0.92 }, lunch: { count: 5, percentage: 0.92 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 1.84 } },
      { eligibility: 'Total', breakfast: { count: 16, percentage: 2.94 }, lunch: { count: 16, percentage: 2.94 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 32, percentage: 5.88 } },
      { eligibility: 'Eligible', breakfast: { count: 25, percentage: 4.60 }, lunch: { count: 25, percentage: 4.60 }, snack: { count: 5, percentage: 0.92 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 55, percentage: 10.11 } },
      { eligibility: 'Opportunity', breakfast: { count: 9, percentage: 1.66 }, lunch: { count: 9, percentage: 1.66 }, snack: { count: 5, percentage: 0.92 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 23, percentage: 4.23 } }
    ]
  },
  {
    schoolName: 'Adams Middle',
    siteType: 'Middle School',
    totalEnrollment: 588,
    snp: { count: 45, percentage: 7.65 },
    snpTarget: 5.00,
    snpDelta: 2.65,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 17, percentage: 2.89 }, lunch: { count: 18, percentage: 3.06 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 35, percentage: 5.95 } },
      { eligibility: 'Reduced', breakfast: { count: 5, percentage: 0.85 }, lunch: { count: 5, percentage: 0.85 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 1.70 } },
      { eligibility: 'Total', breakfast: { count: 22, percentage: 3.74 }, lunch: { count: 23, percentage: 3.91 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 45, percentage: 7.65 } },
      { eligibility: 'Eligible', breakfast: { count: 35, percentage: 5.95 }, lunch: { count: 35, percentage: 5.95 }, snack: { count: 10, percentage: 1.70 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 80, percentage: 13.61 } },
      { eligibility: 'Opportunity', breakfast: { count: 13, percentage: 2.21 }, lunch: { count: 12, percentage: 2.04 }, snack: { count: 10, percentage: 1.70 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 35, percentage: 5.96 } }
    ]
  },
  {
    schoolName: 'Madison High',
    siteType: 'High School',
    totalEnrollment: 850,
    snp: { count: 75, percentage: 8.82 },
    snpTarget: 5.00,
    snpDelta: 3.82,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 30, percentage: 3.53 }, lunch: { count: 30, percentage: 3.53 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 60, percentage: 7.06 } },
      { eligibility: 'Reduced', breakfast: { count: 8, percentage: 0.94 }, lunch: { count: 7, percentage: 0.82 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 15, percentage: 1.76 } },
      { eligibility: 'Total', breakfast: { count: 38, percentage: 4.47 }, lunch: { count: 37, percentage: 4.35 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 75, percentage: 8.82 } },
      { eligibility: 'Eligible', breakfast: { count: 60, percentage: 7.06 }, lunch: { count: 60, percentage: 7.06 }, snack: { count: 20, percentage: 2.35 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 140, percentage: 16.47 } },
      { eligibility: 'Opportunity', breakfast: { count: 22, percentage: 2.59 }, lunch: { count: 23, percentage: 2.71 }, snack: { count: 20, percentage: 2.35 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 65, percentage: 7.65 } }
    ]
  },
  {
    schoolName: 'Monroe Elementary',
    siteType: 'Elementary School',
    totalEnrollment: 410,
    snp: { count: 44, percentage: 10.73 },
    snpTarget: 5.00,
    snpDelta: 5.73,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 17, percentage: 4.15 }, lunch: { count: 18, percentage: 4.39 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 35, percentage: 8.54 } },
      { eligibility: 'Reduced', breakfast: { count: 5, percentage: 1.22 }, lunch: { count: 4, percentage: 0.98 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 9, percentage: 2.20 } },
      { eligibility: 'Total', breakfast: { count: 22, percentage: 5.37 }, lunch: { count: 22, percentage: 5.37 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 44, percentage: 10.73 } },
      { eligibility: 'Eligible', breakfast: { count: 30, percentage: 7.32 }, lunch: { count: 30, percentage: 7.32 }, snack: { count: 10, percentage: 2.44 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 70, percentage: 17.07 } },
      { eligibility: 'Opportunity', breakfast: { count: 8, percentage: 1.95 }, lunch: { count: 8, percentage: 1.95 }, snack: { count: 10, percentage: 2.44 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 26, percentage: 6.34 } }
    ]
  },
  {
    schoolName: 'Jackson Middle',
    siteType: 'Middle School',
    totalEnrollment: 490,
    snp: { count: 55, percentage: 11.22 },
    snpTarget: 5.00,
    snpDelta: 6.22,
    eligibilityBreakdown: [
      { eligibility: 'Free', breakfast: { count: 22, percentage: 4.49 }, lunch: { count: 23, percentage: 4.69 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 45, percentage: 9.18 } },
      { eligibility: 'Reduced', breakfast: { count: 5, percentage: 1.02 }, lunch: { count: 5, percentage: 1.02 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 10, percentage: 2.04 } },
      { eligibility: 'Total', breakfast: { count: 27, percentage: 5.51 }, lunch: { count: 28, percentage: 5.71 }, snack: { count: 0, percentage: 0 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 55, percentage: 11.22 } },
      { eligibility: 'Eligible', breakfast: { count: 40, percentage: 8.16 }, lunch: { count: 45, percentage: 9.18 }, snack: { count: 15, percentage: 3.06 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 100, percentage: 20.41 } },
      { eligibility: 'Opportunity', breakfast: { count: 13, percentage: 2.65 }, lunch: { count: 17, percentage: 3.47 }, snack: { count: 15, percentage: 3.06 }, supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 }, adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 }, total: { count: 45, percentage: 9.19 } }
    ]
  }
];