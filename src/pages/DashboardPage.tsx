import React from "react";
import { Link } from 'react-router-dom';
import ContributionGrid from "../components/ContributionGrid";
import ProgressSummary from "../components/ProgressSummary";
import WhatsNext from "../components/WhatsNext";
import { Upload, Star } from "lucide-react";
import { useTaxStats } from "../hooks/useTaxStats";

const DashboardPage: React.FC = () => {
  const { 
    income, 
    businessDeductions, 
    personalDeductions, 
    splitDeductions, 
    totalTransactions,
    taxYear,
    isLoading, 
    transactions 
  } = useTaxStats();

  return (
    <div className="w-full bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* First Column: Transaction Count & Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">      
            <div className="flex flex-col mb-1">
              <h2 className="text-2xl font-bold mb-4 text-indigo-700">
                {isLoading ? "Loading..." : `${taxYear} Tax Prep`}
              </h2>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span>Welcome Beta Testers! Our dashboard is a work-in-progress as we learn what what we should display here. In the meantime, please start with onboarding and learning how CanCat works.</span>
                  </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg my-4">
                <Link to="/onboarding" className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <Star className="text-[#fc2544]"/>
                    </div>
                    <span className="text-indigo-700 group-hover:text-indigo-900">New? Start with onboarding</span>
                  </div>
                </Link>
              </div>

            <div className="space-y-2 flex md:grid-cols-3 flex-col">
       
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Link to="/upload" className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <Upload className="text-green-500" /> 
                    </div>
                    <span className="text-indigo-700 group-hover:text-indigo-900">Upload your transactions</span>
                  </div>
                </Link>
              </div>
              <div className="font-bold text-gray-500 text-5xl mx-6 items-center justifty-center">
                {isLoading ? "..." : totalTransactions.toLocaleString()} 
              </div>
              <div className="text-lg m-6">transactions loaded</div>

              {/* <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Link to="/income" className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif">I</div>
                    </div>
                    <span className="text-indigo-700 group-hover:text-indigo-900">Categorize Your Income</span>
                  </div>
                </Link>
              </div> */}
{/* 
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Link to="/expenses" className="flex items-center justify-between w-full group">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full border-4 border-blue-700 text-blue-700 flex items-center justify-center font-bold bg-white z-10">B</div>
                      <div className="w-8 h-8 rounded-full border-4 border-green-700 text-green-700 flex items-center justify-center font-bold bg-white">P</div>
                    </div>
                    <span className="text-indigo-700 group-hover:text-indigo-900">Categorize Your Business and Personal Expenses</span>
                  </div>
                </Link>
              </div> */}


            </div>
          </div>

          {/* Second Column: Tax Summary */}
          <div>
            <ProgressSummary stats={{
              income,
              businessDeductions,
              personalDeductions,
              splitDeductions
            }} />
          </div>
          
          <div>              
          <WhatsNext transactions={transactions} />
          </div>
        </div>

        {/* Bottom Row: Contribution Grid */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {!isLoading && taxYear ? (
            <ContributionGrid />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              Loading activity data...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;