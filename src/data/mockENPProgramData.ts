import { ProgramByEligibility } from './ENPDataTypes';

export const districtTotalEnrollment = 3998;
export const districtENPActual = 3.90; 
export const districtENPBenchmark = 5.00;

export const programByEligibilityData: ProgramByEligibility[] = [
  {
    eligibility: 'Free Participating',
    breakfast: { count: 120, percentage: 3.0 }, lunch: { count: 80, percentage: 2.0 }, snack: { count: 45, percentage: 1.12 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 245, percentage: 6.12 }
  },
  {
    eligibility: 'Reduced Participating',
    breakfast: { count: 30, percentage: 0.75 }, lunch: { count: 40, percentage: 1.0 }, snack: { count: 8, percentage: 0.2 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 78, percentage: 1.95 }
  },
  {
    eligibility: 'Total Participating',
    breakfast: { count: 150, percentage: 3.75 }, lunch: { count: 120, percentage: 3.0 }, snack: { count: 53, percentage: 1.32 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 323, percentage: 8.07 }
  },
  {
    eligibility: 'Free Eligible', // Sum of Free Participating (120) and Free NP (40) = 160
    breakfast: { count: 160, percentage: 4.0 }, lunch: { count: 115, percentage: 2.88 }, snack: { count: 91, percentage: 2.28 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 345, percentage: 8.63 }
  },
  {
    eligibility: 'Reduced Eligible', // Sum of Reduced Participating (30) and Reduced NP (10) = 40
    breakfast: { count: 40, percentage: 1.0 }, lunch: { count: 65, percentage: 1.63 }, snack: { count: 8, percentage: 0.2 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 134, percentage: 3.35 }
  },
  {
    eligibility: 'Eligible', // Sum of Free Eligible (160) and Reduced Eligible (40) = 200
    breakfast: { count: 200, percentage: 5.0 }, lunch: { count: 180, percentage: 4.5 }, snack: { count: 99, percentage: 2.48 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 479, percentage: 11.98 }
  },
  {
    eligibility: 'Free NP',
    breakfast: { count: 40, percentage: 2.0 }, lunch: { count: 35, percentage: 2.5 }, snack: { count: 46, percentage: 1.35 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 100, percentage: 5.85 }
  },
  {
    eligibility: 'Reduced NP',
    breakfast: { count: 10, percentage: 0.25 }, lunch: { count: 25, percentage: 0.63 }, snack: { count: 0, percentage: 0 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 56, percentage: 1.40 }
  },
  {
    eligibility: 'ENP',
    breakfast: { count: 50, percentage: 1.25 }, lunch: { count: 60, percentage: 1.50 }, snack: { count: 46, percentage: 1.15 },
    supper: { count: 0, percentage: 0 }, aLaCarte: { count: 0, percentage: 0 }, adultBreakfast: { count: 0, percentage: 0 },
    adultLunch: { count: 0, percentage: 0 }, adultSnack: { count: 0, percentage: 0 }, adultSupper: { count: 0, percentage: 0 },
    total: { count: 156, percentage: 3.90 }
  }
];