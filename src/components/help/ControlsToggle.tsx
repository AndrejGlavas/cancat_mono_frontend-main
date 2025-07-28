import { useState } from 'react';
import { ArrowRight, EyeOff, Flag, Lock, History } from 'lucide-react';

interface ControlType {
  icon: JSX.Element;
  title: string;
  description: string;
  example: string;
  activeClasses: string;
}

const ControlsToggle = () => {
  const [activeControl, setActiveControl] = useState<keyof typeof controls | null>(null);

  const controls: Record<string, ControlType> = {
    hide: {
      icon: <EyeOff />,
      title: "Hide Transactions",
      description: "When you want to remove (but not delete) redundant transactions like credit card payments to avoid double counting. **Hidden transactions are excluded from reports.",
      example: "Hide credit card payments 'CITI CARD Payment Transfer ID:1234 PPD.' because their value will be accounted for.",
      activeClasses: "text-orange-300 border-orange-300 bg-orange-50",
    },
    flag: {
      icon: <Flag  />,
      title: "Flag for Review",
      description: "Not sure what to do with specific expenses? Flag them to include a Flag in the reports. That's how your accountant knows, you're guessing.",
      example: "Flag personal car expenses used for work for accountant review. It might be business, maybe not?",
      activeClasses: "text-red-400 border-red-300 bg-red-50",
    },
    lock: {
      icon: <Lock />,
      title: "Lock",
      description: "Make it complete so that you don't accidentally update it using a bulk or automation tool later.",
      example: "Lock 'Amazon' expenses correctly categorized 'Business' for new cell phone charger, as 'Office Expense.'' Do not confuse with other Amazon expenses.",
      activeClasses: "text-yellow-700 border-yellow-700 bg-yellow-50",
    },
    history: {
      icon: <History />,
      title: "Transaction History",
      description: "View every single edit to your transaction.",
      example: "Your Google expense switched back from Business to Personal by mistake. Did you do it or the program? Find out so you (or we) can fix it.",
      activeClasses: "text-zinc-700 border-zinc-700 bg-indigo-50",
    }
  };

  const handleControlClick = (controlName: keyof typeof controls) => {
    setActiveControl(activeControl === controlName ? null : controlName);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow mb-4">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-64 flex items-center gap-2 whitespace-nowrap justify-end">
            Click to learn about these controls <ArrowRight />
          </div>
          <div className="flex gap-2">
            {Object.entries(controls).map(([key, control]) => (
              <div
                key={key}
                onClick={() => handleControlClick(key)}
                className={`cursor-pointer p-1 w-8 h-8 border-2 rounded-lg ${
                  activeControl === key 
                    ? control.activeClasses
                    : "text-gray-300 border-gray-300 bg-gray-50"
                }`}
              >
                {control.icon}
              </div>
            ))}
          </div>
        </div>

        {activeControl && (
          <div className="text-sm bg-gray-50 rounded-lg p-8 rounded-md ">
            <div className="font-medium">{controls[activeControl].title}</div>
            <div className="text-gray-600 mt-1">{controls[activeControl].description}</div>
            <div className="text-gray-600 mt-2">
              <span className="italic">Example: </span>
              {controls[activeControl].example}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlsToggle;