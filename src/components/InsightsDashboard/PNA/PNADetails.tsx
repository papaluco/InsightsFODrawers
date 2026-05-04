import React from 'react';
import { KPISummary } from '../KPISummary';
import { KPIAbout } from '../KPIAbout';
import { PNASchoolGrid } from './PNASchoolGrid';

interface PNADetailsProps {
  actualPNA: number;
  targetPNA: number;
  onOpenSingleSchool: (schoolName: string) => void;
}

export function PNADetails({ actualPNA, targetPNA, onOpenSingleSchool }: PNADetailsProps) {
  const pnaDifference = actualPNA - targetPNA;
  const pnaIsHigher = pnaDifference > 0;

  return (
    <div className="space-y-6 text-left">
      <KPISummary
        title="PNA Overview"
        actualLabel="Actual PNA"
        actualValue={actualPNA}
        targetValue={targetPNA}
        higherIsBetter={false}
        unit="%"
        narrative={
          <>
            Currently, {actualPNA.toFixed(2)}% of students are categorized as Paid by default, which is{' '}
            <span className={`${pnaIsHigher ? 'text-red-600' : 'text-emerald-600'} font-semibold`}>
              {Math.abs(pnaDifference).toFixed(2)}% {pnaIsHigher ? 'higher' : 'lower'}
            </span>{' '}
            than the district benchmark of {targetPNA.toFixed(2)}%.
          </>
        }
      />

      <PNASchoolGrid
        onOpenSingleSchool={onOpenSingleSchool}
        targetPNA={targetPNA}
        actualPNA={actualPNA}
      />

      <KPIAbout content={
        <p>
          <strong>Paid Not Applied (PNA):</strong> Calculated as (Count of students where
          Eligibility = Paid AND Reason = Default) ÷ Total relevant student population × 100.
          PNA represents the percentage of students who are identified as &apos;Paid&apos; status
          but do not actually have a meal application or direct certification on file.
        </p>
      } />
    </div>
  );
}