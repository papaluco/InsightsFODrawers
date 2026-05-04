import { useState, useMemo, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

// --- NEW MODULAR IMPORTS ---
import {
  programByEligibilityData,
  districtTotalEnrollment
} from '../../../data/mockENPProgramData';
import { mockSchoolENPData } from '../../../data/mockENPSchoolData';

import { KPISummary } from '../KPISummary';
import { KPIAbout } from '../KPIAbout';
import { ENPProgramGrid } from './ENPProgramGrid';
import { ENPSchoolGrid } from './ENPSchoolGrid';

interface ENPDetailsProps {
  actualENP: number;
  benchmarkENP: number;
  onOpenSingleSchool: (schoolName: string) => void;
  isLoading?: boolean;
  onClose?: () => void; // Added here to fix the "Property does not exist" error
}

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

export function ENPDetails({ 
  actualENP, 
  benchmarkENP, 
  onOpenSingleSchool, 
  isLoading = false,
  onClose: _onClose // Destructured here so it's technically "read"
}: ENPDetailsProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'All'>(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [schoolSortConfig, setSchoolSortConfig] = useState<SortConfig>(null);
  const [programSortConfig, setProgramSortConfig] = useState<SortConfig>(null);
  const [isProgramExpanded, setIsProgramExpanded] = useState(true);
  const [isSchoolExpanded, setIsSchoolExpanded] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSchoolExpanded && searchInputRef.current) searchInputRef.current.focus();
  }, [isSchoolExpanded]);

  // Derived from the 'ENP' row in mockENPProgramData.ts
  const totalSNPCount = useMemo(() => {
    const enpRow = programByEligibilityData.find(row => row.eligibility === 'ENP');
    return enpRow ? enpRow.total.count : 0;
  }, []);

  // Filter and Sort Schools using mockSchoolENPData.ts
  const sortedSchools = useMemo(() => {
    const items = (mockSchoolENPData || []).filter(s => 
      s.schoolName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (schoolSortConfig !== null) {
      items.sort((a: any, b: any) => {
        const aValue = schoolSortConfig.key.includes('.') 
          ? schoolSortConfig.key.split('.').reduce((obj, key) => obj[key], a) 
          : a[schoolSortConfig.key];
        const bValue = schoolSortConfig.key.includes('.') 
          ? schoolSortConfig.key.split('.').reduce((obj, key) => obj[key], b) 
          : b[schoolSortConfig.key];
          
        if (aValue < bValue) return schoolSortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return schoolSortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [searchTerm, schoolSortConfig]);

  const itemsPerPage = rowsPerPage === 'All' ? sortedSchools.length : rowsPerPage;
  const totalPages = Math.ceil(sortedSchools.length / (itemsPerPage || 1));
  const startIndex = (currentPage - 1) * (itemsPerPage as number);
  const currentSchools = sortedSchools.slice(startIndex, startIndex + (itemsPerPage as number));

  const handleSchoolSort = (key: string) => {
    let dir: 'asc' | 'desc' = 'asc';
    if (schoolSortConfig?.key === key && schoolSortConfig.direction === 'asc') dir = 'desc';
    setSchoolSortConfig({ key, direction: dir });
  };

  const handleProgramSort = (key: string) => {
    let dir: 'asc' | 'desc' = 'asc';
    if (programSortConfig?.key === key && programSortConfig.direction === 'asc') dir = 'desc';
    setProgramSortConfig({ key, direction: dir });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-gray-500 font-medium">Loading ENP Details...</p>
      </div>
    );
  }

  const enpDifference = actualENP - benchmarkENP;
  const enpIsHigher = enpDifference > 0;

  return (
    <div className="space-y-6 text-left">
      <KPISummary
        title="ENP Overview"
        actualLabel="Actual ENP"
        actualValue={actualENP}
        targetValue={benchmarkENP}
        higherIsBetter={false}
        unit="%"
        narrative={
          <>
            Out of a total enrollment of <span className="font-semibold text-gray-900">{districtTotalEnrollment.toLocaleString()}</span> students,
            there were <span className="font-semibold text-gray-900">{totalSNPCount.toLocaleString()}</span> non-program meals recorded.
            This represents an ENP of <span className="font-semibold text-gray-900">{actualENP.toFixed(2)}%</span>,
            which is{' '}
            <span className={`${enpIsHigher ? 'text-red-600' : 'text-emerald-600'} font-semibold`}>
              {Math.abs(enpDifference).toFixed(2)}% {enpIsHigher ? 'higher' : 'lower'}
            </span>{' '}
            than the district benchmark of {benchmarkENP.toFixed(2)}%.
          </>
        }
      />
      
      <ENPProgramGrid 
        isExpanded={isProgramExpanded}
        onToggle={() => setIsProgramExpanded(!isProgramExpanded)}
        benchmarkENP={benchmarkENP}
        onSort={handleProgramSort}
        programSortConfig={programSortConfig}
      />

      <ENPSchoolGrid 
        isExpanded={isSchoolExpanded}
        onToggle={() => setIsSchoolExpanded(!isSchoolExpanded)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchInputRef={searchInputRef}
        currentSchools={currentSchools}
        schoolSortConfig={schoolSortConfig}
        onSort={handleSchoolSort}
        onOpenSingleSchool={onOpenSingleSchool}
        benchmarkENP={benchmarkENP}
        startIndex={startIndex}
        totalSchools={sortedSchools.length}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(v) => {
          setRowsPerPage(v === 'All' ? 'All' : parseInt(v));
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(dir) => 
          setCurrentPage(prev => dir === 'next' ? Math.min(totalPages, prev + 1) : Math.max(1, prev - 1))
        }
      />

      <KPIAbout content={
        <p>
          <strong>Eligible Not Participating:</strong> ENP is the percentage of students who are officially
          certified for Free or Reduced-price meals but choose not to eat the school meal on a given day.
        </p>
      } />
    </div>
  );
}