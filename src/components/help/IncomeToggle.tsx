import { useState } from 'react';
import { LuArrowRight } from "react-icons/lu";

const IncomeToggle = () => {
  const [isIncome, setIsIncome] = useState(true);


  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex flex-col gap-4">
        <div>By default, all deposits are categorized (D). Using the Income tab in the navigation, sort to find which deposits are your income, and click (D) to change it to (I). </div>
        <div className="flex items-center gap-2">
        <div className="w-80 flex items-center gap-2">
           Click this <LuArrowRight className="h-4 w-4" />
          </div>
          <div 
            onClick={() => setIsIncome(!isIncome)}
            className={`w-12 h-12 m-4 p-5 rounded-full flex items-center justify-center text-2xl font-bold bg-white cursor-pointer hover:bg-sky-50 ${
              isIncome 
                ? 'border-4 border-sky-300 text-sky-300 font-serif' 
                : 'border-4 border-sky-600 text-sky-600 font-serif '
            }`}
          >
            {isIncome ? 'D' : 'I'}
          </div>
          <div className="text-gray-600 whitespace-nowrap border rounded-md border-gray-300 p-2">
            1/1/24
            <span className="px-4">Work Payment For You</span>
            <span className="px-4">$20,000</span>
          </div>
        </div>
        {!isIncome && (
          <div className="text-sky-600 pl-4">
            ...now this deposit is categorized as income. 
          </div>
        )}
      </div>
      
    </div>
    
  );
};
export default IncomeToggle;