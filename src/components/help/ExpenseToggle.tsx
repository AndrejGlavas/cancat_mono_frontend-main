import { useState } from 'react';
import { ArrowRight } from 'lucide-react';

const ExpenseToggle = () => {
  const [isBusiness, setIsBusiness] = useState(false);

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
        <div className="w-64 flex items-center gap-2 whitespace-nowrap">
            Click P<ArrowRight className="h-4 w-4" />
          </div>
          <div 
            onClick={() => setIsBusiness(!isBusiness)}
            className={`w-12 h-12  p-5 rounded-full flex items-center justify-center text-2xl font-bold bg-white cursor-pointer hover:bg-sky-50 ${
              isBusiness 
                ? 'border-4 border-blue-700 text-blue-700  font-serif' 
                : 'border-4 border-green-700 text-green-700  font-serif'
            }`}
          >
            {isBusiness ? 'B' : 'P'}
          </div>
          <div className="text-gray-600 whitespace-nowrap border rounded-md border-gray-300 p-2">
            1/1/24
            <span className="px-4">Uber to Client Meeting</span>
            <span className="px-4">$49.95</span>
          </div>
        </div>
        {isBusiness && (
          <div className="text-blue-700 pl-4 ml-20">
          ...to change the category from personal to business so that you can assign it a deduction tag.
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseToggle;