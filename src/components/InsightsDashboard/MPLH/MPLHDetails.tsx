import React, { useMemo } from 'react';
import { SchoolMPLHData } from '../../../data/mockMPLHData';
import { KPISummary } from '../KPISummary';
import { KPIAbout } from '../KPIAbout';
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

  const mplhDifference = actualMPLH - targetMPLH;
  const mplhIsHigher = mplhDifference >= 0;

  return (
    <div className="space-y-6 text-left">
      <KPISummary
        title="MPLH Overview"
        actualValue={actualMPLH}
        targetValue={targetMPLH}
        higherIsBetter={true}
        narrative={
          <>
            This district produced {actualMPLH.toFixed(2)} meals for every hour worked, which is{' '}
            <span className={`${mplhIsHigher ? 'text-emerald-600' : 'text-red-600'} font-semibold`}>
              {Math.abs(mplhDifference).toFixed(2)} {mplhIsHigher ? 'higher' : 'lower'}
            </span>{' '}
            than the Benchmark of {targetMPLH.toFixed(2)}.
          </>
        }
      />

      <MPLHSiteTypeSummary schoolData={schoolData} />

      <MPLHSchoolTable
        schoolData={schoolData}
        onOpenSingleSchool={onOpenSingleSchool}
        districtTotals={totals}
        actualMPLH={actualMPLH}
        targetMPLH={targetMPLH}
      />

      <KPIAbout content={
        <div className="space-y-2">
          <p><span className="font-bold text-gray-800">Meals per Labor Hour:</span> MPLH measures operational efficiency by comparing meal equivalents (MEQs) to actual labor hours.</p>
          <p><span className="font-bold text-gray-800">Standard Factors:</span> Breakfast (0.67), Lunch (1.00), Snack (0.33), Adult Breakfast (0.67), Adult Lunch (1.00), Adult Snack (0.67), A La Carte ($4.93).</p>
        </div>
      } />
    </div>
  );
};