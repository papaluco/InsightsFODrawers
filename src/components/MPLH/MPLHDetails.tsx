import React, { useMemo } from 'react';
import { SchoolMPLHData } from '../../data/mockMPLHData';
import { MPLHSummary } from './MPLHSummary';
import { MPLHAbout } from './MPLHAbout';
import { MPLHSiteTypeSummary } from './MPLHSiteTypeSummary';
import { MPLHSchoolTable } from './MPLHSchoolTable';

interface MPLHDetailsProps {
  actualMPLH: number;
  targetMPLH: number;
  schoolData: SchoolMPLHData[];
  onOpenSingleSchool: (schoolName: string) => void;
}

export const MPLHDetails: React.FC<MPLHDetailsProps> = ({
  actualMPLH,
  targetMPLH,
  schoolData,
  onOpenSingleSchool,
}) => {
  // District-wide math stays here as the "source of truth"
  const totals = useMemo(() => {
    return schoolData.reduce((acc, school) => ({
      breakfast: acc.breakfast + school.breakfast,
      lunch: acc.lunch + school.lunch,
      snack: acc.snack + school.snack,
      aLaCarte: acc.aLaCarte + school.aLaCarte,
      other: acc.other + (school.other.adultMeals + school.other.adultBreakfast + school.other.adultLunch + school.other.adultSnack),
      mealEquivalents: acc.mealEquivalents + school.mealEquivalents,
      laborHours: acc.laborHours + school.laborHours,
    }), { breakfast: 0, lunch: 0, snack: 0, aLaCarte: 0, other: 0, mealEquivalents: 0, laborHours: 0 });
  }, [schoolData]);

  return (
    <div className="space-y-6 text-left">
      {/* 1. Dashboard Totals */}
      <MPLHSummary actualMPLH={actualMPLH} targetMPLH={targetMPLH} />

      {/* 2. Middle Grid: Site Type Summary */}
      <MPLHSiteTypeSummary schoolData={schoolData} />

      {/* 3. Bottom Grid: Detailed School List (Moved to own component) */}
      <MPLHSchoolTable 
        schoolData={schoolData} 
        onOpenSingleSchool={onOpenSingleSchool}
        districtTotals={totals}
        actualMPLH={actualMPLH}
        targetMPLH={targetMPLH}
      />

      {/* 4. Help Section */}
      <MPLHAbout />
    </div>
  );
};