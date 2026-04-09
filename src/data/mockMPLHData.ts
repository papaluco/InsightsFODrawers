export interface OtherBreakdown {
  adultMeals: number;
  adultBreakfast: number;
  adultLunch: number;
  adultSnack: number;
}

export interface SchoolMPLHData {
  schoolName: string;
  siteType: 'Elementary School' | 'Middle School' | 'High School';
  breakfast: number;
  lunch: number;
  snack: number;
  aLaCarte: number;
  other: OtherBreakdown;
  mealEquivalents: number;
  laborHours: number;
  mplh: number;
  mplhTarget: number;
  mplhDelta: number;
}

export const calculateOtherTotal = (other: OtherBreakdown): number => {
  return other.adultMeals + other.adultBreakfast + other.adultLunch + other.adultSnack;
};

export const generateMockMPLHData = (): SchoolMPLHData[] => {
  const schools = [
    {
      schoolName: 'Lincoln Elementary',
      siteType: 'Elementary School' as const,
      breakfast: 245,
      lunch: 380,
      snack: 120,
      aLaCarte: 85,
      other: {
        adultMeals: 0,
        adultBreakfast: 0,
        adultLunch: 0,
        adultSnack: 0,
      },
      laborHours: 48,
    },
    {
      schoolName: 'Washington Middle School',
      siteType: 'Middle School' as const,
      breakfast: 420,
      lunch: 615,
      snack: 180,
      aLaCarte: 195,
      other: {
        adultMeals: 25,
        adultBreakfast: 18,
        adultLunch: 22,
        adultSnack: 10,
      },
      laborHours: 82,
    },
    {
      schoolName: 'Roosevelt High School',
      siteType: 'High School' as const,
      breakfast: 580,
      lunch: 1240,
      snack: 320,
      aLaCarte: 485,
      other: {
        adultMeals: 45,
        adultBreakfast: 28,
        adultLunch: 35,
        adultSnack: 17,
      },
      laborHours: 115,
    },
    {
      schoolName: 'Jefferson Elementary',
      siteType: 'Elementary School' as const,
      breakfast: 195,
      lunch: 325,
      snack: 95,
      aLaCarte: 65,
      other: {
        adultMeals: 12,
        adultBreakfast: 8,
        adultLunch: 10,
        adultSnack: 5,
      },
      laborHours: 38,
    },
    {
      schoolName: 'Madison Middle School',
      siteType: 'Middle School' as const,
      breakfast: 385,
      lunch: 565,
      snack: 165,
      aLaCarte: 175,
      other: {
        adultMeals: 22,
        adultBreakfast: 15,
        adultLunch: 18,
        adultSnack: 10,
      },
      laborHours: 75,
    },
  ];

  return schools.map(school => {
    const otherTotal = calculateOtherTotal(school.other);
    const mealEquivalents =
      school.breakfast +
      school.lunch +
      (school.snack * 0.5) +
      (school.aLaCarte * 0.5) +
      (otherTotal * 0.5);

    const mplh = mealEquivalents / school.laborHours;
    const mplhTarget = 18.5;
    const mplhDelta = mplh - mplhTarget;

    return {
      ...school,
      mealEquivalents: Math.round(mealEquivalents),
      mplh,
      mplhTarget,
      mplhDelta,
    };
  });
};

export const calculateDistrictMPLH = (schoolData: SchoolMPLHData[]) => {
  const totalMealEquivalents = schoolData.reduce((sum, school) => sum + school.mealEquivalents, 0);
  const totalLaborHours = schoolData.reduce((sum, school) => sum + school.laborHours, 0);

  return {
    actualMPLH: totalMealEquivalents / totalLaborHours,
    targetMPLH: 18.5,
    totalMealEquivalents,
    totalLaborHours,
  };
};
