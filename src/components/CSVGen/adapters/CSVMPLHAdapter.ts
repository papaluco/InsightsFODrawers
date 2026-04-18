import { ICSVReportData } from '../CSVContract';
import { calculateOtherTotal, OtherBreakdown, SchoolMPLHData } from '../../../data/mockMPLHData';

/**
 * CSVMPLHAdapter
 * Transforms raw MPLH school data into a flat CSV-ready format.
 */
export const CSVMPLHAdapter = (
  schoolData: SchoolMPLHData[],
  reportType: 'School' | 'Type' // New parameter to handle both client-side reports
): ICSVReportData => {

  // 1. Internalize District Lookup (Future-proofed for Auth Token)
  const rawDistrict = "Katy ISD"; // Future: getDistrictFromToken()
  const district = rawDistrict.replace(/\s+/g, '_');

  // Helper to handle numeric formatting for CSV (Excel-friendly)
  const formatValue = (val: any, decimals: number = 0): number | string => {
    let finalVal = val;
    
    if (val && typeof val === 'object' && 'adultMeals' in val) {
      finalVal = calculateOtherTotal(val as OtherBreakdown);
    }

    const num = parseFloat(finalVal);
    if (isNaN(num)) return 0; 

    return Number(num.toFixed(decimals));
  };

  const headers = [
    reportType === 'School' ? "School Name" : "Site Type", 
    //"Site Type", 
    "Breakfast", 
    "Lunch", 
    "Snack", 
    "A La Carte", 
    "Other", 
    "MEQs", 
    "Hours", 
    "MPLH", 
    "Benchmark", 
    "Difference"
  ];

  const rows = schoolData.map(school => [
    reportType === 'School' ? school.schoolName : school.siteType,
    //school.siteType,
    formatValue(school.breakfast),
    formatValue(school.lunch),
    formatValue(school.snack),
    formatValue(school.aLaCarte),
    formatValue(school.other),
    formatValue(school.mealEquivalents, 1),
    formatValue(school.laborHours, 1),
    formatValue(school.mplh, 2),
    formatValue(school.mplhTarget, 2),
    formatValue(school.mplhDelta, 2)
  ]);

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '-')
    .slice(0, 19);

  return {
    // Dynamically names the file based on the report type
    fileName: `MPLH_Summary_By_${reportType}_${district}_${timestamp}.csv`,
    headers,
    rows
  };
};