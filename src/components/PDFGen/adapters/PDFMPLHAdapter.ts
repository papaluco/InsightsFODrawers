import { IPDFReportData } from '../PDFContract';
// Import your existing logic from the mock/interface file
import { calculateOtherTotal, OtherBreakdown } from '../../../data/mockMPLHData';

export const PDFMPLHAdapter = (
  data: any, 
  user: string, 
  district: string
): IPDFReportData => {

  // Helper to handle rounding, commas, and zero-state formatting
  const formatValue = (val: any, decimals: number = 0): string => {
    // 1. Handle the "Other" object breakdown immediately
    let finalVal = val;
    if (val && typeof val === 'object' && 'adultMeals' in val) {
      finalVal = calculateOtherTotal(val as OtherBreakdown);
    }

    // 2. Treat null, undefined, empty strings, 0, and "0" as zero-state
    if (finalVal === null || finalVal === undefined || finalVal === '' || finalVal === 0 || finalVal === '0') {
      return "-";
    }
    
    const num = typeof finalVal === 'object' ? (finalVal.value ?? 0) : parseFloat(finalVal);
    
    if (isNaN(num) || num === 0) return "-";

    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // 1. Transform Summary by Site Type
  const siteTypeRows = data.siteTypeSummary.map((item: any) => [
    item.siteType,
    formatValue(item.breakfast),
    formatValue(item.lunch),
    formatValue(item.snack),
    formatValue(item.aLaCarte),
    formatValue(item.other), // formatValue now handles the OtherBreakdown object
    formatValue(item.mealEquivalents, 1),
    formatValue(item.laborHours, 1),
    formatValue(item.mplh, 2),
    formatValue(item.mplhTarget, 2),
    formatValue(item.mplhDelta, 2)
  ]);

  // 2. Transform Details by School
  const schoolRows = (data.siteTypeSummary || []).map((school: any) => [
    school.schoolName || school.name || "-", 
    formatValue(school.breakfast),
    formatValue(school.lunch),
    formatValue(school.snack),
    formatValue(school.aLaCarte),
    formatValue(school.other), // formatValue now handles the OtherBreakdown object
    formatValue(school.mealEquivalents, 1),
    formatValue(school.laborHours, 1),
    formatValue(school.mplh, 2),
    formatValue(school.mplhTarget, 2),
    formatValue(school.mplhDelta, 2)
  ]);

  return {
    reportTitle: "Meals Per Labor Hour",
    subTitle: data.subTitle, 
    districtName: district,
    
    overview: {
      plainLanguageSummary: `This district produced ${formatValue(data.actualMPLH, 2)} meals for every hour worked, which is ${formatValue(data.diffValue, 2)} ${data.isHigher ? 'above' : 'below'} the target benchmark.`,
      
      metrics: [
        { 
          label: "ACTUAL MPLH", 
          primaryValue: formatValue(data.actualMPLH, 2), 
          status: data.isHigher ? 'success' : 'danger' 
        },
        { 
          label: "BENCHMARK", 
          primaryValue: formatValue(data.benchmark, 2), 
          status: 'neutral' 
        },
        { 
          label: "VARIANCE", 
          primaryValue: formatValue(data.diffValue, 2), 
          status: data.isHigher ? 'success' : 'danger',
          secondaryValue: `${data.percentage}%`
        }
      ]
    },

    sections: [
      {
        type: 'table',
        title: "Summary by Site Type",
        headers: ["SITE TYPE", "BRK", "LNC", "SNK", "ALC", "OTH", "MEQS", "HRS", "MPLH", "BNCH", "DIFF"],
        rows: siteTypeRows,
        hasTotalRow: true
      },
      {
        type: 'table',
        title: "Details by School",
        headers: ["SCHOOL NAME", "BRK", "LNC", "SNK", "ALC", "OTH", "MEQS", "HRS", "MPLH", "BNCH", "DIFF"],
        rows: schoolRows,
        hasTotalRow: false
      },
      {
        type: 'text',
        title: "About This Metric",
        content: "Meals Per Labor Hour is calculated by dividing total Meal Equivalents (MEQs) by total productive labor hours. It serves as a primary indicator of labor productivity in school nutrition programs."
      }
    ],

    generatedBy: {
      userName: user,
      timestamp: new Date().toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
      })
    }
  };
};