export interface MealTypeData {
  count: number;
  percentage: number;
}

export type EligibilityType = 
  | 'Free Participating' 
  | 'Reduced Participating' 
  | 'Total Participating' 
  | 'Free Eligible'   // New
  | 'Reduced Eligible' // New
  | 'Eligible' 
  | 'Free NP' 
  | 'Reduced NP' 
  | 'ENP';

export interface ProgramByEligibility {
  eligibility: EligibilityType;
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

export const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'snack', label: 'Snack' },
  { key: 'supper', label: 'Supper' },
  { key: 'aLaCarte', label: 'A La Carte' },
  { key: 'total', label: 'Grand Total' }
] as const;