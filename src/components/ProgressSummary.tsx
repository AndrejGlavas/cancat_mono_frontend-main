import React from 'react';
import { PiCaretLeftFill, PiCaretRightFill } from 'react-icons/pi';

interface ProgressSummaryProps {
  stats: {
    income: number;
    businessDeductions: number;
    personalDeductions: number;
    splitDeductions: number;
  };
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ stats }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-indigo-700">Progress Summary</h2>
      <div className="space-y-4">
        <div className="bg-sky-50 p-4 rounded shadow">
          <div className="text-gray-600 flex flex-cols">
            <div className="w-12 h-12 mx-2 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif">I</div>
              <div> 
                  <div className="text-3xl mx-4 text-slate-700 font-bold align-left">
                      ${stats.income.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm mx-4 font-semibold text-sky-600">
                    Income
                  </div>
              </div> 
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded shadow">
          <div className="text-gray-600 flex flex-cols">
            <div className="w-12 h-12 mx-2 rounded-full border-4 border-blue-800 text-blue-800 flex items-center justify-center font-bold bg-white font-serif">B</div>
              <div> 
                  <div className="text-3xl mx-4 text-slate-700 font-bold align-left">
                  ${stats.businessDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm mx-4 font-semibold text-blue-800 ">
                  Business Deductions
                  </div>
              </div> 
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded shadow">
          <div className="text-gray-600 flex flex-cols">
            <div className="w-12 h-12 mx-2 rounded-full border-4 border-green-700 text-green-700 text-blue-800 flex items-center justify-center font-bold bg-white font-serif">P</div>
              <div> 
                  <div className="text-3xl mx-4 text-slate-700 font-bold align-left">
                  ${stats.personalDeductions.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm mx-4 font-semibold text-green-700 ">
                  Personal Deductions
                  </div>
              </div> 
          </div>
        </div>

        <div className="bg-zinc-50 p-4 rounded shadow">
          <div className="text-gray-600 flex flex-cols">
            <div className="mx-2">
            <div className="w-12 h-12 rounded-full border-blue-700 border-2 bg-lime-300  text-blue-800 flex items-center justify-center font-bold relative">
            <div className="flex w-10 h-10 text-md font-semibold border-2 border-blue-800 font-serif rounded-full items-center justify-center bg-white font-semibold">
                <PiCaretLeftFill size={12} className="text-green-700" />
                  <span className="mx-0.5 text-gray-600">S</span>
                  <PiCaretRightFill size={12} className="text-blue-800" />
                </div>
              </div>
            </div>
              <div> 
                  <div className="text-3xl mx-4 text-slate-700 font-bold align-left">
                  ${(stats.splitDeductions || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                  </div>
                  <div className="text-sm mx-4 font-semibold text-sky-900 ">
                  Split Deductions
                  </div>
              </div> 
          </div>
        </div>


      </div>
    </div>
  );
};

export default ProgressSummary;