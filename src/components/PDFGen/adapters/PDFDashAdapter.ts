import { IPDFDashReportData, IPDFDashSection } from '../PDFDashContract';
import { ExportOptions } from '../../Common/ExportMenu/DashExportMenu';

export const prepareDashboardPDFData = (
  schoolData: any[],
  metrics: any, 
  options: ExportOptions,
  chartImage?: string // <-- Added this parameter
): IPDFDashReportData => {
  
  const formatValue = (val: any, decimals: number = 0, prefix: string = '', suffix: string = ''): string => {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0' || val === '$0.00') {
      return "-";
    }
    const cleanVal = typeof val === 'string' ? val.replace(/[$,%]/g, '') : val;
    const num = parseFloat(cleanVal);
    
    if (isNaN(num) || num === 0) return "-";

    const formatted = num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    
    return `${prefix}${formatted}${suffix}`;
  };

  const sections: IPDFDashSection[] = [];

  // 1. KPI SECTION: Mapping all 15 cards with Benchmarks
  if (options.includeKPIs) {
    sections.push({
      id: 'kpi',
      title: 'District Performance Overview',
      type: 'grid',
      metrics: [
        { 
          label: 'MPLH', 
          primaryValue: formatValue(metrics.mplh?.actual, 2), 
          benchmark: `Expected: ${formatValue(metrics.mplh?.expected, 2)}`,
          trend: metrics.mplh?.trend, 
          status: (metrics.mplh?.actual >= metrics.mplh?.expected) ? 'success' : 'danger' 
        },
        { 
          label: 'PNA', 
          primaryValue: formatValue(metrics.pna?.actual, 2, '', '%'), 
          benchmark: `Expected: ${formatValue(metrics.pna?.expected, 2, '', '%')}`,
          trend: metrics.pna?.trend,
          status: 'success' 
        },
        { 
          label: 'ENP', 
          primaryValue: formatValue(metrics.enp?.actual, 2, '', '%'), 
          benchmark: `Expected: ${formatValue(metrics.enp?.expected, 2, '', '%')}`,
          trend: metrics.enp?.trend,
          status: 'success' 
        },
        { 
          label: 'Waste', 
          primaryValue: formatValue(metrics.waste?.actual, 2, '$'), 
          benchmark: `Expected: ${formatValue(metrics.waste?.expected, 2, '$')}`,
          trend: metrics.waste?.trend,
          status: 'success' 
        },
        { 
          label: 'Breakfast', 
          primaryValue: formatValue(metrics.breakfast?.actual, 0, '', '%'), 
          benchmark: `Expected: ${formatValue(metrics.breakfast?.expected, 0, '', '%')}`,
          trend: metrics.breakfast?.trend,
          status: 'danger' 
        },
        { 
          label: 'Lunch', 
          primaryValue: formatValue(metrics.lunch?.actual, 0, '', '%'), 
          benchmark: `Expected: ${formatValue(metrics.lunch?.expected, 0, '', '%')}`,
          trend: metrics.lunch?.trend,
          status: 'success' 
        },
        { 
          label: 'Supper', 
          primaryValue: formatValue(metrics.supper?.actual, 0, '', '%'), 
          benchmark: `Expected: ${formatValue(metrics.supper?.expected, 0, '', '%')}`,
          trend: metrics.supper?.trend,
          status: 'success' 
        },
        { 
          label: 'Snack', 
          primaryValue: formatValue(metrics.snack?.actual, 0, '', '%'), 
          benchmark: `Expected: ${formatValue(metrics.snack?.expected, 0, '', '%')}`,
          trend: metrics.snack?.trend,
          status: 'success' 
        },
        { 
          label: 'MEQs', 
          primaryValue: formatValue(metrics.meqs?.actual), 
          benchmark: `Expected: ${formatValue(metrics.meqs?.expected)}`,
          trend: metrics.meqs?.trend,
          status: 'danger' 
        },
        { 
          label: 'Meals', 
          primaryValue: formatValue(metrics.meals?.actual), 
          benchmark: `Expected: ${formatValue(metrics.meals?.expected)}`,
          trend: metrics.meals?.trend,
          status: 'success' 
        },
        { 
          label: 'Eco Dis', 
          primaryValue: formatValue(metrics.ecoDis?.actual, 0, '', '%'), 
          benchmark: `Expected: ${formatValue(metrics.ecoDis?.expected, 0, '', '%')}`,
          trend: metrics.ecoDis?.trend,
          status: 'success' 
        },
        { 
          label: 'Revenue', 
          primaryValue: formatValue(metrics.revenue?.actual, 2, '$'), 
          benchmark: `Expected: ${formatValue(metrics.revenue?.expected, 2, '$')}`,
          trend: metrics.revenue?.trend,
          status: 'danger' 
        },
        { 
          label: 'Inventory Value', 
          primaryValue: formatValue(metrics.inventoryValue?.actual, 2, '$'), 
          status: 'neutral' 
        },
        { 
          label: 'Inventory Turnover', 
          primaryValue: metrics.inventoryTurnover?.actual || "-", 
          status: 'neutral' 
        },
        { 
          label: 'Physical Inventory\nDiscrepancy', 
          primaryValue: formatValue(metrics.physicalInventoryDiscrepancy?.actual, 2, '$'), 
          benchmark: `Expected: ≤ $0.00`,
          status: 'success' 
        }
      ]
    });
  }

  // 2. GRID SECTION: Mapping all 16 columns
  if (options.includeGrid) {
    sections.push({
      id: 'grid',
      title: 'School Performance Detail',
      type: 'table',
      headers: [
        'School', 'Eco Dis', 'Meals', 'Meqs', 'Brk', 'Lnc', 'Snk', 'Sup', 
        'Revenue', 'Waste', 'Inv Val', 'Inv Turn', 'Discrep', 'MPLH', 'PNA', 'ENP'
      ],
      rows: (schoolData || []).map(s => [
        s.school || s.schoolName || "-",
        formatValue(s.ecoDis, 0, '', '%'),
        formatValue(s.meals),
        formatValue(s.meqs),
        formatValue(s.breakfast, 0, '', '%'),
        formatValue(s.lunch, 0, '', '%'),
        formatValue(s.snack, 0, '', '%'),
        formatValue(s.supper, 0, '', '%'),
        formatValue(s.revenue, 2, '$'),
        formatValue(s.waste, 2, '$'),
        formatValue(s.inventoryValue, 2, '$'),
        s.inventoryTurnover || "-",
        formatValue(s.physicalInventoryDiscrepancy, 2, '$'),
        formatValue(s.mplh, 2),
        formatValue(s.pna, 1, '', '%'),
        formatValue(s.enp, 2, '$')
      ])
    });
  }

  // 3. TREND SECTION: Now includes the chartImage data
  if (options.includeTrends) {
    sections.push({
      id: 'trend',
      title: 'Performance Trend Analysis',
      type: 'trend', // Changed to match renderer's trend logic
      chartImage: chartImage, // Pass the image string here
      metrics: [
        { label: 'Peak MEQs', primaryValue: formatValue(metrics.meqs?.peak || 24140), status: 'success' },
        { label: 'Peak Month', primaryValue: metrics.meqs?.peakMonth || 'Current Month', status: 'neutral' },
        { label: 'Avg Monthly MEQs', primaryValue: formatValue(metrics.meqs?.average || 24140), status: 'neutral' }
      ]
    });
  }

  return {
    reportTitle: 'Insights Dashboard Report',
    subTitle: 'Analysis for Jul 1, 2025 - Apr 3, 2026',
    districtName: 'Katy ISD',
    generatedBy: {
      userName: 'Johnathon',
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    },
    sections
  };
};