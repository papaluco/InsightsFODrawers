import React from 'react';
import { PNASummary } from './PNASummary';
import { PNASchoolGrid } from './PNASchoolGrid';
import { PNAAbout } from './PNAAbout';

interface PNADetailsProps {
  actualPNA: number;
  targetPNA: number;
  onOpenSingleSchool: (schoolName: string) => void;
}

export function PNADetails({ actualPNA, targetPNA, onOpenSingleSchool }: PNADetailsProps) {
  return (
    <div className="space-y-6 text-left">
      <PNASummary actualPNA={actualPNA} targetPNA={targetPNA} />
      
      <PNASchoolGrid 
        onOpenSingleSchool={onOpenSingleSchool} 
        targetPNA={targetPNA} 
        actualPNA={actualPNA} 
      />

      <PNAAbout />
    </div>
  );
}