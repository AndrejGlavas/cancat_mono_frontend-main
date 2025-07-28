import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { PiCaretLeftFill, PiCaretRightFill } from 'react-icons/pi';


const SplitToggle = () => {
  const [isSplit, setIsSplit] = useState(false);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <div className="w-30 m-2 flex items-center gap-2 whitespace-nowrap">
           Or, click S<ArrowRight className="h-4 w-4" />
          </div>
          <div 
            onClick={() => setIsSplit(!isSplit)}
            className={`w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer ${
              isSplit ? 'bg-white-100' : 'bg-white-100'
            }`}
          >
                 <div className="w-12 h-12 rounded-full border-blue-700 border-2 bg-lime-200  text-blue-800 flex items-center justify-center font-bold relative">
                    <div className="flex w-10 h-10 text-md font-semibold border-2 border-blue-800 font-serif rounded-full items-center justify-center bg-white font-semibold">
                    <PiCaretLeftFill size={12} className="text-green-700" />
                    <span className="mx-0.5 text-gray-600">S</span>
                    <PiCaretRightFill size={12} className="text-blue-800" />
                    </div>
                </div>
          </div>
          <div className="text-gray-600 whitespace-nowrap ml-4 border rounded-md border-gray-300 p-2">
            1/1/24
            <span className="px-4">Cell Phone Bill</span>
            <span className="px-4">$70</span>
          </div>
        </div>
        {isSplit && (
          <div className="text-indigo-700 pl-4 ml-20">
           ...if the expense is part business, part personal, to split it.
          </div>
        )}
      </div>
    </div>
  );
};

export default SplitToggle;