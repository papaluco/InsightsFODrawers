import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface SchoolPerformanceData {
  school: string;
  ecoDis: string;
  meals: number;
  meqs: number;
  breakfast: string;
  lunch: string;
  snack: string;
  supper: string;
  revenue: string;
  waste: string;
  inventoryValue: string;
  inventoryTurnover: string;
  physicalInventoryDiscrepancy: string;
  mplh: string;
  pna: string; // Added PNA
  enp: string; // Added ENP
}

const PERFORMANCE_DATA: SchoolPerformanceData[] = [
  // PAGE 1
  { school: "Andria High School_tier 1 low", ecoDis: "15%", meals: 248, meqs: 300, breakfast: "85%", lunch: "85%", snack: "115%", supper: "169%", revenue: "$1,819.69", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.5%", enp: "$1,450.00" },
  { school: "Arbutus Elementary School", ecoDis: "1%", meals: 5713, meqs: 4655, breakfast: "68%", lunch: "56%", snack: "77%", supper: "93%", revenue: "$35,164.56", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.2%", enp: "$28,400.00" },
  { school: "Arlon Middle School_childcare -at risk", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Bayshore Gardens High School", ecoDis: "0%", meals: 6100, meqs: 4399, breakfast: "82%", lunch: "55%", snack: "129%", supper: "70%", revenue: "$32,971.27", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.1%", enp: "$22,150.00" },
  { school: "Beringen Elementary School", ecoDis: "0%", meals: 228, meqs: 201, breakfast: "100%", lunch: "100%", snack: "93%", supper: "120%", revenue: "$1,301.12", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.0%", enp: "$1,100.00" },
  { school: "BLUEFIELD ELEMENTRY SCHOOL_child care", ecoDis: "30%", meals: 2342, meqs: 2875, breakfast: "33%", lunch: "30%", snack: "159%", supper: "52%", revenue: "$14,371.97", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.8%", enp: "$12,400.00" },
  { school: "BLUEFIELD HIGH SCHOOL_tier II mixed", ecoDis: "33%", meals: 423, meqs: 865, breakfast: "267%", lunch: "233%", snack: "400%", supper: "83%", revenue: "$3,912.30", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.5%", enp: "$3,200.00" },
  { school: "BLUEFILED MIDDLE SCHOOL", ecoDis: "50%", meals: 208, meqs: 235, breakfast: "70%", lunch: "90%", snack: "100%", supper: "120%", revenue: "$1,255.29", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "10.2%", enp: "$950.00" },
  { school: "Cabadbaran High School", ecoDis: "14%", meals: 1305, meqs: 1056, breakfast: "101%", lunch: "101%", snack: "101%", supper: "101%", revenue: "$7,059.66", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.4%", enp: "$6,100.00" },
  { school: "CENTRAL OFFICE", ecoDis: "67%", meals: 0, meqs: 2, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$595.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$500.00" },
  // PAGE 2
  { school: "Chacao Elementary School", ecoDis: "0%", meals: 931, meqs: 896, breakfast: "77%", lunch: "114%", snack: "102%", supper: "102%", revenue: "$6,122.07", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.1%", enp: "$5,400.00" },
  { school: "Cheria Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Chios Elementary School_tier II high", ecoDis: "0%", meals: 2, meqs: 2, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$16.21", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.1%", enp: "$10.00" },
  { school: "Corfu Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Cotoca Middle School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Dammam Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Gaur Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Hoensbroek High School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "King of Prussia Middle School", ecoDis: "0%", meals: 3105, meqs: 2543, breakfast: "102%", lunch: "103%", snack: "153%", supper: "153%", revenue: "$17,111.69", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "13.2%", enp: "$14,200.00" },
  { school: "Kula Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" }
];

const SortIcon = ({ column, config }: { column: string, config: any }) => {
  if (config?.key !== column) return <div className="w-4 h-4 opacity-0" />;
  return config.direction === 'asc' 
    ? <ChevronUp className="w-4 h-4 text-blue-600" /> 
    : <ChevronDown className="w-4 h-4 text-blue-600" />;
};

export const SchoolPerformanceGrid: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'All'>(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof SchoolPerformanceData; direction: 'asc' | 'desc' } | null>({
    key: 'school',
    direction: 'asc',
  });

  const filteredData = useMemo(() => {
    return PERFORMANCE_DATA.filter(item => 
      item.school.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const itemsPerPage = rowsPerPage === 'All' ? sortedData.length : rowsPerPage;
  const totalPages = Math.ceil(sortedData.length / (itemsPerPage || 1));
  const startIndex = (currentPage - 1) * (itemsPerPage as number);
  const currentRows = sortedData.slice(startIndex, startIndex + (itemsPerPage as number));

  const handleSort = (key: keyof SchoolPerformanceData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const TableHeader = ({ label, sortKey, align = "center" }: { label: string, sortKey?: keyof SchoolPerformanceData, align?: "left" | "center" | "right" }) => (
    <th 
      onClick={() => sortKey && handleSort(sortKey)} 
      className={`px-3 py-3 text-${align} text-[10px] font-semibold text-gray-500 uppercase tracking-wider ${sortKey ? 'cursor-pointer hover:bg-gray-100' : ''}`}
    >
      <div className={`flex items-center ${align === 'center' ? 'justify-center' : ''} gap-1`}>
        <span>{label}</span>
        {sortKey && <SortIcon column={sortKey} config={sortConfig} />}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      <div className="p-4 border-b border-gray-100 flex justify-between items-end bg-white">
        <div className="flex items-baseline gap-3">
            <h3 className="text-lg font-bold text-gray-800">School Performance</h3>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider"> - Showing results for: Current Month </span>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search school..."
            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader label="School" sortKey="school" align="left" />
              <TableHeader label="Eco Dis" sortKey="ecoDis" />
              <TableHeader label="Meals" sortKey="meals" />
              <TableHeader label="Meqs" sortKey="meqs" />
              <TableHeader label="Breakfast" sortKey="breakfast" />
              <TableHeader label="Lunch" sortKey="lunch" />
              <TableHeader label="Snack" sortKey="snack" />
              <TableHeader label="Supper" sortKey="supper" />
              <TableHeader label="Revenue" sortKey="revenue" />
              <TableHeader label="Waste" sortKey="waste" />
              <TableHeader label="Inventory Value" sortKey="inventoryValue" />
              <TableHeader label="Inventory Turnover" sortKey="inventoryTurnover" />
              <TableHeader label="Phys Inventory Discrepancy" sortKey="physicalInventoryDiscrepancy" />
              <TableHeader label="MPLH" sortKey="mplh" />
              <TableHeader label="PNA" sortKey="pna" />
              <TableHeader label="ENP" sortKey="enp" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-4 text-xs font-semibold text-gray-900 whitespace-nowrap">{row.school}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.ecoDis}</td>
                <td className={`px-3 py-4 text-xs text-center font-medium ${row.meals > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{row.meals.toLocaleString()}</td>
                <td className={`px-3 py-4 text-xs text-center font-medium ${row.meqs > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{row.meqs.toLocaleString()}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.breakfast}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.lunch}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.snack}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.supper}</td>
                <td className="px-3 py-4 text-xs text-center text-red-500 font-medium">{row.revenue}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.waste}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500">{row.inventoryValue}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500">{row.inventoryTurnover}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500">{row.physicalInventoryDiscrepancy}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500 font-medium">{row.mplh}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.pna}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500 font-medium">{row.enp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Showing {startIndex + 1}-{Math.min(startIndex + (itemsPerPage as number), sortedData.length)} of {sortedData.length}</span>
          <select 
            className="border border-gray-200 rounded px-1 py-0.5 bg-white" 
            value={rowsPerPage} 
            onChange={(e) => {
              setRowsPerPage(e.target.value === 'All' ? 'All' : parseInt(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value="All">All</option>
          </select>
        </div>
        
        {rowsPerPage !== 'All' && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="p-1 border border-gray-200 rounded disabled:opacity-30 hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600"/>
            </button>
            <span className="text-xs text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="p-1 border border-gray-200 rounded disabled:opacity-30 hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4 text-gray-600"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};