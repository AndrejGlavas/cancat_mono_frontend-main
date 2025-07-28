import { useState } from 'react';
import { Split } from 'lucide-react';

interface ReportType {
  title: string;
  description: string;
  details: string;
  icon: JSX.Element;
  buttonClass: string;
}

const ReportHelper = () => {
  const [activeReport, setActiveReport] = useState<keyof typeof reports | null>(null);

  const reports: Record<string, ReportType> = {
    income: {
      title: "Income Report",
      description: "Go through your deposits to find (I) income",
      details: "You get lots of deposits (refunds, venmos from friends, etc. Find the ones that are payments for professional services.",
      icon: <div className="w-8 h-8 rounded-full border-4 border-sky-600 text-sky-600 flex items-center justify-center font-bold bg-white font-serif">I</div>,
      buttonClass: "bg-sky-50 text-sky-700 border-sky-200"
    },
    business: {
      title: "Business Deduction Report",
      description: "Every expense paid to run your (B) business",
      details: "Essential for tax deductions - captures all expenses marked as (B) business, tagged by deduction.",
      icon: <div className="w-8 h-8 rounded-full border-4 border-blue-900 text-blue-900 flex items-center justify-center font-bold bg-white">B</div>,
      buttonClass: "bg-blue-50 text-blue-700 border-blue-200"
    },
    personal: {
        title: "Personal Deduction Report",
        description: "Only personal expenses which qualify as personal tax-deductions.",
        details: "Tracks expenses marked as personal (P) that may qualify for personal tax deductions.",
        icon: <div className="w-8 h-8 rounded-full border-4 border-green-900 text-green-900 flex items-center justify-center font-bold bg-white">P</div>,
        buttonClass: "bg-green-50 text-green-700 border-green-200"
      },
    split: {
      title: "Split Deduction Report",
      description: "Expenses shared between business and personal use",
      details: "Tracks all (B) and (P) (does not matter) that should be split between business and personal use, with a 10% default placeholder for calculating.",
      icon: <Split className="w-5 h-5" />,
      buttonClass: "bg-orange-50 text-orange-700 border-orange-200"
    }
  };

  const handleReportClick = (reportName: keyof typeof reports) => {
    setActiveReport(activeReport === reportName ? null : reportName);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 mb-4">
      When you have done as much as you can, download your 4 Export Reports to send to your accountant. <br />
      </div>
      <div className="space-y-3">
        {Object.entries(reports).map(([key, report]) => (
          <div key={key} className="flex gap-4">
            <button
              onClick={() => handleReportClick(key as keyof typeof reports)}
              className={`flex items-center gap-2 p-3 rounded-lg border ${report.buttonClass} min-w-[250px]`}
            >
              {report.icon}
              {report.title}
            </button>
            {activeReport === key && (
              <div className="flex-1 p-4 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-700 mb-2">{report.description}</div>
                <div className="text-sm text-gray-600">{report.details}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportHelper;