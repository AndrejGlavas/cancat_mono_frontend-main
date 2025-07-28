import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import IncomeToggle from './IncomeToggle';
import ExpenseToggle from './ExpenseToggle';
import TagToggle from './TagToggle';
import SplitToggle from './SplitToggle';
import ControlsToggle from './ControlsToggle';
import ReportHelper from './ReportHelper';


interface Section {
    id: string;
    title: string;
    component?: React.ReactNode;
    components?: React.ReactNode[];
  }

const TutorialSlider = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const sections: Section[] = [
    {
      id: 'income',
      title: 'Income',
      component: <IncomeToggle />
    },
    {
        id: 'expenses',
        title: 'Expenses',
        component: undefined,
        components: [<ExpenseToggle />, <TagToggle />, <SplitToggle />]
      },
    {
      id: 'controls',
      title: 'Flag/Lock/Hide',
      component: <ControlsToggle />
    },
    {
      id: 'reports',
      title: 'Reports',
      component: <ReportHelper />
    }
  ];

  const handlePrev = () => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setActiveIndex(prev => (prev < sections.length - 1 ? prev + 1 : prev));
  };

  const handleTabClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md p-8 w-full max-w-4xl mx-auto">


      {/* Navigation Tabs */}
      <div className="flex justify-between mb-8 border-b">
        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => handleTabClick(index)}
            className={`px-4 py-2 font-medium ${
              activeIndex === index
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {section.title}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative flex-1 min-h-[500px]">
        <div className="absolute inset-0">
          {sections[activeIndex].components ? (
            <div className="space-y-4">
              {sections[activeIndex].components}
            </div>
          ) : (
            sections[activeIndex].component
          )}
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="flex justify-between items-center mt-8">
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={`p-2 rounded-full ${
            activeIndex === 0
              ? 'text-gray-300 cursor-not-allowed bg-gray-50 rounded'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Progress Indicator */}
        <div className="flex gap-2">
          {sections.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                activeIndex === index ? 'bg-indigo-400' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          disabled={activeIndex === sections.length - 1}
          className={`p-2 rounded-full ${
            activeIndex === sections.length - 1
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <ChevronRight className="w-6 h-6 bg-indigo-50 rounded" />
        </button>
      </div>
    </div>
  );
};

export default TutorialSlider;