import { Split, EyeOff, Flag, Lock, Pencil, History } from 'lucide-react';
import { PiTag } from "react-icons/pi";

interface GuideItem {
  icon: React.ReactNode;
  label: string;
}

const QuickGuide = () => {
  const guideItems: GuideItem[] = [
    {
      icon: (
        <div className="flex -space-x-1">
          <div className="w-7 h-7 rounded-full border-4 border-blue-700 text-blue-700 flex items-center justify-center font-bold bg-white text-sm">B</div>
          <div className="w-7 h-7 rounded-full border-4 border-green-700 text-green-700 flex items-center justify-center font-bold bg-white text-sm">P</div>
        </div>
      ),
      label: "Business or Personal"
    },
    {
      icon: (
        <div className="flex -space-x-1">
          <div className="w-7 h-7 rounded-full border-2 border-sky-300 text-sky-300 flex items-center justify-center font-bold bg-white text-sm">D</div>
          <div className="w-7 h-7 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif text-sm">I</div>
        </div>
      ),
      label: "Deposit or Income"
    },
    {
      icon: <Split className="text-indigo-700 w-6 h-6" />,
      label: "Split Transaction"
    },
    {
      icon: <PiTag className="text-indigo-700 w-6 h-6  rounded-lg" />,
      label: "Tag Personal or Business Deduction"
    },
    {
      icon: <EyeOff className="text-orange-300 border-orange-300 bg-orange-50 p-1 w-6 h-6 border rounded-lg" />,
      label: "Hide Transaction"
    },
    {
      icon: <Flag className="text-red-400 border-red-300 bg-red-50 p-1 w-6 h-6 border rounded-lg" />,
      label: "Flag for Review"
    },
    {
      icon: <Lock className="text-yellow-700 border-yellow-700 bg-yellow-50 p-1 w-6 h-6 border rounded-lg" />,
      label: "Lock Transaction"
    },
    {
      icon: <Pencil className="text-zinc-500 border-zinc-500 bg-zinc-50 p-1 w-6 h-6 border rounded-lg" />,
      label: "Edit Label"
    },
    {
      icon: <History className="text-zinc-700 border-zinc-700 bg-indigo-50 p-1 w-6 h-6 border rounded-lg" />,
      label: "View Edit History"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="font-bold mb-6">Symbol Reference</h2>
      <div className="grid gap-3">
        {guideItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-2">
            {item.icon}
            <span className="text-sm text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickGuide;