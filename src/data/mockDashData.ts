export interface DashMetric {
  actual: number | string;
  expected: number | string;
  trend?: 'up' | 'down' | 'neutral';
}

export const DASHBOARD_METRICS = {
  mplh: { actual: 16.88, expected: 18.50, trend: 'down' },
  pna: { actual: 11.85, expected: 10.00, trend: 'up' },
  enp: { actual: 3.90, expected: 5.00, trend: 'up' },
  waste: { actual: 0, expected: 49530.00, trend: 'up' },
  breakfast: { actual: 0.07, expected: 0.20, trend: 'down' },
  lunch: { actual: 0.09, expected: 0.02, trend: 'up' },
  supper: { actual: 0.71, expected: 0.10, trend: 'up' },
  snack: { actual: 0.49, expected: 0.10, trend: 'up' },
  meqs: { actual: 24140, expected: 49530, trend: 'down' },
  meals: { actual: 27875, expected: 49530, trend: 'up' },
  ecoDis: { actual: 0.03, expected: 0.10, trend: 'down' },
  revenue: { actual: 162719.81, expected: 441960.00, trend: 'down' },
  inventoryValue: { actual: 0, expected: 0 },
  inventoryTurnover: { actual: "0 (365 days)", expected: "Varies by site" },
  physicalInventoryDiscrepancy: { actual: 0, expected: 0 }
};

export const DASHBOARD_GRID_DATA = [
  { 
    school: "Andria High School_tier 1 low", 
    ecoDis: 0.15, meals: 248, meqs: 300, 
    breakfast: 0.85, lunch: 0.85, snack: 1.15, supper: 1.69, 
    revenue: 1819.69, 
    waste: 42.50, 
    inventoryValue: 1450.00, 
    inventoryTurnover: "12.4", 
    physicalInventoryDiscrepancy: -15.00, 
    mplh: 14.20, // Below target
    pna: 0.125, enp: 1450.00 
  },
  { 
    school: "Arbutus Elementary School", 
    ecoDis: 0.01, meals: 5713, meqs: 4655, 
    breakfast: 0.68, lunch: 0.56, snack: 0.77, supper: 0.93, 
    revenue: 35164.56, 
    waste: 12.00, 
    inventoryValue: 890.25, 
    inventoryTurnover: "8.5", 
    physicalInventoryDiscrepancy: 0.00, 
    mplh: 19.45, // Above target
    pna: 0.082, enp: 28400.00 
  },
  { 
    school: "Arlon Middle School_childcare -at risk", 
    ecoDis: 0, meals: 0, meqs: 0, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 0, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 0 
  },
  { 
    school: "Bayshore Gardens High School", 
    ecoDis: 0, meals: 6100, meqs: 4399, 
    breakfast: 0.82, lunch: 0.55, snack: 1.29, supper: 0.70, 
    revenue: 32971.27, 
    waste: 215.40, 
    inventoryValue: 3200.00, 
    inventoryTurnover: "15.2", 
    physicalInventoryDiscrepancy: 45.00, 
    mplh: 17.80, 
    pna: 0.141, enp: 22150.00 
  },
  { 
    school: "Beringen Elementary School", 
    ecoDis: 0, meals: 228, meqs: 201, 
    breakfast: 1.0, lunch: 1.0, snack: 0.93, supper: 1.2, 
    revenue: 1301.12, 
    waste: 5.00, 
    inventoryValue: 450.00, 
    inventoryTurnover: "9.0", 
    physicalInventoryDiscrepancy: 0, 
    mplh: 18.60, 
    pna: 0.11, enp: 1100.00 
  },
  { 
    school: "BLUEFIELD ELEMENTRY SCHOOL_child care", 
    ecoDis: 0.30, meals: 2342, meqs: 2875, 
    breakfast: 0.33, lunch: 0.30, snack: 1.59, supper: 0.52, 
    revenue: 14371.97, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 15.90, pna: 0.098, enp: 12400.00 
  },
  { 
    school: "BLUEFIELD HIGH SCHOOL_tier II mixed", 
    ecoDis: 0.33, meals: 423, meqs: 865, 
    breakfast: 2.67, lunch: 2.33, snack: 4.0, supper: 0.83, 
    revenue: 3912.30, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 12.10, pna: 0.155, enp: 3200.00 
  },
  { 
    school: "BLUEFILED MIDDLE SCHOOL", 
    ecoDis: 0.50, meals: 208, meqs: 235, 
    breakfast: 0.70, lunch: 0.90, snack: 1.0, supper: 1.2, 
    revenue: 1255.29, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 16.20, pna: 0.102, enp: 950.00 
  },
  { 
    school: "Cabadbaran High School", 
    ecoDis: 0.14, meals: 1305, meqs: 1056, 
    breakfast: 1.01, lunch: 1.01, snack: 1.01, supper: 1.01, 
    revenue: 7059.66, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "11.2", 
    physicalInventoryDiscrepancy: 0, mplh: 18.10, pna: 0.114, enp: 6100.00 
  },
  { 
    school: "CENTRAL OFFICE", 
    ecoDis: 0.67, meals: 0, meqs: 2, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 595.00, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 500.00 
  },
  { 
    school: "Chacao Elementary School", 
    ecoDis: 0, meals: 931, meqs: 896, 
    breakfast: 0.77, lunch: 1.14, snack: 1.02, supper: 1.02, 
    revenue: 6122.07, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "10.5", 
    physicalInventoryDiscrepancy: 0, mplh: 17.40, pna: 0.121, enp: 5400.00 
  },
  { 
    school: "Cheria Elementary School", 
    ecoDis: 0, meals: 0, meqs: 0, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 0, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 0 
  },
  { 
    school: "Chios Elementary School_tier II high", 
    ecoDis: 0, meals: 2, meqs: 2, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 16.21, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0.001, enp: 10.00 
  },
  { 
    school: "Corfu Elementary School", 
    ecoDis: 0, meals: 0, meqs: 0, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 0, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 0 
  },
  { 
    school: "Cotoca Middle School", 
    ecoDis: 0, meals: 0, meqs: 0, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 0, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 0 
  },
  { 
    school: "Dammam Elementary School", 
    ecoDis: 0, meals: 0, meqs: 0, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 0, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 0 
  },
  { 
    school: "Gaur Elementary School", 
    ecoDis: 0, meals: 0, meqs: 0, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 0, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 0 
  },
  { 
    school: "Hoensbroek High School", 
    ecoDis: 0, meals: 0, meqs: 0, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 0, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 0 
  },
  { 
    school: "King of Prussia Middle School", 
    ecoDis: 0, meals: 3105, meqs: 2543, 
    breakfast: 1.02, lunch: 1.03, snack: 1.53, supper: 1.53, 
    revenue: 17111.69, 
    waste: 85.00, 
    inventoryValue: 2100.00, 
    inventoryTurnover: "14.8", 
    physicalInventoryDiscrepancy: 0, 
    mplh: 21.10, 
    pna: 0.132, enp: 14200.00 
  },
  { 
    school: "Kula Elementary School", 
    ecoDis: 0, meals: 0, meqs: 0, 
    breakfast: 0, lunch: 0, snack: 0, supper: 0, 
    revenue: 0, waste: 0, inventoryValue: 0, 
    inventoryTurnover: "0", 
    physicalInventoryDiscrepancy: 0, mplh: 0, pna: 0, enp: 0 
  }
];