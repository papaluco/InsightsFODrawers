import React from 'react';
import { SchoolMPLHData } from '../../data/mockMPLHData';

interface SingleSchoolMPLHSummaryProps {
  schoolData: SchoolMPLHData;
}

export const SingleSchoolMPLHSummary: React.FC<SingleSchoolMPLHSummaryProps> = ({ schoolData }) => {
  const { laborHours, mplh, breakfast, lunch, snack, aLaCarte, other } = schoolData;

  const targetMPLH = 14.50;
  const difference = Math.abs(mplh - targetMPLH);
  const isHigher = mplh >= targetMPLH;

  // Calculation logic moved here to keep the drawer clean
  const afterSchoolSnacksMEQ = Math.round(snack * 0.33);
  const studentBreakfastsMEQ = Math.round(breakfast * 0.67);
  const studentLunchesMEQ = Math.round(lunch * 1.0);
  const adultBreakfastsMEQ = Math.round(other.adultBreakfast * 0.67);
  const adultLunchesMEQ = Math.round(other.adultLunch * 1.0);
  const adultSnacksMEQ = Math.round(other.adultSnack * 0.67);
  const nonProgramSalesMEQ = Math.round(aLaCarte / 4.93);

  const totalMEQ = afterSchoolSnacksMEQ + studentBreakfastsMEQ + studentLunchesMEQ +
                   adultBreakfastsMEQ + adultLunchesMEQ + adultSnacksMEQ + nonProgramSalesMEQ;

  return (
    <div className="space-y-8">
      {/* Overview Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">MPLH Overview</h3>
        
        <div className="flex items-center justify-center gap-3">
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1">
            <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Total MEQs</div>
            <div className="text-xl font-bold text-gray-900">{totalMEQ.toLocaleString()}</div>
          </div>
          
          <div className="text-sm font-bold text-gray-300">÷</div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1">
            <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Labor Hours</div>
            <div className="text-xl font-bold text-gray-900">{laborHours.toFixed(2)}</div>
          </div>
          
          <div className="text-sm font-bold text-gray-300">=</div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center flex-1 relative">
            <div className="text-[11px] uppercase font-semibold text-gray-400 mb-0.5">Resulting MPLH</div>
            <div className={`text-xl font-bold ${mplh >= targetMPLH ? 'text-emerald-600' : 'text-red-600'}`}>
              {mplh.toFixed(2)}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-4 px-1">
          This school produced {mplh.toFixed(2)} meals for every hour worked, which is{' '}
          <span className={isHigher ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
            {difference.toFixed(2)} {isHigher ? 'higher' : 'lower'}
          </span>{' '}
          than the Benchmark of {targetMPLH.toFixed(2)}.
        </p>
      </div>

      {/* MEQ Table */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meal Equivalents (MEQ)</h3>
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meal Categories</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">X</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Factors</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">=</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">MEQ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-sm text-gray-900">{snack.toLocaleString()} Snacks</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">x</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-900">0.33</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">=</td>
                <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">{afterSchoolSnacksMEQ.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-sm text-gray-900">{breakfast.toLocaleString()} Student Breakfasts</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">x</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-900">0.67</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">=</td>
                <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">{studentBreakfastsMEQ.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-sm text-gray-900">{lunch.toLocaleString()} Student Lunches</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">x</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-900">1.00</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">=</td>
                <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">{studentLunchesMEQ.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-sm text-gray-900">{other.adultBreakfast.toLocaleString()} Adult Breakfasts</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">x</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-900">0.67</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">=</td>
                <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">{adultBreakfastsMEQ.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-sm text-gray-900">{other.adultLunch.toLocaleString()} Adult Lunches</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">x</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-900">1.00</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">=</td>
                <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">{adultLunchesMEQ.toLocaleString()}</td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="px-4 py-2.5 text-sm text-gray-900">${aLaCarte.toLocaleString()} A La Carte Sales</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">÷</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-900">4.93*</td>
                <td className="px-4 py-2.5 text-center text-sm text-gray-400">=</td>
                <td className="px-4 py-2.5 text-right text-sm font-medium text-gray-900">{nonProgramSalesMEQ.toLocaleString()}</td>
              </tr>
              <tr className="bg-gray-50 font-semibold border-t-2 border-gray-100">
                <td className="px-4 py-3 text-sm font-bold text-gray-900">Total Meal Equivalents</td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3"></td>
                <td className="px-4 py-3 text-center text-sm text-gray-400">=</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{totalMEQ.toLocaleString()} MEQ</td>
              </tr>
            </tbody>
          </table>
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs text-gray-500 italic text-left">
              * Current free lunch reimbursement rate + Current USDA Foods value
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};